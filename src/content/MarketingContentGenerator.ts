import * as vscode from 'vscode';
import { ProjectAnalysis } from '../analysis/ProjectAnalyzer';
import { AIServiceProvider } from '../ai/AIServiceProvider';
import { AIRequest } from '../ai/types';
import { PromptTemplateLibrary } from './PromptTemplates';
import { ContentValidator, ValidationResult } from './ContentValidator';

export interface GeneratedContent {
    homepage: string;
    aboutPage: string;
    blogPost?: string;
    faq: string;
    metadata: {
        title: string;
        description: string;
        keywords: string[];
        author: string;
        language: string;
    };
}

export interface ContentGenerationOptions {
    tone: 'professional' | 'casual' | 'technical' | 'friendly';
    includeCodeExamples: boolean;
    targetMarkets: string[];
    seoOptimization: boolean;
    language: string;
}

export class MarketingContentGenerator {
    private outputChannel: vscode.OutputChannel;
    private aiService?: AIServiceProvider;
    private promptLibrary: PromptTemplateLibrary;
    private validator: ContentValidator;

    constructor(outputChannel: vscode.OutputChannel, aiService?: AIServiceProvider) {
        this.outputChannel = outputChannel;
        this.aiService = aiService;
        this.promptLibrary = new PromptTemplateLibrary();
        this.validator = new ContentValidator();
    }

    async generateMarketingContent(
        analysis: ProjectAnalysis, 
        options: ContentGenerationOptions
    ): Promise<GeneratedContent> {
        this.outputChannel.appendLine('Generating marketing content...');

        try {
            const content: GeneratedContent = {
                homepage: await this.generateHomepage(analysis, options),
                aboutPage: await this.generateAboutPage(analysis, options),
                faq: await this.generateFAQ(analysis, options),
                metadata: this.generateMetadata(analysis, options)
            };

            // Optionally generate blog post
            if (analysis.features.length > 3) {
                this.outputChannel.appendLine('Generating blog post...');
                content.blogPost = await this.generateBlogPost(analysis, options);
            }

            this.outputChannel.appendLine('Marketing content generated successfully');
            return content;

        } catch (error: any) {
            this.outputChannel.appendLine(`Content generation failed: ${error}`);
            throw new Error(`Content generation failed: ${error?.message || error}`);
        }
    }

    private async generateHomepage(analysis: ProjectAnalysis, options: ContentGenerationOptions): Promise<string> {
        return await this.generateContentWithTemplate('homepage', analysis, options);
    }

    private async generateAboutPage(analysis: ProjectAnalysis, options: ContentGenerationOptions): Promise<string> {
        return await this.generateContentWithTemplate('about', analysis, options);
    }

    private async generateBlogPost(analysis: ProjectAnalysis, options: ContentGenerationOptions): Promise<string> {
        return await this.generateContentWithTemplate('blog', analysis, options);
    }

    private async generateFAQ(analysis: ProjectAnalysis, options: ContentGenerationOptions): Promise<string> {
        return await this.generateContentWithTemplate('faq', analysis, options);
    }

    private async generateContentWithTemplate(
        templateName: string,
        analysis: ProjectAnalysis,
        options: ContentGenerationOptions,
        maxRetries: number = 2
    ): Promise<string> {
        this.outputChannel.appendLine(`Generating ${templateName} content with structured template...`);

        try {
            // Generate structured prompt using template library
            const prompt = this.promptLibrary.generatePrompt(templateName, analysis, options);

            let bestContent = '';
            let bestScore = 0;
            let validationResult: ValidationResult | null = null;

            // Try generating content with validation and retry logic
            for (let attempt = 0; attempt <= maxRetries; attempt++) {
                this.outputChannel.appendLine(`Attempt ${attempt + 1} for ${templateName} content...`);

                const content = await this.generateContent(prompt, attempt > 0);

                // Validate the generated content
                validationResult = this.validateContent(content, templateName);

                this.outputChannel.appendLine(`Content validation score: ${validationResult.score}/100`);

                // If content is good enough, use it
                if (validationResult.isValid && validationResult.score >= 85) {
                    this.outputChannel.appendLine(`✅ High-quality ${templateName} content generated successfully`);
                    return content;
                }

                // Keep track of the best attempt
                if (validationResult.score > bestScore) {
                    bestScore = validationResult.score;
                    bestContent = content;
                }

                // If not the last attempt, log issues and retry
                if (attempt < maxRetries) {
                    this.outputChannel.appendLine(`⚠️ Content quality below threshold (${validationResult.score}/100), retrying...`);
                    validationResult.errors.forEach(error => {
                        this.outputChannel.appendLine(`  Error: ${error.message}`);
                    });
                }
            }

            // If we couldn't generate good content, use the best attempt with warnings
            if (validationResult) {
                this.outputChannel.appendLine(`⚠️ Using best attempt with score ${bestScore}/100`);
                const suggestions = this.validator.generateImprovementSuggestions(validationResult);
                suggestions.forEach(suggestion => {
                    this.outputChannel.appendLine(`  Suggestion: ${suggestion}`);
                });
            }

            return bestContent || this.generateFallbackContent(templateName);

        } catch (error) {
            this.outputChannel.appendLine(`Template-based generation failed: ${error}`);
            return this.generateFallbackContent(templateName);
        }
    }

    private async generateContent(prompt: string, isRetry: boolean = false): Promise<string> {
        if (this.aiService) {
            try {
                const request: AIRequest = {
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert technical writer specializing in developer-focused marketing content. Generate high-quality, structured content that follows the provided template exactly.'
                        },
                        {
                            role: 'user',
                            content: isRetry ?
                                `${prompt}\n\nIMPORTANT: This is a retry. Please pay extra attention to the structure requirements and ensure all sections are properly formatted.` :
                                prompt
                        }
                    ],
                    temperature: isRetry ? 0.5 : 0.7, // Lower temperature for retries
                    maxTokens: 2500
                };
                const response = await this.aiService.generateContent(request);
                return response.content;
            } catch (error) {
                this.outputChannel.appendLine(`AI service failed: ${error}`);
                throw error;
            }
        } else {
            throw new Error('AI service not available');
        }
    }

    private validateContent(content: string, templateName: string): ValidationResult {
        switch (templateName) {
            case 'homepage':
                return this.validator.validateHomepage(content);
            case 'about':
                return this.validator.validateAboutPage(content);
            case 'faq':
                return this.validator.validateFAQ(content);
            case 'blog':
                return this.validator.validateBlogPost(content);
            default:
                // Generic validation for unknown templates
                return {
                    isValid: true,
                    score: 75,
                    errors: [],
                    warnings: [],
                    suggestions: []
                };
        }
    }

    private generateFallbackContent(templateName: string): string {
        this.outputChannel.appendLine(`⚠️ Using fallback content for ${templateName}`);

        switch (templateName) {
            case 'homepage':
                return `# Welcome to Our Platform

Transform your development workflow with our innovative tools and solutions.

## 🚀 Key Features

- **Easy Integration**: Seamlessly integrates with your existing workflow
- **Powerful Automation**: Automate repetitive tasks and focus on what matters
- **Developer-Friendly**: Built by developers, for developers
- **Open Source**: Transparent, community-driven development

## 🎯 Why Choose Our Solution?

We understand the challenges developers face every day. Our platform is designed to eliminate friction and boost productivity.

## 🔧 Quick Start

1. Install the extension from the marketplace
2. Configure your preferences
3. Start building amazing things

---

**Ready to get started?** [Download now](#) and transform your workflow today.`;

            case 'about':
                return `# About Our Project

## 🎯 Our Mission

We're dedicated to creating tools that empower developers to build amazing software more efficiently.

## 📖 The Story

Born from the frustration of repetitive development tasks, our project aims to automate the mundane and amplify creativity.

## 🛠️ Built With Excellence

Our solution is built using modern technologies and best practices, ensuring reliability and performance.

## 💡 Our Values

- **Developer-First**: We understand developers because we are developers
- **Open & Transparent**: Community-driven development with clear documentation
- **Continuous Innovation**: Always improving and adding new features

---

*More than just a tool – it's a solution built by developers, for developers.*`;

            case 'faq':
                return `# Frequently Asked Questions

Get quick answers to common questions. Can't find what you're looking for? Contact us for additional support.

## 🚀 Getting Started

### What is this project?
A developer tool designed to streamline your workflow and boost productivity.

### How do I install it?
Follow the installation guide in our documentation for step-by-step instructions.

### What are the system requirements?
Compatible with modern development environments and popular tools.

## 🔧 Usage & Features

### How do I get started after installation?
Check out our quick start guide for the essential first steps.

### What are the key features?
Automation, integration, and developer-friendly design are our core strengths.

---

**Still have questions?** Check our documentation or open an issue on GitHub.`;

            case 'blog':
                return `# Introducing Our Latest Innovation

Discover how our latest features can transform your development workflow.

## 🎯 What Makes This Special?

We've focused on solving real developer problems with practical, efficient solutions.

## 🚀 Key Highlights

### Enhanced Productivity
Streamline your workflow with intelligent automation.

### Better Integration
Seamlessly works with your existing tools and processes.

### Developer Experience
Built with developer feedback and real-world usage in mind.

## 💡 Getting Started

Ready to try these new features? Check out our documentation and start exploring today.

---

**Ready to get started?** Visit our repository and see how it can improve your development workflow.`;

            default:
                return `# Generated Content

This is fallback content generated for ${templateName}.

## Overview

Content generation is temporarily using fallback mode.

## Next Steps

Please check the configuration and try again.`;
        }
    }

    private generateMetadata(analysis: ProjectAnalysis, options: ContentGenerationOptions) {
        return {
            title: analysis.metadata.name,
            description: analysis.metadata.description || 'An innovative software project',
            keywords: analysis.techStack.map(t => t.language).slice(0, 10),
            author: analysis.metadata.author || 'Developer',
            language: options.language
        };
    }

    /**
     * Get information about available content templates
     */
    getAvailableTemplates(): Array<{ name: string; description: string; structure: string[] }> {
        return this.promptLibrary.getAvailableTemplates().map(templateName => {
            const info = this.promptLibrary.getTemplateInfo(templateName);
            return info || { name: templateName, description: 'Template information not available', structure: [] };
        });
    }

    /**
     * Validate existing content against template requirements
     */
    validateExistingContent(content: string, templateName: string): ValidationResult {
        this.outputChannel.appendLine(`Validating existing ${templateName} content...`);
        const result = this.validateContent(content, templateName);

        this.outputChannel.appendLine(`Validation complete. Score: ${result.score}/100`);
        if (result.errors.length > 0) {
            this.outputChannel.appendLine('Errors found:');
            result.errors.forEach(error => {
                this.outputChannel.appendLine(`  - ${error.message}`);
            });
        }

        if (result.warnings.length > 0) {
            this.outputChannel.appendLine('Warnings:');
            result.warnings.forEach(warning => {
                this.outputChannel.appendLine(`  - ${warning.message}`);
            });
        }

        return result;
    }

    /**
     * Generate improvement suggestions for existing content
     */
    generateContentImprovements(content: string, templateName: string): string[] {
        const validationResult = this.validateContent(content, templateName);
        return this.validator.generateImprovementSuggestions(validationResult);
    }
}
