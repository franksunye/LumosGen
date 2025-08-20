/**
 * LumosGen Multi-Agent System
 *
 * Lightweight agent framework designed specifically for VS Code extensions.
 * No external servers, no complex dependencies - just effective agent communication.
 */

import { EventEmitter } from 'events';
import { AIServiceProvider } from '../ai/AIServiceProvider';
// For Node.js fetch compatibility
declare global {
  function fetch(input: string, init?: any): Promise<any>;
}

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
  data?: any;
  error?: string;
  metadata?: {
    executionTime?: number;
    tokensUsed?: number;
    confidence?: number;
    agent?: string;
    timestamp?: string;
    buildTime?: string;
    features?: string[];
    [key: string]: any; // Allow additional metadata fields
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
  aiService?: AIServiceProvider; // New AI service provider
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
    // Use the new AI service provider if available
    if (context.aiService) {
      try {
        const request = {
          messages: [
            {
              role: 'system' as const,
              content: `You are ${this.name}, a ${this.role}. ${this.background}\n\nGoal: ${this.goal}`
            },
            {
              role: 'user' as const,
              content: prompt
            }
          ],
          temperature: 0.7,
          maxTokens: 2000
        };

        const response = await context.aiService.generateContent(request);
        return response.content;
      } catch (error) {
        console.warn('AI service call failed, falling back to mock response:', error);
        return this.generateMockResponse(prompt);
      }
    }

    // Legacy fallback for backward compatibility
    if (!context.config.apiKey || context.config.apiKey === '' || context.config.apiKey === 'mock') {
      return this.generateMockResponse(prompt);
    }

    try {
      // Legacy OpenAI API call (kept for backward compatibility)
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

      const data = await response.json() as any;
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.warn('LLM API call failed, falling back to mock mode:', error);
      return this.generateMockResponse(prompt);
    }
  }

  protected generateMockResponse(prompt: string): string {
    // Generate realistic mock responses based on prompt content
    if (prompt.includes('project analysis') || prompt.includes('analyze project')) {
      return this.generateMockProjectAnalysis();
    } else if (prompt.includes('content strategy') || prompt.includes('marketing strategy')) {
      return this.generateMockContentStrategy();
    } else if (prompt.includes('generate content') || prompt.includes('marketing content')) {
      return this.generateMockMarketingContent();
    } else {
      return this.generateGenericMockResponse();
    }
  }

  private generateMockProjectAnalysis(): string {
    return `## Project Analysis Results

### Technology Stack
- **Primary Language**: TypeScript/JavaScript
- **Framework**: VS Code Extension API
- **Build Tools**: Node.js, npm
- **Target Platform**: VS Code Marketplace

### Key Features Identified
1. **AI-Powered Content Generation** - Automated marketing content creation
2. **Project Analysis Engine** - Smart codebase scanning and insights
3. **Website Builder** - Complete responsive website generation
4. **GitHub Integration** - Seamless deployment to GitHub Pages

### Marketing Opportunities
- **Developer Tools Market** - High demand for productivity extensions
- **AI-Powered Solutions** - Growing interest in AI-assisted development
- **Open Source Community** - Strong potential for community adoption

### Recommendations
1. Focus on developer productivity benefits
2. Highlight AI-powered automation features
3. Emphasize ease of use and quick setup
4. Target VS Code extension marketplace`;
  }

  private generateMockContentStrategy(): string {
    return `## Content Strategy Recommendations

### Target Audience
- **Primary**: VS Code developers and development teams
- **Secondary**: Technical content creators and project maintainers
- **Tertiary**: Open source contributors and indie developers

### Content Pillars
1. **Productivity Enhancement** - How LumosGen saves development time
2. **AI Innovation** - Cutting-edge AI features for developers
3. **Ease of Use** - Simple setup and intuitive interface
4. **Community Value** - Open source benefits and collaboration

### Content Types
- **Homepage**: Hero messaging focused on developer productivity
- **About Page**: Technical details and team background
- **Blog Posts**: Feature announcements and use cases
- **FAQ**: Common questions and troubleshooting

### Messaging Framework
- **Problem**: Manual marketing content creation is time-consuming
- **Solution**: AI-powered automation for developers
- **Benefit**: Focus on coding while LumosGen handles marketing`;
  }

  private generateMockMarketingContent(): string {
    return `# Transform Your Development Workflow with LumosGen

## AI-Powered VS Code Extension for Effortless Marketing

LumosGen revolutionizes how developers create marketing content. Our intelligent VS Code extension analyzes your projects and generates professional marketing websites automatically.

### Key Features

🚀 **Instant Project Analysis** - Smart scanning of your codebase structure and features
🤖 **AI Content Generation** - Professional marketing copy created in seconds
🎨 **Beautiful Website Templates** - Modern, responsive designs optimized for developers
📈 **SEO Optimization** - Built-in best practices for search engine visibility
🔧 **GitHub Integration** - One-click deployment to GitHub Pages

### Why Developers Choose LumosGen

- **Save Hours of Work** - Automate marketing content creation
- **Professional Results** - AI-generated content that converts
- **Developer-Friendly** - Built by developers, for developers
- **Open Source** - Transparent, community-driven development

### Get Started in Minutes

1. Install LumosGen from VS Code Marketplace
2. Open your project in VS Code
3. Click the LumosGen icon in the sidebar
4. Generate your marketing website instantly

**Ready to transform your project marketing?** Install LumosGen today and join thousands of developers who've automated their marketing workflow.`;
  }

  private generateGenericMockResponse(): string {
    return `## AI-Generated Response

This is a mock response generated by LumosGen's fallback system. In production, this would be replaced by actual AI-generated content based on your specific prompt and context.

### Key Points
- Professional content generation
- Developer-focused messaging
- SEO-optimized structure
- Ready-to-use marketing copy

### Next Steps
Configure your OpenAI API key in VS Code settings to enable full AI functionality.`;
  }
}

// 轻量级工作流执行器
export class AgentWorkflow extends EventEmitter {
  private agents: Map<string, IAgent> = new Map();
  private tasks: AgentTask[] = [];
  private results: Map<string, AgentResult> = new Map();
  private globalState: Map<string, any> = new Map();
  private aiService?: AIServiceProvider;

  constructor(private config: { apiKey: string; model?: string; timeout?: number }, aiService?: AIServiceProvider) {
    super();
    this.aiService = aiService;
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

    // 将初始输入的所有属性设置到globalState中
    if (typeof initialInput === 'object' && initialInput !== null) {
      for (const [key, value] of Object.entries(initialInput)) {
        this.globalState.set(key, value);
      }
    }
    
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
          },
          aiService: this.aiService
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
      let processed = input.replace(/\{taskResult:(\w+)\}/g, (match, taskId) => {
        const result = context.previousResults.get(taskId);
        return result?.success ? JSON.stringify(result.data) : match;
      });

      // 替换 {globalState.key} 格式的引用
      processed = processed.replace(/\{globalState\.(\w+)\}/g, (match, key) => {
        const value = context.globalState.get(key);
        return value !== undefined ? String(value) : match;
      });

      return processed;
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

// 工具函数：创建LumosGen工作流
export function createLumosGenWorkflow(apiKey: string, aiService?: AIServiceProvider): AgentWorkflow {
  const workflow = new AgentWorkflow({ apiKey }, aiService);
  
  // 可以添加日志监听器
  workflow.on('taskStarted', (taskId) => {
    console.log(`🚀 Starting task: ${taskId}`);
  });
  
  workflow.on('taskCompleted', (taskId, result) => {
    console.log(`✅ Completed task: ${taskId}`, result.success ? '(Success)' : '(Failed)');
  });
  
  return workflow;
}
