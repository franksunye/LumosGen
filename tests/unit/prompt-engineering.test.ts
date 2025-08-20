/**
 * 提示工程系统专项测试 - Vitest版本
 * 验证提示模板、上下文注入、质量控制的核心功能
 * 从自定义测试框架迁移到Vitest
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock VS Code API
vi.mock('vscode', () => ({
  workspace: {
    workspaceFolders: [{
      uri: { fsPath: '/test/workspace' }
    }]
  },
  window: {
    createOutputChannel: vi.fn(() => ({
      appendLine: vi.fn(),
      show: vi.fn(),
      clear: vi.fn()
    }))
  }
}))

// 测试项目分析数据
const mockProjectAnalysis = {
  metadata: {
    name: 'TestProject',
    description: 'A revolutionary AI-powered development platform',
    version: '1.0.0',
    author: 'Test Developer',
    license: 'MIT'
  },
  techStack: ['TypeScript', 'React', 'Node.js', 'Express', 'MongoDB'],
  features: [
    'AI Content Generation',
    'Real-time Processing',
    'Advanced Analytics',
    'User-friendly Interface',
    'Enterprise Security',
    'Multi-platform Support'
  ],
  useCases: [
    'AI-powered development',
    'Content automation',
    'Real-time analytics',
    'Enterprise solutions'
  ],
  targetAudience: 'Developers and enterprises',
  marketingGoals: [
    'Increase developer adoption',
    'Showcase AI capabilities',
    'Highlight ease of use',
    'Demonstrate ROI'
  ]
}

// Mock AI服务
class MockAIService {
  async generateContent(prompt: string, options: any = {}) {
    // 模拟AI响应，基于提示词内容生成相应的回复
    const response = {
      content: this.generateMockResponse(prompt),
      tokens: Math.floor(prompt.length / 4),
      cost: 0.001,
      provider: 'mock',
      model: 'mock-model'
    }
    
    // 模拟响应延迟
    await new Promise(resolve => setTimeout(resolve, 100))
    return response
  }
  
  generateMockResponse(prompt: string): string {
    if (prompt.includes('homepage') || prompt.includes('Homepage')) {
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

Ready to revolutionize your workflow? Get started today!`
    } else if (prompt.includes('about') || prompt.includes('About')) {
      return `## About TestProject

TestProject represents the next generation of AI-powered development tools. Built with TypeScript and React, our platform combines cutting-edge artificial intelligence with intuitive user experience.

### Our Mission
To democratize AI development and make advanced machine learning accessible to every developer.

### Technology Stack
- Frontend: React with TypeScript
- Backend: Node.js with Express
- Database: MongoDB
- AI: Advanced machine learning models

### Why Choose TestProject?
1. **Ease of Use**: Intuitive interface designed for developers
2. **Powerful AI**: State-of-the-art machine learning capabilities
3. **Scalable**: Enterprise-ready architecture
4. **Community**: Active developer community and support`
    } else if (prompt.includes('blog') || prompt.includes('Blog') || prompt.includes('Getting Started') || prompt.includes('Write a blog post')) {
      return `# Getting Started with TestProject: A Developer's Guide

Are you ready to supercharge your development workflow with AI? TestProject makes it easier than ever to integrate powerful artificial intelligence into your applications.

## What Makes TestProject Special?

TestProject isn't just another development tool – it's a complete AI-powered platform that understands your needs as a developer.

### Key Benefits:
- **Rapid Development**: Cut development time by 50%
- **AI Integration**: Seamless AI capabilities out of the box
- **TypeScript Support**: Full type safety and IntelliSense
- **React Components**: Pre-built UI components

## Getting Started

Installation is simple:

\`\`\`bash
npm install test-project
\`\`\`

Then import and use:

\`\`\`typescript
import { TestProject } from 'test-project';

const app = new TestProject({
  aiEnabled: true,
  realTimeProcessing: true
});
\`\`\`

## Conclusion

TestProject is more than a tool – it's your AI development partner. Start building the future today!`
    }
    
    return `Generated content based on prompt: ${prompt.substring(0, 100)}...`
  }
}

// Mock提示模板库
class MockPromptTemplateLibrary {
  private templates: Map<string, any> = new Map()
  private aiService: MockAIService

  constructor() {
    this.aiService = new MockAIService()
    this.initializeTemplates()
  }

  private initializeTemplates() {
    this.templates.set('homepage', {
      name: 'Homepage Template',
      description: 'Generate compelling homepage content for projects',
      structure: ['hero', 'features', 'quickstart', 'cta'],
      validationRules: ['min_length', 'includes_features', 'has_cta'],
      template: `Create a compelling homepage for {{PROJECT_NAME}}.

Project: {{PROJECT_NAME}}
Description: {{DESCRIPTION}}
Tech Stack: {{TECH_STACK}}
Key Features: {{FEATURES}}
Target Audience: {{AUDIENCE}}
Tone: {{TONE}}

Generate content that is {{TONE}} and appeals to {{AUDIENCE}}.
{{OPTIMIZATION_STRATEGY}}

Include:
- Engaging hero section
- Feature highlights
- Quick start guide
- Clear call-to-action`
    })

    this.templates.set('about', {
      name: 'About Page Template',
      description: 'Generate comprehensive about page content',
      structure: ['mission', 'technology', 'benefits', 'team'],
      validationRules: ['min_length', 'includes_mission', 'mentions_tech'],
      template: `Create an about page for {{PROJECT_NAME}}.

Project: {{PROJECT_NAME}}
Description: {{DESCRIPTION}}
Mission: {{MISSION}}
Technology: {{TECH_STACK}}
Tone: {{TONE}}

Generate {{TONE}} content that explains:
- Our mission and vision
- Technology stack and approach
- Benefits for users
- Why choose this project
{{OPTIMIZATION_STRATEGY}}`
    })

    this.templates.set('blog', {
      name: 'Blog Post Template',
      description: 'Generate engaging blog post content',
      structure: ['introduction', 'main_content', 'examples', 'conclusion'],
      validationRules: ['min_length', 'has_examples', 'engaging_intro'],
      template: `Write a blog post about {{PROJECT_NAME}}.

Topic: Getting Started with {{PROJECT_NAME}}
Project: {{PROJECT_NAME}}
Description: {{DESCRIPTION}}
Features: {{FEATURES}}
Target Audience: {{AUDIENCE}}
Tone: {{TONE}}

Create a {{TONE}} blog post that:
- Introduces the project compellingly
- Explains key benefits
- Provides practical examples
- Includes code snippets
- Ends with a strong call-to-action
{{OPTIMIZATION_STRATEGY}}`
    })
  }

  getAvailableTemplates(): string[] {
    return Array.from(this.templates.keys())
  }

  getTemplateInfo(templateName: string) {
    return this.templates.get(templateName)
  }

  generatePrompt(templateName: string, projectAnalysis: typeof mockProjectAnalysis, options: any = {}): string {
    const template = this.templates.get(templateName)
    if (!template) {
      throw new Error(`Template not found: ${templateName}`)
    }

    let prompt = template.template

    // 替换模板变量
    const variables = {
      '{{PROJECT_NAME}}': projectAnalysis.metadata?.name || 'Unknown Project',
      '{{DESCRIPTION}}': projectAnalysis.metadata?.description || 'A great project',
      '{{TECH_STACK}}': (projectAnalysis.techStack || []).join(', ') || 'Modern technologies',
      '{{FEATURES}}': (projectAnalysis.features || []).join(', ') || 'Great features',
      '{{AUDIENCE}}': options.audience || projectAnalysis.targetAudience || 'users',
      '{{TONE}}': options.tone || 'professional',
      '{{MISSION}}': options.mission || 'To provide innovative solutions',
      '{{OPTIMIZATION_STRATEGY}}': this.getOptimizationStrategy(options.optimizationStrategy)
    }

    for (const [variable, value] of Object.entries(variables)) {
      prompt = prompt.replace(new RegExp(variable, 'g'), value)
    }

    return prompt
  }

  private getOptimizationStrategy(strategy?: string): string {
    switch (strategy) {
      case 'concise':
        return '\nKeep the content concise and to the point.'
      case 'detailed':
        return '\nProvide detailed explanations and comprehensive information.'
      case 'creative':
        return '\nUse creative language and engaging storytelling.'
      default:
        return '\nBalance clarity with engagement.'
    }
  }

  async generateContent(templateName: string, projectAnalysis: typeof mockProjectAnalysis, options: any = {}) {
    const prompt = this.generatePrompt(templateName, projectAnalysis, options)
    return await this.aiService.generateContent(prompt, options)
  }

  validatePrompt(prompt: string, templateName: string): { isValid: boolean; errors: string[]; score: number } {
    const errors: string[] = []
    let score = 100

    // 基本验证
    if (!prompt || prompt.trim().length === 0) {
      errors.push('Prompt cannot be empty')
      score -= 50
    }

    if (prompt.length < 100) {
      errors.push('Prompt is too short (minimum 100 characters)')
      score -= 20
    }

    if (prompt.length > 10000) {
      errors.push('Prompt is too long (maximum 10000 characters)')
      score -= 10
    }

    // 模板特定验证
    const template = this.templates.get(templateName)
    if (template) {
      for (const rule of template.validationRules) {
        switch (rule) {
          case 'min_length':
            if (prompt.length < 200) {
              errors.push('Content does not meet minimum length requirement')
              score -= 15
            }
            break
          case 'includes_features':
            if (!prompt.includes('feature') && !prompt.includes('Feature')) {
              errors.push('Content should mention features')
              score -= 10
            }
            break
          case 'has_cta':
            if (!prompt.includes('start') && !prompt.includes('get') && !prompt.includes('try')) {
              errors.push('Content should include a call-to-action')
              score -= 10
            }
            break
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      score: Math.max(0, score)
    }
  }

  optimizePrompt(prompt: string, strategy: string = 'balanced'): string {
    switch (strategy) {
      case 'concise':
        return prompt.replace(/\n\n+/g, '\n').substring(0, Math.floor(prompt.length * 0.8))
      case 'detailed':
        return prompt + '\n\nProvide additional context and detailed explanations where appropriate.'
      case 'creative':
        return prompt.replace(/Generate/, 'Creatively craft').replace(/Create/, 'Imaginatively design')
      default:
        return prompt
    }
  }
}

describe('Prompt Engineering Unit Tests', () => {
  let promptLibrary: MockPromptTemplateLibrary
  let aiService: MockAIService
  let testOptions: any

  beforeEach(() => {
    console.log('🔧 Setting up prompt engineering tests...')
    promptLibrary = new MockPromptTemplateLibrary()
    aiService = new MockAIService()
    testOptions = {
      tone: 'professional',
      audience: 'developers',
      optimizationStrategy: 'balanced',
      includeExamples: true,
      maxLength: 2000
    }
  })

  afterEach(() => {
    // 清理测试环境
  })

  describe('提示模板结构', () => {
    it('应该提供基本模板', () => {
      const templates = promptLibrary.getAvailableTemplates()

      expect(templates.length).toBeGreaterThanOrEqual(3)
      expect(templates).toContain('homepage')
      expect(templates).toContain('about')
      expect(templates).toContain('blog')
    })

    it('应该验证模板结构完整性', () => {
      const templates = promptLibrary.getAvailableTemplates()

      for (const templateName of templates) {
        const templateInfo = promptLibrary.getTemplateInfo(templateName)

        expect(templateInfo.name).toBeTruthy()
        expect(templateInfo.name.toLowerCase()).toContain(templateName)
        expect(templateInfo.description.length).toBeGreaterThan(10)
        expect(Array.isArray(templateInfo.structure)).toBe(true)
        expect(templateInfo.structure.length).toBeGreaterThan(0)
        expect(Array.isArray(templateInfo.validationRules)).toBe(true)
        expect(templateInfo.validationRules.length).toBeGreaterThan(0)
      }
    })

    it('应该包含必要的模板元素', () => {
      const homepageTemplate = promptLibrary.getTemplateInfo('homepage')

      expect(homepageTemplate.structure).toContain('hero')
      expect(homepageTemplate.structure).toContain('features')
      expect(homepageTemplate.structure).toContain('cta')
      expect(homepageTemplate.validationRules).toContain('min_length')
      expect(homepageTemplate.validationRules).toContain('includes_features')
    })
  })

  describe('上下文注入', () => {
    it('应该正确注入项目信息', () => {
      const prompt = promptLibrary.generatePrompt('homepage', mockProjectAnalysis, testOptions)

      expect(prompt).toContain(mockProjectAnalysis.metadata.name)
      expect(prompt).toContain(mockProjectAnalysis.metadata.description)
      expect(prompt).toContain('TypeScript')
      expect(prompt).toContain('React')
      expect(prompt).toContain('AI Content Generation')
    })

    it('应该注入选项配置', () => {
      const prompt = promptLibrary.generatePrompt('homepage', mockProjectAnalysis, testOptions)

      expect(prompt).toContain(testOptions.tone)
      expect(prompt).toContain(testOptions.audience)
    })

    it('应该处理缺失的选项', () => {
      const prompt = promptLibrary.generatePrompt('homepage', mockProjectAnalysis, {})

      expect(prompt).toBeTruthy()
      expect(prompt).toContain(mockProjectAnalysis.metadata.name)
      expect(prompt).toContain('professional') // 默认tone
    })

    it('应该为不同模板注入适当的上下文', () => {
      const homepagePrompt = promptLibrary.generatePrompt('homepage', mockProjectAnalysis, testOptions)
      const aboutPrompt = promptLibrary.generatePrompt('about', mockProjectAnalysis, testOptions)
      const blogPrompt = promptLibrary.generatePrompt('blog', mockProjectAnalysis, testOptions)

      expect(homepagePrompt).toContain('hero section')
      expect(aboutPrompt).toContain('mission')
      expect(blogPrompt).toContain('blog post')

      // 所有模板都应该包含项目名称
      expect(homepagePrompt).toContain(mockProjectAnalysis.metadata.name)
      expect(aboutPrompt).toContain(mockProjectAnalysis.metadata.name)
      expect(blogPrompt).toContain(mockProjectAnalysis.metadata.name)
    })
  })

  describe('提示优化策略', () => {
    it('应该支持不同的优化策略', () => {
      const strategies = ['concise', 'detailed', 'creative']

      for (const strategy of strategies) {
        const options = { ...testOptions, optimizationStrategy: strategy }
        const prompt = promptLibrary.generatePrompt('homepage', mockProjectAnalysis, options)

        expect(prompt.length).toBeGreaterThan(100)

        if (strategy === 'concise') {
          expect(prompt).toContain('concise')
        } else if (strategy === 'detailed') {
          expect(prompt).toContain('detailed')
        } else if (strategy === 'creative') {
          expect(prompt).toContain('creative')
        }
      }
    })

    it('应该优化现有提示', () => {
      const basePrompt = 'Generate content for TestProject. Create engaging material.'

      const concisePrompt = promptLibrary.optimizePrompt(basePrompt, 'concise')
      const detailedPrompt = promptLibrary.optimizePrompt(basePrompt, 'detailed')
      const creativePrompt = promptLibrary.optimizePrompt(basePrompt, 'creative')

      expect(concisePrompt.length).toBeLessThanOrEqual(basePrompt.length)
      expect(detailedPrompt.length).toBeGreaterThan(basePrompt.length)
      expect(creativePrompt).toContain('Creatively craft')
      expect(creativePrompt).toContain('Imaginatively design')
    })
  })

  describe('端到端提示生成', () => {
    it('应该生成完整的AI响应', async () => {
      const result = await promptLibrary.generateContent('homepage', mockProjectAnalysis, testOptions)

      expect(result.content).toBeTruthy()
      expect(result.content.length).toBeGreaterThan(100)
      expect(result.tokens).toBeGreaterThan(0)
      expect(result.cost).toBeGreaterThan(0)
      expect(result.provider).toBe('mock')

      // 验证内容质量
      expect(result.content).toContain('TestProject')
      expect(result.content).toContain('AI')
      expect(result.content).toContain('TypeScript')
    })

    it('应该为不同模板生成不同内容', async () => {
      const homepageResult = await promptLibrary.generateContent('homepage', mockProjectAnalysis, testOptions)
      const aboutResult = await promptLibrary.generateContent('about', mockProjectAnalysis, testOptions)
      const blogResult = await promptLibrary.generateContent('blog', mockProjectAnalysis, testOptions)

      // 验证所有内容都包含项目名称
      expect(homepageResult.content).toContain('TestProject')
      expect(aboutResult.content).toContain('TestProject')
      expect(blogResult.content).toContain('TestProject')

      // 验证内容长度合理
      expect(homepageResult.content.length).toBeGreaterThan(100)
      expect(aboutResult.content.length).toBeGreaterThan(100)
      expect(blogResult.content.length).toBeGreaterThan(100)

      // 验证特定内容特征
      expect(homepageResult.content).toContain('Welcome')
      expect(aboutResult.content).toContain('About')
    })
  })

  describe('提示验证', () => {
    it('应该验证提示质量', () => {
      const goodPrompt = promptLibrary.generatePrompt('homepage', mockProjectAnalysis, testOptions)
      const validation = promptLibrary.validatePrompt(goodPrompt, 'homepage')

      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
      expect(validation.score).toBeGreaterThan(80)
    })

    it('应该检测空提示', () => {
      const validation = promptLibrary.validatePrompt('', 'homepage')

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Prompt cannot be empty')
      expect(validation.score).toBeLessThan(100)
    })

    it('应该检测过短的提示', () => {
      const shortPrompt = 'Short'
      const validation = promptLibrary.validatePrompt(shortPrompt, 'homepage')

      expect(validation.isValid).toBe(false)
      expect(validation.errors.some(error => error.includes('too short'))).toBe(true)
      expect(validation.score).toBeLessThan(100)
    })

    it('应该检测过长的提示', () => {
      const longPrompt = 'A'.repeat(15000)
      const validation = promptLibrary.validatePrompt(longPrompt, 'homepage')

      expect(validation.isValid).toBe(false)
      expect(validation.errors.some(error => error.includes('too long'))).toBe(true)
      expect(validation.score).toBeLessThan(100)
    })

    it('应该验证模板特定规则', () => {
      const promptWithoutFeatures = 'Create a homepage for TestProject. It is a great project.'
      const validation = promptLibrary.validatePrompt(promptWithoutFeatures, 'homepage')

      expect(validation.isValid).toBe(false)
      expect(validation.errors.some(error => error.includes('features'))).toBe(true)
    })
  })

  describe('质量控制', () => {
    it('应该确保提示包含关键信息', () => {
      const prompt = promptLibrary.generatePrompt('homepage', mockProjectAnalysis, testOptions)

      // 检查关键信息存在
      expect(prompt).toContain(mockProjectAnalysis.metadata.name)
      expect(prompt).toContain(mockProjectAnalysis.metadata.description)

      // 检查技术栈信息
      const hasTechStack = mockProjectAnalysis.techStack.some(tech =>
        prompt.includes(tech)
      )
      expect(hasTechStack).toBe(true)

      // 检查特性信息
      const hasFeatures = mockProjectAnalysis.features.some(feature =>
        prompt.includes(feature) || prompt.toLowerCase().includes(feature.toLowerCase())
      )
      expect(hasFeatures).toBe(true)
    })

    it('应该生成一致的提示结构', () => {
      const prompt1 = promptLibrary.generatePrompt('homepage', mockProjectAnalysis, testOptions)
      const prompt2 = promptLibrary.generatePrompt('homepage', mockProjectAnalysis, testOptions)

      // 相同输入应该产生相同输出
      expect(prompt1).toBe(prompt2)

      // 但不同模板应该产生不同结构
      const aboutPrompt = promptLibrary.generatePrompt('about', mockProjectAnalysis, testOptions)
      expect(prompt1).not.toBe(aboutPrompt)
    })

    it('应该处理特殊字符和格式', () => {
      const specialAnalysis = {
        ...mockProjectAnalysis,
        metadata: {
          ...mockProjectAnalysis.metadata,
          name: 'Test-Project_2024',
          description: 'A "revolutionary" AI-powered platform with 100% accuracy!'
        }
      }

      const prompt = promptLibrary.generatePrompt('homepage', specialAnalysis, testOptions)

      expect(prompt).toContain('Test-Project_2024')
      expect(prompt).toContain('"revolutionary"')
      expect(prompt).toContain('100%')
    })
  })

  describe('性能测试', () => {
    it('应该在合理时间内生成提示', () => {
      const startTime = Date.now()

      const prompt = promptLibrary.generatePrompt('homepage', mockProjectAnalysis, testOptions)

      const duration = Date.now() - startTime
      expect(duration).toBeLessThan(100) // 应该在100ms内完成
      expect(prompt).toBeTruthy()
    })

    it('应该支持批量提示生成', () => {
      const templates = ['homepage', 'about', 'blog']
      const startTime = Date.now()

      const prompts = templates.map(template =>
        promptLibrary.generatePrompt(template, mockProjectAnalysis, testOptions)
      )

      const duration = Date.now() - startTime
      expect(duration).toBeLessThan(500) // 批量生成应该在500ms内完成
      expect(prompts).toHaveLength(3)
      prompts.forEach(prompt => expect(prompt).toBeTruthy())
    })

    it('应该支持并发AI内容生成', async () => {
      const promises = [
        promptLibrary.generateContent('homepage', mockProjectAnalysis, testOptions),
        promptLibrary.generateContent('about', mockProjectAnalysis, testOptions),
        promptLibrary.generateContent('blog', mockProjectAnalysis, testOptions)
      ]

      const results = await Promise.all(promises)

      expect(results).toHaveLength(3)
      results.forEach(result => {
        expect(result.content).toBeTruthy()
        expect(result.tokens).toBeGreaterThan(0)
      })
    })
  })

  describe('错误处理', () => {
    it('应该处理不存在的模板', () => {
      expect(() => {
        promptLibrary.generatePrompt('nonexistent', mockProjectAnalysis, testOptions)
      }).toThrow('Template not found: nonexistent')
    })

    it('应该处理缺失的项目分析数据', () => {
      const incompleteAnalysis = {
        metadata: { name: 'Test' }
      } as any

      const prompt = promptLibrary.generatePrompt('homepage', incompleteAnalysis, testOptions)

      expect(prompt).toBeTruthy()
      expect(prompt).toContain('Test')
    })

    it('应该处理无效的选项', () => {
      const invalidOptions = {
        tone: null,
        audience: undefined,
        optimizationStrategy: 'invalid'
      }

      const prompt = promptLibrary.generatePrompt('homepage', mockProjectAnalysis, invalidOptions)

      expect(prompt).toBeTruthy()
      expect(prompt).toContain(mockProjectAnalysis.metadata.name)
    })
  })

  describe('Vitest特有功能', () => {
    it('应该支持快照测试', () => {
      const prompt = promptLibrary.generatePrompt('homepage', mockProjectAnalysis, testOptions)

      // 移除动态内容进行快照测试
      const snapshot = {
        templateUsed: 'homepage',
        containsProjectName: prompt.includes(mockProjectAnalysis.metadata.name),
        containsTechStack: prompt.includes('TypeScript'),
        containsFeatures: prompt.includes('AI'),
        promptLength: prompt.length,
        hasOptimization: prompt.includes('professional')
      }

      expect(snapshot).toMatchSnapshot()
    })

    it('应该支持Mock验证', () => {
      const mockFn = vi.fn()
      mockFn.mockReturnValue('mocked prompt')

      const result = mockFn('test')

      expect(result).toBe('mocked prompt')
      expect(mockFn).toHaveBeenCalledWith('test')
    })

    it('应该支持异步测试', async () => {
      const promise1 = promptLibrary.generateContent('homepage', mockProjectAnalysis, testOptions)
      const promise2 = aiService.generateContent('test prompt')

      const [result1, result2] = await Promise.all([promise1, promise2])

      expect(result1.content).toBeTruthy()
      expect(result2.content).toBeTruthy()
    })
  })
})
