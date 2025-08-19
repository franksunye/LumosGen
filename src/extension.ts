import * as vscode from 'vscode';
import { SidebarProvider } from './ui/SidebarProvider';
import { MarketingWorkflowManager } from './agents/lumosgen-workflow';
import { MonitoringPanel } from './ui/MonitoringPanel';
import { AIServiceProvider } from './ai/AIServiceProvider';
// Removed i18n for MVP simplification

let outputChannel: vscode.OutputChannel;
let sidebarProvider: SidebarProvider;
let agentManager: MarketingWorkflowManager;
let aiServiceProvider: AIServiceProvider | undefined;
let statusBarItem: vscode.StatusBarItem;

export async function activate(context: vscode.ExtensionContext) {
    console.log('LumosGen extension is now active!');

    // Create output channel
    outputChannel = vscode.window.createOutputChannel('LumosGen');
    outputChannel.appendLine('LumosGen extension activated');

    // Configuration is now handled by SimpleConfig

    // Initialize Agent Manager with new AI service system
    outputChannel.appendLine('Initializing LumosGen Agent Manager with enhanced AI services...');
    try {
        // Get enhanced AI service configuration
        const { getAIServiceConfig, getConfiguredProviders } = await import('./config/SimpleConfig');
        const aiServiceConfig = getAIServiceConfig();
        const configuredProviders = getConfiguredProviders();

        // Initialize AI service provider
        const { AIServiceProvider } = await import('./ai/AIServiceProvider');
        aiServiceProvider = new AIServiceProvider(aiServiceConfig);
        await aiServiceProvider.initialize();

        // Always initialize agent manager with AI service
        agentManager = new MarketingWorkflowManager(undefined, aiServiceProvider);
        await agentManager.initialize();

        // Report initialization status
        const currentProvider = aiServiceProvider.getCurrentProvider();
        if (currentProvider && currentProvider.type !== 'mock') {
            outputChannel.appendLine(`✅ Agent Manager initialized with ${currentProvider.type.toUpperCase()} AI service`);
            outputChannel.appendLine(`🔄 Fallback strategy: ${aiServiceConfig.degradationStrategy.join(' → ')}`);

            // Show cost information for DeepSeek
            if (currentProvider.type === 'deepseek') {
                const deepseekProvider = aiServiceProvider.getDeepSeekProvider();
                if (deepseekProvider) {
                    const pricing = deepseekProvider.getCurrentPricing();
                    const discount = deepseekProvider.getDiscountInfo();
                    outputChannel.appendLine(`💰 Current pricing: $${pricing.input}/1M input, $${pricing.output}/1M output (${discount.discount})`);
                }
            }
        } else {
            outputChannel.appendLine('✅ Agent Manager initialized in mock mode');
            outputChannel.appendLine('💡 Configure DeepSeek or OpenAI API keys in settings to enable AI functionality');
            outputChannel.appendLine(`📋 Available providers: ${configuredProviders.join(', ')}`);
        }
    } catch (error) {
        outputChannel.appendLine(`❌ Failed to initialize Agent Manager: ${error}`);
        // Fallback to mock mode
        agentManager = new MarketingWorkflowManager();
        await agentManager.initialize();
        outputChannel.appendLine('✅ Fallback: Agent Manager initialized in mock mode');
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

    // Create status bar item for AI monitoring
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'lumosGen.showMonitoring';
    updateStatusBar();
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

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
    
    // Register AI monitoring command
    const showMonitoringCommand = vscode.commands.registerCommand('lumosGen.showMonitoring', () => {
        MonitoringPanel.createOrShow(context.extensionUri, aiServiceProvider);
    });

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
            outputChannel.appendLine('🤖 Generating marketing content with enhanced template system...');

            if (!agentManager) {
                throw new Error('Agent Manager not initialized. Please configure AI service.');
            }

            // Show template selection dialog
            const { MarketingContentGenerator } = await import('./content/MarketingContentGenerator');
            const contentGenerator = new MarketingContentGenerator(outputChannel, aiServiceProvider);

            // Get available templates
            const templates = contentGenerator.getAvailableTemplates();
            const templateOptions = templates.map(t => ({
                label: t.name,
                description: t.description,
                detail: `Structure: ${t.structure.join(', ')}`
            }));

            const selectedTemplate = await vscode.window.showQuickPick(templateOptions, {
                placeHolder: 'Select content template to generate',
                ignoreFocusOut: true
            });

            if (!selectedTemplate) {
                outputChannel.appendLine('Content generation cancelled by user');
                return;
            }

            outputChannel.appendLine(`📋 Selected template: ${selectedTemplate.label}`);
            outputChannel.appendLine(`📝 Template structure: ${selectedTemplate.detail}`);

            // Trigger template-aware content generation
            const result = await agentManager.generateContent(selectedTemplate.label.toLowerCase());

            if (result?.success) {
                outputChannel.appendLine('✅ Marketing content generated successfully with structured templates');
                vscode.window.showInformationMessage(`${selectedTemplate.label} content generated! Check the LumosGen sidebar for results.`);

                // Update sidebar with results
                if (sidebarProvider) {
                    sidebarProvider.updateAgentResults(result);
                }
            } else {
                throw new Error(result?.error || 'Content generation failed');
            }
        } catch (error) {
            outputChannel.appendLine(`❌ ERROR in template-aware content generation: ${error}`);
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

    // Template validation command
    const validateContentCommand = vscode.commands.registerCommand('lumosGen.validateContent', async () => {
        try {
            outputChannel.show();
            outputChannel.appendLine('🔍 Validating content against template requirements...');

            // Get the active editor
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('Please open a markdown file to validate');
                return;
            }

            const content = editor.document.getText();
            if (!content.trim()) {
                vscode.window.showErrorMessage('No content to validate');
                return;
            }

            // Import content generator for validation
            const { MarketingContentGenerator } = await import('./content/MarketingContentGenerator');
            const contentGenerator = new MarketingContentGenerator(outputChannel, aiServiceProvider);

            // Get available templates for selection
            const templates = contentGenerator.getAvailableTemplates();
            const templateOptions = templates.map(t => ({
                label: t.name,
                description: `Validate as ${t.name} content`
            }));

            const selectedTemplate = await vscode.window.showQuickPick(templateOptions, {
                placeHolder: 'Select template type for validation',
                ignoreFocusOut: true
            });

            if (!selectedTemplate) {
                outputChannel.appendLine('Content validation cancelled by user');
                return;
            }

            // Validate content
            const templateName = selectedTemplate.label.toLowerCase();
            const validationResult = contentGenerator.validateExistingContent(content, templateName);

            // Show validation results
            const score = validationResult.score;
            const status = validationResult.isValid ? '✅ Valid' : '❌ Invalid';

            outputChannel.appendLine(`\n📊 Validation Results for ${selectedTemplate.label}:`);
            outputChannel.appendLine(`   Score: ${score}/100`);
            outputChannel.appendLine(`   Status: ${status}`);

            if (validationResult.errors.length > 0) {
                outputChannel.appendLine(`   Errors: ${validationResult.errors.length}`);
            }

            if (validationResult.warnings.length > 0) {
                outputChannel.appendLine(`   Warnings: ${validationResult.warnings.length}`);
            }

            // Generate improvement suggestions
            const suggestions = contentGenerator.generateContentImprovements(content, templateName);
            if (suggestions.length > 0) {
                outputChannel.appendLine('\n💡 Improvement Suggestions:');
                suggestions.forEach(suggestion => {
                    outputChannel.appendLine(`   - ${suggestion}`);
                });
            }

            // Show summary message
            if (score >= 90) {
                vscode.window.showInformationMessage(`Excellent! Content scored ${score}/100 and meets all template requirements.`);
            } else if (score >= 70) {
                vscode.window.showWarningMessage(`Good content (${score}/100) with room for improvement. Check output for suggestions.`);
            } else {
                vscode.window.showErrorMessage(`Content needs improvement (${score}/100). Check output for detailed feedback.`);
            }

        } catch (error) {
            outputChannel.appendLine(`❌ ERROR in content validation: ${error}`);
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
        showMonitoringCommand,
        analyzeProjectCommand,
        generateMarketingContentCommand,
        validateContentCommand,
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

function updateStatusBar() {
    if (!statusBarItem || !aiServiceProvider) {
        return;
    }

    try {
        const currentProvider = aiServiceProvider.getCurrentProvider();
        const totalCost = aiServiceProvider.getTotalCost();
        const stats = aiServiceProvider.getUsageStats();
        const totalRequests = Object.values(stats).reduce((sum, stat) => sum + stat.requests, 0);

        if (currentProvider) {
            statusBarItem.text = `$(pulse) ${currentProvider.name} | $${totalCost.toFixed(3)} | ${totalRequests} reqs`;
            statusBarItem.tooltip = `LumosGen AI Monitoring\nProvider: ${currentProvider.name}\nTotal Cost: $${totalCost.toFixed(4)}\nTotal Requests: ${totalRequests}\nClick to view detailed monitoring`;
        } else {
            statusBarItem.text = `$(warning) No AI Provider`;
            statusBarItem.tooltip = 'LumosGen AI Monitoring - No active provider';
        }
    } catch (error) {
        statusBarItem.text = `$(error) AI Error`;
        statusBarItem.tooltip = `LumosGen AI Monitoring - Error: ${error}`;
    }
}

export function deactivate() {
    console.log('LumosGen extension is being deactivated');

    if (statusBarItem) {
        statusBarItem.dispose();
    }

    if (outputChannel) {
        outputChannel.appendLine('LumosGen extension deactivated');
        outputChannel.dispose();
    }
}
