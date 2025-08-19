#!/usr/bin/env node

/**
 * LumosGen 测试运行器
 * 统一的测试执行和报告系统
 */

const fs = require('fs');
const path = require('path');
const { TestConfig, TestUtils, TestAssertions } = require('./test-config');

class TestRunner {
    constructor() {
        this.config = new TestConfig();
        this.testSuites = new Map();
        this.results = [];
        this.startTime = null;
        this.endTime = null;
    }

    // 注册测试套件
    registerTestSuite(name, testSuite) {
        this.testSuites.set(name, testSuite);
    }

    // 发现测试文件
    discoverTests(pattern = /\.test\.(js|cjs)$/) {
        const testFiles = fs.readdirSync(this.config.testRoot)
            .filter(file => pattern.test(file))
            .map(file => path.join(this.config.testRoot, file));

        for (const testFile of testFiles) {
            try {
                const testModule = require(testFile);
                const suiteName = path.basename(testFile, path.extname(testFile));
                this.registerTestSuite(suiteName, testModule);
            } catch (error) {
                console.warn(`Failed to load test file ${testFile}:`, error.message);
            }
        }
    }

    // 运行单个测试
    async runTest(testName, testFunction, timeout = 30000) {
        const testId = TestUtils.generateTestId();
        const startTime = Date.now();
        
        try {
            console.log(`  ▶ ${testName}`);
            
            // 使用超时包装测试函数
            await TestUtils.timeout(testFunction(), timeout);
            
            const duration = Date.now() - startTime;
            const result = {
                id: testId,
                name: testName,
                status: 'passed',
                duration,
                message: 'Test passed successfully'
            };
            
            console.log(`  ✅ ${testName} (${duration}ms)`);
            return result;
            
        } catch (error) {
            const duration = Date.now() - startTime;
            const result = {
                id: testId,
                name: testName,
                status: 'failed',
                duration,
                message: error.message,
                stack: error.stack
            };
            
            console.log(`  ❌ ${testName} (${duration}ms): ${error.message}`);
            return result;
        }
    }

    // 运行测试套件
    async runTestSuite(suiteName, testSuite) {
        console.log(`\n📋 Running test suite: ${suiteName}`);
        const suiteResults = [];
        
        // 运行setup（如果存在）
        if (testSuite.setup && typeof testSuite.setup === 'function') {
            try {
                await testSuite.setup();
                console.log(`  🔧 Setup completed`);
            } catch (error) {
                console.log(`  ❌ Setup failed: ${error.message}`);
                return [{
                    name: `${suiteName}.setup`,
                    status: 'failed',
                    message: `Setup failed: ${error.message}`,
                    duration: 0
                }];
            }
        }
        
        // 运行所有测试
        for (const [testName, testFunction] of Object.entries(testSuite)) {
            if (typeof testFunction === 'function' && 
                testName !== 'setup' && 
                testName !== 'teardown') {
                
                const result = await this.runTest(testName, testFunction);
                suiteResults.push(result);
            }
        }
        
        // 运行teardown（如果存在）
        if (testSuite.teardown && typeof testSuite.teardown === 'function') {
            try {
                await testSuite.teardown();
                console.log(`  🧹 Teardown completed`);
            } catch (error) {
                console.log(`  ⚠️ Teardown failed: ${error.message}`);
            }
        }
        
        return suiteResults;
    }

    // 运行所有测试
    async runAllTests() {
        this.startTime = Date.now();
        console.log('🚀 Starting LumosGen Test Suite\n');
        
        // 清理之前的测试输出
        this.config.cleanTestOutputs();
        
        for (const [suiteName, testSuite] of this.testSuites) {
            const suiteResults = await this.runTestSuite(suiteName, testSuite);
            this.results.push(...suiteResults);
        }
        
        this.endTime = Date.now();
        return this.generateReport();
    }

    // 生成测试报告
    generateReport() {
        const totalDuration = this.endTime - this.startTime;
        const summary = {
            total: this.results.length,
            passed: this.results.filter(r => r.status === 'passed').length,
            failed: this.results.filter(r => r.status === 'failed').length,
            skipped: this.results.filter(r => r.status === 'skipped').length,
            duration: totalDuration
        };
        
        const report = {
            summary,
            results: this.results,
            timestamp: new Date().toISOString(),
            environment: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch
            }
        };
        
        // 保存详细报告
        const reportPath = this.config.getReportPath(`test-report-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        // 打印摘要
        this.printSummary(summary, reportPath);
        
        return report;
    }

    // 打印测试摘要
    printSummary(summary, reportPath) {
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${summary.total}`);
        console.log(`✅ Passed: ${summary.passed}`);
        console.log(`❌ Failed: ${summary.failed}`);
        console.log(`⏭️ Skipped: ${summary.skipped}`);
        console.log(`⏱️ Duration: ${summary.duration}ms`);
        console.log(`📄 Report: ${reportPath}`);
        
        const passRate = summary.total > 0 ? (summary.passed / summary.total * 100).toFixed(1) : 0;
        console.log(`📈 Pass Rate: ${passRate}%`);
        
        if (summary.failed > 0) {
            console.log('\n❌ FAILED TESTS:');
            this.results
                .filter(r => r.status === 'failed')
                .forEach(r => {
                    console.log(`  - ${r.name}: ${r.message}`);
                });
        }
        
        console.log('='.repeat(60));
        
        // 退出码
        process.exitCode = summary.failed > 0 ? 1 : 0;
    }

    // 运行特定的测试套件
    async runSpecificSuite(suiteName) {
        if (!this.testSuites.has(suiteName)) {
            throw new Error(`Test suite '${suiteName}' not found`);
        }
        
        this.startTime = Date.now();
        console.log(`🚀 Running specific test suite: ${suiteName}\n`);
        
        const testSuite = this.testSuites.get(suiteName);
        const suiteResults = await this.runTestSuite(suiteName, testSuite);
        this.results = suiteResults;
        
        this.endTime = Date.now();
        return this.generateReport();
    }
}

// 命令行接口
async function main() {
    const runner = new TestRunner();
    
    // 发现并注册测试
    runner.discoverTests();
    
    const args = process.argv.slice(2);
    const command = args[0];
    
    try {
        switch (command) {
            case 'suite':
                const suiteName = args[1];
                if (!suiteName) {
                    console.error('Usage: node test-runner.js suite <suite-name>');
                    process.exit(1);
                }
                await runner.runSpecificSuite(suiteName);
                break;
                
            case 'list':
                console.log('Available test suites:');
                for (const suiteName of runner.testSuites.keys()) {
                    console.log(`  - ${suiteName}`);
                }
                break;
                
            default:
                await runner.runAllTests();
                break;
        }
    } catch (error) {
        console.error('Test runner error:', error.message);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = { TestRunner, TestUtils, TestAssertions };
