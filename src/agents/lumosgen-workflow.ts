/**
 * LumosGen Marketing Automation Workflow
 * 
 * Simple, lightweight workflow that can be embedded directly in VS Code extension.
 * No external servers, no complex dependencies - just effective agent coordination.
 */

import { createLumosGenWorkflow } from './simple-agent-system';
import { ProjectWatcherAgent, ContentAnalyzerAgent, ContentGeneratorAgent, WebsiteBuilderAgent } from './lumosgen-agents';

// 创建LumosGen营销自动化工作流
export async function createMarketingWorkflow(apiKey?: string) {
  // 创建工作流实例 - 如果没有API密钥，使用模拟模式
  const workflow = createLumosGenWorkflow(apiKey || 'mock');
  
  // 注册专用Agent
  workflow.addAgent(new ProjectWatcherAgent());
  workflow.addAgent(new ContentAnalyzerAgent());
  workflow.addAgent(new ContentGeneratorAgent());
  workflow.addAgent(new WebsiteBuilderAgent());
  
  // 定义任务流程
  workflow.addTask({
    id: 'projectAnalysis',
    agentName: 'ProjectWatcher',
    description: 'Analyze project changes and identify marketing opportunities',
    input: {
      projectPath: '{globalState.projectPath}',
      changedFiles: '{globalState.changedFiles}',
      projectInfo: '{globalState.projectInfo}'
    },
    dependencies: []
  });
  
  workflow.addTask({
    id: 'contentStrategy',
    agentName: 'ContentAnalyzer',
    description: 'Create content strategy based on project analysis',
    input: {
      projectAnalysis: '{taskResult:projectAnalysis}',
      existingContent: '{globalState.existingContent}',
      targetAudience: 'developers and technical teams'
    },
    dependencies: ['projectAnalysis']
  });
  
  workflow.addTask({
    id: 'contentGeneration',
    agentName: 'ContentGenerator',
    description: 'Generate marketing content based on analysis and strategy',
    input: {
      projectAnalysis: '{taskResult:projectAnalysis}',
      contentStrategy: '{taskResult:contentStrategy}',
      contentType: 'homepage'
    },
    dependencies: ['projectAnalysis', 'contentStrategy']
  });

  workflow.addTask({
    id: 'websiteBuilding',
    agentName: 'WebsiteBuilder',
    description: 'Build responsive marketing website from generated content',
    input: {
      projectAnalysis: '{taskResult:projectAnalysis}',
      marketingContent: '{taskResult:contentGeneration}',
      projectPath: '{globalState.projectPath}'
    },
    dependencies: ['projectAnalysis', 'contentGeneration']
  });

  return workflow;
}

// VS Code扩展集成接口
export class LumosGenAgentManager {
  public workflow: any;
  private isRunning = false;

  constructor(private apiKey: string) {}
  
  async initialize(): Promise<void> {
    this.workflow = await createMarketingWorkflow(this.apiKey);
    
    // 设置事件监听器
    this.workflow.on('workflowStarted', () => {
      console.log('🚀 LumosGen marketing workflow started');
      this.isRunning = true;
    });
    
    this.workflow.on('taskCompleted', (taskId: string, result: any) => {
      console.log(`✅ Task completed: ${taskId}`, result.success ? 'Success' : 'Failed');
    });
    
    this.workflow.on('workflowCompleted', (results: Map<string, any>) => {
      console.log('🎉 Marketing workflow completed');
      this.isRunning = false;
      this.onWorkflowCompleted(results);
    });
  }
  
  // 当文件变化时触发营销内容更新
  async onFileChanged(changedFiles: string[], projectPath: string): Promise<void> {
    if (this.isRunning) {
      console.log('⏳ Workflow already running, skipping...');
      return;
    }
    
    try {
      // 分析项目信息
      const projectInfo = await this.analyzeProject(projectPath);
      
      // 执行工作流
      await this.workflow.execute({
        projectPath,
        changedFiles,
        projectInfo,
        existingContent: await this.getExistingContent(projectPath)
      });
      
    } catch (error) {
      console.error('❌ Marketing workflow failed:', error);
    }
  }
  
  // 手动触发内容生成
  async generateContent(contentType: string = 'homepage'): Promise<any> {
    if (this.isRunning) {
      throw new Error('Workflow already running');
    }
    
    const projectPath = this.getCurrentProjectPath();
    const projectInfo = await this.analyzeProject(projectPath);
    
    const results = await this.workflow.execute({
      projectPath,
      changedFiles: [],
      projectInfo,
      existingContent: await this.getExistingContent(projectPath),
      contentType
    });
    
    return results.get('contentGeneration');
  }

  // 使用指定路径生成内容
  async generateContentWithPath(contentType: string = 'homepage', projectPath?: string): Promise<any> {
    if (this.isRunning) {
      throw new Error('Workflow already running');
    }

    const targetPath = projectPath || this.getCurrentProjectPath();
    const projectInfo = await this.analyzeProject(targetPath);

    const results = await this.workflow.execute({
      projectPath: targetPath,
      changedFiles: [],
      projectInfo,
      existingContent: await this.getExistingContent(targetPath),
      contentType
    });

    return results.get('contentGeneration');
  }

  // 获取工作流状态
  getStatus(): { isRunning: boolean; lastResults?: Map<string, any> } {
    return {
      isRunning: this.isRunning,
      lastResults: this.workflow?.results
    };
  }
  
  // 停止当前工作流
  stop(): void {
    if (this.workflow) {
      this.workflow.reset();
      this.isRunning = false;
    }
  }
  
  // 私有方法：分析项目
  private async analyzeProject(projectPath: string): Promise<any> {
    // 这里可以集成VS Code API来分析项目
    // 暂时返回模拟数据
    return {
      name: 'LumosGen',
      type: 'VS Code Extension',
      description: 'AI-powered marketing content generation for developers',
      techStack: ['TypeScript', 'Node.js', 'VS Code API'],
      features: [
        'Automatic project analysis',
        'AI content generation',
        'VS Code integration',
        'GitHub Pages deployment'
      ],
      version: '0.1.0'
    };
  }
  
  // 私有方法：获取现有内容
  private async getExistingContent(projectPath: string): Promise<string> {
    // 这里可以读取现有的README.md或其他营销文件
    // 暂时返回空字符串
    return '';
  }
  
  // 私有方法：获取当前项目路径
  private getCurrentProjectPath(): string {
    // 尝试从VS Code API获取当前工作区路径
    try {
      const vscode = require('vscode');
      if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        return vscode.workspace.workspaceFolders[0].uri.fsPath;
      }
    } catch (error) {
      console.log('VS Code API not available, using fallback path');
    }

    // 回退到安全的用户目录，避免VS Code安装目录权限问题
    const currentDir = process.cwd();

    // 检查是否在VS Code安装目录中（通常包含"Microsoft VS Code"）
    if (currentDir.includes('Microsoft VS Code') || currentDir.includes('Program Files')) {
      console.log('Detected VS Code installation directory, using safe fallback');
      const os = require('os');
      const path = require('path');
      return path.join(os.homedir(), 'LumosGen-Projects');
    }

    return currentDir;
  }
  
  // 工作流完成回调
  private onWorkflowCompleted(results: Map<string, any>): void {
    const contentResult = results.get('contentGeneration');
    
    if (contentResult?.success) {
      console.log('📝 Generated content:', contentResult.data);
      
      // 这里可以触发VS Code UI更新
      // 例如：显示生成的内容，询问用户是否保存等
      this.showGeneratedContent(contentResult.data);
    } else {
      console.error('❌ Content generation failed:', contentResult?.error);
    }
  }
  
  // 显示生成的内容（集成到VS Code UI）
  private showGeneratedContent(content: any): void {
    // 这里应该集成到VS Code的UI中
    // 例如：在侧边栏显示内容，或者打开新的编辑器标签页
    console.log('Generated Marketing Content:');
    console.log('Headline:', content.headline);
    console.log('Features:', content.features);
    console.log('CTA:', content.callToAction);
  }
}

// Marketing Workflow Manager - Main VS Code integration class
export class MarketingWorkflowManager {
  private agentManager: LumosGenAgentManager;
  public workflow?: any;
  private mockMode: boolean;

  constructor(apiKey?: string) {
    this.mockMode = !apiKey || apiKey === '' || apiKey === 'mock';
    this.agentManager = new LumosGenAgentManager(apiKey || 'mock');
  }

  async initialize(): Promise<void> {
    await this.agentManager.initialize();
    this.workflow = this.agentManager.workflow;
  }

  async onFileChanged(changedFiles: string[], projectPath: string): Promise<void> {
    return this.agentManager.onFileChanged(changedFiles, projectPath);
  }

  async generateContent(contentType: string = 'homepage'): Promise<any> {
    return this.agentManager.generateContent(contentType);
  }

  async generateContentWithPath(contentType: string = 'homepage', projectPath?: string): Promise<any> {
    return this.agentManager.generateContentWithPath(contentType, projectPath);
  }

  getStatus(): { isRunning: boolean; lastResults?: Map<string, any> } {
    return this.agentManager.getStatus();
  }

  stop(): void {
    this.agentManager.stop();
  }
}

// 使用示例
export async function initializeLumosGen(apiKey: string): Promise<LumosGenAgentManager> {
  const manager = new LumosGenAgentManager(apiKey);
  await manager.initialize();
  return manager;
}

// 导出类型定义供VS Code扩展使用
export interface MarketingContent {
  headline: string;
  subheadline: string;
  features: string[];
  valueProposition: string;
  callToAction: string;
  metaDescription: string;
  fullContent: string;
}

export interface ProjectAnalysis {
  changeType: string;
  impactLevel: 'high' | 'medium' | 'low';
  marketingAreas: string[];
  valuePropositions: string[];
  recommendations: string[];
}

export interface ContentStrategy {
  contentGaps: string[];
  priorities: string[];
  messaging: string;
  seoOpportunities: string[];
  contentStructure: string[];
  ctaStrategy: string[];
}

/*
使用方法（在VS Code扩展中）:

import { initializeLumosGen } from './agents/lumosgen-workflow';

// 初始化
const agentManager = await initializeLumosGen(apiKey);

// 监听文件变化
vscode.workspace.onDidSaveTextDocument(async (document) => {
  if (document.fileName.endsWith('.md') || document.fileName.includes('package.json')) {
    await agentManager.onFileChanged([document.fileName], workspace.rootPath);
  }
});

// 手动生成内容
const content = await agentManager.generateContent('homepage');
*/
