/**
 * Website Builder Agent - Standalone Implementation
 * 
 * Extracted from original agents for reuse in Enhanced workflow
 */

import { BaseAgent, AgentResult, AgentContext } from './simple-agent-system';

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

            ${features.length > 0 ? \`
            <div class="features">
                <h3>Key Features</h3>
                <ul>
                    \${features.map((feature: string) => \`<li>\${this.convertMarkdownToHTML(feature)}</li>\`).join('')}
                </ul>
            </div>
            \` : ''}

            ${fullContent ? \`
            <div class="full-content">
                \${this.convertMarkdownToHTML(fullContent)}
            </div>
            \` : ''}

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
</html>\`;
  }

  private generateAboutPage(content: string): string {
    return \`<!DOCTYPE html>
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
            \${this.convertMarkdownToHTML(content)}
        </section>
    </main>
    <footer>
        <p>&copy; 2025 LumosGen. Built with AI-powered automation.</p>
    </footer>
</body>
</html>\`;
  }

  private generateBlogPage(content: string): string {
    return \`<!DOCTYPE html>
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
            \${this.convertMarkdownToHTML(content)}
        </section>
    </main>
    <footer>
        <p>&copy; 2025 LumosGen. Built with AI-powered automation.</p>
    </footer>
</body>
</html>\`;
  }

  private generateFAQPage(content: string): string {
    return \`<!DOCTYPE html>
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
            \${this.convertMarkdownToHTML(content)}
        </section>
    </main>
    <footer>
        <p>&copy; 2025 LumosGen. Built with AI-powered automation.</p>
    </footer>
</body>
</html>\`;
  }

  private generateCSS(): string {
    return \`/* LumosGen Modern Website Styles */
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
}\`;
  }

  private generateJavaScript(): string {
    return \`// LumosGen Website JavaScript
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
});\`;
  }

  private generateSitemap(): string {
    return \`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://your-domain.com/</loc>
        <lastmod>\${new Date().toISOString().split('T')[0]}</lastmod>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://your-domain.com/about.html</loc>
        <lastmod>\${new Date().toISOString().split('T')[0]}</lastmod>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://your-domain.com/blog.html</loc>
        <lastmod>\${new Date().toISOString().split('T')[0]}</lastmod>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>https://your-domain.com/faq.html</loc>
        <lastmod>\${new Date().toISOString().split('T')[0]}</lastmod>
        <priority>0.6</priority>
    </url>
</urlset>\`;
  }

  private generateRobots(): string {
    return \`User-agent: *
Allow: /

Sitemap: https://your-domain.com/sitemap.xml\`;
  }

  private generateMetadata(projectAnalysis: any): any {
    return {
      title: \`\${projectAnalysis?.name || 'LumosGen'} - AI-Powered Marketing\`,
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
