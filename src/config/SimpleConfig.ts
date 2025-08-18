import * as vscode from 'vscode';

// Simplified configuration for MVP
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

// Simple validation - just check if basic settings exist
export function validateConfig(): string[] {
    const errors: string[] = [];
    const config = getConfig();
    
    // Basic validation only
    if (!config.get('language')) {
        errors.push('Language setting is missing');
    }
    
    return errors;
}
