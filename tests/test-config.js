/**
 * LumosGen 测试配置和基础设施
 * 提供统一的测试环境、工具和配置
 */

const fs = require('fs');
const path = require('path');

class TestConfig {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.testRoot = __dirname;
        this.srcRoot = path.join(this.projectRoot, 'src');
        this.outRoot = path.join(this.projectRoot, 'out');
        
        // 测试环境配置
        this.testEnv = {
            timeout: 30000, // 30秒超时
            retries: 3,
            parallel: false, // VS Code扩展测试通常不能并行
            verbose: true
        };
        
        // Mock配置
        this.mockConfig = {
            aiService: {
                responseDelay: 100,
                errorRate: 0.05,
                simulateNetworkIssues: false
            },
            github: {
                simulateDeployment: true,
                deploymentDelay: 1000
            }
        };
        
        // 测试数据路径
        this.testDataPaths = {
            fixtures: path.join(this.testRoot, 'fixtures'),
            mocks: path.join(this.testRoot, 'mocks'),
            outputs: path.join(this.testRoot, 'outputs'),
            reports: path.join(this.testRoot, 'reports')
        };
        
        this.ensureTestDirectories();
    }
    
    // 确保测试目录存在
    ensureTestDirectories() {
        Object.values(this.testDataPaths).forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }
    
    // 获取测试项目路径
    getTestProjectPath(projectName = 'test-project') {
        return path.join(this.projectRoot, projectName);
    }
    
    // 获取源文件路径
    getSrcPath(relativePath) {
        return path.join(this.srcRoot, relativePath);
    }
    
    // 获取编译后文件路径
    getOutPath(relativePath) {
        return path.join(this.outRoot, relativePath);
    }
    
    // 获取测试固件路径
    getFixturePath(fixtureName) {
        return path.join(this.testDataPaths.fixtures, fixtureName);
    }
    
    // 获取Mock文件路径
    getMockPath(mockName) {
        return path.join(this.testDataPaths.mocks, mockName);
    }
    
    // 获取输出路径
    getOutputPath(outputName) {
        return path.join(this.testDataPaths.outputs, outputName);
    }
    
    // 获取报告路径
    getReportPath(reportName) {
        return path.join(this.testDataPaths.reports, reportName);
    }
    
    // 清理测试输出
    cleanTestOutputs() {
        const outputDir = this.testDataPaths.outputs;
        if (fs.existsSync(outputDir)) {
            fs.rmSync(outputDir, { recursive: true, force: true });
            fs.mkdirSync(outputDir, { recursive: true });
        }
    }
    
    // 创建测试报告
    createTestReport(testSuite, results) {
        const report = {
            testSuite,
            timestamp: new Date().toISOString(),
            summary: {
                total: results.length,
                passed: results.filter(r => r.status === 'passed').length,
                failed: results.filter(r => r.status === 'failed').length,
                skipped: results.filter(r => r.status === 'skipped').length
            },
            results,
            environment: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch
            }
        };
        
        const reportPath = this.getReportPath(`${testSuite}-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        return report;
    }
}

// 测试工具类
class TestUtils {
    static async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    static async timeout(promise, ms) {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
        });
        
        return Promise.race([promise, timeoutPromise]);
    }
    
    static async retry(fn, maxRetries = 3, delay = 1000) {
        let lastError;
        
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                if (i < maxRetries - 1) {
                    await this.sleep(delay * Math.pow(2, i)); // 指数退避
                }
            }
        }
        
        throw lastError;
    }
    
    static generateTestId() {
        return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    static createMockVSCodeContext() {
        return {
            subscriptions: [],
            workspaceState: new Map(),
            globalState: new Map(),
            extensionPath: '/mock/extension/path',
            storagePath: '/mock/storage/path',
            globalStoragePath: '/mock/global/storage/path'
        };
    }
    
    static createMockWorkspaceFolder(name = 'test-workspace') {
        return {
            uri: { fsPath: `/mock/workspace/${name}` },
            name,
            index: 0
        };
    }
    
    static validateTestResult(result, expectedKeys = ['status', 'message']) {
        if (!result || typeof result !== 'object') {
            throw new Error('Test result must be an object');
        }
        
        for (const key of expectedKeys) {
            if (!(key in result)) {
                throw new Error(`Test result missing required key: ${key}`);
            }
        }
        
        return true;
    }
    
    static compareObjects(obj1, obj2, path = '') {
        const differences = [];
        
        if (typeof obj1 !== typeof obj2) {
            differences.push(`${path}: type mismatch (${typeof obj1} vs ${typeof obj2})`);
            return differences;
        }
        
        if (obj1 === null || obj2 === null) {
            if (obj1 !== obj2) {
                differences.push(`${path}: null mismatch (${obj1} vs ${obj2})`);
            }
            return differences;
        }
        
        if (typeof obj1 !== 'object') {
            if (obj1 !== obj2) {
                differences.push(`${path}: value mismatch (${obj1} vs ${obj2})`);
            }
            return differences;
        }
        
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        const allKeys = new Set([...keys1, ...keys2]);
        
        for (const key of allKeys) {
            const newPath = path ? `${path}.${key}` : key;
            
            if (!(key in obj1)) {
                differences.push(`${newPath}: missing in first object`);
            } else if (!(key in obj2)) {
                differences.push(`${newPath}: missing in second object`);
            } else {
                differences.push(...this.compareObjects(obj1[key], obj2[key], newPath));
            }
        }
        
        return differences;
    }
}

// 测试断言类
class TestAssertions {
    static assertTrue(condition, message = 'Assertion failed') {
        if (!condition) {
            throw new Error(message);
        }
    }
    
    static assertFalse(condition, message = 'Assertion failed') {
        if (condition) {
            throw new Error(message);
        }
    }
    
    static assertEqual(actual, expected, message = 'Values are not equal') {
        if (actual !== expected) {
            throw new Error(`${message}: expected ${expected}, got ${actual}`);
        }
    }
    
    static assertNotEqual(actual, expected, message = 'Values should not be equal') {
        if (actual === expected) {
            throw new Error(`${message}: both values are ${actual}`);
        }
    }
    
    static assertDeepEqual(actual, expected, message = 'Objects are not deeply equal') {
        const differences = TestUtils.compareObjects(actual, expected);
        if (differences.length > 0) {
            throw new Error(`${message}:\n${differences.join('\n')}`);
        }
    }
    
    static assertThrows(fn, expectedError, message = 'Function should throw an error') {
        try {
            fn();
            throw new Error(message);
        } catch (error) {
            if (expectedError && !(error instanceof expectedError)) {
                throw new Error(`${message}: expected ${expectedError.name}, got ${error.constructor.name}`);
            }
        }
    }
    
    static async assertThrowsAsync(fn, expectedError, message = 'Async function should throw an error') {
        try {
            await fn();
            throw new Error(message);
        } catch (error) {
            if (expectedError && !(error instanceof expectedError)) {
                throw new Error(`${message}: expected ${expectedError.name}, got ${error.constructor.name}`);
            }
        }
    }
    
    static assertContains(container, item, message = 'Container does not contain item') {
        if (Array.isArray(container)) {
            if (!container.includes(item)) {
                throw new Error(`${message}: ${JSON.stringify(item)} not found in array`);
            }
        } else if (typeof container === 'string') {
            if (!container.includes(item)) {
                throw new Error(`${message}: "${item}" not found in string`);
            }
        } else {
            throw new Error('Container must be an array or string');
        }
    }
    
    static assertMatches(actual, pattern, message = 'String does not match pattern') {
        if (typeof actual !== 'string') {
            throw new Error('Actual value must be a string');
        }
        
        if (!pattern.test(actual)) {
            throw new Error(`${message}: "${actual}" does not match ${pattern}`);
        }
    }
    
    static assertBetween(value, min, max, message = 'Value is not within range') {
        if (typeof value !== 'number') {
            throw new Error('Value must be a number');
        }
        
        if (value < min || value > max) {
            throw new Error(`${message}: ${value} is not between ${min} and ${max}`);
        }
    }
}

module.exports = {
    TestConfig,
    TestUtils,
    TestAssertions
};
