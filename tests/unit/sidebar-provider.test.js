/**
 * SidebarProvider Unit Tests
 * 
 * Comprehensive testing of VS Code sidebar functionality including
 * webview management, user interactions, theme switching, and agent integration.
 */

const { TestUtils, TestAssertions } = require('../test-config');

// Mock VS Code API
const mockWebviewView = {
    webview: {
        html: '',
        options: {},
        onDidReceiveMessage: jest.fn(),
        postMessage: jest.fn()
    },
    viewType: 'lumosgen.sidebar'
};

const mockWindow = {
    showInformationMessage: jest.fn(),
    showErrorMessage: jest.fn(),
    showWarningMessage: jest.fn()
};

const mockCommands = {
    executeCommand: jest.fn()
};

const mockWorkspace = {
    workspaceFolders: [{
        uri: { fsPath: '/test/workspace' }
    }]
};

const mockVscode = {
    window: mockWindow,
    commands: mockCommands,
    workspace: mockWorkspace,
    WebviewViewResolveContext: {},
    CancellationToken: {}
};

// Mock dependencies
const mockOutputChannel = {
    appendLine: jest.fn(),
    show: jest.fn()
};

const mockAgentManager = {
    generateContentWithPath: jest.fn(),
    on: jest.fn(),
    emit: jest.fn()
};

const mockWebsiteBuilder = {
    getAvailableThemes: jest.fn(() => ['modern', 'classic', 'minimal']),
    getThemeMetadata: jest.fn((theme) => ({
        name: theme.charAt(0).toUpperCase() + theme.slice(1),
        description: `${theme} theme description`,
        features: ['responsive']
    }))
};

const mockDeployer = {
    deploy: jest.fn(),
    onStatusChange: jest.fn()
};

const mockDeploymentMonitor = {
    startMonitoring: jest.fn(),
    stopMonitoring: jest.fn()
};

// Mock constructors
jest.mock('../../out/deployment/GitHubPagesDeployer', () => {
    return jest.fn().mockImplementation(() => mockDeployer);
});

jest.mock('../../out/deployment/DeploymentMonitor', () => {
    return jest.fn().mockImplementation(() => mockDeploymentMonitor);
});

jest.mock('../../out/website/WebsiteBuilder', () => {
    return jest.fn().mockImplementation(() => mockWebsiteBuilder);
});

// Mock vscode module
jest.mock('vscode', () => mockVscode, { virtual: true });

const sidebarProviderTests = {
    async setup() {
        console.log('🔧 Setting up SidebarProvider tests...');
        
        // Reset all mocks
        jest.clearAllMocks();
        
        // Import SidebarProvider after mocking
        const { SidebarProvider } = require('../../out/ui/SidebarProvider');
        this.SidebarProvider = SidebarProvider;
        
        this.extensionUri = { fsPath: '/test/extension' };
        this.sidebarProvider = new SidebarProvider(
            this.extensionUri,
            mockOutputChannel,
            mockAgentManager
        );
    },

    async testSidebarInitialization() {
        console.log('🧪 Testing sidebar initialization...');
        
        TestAssertions.assertEqual(
            this.sidebarProvider.constructor.viewType,
            'lumosgen.sidebar',
            'Should have correct view type'
        );
        
        // Verify dependencies were initialized
        TestAssertions.assertTrue(
            mockOutputChannel.appendLine.mock.calls.length > 0,
            'Should log initialization messages'
        );
        
        // Check if agent event listeners were set up
        if (mockAgentManager) {
            TestAssertions.assertTrue(
                mockAgentManager.on.mock.calls.length > 0,
                'Should set up agent event listeners'
            );
        }
    },

    async testWebviewViewResolve() {
        console.log('🧪 Testing webview view resolution...');
        
        const context = {};
        const token = {};
        
        this.sidebarProvider.resolveWebviewView(mockWebviewView, context, token);
        
        // Verify webview options were set
        TestAssertions.assertTrue(
            mockWebviewView.webview.options.enableScripts,
            'Should enable scripts in webview'
        );
        
        TestAssertions.assertTrue(
            Array.isArray(mockWebviewView.webview.options.localResourceRoots),
            'Should set local resource roots'
        );
        
        // Verify HTML content was set
        TestAssertions.assertTrue(
            mockWebviewView.webview.html.length > 0,
            'Should set HTML content'
        );
        
        TestAssertions.assertContains(
            mockWebviewView.webview.html,
            'LumosGen',
            'Should contain LumosGen branding'
        );
        
        // Verify message handler was registered
        TestAssertions.assertTrue(
            mockWebviewView.webview.onDidReceiveMessage.mock.calls.length > 0,
            'Should register message handler'
        );
    },

    async testMessageHandling() {
        console.log('🧪 Testing webview message handling...');
        
        this.sidebarProvider.resolveWebviewView(mockWebviewView, {}, {});
        
        // Get the message handler
        const messageHandler = mockWebviewView.webview.onDidReceiveMessage.mock.calls[0][0];
        
        TestAssertions.assertTrue(
            typeof messageHandler === 'function',
            'Should register message handler function'
        );
        
        // Test generateContent message
        jest.clearAllMocks();
        mockAgentManager.generateContentWithPath.mockResolvedValue({
            success: true,
            data: { content: 'Generated content' }
        });
        
        await messageHandler({ type: 'generateContent' });
        
        TestAssertions.assertTrue(
            mockAgentManager.generateContentWithPath.mock.calls.length > 0,
            'Should call agent manager for content generation'
        );
        
        // Test openSettings message
        jest.clearAllMocks();
        await messageHandler({ type: 'openSettings' });
        
        TestAssertions.assertTrue(
            mockCommands.executeCommand.mock.calls.length > 0,
            'Should execute settings command'
        );
        
        const commandCall = mockCommands.executeCommand.mock.calls[0];
        TestAssertions.assertEqual(
            commandCall[0],
            'workbench.action.openSettings',
            'Should open correct settings page'
        );
        TestAssertions.assertEqual(
            commandCall[1],
            'lumosGen',
            'Should open LumosGen settings'
        );
    },

    async testThemeManagement() {
        console.log('🧪 Testing theme management...');
        
        this.sidebarProvider.resolveWebviewView(mockWebviewView, {}, {});
        const messageHandler = mockWebviewView.webview.onDidReceiveMessage.mock.calls[0][0];
        
        // Test theme change
        jest.clearAllMocks();
        await messageHandler({ type: 'changeTheme', theme: 'classic' });
        
        // Should show theme change confirmation
        TestAssertions.assertTrue(
            mockWindow.showInformationMessage.mock.calls.length > 0,
            'Should show theme change confirmation'
        );
        
        // Should post message to webview
        TestAssertions.assertTrue(
            mockWebviewView.webview.postMessage.mock.calls.length > 0,
            'Should post theme change message to webview'
        );
        
        const postMessageCall = mockWebviewView.webview.postMessage.mock.calls[0];
        TestAssertions.assertEqual(
            postMessageCall[0].type,
            'themeChanged',
            'Should send theme changed message'
        );
        
        // Test get themes
        jest.clearAllMocks();
        await messageHandler({ type: 'getThemes' });
        
        TestAssertions.assertTrue(
            mockWebsiteBuilder.getAvailableThemes.mock.calls.length > 0,
            'Should get available themes'
        );
        
        TestAssertions.assertTrue(
            mockWebsiteBuilder.getThemeMetadata.mock.calls.length > 0,
            'Should get theme metadata'
        );
    },

    async testContentGeneration() {
        console.log('🧪 Testing content generation workflow...');
        
        this.sidebarProvider.resolveWebviewView(mockWebviewView, {}, {});
        const messageHandler = mockWebviewView.webview.onDidReceiveMessage.mock.calls[0][0];
        
        // Test successful content generation
        mockAgentManager.generateContentWithPath.mockResolvedValue({
            success: true,
            data: {
                content: 'Generated marketing content',
                metadata: { wordCount: 500 }
            }
        });
        
        await messageHandler({ type: 'generateContent' });
        
        TestAssertions.assertTrue(
            mockAgentManager.generateContentWithPath.mock.calls.length > 0,
            'Should call agent manager'
        );
        
        const generateCall = mockAgentManager.generateContentWithPath.mock.calls[0];
        TestAssertions.assertEqual(
            generateCall[0],
            'homepage',
            'Should generate homepage content'
        );
        TestAssertions.assertEqual(
            generateCall[1],
            '/test/workspace',
            'Should use correct workspace path'
        );
        
        // Should show success message
        TestAssertions.assertTrue(
            mockWindow.showInformationMessage.mock.calls.length > 0,
            'Should show success message'
        );
        
        // Test failed content generation
        jest.clearAllMocks();
        mockAgentManager.generateContentWithPath.mockResolvedValue({
            success: false,
            error: 'Generation failed'
        });
        
        await messageHandler({ type: 'generateContent' });
        
        TestAssertions.assertTrue(
            mockWindow.showErrorMessage.mock.calls.length > 0,
            'Should show error message on failure'
        );
    },

    async testDeploymentWorkflow() {
        console.log('🧪 Testing deployment workflow...');
        
        this.sidebarProvider.resolveWebviewView(mockWebviewView, {}, {});
        const messageHandler = mockWebviewView.webview.onDidReceiveMessage.mock.calls[0][0];
        
        // Mock successful deployment
        mockDeployer.deploy.mockResolvedValue({
            success: true,
            url: 'https://test.github.io',
            branch: 'gh-pages'
        });
        
        await messageHandler({ type: 'deployToGitHub' });
        
        TestAssertions.assertTrue(
            mockDeployer.deploy.mock.calls.length > 0,
            'Should call deployer'
        );
        
        const deployCall = mockDeployer.deploy.mock.calls[0];
        TestAssertions.assertContains(
            deployCall[0],
            'lumosgen-website',
            'Should deploy from correct directory'
        );
        TestAssertions.assertEqual(
            deployCall[1].branch,
            'gh-pages',
            'Should deploy to gh-pages branch'
        );
        
        // Verify status change handler was set up
        TestAssertions.assertTrue(
            mockDeployer.onStatusChange.mock.calls.length > 0,
            'Should set up deployment status monitoring'
        );
    },

    async testAgentStatusUpdates() {
        console.log('🧪 Testing agent status updates...');
        
        this.sidebarProvider.resolveWebviewView(mockWebviewView, {}, {});
        
        // Simulate agent status update
        const statusUpdate = {
            isRunning: true,
            currentTask: 'Analyzing project',
            progress: 50
        };
        
        // Get the agent event handler (if set up)
        if (mockAgentManager.on.mock.calls.length > 0) {
            const eventHandler = mockAgentManager.on.mock.calls.find(
                call => call[0] === 'statusUpdate'
            );
            
            if (eventHandler) {
                const handler = eventHandler[1];
                handler(statusUpdate);
                
                // Should post status update to webview
                TestAssertions.assertTrue(
                    mockWebviewView.webview.postMessage.mock.calls.some(
                        call => call[0].type === 'updateAgentStatus'
                    ),
                    'Should post agent status update to webview'
                );
            }
        }
    },

    async testErrorHandling() {
        console.log('🧪 Testing error handling...');
        
        this.sidebarProvider.resolveWebviewView(mockWebviewView, {}, {});
        const messageHandler = mockWebviewView.webview.onDidReceiveMessage.mock.calls[0][0];
        
        // Test content generation error
        mockAgentManager.generateContentWithPath.mockRejectedValue(
            new Error('Agent system error')
        );
        
        await messageHandler({ type: 'generateContent' });
        
        TestAssertions.assertTrue(
            mockWindow.showErrorMessage.mock.calls.length > 0,
            'Should show error message for agent failures'
        );
        
        // Test deployment error
        jest.clearAllMocks();
        mockDeployer.deploy.mockRejectedValue(new Error('Deployment failed'));
        
        await messageHandler({ type: 'deployToGitHub' });
        
        TestAssertions.assertTrue(
            mockWindow.showErrorMessage.mock.calls.length > 0,
            'Should show error message for deployment failures'
        );
        
        // Test missing workspace error
        jest.clearAllMocks();
        mockWorkspace.workspaceFolders = null;
        
        await messageHandler({ type: 'generateContent' });
        
        TestAssertions.assertTrue(
            mockWindow.showErrorMessage.mock.calls.length > 0,
            'Should show error for missing workspace'
        );
        
        // Restore workspace
        mockWorkspace.workspaceFolders = [{ uri: { fsPath: '/test/workspace' } }];
    },

    async testWorkflowStopping() {
        console.log('🧪 Testing workflow stopping...');
        
        this.sidebarProvider.resolveWebviewView(mockWebviewView, {}, {});
        const messageHandler = mockWebviewView.webview.onDidReceiveMessage.mock.calls[0][0];
        
        // Test stopping agent workflow
        await messageHandler({ type: 'stopAgentWorkflow' });
        
        // Should log the stop action
        TestAssertions.assertTrue(
            mockOutputChannel.appendLine.mock.calls.some(
                call => call[0].includes('stop') || call[0].includes('Stop')
            ),
            'Should log workflow stop action'
        );
    },

    async testHTMLContentGeneration() {
        console.log('🧪 Testing HTML content generation...');
        
        this.sidebarProvider.resolveWebviewView(mockWebviewView, {}, {});
        
        const htmlContent = mockWebviewView.webview.html;
        
        // Test HTML structure
        TestAssertions.assertContains(htmlContent, '<!DOCTYPE html>', 'Should be valid HTML');
        TestAssertions.assertContains(htmlContent, '<html', 'Should have html tag');
        TestAssertions.assertContains(htmlContent, '<head>', 'Should have head section');
        TestAssertions.assertContains(htmlContent, '<body>', 'Should have body section');
        TestAssertions.assertContains(htmlContent, '</html>', 'Should close html tag');
        
        // Test content sections
        TestAssertions.assertContains(htmlContent, 'Generate Content', 'Should have generate button');
        TestAssertions.assertContains(htmlContent, 'Deploy to GitHub', 'Should have deploy button');
        TestAssertions.assertContains(htmlContent, 'Settings', 'Should have settings link');
        
        // Test theme selection
        TestAssertions.assertContains(htmlContent, 'theme-option', 'Should have theme selection');
        TestAssertions.assertContains(htmlContent, 'Modern', 'Should include modern theme');
        TestAssertions.assertContains(htmlContent, 'Classic', 'Should include classic theme');
        
        // Test JavaScript functionality
        TestAssertions.assertContains(htmlContent, 'vscode.postMessage', 'Should have VS Code API calls');
        TestAssertions.assertContains(htmlContent, 'selectTheme', 'Should have theme selection function');
        TestAssertions.assertContains(htmlContent, 'generateContent', 'Should have content generation function');
    },

    async testStatusManagement() {
        console.log('🧪 Testing status management...');
        
        this.sidebarProvider.resolveWebviewView(mockWebviewView, {}, {});
        
        // Test deployment status updates
        const statusHandler = mockDeployer.onStatusChange.mock.calls[0][0];
        
        const deploymentStatus = {
            status: 'deploying',
            message: 'Pushing to GitHub Pages',
            progress: 75
        };
        
        statusHandler(deploymentStatus);
        
        // Should log status update
        TestAssertions.assertTrue(
            mockOutputChannel.appendLine.mock.calls.some(
                call => call[0].includes('Pushing to GitHub Pages')
            ),
            'Should log deployment status'
        );
        
        // Should post status to webview
        TestAssertions.assertTrue(
            mockWebviewView.webview.postMessage.mock.calls.some(
                call => call[0].type === 'deploymentStatus'
            ),
            'Should post deployment status to webview'
        );
    }
};

// Export test suite
module.exports = {
    name: 'SidebarProvider Unit Tests',
    tests: sidebarProviderTests
};

// Run tests if this file is executed directly
if (require.main === module) {
    async function runTests() {
        console.log('🚀 Running SidebarProvider Unit Tests...\n');
        
        try {
            await sidebarProviderTests.setup();
            
            const testMethods = [
                'testSidebarInitialization',
                'testWebviewViewResolve',
                'testMessageHandling',
                'testThemeManagement',
                'testContentGeneration',
                'testDeploymentWorkflow',
                'testAgentStatusUpdates',
                'testErrorHandling',
                'testWorkflowStopping',
                'testHTMLContentGeneration',
                'testStatusManagement'
            ];
            
            let passed = 0;
            let failed = 0;
            
            for (const testMethod of testMethods) {
                try {
                    await sidebarProviderTests[testMethod]();
                    console.log(`✅ ${testMethod} passed`);
                    passed++;
                } catch (error) {
                    console.log(`❌ ${testMethod} failed: ${error.message}`);
                    failed++;
                }
            }
            
            console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
            
        } catch (error) {
            console.error('❌ Test setup failed:', error);
        }
    }
    
    runTests();
}
