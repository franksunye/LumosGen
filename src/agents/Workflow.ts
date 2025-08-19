/**
 * LumosGen Workflow with Advanced Context Engineering
 *
 * Integrates the context engineering system with intelligent document selection,
 * multi-strategy analysis, and optimized content generation workflows.
 */

import { AgentWorkflow, AgentTask } from './AgentSystem';
import { ContentAnalyzerAgent } from './ContentAnalyzerAgent';
import { ContentGeneratorAgent } from './ContentGeneratorAgent';
import { WebsiteBuilderAgent } from './WebsiteBuilderAgent';
import { EnhancedProjectAnalyzer, EnhancedProjectAnalysis } from '../analysis/EnhancedProjectAnalyzer';
import { ContextSelector, AITaskType } from '../analysis/ContextSelector';
import { AIServiceProvider } from '../ai/AIServiceProvider';
import * as vscode from 'vscode';

export interface WorkflowConfig {
    contextStrategy: 'minimal' | 'balanced' | 'comprehensive';
    contentTypes: AITaskType[];
    targetAudience: string;
    tone: string;
    enableCaching: boolean;
    maxRetries: number;
}

export interface WorkflowResult {
    projectAnalysis: EnhancedProjectAnalysis;
    contentStrategy: any;
    generatedContent: any;
    websiteResult?: any;
    performance: {
        totalTime: number;
        documentsAnalyzed: number;
        totalTokens: number;
        cacheHits: number;
    };
    quality: {
        analysisConfidence: number;
        strategyConfidence: number;
        contentQuality: number;
    };
}

export class LumosGenWorkflow {
    private workflow: AgentWorkflow;
    private analyzer: EnhancedProjectAnalyzer;
    private contextSelector: ContextSelector;
    private config: WorkflowConfig;
    private outputChannel: vscode.OutputChannel;
    private isRunning = false;

    constructor(
        workspaceRoot: string,
        outputChannel: vscode.OutputChannel,
        aiService?: AIServiceProvider,
        config?: Partial<WorkflowConfig>
    ) {
        this.outputChannel = outputChannel;
        this.analyzer = new EnhancedProjectAnalyzer(workspaceRoot, outputChannel);
        this.contextSelector = new ContextSelector();

        // 默认配置
        this.config = {
            contextStrategy: 'balanced',
            contentTypes: ['marketing-content'],
            targetAudience: 'developers and technical teams',
            tone: 'professional yet approachable',
            enableCaching: true,
            maxRetries: 2,
            ...config
        };

        // 创建工作流
        this.workflow = new AgentWorkflow({
            apiKey: 'workflow',
            timeout: 60000
        }, aiService);

        this.setupAgents(workspaceRoot);
        this.setupTasks();
    }

    private setupAgents(workspaceRoot: string): void {
        // 注册Agent
        this.workflow.addAgent(new ContentAnalyzerAgent());
        this.workflow.addAgent(new ContentGeneratorAgent());
        this.workflow.addAgent(new WebsiteBuilderAgent());
    }

    private setupTasks(): void {
        // 内容策略任务
        this.workflow.addTask({
            id: 'contentStrategy',
            agentName: 'ContentAnalyzer',
            description: 'Advanced content strategy with comprehensive document analysis',
            input: {
                projectAnalysis: '{globalState.projectAnalysis}',
                existingContent: '{globalState.existingContent}',
                targetAudience: this.config.targetAudience,
                contentType: '{globalState.contentType}'
            },
            dependencies: []
        });

        // 内容生成任务
        this.workflow.addTask({
            id: 'contentGeneration',
            agentName: 'ContentGenerator',
            description: 'Superior content generation with intelligent context selection',
            input: {
                projectAnalysis: '{globalState.projectAnalysis}',
                contentStrategy: '{taskResult:contentStrategy}',
                contentType: '{globalState.contentType}',
                targetAudience: this.config.targetAudience,
                tone: this.config.tone
            },
            dependencies: ['contentStrategy']
        });

        // 网站构建任务（可选）
        this.workflow.addTask({
            id: 'websiteBuilding',
            agentName: 'WebsiteBuilder',
            description: 'Build marketing website from content',
            input: {
                projectAnalysis: '{globalState.projectAnalysis}',
                marketingContent: '{taskResult:contentGeneration}',
                projectPath: '{globalState.projectPath}'
            },
            dependencies: ['contentGeneration']
        });
    }

    async executeWorkflow(
        projectPath: string,
        contentType: AITaskType = 'marketing-content',
        options?: {
            changedFiles?: string[];
            existingContent?: string;
            buildWebsite?: boolean;
            customStrategy?: 'minimal' | 'balanced' | 'comprehensive';
        }
    ): Promise<WorkflowResult> {
        if (this.isRunning) {
            throw new Error('Workflow is already running');
        }

        this.isRunning = true;
        const startTime = Date.now();

        try {
            this.outputChannel.appendLine(`🚀 Starting LumosGen Workflow`);
            this.outputChannel.appendLine(`📁 Project: ${projectPath}`);
            this.outputChannel.appendLine(`🎯 Content Type: ${contentType}`);
            this.outputChannel.appendLine(`⚙️ Strategy: ${options?.customStrategy || this.config.contextStrategy}`);

            // 执行项目分析
            const strategy = options?.customStrategy || this.config.contextStrategy;
            const projectAnalysis = await this.analyzer.analyzeProjectEnhanced(strategy);

            // 设置全局状态
            const globalState = {
                projectPath,
                changedFiles: options?.changedFiles || [],
                existingContent: options?.existingContent || '',
                contentType,
                buildWebsite: options?.buildWebsite || false,
                projectAnalysis
            };

            // 执行工作流
            const results = await this.workflow.execute(globalState);

            // 提取结果
            const contentStrategyResult = results.get('contentStrategy');
            const contentGenerationResult = results.get('contentGeneration');
            const websiteResult = options?.buildWebsite ? results.get('websiteBuilding') : undefined;

            // 计算性能指标
            const totalTime = Date.now() - startTime;
            const performance = this.calculatePerformanceMetrics(
                null,
                contentStrategyResult,
                contentGenerationResult,
                totalTime
            );

            // 计算质量指标
            const quality = this.calculateQualityMetrics(
                null,
                contentStrategyResult,
                contentGenerationResult
            );

            const result: WorkflowResult = {
                projectAnalysis,
                contentStrategy: contentStrategyResult?.data,
                generatedContent: contentGenerationResult?.data,
                websiteResult: websiteResult?.data,
                performance,
                quality
            };

            this.outputChannel.appendLine(`✅ Workflow completed in ${totalTime}ms`);
            this.outputChannel.appendLine(`📊 Performance: ${performance.documentsAnalyzed} docs, ${performance.totalTokens} tokens`);
            this.outputChannel.appendLine(`🎯 Quality: Analysis ${quality.analysisConfidence}%, Strategy ${quality.strategyConfidence}%, Content ${quality.contentQuality}%`);

            return result;

        } catch (error) {
            this.outputChannel.appendLine(`❌ Workflow failed: ${error}`);
            throw error;
        } finally {
            this.isRunning = false;
        }
    }

    async updateWithChanges(
        changedFiles: string[],
        previousAnalysis?: EnhancedProjectAnalysis
    ): Promise<WorkflowResult> {
        this.outputChannel.appendLine(`🔄 Updating analysis for ${changedFiles.length} changed files`);

        if (previousAnalysis && this.config.enableCaching) {
            // 使用增量更新
            const updatedAnalysis = await this.analyzer.updateAnalysis(changedFiles, previousAnalysis);

            // 重新执行内容生成流程
            return this.executeWorkflow(
                previousAnalysis.structured.metadata.name,
                'marketing-content',
                { changedFiles }
            );
        } else {
            // 完整重新分析
            return this.executeWorkflow(
                process.cwd(),
                'marketing-content',
                { changedFiles }
            );
        }
    }

    async generateSpecificContent(
        contentType: AITaskType,
        projectPath?: string
    ): Promise<any> {
        const targetPath = projectPath || process.cwd();
        
        this.outputChannel.appendLine(`📝 Generating ${contentType} content for ${targetPath}`);

        const result = await this.executeWorkflow(targetPath, contentType, {
            buildWebsite: false
        });

        return result.generatedContent;
    }

    private calculatePerformanceMetrics(
        projectResult: any,
        strategyResult: any,
        contentResult: any,
        totalTime: number
    ): WorkflowResult['performance'] {
        const documentsAnalyzed = (strategyResult?.metadata?.contextDocuments || 0) +
                                 (contentResult?.metadata?.contextDocuments || 0);
        const totalTokens = (strategyResult?.metadata?.totalTokens || 0) +
                           (contentResult?.metadata?.totalTokens || 0);
        const cacheHits = this.analyzer.getCacheStats().size;

        return {
            totalTime,
            documentsAnalyzed,
            totalTokens,
            cacheHits
        };
    }

    private calculateQualityMetrics(
        projectResult: any,
        strategyResult: any,
        contentResult: any
    ): WorkflowResult['quality'] {
        return {
            analysisConfidence: 85, // 固定值，因为直接使用EnhancedProjectAnalyzer
            strategyConfidence: strategyResult?.metadata?.confidence || 0,
            contentQuality: contentResult?.metadata?.confidence || 0
        };
    }

    // 配置管理
    updateConfig(newConfig: Partial<WorkflowConfig>): void {
        this.config = { ...this.config, ...newConfig };
        this.outputChannel.appendLine(`⚙️ Workflow configuration updated`);
    }

    getConfig(): WorkflowConfig {
        return { ...this.config };
    }

    // 缓存管理
    clearCache(): void {
        this.analyzer.clearCache();
        this.outputChannel.appendLine(`🗑️ Analysis cache cleared`);
    }

    getCacheStats(): { size: number; hitRate: number } {
        return this.analyzer.getCacheStats();
    }

    // 状态管理
    isWorkflowRunning(): boolean {
        return this.isRunning;
    }

    stop(): void {
        if (this.workflow) {
            this.workflow.reset();
            this.isRunning = false;
            this.outputChannel.appendLine(`⏹️ Workflow stopped`);
        }
    }
}

// 兼容接口：MarketingWorkflowManager
export class MarketingWorkflowManager {
    private workflow: LumosGenWorkflow;
    private workspaceRoot: string;
    private outputChannel: vscode.OutputChannel;
    private isRunning = false;

    constructor(apiKey?: string, aiService?: AIServiceProvider) {
        // 获取工作区根目录
        this.workspaceRoot = this.getCurrentProjectPath();

        // 创建输出通道
        this.outputChannel = vscode.window.createOutputChannel('LumosGen');

        // 创建工作流
        this.workflow = new LumosGenWorkflow(
            this.workspaceRoot,
            this.outputChannel,
            aiService
        );
    }

    async initialize(): Promise<void> {
        this.outputChannel.appendLine('🚀 MarketingWorkflowManager initialized');
    }

    async onFileChanged(changedFiles: string[], projectPath: string): Promise<void> {
        if (this.isRunning) {
            this.outputChannel.appendLine('⏳ Workflow already running, skipping...');
            return;
        }

        try {
            this.isRunning = true;
            this.outputChannel.appendLine(`📁 Processing ${changedFiles.length} changed files`);

            const result = await this.workflow.executeWorkflow(
                projectPath,
                'marketing-content',
                { changedFiles }
            );

            this.outputChannel.appendLine('✅ Workflow completed successfully');

        } catch (error) {
            this.outputChannel.appendLine(`❌ Workflow failed: ${error}`);
            throw error;
        } finally {
            this.isRunning = false;
        }
    }

    async generateContent(contentType: string = 'homepage'): Promise<any> {
        if (this.isRunning) {
            throw new Error('Workflow already running');
        }

        try {
            this.isRunning = true;
            this.outputChannel.appendLine(`🎯 Generating ${contentType} content with workflow`);

            const result = await this.workflow.executeWorkflow(
                this.workspaceRoot,
                'marketing-content',
                { buildWebsite: contentType === 'website' }
            );

            this.outputChannel.appendLine('✅ Content generation completed');

            return {
                success: true,
                data: result.generatedContent,
                metadata: {
                    performance: result.performance,
                    quality: result.quality
                }
            };

        } catch (error) {
            this.outputChannel.appendLine(`❌ Content generation failed: ${error}`);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Content generation failed'
            };
        } finally {
            this.isRunning = false;
        }
    }

    async generateContentWithPath(contentType: string = 'homepage', projectPath?: string): Promise<any> {
        const targetPath = projectPath || this.workspaceRoot;
        return this.generateContent(contentType);
    }

    getStatus(): { isRunning: boolean; lastResults?: Map<string, any> } {
        return {
            isRunning: this.isRunning
        };
    }

    stop(): void {
        this.isRunning = false;
        this.outputChannel.appendLine('🛑 Workflow stopped');
    }

    private getCurrentProjectPath(): string {
        try {
            if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
                return vscode.workspace.workspaceFolders[0].uri.fsPath;
            }
        } catch (error) {
            console.log('VS Code API not available');
        }
        return process.cwd();
    }
}
