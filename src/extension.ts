import * as vscode from 'vscode';
import { FileWatcher } from './watcher';
import { SidebarProvider } from './ui/SidebarProvider';
// Removed i18n for MVP simplification

let fileWatcher: FileWatcher | undefined;
let outputChannel: vscode.OutputChannel;
let sidebarProvider: SidebarProvider;

export async function activate(context: vscode.ExtensionContext) {
    console.log('LumosGen extension is now active!');

    // Create output channel
    outputChannel = vscode.window.createOutputChannel('LumosGen');
    outputChannel.appendLine('LumosGen extension activated');

    // Configuration is now handled by SimpleConfig

    // Create sidebar provider
    sidebarProvider = new SidebarProvider(context.extensionUri, outputChannel);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(SidebarProvider.viewType, sidebarProvider)
    );

    // Create file watcher (legacy functionality)
    fileWatcher = new FileWatcher(outputChannel);
    
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
            outputChannel.appendLine('Generating marketing content...');
            // This will be implemented in Sprint 2
            vscode.window.showInformationMessage('Marketing content generation will be available in Sprint 2');
        } catch (error) {
            outputChannel.appendLine(`ERROR in content generation: ${error}`);
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

    // Legacy commands (keep for backward compatibility)
    const generateCommand = vscode.commands.registerCommand('lumosGen.generateContent', async () => {
        try {
            outputChannel.show();
            outputChannel.appendLine('Manual content generation triggered by user');
            await fileWatcher?.manualGeneration();
        } catch (error) {
            outputChannel.appendLine(`ERROR in manual generation: ${error}`);
            vscode.window.showErrorMessage(`LumosGen: ${error}`);
        }
    });

    const toggleWatcherCommand = vscode.commands.registerCommand('lumosGen.toggleWatcher', () => {
        fileWatcher?.toggle();
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

            // Check write permissions
            if (fileWatcher) {
                const writer = (fileWatcher as any).writer;
                if (writer) {
                    const hasPermissions = await writer.checkWritePermissions();
                    outputChannel.appendLine(`Write permissions: ${hasPermissions ? 'OK' : 'FAILED'}`);
                }
            }

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
            outputChannel.appendLine('Configuration changed, reloading...');

            // Restart file watcher with new configuration
            fileWatcher?.stop();
            fileWatcher?.start();
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
    
    // Start file watcher
    fileWatcher.start().catch(error => {
        outputChannel.appendLine(`Failed to start file watcher: ${error}`);
        vscode.window.showErrorMessage(`LumosGen: Failed to start - ${error}`);
    });
    
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
    
    if (fileWatcher) {
        fileWatcher.stop();
        fileWatcher = undefined;
    }
    
    if (outputChannel) {
        outputChannel.appendLine('LumosGen extension deactivated');
        outputChannel.dispose();
    }
}
