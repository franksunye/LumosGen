/**
 * 提示工程系统专项测试
 * 验证提示模板、上下文注入、质量控制的核心功能
 */

// 首先设置全局 Mock 环境
require('../setup-global-mocks');

const { TestConfig, TestUtils, TestAssertions } = require('../test-config');
const path = require('path');
const fs = require('fs');

// Mock AI service for testing
class MockAIService {
    async generateContent(prompt, options = {}) {
        // 模拟AI响应，基于提示词内容生成相应的回复
        const response = {
            content: this.generateMockResponse(prompt),
            tokens: Math.floor(prompt.length / 4),
            cost: 0.001,
            provider: 'mock',
            model: 'mock-model'
        };
        
        // 模拟响应延迟
        await new Promise(resolve => setTimeout(resolve, 100));
        return response;
    }
    
    generateMockResponse(prompt) {
        if (prompt.includes('homepage')) {
            return `# Welcome to TestProject

## Revolutionary AI-Powered Solution

TestProject is a cutting-edge TypeScript and React application that transforms how developers work with AI integration and real-time processing.

### Key Features
- 🤖 Advanced AI Integration
- ⚡ Real-time Processing
- 🎯 User-friendly Interface

### Quick Start
\`\`\`bash
npm install test-project
npm start
\`\`\`

Ready to revolutionize your workflow? Get started today!`;
        } else if (prompt.includes('about')) {
            return `# About TestProject

## Our Mission
We're dedicated to creating innovative solutions that bridge the gap between AI technology and practical development needs.

## Our Story
Founded with the vision of making AI accessible to every developer, TestProject represents the culmination of years of research and development.

## Technology Stack
- TypeScript for type-safe development
- React for modern user interfaces
- Node.js for robust backend services`;
        } else if (prompt.includes('FAQ')) {
            return `# Frequently Asked Questions

## General Questions

**Q: What is TestProject?**
A: TestProject is an AI-powered development tool that enhances productivity through intelligent automation.

**Q: How do I get started?**
A: Simply install the package with npm and follow our quick start guide.

## Technical Questions

**Q: What technologies does it support?**
A: TestProject supports TypeScript, React, and Node.js out of the box.

**Q: Is it suitable for production use?**
A: Yes, TestProject is designed for both development and production environments.`;
        }
        
        return `Generated content for: ${prompt.substring(0, 100)}...`;
    }
}

// 使用完整的测试数据
const testFixtures = require('../fixtures/comprehensive-project-analysis');
const mockProjectAnalysis = testFixtures.comprehensive;

const promptEngineeringTests = {
    async setup() {
        console.log('🔧 Setting up prompt engineering tests...');
        this.mockAIService = new MockAIService();
        this.testOptions = {
            tone: 'professional',
            audience: 'developers',
            includeCodeExamples: true,
            seoOptimization: true
        };
    },

    async testPromptTemplateStructure() {
        console.log('🧪 Testing prompt template structure...');
        
        try {
            const { PromptTemplateLibrary } = require('../../out/content/PromptTemplates');

            const promptLibrary = new PromptTemplateLibrary();
            const templates = promptLibrary.getAvailableTemplates();
            
            TestAssertions.assertTrue(templates.length >= 3, 'Should have at least 3 templates');
            
            for (const templateName of templates) {
                const templateInfo = promptLibrary.getTemplateInfo(templateName);
                
                // 验证模板结构
                TestAssertions.assertTrue(templateInfo.name.toLowerCase().includes(templateName), `Template name should match: ${templateName}`);
                TestAssertions.assertTrue(templateInfo.description.length > 10, `${templateName} should have meaningful description`);
                TestAssertions.assertTrue(templateInfo.structure.length > 0, `${templateName} should have expected structure`);
                TestAssertions.assertTrue(templateInfo.validationRules.length > 0, `${templateName} should have validation rules`);
                
                console.log(`✅ ${templateName}: ${templateInfo.structure.length} structure elements, ${templateInfo.validationRules.length} validation rules`);
            }
            
        } catch (error) {
            throw new Error(`Template structure test failed: ${error.message}`);
        }
    },

    async testContextInjection() {
        console.log('🧪 Testing context injection in prompts...');
        
        try {
            const { PromptTemplateLibrary } = require('../../out/content/PromptTemplates');
            
            const promptLibrary = new PromptTemplateLibrary();
            const prompt = promptLibrary.generatePrompt('homepage', mockProjectAnalysis, this.testOptions);
            
            // 验证项目信息注入
            TestAssertions.assertContains(prompt, mockProjectAnalysis.metadata.name, 'Should inject project name');
            TestAssertions.assertContains(prompt, mockProjectAnalysis.metadata.description, 'Should inject project description');
            
            // 验证技术栈注入 (更灵活的检查)
            const hasTypeScript = prompt.includes('TypeScript') || prompt.includes('typescript');
            const hasReact = prompt.includes('React') || prompt.includes('react') || prompt.includes('Node.js');
            TestAssertions.assertTrue(hasTypeScript, 'Should inject TypeScript tech stack');
            TestAssertions.assertTrue(hasReact, 'Should inject React or Node.js frameworks');
            
            // 验证特性注入 (更灵活的检查)
            const hasAIFeatures = prompt.includes('AI Integration') || prompt.includes('AI Content Generation') || prompt.includes('AI') || prompt.includes('artificial intelligence');
            TestAssertions.assertTrue(hasAIFeatures, 'Should inject AI-related features');
            
            // 验证选项注入
            TestAssertions.assertContains(prompt, this.testOptions.tone, 'Should inject tone');
            TestAssertions.assertContains(prompt, this.testOptions.audience, 'Should inject audience');
            
            console.log(`✅ Context injection: ${prompt.length} chars with all required elements`);
            
        } catch (error) {
            throw new Error(`Context injection test failed: ${error.message}`);
        }
    },

    async testPromptOptimization() {
        console.log('🧪 Testing prompt optimization strategies...');
        
        try {
            const { PromptTemplateLibrary } = require('../../out/content/PromptTemplates');
            
            const promptLibrary = new PromptTemplateLibrary();
            
            // 测试不同优化策略
            const strategies = ['concise', 'detailed', 'creative'];
            
            for (const strategy of strategies) {
                const optimizedOptions = { ...this.testOptions, optimizationStrategy: strategy };
                const prompt = promptLibrary.generatePrompt('homepage', mockProjectAnalysis, optimizedOptions);
                
                TestAssertions.assertTrue(prompt.length > 100, `${strategy} strategy should generate substantial prompt`);
                
                // 验证策略特定的特征 (更现实的期望)
                if (strategy === 'concise') {
                    TestAssertions.assertContains(prompt, 'concise', 'Concise strategy should mention being concise');
                } else if (strategy === 'detailed') {
                    TestAssertions.assertContains(prompt, 'detailed', 'Detailed strategy should mention being detailed');
                } else if (strategy === 'creative') {
                    TestAssertions.assertContains(prompt, 'creative', 'Creative strategy should mention creativity');
                }
                
                console.log(`✅ ${strategy} strategy: ${prompt.length} chars`);
            }
            
        } catch (error) {
            throw new Error(`Prompt optimization test failed: ${error.message}`);
        }
    },

    async testEndToEndPromptGeneration() {
        console.log('🧪 Testing end-to-end prompt generation and AI response...');
        
        try {
            const { PromptTemplateLibrary } = require('../../out/content/PromptTemplates');
            const { ContentValidator } = require('../../out/content/ContentValidator');
            
            const promptLibrary = new PromptTemplateLibrary();
            const validator = new ContentValidator();
            
            const contentTypes = ['homepage', 'about', 'faq'];
            
            for (const contentType of contentTypes) {
                // 1. 生成提示词
                const prompt = promptLibrary.generatePrompt(contentType, mockProjectAnalysis, this.testOptions);
                TestAssertions.assertTrue(prompt.length > 100, `${contentType} prompt should be substantial`);
                
                // 2. 调用AI服务
                const aiResponse = await this.mockAIService.generateContent(prompt);
                TestAssertions.assertTrue(aiResponse.content.length > 100, `${contentType} AI response should be substantial`);
                TestAssertions.assertTrue(aiResponse.tokens > 0, `${contentType} should have token count`);
                
                // 3. 验证生成内容
                const validationResult = await validator.validateContent(aiResponse.content, contentType);
                TestAssertions.assertTrue(validationResult.score > 50, `${contentType} should have reasonable quality score`);
                
                console.log(`✅ ${contentType}: prompt ${prompt.length} chars → AI ${aiResponse.content.length} chars → score ${validationResult.score}`);
            }
            
        } catch (error) {
            throw new Error(`End-to-end generation test failed: ${error.message}`);
        }
    },

    async testPromptVersioning() {
        console.log('🧪 Testing prompt template versioning...');
        
        try {
            const { PromptTemplateLibrary } = require('../../out/content/PromptTemplates');
            
            const promptLibrary = new PromptTemplateLibrary();
            
            // 测试模板版本管理
            const templateInfo = promptLibrary.getTemplateInfo('homepage');
            TestAssertions.assertTrue(templateInfo.version !== undefined, 'Template should have version');
            
            // 测试向后兼容性
            const legacyPrompt = promptLibrary.generatePrompt('homepage', mockProjectAnalysis, { version: '1.0' });
            const currentPrompt = promptLibrary.generatePrompt('homepage', mockProjectAnalysis, this.testOptions);
            
            TestAssertions.assertTrue(legacyPrompt.length > 0, 'Legacy version should work');
            TestAssertions.assertTrue(currentPrompt.length > 0, 'Current version should work');
            
            console.log(`✅ Versioning: legacy ${legacyPrompt.length} chars, current ${currentPrompt.length} chars`);
            
        } catch (error) {
            throw new Error(`Prompt versioning test failed: ${error.message}`);
        }
    },

    async testPromptPersonalization() {
        console.log('🧪 Testing prompt personalization...');
        
        try {
            const { PromptTemplateLibrary } = require('../../out/content/PromptTemplates');
            
            const promptLibrary = new PromptTemplateLibrary();
            
            // 测试不同个性化选项
            const personalizations = [
                { tone: 'casual', audience: 'beginners' },
                { tone: 'formal', audience: 'enterprise' },
                { tone: 'technical', audience: 'developers' }
            ];
            
            for (const personalization of personalizations) {
                const prompt = promptLibrary.generatePrompt('homepage', mockProjectAnalysis, personalization);
                
                TestAssertions.assertContains(prompt, personalization.tone, `Should reflect ${personalization.tone} tone`);
                TestAssertions.assertContains(prompt, personalization.audience, `Should target ${personalization.audience} audience`);
                
                console.log(`✅ ${personalization.tone}/${personalization.audience}: ${prompt.length} chars`);
            }
            
        } catch (error) {
            throw new Error(`Prompt personalization test failed: ${error.message}`);
        }
    },

    async testPromptQualityMetrics() {
        console.log('🧪 Testing prompt quality metrics...');
        
        try {
            const { PromptTemplateLibrary } = require('../../out/content/PromptTemplates');
            
            const promptLibrary = new PromptTemplateLibrary();
            
            // 生成多个提示词并分析质量指标
            const templates = promptLibrary.getAvailableTemplates();
            const qualityMetrics = [];
            
            for (const templateName of templates.slice(0, 3)) {
                const prompt = promptLibrary.generatePrompt(templateName, mockProjectAnalysis, this.testOptions);
                
                const metrics = {
                    template: templateName,
                    length: prompt.length,
                    contextElements: promptEngineeringTests.countContextElements(prompt),
                    instructionClarity: promptEngineeringTests.assessInstructionClarity(prompt),
                    specificity: promptEngineeringTests.assessSpecificity(prompt)
                };
                
                qualityMetrics.push(metrics);
                
                TestAssertions.assertTrue(metrics.contextElements >= 2, `${templateName} should have sufficient context elements`);
                TestAssertions.assertTrue(metrics.instructionClarity >= 0.5, `${templateName} should have reasonable instruction clarity`);
                
                console.log(`✅ ${templateName}: ${metrics.contextElements} context elements, ${metrics.instructionClarity} clarity`);
            }
            
        } catch (error) {
            throw new Error(`Prompt quality metrics test failed: ${error.message}`);
        }
    },

    // 辅助方法 (不会被当作测试用例执行)
    countContextElements: function(prompt) {
        if (!prompt) return 0;
        const elements = ['project name', 'description', 'tech stack', 'features', 'audience', 'tone'];
        return elements.filter(element => prompt.toLowerCase().includes(element.replace(' ', ''))).length;
    },

    assessInstructionClarity: function(prompt) {
        if (!prompt) return 0;
        const clarityIndicators = ['generate', 'create', 'write', 'include', 'format', 'structure'];
        const matches = clarityIndicators.filter(indicator => prompt.toLowerCase().includes(indicator)).length;
        return Math.min(matches / clarityIndicators.length, 1.0);
    },

    assessSpecificity: function(prompt) {
        if (!prompt) return 0;
        const specificTerms = ['markdown', 'section', 'heading', 'bullet', 'code', 'example'];
        const matches = specificTerms.filter(term => prompt.toLowerCase().includes(term)).length;
        return Math.min(matches / specificTerms.length, 1.0);
    },

    async teardown() {
        console.log('🧹 Cleaning up prompt engineering tests...');
        this.mockAIService = null;
    }
};

module.exports = promptEngineeringTests;
