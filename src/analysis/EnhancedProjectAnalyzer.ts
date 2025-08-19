/**
 * Simplified Enhanced Project Analyzer
 * 
 * This is a simplified version that provides backward compatibility
 * while leveraging the merged ProjectAnalyzer functionality.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { ProjectAnalyzer, ProjectAnalysis } from './ProjectAnalyzer';

export type DocumentCategory = 'readme' | 'docs' | 'changelog' | 'guide' | 'api' | 'example' | 'test' | 'config' | 'other';

// Simplified interfaces for backward compatibility
export interface MarkdownFile {
    path: string;
    content: string;
    tokenCount: number;
    priority: number;
    category: DocumentCategory;
    lastModified: Date;
    size: number;
}

// Enhanced interface with backward compatibility
export interface EnhancedProjectAnalysis extends ProjectAnalysis {
    // Legacy structure for backward compatibility
    structured: {
        metadata: any;
        techStack: any[];
        dependencies: any[];
        scripts: any[];
    };
    semiStructured: {
        readme?: any;
        changelog?: any;
        userGuide?: any;
        primaryDocs: any[];
    };
    fullText: {
        allMarkdownFiles: MarkdownFile[];
        totalTokens: number;
        averagePriority: number;
        categories: Record<DocumentCategory, number>;
    };
    meta: {
        analysisTime: Date;
        totalFiles: number;
        cacheHits: number;
        contextStrategy: 'minimal' | 'balanced' | 'comprehensive';
    };
}

// Simplified Enhanced Project Analyzer class
export class EnhancedProjectAnalyzer extends ProjectAnalyzer {
    constructor(workspaceRoot: string, outputChannel: vscode.OutputChannel) {
        super(workspaceRoot, outputChannel);
    }

    async analyzeProjectEnhanced(strategy: 'minimal' | 'balanced' | 'comprehensive' = 'balanced'): Promise<EnhancedProjectAnalysis> {
        // Get base analysis
        const analysis = await this.analyzeProject();

        // Convert to MarkdownFile format for backward compatibility
        const markdownFiles = analysis.documents.map(doc => ({
            path: doc.path,
            content: doc.content,
            tokenCount: doc.tokenCount || 0,
            priority: 50, // Default priority
            category: this.categorizeDocument(doc.path),
            lastModified: new Date(),
            size: doc.content.length
        }));

        // Create enhanced analysis with backward compatibility structure
        const enhancedAnalysis: EnhancedProjectAnalysis = {
            ...analysis,
            structured: {
                metadata: analysis.metadata,
                techStack: analysis.techStack,
                dependencies: analysis.dependencies,
                scripts: analysis.scripts
            },
            semiStructured: {
                readme: undefined,
                changelog: undefined,
                userGuide: undefined,
                primaryDocs: []
            },
            fullText: {
                allMarkdownFiles: markdownFiles,
                totalTokens: analysis.tokenCount || 0,
                averagePriority: 50,
                categories: this.calculateCategories(markdownFiles)
            },
            meta: {
                analysisTime: new Date(),
                totalFiles: analysis.documents.length,
                cacheHits: 0,
                contextStrategy: strategy
            }
        };

        return enhancedAnalysis;
    }

    async updateAnalysis(changedFiles: string[], previousAnalysis: EnhancedProjectAnalysis): Promise<EnhancedProjectAnalysis> {
        // For now, just re-analyze the entire project
        return await this.analyzeProjectEnhanced();
    }

    async getOptimizedContext(analysis: EnhancedProjectAnalysis, strategy?: 'minimal' | 'balanced' | 'comprehensive'): Promise<MarkdownFile[]> {
        // Convert MarkdownDocument to MarkdownFile format for backward compatibility
        return analysis.documents.map(doc => ({
            path: doc.path,
            content: doc.content,
            tokenCount: doc.tokenCount || 0,
            priority: 50, // Default priority
            category: this.categorizeDocument(doc.path),
            lastModified: new Date(),
            size: doc.content.length
        }));
    }

    private categorizeDocument(filePath: string): DocumentCategory {
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

    private calculateCategories(markdownFiles: MarkdownFile[]): Record<DocumentCategory, number> {
        const categories: Record<DocumentCategory, number> = {
            readme: 0, docs: 0, changelog: 0, guide: 0, api: 0,
            example: 0, test: 0, config: 0, other: 0
        };

        markdownFiles.forEach(file => {
            categories[file.category]++;
        });

        return categories;
    }
}
