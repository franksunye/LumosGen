import * as vscode from 'vscode';
import axios from 'axios';

export interface AIServiceConfig {
    type: 'openai' | 'anthropic' | 'mock';
    endpoint: string;
    apiKey: string;
    model: string;
}

export interface AIPrompt {
    system: string;
    user: string;
    context?: any;
}

export interface AIResponse {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    model: string;
}

export abstract class AIServiceProvider {
    protected config: AIServiceConfig;
    protected outputChannel: vscode.OutputChannel;

    constructor(config: AIServiceConfig, outputChannel: vscode.OutputChannel) {
        this.config = config;
        this.outputChannel = outputChannel;
    }

    abstract generateContent(prompt: AIPrompt): Promise<AIResponse>;
    
    static create(config: AIServiceConfig, outputChannel: vscode.OutputChannel): AIServiceProvider {
        switch (config.type) {
            case 'openai':
                return new OpenAIProvider(config, outputChannel);
            case 'anthropic':
                return new AnthropicProvider(config, outputChannel);
            case 'mock':
            default:
                return new MockAIProvider(config, outputChannel);
        }
    }
}

export class OpenAIProvider extends AIServiceProvider {
    async generateContent(prompt: AIPrompt): Promise<AIResponse> {
        if (!this.config.apiKey) {
            throw new Error('OpenAI API key not configured. Please set lumosGen.aiService.apiKey in settings.');
        }

        try {
            this.outputChannel.appendLine('Calling OpenAI API...');
            
            const response = await axios.post(
                `${this.config.endpoint}/chat/completions`,
                {
                    model: this.config.model,
                    messages: [
                        { role: 'system', content: prompt.system },
                        { role: 'user', content: prompt.user }
                    ],
                    max_tokens: 2000,
                    temperature: 0.7
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );

            const choice = response.data.choices[0];
            return {
                content: choice.message.content,
                usage: response.data.usage,
                model: this.config.model
            };

        } catch (error: any) {
            this.outputChannel.appendLine(`OpenAI API error: ${error.message}`);
            if (error.response?.status === 401) {
                throw new Error('Invalid OpenAI API key. Please check your configuration.');
            } else if (error.response?.status === 429) {
                throw new Error('OpenAI API rate limit exceeded. Please try again later.');
            } else {
                throw new Error(`OpenAI API error: ${error.message}`);
            }
        }
    }
}

export class AnthropicProvider extends AIServiceProvider {
    async generateContent(prompt: AIPrompt): Promise<AIResponse> {
        if (!this.config.apiKey) {
            throw new Error('Anthropic API key not configured. Please set lumosGen.aiService.apiKey in settings.');
        }

        try {
            this.outputChannel.appendLine('Calling Anthropic API...');
            
            const response = await axios.post(
                `${this.config.endpoint}/v1/messages`,
                {
                    model: this.config.model,
                    max_tokens: 2000,
                    system: prompt.system,
                    messages: [
                        { role: 'user', content: prompt.user }
                    ]
                },
                {
                    headers: {
                        'x-api-key': this.config.apiKey,
                        'Content-Type': 'application/json',
                        'anthropic-version': '2023-06-01'
                    },
                    timeout: 30000
                }
            );

            return {
                content: response.data.content[0].text,
                usage: response.data.usage,
                model: this.config.model
            };

        } catch (error: any) {
            this.outputChannel.appendLine(`Anthropic API error: ${error.message}`);
            if (error.response?.status === 401) {
                throw new Error('Invalid Anthropic API key. Please check your configuration.');
            } else {
                throw new Error(`Anthropic API error: ${error.message}`);
            }
        }
    }
}

export class MockAIProvider extends AIServiceProvider {
    async generateContent(prompt: AIPrompt): Promise<AIResponse> {
        this.outputChannel.appendLine('Using Mock AI Provider for content generation...');
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        // Generate realistic mock content based on the prompt
        let content = '';
        
        if (prompt.user.includes('homepage') || prompt.user.includes('marketing')) {
            content = this.generateMockHomepage(prompt.context);
        } else if (prompt.user.includes('about') || prompt.user.includes('project description')) {
            content = this.generateMockAbout(prompt.context);
        } else if (prompt.user.includes('blog') || prompt.user.includes('article')) {
            content = this.generateMockBlog(prompt.context);
        } else if (prompt.user.includes('faq') || prompt.user.includes('questions')) {
            content = this.generateMockFAQ(prompt.context);
        } else {
            content = this.generateGenericContent(prompt.context);
        }

        return {
            content,
            usage: {
                promptTokens: prompt.user.length / 4,
                completionTokens: content.length / 4,
                totalTokens: (prompt.user.length + content.length) / 4
            },
            model: 'mock-ai-v1'
        };
    }

    private generateMockHomepage(context: any): string {
        const projectName = context?.projectName || 'Your Project';
        return `# Welcome to ${projectName}

## 🚀 Revolutionary Solution for Modern Developers

${projectName} transforms the way you work with cutting-edge technology and intuitive design. Built for developers who demand excellence and efficiency.

### ✨ Key Features
- **Lightning Fast** - Optimized performance for maximum productivity
- **Developer Friendly** - Intuitive API and comprehensive documentation  
- **Highly Scalable** - Grows with your project needs
- **Open Source** - Community-driven development and transparency

### 🎯 Perfect For
- Full-stack developers building modern applications
- Teams looking to streamline their development workflow
- Projects requiring reliable and maintainable solutions

## Get Started in Minutes

\`\`\`bash
npm install ${projectName.toLowerCase()}
${projectName.toLowerCase()} init
${projectName.toLowerCase()} start
\`\`\`

[📚 Documentation](./docs) | [🚀 Quick Start](./quickstart) | [💬 Community](./community)`;
    }

    private generateMockAbout(context: any): string {
        const projectName = context?.projectName || 'Your Project';
        return `# About ${projectName}

## Our Mission

${projectName} was created to solve real-world challenges faced by modern developers. We believe that great tools should be powerful yet simple, flexible yet opinionated.

## What Makes Us Different

- **Developer-First Approach** - Every decision is made with developer experience in mind
- **Performance Optimized** - Built from the ground up for speed and efficiency
- **Community Driven** - Open source with active community contributions
- **Future Ready** - Designed to evolve with changing technology landscapes

## Technical Excellence

Our architecture is built on proven principles:
- Modular design for maximum flexibility
- Comprehensive testing for reliability
- Clear documentation for ease of use
- Continuous integration for quality assurance

## Join Our Community

We're more than just code - we're a community of developers passionate about building better tools together.`;
    }

    private generateMockBlog(context: any): string {
        const projectName = context?.projectName || 'Your Project';
        return `# Building the Future with ${projectName}

*A deep dive into our technical decisions and development journey*

## Introduction

When we started building ${projectName}, we had a clear vision: create a tool that developers would actually want to use. This post explores the technical decisions, challenges, and lessons learned along the way.

## The Challenge

Modern development requires tools that are both powerful and approachable. We identified key pain points:
- Complexity in existing solutions
- Poor developer experience
- Limited customization options
- Inadequate documentation

## Our Solution

${projectName} addresses these challenges through:

### 1. Intuitive Design
We prioritized developer experience from day one, ensuring that common tasks are simple while advanced features remain accessible.

### 2. Performance First
Every component is optimized for speed, from initial load times to complex operations.

### 3. Extensible Architecture
Built with modularity in mind, allowing developers to customize and extend functionality.

## What's Next

We're continuously evolving based on community feedback and emerging needs. Exciting features are coming soon!`;
    }

    private generateMockFAQ(context: any): string {
        const projectName = context?.projectName || 'Your Project';
        return `# Frequently Asked Questions

## General Questions

### What is ${projectName}?
${projectName} is a modern development tool designed to enhance productivity and streamline workflows for developers and teams.

### Is ${projectName} free?
Yes! ${projectName} is open source and free to use. You can find the source code on GitHub.

### Who should use ${projectName}?
${projectName} is perfect for developers, teams, and organizations looking to improve their development processes.

## Technical Questions

### What are the system requirements?
- Node.js 16+ (recommended: latest LTS)
- 4GB RAM minimum, 8GB recommended
- Modern operating system (Windows, macOS, Linux)

### How do I get started?
1. Install ${projectName} via npm
2. Run the initialization command
3. Follow our quick start guide
4. Explore the documentation

### Can I contribute?
Absolutely! We welcome contributions of all kinds - code, documentation, bug reports, and feature requests.

## Support

### Where can I get help?
- Check our documentation
- Search existing GitHub issues
- Join our community discussions
- Contact our support team

### How do I report bugs?
Please use our GitHub issue tracker to report bugs. Include as much detail as possible to help us resolve issues quickly.`;
    }

    private generateGenericContent(context: any): string {
        return `# Generated Content

This is AI-generated content based on your project analysis. The content has been tailored to highlight your project's key features and benefits.

## Key Points
- Professional presentation of your project
- Optimized for your target audience
- SEO-friendly structure and content
- Ready for immediate use

## Next Steps
1. Review the generated content
2. Customize as needed for your specific requirements
3. Deploy to your preferred platform
4. Share with your community

*Generated by LumosGen Marketing AI*`;
    }
}
