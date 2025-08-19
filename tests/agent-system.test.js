/**
 * Agent System 测试
 * 测试重构后的Agent系统功能
 */

const fs = require('fs');
const path = require('path');
const { TestConfig, TestUtils, TestAssertions } = require('./test-config');

const config = new TestConfig();

// Mock VS Code环境
const mockVSCode = {
    window: {
        createOutputChannel: (name) => ({
            appendLine: (message) => console.log(`[${name}] ${message}`),
            append: (message) => console.log(message),
            clear: () => {},
            dispose: () => {},
            hide: () => {},
            show: () => {},
            name
        })
    },
    workspace: {
        rootPath: config.getTestProjectPath()
    }
};

// Mock AI Service
class MockAIService {
    async generateContent(request) {
        await TestUtils.sleep(100); // 模拟网络延迟
        
        return {
            content: `Mock AI response for: ${request.messages[1].content.substring(0, 50)}...`,
            usage: {
                promptTokens: 100,
                completionTokens: 200,
                totalTokens: 300
            }
        };
    }
}

// 测试AgentWorkflow基础功能
async function testAgentWorkflowBasics() {
    console.log('🔍 Testing AgentWorkflow basics...');
    
    try {
        // 动态导入编译后的模块
        const AgentSystemPath = path.join(config.projectRoot, 'out/agents/AgentSystem.js');
        
        if (!fs.existsSync(AgentSystemPath)) {
            console.log('⚠️ Compiled AgentSystem.js not found, skipping runtime test');
            return;
        }
        
        const { AgentWorkflow, BaseAgent } = require(AgentSystemPath);
        
        // 创建测试Agent
        class TestAgent extends BaseAgent {
            constructor() {
                super('TestAgent', 'Test Role', 'Test Goal', 'Test Background');
            }
            
            async execute(input, context) {
                return {
                    success: true,
                    data: { message: 'Test successful', input },
                    metadata: { agent: this.name }
                };
            }
        }
        
        // 创建工作流
        const workflow = new AgentWorkflow({
            apiKey: 'test-key',
            timeout: 5000
        }, new MockAIService());
        
        // 注册Agent
        const testAgent = new TestAgent();
        workflow.addAgent(testAgent);
        
        // 添加任务
        workflow.addTask({
            id: 'test-task',
            agentName: 'TestAgent',
            description: 'Test task',
            input: { testData: 'hello' },
            dependencies: []
        });
        
        // 执行工作流
        const results = await workflow.execute({ initialData: 'test' });
        
        TestAssertions.assertTrue(
            results instanceof Map,
            'Workflow should return a Map of results'
        );
        
        TestAssertions.assertTrue(
            results.has('test-task'),
            'Results should contain test-task'
        );
        
        const taskResult = results.get('test-task');
        TestAssertions.assertEqual(
            taskResult.success,
            true,
            'Task should succeed'
        );
        
        console.log('✅ AgentWorkflow basic functionality works');
        
    } catch (error) {
        throw new Error(`AgentWorkflow test failed: ${error.message}`);
    }
}

// 测试Agent文件加载
async function testAgentFileLoading() {
    console.log('🔍 Testing agent file loading...');
    
    const agentFiles = [
        'ContentAnalyzerAgent.js',
        'ContentGeneratorAgent.js',
        'WebsiteBuilderAgent.js'
    ];
    
    for (const agentFile of agentFiles) {
        const agentPath = path.join(config.projectRoot, 'out/agents', agentFile);
        
        if (fs.existsSync(agentPath)) {
            try {
                const agentModule = require(agentPath);
                const expectedClassName = path.basename(agentFile, '.js');
                
                TestAssertions.assertTrue(
                    typeof agentModule[expectedClassName] === 'function',
                    `${expectedClassName} should be exported as a constructor function`
                );
                
                console.log(`✅ ${expectedClassName} loads successfully`);
            } catch (error) {
                throw new Error(`Failed to load ${agentFile}: ${error.message}`);
            }
        } else {
            console.log(`⚠️ ${agentFile} not found in compiled output, skipping`);
        }
    }
}

// 测试Workflow系统
async function testWorkflowSystem() {
    console.log('🔍 Testing Workflow system...');
    
    try {
        const WorkflowPath = path.join(config.projectRoot, 'out/agents/Workflow.js');
        
        if (!fs.existsSync(WorkflowPath)) {
            console.log('⚠️ Compiled Workflow.js not found, skipping runtime test');
            return;
        }
        
        const { LumosGenWorkflow, MarketingWorkflowManager } = require(WorkflowPath);
        
        // 测试LumosGenWorkflow构造
        TestAssertions.assertTrue(
            typeof LumosGenWorkflow === 'function',
            'LumosGenWorkflow should be a constructor function'
        );
        
        // 测试MarketingWorkflowManager构造
        TestAssertions.assertTrue(
            typeof MarketingWorkflowManager === 'function',
            'MarketingWorkflowManager should be a constructor function'
        );
        
        // 创建工作流管理器实例
        const manager = new MarketingWorkflowManager('test-key', new MockAIService());
        
        TestAssertions.assertTrue(
            typeof manager.initialize === 'function',
            'MarketingWorkflowManager should have initialize method'
        );
        
        TestAssertions.assertTrue(
            typeof manager.generateContent === 'function',
            'MarketingWorkflowManager should have generateContent method'
        );
        
        console.log('✅ Workflow system loads successfully');
        
    } catch (error) {
        throw new Error(`Workflow system test failed: ${error.message}`);
    }
}

// 测试Agent依赖注入
async function testAgentDependencyInjection() {
    console.log('🔍 Testing agent dependency injection...');
    
    try {
        const AgentSystemPath = path.join(config.projectRoot, 'out/agents/AgentSystem.js');
        
        if (!fs.existsSync(AgentSystemPath)) {
            console.log('⚠️ Compiled AgentSystem.js not found, skipping runtime test');
            return;
        }
        
        const { createLumosGenWorkflow } = require(AgentSystemPath);
        
        // 测试工厂函数
        TestAssertions.assertTrue(
            typeof createLumosGenWorkflow === 'function',
            'createLumosGenWorkflow should be a function'
        );
        
        const workflow = createLumosGenWorkflow('test-key', new MockAIService());
        
        TestAssertions.assertTrue(
            workflow !== null && typeof workflow === 'object',
            'createLumosGenWorkflow should return a workflow object'
        );
        
        console.log('✅ Agent dependency injection works');
        
    } catch (error) {
        throw new Error(`Dependency injection test failed: ${error.message}`);
    }
}

// 测试错误处理
async function testErrorHandling() {
    console.log('🔍 Testing error handling...');
    
    try {
        const AgentSystemPath = path.join(config.projectRoot, 'out/agents/AgentSystem.js');
        
        if (!fs.existsSync(AgentSystemPath)) {
            console.log('⚠️ Compiled AgentSystem.js not found, skipping runtime test');
            return;
        }
        
        const { AgentWorkflow, BaseAgent } = require(AgentSystemPath);
        
        // 创建会失败的Agent
        class FailingAgent extends BaseAgent {
            constructor() {
                super('FailingAgent', 'Failing Role', 'Fail Goal', 'Fail Background');
            }
            
            async execute(input, context) {
                throw new Error('Intentional test failure');
            }
        }
        
        const workflow = new AgentWorkflow({
            apiKey: 'test-key',
            timeout: 5000
        });
        
        workflow.addAgent(new FailingAgent());
        workflow.addTask({
            id: 'failing-task',
            agentName: 'FailingAgent',
            description: 'Task that should fail',
            input: {},
            dependencies: []
        });
        
        const results = await workflow.execute();
        const taskResult = results.get('failing-task');
        
        TestAssertions.assertEqual(
            taskResult.success,
            false,
            'Failing task should have success: false'
        );
        
        TestAssertions.assertTrue(
            taskResult.error.includes('Intentional test failure'),
            'Error message should be preserved'
        );
        
        console.log('✅ Error handling works correctly');
        
    } catch (error) {
        throw new Error(`Error handling test failed: ${error.message}`);
    }
}

// 导出测试套件
module.exports = {
    setup: async () => {
        console.log('🔧 Setting up Agent System tests...');
        
        // 确保测试项目目录存在
        const testProjectPath = config.getTestProjectPath();
        if (!fs.existsSync(testProjectPath)) {
            fs.mkdirSync(testProjectPath, { recursive: true });
        }
    },
    
    teardown: async () => {
        console.log('🧹 Cleaning up Agent System tests...');
    },
    
    testAgentWorkflowBasics,
    testAgentFileLoading,
    testWorkflowSystem,
    testAgentDependencyInjection,
    testErrorHandling
};
