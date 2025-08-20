/**
 * AI服务测试 - Vitest版本
 * 从自定义测试框架迁移到Vitest
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { MockedFunction } from 'vitest'

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
})
