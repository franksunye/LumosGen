/**
 * Content Analyzer Agent with Advanced Context Engineering
 * 
 * This agent leverages the context engineering system for superior
 * content strategy analysis with intelligent document selection and processing.
 */

import { BaseAgent, AgentResult, AgentContext } from './AgentSystem';
import { ProjectAnalysis } from '../analysis/ProjectAnalyzer';
import { ContextSelector, AITaskType, SelectedContext } from '../analysis/ContextSelector';

// 📊 内容分析Agent
export class ContentAnalyzerAgent extends BaseAgent {
    private contextSelector: ContextSelector;

    constructor() {
        super(
            'ContentAnalyzer',
            'Advanced Content Strategy Analyst',
            'Create sophisticated content strategies using comprehensive project context',
            `Expert content strategist with access to complete project documentation.
            Leverages advanced context engineering to identify content gaps, opportunities,
            and create data-driven content strategies for technical audiences.`
        );

        this.contextSelector = new ContextSelector();
    }

    async execute(input: any, context: AgentContext): Promise<AgentResult> {
        try {
            const { projectAnalysis, existingContent, targetAudience, contentType = 'marketing-content' } = input;

            // 选择适合内容分析的上下文
            const selectedContext = this.contextSelector.selectContext(projectAnalysis, contentType as AITaskType);

            // 生成内容策略提示
            const prompt = this.generateContentStrategyPrompt(projectAnalysis, selectedContext, existingContent, targetAudience);

            const response = await this.callLLM(prompt, context);
            const strategy = this.parseContentStrategy(response, selectedContext);

            return {
                success: true,
                data: strategy,
                metadata: {
                    executionTime: 0,
                    confidence: this.calculateStrategyConfidence(strategy),
                    contextDocuments: selectedContext.selectedFiles.length,
                    totalTokens: selectedContext.totalTokens,
                    taskType: contentType
                }
            };

        } catch (error) {
            return {
                success: false,
                data: null,
                error: error instanceof Error ? error.message : 'Content analysis failed'
            };
        }
    }

    private generateContentStrategyPrompt(
        projectAnalysis: ProjectAnalysis,
        selectedContext: SelectedContext,
        existingContent: string,
        targetAudience: string
    ): string {
        const documentContext = selectedContext.selectedFiles
            .map(file => `### ${file.category.toUpperCase()}: ${file.path}\n${file.content.substring(0, 1000)}${file.content.length > 1000 ? '...' : ''}`)
            .join('\n\n');

        return `
# 内容策略分析

## 项目概览
**名称**: ${projectAnalysis.metadata.name}
**描述**: ${projectAnalysis.metadata.description}
**技术栈**: ${projectAnalysis.techStack.map(t => t.language).join(', ')}
**目标受众**: ${targetAudience}

## 现有内容分析
${existingContent || '暂无现有内容'}

## 项目文档上下文 (${selectedContext.selectedFiles.length}个文档)
${selectedContext.selectionReason}

${documentContext}

## 内容策略要求

基于完整的项目信息和文档分析，请制定：

### 1. 内容差距分析
- 识别当前内容的不足之处
- 分析竞争对手可能的优势
- 确定急需补充的内容类型

### 2. 内容优先级矩阵
- 高影响力、低成本的快速胜利内容
- 高影响力、高成本的战略性内容
- 内容更新的时间线建议

### 3. 受众细分策略
- 主要受众群体特征分析
- 不同受众的内容偏好
- 个性化内容建议

### 4. SEO和发现性优化
- 关键词机会识别
- 内容结构优化建议
- 搜索意图匹配策略

### 5. 转化路径设计
- 用户旅程映射
- 内容漏斗设计
- CTA策略和位置建议

### 6. 内容格式和渠道策略
- 最适合的内容格式
- 分发渠道建议
- 跨平台内容适配

请提供具体、可执行的策略建议。
`;
    }

    private parseContentStrategy(response: string, context: SelectedContext): any {
        return {
            // 核心策略组件
            contentGaps: this.extractContentGaps(response),
            priorityMatrix: this.extractPriorityMatrix(response),
            audienceSegmentation: this.extractAudienceSegmentation(response),
            seoStrategy: this.extractSEOStrategy(response),
            conversionPath: this.extractConversionPath(response),
            contentFormats: this.extractContentFormats(response),

            // 上下文分析
            contextInsights: {
                documentTypes: this.analyzeDocumentTypes(context.selectedFiles),
                contentQuality: this.assessContentQuality(context.selectedFiles),
                technicalDepth: this.assessTechnicalDepth(context.selectedFiles)
            },

            // 执行建议
            actionPlan: this.generateActionPlan(response),
            timeline: this.extractTimeline(response),
            resources: this.extractResourceRequirements(response),

            // 元数据
            rawStrategy: response,
            contextUsed: context
        };
    }

    private extractContentGaps(text: string): string[] {
        const section = this.extractSection(text, '内容差距分析');
        return this.extractListItems(section);
    }

    private extractPriorityMatrix(text: string): any {
        const section = this.extractSection(text, '内容优先级矩阵');
        return {
            quickWins: this.extractSubsectionItems(section, '快速胜利'),
            strategic: this.extractSubsectionItems(section, '战略性'),
            timeline: this.extractSubsectionItems(section, '时间线')
        };
    }

    private extractAudienceSegmentation(text: string): any {
        const section = this.extractSection(text, '受众细分策略');
        return {
            primaryAudience: this.extractSubsectionItems(section, '主要受众'),
            preferences: this.extractSubsectionItems(section, '内容偏好'),
            personalization: this.extractSubsectionItems(section, '个性化')
        };
    }

    private extractSEOStrategy(text: string): any {
        const section = this.extractSection(text, 'SEO和发现性优化');
        return {
            keywords: this.extractSubsectionItems(section, '关键词'),
            structure: this.extractSubsectionItems(section, '结构优化'),
            searchIntent: this.extractSubsectionItems(section, '搜索意图')
        };
    }

    private extractConversionPath(text: string): any {
        const section = this.extractSection(text, '转化路径设计');
        return {
            userJourney: this.extractSubsectionItems(section, '用户旅程'),
            contentFunnel: this.extractSubsectionItems(section, '内容漏斗'),
            ctaStrategy: this.extractSubsectionItems(section, 'CTA策略')
        };
    }

    private extractContentFormats(text: string): string[] {
        const section = this.extractSection(text, '内容格式和渠道策略');
        return this.extractListItems(section);
    }

    private extractSection(text: string, sectionName: string): string {
        const regex = new RegExp(`${sectionName}[\\s\\S]*?(?=###|$)`, 'i');
        const match = text.match(regex);
        return match ? match[0] : '';
    }

    private extractSubsectionItems(text: string, subsectionName: string): string[] {
        const regex = new RegExp(`${subsectionName}[\\s\\S]*?(?=-|$)`, 'i');
        const match = text.match(regex);
        if (!match) return [];

        return this.extractListItems(match[0]);
    }

    private extractListItems(text: string): string[] {
        const lines = text.split('\n');
        return lines
            .filter(line => line.trim().match(/^[-*•]\s+/))
            .map(line => line.replace(/^[-*•]\s+/, '').trim())
            .filter(item => item.length > 0);
    }

    private analyzeDocumentTypes(files: any[]): Record<string, number> {
        const types: Record<string, number> = {};
        files.forEach(file => {
            types[file.category] = (types[file.category] || 0) + 1;
        });
        return types;
    }

    private assessContentQuality(files: any[]): number {
        if (files.length === 0) return 0;

        const avgPriority = files.reduce((sum, file) => sum + file.priority, 0) / files.length;
        const avgTokens = files.reduce((sum, file) => sum + file.tokenCount, 0) / files.length;

        // 基于优先级和内容长度评估质量
        return Math.round((avgPriority * 0.7) + (Math.min(avgTokens / 100, 30) * 0.3));
    }

    private assessTechnicalDepth(files: any[]): number {
        const technicalCategories = ['api', 'docs', 'config'];
        const technicalFiles = files.filter(file => technicalCategories.includes(file.category));

        if (files.length === 0) return 0;

        const technicalRatio = technicalFiles.length / files.length;
        const avgTechnicalPriority = technicalFiles.length > 0
            ? technicalFiles.reduce((sum, file) => sum + file.priority, 0) / technicalFiles.length
            : 0;

        return Math.round((technicalRatio * 50) + (avgTechnicalPriority * 0.5));
    }

    private generateActionPlan(text: string): string[] {
        // 从策略文本中提取可执行的行动项
        const lines = text.split('\n');
        return lines
            .filter(line => line.includes('建议') || line.includes('应该') || line.includes('需要'))
            .map(line => line.trim())
            .slice(0, 8);
    }

    private extractTimeline(text: string): string[] {
        const timelineSection = this.extractSection(text, '时间线');
        return this.extractListItems(timelineSection);
    }

    private extractResourceRequirements(text: string): string[] {
        // 提取资源需求
        const lines = text.split('\n');
        return lines
            .filter(line => line.includes('资源') || line.includes('人员') || line.includes('工具'))
            .map(line => line.trim())
            .slice(0, 5);
    }

    private calculateStrategyConfidence(strategy: any): number {
        let confidence = 65; // 基础置信度

        if (strategy.contentGaps.length > 2) confidence += 10;
        if (strategy.priorityMatrix.quickWins.length > 0) confidence += 8;
        if (strategy.seoStrategy.keywords.length > 0) confidence += 7;
        if (strategy.conversionPath.userJourney.length > 0) confidence += 5;
        if (strategy.contextInsights.contentQuality > 60) confidence += 5;

        return Math.min(90, confidence);
    }
}
