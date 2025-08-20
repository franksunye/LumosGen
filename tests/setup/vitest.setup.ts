/**
 * Vitest 全局设置文件
 * 配置测试环境、Mock和全局变量
 */

import { vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { createVSCodeMock } from '../mocks/vscode.mock'

// 设置测试环境变量
process.env.NODE_ENV = 'test'
process.env.VSCODE_TESTING = 'true'

// 创建VS Code Mock
const vscode = createVSCodeMock()

// Mock VS Code模块
vi.mock('vscode', () => vscode)

// 设置全局变量
global.vscode = vscode

// 全局测试钩子
beforeAll(() => {
  console.log('🧪 Starting Vitest test suite for LumosGen')
})

afterAll(() => {
  console.log('✅ Vitest test suite completed')
})

beforeEach(() => {
  // 每个测试前重置所有Mock
  vi.clearAllMocks()
  
  // 重置VS Code Mock状态
  if (vscode.reset) {
    vscode.reset()
  }
})

afterEach(() => {
  // 清理测试后的状态
  vi.restoreAllMocks()
})

// 扩展Vitest的expect
expect.extend({
  toBeValidMarkdown(received: string) {
    const isValid = received.includes('#') || received.includes('*') || received.includes('-')
    return {
      message: () => `Expected ${received} to be valid markdown`,
      pass: isValid
    }
  },
  
  toHaveValidTokenCount(received: any) {
    const hasTokens = received && typeof received.totalTokens === 'number' && received.totalTokens > 0
    return {
      message: () => `Expected object to have valid token count`,
      pass: hasTokens
    }
  }
})

// 声明自定义匹配器类型
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeValidMarkdown(): T
    toHaveValidTokenCount(): T
  }
}
