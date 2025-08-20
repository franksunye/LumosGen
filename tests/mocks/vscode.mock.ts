/**
 * Vitest版本的VS Code API Mock
 * 使用Vitest的Mock功能重新实现
 */

import { vi } from 'vitest'

// Mock类型定义
interface MockOutputChannel {
  name: string
  messages: string[]
  appendLine: (message: string) => void
  append: (message: string) => void
  show: () => void
  hide: () => void
  clear: () => void
  dispose: () => void
}

interface MockStatusBarItem {
  text: string
  tooltip?: string
  show: () => void
  hide: () => void
  dispose: () => void
}

// 创建VS Code Mock
export function createVSCodeMock() {
  const outputChannels = new Map<string, MockOutputChannel>()
  const statusBarItems: MockStatusBarItem[] = []
  
  const mockWorkspace = {
    workspaceFolders: [
      {
        uri: { fsPath: '/test/workspace', path: '/test/workspace' },
        name: 'test-workspace',
        index: 0
      }
    ],
    
    getConfiguration: vi.fn((section?: string) => ({
      get: vi.fn((key: string, defaultValue?: any) => {
        const config: Record<string, any> = {
          'lumosGen.enabled': true,
          'lumosGen.language': 'en',
          'lumosGen.aiService.deepseekApiKey': 'test-deepseek-key',
          'lumosGen.aiService.openaiApiKey': 'test-openai-key',
          'lumosGen.aiService.degradationStrategy': ['deepseek', 'openai', 'mock'],
          'lumosGen.aiService.monitoringEnabled': true,
          'lumosGen.theme.current': 'default'
        }
        
        const fullKey = section ? `${section}.${key}` : key
        return config[fullKey] ?? defaultValue
      }),
      
      update: vi.fn((key: string, value: any, target?: any) => {
        console.log(`Config updated: ${key} = ${value}`)
        return Promise.resolve()
      }),
      
      has: vi.fn(() => true),
      inspect: vi.fn((key: string) => ({ key, defaultValue: undefined }))
    })),
    
    findFiles: vi.fn(() => Promise.resolve([])),
    openTextDocument: vi.fn(() => Promise.resolve({})),
    saveAll: vi.fn(() => Promise.resolve(true))
  }
  
  const mockWindow = {
    createOutputChannel: vi.fn((name: string): MockOutputChannel => {
      const channel: MockOutputChannel = {
        name,
        messages: [],
        appendLine: vi.fn((message: string) => {
          channel.messages.push(message)
          console.log(`[${name}] ${message}`)
        }),
        append: vi.fn((message: string) => {
          channel.messages.push(message)
          console.log(`[${name}] ${message}`)
        }),
        show: vi.fn(() => console.log(`Showing channel: ${name}`)),
        hide: vi.fn(() => console.log(`Hiding channel: ${name}`)),
        clear: vi.fn(() => { channel.messages = [] }),
        dispose: vi.fn(() => { channel.messages = [] })
      }
      
      outputChannels.set(name, channel)
      return channel
    }),
    
    createStatusBarItem: vi.fn((alignment?: any, priority?: number): MockStatusBarItem => {
      const item: MockStatusBarItem = {
        text: '',
        tooltip: '',
        show: vi.fn(),
        hide: vi.fn(),
        dispose: vi.fn()
      }
      
      statusBarItems.push(item)
      return item
    }),
    
    showInformationMessage: vi.fn((message: string, ...items: string[]) => {
      console.log(`Info: ${message}`)
      return Promise.resolve(items[0])
    }),
    
    showWarningMessage: vi.fn((message: string, ...items: string[]) => {
      console.log(`Warning: ${message}`)
      return Promise.resolve(items[0])
    }),
    
    showErrorMessage: vi.fn((message: string, ...items: string[]) => {
      console.log(`Error: ${message}`)
      return Promise.resolve(items[0])
    }),
    
    showQuickPick: vi.fn((items: any[]) => Promise.resolve(items[0])),
    showInputBox: vi.fn(() => Promise.resolve('test-input')),
    
    withProgress: vi.fn((options: any, task: Function) => {
      return task({ report: vi.fn() }, { isCancellationRequested: false })
    })
  }
  
  const mockCommands = {
    registerCommand: vi.fn((command: string, callback: Function) => {
      console.log(`Registered command: ${command}`)
      return { dispose: vi.fn() }
    }),
    
    executeCommand: vi.fn((command: string, ...args: any[]) => {
      console.log(`Executing command: ${command}`, args)
      return Promise.resolve()
    })
  }
  
  const vscode = {
    workspace: mockWorkspace,
    window: mockWindow,
    commands: mockCommands,
    
    // 常用枚举
    ViewColumn: {
      One: 1,
      Two: 2,
      Three: 3,
      Active: -1,
      Beside: -2
    },
    
    StatusBarAlignment: {
      Left: 1,
      Right: 2
    },
    
    // URI类
    Uri: {
      file: vi.fn((path: string) => ({ fsPath: path, path })),
      parse: vi.fn((uri: string) => ({ fsPath: uri, path: uri }))
    },
    
    // 位置和范围类
    Position: vi.fn((line: number, character: number) => ({ line, character })),
    Range: vi.fn((start: any, end: any) => ({ start, end })),
    
    // 事件发射器
    EventEmitter: vi.fn(() => ({
      event: vi.fn(),
      fire: vi.fn(),
      dispose: vi.fn()
    })),
    
    // 重置函数（用于测试间清理）
    reset: () => {
      outputChannels.clear()
      statusBarItems.length = 0
      vi.clearAllMocks()
    }
  }
  
  return vscode
}
