/**
 * 真实覆盖率测试 - 直接调用src中的代码
 */

import { describe, it, expect, vi } from 'vitest'

// 直接导入src中的代码
import { getLanguage, getMarketingSettings } from '../../src/config/SimpleConfig'

// Mock VS Code API
const mockVSCode = {
  workspace: {
    getConfiguration: vi.fn(() => ({
      get: vi.fn((key: string, defaultValue?: any) => {
        const config: Record<string, any> = {
          'language': 'en',
          'marketingSettings': {
            tone: 'professional',
            includeCodeExamples: true,
            targetMarkets: ['global'],
            seoOptimization: true
          }
        }
        return config[key] !== undefined ? config[key] : defaultValue
      }),
      has: vi.fn(),
      inspect: vi.fn(),
      update: vi.fn()
    })),
    workspaceFolders: [{ uri: { fsPath: '/test/workspace' } }]
  }
}

// 设置全局Mock
vi.stubGlobal('vscode', mockVSCode)

describe('真实覆盖率测试', () => {
  describe('配置函数测试', () => {
    it('应该返回语言配置', () => {
      const language = getLanguage()
      expect(language).toBe('en')
    })

    it('应该返回营销设置', () => {
      const settings = getMarketingSettings()
      expect(settings).toBeDefined()
      expect(settings.tone).toBe('professional')
      expect(settings.includeCodeExamples).toBe(true)
    })
  })
})
