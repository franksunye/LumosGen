// Simple integration test for DeepSeek API
// This test verifies the basic functionality without requiring real API keys

const assert = require('assert');

// Import the compiled JavaScript modules
const { AIServiceProvider } = require('../out/ai/AIServiceProvider');
const { DeepSeekProvider } = require('../out/ai/providers/DeepSeekProvider');
const { MockProvider } = require('../out/ai/providers/MockProvider');

describe('DeepSeek Integration Test', function() {
  this.timeout(10000); // 10 second timeout

  it('should initialize AI service with mock provider', async function() {
    const mockConfig = {
      primary: {
        type: 'mock',
        enabled: true
      },
      fallback: {
        type: 'mock',
        enabled: true
      },
      mock: {
        type: 'mock',
        enabled: true,
        responseDelay: 100,
        simulateErrors: false,
        errorRate: 0
      },
      degradationStrategy: ['mock'],
      monitoring: {
        enabled: true,
        trackCosts: true,
        trackUsage: true
      }
    };

    const aiService = new AIServiceProvider(mockConfig);
    await aiService.initialize();
    
    const availableProviders = aiService.getAvailableProviders();
    assert.ok(availableProviders.includes('mock'), 'Mock provider should be available');
  });

  it('should generate content using mock provider', async function() {
    const mockConfig = {
      primary: {
        type: 'mock',
        enabled: true
      },
      mock: {
        type: 'mock',
        enabled: true,
        responseDelay: 100
      },
      degradationStrategy: ['mock'],
      monitoring: {
        enabled: true,
        trackCosts: true,
        trackUsage: true
      }
    };

    const aiService = new AIServiceProvider(mockConfig);
    await aiService.initialize();

    const request = {
      messages: [
        { role: 'user', content: 'Generate a homepage for a developer tool' }
      ]
    };

    const response = await aiService.generateContent(request);
    
    assert.ok(response.content, 'Response should have content');
    assert.strictEqual(response.provider, 'mock', 'Provider should be mock');
    assert.ok(response.usage.totalTokens > 0, 'Should have token usage');
    assert.strictEqual(response.cost, 0, 'Mock provider should be free');
  });

  it('should provide DeepSeek pricing information', function() {
    const provider = new DeepSeekProvider();
    
    const pricing = provider.getCurrentPricing();
    assert.ok(pricing.input >= 0, 'Input pricing should be non-negative');
    assert.ok(pricing.output >= 0, 'Output pricing should be non-negative');
    
    const discountInfo = provider.getDiscountInfo();
    assert.ok(typeof discountInfo.isOffPeak === 'boolean', 'Should provide off-peak status');
    assert.ok(typeof discountInfo.discount === 'string', 'Should provide discount information');
  });

  it('should calculate cost estimates', function() {
    const deepseekProvider = new DeepSeekProvider();
    const mockProvider = new MockProvider();

    const tokens = 1000;
    const deepseekCost = deepseekProvider.getCostEstimate(tokens);
    const mockCost = mockProvider.getCostEstimate(tokens);

    assert.ok(deepseekCost >= 0, 'DeepSeek cost should be non-negative');
    assert.strictEqual(mockCost, 0, 'Mock cost should be zero');
    
    console.log(`DeepSeek cost estimate for ${tokens} tokens: $${deepseekCost.toFixed(6)}`);
    console.log(`Mock cost estimate for ${tokens} tokens: $${mockCost.toFixed(6)}`);
  });

  it('should track usage statistics', async function() {
    const mockConfig = {
      primary: {
        type: 'mock',
        enabled: true
      },
      mock: {
        type: 'mock',
        enabled: true,
        responseDelay: 50
      },
      degradationStrategy: ['mock'],
      monitoring: {
        enabled: true,
        trackCosts: true,
        trackUsage: true
      }
    };

    const aiService = new AIServiceProvider(mockConfig);
    await aiService.initialize();

    const request = {
      messages: [
        { role: 'user', content: 'Test message' }
      ]
    };

    // Make multiple requests
    await aiService.generateContent(request);
    await aiService.generateContent(request);

    const stats = aiService.getUsageStats();
    assert.ok(stats.mock, 'Should have mock provider stats');
    assert.strictEqual(stats.mock.requests, 2, 'Should track request count');
    assert.ok(stats.mock.tokens.total > 0, 'Should track token usage');
  });

  it('should perform health check', async function() {
    const mockConfig = {
      primary: {
        type: 'mock',
        enabled: true
      },
      mock: {
        type: 'mock',
        enabled: true
      },
      degradationStrategy: ['mock'],
      monitoring: {
        enabled: true,
        trackCosts: true,
        trackUsage: true
      }
    };

    const aiService = new AIServiceProvider(mockConfig);
    await aiService.initialize();

    const health = await aiService.healthCheck();
    
    assert.ok(['healthy', 'degraded', 'unhealthy'].includes(health.status), 'Should have valid health status');
    assert.ok(health.providers.mock, 'Should have mock provider health info');
    assert.strictEqual(health.providers.mock.available, true, 'Mock provider should be available');
    assert.strictEqual(health.currentProvider, 'mock', 'Current provider should be mock');
  });

  it('should handle configuration updates', async function() {
    const initialConfig = {
      primary: {
        type: 'mock',
        enabled: true
      },
      mock: {
        type: 'mock',
        enabled: true
      },
      degradationStrategy: ['mock'],
      monitoring: {
        enabled: true,
        trackCosts: true,
        trackUsage: true
      }
    };

    const aiService = new AIServiceProvider(initialConfig);
    await aiService.initialize();

    const newConfig = {
      monitoring: {
        enabled: false,
        trackCosts: false,
        trackUsage: false
      }
    };

    await aiService.updateConfig(newConfig);
    
    const currentConfig = aiService.getConfig();
    assert.strictEqual(currentConfig.monitoring.enabled, false, 'Monitoring should be disabled');
  });
});

console.log('DeepSeek Integration Test Suite Ready');
console.log('Run with: npm test or node src/test/deepseek-integration.test.js');
