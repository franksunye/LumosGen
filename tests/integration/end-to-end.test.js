/**
 * 端到端集成测试
 * 测试完整的用户工作流程
 */

const fs = require('fs');
const path = require('path');
const { TestConfig, TestUtils, TestAssertions } = require('../test-config');

// Mock完整的LumosGen系统
class MockLumosGenSystem {
    constructor() {
        this.config = new TestConfig();
        this.projectAnalyzer = new MockProjectAnalyzer();
        this.contentGenerator = new MockContentGenerator();
        this.websiteBuilder = new MockWebsiteBuilder();
        this.deployer = new MockDeployer();
        this.monitoring = new MockMonitoring();
    }

    async executeFullWorkflow(projectPath, options = {}) {
        const workflow = {
            startTime: Date.now(),
            steps: [],
            results: {},
            errors: [],
            warnings: []
        };

        try {
            // Step 1: 项目分析
            workflow.steps.push('project-analysis');
            const analysisResult = await this.projectAnalyzer.analyzeProject(projectPath);
            workflow.results.analysis = analysisResult;
            
            if (!analysisResult.success) {
                workflow.errors.push('Project analysis failed');
                return workflow;
            }

            // Step 2: 内容生成
            workflow.steps.push('content-generation');
            const contentResult = await this.contentGenerator.generateAllContent(
                analysisResult.data, 
                options.contentOptions || {}
            );
            workflow.results.content = contentResult;
            
            if (!contentResult.success) {
                workflow.errors.push('Content generation failed');
                return workflow;
            }

            // Step 3: 网站构建
            workflow.steps.push('website-building');
            const websiteResult = await this.websiteBuilder.buildWebsite(
                contentResult.data,
                options.websiteOptions || {}
            );
            workflow.results.website = websiteResult;
            
            if (!websiteResult.success) {
                workflow.errors.push('Website building failed');
                return workflow;
            }

            // Step 4: 部署（可选）
            if (options.deploy) {
                workflow.steps.push('deployment');
                const deployResult = await this.deployer.deploy(
                    websiteResult.data.outputDir,
                    options.deployOptions || {}
                );
                workflow.results.deployment = deployResult;
                
                if (!deployResult.success) {
                    workflow.errors.push('Deployment failed');
                    return workflow;
                }
            }

            // Step 5: 监控和统计
            workflow.steps.push('monitoring');
            const monitoringResult = await this.monitoring.recordWorkflow(workflow);
            workflow.results.monitoring = monitoringResult;

            workflow.endTime = Date.now();
            workflow.duration = workflow.endTime - workflow.startTime;
            workflow.success = workflow.errors.length === 0;

            return workflow;

        } catch (error) {
            workflow.errors.push(`Unexpected error: ${error.message}`);
            workflow.endTime = Date.now();
            workflow.duration = workflow.endTime - workflow.startTime;
            workflow.success = false;
            return workflow;
        }
    }
}

class MockProjectAnalyzer {
    async analyzeProject(projectPath) {
        await TestUtils.sleep(500); // 模拟分析时间
        
        if (!fs.existsSync(projectPath)) {
            return {
                success: false,
                error: 'Project path does not exist',
                data: null
            };
        }

        // 模拟项目分析
        const packageJsonPath = path.join(projectPath, 'package.json');
        const readmePath = path.join(projectPath, 'README.md');
        
        let projectData = {
            name: 'unknown-project',
            description: 'A project without description',
            techStack: [],
            features: [],
            useCases: [],
            keywords: []
        };

        // 读取package.json
        if (fs.existsSync(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                projectData.name = packageJson.name || projectData.name;
                projectData.description = packageJson.description || projectData.description;
                projectData.keywords = packageJson.keywords || [];
                
                // 分析依赖来确定技术栈
                const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
                if (dependencies.react) projectData.techStack.push('React');
                if (dependencies.vue) projectData.techStack.push('Vue');
                if (dependencies.angular) projectData.techStack.push('Angular');
                if (dependencies.express) projectData.techStack.push('Express');
                if (dependencies.typescript) projectData.techStack.push('TypeScript');
                
            } catch (error) {
                // 忽略JSON解析错误
            }
        }

        // 读取README.md
        if (fs.existsSync(readmePath)) {
            const readmeContent = fs.readFileSync(readmePath, 'utf8');
            
            // 简单的特性提取
            if (readmeContent.includes('API')) projectData.features.push('API support');
            if (readmeContent.includes('TypeScript')) projectData.features.push('TypeScript support');
            if (readmeContent.includes('test')) projectData.features.push('Testing support');
            
            // 简单的用例提取
            if (readmeContent.includes('web')) projectData.useCases.push('Web development');
            if (readmeContent.includes('mobile')) projectData.useCases.push('Mobile development');
            if (readmeContent.includes('server')) projectData.useCases.push('Server development');
        }

        return {
            success: true,
            data: projectData,
            metadata: {
                analyzedAt: new Date().toISOString(),
                filesAnalyzed: [
                    fs.existsSync(packageJsonPath) ? 'package.json' : null,
                    fs.existsSync(readmePath) ? 'README.md' : null
                ].filter(Boolean)
            }
        };
    }
}

class MockContentGenerator {
    async generateAllContent(projectData, options = {}) {
        await TestUtils.sleep(1000); // 模拟内容生成时间
        
        try {
            const content = {};
            
            // 生成首页
            content.homepage = {
                title: `${projectData.name} - ${projectData.description}`,
                content: `Welcome to ${projectData.name}!\n\n${projectData.description}\n\nKey features:\n${projectData.features.map(f => `- ${f}`).join('\n')}`,
                metadata: {
                    description: projectData.description,
                    keywords: projectData.keywords
                }
            };
            
            // 生成关于页面
            content.about = {
                title: `About ${projectData.name}`,
                content: `${projectData.name} is built with ${projectData.techStack.join(', ')}.\n\nUse cases:\n${projectData.useCases.map(u => `- ${u}`).join('\n')}`,
                metadata: {
                    description: `Learn more about ${projectData.name}`,
                    keywords: [...projectData.keywords, 'about']
                }
            };
            
            // 生成FAQ
            content.faq = {
                title: `${projectData.name} FAQ`,
                content: `Q: How do I install ${projectData.name}?\nA: You can install it using npm or yarn.\n\nQ: Is ${projectData.name} free?\nA: Yes, it's open source.`,
                metadata: {
                    description: `Frequently asked questions about ${projectData.name}`,
                    keywords: [...projectData.keywords, 'faq', 'help']
                }
            };

            return {
                success: true,
                data: content,
                metadata: {
                    generatedAt: new Date().toISOString(),
                    pageCount: Object.keys(content).length,
                    totalWords: Object.values(content).reduce((sum, page) => 
                        sum + (page.content || '').split(/\s+/).length, 0
                    )
                }
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    }
}

class MockWebsiteBuilder {
    async buildWebsite(content, options = {}) {
        await TestUtils.sleep(800); // 模拟构建时间
        
        try {
            const outputDir = new TestConfig().getOutputPath(`website-${Date.now()}`);
            
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            
            const website = {
                outputDir,
                pages: {},
                assets: {}
            };
            
            // 生成HTML文件
            for (const [pageType, pageContent] of Object.entries(content)) {
                const html = this.generateSimpleHTML(pageContent);
                const filename = pageType === 'homepage' ? 'index.html' : `${pageType}.html`;
                const filepath = path.join(outputDir, filename);
                
                fs.writeFileSync(filepath, html);
                
                website.pages[pageType] = {
                    filename,
                    filepath,
                    size: html.length
                };
            }
            
            // 生成CSS
            const css = this.generateSimpleCSS();
            const cssPath = path.join(outputDir, 'styles.css');
            fs.writeFileSync(cssPath, css);
            
            website.assets.css = {
                filename: 'styles.css',
                filepath: cssPath,
                size: css.length
            };
            
            return {
                success: true,
                data: website,
                metadata: {
                    builtAt: new Date().toISOString(),
                    pageCount: Object.keys(website.pages).length,
                    assetCount: Object.keys(website.assets).length
                }
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    }
    
    generateSimpleHTML(pageContent) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageContent.title || 'Untitled'}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>${pageContent.title || 'Untitled'}</h1>
    </header>
    <main>
        <div class="content">
            ${pageContent.content ? pageContent.content.split('\n').map(p => `<p>${p}</p>`).join('') : ''}
        </div>
    </main>
    <footer>
        <p>Generated by LumosGen</p>
    </footer>
</body>
</html>`;
    }
    
    generateSimpleCSS() {
        return `body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
header { background: #333; color: white; padding: 1rem; }
main { max-width: 800px; margin: 0 auto; padding: 2rem; }
.content { line-height: 1.6; }
footer { background: #f5f5f5; text-align: center; padding: 1rem; }`;
    }
}

class MockDeployer {
    async deploy(websiteDir, options = {}) {
        await TestUtils.sleep(1500); // 模拟部署时间
        
        try {
            // 模拟部署验证
            if (!fs.existsSync(websiteDir)) {
                throw new Error('Website directory does not exist');
            }
            
            const files = fs.readdirSync(websiteDir);
            if (!files.includes('index.html')) {
                throw new Error('Missing index.html file');
            }
            
            // 模拟部署成功
            const deploymentUrl = `https://mock-deploy-${Date.now()}.github.io`;
            
            return {
                success: true,
                data: {
                    url: deploymentUrl,
                    deployedFiles: files,
                    deploymentId: `deploy-${Date.now()}`
                },
                metadata: {
                    deployedAt: new Date().toISOString(),
                    platform: 'mock-github-pages',
                    fileCount: files.length
                }
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    }
}

class MockMonitoring {
    async recordWorkflow(workflow) {
        const stats = {
            workflowId: `workflow-${Date.now()}`,
            duration: workflow.duration,
            stepsCompleted: workflow.steps.length,
            success: workflow.success,
            errorCount: workflow.errors.length,
            warningCount: workflow.warnings.length
        };
        
        return {
            success: true,
            data: stats
        };
    }
}

// 测试套件
const endToEndTests = {
    async setup() {
        this.system = new MockLumosGenSystem();
        this.testProjectPath = this.system.config.getTestProjectPath();
        
        // 确保测试项目存在
        if (!fs.existsSync(this.testProjectPath)) {
            throw new Error('Test project not found. Run manual-test-helper.js first.');
        }
    },

    async testCompleteWorkflow() {
        const workflow = await this.system.executeFullWorkflow(this.testProjectPath);
        
        TestAssertions.assertTrue(workflow.success, 'Complete workflow should succeed');
        TestAssertions.assertTrue(workflow.duration > 0, 'Workflow should take some time');
        TestAssertions.assertEqual(workflow.errors.length, 0, 'Should have no errors');
        TestAssertions.assertTrue(workflow.steps.includes('project-analysis'), 'Should include project analysis');
        TestAssertions.assertTrue(workflow.steps.includes('content-generation'), 'Should include content generation');
        TestAssertions.assertTrue(workflow.steps.includes('website-building'), 'Should include website building');
    },

    async testWorkflowWithDeployment() {
        const workflow = await this.system.executeFullWorkflow(this.testProjectPath, {
            deploy: true,
            deployOptions: { platform: 'github-pages' }
        });
        
        TestAssertions.assertTrue(workflow.success, 'Workflow with deployment should succeed');
        TestAssertions.assertTrue(workflow.steps.includes('deployment'), 'Should include deployment step');
        TestAssertions.assertTrue(workflow.results.deployment.success, 'Deployment should succeed');
        TestAssertions.assertContains(workflow.results.deployment.data.url, 'github.io', 'Should have GitHub Pages URL');
    },

    async testWorkflowPerformance() {
        const startTime = Date.now();
        const workflow = await this.system.executeFullWorkflow(this.testProjectPath);
        const totalTime = Date.now() - startTime;
        
        TestAssertions.assertTrue(workflow.success, 'Performance test workflow should succeed');
        TestAssertions.assertTrue(totalTime < 10000, 'Complete workflow should finish within 10 seconds');
        TestAssertions.assertTrue(workflow.duration < totalTime, 'Recorded duration should be less than total time');
    },

    async testWorkflowWithInvalidProject() {
        const invalidPath = '/nonexistent/project/path';
        const workflow = await this.system.executeFullWorkflow(invalidPath);
        
        TestAssertions.assertFalse(workflow.success, 'Invalid project workflow should fail');
        TestAssertions.assertTrue(workflow.errors.length > 0, 'Should have errors');
        TestAssertions.assertContains(workflow.errors[0], 'Project analysis failed', 'Should fail at project analysis');
    },

    async testWorkflowStepResults() {
        const workflow = await this.system.executeFullWorkflow(this.testProjectPath);
        
        // 验证项目分析结果
        TestAssertions.assertTrue(workflow.results.analysis.success, 'Project analysis should succeed');
        TestAssertions.assertTrue(workflow.results.analysis.data.name.length > 0, 'Should have project name');
        
        // 验证内容生成结果
        TestAssertions.assertTrue(workflow.results.content.success, 'Content generation should succeed');
        TestAssertions.assertTrue(workflow.results.content.data.homepage !== undefined, 'Should have homepage content');
        TestAssertions.assertTrue(workflow.results.content.data.about !== undefined, 'Should have about content');
        
        // 验证网站构建结果
        TestAssertions.assertTrue(workflow.results.website.success, 'Website building should succeed');
        TestAssertions.assertTrue(fs.existsSync(workflow.results.website.data.outputDir), 'Website output directory should exist');
        TestAssertions.assertTrue(workflow.results.website.data.pages.homepage !== undefined, 'Should have homepage file');
    },

    async testWorkflowMonitoring() {
        const workflow = await this.system.executeFullWorkflow(this.testProjectPath);
        
        TestAssertions.assertTrue(workflow.results.monitoring.success, 'Monitoring should succeed');
        TestAssertions.assertTrue(workflow.results.monitoring.data.workflowId.length > 0, 'Should have workflow ID');
        TestAssertions.assertEqual(workflow.results.monitoring.data.duration, workflow.duration, 'Should record correct duration');
        TestAssertions.assertEqual(workflow.results.monitoring.data.success, workflow.success, 'Should record correct success status');
    },

    async testConcurrentWorkflows() {
        const workflows = await Promise.all([
            this.system.executeFullWorkflow(this.testProjectPath),
            this.system.executeFullWorkflow(this.testProjectPath),
            this.system.executeFullWorkflow(this.testProjectPath)
        ]);
        
        TestAssertions.assertEqual(workflows.length, 3, 'Should handle 3 concurrent workflows');
        
        for (let i = 0; i < workflows.length; i++) {
            TestAssertions.assertTrue(workflows[i].success, `Workflow ${i + 1} should succeed`);
            TestAssertions.assertTrue(workflows[i].duration > 0, `Workflow ${i + 1} should have positive duration`);
        }
    },

    async testWorkflowErrorRecovery() {
        // 模拟部分失败的工作流
        const originalAnalyzer = this.system.projectAnalyzer;
        this.system.projectAnalyzer = {
            analyzeProject: async () => ({
                success: false,
                error: 'Simulated analysis failure',
                data: null
            })
        };
        
        const workflow = await this.system.executeFullWorkflow(this.testProjectPath);
        
        TestAssertions.assertFalse(workflow.success, 'Workflow should fail when analysis fails');
        TestAssertions.assertTrue(workflow.errors.length > 0, 'Should record errors');
        TestAssertions.assertTrue(workflow.duration > 0, 'Should still record duration');
        
        // 恢复原始分析器
        this.system.projectAnalyzer = originalAnalyzer;
    },

    async testWorkflowWithCustomOptions() {
        const customOptions = {
            contentOptions: {
                tone: 'professional',
                includeCodeExamples: true
            },
            websiteOptions: {
                theme: 'technical',
                includeJS: true
            }
        };
        
        const workflow = await this.system.executeFullWorkflow(this.testProjectPath, customOptions);
        
        TestAssertions.assertTrue(workflow.success, 'Workflow with custom options should succeed');
        TestAssertions.assertTrue(workflow.results.website.data.assets !== undefined, 'Should have website assets');
    },

    async teardown() {
        // 清理测试生成的文件
        // 注意：在实际环境中需要更仔细的清理
    }
};

module.exports = endToEndTests;
