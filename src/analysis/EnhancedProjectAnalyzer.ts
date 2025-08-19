import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ProjectAnalyzer, ProjectAnalysis, ProjectMetadata, TechStack, ProjectFeature, MarkdownDocument } from './ProjectAnalyzer';

// 增强的接口定义
export interface MarkdownFile {
    path: string;
    content: string;
    tokenCount: number;
    priority: number;
    category: DocumentCategory;
    lastModified: Date;
    size: number;
}

export interface ParsedMarkdown extends MarkdownDocument {
    tokenCount: number;
    priority: number;
    category: DocumentCategory;
    summary: string;
}

export interface Dependency {
    name: string;
    version: string;
    type: 'production' | 'development' | 'peer';
    category: string;
}

export interface ScriptInfo {
    name: string;
    command: string;
    description?: string;
}

export type DocumentCategory = 'readme' | 'docs' | 'changelog' | 'guide' | 'api' | 'example' | 'test' | 'config' | 'other';

export interface EnhancedProjectAnalysis {
    // 第一层：规则提取的结构化数据
    structured: {
        metadata: ProjectMetadata;
        techStack: TechStack[];
        dependencies: Dependency[];
        scripts: ScriptInfo[];
    };
    
    // 第二层：半结构化文档（可解析的markdown）
    semiStructured: {
        readme?: ParsedMarkdown;
        changelog?: ParsedMarkdown;
        userGuide?: ParsedMarkdown;
        primaryDocs: ParsedMarkdown[];
    };
    
    // 第三层：全文本上下文（所有markdown文件）
    fullText: {
        allMarkdownFiles: MarkdownFile[];
        totalTokens: number;
        averagePriority: number;
        categories: Record<DocumentCategory, number>;
    };
    
    // 元数据
    meta: {
        analysisTime: Date;
        totalFiles: number;
        cacheHits: number;
        contextStrategy: 'minimal' | 'balanced' | 'comprehensive';
    };
}

export interface CachedDocument {
    document: ParsedMarkdown | MarkdownFile;
    mtime: Date;
    hash: string;
}

export interface ContextBudget {
    maxTokens: number;
    reservedTokens: number;
    availableTokens: number;
    strategy: 'minimal' | 'balanced' | 'comprehensive';
}

// 文档优先级算法
export class DocumentPrioritizer {
    calculatePriority(filePath: string, content: string): number {
        let score = 0;
        
        // 文件名权重 (0-20分)
        const fileName = path.basename(filePath).toLowerCase();
        if (fileName.includes('readme')) score += 20;
        else if (fileName.includes('changelog')) score += 15;
        else if (fileName.includes('guide') || fileName.includes('tutorial')) score += 12;
        else if (fileName.includes('api') || fileName.includes('reference')) score += 10;
        else if (fileName.includes('example')) score += 8;
        else if (fileName.includes('test')) score += 3;
        
        // 路径权重 (0-15分)
        if (filePath.includes('/docs/')) score += 15;
        else if (filePath.includes('/doc/')) score += 12;
        else if (filePath.includes('/documentation/')) score += 10;
        else if (filePath.startsWith('./')) score += 8; // 根目录文件
        
        // 内容质量权重 (0-25分)
        const wordCount = content.split(/\s+/).length;
        if (wordCount > 500) score += 10;
        else if (wordCount > 200) score += 7;
        else if (wordCount > 50) score += 4;
        
        // 结构化程度 (0-15分)
        const headingCount = (content.match(/^#{1,6}\s+/gm) || []).length;
        if (headingCount > 5) score += 15;
        else if (headingCount > 2) score += 10;
        else if (headingCount > 0) score += 5;
        
        // 技术相关性 (0-15分)
        const techKeywords = ['api', 'architecture', '架构', 'installation', 'setup', 'configuration', 'usage', 'features'];
        const techMatches = techKeywords.filter(keyword => 
            content.toLowerCase().includes(keyword)
        ).length;
        score += Math.min(15, techMatches * 3);
        
        // 代码示例 (0-10分)
        const codeBlocks = (content.match(/```[\s\S]*?```/g) || []).length;
        score += Math.min(10, codeBlocks * 2);
        
        return Math.min(100, score);
    }
    
    categorizeDocument(filePath: string): DocumentCategory {
        const fileName = path.basename(filePath).toLowerCase();
        const dirPath = path.dirname(filePath).toLowerCase();
        
        if (fileName.includes('readme')) return 'readme';
        if (fileName.includes('changelog')) return 'changelog';
        if (fileName.includes('guide') || fileName.includes('tutorial')) return 'guide';
        if (fileName.includes('api') || fileName.includes('reference')) return 'api';
        if (fileName.includes('example') || dirPath.includes('example')) return 'example';
        if (fileName.includes('test') || dirPath.includes('test')) return 'test';
        if (dirPath.includes('docs') || dirPath.includes('doc')) return 'docs';
        if (fileName.includes('config')) return 'config';
        
        return 'other';
    }
}

// Token预算管理器
export class ContextBudgetManager {
    private defaultBudgets = {
        minimal: { maxTokens: 4000, reservedTokens: 1000 },
        balanced: { maxTokens: 8000, reservedTokens: 2000 },
        comprehensive: { maxTokens: 16000, reservedTokens: 4000 }
    };
    
    createBudget(strategy: 'minimal' | 'balanced' | 'comprehensive'): ContextBudget {
        const config = this.defaultBudgets[strategy];
        return {
            maxTokens: config.maxTokens,
            reservedTokens: config.reservedTokens,
            availableTokens: config.maxTokens - config.reservedTokens,
            strategy
        };
    }
    
    optimizeContext(allDocs: MarkdownFile[], budget: ContextBudget): MarkdownFile[] {
        // 按优先级排序
        const sorted = [...allDocs].sort((a, b) => b.priority - a.priority);
        
        let totalTokens = 0;
        const selected: MarkdownFile[] = [];
        
        for (const doc of sorted) {
            if (totalTokens + doc.tokenCount <= budget.availableTokens) {
                selected.push(doc);
                totalTokens += doc.tokenCount;
            } else {
                // 尝试截断重要文档
                const remainingTokens = budget.availableTokens - totalTokens;
                if (remainingTokens > 100 && doc.priority > 70) {
                    const truncated = this.truncateDocument(doc, remainingTokens);
                    if (truncated) {
                        selected.push(truncated);
                        break;
                    }
                }
            }
        }
        
        return selected;
    }
    
    private truncateDocument(doc: MarkdownFile, maxTokens: number): MarkdownFile | null {
        if (doc.tokenCount <= maxTokens) return doc;
        
        // 简单的截断策略：保留前N个字符
        const ratio = maxTokens / doc.tokenCount;
        const targetLength = Math.floor(doc.content.length * ratio * 0.9); // 留10%缓冲
        
        let truncatedContent = doc.content.substring(0, targetLength);
        
        // 尝试在段落边界截断
        const lastParagraph = truncatedContent.lastIndexOf('\n\n');
        if (lastParagraph > targetLength * 0.7) {
            truncatedContent = truncatedContent.substring(0, lastParagraph);
        }
        
        truncatedContent += '\n\n[... 内容已截断 ...]';
        
        return {
            ...doc,
            content: truncatedContent,
            tokenCount: maxTokens,
            size: truncatedContent.length
        };
    }
    
    estimateTokens(text: string): number {
        // 简单的token估算：大约4个字符=1个token（英文），2个字符=1个token（中文）
        const englishChars = (text.match(/[a-zA-Z0-9\s]/g) || []).length;
        const chineseChars = text.length - englishChars;
        return Math.ceil(englishChars / 4 + chineseChars / 2);
    }
}

// 文档缓存管理器
export class DocumentCache {
    private cache = new Map<string, CachedDocument>();
    private readonly TTL = 30 * 60 * 1000; // 30分钟
    
    async getCachedOrParse(filePath: string, parser: (path: string) => Promise<ParsedMarkdown | MarkdownFile>): Promise<ParsedMarkdown | MarkdownFile> {
        try {
            const stat = await fs.promises.stat(filePath);
            const cached = this.cache.get(filePath);
            
            if (cached && cached.mtime >= stat.mtime) {
                return cached.document;
            }
            
            // 重新解析并缓存
            const parsed = await parser(filePath);
            const hash = this.generateHash(parsed.content);
            
            this.cache.set(filePath, { 
                document: parsed, 
                mtime: stat.mtime,
                hash 
            });
            
            return parsed;
        } catch (error) {
            // 如果文件不存在或出错，尝试从缓存返回
            const cached = this.cache.get(filePath);
            if (cached) return cached.document;
            throw error;
        }
    }
    
    invalidate(filePath: string): void {
        this.cache.delete(filePath);
    }
    
    clear(): void {
        this.cache.clear();
    }
    
    getStats(): { size: number; hitRate: number } {
        return {
            size: this.cache.size,
            hitRate: 0 // TODO: 实现命中率统计
        };
    }
    
    private generateHash(content: string): string {
        // 简单的哈希函数
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return hash.toString(36);
    }
}

// 增量更新管理器
export class IncrementalContextBuilder {
    private budgetManager = new ContextBudgetManager();
    private prioritizer = new DocumentPrioritizer();

    async updateContext(
        changedFiles: string[],
        previousContext: EnhancedProjectAnalysis,
        workspaceRoot: string
    ): Promise<EnhancedProjectAnalysis> {
        const updatedContext = { ...previousContext };
        let hasStructuralChanges = false;
        let hasDocumentChanges = false;

        for (const file of changedFiles) {
            const filePath = path.resolve(workspaceRoot, file);

            if (file.endsWith('.md')) {
                hasDocumentChanges = true;
                await this.updateMarkdownContext(filePath, updatedContext);
            } else if (this.isStructuralFile(file)) {
                hasStructuralChanges = true;
                await this.updateStructuredData(filePath, updatedContext, workspaceRoot);
            }
        }

        // 如果有文档变化，重新计算优先级和token统计
        if (hasDocumentChanges) {
            this.recalculateFullTextContext(updatedContext);
        }

        // 更新元数据
        updatedContext.meta = {
            ...updatedContext.meta,
            analysisTime: new Date(),
            cacheHits: updatedContext.meta.cacheHits + (hasStructuralChanges ? 0 : 1)
        };

        return updatedContext;
    }

    private async updateMarkdownContext(filePath: string, context: EnhancedProjectAnalysis): Promise<void> {
        try {
            const content = await fs.promises.readFile(filePath, 'utf8');
            const fileName = path.basename(filePath).toLowerCase();
            const category = this.prioritizer.categorizeDocument(filePath);
            const priority = this.prioritizer.calculatePriority(filePath, content);
            const tokenCount = this.budgetManager.estimateTokens(content);

            const markdownFile: MarkdownFile = {
                path: filePath,
                content,
                tokenCount,
                priority,
                category,
                lastModified: new Date(),
                size: content.length
            };

            // 更新fullText中的对应文件
            const existingIndex = context.fullText.allMarkdownFiles.findIndex(f => f.path === filePath);
            if (existingIndex >= 0) {
                context.fullText.allMarkdownFiles[existingIndex] = markdownFile;
            } else {
                context.fullText.allMarkdownFiles.push(markdownFile);
            }

            // 如果是主要文档，也更新semiStructured
            if (fileName.includes('readme')) {
                context.semiStructured.readme = this.convertToParseMarkdown(markdownFile);
            } else if (fileName.includes('changelog')) {
                context.semiStructured.changelog = this.convertToParseMarkdown(markdownFile);
            } else if (fileName.includes('guide')) {
                context.semiStructured.userGuide = this.convertToParseMarkdown(markdownFile);
            }

        } catch (error) {
            console.warn(`Failed to update markdown context for ${filePath}:`, error);
        }
    }

    private async updateStructuredData(filePath: string, context: EnhancedProjectAnalysis, workspaceRoot: string): Promise<void> {
        const fileName = path.basename(filePath);

        try {
            if (fileName === 'package.json') {
                const packageJson = JSON.parse(await fs.promises.readFile(filePath, 'utf8'));

                // 更新metadata
                context.structured.metadata = {
                    ...context.structured.metadata,
                    name: packageJson.name || context.structured.metadata.name,
                    description: packageJson.description || context.structured.metadata.description,
                    version: packageJson.version || context.structured.metadata.version,
                    author: packageJson.author,
                    license: packageJson.license,
                    repositoryUrl: packageJson.repository?.url,
                    homepage: packageJson.homepage,
                    keywords: packageJson.keywords || []
                };

                // 更新dependencies
                context.structured.dependencies = this.extractDependencies(packageJson);

                // 更新scripts
                context.structured.scripts = this.extractScripts(packageJson);
            }
            // TODO: 添加其他配置文件的处理（Cargo.toml, go.mod等）

        } catch (error) {
            console.warn(`Failed to update structured data for ${filePath}:`, error);
        }
    }

    private isStructuralFile(fileName: string): boolean {
        const structuralFiles = [
            'package.json', 'package-lock.json', 'yarn.lock',
            'Cargo.toml', 'Cargo.lock',
            'go.mod', 'go.sum',
            'requirements.txt', 'Pipfile', 'poetry.lock',
            'pom.xml', 'build.gradle',
            'composer.json', 'composer.lock'
        ];
        return structuralFiles.includes(fileName);
    }

    private recalculateFullTextContext(context: EnhancedProjectAnalysis): void {
        const allFiles = context.fullText.allMarkdownFiles;

        context.fullText.totalTokens = allFiles.reduce((sum, file) => sum + file.tokenCount, 0);
        context.fullText.averagePriority = allFiles.reduce((sum, file) => sum + file.priority, 0) / allFiles.length;

        // 重新计算分类统计
        const categories: Record<DocumentCategory, number> = {
            readme: 0, docs: 0, changelog: 0, guide: 0, api: 0,
            example: 0, test: 0, config: 0, other: 0
        };

        allFiles.forEach(file => {
            categories[file.category]++;
        });

        context.fullText.categories = categories;
    }

    private extractTitle(content: string): string {
        const titleMatch = content.match(/^#\s+(.+)$/m);
        return titleMatch ? titleMatch[1].trim() : 'Untitled';
    }

    private extractSections(content: string): string[] {
        const sections = content.match(/^#{1,6}\s+.+$/gm) || [];
        return sections.map(section => section.replace(/^#+\s+/, '').trim());
    }

    private extractCodeBlocks(content: string): string[] {
        const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
        return codeBlocks.map(block => block.replace(/```\w*\n?/, '').replace(/```$/, '').trim());
    }

    private convertToParseMarkdown(markdownFile: MarkdownFile): ParsedMarkdown {
        const title = this.extractTitle(markdownFile.content);
        const sections = this.extractSections(markdownFile.content);
        const codeBlocks = this.extractCodeBlocks(markdownFile.content);
        const summary = this.generateSummary(markdownFile.content);

        return {
            path: markdownFile.path,
            title,
            content: markdownFile.content,
            sections,
            codeBlocks,
            tokenCount: markdownFile.tokenCount,
            priority: markdownFile.priority,
            category: markdownFile.category,
            summary
        };
    }







    private generateSummary(content: string): string {
        // 提取前200个字符作为摘要
        const text = content.replace(/```[\s\S]*?```/g, '') // 移除代码块
                           .replace(/#{1,6}\s+/g, '') // 移除标题标记
                           .replace(/\n+/g, ' ') // 合并换行
                           .trim();

        return text.length > 200 ? text.substring(0, 200) + '...' : text;
    }

    private extractDependencies(packageJson: any): Dependency[] {
        const dependencies: Dependency[] = [];

        // 生产依赖
        if (packageJson.dependencies) {
            Object.entries(packageJson.dependencies).forEach(([name, version]) => {
                dependencies.push({
                    name,
                    version: version as string,
                    type: 'production',
                    category: this.categorizeDependency(name)
                });
            });
        }

        // 开发依赖
        if (packageJson.devDependencies) {
            Object.entries(packageJson.devDependencies).forEach(([name, version]) => {
                dependencies.push({
                    name,
                    version: version as string,
                    type: 'development',
                    category: this.categorizeDependency(name)
                });
            });
        }

        return dependencies;
    }

    private extractScripts(packageJson: any): ScriptInfo[] {
        const scripts: ScriptInfo[] = [];

        if (packageJson.scripts) {
            Object.entries(packageJson.scripts).forEach(([name, command]) => {
                scripts.push({
                    name,
                    command: command as string,
                    description: this.generateScriptDescription(name, command as string)
                });
            });
        }

        return scripts;
    }

    private categorizeDependency(name: string): string {
        if (name.includes('react') || name.includes('vue') || name.includes('angular')) return 'frontend-framework';
        if (name.includes('express') || name.includes('koa') || name.includes('fastify')) return 'backend-framework';
        if (name.includes('test') || name.includes('jest') || name.includes('mocha')) return 'testing';
        if (name.includes('webpack') || name.includes('vite') || name.includes('rollup')) return 'build-tool';
        if (name.includes('eslint') || name.includes('prettier') || name.includes('typescript')) return 'development-tool';
        return 'library';
    }

    private generateScriptDescription(name: string, command: string): string {
        const descriptions: Record<string, string> = {
            'start': '启动应用程序',
            'dev': '启动开发服务器',
            'build': '构建生产版本',
            'test': '运行测试',
            'lint': '代码检查',
            'format': '代码格式化'
        };

        return descriptions[name] || `执行: ${command}`;
    }
}

// 主要的增强项目分析器
export class EnhancedProjectAnalyzer extends ProjectAnalyzer {
    private cache = new DocumentCache();
    private budgetManager = new ContextBudgetManager();
    private prioritizer = new DocumentPrioritizer();
    private incrementalBuilder = new IncrementalContextBuilder();

    constructor(workspaceRoot: string, outputChannel: vscode.OutputChannel) {
        super(workspaceRoot, outputChannel);
    }

    async analyzeProjectEnhanced(strategy: 'minimal' | 'balanced' | 'comprehensive' = 'balanced'): Promise<EnhancedProjectAnalysis> {
        const startTime = Date.now();
        this.outputChannel.appendLine(`Starting enhanced project analysis with ${strategy} strategy...`);

        try {
            // 第一层：结构化数据提取
            const structured = await this.extractStructuredData();

            // 第二层：半结构化文档解析
            const semiStructured = await this.parsePrimaryDocuments();

            // 第三层：全文本上下文收集
            const fullText = await this.collectAllMarkdownFiles(strategy);

            const analysis: EnhancedProjectAnalysis = {
                structured,
                semiStructured,
                fullText,
                meta: {
                    analysisTime: new Date(),
                    totalFiles: fullText.allMarkdownFiles.length,
                    cacheHits: this.cache.getStats().size,
                    contextStrategy: strategy
                }
            };

            const duration = Date.now() - startTime;
            this.outputChannel.appendLine(`Enhanced analysis completed in ${duration}ms`);
            this.outputChannel.appendLine(`Found ${fullText.allMarkdownFiles.length} markdown files, ${fullText.totalTokens} total tokens`);

            return analysis;

        } catch (error) {
            this.outputChannel.appendLine(`Enhanced analysis failed: ${error}`);
            throw error;
        }
    }

    async updateAnalysis(changedFiles: string[], previousAnalysis: EnhancedProjectAnalysis): Promise<EnhancedProjectAnalysis> {
        this.outputChannel.appendLine(`Updating analysis for ${changedFiles.length} changed files...`);

        return await this.incrementalBuilder.updateContext(
            changedFiles,
            previousAnalysis,
            this.workspaceRoot
        );
    }

    async getOptimizedContext(analysis: EnhancedProjectAnalysis, strategy?: 'minimal' | 'balanced' | 'comprehensive'): Promise<MarkdownFile[]> {
        const contextStrategy = strategy || analysis.meta.contextStrategy;
        const budget = this.budgetManager.createBudget(contextStrategy);

        return this.budgetManager.optimizeContext(analysis.fullText.allMarkdownFiles, budget);
    }

    private async extractStructuredData(): Promise<EnhancedProjectAnalysis['structured']> {
        // 复用父类的方法
        const baseAnalysis = await super.analyzeProject();

        // 提取依赖信息
        const dependencies = await this.extractDependencies();

        // 提取脚本信息
        const scripts = await this.extractScripts();

        return {
            metadata: baseAnalysis.metadata,
            techStack: baseAnalysis.techStack,
            dependencies,
            scripts
        };
    }

    private async parsePrimaryDocuments(): Promise<EnhancedProjectAnalysis['semiStructured']> {
        const primaryDocs: ParsedMarkdown[] = [];
        let readme: ParsedMarkdown | undefined;
        let changelog: ParsedMarkdown | undefined;
        let userGuide: ParsedMarkdown | undefined;

        // 查找并解析主要文档
        const primaryFiles = [
            { pattern: /readme/i, type: 'readme' as const },
            { pattern: /changelog/i, type: 'changelog' as const },
            { pattern: /guide|tutorial/i, type: 'userGuide' as const }
        ];

        for (const { pattern, type } of primaryFiles) {
            const filePath = await this.findFileByPattern(pattern, '.md');
            if (filePath) {
                try {
                    const parsed = await this.cache.getCachedOrParse(filePath,
                        async (path) => await this.parseMarkdownFile(path)
                    ) as ParsedMarkdown;

                    primaryDocs.push(parsed);

                    if (type === 'readme') readme = parsed;
                    else if (type === 'changelog') changelog = parsed;
                    else if (type === 'userGuide') userGuide = parsed;

                } catch (error) {
                    this.outputChannel.appendLine(`Error parsing ${type}: ${error}`);
                }
            }
        }

        return { readme, changelog, userGuide, primaryDocs };
    }

    private async collectAllMarkdownFiles(strategy: 'minimal' | 'balanced' | 'comprehensive'): Promise<EnhancedProjectAnalysis['fullText']> {
        const allMarkdownFiles: MarkdownFile[] = [];

        // 根据策略决定扫描深度
        const maxDepth = strategy === 'minimal' ? 2 : strategy === 'balanced' ? 4 : 6;

        await this.scanMarkdownFiles(this.workspaceRoot, allMarkdownFiles, 0, maxDepth);

        // 计算统计信息
        const totalTokens = allMarkdownFiles.reduce((sum, file) => sum + file.tokenCount, 0);
        const averagePriority = allMarkdownFiles.length > 0
            ? allMarkdownFiles.reduce((sum, file) => sum + file.priority, 0) / allMarkdownFiles.length
            : 0;

        // 分类统计
        const categories: Record<DocumentCategory, number> = {
            readme: 0, docs: 0, changelog: 0, guide: 0, api: 0,
            example: 0, test: 0, config: 0, other: 0
        };

        allMarkdownFiles.forEach(file => {
            categories[file.category]++;
        });

        return {
            allMarkdownFiles,
            totalTokens,
            averagePriority,
            categories
        };
    }

    private async scanMarkdownFiles(dirPath: string, files: MarkdownFile[], depth: number, maxDepth: number): Promise<void> {
        if (depth > maxDepth) return;

        try {
            const items = await fs.promises.readdir(dirPath);

            for (const item of items) {
                // 跳过隐藏文件和常见的忽略目录
                if (item.startsWith('.') || ['node_modules', 'dist', 'build', 'coverage'].includes(item)) {
                    continue;
                }

                const itemPath = path.join(dirPath, item);
                const stat = await fs.promises.stat(itemPath);

                if (stat.isDirectory()) {
                    await this.scanMarkdownFiles(itemPath, files, depth + 1, maxDepth);
                } else if (item.toLowerCase().endsWith('.md')) {
                    try {
                        const markdownFile = await this.cache.getCachedOrParse(itemPath,
                            async (path) => await this.parseMarkdownFileAsMarkdownFile(path)
                        ) as MarkdownFile;

                        files.push(markdownFile);
                    } catch (error) {
                        this.outputChannel.appendLine(`Error parsing ${itemPath}: ${error}`);
                    }
                }
            }
        } catch (error) {
            this.outputChannel.appendLine(`Error scanning directory ${dirPath}: ${error}`);
        }
    }

    private async parseMarkdownFile(filePath: string): Promise<ParsedMarkdown> {
        const content = await fs.promises.readFile(filePath, 'utf8');
        const category = this.prioritizer.categorizeDocument(filePath);
        const priority = this.prioritizer.calculatePriority(filePath, content);
        const tokenCount = this.budgetManager.estimateTokens(content);

        const title = this.extractTitle(content);
        const sections = this.extractSections(content);
        const codeBlocks = this.extractCodeBlocks(content);
        const summary = this.generateSummary(content);

        return {
            path: filePath,
            title,
            content,
            sections,
            codeBlocks,
            tokenCount,
            priority,
            category,
            summary
        };
    }

    private async parseMarkdownFileAsMarkdownFile(filePath: string): Promise<MarkdownFile> {
        const content = await fs.promises.readFile(filePath, 'utf8');
        const stat = await fs.promises.stat(filePath);
        const category = this.prioritizer.categorizeDocument(filePath);
        const priority = this.prioritizer.calculatePriority(filePath, content);
        const tokenCount = this.budgetManager.estimateTokens(content);

        return {
            path: filePath,
            content,
            tokenCount,
            priority,
            category,
            lastModified: stat.mtime,
            size: stat.size
        };
    }

    private async findFileByPattern(pattern: RegExp, extension: string): Promise<string | null> {
        try {
            const files = await fs.promises.readdir(this.workspaceRoot);

            for (const file of files) {
                if (pattern.test(file) && file.endsWith(extension)) {
                    return path.join(this.workspaceRoot, file);
                }
            }

            return null;
        } catch (error) {
            return null;
        }
    }

    private async extractDependencies(): Promise<Dependency[]> {
        const dependencies: Dependency[] = [];

        // 处理 package.json
        const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(await fs.promises.readFile(packageJsonPath, 'utf8'));
                dependencies.push(...this.extractPackageJsonDependencies(packageJson));
            } catch (error) {
                this.outputChannel.appendLine(`Error reading package.json: ${error}`);
            }
        }

        // TODO: 添加其他包管理器的支持 (Cargo.toml, go.mod, requirements.txt等)

        return dependencies;
    }

    private extractPackageJsonDependencies(packageJson: any): Dependency[] {
        const dependencies: Dependency[] = [];

        // 生产依赖
        if (packageJson.dependencies) {
            Object.entries(packageJson.dependencies).forEach(([name, version]) => {
                dependencies.push({
                    name,
                    version: version as string,
                    type: 'production',
                    category: this.categorizeDependency(name)
                });
            });
        }

        // 开发依赖
        if (packageJson.devDependencies) {
            Object.entries(packageJson.devDependencies).forEach(([name, version]) => {
                dependencies.push({
                    name,
                    version: version as string,
                    type: 'development',
                    category: this.categorizeDependency(name)
                });
            });
        }

        // Peer依赖
        if (packageJson.peerDependencies) {
            Object.entries(packageJson.peerDependencies).forEach(([name, version]) => {
                dependencies.push({
                    name,
                    version: version as string,
                    type: 'peer',
                    category: this.categorizeDependency(name)
                });
            });
        }

        return dependencies;
    }

    private async extractScripts(): Promise<ScriptInfo[]> {
        const scripts: ScriptInfo[] = [];

        const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(await fs.promises.readFile(packageJsonPath, 'utf8'));

                if (packageJson.scripts) {
                    Object.entries(packageJson.scripts).forEach(([name, command]) => {
                        scripts.push({
                            name,
                            command: command as string,
                            description: this.generateScriptDescription(name, command as string)
                        });
                    });
                }
            } catch (error) {
                this.outputChannel.appendLine(`Error reading scripts from package.json: ${error}`);
            }
        }

        return scripts;
    }

    // 辅助方法继承自父类





    private generateSummary(content: string): string {
        // 提取前200个字符作为摘要
        const text = content.replace(/```[\s\S]*?```/g, '') // 移除代码块
                           .replace(/#{1,6}\s+/g, '') // 移除标题标记
                           .replace(/\n+/g, ' ') // 合并换行
                           .trim();

        return text.length > 200 ? text.substring(0, 200) + '...' : text;
    }

    private categorizeDependency(name: string): string {
        if (name.includes('react') || name.includes('vue') || name.includes('angular')) return 'frontend-framework';
        if (name.includes('express') || name.includes('koa') || name.includes('fastify')) return 'backend-framework';
        if (name.includes('test') || name.includes('jest') || name.includes('mocha')) return 'testing';
        if (name.includes('webpack') || name.includes('vite') || name.includes('rollup')) return 'build-tool';
        if (name.includes('eslint') || name.includes('prettier') || name.includes('typescript')) return 'development-tool';
        return 'library';
    }

    private generateScriptDescription(name: string, command: string): string {
        const descriptions: Record<string, string> = {
            'start': '启动应用程序',
            'dev': '启动开发服务器',
            'build': '构建生产版本',
            'test': '运行测试',
            'lint': '代码检查',
            'format': '代码格式化',
            'deploy': '部署应用',
            'clean': '清理构建文件'
        };

        return descriptions[name] || `执行: ${command}`;
    }

    // 公共方法：清理缓存
    clearCache(): void {
        this.cache.clear();
        this.outputChannel.appendLine('Document cache cleared');
    }

    // 公共方法：获取缓存统计
    getCacheStats(): { size: number; hitRate: number } {
        return this.cache.getStats();
    }
}
