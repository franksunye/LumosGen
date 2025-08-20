// DeepSeek AI Provider Implementation
// Provides cost-effective AI services with OpenAI-compatible API

import { AIProvider, AIRequest, AIResponse, AIProviderConfig, DeepSeekConfig, UsageStats, AIServiceError, calculateCost } from '../types';

export class DeepSeekProvider implements AIProvider {
  readonly name = 'DeepSeek';
  readonly type = 'deepseek' as const;
  
  private config: DeepSeekConfig;
  private stats: UsageStats;
  private initialized = false;

  constructor() {
    this.stats = {
      provider: 'deepseek',
      requests: 0,
      tokens: { input: 0, output: 0, total: 0 },
      cost: 0,
      errors: 0,
      lastUsed: 0
    };
    
    this.config = {
      type: 'deepseek',
      endpoint: 'https://api.deepseek.com',
      model: 'deepseek-chat',
      enabled: true,
      useOffPeakPricing: true
    };
  }

  async initialize(config: AIProviderConfig): Promise<void> {
    this.config = { ...this.config, ...config } as DeepSeekConfig;
    
    if (!this.config.apiKey) {
      throw new AIServiceError(
        'DeepSeek API key is required',
        'deepseek',
        'MISSING_API_KEY',
        false
      );
    }

    // Test connection during initialization
    try {
      await this.testConnection();
      this.initialized = true;
    } catch (error) {
      throw new AIServiceError(
        'Failed to initialize DeepSeek provider',
        'deepseek',
        'INITIALIZATION_FAILED',
        true,
        error as Error
      );
    }
  }

  isAvailable(): boolean {
    return this.initialized && !!this.config.apiKey && this.config.enabled !== false;
  }

  async generateContent(request: AIRequest): Promise<AIResponse> {
    if (!this.isAvailable()) {
      throw new AIServiceError(
        'DeepSeek provider is not available',
        'deepseek',
        'PROVIDER_UNAVAILABLE',
        false
      );
    }

    const startTime = Date.now();
    this.stats.requests++;

    try {
      const response = await this.makeAPICall(request);
      
      // Update statistics
      this.stats.tokens.input += response.usage.promptTokens;
      this.stats.tokens.output += response.usage.completionTokens;
      this.stats.tokens.total += response.usage.totalTokens;
      this.stats.cost += response.cost || 0;
      this.stats.lastUsed = Date.now();

      return response;
    } catch (error) {
      this.stats.errors++;
      
      if (error instanceof AIServiceError) {
        throw error;
      }
      
      // Handle different types of errors
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        
        if (message.includes('unauthorized') || message.includes('401')) {
          throw new AIServiceError(
            'Invalid DeepSeek API key',
            'deepseek',
            'UNAUTHORIZED',
            false,
            error
          );
        }
        
        if (message.includes('rate limit') || message.includes('429')) {
          throw new AIServiceError(
            'DeepSeek rate limit exceeded',
            'deepseek',
            'RATE_LIMIT',
            true,
            error
          );
        }
        
        if (message.includes('timeout') || message.includes('network')) {
          throw new AIServiceError(
            'DeepSeek network error',
            'deepseek',
            'NETWORK_ERROR',
            true,
            error
          );
        }
      }
      
      throw new AIServiceError(
        'DeepSeek API call failed',
        'deepseek',
        'API_ERROR',
        true,
        error as Error
      );
    }
  }

  private async makeAPICall(request: AIRequest): Promise<AIResponse> {
    const model = request.model || this.config.model || 'deepseek-chat';
    const endpoint = `${this.config.endpoint}/chat/completions`;
    
    const payload = {
      model,
      messages: request.messages,
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 2000,
      stream: request.stream || false
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json() as any;

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from DeepSeek API');
    }

    const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
    const cost = calculateCost('deepseek', model, usage.prompt_tokens, usage.completion_tokens);

    return {
      content: data.choices[0].message.content,
      model,
      usage: {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens
      },
      provider: 'deepseek',
      timestamp: Date.now(),
      cost
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      const testRequest: AIRequest = {
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        maxTokens: 10
      };
      
      await this.makeAPICall(testRequest);
      return true;
    } catch (error) {
      return false;
    }
  }

  getUsageStats(): UsageStats {
    return { ...this.stats };
  }

  getCostEstimate(tokens: number): number {
    const model = this.config.model || 'deepseek-chat';
    // Estimate 80% input, 20% output tokens
    const inputTokens = Math.floor(tokens * 0.8);
    const outputTokens = Math.floor(tokens * 0.2);
    return calculateCost('deepseek', model, inputTokens, outputTokens);
  }

  // DeepSeek-specific methods
  isOffPeakTime(): boolean {
    const now = new Date();
    const utcHour = now.getUTCHours();
    // Off-peak: 16:30-00:30 UTC (DeepSeek discount period)
    return utcHour >= 16 || utcHour < 1;
  }

  getCurrentPricing(): { input: number; output: number } {
    const model = this.config.model || 'deepseek-chat';
    const isOffPeak = this.isOffPeakTime();
    
    if (model === 'deepseek-chat') {
      return {
        input: isOffPeak ? 0.135 : 0.27,
        output: isOffPeak ? 0.550 : 1.10
      };
    }
    
    if (model === 'deepseek-reasoner') {
      return {
        input: isOffPeak ? 0.135 : 0.55,
        output: isOffPeak ? 0.550 : 2.19
      };
    }
    
    return { input: 0, output: 0 };
  }

  getDiscountInfo(): { isOffPeak: boolean; discount: string } {
    const isOffPeak = this.isOffPeakTime();
    return {
      isOffPeak,
      discount: isOffPeak ? '50-75% off' : 'Standard pricing'
    };
  }
}
