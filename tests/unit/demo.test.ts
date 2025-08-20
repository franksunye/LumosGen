/**
 * 演示测试 - 验证Vitest测试框架是否正常工作
 * 迁移自自定义测试框架到Vitest
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// 工具函数
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const timeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout exceeded')), ms)
        )
    ])
}

const retry = async <T>(
    fn: () => Promise<T>,
    maxAttempts: number,
    delayMs: number = 100
): Promise<T> => {
    let lastError: Error

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn()
        } catch (error) {
            lastError = error as Error
            if (attempt < maxAttempts) {
                await sleep(delayMs)
            }
        }
    }

    throw lastError!
}

// 简单的演示类
class Calculator {
    add(a: number, b: number): number {
        return a + b;
    }

    subtract(a: number, b: number): number {
        return a - b;
    }

    multiply(a: number, b: number): number {
        return a * b;
    }

    divide(a: number, b: number): number {
        if (b === 0) {
            throw new Error('Division by zero');
        }
        return a / b;
    }

    async asyncAdd(a: number, b: number): Promise<number> {
        await sleep(10);
        return a + b;
    }
}

// 测试套件
describe('Demo Tests - Calculator & Utilities', () => {
    let calculator: Calculator

    beforeEach(() => {
        calculator = new Calculator()
        console.log('    📝 Calculator instance created')
    })

    afterEach(() => {
        console.log('    🧹 Calculator instance cleaned up')
    })

    describe('基础计算功能', () => {
        it('应该正确执行加法运算', () => {
            const result = calculator.add(2, 3)
            expect(result).toBe(5)
        })

        it('应该正确执行减法运算', () => {
            const result = calculator.subtract(5, 3)
            expect(result).toBe(2)
        })

        it('应该正确执行乘法运算', () => {
            const result = calculator.multiply(4, 3)
            expect(result).toBe(12)
        })

        it('应该正确执行除法运算', () => {
            const result = calculator.divide(10, 2)
            expect(result).toBe(5)
        })

        it('应该在除零时抛出错误', () => {
            expect(() => calculator.divide(10, 0)).toThrow('Division by zero')
        })

        it('应该正确执行异步运算', async () => {
            const startTime = Date.now()
            const result = await calculator.asyncAdd(3, 4)
            const duration = Date.now() - startTime

            expect(result).toBe(7)
            expect(duration).toBeGreaterThanOrEqual(5)
        })
    })

    describe('断言功能测试', () => {
        it('应该支持各种基础断言', () => {
            // 布尔断言
            expect(true).toBe(true)
            expect(false).toBe(false)

            // 相等断言
            expect(1).toBe(1)
            expect(1).not.toBe(2)

            // 范围断言
            expect(5).toBeGreaterThanOrEqual(1)
            expect(5).toBeLessThanOrEqual(10)

            // 包含断言
            expect([1, 2, 3]).toContain(2)
            expect('hello world').toContain('world')

            // 正则匹配
            expect('test123').toMatch(/test\d+/)
        })

        it('应该支持深度对象比较', () => {
            const obj1 = { a: 1, b: { c: 2 } }
            const obj2 = { a: 1, b: { c: 2 } }
            const obj3 = { a: 1, b: { c: 3 } }

            expect(obj1).toEqual(obj2)
            expect(obj1).not.toEqual(obj3)
        })
    })

    describe('工具函数测试', () => {
        it('应该生成唯一的测试ID', () => {
            const generateTestId = () => `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

            const testId = generateTestId()
            expect(testId).toMatch(/^test_/)
            expect(testId.length).toBeGreaterThan(10)
        })

        it('应该正确实现sleep函数', async () => {
            const startTime = Date.now()
            await sleep(50)
            const duration = Date.now() - startTime

            expect(duration).toBeGreaterThanOrEqual(45)
        })

        it('应该正确处理快速Promise的timeout', async () => {
            const fastPromise = Promise.resolve('fast')
            const result = await timeout(fastPromise, 1000)

            expect(result).toBe('fast')
        })

        it('应该在超时时抛出错误', async () => {
            const slowPromise = new Promise(resolve =>
                setTimeout(() => resolve('slow'), 1000)
            )

            await expect(timeout(slowPromise, 100)).rejects.toThrow('Timeout')
        })
    })

    describe('重试机制测试', () => {
        it('应该在重试后成功', async () => {
            let attempts = 0
            const flakyFunction = async () => {
                attempts++
                if (attempts < 3) {
                    throw new Error('Temporary failure')
                }
                return 'success'
            }

            const result = await retry(flakyFunction, 5, 10)

            expect(result).toBe('success')
            expect(attempts).toBe(3)
        })
    })

    describe('Mock对象测试', () => {
        it('应该创建有效的VS Code上下文Mock', () => {
            const createMockVSCodeContext = () => ({
                subscriptions: [],
                workspaceState: new Map(),
                globalState: new Map()
            })

            const mockContext = createMockVSCodeContext()

            expect(Array.isArray(mockContext.subscriptions)).toBe(true)
            expect(mockContext.workspaceState).toBeInstanceOf(Map)
            expect(mockContext.globalState).toBeInstanceOf(Map)
        })

        it('应该创建有效的工作区文件夹Mock', () => {
            const createMockWorkspaceFolder = (name: string) => ({
                name,
                uri: { fsPath: `/mock/path/${name}`, path: `/mock/path/${name}` },
                index: 0
            })

            const mockWorkspace = createMockWorkspaceFolder('test-workspace')

            expect(mockWorkspace.name).toBe('test-workspace')
            expect(mockWorkspace.uri.fsPath).toContain('test-workspace')
        })
    })

    describe('对象比较测试', () => {
        it('应该正确比较复杂对象', () => {
            const obj1 = { a: 1, b: { c: 2, d: [1, 2, 3] } }
            const obj2 = { a: 1, b: { c: 2, d: [1, 2, 3] } }
            const obj3 = { a: 1, b: { c: 3, d: [1, 2, 3] } }

            // 相同对象应该相等
            expect(obj1).toEqual(obj2)

            // 不同对象应该不相等
            expect(obj1).not.toEqual(obj3)
        })
    })

    describe('Vitest特有功能测试', () => {
        it('应该支持快照测试', () => {
            const data = {
                name: 'LumosGen',
                version: '1.0.0',
                features: ['AI Content Generation', 'Website Building']
            }

            expect(data).toMatchSnapshot()
        })

        it('应该支持Mock函数', () => {
            const mockFn = vi.fn()
            mockFn.mockReturnValue('mocked result')

            const result = mockFn('test arg')

            expect(result).toBe('mocked result')
            expect(mockFn).toHaveBeenCalledWith('test arg')
            expect(mockFn).toHaveBeenCalledTimes(1)
        })

        it('应该支持定时器Mock', () => {
            vi.useFakeTimers()

            const callback = vi.fn()
            setTimeout(callback, 1000)

            expect(callback).not.toHaveBeenCalled()

            vi.advanceTimersByTime(1000)
            expect(callback).toHaveBeenCalled()

            vi.useRealTimers()
        })
    })
})
