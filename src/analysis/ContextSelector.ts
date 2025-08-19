import { ProjectAnalysis, MarkdownDocument } from './ProjectAnalyzer';

export type DocumentCategory = 'readme' | 'docs' | 'changelog' | 'guide' | 'api' | 'example' | 'test' | 'config' | 'other';

export interface MarkdownFile {
    path: string;
    content: string;
    tokenCount: number;
    priority: number;
    category: DocumentCategory;
    lastModified: Date;
    size: number;
}

export type AITaskType = 
    | 'marketing-content'     // 营销内容生成
    | 'technical-docs'        // 技术文档生成
    | 'api-documentation'     // API文档生成
    | 'user-guide'           // 用户指南生成
    | 'changelog'            // 变更日志生成
    | 'readme-enhancement'   // README增强
    | 'project-analysis'     // 项目分析
    | 'feature-extraction'   // 特性提取
    | 'general';             // 通用任务

export interface ContextSelectionStrategy {
    taskType: AITaskType;
    requiredCategories: DocumentCategory[];
    optionalCategories: DocumentCategory[];
    priorityWeights: Record<DocumentCategory, number>;
    maxTokens: number;
    includeStructured: boolean;
    includeSemiStructured: boolean;
}

export interface SelectedContext {
    structured?: {
        metadata: any;
        techStack: any[];
        dependencies: any[];
        scripts: any[];
    };
    semiStructured?: {
        readme?: any;
        changelog?: any;
        userGuide?: any;
        primaryDocs: any[];
    };
    selectedFiles: MarkdownFile[];
    totalTokens: number;
    strategy: ContextSelectionStrategy;
    selectionReason: string;
}

// 智能上下文选择器
export class ContextSelector {
    private strategies: Record<AITaskType, ContextSelectionStrategy> = {
        'marketing-content': {
            taskType: 'marketing-content',
            requiredCategories: ['readme'],
            optionalCategories: ['docs', 'guide', 'example', 'changelog'],
            priorityWeights: { readme: 1.0, docs: 0.8, guide: 0.7, example: 0.6, changelog: 0.5, api: 0.3, test: 0.1, config: 0.1, other: 0.2 },
            maxTokens: 8000,
            includeStructured: true,
            includeSemiStructured: true
        },
        
        'technical-docs': {
            taskType: 'technical-docs',
            requiredCategories: ['docs', 'api'],
            optionalCategories: ['readme', 'guide', 'example', 'config'],
            priorityWeights: { docs: 1.0, api: 0.9, guide: 0.8, readme: 0.7, example: 0.6, config: 0.4, changelog: 0.3, test: 0.2, other: 0.1 },
            maxTokens: 12000,
            includeStructured: true,
            includeSemiStructured: true
        },
        
        'api-documentation': {
            taskType: 'api-documentation',
            requiredCategories: ['api'],
            optionalCategories: ['docs', 'example', 'readme'],
            priorityWeights: { api: 1.0, docs: 0.8, example: 0.7, readme: 0.5, guide: 0.4, config: 0.3, changelog: 0.2, test: 0.1, other: 0.1 },
            maxTokens: 10000,
            includeStructured: true,
            includeSemiStructured: false
        },
        
        'user-guide': {
            taskType: 'user-guide',
            requiredCategories: ['guide', 'readme'],
            optionalCategories: ['example', 'docs'],
            priorityWeights: { guide: 1.0, readme: 0.9, example: 0.8, docs: 0.6, api: 0.4, changelog: 0.3, config: 0.2, test: 0.1, other: 0.2 },
            maxTokens: 8000,
            includeStructured: true,
            includeSemiStructured: true
        },
        
        'changelog': {
            taskType: 'changelog',
            requiredCategories: ['changelog'],
            optionalCategories: ['readme', 'docs'],
            priorityWeights: { changelog: 1.0, readme: 0.6, docs: 0.4, guide: 0.3, api: 0.2, example: 0.2, config: 0.1, test: 0.1, other: 0.1 },
            maxTokens: 6000,
            includeStructured: true,
            includeSemiStructured: true
        },
        
        'readme-enhancement': {
            taskType: 'readme-enhancement',
            requiredCategories: ['readme'],
            optionalCategories: ['docs', 'guide', 'example', 'changelog'],
            priorityWeights: { readme: 1.0, docs: 0.7, guide: 0.6, example: 0.5, changelog: 0.4, api: 0.3, config: 0.2, test: 0.1, other: 0.2 },
            maxTokens: 8000,
            includeStructured: true,
            includeSemiStructured: true
        },
        
        'project-analysis': {
            taskType: 'project-analysis',
            requiredCategories: ['readme', 'docs'],
            optionalCategories: ['guide', 'api', 'example', 'changelog', 'config'],
            priorityWeights: { readme: 1.0, docs: 0.9, guide: 0.7, api: 0.6, example: 0.5, changelog: 0.4, config: 0.3, test: 0.2, other: 0.3 },
            maxTokens: 16000,
            includeStructured: true,
            includeSemiStructured: true
        },
        
        'feature-extraction': {
            taskType: 'feature-extraction',
            requiredCategories: ['readme'],
            optionalCategories: ['docs', 'guide', 'example'],
            priorityWeights: { readme: 1.0, docs: 0.8, guide: 0.7, example: 0.6, api: 0.4, changelog: 0.3, config: 0.2, test: 0.1, other: 0.2 },
            maxTokens: 10000,
            includeStructured: true,
            includeSemiStructured: true
        },
        
        'general': {
            taskType: 'general',
            requiredCategories: ['readme'],
            optionalCategories: ['docs', 'guide', 'example', 'api', 'changelog'],
            priorityWeights: { readme: 1.0, docs: 0.8, guide: 0.7, api: 0.6, example: 0.5, changelog: 0.4, config: 0.3, test: 0.2, other: 0.3 },
            maxTokens: 8000,
            includeStructured: true,
            includeSemiStructured: true
        }
    };
    
    selectContext(analysis: ProjectAnalysis, taskType: AITaskType): SelectedContext {
        const strategy = this.strategies[taskType];

        // Convert MarkdownDocument to MarkdownFile format
        const markdownFiles = analysis.documents.map(doc => this.convertToMarkdownFile(doc));

        // 1. 筛选相关文档
        const relevantFiles = this.filterRelevantFiles(markdownFiles, strategy);
        
        // 2. 应用优先级权重
        const weightedFiles = this.applyPriorityWeights(relevantFiles, strategy);
        
        // 3. 根据token预算选择文件
        const selectedFiles = this.selectFilesByTokenBudget(weightedFiles, strategy.maxTokens);
        
        // 4. 计算总token数
        const totalTokens = selectedFiles.reduce((sum, file) => sum + file.tokenCount, 0);
        
        // 5. 生成选择原因
        const selectionReason = this.generateSelectionReason(selectedFiles, strategy, analysis);
        
        return {
            structured: strategy.includeStructured ? {
                metadata: analysis.metadata,
                techStack: analysis.techStack,
                dependencies: analysis.dependencies,
                scripts: analysis.scripts
            } : undefined,
            semiStructured: strategy.includeSemiStructured ? {
                readme: undefined,
                changelog: undefined,
                userGuide: undefined,
                primaryDocs: []
            } : undefined,
            selectedFiles,
            totalTokens,
            strategy,
            selectionReason
        };
    }

    private convertToMarkdownFile(doc: MarkdownDocument): MarkdownFile {
        return {
            path: doc.path,
            content: doc.content,
            tokenCount: doc.tokenCount || 0,
            priority: 50, // Default priority
            category: this.categorizeDocument(doc.path),
            lastModified: new Date(),
            size: doc.content.length
        };
    }

    private categorizeDocument(filePath: string): DocumentCategory {
        const fileName = require('path').basename(filePath).toLowerCase();
        const dirPath = require('path').dirname(filePath).toLowerCase();

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

    private filterRelevantFiles(allFiles: MarkdownFile[], strategy: ContextSelectionStrategy): MarkdownFile[] {
        const requiredFiles = allFiles.filter(file => 
            strategy.requiredCategories.includes(file.category)
        );
        
        const optionalFiles = allFiles.filter(file => 
            strategy.optionalCategories.includes(file.category)
        );
        
        // 合并必需和可选文件，去重
        const relevantFiles = [...requiredFiles];
        optionalFiles.forEach(file => {
            if (!relevantFiles.some(existing => existing.path === file.path)) {
                relevantFiles.push(file);
            }
        });
        
        return relevantFiles;
    }
    
    private applyPriorityWeights(files: MarkdownFile[], strategy: ContextSelectionStrategy): MarkdownFile[] {
        return files.map(file => ({
            ...file,
            priority: file.priority * (strategy.priorityWeights[file.category] || 0.1)
        })).sort((a, b) => b.priority - a.priority);
    }
    
    private selectFilesByTokenBudget(files: MarkdownFile[], maxTokens: number): MarkdownFile[] {
        const selected: MarkdownFile[] = [];
        let totalTokens = 0;
        
        for (const file of files) {
            if (totalTokens + file.tokenCount <= maxTokens) {
                selected.push(file);
                totalTokens += file.tokenCount;
            } else {
                // 如果是高优先级文件，尝试截断
                if (file.priority > 70 && totalTokens < maxTokens * 0.8) {
                    const remainingTokens = maxTokens - totalTokens;
                    if (remainingTokens > 100) {
                        const truncatedFile = this.truncateFile(file, remainingTokens);
                        if (truncatedFile) {
                            selected.push(truncatedFile);
                            break;
                        }
                    }
                }
            }
        }
        
        return selected;
    }
    
    private truncateFile(file: MarkdownFile, maxTokens: number): MarkdownFile | null {
        if (file.tokenCount <= maxTokens) return file;
        
        // 简单的截断策略：保留前N个字符
        const ratio = maxTokens / file.tokenCount;
        const targetLength = Math.floor(file.content.length * ratio * 0.9);
        
        let truncatedContent = file.content.substring(0, targetLength);
        
        // 尝试在段落边界截断
        const lastParagraph = truncatedContent.lastIndexOf('\n\n');
        if (lastParagraph > targetLength * 0.7) {
            truncatedContent = truncatedContent.substring(0, lastParagraph);
        }
        
        truncatedContent += '\n\n[... 内容已截断 ...]';
        
        return {
            ...file,
            content: truncatedContent,
            tokenCount: maxTokens,
            size: truncatedContent.length
        };
    }
    
    private generateSelectionReason(files: MarkdownFile[], strategy: ContextSelectionStrategy, analysis: ProjectAnalysis): string {
        const categories = files.reduce((acc, file) => {
            acc[file.category] = (acc[file.category] || 0) + 1;
            return acc;
        }, {} as Record<DocumentCategory, number>);

        const categoryList = Object.entries(categories)
            .map(([cat, count]) => `${cat}(${count})`)
            .join(', ');

        const totalFiles = analysis.documents.length;
        const selectedCount = files.length;
        const selectionRate = ((selectedCount / totalFiles) * 100).toFixed(1);

        return `为${strategy.taskType}任务选择了${selectedCount}/${totalFiles}个文档(${selectionRate}%)，包含: ${categoryList}`;
    }
    
    // 自定义策略
    createCustomStrategy(taskType: AITaskType, customStrategy: Partial<ContextSelectionStrategy>): ContextSelectionStrategy {
        const baseStrategy = this.strategies[taskType] || this.strategies.general;
        
        return {
            ...baseStrategy,
            ...customStrategy,
            taskType
        };
    }
    
    // 获取所有可用策略
    getAvailableStrategies(): AITaskType[] {
        return Object.keys(this.strategies) as AITaskType[];
    }
    
    // 获取策略详情
    getStrategy(taskType: AITaskType): ContextSelectionStrategy {
        return this.strategies[taskType] || this.strategies.general;
    }
}
