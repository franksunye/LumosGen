/**
 * LumosGen Specialized Agents
 * 
 * Lightweight agent implementations for LumosGen's marketing automation.
 * Designed to run embedded in VS Code extension without external dependencies.
 */

import { BaseAgent, AgentResult, AgentContext } from './simple-agent-system';

// 🔍 项目监控Agent
export class ProjectWatcherAgent extends BaseAgent {
  constructor() {
    super(
      'ProjectWatcher',
      'Project Monitor',
      'Analyze project changes and identify marketing content update opportunities',
      `Expert in project analysis and change detection. Specializes in understanding 
      VS Code extensions, developer tools, and identifying meaningful changes that 
      impact marketing content. Skilled in tech stack identification and feature analysis.`
    );
  }

  async execute(input: any, context: AgentContext): Promise<AgentResult> {
    try {
      const { projectPath, changedFiles, projectInfo } = input;
      
      const prompt = `
Analyze the following project changes and determine their marketing impact:

Project Information:
${JSON.stringify(projectInfo, null, 2)}

Changed Files:
${changedFiles ? changedFiles.join('\n') : 'No specific files provided'}

Project Path: ${projectPath}

Please analyze:
1. What type of changes occurred (features, bug fixes, documentation, etc.)
2. Impact level on marketing content (high/medium/low)
3. Specific marketing areas that need updates
4. Key value propositions that should be highlighted
5. Target audience considerations

Provide a structured analysis with actionable recommendations.
`;

      const response = await this.callLLM(prompt, context);
      
      // 解析响应并结构化
      const analysis = this.parseProjectAnalysis(response);
      
      return {
        success: true,
        data: analysis,
        metadata: {
          executionTime: 0, // 将在workflow中设置
          confidence: this.calculateConfidence(analysis)
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

  private parseProjectAnalysis(response: string): any {
    // 简单的响应解析逻辑
    return {
      changeType: this.extractSection(response, 'type of changes'),
      impactLevel: this.extractImpactLevel(response),
      marketingAreas: this.extractMarketingAreas(response),
      valuePropositions: this.extractValuePropositions(response),
      recommendations: this.extractRecommendations(response),
      rawAnalysis: response
    };
  }

  private extractSection(text: string, section: string): string {
    const regex = new RegExp(`${section}[:\\s]*([^\\n]+)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  }

  private extractImpactLevel(text: string): 'high' | 'medium' | 'low' {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('high impact') || lowerText.includes('significant')) return 'high';
    if (lowerText.includes('medium impact') || lowerText.includes('moderate')) return 'medium';
    return 'low';
  }

  private extractMarketingAreas(text: string): string[] {
    // 简单的关键词提取
    const areas = [];
    if (text.toLowerCase().includes('homepage')) areas.push('homepage');
    if (text.toLowerCase().includes('features')) areas.push('features');
    if (text.toLowerCase().includes('documentation')) areas.push('documentation');
    if (text.toLowerCase().includes('about')) areas.push('about');
    return areas;
  }

  private extractValuePropositions(text: string): string[] {
    // 提取价值主张的简单逻辑
    const lines = text.split('\n');
    return lines
      .filter(line => line.includes('value') || line.includes('benefit') || line.includes('advantage'))
      .map(line => line.trim())
      .slice(0, 3); // 最多3个
  }

  private extractRecommendations(text: string): string[] {
    const lines = text.split('\n');
    return lines
      .filter(line => line.includes('recommend') || line.includes('should') || line.includes('update'))
      .map(line => line.trim())
      .slice(0, 5); // 最多5个建议
  }

  private calculateConfidence(analysis: any): number {
    let confidence = 50; // 基础置信度
    
    if (analysis.impactLevel === 'high') confidence += 30;
    else if (analysis.impactLevel === 'medium') confidence += 20;
    else confidence += 10;
    
    if (analysis.marketingAreas.length > 0) confidence += 10;
    if (analysis.valuePropositions.length > 0) confidence += 10;
    
    return Math.min(confidence, 95); // 最高95%
  }
}

// 📊 内容分析Agent
export class ContentAnalyzerAgent extends BaseAgent {
  constructor() {
    super(
      'ContentAnalyzer',
      'Content Strategy Analyst',
      'Analyze existing content and create strategic recommendations for updates',
      `Expert content strategist specializing in developer tools and technical products.
      Skilled in content gap analysis, SEO optimization, and conversion optimization.
      Understands developer audiences and technical marketing best practices.`
    );
  }

  async execute(input: any, context: AgentContext): Promise<AgentResult> {
    try {
      const { projectAnalysis, existingContent, targetAudience } = input;
      
      const prompt = `
Based on the project analysis, create a content strategy:

Project Analysis:
${JSON.stringify(projectAnalysis, null, 2)}

Existing Content:
${existingContent || 'No existing content provided'}

Target Audience: ${targetAudience}

Please provide:
1. Content gap analysis
2. Priority areas for content updates
3. Messaging strategy and tone recommendations
4. SEO optimization opportunities
5. Content structure recommendations
6. Call-to-action strategy

Focus on developer-friendly content that converts technical audiences.
`;

      const response = await this.callLLM(prompt, context);
      const strategy = this.parseContentStrategy(response);
      
      return {
        success: true,
        data: strategy,
        metadata: {
          executionTime: 0,
          confidence: this.calculateStrategyConfidence(strategy)
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

  private parseContentStrategy(response: string): any {
    return {
      contentGaps: this.extractContentGaps(response),
      priorities: this.extractPriorities(response),
      messaging: this.extractMessaging(response),
      seoOpportunities: this.extractSEOOpportunities(response),
      contentStructure: this.extractContentStructure(response),
      ctaStrategy: this.extractCTAStrategy(response),
      rawStrategy: response
    };
  }

  private extractContentGaps(text: string): string[] {
    const lines = text.split('\n');
    return lines
      .filter(line => line.toLowerCase().includes('gap') || line.toLowerCase().includes('missing'))
      .map(line => line.trim())
      .slice(0, 5);
  }

  private extractPriorities(text: string): string[] {
    const lines = text.split('\n');
    return lines
      .filter(line => line.toLowerCase().includes('priority') || line.toLowerCase().includes('important'))
      .map(line => line.trim())
      .slice(0, 3);
  }

  private extractMessaging(text: string): string {
    const messagingSection = text.match(/messaging[^:]*:([^.]+)/i);
    return messagingSection ? messagingSection[1].trim() : '';
  }

  private extractSEOOpportunities(text: string): string[] {
    const lines = text.split('\n');
    return lines
      .filter(line => line.toLowerCase().includes('seo') || line.toLowerCase().includes('keyword'))
      .map(line => line.trim())
      .slice(0, 3);
  }

  private extractContentStructure(text: string): string[] {
    const lines = text.split('\n');
    return lines
      .filter(line => line.toLowerCase().includes('structure') || line.toLowerCase().includes('section'))
      .map(line => line.trim())
      .slice(0, 4);
  }

  private extractCTAStrategy(text: string): string[] {
    const lines = text.split('\n');
    return lines
      .filter(line => line.toLowerCase().includes('cta') || line.toLowerCase().includes('call-to-action'))
      .map(line => line.trim())
      .slice(0, 3);
  }

  private calculateStrategyConfidence(strategy: any): number {
    let confidence = 60;
    
    if (strategy.contentGaps.length > 0) confidence += 10;
    if (strategy.priorities.length > 0) confidence += 10;
    if (strategy.messaging) confidence += 10;
    if (strategy.seoOpportunities.length > 0) confidence += 5;
    if (strategy.contentStructure.length > 0) confidence += 5;
    
    return Math.min(confidence, 90);
  }
}

// 📝 内容生成Agent
export class ContentGeneratorAgent extends BaseAgent {
  constructor() {
    super(
      'ContentGenerator',
      'Marketing Content Creator',
      'Generate compelling marketing content based on project analysis and content strategy',
      `Professional copywriter specializing in developer tools and technical products.
      Expert in creating clear, engaging content that converts technical audiences.
      Skilled in SEO optimization, conversion copywriting, and developer-focused messaging.`
    );
  }

  async execute(input: any, context: AgentContext): Promise<AgentResult> {
    try {
      const { projectAnalysis, contentStrategy, contentType } = input;
      
      const prompt = `
Generate ${contentType || 'marketing'} content based on:

Project Analysis:
${JSON.stringify(projectAnalysis, null, 2)}

Content Strategy:
${JSON.stringify(contentStrategy, null, 2)}

Please create:
1. Compelling headline and subheadline
2. Key feature highlights with benefits
3. Value proposition statements
4. Call-to-action copy
5. SEO-optimized meta descriptions

Target audience: Developers and technical teams
Tone: Professional yet approachable, technical but accessible
Format: Ready-to-use marketing copy in Markdown format
`;

      const response = await this.callLLM(prompt, context);
      const content = this.parseGeneratedContent(response);
      
      return {
        success: true,
        data: content,
        metadata: {
          executionTime: 0,
          confidence: this.calculateContentQuality(content)
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

  private parseGeneratedContent(response: string): any {
    return {
      headline: this.extractHeadline(response),
      subheadline: this.extractSubheadline(response),
      features: this.extractFeatures(response),
      valueProposition: this.extractValueProposition(response),
      callToAction: this.extractCallToAction(response),
      metaDescription: this.extractMetaDescription(response),
      fullContent: response
    };
  }

  private extractHeadline(text: string): string {
    const headlineMatch = text.match(/(?:headline|title)[:\s]*([^\n]+)/i);
    return headlineMatch ? headlineMatch[1].trim() : '';
  }

  private extractSubheadline(text: string): string {
    const subheadlineMatch = text.match(/(?:subheadline|subtitle)[:\s]*([^\n]+)/i);
    return subheadlineMatch ? subheadlineMatch[1].trim() : '';
  }

  private extractFeatures(text: string): string[] {
    const lines = text.split('\n');
    return lines
      .filter(line => line.includes('feature') || line.includes('•') || line.includes('-'))
      .map(line => line.trim())
      .slice(0, 4);
  }

  private extractValueProposition(text: string): string {
    const vpMatch = text.match(/(?:value proposition|value)[:\s]*([^.]+)/i);
    return vpMatch ? vpMatch[1].trim() : '';
  }

  private extractCallToAction(text: string): string {
    const ctaMatch = text.match(/(?:call-to-action|cta)[:\s]*([^\n]+)/i);
    return ctaMatch ? ctaMatch[1].trim() : '';
  }

  private extractMetaDescription(text: string): string {
    const metaMatch = text.match(/(?:meta description|description)[:\s]*([^\n]+)/i);
    return metaMatch ? metaMatch[1].trim() : '';
  }

  private calculateContentQuality(content: any): number {
    let quality = 50;
    
    if (content.headline) quality += 15;
    if (content.subheadline) quality += 10;
    if (content.features.length > 0) quality += 10;
    if (content.valueProposition) quality += 10;
    if (content.callToAction) quality += 5;
    
    return Math.min(quality, 85);
  }
}
