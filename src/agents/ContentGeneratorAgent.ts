/**
 * Content Generator Agent with Advanced Context Engineering
 * 
 * This agent leverages the context engineering system for superior
 * marketing content generation with intelligent document selection and processing.
 */

import { BaseAgent, AgentResult, AgentContext } from './AgentSystem';
import { EnhancedProjectAnalysis } from '../analysis/EnhancedProjectAnalyzer';
import { ContextSelector, AITaskType, SelectedContext } from '../analysis/ContextSelector';

// 📝 内容生成Agent
export class ContentGeneratorAgent extends BaseAgent {
    private contextSelector: ContextSelector;

    constructor() {
        super(
            'ContentGenerator',
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

            // 生成内容生成提示
            const prompt = this.generateContentPrompt(
                projectAnalysis,
                contentStrategy,
                selectedContext,
                contentType,
                targetAudience,
                tone
            );

            const response = await this.callLLM(prompt, context);
            const content = this.parseContent(response, selectedContext, contentType);

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
                error: error instanceof Error ? error.message : 'Content generation failed'
            };
        }
    }

    private generateContentPrompt(
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
# 营销内容生成任务

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

    private parseContent(response: string, context: SelectedContext, contentType: string): any {
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

            // 内容分析
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
            .replace(/^#+ 营销内容生成任务[\s\S]*?(?=^#[^#])/m, '') // 移除任务说明
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

        // 分析分数
        quality += content.contentAnalysis.technicalAccuracy * 0.08;
        quality += content.contentAnalysis.audienceAlignment * 0.06;
        quality += content.contentAnalysis.conversionPotential * 0.05;
        quality += content.contentAnalysis.seoOptimization * 0.03;

        return Math.min(95, Math.round(quality));
    }
}
