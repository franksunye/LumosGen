/**
 * Project Watcher Agent with Advanced Context Engineering
 * 
 * This agent leverages the context engineering system for superior
 * project analysis with intelligent document selection and processing.
 */

import { BaseAgent, AgentResult, AgentContext } from './AgentSystem';
import { EnhancedProjectAnalyzer, EnhancedProjectAnalysis } from '../analysis/EnhancedProjectAnalyzer';
import { ContextSelector, AITaskType, SelectedContext } from '../analysis/ContextSelector';
import * as vscode from 'vscode';

// 🔍 项目监控Agent
export class ProjectWatcherAgent extends BaseAgent {
    private analyzer: EnhancedProjectAnalyzer;
    private contextSelector: ContextSelector;
    
    constructor(workspaceRoot: string, outputChannel: vscode.OutputChannel) {
        super(
            'ProjectWatcher',
            'Advanced Project Monitor',
            'Analyze project changes with comprehensive context understanding',
            `Expert in deep project analysis using advanced context engineering.
            Leverages all available documentation, code structure, and project metadata
            to provide comprehensive insights for marketing content generation.`
        );
        
        this.analyzer = new EnhancedProjectAnalyzer(workspaceRoot, outputChannel);
        this.contextSelector = new ContextSelector();
    }

    async execute(input: any, context: AgentContext): Promise<AgentResult> {
        try {
            const { projectPath, changedFiles, strategy = 'balanced' } = input;
            
            // 执行项目分析
            const analysis = await this.analyzer.analyzeProjectEnhanced(strategy);
            
            // 为项目分析任务选择最佳上下文
            const selectedContext = this.contextSelector.selectContext(analysis, 'project-analysis');
            
            // 生成分析提示
            const prompt = this.generateAnalysisPrompt(analysis, selectedContext, changedFiles);
            
            const response = await this.callLLM(prompt, context);
            const enhancedAnalysis = this.parseAnalysis(response, analysis, selectedContext);
            
            return {
                success: true,
                data: enhancedAnalysis,
                metadata: {
                    executionTime: 0,
                    confidence: this.calculateConfidence(enhancedAnalysis),
                    contextStrategy: strategy,
                    documentsAnalyzed: selectedContext.selectedFiles.length,
                    totalTokens: selectedContext.totalTokens
                }
            };
            
        } catch (error) {
            return {
                success: false,
                data: null,
                error: error instanceof Error ? error.message : 'Project analysis failed'
            };
        }
    }
    
    private generateAnalysisPrompt(
        analysis: EnhancedProjectAnalysis, 
        selectedContext: SelectedContext, 
        changedFiles: string[]
    ): string {
        const structuredData = selectedContext.structured;
        const documentContext = selectedContext.selectedFiles
            .map(file => `## ${file.path}\n${file.content}`)
            .join('\n\n');
        
        return `
# 项目分析任务

## 项目结构化信息
**项目名称**: ${structuredData?.metadata.name}
**描述**: ${structuredData?.metadata.description}
**技术栈**: ${structuredData?.techStack.map(t => `${t.language}${t.framework ? ` (${t.framework})` : ''}`).join(', ')}
**依赖数量**: ${structuredData?.dependencies.length || 0}
**脚本数量**: ${structuredData?.scripts.length || 0}

## 变更文件
${Array.isArray(changedFiles) ? changedFiles.join('\n') : (changedFiles || '无特定变更文件')}

## 文档上下文 (${selectedContext.selectedFiles.length}个文档, ${selectedContext.totalTokens} tokens)
${selectedContext.selectionReason}

${documentContext}

## 分析要求
基于以上完整的项目信息和文档上下文，请提供：

1. **项目特性分析**
   - 核心功能和价值主张
   - 技术创新点和竞争优势
   - 目标用户群体定位

2. **变更影响评估**
   - 变更类型和重要性级别
   - 对营销内容的影响程度
   - 需要更新的内容区域

3. **营销机会识别**
   - 可突出的技术亮点
   - 用户痛点解决方案
   - 市场定位建议

4. **内容策略建议**
   - 优先级排序的内容更新计划
   - 目标受众的沟通策略
   - SEO和转化优化建议

请提供结构化、可执行的分析结果。
`;
    }
    
    private parseAnalysis(response: string, analysis: EnhancedProjectAnalysis, context: SelectedContext): any {
        return {
            // 基础分析结果
            projectFeatures: this.extractProjectFeatures(response),
            changeImpact: this.extractChangeImpact(response),
            marketingOpportunities: this.extractMarketingOpportunities(response),
            contentStrategy: this.extractContentStrategy(response),
            
            // 上下文信息
            contextInfo: {
                documentsAnalyzed: context.selectedFiles.length,
                totalTokens: context.totalTokens,
                contextStrategy: context.strategy.taskType,
                documentCategories: this.getDocumentCategories(context.selectedFiles)
            },
            
            // 项目洞察
            projectInsights: {
                techStackComplexity: this.calculateTechStackComplexity(analysis.structured.techStack),
                documentationQuality: this.assessDocumentationQuality(analysis.fullText),
                marketingReadiness: this.assessMarketingReadiness(analysis)
            },
            
            // 原始数据
            rawAnalysis: response,
            fullProjectAnalysis: analysis
        };
    }
    
    private extractProjectFeatures(text: string): string[] {
        const section = this.extractSection(text, '项目特性分析');
        return this.extractListItems(section);
    }
    
    private extractChangeImpact(text: string): any {
        const section = this.extractSection(text, '变更影响评估');
        return {
            changeType: this.extractValue(section, '变更类型'),
            impactLevel: this.extractValue(section, '重要性级别'),
            affectedAreas: this.extractListItems(section)
        };
    }
    
    private extractMarketingOpportunities(text: string): string[] {
        const section = this.extractSection(text, '营销机会识别');
        return this.extractListItems(section);
    }
    
    private extractContentStrategy(text: string): any {
        const section = this.extractSection(text, '内容策略建议');
        return {
            priorities: this.extractListItems(section),
            recommendations: this.extractListItems(section)
        };
    }
    
    private extractSection(text: string, sectionName: string): string {
        const regex = new RegExp(`${sectionName}[\\s\\S]*?(?=\\n##|$)`, 'i');
        const match = text.match(regex);
        return match ? match[0] : '';
    }
    
    private extractListItems(text: string): string[] {
        const lines = text.split('\n');
        return lines
            .filter(line => line.trim().match(/^[-*•]\s+/))
            .map(line => line.replace(/^[-*•]\s+/, '').trim())
            .filter(item => item.length > 0);
    }
    
    private extractValue(text: string, key: string): string {
        const regex = new RegExp(`${key}[：:][\\s]*([^\\n]+)`, 'i');
        const match = text.match(regex);
        return match ? match[1].trim() : '';
    }
    
    private getDocumentCategories(files: any[]): Record<string, number> {
        const categories: Record<string, number> = {};
        files.forEach(file => {
            categories[file.category] = (categories[file.category] || 0) + 1;
        });
        return categories;
    }
    
    private calculateTechStackComplexity(techStack: any[]): number {
        // 基于技术栈数量和类型计算复杂度
        const uniqueLanguages = new Set(techStack.map(t => t.language)).size;
        const frameworkCount = techStack.filter(t => t.framework).length;
        return Math.min(100, (uniqueLanguages * 20) + (frameworkCount * 15));
    }
    
    private assessDocumentationQuality(fullText: any): number {
        const { allMarkdownFiles, averagePriority } = fullText;
        const docCount = allMarkdownFiles.length;
        const avgPriority = averagePriority || 0;
        
        // 基于文档数量和平均优先级评估质量
        let quality = Math.min(50, docCount * 5); // 文档数量贡献
        quality += Math.min(50, avgPriority); // 优先级贡献
        
        return Math.round(quality);
    }
    
    private assessMarketingReadiness(analysis: EnhancedProjectAnalysis): number {
        let readiness = 0;
        
        // 基础信息完整性
        if (analysis.structured.metadata.description) readiness += 20;
        if (analysis.structured.metadata.keywords.length > 0) readiness += 10;
        
        // 文档完整性
        if (analysis.semiStructured.readme) readiness += 30;
        if (analysis.semiStructured.changelog) readiness += 10;
        if (analysis.semiStructured.userGuide) readiness += 15;
        
        // 技术栈清晰度
        if (analysis.structured.techStack.length > 0) readiness += 15;
        
        return Math.min(100, readiness);
    }
    
    private calculateConfidence(analysis: any): number {
        let confidence = 60; // 基础置信度
        
        // 基于分析深度
        if (analysis.projectFeatures.length > 3) confidence += 15;
        if (analysis.marketingOpportunities.length > 2) confidence += 10;
        if (analysis.contextInfo.documentsAnalyzed > 5) confidence += 10;
        if (analysis.projectInsights.documentationQuality > 70) confidence += 5;
        
        return Math.min(95, confidence);
    }
}
