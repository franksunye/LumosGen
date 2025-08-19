/**
 * 网站构建器单元测试
 * 测试网站生成和构建的核心功能
 */

const fs = require('fs');
const path = require('path');
const { TestConfig, TestUtils, TestAssertions } = require('../test-config');

// Mock网站构建器
class MockWebsiteBuilder {
    constructor(config = {}) {
        this.config = new TestConfig();
        this.themes = {
            modern: {
                name: 'Modern',
                colors: {
                    primary: '#3B82F6',
                    secondary: '#1E40AF',
                    accent: '#F59E0B'
                },
                fonts: {
                    primary: 'Inter, sans-serif',
                    secondary: 'system-ui, sans-serif'
                },
                styles: {
                    borderRadius: '0.5rem',
                    shadows: true
                }
            },
            technical: {
                name: 'Technical',
                colors: {
                    primary: '#10B981',
                    secondary: '#059669',
                    accent: '#F59E0B'
                },
                fonts: {
                    primary: 'JetBrains Mono, monospace',
                    secondary: 'system-ui, sans-serif'
                },
                styles: {
                    borderRadius: '0.25rem',
                    shadows: false
                }
            }
        };
        this.currentTheme = 'modern';
    }

    async buildWebsite(content, options = {}) {
        const theme = this.themes[options.theme || this.currentTheme];
        const outputDir = this.config.getOutputPath(`website-${Date.now()}`);
        
        // 创建输出目录
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const website = {
            outputDir,
            theme: theme.name,
            pages: {},
            assets: {},
            metadata: {
                generated: new Date().toISOString(),
                theme: theme.name,
                totalPages: 0,
                totalAssets: 0
            }
        };
        
        // 生成页面
        for (const [pageType, pageContent] of Object.entries(content)) {
            const html = this.generateHTML(pageContent, theme, options);
            const filename = this.getPageFilename(pageType);
            const filepath = path.join(outputDir, filename);
            
            fs.writeFileSync(filepath, html);
            
            website.pages[pageType] = {
                filename,
                filepath,
                size: html.length,
                wordCount: this.countWords(pageContent.content || ''),
                lastModified: new Date().toISOString()
            };
        }
        
        // 生成CSS
        const css = this.generateCSS(theme, options);
        const cssPath = path.join(outputDir, 'styles.css');
        fs.writeFileSync(cssPath, css);
        
        website.assets.css = {
            filename: 'styles.css',
            filepath: cssPath,
            size: css.length
        };
        
        // 生成JavaScript（如果需要）
        if (options.includeJS) {
            const js = this.generateJS(options);
            const jsPath = path.join(outputDir, 'script.js');
            fs.writeFileSync(jsPath, js);
            
            website.assets.js = {
                filename: 'script.js',
                filepath: jsPath,
                size: js.length
            };
        }
        
        // 生成sitemap
        const sitemap = this.generateSitemap(website.pages, options);
        const sitemapPath = path.join(outputDir, 'sitemap.xml');
        fs.writeFileSync(sitemapPath, sitemap);
        
        website.assets.sitemap = {
            filename: 'sitemap.xml',
            filepath: sitemapPath,
            size: sitemap.length
        };
        
        // 更新元数据
        website.metadata.totalPages = Object.keys(website.pages).length;
        website.metadata.totalAssets = Object.keys(website.assets).length;
        
        return website;
    }

    generateHTML(pageContent, theme, options = {}) {
        const title = pageContent.title || 'Untitled Page';
        const content = pageContent.content || '';
        const description = pageContent.metadata?.description || '';
        const keywords = pageContent.metadata?.keywords?.join(', ') || '';
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHtml(title)}</title>
    <meta name="description" content="${this.escapeHtml(description)}">
    <meta name="keywords" content="${this.escapeHtml(keywords)}">
    <link rel="stylesheet" href="styles.css">
    ${options.includeJS ? '<script src="script.js" defer></script>' : ''}
</head>
<body class="theme-${theme.name.toLowerCase()}">
    <header>
        <nav>
            <h1>${this.escapeHtml(title)}</h1>
        </nav>
    </header>
    <main>
        <div class="content">
            ${this.formatContent(content)}
        </div>
    </main>
    <footer>
        <p>Generated by LumosGen</p>
    </footer>
</body>
</html>`;
    }

    generateCSS(theme, options = {}) {
        return `/* ${theme.name} Theme */
:root {
    --primary-color: ${theme.colors.primary};
    --secondary-color: ${theme.colors.secondary};
    --accent-color: ${theme.colors.accent};
    --primary-font: ${theme.fonts.primary};
    --secondary-font: ${theme.fonts.secondary};
    --border-radius: ${theme.styles.borderRadius};
}

body {
    font-family: var(--primary-font);
    margin: 0;
    padding: 0;
    line-height: 1.6;
    color: #333;
}

header {
    background-color: var(--primary-color);
    color: white;
    padding: 1rem;
    ${theme.styles.shadows ? 'box-shadow: 0 2px 4px rgba(0,0,0,0.1);' : ''}
}

nav h1 {
    margin: 0;
    font-size: 1.5rem;
}

main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.content {
    background: white;
    padding: 2rem;
    border-radius: var(--border-radius);
    ${theme.styles.shadows ? 'box-shadow: 0 4px 6px rgba(0,0,0,0.1);' : 'border: 1px solid #e5e7eb;'}
}

footer {
    background-color: #f3f4f6;
    text-align: center;
    padding: 1rem;
    margin-top: 2rem;
}

.theme-${theme.name.toLowerCase()} {
    /* Theme-specific styles */
}

@media (max-width: 768px) {
    main {
        padding: 1rem;
    }
    
    .content {
        padding: 1rem;
    }
}`;
    }

    generateJS(options = {}) {
        return `// LumosGen Website JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('LumosGen website loaded');
    
    // Add any interactive features here
    ${options.analytics ? 'initAnalytics();' : ''}
    ${options.darkMode ? 'initDarkMode();' : ''}
});

${options.analytics ? `
function initAnalytics() {
    // Analytics initialization
    console.log('Analytics initialized');
}
` : ''}

${options.darkMode ? `
function initDarkMode() {
    // Dark mode toggle
    const toggle = document.createElement('button');
    toggle.textContent = 'Toggle Dark Mode';
    toggle.onclick = () => document.body.classList.toggle('dark-mode');
    document.body.appendChild(toggle);
}
` : ''}`;
    }

    generateSitemap(pages, options = {}) {
        const baseUrl = options.baseUrl || 'https://example.com';
        const now = new Date().toISOString();
        
        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
        
        for (const [pageType, pageInfo] of Object.entries(pages)) {
            const url = pageType === 'homepage' ? baseUrl : `${baseUrl}/${pageInfo.filename}`;
            sitemap += `
    <url>
        <loc>${url}</loc>
        <lastmod>${now}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>${pageType === 'homepage' ? '1.0' : '0.8'}</priority>
    </url>`;
        }
        
        sitemap += `
</urlset>`;
        
        return sitemap;
    }

    getPageFilename(pageType) {
        const filenames = {
            homepage: 'index.html',
            about: 'about.html',
            blog: 'blog.html',
            faq: 'faq.html'
        };
        
        return filenames[pageType] || `${pageType}.html`;
    }

    formatContent(content) {
        // 简单的内容格式化
        return content
            .split('\n\n')
            .map(paragraph => `<p>${this.escapeHtml(paragraph.trim())}</p>`)
            .join('\n');
    }

    escapeHtml(text) {
        const div = { innerHTML: '' };
        div.textContent = text;
        return div.innerHTML || text.replace(/[&<>"']/g, (match) => {
            const escapeMap = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            };
            return escapeMap[match];
        });
    }

    countWords(text) {
        return text.split(/\s+/).filter(word => word.length > 0).length;
    }

    validateWebsite(website) {
        const validation = {
            isValid: true,
            errors: [],
            warnings: []
        };
        
        // 检查必要的页面
        if (!website.pages.homepage) {
            validation.errors.push('Missing homepage');
            validation.isValid = false;
        }
        
        // 检查CSS文件
        if (!website.assets.css) {
            validation.errors.push('Missing CSS file');
            validation.isValid = false;
        }
        
        // 检查文件大小
        for (const [pageType, pageInfo] of Object.entries(website.pages)) {
            if (pageInfo.size === 0) {
                validation.warnings.push(`Empty page: ${pageType}`);
            }
            if (pageInfo.size > 100000) { // 100KB
                validation.warnings.push(`Large page: ${pageType} (${pageInfo.size} bytes)`);
            }
        }
        
        return validation;
    }

    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
            return true;
        }
        return false;
    }

    getAvailableThemes() {
        return Object.keys(this.themes);
    }

    getThemeInfo(themeName) {
        return this.themes[themeName] || null;
    }
}

// 测试套件
const websiteBuilderTests = {
    async setup() {
        this.builder = new MockWebsiteBuilder();
        this.mockContent = {
            homepage: {
                title: 'Test Project',
                content: 'This is a test homepage content.\n\nIt has multiple paragraphs.',
                metadata: {
                    description: 'Test project homepage',
                    keywords: ['test', 'project', 'homepage']
                }
            },
            about: {
                title: 'About Test Project',
                content: 'This is the about page content.',
                metadata: {
                    description: 'About test project',
                    keywords: ['about', 'test', 'project']
                }
            }
        };
    },

    async testBasicWebsiteBuilding() {
        const website = await this.builder.buildWebsite(this.mockContent);
        
        TestAssertions.assertTrue(fs.existsSync(website.outputDir), 'Output directory should exist');
        TestAssertions.assertTrue(website.pages.homepage !== undefined, 'Homepage should be generated');
        TestAssertions.assertTrue(website.pages.about !== undefined, 'About page should be generated');
        TestAssertions.assertTrue(website.assets.css !== undefined, 'CSS file should be generated');
        TestAssertions.assertEqual(website.metadata.totalPages, 2, 'Should have 2 pages');
    },

    async testThemeApplication() {
        const website = await this.builder.buildWebsite(this.mockContent, { theme: 'technical' });
        
        TestAssertions.assertEqual(website.theme, 'Technical', 'Should use technical theme');
        
        // 检查CSS是否包含主题颜色
        const cssContent = fs.readFileSync(website.assets.css.filepath, 'utf8');
        TestAssertions.assertContains(cssContent, '#10B981', 'CSS should contain technical theme primary color');
    },

    async testHTMLGeneration() {
        const website = await this.builder.buildWebsite(this.mockContent);
        const homepageContent = fs.readFileSync(website.pages.homepage.filepath, 'utf8');
        
        TestAssertions.assertContains(homepageContent, '<!DOCTYPE html>', 'Should be valid HTML');
        TestAssertions.assertContains(homepageContent, 'Test Project', 'Should contain page title');
        TestAssertions.assertContains(homepageContent, 'test homepage content', 'Should contain page content');
        TestAssertions.assertContains(homepageContent, 'styles.css', 'Should link to CSS file');
    },

    async testCSSGeneration() {
        const website = await this.builder.buildWebsite(this.mockContent);
        const cssContent = fs.readFileSync(website.assets.css.filepath, 'utf8');
        
        TestAssertions.assertContains(cssContent, ':root', 'Should contain CSS variables');
        TestAssertions.assertContains(cssContent, '--primary-color', 'Should contain primary color variable');
        TestAssertions.assertContains(cssContent, '@media', 'Should contain responsive styles');
    },

    async testSitemapGeneration() {
        const website = await this.builder.buildWebsite(this.mockContent, { baseUrl: 'https://test.com' });
        const sitemapContent = fs.readFileSync(website.assets.sitemap.filepath, 'utf8');
        
        TestAssertions.assertContains(sitemapContent, '<?xml version="1.0"', 'Should be valid XML');
        TestAssertions.assertContains(sitemapContent, 'https://test.com', 'Should contain base URL');
        TestAssertions.assertContains(sitemapContent, '<loc>', 'Should contain URL locations');
    },

    async testJavaScriptGeneration() {
        const website = await this.builder.buildWebsite(this.mockContent, { 
            includeJS: true, 
            analytics: true, 
            darkMode: true 
        });
        
        TestAssertions.assertTrue(website.assets.js !== undefined, 'JavaScript file should be generated');
        
        const jsContent = fs.readFileSync(website.assets.js.filepath, 'utf8');
        TestAssertions.assertContains(jsContent, 'DOMContentLoaded', 'Should contain DOM ready handler');
        TestAssertions.assertContains(jsContent, 'initAnalytics', 'Should contain analytics code');
        TestAssertions.assertContains(jsContent, 'initDarkMode', 'Should contain dark mode code');
    },

    async testWebsiteValidation() {
        const website = await this.builder.buildWebsite(this.mockContent);
        const validation = this.builder.validateWebsite(website);
        
        TestAssertions.assertTrue(validation.isValid, 'Website should be valid');
        TestAssertions.assertTrue(Array.isArray(validation.errors), 'Errors should be an array');
        TestAssertions.assertTrue(Array.isArray(validation.warnings), 'Warnings should be an array');
    },

    async testThemeManagement() {
        const availableThemes = this.builder.getAvailableThemes();
        TestAssertions.assertTrue(Array.isArray(availableThemes), 'Should return array of themes');
        TestAssertions.assertContains(availableThemes, 'modern', 'Should include modern theme');
        TestAssertions.assertContains(availableThemes, 'technical', 'Should include technical theme');
        
        const success = this.builder.setTheme('technical');
        TestAssertions.assertTrue(success, 'Should successfully set theme');
        
        const themeInfo = this.builder.getThemeInfo('technical');
        TestAssertions.assertTrue(themeInfo !== null, 'Should return theme info');
        TestAssertions.assertEqual(themeInfo.name, 'Technical', 'Should return correct theme name');
    },

    async testEmptyContent() {
        const emptyContent = {
            homepage: {
                title: '',
                content: '',
                metadata: {}
            }
        };
        
        const website = await this.builder.buildWebsite(emptyContent);
        TestAssertions.assertTrue(website.pages.homepage !== undefined, 'Should handle empty content');
        
        const validation = this.builder.validateWebsite(website);
        TestAssertions.assertTrue(validation.warnings.length > 0, 'Should have warnings for empty content');
    },

    async testLargeContent() {
        const largeContent = {
            homepage: {
                title: 'Large Content Test',
                content: 'Large content. '.repeat(10000), // ~130KB of content
                metadata: {
                    description: 'Large content test',
                    keywords: ['large', 'content', 'test']
                }
            }
        };
        
        const website = await this.builder.buildWebsite(largeContent);
        TestAssertions.assertTrue(website.pages.homepage.size > 100000, 'Should handle large content');
        
        const validation = this.builder.validateWebsite(website);
        TestAssertions.assertTrue(validation.warnings.some(w => w.includes('Large page')), 'Should warn about large pages');
    },

    async teardown() {
        // 清理生成的测试文件
        // 注意：在实际环境中可能需要更仔细的清理
    }
};

module.exports = websiteBuilderTests;
