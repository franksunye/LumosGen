// AI Service Types and Interfaces for LumosGen
// Supports DeepSeek, OpenAI, and Mock providers with intelligent degradation

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequest {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  provider: string;
  timestamp: number;
  cost?: number;
}

export interface AIProviderConfig {
  type: 'deepseek' | 'openai' | 'mock';
  apiKey?: string;
  endpoint?: string;
  model?: string;
  enabled?: boolean;
}

export interface AIServiceConfig {
  primary: AIProviderConfig;
  fallback?: AIProviderConfig;
  mock: AIProviderConfig;
  degradationStrategy: ('deepseek' | 'openai' | 'mock')[];
  monitoring: {
    enabled: boolean;
    trackCosts: boolean;
    trackUsage: boolean;
  };
}

export interface UsageStats {
  provider: string;
  requests: number;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
  errors: number;
  lastUsed: number;
}

export interface AIProvider {
  readonly name: string;
  readonly type: 'deepseek' | 'openai' | 'mock';
  
  initialize(config: AIProviderConfig): Promise<void>;
  isAvailable(): boolean;
  generateContent(request: AIRequest): Promise<AIResponse>;
  testConnection(): Promise<boolean>;
  getUsageStats(): UsageStats;
  getCostEstimate(tokens: number): number;
}

export interface AIServiceError extends Error {
  provider: string;
  code: string;
  retryable: boolean;
  originalError?: Error;
}

export class AIServiceError extends Error implements AIServiceError {
  constructor(
    message: string,
    public provider: string,
    public code: string,
    public retryable: boolean = false,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

// Provider-specific configurations
export interface DeepSeekConfig extends AIProviderConfig {
  type: 'deepseek';
  endpoint: 'https://api.deepseek.com' | 'https://api.deepseek.com/v1';
  model: 'deepseek-chat' | 'deepseek-reasoner';
  useOffPeakPricing?: boolean;
}

export interface OpenAIConfig extends AIProviderConfig {
  type: 'openai';
  endpoint: 'https://api.openai.com/v1';
  model: 'gpt-4o-mini' | 'gpt-3.5-turbo' | 'gpt-4';
  organization?: string;
}

export interface MockConfig extends AIProviderConfig {
  type: 'mock';
  responseDelay?: number;
  simulateErrors?: boolean;
  errorRate?: number;
}

// Extended AIProviderConfig to support mock-specific properties
export interface ExtendedAIProviderConfig extends AIProviderConfig {
  responseDelay?: number;
  simulateErrors?: boolean;
  errorRate?: number;
}

// Cost calculation constants
export const PRICING = {
  deepseek: {
    'deepseek-chat': {
      input: { standard: 0.27, offPeak: 0.135 }, // per 1M tokens
      output: { standard: 1.10, offPeak: 0.550 }
    },
    'deepseek-reasoner': {
      input: { standard: 0.55, offPeak: 0.135 },
      output: { standard: 2.19, offPeak: 0.550 }
    }
  },
  openai: {
    'gpt-4o-mini': {
      input: 0.15, // per 1M tokens
      output: 0.60
    },
    'gpt-3.5-turbo': {
      input: 0.50,
      output: 1.50
    },
    'gpt-4': {
      input: 30.00,
      output: 60.00
    }
  }
} as const;

// Utility functions
export function isOffPeakHour(): boolean {
  const now = new Date();
  const utcHour = now.getUTCHours();
  // Off-peak: 16:30-00:30 UTC (DeepSeek discount period)
  return utcHour >= 16 || utcHour < 1;
}

export function calculateCost(
  provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  if (provider === 'deepseek') {
    const pricing = PRICING.deepseek[model as keyof typeof PRICING.deepseek];
    if (!pricing) return 0;
    
    const isOffPeak = isOffPeakHour();
    const inputCost = (inputTokens / 1000000) * (isOffPeak ? pricing.input.offPeak : pricing.input.standard);
    const outputCost = (outputTokens / 1000000) * (isOffPeak ? pricing.output.offPeak : pricing.output.standard);
    return inputCost + outputCost;
  }
  
  if (provider === 'openai') {
    const pricing = PRICING.openai[model as keyof typeof PRICING.openai];
    if (!pricing) return 0;
    
    const inputCost = (inputTokens / 1000000) * pricing.input;
    const outputCost = (outputTokens / 1000000) * pricing.output;
    return inputCost + outputCost;
  }
  
  return 0; // Mock provider is free
}
