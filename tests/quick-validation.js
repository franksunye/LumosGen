#!/usr/bin/env node

/**
 * LumosGen 快速功能验证脚本
 * 用于验证核心组件是否正常工作
 */

const fs = require('fs');
const path = require('path');

class QuickValidator {
    constructor() {
        this.results = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`${prefix} [${timestamp}] ${message}`);
    }

    async validate(name, testFn) {
        try {
            const startTime = Date.now();
            await testFn();
            const duration = Date.now() - startTime;
            this.results.push({ name, status: 'PASS', duration });
            this.log(`${name} - 通过 (${duration}ms)`, 'success');
        } catch (error) {
            this.results.push({ name, status: 'FAIL', error: error.message });
            this.log(`${name} - 失败: ${error.message}`, 'error');
        }
    }

    // 验证扩展配置
    async validateExtensionConfig() {
        await this.validate('扩展配置验证', () => {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            
            // 检查基本信息
            if (!packageJson.name || packageJson.name !== 'lumosgen') {
                throw new Error('扩展名称不正确');
            }
            
            if (!packageJson.displayName || !packageJson.description) {
                throw new Error('缺少显示名称或描述');
            }
            
            // 检查VS Code引擎版本
            if (!packageJson.engines || !packageJson.engines.vscode) {
                throw new Error('缺少VS Code引擎版本要求');
            }
            
            // 检查激活事件
            if (!packageJson.activationEvents || packageJson.activationEvents.length === 0) {
                throw new Error('缺少激活事件配置');
            }
            
            // 检查贡献点
            if (!packageJson.contributes) {
                throw new Error('缺少贡献点配置');
            }
            
            this.log('扩展配置完整且正确');
        });
    }

    // 验证核心文件结构
    async validateCoreFiles() {
        await this.validate('核心文件结构验证', () => {
            const requiredFiles = [
                'src/extension.ts',
                'src/ui/SidebarProvider.ts',
                'src/content/MarketingContentGenerator.ts',
                'src/website/WebsiteBuilder.ts',
                'src/deployment/GitHubPagesDeployer.ts'
            ];
            
            const missingFiles = [];
            for (const file of requiredFiles) {
                if (!fs.existsSync(file)) {
                    missingFiles.push(file);
                }
            }
            
            if (missingFiles.length > 0) {
                throw new Error(`缺少核心文件: ${missingFiles.join(', ')}`);
            }
            
            this.log(`验证了 ${requiredFiles.length} 个核心文件`);
        });
    }

    // 验证AI服务配置
    async validateAIServiceConfig() {
        await this.validate('AI服务配置验证', () => {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            const aiConfig = packageJson.contributes?.configuration?.properties?.['lumosGen.aiService'];
            
            if (!aiConfig) {
                throw new Error('缺少AI服务配置');
            }
            
            const defaultConfig = aiConfig.default;
            if (!defaultConfig) {
                throw new Error('缺少AI服务默认配置');
            }
            
            // 检查必要的配置项
            const requiredKeys = [
                'deepseekApiKey', 'deepseekEndpoint', 'deepseekModel',
                'openaiApiKey', 'openaiEndpoint', 'openaiModel',
                'degradationStrategy', 'monitoringEnabled'
            ];
            
            for (const key of requiredKeys) {
                if (!(key in defaultConfig)) {
                    throw new Error(`缺少AI服务配置项: ${key}`);
                }
            }
            
            // 验证降级策略
            if (!Array.isArray(defaultConfig.degradationStrategy) || 
                defaultConfig.degradationStrategy.length === 0) {
                throw new Error('降级策略配置无效');
            }
            
            this.log('AI服务配置完整');
        });
    }

    // 验证命令配置
    async validateCommands() {
        await this.validate('命令配置验证', () => {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            const commands = packageJson.contributes?.commands;
            
            if (!commands || !Array.isArray(commands)) {
                throw new Error('缺少命令配置');
            }
            
            const expectedCommands = [
                'lumosGen.analyzeProject',
                'lumosGen.generateMarketingContent',
                'lumosGen.previewWebsite',
                'lumosGen.deployToGitHub',
                'lumosGen.showMonitoring'
            ];
            
            const configuredCommands = commands.map(cmd => cmd.command);
            const missingCommands = expectedCommands.filter(cmd => !configuredCommands.includes(cmd));
            
            if (missingCommands.length > 0) {
                throw new Error(`缺少命令配置: ${missingCommands.join(', ')}`);
            }
            
            this.log(`验证了 ${commands.length} 个命令配置`);
        });
    }

    // 验证主题配置
    async validateThemeConfig() {
        await this.validate('主题配置验证', () => {
            // 检查主题相关文件
            const themeFiles = [
                'src/website/ThemeManager.ts'
            ];
            
            for (const file of themeFiles) {
                if (!fs.existsSync(file)) {
                    throw new Error(`缺少主题文件: ${file}`);
                }
                
                const content = fs.readFileSync(file, 'utf8');
                if (content.length < 100) {
                    throw new Error(`主题文件内容过少: ${file}`);
                }
            }
            
            this.log('主题配置文件验证通过');
        });
    }

    // 验证测试文件
    async validateTestFiles() {
        await this.validate('测试文件验证', () => {
            const testDir = 'tests';
            if (!fs.existsSync(testDir)) {
                throw new Error('缺少测试目录');
            }
            
            const testFiles = fs.readdirSync(testDir).filter(file => 
                file.endsWith('.test.js') || file.endsWith('.test.cjs')
            );
            
            if (testFiles.length === 0) {
                throw new Error('缺少测试文件');
            }
            
            this.log(`发现 ${testFiles.length} 个测试文件`);
        });
    }

    // 验证文档完整性
    async validateDocumentation() {
        await this.validate('文档完整性验证', () => {
            const requiredDocs = [
                'README.md',
                'docs/MVP_SPECIFICATION.md',
                'docs/PRODUCT_BACKLOG.md',
                'docs/TECHNICAL_ARCHITECTURE.md',
                'docs/MANUAL_TESTING_PLAN.md',
                'docs/TESTING_CHECKLIST.md'
            ];
            
            const missingDocs = [];
            for (const doc of requiredDocs) {
                if (!fs.existsSync(doc)) {
                    missingDocs.push(doc);
                } else {
                    const content = fs.readFileSync(doc, 'utf8');
                    if (content.length < 500) {
                        this.log(`文档内容较少: ${doc}`, 'warning');
                    }
                }
            }
            
            if (missingDocs.length > 0) {
                throw new Error(`缺少文档: ${missingDocs.join(', ')}`);
            }
            
            this.log(`验证了 ${requiredDocs.length} 个文档文件`);
        });
    }

    // 验证TypeScript配置
    async validateTypeScriptConfig() {
        await this.validate('TypeScript配置验证', () => {
            if (!fs.existsSync('tsconfig.json')) {
                throw new Error('缺少tsconfig.json文件');
            }
            
            const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
            
            if (!tsConfig.compilerOptions) {
                throw new Error('缺少编译器选项');
            }
            
            const requiredOptions = ['target', 'module', 'outDir', 'rootDir'];
            for (const option of requiredOptions) {
                if (!(option in tsConfig.compilerOptions)) {
                    throw new Error(`缺少TypeScript配置: ${option}`);
                }
            }
            
            this.log('TypeScript配置正确');
        });
    }

    // 生成验证报告
    generateReport() {
        const total = this.results.length;
        const passed = this.results.filter(r => r.status === 'PASS').length;
        const failed = this.results.filter(r => r.status === 'FAIL').length;
        
        this.log('\n=== 快速验证报告 ===');
        this.log(`总验证项: ${total}`);
        this.log(`通过: ${passed}`, 'success');
        this.log(`失败: ${failed}`, failed > 0 ? 'error' : 'info');
        this.log(`通过率: ${total > 0 ? (passed / total * 100).toFixed(1) : 0}%`);
        
        if (failed > 0) {
            this.log('\n失败项目:');
            this.results
                .filter(r => r.status === 'FAIL')
                .forEach(r => this.log(`- ${r.name}: ${r.error}`, 'error'));
        }
        
        const status = failed === 0 ? 'READY' : 'NEEDS_ATTENTION';
        this.log(`\n整体状态: ${status}`, status === 'READY' ? 'success' : 'warning');
        
        return { total, passed, failed, status, results: this.results };
    }

    // 运行所有验证
    async runAll() {
        this.log('开始LumosGen快速功能验证...\n');
        
        await this.validateExtensionConfig();
        await this.validateCoreFiles();
        await this.validateAIServiceConfig();
        await this.validateCommands();
        await this.validateThemeConfig();
        await this.validateTestFiles();
        await this.validateDocumentation();
        await this.validateTypeScriptConfig();
        
        const report = this.generateReport();
        
        if (report.status === 'READY') {
            this.log('\n🎉 系统验证通过！可以开始手工测试。');
            this.log('下一步：');
            this.log('1. 编译扩展: npm run compile');
            this.log('2. 在VS Code中按F5启动调试');
            this.log('3. 按照测试检查清单执行手工测试');
        } else {
            this.log('\n⚠️ 发现问题，请先解决后再进行手工测试。');
        }
        
        return report;
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const validator = new QuickValidator();
    validator.runAll().catch(error => {
        console.error('验证过程出错:', error);
        process.exit(1);
    });
}

module.exports = QuickValidator;
