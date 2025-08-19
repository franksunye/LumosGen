import * as vscode from 'vscode';
import { ProjectAnalysis } from '../analysis/ProjectAnalyzer';
import { AIServiceProvider } from '../ai/AIServiceProvider';
import { AIRequest } from '../ai/types';

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

    constructor(outputChannel: vscode.OutputChannel, aiService?: AIServiceProvider) {
        this.outputChannel = outputChannel;
        this.aiService = aiService;
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
        const prompt = `Generate a marketing homepage for project: ${analysis.metadata.name}`;
        return await this.generateContent(prompt);
    }

    private async generateAboutPage(analysis: ProjectAnalysis, options: ContentGenerationOptions): Promise<string> {
        const prompt = `Generate an about page for project: ${analysis.metadata.name}`;
        return await this.generateContent(prompt);
    }

    private async generateBlogPost(analysis: ProjectAnalysis, options: ContentGenerationOptions): Promise<string> {
        const prompt = `Generate a blog post about project: ${analysis.metadata.name}`;
        return await this.generateContent(prompt);
    }

    private async generateFAQ(analysis: ProjectAnalysis, options: ContentGenerationOptions): Promise<string> {
        const prompt = `Generate FAQ for project: ${analysis.metadata.name}`;
        return await this.generateContent(prompt);
    }

    private async generateContent(prompt: string): Promise<string> {
        if (this.aiService) {
            try {
                const request: AIRequest = {
                    messages: [
                        { role: 'user', content: prompt }
                    ]
                };
                const response = await this.aiService.generateContent(request);
                return response.content;
            } catch (error) {
                this.outputChannel.appendLine(`AI service failed, using fallback: ${error}`);
                return this.generateFallbackContent(prompt);
            }
        } else {
            return this.generateFallbackContent(prompt);
        }
    }

    private generateFallbackContent(prompt: string): string {
        // Simple fallback content generation
        if (prompt.includes('homepage')) {
            return `# Welcome to Our Platform\n\nTransform your development workflow with our innovative tools and solutions.`;
        } else if (prompt.includes('about')) {
            return `# About Us\n\nWe are passionate about creating tools that empower developers to build amazing software.`;
        } else if (prompt.includes('FAQ')) {
            return `# Frequently Asked Questions\n\n**Q: How do I get started?**\nA: Simply follow our quick start guide to begin using our platform.`;
        } else if (prompt.includes('blog')) {
            return `# Latest Insights\n\nDiscover the latest trends and best practices in software development.`;
        }
        return `Generated content for: ${prompt}`;
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
}
