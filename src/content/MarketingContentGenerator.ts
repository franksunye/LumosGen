import * as vscode from 'vscode';
import { ProjectAnalysis } from '../analysis/ProjectAnalyzer';
import { SimpleAI } from '../ai/SimpleAI';

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
    private ai: SimpleAI;

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
        this.ai = new SimpleAI(outputChannel);
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
        return await this.ai.generateContent(prompt);
    }

    private async generateAboutPage(analysis: ProjectAnalysis, options: ContentGenerationOptions): Promise<string> {
        const prompt = `Generate an about page for project: ${analysis.metadata.name}`;
        return await this.ai.generateContent(prompt);
    }

    private async generateBlogPost(analysis: ProjectAnalysis, options: ContentGenerationOptions): Promise<string> {
        const prompt = `Generate a blog post about project: ${analysis.metadata.name}`;
        return await this.ai.generateContent(prompt);
    }

    private async generateFAQ(analysis: ProjectAnalysis, options: ContentGenerationOptions): Promise<string> {
        const prompt = `Generate FAQ for project: ${analysis.metadata.name}`;
        return await this.ai.generateContent(prompt);
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

    // Removed duplicate method - already defined above

    // Removed duplicate method - already defined above

    // Removed duplicate method - already defined above

    // Removed duplicate method - already defined above
}
