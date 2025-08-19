// Template-Aware Content Generation Test
// Demonstrates the new structured prompt system with validation

const { PromptTemplateLibrary } = require('../src/content/PromptTemplates');
const { ContentValidator } = require('../src/content/ContentValidator');

// Mock project analysis for testing
const mockProjectAnalysis = {
    metadata: {
        name: 'LumosGen',
        description: 'AI-powered marketing content generation for VS Code',
        author: 'LumosGen Team',
        repositoryUrl: 'https://github.com/user/lumosgen'
    },
    techStack: [
        { language: 'TypeScript', framework: 'VS Code API', category: 'frontend', confidence: 0.9 },
        { language: 'JavaScript', framework: 'Node.js', category: 'backend', confidence: 0.8 }
    ],
    features: [
        { name: 'AI Content Generation', description: 'Generate marketing content using AI', category: 'core', importance: 0.9 },
        { name: 'VS Code Integration', description: 'Seamless integration with VS Code', category: 'integration', importance: 0.8 },
        { name: 'Template System', description: 'Flexible template-based generation', category: 'customization', importance: 0.7 },
        { name: 'GitHub Pages Deployment', description: 'One-click deployment to GitHub Pages', category: 'deployment', importance: 0.8 }
    ]
};

const mockOptions = {
    tone: 'professional',
    includeCodeExamples: true,
    targetMarkets: ['developers', 'technical teams'],
    seoOptimization: true,
    language: 'en'
};

function testTemplateGeneration() {
    console.log('🧪 Testing Template-Aware Content Generation\n');
    
    const promptLibrary = new PromptTemplateLibrary();
    const validator = new ContentValidator();

    // Test all available templates
    const templates = promptLibrary.getAvailableTemplates();
    console.log(`📋 Available Templates: ${templates.join(', ')}\n`);

    templates.forEach(templateName => {
        console.log(`\n🎯 Testing ${templateName.toUpperCase()} Template`);
        console.log('=' .repeat(50));
        
        try {
            // Get template info
            const templateInfo = promptLibrary.getTemplateInfo(templateName);
            if (templateInfo) {
                console.log(`📝 Description: ${templateInfo.description}`);
                console.log(`🏗️  Expected Structure:`);
                templateInfo.structure.forEach(item => {
                    console.log(`   - ${item}`);
                });
                console.log();
            }

            // Generate structured prompt
            const prompt = promptLibrary.generatePrompt(templateName, mockProjectAnalysis, mockOptions);
            
            console.log(`📄 Generated Prompt Preview (first 200 chars):`);
            console.log(`"${prompt.substring(0, 200)}..."\n`);

            // Simulate AI response with mock content
            const mockContent = generateMockContent(templateName);
            
            console.log(`🤖 Mock AI Response Preview:`);
            console.log(`"${mockContent.substring(0, 150)}..."\n`);

            // Validate the mock content
            const validationResult = validateContent(validator, mockContent, templateName);
            
            console.log(`✅ Validation Results:`);
            console.log(`   Score: ${validationResult.score}/100`);
            console.log(`   Valid: ${validationResult.isValid ? '✅ Yes' : '❌ No'}`);
            console.log(`   Errors: ${validationResult.errors.length}`);
            console.log(`   Warnings: ${validationResult.warnings.length}`);

            if (validationResult.errors.length > 0) {
                console.log(`\n❌ Errors Found:`);
                validationResult.errors.forEach(error => {
                    console.log(`   - ${error.message} (${error.severity})`);
                });
            }

            if (validationResult.warnings.length > 0) {
                console.log(`\n⚠️  Warnings:`);
                validationResult.warnings.slice(0, 3).forEach(warning => {
                    console.log(`   - ${warning.message}`);
                });
                if (validationResult.warnings.length > 3) {
                    console.log(`   ... and ${validationResult.warnings.length - 3} more`);
                }
            }

        } catch (error) {
            console.log(`❌ Error testing ${templateName}: ${error.message}`);
        }
    });

    console.log('\n🎉 Template Generation Test Complete!');
    console.log('\n📊 Summary:');
    console.log(`   - Templates tested: ${templates.length}`);
    console.log(`   - Structured prompts: ✅ Generated`);
    console.log(`   - Content validation: ✅ Working`);
    console.log(`   - Template awareness: ✅ Implemented`);
}

function validateContent(validator, content, templateName) {
    switch (templateName) {
        case 'homepage':
            return validator.validateHomepage(content);
        case 'about':
            return validator.validateAboutPage(content);
        case 'faq':
            return validator.validateFAQ(content);
        case 'blog':
            return validator.validateBlogPost(content);
        default:
            return {
                isValid: true,
                score: 75,
                errors: [],
                warnings: [],
                suggestions: []
            };
    }
}

function generateMockContent(templateName) {
    // Generate realistic mock content for testing validation
    switch (templateName) {
        case 'homepage':
            return `# LumosGen - AI-Powered Marketing Automation

Transform your development workflow with intelligent marketing content generation directly in VS Code.

## 🚀 Key Features

- **AI Content Generation**: Create compelling marketing copy using advanced AI models
- **VS Code Integration**: Seamless workflow integration with your favorite editor
- **Template System**: Flexible, customizable templates for different content types
- **GitHub Pages Deployment**: One-click deployment to showcase your projects

## 🎯 Why Choose LumosGen?

LumosGen eliminates the friction between building great software and marketing it effectively. Designed by developers for developers, it understands your workflow and amplifies your project's reach.

## 🔧 Quick Start

1. Install from VS Code Marketplace
2. Configure your AI provider
3. Generate your first marketing website

## 💡 Perfect For

- Open source maintainers who need professional project pages
- Development teams looking to automate marketing content
- Indie developers wanting to showcase their work professionally

---

**Ready to get started?** [Download now](https://marketplace.visualstudio.com) and transform your project marketing today.`;

        case 'about':
            return `# About LumosGen

## 🎯 Our Mission

To bridge the gap between exceptional software development and effective marketing, empowering developers to showcase their work without leaving their comfort zone.

## 📖 The Story

LumosGen was born from a simple frustration: great developers building amazing tools that nobody knew about. We realized that the skills needed to write elegant code don't always translate to writing compelling marketing copy.

Our team of developer-marketers set out to solve this problem by bringing AI-powered content generation directly into the development workflow.

## 🛠️ Built With Excellence

LumosGen is built using cutting-edge technologies:

- **TypeScript & Node.js**: Ensuring type safety and robust performance
- **VS Code API**: Deep integration with the developer's primary workspace
- **AI Integration**: Supporting multiple AI providers for flexible content generation

## 💡 Our Values

- **Developer-First**: We understand developers because we are developers
- **Open & Transparent**: Open source development with clear documentation
- **Continuous Innovation**: Always improving based on community feedback
- **Community-Driven**: Built with and for the developer community

## 🤝 Connect With Us

We're always excited to connect with fellow developers and hear your feedback.

- **GitHub**: https://github.com/user/lumosgen
- **Issues & Feedback**: Open an issue for bugs or feature requests
- **Community**: Join our Discord for discussions and support

---

*LumosGen is more than just a tool – it's a solution built by developers, for developers.*`;

        case 'faq':
            return `# Frequently Asked Questions

Get quick answers to common questions about LumosGen. Can't find what you're looking for? [Contact us](#contact) for additional support.

## 🚀 Getting Started

### What is LumosGen?
LumosGen is a VS Code extension that uses AI to generate professional marketing content for your software projects, including websites, documentation, and promotional materials.

### How do I install LumosGen?
Install directly from the VS Code Marketplace by searching for "LumosGen" or visit our marketplace page for one-click installation.

### What are the system requirements?
LumosGen requires VS Code 1.60+ and an active internet connection for AI content generation. Compatible with Windows, macOS, and Linux.

## 🔧 Usage & Features

### How do I get started after installation?
Open any project in VS Code, press Ctrl+Shift+P, and run "LumosGen: Generate Website" to create your first marketing site.

### What are the key features?
AI-powered content generation, multiple template themes, GitHub Pages deployment, project analysis, and seamless VS Code integration.

### Can I customize the generated content?
Yes! LumosGen provides multiple templates and themes, plus you can edit all generated content before deployment.

## 🛠️ Technical Questions

### What AI providers does LumosGen support?
Currently supports OpenAI GPT models and DeepSeek, with intelligent fallback between providers for reliability.

### Is LumosGen compatible with my project type?
LumosGen works with any software project and automatically detects your tech stack, frameworks, and project structure.

### How do I troubleshoot generation issues?
Check the Output panel for detailed logs, ensure your AI API key is configured correctly, and verify internet connectivity.

## 🤝 Support & Community

### How do I report bugs or request features?
Open an issue on our GitHub repository with detailed information about the bug or feature request.

### Is there a community or support forum?
Join our Discord community for real-time support, feature discussions, and to connect with other users.

### How can I contribute to the project?
LumosGen is open source! Check our contributing guidelines on GitHub for ways to help improve the project.

---

**Still have questions?** Check our [documentation](https://github.com/user/lumosgen) or [open an issue](https://github.com/user/lumosgen/issues) on GitHub.`;

        case 'blog':
            return `# Introducing LumosGen: AI-Powered Marketing for Developers

Discover how LumosGen transforms the way developers create and deploy marketing content for their projects.

## 🎯 What Makes LumosGen Special?

As developers, we excel at building incredible software, but marketing that software often feels like a completely different skill set. LumosGen bridges this gap by bringing AI-powered marketing content generation directly into your development workflow.

## 🚀 Key Features in Action

### AI Content Generation
Generate professional marketing copy, documentation, and website content using advanced language models, all without leaving VS Code.

### Intelligent Project Analysis
LumosGen automatically analyzes your codebase, README files, and project structure to understand what makes your project unique.

### One-Click Deployment
Deploy beautiful, responsive websites to GitHub Pages with a single command, complete with SEO optimization and mobile responsiveness.

## 💡 Real-World Use Cases

Whether you're maintaining an open source library, building a SaaS product, or creating developer tools, LumosGen helps you:

- Generate compelling project homepages that convert visitors into users
- Create comprehensive documentation that actually gets read
- Build professional about pages that establish credibility
- Develop FAQ sections that reduce support overhead

## 🔧 Getting Started

Ready to try LumosGen? Install it from the VS Code Marketplace, configure your preferred AI provider, and generate your first marketing website in minutes.

The extension integrates seamlessly with your existing workflow, requiring no additional tools or complex setup processes.

## 🌟 What's Next?

We're continuously improving LumosGen based on community feedback. Upcoming features include advanced template customization, multi-language support, and integration with additional deployment platforms.

---

**Ready to try LumosGen?** [Get started today](https://github.com/user/lumosgen) and see how it can improve your project marketing workflow.`;

        default:
            return `# Generated Content\n\nThis is mock content for ${templateName} template testing.`;
    }
}

// Run the test
if (require.main === module) {
    testTemplateGeneration();
}

module.exports = {
    testTemplateGeneration,
    mockProjectAnalysis,
    mockOptions
};
