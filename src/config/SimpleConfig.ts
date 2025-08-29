import * as vscode from 'vscode';
import { AIServiceConfig, AIProviderConfig, ExtendedAIProviderConfig } from '../ai/types';

// Enhanced configuration for AI service providers
export function getConfig() {
    return vscode.workspace.getConfiguration('lumosGen');
}

export function getLanguage(): string {
    return getConfig().get('language', 'en');
}

export function getMarketingSettings() {
    return getConfig().get('marketingSettings', {
        tone: 'professional',
        includeCodeExamples: true,
        targetMarkets: ['global'],
        seoOptimization: true
    });
}

// Enhanced AI service configuration
export function getAIServiceConfig(): AIServiceConfig {
    const config = getConfig();
    const aiService = config.get('aiService', {}) as any;

    // Legacy support for old configuration format
    const legacyApiKey = config.get('openai.apiKey') || (aiService && aiService.apiKey);
    const legacyModel = (aiService && aiService.model) || 'gpt-4o-mini';

    // Determine primary provider based on configuration
    let primaryProvider: AIProviderConfig;
    let fallbackProvider: AIProviderConfig | undefined;

    // Check if DeepSeek is configured
    const deepseekApiKey = aiService.deepseekApiKey || aiService.apiKey;
    const openaiApiKey = aiService.openaiApiKey || legacyApiKey;

    if (deepseekApiKey && deepseekApiKey !== '' && deepseekApiKey !== 'mock') {
        // DeepSeek as primary
        primaryProvider = {
            type: 'deepseek',
            apiKey: deepseekApiKey,
            endpoint: aiService.deepseekEndpoint || 'https://api.deepseek.com',
            model: aiService.deepseekModel || 'deepseek-chat',
            enabled: true
        };

        // OpenAI as fallback if configured
        if (openaiApiKey && openaiApiKey !== '' && openaiApiKey !== 'mock') {
            fallbackProvider = {
                type: 'openai',
                apiKey: openaiApiKey,
                endpoint: aiService.openaiEndpoint || 'https://api.openai.com/v1',
                model: aiService.openaiModel || legacyModel,
                enabled: true
            };
        }
    } else if (openaiApiKey && openaiApiKey !== '' && openaiApiKey !== 'mock') {
        // OpenAI as primary
        primaryProvider = {
            type: 'openai',
            apiKey: openaiApiKey,
            endpoint: aiService.openaiEndpoint || aiService.endpoint || 'https://api.openai.com/v1',
            model: aiService.openaiModel || legacyModel,
            enabled: true
        };
    } else {
        // Mock as primary (no API keys configured)
        primaryProvider = {
            type: 'mock',
            enabled: true
        };
    }

    return {
        primary: primaryProvider,
        fallback: fallbackProvider,
        mock: {
            type: 'mock',
            enabled: true,
            responseDelay: aiService.mockResponseDelay || 500,
            simulateErrors: aiService.mockSimulateErrors || false,
            errorRate: aiService.mockErrorRate || 0.05
        } as ExtendedAIProviderConfig,
        degradationStrategy: aiService.degradationStrategy || ['deepseek', 'openai', 'mock'],
        monitoring: {
            enabled: aiService.monitoringEnabled !== false,
            trackCosts: aiService.trackCosts !== false,
            trackUsage: aiService.trackUsage !== false
        }
    };
}

// Get specific provider configuration
export function getProviderConfig(providerType: 'deepseek' | 'openai' | 'mock'): AIProviderConfig | null {
    const aiConfig = getAIServiceConfig();

    if (aiConfig.primary.type === providerType) {
        return aiConfig.primary;
    }

    if (aiConfig.fallback?.type === providerType) {
        return aiConfig.fallback;
    }

    if (providerType === 'mock') {
        return aiConfig.mock;
    }

    return null;
}

// Enhanced validation with AI service checks
export function validateConfig(): string[] {
    const errors: string[] = [];
    const config = getConfig();
    const aiConfig = getAIServiceConfig();

    // Basic validation
    if (!config.get('language')) {
        errors.push('Language setting is missing');
    }

    // AI service validation
    if (aiConfig.primary.type !== 'mock' && !aiConfig.primary.apiKey) {
        errors.push(`${aiConfig.primary.type} API key is required but not configured`);
    }

    if (aiConfig.fallback && aiConfig.fallback.type !== 'mock' && !aiConfig.fallback.apiKey) {
        errors.push(`${aiConfig.fallback.type} fallback API key is required but not configured`);
    }

    // Validate degradation strategy
    const validProviders = ['deepseek', 'openai', 'mock'];
    const strategy = aiConfig.degradationStrategy;

    if (!strategy || strategy.length === 0) {
        errors.push('Degradation strategy must include at least one provider');
    } else {
        for (const provider of strategy) {
            if (!validProviders.includes(provider)) {
                errors.push(`Invalid provider in degradation strategy: ${provider}`);
            }
        }

        // Ensure mock is always included as final fallback
        if (!strategy.includes('mock')) {
            errors.push('Degradation strategy must include "mock" as final fallback');
        }
    }

    return errors;
}

// Configuration helpers
export function hasValidAPIKey(): boolean {
    const aiConfig = getAIServiceConfig();
    return aiConfig.primary.type === 'mock' || !!aiConfig.primary.apiKey;
}

export function getConfiguredProviders(): string[] {
    const aiConfig = getAIServiceConfig();
    const providers: string[] = [];

    if (aiConfig.primary.apiKey || aiConfig.primary.type === 'mock') {
        providers.push(aiConfig.primary.type);
    }

    if (aiConfig.fallback && (aiConfig.fallback.apiKey || aiConfig.fallback.type === 'mock')) {
        providers.push(aiConfig.fallback.type);
    }

    // Mock is always available
    if (!providers.includes('mock')) {
        providers.push('mock');
    }

    return providers;
}

export function isMonitoringEnabled(): boolean {
    const aiConfig = getAIServiceConfig();
    return aiConfig.monitoring.enabled;
}

export function shouldTrackCosts(): boolean {
    const aiConfig = getAIServiceConfig();
    return aiConfig.monitoring.trackCosts;
}
