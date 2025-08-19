import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface TechStack {
    language: string;
    framework?: string;
    category: 'frontend' | 'backend' | 'mobile' | 'desktop' | 'library' | 'tool';
    confidence: number;
}

export interface ProjectFeature {
    name: string;
    description: string;
    category: string;
    importance: number;
}

export interface ProjectMetadata {
    name: string;
    description: string;
    version: string;
    author?: string;
    license?: string;
    repositoryUrl?: string;
    homepage?: string;
    keywords: string[];
}

export interface MarkdownDocument {
    path: string;
    title: string;
    content: string;
    sections: string[];
    codeBlocks: string[];
    tokenCount?: number;
}

export interface FileStructure {
    totalFiles: number;
    directories: string[];
    mainFiles: string[];
    configFiles: string[];
    documentationFiles: string[];
}

// New interfaces from Enhanced version
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

// Simplified document cache
interface CachedDocument {
    document: MarkdownDocument;
    mtime: Date;
}

// Enhanced project analysis interface
export interface ProjectAnalysis {
    metadata: ProjectMetadata;
    structure: FileStructure;
    techStack: TechStack[];
    features: ProjectFeature[];
    documents: MarkdownDocument[];
    dependencies: Dependency[];
    scripts: ScriptInfo[];
    tokenCount?: number;
}

export class ProjectAnalyzer {
    protected workspaceRoot: string;
    protected outputChannel: vscode.OutputChannel;
    private documentCache = new Map<string, CachedDocument>();

    constructor(workspaceRoot: string, outputChannel: vscode.OutputChannel) {
        this.workspaceRoot = workspaceRoot;
        this.outputChannel = outputChannel;
    }

    async analyzeProject(): Promise<ProjectAnalysis> {
        this.outputChannel.appendLine('Analyzing project structure...');

        const startTime = Date.now();
        const analysis: ProjectAnalysis = {
            metadata: await this.extractMetadata(),
            structure: await this.analyzeFileStructure(),
            techStack: await this.identifyTechStack(),
            features: await this.extractFeatures(),
            documents: await this.parseDocuments(),
            dependencies: await this.extractDependencies(),
            scripts: await this.extractScripts()
        };

        // Calculate total token count
        analysis.tokenCount = analysis.documents.reduce((sum, doc) => sum + (doc.tokenCount || 0), 0);

        const duration = Date.now() - startTime;
        this.outputChannel.appendLine(`Project analysis completed in ${duration}ms`);
        this.outputChannel.appendLine(`Found ${analysis.documents.length} documents, ${analysis.tokenCount} total tokens`);

        return analysis;
    }

    private async extractMetadata(): Promise<ProjectMetadata> {
        const metadata: ProjectMetadata = {
            name: path.basename(this.workspaceRoot),
            description: '',
            version: '1.0.0',
            keywords: []
        };

        // Try to read package.json
        const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                metadata.name = packageJson.name || metadata.name;
                metadata.description = packageJson.description || '';
                metadata.version = packageJson.version || metadata.version;
                metadata.author = packageJson.author;
                metadata.license = packageJson.license;
                metadata.repositoryUrl = packageJson.repository?.url;
                metadata.homepage = packageJson.homepage;
                metadata.keywords = packageJson.keywords || [];
            } catch (error) {
                this.outputChannel.appendLine(`Error reading package.json: ${error}`);
            }
        }

        // Try to read Cargo.toml
        const cargoTomlPath = path.join(this.workspaceRoot, 'Cargo.toml');
        if (fs.existsSync(cargoTomlPath)) {
            try {
                const cargoContent = fs.readFileSync(cargoTomlPath, 'utf8');
                const nameMatch = cargoContent.match(/name\s*=\s*"([^"]+)"/);
                const versionMatch = cargoContent.match(/version\s*=\s*"([^"]+)"/);
                const descriptionMatch = cargoContent.match(/description\s*=\s*"([^"]+)"/);
                
                if (nameMatch) metadata.name = nameMatch[1];
                if (versionMatch) metadata.version = versionMatch[1];
                if (descriptionMatch) metadata.description = descriptionMatch[1];
            } catch (error) {
                this.outputChannel.appendLine(`Error reading Cargo.toml: ${error}`);
            }
        }

        return metadata;
    }

    private async analyzeFileStructure(): Promise<FileStructure> {
        const structure: FileStructure = {
            totalFiles: 0,
            directories: [],
            mainFiles: [],
            configFiles: [],
            documentationFiles: []
        };

        const scanDirectory = (dirPath: string, depth: number = 0): void => {
            if (depth > 3) return; // Limit depth to avoid deep recursion

            try {
                const items = fs.readdirSync(dirPath);
                
                for (const item of items) {
                    if (item.startsWith('.') && item !== '.github') continue;
                    
                    const itemPath = path.join(dirPath, item);
                    const stat = fs.statSync(itemPath);
                    
                    if (stat.isDirectory()) {
                        const relativePath = path.relative(this.workspaceRoot, itemPath);
                        structure.directories.push(relativePath);
                        scanDirectory(itemPath, depth + 1);
                    } else {
                        structure.totalFiles++;
                        const relativePath = path.relative(this.workspaceRoot, itemPath);
                        
                        // Categorize files
                        if (this.isMainFile(item)) {
                            structure.mainFiles.push(relativePath);
                        } else if (this.isConfigFile(item)) {
                            structure.configFiles.push(relativePath);
                        } else if (this.isDocumentationFile(item)) {
                            structure.documentationFiles.push(relativePath);
                        }
                    }
                }
            } catch (error) {
                this.outputChannel.appendLine(`Error scanning directory ${dirPath}: ${error}`);
            }
        };

        scanDirectory(this.workspaceRoot);
        return structure;
    }

    private async identifyTechStack(): Promise<TechStack[]> {
        const techStack: TechStack[] = [];
        
        // Check for various technology indicators
        const indicators = [
            { file: 'package.json', tech: { language: 'JavaScript', category: 'frontend' as const, confidence: 0.9 } },
            { file: 'tsconfig.json', tech: { language: 'TypeScript', category: 'frontend' as const, confidence: 0.9 } },
            { file: 'Cargo.toml', tech: { language: 'Rust', category: 'backend' as const, confidence: 0.9 } },
            { file: 'requirements.txt', tech: { language: 'Python', category: 'backend' as const, confidence: 0.8 } },
            { file: 'go.mod', tech: { language: 'Go', category: 'backend' as const, confidence: 0.9 } },
            { file: 'pom.xml', tech: { language: 'Java', category: 'backend' as const, confidence: 0.8 } },
            { file: 'Gemfile', tech: { language: 'Ruby', category: 'backend' as const, confidence: 0.8 } },
            { file: 'composer.json', tech: { language: 'PHP', category: 'backend' as const, confidence: 0.8 } }
        ];

        for (const indicator of indicators) {
            const filePath = path.join(this.workspaceRoot, indicator.file);
            if (fs.existsSync(filePath)) {
                techStack.push(indicator.tech);
            }
        }

        // Check for frameworks in package.json
        const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
                
                const frameworks = [
                    { name: 'react', framework: 'React', category: 'frontend' as const },
                    { name: 'vue', framework: 'Vue.js', category: 'frontend' as const },
                    { name: 'angular', framework: 'Angular', category: 'frontend' as const },
                    { name: 'express', framework: 'Express.js', category: 'backend' as const },
                    { name: 'next', framework: 'Next.js', category: 'frontend' as const },
                    { name: 'nuxt', framework: 'Nuxt.js', category: 'frontend' as const }
                ];

                for (const fw of frameworks) {
                    if (dependencies[fw.name]) {
                        techStack.push({
                            language: 'JavaScript',
                            framework: fw.framework,
                            category: fw.category,
                            confidence: 0.8
                        });
                    }
                }
            } catch (error) {
                this.outputChannel.appendLine(`Error analyzing package.json for frameworks: ${error}`);
            }
        }

        this.outputChannel.appendLine(`Tech stack detected: ${techStack.map(t => `${t.language}${t.framework ? ` (${t.framework})` : ''}`).join(', ')}`);

        return techStack;
    }

    private async extractFeatures(): Promise<ProjectFeature[]> {
        const features: ProjectFeature[] = [];
        
        // Try to extract features from README
        const readmePath = this.findReadmeFile();
        if (readmePath) {
            try {
                const readmeContent = fs.readFileSync(readmePath, 'utf8');
                const extractedFeatures = this.extractFeaturesFromText(readmeContent);
                features.push(...extractedFeatures);
            } catch (error) {
                this.outputChannel.appendLine(`Error reading README: ${error}`);
            }
        }

        this.outputChannel.appendLine(`Features extracted: ${features.length} features found`);
        return features;
    }

    private async parseDocuments(): Promise<MarkdownDocument[]> {
        const documents: MarkdownDocument[] = [];

        // Scan for all markdown files
        await this.scanMarkdownFiles(this.workspaceRoot, documents, 0, 3);

        this.outputChannel.appendLine(`Found ${documents.length} markdown documents`);
        return documents;
    }

    private async scanMarkdownFiles(dirPath: string, documents: MarkdownDocument[], depth: number, maxDepth: number): Promise<void> {
        if (depth > maxDepth) return;

        try {
            const items = await fs.promises.readdir(dirPath);

            for (const item of items) {
                // Skip hidden files and common ignore directories
                if (item.startsWith('.') || ['node_modules', 'dist', 'build', 'coverage'].includes(item)) {
                    continue;
                }

                const itemPath = path.join(dirPath, item);
                const stat = await fs.promises.stat(itemPath);

                if (stat.isDirectory()) {
                    await this.scanMarkdownFiles(itemPath, documents, depth + 1, maxDepth);
                } else if (item.toLowerCase().endsWith('.md')) {
                    try {
                        const doc = await this.parseMarkdownDocumentWithCache(itemPath);
                        documents.push(doc);
                    } catch (error) {
                        this.outputChannel.appendLine(`Error parsing ${itemPath}: ${error}`);
                    }
                }
            }
        } catch (error) {
            this.outputChannel.appendLine(`Error scanning directory ${dirPath}: ${error}`);
        }
    }

    private async parseMarkdownDocumentWithCache(filePath: string): Promise<MarkdownDocument> {
        try {
            const stat = await fs.promises.stat(filePath);
            const cached = this.documentCache.get(filePath);

            if (cached && cached.mtime >= stat.mtime) {
                return cached.document;
            }

            const content = await fs.promises.readFile(filePath, 'utf8');
            const doc = this.parseMarkdownDocument(filePath, content);

            this.documentCache.set(filePath, {
                document: doc,
                mtime: stat.mtime
            });

            return doc;
        } catch (error) {
            const cached = this.documentCache.get(filePath);
            if (cached) return cached.document;
            throw error;
        }
    }

    private findReadmeFile(): string | null {
        const readmeFiles = ['README.md', 'readme.md', 'README.txt', 'readme.txt', 'README'];
        
        for (const filename of readmeFiles) {
            const filePath = path.join(this.workspaceRoot, filename);
            if (fs.existsSync(filePath)) {
                return filePath;
            }
        }
        
        return null;
    }

    private parseMarkdownDocument(filePath: string, content: string): MarkdownDocument {
        const title = this.extractTitle(content);
        const sections = this.extractSections(content);
        const codeBlocks = this.extractCodeBlocks(content);
        const tokenCount = this.estimateTokens(content);

        return {
            path: filePath,
            title,
            content,
            sections,
            codeBlocks,
            tokenCount
        };
    }

    protected extractTitle(content: string): string {
        const titleMatch = content.match(/^#\s+(.+)$/m);
        return titleMatch ? titleMatch[1].trim() : 'Untitled';
    }

    protected extractSections(content: string): string[] {
        const sections = content.match(/^#{1,6}\s+.+$/gm) || [];
        return sections.map(section => section.replace(/^#+\s+/, '').trim());
    }

    protected extractCodeBlocks(content: string): string[] {
        const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
        return codeBlocks.map(block => block.replace(/```\w*\n?/, '').replace(/```$/, '').trim());
    }

    private extractFeaturesFromText(text: string): ProjectFeature[] {
        const features: ProjectFeature[] = [];
        
        // Look for feature lists (lines starting with - or *)
        const featureLines = text.match(/^[\s]*[-*]\s+(.+)$/gm) || [];
        
        featureLines.forEach((line, index) => {
            const feature = line.replace(/^[\s]*[-*]\s+/, '').trim();
            if (feature.length > 10 && feature.length < 200) {
                features.push({
                    name: feature.split('.')[0].trim(),
                    description: feature,
                    category: 'general',
                    importance: Math.max(0.5, 1 - (index * 0.1))
                });
            }
        });

        return features;
    }

    // New methods for enhanced functionality
    private async extractDependencies(): Promise<Dependency[]> {
        const dependencies: Dependency[] = [];

        // Handle package.json
        const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(await fs.promises.readFile(packageJsonPath, 'utf8'));
                dependencies.push(...this.extractPackageJsonDependencies(packageJson));
            } catch (error) {
                this.outputChannel.appendLine(`Error reading package.json: ${error}`);
            }
        }

        // TODO: Add support for other package managers (Cargo.toml, go.mod, requirements.txt, etc.)
        return dependencies;
    }

    private extractPackageJsonDependencies(packageJson: any): Dependency[] {
        const dependencies: Dependency[] = [];

        // Production dependencies
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

        // Development dependencies
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

        // Peer dependencies
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
            'start': 'Start the application',
            'dev': 'Start development server',
            'build': 'Build for production',
            'test': 'Run tests',
            'lint': 'Lint code',
            'format': 'Format code',
            'deploy': 'Deploy application',
            'clean': 'Clean build files'
        };

        return descriptions[name] || `Execute: ${command}`;
    }

    private estimateTokens(text: string): number {
        // Simple token estimation: ~4 characters = 1 token (English), ~2 characters = 1 token (Chinese)
        const englishChars = (text.match(/[a-zA-Z0-9\s]/g) || []).length;
        const chineseChars = text.length - englishChars;
        return Math.ceil(englishChars / 4 + chineseChars / 2);
    }

    // Utility methods
    private isMainFile(filename: string): boolean {
        const mainFiles = [
            'index.js', 'index.ts', 'main.js', 'main.ts', 'app.js', 'app.ts',
            'main.py', 'app.py', 'main.go', 'main.rs', 'lib.rs'
        ];
        return mainFiles.includes(filename.toLowerCase());
    }

    private isConfigFile(filename: string): boolean {
        const configFiles = [
            'package.json', 'tsconfig.json', 'webpack.config.js', 'vite.config.js',
            'Cargo.toml', 'go.mod', 'requirements.txt', 'Pipfile', 'poetry.lock',
            '.gitignore', '.eslintrc', '.prettierrc', 'docker-compose.yml', 'Dockerfile'
        ];
        return configFiles.includes(filename) || filename.startsWith('.env');
    }

    private isDocumentationFile(filename: string): boolean {
        const docFiles = ['README.md', 'CHANGELOG.md', 'LICENSE', 'CONTRIBUTING.md', 'DOCS.md'];
        return docFiles.includes(filename) || filename.toLowerCase().endsWith('.md');
    }

    // Public utility methods
    clearCache(): void {
        this.documentCache.clear();
        this.outputChannel.appendLine('Document cache cleared');
    }

    getCacheStats(): { size: number; hitRate: number } {
        return { size: this.documentCache.size, hitRate: 0 };
    }
}
