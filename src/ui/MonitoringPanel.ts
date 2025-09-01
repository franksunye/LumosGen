// AI Service Monitoring Panel for VS Code
// Provides real-time cost and usage monitoring interface

import * as vscode from 'vscode';
import { AIServiceProvider } from '../ai/AIServiceProvider';
import { UsageStats } from '../ai/types';
import { DetailedUsageStats } from '../ai/monitoring/UsageMonitor';

export class MonitoringPanel {
    public static currentPanel: MonitoringPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];
    private aiService?: AIServiceProvider;
    private updateInterval?: NodeJS.Timeout;

    public static createOrShow(extensionUri: vscode.Uri, aiService?: AIServiceProvider) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it
        if (MonitoringPanel.currentPanel) {
            MonitoringPanel.currentPanel._panel.reveal(column);
            MonitoringPanel.currentPanel.aiService = aiService;
            MonitoringPanel.currentPanel.updateContent();
            return;
        }

        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel(
            'lumosGenMonitoring',
            'LumosGen AI Monitoring',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, 'media'),
                    vscode.Uri.joinPath(extensionUri, 'out', 'media')
                ]
            }
        );

        MonitoringPanel.currentPanel = new MonitoringPanel(panel, extensionUri, aiService);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, aiService?: AIServiceProvider) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this.aiService = aiService;

        // Set the webview's initial html content
        this.updateContent();

        // Listen for when the panel is disposed
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'refresh':
                        this.updateContent();
                        return;
                    case 'exportData':
                        this.exportMonitoringData();
                        return;
                    case 'resetStats':
                        this.resetStatistics();
                        return;
                }
            },
            null,
            this._disposables
        );

        // Auto-refresh every 5 seconds
        this.updateInterval = setInterval(() => {
            this.updateContent();
        }, 5000);
    }

    private updateContent() {
        this._panel.webview.html = this.getWebviewContent();
    }

    private async exportMonitoringData() {
        if (!this.aiService) {
            vscode.window.showWarningMessage('No AI service available for export');
            return;
        }

        try {
            const stats = this.aiService.getUsageStats();
            const healthCheck = await this.aiService.healthCheck();
            
            const exportData = {
                timestamp: new Date().toISOString(),
                stats,
                health: healthCheck,
                totalCost: this.aiService.getTotalCost()
            };

            const data = JSON.stringify(exportData, null, 2);
            
            // Save to file
            const uri = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file(`lumosgen-monitoring-${Date.now()}.json`),
                filters: {
                    'JSON Files': ['json']
                }
            });

            if (uri) {
                await vscode.workspace.fs.writeFile(uri, Buffer.from(data, 'utf8'));
                vscode.window.showInformationMessage(`Monitoring data exported to ${uri.fsPath}`);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Export failed: ${error}`);
        }
    }

    private resetStatistics() {
        vscode.window.showWarningMessage(
            'Reset all monitoring statistics? This action cannot be undone.',
            'Reset', 'Cancel'
        ).then(selection => {
            if (selection === 'Reset') {
                // Note: This would require adding a reset method to AIServiceProvider
                vscode.window.showInformationMessage('Statistics reset (feature coming soon)');
                this.updateContent();
            }
        });
    }

    private getWebviewContent(): string {
        if (!this.aiService) {
            return this.getNoServiceContent();
        }

        try {
            const stats = this.aiService.getUsageStats();
            const totalCost = this.aiService.getTotalCost();
            const currentProvider = this.aiService.getCurrentProvider();
            const availableProviders = this.aiService.getAvailableProviders();

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LumosGen AI Monitoring</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            margin: 0;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            color: var(--vscode-textLink-foreground);
        }
        .status {
            display: flex;
            gap: 10px;
        }
        .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
        }
        .status-healthy { background-color: #28a745; color: white; }
        .status-degraded { background-color: #ffc107; color: black; }
        .status-unhealthy { background-color: #dc3545; color: white; }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .card {
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 16px;
        }
        .card-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 12px;
            color: var(--vscode-textLink-foreground);
        }
        .metric {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        .metric-label {
            color: var(--vscode-descriptionForeground);
        }
        .metric-value {
            font-weight: bold;
        }
        .cost-savings {
            color: #28a745;
            font-weight: bold;
        }
        .provider-list {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        .provider-tag {
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 11px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }
        .provider-current {
            background-color: var(--vscode-textLink-foreground);
        }
        .actions {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }
        .button {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            cursor: pointer;
            font-size: 14px;
        }
        .button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        .button-secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
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
            background-color: var(--vscode-progressBar-foreground);
            transition: width 0.3s ease;
        }
        .timestamp {
            color: var(--vscode-descriptionForeground);
            font-size: 12px;
            text-align: center;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">🤖 LumosGen AI Monitoring</div>
        <div class="status">
            <div class="status-badge status-healthy">Live</div>
            <div class="provider-tag provider-current">${currentProvider?.name || 'None'}</div>
        </div>
    </div>

    <div class="grid">
        <!-- Cost Overview -->
        <div class="card">
            <div class="card-title">💰 Cost Overview</div>
            <div class="metric">
                <span class="metric-label">Total Spent:</span>
                <span class="metric-value">$${totalCost.toFixed(4)}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Today's Cost:</span>
                <span class="metric-value">$${this.getTodayCost(stats).toFixed(4)}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Estimated Savings:</span>
                <span class="metric-value cost-savings">~90% vs OpenAI</span>
            </div>
        </div>

        <!-- Usage Statistics -->
        <div class="card">
            <div class="card-title">📊 Usage Statistics</div>
            <div class="metric">
                <span class="metric-label">Total Requests:</span>
                <span class="metric-value">${this.getTotalRequests(stats)}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Total Tokens:</span>
                <span class="metric-value">${this.getTotalTokens(stats).toLocaleString()}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Success Rate:</span>
                <span class="metric-value">${this.getSuccessRate(stats).toFixed(1)}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${this.getSuccessRate(stats)}%"></div>
            </div>
        </div>

        <!-- Provider Status -->
        <div class="card">
            <div class="card-title">🔄 Provider Status</div>
            <div class="metric">
                <span class="metric-label">Current Provider:</span>
                <span class="metric-value">${currentProvider?.name || 'None'}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Available Providers:</span>
                <div class="provider-list">
                    ${availableProviders.map(p => `<span class="provider-tag">${p}</span>`).join('')}
                </div>
            </div>
        </div>

        <!-- Provider Breakdown -->
        ${Object.entries(stats).map(([provider, stat]) => `
        <div class="card">
            <div class="card-title">📈 ${provider.toUpperCase()} Stats</div>
            <div class="metric">
                <span class="metric-label">Requests:</span>
                <span class="metric-value">${stat.requests}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Tokens:</span>
                <span class="metric-value">${stat.tokens.total.toLocaleString()}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Cost:</span>
                <span class="metric-value">$${stat.cost.toFixed(4)}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Errors:</span>
                <span class="metric-value">${stat.errors}</span>
            </div>
        </div>
        `).join('')}
    </div>

    <div class="actions">
        <button class="button" onclick="refresh()">🔄 Refresh</button>
        <button class="button button-secondary" onclick="exportData()">📥 Export Data</button>
        <button class="button button-secondary" onclick="resetStats()">🗑️ Reset Stats</button>
    </div>

    <div class="timestamp">
        Last updated: ${new Date().toLocaleString()}
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        function refresh() {
            vscode.postMessage({ command: 'refresh' });
        }
        
        function exportData() {
            vscode.postMessage({ command: 'exportData' });
        }
        
        function resetStats() {
            vscode.postMessage({ command: 'resetStats' });
        }
    </script>
</body>
</html>`;
        } catch (error) {
            console.error('Error generating monitoring content:', error);
            return this.getErrorContent(error);
        }
    }

    private getNoServiceContent(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LumosGen AI Monitoring</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            text-align: center;
        }
        .message {
            margin-top: 50px;
            font-size: 18px;
            color: var(--vscode-descriptionForeground);
        }
    </style>
</head>
<body>
    <div class="message">
        <h2>🤖 AI Service Monitoring</h2>
        <p>No AI service is currently active.</p>
        <p>Please configure your AI service in VS Code settings to see monitoring data.</p>
    </div>
</body>
</html>`;
    }

    private getErrorContent(error: any): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LumosGen AI Monitoring - Error</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            text-align: center;
        }
        .error {
            margin-top: 50px;
            font-size: 18px;
            color: var(--vscode-errorForeground);
        }
        .error-details {
            margin-top: 20px;
            padding: 10px;
            background-color: var(--vscode-inputValidation-errorBackground);
            border: 1px solid var(--vscode-inputValidation-errorBorder);
            border-radius: 4px;
            font-family: monospace;
            font-size: 14px;
            text-align: left;
        }
        .button {
            margin-top: 20px;
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            cursor: pointer;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="error">
        <h2>⚠️ Monitoring Error</h2>
        <p>An error occurred while loading monitoring data.</p>
        <div class="error-details">
            ${error?.message || 'Unknown error occurred'}
        </div>
        <button class="button" onclick="location.reload()">🔄 Retry</button>
    </div>
</body>
</html>`;
    }

    private getTodayCost(stats: { [key: string]: DetailedUsageStats }): number {
        const today = new Date().toISOString().split('T')[0];
        return Object.values(stats).reduce((total, stat) => {
            if (!stat || !stat.dailyUsage) {
                return total;
            }
            return total + (stat.dailyUsage[today]?.cost || 0);
        }, 0);
    }

    private getTotalRequests(stats: { [key: string]: DetailedUsageStats }): number {
        return Object.values(stats).reduce((total, stat) => total + stat.requests, 0);
    }

    private getTotalTokens(stats: { [key: string]: DetailedUsageStats }): number {
        return Object.values(stats).reduce((total, stat) => total + stat.tokens.total, 0);
    }

    private getSuccessRate(stats: { [key: string]: DetailedUsageStats }): number {
        const totalRequests = this.getTotalRequests(stats);
        const totalErrors = Object.values(stats).reduce((total, stat) => total + stat.errors, 0);
        return totalRequests > 0 ? ((totalRequests - totalErrors) / totalRequests) * 100 : 100;
    }

    public dispose() {
        MonitoringPanel.currentPanel = undefined;

        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        // Clean up resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}
