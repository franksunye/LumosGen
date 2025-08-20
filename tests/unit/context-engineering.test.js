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
                `# Test Project

## Overview
This is a comprehensive test project for context engineering validation. It demonstrates advanced AI capabilities and provides innovative solutions for modern development challenges.

## Features
- 🤖 Advanced AI Integration with machine learning capabilities
- ⚡ Real-time Processing for instant results and feedback
- 🎯 User-friendly Interface designed for optimal user experience
- 🔒 Enterprise-grade Security with robust data protection

## Technology Stack
- **Backend**: TypeScript, Node.js
- **Frontend**: React, HTML5, CSS3
- **AI**: DeepSeek API, OpenAI API
- **Platform**: VS Code Extension API

## Getting Started
\`\`\`bash
npm install test-project
npm start
\`\`\`

## Usage
Start the application with npm start and navigate to http://localhost:3000 to access the dashboard.

Ready to transform your workflow? Get started today!`
            );

            // 创建 package.json
            fs.writeFileSync(
                path.join(this.testProjectPath, 'package.json'),
                JSON.stringify({
                    name: 'test-project',
                    version: '1.0.0',
                    description: 'A test project for context engineering',
                    main: 'index.js',
                    scripts: {
                        start: 'node index.js',
                        test: 'jest'
                    },
                    dependencies: {
                        express: '^4.18.0',
                        react: '^18.0.0'
                    }
                }, null, 2)
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
                TestAssertions.assertTrue(result.performance.totalTokens > 0, `${strategy} should count tokens`);
                
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
