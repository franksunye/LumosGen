import * as vscode from 'vscode';
import { ProjectAnalyzer, ProjectAnalysis } from '../analysis/ProjectAnalyzer';
import { t } from '../i18n';

export class SidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'lumosgen.sidebar';
    
    private _view?: vscode.WebviewView;
    private _projectAnalysis?: ProjectAnalysis;
    private outputChannel: vscode.OutputChannel;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        outputChannel: vscode.OutputChannel
    ) {
        this.outputChannel = outputChannel;
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(
            message => {
                switch (message.type) {
                    case 'analyzeProject':
                        this.analyzeProject();
                        break;
                    case 'generateContent':
                        this.generateContent();
                        break;
                    case 'previewWebsite':
                        this.previewWebsite();
                        break;
                    case 'deployToGitHub':
                        this.deployToGitHub();
                        break;
                    case 'openSettings':
                        vscode.commands.executeCommand('workbench.action.openSettings', 'lumosGen');
                        break;
                }
            },
            undefined,
            []
        );
    }

    private async analyzeProject() {
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showErrorMessage(t('errors.noWorkspace'));
            return;
        }

        const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
        const analyzer = new ProjectAnalyzer(workspaceRoot, this.outputChannel);

        try {
            this.updateStatus('analyzing');
            this._projectAnalysis = await analyzer.analyzeProject();
            this.updateAnalysisResults(this._projectAnalysis);
            this.updateStatus('completed');
            
            vscode.window.showInformationMessage(
                t('analysis.analysisComplete'),
                t('commands.generateContent')
            ).then(selection => {
                if (selection === t('commands.generateContent')) {
                    this.generateContent();
                }
            });
        } catch (error) {
            this.updateStatus('failed');
            this.outputChannel.appendLine(`Analysis failed: ${error}`);
            vscode.window.showErrorMessage(`${t('ui.status.failed')}: ${error}`);
        }
    }

    private async generateContent() {
        if (!this._projectAnalysis) {
            vscode.window.showWarningMessage('Please analyze the project first');
            return;
        }

        try {
            this.updateStatus('generating');
            
            // TODO: Implement content generation in Sprint 2
            // For now, show a placeholder message
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate work
            
            this.updateStatus('completed');
            vscode.window.showInformationMessage(
                t('content.contentReady'),
                t('commands.previewWebsite')
            ).then(selection => {
                if (selection === t('commands.previewWebsite')) {
                    this.previewWebsite();
                }
            });
        } catch (error) {
            this.updateStatus('failed');
            this.outputChannel.appendLine(`Content generation failed: ${error}`);
            vscode.window.showErrorMessage(t('content.contentFailed', { error }));
        }
    }

    private async previewWebsite() {
        try {
            this.updateStatus('building');
            
            // TODO: Implement website preview in Sprint 3
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate work
            
            this.updateStatus('completed');
            vscode.window.showInformationMessage('Website preview will be available in Sprint 3');
        } catch (error) {
            this.updateStatus('failed');
            vscode.window.showErrorMessage(`Preview failed: ${error}`);
        }
    }

    private async deployToGitHub() {
        try {
            this.updateStatus('deploying');
            
            // TODO: Implement GitHub Pages deployment in Sprint 4
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate work
            
            this.updateStatus('completed');
            vscode.window.showInformationMessage('GitHub Pages deployment will be available in Sprint 4');
        } catch (error) {
            this.updateStatus('failed');
            vscode.window.showErrorMessage(t('deployment.deploymentFailed', { error }));
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

    private updateAnalysisResults(analysis: ProjectAnalysis) {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'updateAnalysis',
                analysis: {
                    projectName: analysis.metadata.name,
                    description: analysis.metadata.description,
                    techStack: analysis.techStack.map(t => `${t.language}${t.framework ? ` (${t.framework})` : ''}`),
                    features: analysis.features.slice(0, 5).map(f => f.name),
                    marketingPotential: Math.round(analysis.marketingPotential * 100),
                    targetAudience: analysis.targetAudience
                }
            });
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
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
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🔮 LumosGen</div>
        <div class="subtitle">${t('ui.sidebar.title')}</div>
    </div>
    
    <div id="status" class="status" style="display: none;"></div>
    
    <button class="action-button" onclick="analyzeProject()">
        📊 ${t('ui.sidebar.analyzeProject')}
    </button>
    
    <button class="action-button" onclick="generateContent()" id="generateBtn" disabled>
        🤖 ${t('ui.sidebar.generateContent')}
    </button>
    
    <button class="action-button" onclick="previewWebsite()" id="previewBtn" disabled>
        🎨 ${t('ui.sidebar.previewWebsite')}
    </button>
    
    <button class="action-button" onclick="deployToGitHub()" id="deployBtn" disabled>
        🚀 ${t('ui.sidebar.deployToGitHub')}
    </button>
    
    <button class="action-button" onclick="openSettings()">
        ⚙️ ${t('ui.sidebar.settings')}
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

    <script>
        const vscode = acquireVsCodeApi();
        
        function analyzeProject() {
            vscode.postMessage({ type: 'analyzeProject' });
        }
        
        function generateContent() {
            vscode.postMessage({ type: 'generateContent' });
        }
        
        function previewWebsite() {
            vscode.postMessage({ type: 'previewWebsite' });
        }
        
        function deployToGitHub() {
            vscode.postMessage({ type: 'deployToGitHub' });
        }
        
        function openSettings() {
            vscode.postMessage({ type: 'openSettings' });
        }
        
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.type) {
                case 'updateStatus':
                    updateStatus(message.status);
                    break;
                case 'updateAnalysis':
                    updateAnalysisResults(message.analysis);
                    break;
            }
        });
        
        function updateStatus(status) {
            const statusEl = document.getElementById('status');
            const statusTexts = {
                analyzing: '${t('ui.status.analyzing')}',
                generating: '${t('ui.status.generating')}',
                building: '${t('ui.status.building')}',
                deploying: '${t('ui.status.deploying')}',
                completed: '${t('ui.status.completed')}',
                failed: '${t('ui.status.failed')}'
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
        
        function updateAnalysisResults(analysis) {
            document.getElementById('projectName').textContent = analysis.projectName;
            
            const techStackEl = document.getElementById('techStack');
            techStackEl.innerHTML = '';
            analysis.techStack.forEach(tech => {
                const tag = document.createElement('span');
                tag.className = 'tech-tag';
                tag.textContent = tech;
                techStackEl.appendChild(tag);
            });
            
            document.getElementById('marketingPotential').textContent = analysis.marketingPotential + '%';
            document.getElementById('potentialBar').style.width = analysis.marketingPotential + '%';
            
            document.getElementById('targetAudience').textContent = analysis.targetAudience.join(', ');
            
            document.getElementById('analysisResults').classList.add('visible');
            
            // Enable next steps
            document.getElementById('generateBtn').disabled = false;
        }
    </script>
</body>
</html>`;
    }
}
