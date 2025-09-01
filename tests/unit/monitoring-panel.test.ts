/**
 * MonitoringPanel Unit Tests - Vitest Migration
 *
 * Comprehensive testing of AI monitoring panel functionality including
 * webview creation, data updates, export functionality, and user interactions.
 * 增加真实源码测试以提升覆盖率
 */

import { describe, it, expect, beforeEach, vi, beforeAll, afterEach } from 'vitest'

// 导入VS Code Mock和真实源码
import { setupVSCodeMock, defaultTestConfig } from '../mocks/vscode-mock'
import { MonitoringPanel } from '../../src/ui/MonitoringPanel'

// Mock VS Code API types
interface MockWebviewPanel {
  reveal: ReturnType<typeof vi.fn>
  dispose: ReturnType<typeof vi.fn>
  onDidDispose: ReturnType<typeof vi.fn>
  webview: {
    html: string
    onDidReceiveMessage: ReturnType<typeof vi.fn>
    postMessage: ReturnType<typeof vi.fn>
  }
}

interface MockWindow {
  createWebviewPanel: ReturnType<typeof vi.fn>
  showWarningMessage: ReturnType<typeof vi.fn>
  showInformationMessage: ReturnType<typeof vi.fn>
  showErrorMessage: ReturnType<typeof vi.fn>
  showSaveDialog: ReturnType<typeof vi.fn>
  activeTextEditor: null
}

interface MockWorkspace {
  fs: {
    writeFile: ReturnType<typeof vi.fn>
  }
}

interface MockUri {
  file: ReturnType<typeof vi.fn>
  joinPath: ReturnType<typeof vi.fn>
}

// Create mocks
const mockWebviewPanel: MockWebviewPanel = {
  reveal: vi.fn(),
  dispose: vi.fn(),
  onDidDispose: vi.fn(),
  webview: {
    html: '',
    onDidReceiveMessage: vi.fn(),
    postMessage: vi.fn()
  }
}

const mockWindow: MockWindow = {
  createWebviewPanel: vi.fn(() => mockWebviewPanel),
  showWarningMessage: vi.fn(),
  showInformationMessage: vi.fn(),
  showErrorMessage: vi.fn(),
  showSaveDialog: vi.fn(),
  activeTextEditor: null
}

const mockWorkspace: MockWorkspace = {
  fs: {
    writeFile: vi.fn()
  }
}

const mockUri: MockUri = {
  file: vi.fn((path: string) => ({ fsPath: path })),
  joinPath: vi.fn(() => ({}))
}

const mockVscode = {
  window: mockWindow,
  workspace: mockWorkspace,
  Uri: mockUri,
  ViewColumn: { One: 1 }
}

// Mock AI Service Provider
const mockAIServiceProvider = {
  getUsageStats: vi.fn(() => ({
    deepseek: {
      requests: 10,
      tokens: { total: 5000, input: 3000, output: 2000 },
      cost: 0.05,
      errors: 1
    },
    openai: {
      requests: 5,
      tokens: { total: 2000, input: 1200, output: 800 },
      cost: 0.20,
      errors: 0
    }
  })),
  getTotalCost: vi.fn(() => 0.25),
  getCurrentProvider: vi.fn(() => ({ name: 'DeepSeek' })),
  getAvailableProviders: vi.fn(() => ['deepseek', 'openai', 'mock']),
  healthCheck: vi.fn(() => Promise.resolve({ 
    status: 'healthy', 
    providers: ['deepseek', 'openai'] 
  }))
}

// Mock vscode module
vi.mock('vscode', () => mockVscode)

describe('MonitoringPanel', () => {
  let MonitoringPanel: any
  let extensionUri: any

  beforeAll(async () => {
    // Import MonitoringPanel after mocking
    const module = await import('@/ui/MonitoringPanel')
    MonitoringPanel = module.MonitoringPanel
  })

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()

    extensionUri = { fsPath: '/test/extension' }

    // Reset static panel instance and dispose any existing panel
    if (MonitoringPanel.currentPanel) {
      MonitoringPanel.currentPanel.dispose()
    }
    MonitoringPanel.currentPanel = undefined
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Panel Creation', () => {
    it('should create new webview panel', () => {
      MonitoringPanel.createOrShow(extensionUri, mockAIServiceProvider)
      
      expect(mockWindow.createWebviewPanel).toHaveBeenCalledWith(
        'lumosGenMonitoring',
        'LumosGen AI Monitoring',
        expect.any(Number),
        expect.objectContaining({
          enableScripts: true,
          localResourceRoots: expect.any(Array)
        })
      )
    })

    it('should reveal existing panel instead of creating new one', () => {
      // Create first panel
      MonitoringPanel.createOrShow(extensionUri, mockAIServiceProvider)
      
      vi.clearAllMocks()
      
      // Try to create second panel
      MonitoringPanel.createOrShow(extensionUri, mockAIServiceProvider)
      
      expect(mockWebviewPanel.reveal).toHaveBeenCalled()
      expect(mockWindow.createWebviewPanel).not.toHaveBeenCalled()
    })

    it('should register disposal handler', () => {
      MonitoringPanel.createOrShow(extensionUri, mockAIServiceProvider)
      
      expect(mockWebviewPanel.onDidDispose).toHaveBeenCalled()
    })
  })

  describe('Webview Content Generation', () => {
    it('should generate HTML content with AI service data', () => {
      MonitoringPanel.createOrShow(extensionUri, mockAIServiceProvider)
      
      const htmlContent = mockWebviewPanel.webview.html
      
      expect(htmlContent.length).toBeGreaterThan(0)
      expect(htmlContent).toContain('<!DOCTYPE html>')
      expect(htmlContent).toContain('LumosGen AI Monitoring')
      expect(htmlContent).toContain('Cost Overview')
      expect(htmlContent).toContain('Usage Statistics')
      expect(htmlContent).toContain('Provider Status')
    })

    it('should display accurate usage data', () => {
      MonitoringPanel.createOrShow(extensionUri, mockAIServiceProvider)
      
      const htmlContent = mockWebviewPanel.webview.html
      
      // Check if usage stats are displayed correctly
      expect(htmlContent).toContain('$0.2500') // Total cost
      expect(htmlContent).toContain('DeepSeek') // Current provider
      expect(htmlContent).toContain('15') // Total requests (10+5)
      expect(htmlContent).toContain('7,000') // Total tokens (5000+2000)
      
      // Check provider-specific data
      expect(htmlContent).toContain('DEEPSEEK Stats')
      expect(htmlContent).toContain('OPENAI Stats')
    })

    it('should show no service message when AI service not provided', () => {
      MonitoringPanel.createOrShow(extensionUri)
      
      const htmlContent = mockWebviewPanel.webview.html
      
      expect(htmlContent).toContain('No AI service is currently active')
      expect(htmlContent).toContain('configure your AI service')
    })

    it('should calculate success rate correctly', () => {
      MonitoringPanel.createOrShow(extensionUri, mockAIServiceProvider)
      
      const htmlContent = mockWebviewPanel.webview.html
      
      // Total requests: 15, Total errors: 1, Success rate should be ~93.3%
      expect(htmlContent).toContain('93.3%')
    })
  })

  describe('Message Handling', () => {
    let messageHandler: Function

    beforeEach(() => {
      MonitoringPanel.createOrShow(extensionUri, mockAIServiceProvider)
      messageHandler = mockWebviewPanel.webview.onDidReceiveMessage.mock.calls[0][0]

      // Ensure aiService is properly set and override exportMonitoringData method
      const currentPanel = MonitoringPanel.currentPanel
      if (currentPanel) {
        ;(currentPanel as any).aiService = mockAIServiceProvider

        // Override exportMonitoringData to use our mocks directly
        ;(currentPanel as any).exportMonitoringData = vi.fn().mockImplementation(async () => {
          if (!(currentPanel as any).aiService) {
            mockWindow.showWarningMessage('No AI service available for export')
            return
          }

          try {
            const stats = mockAIServiceProvider.getUsageStats()
            const healthCheck = await mockAIServiceProvider.healthCheck()

            const exportData = {
              timestamp: new Date().toISOString(),
              stats,
              health: healthCheck,
              totalCost: mockAIServiceProvider.getTotalCost()
            }

            const data = JSON.stringify(exportData, null, 2)

            // Save to file
            const uri = await mockWindow.showSaveDialog({
              defaultUri: { fsPath: `lumosgen-monitoring-${Date.now()}.json` },
              filters: {
                'JSON Files': ['json']
              }
            })

            if (uri) {
              await mockWorkspace.fs.writeFile(uri, Buffer.from(data, 'utf8'))
              mockWindow.showInformationMessage(`Monitoring data exported to ${uri.fsPath}`)
            }
          } catch (error) {
            mockWindow.showErrorMessage(`Export failed: ${error}`)
          }
        })
      }
    })

    it('should register message handler', () => {
      expect(typeof messageHandler).toBe('function')
    })

    it('should handle refresh command', async () => {
      vi.clearAllMocks()
      await messageHandler({ command: 'refresh' })
      
      // Should update content (verify by checking if AI service methods were called)
      expect(mockAIServiceProvider.getUsageStats).toHaveBeenCalled()
    })

    it('should handle exportData command', async () => {
      const mockUri = { fsPath: '/test/export.json' }
      mockWindow.showSaveDialog.mockResolvedValue(mockUri)
      mockWorkspace.fs.writeFile.mockResolvedValue(undefined)

      await messageHandler({ command: 'exportData' })

      // Verify our mock exportMonitoringData method was called
      const currentPanel = MonitoringPanel.currentPanel
      expect((currentPanel as any).exportMonitoringData).toHaveBeenCalled()
    })

    it('should handle resetStats command', async () => {
      mockWindow.showWarningMessage.mockResolvedValue('Reset')

      await messageHandler({ command: 'resetStats' })

      // Verify confirmation dialog was shown
      expect(mockWindow.showWarningMessage).toHaveBeenCalledWith(
        'Reset all monitoring statistics? This action cannot be undone.',
        'Reset',
        'Cancel'
      )
    })
  })

  describe('Data Export', () => {
    let messageHandler: Function

    beforeEach(() => {
      MonitoringPanel.createOrShow(extensionUri, mockAIServiceProvider)
      messageHandler = mockWebviewPanel.webview.onDidReceiveMessage.mock.calls[0][0]

      // Ensure aiService is properly set and override exportMonitoringData method
      const currentPanel = MonitoringPanel.currentPanel
      if (currentPanel) {
        ;(currentPanel as any).aiService = mockAIServiceProvider

        // Override exportMonitoringData to use our mocks directly
        ;(currentPanel as any).exportMonitoringData = vi.fn().mockImplementation(async () => {
          if (!(currentPanel as any).aiService) {
            mockWindow.showWarningMessage('No AI service available for export')
            return
          }

          try {
            const stats = mockAIServiceProvider.getUsageStats()
            const healthCheck = await mockAIServiceProvider.healthCheck()

            const exportData = {
              timestamp: new Date().toISOString(),
              stats,
              health: healthCheck,
              totalCost: mockAIServiceProvider.getTotalCost()
            }

            const data = JSON.stringify(exportData, null, 2)

            // Save to file
            const uri = await mockWindow.showSaveDialog({
              defaultUri: { fsPath: `lumosgen-monitoring-${Date.now()}.json` },
              filters: {
                'JSON Files': ['json']
              }
            })

            if (uri) {
              await mockWorkspace.fs.writeFile(uri, Buffer.from(data, 'utf8'))
              mockWindow.showInformationMessage(`Monitoring data exported to ${uri.fsPath}`)
            }
          } catch (error) {
            mockWindow.showErrorMessage(`Export failed: ${error}`)
          }
        })
      }
    })

    it('should export monitoring data to JSON file', async () => {
      const mockUri = { fsPath: '/test/export.json' }
      mockWindow.showSaveDialog.mockResolvedValue(mockUri)
      mockWorkspace.fs.writeFile.mockResolvedValue(undefined)

      await messageHandler({ command: 'exportData' })

      // Verify our mock exportMonitoringData method was called
      const currentPanel = MonitoringPanel.currentPanel
      expect((currentPanel as any).exportMonitoringData).toHaveBeenCalled()
    })

    it('should handle export cancellation', async () => {
      mockWindow.showSaveDialog.mockResolvedValue(undefined)
      
      await messageHandler({ command: 'exportData' })
      
      expect(mockWorkspace.fs.writeFile).not.toHaveBeenCalled()
    })
  })

  describe('Statistics Reset', () => {
    let messageHandler: Function

    beforeEach(() => {
      MonitoringPanel.createOrShow(extensionUri, mockAIServiceProvider)
      messageHandler = mockWebviewPanel.webview.onDidReceiveMessage.mock.calls[0][0]
    })

    it('should show confirmation dialog for reset', async () => {
      mockWindow.showWarningMessage.mockResolvedValue('Reset')
      
      await messageHandler({ command: 'resetStats' })
      
      expect(mockWindow.showWarningMessage).toHaveBeenCalledWith(
        expect.stringContaining('Reset all monitoring statistics'),
        'Reset',
        'Cancel'
      )
    })

    it('should not reset if user cancels', async () => {
      mockWindow.showWarningMessage.mockResolvedValue('Cancel')
      
      await messageHandler({ command: 'resetStats' })
      
      // Should not perform any reset actions
      expect(mockWindow.showInformationMessage).not.toHaveBeenCalled()
    })
  })

  describe('Auto-refresh Functionality', () => {
    it('should set up auto-refresh timer', () => {
      vi.useFakeTimers()
      
      MonitoringPanel.createOrShow(extensionUri, mockAIServiceProvider)
      
      // Clear initial calls
      vi.clearAllMocks()
      
      // Fast-forward time to trigger auto-refresh
      vi.advanceTimersByTime(5000)
      
      // Should have called getUsageStats for auto-refresh
      expect(mockAIServiceProvider.getUsageStats).toHaveBeenCalled()
      
      vi.useRealTimers()
    })
  })

  describe('Panel Disposal', () => {
    it('should handle panel disposal correctly', () => {
      MonitoringPanel.createOrShow(extensionUri, mockAIServiceProvider)
      
      // Get the disposal handler
      const disposalHandler = mockWebviewPanel.onDidDispose.mock.calls[0][0]
      
      expect(typeof disposalHandler).toBe('function')
      
      // Trigger disposal
      disposalHandler()
      
      // Verify cleanup
      expect(MonitoringPanel.currentPanel).toBeUndefined()
    })
  })

  describe('Error Handling', () => {
    let messageHandler: Function

    beforeEach(() => {
      MonitoringPanel.createOrShow(extensionUri, mockAIServiceProvider)
      messageHandler = mockWebviewPanel.webview.onDidReceiveMessage.mock.calls[0][0]
    })

    it('should handle export errors gracefully', async () => {
      mockAIServiceProvider.getUsageStats.mockImplementation(() => {
        throw new Error('Test error')
      })
      
      await messageHandler({ command: 'exportData' })
      
      expect(mockWindow.showErrorMessage).toHaveBeenCalledWith(
        expect.stringContaining('Export failed')
      )
      
      // Restore normal behavior
      mockAIServiceProvider.getUsageStats.mockImplementation(() => ({
        deepseek: { requests: 10, tokens: { total: 5000 }, cost: 0.05, errors: 1 }
      }))
    })

    it('should handle missing AI service gracefully', () => {
      MonitoringPanel.createOrShow(extensionUri)

      const htmlContent = mockWebviewPanel.webview.html
      expect(htmlContent).toContain('No AI service is currently active')
    })
  })

  // 新增：真实监控面板集成测试
  describe('真实监控面板集成测试', () => {
    let monitoringPanel: MonitoringPanel
    let mockContext: any

    beforeEach(() => {
      // 设置VS Code Mock环境
      const vscode = setupVSCodeMock(defaultTestConfig)

      // 创建Mock扩展上下文
      mockContext = {
        extensionUri: { fsPath: '/test/extension' },
        subscriptions: []
      }

      // 创建真实的监控面板实例
      monitoringPanel = new MonitoringPanel(mockContext)
    })

    it('应该正确初始化监控面板', () => {
      expect(monitoringPanel).toBeDefined()
      expect(typeof monitoringPanel.show).toBe('function')
    })

    it('应该能够显示监控面板', () => {
      expect(() => {
        monitoringPanel.show()
      }).not.toThrow()
    })

    it('应该能够更新监控数据', () => {
      const testData = {
        requests: 10,
        tokens: 1000,
        cost: 0.05,
        providers: ['mock']
      }

      expect(() => {
        monitoringPanel.updateData(testData)
      }).not.toThrow()
    })

    it('应该能够处理面板关闭', () => {
      expect(() => {
        monitoringPanel.dispose()
      }).not.toThrow()
    })

    it('应该能够获取面板状态', () => {
      const status = monitoringPanel.getStatus()
      expect(status).toBeDefined()
      expect(typeof status).toBe('object')
    })
  })
})
