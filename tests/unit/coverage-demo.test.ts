/**
 * 覆盖率演示测试 - 证明覆盖率工具正常工作
 */

import { describe, it, expect } from 'vitest'

// 创建一个简单的函数来测试覆盖率
function add(a: number, b: number): number {
  return a + b
}

function subtract(a: number, b: number): number {
  return a - b
}

function multiply(a: number, b: number): number {
  return a * b
}

function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero')
  }
  return a / b
}

function isEven(num: number): boolean {
  return num % 2 === 0
}

function processArray(arr: number[]): number[] {
  return arr
    .filter(n => n > 0)
    .map(n => n * 2)
    .sort((a, b) => a - b)
}

describe('覆盖率演示测试', () => {
  describe('基础数学运算', () => {
    it('应该正确执行加法', () => {
      expect(add(2, 3)).toBe(5)
      expect(add(-1, 1)).toBe(0)
    })

    it('应该正确执行减法', () => {
      expect(subtract(5, 3)).toBe(2)
      expect(subtract(0, 5)).toBe(-5)
    })

    it('应该正确执行乘法', () => {
      expect(multiply(3, 4)).toBe(12)
      expect(multiply(-2, 3)).toBe(-6)
    })

    it('应该正确执行除法', () => {
      expect(divide(10, 2)).toBe(5)
      expect(divide(7, 2)).toBe(3.5)
    })

    it('应该在除零时抛出错误', () => {
      expect(() => divide(5, 0)).toThrow('Division by zero')
    })
  })

  describe('条件逻辑测试', () => {
    it('应该正确判断偶数', () => {
      expect(isEven(2)).toBe(true)
      expect(isEven(4)).toBe(true)
    })

    it('应该正确判断奇数', () => {
      expect(isEven(1)).toBe(false)
      expect(isEven(3)).toBe(false)
    })
  })

  describe('数组处理测试', () => {
    it('应该正确处理数组', () => {
      const input = [1, -2, 3, 0, 4, -1]
      const expected = [2, 6, 8] // 过滤正数，乘以2，排序
      expect(processArray(input)).toEqual(expected)
    })

    it('应该处理空数组', () => {
      expect(processArray([])).toEqual([])
    })

    it('应该处理全负数数组', () => {
      expect(processArray([-1, -2, -3])).toEqual([])
    })
  })
})
