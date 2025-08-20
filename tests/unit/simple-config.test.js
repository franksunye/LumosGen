/**
 * SimpleConfig Unit Tests
 * 
 * Comprehensive testing of configuration management including
 * AI service configuration, validation, provider selection, and error handling.
 */

const { TestUtils, TestAssertions } = require('../test-config');

// Mock VS Code workspace configuration
const mockConfiguration = {
    get: jest.fn(),
    has: jest.fn(),
    inspect: jest.fn(),
    update: jest.fn()
};

const mockWorkspace = {
    getConfiguration: jest.fn(() => mockConfiguration),
    workspaceFolders: [{
        uri: { fsPath: '/test/workspace' }
    }]
};

const mockVscode = {
    workspace: mockWorkspace
};

// Mock vscode module
jest.mock('vscode', () => mockVscode, { virtual: true });

const simpleConfigTests = {
    async setup() {
        console.log('🔧 Setting up SimpleConfig tests...');
        
        // Reset all mocks
        jest.clearAllMocks();
        
        // Set up default configuration values
        this.setupDefaultConfig();
        
        // Import SimpleConfig after mocking
        const SimpleConfig = require('../../out/config/SimpleConfig');
        this.SimpleConfig = SimpleConfig;
    },

    setupDefaultConfig() {
        // Default configuration setup
        mockConfiguration.get.mockImplementation((key, defaultValue) => {
            const config = {
                'language': 'en',
                'marketingSettings': {
                    tone: 'professional',
                    includeCodeExamples: true,
                    targetMarkets: ['global'],
                    seoOptimization: true
                },
                'aiService': {
                    deepseekApiKey: 'test-deepseek-key',
                    openaiApiKey: 'test-openai-key',
                    degradationStrategy: ['deepseek', 'openai', 'mock'],
                    monitoringEnabled: true,
                    trackCosts: true,
                    trackUsage: true
                },
                'openai.apiKey': 'legacy-openai-key'
            };
            
            return config[key] !== undefined ? config[key] : defaultValue;
        });
    },

    async testBasicConfigRetrieval() {
        console.log('🧪 Testing basic configuration retrieval...');
        
        const config = this.SimpleConfig.getConfig();
        TestAssertions.assertTrue(config !== null, 'Should return configuration object');
        
        const language = this.SimpleConfig.getLanguage();
        TestAssertions.assertEqual(language, 'en', 'Should return correct language');
        
        const marketingSettings = this.SimpleConfig.getMarketingSettings();
        TestAssertions.assertEqual(marketingSettings.tone, 'professional', 'Should return correct marketing tone');
        TestAssertions.assertTrue(marketingSettings.includeCodeExamples, 'Should include code examples by default');
    },

    async testAIServiceConfiguration() {
        console.log('🧪 Testing AI service configuration...');
        
        const aiConfig = this.SimpleConfig.getAIServiceConfig();
        
        // Test primary provider configuration
        TestAssertions.assertEqual(aiConfig.primary.type, 'deepseek', 'Should use DeepSeek as primary when configured');
        TestAssertions.assertEqual(aiConfig.primary.apiKey, 'test-deepseek-key', 'Should use correct DeepSeek API key');
        TestAssertions.assertEqual(aiConfig.primary.model, 'deepseek-chat', 'Should use correct DeepSeek model');
        
        // Test fallback provider configuration
        TestAssertions.assertTrue(aiConfig.fallback !== undefined, 'Should have fallback provider');
        TestAssertions.assertEqual(aiConfig.fallback.type, 'openai', 'Should use OpenAI as fallback');
        TestAssertions.assertEqual(aiConfig.fallback.apiKey, 'test-openai-key', 'Should use correct OpenAI API key');
        
        // Test degradation strategy
        TestAssertions.assertTrue(Array.isArray(aiConfig.degradationStrategy), 'Should have degradation strategy array');
        TestAssertions.assertContains(aiConfig.degradationStrategy, 'deepseek', 'Should include DeepSeek in strategy');
        TestAssertions.assertContains(aiConfig.degradationStrategy, 'openai', 'Should include OpenAI in strategy');
        TestAssertions.assertContains(aiConfig.degradationStrategy, 'mock', 'Should include Mock in strategy');
        
        // Test monitoring configuration
        TestAssertions.assertTrue(aiConfig.monitoring.enabled, 'Should enable monitoring by default');
        TestAssertions.assertTrue(aiConfig.monitoring.trackCosts, 'Should track costs by default');
        TestAssertions.assertTrue(aiConfig.monitoring.trackUsage, 'Should track usage by default');
    },

    async testProviderPriorityLogic() {
        console.log('🧪 Testing provider priority logic...');
        
        // Test DeepSeek priority
        this.setupConfigWithProviders({ deepseek: 'test-key', openai: 'test-key' });
        let aiConfig = this.SimpleConfig.getAIServiceConfig();
        TestAssertions.assertEqual(aiConfig.primary.type, 'deepseek', 'Should prioritize DeepSeek when both are configured');
        
        // Test OpenAI fallback to primary
        this.setupConfigWithProviders({ openai: 'test-key' });
        aiConfig = this.SimpleConfig.getAIServiceConfig();
        TestAssertions.assertEqual(aiConfig.primary.type, 'openai', 'Should use OpenAI as primary when DeepSeek not configured');
        
        // Test Mock fallback
        this.setupConfigWithProviders({});
        aiConfig = this.SimpleConfig.getAIServiceConfig();
        TestAssertions.assertEqual(aiConfig.primary.type, 'mock', 'Should use Mock when no API keys configured');
    },

    setupConfigWithProviders(providers) {
        mockConfiguration.get.mockImplementation((key, defaultValue) => {
            const config = {
                'language': 'en',
                'aiService': {
                    deepseekApiKey: providers.deepseek || '',
                    openaiApiKey: providers.openai || '',
                    degradationStrategy: ['deepseek', 'openai', 'mock']
                }
            };
            return config[key] !== undefined ? config[key] : defaultValue;
        });
    },

    async testLegacyConfigSupport() {
        console.log('🧪 Testing legacy configuration support...');
        
        // Set up legacy configuration
        mockConfiguration.get.mockImplementation((key, defaultValue) => {
            const config = {
                'language': 'en',
                'openai.apiKey': 'legacy-api-key',
                'aiService': {
                    model: 'gpt-4'
                }
            };
            return config[key] !== undefined ? config[key] : defaultValue;
        });
        
        const aiConfig = this.SimpleConfig.getAIServiceConfig();
        
        TestAssertions.assertEqual(aiConfig.primary.type, 'openai', 'Should support legacy OpenAI configuration');
        TestAssertions.assertEqual(aiConfig.primary.apiKey, 'legacy-api-key', 'Should use legacy API key');
        TestAssertions.assertEqual(aiConfig.primary.model, 'gpt-4', 'Should use legacy model setting');
    },

    async testProviderConfigRetrieval() {
        console.log('🧪 Testing provider-specific configuration retrieval...');
        
        this.setupDefaultConfig();
        
        const deepseekConfig = this.SimpleConfig.getProviderConfig('deepseek');
        TestAssertions.assertTrue(deepseekConfig !== null, 'Should return DeepSeek configuration');
        TestAssertions.assertEqual(deepseekConfig.type, 'deepseek', 'Should return correct provider type');
        TestAssertions.assertEqual(deepseekConfig.apiKey, 'test-deepseek-key', 'Should return correct API key');
        
        const openaiConfig = this.SimpleConfig.getProviderConfig('openai');
        TestAssertions.assertTrue(openaiConfig !== null, 'Should return OpenAI configuration');
        TestAssertions.assertEqual(openaiConfig.type, 'openai', 'Should return correct provider type');
        
        const mockConfig = this.SimpleConfig.getProviderConfig('mock');
        TestAssertions.assertTrue(mockConfig !== null, 'Should return Mock configuration');
        TestAssertions.assertEqual(mockConfig.type, 'mock', 'Should return correct provider type');
        
        const invalidConfig = this.SimpleConfig.getProviderConfig('invalid');
        TestAssertions.assertTrue(invalidConfig === null, 'Should return null for invalid provider');
    },

    async testConfigValidation() {
        console.log('🧪 Testing configuration validation...');
        
        // Test valid configuration
        this.setupDefaultConfig();
        let errors = this.SimpleConfig.validateConfig();
        TestAssertions.assertEqual(errors.length, 0, 'Should have no errors for valid configuration');
        
        // Test missing language
        mockConfiguration.get.mockImplementation((key, defaultValue) => {
            if (key === 'language') return undefined;
            return this.getDefaultConfigValue(key, defaultValue);
        });
        
        errors = this.SimpleConfig.validateConfig();
        TestAssertions.assertTrue(errors.length > 0, 'Should have errors for missing language');
        TestAssertions.assertTrue(
            errors.some(error => error.includes('Language setting is missing')),
            'Should report missing language error'
        );
        
        // Test missing API key for non-mock provider
        this.setupConfigWithProviders({ deepseek: '' });
        errors = this.SimpleConfig.validateConfig();
        TestAssertions.assertTrue(
            errors.some(error => error.includes('deepseek API key is required')),
            'Should report missing API key error'
        );
        
        // Test invalid degradation strategy
        mockConfiguration.get.mockImplementation((key, defaultValue) => {
            if (key === 'aiService') {
                return {
                    degradationStrategy: ['invalid-provider']
                };
            }
            return this.getDefaultConfigValue(key, defaultValue);
        });
        
        errors = this.SimpleConfig.validateConfig();
        TestAssertions.assertTrue(
            errors.some(error => error.includes('Invalid provider in degradation strategy')),
            'Should report invalid provider error'
        );
        
        // Test missing mock in degradation strategy
        mockConfiguration.get.mockImplementation((key, defaultValue) => {
            if (key === 'aiService') {
                return {
                    degradationStrategy: ['deepseek', 'openai']
                };
            }
            return this.getDefaultConfigValue(key, defaultValue);
        });
        
        errors = this.SimpleConfig.validateConfig();
        TestAssertions.assertTrue(
            errors.some(error => error.includes('must include "mock" as final fallback')),
            'Should require mock as final fallback'
        );
    },

    getDefaultConfigValue(key, defaultValue) {
        const config = {
            'language': 'en',
            'aiService': {
                deepseekApiKey: 'test-key',
                degradationStrategy: ['deepseek', 'openai', 'mock']
            }
        };
        return config[key] !== undefined ? config[key] : defaultValue;
    },

    async testConfigurationHelpers() {
        console.log('🧪 Testing configuration helper functions...');
        
        this.setupDefaultConfig();
        
        // Test API key validation
        TestAssertions.assertTrue(this.SimpleConfig.hasValidAPIKey(), 'Should have valid API key');
        
        // Test configured providers
        const providers = this.SimpleConfig.getConfiguredProviders();
        TestAssertions.assertTrue(Array.isArray(providers), 'Should return array of providers');
        TestAssertions.assertContains(providers, 'deepseek', 'Should include configured DeepSeek');
        TestAssertions.assertContains(providers, 'openai', 'Should include configured OpenAI');
        TestAssertions.assertContains(providers, 'mock', 'Should always include Mock');
        
        // Test monitoring settings
        TestAssertions.assertTrue(this.SimpleConfig.isMonitoringEnabled(), 'Should enable monitoring');
        TestAssertions.assertTrue(this.SimpleConfig.shouldTrackCosts(), 'Should track costs');
        
        // Test with no API keys
        this.setupConfigWithProviders({});
        TestAssertions.assertTrue(this.SimpleConfig.hasValidAPIKey(), 'Should be valid with mock provider');
        
        const mockOnlyProviders = this.SimpleConfig.getConfiguredProviders();
        TestAssertions.assertContains(mockOnlyProviders, 'mock', 'Should include mock when no API keys');
    },

    async testEdgeCases() {
        console.log('🧪 Testing edge cases...');
        
        // Test empty configuration
        mockConfiguration.get.mockImplementation((key, defaultValue) => defaultValue);
        
        const language = this.SimpleConfig.getLanguage();
        TestAssertions.assertEqual(language, 'en', 'Should return default language');
        
        const marketingSettings = this.SimpleConfig.getMarketingSettings();
        TestAssertions.assertEqual(marketingSettings.tone, 'professional', 'Should return default marketing settings');
        
        // Test null/undefined values
        mockConfiguration.get.mockImplementation((key, defaultValue) => {
            if (key === 'aiService') return null;
            return defaultValue;
        });
        
        const aiConfig = this.SimpleConfig.getAIServiceConfig();
        TestAssertions.assertEqual(aiConfig.primary.type, 'mock', 'Should fallback to mock for null aiService');
        
        // Test malformed configuration
        mockConfiguration.get.mockImplementation((key, defaultValue) => {
            if (key === 'aiService') return 'invalid-string';
            return defaultValue;
        });
        
        const malformedConfig = this.SimpleConfig.getAIServiceConfig();
        TestAssertions.assertEqual(malformedConfig.primary.type, 'mock', 'Should handle malformed configuration gracefully');
    }
};

// Export test suite
module.exports = {
    name: 'SimpleConfig Unit Tests',
    tests: simpleConfigTests
};

// Run tests if this file is executed directly
if (require.main === module) {
    async function runTests() {
        console.log('🚀 Running SimpleConfig Unit Tests...\n');
        
        try {
            await simpleConfigTests.setup();
            
            const testMethods = [
                'testBasicConfigRetrieval',
                'testAIServiceConfiguration',
                'testProviderPriorityLogic',
                'testLegacyConfigSupport',
                'testProviderConfigRetrieval',
                'testConfigValidation',
                'testConfigurationHelpers',
                'testEdgeCases'
            ];
            
            let passed = 0;
            let failed = 0;
            
            for (const testMethod of testMethods) {
                try {
                    await simpleConfigTests[testMethod]();
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
