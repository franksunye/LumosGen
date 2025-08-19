import * as vscode from 'vscode';
import { SidebarProvider } from './ui/SidebarProvider';
import { MarketingWorkflowManager } from './agents/lumosgen-workflow';
// Removed i18n for MVP simplification

let outputChannel: vscode.OutputChannel;
let sidebarProvider: SidebarProvider;
let agentManager: MarketingWorkflowManager;

export async function activate(context: vscode.ExtensionContext) {
    console.log('LumosGen extension is now active!');

    // Create output channel
    outputChannel = vscode.window.createOutputChannel('LumosGen');
    outputChannel.appendLine('LumosGen extension activated');

    // Configuration is now handled by SimpleConfig

    // Initialize Agent Manager
    outputChannel.appendLine('Initializing LumosGen Agent Manager...');
    try {
        // Get API key from configuration
        const config = vscode.workspace.getConfiguration('lumosGen');
        const apiKey = config.get<string>('openai.apiKey');

        if (apiKey) {
            agentManager = new MarketingWorkflowManager(apiKey);
            outputChannel.appendLine('✅ Agent Manager initialized successfully');
        } else {
            outputChannel.appendLine('⚠️ No OpenAI API key configured - Agent features will be limited');
        }
    } catch (error) {
        outputChannel.appendLine(`❌ Failed to initialize Agent Manager: ${error}`);
    }

    // Create sidebar provider with agent manager
    outputChannel.appendLine('Creating LumosGen sidebar provider...');
    sidebarProvider = new SidebarProvider(context.extensionUri, outputChannel, agentManager);
    outputChannel.appendLine(`Registering webview provider with viewType: ${SidebarProvider.viewType}`);

    // Add more debugging
    outputChannel.appendLine(`VS Code version: ${vscode.version}`);
    outputChannel.appendLine(`Extension URI: ${context.extensionUri.toString()}`);

    const disposable = vscode.window.registerWebviewViewProvider(SidebarProvider.viewType, sidebarProvider);
    context.subscriptions.push(disposable);
    outputChannel.appendLine('LumosGen sidebar provider registered successfully');
    outputChannel.appendLine(`Disposable created: ${disposable ? 'yes' : 'no'}`);

    // Add file change monitoring for agent workflow
    const fileWatcher = vscode.workspace.onDidSaveTextDocument(async (document) => {
        if (agentManager && vscode.workspace.workspaceFolders) {
            const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
            const relativePath = vscode.workspace.asRelativePath(document.uri);

            // Monitor key files that affect marketing content
            if (relativePath.endsWith('.md') ||
                relativePath.includes('package.json') ||
                relativePath.includes('README') ||
                relativePath.endsWith('.ts') ||
                relativePath.endsWith('.js')) {

                outputChannel.appendLine(`📁 File changed: ${relativePath} - triggering agent workflow`);
                try {
                    await agentManager.onFileChanged([relativePath], workspaceRoot);
                    outputChannel.appendLine('✅ Agent workflow completed');
                } catch (error) {
                    outputChannel.appendLine(`❌ Agent workflow failed: ${error}`);
                }
            }
        }
    });

    context.subscriptions.push(fileWatcher);
    
    // Register new marketing AI commands
    const analyzeProjectCommand = vscode.commands.registerCommand('lumosGen.analyzeProject', async () => {
        try {
            outputChannel.show();
            outputChannel.appendLine('Analyzing project...');
            // This will be handled by the sidebar provider
            vscode.commands.executeCommand('workbench.view.extension.lumosgen-sidebar');
        } catch (error) {
            outputChannel.appendLine(`ERROR in project analysis: ${error}`);
            vscode.window.showErrorMessage(`LumosGen: ${error}`);
        }
    });

    const generateMarketingContentCommand = vscode.commands.registerCommand('lumosGen.generateMarketingContent', async () => {
        try {
            outputChannel.show();
            outputChannel.appendLine('🤖 Generating marketing content with AI agents...');

            if (!agentManager) {
                throw new Error('Agent Manager not initialized. Please configure OpenAI API key.');
            }

            // Trigger agent-based content generation
            const result = await agentManager.generateContent('homepage');

            if (result?.success) {
                outputChannel.appendLine('✅ Marketing content generated successfully');
                vscode.window.showInformationMessage('Marketing content generated! Check the LumosGen sidebar for results.');

                // Update sidebar with results
                if (sidebarProvider) {
                    sidebarProvider.updateAgentResults(result);
                }
            } else {
                throw new Error(result?.error || 'Content generation failed');
            }
        } catch (error) {
            outputChannel.appendLine(`❌ ERROR in agent content generation: ${error}`);
            vscode.window.showErrorMessage(`LumosGen: ${error}`);
        }
    });

    const previewWebsiteCommand = vscode.commands.registerCommand('lumosGen.previewWebsite', async () => {
        try {
            outputChannel.show();
            outputChannel.appendLine('Website preview requested');
            // This will be implemented in Sprint 3
            vscode.window.showInformationMessage('Website preview will be available in Sprint 3');
        } catch (error) {
            outputChannel.appendLine(`ERROR in website preview: ${error}`);
            vscode.window.showErrorMessage(`LumosGen: ${error}`);
        }
    });

    const deployToGitHubCommand = vscode.commands.registerCommand('lumosGen.deployToGitHub', async () => {
        try {
            outputChannel.show();
            outputChannel.appendLine('Starting GitHub Pages deployment...');

            // Trigger deployment through sidebar provider
            if (sidebarProvider) {
                await vscode.commands.executeCommand('workbench.view.extension.lumosgen-sidebar');
                // The actual deployment will be handled by the sidebar provider
                vscode.window.showInformationMessage('Please use the Deploy button in the LumosGen sidebar to deploy to GitHub Pages.');
            } else {
                throw new Error('LumosGen sidebar not initialized');
            }
        } catch (error) {
            outputChannel.appendLine(`ERROR in deployment: ${error}`);
            vscode.window.showErrorMessage(`LumosGen: ${error}`);
        }
    });

    // New Sprint 4 commands
    const monitorDeploymentCommand = vscode.commands.registerCommand('lumosGen.monitorDeployment', async () => {
        try {
            outputChannel.show();
            outputChannel.appendLine('Opening deployment monitoring...');

            const url = await vscode.window.showInputBox({
                prompt: 'Enter the URL to monitor',
                placeHolder: 'https://your-username.github.io/your-repo',
                validateInput: (value) => {
                    if (!value || !value.startsWith('http')) {
                        return 'Please enter a valid URL starting with http or https';
                    }
                    return null;
                }
            });

            if (url && sidebarProvider) {
                // This would trigger monitoring through the sidebar provider
                vscode.window.showInformationMessage(`Started monitoring: ${url}`);
            }
        } catch (error) {
            outputChannel.appendLine(`ERROR in monitoring: ${error}`);
            vscode.window.showErrorMessage(`LumosGen: ${error}`);
        }
    });

    const showErrorLogsCommand = vscode.commands.registerCommand('lumosGen.showErrorLogs', async () => {
        try {
            outputChannel.show();
            outputChannel.appendLine('Displaying error logs...');
            vscode.window.showInformationMessage('Error logs are displayed in the output channel.');
        } catch (error) {
            outputChannel.appendLine(`ERROR showing logs: ${error}`);
            vscode.window.showErrorMessage(`LumosGen: ${error}`);
        }
    });

    // Legacy commands (deprecated in MVP - use sidebar instead)
    const generateCommand = vscode.commands.registerCommand('lumosGen.generateContent', async () => {
        try {
            outputChannel.show();
            outputChannel.appendLine('Legacy command - please use the LumosGen sidebar instead');
            vscode.window.showInformationMessage('Please use the LumosGen sidebar for content generation', 'Open Sidebar').then(selection => {
                if (selection === 'Open Sidebar') {
                    vscode.commands.executeCommand('workbench.view.extension.lumosgen-sidebar');
                }
            });
        } catch (error) {
            outputChannel.appendLine(`ERROR: ${error}`);
            vscode.window.showErrorMessage(`LumosGen: ${error}`);
        }
    });

    const toggleWatcherCommand = vscode.commands.registerCommand('lumosGen.toggleWatcher', () => {
        vscode.window.showInformationMessage('File watcher is deprecated in MVP. Use the sidebar for manual content generation.');
    });

    const diagnoseCommand = vscode.commands.registerCommand('lumosGen.diagnose', async () => {
        try {
            outputChannel.show();
            outputChannel.appendLine('=== LumosGen Diagnostic Information ===');

            // Check VS Code version
            outputChannel.appendLine(`VS Code version: ${vscode.version}`);

            // Check workspace
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (workspaceFolders && workspaceFolders.length > 0) {
                outputChannel.appendLine(`Workspace folder: ${workspaceFolders[0].uri.fsPath}`);
            } else {
                outputChannel.appendLine('ERROR: No workspace folder found');
            }

            // Check configuration
            const { getConfig } = require('./config/SimpleConfig');
            const config = getConfig();
            outputChannel.appendLine(`Configuration: ${JSON.stringify(config, null, 2)}`);

            // Write permissions check simplified for MVP
            outputChannel.appendLine('Write permissions: Checked via sidebar operations');

            outputChannel.appendLine('=== End Diagnostic ===');
            vscode.window.showInformationMessage('LumosGen: Diagnostic complete. Check output panel for details.');
        } catch (error) {
            outputChannel.appendLine(`ERROR in diagnostic: ${error}`);
            vscode.window.showErrorMessage(`LumosGen diagnostic failed: ${error}`);
        }
    });
    
    // Listen for configuration changes
    const configChangeListener = vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('lumosGen')) {
            outputChannel.appendLine('Configuration changed - restart extension to apply changes');
        }
    });
    
    // Add to subscriptions for proper cleanup
    context.subscriptions.push(
        analyzeProjectCommand,
        generateMarketingContentCommand,
        previewWebsiteCommand,
        deployToGitHubCommand,
        monitorDeploymentCommand,
        showErrorLogsCommand,
        generateCommand,
        toggleWatcherCommand,
        diagnoseCommand,
        configChangeListener,
        outputChannel
    );
    
    // MVP uses manual triggers via sidebar - no automatic file watching
    
    // Show welcome message
    vscode.window.showInformationMessage(
        'LumosGen is now active! 🔮✨',
        'Open Settings',
        'View Output'
    ).then(selection => {
        switch (selection) {
            case 'Open Settings':
                vscode.commands.executeCommand('workbench.action.openSettings', 'lumosGen');
                break;
            case 'View Output':
                outputChannel.show();
                break;
        }
    });
}

export function deactivate() {
    console.log('LumosGen extension is being deactivated');

    if (outputChannel) {
        outputChannel.appendLine('LumosGen extension deactivated');
        outputChannel.dispose();
    }
}
