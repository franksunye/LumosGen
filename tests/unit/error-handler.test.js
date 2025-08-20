/**
 * ErrorHandler Unit Tests
 * 
 * Comprehensive testing of error handling, classification, resolution steps,
 * and user notification mechanisms.
 */

const { TestUtils, TestAssertions } = require('../test-config');
const fs = require('fs');
const path = require('path');

// Mock VS Code API
const mockOutputChannel = {
    appendLine: jest.fn(),
    show: jest.fn()
};

const mockWorkspace = {
    workspaceFolders: [{
        uri: { fsPath: '/test/workspace' }
    }]
};

const mockWindow = {
    showErrorMessage: jest.fn(),
    showWarningMessage: jest.fn(),
    showInformationMessage: jest.fn(),
    showQuickPick: jest.fn(),
    showSaveDialog: jest.fn()
};

const mockEnv = {
    clipboard: {
        writeText: jest.fn()
    }
};

const mockVscode = {
    workspace: mockWorkspace,
    window: mockWindow,
    env: mockEnv,
    Uri: {
        file: (path) => ({ fsPath: path })
    }
};

// Mock fs.promises
jest.mock('fs', () => ({
    promises: {
        mkdir: jest.fn(),
        appendFile: jest.fn()
    },
    existsSync: jest.fn()
}));

// Mock vscode module
jest.mock('vscode', () => mockVscode, { virtual: true });

const errorHandlerTests = {
    async setup() {
        console.log('🔧 Setting up ErrorHandler tests...');
        
        // Reset all mocks
        jest.clearAllMocks();
        
        // Mock successful file operations
        fs.promises.mkdir.mockResolvedValue();
        fs.promises.appendFile.mockResolvedValue();
        fs.existsSync.mockReturnValue(true);
        
        // Import ErrorHandler after mocking
        const { ErrorHandler } = require('../../out/utils/ErrorHandler');
        this.ErrorHandler = ErrorHandler;
        this.errorHandler = new ErrorHandler(mockOutputChannel);
        
        // Wait for async initialization
        await TestUtils.sleep(100);
    },

    async testErrorClassification() {
        console.log('🧪 Testing error severity classification...');
        
        const testCases = [
            {
                error: new Error('no workspace found'),
                context: { operation: 'analyze', component: 'ProjectAnalyzer', timestamp: new Date() },
                expectedSeverity: 'critical'
            },
            {
                error: new Error('permission denied'),
                context: { operation: 'build', component: 'WebsiteBuilder', timestamp: new Date() },
                expectedSeverity: 'critical'
            },
            {
                error: new Error('failed to push to repository'),
                context: { operation: 'deploy', component: 'GitHubDeployer', timestamp: new Date() },
                expectedSeverity: 'high'
            },
            {
                error: new Error('content generation failed'),
                context: { operation: 'generate', component: 'ContentGenerator', timestamp: new Date() },
                expectedSeverity: 'medium'
            },
            {
                error: new Error('minor issue occurred'),
                context: { operation: 'validate', component: 'Validator', timestamp: new Date() },
                expectedSeverity: 'low'
            }
        ];

        for (const testCase of testCases) {
            // Create error handler instance to access private method via reflection
            const errorLog = await this.createErrorLogForTesting(testCase.error, testCase.context);
            
            TestAssertions.assertEqual(
                errorLog.severity,
                testCase.expectedSeverity,
                `Error "${testCase.error.message}" should have severity "${testCase.expectedSeverity}"`
            );
        }
    },

    async testResolutionStepsGeneration() {
        console.log('🧪 Testing resolution steps generation...');
        
        const testCases = [
            {
                error: new Error('no workspace found'),
                context: { operation: 'analyze', component: 'ProjectAnalyzer', timestamp: new Date() },
                expectedSteps: ['Open a folder in VS Code', 'Ensure the folder contains your project files']
            },
            {
                error: new Error('not a git repository'),
                context: { operation: 'deploy', component: 'GitHubDeployer', timestamp: new Date() },
                expectedSteps: ['Initialize Git repository: git init', 'Add remote origin']
            },
            {
                error: new Error('network timeout occurred'),
                context: { operation: 'generate', component: 'AIService', timestamp: new Date() },
                expectedSteps: ['Check your internet connection', 'Try again in a few moments']
            }
        ];

        for (const testCase of testCases) {
            const errorLog = await this.createErrorLogForTesting(testCase.error, testCase.context);
            
            TestAssertions.assertTrue(
                errorLog.resolutionSteps && errorLog.resolutionSteps.length > 0,
                'Resolution steps should be generated'
            );
            
            // Check if expected steps are included
            for (const expectedStep of testCase.expectedSteps) {
                const hasStep = errorLog.resolutionSteps.some(step => 
                    step.toLowerCase().includes(expectedStep.toLowerCase())
                );
                TestAssertions.assertTrue(
                    hasStep,
                    `Should include resolution step containing: "${expectedStep}"`
                );
            }
        }
    },

    async testErrorLogging() {
        console.log('🧪 Testing error logging mechanisms...');
        
        const testError = new Error('Test error for logging');
        const testContext = {
            operation: 'test',
            component: 'TestComponent',
            timestamp: new Date(),
            additionalInfo: { testData: 'test value' }
        };

        await this.errorHandler.handleError(testError, testContext);

        // Verify output channel logging
        TestAssertions.assertTrue(
            mockOutputChannel.appendLine.mock.calls.length > 0,
            'Should log to output channel'
        );

        // Check log content
        const logCalls = mockOutputChannel.appendLine.mock.calls;
        const logContent = logCalls.map(call => call[0]).join('\n');
        
        TestAssertions.assertContains(logContent, 'Test error for logging', 'Should log error message');
        TestAssertions.assertContains(logContent, 'TestComponent', 'Should log component name');
        TestAssertions.assertContains(logContent, 'test value', 'Should log additional info');

        // Verify file logging
        TestAssertions.assertTrue(
            fs.promises.appendFile.mock.calls.length > 0,
            'Should log to file'
        );
    },

    async testUserNotification() {
        console.log('🧪 Testing user notification system...');
        
        const testCases = [
            {
                severity: 'critical',
                expectedMethod: 'showErrorMessage'
            },
            {
                severity: 'high',
                expectedMethod: 'showErrorMessage'
            },
            {
                severity: 'medium',
                expectedMethod: 'showWarningMessage'
            },
            {
                severity: 'low',
                expectedMethod: 'showInformationMessage'
            }
        ];

        for (const testCase of testCases) {
            // Reset mocks
            jest.clearAllMocks();
            
            const testError = new Error(`Test ${testCase.severity} error`);
            const testContext = {
                operation: 'test',
                component: 'TestComponent',
                timestamp: new Date()
            };

            // Mock the appropriate method to return a selection
            mockWindow[testCase.expectedMethod].mockResolvedValue('View Details');

            await this.errorHandler.handleError(testError, testContext);

            // Verify correct notification method was called
            TestAssertions.assertTrue(
                mockWindow[testCase.expectedMethod].mock.calls.length > 0,
                `Should call ${testCase.expectedMethod} for ${testCase.severity} errors`
            );
        }
    },

    async testRecoveryActions() {
        console.log('🧪 Testing recovery action execution...');
        
        let recoveryExecuted = false;
        const recoveryActions = [
            {
                label: 'Test Recovery',
                description: 'Test recovery action',
                action: async () => {
                    recoveryExecuted = true;
                }
            }
        ];

        const testError = new Error('Test error with recovery');
        const testContext = {
            operation: 'test',
            component: 'TestComponent',
            timestamp: new Date()
        };

        // Mock user selecting recovery option
        mockWindow.showErrorMessage.mockResolvedValue('Try Recovery');
        mockWindow.showQuickPick.mockResolvedValue('Test Recovery');

        await this.errorHandler.handleError(testError, testContext, recoveryActions);

        // Verify recovery action was executed
        TestAssertions.assertTrue(recoveryExecuted, 'Recovery action should be executed');
    },

    async testErrorLogManagement() {
        console.log('🧪 Testing error log management...');
        
        const testError1 = new Error('First test error');
        const testError2 = new Error('Second test error');
        const testContext = {
            operation: 'test',
            component: 'TestComponent',
            timestamp: new Date()
        };

        // Handle multiple errors
        await this.errorHandler.handleError(testError1, testContext);
        await this.errorHandler.handleError(testError2, testContext);

        // Get error logs
        const errorLogs = this.errorHandler.getErrorLogs();
        
        TestAssertions.assertEqual(errorLogs.length, 2, 'Should store multiple error logs');
        TestAssertions.assertEqual(errorLogs[0].error.message, 'First test error', 'Should store first error');
        TestAssertions.assertEqual(errorLogs[1].error.message, 'Second test error', 'Should store second error');

        // Test marking error as resolved
        const firstErrorId = errorLogs[0].id;
        this.errorHandler.markErrorResolved(firstErrorId);
        
        const updatedLogs = this.errorHandler.getErrorLogs();
        const resolvedError = updatedLogs.find(log => log.id === firstErrorId);
        
        TestAssertions.assertTrue(resolvedError.resolved, 'Error should be marked as resolved');

        // Test clearing logs
        this.errorHandler.clearErrorLogs();
        const clearedLogs = this.errorHandler.getErrorLogs();
        
        TestAssertions.assertEqual(clearedLogs.length, 0, 'Should clear all error logs');
    },

    // Helper method to create error logs for testing
    async createErrorLogForTesting(error, context) {
        // Create a temporary error handler to access private methods
        const tempHandler = new this.ErrorHandler(mockOutputChannel);
        
        // Use reflection to access private method
        const createErrorLog = tempHandler.createErrorLog || 
            function(error, context) {
                const severity = this.determineSeverity(error, context);
                return {
                    id: this.generateErrorId(),
                    error,
                    context,
                    severity,
                    resolved: false,
                    resolutionSteps: this.generateResolutionSteps(error, context)
                };
            }.bind(tempHandler);

        return createErrorLog.call(tempHandler, error, context);
    }
};

// Export test suite
module.exports = {
    name: 'ErrorHandler Unit Tests',
    tests: errorHandlerTests
};

// Run tests if this file is executed directly
if (require.main === module) {
    async function runTests() {
        console.log('🚀 Running ErrorHandler Unit Tests...\n');
        
        try {
            await errorHandlerTests.setup();
            
            const testMethods = [
                'testErrorClassification',
                'testResolutionStepsGeneration',
                'testErrorLogging',
                'testUserNotification',
                'testRecoveryActions',
                'testErrorLogManagement'
            ];
            
            let passed = 0;
            let failed = 0;
            
            for (const testMethod of testMethods) {
                try {
                    await errorHandlerTests[testMethod]();
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

// 导出测试套件供测试运行器使用
module.exports = errorHandlerTests;
