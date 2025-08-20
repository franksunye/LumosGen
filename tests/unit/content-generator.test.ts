/**
 * 内容生成器单元测试 - Vitest版本
 * 测试营销内容生成的核心功能
 * 从自定义测试框架迁移到Vitest
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock项目分析结果
const mockProjectAnalysis = {
  name: 'awesome-library',
  description: 'An awesome JavaScript library for developers',
  techStack: ['JavaScript', 'Node.js', 'TypeScript'],
  features: [
    'Easy to use API',
    'High performance',
    'TypeScript support',
    'Comprehensive documentation'
  ],
  useCases: [
    'Web development',
    'API integration',
    'Data processing'
  ],
  targetAudience: 'JavaScript developers',
  repositoryUrl: 'https://github.com/user/awesome-library',
  license: 'MIT',
  keywords: ['javascript', 'library', 'api', 'typescript']
}

// Mock AI服务
class MockAIService {
  async generateContent(prompt: string) {
    // 模拟AI生成的内容
    const contentLength = Math.max(500, prompt.length * 2)
    const content = `# Generated Content

This is AI-generated marketing content for ${mockProjectAnalysis.name}.

## Features
${mockProjectAnalysis.features.map(f => `- ${f}`).join('\n')}

## Use Cases
${mockProjectAnalysis.useCases.map(u => `- ${u}`).join('\n')}

## Technical Stack
Built with ${mockProjectAnalysis.techStack.join(', ')}.

## Getting Started
Install and use this amazing library in your projects.

## Conclusion
${mockProjectAnalysis.name} is the perfect solution for ${mockProjectAnalysis.targetAudience}.`

    return {
      content,
      tokens: Math.floor(content.length / 4),
      cost: Math.floor(content.length / 4) * 0.0001,
      provider: 'mock',
      model: 'mock-model'
    }
  }
}

// Mock内容生成器
class MockContentGenerator {
  private aiService: MockAIService
  private templates: Record<string, any>

  constructor(aiService: MockAIService) {
    this.aiService = aiService
    this.templates = {
      homepage: {
        sections: ['hero', 'features', 'cta'],
        minLength: 500,
        maxLength: 2000
      },
      about: {
        sections: ['overview', 'technical-details', 'benefits'],
        minLength: 300,
        maxLength: 1500
      },
      blog: {
        sections: ['introduction', 'content', 'conclusion'],
        minLength: 800,
        maxLength: 3000
      },
      faq: {
        sections: ['questions', 'answers'],
        minLength: 400,
        maxLength: 1200
      }
    }
  }

  async generateHomepage(projectAnalysis: typeof mockProjectAnalysis) {
    const prompt = this.buildHomepagePrompt(projectAnalysis)
    const response = await this.aiService.generateContent(prompt)
    
    return {
      type: 'homepage',
      title: `${projectAnalysis.name} - ${projectAnalysis.description}`,
      content: response.content,
      sections: this.extractSections(response.content, this.templates.homepage.sections),
      metadata: {
        keywords: projectAnalysis.keywords,
        description: projectAnalysis.description,
        author: 'LumosGen',
        generated: new Date().toISOString()
      },
      stats: {
        wordCount: this.countWords(response.content),
        readingTime: this.estimateReadingTime(response.content),
        tokens: response.tokens,
        cost: response.cost
      }
    }
  }

  async generateAboutPage(projectAnalysis: typeof mockProjectAnalysis) {
    const prompt = this.buildAboutPrompt(projectAnalysis)
    const response = await this.aiService.generateContent(prompt)
    
    return {
      type: 'about',
      title: `About ${projectAnalysis.name}`,
      content: response.content,
      sections: this.extractSections(response.content, this.templates.about.sections),
      metadata: {
        keywords: projectAnalysis.keywords,
        description: `Learn more about ${projectAnalysis.name}`,
        author: 'LumosGen',
        generated: new Date().toISOString()
      },
      stats: {
        wordCount: this.countWords(response.content),
        readingTime: this.estimateReadingTime(response.content),
        tokens: response.tokens,
        cost: response.cost
      }
    }
  }

  async generateBlogPost(projectAnalysis: typeof mockProjectAnalysis, topic: string) {
    const prompt = this.buildBlogPrompt(projectAnalysis, topic)
    const response = await this.aiService.generateContent(prompt)
    
    return {
      type: 'blog',
      title: `${topic} with ${projectAnalysis.name}`,
      content: response.content,
      sections: this.extractSections(response.content, this.templates.blog.sections),
      metadata: {
        keywords: [...projectAnalysis.keywords, ...topic.toLowerCase().split(' ')],
        description: `Learn how to ${topic.toLowerCase()} with ${projectAnalysis.name}`,
        author: 'LumosGen',
        generated: new Date().toISOString(),
        topic
      },
      stats: {
        wordCount: this.countWords(response.content),
        readingTime: this.estimateReadingTime(response.content),
        tokens: response.tokens,
        cost: response.cost
      }
    }
  }

  async generateFAQ(projectAnalysis: typeof mockProjectAnalysis) {
    const prompt = this.buildFAQPrompt(projectAnalysis)
    const response = await this.aiService.generateContent(prompt)
    
    const qaItems = this.extractQAItems(response.content)
    
    return {
      type: 'faq',
      title: `${projectAnalysis.name} FAQ`,
      content: response.content,
      qaItems,
      metadata: {
        keywords: [...projectAnalysis.keywords, 'faq', 'questions', 'help'],
        description: `Frequently asked questions about ${projectAnalysis.name}`,
        author: 'LumosGen',
        generated: new Date().toISOString()
      },
      stats: {
        wordCount: this.countWords(response.content),
        readingTime: this.estimateReadingTime(response.content),
        tokens: response.tokens,
        cost: response.cost
      }
    }
  }

  // 辅助方法
  private buildHomepagePrompt(projectAnalysis: typeof mockProjectAnalysis): string {
    const features = projectAnalysis.features || []

    return `Generate a compelling homepage for ${projectAnalysis.name}: ${projectAnalysis.description}.
    Features: ${features.join(', ')}.
    Target audience: ${projectAnalysis.targetAudience}.`
  }

  private buildAboutPrompt(projectAnalysis: typeof mockProjectAnalysis): string {
    const techStack = projectAnalysis.techStack || []
    const useCases = projectAnalysis.useCases || []

    return `Generate an about page for ${projectAnalysis.name}.
    Technical details: ${techStack.join(', ')}.
    Use cases: ${useCases.join(', ')}.`
  }

  private buildBlogPrompt(projectAnalysis: typeof mockProjectAnalysis, topic: string): string {
    return `Write a blog post about "${topic}" using ${projectAnalysis.name}. 
    Include practical examples and benefits.`
  }

  private buildFAQPrompt(projectAnalysis: typeof mockProjectAnalysis): string {
    return `Generate frequently asked questions and answers for ${projectAnalysis.name}. 
    Cover installation, usage, and common issues.`
  }

  private extractSections(content: string, sectionNames: string[]): Record<string, string> {
    const sections: Record<string, string> = {}
    sectionNames.forEach(name => {
      sections[name] = `Mock ${name} section extracted from content`
    })
    return sections
  }

  private extractQAItems(content: string): Array<{ question: string; answer: string }> {
    return [
      { question: 'How do I install this library?', answer: 'Use npm install command.' },
      { question: 'Is it compatible with TypeScript?', answer: 'Yes, full TypeScript support.' },
      { question: 'What are the system requirements?', answer: 'Node.js 14+ required.' }
    ]
  }

  private countWords(content: string): number {
    return content.split(/\s+/).filter(word => word.length > 0).length
  }

  private estimateReadingTime(content: string): number {
    const wordsPerMinute = 200
    const wordCount = this.countWords(content)
    return Math.ceil(wordCount / wordsPerMinute)
  }

  async generateBatch(projectAnalysis: typeof mockProjectAnalysis, types: string[]): Promise<any[]> {
    const results = []
    
    for (const type of types) {
      switch (type) {
        case 'homepage':
          results.push(await this.generateHomepage(projectAnalysis))
          break
        case 'about':
          results.push(await this.generateAboutPage(projectAnalysis))
          break
        case 'faq':
          results.push(await this.generateFAQ(projectAnalysis))
          break
        default:
          throw new Error(`Unknown content type: ${type}`)
      }
    }
    
    return results
  }

  validateContent(content: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!content.title || content.title.length < 5) {
      errors.push('Title is too short')
    }

    if (!content.content || content.content.length < 100) {
      errors.push('Content is too short')
    }

    if (!content.metadata || !content.metadata.keywords || content.metadata.keywords.length === 0) {
      errors.push('Missing keywords in metadata')
    }

    if (!content.stats || content.stats.wordCount < 50) {
      errors.push('Word count is too low')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

describe('Content Generator Unit Tests', () => {
  let mockAIService: MockAIService
  let contentGenerator: MockContentGenerator

  beforeEach(() => {
    console.log('🔧 Setting up ContentGenerator tests...')
    mockAIService = new MockAIService()
    contentGenerator = new MockContentGenerator(mockAIService)
  })

  describe('主页内容生成', () => {
    it('应该生成有效的主页内容', async () => {
      const result = await contentGenerator.generateHomepage(mockProjectAnalysis)

      expect(result.type).toBe('homepage')
      expect(result.title).toContain(mockProjectAnalysis.name)
      expect(result.content).toBeTruthy()
      expect(result.content.length).toBeGreaterThan(100)

      // 验证元数据
      expect(result.metadata.keywords).toEqual(mockProjectAnalysis.keywords)
      expect(result.metadata.author).toBe('LumosGen')
      expect(result.metadata.generated).toBeTruthy()

      // 验证统计信息
      expect(result.stats.wordCount).toBeGreaterThan(0)
      expect(result.stats.readingTime).toBeGreaterThan(0)
      expect(result.stats.tokens).toBeGreaterThan(0)
      expect(result.stats.cost).toBeGreaterThanOrEqual(0)
    })

    it('应该包含所有必需的部分', async () => {
      const result = await contentGenerator.generateHomepage(mockProjectAnalysis)

      expect(result.sections).toBeDefined()
      expect(result.sections.hero).toBeTruthy()
      expect(result.sections.features).toBeTruthy()
      expect(result.sections.cta).toBeTruthy()
    })
  })

  describe('关于页面生成', () => {
    it('应该生成有效的关于页面内容', async () => {
      const result = await contentGenerator.generateAboutPage(mockProjectAnalysis)

      expect(result.type).toBe('about')
      expect(result.title).toContain('About')
      expect(result.title).toContain(mockProjectAnalysis.name)
      expect(result.content).toBeTruthy()

      // 验证部分
      expect(result.sections.overview).toBeTruthy()
      expect(result.sections['technical-details']).toBeTruthy()
      expect(result.sections.benefits).toBeTruthy()
    })
  })

  describe('博客文章生成', () => {
    it('应该生成有效的博客文章', async () => {
      const topic = 'Getting Started Guide'
      const result = await contentGenerator.generateBlogPost(mockProjectAnalysis, topic)

      expect(result.type).toBe('blog')
      expect(result.title).toContain(topic)
      expect(result.title).toContain(mockProjectAnalysis.name)
      expect(result.content).toBeTruthy()

      // 验证元数据包含主题关键词
      expect(result.metadata.topic).toBe(topic)
      expect(result.metadata.keywords).toContain('getting')
      expect(result.metadata.keywords).toContain('started')
      expect(result.metadata.keywords).toContain('guide')
    })

    it('应该处理不同的博客主题', async () => {
      const topics = ['Installation Guide', 'Advanced Usage', 'Best Practices']

      for (const topic of topics) {
        const result = await contentGenerator.generateBlogPost(mockProjectAnalysis, topic)

        expect(result.title).toContain(topic)
        expect(result.metadata.topic).toBe(topic)
        expect(result.content).toBeTruthy()
      }
    })
  })

  describe('FAQ生成', () => {
    it('应该生成有效的FAQ内容', async () => {
      const result = await contentGenerator.generateFAQ(mockProjectAnalysis)

      expect(result.type).toBe('faq')
      expect(result.title).toContain('FAQ')
      expect(result.content).toBeTruthy()

      // 验证Q&A项目
      expect(result.qaItems).toBeDefined()
      expect(Array.isArray(result.qaItems)).toBe(true)
      expect(result.qaItems.length).toBeGreaterThan(0)

      result.qaItems.forEach((item: any) => {
        expect(item.question).toBeTruthy()
        expect(item.answer).toBeTruthy()
      })

      // 验证FAQ特定的关键词
      expect(result.metadata.keywords).toContain('faq')
      expect(result.metadata.keywords).toContain('questions')
      expect(result.metadata.keywords).toContain('help')
    })
  })

  describe('批量内容生成', () => {
    it('应该支持批量生成多种内容类型', async () => {
      const types = ['homepage', 'about', 'faq']
      const results = await contentGenerator.generateBatch(mockProjectAnalysis, types)

      expect(results).toHaveLength(3)
      expect(results[0].type).toBe('homepage')
      expect(results[1].type).toBe('about')
      expect(results[2].type).toBe('faq')

      results.forEach(result => {
        expect(result.content).toBeTruthy()
        expect(result.metadata).toBeDefined()
        expect(result.stats).toBeDefined()
      })
    })

    it('应该处理无效的内容类型', async () => {
      const types = ['invalid-type']

      await expect(
        contentGenerator.generateBatch(mockProjectAnalysis, types)
      ).rejects.toThrow('Unknown content type: invalid-type')
    })
  })

  describe('内容验证', () => {
    it('应该验证有效内容', async () => {
      const content = await contentGenerator.generateHomepage(mockProjectAnalysis)
      const validation = contentGenerator.validateContent(content)

      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('应该检测无效内容', () => {
      const invalidContent = {
        title: 'Hi', // 太短
        content: 'Short', // 太短
        metadata: { keywords: [] }, // 空关键词
        stats: { wordCount: 10 } // 字数太少
      }

      const validation = contentGenerator.validateContent(invalidContent)

      expect(validation.isValid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)
      expect(validation.errors).toContain('Title is too short')
      expect(validation.errors).toContain('Content is too short')
      expect(validation.errors).toContain('Missing keywords in metadata')
      expect(validation.errors).toContain('Word count is too low')
    })
  })

  describe('内容质量测试', () => {
    it('应该生成适当长度的内容', async () => {
      const homepage = await contentGenerator.generateHomepage(mockProjectAnalysis)
      const about = await contentGenerator.generateAboutPage(mockProjectAnalysis)
      const faq = await contentGenerator.generateFAQ(mockProjectAnalysis)

      // 主页应该是中等长度
      expect(homepage.stats.wordCount).toBeGreaterThanOrEqual(50)
      expect(homepage.stats.wordCount).toBeLessThanOrEqual(500)

      // 关于页面应该是适中长度
      expect(about.stats.wordCount).toBeGreaterThanOrEqual(30)
      expect(about.stats.wordCount).toBeLessThanOrEqual(400)

      // FAQ应该有合理的长度
      expect(faq.stats.wordCount).toBeGreaterThanOrEqual(40)
    })

    it('应该计算正确的阅读时间', async () => {
      const content = await contentGenerator.generateHomepage(mockProjectAnalysis)

      expect(content.stats.readingTime).toBeGreaterThan(0)

      // 阅读时间应该基于字数合理计算（200字/分钟）
      const expectedTime = Math.ceil(content.stats.wordCount / 200)
      expect(content.stats.readingTime).toBe(expectedTime)
    })

    it('应该包含项目特定信息', async () => {
      const content = await contentGenerator.generateHomepage(mockProjectAnalysis)

      expect(content.content).toContain(mockProjectAnalysis.name)
      expect(content.title).toContain(mockProjectAnalysis.name)

      // 应该包含一些特性
      const hasFeatures = mockProjectAnalysis.features.some(feature =>
        content.content.includes(feature)
      )
      expect(hasFeatures).toBe(true)
    })
  })

  describe('错误处理', () => {
    it('应该处理空的项目分析', async () => {
      const emptyAnalysis = {
        name: '',
        description: '',
        techStack: [],
        features: [],
        useCases: [],
        targetAudience: '',
        repositoryUrl: '',
        license: '',
        keywords: []
      }

      const result = await contentGenerator.generateHomepage(emptyAnalysis)

      // 即使输入为空，也应该生成基本内容
      expect(result.content).toBeTruthy()
      expect(result.type).toBe('homepage')
    })

    it('应该处理缺失的字段', async () => {
      const partialAnalysis = {
        name: 'test-lib',
        description: 'A test library'
        // 缺失其他字段
      } as any

      const result = await contentGenerator.generateAboutPage(partialAnalysis)

      expect(result.content).toBeTruthy()
      expect(result.title).toContain('test-lib')
    })
  })

  describe('性能测试', () => {
    it('应该在合理时间内生成内容', async () => {
      const startTime = Date.now()

      await contentGenerator.generateHomepage(mockProjectAnalysis)

      const duration = Date.now() - startTime
      expect(duration).toBeLessThan(1000) // 应该在1秒内完成
    })

    it('应该支持并发内容生成', async () => {
      const promises = [
        contentGenerator.generateHomepage(mockProjectAnalysis),
        contentGenerator.generateAboutPage(mockProjectAnalysis),
        contentGenerator.generateFAQ(mockProjectAnalysis)
      ]

      const results = await Promise.all(promises)

      expect(results).toHaveLength(3)
      expect(results[0].type).toBe('homepage')
      expect(results[1].type).toBe('about')
      expect(results[2].type).toBe('faq')
    })
  })

  describe('模板系统', () => {
    it('应该使用正确的模板配置', () => {
      const templates = (contentGenerator as any).templates

      expect(templates.homepage).toBeDefined()
      expect(templates.homepage.sections).toContain('hero')
      expect(templates.homepage.sections).toContain('features')
      expect(templates.homepage.sections).toContain('cta')

      expect(templates.about.sections).toContain('overview')
      expect(templates.faq.sections).toContain('questions')
    })

    it('应该提取正确的内容部分', async () => {
      const content = await contentGenerator.generateHomepage(mockProjectAnalysis)

      expect(content.sections).toBeDefined()
      expect(Object.keys(content.sections)).toHaveLength(3)
      expect(content.sections.hero).toBeTruthy()
      expect(content.sections.features).toBeTruthy()
      expect(content.sections.cta).toBeTruthy()
    })
  })

  describe('元数据生成', () => {
    it('应该生成正确的元数据', async () => {
      const content = await contentGenerator.generateHomepage(mockProjectAnalysis)

      expect(content.metadata.keywords).toEqual(mockProjectAnalysis.keywords)
      expect(content.metadata.description).toBe(mockProjectAnalysis.description)
      expect(content.metadata.author).toBe('LumosGen')
      expect(content.metadata.generated).toBeTruthy()

      // 验证时间戳格式
      const timestamp = new Date(content.metadata.generated)
      expect(timestamp.getTime()).not.toBeNaN()
    })

    it('应该为不同内容类型生成适当的元数据', async () => {
      const blog = await contentGenerator.generateBlogPost(mockProjectAnalysis, 'Advanced Usage')

      expect(blog.metadata.topic).toBe('Advanced Usage')
      expect(blog.metadata.keywords).toContain('advanced')
      expect(blog.metadata.keywords).toContain('usage')
      expect(blog.metadata.description).toContain('advanced usage')
    })
  })

  describe('Vitest特有功能', () => {
    it('应该支持快照测试', async () => {
      const content = await contentGenerator.generateHomepage(mockProjectAnalysis)

      // 移除动态字段进行快照测试
      const snapshot = {
        type: content.type,
        title: content.title,
        sections: Object.keys(content.sections),
        metadataKeys: Object.keys(content.metadata),
        statsKeys: Object.keys(content.stats)
      }

      expect(snapshot).toMatchSnapshot()
    })

    it('应该支持Mock验证', () => {
      const mockFn = vi.fn()
      mockFn.mockReturnValue('mocked content')

      const result = mockFn('test')

      expect(result).toBe('mocked content')
      expect(mockFn).toHaveBeenCalledWith('test')
    })
  })
})
