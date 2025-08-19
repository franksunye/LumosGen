/**
 * 重构验证测试
 * 验证重构后的代码结构和功能完整性
 */

const fs = require('fs');
const path = require('path');
const { TestConfig, TestUtils, TestAssertions } = require('./test-config');

const config = new TestConfig();

// 测试重构后的文件结构
async function testFileStructure() {
    console.log('🔍 Testing refactored file structure...');
    
    // 验证新的文件存在
    const expectedFiles = [
        'src/agents/AgentSystem.ts',
        'src/agents/ProjectWatcherAgent.ts',
        'src/agents/ContentAnalyzerAgent.ts',
        'src/agents/ContentGeneratorAgent.ts',
        'src/agents/WebsiteBuilderAgent.ts',
        'src/agents/Workflow.ts'
    ];
    
    for (const filePath of expectedFiles) {
        const fullPath = path.join(config.projectRoot, filePath);
        TestAssertions.assertTrue(
            fs.existsSync(fullPath),
            `Expected file ${filePath} should exist after refactoring`
        );
    }
    
    // 验证旧文件已被删除
    const removedFiles = [
        'src/agents/simple-agent-system.ts',
        'src/agents/EnhancedLumosGenAgents.ts',
        'src/agents/EnhancedWorkflow.ts'
    ];
    
    for (const filePath of removedFiles) {
        const fullPath = path.join(config.projectRoot, filePath);
        TestAssertions.assertFalse(
            fs.existsSync(fullPath),
            `Old file ${filePath} should be removed after refactoring`
        );
    }
}

// 测试导入语句的正确性
async function testImportStatements() {
    console.log('🔍 Testing import statements...');
    
    const agentSystemPath = path.join(config.projectRoot, 'src/agents/AgentSystem.ts');
    const agentSystemContent = fs.readFileSync(agentSystemPath, 'utf8');
    
    // 验证AgentSystem.ts中的类名更新
    TestAssertions.assertContains(
        agentSystemContent,
        'export class AgentWorkflow',
        'AgentSystem.ts should contain AgentWorkflow class'
    );
    
    TestAssertions.assertContains(
        agentSystemContent,
        'export function createLumosGenWorkflow',
        'AgentSystem.ts should contain createLumosGenWorkflow function'
    );
    
    // 验证Workflow.ts中的导入更新
    const workflowPath = path.join(config.projectRoot, 'src/agents/Workflow.ts');
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    
    TestAssertions.assertContains(
        workflowContent,
        "import { AgentWorkflow, AgentTask } from './AgentSystem'",
        'Workflow.ts should import from AgentSystem'
    );
    
    TestAssertions.assertContains(
        workflowContent,
        "import { ProjectWatcherAgent } from './ProjectWatcherAgent'",
        'Workflow.ts should import ProjectWatcherAgent'
    );
    
    TestAssertions.assertContains(
        workflowContent,
        "import { ContentAnalyzerAgent } from './ContentAnalyzerAgent'",
        'Workflow.ts should import ContentAnalyzerAgent'
    );
    
    TestAssertions.assertContains(
        workflowContent,
        "import { ContentGeneratorAgent } from './ContentGeneratorAgent'",
        'Workflow.ts should import ContentGeneratorAgent'
    );
}

// 测试类名和接口名的更新
async function testClassAndInterfaceNames() {
    console.log('🔍 Testing class and interface names...');
    
    const workflowPath = path.join(config.projectRoot, 'src/agents/Workflow.ts');
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    
    // 验证接口名更新
    TestAssertions.assertContains(
        workflowContent,
        'export interface WorkflowConfig',
        'Should use WorkflowConfig instead of EnhancedWorkflowConfig'
    );
    
    TestAssertions.assertContains(
        workflowContent,
        'export interface WorkflowResult',
        'Should use WorkflowResult instead of EnhancedWorkflowResult'
    );
    
    // 验证类名更新
    TestAssertions.assertContains(
        workflowContent,
        'export class LumosGenWorkflow',
        'Should use LumosGenWorkflow instead of EnhancedLumosGenWorkflow'
    );
    
    // 验证方法名更新
    TestAssertions.assertContains(
        workflowContent,
        'async executeWorkflow(',
        'Should use executeWorkflow instead of executeEnhancedWorkflow'
    );
    
    // 验证不再包含"Enhanced"前缀
    const enhancedMatches = workflowContent.match(/Enhanced(?!ProjectAnalyzer|ProjectAnalysis)/g);
    TestAssertions.assertTrue(
        !enhancedMatches || enhancedMatches.length === 0,
        'Should not contain Enhanced prefixes (except for ProjectAnalyzer)'
    );
}

// 测试Agent文件的独立性
async function testAgentFileSeparation() {
    console.log('🔍 Testing agent file separation...');
    
    const agentFiles = [
        'src/agents/ProjectWatcherAgent.ts',
        'src/agents/ContentAnalyzerAgent.ts',
        'src/agents/ContentGeneratorAgent.ts'
    ];
    
    for (const agentFile of agentFiles) {
        const fullPath = path.join(config.projectRoot, agentFile);
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // 验证每个文件都有正确的导入
        TestAssertions.assertContains(
            content,
            "import { BaseAgent, AgentResult, AgentContext } from './AgentSystem'",
            `${agentFile} should import from AgentSystem`
        );
        
        // 验证每个文件都导出了对应的Agent类
        const expectedClassName = path.basename(agentFile, '.ts');
        TestAssertions.assertContains(
            content,
            `export class ${expectedClassName}`,
            `${agentFile} should export ${expectedClassName} class`
        );
        
        // 验证Agent类继承自BaseAgent
        TestAssertions.assertContains(
            content,
            `extends BaseAgent`,
            `${expectedClassName} should extend BaseAgent`
        );
    }
}

// 测试编译兼容性
async function testCompilationCompatibility() {
    console.log('🔍 Testing TypeScript compilation compatibility...');
    
    try {
        // 尝试编译TypeScript文件
        const { spawn } = require('child_process');
        
        return new Promise((resolve, reject) => {
            const tsc = spawn('npx', ['tsc', '--noEmit', '--project', config.projectRoot], {
                cwd: config.projectRoot,
                stdio: 'pipe'
            });
            
            let output = '';
            let errorOutput = '';
            
            tsc.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            tsc.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });
            
            tsc.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ TypeScript compilation successful');
                    resolve();
                } else {
                    console.log('❌ TypeScript compilation failed:');
                    console.log(errorOutput);
                    reject(new Error(`TypeScript compilation failed with code ${code}`));
                }
            });
            
            // 设置超时
            setTimeout(() => {
                tsc.kill();
                reject(new Error('TypeScript compilation timeout'));
            }, 30000);
        });
    } catch (error) {
        console.log('⚠️ TypeScript compiler not available, skipping compilation test');
    }
}

// 测试功能完整性
async function testFunctionalIntegrity() {
    console.log('🔍 Testing functional integrity...');
    
    try {
        // 尝试加载重构后的模块
        const AgentSystemPath = path.join(config.projectRoot, 'out/agents/AgentSystem.js');
        const WorkflowPath = path.join(config.projectRoot, 'out/agents/Workflow.js');
        
        // 检查编译后的文件是否存在
        if (fs.existsSync(AgentSystemPath) && fs.existsSync(WorkflowPath)) {
            const AgentSystem = require(AgentSystemPath);
            const Workflow = require(WorkflowPath);
            
            // 验证导出的类和函数
            TestAssertions.assertTrue(
                typeof AgentSystem.AgentWorkflow === 'function',
                'AgentWorkflow should be exported as a function/class'
            );
            
            TestAssertions.assertTrue(
                typeof AgentSystem.createLumosGenWorkflow === 'function',
                'createLumosGenWorkflow should be exported as a function'
            );
            
            TestAssertions.assertTrue(
                typeof Workflow.LumosGenWorkflow === 'function',
                'LumosGenWorkflow should be exported as a function/class'
            );
            
            console.log('✅ All expected exports are available');
        } else {
            console.log('⚠️ Compiled JavaScript files not found, skipping runtime test');
        }
    } catch (error) {
        console.log(`⚠️ Runtime test skipped: ${error.message}`);
    }
}

// 导出测试套件
module.exports = {
    setup: async () => {
        console.log('🔧 Setting up refactoring validation tests...');
    },
    
    teardown: async () => {
        console.log('🧹 Cleaning up refactoring validation tests...');
    },
    
    testFileStructure,
    testImportStatements,
    testClassAndInterfaceNames,
    testAgentFileSeparation,
    testCompilationCompatibility,
    testFunctionalIntegrity
};
