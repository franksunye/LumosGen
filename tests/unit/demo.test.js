/**
 * 演示测试 - 验证测试框架是否正常工作
 */

const { TestUtils, TestAssertions } = require('../test-config');

// 简单的演示类
class Calculator {
    add(a, b) {
        return a + b;
    }
    
    subtract(a, b) {
        return a - b;
    }
    
    multiply(a, b) {
        return a * b;
    }
    
    divide(a, b) {
        if (b === 0) {
            throw new Error('Division by zero');
        }
        return a / b;
    }
    
    async asyncAdd(a, b) {
        await TestUtils.sleep(10);
        return a + b;
    }
}

// 测试套件
const demoTests = {
    async setup() {
        this.calculator = new Calculator();
        console.log('    📝 Calculator instance created');
    },

    async testAddition() {
        const result = this.calculator.add(2, 3);
        TestAssertions.assertEqual(result, 5, 'Addition should work correctly');
    },

    async testSubtraction() {
        const result = this.calculator.subtract(5, 3);
        TestAssertions.assertEqual(result, 2, 'Subtraction should work correctly');
    },

    async testMultiplication() {
        const result = this.calculator.multiply(4, 3);
        TestAssertions.assertEqual(result, 12, 'Multiplication should work correctly');
    },

    async testDivision() {
        const result = this.calculator.divide(10, 2);
        TestAssertions.assertEqual(result, 5, 'Division should work correctly');
    },

    async testDivisionByZero() {
        await TestAssertions.assertThrowsAsync(
            () => this.calculator.divide(10, 0),
            Error,
            'Division by zero should throw an error'
        );
    },

    async testAsyncOperation() {
        const startTime = Date.now();
        const result = await this.calculator.asyncAdd(3, 4);
        const duration = Date.now() - startTime;
        
        TestAssertions.assertEqual(result, 7, 'Async addition should work correctly');
        TestAssertions.assertTrue(duration >= 5, 'Async operation should take at least 5ms');
    },

    async testAssertions() {
        // 测试各种断言方法
        TestAssertions.assertTrue(true, 'assertTrue should work');
        TestAssertions.assertFalse(false, 'assertFalse should work');
        TestAssertions.assertEqual(1, 1, 'assertEqual should work');
        TestAssertions.assertNotEqual(1, 2, 'assertNotEqual should work');
        TestAssertions.assertBetween(5, 1, 10, 'assertBetween should work');
        TestAssertions.assertContains([1, 2, 3], 2, 'assertContains should work with arrays');
        TestAssertions.assertContains('hello world', 'world', 'assertContains should work with strings');
        TestAssertions.assertMatches('test123', /test\d+/, 'assertMatches should work');
    },

    async testDeepEqual() {
        const obj1 = { a: 1, b: { c: 2 } };
        const obj2 = { a: 1, b: { c: 2 } };
        const obj3 = { a: 1, b: { c: 3 } };
        
        TestAssertions.assertDeepEqual(obj1, obj2, 'Deep equal objects should match');
        
        try {
            TestAssertions.assertDeepEqual(obj1, obj3, 'Different objects should not match');
            throw new Error('Should have thrown an assertion error');
        } catch (error) {
            // Expected to throw
            TestAssertions.assertContains(error.message, 'deeply equal', 'Should provide meaningful error message');
        }
    },

    async testUtilityFunctions() {
        // 测试工具函数
        const testId = TestUtils.generateTestId();
        TestAssertions.assertTrue(testId.startsWith('test_'), 'Test ID should have correct prefix');
        TestAssertions.assertTrue(testId.length > 10, 'Test ID should be reasonably long');
        
        // 测试sleep函数
        const startTime = Date.now();
        await TestUtils.sleep(50);
        const duration = Date.now() - startTime;
        TestAssertions.assertTrue(duration >= 45, 'Sleep should wait for specified time');
        
        // 测试timeout函数
        const fastPromise = Promise.resolve('fast');
        const result = await TestUtils.timeout(fastPromise, 1000);
        TestAssertions.assertEqual(result, 'fast', 'Timeout should return result for fast promises');
        
        // 测试timeout超时
        const slowPromise = new Promise(resolve => setTimeout(() => resolve('slow'), 1000));
        try {
            await TestUtils.timeout(slowPromise, 100);
            throw new Error('Should have timed out');
        } catch (error) {
            TestAssertions.assertContains(error.message, 'Timeout', 'Should throw timeout error');
        }
    },

    async testRetryMechanism() {
        let attempts = 0;
        const flakyFunction = async () => {
            attempts++;
            if (attempts < 3) {
                throw new Error('Temporary failure');
            }
            return 'success';
        };
        
        const result = await TestUtils.retry(flakyFunction, 5, 10);
        TestAssertions.assertEqual(result, 'success', 'Retry should eventually succeed');
        TestAssertions.assertEqual(attempts, 3, 'Should have made 3 attempts');
    },

    async testMockObjects() {
        const mockContext = TestUtils.createMockVSCodeContext();
        TestAssertions.assertTrue(Array.isArray(mockContext.subscriptions), 'Mock context should have subscriptions array');
        TestAssertions.assertTrue(mockContext.workspaceState instanceof Map, 'Mock context should have workspace state');
        TestAssertions.assertTrue(mockContext.globalState instanceof Map, 'Mock context should have global state');
        
        const mockWorkspace = TestUtils.createMockWorkspaceFolder('test-workspace');
        TestAssertions.assertEqual(mockWorkspace.name, 'test-workspace', 'Mock workspace should have correct name');
        TestAssertions.assertTrue(mockWorkspace.uri.fsPath.includes('test-workspace'), 'Mock workspace should have correct path');
    },

    async testObjectComparison() {
        const obj1 = { a: 1, b: { c: 2, d: [1, 2, 3] } };
        const obj2 = { a: 1, b: { c: 2, d: [1, 2, 3] } };
        const obj3 = { a: 1, b: { c: 3, d: [1, 2, 3] } };
        
        const differences1 = TestUtils.compareObjects(obj1, obj2);
        TestAssertions.assertEqual(differences1.length, 0, 'Identical objects should have no differences');
        
        const differences2 = TestUtils.compareObjects(obj1, obj3);
        TestAssertions.assertTrue(differences2.length > 0, 'Different objects should have differences');
        TestAssertions.assertContains(differences2[0], 'b.c', 'Difference should identify nested property');
    },

    async teardown() {
        this.calculator = null;
        console.log('    🧹 Calculator instance cleaned up');
    }
};

module.exports = demoTests;
