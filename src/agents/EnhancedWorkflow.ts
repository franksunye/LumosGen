/**
 * Enhanced LumosGen Workflow with Advanced Context Engineering
 * 
 * Integrates the new context engineering system with intelligent document selection,
 * multi-strategy analysis, and optimized content generation workflows.
 */

import { SimpleAgentWorkflow, AgentTask } from './simple-agent-system';
import { EnhancedProjectWatcherAgent, EnhancedContentAnalyzerAgent, EnhancedContentGeneratorAgent } from './EnhancedLumosGenAgents';
import { WebsiteBuilderAgent } from './lumosgen-agents';
import { EnhancedProjectAnalyzer, EnhancedProjectAnalysis } from '../analysis/EnhancedProjectAnalyzer';
import { ContextSelector, AITaskType } from '../analysis/ContextSelector';
import { AIServiceProvider } from '../ai/AIServiceProvider';
import * as vscode from 'vscode';

export interface EnhancedWorkflowConfig {
    contextStrategy: 'minimal' | 'balanced' | 'comprehensive';
    contentTypes: AITaskType[];
    targetAudience: string;
    tone: string;
    enableCaching: boolean;
    maxRetries: number;
}

export interface EnhancedWorkflowResult {
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

export class EnhancedLumosGenWorkflow {
    private workflow: SimpleAgentWorkflow;
    private analyzer: EnhancedProjectAnalyzer;
    private contextSelector: ContextSelector;
    private config: EnhancedWorkflowConfig;
    private outputChannel: vscode.OutputChannel;
    private isRunning = false;

    constructor(
        workspaceRoot: string,
        outputChannel: vscode.OutputChannel,
        aiService?: AIServiceProvider,
        config?: Partial<EnhancedWorkflowConfig>
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
        this.workflow = new SimpleAgentWorkflow({
            apiKey: 'enhanced-workflow',
            timeout: 60000,
            maxRetries: this.config.maxRetries
        }, aiService);

        this.setupEnhancedAgents(workspaceRoot);
        this.setupEnhancedTasks();
    }

    private setupEnhancedAgents(workspaceRoot: string): void {
        // 注册增强的Agent
        this.workflow.addAgent(new EnhancedProjectWatcherAgent(workspaceRoot, this.outputChannel));
        this.workflow.addAgent(new EnhancedContentAnalyzerAgent());
        this.workflow.addAgent(new EnhancedContentGeneratorAgent());
        this.workflow.addAgent(new WebsiteBuilderAgent()); // 复用现有的网站构建Agent
    }

    private setupEnhancedTasks(): void {
        // 增强项目分析任务
        this.workflow.addTask({
            id: 'enhancedProjectAnalysis',
            agentName: 'EnhancedProjectWatcher',
            description: 'Comprehensive project analysis with advanced context engineering',
            input: {
                projectPath: '{globalState.projectPath}',
                changedFiles: '{globalState.changedFiles}',
                strategy: this.config.contextStrategy
            },
            dependencies: []
        });

        // 增强内容策略任务
        this.workflow.addTask({
            id: 'enhancedContentStrategy',
            agentName: 'EnhancedContentAnalyzer',
            description: 'Advanced content strategy with comprehensive document analysis',
            input: {
                projectAnalysis: '{taskResult:enhancedProjectAnalysis}',
                existingContent: '{globalState.existingContent}',
                targetAudience: this.config.targetAudience,
                contentType: '{globalState.contentType}'
            },
            dependencies: ['enhancedProjectAnalysis']
        });

        // 增强内容生成任务
        this.workflow.addTask({
            id: 'enhancedContentGeneration',
            agentName: 'EnhancedContentGenerator',
            description: 'Superior content generation with intelligent context selection',
            input: {
                projectAnalysis: '{taskResult:enhancedProjectAnalysis}',
                contentStrategy: '{taskResult:enhancedContentStrategy}',
                contentType: '{globalState.contentType}',
                targetAudience: this.config.targetAudience,
                tone: this.config.tone
            },
            dependencies: ['enhancedProjectAnalysis', 'enhancedContentStrategy']
        });

        // 网站构建任务（可选）
        this.workflow.addTask({
            id: 'websiteBuilding',
            agentName: 'WebsiteBuilder',
            description: 'Build marketing website from enhanced content',
            input: {
                projectAnalysis: '{taskResult:enhancedProjectAnalysis}',
                marketingContent: '{taskResult:enhancedContentGeneration}',
                projectPath: '{globalState.projectPath}'
            },
            dependencies: ['enhancedContentGeneration']
        });
    }

    async executeEnhancedWorkflow(
        projectPath: string,
        contentType: AITaskType = 'marketing-content',
        options?: {
            changedFiles?: string[];
            existingContent?: string;
            buildWebsite?: boolean;
            customStrategy?: 'minimal' | 'balanced' | 'comprehensive';
        }
    ): Promise<EnhancedWorkflowResult> {
        if (this.isRunning) {
            throw new Error('Enhanced workflow is already running');
        }

        this.isRunning = true;
        const startTime = Date.now();

        try {
            this.outputChannel.appendLine(`🚀 Starting Enhanced LumosGen Workflow`);
            this.outputChannel.appendLine(`📁 Project: ${projectPath}`);
            this.outputChannel.appendLine(`🎯 Content Type: ${contentType}`);
            this.outputChannel.appendLine(`⚙️ Strategy: ${options?.customStrategy || this.config.contextStrategy}`);

            // 设置全局状态
            const globalState = {
                projectPath,
                changedFiles: options?.changedFiles || [],
                existingContent: options?.existingContent || '',
                contentType,
                buildWebsite: options?.buildWebsite || false
            };

            // 执行工作流
            const results = await this.workflow.execute(globalState);

            // 提取结果
            const projectAnalysisResult = results.get('enhancedProjectAnalysis');
            const contentStrategyResult = results.get('enhancedContentStrategy');
            const contentGenerationResult = results.get('enhancedContentGeneration');
            const websiteResult = options?.buildWebsite ? results.get('websiteBuilding') : undefined;

            // 计算性能指标
            const totalTime = Date.now() - startTime;
            const performance = this.calculatePerformanceMetrics(
                projectAnalysisResult,
                contentStrategyResult,
                contentGenerationResult,
                totalTime
            );

            // 计算质量指标
            const quality = this.calculateQualityMetrics(
                projectAnalysisResult,
                contentStrategyResult,
                contentGenerationResult
            );

            const result: EnhancedWorkflowResult = {
                projectAnalysis: projectAnalysisResult?.data?.fullProjectAnalysis,
                contentStrategy: contentStrategyResult?.data,
                generatedContent: contentGenerationResult?.data,
                websiteResult: websiteResult?.data,
                performance,
                quality
            };

            this.outputChannel.appendLine(`✅ Enhanced workflow completed in ${totalTime}ms`);
            this.outputChannel.appendLine(`📊 Performance: ${performance.documentsAnalyzed} docs, ${performance.totalTokens} tokens`);
            this.outputChannel.appendLine(`🎯 Quality: Analysis ${quality.analysisConfidence}%, Strategy ${quality.strategyConfidence}%, Content ${quality.contentQuality}%`);

            return result;

        } catch (error) {
            this.outputChannel.appendLine(`❌ Enhanced workflow failed: ${error}`);
            throw error;
        } finally {
            this.isRunning = false;
        }
    }

    async updateWithChanges(
        changedFiles: string[],
        previousAnalysis?: EnhancedProjectAnalysis
    ): Promise<EnhancedWorkflowResult> {
        this.outputChannel.appendLine(`🔄 Updating analysis for ${changedFiles.length} changed files`);

        if (previousAnalysis && this.config.enableCaching) {
            // 使用增量更新
            const updatedAnalysis = await this.analyzer.updateAnalysis(changedFiles, previousAnalysis);
            
            // 重新执行内容生成流程
            return this.executeEnhancedWorkflow(
                previousAnalysis.structured.metadata.name,
                'marketing-content',
                { changedFiles }
            );
        } else {
            // 完整重新分析
            return this.executeEnhancedWorkflow(
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

        const result = await this.executeEnhancedWorkflow(targetPath, contentType, {
            buildWebsite: false
        });

        return result.generatedContent;
    }

    private calculatePerformanceMetrics(
        projectResult: any,
        strategyResult: any,
        contentResult: any,
        totalTime: number
    ): EnhancedWorkflowResult['performance'] {
        const documentsAnalyzed = projectResult?.metadata?.documentsAnalyzed || 0;
        const totalTokens = (projectResult?.metadata?.totalTokens || 0) +
                           (strategyResult?.metadata?.totalTokens || 0) +
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
    ): EnhancedWorkflowResult['quality'] {
        return {
            analysisConfidence: projectResult?.metadata?.confidence || 0,
            strategyConfidence: strategyResult?.metadata?.confidence || 0,
            contentQuality: contentResult?.metadata?.confidence || 0
        };
    }

    // 配置管理
    updateConfig(newConfig: Partial<EnhancedWorkflowConfig>): void {
        this.config = { ...this.config, ...newConfig };
        this.outputChannel.appendLine(`⚙️ Workflow configuration updated`);
    }

    getConfig(): EnhancedWorkflowConfig {
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
            this.outputChannel.appendLine(`⏹️ Enhanced workflow stopped`);
        }
    }
}
