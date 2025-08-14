import * as vscode from 'vscode';

export interface LumosGenConfig {
  enabled: boolean;
  watchPatterns: string[];
  outputFile: string;
  aiService: {
    type: 'openai' | 'mock';
    endpoint: string;
    apiKey: string;
    model: string;
  };
  triggerDelay: number;
  template: 'summary' | 'toc' | 'changelog';
}

export class ConfigManager {
  private static instance: ConfigManager;
  private config: LumosGenConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  public getConfig(): LumosGenConfig {
    return this.config;
  }

  public reloadConfig(): void {
    this.config = this.loadConfig();
  }

  private loadConfig(): LumosGenConfig {
    const config = vscode.workspace.getConfiguration('lumosGen');
    
    return {
      enabled: config.get<boolean>('enabled', true),
      watchPatterns: config.get<string[]>('watchPatterns', ['**/*.md']),
      outputFile: config.get<string>('outputFile', 'LumosGen-Summary.md'),
      aiService: config.get('aiService', {
        type: 'mock',
        endpoint: '',
        apiKey: '',
        model: 'gpt-3.5-turbo'
      }),
      triggerDelay: config.get<number>('triggerDelay', 2000),
      template: config.get<'summary' | 'toc' | 'changelog'>('template', 'summary')
    };
  }

  public validateConfig(): string[] {
    const errors: string[] = [];
    
    if (this.config.aiService.type === 'openai') {
      if (!this.config.aiService.apiKey) {
        errors.push('OpenAI API key is required when using OpenAI service');
      }
      if (!this.config.aiService.endpoint) {
        errors.push('OpenAI endpoint is required when using OpenAI service');
      }
    }

    if (this.config.triggerDelay < 0) {
      errors.push('Trigger delay must be non-negative');
    }

    return errors;
  }
}
