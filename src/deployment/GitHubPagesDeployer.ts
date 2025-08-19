import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface RetryConfig {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
}

export interface DeploymentMetrics {
    startTime: Date;
    endTime?: Date;
    duration?: number;
    retryCount: number;
    success: boolean;
    errorType?: string;
}

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
    private retryConfig: RetryConfig;
    private deploymentMetrics: DeploymentMetrics | null = null;

    constructor(outputChannel: vscode.OutputChannel, retryConfig?: RetryConfig) {
        this.outputChannel = outputChannel;
        this.retryConfig = retryConfig || {
            maxRetries: 3,
            baseDelay: 1000,
            maxDelay: 10000,
            backoffMultiplier: 2
        };
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
        // Initialize metrics
        this.deploymentMetrics = {
            startTime: new Date(),
            retryCount: 0,
            success: false
        };

        const result: DeploymentResult = {
            success: false,
            logs: []
        };

        try {
            result.logs.push(`Starting deployment at ${this.deploymentMetrics.startTime.toISOString()}`);

            this.updateStatus({
                status: 'preparing',
                message: 'Preparing deployment...',
                progress: 10
            });

            // Validate inputs with retry
            await this.executeWithRetry(
                () => this.validateDeployment(websitePath),
                'Validation',
                result.logs
            );

            this.updateStatus({
                status: 'preparing',
                message: 'Checking Git repository...',
                progress: 20
            });

            // Check Git repository with retry
            const repoInfo = await this.executeWithRetry(
                () => this.checkGitRepository(),
                'Git repository check',
                result.logs
            );
            result.logs.push(`Repository: ${repoInfo.origin}`);

            this.updateStatus({
                status: 'building',
                message: 'Preparing website files...',
                progress: 40
            });

            // Prepare deployment files with retry
            await this.executeWithRetry(
                () => this.prepareDeploymentFiles(websitePath, config),
                'File preparation',
                result.logs
            );

            this.updateStatus({
                status: 'deploying',
                message: 'Creating gh-pages branch...',
                progress: 60
            });

            // Create and switch to gh-pages branch with retry
            await this.executeWithRetry(
                () => this.setupGhPagesBranch(),
                'Branch setup',
                result.logs
            );

            this.updateStatus({
                status: 'deploying',
                message: 'Pushing to GitHub...',
                progress: 80
            });

            // Deploy to GitHub Pages with retry
            await this.executeWithRetry(
                () => this.pushToGitHub(websitePath),
                'GitHub push',
                result.logs
            );

            // Generate deployment URL
            const deploymentUrl = this.generateDeploymentUrl(repoInfo.origin, config.customDomain);
            result.deploymentUrl = deploymentUrl;

            // Finalize metrics
            this.deploymentMetrics.endTime = new Date();
            this.deploymentMetrics.duration = this.deploymentMetrics.endTime.getTime() - this.deploymentMetrics.startTime.getTime();
            this.deploymentMetrics.success = true;

            result.logs.push(`Deployment completed in ${this.deploymentMetrics.duration}ms with ${this.deploymentMetrics.retryCount} retries`);
            result.logs.push(`Deployment URL: ${deploymentUrl}`);

            this.updateStatus({
                status: 'completed',
                message: `Deployment completed! Available at: ${deploymentUrl}`,
                progress: 100
            });

            result.success = true;
            return result;

        } catch (error) {
            // Finalize metrics on failure
            if (this.deploymentMetrics) {
                this.deploymentMetrics.endTime = new Date();
                this.deploymentMetrics.duration = this.deploymentMetrics.endTime.getTime() - this.deploymentMetrics.startTime.getTime();
                this.deploymentMetrics.success = false;
                this.deploymentMetrics.errorType = error instanceof Error ? error.constructor.name : 'UnknownError';
            }

            const enhancedError = this.enhanceErrorMessage(error);

            this.updateStatus({
                status: 'failed',
                message: `Deployment failed: ${enhancedError.message}`,
                progress: 0
            });

            result.error = enhancedError.message;
            result.logs.push(`Error: ${enhancedError.message}`);
            if (enhancedError.resolutionSteps.length > 0) {
                result.logs.push('Suggested resolution steps:');
                enhancedError.resolutionSteps.forEach((step, index) => {
                    result.logs.push(`  ${index + 1}. ${step}`);
                });
            }

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

    private async executeWithRetry<T>(
        operation: () => Promise<T>,
        operationName: string,
        logs: string[]
    ): Promise<T> {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
            try {
                if (attempt > 0) {
                    const delay = Math.min(
                        this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1),
                        this.retryConfig.maxDelay
                    );

                    logs.push(`${operationName} failed, retrying in ${delay}ms (attempt ${attempt + 1}/${this.retryConfig.maxRetries + 1})`);
                    await new Promise(resolve => setTimeout(resolve, delay));

                    if (this.deploymentMetrics) {
                        this.deploymentMetrics.retryCount++;
                    }
                }

                const result = await this.executeWithTimeout(operation, 30000); // 30 second timeout

                if (attempt > 0) {
                    logs.push(`${operationName} succeeded on retry attempt ${attempt + 1}`);
                }

                return result;

            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));

                if (attempt === this.retryConfig.maxRetries) {
                    logs.push(`${operationName} failed after ${this.retryConfig.maxRetries + 1} attempts`);
                    break;
                }
            }
        }

        throw lastError || new Error(`${operationName} failed after all retry attempts`);
    }

    private async executeWithTimeout<T>(operation: () => Promise<T>, timeoutMs: number): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Operation timed out after ${timeoutMs}ms`));
            }, timeoutMs);

            operation()
                .then(result => {
                    clearTimeout(timeout);
                    resolve(result);
                })
                .catch(error => {
                    clearTimeout(timeout);
                    reject(error);
                });
        });
    }

    private enhanceErrorMessage(error: unknown): { message: string; resolutionSteps: string[] } {
        const originalMessage = error instanceof Error ? error.message : String(error);
        const lowerMessage = originalMessage.toLowerCase();

        let enhancedMessage = originalMessage;
        const resolutionSteps: string[] = [];

        // Git-related errors
        if (lowerMessage.includes('not a git repository')) {
            enhancedMessage = 'This folder is not a Git repository. LumosGen requires Git for deployment.';
            resolutionSteps.push('Initialize Git: git init');
            resolutionSteps.push('Add remote repository: git remote add origin <your-repo-url>');
            resolutionSteps.push('Make initial commit: git add . && git commit -m "Initial commit"');
        }

        // Authentication errors
        else if (lowerMessage.includes('permission denied') || lowerMessage.includes('authentication failed')) {
            enhancedMessage = 'GitHub authentication failed. Please check your credentials.';
            resolutionSteps.push('Verify GitHub credentials are configured');
            resolutionSteps.push('Check if you have push access to the repository');
            resolutionSteps.push('Consider using GitHub CLI: gh auth login');
        }

        // Network errors
        else if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
            enhancedMessage = 'Network connection failed. Please check your internet connection.';
            resolutionSteps.push('Check internet connectivity');
            resolutionSteps.push('Verify GitHub.com is accessible');
            resolutionSteps.push('Try again in a few moments');
        }

        // File system errors
        else if (lowerMessage.includes('no such file') || lowerMessage.includes('enoent')) {
            enhancedMessage = 'Required files are missing. Please ensure the website was generated successfully.';
            resolutionSteps.push('Regenerate the website using LumosGen');
            resolutionSteps.push('Verify index.html exists in the website folder');
            resolutionSteps.push('Check file permissions');
        }

        // Timeout errors
        else if (lowerMessage.includes('timeout')) {
            enhancedMessage = 'Operation timed out. This may be due to large files or slow network.';
            resolutionSteps.push('Check network connection speed');
            resolutionSteps.push('Reduce website file sizes if possible');
            resolutionSteps.push('Try deployment again');
        }

        return { message: enhancedMessage, resolutionSteps };
    }

    public getDeploymentMetrics(): DeploymentMetrics | null {
        return this.deploymentMetrics;
    }
}
