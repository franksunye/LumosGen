import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { t } from '../i18n';

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
}

export interface FileStructure {
    totalFiles: number;
    directories: string[];
    mainFiles: string[];
    configFiles: string[];
    documentationFiles: string[];
}

export interface ProjectAnalysis {
    metadata: ProjectMetadata;
    structure: FileStructure;
    techStack: TechStack[];
    features: ProjectFeature[];
    documents: MarkdownDocument[];
    marketingPotential: number;
    targetAudience: string[];
    valuePropositions: string[];
}

export class ProjectAnalyzer {
    private workspaceRoot: string;
    private outputChannel: vscode.OutputChannel;

    constructor(workspaceRoot: string, outputChannel: vscode.OutputChannel) {
        this.workspaceRoot = workspaceRoot;
        this.outputChannel = outputChannel;
    }

    async analyzeProject(): Promise<ProjectAnalysis> {
        this.outputChannel.appendLine(t('analysis.scanning'));

        const analysis: ProjectAnalysis = {
            metadata: await this.extractMetadata(),
            structure: await this.analyzeFileStructure(),
            techStack: await this.identifyTechStack(),
            features: await this.extractFeatures(),
            documents: await this.parseDocuments(),
            marketingPotential: 0,
            targetAudience: [],
            valuePropositions: []
        };

        // Calculate marketing potential and extract insights
        analysis.marketingPotential = this.calculateMarketingPotential(analysis);
        analysis.targetAudience = this.identifyTargetAudience(analysis);
        analysis.valuePropositions = this.extractValuePropositions(analysis);

        this.outputChannel.appendLine(t('analysis.analysisComplete'));
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

        this.outputChannel.appendLine(t('analysis.techStackDetected', { 
            techStack: techStack.map(t => `${t.language}${t.framework ? ` (${t.framework})` : ''}`).join(', ')
        }));

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

        this.outputChannel.appendLine(t('analysis.featuresExtracted', { count: features.length }));
        return features;
    }

    private async parseDocuments(): Promise<MarkdownDocument[]> {
        const documents: MarkdownDocument[] = [];
        
        const readmePath = this.findReadmeFile();
        if (readmePath) {
            try {
                const content = fs.readFileSync(readmePath, 'utf8');
                const doc = this.parseMarkdownDocument(readmePath, content);
                documents.push(doc);
                this.outputChannel.appendLine(t('analysis.readmeFound'));
            } catch (error) {
                this.outputChannel.appendLine(`Error parsing README: ${error}`);
            }
        } else {
            this.outputChannel.appendLine(t('analysis.noReadme'));
        }

        return documents;
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
        
        return {
            path: filePath,
            title,
            content,
            sections,
            codeBlocks
        };
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

    private calculateMarketingPotential(analysis: ProjectAnalysis): number {
        let score = 0.5; // Base score
        
        // Boost for good documentation
        if (analysis.documents.length > 0) score += 0.2;
        
        // Boost for modern tech stack
        const modernTech = ['TypeScript', 'React', 'Vue.js', 'Next.js', 'Rust', 'Go'];
        const hasModernTech = analysis.techStack.some(tech => 
            modernTech.includes(tech.language) || modernTech.includes(tech.framework || '')
        );
        if (hasModernTech) score += 0.2;
        
        // Boost for features
        if (analysis.features.length > 3) score += 0.1;
        
        return Math.min(1.0, score);
    }

    private identifyTargetAudience(analysis: ProjectAnalysis): string[] {
        const audiences: string[] = [];
        
        // Based on tech stack
        const frontendTech = analysis.techStack.filter(t => t.category === 'frontend');
        const backendTech = analysis.techStack.filter(t => t.category === 'backend');
        
        if (frontendTech.length > 0) audiences.push('Frontend Developers');
        if (backendTech.length > 0) audiences.push('Backend Developers');
        
        // Based on project type
        if (analysis.metadata.keywords.includes('library')) audiences.push('Library Users');
        if (analysis.metadata.keywords.includes('tool')) audiences.push('Developer Tools Users');
        
        return audiences.length > 0 ? audiences : ['Developers'];
    }

    private extractValuePropositions(analysis: ProjectAnalysis): string[] {
        const propositions: string[] = [];
        
        // From description
        if (analysis.metadata.description) {
            propositions.push(analysis.metadata.description);
        }
        
        // From top features
        const topFeatures = analysis.features
            .sort((a, b) => b.importance - a.importance)
            .slice(0, 3)
            .map(f => f.description);
        
        propositions.push(...topFeatures);
        
        return propositions;
    }

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
}
