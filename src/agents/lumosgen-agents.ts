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
${Array.isArray(changedFiles) ? changedFiles.join('\n') : (changedFiles || 'No specific files provided')}

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

// 🏗️ 网站构建Agent
export class WebsiteBuilderAgent extends BaseAgent {
  constructor() {
    super(
      'WebsiteBuilder',
      'Website Builder Specialist',
      'Expert in building responsive marketing websites with modern design principles and SEO optimization.',
      'Build professional marketing websites from generated content with responsive design, SEO optimization, and modern web standards.'
    );
  }

  async execute(input: any, context: AgentContext): Promise<AgentResult> {
    try {
      const { projectAnalysis, marketingContent, projectPath } = input;

      if (!projectAnalysis || !marketingContent) {
        return {
          success: false,
          error: 'Missing required input: projectAnalysis and marketingContent are required'
        };
      }

      // 使用真实的网站构建过程
      const safeProjectPath = this.getSafeProjectPath(projectPath);
      const websiteResult = await this.buildWebsiteWithMockData(projectAnalysis, marketingContent, safeProjectPath);

      return {
        success: true,
        data: websiteResult,
        metadata: {
          agent: this.name,
          timestamp: new Date().toISOString(),
          buildTime: '< 5 seconds',
          features: ['Responsive Design', 'SEO Optimized', 'Modern Templates']
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Website building failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async buildWebsiteWithMockData(projectAnalysis: any, marketingContent: any, projectPath: string) {
    // 模拟网站构建过程
    await new Promise(resolve => setTimeout(resolve, 1000));

    const websiteStructure = {
      pages: {
        'index.html': this.generateHomepage(marketingContent),
        'about.html': this.generateAboutPage(marketingContent.about || 'About our project'),
        'blog.html': this.generateBlogPage(marketingContent.blog || 'Latest updates'),
        'faq.html': this.generateFAQPage(marketingContent.faq || 'Frequently asked questions')
      },
      assets: {
        'styles.css': this.generateCSS(),
        'script.js': this.generateJavaScript()
      },
      seo: {
        sitemap: this.generateSitemap(),
        robots: this.generateRobots(),
        metadata: this.generateMetadata(projectAnalysis)
      },
      buildInfo: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        framework: 'Static HTML/CSS/JS',
        responsive: true,
        seoOptimized: true
      }
    };

    // Actually write files to disk
    const outputPath = await this.writeWebsiteFiles(websiteStructure, projectPath);

    return {
      success: true,
      websiteUrl: `file:///${outputPath}/index.html`,
      outputPath: outputPath,
      pages: Object.keys(websiteStructure.pages),
      assets: Object.keys(websiteStructure.assets),
      seoFeatures: Object.keys(websiteStructure.seo),
      buildInfo: websiteStructure.buildInfo,
      data: {
        pages: Object.keys(websiteStructure.pages),
        assets: Object.keys(websiteStructure.assets),
        seoFeatures: Object.keys(websiteStructure.seo),
        outputPath: outputPath,
        websiteUrl: `file:///${outputPath}/index.html`
      }
    };
  }

  private async writeWebsiteFiles(websiteStructure: any, projectPath: string): Promise<string> {
    const fs = require('fs').promises;
    const path = require('path');

    // Create output directory
    const outputDir = path.join(projectPath, 'lumosgen-website');

    try {
      // Create main directory
      await fs.mkdir(outputDir, { recursive: true });

      // Write HTML pages
      for (const [filename, content] of Object.entries(websiteStructure.pages)) {
        const filePath = path.join(outputDir, filename);
        const stringContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
        await fs.writeFile(filePath, stringContent, 'utf8');
      }

      // Write assets
      for (const [filename, content] of Object.entries(websiteStructure.assets)) {
        const filePath = path.join(outputDir, filename);
        const stringContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
        await fs.writeFile(filePath, stringContent, 'utf8');
      }

      // Write SEO files
      for (const [filename, content] of Object.entries(websiteStructure.seo)) {
        const filePath = path.join(outputDir, `${filename}.txt`);
        const stringContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
        await fs.writeFile(filePath, stringContent, 'utf8');
      }

      // Write build info
      const buildInfoPath = path.join(outputDir, 'build-info.json');
      await fs.writeFile(buildInfoPath, JSON.stringify(websiteStructure.buildInfo, null, 2), 'utf8');

      return outputDir;
    } catch (error) {
      console.error('Error writing website files:', error);
      throw error;
    }
  }

  private generateHomepage(marketingContent: any): string {
    // Extract content from marketing content object
    const headline = marketingContent.headline || 'Transform Your Development Workflow';
    const subheadline = marketingContent.subheadline || 'AI-Powered VS Code Extension for Effortless Marketing';
    const features = marketingContent.features || [];
    const valueProposition = marketingContent.valueProposition || 'LumosGen revolutionizes how developers create marketing content.';
    const callToAction = marketingContent.callToAction || 'Get Started Today';
    const fullContent = marketingContent.fullContent || '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${headline} - LumosGen</title>
    <meta name="description" content="${marketingContent.metaDescription || subheadline}">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <nav>
            <div class="logo">LumosGen</div>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="about.html">About</a></li>
                <li><a href="blog.html">Blog</a></li>
                <li><a href="faq.html">FAQ</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section class="hero">
            <h1>${headline}</h1>
            <h2>${subheadline}</h2>
            <p class="value-proposition">${valueProposition}</p>

            ${features.length > 0 ? `
            <div class="features">
                <h3>Key Features</h3>
                <ul>
                    ${features.map((feature: string) => `<li>${this.convertMarkdownToHTML(feature)}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            ${fullContent ? `
            <div class="full-content">
                ${this.convertMarkdownToHTML(fullContent)}
            </div>
            ` : ''}

            <div class="cta-section">
                <button class="cta-button">${callToAction}</button>
            </div>
        </section>
    </main>
    <footer>
        <p>&copy; 2025 LumosGen. Built with AI-powered automation.</p>
    </footer>
    <script src="script.js"></script>
</body>
</html>`;
  }

  private generateAboutPage(content: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About - LumosGen</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <nav>
            <div class="logo">LumosGen</div>
            <ul>
                <li><a href="index.html">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="blog.html">Blog</a></li>
                <li><a href="faq.html">FAQ</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section class="content">
            ${this.convertMarkdownToHTML(content)}
        </section>
    </main>
    <footer>
        <p>&copy; 2025 LumosGen. Built with AI-powered automation.</p>
    </footer>
</body>
</html>`;
  }

  private generateBlogPage(content: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog - LumosGen</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <nav>
            <div class="logo">LumosGen</div>
            <ul>
                <li><a href="index.html">Home</a></li>
                <li><a href="about.html">About</a></li>
                <li><a href="#blog">Blog</a></li>
                <li><a href="faq.html">FAQ</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section class="content">
            ${this.convertMarkdownToHTML(content)}
        </section>
    </main>
    <footer>
        <p>&copy; 2025 LumosGen. Built with AI-powered automation.</p>
    </footer>
</body>
</html>`;
  }

  private generateFAQPage(content: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FAQ - LumosGen</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <nav>
            <div class="logo">LumosGen</div>
            <ul>
                <li><a href="index.html">Home</a></li>
                <li><a href="about.html">About</a></li>
                <li><a href="blog.html">Blog</a></li>
                <li><a href="#faq">FAQ</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section class="content">
            ${this.convertMarkdownToHTML(content)}
        </section>
    </main>
    <footer>
        <p>&copy; 2025 LumosGen. Built with AI-powered automation.</p>
    </footer>
</body>
</html>`;
  }

  private generateCSS(): string {
    return `/* LumosGen Modern Website Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
}

header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1rem 0;
    position: sticky;
    top: 0;
    z-index: 100;
}

nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
}

nav ul {
    display: flex;
    list-style: none;
    gap: 2rem;
}

nav a {
    color: white;
    text-decoration: none;
    transition: opacity 0.3s;
}

nav a:hover {
    opacity: 0.8;
}

main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.hero {
    text-align: center;
    padding: 4rem 0;
}

.content {
    padding: 2rem 0;
}

footer {
    background: #333;
    color: white;
    text-align: center;
    padding: 2rem;
    margin-top: 4rem;
}

@media (max-width: 768px) {
    nav {
        flex-direction: column;
        gap: 1rem;
    }

    nav ul {
        gap: 1rem;
    }

    main {
        padding: 1rem;
    }
}`;
  }

  private generateJavaScript(): string {
    return `// LumosGen Website JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('LumosGen website loaded successfully!');

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add loading animation
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            this.style.opacity = '0.7';
            setTimeout(() => {
                this.style.opacity = '1';
            }, 200);
        });
    });
});`;
  }

  private generateSitemap(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://your-domain.com/</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://your-domain.com/about.html</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://your-domain.com/blog.html</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>https://your-domain.com/faq.html</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <priority>0.6</priority>
    </url>
</urlset>`;
  }

  private generateRobots(): string {
    return `User-agent: *
Allow: /

Sitemap: https://your-domain.com/sitemap.xml`;
  }

  private generateMetadata(projectAnalysis: any): any {
    return {
      title: `${projectAnalysis?.name || 'LumosGen'} - AI-Powered Marketing`,
      description: projectAnalysis?.description || 'Transform your development workflow with AI-powered marketing automation',
      keywords: ['AI', 'Marketing', 'Automation', 'VS Code', 'Developer Tools'],
      author: projectAnalysis?.author || 'LumosGen Team',
      viewport: 'width=device-width, initial-scale=1.0',
      charset: 'UTF-8'
    };
  }

  private convertMarkdownToHTML(markdown: string): string {
    // Simple markdown to HTML conversion
    return markdown
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\n\n/gim, '</p><p>')
      .replace(/^(.*)$/gim, '<p>$1</p>')
      .replace(/<p><h/gim, '<h')
      .replace(/<\/h([1-6])><\/p>/gim, '</h$1>');
  }

  private getSafeProjectPath(projectPath?: string): string {
    if (projectPath) {
      return projectPath;
    }

    // 尝试从VS Code API获取当前工作区路径
    try {
      const vscode = require('vscode');
      if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        return vscode.workspace.workspaceFolders[0].uri.fsPath;
      }
    } catch (error) {
      console.log('VS Code API not available in WebsiteBuilderAgent');
    }

    // 检查当前工作目录是否安全
    const currentDir = process.cwd();

    // 如果在VS Code安装目录中，使用安全的回退目录
    if (currentDir.includes('Microsoft VS Code') || currentDir.includes('Program Files')) {
      console.log('Detected unsafe directory, using safe fallback');
      const os = require('os');
      const path = require('path');
      return path.join(os.homedir(), 'LumosGen-Projects');
    }

    return currentDir;
  }
}
