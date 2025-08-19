/**
 * LumosGen Simple Multi-Agent System
 * 
 * Lightweight agent framework designed specifically for VS Code extensions.
 * No external servers, no complex dependencies - just simple, effective agent communication.
 */

import { EventEmitter } from 'events';

// 基础Agent接口
export interface IAgent {
  name: string;
  role: string;
  goal: string;
  background: string;
  execute(input: any, context: AgentContext): Promise<AgentResult>;
}

// Agent执行结果
export interface AgentResult {
  success: boolean;
  data: any;
  error?: string;
  metadata?: {
    executionTime: number;
    tokensUsed?: number;
    confidence?: number;
  };
}

// Agent执行上下文
export interface AgentContext {
  previousResults: Map<string, AgentResult>;
  globalState: Map<string, any>;
  config: {
    apiKey: string;
    model: string;
    timeout: number;
  };
}

// 任务定义
export interface AgentTask {
  id: string;
  agentName: string;
  description: string;
  input: any;
  dependencies: string[]; // 依赖的其他任务ID
}

// 简单的Agent基类
export abstract class BaseAgent implements IAgent {
  constructor(
    public name: string,
    public role: string,
    public goal: string,
    public background: string
  ) {}

  abstract execute(input: any, context: AgentContext): Promise<AgentResult>;

  protected async callLLM(prompt: string, context: AgentContext): Promise<string> {
    // 简单的OpenAI API调用封装
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${context.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: context.config.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are ${this.name}, a ${this.role}. ${this.background}\n\nGoal: ${this.goal}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`LLM API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }
}

// 轻量级工作流执行器
export class SimpleWorkflow extends EventEmitter {
  private agents: Map<string, IAgent> = new Map();
  private tasks: AgentTask[] = [];
  private results: Map<string, AgentResult> = new Map();
  private globalState: Map<string, any> = new Map();

  constructor(private config: { apiKey: string; model?: string; timeout?: number }) {
    super();
  }

  // 注册Agent
  addAgent(agent: IAgent): void {
    this.agents.set(agent.name, agent);
    this.emit('agentAdded', agent.name);
  }

  // 添加任务
  addTask(task: AgentTask): void {
    this.tasks.push(task);
    this.emit('taskAdded', task.id);
  }

  // 执行工作流
  async execute(initialInput: any = {}): Promise<Map<string, AgentResult>> {
    this.emit('workflowStarted');
    this.globalState.set('initialInput', initialInput);
    
    // 按依赖关系排序任务
    const sortedTasks = this.topologicalSort();
    
    for (const task of sortedTasks) {
      try {
        this.emit('taskStarted', task.id);
        
        const agent = this.agents.get(task.agentName);
        if (!agent) {
          throw new Error(`Agent ${task.agentName} not found`);
        }

        // 准备执行上下文
        const context: AgentContext = {
          previousResults: this.results,
          globalState: this.globalState,
          config: {
            apiKey: this.config.apiKey,
            model: this.config.model || 'gpt-3.5-turbo',
            timeout: this.config.timeout || 30000
          }
        };

        // 处理任务输入，替换依赖结果
        const processedInput = this.processTaskInput(task.input, context);
        
        // 执行Agent
        const startTime = Date.now();
        const result = await Promise.race([
          agent.execute(processedInput, context),
          new Promise<AgentResult>((_, reject) => 
            setTimeout(() => reject(new Error('Task timeout')), context.config.timeout)
          )
        ]);

        result.metadata = {
          ...result.metadata,
          executionTime: Date.now() - startTime
        };

        this.results.set(task.id, result);
        this.emit('taskCompleted', task.id, result);

      } catch (error) {
        const errorResult: AgentResult = {
          success: false,
          data: null,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        
        this.results.set(task.id, errorResult);
        this.emit('taskFailed', task.id, errorResult);
      }
    }

    this.emit('workflowCompleted', this.results);
    return this.results;
  }

  // 简单的拓扑排序
  private topologicalSort(): AgentTask[] {
    const visited = new Set<string>();
    const result: AgentTask[] = [];
    
    const visit = (taskId: string) => {
      if (visited.has(taskId)) return;
      
      const task = this.tasks.find(t => t.id === taskId);
      if (!task) return;
      
      // 先访问依赖
      task.dependencies.forEach(dep => visit(dep));
      
      visited.add(taskId);
      result.push(task);
    };

    this.tasks.forEach(task => visit(task.id));
    return result;
  }

  // 处理任务输入，替换依赖结果引用
  private processTaskInput(input: any, context: AgentContext): any {
    if (typeof input === 'string') {
      // 替换 {taskResult:taskId} 格式的引用
      return input.replace(/\{taskResult:(\w+)\}/g, (match, taskId) => {
        const result = context.previousResults.get(taskId);
        return result?.success ? JSON.stringify(result.data) : match;
      });
    }
    
    if (typeof input === 'object' && input !== null) {
      const processed: any = {};
      for (const [key, value] of Object.entries(input)) {
        processed[key] = this.processTaskInput(value, context);
      }
      return processed;
    }
    
    return input;
  }

  // 获取执行结果
  getResult(taskId: string): AgentResult | undefined {
    return this.results.get(taskId);
  }

  // 重置工作流
  reset(): void {
    this.results.clear();
    this.globalState.clear();
    this.emit('workflowReset');
  }
}

// 工具函数：创建简单的LumosGen工作流
export function createLumosGenWorkflow(apiKey: string): SimpleWorkflow {
  const workflow = new SimpleWorkflow({ apiKey });
  
  // 可以添加日志监听器
  workflow.on('taskStarted', (taskId) => {
    console.log(`🚀 Starting task: ${taskId}`);
  });
  
  workflow.on('taskCompleted', (taskId, result) => {
    console.log(`✅ Completed task: ${taskId}`, result.success ? '(Success)' : '(Failed)');
  });
  
  return workflow;
}
