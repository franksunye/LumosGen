/**
 * 核心模块集成测试
 * 测试核心模块的真实交互和集成
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { setupVSCodeMock, defaultTestConfig } from '../mocks/vscode-mock'

// 导入核心模块
import { AgentSystem } from '../../src/agents/AgentSystem'
import { AIServiceProvider } from '../../src/ai/AIServiceProvider'
import { MarketingContentGenerator } from '../../src/content/MarketingContentGenerator'
import { WebsiteBuilder } from '../../src/website/WebsiteBuilder'
import { getAIServiceConfig, getLanguage } from '../../src/config/SimpleConfig'

describe('核心模块集成测试', () => {
  beforeEach(() => {
    // 设置完整的VS Code Mock环境
    setupVSCodeMock(defaultTestConfig)
  })

  describe('配置系统集成', () => {
    it('应该能够获取AI服务配置', () => {
      const config = getAIServiceConfig()
      expect(config).toBeDefined()
      expect(config.primary).toBeDefined()
      expect(config.primary.type).toBeDefined()
    })

    it('应该能够获取语言配置', () => {
      const language = getLanguage()
      expect(language).toBe('en')
    })
  })

  describe('AI服务与内容生成器集成', () => {
    let aiService: AIServiceProvider
    let contentGenerator: MarketingContentGenerator

    beforeEach(() => {
      aiService = new AIServiceProvider()
      contentGenerator = new MarketingContentGenerator()
    })

    it('应该能够初始化AI服务和内容生成器', () => {
      expect(aiService).toBeDefined()
      expect(contentGenerator).toBeDefined()
    })

    it('应该能够获取AI服务提供者列表', () => {
      const providers = aiService.getAvailableProviders()
      expect(Array.isArray(providers)).toBe(true)
      expect(providers.length).toBeGreaterThan(0)
    })

    it('应该能够获取内容生成器支持的类型', () => {
      const types = contentGenerator.getSupportedTypes()
      expect(Array.isArray(types)).toBe(true)
    })
  })

  describe('Agent系统与其他模块集成', () => {
    let agentSystem: AgentSystem
    let websiteBuilder: WebsiteBuilder

    beforeEach(() => {
      agentSystem = new AgentSystem()
      websiteBuilder = new WebsiteBuilder()
    })

    it('应该能够初始化Agent系统和网站构建器', () => {
      expect(agentSystem).toBeDefined()
      expect(websiteBuilder).toBeDefined()
    })

    it('应该能够获取Agent系统状态', () => {
      const status = agentSystem.getSystemStatus()
      expect(status).toBeDefined()
      expect(typeof status).toBe('object')
    })

    it('应该能够获取网站构建器可用主题', () => {
      const themes = websiteBuilder.getAvailableThemes()
      expect(Array.isArray(themes)).toBe(true)
    })
  })

  describe('完整工作流集成测试', () => {
    let agentSystem: AgentSystem
    let aiService: AIServiceProvider
    let contentGenerator: MarketingContentGenerator
    let websiteBuilder: WebsiteBuilder

    beforeEach(() => {
      agentSystem = new AgentSystem()
      aiService = new AIServiceProvider()
      contentGenerator = new MarketingContentGenerator()
      websiteBuilder = new WebsiteBuilder()
    })

    it('应该能够初始化所有核心模块', () => {
      expect(agentSystem).toBeDefined()
      expect(aiService).toBeDefined()
      expect(contentGenerator).toBeDefined()
      expect(websiteBuilder).toBeDefined()
    })

    it('应该能够获取所有模块的基本信息', () => {
      // Agent系统
      const agents = agentSystem.getAvailableAgents()
      expect(Array.isArray(agents)).toBe(true)

      // AI服务
      const providers = aiService.getAvailableProviders()
      expect(Array.isArray(providers)).toBe(true)

      // 内容生成器
      const contentTypes = contentGenerator.getSupportedTypes()
      expect(Array.isArray(contentTypes)).toBe(true)

      // 网站构建器
      const themes = websiteBuilder.getAvailableThemes()
      expect(Array.isArray(themes)).toBe(true)
    })

    it('应该能够执行基本的健康检查', async () => {
      // AI服务健康检查
      const aiHealth = await aiService.healthCheck()
      expect(aiHealth).toBeDefined()
      expect(aiHealth.status).toBeDefined()

      // Agent系统状态检查
      const agentStatus = agentSystem.getSystemStatus()
      expect(agentStatus).toBeDefined()

      // 网站构建器状态检查
      const builderStatus = websiteBuilder.getBuildStatus()
      expect(builderStatus).toBeDefined()
    })
  })

  describe('错误处理集成测试', () => {
    it('应该能够处理无效配置', () => {
      // 测试配置错误处理
      expect(() => {
        setupVSCodeMock({})
        const config = getAIServiceConfig()
        expect(config).toBeDefined()
      }).not.toThrow()
    })

    it('应该能够处理模块初始化错误', () => {
      // 测试模块初始化错误处理
      expect(() => {
        new AgentSystem()
        new AIServiceProvider()
        new ContentGenerator()
        new WebsiteBuilder()
      }).not.toThrow()
    })
  })
})
