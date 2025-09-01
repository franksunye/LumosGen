/**
 * AI服务测试 - Vitest版本
 * 从自定义测试框架迁移到Vitest
 * 增加真实源码测试以提升覆盖率
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { MockedFunction } from 'vitest'

// 导入VS Code Mock
import { setupVSCodeMock, defaultTestConfig } from '../mocks/vscode-mock'

// 导入真实的源码
import { AIServiceProvider } from '../../src/ai/AIServiceProvider'

// Mock AI服务提供者
class MockAIServiceProvider {
  private requestCount = 0
  private totalTokens = 0
  private totalCost = 0
  private config: any
  
  constructor(config: any = {}) {
    this.config = {
      responseDelay: 100,
      errorRate: 0.05,
      simulateErrors: false,
      ...config
    }
  }
  
  async generateContent(prompt: string, options: any = {}) {
    this.requestCount++
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, this.config.responseDelay))
    
    // 模拟错误
    if (this.config.simulateErrors && Math.random() < this.config.errorRate) {
      throw new Error('Simulated AI service error')
    }
    
    // 模拟token使用和成本
    const estimatedTokens = Math.floor(prompt.length / 4)
    this.totalTokens += estimatedTokens
    this.totalCost += estimatedTokens * 0.0001
    
    return {
      content: `Generated content for: ${prompt.substring(0, 50)}...`,
      tokens: estimatedTokens,
      cost: estimatedTokens * 0.0001,
      provider: 'mock',
      model: 'mock-model',
      timestamp: new Date().toISOString()
    }
  }
  
  getUsageStats() {
    return {
      requestCount: this.requestCount,
      totalTokens: this.totalTokens,
      totalCost: this.totalCost,
      averageTokensPerRequest: this.requestCount > 0 ? this.totalTokens / this.requestCount : 0
    }
  }
  
  reset() {
    this.requestCount = 0
    this.totalTokens = 0
    this.totalCost = 0
  }
}

// 智能降级策略测试
class MockDegradationStrategy {
  private providers: MockAIServiceProvider[]
  private currentProviderIndex = 0
  private failureCount = new Map<string, number>()

  constructor(providers: MockAIServiceProvider[]) {
    this.providers = providers
  }

  async executeWithDegradation(prompt: string, options: any = {}) {
    let lastError: Error

    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[i]
      const providerName = provider.constructor.name

      try {
        const result = await provider.generateContent(prompt, options)

        return {
          ...result,
          usedProvider: providerName,
          attemptNumber: i + 1
        }

      } catch (error) {
        lastError = error as Error

        // 增加失败计数
        const currentFailures = this.failureCount.get(providerName) || 0
        this.failureCount.set(providerName, currentFailures + 1)

        console.log(`Provider ${providerName} failed (attempt ${i + 1}): ${error.message}`)
      }
    }

    throw new Error(`All providers failed. Last error: ${lastError!.message}`)
  }

  getFailureStats() {
    return Object.fromEntries(this.failureCount)
  }
}

describe('AI Service Provider', () => {
  let mockProvider: MockAIServiceProvider
  let errorProvider: MockAIServiceProvider
  
  beforeEach(() => {
    mockProvider = new MockAIServiceProvider()
    errorProvider = new MockAIServiceProvider({ 
      simulateErrors: true, 
      errorRate: 1.0 
    })
  })
  
  describe('基础内容生成', () => {
    it('应该成功生成内容', async () => {
      const prompt = "Generate a marketing description for a JavaScript library"
      const result = await mockProvider.generateContent(prompt)
      
      expect(result.content).toBeTruthy()
      expect(result.content.length).toBeGreaterThan(0)
      expect(result.provider).toBe('mock')
      expect(result.tokens).toBeGreaterThan(0)
      expect(result.cost).toBeGreaterThanOrEqual(0)
      expect(result.content).toContain('Generated content for:')
    })
    
    it('应该返回正确的响应格式', async () => {
      const result = await mockProvider.generateContent("Test prompt")
      
      expect(result).toHaveProperty('content')
      expect(result).toHaveProperty('tokens')
      expect(result).toHaveProperty('cost')
      expect(result).toHaveProperty('provider')
      expect(result).toHaveProperty('model')
      expect(result).toHaveProperty('timestamp')
      
      expect(typeof result.content).toBe('string')
      expect(typeof result.tokens).toBe('number')
      expect(typeof result.cost).toBe('number')
      expect(result.provider).toBe('mock')
    })
  })
  
  describe('使用统计', () => {
    it('应该正确跟踪使用统计', async () => {
      mockProvider.reset()
      
      // 生成几个请求
      await mockProvider.generateContent("Test prompt 1")
      await mockProvider.generateContent("Test prompt 2")
      await mockProvider.generateContent("Test prompt 3")
      
      const stats = mockProvider.getUsageStats()
      
      expect(stats.requestCount).toBe(3)
      expect(stats.totalTokens).toBeGreaterThan(0)
      expect(stats.totalCost).toBeGreaterThan(0)
      expect(stats.averageTokensPerRequest).toBeGreaterThan(0)
    })
    
    it('应该正确计算平均token使用', async () => {
      mockProvider.reset()
      
      await mockProvider.generateContent("Short")
      await mockProvider.generateContent("This is a much longer prompt that should use more tokens")
      
      const stats = mockProvider.getUsageStats()
      
      expect(stats.requestCount).toBe(2)
      expect(stats.averageTokensPerRequest).toBe(stats.totalTokens / 2)
    })
  })
  
  describe('错误处理', () => {
    it('应该正确处理AI服务错误', async () => {
      await expect(
        errorProvider.generateContent("This will fail")
      ).rejects.toThrow('Simulated AI service error')
    })
    
    it('应该在错误后仍能正常工作', async () => {
      // 先触发错误
      try {
        await errorProvider.generateContent("This will fail")
      } catch (error) {
        // 预期的错误
      }
      
      // 然后使用正常的provider
      const result = await mockProvider.generateContent("This should work")
      expect(result.content).toBeTruthy()
    })
  })
  
  describe('性能测试', () => {
    it('应该在合理时间内响应', async () => {
      const startTime = Date.now()
      await mockProvider.generateContent("Test timing")
      const duration = Date.now() - startTime
      
      expect(duration).toBeGreaterThanOrEqual(90) // 至少延迟时间
      expect(duration).toBeLessThan(200) // 不应该太慢
    })
    
    it('应该支持并发请求', async () => {
      const promises = Array.from({ length: 5 }, (_, i) => 
        mockProvider.generateContent(`Concurrent request ${i}`)
      )
      
      const results = await Promise.all(promises)
      
      expect(results).toHaveLength(5)
      results.forEach(result => {
        expect(result.content).toBeTruthy()
        expect(result.provider).toBe('mock')
      })
    })
  })
  
  describe('配置测试', () => {
    it('应该使用自定义配置', () => {
      const customProvider = new MockAIServiceProvider({
        responseDelay: 50,
        errorRate: 0.1
      })

      expect(customProvider['config'].responseDelay).toBe(50)
      expect(customProvider['config'].errorRate).toBe(0.1)
    })
  })

  describe('降级策略测试', () => {
    it('应该在主要提供者失败时使用备用提供者', async () => {
      const primaryProvider = new MockAIServiceProvider({
        simulateErrors: true,
        errorRate: 1.0
      })
      const fallbackProvider = new MockAIServiceProvider({
        simulateErrors: false
      })

      const degradationStrategy = new MockDegradationStrategy([
        primaryProvider,
        fallbackProvider
      ])

      const result = await degradationStrategy.executeWithDegradation("Test prompt")

      expect(result.content).toBeTruthy()
      expect(result.usedProvider).toBe('MockAIServiceProvider')
      expect(result.attemptNumber).toBe(2) // 第二个提供者成功
    })

    it('应该在所有提供者失败时抛出错误', async () => {
      const provider1 = new MockAIServiceProvider({
        simulateErrors: true,
        errorRate: 1.0
      })
      const provider2 = new MockAIServiceProvider({
        simulateErrors: true,
        errorRate: 1.0
      })

      const degradationStrategy = new MockDegradationStrategy([
        provider1,
        provider2
      ])

      await expect(
        degradationStrategy.executeWithDegradation("Test prompt")
      ).rejects.toThrow('All providers failed')
    })

    it('应该跟踪提供者失败统计', async () => {
      const failingProvider = new MockAIServiceProvider({
        simulateErrors: true,
        errorRate: 1.0
      })
      const workingProvider = new MockAIServiceProvider({
        simulateErrors: false
      })

      const degradationStrategy = new MockDegradationStrategy([
        failingProvider,
        workingProvider
      ])

      await degradationStrategy.executeWithDegradation("Test prompt")

      const failureStats = degradationStrategy.getFailureStats()
      // 检查是否有失败记录（键可能不同）
      const failureKeys = Object.keys(failureStats)
      expect(failureKeys.length).toBeGreaterThan(0)

      // 检查总失败次数
      const totalFailures = Object.values(failureStats).reduce((sum: number, count: any) => sum + count, 0)
      expect(totalFailures).toBeGreaterThanOrEqual(1)
    })
  })

  describe('边缘情况测试', () => {
    it('应该处理长提示', async () => {
      const longPrompt = 'A'.repeat(10000) // 10KB的提示

      const result = await mockProvider.generateContent(longPrompt)

      expect(result.content).toBeTruthy()
      expect(result.tokens).toBeGreaterThan(2000) // 长提示应该使用更多token
      expect(result.cost).toBeGreaterThan(0.2) // 相应的成本也更高
    })

    it('应该处理空提示', async () => {
      const emptyPrompt = ""

      const result = await mockProvider.generateContent(emptyPrompt)

      expect(result.content).toBeTruthy()
      expect(result.tokens).toBe(0) // 空提示应该是0个token
      expect(result.cost).toBe(0) // 相应的成本也是0
    })

    it('应该处理特殊字符提示', async () => {
      const specialPrompt = "测试中文 🚀 Special chars: @#$%^&*()[]{}|\\:;\"'<>,.?/~`"

      const result = await mockProvider.generateContent(specialPrompt)

      expect(result.content).toBeTruthy()
      expect(result.tokens).toBeGreaterThan(0)
      expect(result.content).toContain('Generated content for:')
    })

    it('应该处理非常短的提示', async () => {
      const shortPrompt = "Hi"

      const result = await mockProvider.generateContent(shortPrompt)

      expect(result.content).toBeTruthy()
      expect(result.tokens).toBeGreaterThanOrEqual(0)
      expect(result.cost).toBeGreaterThanOrEqual(0)
    })
  })

  describe('高级功能测试', () => {
    it('应该支持自定义选项', async () => {
      const options = {
        temperature: 0.7,
        maxTokens: 1000,
        model: 'custom-model'
      }

      const result = await mockProvider.generateContent("Test with options", options)

      expect(result.content).toBeTruthy()
      expect(result.provider).toBe('mock')
    })

    it('应该正确处理时间戳', async () => {
      const beforeTime = new Date().toISOString()
      const result = await mockProvider.generateContent("Test timestamp")
      const afterTime = new Date().toISOString()

      expect(result.timestamp).toBeTruthy()
      expect(result.timestamp >= beforeTime).toBe(true)
      expect(result.timestamp <= afterTime).toBe(true)
    })

    it('应该支持批量请求', async () => {
      const prompts = [
        "Generate content 1",
        "Generate content 2",
        "Generate content 3"
      ]

      const results = await Promise.all(
        prompts.map(prompt => mockProvider.generateContent(prompt))
      )

      expect(results).toHaveLength(3)
      results.forEach((result, index) => {
        expect(result.content).toContain(`Generate content ${index + 1}`)
        expect(result.provider).toBe('mock')
      })
    })
  })

  // 新增：真实源码集成测试
  describe('真实AI服务集成测试', () => {
    let aiService: AIServiceProvider

    beforeEach(() => {
      // 设置VS Code Mock环境
      setupVSCodeMock(defaultTestConfig)

      // 创建真实的AI服务实例
      aiService = new AIServiceProvider()
    })

    it('应该正确初始化AI服务', () => {
      expect(aiService).toBeDefined()
      expect(typeof aiService.generateContent).toBe('function')
      expect(typeof aiService.getAvailableProviders).toBe('function')
    })

    it('应该返回可用的提供者列表', () => {
      const providers = aiService.getAvailableProviders()
      expect(Array.isArray(providers)).toBe(true)
      expect(providers.length).toBeGreaterThan(0)
    })

    it('应该能够获取使用统计', () => {
      const stats = aiService.getUsageStats()
      expect(stats).toBeDefined()
      expect(typeof stats).toBe('object')
    })

    it('应该能够执行健康检查', async () => {
      const health = await aiService.healthCheck()
      expect(health).toBeDefined()
      expect(health.status).toBeDefined()
      expect(['healthy', 'degraded', 'unhealthy']).toContain(health.status)
    })

    it('应该能够获取配置', () => {
      const config = aiService.getConfig()
      expect(config).toBeDefined()
      expect(typeof config).toBe('object')
    })
  })
})
