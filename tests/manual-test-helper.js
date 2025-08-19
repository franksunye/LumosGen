#!/usr/bin/env node

/**
 * LumosGen 手工测试辅助脚本
 * 用于准备测试环境和验证基础功能
 */

const fs = require('fs');
const path = require('path');

class ManualTestHelper {
    constructor() {
        this.testResults = [];
        this.testStartTime = new Date();
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
        console.log(`${prefix} [${timestamp}] ${message}`);
    }

    async runTest(testName, testFunction) {
        this.log(`开始测试: ${testName}`);
        const startTime = Date.now();
        
        try {
            await testFunction();
            const duration = Date.now() - startTime;
            this.testResults.push({
                name: testName,
                status: 'PASS',
                duration,
                error: null
            });
            this.log(`测试通过: ${testName} (${duration}ms)`, 'success');
        } catch (error) {
            const duration = Date.now() - startTime;
            this.testResults.push({
                name: testName,
                status: 'FAIL',
                duration,
                error: error.message
            });
            this.log(`测试失败: ${testName} - ${error.message}`, 'error');
        }
    }

    // 测试环境检查
    async checkEnvironment() {
        await this.runTest('Node.js版本检查', () => {
            const version = process.version;
            this.log(`Node.js版本: ${version}`);
            const majorVersion = parseInt(version.slice(1).split('.')[0]);
            if (majorVersion < 16) {
                throw new Error(`Node.js版本不符合要求，当前: ${version}，要求: 16+`);
            }
        });

        await this.runTest('项目结构检查', () => {
            const requiredFiles = [
                'package.json',
                'tsconfig.json',
                'src/extension.ts',
                'src/ui/SidebarProvider.ts'
            ];

            for (const file of requiredFiles) {
                if (!fs.existsSync(file)) {
                    throw new Error(`缺少必要文件: ${file}`);
                }
            }
        });

        await this.runTest('依赖包检查', () => {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            const requiredDeps = ['axios', 'dotenv'];
            const requiredDevDeps = ['typescript', '@types/vscode'];

            for (const dep of requiredDeps) {
                if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
                    throw new Error(`缺少依赖包: ${dep}`);
                }
            }

            for (const dep of requiredDevDeps) {
                if (!packageJson.devDependencies || !packageJson.devDependencies[dep]) {
                    throw new Error(`缺少开发依赖包: ${dep}`);
                }
            }
        });
    }

    // 创建测试项目
    async createTestProject() {
        await this.runTest('创建测试项目', () => {
            const testDir = path.join(process.cwd(), 'test-project');
            
            if (!fs.existsSync(testDir)) {
                fs.mkdirSync(testDir, { recursive: true });
            }

            // 创建README.md
            const readmeContent = `# Test Project

This is a test project for LumosGen manual testing.

## Features

- Feature 1: Basic functionality
- Feature 2: Advanced features
- Feature 3: Integration capabilities

## Installation

\`\`\`bash
npm install test-project
\`\`\`

## Usage

\`\`\`javascript
const testProject = require('test-project');
testProject.run();
\`\`\`

## Contributing

Please read our contributing guidelines.
`;

            fs.writeFileSync(path.join(testDir, 'README.md'), readmeContent);

            // 创建package.json
            const packageContent = {
                "name": "test-project",
                "version": "1.0.0",
                "description": "A test project for LumosGen",
                "main": "index.js",
                "scripts": {
                    "start": "node index.js",
                    "test": "echo \"Error: no test specified\" && exit 1"
                },
                "keywords": ["test", "demo", "javascript"],
                "author": "Test Author",
                "license": "MIT",
                "dependencies": {
                    "express": "^4.18.0",
                    "lodash": "^4.17.21"
                }
            };

            fs.writeFileSync(
                path.join(testDir, 'package.json'), 
                JSON.stringify(packageContent, null, 2)
            );

            // 创建示例代码文件
            const indexContent = `const express = require('express');
const _ = require('lodash');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    const data = {
        message: 'Hello from Test Project!',
        timestamp: new Date().toISOString(),
        features: ['Feature 1', 'Feature 2', 'Feature 3']
    };
    
    res.json(_.pick(data, ['message', 'timestamp', 'features']));
});

app.listen(port, () => {
    console.log(\`Test project listening at http://localhost:\${port}\`);
});

module.exports = app;
`;

            fs.writeFileSync(path.join(testDir, 'index.js'), indexContent);

            this.log(`测试项目已创建: ${testDir}`);
        });
    }

    // 验证生成的文件
    async validateGeneratedFiles() {
        await this.runTest('验证生成的网站文件', () => {
            const websiteDir = path.join(process.cwd(), 'lumosgen-website');
            
            if (!fs.existsSync(websiteDir)) {
                throw new Error('网站目录不存在，请先运行内容生成');
            }

            const requiredFiles = [
                'index.html',
                'about.html',
                'blog.html',
                'faq.html',
                'styles.css'
            ];

            for (const file of requiredFiles) {
                const filePath = path.join(websiteDir, file);
                if (!fs.existsSync(filePath)) {
                    throw new Error(`缺少网站文件: ${file}`);
                }

                const content = fs.readFileSync(filePath, 'utf8');
                if (content.length < 100) {
                    throw new Error(`文件内容过短: ${file}`);
                }
            }

            this.log('所有网站文件验证通过');
        });
    }

    // 性能基准测试
    async performanceBenchmark() {
        await this.runTest('文件读取性能测试', () => {
            const startTime = Date.now();
            const testFile = 'package.json';
            
            for (let i = 0; i < 100; i++) {
                fs.readFileSync(testFile, 'utf8');
            }
            
            const duration = Date.now() - startTime;
            this.log(`100次文件读取耗时: ${duration}ms`);
            
            if (duration > 1000) {
                throw new Error(`文件读取性能过慢: ${duration}ms`);
            }
        });

        await this.runTest('JSON解析性能测试', () => {
            const startTime = Date.now();
            const packageContent = fs.readFileSync('package.json', 'utf8');
            
            for (let i = 0; i < 1000; i++) {
                JSON.parse(packageContent);
            }
            
            const duration = Date.now() - startTime;
            this.log(`1000次JSON解析耗时: ${duration}ms`);
            
            if (duration > 500) {
                throw new Error(`JSON解析性能过慢: ${duration}ms`);
            }
        });
    }

    // 生成测试报告
    generateReport() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(t => t.status === 'PASS').length;
        const failedTests = this.testResults.filter(t => t.status === 'FAIL').length;
        const totalDuration = Date.now() - this.testStartTime.getTime();

        const report = {
            summary: {
                total: totalTests,
                passed: passedTests,
                failed: failedTests,
                passRate: totalTests > 0 ? (passedTests / totalTests * 100).toFixed(2) : 0,
                totalDuration: totalDuration
            },
            details: this.testResults,
            timestamp: new Date().toISOString()
        };

        const reportPath = path.join(process.cwd(), 'test-results.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        this.log('\n=== 测试报告 ===');
        this.log(`总测试数: ${totalTests}`);
        this.log(`通过: ${passedTests}`, 'success');
        this.log(`失败: ${failedTests}`, failedTests > 0 ? 'error' : 'info');
        this.log(`通过率: ${report.summary.passRate}%`);
        this.log(`总耗时: ${totalDuration}ms`);
        this.log(`报告已保存: ${reportPath}`);

        if (failedTests > 0) {
            this.log('\n失败的测试:');
            this.testResults
                .filter(t => t.status === 'FAIL')
                .forEach(t => {
                    this.log(`- ${t.name}: ${t.error}`, 'error');
                });
        }

        return report;
    }

    // 主测试流程
    async runAllTests() {
        this.log('开始LumosGen手工测试辅助检查...\n');

        await this.checkEnvironment();
        await this.createTestProject();
        await this.performanceBenchmark();

        // 如果网站文件存在，则验证
        if (fs.existsSync(path.join(process.cwd(), 'lumosgen-website'))) {
            await this.validateGeneratedFiles();
        } else {
            this.log('跳过网站文件验证（文件不存在，请先运行内容生成）');
        }

        const report = this.generateReport();
        
        this.log('\n=== 下一步操作建议 ===');
        this.log('1. 在VS Code中打开test-project目录');
        this.log('2. 激活LumosGen扩展');
        this.log('3. 按照手工测试计划执行完整测试流程');
        this.log('4. 记录测试结果并更新测试报告');

        return report;
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const helper = new ManualTestHelper();
    helper.runAllTests().catch(error => {
        console.error('测试执行失败:', error);
        process.exit(1);
    });
}

module.exports = ManualTestHelper;
