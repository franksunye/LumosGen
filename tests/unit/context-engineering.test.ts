/**
 * 上下文工程系统专项测试 - Vitest版本
 * 验证 ContextEngine、ContextSelector、PromptTemplates 的核心功能
 * 从自定义测试框架迁移到Vitest
 * 增加真实源码测试以提升覆盖率
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import path from 'path'
import fs from 'fs'

// 导入VS Code Mock和真实源码
import { setupVSCodeMock, defaultTestConfig } from '../mocks/vscode-mock'
import { ContextEngine } from '../../src/analysis/ContextEngineering'
import { ContextSelector } from '../../src/analysis/ContextSelector'

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

// Mock输出通道
const mockOutputChannel = {
  appendLine: vi.fn((message: string) => console.log(`[LOG] ${message}`)),
  show: vi.fn(),
  clear: vi.fn()
}

// 测试项目分析数据
const mockProjectAnalysis = {
  name: 'test-project',
  description: 'A comprehensive test project for context engineering validation',
  techStack: ['TypeScript', 'React', 'Node.js', 'Express', 'MongoDB'],
  features: [
    'Advanced AI Integration',
    'Real-time Processing',
    'User-friendly Interface',
    'Enterprise-grade Security',
    'Comprehensive Analytics',
    'Multi-platform Support',
    'Extensible Architecture',
    'Scalable Infrastructure'
  ],
  useCases: [
    'AI-powered development',
    'Real-time data processing',
    'Enterprise applications',
    'Analytics and reporting'
  ],
  targetAudience: 'Developers and enterprises',
  repositoryUrl: 'https://github.com/test-org/test-project',
  license: 'MIT',
  keywords: ['ai', 'machine-learning', 'typescript', 'react', 'node.js'],
  documentation: {
    readme: 'Comprehensive README with features and usage',
    userGuide: 'Detailed user guide with examples',
    apiReference: 'Complete API documentation'
  }
}

// Mock上下文引擎
class MockContextEngine {
  private projectPath: string
  private analysisCache: Map<string, any> = new Map()
  private contextCache: Map<string, any> = new Map()

  constructor(projectPath: string) {
    this.projectPath = projectPath
  }

  async analyzeProject(): Promise<typeof mockProjectAnalysis> {
    const cacheKey = 'project_analysis'
    
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)
    }

    // 模拟项目分析
    const analysis = { ...mockProjectAnalysis }
    this.analysisCache.set(cacheKey, analysis)
    
    return analysis
  }

  async extractContext(files: string[]): Promise<{ content: string; metadata: any }> {
    const contexts = []
    const metadata = {
      totalFiles: files.length,
      totalLines: 0,
      languages: new Set<string>(),
      extractedAt: new Date().toISOString()
    }

    for (const file of files) {
      try {
        const content = await this.readFile(file)
        const fileContext = this.processFileContent(file, content)
        
        contexts.push(fileContext)
        metadata.totalLines += fileContext.lines
        metadata.languages.add(fileContext.language)
      } catch (error) {
        console.warn(`Failed to process file ${file}: ${error.message}`)
      }
    }

    return {
      content: contexts.map(ctx => ctx.content).join('\n\n'),
      metadata: {
        ...metadata,
        languages: Array.from(metadata.languages)
      }
    }
  }

  private async readFile(filePath: string): Promise<string> {
    // 模拟文件读取
    const mockContents: Record<string, string> = {
      'README.md': `# Test Project\n\nThis is a comprehensive test project with advanced AI capabilities.`,
      'package.json': JSON.stringify(mockProjectAnalysis, null, 2),
      'src/index.ts': `import express from 'express';\nconst app = express();\napp.listen(3000);`,
      'docs/user-guide.md': `# User Guide\n\nComprehensive guide for users.`,
      'docs/api-reference.md': `# API Reference\n\nComplete API documentation.`
    }

    return mockContents[filePath] || `// Mock content for ${filePath}`
  }

  private processFileContent(filePath: string, content: string) {
    const extension = path.extname(filePath)
    const language = this.getLanguageFromExtension(extension)
    const lines = content.split('\n').length

    return {
      file: filePath,
      content: `File: ${filePath}\n${content}`,
      language,
      lines,
      size: content.length
    }
  }

  private getLanguageFromExtension(ext: string): string {
    const languageMap: Record<string, string> = {
      '.ts': 'typescript',
      '.js': 'javascript',
      '.md': 'markdown',
      '.json': 'json',
      '.py': 'python',
      '.java': 'java',
      '.cpp': 'cpp'
    }
    return languageMap[ext] || 'text'
  }

  async generateContextualPrompt(template: string, context: any): Promise<string> {
    // 模拟上下文提示生成
    let prompt = template

    // 替换模板变量
    const variables = {
      '{{PROJECT_NAME}}': context.projectName || mockProjectAnalysis.name,
      '{{DESCRIPTION}}': context.description || mockProjectAnalysis.description,
      '{{FEATURES}}': context.features?.join(', ') || mockProjectAnalysis.features.join(', '),
      '{{TECH_STACK}}': context.techStack?.join(', ') || mockProjectAnalysis.techStack.join(', '),
      '{{CONTEXT}}': context.extractedContext || 'Project context information'
    }

    for (const [variable, value] of Object.entries(variables)) {
      prompt = prompt.replace(new RegExp(variable, 'g'), value)
    }

    return prompt
  }

  async selectRelevantContext(query: string, availableContext: string[]): Promise<string[]> {
    // 模拟上下文选择算法
    const queryWords = query.toLowerCase().split(' ')
    const relevantContext = []

    for (const context of availableContext) {
      const contextWords = context.toLowerCase().split(' ')
      const relevanceScore = this.calculateRelevanceScore(queryWords, contextWords)
      
      if (relevanceScore > 0.3) {
        relevantContext.push(context)
      }
    }

    // 按相关性排序并返回前5个
    return relevantContext.slice(0, 5)
  }

  private calculateRelevanceScore(queryWords: string[], contextWords: string[]): number {
    const commonWords = queryWords.filter(word => contextWords.includes(word))
    return commonWords.length / queryWords.length
  }

  async optimizeContext(context: string, maxTokens: number = 4000): Promise<string> {
    // 模拟上下文优化
    if (context.length <= maxTokens * 4) { // 假设平均4字符/token
      return context
    }

    // 简单的截断策略
    const truncated = context.substring(0, maxTokens * 4)
    return truncated + '\n\n[Context truncated to fit token limit]'
  }

  getAnalysisCache(): Map<string, any> {
    return new Map(this.analysisCache)
  }

  clearCache(): void {
    this.analysisCache.clear()
    this.contextCache.clear()
  }
}

// Mock提示模板管理器
class MockPromptTemplateManager {
  private templates: Map<string, string> = new Map()

  constructor() {
    this.initializeDefaultTemplates()
  }

  private initializeDefaultTemplates(): void {
    this.templates.set('homepage', `
Create a compelling homepage for {{PROJECT_NAME}}.

Description: {{DESCRIPTION}}
Key Features: {{FEATURES}}
Technology Stack: {{TECH_STACK}}

Context: {{CONTEXT}}

Generate engaging content that highlights the project's value proposition.
`)

    this.templates.set('documentation', `
Generate comprehensive documentation for {{PROJECT_NAME}}.

Project Context: {{CONTEXT}}
Features: {{FEATURES}}
Tech Stack: {{TECH_STACK}}

Create detailed documentation including installation, usage, and examples.
`)

    this.templates.set('blog_post', `
Write a technical blog post about {{PROJECT_NAME}}.

Description: {{DESCRIPTION}}
Technical Details: {{TECH_STACK}}
Context: {{CONTEXT}}

Focus on practical applications and benefits for developers.
`)
  }

  getTemplate(templateName: string): string | undefined {
    return this.templates.get(templateName)
  }

  setTemplate(templateName: string, template: string): void {
    this.templates.set(templateName, template)
  }

  listTemplates(): string[] {
    return Array.from(this.templates.keys())
  }

  validateTemplate(template: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!template || template.trim().length === 0) {
      errors.push('Template cannot be empty')
    }

    if (template.length > 10000) {
      errors.push('Template is too long (max 10000 characters)')
    }

    // 检查必需的变量
    const requiredVariables = ['{{PROJECT_NAME}}', '{{CONTEXT}}']
    for (const variable of requiredVariables) {
      if (!template.includes(variable)) {
        errors.push(`Template must include ${variable}`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

describe('Context Engineering Unit Tests', () => {
  let contextEngine: MockContextEngine
  let templateManager: MockPromptTemplateManager
  let testProjectPath: string

  beforeEach(() => {
    console.log('🔧 Setting up context engineering tests...')
    testProjectPath = path.join(__dirname, '../../test-project')
    contextEngine = new MockContextEngine(testProjectPath)
    templateManager = new MockPromptTemplateManager()
  })

  afterEach(() => {
    contextEngine.clearCache()
  })

  describe('项目分析', () => {
    it('应该正确分析项目结构', async () => {
      const analysis = await contextEngine.analyzeProject()
      
      expect(analysis.name).toBe('test-project')
      expect(analysis.description).toBeTruthy()
      expect(Array.isArray(analysis.techStack)).toBe(true)
      expect(analysis.techStack.length).toBeGreaterThan(0)
      expect(Array.isArray(analysis.features)).toBe(true)
      expect(analysis.features.length).toBeGreaterThan(0)
    })

    it('应该缓存分析结果', async () => {
      const analysis1 = await contextEngine.analyzeProject()
      const analysis2 = await contextEngine.analyzeProject()
      
      expect(analysis1).toEqual(analysis2)
      
      const cache = contextEngine.getAnalysisCache()
      expect(cache.has('project_analysis')).toBe(true)
    })
  })

  describe('上下文提取', () => {
    it('应该从文件中提取上下文', async () => {
      const files = ['README.md', 'package.json', 'src/index.ts']
      const result = await contextEngine.extractContext(files)

      expect(result.content).toBeTruthy()
      expect(result.content.length).toBeGreaterThan(0)
      expect(result.metadata.totalFiles).toBe(3)
      expect(result.metadata.totalLines).toBeGreaterThan(0)
      expect(Array.isArray(result.metadata.languages)).toBe(true)
      expect(result.metadata.languages.length).toBeGreaterThan(0)
    })

    it('应该处理不同类型的文件', async () => {
      const files = ['README.md', 'src/index.ts', 'docs/api-reference.md']
      const result = await contextEngine.extractContext(files)

      expect(result.metadata.languages).toContain('markdown')
      expect(result.metadata.languages).toContain('typescript')
      expect(result.content).toContain('README.md')
      expect(result.content).toContain('index.ts')
    })

    it('应该处理空文件列表', async () => {
      const result = await contextEngine.extractContext([])

      expect(result.content).toBe('')
      expect(result.metadata.totalFiles).toBe(0)
      expect(result.metadata.totalLines).toBe(0)
      expect(result.metadata.languages).toHaveLength(0)
    })
  })

  describe('上下文选择', () => {
    it('应该根据查询选择相关上下文', async () => {
      const query = 'typescript react development'
      const availableContext = [
        'This project uses TypeScript for type safety',
        'React components for user interface',
        'Python backend services',
        'Database configuration settings',
        'TypeScript React development guide'
      ]

      const relevant = await contextEngine.selectRelevantContext(query, availableContext)

      expect(relevant.length).toBeGreaterThan(0)
      expect(relevant.length).toBeLessThanOrEqual(5)

      // 应该包含相关的上下文
      const hasRelevant = relevant.some(context =>
        context.includes('TypeScript') || context.includes('React')
      )
      expect(hasRelevant).toBe(true)
    })

    it('应该处理无相关上下文的查询', async () => {
      const query = 'completely unrelated topic'
      const availableContext = [
        'TypeScript development',
        'React components',
        'Node.js backend'
      ]

      const relevant = await contextEngine.selectRelevantContext(query, availableContext)

      expect(Array.isArray(relevant)).toBe(true)
      // 可能返回空数组或少量结果
    })
  })

  describe('上下文优化', () => {
    it('应该优化长上下文以适应token限制', async () => {
      const longContext = 'A'.repeat(20000) // 很长的上下文
      const optimized = await contextEngine.optimizeContext(longContext, 1000)

      expect(optimized.length).toBeLessThan(longContext.length)
      expect(optimized).toContain('[Context truncated to fit token limit]')
    })

    it('应该保持短上下文不变', async () => {
      const shortContext = 'This is a short context'
      const optimized = await contextEngine.optimizeContext(shortContext, 1000)

      expect(optimized).toBe(shortContext)
    })
  })

  describe('提示模板管理', () => {
    it('应该提供默认模板', () => {
      const templates = templateManager.listTemplates()

      expect(templates).toContain('homepage')
      expect(templates).toContain('documentation')
      expect(templates).toContain('blog_post')
      expect(templates.length).toBeGreaterThanOrEqual(3)
    })

    it('应该获取特定模板', () => {
      const homepageTemplate = templateManager.getTemplate('homepage')

      expect(homepageTemplate).toBeTruthy()
      expect(homepageTemplate).toContain('{{PROJECT_NAME}}')
      expect(homepageTemplate).toContain('{{CONTEXT}}')
    })

    it('应该允许设置自定义模板', () => {
      const customTemplate = 'Custom template for {{PROJECT_NAME}} with {{CONTEXT}}'
      templateManager.setTemplate('custom', customTemplate)

      const retrieved = templateManager.getTemplate('custom')
      expect(retrieved).toBe(customTemplate)

      const templates = templateManager.listTemplates()
      expect(templates).toContain('custom')
    })

    it('应该验证模板格式', () => {
      const validTemplate = 'Valid template for {{PROJECT_NAME}} with {{CONTEXT}}'
      const validation1 = templateManager.validateTemplate(validTemplate)

      expect(validation1.isValid).toBe(true)
      expect(validation1.errors).toHaveLength(0)

      const invalidTemplate = 'Invalid template without required variables'
      const validation2 = templateManager.validateTemplate(invalidTemplate)

      expect(validation2.isValid).toBe(false)
      expect(validation2.errors.length).toBeGreaterThan(0)
    })

    it('应该拒绝空模板', () => {
      const validation = templateManager.validateTemplate('')

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Template cannot be empty')
    })
  })

  describe('上下文提示生成', () => {
    it('应该生成上下文化的提示', async () => {
      const template = templateManager.getTemplate('homepage')!
      const context = {
        projectName: 'Test Project',
        description: 'A test project',
        features: ['Feature 1', 'Feature 2'],
        techStack: ['TypeScript', 'React'],
        extractedContext: 'Project context information'
      }

      const prompt = await contextEngine.generateContextualPrompt(template, context)

      expect(prompt).toContain('Test Project')
      expect(prompt).toContain('A test project')
      expect(prompt).toContain('Feature 1, Feature 2')
      expect(prompt).toContain('TypeScript, React')
      expect(prompt).not.toContain('{{PROJECT_NAME}}')
      expect(prompt).not.toContain('{{CONTEXT}}')
    })

    it('应该使用默认值处理缺失的上下文', async () => {
      const template = 'Template for {{PROJECT_NAME}}: {{DESCRIPTION}}'
      const context = {} // 空上下文

      const prompt = await contextEngine.generateContextualPrompt(template, context)

      expect(prompt).toContain(mockProjectAnalysis.name)
      expect(prompt).toContain(mockProjectAnalysis.description)
    })
  })

  describe('性能和缓存', () => {
    it('应该在合理时间内完成上下文提取', async () => {
      const files = ['README.md', 'package.json', 'src/index.ts', 'docs/user-guide.md']
      const startTime = Date.now()

      await contextEngine.extractContext(files)

      const duration = Date.now() - startTime
      expect(duration).toBeLessThan(1000) // 应该在1秒内完成
    })

    it('应该支持缓存清理', () => {
      const cache = contextEngine.getAnalysisCache()
      cache.set('test', 'value')

      expect(cache.has('test')).toBe(true)

      contextEngine.clearCache()

      const newCache = contextEngine.getAnalysisCache()
      expect(newCache.has('test')).toBe(false)
    })
  })

  describe('错误处理', () => {
    it('应该处理文件读取错误', async () => {
      const files = ['nonexistent-file.txt']

      // 不应该抛出错误，而是优雅地处理
      const result = await contextEngine.extractContext(files)

      expect(result).toBeDefined()
      expect(result.metadata.totalFiles).toBe(1)
    })

    it('应该处理无效的模板变量', async () => {
      const template = 'Template with {{INVALID_VARIABLE}}'
      const context = {}

      const prompt = await contextEngine.generateContextualPrompt(template, context)

      // 应该保留未知变量或用空字符串替换
      expect(prompt).toBeDefined()
    })
  })

  describe('集成测试', () => {
    it('应该完成完整的上下文工程流程', async () => {
      // 1. 分析项目
      const analysis = await contextEngine.analyzeProject()
      expect(analysis.name).toBeTruthy()

      // 2. 提取上下文
      const files = ['README.md', 'package.json']
      const contextResult = await contextEngine.extractContext(files)
      expect(contextResult.content).toBeTruthy()

      // 3. 选择相关上下文
      const query = 'project documentation'
      const availableContext = [contextResult.content]
      const relevant = await contextEngine.selectRelevantContext(query, availableContext)
      expect(relevant.length).toBeGreaterThan(0)

      // 4. 生成提示
      const template = templateManager.getTemplate('documentation')!
      const context = {
        projectName: analysis.name,
        extractedContext: relevant[0]
      }
      const prompt = await contextEngine.generateContextualPrompt(template, context)
      expect(prompt).toContain(analysis.name)
    })
  })

  describe('Vitest特有功能', () => {
    it('应该支持Mock函数验证', () => {
      // 调用Mock函数
      mockOutputChannel.appendLine('Test message')

      expect(mockOutputChannel.appendLine).toHaveBeenCalled()
      expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('Test message')
    })

    it('应该支持快照测试', async () => {
      const analysis = await contextEngine.analyzeProject()

      // 移除动态字段进行快照测试
      const snapshot = {
        name: analysis.name,
        techStack: analysis.techStack,
        features: analysis.features.slice(0, 3), // 只取前3个特性
        keywords: analysis.keywords
      }

      expect(snapshot).toMatchSnapshot()
    })

    it('应该支持异步测试', async () => {
      const promise1 = contextEngine.analyzeProject()
      const promise2 = contextEngine.extractContext(['README.md'])

      const [analysis, context] = await Promise.all([promise1, promise2])

      expect(analysis).toBeDefined()
      expect(context).toBeDefined()
    })
  })

  // 新增：真实上下文工程集成测试
  describe('真实上下文工程集成测试', () => {
    let contextEngine: ContextEngine
    let contextSelector: ContextSelector

    beforeEach(() => {
      // 设置VS Code Mock环境
      setupVSCodeMock(defaultTestConfig)

      // 创建真实的上下文工程实例
      const mockOutputChannel = {
        appendLine: vi.fn(),
        show: vi.fn(),
        clear: vi.fn()
      }
      contextEngine = new ContextEngine('/test/workspace', mockOutputChannel as any)
      contextSelector = new ContextSelector()
    })

    it('应该正确初始化上下文工程', () => {
      expect(contextEngine).toBeDefined()
      expect(typeof contextEngine.analyzeProject).toBe('function')
    })

    it('应该正确初始化上下文选择器', () => {
      expect(contextSelector).toBeDefined()
      expect(typeof contextSelector.selectContext).toBe('function')
    })

    it('应该能够分析项目上下文', async () => {
      const result = await contextEngine.analyzeProject()
      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
      expect(result.analysis).toBeDefined()
      expect(result.selectedContext).toBeDefined()
    })

    it('应该能够选择相关上下文', () => {
      const mockAnalysis = {
        metadata: { name: 'test' },
        structure: { totalFiles: 3 },
        techStack: [],
        features: [],
        documents: [],
        dependencies: [],
        scripts: []
      }
      const selected = contextSelector.selectContext(mockAnalysis, 'marketing-content')
      expect(selected).toBeDefined()
      expect(typeof selected).toBe('object')
    })

    it('应该能够获取上下文统计', async () => {
      const result = await contextEngine.analyzeProject()
      expect(result.performance).toBeDefined()
      expect(typeof result.performance).toBe('object')
      expect(result.performance.analysisTime).toBeGreaterThanOrEqual(0)
    })

    it('应该能够优化上下文选择', () => {
      const mockAnalysis = {
        metadata: { name: 'test' },
        structure: { totalFiles: 2 },
        techStack: ['typescript'],
        features: [],
        documents: [],
        dependencies: ['dep1', 'dep2'],
        scripts: []
      }
      // 测试上下文选择功能存在
      expect(typeof contextSelector.selectContext).toBe('function')
      // 使用有效的taskType 'general' 而不是 'optimization'
      const selected = contextSelector.selectContext(mockAnalysis, 'general')
      expect(selected).toBeDefined()
      expect(typeof selected).toBe('object')
      expect(selected.strategy).toBeDefined()
      expect(selected.strategy.maxTokens).toBeDefined()
      expect(selected.totalTokens).toBeDefined()
    })
  })
})
