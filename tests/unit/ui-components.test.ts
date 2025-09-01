/**
 * UI Components Unit Tests - 扩展UI测试覆盖率
 * 
 * 专门测试VS Code扩展的UI组件，包括命令、面板、侧边栏等
 */

import { describe, it, expect, beforeEach, vi, beforeAll, afterEach } from 'vitest'

// 设置VS Code Mock
vi.mock('vscode', async () => {
  const { setupVSCodeMock, defaultTestConfig } = await import('../mocks/vscode-mock')
  return setupVSCodeMock(defaultTestConfig)
})

// 导入VS Code Mock和真实源码
import { setupVSCodeMock, defaultTestConfig } from '../mocks/vscode-mock'
import { SidebarProvider } from '../../src/ui/SidebarProvider'
import { MonitoringPanel } from '../../src/ui/MonitoringPanel'

describe('UI Components Extended Tests', () => {
  let vscode: any
  let mockExtensionUri: any
  let mockOutputChannel: any

  beforeAll(() => {
    console.log('🧪 Starting UI Components Extended Tests')
  })

  beforeEach(() => {
    // 设置VS Code Mock环境
    vscode = setupVSCodeMock(defaultTestConfig)

    // 创建Mock扩展URI和输出通道
    mockExtensionUri = { fsPath: '/test/extension' }
    mockOutputChannel = {
      appendLine: vi.fn(),
      show: vi.fn(),
      clear: vi.fn()
    }
  })

  afterEach(() => {
    // 清理
    vi.clearAllMocks()
    MonitoringPanel.currentPanel = undefined
  })

  describe('SidebarProvider 深度测试', () => {
    let sidebarProvider: SidebarProvider

    beforeEach(() => {
      sidebarProvider = new SidebarProvider(mockExtensionUri, mockOutputChannel)
    })

    it('应该正确初始化SidebarProvider', () => {
      expect(sidebarProvider).toBeDefined()
      expect(SidebarProvider.viewType).toBe('lumosgen.sidebar')
    })

    it('应该能够处理webview视图解析', () => {
      const mockWebviewView = {
        webview: {
          html: '',
          options: {},
          onDidReceiveMessage: vi.fn(),
          postMessage: vi.fn()
        },
        viewType: 'lumosgen.sidebar'
      }

      expect(() => {
        sidebarProvider.resolveWebviewView(mockWebviewView as any, {} as any, {} as any)
      }).not.toThrow()

      // 验证HTML内容被设置
      expect(mockWebviewView.webview.html).toBeTruthy()
      expect(mockWebviewView.webview.html).toContain('<!DOCTYPE html>')
    })

    it('应该能够处理消息事件', () => {
      const mockWebviewView = {
        webview: {
          html: '',
          options: {},
          onDidReceiveMessage: vi.fn(),
          postMessage: vi.fn()
        },
        viewType: 'lumosgen.sidebar'
      }

      sidebarProvider.resolveWebviewView(mockWebviewView as any, {} as any, {} as any)

      // 验证消息处理器被注册
      expect(mockWebviewView.webview.onDidReceiveMessage).toHaveBeenCalled()
    })

    it('应该能够生成完整的HTML内容', () => {
      const mockWebviewView = {
        webview: {
          html: '',
          options: {},
          onDidReceiveMessage: vi.fn(),
          postMessage: vi.fn()
        },
        viewType: 'lumosgen.sidebar'
      }

      sidebarProvider.resolveWebviewView(mockWebviewView as any, {} as any, {} as any)
      
      const htmlContent = mockWebviewView.webview.html
      
      // 验证HTML结构
      expect(htmlContent).toContain('<html')
      expect(htmlContent).toContain('<head>')
      expect(htmlContent).toContain('<body>')
      expect(htmlContent).toContain('</html>')
      
      // 验证关键UI元素
      expect(htmlContent).toMatch(/Generate|Content/i)
      expect(htmlContent).toMatch(/Deploy|GitHub/i)
      expect(htmlContent).toMatch(/Theme|Style/i)
    })

    it('应该能够处理主题切换', () => {
      const mockWebviewView = {
        webview: {
          html: '',
          options: {},
          onDidReceiveMessage: vi.fn(),
          postMessage: vi.fn()
        },
        viewType: 'lumosgen.sidebar'
      }

      sidebarProvider.resolveWebviewView(mockWebviewView as any, {} as any, {} as any)
      
      // 测试主题相关功能
      expect(mockWebviewView.webview.html).toMatch(/theme/i)
      expect(mockWebviewView.webview.html).toMatch(/modern|technical|minimal/i)
    })

    it('应该能够处理Agent状态更新', () => {
      const mockWebviewView = {
        webview: {
          html: '',
          options: {},
          onDidReceiveMessage: vi.fn(),
          postMessage: vi.fn()
        },
        viewType: 'lumosgen.sidebar'
      }

      sidebarProvider.resolveWebviewView(mockWebviewView as any, {} as any, {} as any)
      
      // 测试Agent相关功能
      expect(mockWebviewView.webview.html).toMatch(/agent|workflow/i)
    })
  })

  describe('MonitoringPanel 深度测试', () => {
    it('应该能够创建监控面板', () => {
      expect(() => {
        MonitoringPanel.createOrShow(mockExtensionUri)
      }).not.toThrow()
      
      expect(MonitoringPanel.currentPanel).toBeDefined()
    })

    it('应该能够重用现有面板', () => {
      // 创建第一个面板
      MonitoringPanel.createOrShow(mockExtensionUri)
      const firstPanel = MonitoringPanel.currentPanel
      
      // 再次调用应该重用现有面板
      MonitoringPanel.createOrShow(mockExtensionUri)
      const secondPanel = MonitoringPanel.currentPanel
      
      expect(firstPanel).toBe(secondPanel)
    })

    it('应该能够处理面板销毁', () => {
      MonitoringPanel.createOrShow(mockExtensionUri)
      expect(MonitoringPanel.currentPanel).toBeDefined()
      
      // 模拟面板销毁
      const panel = MonitoringPanel.currentPanel
      if (panel && (panel as any)._panel) {
        const mockPanel = (panel as any)._panel
        if (mockPanel.onDidDispose && typeof mockPanel.onDidDispose === 'function') {
          // 触发销毁事件
          const disposeCallback = mockPanel.onDidDispose.mock.calls[0]?.[0]
          if (disposeCallback) {
            disposeCallback()
          }
        }
      }
    })

    it('应该能够更新内容', () => {
      MonitoringPanel.createOrShow(mockExtensionUri)
      const panel = MonitoringPanel.currentPanel
      
      expect(panel).toBeDefined()
      expect(typeof (panel as any).updateContent).toBe('function')
    })

    it('应该能够处理AI服务数据', () => {
      const mockAIService = {
        getUsageStats: vi.fn().mockReturnValue({
          openai: {
            requests: 10,
            tokens: { total: 1000, input: 500, output: 500 },
            cost: 0.05,
            errors: 0
          }
        }),
        getTotalCost: vi.fn().mockReturnValue(0.05),
        getCurrentProvider: vi.fn().mockReturnValue('openai'),
        getAvailableProviders: vi.fn().mockReturnValue(['openai', 'deepseek'])
      }

      MonitoringPanel.createOrShow(mockExtensionUri, mockAIService as any)
      const panel = MonitoringPanel.currentPanel

      expect(panel).toBeDefined()
      expect((panel as any).aiService).toBe(mockAIService)
    })
  })

  describe('UI组件集成测试', () => {
    it('应该能够同时创建多个UI组件', () => {
      const sidebarProvider = new SidebarProvider(mockExtensionUri, mockOutputChannel)
      MonitoringPanel.createOrShow(mockExtensionUri)
      
      expect(sidebarProvider).toBeDefined()
      expect(MonitoringPanel.currentPanel).toBeDefined()
    })

    it('应该能够处理UI组件之间的交互', () => {
      const sidebarProvider = new SidebarProvider(mockExtensionUri, mockOutputChannel)
      MonitoringPanel.createOrShow(mockExtensionUri)
      
      // 测试组件间的基本交互
      expect(sidebarProvider).toBeDefined()
      expect(MonitoringPanel.currentPanel).toBeDefined()
      
      // 验证两个组件都能正常工作
      expect(typeof sidebarProvider.resolveWebviewView).toBe('function')
      expect(typeof (MonitoringPanel.currentPanel as any).updateContent).toBe('function')
    })

    it('应该能够处理错误情况', () => {
      // 测试无效参数
      expect(() => {
        new SidebarProvider(null as any, mockOutputChannel)
      }).not.toThrow()

      // MonitoringPanel需要有效的extensionUri，所以我们测试它会抛出错误
      expect(() => {
        MonitoringPanel.createOrShow(null as any)
      }).toThrow()
    })

    it('应该能够验证UI组件的基本属性', () => {
      const sidebarProvider = new SidebarProvider(mockExtensionUri, mockOutputChannel)
      
      // 验证SidebarProvider的基本属性
      expect(sidebarProvider).toHaveProperty('resolveWebviewView')
      expect(typeof sidebarProvider.resolveWebviewView).toBe('function')
      
      // 验证MonitoringPanel的基本属性
      expect(MonitoringPanel).toHaveProperty('createOrShow')
      expect(typeof MonitoringPanel.createOrShow).toBe('function')
    })
  })

  describe('UI性能和可靠性测试', () => {
    it('应该能够快速创建UI组件', () => {
      const startTime = Date.now()
      
      const sidebarProvider = new SidebarProvider(mockExtensionUri, mockOutputChannel)
      MonitoringPanel.createOrShow(mockExtensionUri)
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // 应该在合理时间内完成（100ms）
      expect(duration).toBeLessThan(100)
      expect(sidebarProvider).toBeDefined()
      expect(MonitoringPanel.currentPanel).toBeDefined()
    })

    it('应该能够处理大量UI操作', () => {
      const sidebarProvider = new SidebarProvider(mockExtensionUri, mockOutputChannel)
      
      // 模拟多次webview解析
      for (let i = 0; i < 10; i++) {
        const mockWebviewView = {
          webview: {
            html: '',
            options: {},
            onDidReceiveMessage: vi.fn(),
            postMessage: vi.fn()
          },
          viewType: 'lumosgen.sidebar'
        }
        
        expect(() => {
          sidebarProvider.resolveWebviewView(mockWebviewView as any, {} as any, {} as any)
        }).not.toThrow()
      }
    })

    it('应该能够处理并发UI创建', () => {
      const promises = []
      
      for (let i = 0; i < 5; i++) {
        promises.push(Promise.resolve().then(() => {
          const sidebarProvider = new SidebarProvider(mockExtensionUri, mockOutputChannel)
          return sidebarProvider
        }))
      }
      
      return Promise.all(promises).then(providers => {
        expect(providers).toHaveLength(5)
        providers.forEach(provider => {
          expect(provider).toBeDefined()
        })
      })
    })
  })
})
