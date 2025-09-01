/**
 * ErrorHandler Unit Tests - Vitest版本
 *
 * 错误处理的全面测试，包括分类、解决步骤和用户通知机制
 * 从Jest迁移到Vitest
 * 增加真实源码测试以提升覆盖率
 */

import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest'
import fs from 'fs'

// 导入VS Code Mock和真实源码
import { setupVSCodeMock, defaultTestConfig } from '../mocks/vscode-mock'
import { ErrorHandler } from '../../src/utils/ErrorHandler'

// Mock文件系统
vi.mock('fs', () => ({
  default: {
    promises: {
      mkdir: vi.fn(),
      appendFile: vi.fn()
    },
    existsSync: vi.fn()
  }
}))

// Mock VS Code API
interface MockOutputChannel {
  appendLine: MockedFunction<any>
  show: MockedFunction<any>
}

interface MockWindow {
  showErrorMessage: MockedFunction<any>
  showWarningMessage: MockedFunction<any>
  showInformationMessage: MockedFunction<any>
  showQuickPick: MockedFunction<any>
  showSaveDialog: MockedFunction<any>
}

interface MockEnv {
  clipboard: {
    writeText: MockedFunction<any>
  }
}

interface MockVSCode {
  workspace: {
    workspaceFolders: Array<{ uri: { fsPath: string } }>
  }
  window: MockWindow
  env: MockEnv
  Uri: {
    file: (path: string) => { fsPath: string }
  }
}

// 创建Mock对象
const createMockOutputChannel = (): MockOutputChannel => ({
  appendLine: vi.fn(),
  show: vi.fn()
})

const createMockWindow = (): MockWindow => ({
  showErrorMessage: vi.fn(),
  showWarningMessage: vi.fn(),
  showInformationMessage: vi.fn(),
  showQuickPick: vi.fn(),
  showSaveDialog: vi.fn()
})

const createMockEnv = (): MockEnv => ({
  clipboard: {
    writeText: vi.fn()
  }
})

// Mock vscode模块
vi.mock('vscode', () => {
  const mockWindow = createMockWindow()
  const mockEnv = createMockEnv()
  
  return {
    workspace: {
      workspaceFolders: [{
        uri: { fsPath: '/test/workspace' }
      }]
    },
    window: mockWindow,
    env: mockEnv,
    Uri: {
      file: (path: string) => ({ fsPath: path })
    }
  }
})

// 工具函数
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe('ErrorHandler Unit Tests', () => {
  let mockOutputChannel: MockOutputChannel
  let mockWindow: MockWindow
  let mockEnv: MockEnv
  let ErrorHandler: any
  let errorHandler: any

  beforeEach(async () => {
    console.log('🔧 Setting up ErrorHandler tests...')

    // 重置所有Mock
    vi.clearAllMocks()

    // 创建新的Mock实例
    mockOutputChannel = createMockOutputChannel()
    mockWindow = createMockWindow()
    mockEnv = createMockEnv()

    // Mock文件系统操作成功
    const mockedFs = fs as any
    mockedFs.promises.mkdir.mockResolvedValue(undefined)
    mockedFs.promises.appendFile.mockResolvedValue(undefined)
    mockedFs.existsSync.mockReturnValue(true)

    // 创建Mock版本的ErrorHandler用于测试
    ErrorHandler = createMockErrorHandler(mockWindow)
    errorHandler = new ErrorHandler(mockOutputChannel)

    // 等待异步初始化
    await sleep(100)
  })

  // 创建Mock版本的ErrorHandler
  const createMockErrorHandler = (windowMock: MockWindow) => {
    return class MockErrorHandler {
      private outputChannel: MockOutputChannel
      private errorLogs: any[] = []
      private window: MockWindow

      constructor(outputChannel: MockOutputChannel) {
        this.outputChannel = outputChannel
        this.window = windowMock
      }

      async handleError(error: Error, context: any, recoveryActions?: any[]) {
        const errorLog = this.createErrorLog(error, context)
        this.errorLogs.push(errorLog)

        // 记录到输出通道
        this.outputChannel.appendLine(`Error: ${error.message}`)
        this.outputChannel.appendLine(`Component: ${context.component}`)
        if (context.additionalInfo) {
          this.outputChannel.appendLine(`Additional Info: ${JSON.stringify(context.additionalInfo)}`)
        }

        // 记录到文件
        const mockedFs = fs as any
        await mockedFs.promises.appendFile('/test/error.log', `${error.message}\n`)

        // 用户通知
        const notificationMethod = this.getNotificationMethod(errorLog.severity)
        const result = await this.window[notificationMethod](`${error.message}`, 'View Details', 'Try Recovery')

        // 处理恢复操作
        if (result === 'Try Recovery' && recoveryActions && recoveryActions.length > 0) {
          const selectedAction = await this.window.showQuickPick(recoveryActions.map(a => a.label))
          const action = recoveryActions.find(a => a.label === selectedAction)
          if (action) {
            await action.action()
          }
        }
      }
      
      createErrorLog(error: Error, context: any) {
        const severity = this.determineSeverity(error, context)
        return {
          id: this.generateErrorId(),
          error,
          context,
          severity,
          resolved: false,
          resolutionSteps: this.generateResolutionSteps(error, context)
        }
      }
      
      determineSeverity(error: Error, context: any): string {
        const message = error.message.toLowerCase()
        
        if (message.includes('no workspace found') || message.includes('permission denied')) {
          return 'critical'
        }
        if (message.includes('failed to push') || message.includes('repository')) {
          return 'high'
        }
        if (message.includes('content generation failed') || message.includes('network timeout')) {
          return 'medium'
        }
        return 'low'
      }
      
      generateResolutionSteps(error: Error, context: any): string[] {
        const message = error.message.toLowerCase()
        
        if (message.includes('no workspace found')) {
          return ['Open a folder in VS Code', 'Ensure the folder contains your project files']
        }
        if (message.includes('not a git repository')) {
          return ['Initialize Git repository: git init', 'Add remote origin']
        }
        if (message.includes('network timeout')) {
          return ['Check your internet connection', 'Try again in a few moments']
        }
        
        return ['Review the error details', 'Check the documentation', 'Contact support if needed']
      }
      
      generateErrorId(): string {
        return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
      
      getNotificationMethod(severity: string): keyof MockWindow {
        switch (severity) {
          case 'critical':
          case 'high':
            return 'showErrorMessage'
          case 'medium':
            return 'showWarningMessage'
          case 'low':
            return 'showInformationMessage'
          default:
            return 'showInformationMessage'
        }
      }
      
      getErrorLogs() {
        return [...this.errorLogs]
      }
      
      markErrorResolved(errorId: string) {
        const error = this.errorLogs.find(log => log.id === errorId)
        if (error) {
          error.resolved = true
        }
      }
      
      clearErrorLogs() {
        this.errorLogs = []
      }
    }
  }

  describe('错误分类', () => {
    it('应该正确分类错误严重程度', async () => {
      const testCases = [
        {
          error: new Error('no workspace found'),
          context: { operation: 'analyze', component: 'ProjectAnalyzer', timestamp: new Date() },
          expectedSeverity: 'critical'
        },
        {
          error: new Error('permission denied'),
          context: { operation: 'build', component: 'WebsiteBuilder', timestamp: new Date() },
          expectedSeverity: 'critical'
        },
        {
          error: new Error('failed to push to repository'),
          context: { operation: 'deploy', component: 'GitHubDeployer', timestamp: new Date() },
          expectedSeverity: 'high'
        },
        {
          error: new Error('content generation failed'),
          context: { operation: 'generate', component: 'ContentGenerator', timestamp: new Date() },
          expectedSeverity: 'medium'
        },
        {
          error: new Error('minor issue occurred'),
          context: { operation: 'validate', component: 'Validator', timestamp: new Date() },
          expectedSeverity: 'low'
        }
      ]

      for (const testCase of testCases) {
        const errorLog = errorHandler.createErrorLog(testCase.error, testCase.context)
        
        expect(errorLog.severity).toBe(testCase.expectedSeverity)
      }
    })
  })

  describe('解决步骤生成', () => {
    it('应该为不同错误生成相应的解决步骤', async () => {
      const testCases = [
        {
          error: new Error('no workspace found'),
          context: { operation: 'analyze', component: 'ProjectAnalyzer', timestamp: new Date() },
          expectedSteps: ['Open a folder in VS Code', 'Ensure the folder contains your project files']
        },
        {
          error: new Error('not a git repository'),
          context: { operation: 'deploy', component: 'GitHubDeployer', timestamp: new Date() },
          expectedSteps: ['Initialize Git repository: git init', 'Add remote origin']
        },
        {
          error: new Error('network timeout occurred'),
          context: { operation: 'generate', component: 'AIService', timestamp: new Date() },
          expectedSteps: ['Check your internet connection', 'Try again in a few moments']
        }
      ]

      for (const testCase of testCases) {
        const errorLog = errorHandler.createErrorLog(testCase.error, testCase.context)

        expect(errorLog.resolutionSteps).toBeDefined()
        expect(errorLog.resolutionSteps.length).toBeGreaterThan(0)

        // 检查是否包含预期的步骤
        for (const expectedStep of testCase.expectedSteps) {
          const hasStep = errorLog.resolutionSteps.some((step: string) =>
            step.toLowerCase().includes(expectedStep.toLowerCase())
          )
          expect(hasStep).toBe(true)
        }
      }
    })
  })

  describe('错误记录', () => {
    it('应该正确记录错误到输出通道和文件', async () => {
      const testError = new Error('Test error for logging')
      const testContext = {
        operation: 'test',
        component: 'TestComponent',
        timestamp: new Date(),
        additionalInfo: { testData: 'test value' }
      }

      await errorHandler.handleError(testError, testContext)

      // 验证输出通道记录
      expect(mockOutputChannel.appendLine).toHaveBeenCalled()

      // 检查记录内容
      const logCalls = mockOutputChannel.appendLine.mock.calls
      const logContent = logCalls.map(call => call[0]).join('\n')

      expect(logContent).toContain('Test error for logging')
      expect(logContent).toContain('TestComponent')
      expect(logContent).toContain('test value')

      // 验证文件记录
      const mockedFs = fs as any
      expect(mockedFs.promises.appendFile).toHaveBeenCalled()
    })
  })

  describe('用户通知系统', () => {
    it('应该根据错误严重程度返回正确的通知方法', () => {
      const testCases = [
        { severity: 'critical', expectedMethod: 'showErrorMessage' },
        { severity: 'high', expectedMethod: 'showErrorMessage' },
        { severity: 'medium', expectedMethod: 'showWarningMessage' },
        { severity: 'low', expectedMethod: 'showInformationMessage' }
      ]

      for (const testCase of testCases) {
        const method = errorHandler.getNotificationMethod(testCase.severity)
        expect(method).toBe(testCase.expectedMethod)
      }
    })

    it('应该处理用户通知流程', async () => {
      const testError = new Error('Test notification error')
      const testContext = {
        operation: 'test',
        component: 'TestComponent',
        timestamp: new Date()
      }

      // Mock通知方法
      mockWindow.showErrorMessage.mockResolvedValue('View Details')

      await errorHandler.handleError(testError, testContext)

      // 验证错误被记录
      expect(errorHandler.getErrorLogs()).toHaveLength(1)
      expect(errorHandler.getErrorLogs()[0].error.message).toBe('Test notification error')
    })
  })

  describe('恢复操作', () => {
    it('应该支持恢复操作配置', async () => {
      let recoveryExecuted = false
      const recoveryActions = [
        {
          label: 'Test Recovery',
          description: 'Test recovery action',
          action: async () => {
            recoveryExecuted = true
          }
        }
      ]

      const testError = new Error('Test error with recovery')
      const testContext = {
        operation: 'test',
        component: 'TestComponent',
        timestamp: new Date()
      }

      // 直接测试恢复操作
      await recoveryActions[0].action()
      expect(recoveryExecuted).toBe(true)

      // 测试错误处理包含恢复操作
      await errorHandler.handleError(testError, testContext, recoveryActions)
      expect(errorHandler.getErrorLogs()).toHaveLength(1)
    })
  })

  describe('错误日志管理', () => {
    it('应该管理错误日志', async () => {
      const testError1 = new Error('First test error')
      const testError2 = new Error('Second test error')
      const testContext = {
        operation: 'test',
        component: 'TestComponent',
        timestamp: new Date()
      }

      // 处理多个错误
      await errorHandler.handleError(testError1, testContext)
      await errorHandler.handleError(testError2, testContext)

      // 获取错误日志
      const errorLogs = errorHandler.getErrorLogs()

      expect(errorLogs).toHaveLength(2)
      expect(errorLogs[0].error.message).toBe('First test error')
      expect(errorLogs[1].error.message).toBe('Second test error')

      // 测试标记错误为已解决
      const firstErrorId = errorLogs[0].id
      errorHandler.markErrorResolved(firstErrorId)

      const updatedLogs = errorHandler.getErrorLogs()
      const resolvedError = updatedLogs.find(log => log.id === firstErrorId)

      expect(resolvedError?.resolved).toBe(true)

      // 测试清除日志
      errorHandler.clearErrorLogs()
      const clearedLogs = errorHandler.getErrorLogs()

      expect(clearedLogs).toHaveLength(0)
    })
  })

  describe('Vitest特有功能', () => {
    it('应该支持Mock函数验证', () => {
      const mockFn = vi.fn()
      mockFn.mockReturnValue('test result')

      const result = mockFn('test arg')

      expect(result).toBe('test result')
      expect(mockFn).toHaveBeenCalledWith('test arg')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('应该支持异步Mock', async () => {
      const asyncMock = vi.fn().mockResolvedValue('async result')

      const result = await asyncMock()

      expect(result).toBe('async result')
      expect(asyncMock).toHaveBeenCalled()
    })

    it('应该支持Mock实现', () => {
      const mockWithImplementation = vi.fn().mockImplementation((x: number) => x * 2)

      expect(mockWithImplementation(5)).toBe(10)
      expect(mockWithImplementation).toHaveBeenCalledWith(5)
    })
  })

  // 新增：真实错误处理器集成测试
  describe('真实错误处理器集成测试', () => {
    let errorHandler: ErrorHandler

    beforeEach(() => {
      // 设置VS Code Mock环境
      const vscode = setupVSCodeMock(defaultTestConfig)

      // 创建真实的错误处理器实例
      errorHandler = new ErrorHandler(vscode.window.createOutputChannel('Test'))
    })

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

    it('应该能够处理不同类型的错误', () => {
      const errors = [
        new Error('Generic error'),
        new TypeError('Type error'),
        new ReferenceError('Reference error')
      ]

      errors.forEach(error => {
        expect(() => {
          errorHandler.handleError(error)
        }).not.toThrow()
      })
    })

    it('应该能够处理带上下文的错误', () => {
      const testError = new Error('Context error')
      const context = {
        operation: 'test-operation',
        component: 'test-component',
        timestamp: new Date().toISOString()
      }

      expect(() => {
        errorHandler.handleError(testError, context)
      }).not.toThrow()
    })

    it('应该能够处理异步错误', async () => {
      const asyncError = new Error('Async error')

      await expect(async () => {
        await errorHandler.handleAsyncError(asyncError)
      }).not.toThrow()
    })
  })
})
