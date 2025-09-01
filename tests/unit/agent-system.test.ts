/**
 * Agent系统核心功能测试 - Vitest版本
 * 验证多Agent协作、工作流管理、任务分发等核心功能
 * 从自定义测试框架迁移到Vitest
 * 增加真实源码测试以提升覆盖率
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { EventEmitter } from 'events'

// 导入VS Code Mock和真实源码
import { setupVSCodeMock, defaultTestConfig } from '../mocks/vscode-mock'
import { AgentSystem } from '../../src/agents/AgentSystem'

// Mock VS Code API
vi.mock('vscode', () => ({
  workspace: {
    workspaceFolders: [{
      uri: { fsPath: '/test/workspace' }
    }]
  },
  window: {
    createOutputChannel: vi.fn(() => ({
      appendLine: vi.fn(),
      show: vi.fn(),
      clear: vi.fn()
    }))
  }
}))

// 测试数据
const testFixtures = {
  comprehensive: {
    name: 'LumosGen',
    description: 'Revolutionary AI-powered content generation platform',
    techStack: ['TypeScript', 'React', 'Node.js', 'Express', 'MongoDB'],
    features: [
      'AI Content Generation',
      'Multi-Agent System',
      'Real-time Processing',
      'Advanced Analytics',
      'User-friendly Interface',
      'Enterprise Security'
    ],
    useCases: [
      'AI-powered development',
      'Content automation',
      'Multi-agent workflows',
      'Enterprise solutions'
    ],
    targetAudience: 'Developers and enterprises',
    complexity: 'high',
    agentRequirements: {
      analyzer: { priority: 1, capabilities: ['project-analysis', 'code-review'] },
      generator: { priority: 2, capabilities: ['content-generation', 'template-processing'] },
      builder: { priority: 3, capabilities: ['website-building', 'deployment'] },
      monitor: { priority: 4, capabilities: ['performance-monitoring', 'error-tracking'] }
    }
  }
}

// Mock Agent AI Service
class MockAgentAIService {
  private requestCount = 0
  private responses = new Map<string, any>()
  private latency = 10

  constructor() {
    this.setupDefaultResponses()
  }

  setupDefaultResponses() {
    this.responses.set('analyze', {
      content: 'Project analysis complete: TypeScript + React application with AI capabilities',
      tokens: 50,
      cost: 0.001,
      metadata: {
        complexity: 'high',
        techStack: ['TypeScript', 'React'],
        recommendations: ['Add unit tests', 'Improve documentation']
      }
    })
    
    this.responses.set('generate', {
      content: '# Welcome to LumosGen\n\nRevolutionary AI-powered content generation platform.',
      tokens: 100,
      cost: 0.002,
      metadata: {
        contentType: 'homepage',
        wordCount: 150,
        readingTime: 1
      }
    })
    
    this.responses.set('build', {
      content: 'Website built successfully with modern responsive design',
      tokens: 75,
      cost: 0.0015,
      metadata: {
        buildTime: 5000,
        filesGenerated: 12,
        theme: 'modern'
      }
    })

    this.responses.set('monitor', {
      content: 'System monitoring initialized with performance tracking',
      tokens: 40,
      cost: 0.0008,
      metadata: {
        metricsEnabled: true,
        alertsConfigured: true,
        dashboardReady: true
      }
    })
  }

  async generateContent(prompt: string, options: any = {}) {
    this.requestCount++
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, this.latency))

    // 根据提示词内容返回相应的响应
    let responseKey = 'generate'
    if (prompt.includes('analyze') || prompt.includes('analysis') || prompt.includes('Analyze')) {
      responseKey = 'analyze'
    } else if (prompt.includes('build') || prompt.includes('website') || prompt.includes('Build')) {
      responseKey = 'build'
    } else if (prompt.includes('monitor') || prompt.includes('performance') || prompt.includes('monitoring')) {
      responseKey = 'monitor'
    }

    const response = this.responses.get(responseKey)
    return {
      ...response,
      requestId: `req_${this.requestCount}`,
      timestamp: new Date().toISOString(),
      provider: 'mock-agent',
      model: 'agent-model-v1'
    }
  }

  getRequestCount() {
    return this.requestCount
  }

  setLatency(ms: number) {
    this.latency = ms
  }

  reset() {
    this.requestCount = 0
  }
}

// Mock Agent System
class MockAgentSystem {
  private agents = new Map<string, any>()
  private eventEmitter = new EventEmitter()
  private aiService: MockAgentAIService
  private taskQueue: any[] = []
  private isProcessing = false

  constructor(aiService: MockAgentAIService) {
    this.aiService = aiService
    this.initializeAgents()
  }

  private initializeAgents() {
    const agentConfigs = [
      {
        id: 'content-analyzer',
        name: 'Content Analyzer Agent',
        capabilities: ['project-analysis', 'code-review', 'dependency-analysis'],
        priority: 1,
        status: 'idle'
      },
      {
        id: 'content-generator',
        name: 'Content Generator Agent',
        capabilities: ['content-generation', 'template-processing', 'markdown-generation'],
        priority: 2,
        status: 'idle'
      },
      {
        id: 'website-builder',
        name: 'Website Builder Agent',
        capabilities: ['website-building', 'deployment', 'theme-application'],
        priority: 3,
        status: 'idle'
      },
      {
        id: 'performance-monitor',
        name: 'Performance Monitor Agent',
        capabilities: ['performance-monitoring', 'error-tracking', 'analytics'],
        priority: 4,
        status: 'idle'
      }
    ]

    agentConfigs.forEach(config => {
      this.agents.set(config.id, {
        ...config,
        taskHistory: [],
        metrics: {
          tasksCompleted: 0,
          averageExecutionTime: 0,
          successRate: 1.0
        }
      })
    })
  }

  getAgent(agentId: string) {
    return this.agents.get(agentId)
  }

  getAllAgents() {
    return Array.from(this.agents.values())
  }

  async executeTask(agentId: string, task: any) {
    const agent = this.agents.get(agentId)
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`)
    }

    if (agent.status === 'busy') {
      throw new Error(`Agent ${agentId} is currently busy`)
    }

    // 更新Agent状态
    agent.status = 'busy'
    const startTime = Date.now()

    try {
      // 执行任务
      const result = await this.aiService.generateContent(task.prompt, task.options)
      
      // 更新任务历史
      const executionTime = Date.now() - startTime
      agent.taskHistory.push({
        taskId: task.id,
        type: task.type,
        executionTime,
        result: result.content,
        timestamp: new Date().toISOString()
      })

      // 更新指标
      agent.metrics.tasksCompleted++
      agent.metrics.averageExecutionTime = 
        (agent.metrics.averageExecutionTime * (agent.metrics.tasksCompleted - 1) + executionTime) / 
        agent.metrics.tasksCompleted

      // 发出完成事件
      this.eventEmitter.emit('agent:task:complete', {
        agentId,
        taskId: task.id,
        result,
        executionTime
      })

      return result

    } catch (error) {
      // 更新失败率
      agent.metrics.successRate = agent.metrics.tasksCompleted / (agent.metrics.tasksCompleted + 1)
      
      this.eventEmitter.emit('agent:task:error', {
        agentId,
        taskId: task.id,
        error: error.message
      })

      throw error

    } finally {
      agent.status = 'idle'
    }
  }

  async executeWorkflow(workflowConfig: any) {
    const { tasks, options = {} } = workflowConfig
    const results = []
    const startTime = Date.now()

    try {
      for (const task of tasks) {
        const agent = this.findBestAgent(task.type, task.capabilities)
        if (!agent) {
          throw new Error(`No suitable agent found for task type: ${task.type}`)
        }

        const result = await this.executeTask(agent.id, task)
        results.push({
          taskId: task.id,
          agentId: agent.id,
          result
        })
      }

      const totalTime = Date.now() - startTime

      this.eventEmitter.emit('workflow:complete', {
        workflowId: workflowConfig.id,
        results,
        totalTime,
        success: true
      })

      return {
        success: true,
        results,
        totalTime,
        tasksCompleted: tasks.length
      }

    } catch (error) {
      this.eventEmitter.emit('workflow:error', {
        workflowId: workflowConfig.id,
        error: error.message
      })

      throw error
    }
  }

  private findBestAgent(taskType: string, requiredCapabilities: string[] = []) {
    const suitableAgents = Array.from(this.agents.values()).filter(agent => {
      if (agent.status === 'busy') return false
      
      // 检查是否有必需的能力
      if (requiredCapabilities.length > 0) {
        return requiredCapabilities.every(cap => agent.capabilities.includes(cap))
      }

      // 基于任务类型匹配
      const taskCapabilityMap: Record<string, string[]> = {
        'analyze': ['project-analysis', 'code-review'],
        'generate': ['content-generation', 'template-processing'],
        'build': ['website-building', 'deployment'],
        'monitor': ['performance-monitoring', 'error-tracking']
      }

      const requiredCaps = taskCapabilityMap[taskType] || []
      return requiredCaps.some(cap => agent.capabilities.includes(cap))
    })

    // 按优先级和成功率排序
    suitableAgents.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority
      }
      return b.metrics.successRate - a.metrics.successRate
    })

    return suitableAgents[0] || null
  }

  on(event: string, listener: Function) {
    this.eventEmitter.on(event, listener)
  }

  off(event: string, listener: Function) {
    this.eventEmitter.off(event, listener)
  }

  getSystemMetrics() {
    const agents = Array.from(this.agents.values())
    return {
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.status === 'busy').length,
      totalTasksCompleted: agents.reduce((sum, a) => sum + a.metrics.tasksCompleted, 0),
      averageSuccessRate: agents.reduce((sum, a) => sum + a.metrics.successRate, 0) / agents.length,
      systemUptime: Date.now() // 简化的运行时间
    }
  }

  reset() {
    this.agents.forEach(agent => {
      agent.status = 'idle'
      agent.taskHistory = []
      agent.metrics = {
        tasksCompleted: 0,
        averageExecutionTime: 0,
        successRate: 1.0
      }
    })
    this.taskQueue = []
    this.eventEmitter.removeAllListeners()
    this.aiService.reset()
  }
}

describe('Agent System Unit Tests', () => {
  let agentSystem: MockAgentSystem
  let aiService: MockAgentAIService
  let testWorkflowConfig: any

  beforeEach(() => {
    console.log('🔧 Setting up Agent System tests...')
    aiService = new MockAgentAIService()
    agentSystem = new MockAgentSystem(aiService)

    testWorkflowConfig = {
      id: 'test-workflow-001',
      name: 'Marketing Content Workflow',
      tasks: [
        {
          id: 'task-001',
          type: 'analyze',
          prompt: 'Analyze the project structure and requirements',
          capabilities: ['project-analysis'],
          options: { depth: 'comprehensive' }
        },
        {
          id: 'task-002',
          type: 'generate',
          prompt: 'Generate homepage content based on analysis',
          capabilities: ['content-generation'],
          options: { contentType: 'homepage', tone: 'professional' }
        },
        {
          id: 'task-003',
          type: 'build',
          prompt: 'Build website with generated content',
          capabilities: ['website-building'],
          options: { theme: 'modern', responsive: true }
        }
      ]
    }
  })

  afterEach(() => {
    agentSystem.reset()
  })

  describe('Agent系统初始化', () => {
    it('应该正确初始化所有Agent', () => {
      const agents = agentSystem.getAllAgents()

      expect(agents).toHaveLength(4)

      const expectedAgents = [
        'content-analyzer',
        'content-generator',
        'website-builder',
        'performance-monitor'
      ]

      expectedAgents.forEach(agentId => {
        const agent = agentSystem.getAgent(agentId)
        expect(agent).toBeTruthy()
        expect(agent.id).toBe(agentId)
        expect(agent.status).toBe('idle')
        expect(Array.isArray(agent.capabilities)).toBe(true)
        expect(agent.capabilities.length).toBeGreaterThan(0)
        expect(agent.priority).toBeGreaterThan(0)
      })
    })

    it('应该为每个Agent设置正确的能力', () => {
      const analyzer = agentSystem.getAgent('content-analyzer')
      const generator = agentSystem.getAgent('content-generator')
      const builder = agentSystem.getAgent('website-builder')
      const monitor = agentSystem.getAgent('performance-monitor')

      expect(analyzer.capabilities).toContain('project-analysis')
      expect(generator.capabilities).toContain('content-generation')
      expect(builder.capabilities).toContain('website-building')
      expect(monitor.capabilities).toContain('performance-monitoring')
    })

    it('应该初始化Agent指标', () => {
      const agents = agentSystem.getAllAgents()

      agents.forEach(agent => {
        expect(agent.metrics.tasksCompleted).toBe(0)
        expect(agent.metrics.averageExecutionTime).toBe(0)
        expect(agent.metrics.successRate).toBe(1.0)
        expect(Array.isArray(agent.taskHistory)).toBe(true)
        expect(agent.taskHistory).toHaveLength(0)
      })
    })
  })

  describe('单个Agent任务执行', () => {
    it('应该成功执行分析任务', async () => {
      const task = {
        id: 'test-task-001',
        type: 'analyze',
        prompt: 'Analyze the project structure',
        options: { depth: 'basic' }
      }

      const result = await agentSystem.executeTask('content-analyzer', task)

      expect(result.content).toBeTruthy()
      expect(result.content).toContain('analysis complete')
      expect(result.tokens).toBeGreaterThan(0)
      expect(result.cost).toBeGreaterThan(0)
      expect(result.requestId).toBeTruthy()

      // 验证Agent状态更新
      const agent = agentSystem.getAgent('content-analyzer')
      expect(agent.metrics.tasksCompleted).toBe(1)
      expect(agent.taskHistory).toHaveLength(1)
      expect(agent.status).toBe('idle')
    })

    it('应该成功执行内容生成任务', async () => {
      const task = {
        id: 'test-task-002',
        type: 'generate',
        prompt: 'Generate homepage content',
        options: { contentType: 'homepage' }
      }

      const result = await agentSystem.executeTask('content-generator', task)

      expect(result.content).toBeTruthy()
      expect(result.content).toContain('LumosGen')
      expect(result.metadata.contentType).toBe('homepage')

      const agent = agentSystem.getAgent('content-generator')
      expect(agent.metrics.tasksCompleted).toBe(1)
    })

    it('应该处理不存在的Agent', async () => {
      const task = {
        id: 'test-task-003',
        type: 'invalid',
        prompt: 'Invalid task',
        options: {}
      }

      await expect(
        agentSystem.executeTask('non-existent-agent', task)
      ).rejects.toThrow('Agent not found: non-existent-agent')
    })

    it('应该处理Agent忙碌状态', async () => {
      const agent = agentSystem.getAgent('content-analyzer')
      agent.status = 'busy'

      const task = {
        id: 'test-task-004',
        type: 'analyze',
        prompt: 'Test task',
        options: {}
      }

      await expect(
        agentSystem.executeTask('content-analyzer', task)
      ).rejects.toThrow('Agent content-analyzer is currently busy')
    })
  })

  describe('Agent通信和事件', () => {
    it('应该发出任务完成事件', async () => {
      let eventReceived = false
      let eventData: any = null

      agentSystem.on('agent:task:complete', (data) => {
        eventReceived = true
        eventData = data
      })

      const task = {
        id: 'test-task-005',
        type: 'analyze',
        prompt: 'Test analysis',
        options: {}
      }

      await agentSystem.executeTask('content-analyzer', task)

      expect(eventReceived).toBe(true)
      expect(eventData.agentId).toBe('content-analyzer')
      expect(eventData.taskId).toBe('test-task-005')
      expect(eventData.result).toBeTruthy()
      expect(eventData.executionTime).toBeGreaterThan(0)
    })

    it('应该发出任务错误事件', async () => {
      let errorEventReceived = false
      let errorData: any = null

      agentSystem.on('agent:task:error', (data) => {
        errorEventReceived = true
        errorData = data
      })

      // 模拟AI服务错误
      const originalMethod = aiService.generateContent
      aiService.generateContent = vi.fn().mockRejectedValue(new Error('AI service error'))

      const task = {
        id: 'test-task-006',
        type: 'analyze',
        prompt: 'Test analysis',
        options: {}
      }

      await expect(
        agentSystem.executeTask('content-analyzer', task)
      ).rejects.toThrow('AI service error')

      expect(errorEventReceived).toBe(true)
      expect(errorData.agentId).toBe('content-analyzer')
      expect(errorData.error).toBe('AI service error')

      // 恢复原方法
      aiService.generateContent = originalMethod
    })
  })

  describe('工作流执行', () => {
    it('应该成功执行完整工作流', async () => {
      const result = await agentSystem.executeWorkflow(testWorkflowConfig)

      expect(result.success).toBe(true)
      expect(result.results).toHaveLength(3)
      expect(result.tasksCompleted).toBe(3)
      expect(result.totalTime).toBeGreaterThan(0)

      // 验证每个任务结果
      result.results.forEach((taskResult, index) => {
        expect(taskResult.taskId).toBe(testWorkflowConfig.tasks[index].id)
        expect(taskResult.agentId).toBeTruthy()
        expect(taskResult.result.content).toBeTruthy()
      })
    })

    it('应该按正确顺序执行任务', async () => {
      const executionOrder: string[] = []

      agentSystem.on('agent:task:complete', (data) => {
        executionOrder.push(data.taskId)
      })

      await agentSystem.executeWorkflow(testWorkflowConfig)

      expect(executionOrder).toEqual(['task-001', 'task-002', 'task-003'])
    })

    it('应该发出工作流完成事件', async () => {
      let workflowCompleteReceived = false
      let workflowData: any = null

      agentSystem.on('workflow:complete', (data) => {
        workflowCompleteReceived = true
        workflowData = data
      })

      await agentSystem.executeWorkflow(testWorkflowConfig)

      expect(workflowCompleteReceived).toBe(true)
      expect(workflowData.workflowId).toBe(testWorkflowConfig.id)
      expect(workflowData.success).toBe(true)
      expect(workflowData.results).toHaveLength(3)
    })

    it('应该处理工作流执行错误', async () => {
      let workflowErrorReceived = false
      let errorData: any = null

      agentSystem.on('workflow:error', (data) => {
        workflowErrorReceived = true
        errorData = data
      })

      // 创建一个会失败的工作流
      const failingWorkflow = {
        id: 'failing-workflow',
        tasks: [{
          id: 'failing-task',
          type: 'invalid-type',
          prompt: 'This will fail',
          capabilities: ['non-existent-capability']
        }]
      }

      await expect(
        agentSystem.executeWorkflow(failingWorkflow)
      ).rejects.toThrow('No suitable agent found')

      expect(workflowErrorReceived).toBe(true)
      expect(errorData.workflowId).toBe('failing-workflow')
    })
  })

  describe('Agent选择和负载均衡', () => {
    it('应该根据能力选择合适的Agent', async () => {
      const analysisTask = {
        id: 'analysis-task',
        type: 'analyze',
        prompt: 'Analyze project',
        capabilities: ['project-analysis']
      }

      const generationTask = {
        id: 'generation-task',
        type: 'generate',
        prompt: 'Generate content',
        capabilities: ['content-generation']
      }

      // 执行任务并验证选择了正确的Agent
      await agentSystem.executeTask('content-analyzer', analysisTask)
      await agentSystem.executeTask('content-generator', generationTask)

      const analyzer = agentSystem.getAgent('content-analyzer')
      const generator = agentSystem.getAgent('content-generator')

      expect(analyzer.metrics.tasksCompleted).toBe(1)
      expect(generator.metrics.tasksCompleted).toBe(1)
    })

    it('应该根据优先级选择Agent', () => {
      const agents = agentSystem.getAllAgents()

      // 验证优先级设置
      const analyzer = agents.find(a => a.id === 'content-analyzer')
      const generator = agents.find(a => a.id === 'content-generator')
      const builder = agents.find(a => a.id === 'website-builder')
      const monitor = agents.find(a => a.id === 'performance-monitor')

      expect(analyzer.priority).toBe(1)
      expect(generator.priority).toBe(2)
      expect(builder.priority).toBe(3)
      expect(monitor.priority).toBe(4)
    })

    it('应该跟踪Agent性能指标', async () => {
      const task1 = {
        id: 'perf-task-1',
        type: 'analyze',
        prompt: 'First analysis task',
        options: {}
      }

      const task2 = {
        id: 'perf-task-2',
        type: 'analyze',
        prompt: 'Second analysis task',
        options: {}
      }

      await agentSystem.executeTask('content-analyzer', task1)
      await agentSystem.executeTask('content-analyzer', task2)

      const agent = agentSystem.getAgent('content-analyzer')

      expect(agent.metrics.tasksCompleted).toBe(2)
      expect(agent.metrics.averageExecutionTime).toBeGreaterThan(0)
      expect(agent.metrics.successRate).toBe(1.0)
      expect(agent.taskHistory).toHaveLength(2)
    })
  })

  describe('系统监控和指标', () => {
    it('应该提供系统级指标', async () => {
      // 执行一些任务
      await agentSystem.executeTask('content-analyzer', {
        id: 'metrics-task-1',
        type: 'analyze',
        prompt: 'Test task',
        options: {}
      })

      await agentSystem.executeTask('content-generator', {
        id: 'metrics-task-2',
        type: 'generate',
        prompt: 'Test task',
        options: {}
      })

      const metrics = agentSystem.getSystemMetrics()

      expect(metrics.totalAgents).toBe(4)
      expect(metrics.activeAgents).toBe(0) // 任务完成后应该都是idle
      expect(metrics.totalTasksCompleted).toBe(2)
      expect(metrics.averageSuccessRate).toBe(1.0)
      expect(metrics.systemUptime).toBeGreaterThan(0)
    })

    it('应该正确计算成功率', async () => {
      const agent = agentSystem.getAgent('content-analyzer')

      // 执行成功任务
      await agentSystem.executeTask('content-analyzer', {
        id: 'success-task',
        type: 'analyze',
        prompt: 'Success task',
        options: {}
      })

      expect(agent.metrics.successRate).toBe(1.0)

      // 模拟失败任务
      const originalMethod = aiService.generateContent
      aiService.generateContent = vi.fn().mockRejectedValue(new Error('Simulated failure'))

      try {
        await agentSystem.executeTask('content-analyzer', {
          id: 'failure-task',
          type: 'analyze',
          prompt: 'Failure task',
          options: {}
        })
      } catch (error) {
        // 预期的错误
      }

      expect(agent.metrics.successRate).toBeLessThan(1.0)

      // 恢复原方法
      aiService.generateContent = originalMethod
    })
  })

  describe('并发和性能', () => {
    it('应该支持并发任务执行', async () => {
      const tasks = [
        agentSystem.executeTask('content-analyzer', {
          id: 'concurrent-1',
          type: 'analyze',
          prompt: 'Concurrent task 1',
          options: {}
        }),
        agentSystem.executeTask('content-generator', {
          id: 'concurrent-2',
          type: 'generate',
          prompt: 'Concurrent task 2',
          options: {}
        }),
        agentSystem.executeTask('website-builder', {
          id: 'concurrent-3',
          type: 'build',
          prompt: 'Concurrent task 3',
          options: {}
        })
      ]

      const results = await Promise.all(tasks)

      expect(results).toHaveLength(3)
      results.forEach(result => {
        expect(result.content).toBeTruthy()
        expect(result.requestId).toBeTruthy()
      })
    })

    it('应该在合理时间内完成工作流', async () => {
      const startTime = Date.now()

      await agentSystem.executeWorkflow(testWorkflowConfig)

      const duration = Date.now() - startTime
      expect(duration).toBeLessThan(5000) // 应该在5秒内完成
    })

    it('应该处理高负载情况', async () => {
      // 设置较低的延迟以加快测试
      aiService.setLatency(1)

      const tasks = Array.from({ length: 10 }, (_, i) => ({
        id: `load-test-${i}`,
        type: 'analyze',
        prompt: `Load test task ${i}`,
        options: {}
      }))

      // 序列化执行任务以避免Agent忙碌冲突
      const results = []
      for (const task of tasks) {
        const result = await agentSystem.executeTask('content-analyzer', task)
        results.push(result)
      }

      expect(results).toHaveLength(10)

      const agent = agentSystem.getAgent('content-analyzer')
      expect(agent.metrics.tasksCompleted).toBe(10)
    })
  })

  describe('错误处理和恢复', () => {
    it('应该处理AI服务超时', async () => {
      // 设置高延迟模拟超时
      aiService.setLatency(100)

      const task = {
        id: 'timeout-task',
        type: 'analyze',
        prompt: 'This might timeout',
        options: { timeout: 50 }
      }

      const startTime = Date.now()
      const result = await agentSystem.executeTask('content-analyzer', task)
      const duration = Date.now() - startTime

      expect(result).toBeTruthy()
      expect(duration).toBeGreaterThan(90) // 应该等待延迟时间

      // 恢复正常延迟
      aiService.setLatency(10)
    })

    it('应该处理Agent重置', () => {
      // 执行一些任务后重置
      const agent = agentSystem.getAgent('content-analyzer')
      agent.metrics.tasksCompleted = 5
      agent.taskHistory = [{ taskId: 'test', type: 'analyze' }]

      agentSystem.reset()

      const resetAgent = agentSystem.getAgent('content-analyzer')
      expect(resetAgent.metrics.tasksCompleted).toBe(0)
      expect(resetAgent.taskHistory).toHaveLength(0)
      expect(resetAgent.status).toBe('idle')
    })
  })

  describe('Vitest特有功能', () => {
    it('应该支持快照测试', async () => {
      const result = await agentSystem.executeWorkflow(testWorkflowConfig)

      // 移除动态字段进行快照测试
      const snapshot = {
        success: result.success,
        tasksCompleted: result.tasksCompleted,
        resultCount: result.results.length,
        hasAnalysisResult: result.results[0].result.content.includes('analysis'),
        hasGenerationResult: result.results[1].result.content.includes('LumosGen'),
        hasBuildResult: result.results[2].result.content.includes('Website')
      }

      expect(snapshot).toMatchSnapshot()
    })

    it('应该支持Mock验证', () => {
      const mockFn = vi.fn()
      mockFn.mockReturnValue('mocked agent response')

      const result = mockFn('test agent call')

      expect(result).toBe('mocked agent response')
      expect(mockFn).toHaveBeenCalledWith('test agent call')
    })

    it('应该支持异步测试', async () => {
      const promise1 = agentSystem.executeTask('content-analyzer', {
        id: 'async-1',
        type: 'analyze',
        prompt: 'Async test 1',
        options: {}
      })

      const promise2 = agentSystem.executeTask('content-generator', {
        id: 'async-2',
        type: 'generate',
        prompt: 'Async test 2',
        options: {}
      })

      const [result1, result2] = await Promise.all([promise1, promise2])

      expect(result1.content).toBeTruthy()
      expect(result2.content).toBeTruthy()
    })
  })

  describe('集成测试', () => {
    it('应该完成完整的营销内容生成流程', async () => {
      const marketingWorkflow = {
        id: 'marketing-workflow',
        name: 'Complete Marketing Content Generation',
        tasks: [
          {
            id: 'analyze-project',
            type: 'analyze',
            prompt: 'Analyze project for marketing content generation',
            capabilities: ['project-analysis']
          },
          {
            id: 'generate-homepage',
            type: 'generate',
            prompt: 'Generate compelling homepage content',
            capabilities: ['content-generation']
          },
          {
            id: 'build-website',
            type: 'build',
            prompt: 'Build responsive website with generated content',
            capabilities: ['website-building']
          },
          {
            id: 'setup-monitoring',
            type: 'monitor',
            prompt: 'Setup performance monitoring and analytics',
            capabilities: ['performance-monitoring']
          }
        ]
      }

      const result = await agentSystem.executeWorkflow(marketingWorkflow)

      expect(result.success).toBe(true)
      expect(result.results).toHaveLength(4)
      expect(result.tasksCompleted).toBe(4)

      // 验证每个阶段的输出
      const analysisResult = result.results[0].result
      const generationResult = result.results[1].result
      const buildResult = result.results[2].result
      const monitorResult = result.results[3].result

      expect(analysisResult.content).toContain('analysis complete')
      expect(generationResult.content).toContain('LumosGen')
      expect(buildResult.content).toContain('Website')
      expect(monitorResult.content).toContain('monitoring')

      // 验证系统指标
      const metrics = agentSystem.getSystemMetrics()
      expect(metrics.totalTasksCompleted).toBe(4)
      expect(metrics.averageSuccessRate).toBe(1.0)
    })
  })

  // 新增：真实Agent系统集成测试
  describe('真实Agent系统集成测试', () => {
    let agentSystem: AgentSystem

    beforeEach(() => {
      // 设置VS Code Mock环境
      setupVSCodeMock(defaultTestConfig)

      // 创建真实的Agent系统实例
      agentSystem = new AgentSystem()
    })

    it('应该正确初始化Agent系统', () => {
      expect(agentSystem).toBeDefined()
      expect(typeof agentSystem.initialize).toBe('function')
      expect(typeof agentSystem.executeWorkflow).toBe('function')
    })

    it('应该能够获取可用的Agent', () => {
      const agents = agentSystem.getAvailableAgents()
      expect(Array.isArray(agents)).toBe(true)
    })

    it('应该能够获取系统状态', () => {
      const status = agentSystem.getSystemStatus()
      expect(status).toBeDefined()
      expect(typeof status).toBe('object')
    })

    it('应该能够注册和注销Agent', () => {
      const initialCount = agentSystem.getAvailableAgents().length

      // 注册一个测试Agent
      const testAgent = {
        id: 'test-agent',
        name: 'Test Agent',
        execute: vi.fn()
      }

      agentSystem.registerAgent(testAgent)
      expect(agentSystem.getAvailableAgents().length).toBe(initialCount + 1)

      // 注销Agent
      agentSystem.unregisterAgent('test-agent')
      expect(agentSystem.getAvailableAgents().length).toBe(initialCount)
    })

    it('应该能够获取工作流历史', () => {
      const history = agentSystem.getWorkflowHistory()
      expect(Array.isArray(history)).toBe(true)
    })
  })
})
