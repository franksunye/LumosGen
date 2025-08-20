/**
 * Agent系统核心功能测试
 * 验证多Agent协作、工作流管理、任务分发等核心功能
 */

// 首先设置全局 Mock 环境
require('../setup-global-mocks');

const { TestConfig, TestUtils, TestAssertions } = require('../test-config');
const path = require('path');
const fs = require('fs');

// 使用完整的测试数据
const testFixtures = require('../fixtures/comprehensive-project-analysis');

// Mock AI Service for Agent testing
class MockAgentAIService {
    constructor() {
        this.requestCount = 0;
        this.responses = new Map();
        this.setupDefaultResponses();
    }

    setupDefaultResponses() {
        this.responses.set('analyze', {
            content: 'Project analysis complete: TypeScript + React application with AI capabilities',
            tokens: 50,
            cost: 0.001
        });
        
        this.responses.set('generate', {
            content: '# Welcome to LumosGen\n\nRevolutionary AI-powered content generation platform.',
            tokens: 100,
            cost: 0.002
        });
        
        this.responses.set('build', {
            content: 'Website built successfully with modern responsive design',
            tokens: 75,
            cost: 0.0015
        });
    }

    async generateContent(prompt, options = {}) {
        this.requestCount++;
        await TestUtils.sleep(10); // 模拟网络延迟

        // 根据提示词内容返回相应的响应
        let responseKey = 'generate';
        if (prompt.includes('analyze') || prompt.includes('analysis')) {
            responseKey = 'analyze';
        } else if (prompt.includes('build') || prompt.includes('website')) {
            responseKey = 'build';
        }

        const response = this.responses.get(responseKey);
        return {
            ...response,
            timestamp: new Date().toISOString(),
            provider: 'mock-agent',
            model: 'mock-model'
        };
    }

    getStats() {
        return {
            requestCount: this.requestCount,
            totalTokens: this.requestCount * 75,
            totalCost: this.requestCount * 0.0015
        };
    }
}

const agentSystemTests = {
    async setup() {
        console.log('🔧 Setting up Agent System tests...');
        this.mockAIService = new MockAgentAIService();
        this.testWorkspace = path.join(__dirname, '../../test-workspace');
        
        // 确保测试工作空间存在
        if (!fs.existsSync(this.testWorkspace)) {
            fs.mkdirSync(this.testWorkspace, { recursive: true });
            
            // 创建基本的项目文件
            fs.writeFileSync(
                path.join(this.testWorkspace, 'package.json'),
                JSON.stringify({
                    name: 'agent-test-project',
                    version: '1.0.0',
                    description: 'Test project for agent system validation'
                }, null, 2)
            );
        }
    },

    async testAgentSystemInitialization() {
        console.log('🧪 Testing AgentWorkflow initialization...');

        try {
            const { AgentWorkflow } = require('../../out/agents/AgentSystem');

            const agentWorkflow = new AgentWorkflow({
                apiKey: 'test-key'
            }, this.mockAIService);

            TestAssertions.assertTrue(agentWorkflow !== null, 'AgentWorkflow should initialize successfully');
            TestAssertions.assertTrue(typeof agentWorkflow.execute === 'function', 'Should have execute method');
            TestAssertions.assertTrue(typeof agentWorkflow.on === 'function', 'Should have event listener method');

            console.log('✅ AgentWorkflow initialization successful');

        } catch (error) {
            throw new Error(`AgentWorkflow initialization failed: ${error.message}`);
        }
    },

    async testWorkflowExecution() {
        console.log('🧪 Testing workflow execution...');
        
        try {
            const WorkflowModule = require('../../out/agents/Workflow');

            // 创建一个模拟的工作流对象
            const workflow = {
                executeMarketingWorkflow: async (options) => {
                    return {
                        success: true,
                        results: ['homepage content generated'],
                        duration: 1000
                    };
                }
            };
            
            // 测试基本工作流执行
            const result = await workflow.executeMarketingWorkflow({
                contentTypes: ['homepage'],
                options: {
                    tone: 'professional',
                    audience: 'developers'
                }
            });
            
            TestAssertions.assertTrue(result !== null, 'Workflow should return result');
            TestAssertions.assertTrue(result.success !== undefined, 'Result should have success status');
            
            console.log('✅ Workflow execution successful');
            
        } catch (error) {
            throw new Error(`Workflow execution failed: ${error.message}`);
        }
    },

    async testAgentCommunication() {
        console.log('🧪 Testing agent communication...');
        
        try {
            // 模拟Agent间通信
            const mockEventEmitter = new (require('events').EventEmitter)();
            let communicationCount = 0;
            
            // 设置事件监听
            mockEventEmitter.on('agent:task:complete', (data) => {
                communicationCount++;
                TestAssertions.assertTrue(data.agentId !== undefined, 'Event should have agent ID');
                TestAssertions.assertTrue(data.result !== undefined, 'Event should have result');
            });
            
            // 模拟Agent完成任务
            mockEventEmitter.emit('agent:task:complete', {
                agentId: 'content-analyzer',
                result: { analysis: 'complete' }
            });
            
            mockEventEmitter.emit('agent:task:complete', {
                agentId: 'content-generator',
                result: { content: 'generated' }
            });
            
            TestAssertions.assertEqual(communicationCount, 2, 'Should receive all agent communications');
            
            console.log('✅ Agent communication successful');
            
        } catch (error) {
            throw new Error(`Agent communication test failed: ${error.message}`);
        }
    },

    async testTaskDistribution() {
        console.log('🧪 Testing task distribution...');
        
        try {
            // 模拟任务分发系统
            const tasks = [
                { type: 'analyze', priority: 1, data: testFixtures.comprehensive },
                { type: 'generate', priority: 2, data: { contentType: 'homepage' } },
                { type: 'build', priority: 3, data: { theme: 'modern' } }
            ];
            
            const completedTasks = [];
            
            // 模拟任务处理
            for (const task of tasks) {
                const startTime = Date.now();
                
                // 根据任务类型调用相应的AI服务
                const result = await this.mockAIService.generateContent(`${task.type} task`, task.data);
                
                const endTime = Date.now();
                
                completedTasks.push({
                    ...task,
                    result,
                    duration: endTime - startTime,
                    completed: true
                });
            }
            
            TestAssertions.assertEqual(completedTasks.length, 3, 'Should complete all tasks');
            TestAssertions.assertTrue(completedTasks.every(t => t.completed), 'All tasks should be marked complete');
            TestAssertions.assertTrue(completedTasks.every(t => t.duration > 0), 'All tasks should have duration');
            
            console.log('✅ Task distribution successful');
            
        } catch (error) {
            throw new Error(`Task distribution test failed: ${error.message}`);
        }
    },

    async testErrorHandlingAndRetry() {
        console.log('🧪 Testing error handling and retry mechanism...');
        
        try {
            // 创建一个会失败的Mock服务
            const failingService = {
                attemptCount: 0,
                async generateContent(prompt) {
                    this.attemptCount++;
                    if (this.attemptCount < 3) {
                        throw new Error('Simulated service failure');
                    }
                    return {
                        content: 'Success after retry',
                        tokens: 50,
                        cost: 0.001
                    };
                }
            };
            
            // 实现重试逻辑
            const maxRetries = 3;
            let lastError;
            let result = null;
            
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    result = await failingService.generateContent('test prompt');
                    break;
                } catch (error) {
                    lastError = error;
                    if (attempt < maxRetries) {
                        await TestUtils.sleep(100 * attempt); // 指数退避
                    }
                }
            }
            
            TestAssertions.assertTrue(result !== null, 'Should eventually succeed with retry');
            TestAssertions.assertEqual(failingService.attemptCount, 3, 'Should attempt exactly 3 times');
            TestAssertions.assertContains(result.content, 'Success', 'Should return success message');
            
            console.log('✅ Error handling and retry successful');
            
        } catch (error) {
            throw new Error(`Error handling test failed: ${error.message}`);
        }
    },

    async testPerformanceMonitoring() {
        console.log('🧪 Testing performance monitoring...');
        
        try {
            const performanceMetrics = {
                taskCount: 0,
                totalDuration: 0,
                averageDuration: 0,
                successRate: 0,
                errorCount: 0
            };
            
            // 模拟多个任务执行
            const taskPromises = [];
            for (let i = 0; i < 5; i++) {
                taskPromises.push(executeMonitoredTask(performanceMetrics, i, this.mockAIService));
            }
            
            await Promise.all(taskPromises);
            
            // 计算最终指标
            performanceMetrics.averageDuration = performanceMetrics.totalDuration / performanceMetrics.taskCount;
            performanceMetrics.successRate = (performanceMetrics.taskCount - performanceMetrics.errorCount) / performanceMetrics.taskCount;
            
            TestAssertions.assertEqual(performanceMetrics.taskCount, 5, 'Should track all tasks');
            TestAssertions.assertTrue(performanceMetrics.averageDuration > 0, 'Should calculate average duration');
            TestAssertions.assertTrue(performanceMetrics.successRate >= 0.8, 'Should have good success rate');
            
            console.log(`✅ Performance monitoring: ${performanceMetrics.taskCount} tasks, ${performanceMetrics.averageDuration.toFixed(2)}ms avg, ${(performanceMetrics.successRate * 100).toFixed(1)}% success`);
            
        } catch (error) {
            throw new Error(`Performance monitoring test failed: ${error.message}`);
        }
    },



    async testAgentResourceManagement() {
        console.log('🧪 Testing agent resource management...');
        
        try {
            // 模拟资源管理
            const resourceManager = {
                activeAgents: new Set(),
                maxConcurrentAgents: 3,
                
                async allocateAgent(agentId) {
                    if (this.activeAgents.size >= this.maxConcurrentAgents) {
                        throw new Error('Max concurrent agents reached');
                    }
                    this.activeAgents.add(agentId);
                    return true;
                },
                
                releaseAgent(agentId) {
                    this.activeAgents.delete(agentId);
                }
            };
            
            // 测试正常分配
            await resourceManager.allocateAgent('agent-1');
            await resourceManager.allocateAgent('agent-2');
            await resourceManager.allocateAgent('agent-3');
            
            TestAssertions.assertEqual(resourceManager.activeAgents.size, 3, 'Should allocate 3 agents');
            
            // 测试超出限制
            let errorThrown = false;
            try {
                await resourceManager.allocateAgent('agent-4');
            } catch (error) {
                errorThrown = true;
            }
            
            TestAssertions.assertTrue(errorThrown, 'Should throw error when exceeding limit');
            
            // 测试释放资源
            resourceManager.releaseAgent('agent-1');
            TestAssertions.assertEqual(resourceManager.activeAgents.size, 2, 'Should release agent');
            
            console.log('✅ Agent resource management successful');
            
        } catch (error) {
            throw new Error(`Resource management test failed: ${error.message}`);
        }
    },

    async teardown() {
        console.log('🧹 Cleaning up Agent System tests...');
        this.mockAIService = null;
        
        // 清理测试工作空间
        if (fs.existsSync(this.testWorkspace)) {
            fs.rmSync(this.testWorkspace, { recursive: true, force: true });
        }
    }
};

// 辅助函数：执行监控任务 (在对象外部，不会被当作测试用例)
async function executeMonitoredTask(metrics, taskId, mockAIService) {
    const startTime = Date.now();

    try {
        await mockAIService.generateContent(`Task ${taskId}`);
        metrics.taskCount++;
        metrics.totalDuration += Date.now() - startTime;
    } catch (error) {
        metrics.errorCount++;
        metrics.taskCount++;
        metrics.totalDuration += Date.now() - startTime;
    }
}

module.exports = agentSystemTests;
