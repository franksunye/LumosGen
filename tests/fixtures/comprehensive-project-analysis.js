/**
 * 完整的项目分析测试数据
 * 提供各种场景下的项目分析结果
 */

const comprehensiveProjectAnalysis = {
    metadata: {
        name: 'LumosGen',
        description: 'AI-powered content generation VS Code extension for developers',
        version: '0.1.0',
        author: 'LumosGen Team',
        license: 'MIT',
        keywords: ['ai', 'content-generation', 'vscode-extension', 'typescript', 'react', 'automation'],
        repository: 'https://github.com/lumosgen/lumosgen',
        homepage: 'https://lumosgen.dev',
        bugs: 'https://github.com/lumosgen/lumosgen/issues'
    },
    
    techStack: [
        { language: 'TypeScript', framework: 'Node.js', category: 'backend', confidence: 0.95, files: 45 },
        { language: 'JavaScript', framework: 'React', category: 'frontend', confidence: 0.90, files: 12 },
        { language: 'HTML', framework: 'Webview API', category: 'ui', confidence: 0.85, files: 8 },
        { language: 'CSS', framework: 'Custom', category: 'styling', confidence: 0.80, files: 6 },
        { language: 'JSON', framework: 'Configuration', category: 'config', confidence: 1.0, files: 15 },
        { language: 'Markdown', framework: 'Documentation', category: 'docs', confidence: 0.95, files: 25 }
    ],
    
    features: [
        { 
            name: 'AI Content Generation', 
            description: 'Advanced AI-powered content generation with multiple providers',
            category: 'core', 
            importance: 1.0,
            implementation: 'complete',
            files: ['src/ai/AIServiceProvider.ts', 'src/content/ContentGenerator.ts']
        },
        { 
            name: 'Context Engineering', 
            description: 'Intelligent project analysis and context selection',
            category: 'core', 
            importance: 0.95,
            implementation: 'complete',
            files: ['src/analysis/ContextEngineering.ts', 'src/analysis/ContextSelector.ts']
        },
        { 
            name: 'Website Building', 
            description: 'Automated website generation with themes and deployment',
            category: 'automation', 
            importance: 0.90,
            implementation: 'complete',
            files: ['src/website/WebsiteBuilder.ts', 'src/website/ThemeManager.ts']
        },
        { 
            name: 'Agent System', 
            description: 'Multi-agent workflow orchestration',
            category: 'architecture', 
            importance: 0.85,
            implementation: 'complete',
            files: ['src/agents/AgentSystem.ts', 'src/agents/Workflow.ts']
        },
        { 
            name: 'VS Code Integration', 
            description: 'Native VS Code extension with sidebar and commands',
            category: 'integration', 
            importance: 0.95,
            implementation: 'complete',
            files: ['src/extension.ts', 'src/ui/SidebarProvider.ts']
        },
        { 
            name: 'Real-time Monitoring', 
            description: 'Performance monitoring and analytics',
            category: 'monitoring', 
            importance: 0.75,
            implementation: 'partial',
            files: ['src/ui/MonitoringPanel.ts']
        }
    ],
    
    documents: [
        {
            path: 'README.md',
            title: 'LumosGen - AI-Powered Content Generation',
            content: `# LumosGen

## Revolutionary AI-Powered Content Generation for Developers

LumosGen is a cutting-edge VS Code extension that transforms how developers create content. Using advanced AI technology and intelligent context engineering, it generates high-quality marketing materials, documentation, and websites automatically.

### 🚀 Key Features

- **🤖 Multi-Provider AI Integration**: Support for DeepSeek, OpenAI, and more
- **🧠 Intelligent Context Engineering**: Smart project analysis and content optimization
- **🎯 Multi-Agent Workflow**: Coordinated AI agents for complex tasks
- **🌐 Automated Website Building**: Generate complete websites with themes
- **📊 Real-time Monitoring**: Track performance and optimize results
- **🔧 VS Code Native**: Seamless integration with your development workflow

### 💡 Use Cases

- Generate compelling README files and documentation
- Create marketing websites and landing pages
- Build API documentation automatically
- Generate blog posts and technical articles
- Create social media content and press releases

### 🛠️ Technology Stack

- **Backend**: TypeScript, Node.js
- **Frontend**: React, HTML5, CSS3
- **AI**: DeepSeek API, OpenAI API
- **Platform**: VS Code Extension API
- **Deployment**: GitHub Pages, Vercel

### 📈 Performance

- **Content Generation**: < 30 seconds
- **Website Building**: < 2 minutes
- **Project Analysis**: < 10 seconds
- **AI Response Time**: < 5 seconds

### 🎯 Getting Started

\`\`\`bash
# Install from VS Code Marketplace
code --install-extension lumosgen.lumosgen

# Or install from VSIX
code --install-extension lumosgen-0.1.0.vsix
\`\`\`

### 🔧 Configuration

Configure your AI API keys in VS Code settings:

\`\`\`json
{
  "lumosGen.aiService.deepseekApiKey": "your-deepseek-key",
  "lumosGen.aiService.openaiApiKey": "your-openai-key",
  "lumosGen.aiService.degradationStrategy": ["deepseek", "openai"]
}
\`\`\`

### 📚 Documentation

- [User Guide](docs/USER_GUIDE.md)
- [API Reference](docs/API_REFERENCE.md)
- [Context Engineering](docs/CONTEXT_ENGINEERING.md)
- [Contributing](CONTRIBUTING.md)

### 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### 📄 License

MIT License - see [LICENSE](LICENSE) for details.

### 🌟 Support

- [GitHub Issues](https://github.com/lumosgen/lumosgen/issues)
- [Documentation](https://lumosgen.dev/docs)
- [Community Discord](https://discord.gg/lumosgen)

---

**Ready to revolutionize your content creation workflow? Get started with LumosGen today!**`,
            sections: ['Introduction', 'Features', 'Use Cases', 'Technology Stack', 'Performance', 'Getting Started', 'Configuration', 'Documentation', 'Contributing', 'License', 'Support'],
            codeBlocks: ['bash', 'json'],
            tokenCount: 450
        },
        {
            path: 'docs/USER_GUIDE.md',
            title: 'LumosGen User Guide',
            content: `# LumosGen User Guide

## Complete Guide to AI-Powered Content Generation

This comprehensive guide will help you master LumosGen and create amazing content with AI assistance.

### 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Basic Usage](#basic-usage)
3. [Advanced Features](#advanced-features)
4. [Best Practices](#best-practices)
5. [Troubleshooting](#troubleshooting)

### 🚀 Getting Started

#### Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "LumosGen"
4. Click Install

#### Initial Setup

1. Open Command Palette (Ctrl+Shift+P)
2. Run "LumosGen: Setup"
3. Configure your AI API keys
4. Select your preferred content style

### 💡 Basic Usage

#### Generating Content

1. Open your project in VS Code
2. Open LumosGen sidebar
3. Select content type (README, About, FAQ, etc.)
4. Click "Generate Content"
5. Review and customize the result

#### Content Types

- **README Files**: Project documentation
- **About Pages**: Company/project descriptions
- **FAQ Pages**: Frequently asked questions
- **Blog Posts**: Technical articles
- **API Documentation**: Code documentation
- **Marketing Copy**: Sales and marketing content

### 🔧 Advanced Features

#### Context Engineering

LumosGen analyzes your project to understand:
- Technology stack and frameworks
- Project structure and dependencies
- Existing documentation
- Code patterns and conventions

#### Multi-Agent Workflow

The system uses specialized AI agents:
- **Content Analyzer**: Understands project context
- **Content Generator**: Creates targeted content
- **Website Builder**: Builds complete websites
- **Quality Validator**: Ensures content quality

#### Customization Options

- **Tone**: Professional, casual, technical, friendly
- **Audience**: Developers, business users, general public
- **Length**: Brief, standard, comprehensive
- **Style**: Modern, classic, minimalist, bold

### 📊 Best Practices

#### Project Preparation

1. Ensure your project has a clear structure
2. Include a basic package.json or similar metadata
3. Add existing documentation for context
4. Use descriptive file and folder names

#### Content Optimization

1. Review generated content before publishing
2. Customize tone and style for your audience
3. Add project-specific details and examples
4. Maintain consistency across all content

#### Performance Tips

1. Use caching for repeated operations
2. Configure appropriate token limits
3. Choose the right analysis strategy
4. Monitor AI service usage

### 🛠️ Troubleshooting

#### Common Issues

**Content Generation Fails**
- Check API key configuration
- Verify internet connection
- Review project structure
- Check VS Code output panel

**Poor Content Quality**
- Improve project documentation
- Adjust tone and audience settings
- Use more specific content types
- Provide additional context

**Slow Performance**
- Enable caching
- Reduce analysis scope
- Use minimal analysis strategy
- Check system resources

#### Getting Help

- Check the [FAQ](FAQ.md)
- Review [GitHub Issues](https://github.com/lumosgen/lumosgen/issues)
- Join our [Discord Community](https://discord.gg/lumosgen)
- Contact [Support](mailto:support@lumosgen.dev)

### 🎯 Next Steps

1. Explore different content types
2. Experiment with customization options
3. Set up automated workflows
4. Share feedback and suggestions

---

**Happy content creating with LumosGen!**`,
            sections: ['Getting Started', 'Basic Usage', 'Advanced Features', 'Best Practices', 'Troubleshooting'],
            codeBlocks: [],
            tokenCount: 380
        },
        {
            path: 'docs/API_REFERENCE.md',
            title: 'LumosGen API Reference',
            content: `# LumosGen API Reference

## Complete API Documentation

### Core Classes

#### ContextEngine
Main engine for context analysis and content generation.

\`\`\`typescript
class ContextEngine {
    constructor(workspaceRoot: string, outputChannel: OutputChannel, config?: ContextEngineConfig)
    async analyzeProject(strategy?: 'minimal' | 'balanced' | 'comprehensive'): Promise<ContextEngineResult>
    async generateContent(taskType: AITaskType, options?: ContentGenerationOptions): Promise<string>
}
\`\`\`

#### ContextSelector
Intelligent document selection for AI context.

\`\`\`typescript
class ContextSelector {
    async selectContextForTask(taskType: AITaskType, analysis: ProjectAnalysis, options?: ContextSelectionOptions): Promise<SelectedContext>
    getStrategy(taskType: AITaskType): ContextSelectionStrategy
}
\`\`\`

#### ContentValidator
Multi-dimensional content quality validation.

\`\`\`typescript
class ContentValidator {
    async validateContent(content: string, contentType: string, criteria?: ValidationCriteria): Promise<ValidationResult>
    validateHomepage(content: string): ValidationResult
    validateAboutPage(content: string): ValidationResult
}
\`\`\`

### Interfaces

#### ProjectAnalysis
\`\`\`typescript
interface ProjectAnalysis {
    metadata: ProjectMetadata;
    techStack: TechStackItem[];
    features: ProjectFeature[];
    documents: MarkdownDocument[];
    dependencies: Dependency[];
    scripts: Script[];
    tokenCount: number;
}
\`\`\`

#### SelectedContext
\`\`\`typescript
interface SelectedContext {
    structured?: StructuredData;
    semiStructured?: SemiStructuredData;
    selectedFiles: MarkdownFile[];
    totalTokens: number;
    selectionReason: string;
    strategy: ContextSelectionStrategy;
    appliedLimits?: TokenLimits;
}
\`\`\`

### Configuration

#### ContextEngineConfig
\`\`\`typescript
interface ContextEngineConfig {
    analysisStrategy: 'minimal' | 'balanced' | 'comprehensive';
    enableCaching: boolean;
    cacheTimeout: number;
    maxDocuments: number;
    maxTokensPerDocument: number;
    defaultContentType: AITaskType;
    defaultAudience: string;
    defaultTone: string;
}
\`\`\`

### Usage Examples

#### Basic Content Generation
\`\`\`typescript
const engine = new ContextEngine(workspaceRoot, outputChannel);
const result = await engine.analyzeProject('balanced');
const content = await engine.generateContent('homepage');
\`\`\`

#### Advanced Context Selection
\`\`\`typescript
const selector = new ContextSelector();
const context = await selector.selectContextForTask('technical-docs', analysis, {
    maxTokens: 5000,
    strategy: 'comprehensive'
});
\`\`\`

#### Content Validation
\`\`\`typescript
const validator = new ContentValidator();
const result = await validator.validateContent(content, 'homepage', {
    minWords: 100,
    requiredSections: ['Introduction', 'Features', 'Getting Started']
});
\`\`\``,
            sections: ['Core Classes', 'Interfaces', 'Configuration', 'Usage Examples'],
            codeBlocks: ['typescript'],
            tokenCount: 320
        }
    ],
    
    dependencies: [
        { name: 'vscode', version: '^1.74.0', type: 'development', category: 'platform' },
        { name: 'typescript', version: '^4.9.4', type: 'development', category: 'language' },
        { name: 'react', version: '^18.2.0', type: 'production', category: 'frontend-framework' },
        { name: 'axios', version: '^1.6.0', type: 'production', category: 'http-client' },
        { name: '@types/node', version: '^18.15.0', type: 'development', category: 'types' },
        { name: '@types/react', version: '^18.2.0', type: 'development', category: 'types' },
        { name: 'webpack', version: '^5.88.0', type: 'development', category: 'bundler' },
        { name: 'jest', version: '^29.5.0', type: 'development', category: 'testing' }
    ],
    
    scripts: [
        { name: 'compile', command: 'tsc -p ./', description: 'Compile TypeScript to JavaScript' },
        { name: 'watch', command: 'tsc -watch -p ./', description: 'Watch and compile TypeScript' },
        { name: 'test', command: 'npm run compile && node tests/new-test-runner.js', description: 'Run all tests' },
        { name: 'package', command: 'vsce package', description: 'Package VS Code extension' },
        { name: 'deploy', command: 'vsce publish', description: 'Publish to VS Code Marketplace' },
        { name: 'lint', command: 'eslint src --ext ts', description: 'Lint TypeScript code' },
        { name: 'format', command: 'prettier --write src/**/*.ts', description: 'Format code with Prettier' }
    ],
    
    tokenCount: 1150
};

// 不同规模的项目分析数据
const minimalProjectAnalysis = {
    metadata: {
        name: 'SimpleProject',
        description: 'A simple test project',
        version: '1.0.0',
        keywords: ['test', 'simple']
    },
    techStack: [
        { language: 'JavaScript', framework: 'Node.js', category: 'backend', confidence: 0.8 }
    ],
    features: [
        { name: 'Basic Functionality', description: 'Core features', category: 'core', importance: 1.0 }
    ],
    documents: [
        {
            path: 'README.md',
            title: 'Simple Project',
            content: '# Simple Project\n\nA basic project for testing.',
            sections: ['Introduction'],
            codeBlocks: [],
            tokenCount: 15
        }
    ],
    dependencies: [
        { name: 'express', version: '^4.18.0', type: 'production', category: 'web-framework' }
    ],
    scripts: [
        { name: 'start', command: 'node index.js', description: 'Start the application' }
    ],
    tokenCount: 35
};

const complexProjectAnalysis = {
    ...comprehensiveProjectAnalysis,
    features: [
        ...comprehensiveProjectAnalysis.features,
        { name: 'Machine Learning', description: 'AI/ML capabilities', category: 'ai', importance: 0.95 },
        { name: 'Microservices', description: 'Distributed architecture', category: 'architecture', importance: 0.85 },
        { name: 'GraphQL API', description: 'Modern API layer', category: 'api', importance: 0.80 },
        { name: 'Docker Support', description: 'Containerization', category: 'devops', importance: 0.75 },
        { name: 'CI/CD Pipeline', description: 'Automated deployment', category: 'devops', importance: 0.90 }
    ],
    tokenCount: 1500
};

module.exports = {
    comprehensive: comprehensiveProjectAnalysis,
    minimal: minimalProjectAnalysis,
    complex: complexProjectAnalysis
};
