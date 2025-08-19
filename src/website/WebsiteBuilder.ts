import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { GeneratedContent } from '../content/MarketingContentGenerator';
import { ProjectAnalysis } from '../analysis/ProjectAnalyzer';
import { TemplateEngine } from './TemplateEngine';
import { SEOOptimizer } from './SEOOptimizer';

export interface WebsiteConfig {
    theme: string; // Theme name (e.g., 'modern', 'technical')
    themeMode?: 'light' | 'dark' | 'auto'; // Light/dark mode within theme
    primaryColor: string;
    secondaryColor?: string;
    fontFamily: string;
    headingFont?: string;
    borderRadius?: string;
    enableAnalytics: boolean;
    customCSS?: string;
    customProperties?: Record<string, string>;
}

export interface BuildResult {
    success: boolean;
    outputPath: string;
    pages: string[];
    assets: string[];
    errors?: string[];
}

export class WebsiteBuilder {
    private templateEngine: TemplateEngine;
    private seoOptimizer: SEOOptimizer;
    private outputChannel: vscode.OutputChannel;

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
        this.templateEngine = new TemplateEngine();
        this.seoOptimizer = new SEOOptimizer();
    }

    async buildWebsite(
        content: GeneratedContent,
        analysis: ProjectAnalysis,
        config?: WebsiteConfig
    ): Promise<BuildResult> {
        this.outputChannel.appendLine('Building responsive website...');

        try {
            const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!workspaceRoot) {
                throw new Error('No workspace folder found');
            }

            const outputPath = path.join(workspaceRoot, 'lumosgen-website');
            
            // Create output directory
            await this.ensureDirectory(outputPath);
            
            // Build configuration with theme support
            const selectedTheme = config?.theme || 'modern';
            const themeConfig = this.templateEngine.mergeThemeConfig(selectedTheme, config || {});

            const websiteConfig: WebsiteConfig = {
                theme: selectedTheme,
                themeMode: 'auto',
                primaryColor: '#3b82f6',
                secondaryColor: '#64748b',
                fontFamily: 'Inter, system-ui, sans-serif',
                headingFont: 'Inter, system-ui, sans-serif',
                borderRadius: '0.5rem',
                enableAnalytics: false,
                customProperties: {},
                ...themeConfig,
                ...config
            };

            const buildResult: BuildResult = {
                success: false,
                outputPath,
                pages: [],
                assets: []
            };

            // Generate HTML pages
            await this.generatePages(content, analysis, websiteConfig, outputPath, buildResult);
            
            // Copy and generate assets
            await this.generateAssets(websiteConfig, outputPath, buildResult);
            
            // Generate SEO files
            await this.generateSEOFiles(content, analysis, outputPath, buildResult);
            
            buildResult.success = true;
            this.outputChannel.appendLine('Website build completed successfully');
            
            return buildResult;

        } catch (error) {
            this.outputChannel.appendLine(`Build failed: ${error}`);
            return {
                success: false,
                outputPath: '',
                pages: [],
                assets: [],
                errors: [error instanceof Error ? error.message : String(error)]
            };
        }
    }

    showWebsiteLocation(buildResult: BuildResult): void {
        if (!buildResult.success) {
            vscode.window.showErrorMessage('网站构建失败，无法预览');
            return;
        }

        this.outputChannel.appendLine(`网站已生成到: ${buildResult.outputPath}`);

        vscode.window.showInformationMessage(
            `网站已生成到: ${buildResult.outputPath}`,
            '打开文件夹'
        ).then(selection => {
            if (selection === '打开文件夹') {
                const folderUri = vscode.Uri.file(buildResult.outputPath);
                vscode.commands.executeCommand('vscode.openFolder', folderUri, true);
            }
        });
    }

    getAvailableThemes(): string[] {
        return this.templateEngine.getAvailableThemes();
    }

    getThemeMetadata(themeName: string) {
        return this.templateEngine.getThemeMetadata(themeName);
    }

    getThemeCustomization(themeName: string) {
        return this.templateEngine.getThemeCustomization(themeName);
    }

    async selectTheme(): Promise<string | undefined> {
        const themes = this.getAvailableThemes();
        const themeItems = themes.map(theme => {
            const metadata = this.getThemeMetadata(theme);
            return {
                label: metadata?.name || theme,
                description: metadata?.description || '',
                detail: `Category: ${metadata?.category || 'unknown'}`,
                value: theme
            };
        });

        const selected = await vscode.window.showQuickPick(themeItems, {
            placeHolder: 'Select a website theme',
            title: 'Choose Website Theme'
        });

        return selected?.value;
    }

    private async generatePages(
        content: GeneratedContent,
        analysis: ProjectAnalysis,
        config: WebsiteConfig,
        outputPath: string,
        buildResult: BuildResult
    ): Promise<void> {
        const pages = [
            { name: 'index.html', content: content.homepage, title: 'Home' },
            { name: 'about.html', content: content.aboutPage, title: 'About' },
            { name: 'faq.html', content: content.faq, title: 'FAQ' }
        ];

        if (content.blogPost) {
            pages.push({ name: 'blog.html', content: content.blogPost, title: 'Blog' });
        }

        for (const page of pages) {
            const html = await this.templateEngine.renderPage({
                title: `${content.metadata.title} - ${page.title}`,
                content: page.content,
                metadata: content.metadata,
                analysis,
                config,
                currentPage: page.name.replace('.html', '')
            });

            const filePath = path.join(outputPath, page.name);
            await fs.promises.writeFile(filePath, html, 'utf8');
            buildResult.pages.push(page.name);
        }
    }

    private async generateAssets(
        config: WebsiteConfig,
        outputPath: string,
        buildResult: BuildResult
    ): Promise<void> {
        const assetsDir = path.join(outputPath, 'assets');
        await this.ensureDirectory(assetsDir);

        // Generate CSS
        const css = await this.templateEngine.generateCSS(config);
        const cssPath = path.join(assetsDir, 'styles.css');
        await fs.promises.writeFile(cssPath, css, 'utf8');
        buildResult.assets.push('assets/styles.css');

        // Generate JavaScript
        const js = await this.templateEngine.generateJS(config);
        const jsPath = path.join(assetsDir, 'main.js');
        await fs.promises.writeFile(jsPath, js, 'utf8');
        buildResult.assets.push('assets/main.js');

        // Copy favicon (if exists)
        const faviconPath = path.join(__dirname, '../templates/assets/favicon.ico');
        if (fs.existsSync(faviconPath)) {
            const targetFavicon = path.join(outputPath, 'favicon.ico');
            await fs.promises.copyFile(faviconPath, targetFavicon);
            buildResult.assets.push('favicon.ico');
        }
    }

    private async generateSEOFiles(
        content: GeneratedContent,
        analysis: ProjectAnalysis,
        outputPath: string,
        buildResult: BuildResult
    ): Promise<void> {
        // Generate sitemap.xml
        const sitemap = this.seoOptimizer.generateSitemap(buildResult.pages, analysis.metadata.name);
        await fs.promises.writeFile(path.join(outputPath, 'sitemap.xml'), sitemap, 'utf8');
        buildResult.assets.push('sitemap.xml');

        // Generate robots.txt
        const robots = this.seoOptimizer.generateRobotsTxt();
        await fs.promises.writeFile(path.join(outputPath, 'robots.txt'), robots, 'utf8');
        buildResult.assets.push('robots.txt');

        // Generate manifest.json for PWA
        const manifest = this.seoOptimizer.generateManifest(content.metadata, analysis);
        await fs.promises.writeFile(path.join(outputPath, 'manifest.json'), manifest, 'utf8');
        buildResult.assets.push('manifest.json');
    }

    private async ensureDirectory(dirPath: string): Promise<void> {
        if (!fs.existsSync(dirPath)) {
            await fs.promises.mkdir(dirPath, { recursive: true });
        }
    }
}
