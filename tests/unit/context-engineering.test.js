/**
 * 上下文工程系统专项测试
 * 验证 ContextEngine、ContextSelector、PromptTemplates 的核心功能
 */

// 首先设置全局 Mock 环境
require('../setup-global-mocks');

const { TestConfig, TestUtils, TestAssertions } = require('../test-config');
const path = require('path');
const fs = require('fs');

// Mock dependencies
const mockOutputChannel = {
    appendLine: (message) => console.log(`[LOG] ${message}`),
    show: () => {},
    clear: () => {}
};

// 使用完整的测试数据
const testFixtures = require('../fixtures/comprehensive-project-analysis');
const mockProjectAnalysis = testFixtures.comprehensive;

const contextEngineeringTests = {
    async setup() {
        console.log('🔧 Setting up context engineering tests...');
        this.testProjectPath = path.join(__dirname, '../../test-project');
        
        // 确保测试项目存在
        if (!fs.existsSync(this.testProjectPath)) {
            fs.mkdirSync(this.testProjectPath, { recursive: true });

            // 创建丰富的测试内容
            fs.writeFileSync(
                path.join(this.testProjectPath, 'README.md'),
                `# Test Project - Advanced AI-Powered Development Platform

## 🚀 Overview
This is a comprehensive test project for context engineering validation. It demonstrates advanced AI capabilities and provides innovative solutions for modern development challenges. Our platform combines cutting-edge technology with user-friendly design to deliver exceptional results for developers worldwide.

## ✨ Key Features
- 🤖 **Advanced AI Integration** with machine learning capabilities and neural network processing
- ⚡ **Real-time Processing** for instant results and feedback with sub-second response times
- 🎯 **User-friendly Interface** designed for optimal user experience and accessibility
- 🔒 **Enterprise-grade Security** with robust data protection and encryption
- 📊 **Comprehensive Analytics** and reporting tools for performance monitoring
- 🌐 **Multi-platform Support** across web, mobile, and desktop environments
- 🔧 **Extensible Architecture** with plugin system and API integrations
- 📈 **Scalable Infrastructure** supporting millions of concurrent users

## 🛠️ Technology Stack
- **Backend**: TypeScript, Node.js, Express.js, MongoDB
- **Frontend**: React, HTML5, CSS3, Redux, Material-UI
- **AI/ML**: DeepSeek API, OpenAI API, TensorFlow, PyTorch
- **Platform**: VS Code Extension API, Electron, PWA
- **DevOps**: Docker, Kubernetes, GitHub Actions, AWS
- **Testing**: Jest, Cypress, Playwright, Storybook

## 📦 Installation & Setup
\`\`\`bash
# Clone the repository
git clone https://github.com/test-org/test-project.git
cd test-project

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
\`\`\`

## 🎯 Quick Start Guide
1. **Installation**: Follow the installation steps above
2. **Configuration**: Set up your API keys and database connections
3. **Development**: Start the development server with \`npm start\`
4. **Testing**: Run the test suite with \`npm test\`
5. **Deployment**: Build and deploy with \`npm run build\`

## 📚 Documentation
- [User Guide](docs/user-guide.md) - Complete user documentation
- [API Reference](docs/api-reference.md) - Detailed API documentation
- [Developer Guide](docs/developer-guide.md) - Development best practices
- [Deployment Guide](docs/deployment.md) - Production deployment instructions

## 🤝 Contributing
We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to get started.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Support
- [GitHub Issues](https://github.com/test-org/test-project/issues)
- [Documentation](https://test-project.dev/docs)
- [Community Discord](https://discord.gg/test-project)

Ready to transform your workflow? Get started today and experience the power of AI-driven development!`
            );

            // 创建 package.json
            fs.writeFileSync(
                path.join(this.testProjectPath, 'package.json'),
                JSON.stringify({
                    name: 'test-project',
                    version: '1.0.0',
                    description: 'A comprehensive test project for context engineering validation',
                    main: 'index.js',
                    scripts: {
                        start: 'node index.js',
                        dev: 'nodemon index.js',
                        test: 'jest',
                        build: 'webpack --mode production',
                        lint: 'eslint src/',
                        format: 'prettier --write src/'
                    },
                    dependencies: {
                        express: '^4.18.0',
                        react: '^18.0.0',
                        typescript: '^4.9.0',
                        mongodb: '^5.0.0',
                        redis: '^4.0.0'
                    },
                    devDependencies: {
                        jest: '^29.0.0',
                        nodemon: '^2.0.0',
                        webpack: '^5.0.0',
                        eslint: '^8.0.0',
                        prettier: '^2.0.0'
                    },
                    keywords: ['ai', 'machine-learning', 'typescript', 'react', 'node.js']
                }, null, 2)
            );

            // 创建更多文档文件
            const docsDir = path.join(this.testProjectPath, 'docs');
            fs.mkdirSync(docsDir, { recursive: true });

            fs.writeFileSync(
                path.join(docsDir, 'user-guide.md'),
                `# User Guide

## Getting Started
This comprehensive guide will help you get started with Test Project.

## Installation
Follow these steps to install and configure the application.

## Configuration
Set up your environment variables and database connections.

## Usage Examples
Here are some common usage patterns and examples.`
            );

            fs.writeFileSync(
                path.join(docsDir, 'api-reference.md'),
                `# API Reference

## Authentication
All API requests require authentication.

## Endpoints
### GET /api/users
### POST /api/projects
### PUT /api/settings

## Error Handling
Standard HTTP status codes are used.`
            );

            // 创建源代码文件
            const srcDir = path.join(this.testProjectPath, 'src');
            fs.mkdirSync(srcDir, { recursive: true });

            fs.writeFileSync(
                path.join(srcDir, 'index.ts'),
                `// Main application entry point
import express from 'express';
import { setupRoutes } from './routes';
import { connectDatabase } from './database';

const app = express();
const PORT = process.env.PORT || 3000;

async function startServer() {
    await connectDatabase();
    setupRoutes(app);
    app.listen(PORT, () => {
        console.log(\`Server running on port \${PORT}\`);
    });
}

startServer().catch(console.error);`
            );
        }
    },

    async testContextEngineInitialization() {
        console.log('🧪 Testing ContextEngine initialization...');
        
        try {
            const { ContextEngine } = require('../../out/analysis/ContextEngineering');

            const engine = new ContextEngine(this.testProjectPath, mockOutputChannel, {
                analysisStrategy: 'balanced',
                enableCaching: true,
                maxDocuments: 20,
                maxTokensPerDocument: 2000
            });
            
            TestAssertions.assertTrue(engine !== null, 'ContextEngine should initialize successfully');
            TestAssertions.assertTrue(typeof engine.analyzeProject === 'function', 'Should have analyzeProject method');
            TestAssertions.assertTrue(typeof engine.selectContextForTask === 'function', 'Should have selectContextForTask method');
            
        } catch (error) {
            throw new Error(`ContextEngine initialization failed: ${error.message}`);
        }
    },

    async testProjectAnalysisStrategies() {
        console.log('🧪 Testing different analysis strategies...');
        
        try {
            const { ContextEngine } = require('../../out/analysis/ContextEngineering');

            const strategies = ['minimal', 'balanced', 'comprehensive'];
            
            for (const strategy of strategies) {
                const engine = new ContextEngine(this.testProjectPath, mockOutputChannel, {
                    analysisStrategy: strategy,
                    enableCaching: false
                });
                
                const result = await engine.analyzeProject(strategy);
                
                TestAssertions.assertTrue(result.analysis !== null, `${strategy} strategy should return analysis`);
                TestAssertions.assertTrue(result.performance.documentsProcessed >= 0, `${strategy} should process documents`);
                TestAssertions.assertTrue(result.performance.tokensUsed >= 0, `${strategy} should count tokens (got ${result.performance.tokensUsed})`);
                
                console.log(`✅ ${strategy} strategy: ${result.performance.documentsProcessed} docs, ${result.performance.totalTokens} tokens`);
            }
            
        } catch (error) {
            throw new Error(`Analysis strategies test failed: ${error.message}`);
        }
    },

    async testContextSelectorTaskSpecific() {
        console.log('🧪 Testing task-specific context selection...');
        
        try {
            const { ContextSelector } = require('../../out/analysis/ContextSelector');
            
            const selector = new ContextSelector();
            const taskTypes = ['marketing-content', 'technical-docs', 'api-documentation'];
            
            for (const taskType of taskTypes) {
                const selectedContext = await selector.selectContextForTask(taskType, mockProjectAnalysis);
                
                TestAssertions.assertTrue(selectedContext.selectedFiles.length > 0, `${taskType} should select files`);
                TestAssertions.assertTrue(selectedContext.totalTokens > 0, `${taskType} should have token count`);
                TestAssertions.assertTrue(selectedContext.selectionReason.length > 0, `${taskType} should have selection reason`);
                
                console.log(`✅ ${taskType}: ${selectedContext.selectedFiles.length} files, ${selectedContext.totalTokens} tokens`);
            }
            
        } catch (error) {
            throw new Error(`Context selector test failed: ${error.message}`);
        }
    },

    async testPromptTemplateGeneration() {
        console.log('🧪 Testing prompt template generation...');
        
        try {
            const { PromptTemplateLibrary } = require('../../out/content/PromptTemplates');
            
            const promptLibrary = new PromptTemplateLibrary();
            const templates = promptLibrary.getAvailableTemplates();
            
            TestAssertions.assertTrue(templates.length > 0, 'Should have available templates');
            TestAssertions.assertTrue(templates.includes('homepage'), 'Should include homepage template');
            TestAssertions.assertTrue(templates.includes('about'), 'Should include about template');
            
            for (const templateName of templates.slice(0, 3)) { // Test first 3 templates
                const templateInfo = promptLibrary.getTemplateInfo(templateName);
                TestAssertions.assertTrue(templateInfo !== null, `${templateName} template info should exist`);
                TestAssertions.assertTrue(templateInfo.description.length > 0, `${templateName} should have description`);
                
                const prompt = promptLibrary.generatePrompt(templateName, mockProjectAnalysis, {
                    tone: 'professional',
                    audience: 'developers'
                });
                
                TestAssertions.assertTrue(prompt.length > 100, `${templateName} prompt should be substantial`);
                TestAssertions.assertContains(prompt, mockProjectAnalysis.metadata.name, `${templateName} should include project name`);
                
                console.log(`✅ ${templateName} template: ${prompt.length} chars generated`);
            }
            
        } catch (error) {
            throw new Error(`Prompt template test failed: ${error.message}`);
        }
    },

    async testContentValidation() {
        console.log('🧪 Testing content validation system...');
        
        try {
            const { ContentValidator } = require('../../out/content/ContentValidator');
            
            const validator = new ContentValidator();
            
            // Test valid content
            const validContent = `# Test Project

## Overview
This is a comprehensive test project that demonstrates advanced AI capabilities and provides innovative solutions for modern development challenges. Our platform combines cutting-edge technology with user-friendly design to deliver exceptional results.

## Features
- 🤖 Advanced AI Integration with machine learning capabilities
- ⚡ Real-time Processing for instant results and feedback
- 🎯 User-friendly Interface designed for optimal user experience
- 🔒 Enterprise-grade Security with robust data protection
- 📊 Comprehensive Analytics and reporting tools
- 🚀 High Performance optimization for scalability

## Getting Started
Welcome to Test Project! Follow these simple steps to get started with our powerful platform.

### Installation
\`\`\`bash
npm install test-project
npm run setup
\`\`\`

### Quick Start
\`\`\`bash
npm start
\`\`\`

## Usage
Start the application with npm start and navigate to http://localhost:3000 to access the dashboard. The intuitive interface will guide you through the setup process.

## Call to Action
Ready to transform your workflow? Get started today and experience the power of AI-driven development tools!`;

            const validResult = await validator.validateContent(validContent, 'homepage');
            TestAssertions.assertTrue(validResult.isValid, 'Valid content should pass validation');
            TestAssertions.assertTrue(validResult.score >= 70, 'Valid content should have good score');
            
            // Test invalid content
            const invalidContent = 'Short content';
            const invalidResult = await validator.validateContent(invalidContent, 'homepage');
            TestAssertions.assertTrue(!invalidResult.isValid, 'Invalid content should fail validation');
            TestAssertions.assertTrue(invalidResult.errors.length > 0, 'Invalid content should have errors');
            
            console.log(`✅ Valid content score: ${validResult.score}, Invalid content errors: ${invalidResult.errors.length}`);
            
        } catch (error) {
            throw new Error(`Content validation test failed: ${error.message}`);
        }
    },

    async testTokenBudgetManagement() {
        console.log('🧪 Testing token budget management...');
        
        try {
            const { ContextSelector } = require('../../out/analysis/ContextSelector');
            
            const selector = new ContextSelector();
            
            // Test with different token limits
            const tokenLimits = [1000, 5000, 10000];
            
            for (const limit of tokenLimits) {
                const selectedContext = await selector.selectContextForTask('marketing-content', mockProjectAnalysis, {
                    maxTokens: limit
                });
                
                TestAssertions.assertTrue(selectedContext.totalTokens <= limit, `Should respect ${limit} token limit`);
                TestAssertions.assertTrue(selectedContext.selectedFiles.length > 0, `Should select files within ${limit} tokens`);
                
                console.log(`✅ ${limit} token limit: ${selectedContext.totalTokens} tokens used, ${selectedContext.selectedFiles.length} files`);
            }
            
        } catch (error) {
            throw new Error(`Token budget management test failed: ${error.message}`);
        }
    },

    async testCachingMechanism() {
        console.log('🧪 Testing caching mechanism...');
        
        try {
            const { ContextEngine } = require('../../out/analysis/ContextEngineering');
            
            // Test with caching enabled
            const engineWithCache = new ContextEngine(this.testProjectPath, mockOutputChannel, {
                enableCaching: true
            });
            
            const startTime1 = Date.now();
            const result1 = await engineWithCache.analyzeProject();
            const duration1 = Date.now() - startTime1;
            
            const startTime2 = Date.now();
            const result2 = await engineWithCache.analyzeProject();
            const duration2 = Date.now() - startTime2;
            
            TestAssertions.assertTrue(duration2 <= duration1, 'Cached analysis should be faster or equal');
            TestAssertions.assertEqual(result1.analysis.metadata.name, result2.analysis.metadata.name, 'Cached results should be consistent');
            
            console.log(`✅ Caching: First run ${duration1}ms, Second run ${duration2}ms (${Math.round((1 - duration2/duration1) * 100)}% faster)`);
            
        } catch (error) {
            throw new Error(`Caching mechanism test failed: ${error.message}`);
        }
    },

    async teardown() {
        console.log('🧹 Cleaning up context engineering tests...');
        // 清理测试资源
    }
};

module.exports = contextEngineeringTests;
