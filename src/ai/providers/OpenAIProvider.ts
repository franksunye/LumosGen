// OpenAI Provider Implementation
// Refactored from existing implementation to fit new AI service abstraction

import { AIProvider, AIRequest, AIResponse, AIProviderConfig, OpenAIConfig, UsageStats, AIServiceError, calculateCost } from '../types';

export class OpenAIProvider implements AIProvider {
  readonly name = 'OpenAI';
  readonly type = 'openai' as const;
  
  private config: OpenAIConfig;
  private stats: UsageStats;
  private initialized = false;

  constructor() {
    this.stats = {
      provider: 'openai',
      requests: 0,
      tokens: { input: 0, output: 0, total: 0 },
      cost: 0,
      errors: 0,
      lastUsed: 0
    };
    
    this.config = {
      type: 'openai',
      endpoint: 'https://api.openai.com/v1',
      model: 'gpt-4o-mini',
      enabled: true
    };
  }

  async initialize(config: AIProviderConfig): Promise<void> {
    this.config = { ...this.config, ...config } as OpenAIConfig;
    
    if (!this.config.apiKey) {
      throw new AIServiceError(
        'OpenAI API key is required',
        'openai',
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
        'Failed to initialize OpenAI provider',
        'openai',
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
        'OpenAI provider is not available',
        'openai',
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
            'Invalid OpenAI API key',
            'openai',
            'UNAUTHORIZED',
            false,
            error
          );
        }
        
        if (message.includes('rate limit') || message.includes('429')) {
          throw new AIServiceError(
            'OpenAI rate limit exceeded',
            'openai',
            'RATE_LIMIT',
            true,
            error
          );
        }
        
        if (message.includes('timeout') || message.includes('network')) {
          throw new AIServiceError(
            'OpenAI network error',
            'openai',
            'NETWORK_ERROR',
            true,
            error
          );
        }
        
        if (message.includes('insufficient_quota') || message.includes('quota')) {
          throw new AIServiceError(
            'OpenAI quota exceeded',
            'openai',
            'QUOTA_EXCEEDED',
            false,
            error
          );
        }
      }
      
      throw new AIServiceError(
        'OpenAI API call failed',
        'openai',
        'API_ERROR',
        true,
        error as Error
      );
    }
  }

  private async makeAPICall(request: AIRequest): Promise<AIResponse> {
    const model = request.model || this.config.model || 'gpt-4o-mini';
    const endpoint = `${this.config.endpoint}/chat/completions`;
    
    const payload = {
      model,
      messages: request.messages,
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 2000,
      stream: request.stream || false
    };

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
    };

    // Add organization header if provided
    if (this.config.organization) {
      headers['OpenAI-Organization'] = this.config.organization;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenAI API');
    }

    const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
    const cost = calculateCost('openai', model, usage.prompt_tokens, usage.completion_tokens);

    return {
      content: data.choices[0].message.content,
      model,
      usage: {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens
      },
      provider: 'openai',
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
    const model = this.config.model || 'gpt-4o-mini';
    // Estimate 80% input, 20% output tokens
    const inputTokens = Math.floor(tokens * 0.8);
    const outputTokens = Math.floor(tokens * 0.2);
    return calculateCost('openai', model, inputTokens, outputTokens);
  }

  // OpenAI-specific methods
  getModelInfo(): { model: string; contextLength: number; costPer1M: { input: number; output: number } } {
    const model = this.config.model || 'gpt-4o-mini';
    
    const modelInfo = {
      'gpt-4o-mini': {
        contextLength: 128000,
        costPer1M: { input: 0.15, output: 0.60 }
      },
      'gpt-3.5-turbo': {
        contextLength: 16385,
        costPer1M: { input: 0.50, output: 1.50 }
      },
      'gpt-4': {
        contextLength: 8192,
        costPer1M: { input: 30.00, output: 60.00 }
      }
    };

    return {
      model,
      ...modelInfo[model as keyof typeof modelInfo] || modelInfo['gpt-4o-mini']
    };
  }

  supportsStreaming(): boolean {
    return true;
  }

  supportsFunctionCalling(): boolean {
    const model = this.config.model || 'gpt-4o-mini';
    return ['gpt-4o-mini', 'gpt-3.5-turbo', 'gpt-4'].includes(model);
  }
}
