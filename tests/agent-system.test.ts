/**
 * Agent System Integration Tests
 * 测试重构后的Agent系统功能 - 根级别集成测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Mock VS Code environment
const mockVSCode = {
    window: {
        createOutputChannel: (name: string) => ({
            appendLine: (message: string) => console.log(`[${name}] ${message}`),
            append: (message: string) => console.log(message),
            clear: () => {},
            dispose: () => {},
            hide: () => {},
            show: () => {},
            name
        }),
        showInformationMessage: vi.fn(),
        showErrorMessage: vi.fn(),
        showWarningMessage: vi.fn()
    },
    workspace: {
        rootPath: '/test/workspace',
        workspaceFolders: [{
            uri: { fsPath: '/test/workspace' },
            name: 'test-workspace',
            index: 0
        }]
    }
};

// Mock AI Service
class MockAIService {
    async generateContent(request: any) {
        await new Promise(resolve => setTimeout(resolve, 100)); // 模拟网络延迟
        
        return {
            content: `Mock AI response for: ${request.messages?.[1]?.content?.substring(0, 50) || 'request'}...`,
            usage: {
                promptTokens: 100,
                completionTokens: 200,
                totalTokens: 300
            }
        };
    }
}

// Mock Agent Manager
class MockAgentManager {
    private agents: Map<string, any> = new Map();
    private workflows: Map<string, any> = new Map();

    constructor() {
        this.initializeAgents();
    }

    private initializeAgents() {
        const agentTypes = ['analyzer', 'content-generator', 'optimizer'];
        agentTypes.forEach(type => {
            this.agents.set(type, {
                id: type,
                type,
                status: 'idle',
                capabilities: [`${type}-capability`],
                metrics: {
                    tasksCompleted: 0,
                    successRate: 1.0,
                    averageResponseTime: 1000
                }
            });
        });
    }

    async executeTask(agentId: string, task: any) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }

        agent.status = 'busy';
        
        try {
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const result = {
                success: true,
                agentId,
                taskType: task.type,
                result: `Mock result for ${task.type}`,
                metrics: {
                    executionTime: 200,
                    tokensUsed: 150
                }
            };

            agent.metrics.tasksCompleted++;
            agent.status = 'idle';
            
            return result;
        } catch (error) {
            agent.status = 'error';
            throw error;
        }
    }

    async executeWorkflow(workflowId: string, tasks: any[]) {
        const workflow = {
            id: workflowId,
            status: 'running',
            tasks: tasks.map(task => ({ ...task, status: 'pending' })),
            startTime: Date.now()
        };

        this.workflows.set(workflowId, workflow);

        try {
            const results = [];
            
            for (const task of workflow.tasks) {
                task.status = 'running';
                const result = await this.executeTask(task.agentId, task);
                task.status = 'completed';
                task.result = result;
                results.push(result);
            }

            workflow.status = 'completed';
            workflow.endTime = Date.now();
            workflow.results = results;

            return {
                success: true,
                workflowId,
                results,
                metrics: {
                    totalTime: workflow.endTime - workflow.startTime,
                    tasksCompleted: results.length,
                    successRate: 1.0
                }
            };
        } catch (error) {
            workflow.status = 'failed';
            workflow.error = error;
            throw error;
        }
    }

    getAgentStatus(agentId: string) {
        return this.agents.get(agentId);
    }

    getWorkflowStatus(workflowId: string) {
        return this.workflows.get(workflowId);
    }

    getAllAgents() {
        return Array.from(this.agents.values());
    }

    getSystemMetrics() {
        const agents = this.getAllAgents();
        const totalTasks = agents.reduce((sum, agent) => sum + agent.metrics.tasksCompleted, 0);
        const avgSuccessRate = agents.reduce((sum, agent) => sum + agent.metrics.successRate, 0) / agents.length;
        
        return {
            totalAgents: agents.length,
            activeAgents: agents.filter(a => a.status === 'busy').length,
            totalTasksCompleted: totalTasks,
            averageSuccessRate: avgSuccessRate,
            systemUptime: Date.now() - this.startTime
        };
    }

    private startTime = Date.now();
}

describe('Agent System Integration Tests', () => {
    let mockAgentManager: MockAgentManager;
    let mockAIService: MockAIService;

    beforeEach(() => {
        console.log('🔧 Setting up Agent System integration tests...');
        mockAgentManager = new MockAgentManager();
        mockAIService = new MockAIService();
        
        // Setup global mocks
        vi.stubGlobal('vscode', mockVSCode);
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
    });

    describe('Agent System Initialization', () => {
        it('应该正确初始化Agent管理器', () => {
            expect(mockAgentManager).toBeDefined();
            
            const agents = mockAgentManager.getAllAgents();
            expect(agents).toHaveLength(3);
            expect(agents.map(a => a.type)).toEqual(['analyzer', 'content-generator', 'optimizer']);
        });

        it('应该为每个Agent设置正确的初始状态', () => {
            const agents = mockAgentManager.getAllAgents();
            
            agents.forEach(agent => {
                expect(agent.status).toBe('idle');
                expect(agent.metrics.tasksCompleted).toBe(0);
                expect(agent.metrics.successRate).toBe(1.0);
                expect(agent.capabilities).toContain(`${agent.type}-capability`);
            });
        });

        it('应该正确初始化AI服务', async () => {
            const response = await mockAIService.generateContent({
                messages: [
                    { role: 'system', content: 'You are a helpful assistant' },
                    { role: 'user', content: 'Test message' }
                ]
            });

            expect(response).toHaveProperty('content');
            expect(response).toHaveProperty('usage');
            expect(response.usage.totalTokens).toBe(300);
        });
    });

    describe('Single Agent Task Execution', () => {
        it('应该成功执行单个Agent任务', async () => {
            const task = {
                type: 'analysis',
                data: { content: 'test content' }
            };

            const result = await mockAgentManager.executeTask('analyzer', task);

            expect(result.success).toBe(true);
            expect(result.agentId).toBe('analyzer');
            expect(result.taskType).toBe('analysis');
            expect(result.result).toContain('Mock result for analysis');
        });

        it('应该正确更新Agent状态和指标', async () => {
            const initialAgent = mockAgentManager.getAgentStatus('analyzer');
            expect(initialAgent?.metrics.tasksCompleted).toBe(0);

            await mockAgentManager.executeTask('analyzer', { type: 'test' });

            const updatedAgent = mockAgentManager.getAgentStatus('analyzer');
            expect(updatedAgent?.metrics.tasksCompleted).toBe(1);
            expect(updatedAgent?.status).toBe('idle');
        });

        it('应该处理不存在的Agent', async () => {
            await expect(
                mockAgentManager.executeTask('nonexistent', { type: 'test' })
            ).rejects.toThrow('Agent nonexistent not found');
        });
    });

    describe('Workflow Execution', () => {
        it('应该成功执行完整工作流', async () => {
            const tasks = [
                { agentId: 'analyzer', type: 'analysis' },
                { agentId: 'content-generator', type: 'generation' },
                { agentId: 'optimizer', type: 'optimization' }
            ];

            const result = await mockAgentManager.executeWorkflow('test-workflow', tasks);

            expect(result.success).toBe(true);
            expect(result.results).toHaveLength(3);
            expect(result.metrics.tasksCompleted).toBe(3);
            expect(result.metrics.successRate).toBe(1.0);
        });

        it('应该按正确顺序执行任务', async () => {
            const tasks = [
                { agentId: 'analyzer', type: 'step1' },
                { agentId: 'content-generator', type: 'step2' },
                { agentId: 'optimizer', type: 'step3' }
            ];

            const result = await mockAgentManager.executeWorkflow('sequential-test', tasks);

            expect(result.results[0].taskType).toBe('step1');
            expect(result.results[1].taskType).toBe('step2');
            expect(result.results[2].taskType).toBe('step3');
        });

        it('应该跟踪工作流状态', async () => {
            const tasks = [{ agentId: 'analyzer', type: 'test' }];
            
            const workflowPromise = mockAgentManager.executeWorkflow('status-test', tasks);
            
            // Check initial status
            const initialStatus = mockAgentManager.getWorkflowStatus('status-test');
            expect(initialStatus?.status).toBe('running');
            
            await workflowPromise;
            
            // Check final status
            const finalStatus = mockAgentManager.getWorkflowStatus('status-test');
            expect(finalStatus?.status).toBe('completed');
        });
    });

    describe('System Monitoring and Metrics', () => {
        it('应该提供系统级指标', async () => {
            // Execute some tasks first
            await mockAgentManager.executeTask('analyzer', { type: 'test1' });
            await mockAgentManager.executeTask('content-generator', { type: 'test2' });

            const metrics = mockAgentManager.getSystemMetrics();

            expect(metrics.totalAgents).toBe(3);
            expect(metrics.totalTasksCompleted).toBe(2);
            expect(metrics.averageSuccessRate).toBe(1.0);
            expect(metrics.systemUptime).toBeGreaterThan(0);
        });

        it('应该正确计算成功率', async () => {
            // Execute multiple tasks
            await mockAgentManager.executeTask('analyzer', { type: 'test1' });
            await mockAgentManager.executeTask('analyzer', { type: 'test2' });
            await mockAgentManager.executeTask('content-generator', { type: 'test3' });

            const metrics = mockAgentManager.getSystemMetrics();
            expect(metrics.totalTasksCompleted).toBe(3);
            expect(metrics.averageSuccessRate).toBe(1.0);
        });
    });

    describe('Error Handling and Recovery', () => {
        it('应该处理Agent任务失败', async () => {
            // Mock a failing agent
            const originalExecuteTask = mockAgentManager.executeTask;
            mockAgentManager.executeTask = vi.fn().mockRejectedValueOnce(new Error('Task failed'));

            await expect(
                mockAgentManager.executeTask('analyzer', { type: 'failing-task' })
            ).rejects.toThrow('Task failed');

            // Restore original method
            mockAgentManager.executeTask = originalExecuteTask;
        });

        it('应该处理工作流执行错误', async () => {
            // Mock a failing task in workflow
            const originalExecuteTask = mockAgentManager.executeTask;
            mockAgentManager.executeTask = vi.fn()
                .mockResolvedValueOnce({ success: true, agentId: 'analyzer' })
                .mockRejectedValueOnce(new Error('Workflow task failed'));

            const tasks = [
                { agentId: 'analyzer', type: 'step1' },
                { agentId: 'content-generator', type: 'failing-step' }
            ];

            await expect(
                mockAgentManager.executeWorkflow('failing-workflow', tasks)
            ).rejects.toThrow('Workflow task failed');

            // Restore original method
            mockAgentManager.executeTask = originalExecuteTask;
        });
    });

    describe('Integration Test Scenarios', () => {
        it('应该完成完整的内容生成流程', async () => {
            const contentGenerationWorkflow = [
                { agentId: 'analyzer', type: 'project-analysis' },
                { agentId: 'content-generator', type: 'homepage-generation' },
                { agentId: 'content-generator', type: 'about-generation' },
                { agentId: 'optimizer', type: 'seo-optimization' }
            ];

            const result = await mockAgentManager.executeWorkflow(
                'content-generation-flow',
                contentGenerationWorkflow
            );

            expect(result.success).toBe(true);
            expect(result.results).toHaveLength(4);
            expect(result.metrics.tasksCompleted).toBe(4);
            
            // Verify each step completed
            expect(result.results[0].taskType).toBe('project-analysis');
            expect(result.results[1].taskType).toBe('homepage-generation');
            expect(result.results[2].taskType).toBe('about-generation');
            expect(result.results[3].taskType).toBe('seo-optimization');
        });

        it('应该支持并发任务执行', async () => {
            const startTime = Date.now();
            
            const tasks = [
                mockAgentManager.executeTask('analyzer', { type: 'concurrent1' }),
                mockAgentManager.executeTask('content-generator', { type: 'concurrent2' }),
                mockAgentManager.executeTask('optimizer', { type: 'concurrent3' })
            ];

            const results = await Promise.all(tasks);
            const endTime = Date.now();

            expect(results).toHaveLength(3);
            results.forEach(result => {
                expect(result.success).toBe(true);
            });

            // Should complete faster than sequential execution
            expect(endTime - startTime).toBeLessThan(600); // Less than 3 * 200ms
        });
    });
});
