/**
 * Context Engineering Integration Layer
 * 
 * 提供统一的接口来使用增强的上下文工程系统，
 * 简化集成和使用过程。
 */

import { ProjectAnalyzer, ProjectAnalysis } from './ProjectAnalyzer';
import { ContextSelector, AITaskType, SelectedContext } from './ContextSelector';
import { LumosGenWorkflow, WorkflowConfig } from '../agents/Workflow';
import * as vscode from 'vscode';

export interface ContextEngineConfig {
    // 分析策略
    analysisStrategy: 'minimal' | 'balanced' | 'comprehensive';
    
    // 缓存设置
    enableCaching: boolean;
    cacheTimeout: number; // 分钟
    
    // 性能设置
    maxDocuments: number;
    maxTokensPerDocument: number;
    
    // 内容生成设置
    defaultContentType: AITaskType;
    defaultAudience: string;
    defaultTone: string;
}

export interface ContextEngineResult {
    analysis: ProjectAnalysis;
    selectedContext: SelectedContext;
    recommendations: {
        contentOpportunities: string[];
        improvementSuggestions: string[];
        nextSteps: string[];
    };
    performance: {
        analysisTime: number;
        documentsProcessed: number;
        tokensUsed: number;
        cacheHitRate: number;
    };
}

/**
 * 上下文工程主引擎
 * 
 * 提供简化的API来使用完整的上下文工程系统
 */
export class ContextEngine {
    private analyzer: ProjectAnalyzer;
    private selector: ContextSelector;
    private workflow?: LumosGenWorkflow;
    private config: ContextEngineConfig;
    private outputChannel: vscode.OutputChannel;

    constructor(
        workspaceRoot: string,
        outputChannel: vscode.OutputChannel,
        config?: Partial<ContextEngineConfig>
    ) {
        this.outputChannel = outputChannel;
        this.analyzer = new ProjectAnalyzer(workspaceRoot, outputChannel);
        this.selector = new ContextSelector();
        
        // 默认配置
        this.config = {
            analysisStrategy: 'balanced',
            enableCaching: true,
            cacheTimeout: 30,
            maxDocuments: 50,
            maxTokensPerDocument: 2000,
            defaultContentType: 'marketing-content',
            defaultAudience: 'developers and technical teams',
            defaultTone: 'professional yet approachable',
            ...config
        };
    }

    /**
     * 执行完整的上下文分析
     */
    async analyzeProject(strategy?: 'minimal' | 'balanced' | 'comprehensive'): Promise<ContextEngineResult> {
        const startTime = Date.now();
        const analysisStrategy = strategy || this.config.analysisStrategy;
        
        this.outputChannel.appendLine(`🔍 Starting context analysis with ${analysisStrategy} strategy`);

        try {
            // 执行项目分析
            const analysis = await this.analyzer.analyzeProject();
            
            // 为默认内容类型选择上下文
            const selectedContext = this.selector.selectContext(analysis, this.config.defaultContentType);
            
            // 生成建议
            const recommendations = this.generateRecommendations(analysis, selectedContext);
            
            // 计算性能指标
            const performance = {
                analysisTime: Date.now() - startTime,
                documentsProcessed: analysis.documents.length,
                tokensUsed: selectedContext.totalTokens,
                cacheHitRate: this.calculateCacheHitRate()
            };

            this.outputChannel.appendLine(`✅ Context analysis completed in ${performance.analysisTime}ms`);
            this.outputChannel.appendLine(`📊 Processed ${performance.documentsProcessed} documents, ${performance.tokensUsed} tokens`);

            return {
                analysis,
                selectedContext,
                recommendations,
                performance
            };

        } catch (error) {
            this.outputChannel.appendLine(`❌ Context analysis failed: ${error}`);
            throw error;
        }
    }

    /**
     * 为特定任务选择最佳上下文
     */
    async selectContextForTask(
        taskType: AITaskType,
        analysis?: ProjectAnalysis
    ): Promise<SelectedContext> {
        let projectAnalysis = analysis;

        if (!projectAnalysis) {
            projectAnalysis = await this.analyzer.analyzeProject();
        }
        
        return this.selector.selectContext(projectAnalysis, taskType);
    }

    /**
     * 生成特定类型的内容
     */
    async generateContent(
        contentType: AITaskType,
        options?: {
            audience?: string;
            tone?: string;
            analysis?: ProjectAnalysis;
        }
    ): Promise<any> {
        if (!this.workflow) {
            throw new Error('Workflow not initialized. Call initializeWorkflow() first.');
        }

        const audience = options?.audience || this.config.defaultAudience;
        const tone = options?.tone || this.config.defaultTone;

        this.outputChannel.appendLine(`📝 Generating ${contentType} content for ${audience}`);

        return await this.workflow.generateSpecificContent(contentType);
    }

    /**
     * 初始化工作流
     */
    initializeWorkflow(
        workspaceRoot: string,
        aiService?: any,
        workflowConfig?: Partial<WorkflowConfig>
    ): void {
        this.workflow = new LumosGenWorkflow(
            workspaceRoot,
            this.outputChannel,
            aiService,
            {
                contextStrategy: this.config.analysisStrategy,
                contentTypes: [this.config.defaultContentType],
                targetAudience: this.config.defaultAudience,
                tone: this.config.defaultTone,
                enableCaching: this.config.enableCaching,
                ...workflowConfig
            }
        );
    }

    /**
     * 执行完整的内容生成工作流
     */
    async executeFullWorkflow(
        projectPath: string,
        contentType: AITaskType = 'marketing-content',
        options?: {
            changedFiles?: string[];
            buildWebsite?: boolean;
        }
    ): Promise<any> {
        if (!this.workflow) {
            throw new Error('Workflow not initialized. Call initializeWorkflow() first.');
        }

        return await this.workflow.executeWorkflow(projectPath, contentType, options);
    }

    /**
     * 获取项目的营销准备度评估
     */
    async assessMarketingReadiness(): Promise<{
        score: number;
        strengths: string[];
        weaknesses: string[];
        recommendations: string[];
    }> {
        const analysis = await this.analyzer.analyzeProject();
        
        let score = 0;
        const strengths: string[] = [];
        const weaknesses: string[] = [];
        const recommendations: string[] = [];

        // 评估基础信息
        if (analysis.metadata.description) {
            score += 20;
            strengths.push('项目有清晰的描述');
        } else {
            weaknesses.push('缺少项目描述');
            recommendations.push('添加详细的项目描述');
        }

        // 评估文档完整性
        const hasReadme = analysis.documents.some((doc: any) => doc.path.toLowerCase().includes('readme'));
        if (hasReadme) {
            score += 25;
            strengths.push('有README文档');
        } else {
            weaknesses.push('缺少README文档');
            recommendations.push('创建详细的README文档');
        }

        const hasChangelog = analysis.documents.some((doc: any) => doc.path.toLowerCase().includes('changelog'));
        if (hasChangelog) {
            score += 10;
            strengths.push('有变更日志');
        } else {
            recommendations.push('维护变更日志');
        }

        // 评估技术栈清晰度
        if (analysis.techStack.length > 0) {
            score += 15;
            strengths.push('技术栈信息清晰');
        } else {
            weaknesses.push('技术栈信息不明确');
            recommendations.push('明确技术栈信息');
        }

        // 评估文档质量
        const avgTokens = analysis.documents.reduce((sum: number, doc: any) => sum + (doc.tokenCount || 0), 0) / analysis.documents.length;
        if (avgTokens > 500) {
            score += 20;
            strengths.push('文档内容丰富');
        } else if (avgTokens > 200) {
            score += 10;
            recommendations.push('增加文档内容');
        } else {
            weaknesses.push('文档内容过少');
            recommendations.push('扩充和改进现有文档');
        }

        // 评估营销素材
        if (analysis.metadata.keywords.length > 0) {
            score += 10;
            strengths.push('有关键词标签');
        } else {
            recommendations.push('添加相关关键词');
        }

        return { score, strengths, weaknesses, recommendations };
    }

    /**
     * 获取上下文统计信息
     */
    getContextStats(): {
        totalDocuments: number;
        documentsByCategory: Record<string, number>;
        totalTokens: number;
        averagePriority: number;
        cacheStats: { size: number; hitRate: number };
    } {
        // 这需要先执行分析才能获取统计信息
        throw new Error('Call analyzeProject() first to get context statistics');
    }

    /**
     * 清理缓存
     */
    clearCache(): void {
        this.analyzer.clearCache();
        this.outputChannel.appendLine('🗑️ Context engine cache cleared');
    }

    /**
     * 更新配置
     */
    updateConfig(newConfig: Partial<ContextEngineConfig>): void {
        this.config = { ...this.config, ...newConfig };
        this.outputChannel.appendLine('⚙️ Context engine configuration updated');
    }

    /**
     * 获取当前配置
     */
    getConfig(): ContextEngineConfig {
        return { ...this.config };
    }

    // 私有方法
    private generateRecommendations(
        analysis: ProjectAnalysis,
        context: SelectedContext
    ): ContextEngineResult['recommendations'] {
        const contentOpportunities: string[] = [];
        const improvementSuggestions: string[] = [];
        const nextSteps: string[] = [];

        // 基于分析结果生成建议
        const hasReadme = analysis.documents.some(doc =>
            doc.path.toLowerCase().includes('readme')
        );
        if (!hasReadme) {
            contentOpportunities.push('创建详细的README文档');
            nextSteps.push('编写项目介绍和使用指南');
        }

        const hasChangelog = analysis.documents.some(doc =>
            doc.path.toLowerCase().includes('changelog')
        );
        if (!hasChangelog) {
            contentOpportunities.push('维护变更日志');
            nextSteps.push('记录版本更新和功能变化');
        }

        if (analysis.documents.length < 3) {
            improvementSuggestions.push('增加项目文档数量');
            nextSteps.push('创建更多技术文档和指南');
        }

        if (analysis.metadata.keywords.length === 0) {
            improvementSuggestions.push('添加项目关键词标签');
            nextSteps.push('研究和添加相关技术关键词');
        }

        // 基于上下文选择结果的建议
        if (context.selectedFiles.length < 3) {
            contentOpportunities.push('增加项目文档数量');
            nextSteps.push('创建用户指南、API文档等');
        }

        return {
            contentOpportunities,
            improvementSuggestions,
            nextSteps
        };
    }

    private calculateCacheHitRate(): number {
        const stats = this.analyzer.getCacheStats();
        return stats.hitRate;
    }
}
