/**
 * Agent System Extended Tests - 扩展Agent系统测试覆盖率
 * 
 * 深度测试Agent系统的各个组件，包括工作流、任务调度、错误处理等
 */

import { describe, it, expect, beforeEach, vi, beforeAll, afterEach } from 'vitest'

// 导入VS Code Mock和真实源码
import { setupVSCodeMock, defaultTestConfig } from '../mocks/vscode-mock'
import { AgentWorkflow, BaseAgent } from '../../src/agents/AgentSystem'
import { MarketingWorkflowManager } from '../../src/agents/Workflow'

describe('Agent System Extended Tests', () => {
  let vscode: any
  let mockOutputChannel: any

  beforeAll(() => {
    console.log('🧪 Starting Agent System Extended Tests')
  })

  beforeEach(() => {
    // 设置VS Code Mock环境
    vscode = setupVSCodeMock(defaultTestConfig)
    
    // 创建Mock输出通道
    mockOutputChannel = {
      appendLine: vi.fn(),
      show: vi.fn(),
      clear: vi.fn()
    }
  })

  afterEach(() => {
    // 清理
    vi.clearAllMocks()
  })

  describe('BaseAgent 深度测试', () => {
    let baseAgent: BaseAgent

    beforeEach(() => {
      baseAgent = new BaseAgent('test-agent', ['analysis'], 1)
    })

    it('应该正确初始化BaseAgent', () => {
      expect(baseAgent).toBeDefined()
      expect(baseAgent.id).toBe('test-agent')
      expect(baseAgent.capabilities).toEqual(['analysis'])
      expect(baseAgent.priority).toBe(1)
      expect(baseAgent.status).toBe('idle')
    })

    it('应该能够执行基本任务', async () => {
      const task = {
        id: 'task-1',
        type: 'analysis',
        data: { test: 'data' },
        priority: 1
      }

      const result = await baseAgent.executeTask(task)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })

    it('应该能够处理任务执行错误', async () => {
      const invalidTask = {
        id: 'invalid-task',
        type: 'invalid-type',
        data: null,
        priority: 1
      }

      const result = await baseAgent.executeTask(invalidTask)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('应该能够更新Agent状态', () => {
      expect(baseAgent.status).toBe('idle')
      
      baseAgent.updateStatus('busy')
      expect(baseAgent.status).toBe('busy')
      
      baseAgent.updateStatus('idle')
      expect(baseAgent.status).toBe('idle')
    })

    it('应该能够检查Agent能力', () => {
      expect(baseAgent.canHandle('analysis')).toBe(true)
      expect(baseAgent.canHandle('content-generation')).toBe(false)
      expect(baseAgent.canHandle('deployment')).toBe(false)
    })

    it('应该能够获取Agent性能指标', () => {
      const metrics = baseAgent.getMetrics()
      
      expect(metrics).toBeDefined()
      expect(metrics).toHaveProperty('tasksCompleted')
      expect(metrics).toHaveProperty('tasksSuccessful')
      expect(metrics).toHaveProperty('tasksFailed')
      expect(metrics).toHaveProperty('averageExecutionTime')
      expect(metrics).toHaveProperty('successRate')
    })

    it('应该能够重置Agent状态', () => {
      // 执行一些任务来改变状态
      baseAgent.updateStatus('busy')
      
      baseAgent.reset()
      
      expect(baseAgent.status).toBe('idle')
      const metrics = baseAgent.getMetrics()
      expect(metrics.tasksCompleted).toBe(0)
    })
  })

  describe('AgentWorkflow 深度测试', () => {
    let agentWorkflow: AgentWorkflow

    beforeEach(() => {
      agentWorkflow = new AgentWorkflow()
    })

    it('应该正确初始化AgentWorkflow', () => {
      expect(agentWorkflow).toBeDefined()
      expect(agentWorkflow.getAgents()).toHaveLength(0)
      expect(agentWorkflow.getTasks()).toHaveLength(0)
    })

    it('应该能够添加Agent', () => {
      const agent = new BaseAgent('test-agent', ['analysis'], 1)
      
      agentWorkflow.addAgent(agent)
      
      expect(agentWorkflow.getAgents()).toHaveLength(1)
      expect(agentWorkflow.getAgents()[0]).toBe(agent)
    })

    it('应该能够添加任务', () => {
      const task = {
        id: 'task-1',
        type: 'analysis',
        data: { test: 'data' },
        priority: 1
      }
      
      agentWorkflow.addTask(task)
      
      expect(agentWorkflow.getTasks()).toHaveLength(1)
      expect(agentWorkflow.getTasks()[0]).toBe(task)
    })

    it('应该能够执行工作流', async () => {
      // 添加Agent和任务
      const agent = new BaseAgent('test-agent', ['analysis'], 1)
      const task = {
        id: 'task-1',
        type: 'analysis',
        data: { test: 'data' },
        priority: 1
      }
      
      agentWorkflow.addAgent(agent)
      agentWorkflow.addTask(task)
      
      const result = await agentWorkflow.execute()
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.results).toBeDefined()
      expect(result.results).toHaveLength(1)
    })

    it('应该能够处理工作流执行错误', async () => {
      // 添加任务但不添加Agent
      const task = {
        id: 'task-1',
        type: 'analysis',
        data: { test: 'data' },
        priority: 1
      }
      
      agentWorkflow.addTask(task)
      
      const result = await agentWorkflow.execute()
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('应该能够获取工作流状态', () => {
      const status = agentWorkflow.getStatus()
      
      expect(status).toBeDefined()
      expect(status).toHaveProperty('isRunning')
      expect(status).toHaveProperty('totalTasks')
      expect(status).toHaveProperty('completedTasks')
      expect(status).toHaveProperty('failedTasks')
      expect(status).toHaveProperty('progress')
    })

    it('应该能够停止工作流', () => {
      agentWorkflow.stop()
      
      const status = agentWorkflow.getStatus()
      expect(status.isRunning).toBe(false)
    })

    it('应该能够清理工作流', () => {
      // 添加一些数据
      const agent = new BaseAgent('test-agent', ['analysis'], 1)
      const task = {
        id: 'task-1',
        type: 'analysis',
        data: { test: 'data' },
        priority: 1
      }
      
      agentWorkflow.addAgent(agent)
      agentWorkflow.addTask(task)
      
      expect(agentWorkflow.getAgents()).toHaveLength(1)
      expect(agentWorkflow.getTasks()).toHaveLength(1)
      
      agentWorkflow.clear()
      
      expect(agentWorkflow.getAgents()).toHaveLength(0)
      expect(agentWorkflow.getTasks()).toHaveLength(0)
    })
  })

  describe('MarketingWorkflowManager 深度测试', () => {
    let workflowManager: MarketingWorkflowManager

    beforeEach(() => {
      workflowManager = new MarketingWorkflowManager(mockOutputChannel)
    })

    it('应该正确初始化MarketingWorkflowManager', () => {
      expect(workflowManager).toBeDefined()
      expect(typeof workflowManager.startWorkflow).toBe('function')
      expect(typeof workflowManager.stopWorkflow).toBe('function')
      expect(typeof workflowManager.getStatus).toBe('function')
    })

    it('应该能够启动营销工作流', async () => {
      const config = {
        projectPath: '/test/project',
        outputPath: '/test/output',
        theme: 'modern'
      }

      const result = await workflowManager.startWorkflow(config)
      
      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
    })

    it('应该能够停止营销工作流', () => {
      expect(() => {
        workflowManager.stopWorkflow()
      }).not.toThrow()
    })

    it('应该能够获取工作流状态', () => {
      const status = workflowManager.getStatus()
      
      expect(status).toBeDefined()
      expect(typeof status).toBe('object')
    })

    it('应该能够处理事件监听', () => {
      const mockCallback = vi.fn()
      
      expect(() => {
        workflowManager.on('progress', mockCallback)
        workflowManager.on('complete', mockCallback)
        workflowManager.on('error', mockCallback)
      }).not.toThrow()
    })

    it('应该能够移除事件监听器', () => {
      const mockCallback = vi.fn()
      
      workflowManager.on('progress', mockCallback)
      
      expect(() => {
        workflowManager.off('progress', mockCallback)
      }).not.toThrow()
    })
  })

  describe('Agent系统集成测试', () => {
    it('应该能够创建完整的Agent生态系统', () => {
      const workflow = new AgentWorkflow()
      const workflowManager = new MarketingWorkflowManager(mockOutputChannel)
      
      // 创建多个不同类型的Agent
      const analysisAgent = new BaseAgent('analysis-agent', ['analysis'], 1)
      const contentAgent = new BaseAgent('content-agent', ['content-generation'], 2)
      const deploymentAgent = new BaseAgent('deployment-agent', ['deployment'], 3)
      
      workflow.addAgent(analysisAgent)
      workflow.addAgent(contentAgent)
      workflow.addAgent(deploymentAgent)
      
      expect(workflow.getAgents()).toHaveLength(3)
      expect(workflowManager).toBeDefined()
    })

    it('应该能够处理复杂的任务调度', async () => {
      const workflow = new AgentWorkflow()
      
      // 添加多个Agent
      const agent1 = new BaseAgent('agent-1', ['analysis'], 1)
      const agent2 = new BaseAgent('agent-2', ['content-generation'], 2)
      
      workflow.addAgent(agent1)
      workflow.addAgent(agent2)
      
      // 添加多个任务
      const tasks = [
        { id: 'task-1', type: 'analysis', data: {}, priority: 1 },
        { id: 'task-2', type: 'content-generation', data: {}, priority: 2 },
        { id: 'task-3', type: 'analysis', data: {}, priority: 3 }
      ]
      
      tasks.forEach(task => workflow.addTask(task))
      
      const result = await workflow.execute()
      
      expect(result).toBeDefined()
      expect(result.results).toHaveLength(3)
    })

    it('应该能够处理Agent系统的错误恢复', async () => {
      const workflow = new AgentWorkflow()
      
      // 添加一个Agent
      const agent = new BaseAgent('test-agent', ['analysis'], 1)
      workflow.addAgent(agent)
      
      // 添加一个会失败的任务
      const failingTask = {
        id: 'failing-task',
        type: 'invalid-type',
        data: null,
        priority: 1
      }
      
      workflow.addTask(failingTask)
      
      const result = await workflow.execute()
      
      // 系统应该能够处理失败并继续运行
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('Agent系统性能测试', () => {
    it('应该能够快速创建Agent', () => {
      const startTime = Date.now()
      
      const agents = []
      for (let i = 0; i < 100; i++) {
        agents.push(new BaseAgent(`agent-${i}`, ['analysis'], i))
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(100) // 应该在100ms内完成
      expect(agents).toHaveLength(100)
    })

    it('应该能够处理大量任务', async () => {
      const workflow = new AgentWorkflow()
      const agent = new BaseAgent('test-agent', ['analysis'], 1)
      workflow.addAgent(agent)
      
      // 添加大量任务
      for (let i = 0; i < 50; i++) {
        workflow.addTask({
          id: `task-${i}`,
          type: 'analysis',
          data: { index: i },
          priority: 1
        })
      }
      
      const startTime = Date.now()
      const result = await workflow.execute()
      const endTime = Date.now()
      
      expect(result).toBeDefined()
      expect(result.results).toHaveLength(50)
      expect(endTime - startTime).toBeLessThan(5000) // 应该在5秒内完成
    })
  })
})
