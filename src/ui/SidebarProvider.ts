import * as vscode from 'vscode';
import * as path from 'path';
import { MarketingWorkflowManager } from '../agents/lumosgen-workflow';
import { AgentResult } from '../agents/simple-agent-system';
import { GitHubPagesDeployer, DeploymentStatus } from '../deployment/GitHubPagesDeployer';
import { DeploymentMonitor } from '../deployment/DeploymentMonitor';
import { WebsiteBuilder, WebsiteConfig } from '../website/WebsiteBuilder';

export class SidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'lumosgen.sidebar';

    private _view?: vscode.WebviewView;
    private outputChannel: vscode.OutputChannel;
    private agentManager?: MarketingWorkflowManager;
    private agentStatus: { isRunning: boolean; currentTask?: string; progress?: number } = { isRunning: false };
    private deployer: GitHubPagesDeployer;
    private deploymentMonitor: DeploymentMonitor;
    private websiteBuilder: WebsiteBuilder;
    private currentTheme: string = 'modern'; // 默认主题

    constructor(
        private readonly _extensionUri: vscode.Uri,
        outputChannel: vscode.OutputChannel,
        agentManager?: MarketingWorkflowManager
    ) {
        this.outputChannel = outputChannel;
        this.agentManager = agentManager;
        this.deployer = new GitHubPagesDeployer(outputChannel);
        this.deploymentMonitor = new DeploymentMonitor(outputChannel);
        this.websiteBuilder = new WebsiteBuilder(outputChannel);
        this.outputChannel.appendLine('LumosGen: SidebarProvider constructor called');

        // Agent system handles all functionality

        // Set up agent event listeners if agent manager is available
        if (this.agentManager) {
            this.setupAgentEventListeners();
            this.outputChannel.appendLine('✅ Agent Manager connected to sidebar');
        } else {
            this.outputChannel.appendLine('⚠️ No Agent Manager - using legacy workflow');
        }

        this.outputChannel.appendLine('LumosGen: SidebarProvider constructor completed');

        // Set up deployment status monitoring
        // Agent system handles all functionality
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this.outputChannel.appendLine('LumosGen: resolveWebviewView called');
        this.outputChannel.appendLine(`LumosGen: webviewView.viewType = ${webviewView.viewType}`);
        this.outputChannel.appendLine(`LumosGen: expected viewType = ${SidebarProvider.viewType}`);
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        this.outputChannel.appendLine('LumosGen: Setting webview HTML content');
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        this.outputChannel.appendLine('LumosGen: Webview HTML content set successfully');

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(
            message => {
                switch (message.type) {
                    case 'generateContent':
                        this.generateContentWithAgents();
                        break;

                    case 'deployToGitHub':
                        this.deployToGitHub();
                        break;
                    case 'openSettings':
                        vscode.commands.executeCommand('workbench.action.openSettings', 'lumosGen');
                        break;
                    case 'stopAgentWorkflow':
                        this.stopAgentWorkflow();
                        break;
                    case 'changeTheme':
                        this.changeTheme(message.theme);
                        break;
                    case 'getThemes':
                        this.sendThemeList();
                        break;
                }
            },
            undefined,
            []
        );
    }
    // Agent-related methods
    private setupAgentEventListeners(): void {
        if (!this.agentManager) return;

        // Listen for agent workflow events
        this.agentManager.workflow?.on('workflowStarted', () => {
            this.agentStatus.isRunning = true;
            this.updateAgentStatus('🚀 Starting agent workflow...');
        });

        this.agentManager.workflow?.on('taskStarted', (taskId: string) => {
            this.agentStatus.currentTask = taskId;
            this.updateAgentStatus(`🤖 Running task: ${taskId}`);
        });

        this.agentManager.workflow?.on('taskCompleted', (taskId: string, result: AgentResult) => {
            if (result.success) {
                this.updateAgentStatus(`✅ Completed: ${taskId}`);
            } else {
                this.updateAgentStatus(`❌ Failed: ${taskId} - ${result.error}`);
            }
        });

        this.agentManager.workflow?.on('workflowCompleted', (results: Map<string, AgentResult>) => {
            this.agentStatus.isRunning = false;
            this.agentStatus.currentTask = undefined;
            this.updateAgentStatus('✅ Agent workflow completed');

            // Update UI with results
            const contentResult = results.get('contentGeneration');
            if (contentResult?.success) {
                this.updateAgentResults(contentResult);
            }
        });

        this.agentManager.workflow?.on('workflowError', (error: Error) => {
            this.agentStatus.isRunning = false;
            this.agentStatus.currentTask = undefined;
            this.updateAgentStatus(`❌ Workflow error: ${error.message}`);
        });
    }

    private async generateContentWithAgents(): Promise<void> {
        if (!this.agentManager) {
            vscode.window.showErrorMessage('Agent Manager not initialized. Please check your configuration.');
            return;
        }

        try {
            this.outputChannel.appendLine('🤖 Starting AI Agent workflow...');
            this.outputChannel.appendLine(`🎨 Using theme: ${this.currentTheme}`);
            this.outputChannel.appendLine('📊 Phase 1: Project Analysis');
            this.outputChannel.appendLine('🎯 Phase 2: Content Strategy');
            this.outputChannel.appendLine('✍️ Phase 3: Content Generation');
            this.outputChannel.appendLine('🏗️ Phase 4: Website Building');

            // Get workspace path
            const workspacePath = this.getWorkspacePath();

            // Create theme configuration
            const themeMetadata = this.websiteBuilder.getThemeMetadata(this.currentTheme);
            const themeConfig = this.websiteBuilder.getThemeCustomization(this.currentTheme);

            // Use agent workflow for complete website generation with theme
            const result = await this.agentManager.generateContentWithPath('homepage', workspacePath);

            if (result?.success) {
                this.outputChannel.appendLine('✅ Complete marketing website generated successfully!');
                this.updateAgentResults(result);

                // Show success message with website location
                vscode.window.showInformationMessage(
                    'Marketing website generated successfully! Check the output for details.',
                    'Open Output'
                ).then(selection => {
                    if (selection === 'Open Output') {
                        this.outputChannel.show();
                    }
                });
            } else {
                throw new Error(result?.error || 'Agent workflow failed');
            }
        } catch (error) {
            this.outputChannel.appendLine(`❌ Agent workflow error: ${error}`);
            vscode.window.showErrorMessage(`Marketing website generation failed: ${error}`);
        }
    }

    private stopAgentWorkflow(): void {
        if (this.agentManager) {
            this.agentManager.stop();
            this.agentStatus.isRunning = false;
            this.agentStatus.currentTask = undefined;
            this.updateAgentStatus('⏹️ Agent workflow stopped');
        }
    }

    public updateAgentResults(result: AgentResult): void {
        if (this._view && result.success) {
            this._view.webview.postMessage({
                type: 'updateAgentResults',
                result: {
                    success: result.success,
                    data: result.data,
                    metadata: result.metadata,
                    timestamp: new Date().toISOString()
                }
            });
        }
    }

    private updateAgentStatus(status: string): void {
        this.outputChannel.appendLine(status);

        if (this._view) {
            this._view.webview.postMessage({
                type: 'updateAgentStatus',
                status: {
                    isRunning: this.agentStatus.isRunning,
                    currentTask: this.agentStatus.currentTask,
                    message: status,
                    timestamp: new Date().toISOString()
                }
            });
        }
    }

    // 主题管理方法
    private changeTheme(themeName: string): void {
        this.currentTheme = themeName;
        this.outputChannel.appendLine(`🎨 Theme changed to: ${themeName}`);

        // 获取主题信息
        const themeMetadata = this.websiteBuilder.getThemeMetadata(themeName);

        // 发送主题更新消息到前端
        if (this._view) {
            this._view.webview.postMessage({
                type: 'themeChanged',
                theme: {
                    name: themeName,
                    metadata: themeMetadata
                }
            });
        }

        // 显示主题切换成功消息
        vscode.window.showInformationMessage(
            `🎨 主题已切换为: ${themeMetadata?.name || themeName}`,
            '生成网站'
        ).then(selection => {
            if (selection === '生成网站') {
                this.generateContentWithAgents();
            }
        });
    }

    private sendThemeList(): void {
        const availableThemes = this.websiteBuilder.getAvailableThemes();
        const themesWithMetadata = availableThemes.map(themeName => ({
            name: themeName,
            metadata: this.websiteBuilder.getThemeMetadata(themeName),
            isActive: themeName === this.currentTheme
        }));

        if (this._view) {
            this._view.webview.postMessage({
                type: 'themeList',
                themes: themesWithMetadata,
                currentTheme: this.currentTheme
            });
        }
    }







    private async deployToGitHub() {
        try {
            this.outputChannel.appendLine('🚀 Starting deployment process...');
            this.outputChannel.appendLine('📋 Step 1: Generate website using AI Agents');

            // First generate the website using Agent system
            await this.generateContentWithAgents();

            this.outputChannel.appendLine('📋 Step 2: Deploy to GitHub Pages');

            // Get workspace folder
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                throw new Error('No workspace folder found. Please open a folder in VS Code.');
            }

            // Define website path
            const websitePath = path.join(workspaceFolder.uri.fsPath, 'lumosgen-website');

            // Set up deployment status monitoring
            this.deployer.onStatusChange((status: DeploymentStatus) => {
                this.outputChannel.appendLine(`[${status.status.toUpperCase()}] ${status.message} (${status.progress}%)`);

                // Update webview if available
                if (this._view) {
                    this._view.webview.postMessage({
                        type: 'deploymentStatus',
                        status: status.status,
                        message: status.message,
                        progress: status.progress
                    });
                }
            });

            // Start deployment
            this.outputChannel.appendLine('🔄 Starting real GitHub Pages deployment...');
            const deploymentResult = await this.deployer.deploy(websitePath, {
                branch: 'gh-pages'
            });

            if (deploymentResult.success && deploymentResult.deploymentUrl) {
                // Start monitoring the deployed site
                this.deploymentMonitor.startMonitoring(deploymentResult.deploymentUrl);

                // Show deployment metrics
                const metrics = this.deployer.getDeploymentMetrics();
                if (metrics) {
                    this.outputChannel.appendLine(`📊 Deployment completed in ${metrics.duration}ms with ${metrics.retryCount} retries`);
                }

                this.outputChannel.appendLine('✅ Deployment completed successfully!');
                this.outputChannel.appendLine(`🌐 Website is available at: ${deploymentResult.deploymentUrl}`);

                vscode.window.showInformationMessage(
                    `🚀 Deployment successful! Your website is live at ${deploymentResult.deploymentUrl}`,
                    'View Website',
                    'View Output',
                    'Monitor Health'
                ).then(selection => {
                    if (selection === 'View Website') {
                        vscode.env.openExternal(vscode.Uri.parse(deploymentResult.deploymentUrl!));
                    } else if (selection === 'View Output') {
                        this.outputChannel.show();
                    } else if (selection === 'Monitor Health') {
                        this.deploymentMonitor.showHealthReport(deploymentResult.deploymentUrl!);
                    }
                });

            } else {
                throw new Error(deploymentResult.error || 'Deployment failed for unknown reason');
            }

        } catch (error) {
            this.outputChannel.appendLine(`❌ Deployment failed: ${error}`);

            // Show detailed error information
            if (error instanceof Error) {
                this.outputChannel.appendLine(`Error details: ${error.message}`);
                if (error.stack) {
                    this.outputChannel.appendLine(`Stack trace: ${error.stack}`);
                }
            }

            vscode.window.showErrorMessage(
                `Deployment failed: ${error}`,
                'View Output',
                'Retry',
                'Help'
            ).then(selection => {
                if (selection === 'View Output') {
                    this.outputChannel.show();
                } else if (selection === 'Retry') {
                    this.deployToGitHub();
                } else if (selection === 'Help') {
                    vscode.env.openExternal(vscode.Uri.parse('https://docs.github.com/en/pages'));
                }
            });
        }
    }



    private updateStatus(status: string) {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'updateStatus',
                status: status
            });
        }
    }

    // Removed: updateDeploymentStatus and updateHealthStatus - Agent system handles all updates

    // Removed: updateDeploymentInfo - Agent system handles all updates

    // Removed: updateAnalysisResults - Agent system handles all updates

    // Removed: updateContentResults - Agent system handles all updates

    // Removed: updateWebsiteResults - Agent system handles all updates



    private _getHtmlForWebview(webview: vscode.Webview) {
        this.outputChannel.appendLine('LumosGen: _getHtmlForWebview called');
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LumosGen Marketing AI</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            margin: 0;
            padding: 16px;
        }

        .header {
            text-align: center;
            margin-bottom: 24px;
        }

        .logo {
            font-size: 24px;
            margin-bottom: 8px;
        }

        .subtitle {
            color: var(--vscode-descriptionForeground);
            font-size: 12px;
        }

        .action-button {
            width: 100%;
            padding: 12px;
            margin: 8px 0;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .action-button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        .action-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .status {
            padding: 8px 12px;
            margin: 8px 0;
            border-radius: 4px;
            font-size: 12px;
            text-align: center;
        }

        .status.analyzing { background-color: var(--vscode-editorInfo-background); }
        .status.generating { background-color: var(--vscode-editorWarning-background); }
        .status.building { background-color: var(--vscode-editorWarning-background); }
        .status.deploying { background-color: var(--vscode-editorInfo-background); }
        .status.completed { background-color: var(--vscode-editorGutter-addedBackground); }
        .status.failed { background-color: var(--vscode-editorError-background); }

        .analysis-results {
            margin-top: 16px;
            padding: 12px;
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            border-radius: 4px;
            display: none;
        }

        .analysis-results.visible {
            display: block;
        }

        .content-results {
            margin-top: 16px;
            padding: 12px;
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            border-radius: 4px;
            display: none;
        }

        .content-results.visible {
            display: block;
        }

        .content-results h3 {
            margin: 0 0 12px 0;
            color: var(--vscode-textLink-foreground);
            font-size: 14px;
        }

        .content-item {
            margin: 8px 0;
        }

        .content-label {
            font-weight: bold;
            color: var(--vscode-textLink-foreground);
            font-size: 12px;
        }

        .content-pages {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            margin-top: 4px;
        }

        .page-tag {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            padding: 2px 6px;
            border-radius: 12px;
            font-size: 10px;
        }

        .content-keywords {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            margin-top: 4px;
        }

        .keyword-tag {
            background-color: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            padding: 2px 6px;
            border-radius: 8px;
            font-size: 10px;
        }

        .analysis-item {
            margin: 8px 0;
        }

        .analysis-label {
            font-weight: bold;
            color: var(--vscode-textLink-foreground);
        }

        .tech-stack {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            margin-top: 4px;
        }

        .tech-tag {
            background-color: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            padding: 2px 6px;
            border-radius: 12px;
            font-size: 10px;
        }

        .progress-bar {
            width: 100%;
            height: 8px;
            background-color: var(--vscode-progressBar-background);
            border-radius: 4px;
            overflow: hidden;
            margin-top: 4px;
        }

        .progress-fill {
            height: 100%;
            background-color: var(--vscode-progressBar-background);
            transition: width 0.3s ease;
        }

        .agent-status {
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
            padding: 12px;
            margin: 12px 0;
        }

        .agent-status h3 {
            margin: 0 0 8px 0;
            color: var(--vscode-textLink-foreground);
            font-size: 14px;
        }

        .agent-status-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 4px 0;
            font-size: 12px;
        }

        .agent-results {
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
            padding: 12px;
            margin: 12px 0;
        }

        .agent-results h3 {
            margin: 0 0 12px 0;
            color: var(--vscode-testing-passedForeground);
            font-size: 14px;
        }

        .agent-results-content {
            font-size: 12px;
            line-height: 1.4;
        }

        .agent-results-content h3 {
            margin: 8px 0 4px 0;
            color: var(--vscode-textLink-foreground);
            font-size: 13px;
        }

        .agent-results-content p {
            margin: 4px 0;
            color: var(--vscode-foreground);
        }

        .agent-results-content ul {
            margin: 4px 0 8px 16px;
            padding: 0;
        }

        .agent-results-content li {
            margin: 2px 0;
            color: var(--vscode-foreground);
        }

        .agent-running {
            color: var(--vscode-testing-runAction);
        }

        .agent-idle {
            color: var(--vscode-descriptionForeground);
        }

        .agent-error {
            color: var(--vscode-errorForeground);
        }

        .agent-success {
            color: var(--vscode-testing-passedForeground);
        }

        .agent-task {
            font-family: var(--vscode-editor-font-family);
            font-size: 11px;
            background-color: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            padding: 2px 6px;
            border-radius: 4px;
        }

        .stop-button {
            background-color: var(--vscode-errorForeground);
            color: var(--vscode-editor-background);
            border: none;
            border-radius: 4px;
            padding: 4px 8px;
            font-size: 10px;
            cursor: pointer;
        }

        .stop-button:hover {
            opacity: 0.8;
        }

        /* Theme Selection Styles */
        .theme-section {
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
            padding: 12px;
            margin: 12px 0;
        }

        .theme-section h3 {
            margin: 0 0 12px 0;
            color: var(--vscode-textLink-foreground);
            font-size: 14px;
        }

        .theme-selector {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .theme-option {
            display: flex;
            align-items: center;
            padding: 8px;
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
        }

        .theme-option:hover {
            background-color: var(--vscode-list-hoverBackground);
            border-color: var(--vscode-textLink-foreground);
        }

        .theme-option.selected {
            background-color: var(--vscode-list-activeSelectionBackground);
            border-color: var(--vscode-textLink-foreground);
        }

        .theme-preview {
            width: 32px;
            height: 24px;
            border-radius: 3px;
            margin-right: 8px;
            border: 1px solid var(--vscode-panel-border);
        }

        .modern-preview {
            background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
        }

        .technical-preview {
            background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
        }

        .theme-info {
            flex: 1;
        }

        .theme-name {
            font-weight: 600;
            font-size: 12px;
            color: var(--vscode-foreground);
            margin-bottom: 2px;
        }

        .theme-description {
            font-size: 10px;
            color: var(--vscode-descriptionForeground);
        }

        .theme-check {
            color: var(--vscode-testing-passedForeground);
            font-weight: bold;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🔮 LumosGen</div>
        <div class="subtitle">AI-Powered Marketing Website Generator</div>
    </div>

    <div id="status" class="status" style="display: none;"></div>

    <!-- Agent Status Display -->
    <div id="agentStatus" class="agent-status" style="display: none;">
        <h3>🤖 AI Agent Status</h3>
        <div class="agent-status-item">
            <span>Status:</span>
            <span id="agentStatusText" class="agent-idle">Idle</span>
        </div>
        <div class="agent-status-item" id="agentTaskContainer" style="display: none;">
            <span>Current Task:</span>
            <span id="agentCurrentTask" class="agent-task"></span>
        </div>
        <div class="agent-status-item" id="agentStopContainer" style="display: none;">
            <span></span>
            <button class="stop-button" onclick="stopAgentWorkflow()">⏹️ Stop</button>
        </div>
    </div>

    <!-- Agent Results Display -->
    <div id="agentResults" class="agent-results" style="display: none;">
        <h3>🎉 Generation Results</h3>
        <div class="agent-results-content">
            <!-- Results will be populated by JavaScript -->
        </div>
    </div>

    <!-- Theme Selection Section -->
    <div class="theme-section">
        <h3>🎨 Website Theme</h3>
        <div class="theme-selector">
            <div class="theme-option" id="theme-modern" onclick="selectTheme('modern')">
                <div class="theme-preview modern-preview"></div>
                <div class="theme-info">
                    <div class="theme-name">Modern</div>
                    <div class="theme-description">Clean & minimalist design</div>
                </div>
                <div class="theme-check" id="check-modern">✓</div>
            </div>
            <div class="theme-option" id="theme-technical" onclick="selectTheme('technical')">
                <div class="theme-preview technical-preview"></div>
                <div class="theme-info">
                    <div class="theme-name">Technical</div>
                    <div class="theme-description">Code-focused & professional</div>
                </div>
                <div class="theme-check" id="check-technical" style="display: none;">✓</div>
            </div>
        </div>
    </div>

    <button class="action-button" onclick="generateContentWithAgents()" id="generateBtn">
        🚀 Generate Marketing Website
    </button>

    <button class="action-button" onclick="deployToGitHub()" id="deployBtn">
        🚀 Deploy to GitHub Pages
    </button>

    <button class="action-button" onclick="openSettings()">
        ⚙️ Settings
    </button>

    <div id="analysisResults" class="analysis-results">
        <div class="analysis-item">
            <div class="analysis-label">Project:</div>
            <div id="projectName">-</div>
        </div>
        <div class="analysis-item">
            <div class="analysis-label">Tech Stack:</div>
            <div id="techStack" class="tech-stack"></div>
        </div>
        <div class="analysis-item">
            <div class="analysis-label">Marketing Potential:</div>
            <div id="marketingPotential">-</div>
            <div class="progress-bar">
                <div id="potentialBar" class="progress-fill" style="width: 0%;"></div>
            </div>
        </div>
        <div class="analysis-item">
            <div class="analysis-label">Target Audience:</div>
            <div id="targetAudience">-</div>
        </div>
    </div>

    <div id="contentResults" class="content-results">
        <h3>📝 Generated Content</h3>
        <div class="content-item">
            <div class="content-label">Title:</div>
            <div id="contentTitle">-</div>
        </div>
        <div class="content-item">
            <div class="content-label">Pages Generated:</div>
            <div id="contentPages" class="content-pages"></div>
        </div>
        <div class="content-item">
            <div class="content-label">SEO Keywords:</div>
            <div id="contentKeywords" class="content-keywords"></div>
        </div>

    </div>

    <script>
        const vscode = acquireVsCodeApi();



        function generateContentWithAgents() {
            vscode.postMessage({ type: 'generateContent' });
        }



        function deployToGitHub() {
            vscode.postMessage({ type: 'deployToGitHub' });
        }

        function openSettings() {
            vscode.postMessage({ type: 'openSettings' });
        }

        function stopAgentWorkflow() {
            vscode.postMessage({ type: 'stopAgentWorkflow' });
        }

        // Theme selection functions
        let currentTheme = 'modern'; // Default theme

        function selectTheme(themeName) {
            currentTheme = themeName;

            // Update UI
            document.querySelectorAll('.theme-option').forEach(option => {
                option.classList.remove('selected');
            });
            document.querySelectorAll('.theme-check').forEach(check => {
                check.style.display = 'none';
            });

            document.getElementById('theme-' + themeName).classList.add('selected');
            document.getElementById('check-' + themeName).style.display = 'block';

            // Notify backend
            vscode.postMessage({
                type: 'changeTheme',
                theme: themeName
            });
        }

        // Initialize theme selection on load
        document.addEventListener('DOMContentLoaded', function() {
            selectTheme('modern'); // Set default theme

            // Request theme list from backend
            vscode.postMessage({ type: 'getThemes' });
        });

        window.addEventListener('message', event => {
            const message = event.data;

            switch (message.type) {
                case 'updateStatus':
                    updateStatus(message.status);
                    break;
                // Removed: updateAnalysis and updateContent - Agent system handles all updates
                case 'updateAgentStatus':
                    updateAgentStatus(message.status);
                    break;
                case 'updateAgentResults':
                    updateAgentResults(message.result);
                    break;
                case 'themeChanged':
                    handleThemeChanged(message.theme);
                    break;
                case 'themeList':
                    handleThemeList(message.themes, message.currentTheme);
                    break;
            }
        });

        function updateStatus(status) {
            const statusEl = document.getElementById('status');
            const statusTexts = {
                analyzing: 'Analyzing project...',
                generating: 'Generating marketing content...',
                building: 'Building website...',
                deploying: 'Deploying to GitHub Pages...',
                completed: 'Completed successfully!',
                failed: 'Operation failed'
            };

            statusEl.textContent = statusTexts[status] || status;
            statusEl.className = 'status ' + status;
            statusEl.style.display = 'block';

            if (status === 'completed' || status === 'failed') {
                setTimeout(() => {
                    statusEl.style.display = 'none';
                }, 3000);
            }
        }

        // Removed: updateAnalysisResults - Agent system handles all updates

        // Removed: updateContentResults - Agent system handles all updates

        function updateAgentStatus(status) {
            const agentStatusEl = document.getElementById('agentStatus');
            const agentStatusTextEl = document.getElementById('agentStatusText');
            const agentTaskContainerEl = document.getElementById('agentTaskContainer');
            const agentCurrentTaskEl = document.getElementById('agentCurrentTask');
            const agentStopContainerEl = document.getElementById('agentStopContainer');

            // Show agent status panel
            agentStatusEl.style.display = 'block';

            // Update status text and styling
            agentStatusTextEl.textContent = status.message || 'Unknown';
            agentStatusTextEl.className = status.isRunning ? 'agent-running' :
                                         status.message.includes('❌') ? 'agent-error' :
                                         status.message.includes('✅') ? 'agent-success' : 'agent-idle';

            // Show/hide current task
            if (status.isRunning && status.currentTask) {
                agentTaskContainerEl.style.display = 'flex';
                agentCurrentTaskEl.textContent = status.currentTask;
                agentStopContainerEl.style.display = 'flex';
            } else {
                agentTaskContainerEl.style.display = 'none';
                agentStopContainerEl.style.display = 'none';
            }

            // Auto-hide after completion
            if (!status.isRunning && (status.message.includes('✅') || status.message.includes('❌'))) {
                setTimeout(() => {
                    if (!document.getElementById('agentStatusText').className.includes('agent-running')) {
                        agentStatusEl.style.display = 'none';
                    }
                }, 5000);
            }
        }

        function updateAgentResults(result) {
            if (result.success && result.data) {
                // Display generated content
                const resultsContainer = document.getElementById('agentResults');
                if (resultsContainer) {
                    let contentHtml = '<div class="agent-results-content">';

                    // Show website building results
                    if (result.data.websiteUrl || result.data.pages) {
                        contentHtml += '<h3>🏗️ Website Generated</h3>';
                        if (result.data.pages) {
                            contentHtml += '<p><strong>Pages:</strong> ' + result.data.pages.join(', ') + '</p>';
                        }
                        if (result.data.outputPath) {
                            contentHtml += '<p><strong>Output:</strong> ' + result.data.outputPath + '</p>';
                        }
                        if (result.data.seoFeatures) {
                            contentHtml += '<p><strong>SEO Features:</strong> ' + result.data.seoFeatures.join(', ') + '</p>';
                        }
                    }

                    // Show marketing content
                    if (result.data.headline || result.data.features || result.data.fullContent) {
                        contentHtml += '<h3>📝 Marketing Content</h3>';
                        if (result.data.headline) {
                            contentHtml += '<p><strong>Headline:</strong> ' + result.data.headline + '</p>';
                        }
                        if (result.data.features && Array.isArray(result.data.features)) {
                            contentHtml += '<p><strong>Features:</strong></p><ul>';
                            result.data.features.slice(0, 3).forEach(feature => {
                                contentHtml += '<li>' + feature + '</li>';
                            });
                            contentHtml += '</ul>';
                        }
                        if (result.data.fullContent) {
                            const preview = result.data.fullContent.substring(0, 200) + '...';
                            contentHtml += '<p><strong>Content Preview:</strong> ' + preview + '</p>';
                        }
                    }

                    // Show metadata
                    if (result.metadata) {
                        contentHtml += '<h3>📊 Generation Info</h3>';
                        if (result.metadata.buildTime) {
                            contentHtml += '<p><strong>Build Time:</strong> ' + result.metadata.buildTime + '</p>';
                        }
                        if (result.metadata.features) {
                            contentHtml += '<p><strong>Features:</strong> ' + result.metadata.features.join(', ') + '</p>';
                        }
                    }

                    contentHtml += '</div>';
                    resultsContainer.innerHTML = contentHtml;
                    resultsContainer.style.display = 'block';
                }

                // Show success message
                updateStatus('completed');
            }
        }

        // Theme handling functions
        function handleThemeChanged(themeInfo) {
            console.log('Theme changed to:', themeInfo.name);

            // Update current theme
            currentTheme = themeInfo.name;

            // Update UI to reflect the change
            selectTheme(themeInfo.name);

            // Show theme change notification
            const statusEl = document.getElementById('status');
            if (statusEl) {
                statusEl.textContent = '🎨 Theme changed to ' + (themeInfo.metadata ? themeInfo.metadata.name : themeInfo.name);
                statusEl.style.display = 'block';
                statusEl.style.backgroundColor = 'var(--vscode-testing-passedForeground)';

                // Hide after 3 seconds
                setTimeout(() => {
                    statusEl.style.display = 'none';
                }, 3000);
            }
        }

        function handleThemeList(themes, activeTheme) {
            console.log('Available themes:', themes);

            // Update current theme
            currentTheme = activeTheme;

            // Update theme selector UI if needed
            // For now, we have static themes, but this could be dynamic
            selectTheme(activeTheme);
        }
    </script>
</body>
</html>`;
        this.outputChannel.appendLine('LumosGen: HTML content generated successfully');
        return html;
    }

    private getWorkspacePath(): string {
        // Get the current workspace folder path
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            return vscode.workspace.workspaceFolders[0].uri.fsPath;
        }

        // Fallback to a safe directory (user's home directory or temp)
        const os = require('os');
        const path = require('path');
        return path.join(os.homedir(), 'LumosGen-Projects');
    }
}
