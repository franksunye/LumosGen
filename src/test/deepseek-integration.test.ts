// Simple integration test for DeepSeek API
// This test verifies the basic functionality without requiring real API keys

import { describe, it, expect } from 'vitest';

// Import the TypeScript modules directly
import { AIServiceProvider } from '../ai/AIServiceProvider';
import { DeepSeekProvider } from '../ai/providers/DeepSeekProvider';
import { MockProvider } from '../ai/providers/MockProvider';

describe('DeepSeek Integration Test', () => {
  it('should initialize AI service with mock provider', async () => {
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
    expect(availableProviders).toContain('mock');
  });

  it('should generate content using mock provider', async () => {
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

    expect(response.content).toBeTruthy();
    expect(response.provider).toBe('mock');
    expect(response.usage.totalTokens).toBeGreaterThan(0);
    expect(response.cost).toBe(0);
  });

  it('should provide DeepSeek pricing information', () => {
    const provider = new DeepSeekProvider();
    
    const pricing = provider.getCurrentPricing();
    expect(pricing.input).toBeGreaterThanOrEqual(0);
    expect(pricing.output).toBeGreaterThanOrEqual(0);

    const discountInfo = provider.getDiscountInfo();
    expect(typeof discountInfo.isOffPeak).toBe('boolean');
    expect(typeof discountInfo.discount).toBe('string');
  });

  it('should calculate cost estimates', () => {
    const deepseekProvider = new DeepSeekProvider();
    const mockProvider = new MockProvider();

    const tokens = 1000;
    const deepseekCost = deepseekProvider.getCostEstimate(tokens);
    const mockCost = mockProvider.getCostEstimate(tokens);

    expect(deepseekCost).toBeGreaterThanOrEqual(0);
    expect(mockCost).toBe(0);

    console.log(`DeepSeek cost estimate for ${tokens} tokens: $${deepseekCost.toFixed(6)}`);
    console.log(`Mock cost estimate for ${tokens} tokens: $${mockCost.toFixed(6)}`);
  });

  it('should track usage statistics', async () => {
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
    expect(stats.mock).toBeTruthy();
    expect(stats.mock.requests).toBe(2);
    expect(stats.mock.tokens.total).toBeGreaterThan(0);
  });

  it('should perform health check', async () => {
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

    expect(['healthy', 'degraded', 'unhealthy']).toContain(health.status);
    expect(health.providers.mock).toBeTruthy();
    expect(health.providers.mock.available).toBe(true);
    expect(health.currentProvider).toBe('mock');
  });

  it('should handle configuration updates', async () => {
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
    expect(currentConfig.monitoring.enabled).toBe(false);
  });
});
