/**
 * MonitoringPanel Unit Tests
 * 
 * Comprehensive testing of AI monitoring panel functionality including
 * webview creation, data updates, export functionality, and user interactions.
 */

const { TestUtils, TestAssertions } = require('../test-config');

// Mock VS Code API
const mockWebviewPanel = {
    reveal: jest.fn(),
    dispose: jest.fn(),
    onDidDispose: jest.fn(),
    webview: {
        html: '',
        onDidReceiveMessage: jest.fn(),
        postMessage: jest.fn()
    }
};

const mockWindow = {
    createWebviewPanel: jest.fn(() => mockWebviewPanel),
    showWarningMessage: jest.fn(),
    showInformationMessage: jest.fn(),
    showErrorMessage: jest.fn(),
    showSaveDialog: jest.fn(),
    activeTextEditor: null
};

const mockWorkspace = {
    fs: {
        writeFile: jest.fn()
    }
};

const mockUri = {
    file: jest.fn((path) => ({ fsPath: path })),
    joinPath: jest.fn(() => ({}))
};

const mockVscode = {
    window: mockWindow,
    workspace: mockWorkspace,
    Uri: mockUri,
    ViewColumn: { One: 1 }
};

// Mock AI Service Provider
const mockAIServiceProvider = {
    getUsageStats: jest.fn(() => ({
        deepseek: {
            requests: 10,
            tokens: { total: 5000, input: 3000, output: 2000 },
            cost: 0.05,
            errors: 1
        },
        openai: {
            requests: 5,
            tokens: { total: 2000, input: 1200, output: 800 },
            cost: 0.20,
            errors: 0
        }
    })),
    getTotalCost: jest.fn(() => 0.25),
    getCurrentProvider: jest.fn(() => ({ name: 'DeepSeek' })),
    getAvailableProviders: jest.fn(() => ['deepseek', 'openai', 'mock']),
    healthCheck: jest.fn(() => Promise.resolve({ status: 'healthy', providers: ['deepseek', 'openai'] }))
};

// Mock vscode module
jest.mock('vscode', () => mockVscode, { virtual: true });

const monitoringPanelTests = {
    async setup() {
        console.log('🔧 Setting up MonitoringPanel tests...');
        
        // Reset all mocks
        jest.clearAllMocks();
        
        // Import MonitoringPanel after mocking
        const { MonitoringPanel } = require('../../out/ui/MonitoringPanel');
        this.MonitoringPanel = MonitoringPanel;
        this.extensionUri = { fsPath: '/test/extension' };
    },

    async testPanelCreation() {
        console.log('🧪 Testing monitoring panel creation...');
        
        // Test creating new panel
        this.MonitoringPanel.createOrShow(this.extensionUri, mockAIServiceProvider);
        
        TestAssertions.assertTrue(
            mockWindow.createWebviewPanel.mock.calls.length > 0,
            'Should create webview panel'
        );
        
        const createCall = mockWindow.createWebviewPanel.mock.calls[0];
        TestAssertions.assertEqual(createCall[0], 'lumosGenMonitoring', 'Should use correct view type');
        TestAssertions.assertEqual(createCall[1], 'LumosGen AI Monitoring', 'Should use correct title');
        
        // Test showing existing panel
        jest.clearAllMocks();
        this.MonitoringPanel.createOrShow(this.extensionUri, mockAIServiceProvider);
        
        TestAssertions.assertTrue(
            mockWebviewPanel.reveal.mock.calls.length > 0,
            'Should reveal existing panel instead of creating new one'
        );
        
        TestAssertions.assertEqual(
            mockWindow.createWebviewPanel.mock.calls.length,
            0,
            'Should not create new panel when one exists'
        );
    },

    async testWebviewContentGeneration() {
        console.log('🧪 Testing webview content generation...');
        
        this.MonitoringPanel.createOrShow(this.extensionUri, mockAIServiceProvider);
        
        // Get the generated HTML content
        const htmlContent = mockWebviewPanel.webview.html;
        
        TestAssertions.assertTrue(htmlContent.length > 0, 'Should generate HTML content');
        TestAssertions.assertContains(htmlContent, '<!DOCTYPE html>', 'Should be valid HTML');
        TestAssertions.assertContains(htmlContent, 'LumosGen AI Monitoring', 'Should contain title');
        TestAssertions.assertContains(htmlContent, 'Cost Overview', 'Should contain cost section');
        TestAssertions.assertContains(htmlContent, 'Usage Statistics', 'Should contain usage section');
        TestAssertions.assertContains(htmlContent, 'Provider Status', 'Should contain provider section');
    },

    async testDataDisplayAccuracy() {
        console.log('🧪 Testing data display accuracy...');
        
        this.MonitoringPanel.createOrShow(this.extensionUri, mockAIServiceProvider);
        
        const htmlContent = mockWebviewPanel.webview.html;
        
        // Check if usage stats are displayed correctly
        TestAssertions.assertContains(htmlContent, '$0.2500', 'Should display total cost');
        TestAssertions.assertContains(htmlContent, 'DeepSeek', 'Should display current provider');
        TestAssertions.assertContains(htmlContent, '15', 'Should display total requests (10+5)');
        TestAssertions.assertContains(htmlContent, '7,000', 'Should display total tokens (5000+2000)');
        
        // Check provider-specific data
        TestAssertions.assertContains(htmlContent, 'DEEPSEEK Stats', 'Should show DeepSeek stats');
        TestAssertions.assertContains(htmlContent, 'OPENAI Stats', 'Should show OpenAI stats');
    },

    async testNoServiceContent() {
        console.log('🧪 Testing no service content...');
        
        // Create panel without AI service
        this.MonitoringPanel.createOrShow(this.extensionUri);
        
        const htmlContent = mockWebviewPanel.webview.html;
        
        TestAssertions.assertContains(htmlContent, 'No AI service is currently active', 'Should show no service message');
        TestAssertions.assertContains(htmlContent, 'configure your AI service', 'Should show configuration hint');
    },

    async testMessageHandling() {
        console.log('🧪 Testing webview message handling...');
        
        this.MonitoringPanel.createOrShow(this.extensionUri, mockAIServiceProvider);
        
        // Get the message handler
        const messageHandler = mockWebviewPanel.webview.onDidReceiveMessage.mock.calls[0][0];
        
        TestAssertions.assertTrue(
            typeof messageHandler === 'function',
            'Should register message handler'
        );
        
        // Test refresh command
        jest.clearAllMocks();
        await messageHandler({ command: 'refresh' });
        
        // Should update content (verify by checking if AI service methods were called)
        TestAssertions.assertTrue(
            mockAIServiceProvider.getUsageStats.mock.calls.length > 0,
            'Should call getUsageStats on refresh'
        );
    },

    async testDataExport() {
        console.log('🧪 Testing data export functionality...');
        
        this.MonitoringPanel.createOrShow(this.extensionUri, mockAIServiceProvider);
        
        // Mock save dialog
        const mockUri = { fsPath: '/test/export.json' };
        mockWindow.showSaveDialog.mockResolvedValue(mockUri);
        mockWorkspace.fs.writeFile.mockResolvedValue();
        
        // Get the message handler and trigger export
        const messageHandler = mockWebviewPanel.webview.onDidReceiveMessage.mock.calls[0][0];
        await messageHandler({ command: 'exportData' });
        
        // Verify save dialog was shown
        TestAssertions.assertTrue(
            mockWindow.showSaveDialog.mock.calls.length > 0,
            'Should show save dialog'
        );
        
        // Verify file was written
        TestAssertions.assertTrue(
            mockWorkspace.fs.writeFile.mock.calls.length > 0,
            'Should write export file'
        );
        
        // Check export data structure
        const writeCall = mockWorkspace.fs.writeFile.mock.calls[0];
        const exportData = JSON.parse(writeCall[1].toString());
        
        TestAssertions.assertTrue(exportData.timestamp, 'Should include timestamp');
        TestAssertions.assertTrue(exportData.stats, 'Should include stats');
        TestAssertions.assertTrue(exportData.health, 'Should include health check');
        TestAssertions.assertEqual(exportData.totalCost, 0.25, 'Should include total cost');
    },

    async testStatisticsReset() {
        console.log('🧪 Testing statistics reset functionality...');
        
        this.MonitoringPanel.createOrShow(this.extensionUri, mockAIServiceProvider);
        
        // Mock confirmation dialog
        mockWindow.showWarningMessage.mockResolvedValue('Reset');
        
        // Get the message handler and trigger reset
        const messageHandler = mockWebviewPanel.webview.onDidReceiveMessage.mock.calls[0][0];
        await messageHandler({ command: 'resetStats' });
        
        // Verify confirmation dialog was shown
        TestAssertions.assertTrue(
            mockWindow.showWarningMessage.mock.calls.length > 0,
            'Should show confirmation dialog'
        );
        
        const warningCall = mockWindow.showWarningMessage.mock.calls[0];
        TestAssertions.assertContains(
            warningCall[0],
            'Reset all monitoring statistics',
            'Should show reset confirmation message'
        );
    },

    async testAutoRefresh() {
        console.log('🧪 Testing auto-refresh functionality...');
        
        // Mock timers
        jest.useFakeTimers();
        
        this.MonitoringPanel.createOrShow(this.extensionUri, mockAIServiceProvider);
        
        // Clear initial calls
        jest.clearAllMocks();
        
        // Fast-forward time to trigger auto-refresh
        jest.advanceTimersByTime(5000);
        
        // Should have called getUsageStats for auto-refresh
        TestAssertions.assertTrue(
            mockAIServiceProvider.getUsageStats.mock.calls.length > 0,
            'Should auto-refresh every 5 seconds'
        );
        
        // Restore real timers
        jest.useRealTimers();
    },

    async testPanelDisposal() {
        console.log('🧪 Testing panel disposal...');
        
        this.MonitoringPanel.createOrShow(this.extensionUri, mockAIServiceProvider);
        
        // Get the disposal handler
        const disposalHandler = mockWebviewPanel.onDidDispose.mock.calls[0][0];
        
        TestAssertions.assertTrue(
            typeof disposalHandler === 'function',
            'Should register disposal handler'
        );
        
        // Trigger disposal
        disposalHandler();
        
        // Verify cleanup
        TestAssertions.assertTrue(
            mockWebviewPanel.dispose.mock.calls.length > 0,
            'Should dispose webview panel'
        );
    },

    async testErrorHandling() {
        console.log('🧪 Testing error handling...');
        
        // Test export error handling
        mockAIServiceProvider.getUsageStats.mockImplementation(() => {
            throw new Error('Test error');
        });
        
        this.MonitoringPanel.createOrShow(this.extensionUri, mockAIServiceProvider);
        
        const messageHandler = mockWebviewPanel.webview.onDidReceiveMessage.mock.calls[0][0];
        await messageHandler({ command: 'exportData' });
        
        // Should show error message
        TestAssertions.assertTrue(
            mockWindow.showErrorMessage.mock.calls.length > 0,
            'Should show error message on export failure'
        );
        
        // Restore normal behavior
        mockAIServiceProvider.getUsageStats.mockImplementation(() => ({
            deepseek: { requests: 10, tokens: { total: 5000 }, cost: 0.05, errors: 1 }
        }));
    },

    async testCalculationMethods() {
        console.log('🧪 Testing calculation methods...');
        
        this.MonitoringPanel.createOrShow(this.extensionUri, mockAIServiceProvider);
        
        const htmlContent = mockWebviewPanel.webview.html;
        
        // Test success rate calculation
        // Total requests: 15, Total errors: 1, Success rate should be ~93.3%
        TestAssertions.assertContains(htmlContent, '93.3%', 'Should calculate correct success rate');
        
        // Test total calculations
        TestAssertions.assertContains(htmlContent, '15', 'Should calculate total requests correctly');
        TestAssertions.assertContains(htmlContent, '7,000', 'Should calculate total tokens correctly');
    }
};

// Export test suite
module.exports = {
    name: 'MonitoringPanel Unit Tests',
    tests: monitoringPanelTests
};

// Run tests if this file is executed directly
if (require.main === module) {
    async function runTests() {
        console.log('🚀 Running MonitoringPanel Unit Tests...\n');
        
        try {
            await monitoringPanelTests.setup();
            
            const testMethods = [
                'testPanelCreation',
                'testWebviewContentGeneration',
                'testDataDisplayAccuracy',
                'testNoServiceContent',
                'testMessageHandling',
                'testDataExport',
                'testStatisticsReset',
                'testAutoRefresh',
                'testPanelDisposal',
                'testErrorHandling',
                'testCalculationMethods'
            ];
            
            let passed = 0;
            let failed = 0;
            
            for (const testMethod of testMethods) {
                try {
                    await monitoringPanelTests[testMethod]();
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
