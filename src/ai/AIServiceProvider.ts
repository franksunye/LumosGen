// AI Service Provider - Main orchestrator for AI services
// Implements intelligent degradation strategy: DeepSeek → OpenAI → Mock

import { AIProvider, AIRequest, AIResponse, AIServiceConfig, AIProviderConfig, UsageStats, AIServiceError } from './types';
import { DeepSeekProvider } from './providers/DeepSeekProvider';
import { OpenAIProvider } from './providers/OpenAIProvider';
import { MockProvider } from './providers/MockProvider';
import { UsageMonitor, DetailedUsageStats } from './monitoring/UsageMonitor';

export class AIServiceProvider {
  private providers: Map<string, AIProvider> = new Map();
  private config: AIServiceConfig;
  private currentProvider: AIProvider | null = null;
  private degradationAttempts = 0;
  private maxDegradationAttempts = 3;
  private usageMonitor: UsageMonitor;

  constructor(config: AIServiceConfig) {
    this.config = config;
    this.usageMonitor = new UsageMonitor();
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Initialize all providers
    this.providers.set('deepseek', new DeepSeekProvider());
    this.providers.set('openai', new OpenAIProvider());
    this.providers.set('mock', new MockProvider());

    // UsageMonitor automatically initializes with these providers
  }

  async initialize(): Promise<void> {
    // Initialize providers based on configuration
    const initPromises: Promise<void>[] = [];

    // Initialize primary provider
    if (this.config.primary) {
      const provider = this.providers.get(this.config.primary.type);
      if (provider && this.config.primary) {
        initPromises.push(
          provider.initialize(this.config.primary).catch(error => {
            console.warn(`Failed to initialize primary provider ${this.config.primary.type}:`, error);
          })
        );
      }
    }

    // Initialize fallback provider
    if (this.config.fallback) {
      const provider = this.providers.get(this.config.fallback.type);
      if (provider) {
        initPromises.push(
          provider.initialize(this.config.fallback).catch(error => {
            console.warn(`Failed to initialize fallback provider ${this.config.fallback?.type}:`, error);
          })
        );
      }
    }

    // Always initialize mock provider
    const mockProvider = this.providers.get('mock');
    if (mockProvider) {
      initPromises.push(
        mockProvider.initialize(this.config.mock).catch(error => {
          console.warn('Failed to initialize mock provider:', error);
        })
      );
    }

    await Promise.all(initPromises);
    
    // Set initial current provider
    this.selectBestAvailableProvider();
  }

  async generateContent(request: AIRequest): Promise<AIResponse> {
    this.degradationAttempts = 0;

    for (const providerType of this.config.degradationStrategy) {
      const provider = this.providers.get(providerType);

      if (!provider || !provider.isAvailable()) {
        console.log(`Provider ${providerType} is not available, trying next...`);
        continue;
      }

      const startTime = Date.now();
      try {
        console.log(`Attempting content generation with ${providerType} provider...`);
        const response = await provider.generateContent(request);
        const responseTime = Date.now() - startTime;

        // Record successful request in usage monitor
        this.usageMonitor.recordRequest(providerType, response, responseTime);

        // Update current provider on success
        this.currentProvider = provider;
        this.degradationAttempts = 0;

        console.log(`✅ Content generated successfully with ${providerType} provider`);
        return response;

      } catch (error) {
        const responseTime = Date.now() - startTime;
        // Record failed request in usage monitor
        this.usageMonitor.recordRequest(providerType, null, responseTime, error as Error);

        this.degradationAttempts++;
        console.warn(`❌ ${providerType} provider failed:`, error);

        if (error instanceof AIServiceError && !error.retryable) {
          console.log(`Non-retryable error from ${providerType}, moving to next provider...`);
          continue;
        }

        if (this.degradationAttempts >= this.maxDegradationAttempts) {
          console.log(`Max degradation attempts reached for ${providerType}, moving to next provider...`);
          continue;
        }

        // For retryable errors, try the same provider once more
        if (error instanceof AIServiceError && error.retryable) {
          console.log(`Retrying ${providerType} provider...`);
          const retryStartTime = Date.now();
          try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Brief delay
            const response = await provider.generateContent(request);
            const retryResponseTime = Date.now() - retryStartTime;

            // Record successful retry in usage monitor
            this.usageMonitor.recordRequest(providerType, response, retryResponseTime);

            this.currentProvider = provider;
            this.degradationAttempts = 0;
            console.log(`✅ Content generated successfully with ${providerType} provider (retry)`);
            return response;
          } catch (retryError) {
            const retryResponseTime = Date.now() - retryStartTime;
            // Record failed retry in usage monitor
            this.usageMonitor.recordRequest(providerType, null, retryResponseTime, retryError as Error);

            console.warn(`❌ ${providerType} provider retry failed:`, retryError);
            continue;
          }
        }
      }
    }

    throw new AIServiceError(
      'All AI providers failed to generate content',
      'all',
      'ALL_PROVIDERS_FAILED',
      false
    );
  }

  async testConnection(providerType?: string): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};
    
    if (providerType) {
      const provider = this.providers.get(providerType);
      if (provider) {
        results[providerType] = await provider.testConnection();
      }
      return results;
    }
    
    // Test all providers
    for (const [type, provider] of this.providers) {
      try {
        results[type] = await provider.testConnection();
      } catch (error) {
        results[type] = false;
      }
    }
    
    return results;
  }

  getUsageStats(): { [key: string]: DetailedUsageStats } {
    return this.usageMonitor.getStats() as { [key: string]: DetailedUsageStats };
  }

  getTotalCost(): number {
    return this.usageMonitor.getTotalCost();
  }

  getDailyCost(date?: string): number {
    return this.usageMonitor.getDailyCost(date);
  }

  getCostEstimate(tokens: number, providerType?: string): number {
    if (providerType) {
      const provider = this.providers.get(providerType);
      return provider ? provider.getCostEstimate(tokens) : 0;
    }
    
    // Return estimate for current or best available provider
    const provider = this.currentProvider || this.getBestAvailableProvider();
    return provider ? provider.getCostEstimate(tokens) : 0;
  }

  getCurrentProvider(): AIProvider | null {
    return this.currentProvider;
  }

  getAvailableProviders(): string[] {
    const available: string[] = [];
    
    for (const [type, provider] of this.providers) {
      if (provider.isAvailable()) {
        available.push(type);
      }
    }
    
    return available;
  }

  private selectBestAvailableProvider(): void {
    for (const providerType of this.config.degradationStrategy) {
      const provider = this.providers.get(providerType);
      if (provider && provider.isAvailable()) {
        this.currentProvider = provider;
        console.log(`Selected ${providerType} as current provider`);
        return;
      }
    }
    
    console.warn('No providers available');
    this.currentProvider = null;
  }

  private getBestAvailableProvider(): AIProvider | null {
    for (const providerType of this.config.degradationStrategy) {
      const provider = this.providers.get(providerType);
      if (provider && provider.isAvailable()) {
        return provider;
      }
    }
    return null;
  }

  // Configuration management
  async updateConfig(newConfig: Partial<AIServiceConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    
    // Re-initialize providers if needed
    if (newConfig.primary || newConfig.fallback || newConfig.mock) {
      await this.initialize();
    }
  }

  getConfig(): AIServiceConfig {
    return { ...this.config };
  }

  // Provider-specific methods
  getDeepSeekProvider(): DeepSeekProvider | null {
    return this.providers.get('deepseek') as DeepSeekProvider || null;
  }

  getOpenAIProvider(): OpenAIProvider | null {
    return this.providers.get('openai') as OpenAIProvider || null;
  }

  getMockProvider(): MockProvider | null {
    return this.providers.get('mock') as MockProvider || null;
  }

  // Health check
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    providers: { [key: string]: { available: boolean; lastUsed: number; errors: number } };
    currentProvider: string | null;
  }> {
    const providers: { [key: string]: { available: boolean; lastUsed: number; errors: number } } = {};
    let healthyCount = 0;
    
    for (const [type, provider] of this.providers) {
      const stats = provider.getUsageStats();
      const available = provider.isAvailable();
      
      providers[type] = {
        available,
        lastUsed: stats.lastUsed,
        errors: stats.errors
      };
      
      if (available) {
        healthyCount++;
      }
    }
    
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyCount >= 2) {
      status = 'healthy';
    } else if (healthyCount === 1) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }
    
    return {
      status,
      providers,
      currentProvider: this.currentProvider?.type || null
    };
  }
}
