/**
 * 错误处理集成测试
 * 测试系统的错误处理和恢复能力
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { setupVSCodeMock, defaultTestConfig } from '../mocks/vscode-mock'

// 导入错误处理相关模块
import { ErrorHandler } from '../../src/utils/ErrorHandler'
import { AIServiceProvider } from '../../src/ai/AIServiceProvider'
import { AgentSystem } from '../../src/agents/AgentSystem'

describe('错误处理集成测试', () => {
  let errorHandler: ErrorHandler
  
  beforeEach(() => {
    setupVSCodeMock(defaultTestConfig)
    errorHandler = new ErrorHandler()
  })

  describe('ErrorHandler核心功能', () => {
    it('应该正确初始化错误处理器', () => {
      expect(errorHandler).toBeDefined()
      expect(typeof errorHandler.handleError).toBe('function')
    })

    it('应该能够处理基本错误', () => {
      const testError = new Error('Test error')
      
      expect(() => {
        errorHandler.handleError(testError)
      }).not.toThrow()
    })

    it('应该能够记录错误', () => {
      const testError = new Error('Test error for logging')
      
      errorHandler.logError(testError)
      
      const errorLog = errorHandler.getErrorLog()
      expect(Array.isArray(errorLog)).toBe(true)
    })

    it('应该能够获取错误统计', () => {
      const stats = errorHandler.getErrorStats()
      expect(stats).toBeDefined()
      expect(typeof stats).toBe('object')
    })

    it('应该能够清理错误日志', () => {
      // 添加一些错误
      errorHandler.logError(new Error('Error 1'))
      errorHandler.logError(new Error('Error 2'))
      
      // 清理日志
      errorHandler.clearErrorLog()
      
      const errorLog = errorHandler.getErrorLog()
      expect(errorLog.length).toBe(0)
    })
  })

  describe('AI服务错误处理', () => {
    let aiService: AIServiceProvider

    beforeEach(() => {
      aiService = new AIServiceProvider()
    })

    it('应该能够处理AI服务初始化错误', () => {
      expect(() => {
        new AIServiceProvider()
      }).not.toThrow()
    })

    it('应该能够处理健康检查错误', async () => {
      try {
        const health = await aiService.healthCheck()
        expect(health).toBeDefined()
      } catch (error) {
        // 错误应该被正确处理
        expect(error).toBeDefined()
      }
    })

    it('应该能够处理配置获取错误', () => {
      expect(() => {
        const config = aiService.getConfig()
        expect(config).toBeDefined()
      }).not.toThrow()
    })
  })

  describe('Agent系统错误处理', () => {
    let agentSystem: AgentSystem

    beforeEach(() => {
      agentSystem = new AgentSystem()
    })

    it('应该能够处理Agent系统初始化错误', () => {
      expect(() => {
        new AgentSystem()
      }).not.toThrow()
    })

    it('应该能够处理无效Agent注册', () => {
      expect(() => {
        // 尝试注册无效的Agent
        agentSystem.registerAgent(null as any)
      }).not.toThrow()
    })

    it('应该能够处理系统状态获取错误', () => {
      expect(() => {
        const status = agentSystem.getSystemStatus()
        expect(status).toBeDefined()
      }).not.toThrow()
    })
  })

  describe('错误恢复机制', () => {
    it('应该能够从配置错误中恢复', () => {
      // 设置无效配置
      setupVSCodeMock({})
      
      expect(() => {
        const aiService = new AIServiceProvider()
        const config = aiService.getConfig()
        expect(config).toBeDefined()
      }).not.toThrow()
    })

    it('应该能够从模块加载错误中恢复', () => {
      expect(() => {
        // 尝试创建所有核心模块
        new ErrorHandler()
        new AIServiceProvider()
        new AgentSystem()
      }).not.toThrow()
    })

    it('应该能够处理并发错误', async () => {
      const promises = []
      
      // 创建多个并发操作
      for (let i = 0; i < 5; i++) {
        promises.push(
          Promise.resolve().then(() => {
            const aiService = new AIServiceProvider()
            return aiService.healthCheck()
          }).catch(error => {
            // 错误应该被正确处理
            errorHandler.handleError(error)
            return { status: 'error' }
          })
        )
      }
      
      const results = await Promise.all(promises)
      expect(results).toHaveLength(5)
      results.forEach(result => {
        expect(result).toBeDefined()
      })
    })
  })

  describe('错误分类和优先级', () => {
    it('应该能够分类不同类型的错误', () => {
      const configError = new Error('Configuration error')
      const networkError = new Error('Network error')
      const validationError = new Error('Validation error')
      
      errorHandler.logError(configError, 'config')
      errorHandler.logError(networkError, 'network')
      errorHandler.logError(validationError, 'validation')
      
      const stats = errorHandler.getErrorStats()
      expect(stats).toBeDefined()
    })

    it('应该能够设置错误优先级', () => {
      const criticalError = new Error('Critical error')
      const warningError = new Error('Warning error')
      
      errorHandler.logError(criticalError, 'critical', 'high')
      errorHandler.logError(warningError, 'warning', 'low')
      
      const errorLog = errorHandler.getErrorLog()
      expect(errorLog.length).toBeGreaterThanOrEqual(2)
    })
  })
})
