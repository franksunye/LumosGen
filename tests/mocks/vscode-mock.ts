/**
 * 完整的VS Code API Mock
 * 为测试提供完整的VS Code API模拟
 */

import { vi } from 'vitest'

// 配置接口
export interface MockConfiguration {
  get: ReturnType<typeof vi.fn>
  has: ReturnType<typeof vi.fn>
  inspect: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
}

// 工作区接口
export interface MockWorkspace {
  getConfiguration: ReturnType<typeof vi.fn>
  workspaceFolders: Array<{ uri: { fsPath: string } }>
  onDidChangeConfiguration: ReturnType<typeof vi.fn>
  onDidChangeWorkspaceFolders: ReturnType<typeof vi.fn>
  findFiles: ReturnType<typeof vi.fn>
  openTextDocument: ReturnType<typeof vi.fn>
  saveAll: ReturnType<typeof vi.fn>
}

// 窗口接口
export interface MockWindow {
  showInformationMessage: ReturnType<typeof vi.fn>
  showWarningMessage: ReturnType<typeof vi.fn>
  showErrorMessage: ReturnType<typeof vi.fn>
  showQuickPick: ReturnType<typeof vi.fn>
  showInputBox: ReturnType<typeof vi.fn>
  createStatusBarItem: ReturnType<typeof vi.fn>
  createOutputChannel: ReturnType<typeof vi.fn>
  createWebviewPanel: ReturnType<typeof vi.fn>
  withProgress: ReturnType<typeof vi.fn>
}

// 命令接口
export interface MockCommands {
  registerCommand: ReturnType<typeof vi.fn>
  executeCommand: ReturnType<typeof vi.fn>
  getCommands: ReturnType<typeof vi.fn>
}

// 扩展上下文接口
export interface MockExtensionContext {
  subscriptions: any[]
  workspaceState: {
    get: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
  }
  globalState: {
    get: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
  }
  extensionPath: string
  storagePath: string
  globalStoragePath: string
  logPath: string
}

// 创建Mock配置
export function createMockConfiguration(initialConfig: Record<string, any> = {}): MockConfiguration {
  return {
    get: vi.fn((key: string, defaultValue?: any) => {
      return initialConfig[key] !== undefined ? initialConfig[key] : defaultValue
    }),
    has: vi.fn((key: string) => initialConfig.hasOwnProperty(key)),
    inspect: vi.fn(),
    update: vi.fn()
  }
}

// 创建Mock工作区
export function createMockWorkspace(configuration?: MockConfiguration): MockWorkspace {
  const mockConfig = configuration || createMockConfiguration()
  
  return {
    getConfiguration: vi.fn(() => mockConfig),
    workspaceFolders: [{ uri: { fsPath: '/test/workspace' } }],
    onDidChangeConfiguration: vi.fn(),
    onDidChangeWorkspaceFolders: vi.fn(),
    findFiles: vi.fn(() => Promise.resolve([])),
    openTextDocument: vi.fn(),
    saveAll: vi.fn(() => Promise.resolve(true))
  }
}

// 创建Mock窗口
export function createMockWindow(): MockWindow {
  return {
    showInformationMessage: vi.fn(() => Promise.resolve('OK')),
    showWarningMessage: vi.fn(() => Promise.resolve('OK')),
    showErrorMessage: vi.fn(() => Promise.resolve('OK')),
    showQuickPick: vi.fn(() => Promise.resolve(undefined)),
    showInputBox: vi.fn(() => Promise.resolve(undefined)),
    createStatusBarItem: vi.fn(() => ({
      text: '',
      show: vi.fn(),
      hide: vi.fn(),
      dispose: vi.fn()
    })),
    createOutputChannel: vi.fn(() => ({
      appendLine: vi.fn(),
      show: vi.fn(),
      hide: vi.fn(),
      dispose: vi.fn()
    })),
    createWebviewPanel: vi.fn(),
    withProgress: vi.fn((options, task) => task({ report: vi.fn() }))
  }
}

// 创建Mock命令
export function createMockCommands(): MockCommands {
  return {
    registerCommand: vi.fn(() => ({ dispose: vi.fn() })),
    executeCommand: vi.fn(() => Promise.resolve()),
    getCommands: vi.fn(() => Promise.resolve([]))
  }
}

// 创建Mock扩展上下文
export function createMockExtensionContext(): MockExtensionContext {
  return {
    subscriptions: [],
    workspaceState: {
      get: vi.fn(),
      update: vi.fn(() => Promise.resolve())
    },
    globalState: {
      get: vi.fn(),
      update: vi.fn(() => Promise.resolve())
    },
    extensionPath: '/test/extension',
    storagePath: '/test/storage',
    globalStoragePath: '/test/global-storage',
    logPath: '/test/logs'
  }
}

// 创建完整的VS Code Mock
export function createVSCodeMock(config: Record<string, any> = {}) {
  const mockConfiguration = createMockConfiguration(config)
  const mockWorkspace = createMockWorkspace(mockConfiguration)
  const mockWindow = createMockWindow()
  const mockCommands = createMockCommands()
  
  return {
    workspace: mockWorkspace,
    window: mockWindow,
    commands: mockCommands,
    Uri: {
      file: vi.fn((path: string) => ({ fsPath: path, scheme: 'file' })),
      parse: vi.fn((uri: string) => ({ fsPath: uri, scheme: 'file' }))
    },
    Range: vi.fn(),
    Position: vi.fn(),
    Selection: vi.fn(),
    TextEdit: vi.fn(),
    WorkspaceEdit: vi.fn(),
    StatusBarAlignment: {
      Left: 1,
      Right: 2
    },
    ViewColumn: {
      One: 1,
      Two: 2,
      Three: 3
    },
    ConfigurationTarget: {
      Global: 1,
      Workspace: 2,
      WorkspaceFolder: 3
    }
  }
}

// 设置全局VS Code Mock
export function setupVSCodeMock(config: Record<string, any> = {}) {
  const vscode = createVSCodeMock(config)
  vi.stubGlobal('vscode', vscode)
  return vscode
}

// 默认配置
export const defaultTestConfig = {
  'language': 'en',
  'marketingSettings': {
    tone: 'professional',
    includeCodeExamples: true,
    targetMarkets: ['global'],
    seoOptimization: true
  },
  'aiService': {
    deepseekApiKey: 'test-deepseek-key',
    openaiApiKey: 'test-openai-key',
    degradationStrategy: ['deepseek', 'openai', 'mock'],
    monitoringEnabled: true,
    trackCosts: true,
    trackUsage: true
  }
}
