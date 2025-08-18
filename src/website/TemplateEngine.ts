import * as fs from 'fs';
import * as path from 'path';
import { GeneratedContent } from '../content/MarketingContentGenerator';
import { ProjectAnalysis } from '../analysis/ProjectAnalyzer';
import { WebsiteConfig } from './WebsiteBuilder';

export interface PageData {
    title: string;
    content: string;
    metadata: GeneratedContent['metadata'];
    analysis: ProjectAnalysis;
    config: WebsiteConfig;
    currentPage: string;
}

export class TemplateEngine {
    private templateCache: Map<string, string> = new Map();

    constructor() {
        // Template engine initialized
    }

    async renderPage(data: PageData): Promise<string> {
        const template = await this.getTemplate('main.html');
        return this.processTemplate(template, data);
    }

    async generateCSS(config: WebsiteConfig): Promise<string> {
        const baseCSS = await this.getTemplate('styles.css');
        return this.processTemplate(baseCSS, { config });
    }

    async generateJS(config: WebsiteConfig): Promise<string> {
        const baseJS = await this.getTemplate('main.js');
        return this.processTemplate(baseJS, { config });
    }

    private async getTemplate(templateName: string): Promise<string> {
        if (this.templateCache.has(templateName)) {
            return this.templateCache.get(templateName)!;
        }

        const templatePath = path.join(__dirname, 'templates', templateName);
        
        // If template file doesn't exist, return built-in template
        if (!fs.existsSync(templatePath)) {
            const builtInTemplate = this.getBuiltInTemplate(templateName);
            this.templateCache.set(templateName, builtInTemplate);
            return builtInTemplate;
        }

        const template = await fs.promises.readFile(templatePath, 'utf8');
        this.templateCache.set(templateName, template);
        return template;
    }

    private processTemplate(template: string, data: any): string {
        return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
            const value = this.getNestedValue(data, path);

            // If this is content field, apply basic HTML formatting
            if (path === 'content' && typeof value === 'string') {
                return this.convertToHTML(value);
            }

            return value || match;
        });
    }

    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    private convertToHTML(content: string): string {
        // Simple markdown-like conversion
        return content
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    private getBuiltInTemplate(templateName: string): string {
        switch (templateName) {
            case 'main.html':
                return this.getMainHTMLTemplate();
            case 'styles.css':
                return this.getStylesTemplate();
            case 'main.js':
                return this.getJavaScriptTemplate();
            default:
                return '';
        }
    }

    private getMainHTMLTemplate(): string {
        return `<!DOCTYPE html>
<html lang="{{metadata.language}}" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <meta name="description" content="{{metadata.description}}">
    <meta name="keywords" content="{{metadata.keywords}}">
    <meta name="author" content="{{metadata.author}}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="{{title}}">
    <meta property="og:description" content="{{metadata.description}}">
    <meta property="og:site_name" content="{{analysis.metadata.name}}">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{title}}">
    <meta name="twitter:description" content="{{metadata.description}}">
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="manifest" href="/manifest.json">
    
    <!-- Styles -->
    <link href="assets/styles.css" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        primary: '{{config.primaryColor}}',
                    },
                    fontFamily: {
                        sans: ['{{config.fontFamily}}'],
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
    <!-- Navigation -->
    <nav class="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <h1 class="text-xl font-bold text-primary-600">{{analysis.metadata.name}}</h1>
                </div>
                <div class="flex items-center space-x-4">
                    <a href="index.html" class="nav-link {{#if (eq currentPage 'index')}}active{{/if}}">Home</a>
                    <a href="about.html" class="nav-link {{#if (eq currentPage 'about')}}active{{/if}}">About</a>
                    <a href="faq.html" class="nav-link {{#if (eq currentPage 'faq')}}active{{/if}}">FAQ</a>
                    <button id="theme-toggle" class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path class="dark:hidden" d="M10 2L13.09 8.26L20 9L14 14.74L15.18 21.02L10 17.77L4.82 21.02L6 14.74L0 9L6.91 8.26L10 2Z"/>
                            <path class="hidden dark:block" d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="min-h-screen">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 lg:px-8 py-8">
            <div class="prose prose-lg dark:prose-invert max-w-none">
                {{content}}
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="text-center text-gray-600 dark:text-gray-400">
                <p>&copy; 2025 {{analysis.metadata.name}}. Generated by LumosGen.</p>
            </div>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="assets/main.js"></script>
</body>
</html>`;
    }

    private getStylesTemplate(): string {
        return `/* Custom styles for LumosGen generated website */
.nav-link {
    @apply px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors;
}

.nav-link.active {
    @apply text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20;
}

/* Prose customizations */
.prose h1 {
    @apply text-4xl font-bold mb-6 text-gray-900 dark:text-white;
}

.prose h2 {
    @apply text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2;
}

.prose h3 {
    @apply text-xl font-medium mb-3 text-gray-800 dark:text-gray-100;
}

.prose p {
    @apply mb-4 text-gray-700 dark:text-gray-300 leading-relaxed;
}

.prose ul, .prose ol {
    @apply mb-4 text-gray-700 dark:text-gray-300;
}

.prose li {
    @apply mb-2;
}

.prose blockquote {
    @apply border-l-4 border-primary-500 pl-4 italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-4 rounded-r-lg;
}

.prose code {
    @apply bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-primary-600 dark:text-primary-400;
}

.prose pre {
    @apply bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto;
}

/* Responsive design - mobile-first approach for responsive layouts */
@media (max-width: 768px) {
    .prose {
        @apply text-base;
    }

    .prose h1 {
        @apply text-3xl;
    }

    .prose h2 {
        @apply text-xl;
    }
}

/* Animation utilities */
.fade-in {
    animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Loading states */
.loading {
    @apply animate-pulse;
}

/* Custom scrollbar */
::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    @apply bg-gray-100 dark:bg-gray-800;
}

::-webkit-scrollbar-thumb {
    @apply bg-gray-400 dark:bg-gray-600 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
    @apply bg-gray-500 dark:bg-gray-500;
}`;
    }

    private getJavaScriptTemplate(): string {
        return `// LumosGen Website JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    // Check for saved theme preference or default to 'auto'
    const savedTheme = localStorage.getItem('theme') || 'auto';
    
    function setTheme(theme) {
        if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }
    
    // Set initial theme
    setTheme(savedTheme);
    
    // Theme toggle click handler
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = localStorage.getItem('theme') || 'auto';
            const newTheme = html.classList.contains('dark') ? 'light' : 'dark';
            setTheme(newTheme);
        });
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        if (localStorage.getItem('theme') === 'auto') {
            setTheme('auto');
        }
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add fade-in animation to main content
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.classList.add('fade-in');
    }
    
    // Performance monitoring (basic)
    if (typeof performance !== 'undefined' && performance.timing) {
        window.addEventListener('load', function() {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log('Page load time:', loadTime + 'ms');
        });
    }
    
    // Basic analytics (if enabled)
    if (window.gtag && typeof gtag === 'function') {
        gtag('config', 'GA_MEASUREMENT_ID', {
            page_title: document.title,
            page_location: window.location.href
        });
    }
});`;
    }
}
