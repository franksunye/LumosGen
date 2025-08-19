/**
 * Enhanced LumosGen Agents with Advanced Context Engineering
 * 
 * These agents leverage the new context engineering system for superior
 * content generation with intelligent document selection and processing.
 */

import { BaseAgent, AgentResult, AgentContext } from './simple-agent-system';
import { EnhancedProjectAnalyzer, EnhancedProjectAnalysis } from '../analysis/EnhancedProjectAnalyzer';
import { ContextSelector, AITaskType, SelectedContext } from '../analysis/ContextSelector';
import * as vscode from 'vscode';

// 🔍 增强项目监控Agent
export class EnhancedProjectWatcherAgent extends BaseAgent {
    private analyzer: EnhancedProjectAnalyzer;
    private contextSelector: ContextSelector;
    
    constructor(workspaceRoot: string, outputChannel: vscode.OutputChannel) {
        super(
            'EnhancedProjectWatcher',
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
            
            // 执行增强项目分析
            const analysis = await this.analyzer.analyzeProjectEnhanced(strategy);
            
            // 为项目分析任务选择最佳上下文
            const selectedContext = this.contextSelector.selectContext(analysis, 'project-analysis');
            
            // 生成增强的分析提示
            const prompt = this.generateEnhancedAnalysisPrompt(analysis, selectedContext, changedFiles);
            
            const response = await this.callLLM(prompt, context);
            const enhancedAnalysis = this.parseEnhancedAnalysis(response, analysis, selectedContext);
            
            return {
                success: true,
                data: enhancedAnalysis,
                metadata: {
                    executionTime: 0,
                    confidence: this.calculateEnhancedConfidence(enhancedAnalysis),
                    contextStrategy: strategy,
                    documentsAnalyzed: selectedContext.selectedFiles.length,
                    totalTokens: selectedContext.totalTokens
                }
            };
            
        } catch (error) {
            return {
                success: false,
                data: null,
                error: error instanceof Error ? error.message : 'Enhanced project analysis failed'
            };
        }
    }
    
    private generateEnhancedAnalysisPrompt(
        analysis: EnhancedProjectAnalysis, 
        selectedContext: SelectedContext, 
        changedFiles: string[]
    ): string {
        const structuredData = selectedContext.structured;
        const documentContext = selectedContext.selectedFiles
            .map(file => `## ${file.path}\n${file.content}`)
            .join('\n\n');
        
        return `
# 增强项目分析任务

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
    
    private parseEnhancedAnalysis(response: string, analysis: EnhancedProjectAnalysis, context: SelectedContext): any {
        return {
            // 基础分析结果
            projectFeatures: this.extractProjectFeatures(response),
            changeImpact: this.extractChangeImpact(response),
            marketingOpportunities: this.extractMarketingOpportunities(response),
            contentStrategy: this.extractContentStrategy(response),
            
            // 增强信息
            enhancedContext: {
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
    
    private calculateEnhancedConfidence(analysis: any): number {
        let confidence = 60; // 基础置信度
        
        // 基于分析深度
        if (analysis.projectFeatures.length > 3) confidence += 15;
        if (analysis.marketingOpportunities.length > 2) confidence += 10;
        if (analysis.enhancedContext.documentsAnalyzed > 5) confidence += 10;
        if (analysis.projectInsights.documentationQuality > 70) confidence += 5;
        
        return Math.min(95, confidence);
    }
}

// 📊 增强内容分析Agent
export class EnhancedContentAnalyzerAgent extends BaseAgent {
    private contextSelector: ContextSelector;

    constructor() {
        super(
            'EnhancedContentAnalyzer',
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

            // 生成增强的内容策略提示
            const prompt = this.generateContentStrategyPrompt(projectAnalysis, selectedContext, existingContent, targetAudience);

            const response = await this.callLLM(prompt, context);
            const strategy = this.parseEnhancedContentStrategy(response, selectedContext);

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
                error: error instanceof Error ? error.message : 'Enhanced content analysis failed'
            };
        }
    }

    private generateContentStrategyPrompt(
        projectAnalysis: EnhancedProjectAnalysis,
        selectedContext: SelectedContext,
        existingContent: string,
        targetAudience: string
    ): string {
        const documentContext = selectedContext.selectedFiles
            .map(file => `### ${file.category.toUpperCase()}: ${file.path}\n${file.content.substring(0, 1000)}${file.content.length > 1000 ? '...' : ''}`)
            .join('\n\n');

        return `
# 增强内容策略分析

## 项目概览
**名称**: ${projectAnalysis.structured.metadata.name}
**描述**: ${projectAnalysis.structured.metadata.description}
**技术栈**: ${projectAnalysis.structured.techStack.map(t => t.language).join(', ')}
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

    private parseEnhancedContentStrategy(response: string, context: SelectedContext): any {
        return {
            // 核心策略组件
            contentGaps: this.extractContentGaps(response),
            priorityMatrix: this.extractPriorityMatrix(response),
            audienceSegmentation: this.extractAudienceSegmentation(response),
            seoStrategy: this.extractSEOStrategy(response),
            conversionPath: this.extractConversionPath(response),
            contentFormats: this.extractContentFormats(response),

            // 增强分析
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

// 📝 增强内容生成Agent
export class EnhancedContentGeneratorAgent extends BaseAgent {
    private contextSelector: ContextSelector;

    constructor() {
        super(
            'EnhancedContentGenerator',
            'Advanced Marketing Content Creator',
            'Generate superior marketing content using comprehensive project context and intelligent document selection',
            `Elite copywriter with access to complete project documentation and context.
            Specializes in creating compelling, technically accurate content that resonates
            with developer audiences while maintaining high conversion potential.`
        );

        this.contextSelector = new ContextSelector();
    }

    async execute(input: any, context: AgentContext): Promise<AgentResult> {
        try {
            const {
                projectAnalysis,
                contentStrategy,
                contentType = 'marketing-content',
                targetAudience = 'developers and technical teams',
                tone = 'professional yet approachable'
            } = input;

            // 为特定内容类型选择最佳上下文
            const selectedContext = this.contextSelector.selectContext(projectAnalysis, contentType as AITaskType);

            // 生成增强的内容生成提示
            const prompt = this.generateEnhancedContentPrompt(
                projectAnalysis,
                contentStrategy,
                selectedContext,
                contentType,
                targetAudience,
                tone
            );

            const response = await this.callLLM(prompt, context);
            const content = this.parseEnhancedContent(response, selectedContext, contentType);

            return {
                success: true,
                data: content,
                metadata: {
                    executionTime: 0,
                    confidence: this.calculateContentQuality(content),
                    contextDocuments: selectedContext.selectedFiles.length,
                    totalTokens: selectedContext.totalTokens,
                    contentType,
                    targetAudience,
                    tone
                }
            };

        } catch (error) {
            return {
                success: false,
                data: null,
                error: error instanceof Error ? error.message : 'Enhanced content generation failed'
            };
        }
    }

    private generateEnhancedContentPrompt(
        projectAnalysis: EnhancedProjectAnalysis,
        contentStrategy: any,
        selectedContext: SelectedContext,
        contentType: string,
        targetAudience: string,
        tone: string
    ): string {
        const projectInfo = selectedContext.structured;
        const documentContext = selectedContext.selectedFiles
            .slice(0, 5) // 限制最重要的5个文档
            .map(file => `### ${file.category.toUpperCase()}: ${file.path}\n${file.content}`)
            .join('\n\n---\n\n');

        return `
# 增强营销内容生成任务

## 项目核心信息
**名称**: ${projectInfo?.metadata.name}
**描述**: ${projectInfo?.metadata.description}
**版本**: ${projectInfo?.metadata.version}
**技术栈**: ${projectInfo?.techStack.map(t => `${t.language}${t.framework ? ` (${t.framework})` : ''}`).join(', ')}
**关键词**: ${projectInfo?.metadata.keywords.join(', ')}

## 内容策略指导
${contentStrategy ? JSON.stringify(contentStrategy, null, 2) : '无特定策略指导'}

## 项目文档上下文
${selectedContext.selectionReason}

${documentContext}

## 内容生成要求

**内容类型**: ${contentType}
**目标受众**: ${targetAudience}
**语调风格**: ${tone}

### 生成内容结构要求：

1. **引人注目的标题**
   - 突出核心价值主张
   - 包含关键技术特性
   - 面向目标受众

2. **副标题和简介**
   - 扩展价值主张
   - 解释解决的问题
   - 建立技术可信度

3. **核心功能亮点**
   - 基于实际项目功能
   - 突出技术优势
   - 包含具体示例

4. **技术价值主张**
   - 解决的开发者痛点
   - 技术创新点
   - 与竞品的差异化

5. **使用场景和案例**
   - 实际应用场景
   - 目标用户工作流集成
   - 具体收益量化

6. **行动号召**
   - 清晰的下一步指引
   - 降低使用门槛
   - 多层次转化路径

### 内容质量标准：
- 技术准确性：基于真实项目信息
- 受众相关性：符合开发者需求和语言习惯
- 转化导向：每个部分都有明确目的
- SEO友好：自然融入相关关键词
- 可扫描性：清晰的结构和重点突出

### 输出格式：
请以Markdown格式输出，包含：
- 完整的营销页面内容
- SEO元数据建议
- 社交媒体摘要版本
- 关键消息提取

确保内容既专业又易懂，既技术准确又具有说服力。
`;
    }

    private parseEnhancedContent(response: string, context: SelectedContext, contentType: string): any {
        return {
            // 主要内容组件
            headline: this.extractHeadline(response),
            subheadline: this.extractSubheadline(response),
            introduction: this.extractIntroduction(response),
            features: this.extractFeatures(response),
            valueProposition: this.extractValueProposition(response),
            useCases: this.extractUseCases(response),
            callToAction: this.extractCallToAction(response),

            // SEO和营销组件
            seoMetadata: this.extractSEOMetadata(response),
            socialMediaSummary: this.extractSocialMediaSummary(response),
            keyMessages: this.extractKeyMessages(response),

            // 增强分析
            contentAnalysis: {
                technicalAccuracy: this.assessTechnicalAccuracy(response, context),
                audienceAlignment: this.assessAudienceAlignment(response),
                conversionPotential: this.assessConversionPotential(response),
                seoOptimization: this.assessSEOOptimization(response)
            },

            // 完整内容
            fullMarkdownContent: this.extractFullMarkdown(response),

            // 元数据
            generationContext: {
                contentType,
                documentsUsed: context.selectedFiles.length,
                totalTokens: context.totalTokens,
                contextStrategy: context.strategy.taskType
            },

            rawResponse: response
        };
    }

    private extractHeadline(text: string): string {
        // 查找主标题
        const patterns = [
            /^#\s+(.+)$/m,
            /(?:标题|headline|title)[：:]\s*(.+)$/im,
            /^(.+)(?=\n[=-]{3,})/m
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1].trim().length > 0) {
                return match[1].trim();
            }
        }

        return '';
    }

    private extractSubheadline(text: string): string {
        const patterns = [
            /^##\s+(.+)$/m,
            /(?:副标题|subheadline|subtitle)[：:]\s*(.+)$/im
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1].trim().length > 0) {
                return match[1].trim();
            }
        }

        return '';
    }

    private extractIntroduction(text: string): string {
        // 提取介绍段落
        const introSection = text.match(/(?:简介|introduction|概述)[：:]?\s*\n?([\s\S]*?)(?=\n##|\n###|$)/i);
        return introSection ? introSection[1].trim() : '';
    }

    private extractFeatures(text: string): string[] {
        const featureSection = text.match(/(?:功能|features|特性)[：:]?\s*\n?([\s\S]*?)(?=\n##|\n###|$)/i);
        if (!featureSection) return [];

        return this.extractListItems(featureSection[1]);
    }

    private extractValueProposition(text: string): string {
        const vpSection = text.match(/(?:价值主张|value proposition|核心价值)[：:]?\s*\n?([\s\S]*?)(?=\n##|\n###|$)/i);
        return vpSection ? vpSection[1].trim() : '';
    }

    private extractUseCases(text: string): string[] {
        const useCaseSection = text.match(/(?:使用场景|use cases|应用场景)[：:]?\s*\n?([\s\S]*?)(?=\n##|\n###|$)/i);
        if (!useCaseSection) return [];

        return this.extractListItems(useCaseSection[1]);
    }

    private extractCallToAction(text: string): string {
        const ctaSection = text.match(/(?:行动号召|call to action|cta)[：:]?\s*\n?([\s\S]*?)(?=\n##|\n###|$)/i);
        return ctaSection ? ctaSection[1].trim() : '';
    }

    private extractSEOMetadata(text: string): any {
        const seoSection = text.match(/(?:SEO|元数据|metadata)[：:]?\s*\n?([\s\S]*?)(?=\n##|\n###|$)/i);
        if (!seoSection) return {};

        const content = seoSection[1];
        return {
            title: this.extractValue(content, 'title'),
            description: this.extractValue(content, 'description'),
            keywords: this.extractValue(content, 'keywords')?.split(',').map(k => k.trim()) || []
        };
    }

    private extractSocialMediaSummary(text: string): string {
        const socialSection = text.match(/(?:社交媒体|social media|摘要)[：:]?\s*\n?([\s\S]*?)(?=\n##|\n###|$)/i);
        return socialSection ? socialSection[1].trim() : '';
    }

    private extractKeyMessages(text: string): string[] {
        const keySection = text.match(/(?:关键消息|key messages|核心信息)[：:]?\s*\n?([\s\S]*?)(?=\n##|\n###|$)/i);
        if (!keySection) return [];

        return this.extractListItems(keySection[1]);
    }

    private extractFullMarkdown(text: string): string {
        // 清理和格式化完整的Markdown内容
        return text
            .replace(/^#+ 增强营销内容生成任务[\s\S]*?(?=^#[^#])/m, '') // 移除任务说明
            .replace(/^## 项目核心信息[\s\S]*?(?=^#[^#])/m, '') // 移除项目信息
            .trim();
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

    private assessTechnicalAccuracy(content: string, context: SelectedContext): number {
        // 基于使用的技术文档数量和质量评估技术准确性
        const technicalDocs = context.selectedFiles.filter(f =>
            ['api', 'docs', 'config'].includes(f.category)
        );

        let accuracy = 50; // 基础分数

        if (technicalDocs.length > 0) accuracy += 20;
        if (technicalDocs.length > 2) accuracy += 10;

        // 检查内容中是否包含技术细节
        const technicalTerms = ['API', 'framework', 'library', 'configuration', 'installation'];
        const mentionedTerms = technicalTerms.filter(term =>
            content.toLowerCase().includes(term.toLowerCase())
        );

        accuracy += mentionedTerms.length * 4;

        return Math.min(100, accuracy);
    }

    private assessAudienceAlignment(content: string): number {
        // 评估内容与开发者受众的匹配度
        const developerTerms = ['developer', 'code', 'programming', 'development', 'technical', 'API', 'framework'];
        const professionalTone = ['efficient', 'reliable', 'scalable', 'maintainable', 'robust'];

        let alignment = 40;

        developerTerms.forEach(term => {
            if (content.toLowerCase().includes(term)) alignment += 5;
        });

        professionalTone.forEach(term => {
            if (content.toLowerCase().includes(term)) alignment += 3;
        });

        return Math.min(100, alignment);
    }

    private assessConversionPotential(content: string): number {
        // 评估转化潜力
        const conversionElements = ['get started', 'try', 'download', 'install', 'learn more', 'documentation'];
        const benefitWords = ['save', 'improve', 'faster', 'easier', 'better', 'efficient'];

        let potential = 30;

        conversionElements.forEach(element => {
            if (content.toLowerCase().includes(element)) potential += 8;
        });

        benefitWords.forEach(word => {
            if (content.toLowerCase().includes(word)) potential += 4;
        });

        return Math.min(100, potential);
    }

    private assessSEOOptimization(content: string): number {
        // 评估SEO优化程度
        let seoScore = 20;

        // 检查标题结构
        const headings = content.match(/^#{1,6}\s+/gm) || [];
        if (headings.length > 0) seoScore += 15;
        if (headings.length > 3) seoScore += 10;

        // 检查内容长度
        const wordCount = content.split(/\s+/).length;
        if (wordCount > 300) seoScore += 15;
        if (wordCount > 600) seoScore += 10;

        // 检查关键词密度
        const techKeywords = ['AI', 'automation', 'developer', 'tool', 'extension'];
        techKeywords.forEach(keyword => {
            if (content.toLowerCase().includes(keyword.toLowerCase())) seoScore += 5;
        });

        return Math.min(100, seoScore);
    }

    private calculateContentQuality(content: any): number {
        let quality = 50;

        // 基础内容完整性
        if (content.headline) quality += 10;
        if (content.subheadline) quality += 8;
        if (content.features.length > 0) quality += 10;
        if (content.valueProposition) quality += 8;
        if (content.callToAction) quality += 6;

        // 增强分析分数
        quality += content.contentAnalysis.technicalAccuracy * 0.08;
        quality += content.contentAnalysis.audienceAlignment * 0.06;
        quality += content.contentAnalysis.conversionPotential * 0.05;
        quality += content.contentAnalysis.seoOptimization * 0.03;

        return Math.min(95, Math.round(quality));
    }
}
