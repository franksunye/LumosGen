import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface DeploymentConfig {
    repositoryUrl?: string;
    customDomain?: string;
    branch?: string;
    buildPath?: string;
}

export interface DeploymentResult {
    success: boolean;
    deploymentUrl?: string;
    error?: string;
    logs: string[];
}

export interface DeploymentStatus {
    status: 'idle' | 'preparing' | 'building' | 'deploying' | 'completed' | 'failed';
    message: string;
    progress: number;
    timestamp: Date;
}

export class GitHubPagesDeployer {
    private outputChannel: vscode.OutputChannel;
    private statusCallbacks: ((status: DeploymentStatus) => void)[] = [];

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
    }

    public onStatusChange(callback: (status: DeploymentStatus) => void): void {
        this.statusCallbacks.push(callback);
    }

    private updateStatus(status: Partial<DeploymentStatus>): void {
        const fullStatus: DeploymentStatus = {
            status: 'idle',
            message: '',
            progress: 0,
            timestamp: new Date(),
            ...status
        };

        this.outputChannel.appendLine(`[${fullStatus.timestamp.toISOString()}] ${fullStatus.message}`);
        this.statusCallbacks.forEach(callback => callback(fullStatus));
    }

    public async deploy(websitePath: string, config: DeploymentConfig = {}): Promise<DeploymentResult> {
        const result: DeploymentResult = {
            success: false,
            logs: []
        };

        try {
            this.updateStatus({
                status: 'preparing',
                message: 'Preparing deployment...',
                progress: 10
            });

            // Validate inputs
            await this.validateDeployment(websitePath);
            result.logs.push('Validation completed');

            this.updateStatus({
                status: 'preparing',
                message: 'Checking Git repository...',
                progress: 20
            });

            // Check Git repository
            const repoInfo = await this.checkGitRepository();
            result.logs.push(`Repository: ${repoInfo.origin}`);

            this.updateStatus({
                status: 'building',
                message: 'Preparing website files...',
                progress: 40
            });

            // Prepare deployment files
            await this.prepareDeploymentFiles(websitePath, config);
            result.logs.push('Website files prepared');

            this.updateStatus({
                status: 'deploying',
                message: 'Creating gh-pages branch...',
                progress: 60
            });

            // Create and switch to gh-pages branch
            await this.setupGhPagesBranch();
            result.logs.push('gh-pages branch ready');

            this.updateStatus({
                status: 'deploying',
                message: 'Pushing to GitHub...',
                progress: 80
            });

            // Deploy to GitHub Pages
            await this.pushToGitHub(websitePath);
            result.logs.push('Pushed to GitHub Pages');

            // Generate deployment URL
            const deploymentUrl = this.generateDeploymentUrl(repoInfo.origin, config.customDomain);
            result.deploymentUrl = deploymentUrl;
            result.logs.push(`Deployment URL: ${deploymentUrl}`);

            this.updateStatus({
                status: 'completed',
                message: `Deployment completed! Available at: ${deploymentUrl}`,
                progress: 100
            });

            result.success = true;
            return result;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            result.error = errorMessage;
            result.logs.push(`Error: ${errorMessage}`);

            this.updateStatus({
                status: 'failed',
                message: `Deployment failed: ${errorMessage}`,
                progress: 0
            });

            return result;
        }
    }

    private async validateDeployment(websitePath: string): Promise<void> {
        // Check if website path exists
        if (!fs.existsSync(websitePath)) {
            throw new Error(`Website path does not exist: ${websitePath}`);
        }

        // Check if index.html exists
        const indexPath = path.join(websitePath, 'index.html');
        if (!fs.existsSync(indexPath)) {
            throw new Error('No index.html found in website directory');
        }

        // Check if we're in a Git repository
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceRoot) {
            throw new Error('No workspace folder found');
        }

        const gitPath = path.join(workspaceRoot, '.git');
        if (!fs.existsSync(gitPath)) {
            throw new Error('Not a Git repository. Please initialize Git first.');
        }
    }

    private async checkGitRepository(): Promise<{ origin: string; branch: string }> {
        try {
            const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!workspaceRoot) {
                throw new Error('No workspace folder found');
            }

            // Get remote origin URL
            const { stdout: originOutput } = await execAsync('git remote get-url origin', {
                cwd: workspaceRoot
            });
            const origin = originOutput.trim();

            // Get current branch
            const { stdout: branchOutput } = await execAsync('git branch --show-current', {
                cwd: workspaceRoot
            });
            const branch = branchOutput.trim();

            return { origin, branch };
        } catch (error) {
            throw new Error(`Failed to get Git repository info: ${error}`);
        }
    }

    private async prepareDeploymentFiles(websitePath: string, config: DeploymentConfig): Promise<void> {
        // Add CNAME file for custom domain
        if (config.customDomain) {
            const cnamePath = path.join(websitePath, 'CNAME');
            await fs.promises.writeFile(cnamePath, config.customDomain, 'utf8');
        }

        // Add .nojekyll file to prevent Jekyll processing
        const nojekyllPath = path.join(websitePath, '.nojekyll');
        await fs.promises.writeFile(nojekyllPath, '', 'utf8');

        // Add 404.html if it doesn't exist
        const notFoundPath = path.join(websitePath, '404.html');
        if (!fs.existsSync(notFoundPath)) {
            const notFoundContent = this.generate404Page();
            await fs.promises.writeFile(notFoundPath, notFoundContent, 'utf8');
        }
    }

    private async setupGhPagesBranch(): Promise<void> {
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceRoot) {
            throw new Error('No workspace folder found');
        }

        try {
            // Check if gh-pages branch exists
            try {
                await execAsync('git show-ref --verify --quiet refs/heads/gh-pages', {
                    cwd: workspaceRoot
                });
                // Branch exists, switch to it
                await execAsync('git checkout gh-pages', { cwd: workspaceRoot });
            } catch {
                // Branch doesn't exist, create it
                await execAsync('git checkout --orphan gh-pages', { cwd: workspaceRoot });
                await execAsync('git rm -rf .', { cwd: workspaceRoot });
            }
        } catch (error) {
            throw new Error(`Failed to setup gh-pages branch: ${error}`);
        }
    }

    private async pushToGitHub(websitePath: string): Promise<void> {
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceRoot) {
            throw new Error('No workspace folder found');
        }

        try {
            // Copy website files to repository root
            await this.copyWebsiteFiles(websitePath, workspaceRoot);

            // Add all files
            await execAsync('git add .', { cwd: workspaceRoot });

            // Commit changes
            const commitMessage = `Deploy website - ${new Date().toISOString()}`;
            await execAsync(`git commit -m "${commitMessage}"`, { cwd: workspaceRoot });

            // Push to GitHub
            await execAsync('git push origin gh-pages', { cwd: workspaceRoot });

        } catch (error) {
            throw new Error(`Failed to push to GitHub: ${error}`);
        }
    }

    private async copyWebsiteFiles(sourcePath: string, targetPath: string): Promise<void> {
        const files = await fs.promises.readdir(sourcePath);
        
        for (const file of files) {
            const sourceFile = path.join(sourcePath, file);
            const targetFile = path.join(targetPath, file);
            
            const stat = await fs.promises.stat(sourceFile);
            if (stat.isDirectory()) {
                await fs.promises.mkdir(targetFile, { recursive: true });
                await this.copyWebsiteFiles(sourceFile, targetFile);
            } else {
                await fs.promises.copyFile(sourceFile, targetFile);
            }
        }
    }

    private generateDeploymentUrl(origin: string, customDomain?: string): string {
        if (customDomain) {
            return `https://${customDomain}`;
        }

        // Extract username and repo from GitHub URL
        const match = origin.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
        if (match) {
            const [, username, repo] = match;
            return `https://${username}.github.io/${repo}`;
        }

        return 'https://your-username.github.io/your-repo';
    }

    private generate404Page(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Not Found</title>
    <style>
        body { font-family: system-ui, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #333; }
        p { color: #666; }
        a { color: #3b82f6; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <a href="/">← Back to Home</a>
</body>
</html>`;
    }
}
