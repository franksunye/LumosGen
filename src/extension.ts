import * as vscode from 'vscode';
import { FileWatcher } from './watcher';
import { ConfigManager } from './config';

let fileWatcher: FileWatcher | undefined;
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
    console.log('LumosGen extension is now active!');
    
    // Create output channel
    outputChannel = vscode.window.createOutputChannel('LumosGen');
    outputChannel.appendLine('LumosGen extension activated');
    
    // Initialize configuration manager
    const configManager = ConfigManager.getInstance();
    
    // Create file watcher
    fileWatcher = new FileWatcher(outputChannel);
    
    // Register commands
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
            const config = configManager.getConfig();
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
            configManager.reloadConfig();
            
            // Restart file watcher with new configuration
            fileWatcher?.stop();
            fileWatcher?.start();
        }
    });
    
    // Add to subscriptions for proper cleanup
    context.subscriptions.push(
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
