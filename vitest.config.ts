import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    // 测试环境配置
    environment: 'node', // VS Code扩展运行在Node环境
    
    // 全局设置
    globals: true, // 启用全局API (describe, it, expect等)
    
    // 文件匹配模式
    include: [
      'tests/**/*.{test,spec}.{js,ts}',
      'src/**/*.{test,spec}.{js,ts}'
    ],
    exclude: [
      'node_modules',
      'out',
      'tests/fixtures',
      'tests/outputs',
      'tests/reports'
    ],
    
    // 超时设置
    testTimeout: 30000,
    hookTimeout: 30000,
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      reportsDirectory: './tests/coverage',
      include: ['src/**/*.{js,ts}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{js,ts}',
        'src/**/*.spec.{js,ts}'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    
    // 设置文件
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    
    // 并发设置
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true // VS Code扩展测试通常需要单线程
      }
    },
    
    // 报告器
    reporter: ['verbose', 'html'],
    outputFile: {
      html: './tests/reports/vitest-report.html'
    }
  },
  
  // 路径解析
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@tests': path.resolve(__dirname, 'tests')
    }
  }
})
