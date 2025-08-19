// Mock AI Provider Implementation
// Provides high-quality mock responses for testing and demo purposes

import { AIProvider, AIRequest, AIResponse, AIProviderConfig, MockConfig, UsageStats, AIServiceError } from '../types';

export class MockProvider implements AIProvider {
  readonly name = 'Mock';
  readonly type = 'mock' as const;
  
  private config: MockConfig;
  private stats: UsageStats;
  private initialized = false;

  constructor() {
    this.stats = {
      provider: 'mock',
      requests: 0,
      tokens: { input: 0, output: 0, total: 0 },
      cost: 0,
      errors: 0,
      lastUsed: 0
    };
    
    this.config = {
      type: 'mock',
      enabled: true,
      responseDelay: 500,
      simulateErrors: false,
      errorRate: 0.05
    };
  }

  async initialize(config: AIProviderConfig): Promise<void> {
    this.config = { ...this.config, ...config } as MockConfig;
    this.initialized = true;
  }

  isAvailable(): boolean {
    return this.initialized && this.config.enabled !== false;
  }

  async generateContent(request: AIRequest): Promise<AIResponse> {
    if (!this.isAvailable()) {
      throw new AIServiceError(
        'Mock provider is not available',
        'mock',
        'PROVIDER_UNAVAILABLE',
        false
      );
    }

    const startTime = Date.now();
    this.stats.requests++;

    // Simulate network delay
    if (this.config.responseDelay && this.config.responseDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.config.responseDelay));
    }

    // Simulate errors if configured
    if (this.config.simulateErrors && Math.random() < (this.config.errorRate || 0.05)) {
      this.stats.errors++;
      throw new AIServiceError(
        'Simulated mock provider error',
        'mock',
        'SIMULATED_ERROR',
        true
      );
    }

    try {
      const response = this.generateMockResponse(request);
      
      // Update statistics
      this.stats.tokens.input += response.usage.promptTokens;
      this.stats.tokens.output += response.usage.completionTokens;
      this.stats.tokens.total += response.usage.totalTokens;
      this.stats.lastUsed = Date.now();

      return response;
    } catch (error) {
      this.stats.errors++;
      throw new AIServiceError(
        'Mock provider generation failed',
        'mock',
        'GENERATION_ERROR',
        false,
        error as Error
      );
    }
  }

  private generateMockResponse(request: AIRequest): AIResponse {
    const lastMessage = request.messages[request.messages.length - 1];
    const userContent = lastMessage?.content || '';
    
    // Analyze the request to generate appropriate mock content
    const content = this.generateContextualMockContent(userContent, request.messages);
    
    // Estimate token usage based on content length
    const promptTokens = this.estimateTokens(request.messages.map(m => m.content).join(' '));
    const completionTokens = this.estimateTokens(content);
    
    return {
      content,
      model: request.model || 'mock-model',
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens
      },
      provider: 'mock',
      timestamp: Date.now(),
      cost: 0 // Mock is free
    };
  }

  private generateContextualMockContent(userContent: string, messages: any[]): string {
    const content = userContent.toLowerCase();
    
    // Marketing content generation
    if (content.includes('homepage') || content.includes('landing page')) {
      return this.generateHomepageMock();
    }
    
    if (content.includes('about') || content.includes('company')) {
      return this.generateAboutMock();
    }
    
    if (content.includes('blog') || content.includes('article')) {
      return this.generateBlogMock();
    }
    
    if (content.includes('faq') || content.includes('questions')) {
      return this.generateFAQMock();
    }
    
    if (content.includes('seo') || content.includes('keywords')) {
      return this.generateSEOMock();
    }
    
    // Project analysis
    if (content.includes('analyze') || content.includes('project')) {
      return this.generateProjectAnalysisMock();
    }
    
    // General responses
    if (content.includes('hello') || content.includes('hi')) {
      return "Hello! I'm a mock AI assistant ready to help you with content generation and project analysis.";
    }
    
    // Default professional response
    return this.generateDefaultMock(userContent);
  }

  private generateHomepageMock(): string {
    return `# Transform Your Ideas Into Reality

Welcome to the future of development. Our cutting-edge platform empowers developers to build, deploy, and scale applications with unprecedented ease and efficiency.

## Why Choose Our Platform?

🚀 **Lightning Fast Development** - Accelerate your workflow with our intuitive tools and pre-built components.

🔧 **Enterprise-Grade Security** - Built with security-first principles to protect your applications and data.

📈 **Scalable Architecture** - From startup to enterprise, our platform grows with your needs.

🌍 **Global Deployment** - Deploy anywhere in the world with our distributed infrastructure.

## Get Started Today

Join thousands of developers who have already transformed their development process. Start building your next great application in minutes, not hours.

[Get Started Free] [View Documentation] [Contact Sales]

*Trusted by leading companies worldwide*`;
  }

  private generateAboutMock(): string {
    return `# About Our Mission

We're passionate about empowering developers to create exceptional software experiences. Founded by a team of experienced engineers and entrepreneurs, we understand the challenges of modern software development.

## Our Story

Born from the frustration of complex deployment processes and fragmented development tools, we set out to create a unified platform that simplifies the entire development lifecycle.

## Our Values

**Innovation First** - We constantly push the boundaries of what's possible in development tooling.

**Developer Experience** - Every feature is designed with the developer's workflow in mind.

**Open Source** - We believe in the power of community-driven development.

**Reliability** - Your applications deserve infrastructure you can trust.

## The Team

Our diverse team brings together expertise from leading technology companies, with a shared vision of making development more accessible and enjoyable for everyone.

Ready to join our mission? [Explore Careers] [Contact Us]`;
  }

  private generateBlogMock(): string {
    return `# The Future of Modern Development: Trends to Watch in 2024

The software development landscape continues to evolve at breakneck speed. As we navigate through 2024, several key trends are reshaping how we build, deploy, and maintain applications.

## 1. AI-Powered Development Tools

Artificial intelligence is no longer just a feature—it's becoming an integral part of the development process. From code generation to automated testing, AI tools are helping developers work more efficiently than ever before.

## 2. Edge Computing Revolution

With the rise of IoT and real-time applications, edge computing is moving from nice-to-have to necessity. Applications are getting closer to users, reducing latency and improving performance.

## 3. Sustainable Software Engineering

Environmental consciousness is driving new approaches to software development. Green coding practices and energy-efficient architectures are becoming standard considerations.

## 4. Enhanced Developer Experience

The focus on developer productivity continues to intensify. Better tooling, improved documentation, and streamlined workflows are key differentiators for successful platforms.

## Conclusion

The future of development is bright, with innovations that promise to make building software more accessible, efficient, and enjoyable. Stay tuned for more insights on these evolving trends.

*What trends are you most excited about? Share your thoughts in the comments below.*`;
  }

  private generateFAQMock(): string {
    return `# Frequently Asked Questions

## Getting Started

**Q: How quickly can I get started?**
A: You can be up and running in under 5 minutes. Simply sign up, follow our quick start guide, and deploy your first application.

**Q: Do I need any special technical knowledge?**
A: While basic development knowledge is helpful, our platform is designed to be accessible to developers of all skill levels.

## Pricing & Plans

**Q: Is there a free tier available?**
A: Yes! Our free tier includes generous limits for personal projects and small applications.

**Q: Can I upgrade or downgrade my plan anytime?**
A: Absolutely. You can change your plan at any time, and changes take effect immediately.

## Technical Support

**Q: What kind of support do you offer?**
A: We provide 24/7 technical support for all paid plans, plus comprehensive documentation and community forums.

**Q: How do you handle data security?**
A: Security is our top priority. We use enterprise-grade encryption, regular security audits, and comply with industry standards.

## Integration & Compatibility

**Q: Which programming languages do you support?**
A: We support all major programming languages including JavaScript, Python, Java, Go, and many more.

**Q: Can I integrate with my existing tools?**
A: Yes! We offer extensive APIs and integrations with popular development tools and services.

*Have a question not listed here? [Contact our support team] for personalized assistance.*`;
  }

  private generateSEOMock(): string {
    return `developer tools, software development platform, application deployment, cloud infrastructure, DevOps automation, continuous integration, scalable applications, enterprise development, API management`;
  }

  private generateProjectAnalysisMock(): string {
    return `# Project Analysis Summary

## Technology Stack Detected
- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Deployment**: Docker, GitHub Actions

## Key Features Identified
✅ Modern component-based architecture
✅ Type-safe development with TypeScript
✅ Responsive design implementation
✅ API-first backend design
✅ Automated testing setup

## Marketing Opportunities
🎯 **Target Audience**: Full-stack developers, startups, enterprise teams
🎯 **Key Value Props**: Developer productivity, type safety, modern architecture
🎯 **Competitive Advantages**: Comprehensive tooling, excellent developer experience

## Recommendations
1. Highlight the modern tech stack in marketing materials
2. Emphasize developer productivity benefits
3. Showcase real-world use cases and success stories
4. Create technical content demonstrating best practices

*Analysis complete. Ready to generate marketing content based on these insights.*`;
  }

  private generateDefaultMock(userContent: string): string {
    return `Thank you for your request. I understand you're looking for assistance with: "${userContent}"

As a mock AI assistant, I'm designed to provide realistic responses for testing and demonstration purposes. In a production environment, this would be handled by a real AI service like DeepSeek or OpenAI.

Here are some key points I can help with:
- Content generation and marketing copy
- Project analysis and technical insights
- SEO optimization and keyword research
- Documentation and user guides

How can I assist you further with your project?`;
  }

  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  async testConnection(): Promise<boolean> {
    return this.isAvailable();
  }

  getUsageStats(): UsageStats {
    return { ...this.stats };
  }

  getCostEstimate(tokens: number): number {
    return 0; // Mock provider is always free
  }

  // Mock-specific methods
  setResponseDelay(delay: number): void {
    this.config.responseDelay = delay;
  }

  enableErrorSimulation(enabled: boolean, errorRate: number = 0.05): void {
    this.config.simulateErrors = enabled;
    this.config.errorRate = errorRate;
  }

  resetStats(): void {
    this.stats = {
      provider: 'mock',
      requests: 0,
      tokens: { input: 0, output: 0, total: 0 },
      cost: 0,
      errors: 0,
      lastUsed: 0
    };
  }
}
