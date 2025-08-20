// Content Validator - Ensures generated content matches template requirements
// Validates structure, format, and quality before rendering to HTML templates

export interface ValidationResult {
    isValid: boolean;
    score: number; // 0-100
    errors: ValidationError[];
    warnings: ValidationWarning[];
    suggestions: string[];
}

export interface ValidationError {
    type: 'structure' | 'format' | 'content' | 'length';
    message: string;
    line?: number;
    severity: 'critical' | 'major' | 'minor';
}

export interface ValidationWarning {
    type: 'style' | 'seo' | 'accessibility' | 'best-practice';
    message: string;
    suggestion: string;
}

export class ContentValidator {

    /**
     * 主要的内容验证方法 - 根据内容类型选择合适的验证策略
     */
    async validateContent(
        content: string,
        contentType: string,
        criteria?: { minWords?: number; maxWords?: number; requiredSections?: string[] }
    ): Promise<ValidationResult> {
        // 根据内容类型选择验证方法
        switch (contentType.toLowerCase()) {
            case 'homepage':
                return this.validateHomepage(content);
            case 'about':
                return this.validateAboutPage(content);
            case 'faq':
                return this.validateFAQ(content);
            case 'blog':
            case 'blog-post':
                return this.validateBlogPost(content);
            default:
                return this.validateGenericContent(content, criteria);
        }
    }

    /**
     * 通用内容验证方法
     */
    private validateGenericContent(
        content: string,
        criteria?: { minWords?: number; maxWords?: number; requiredSections?: string[] }
    ): ValidationResult {
        const result: ValidationResult = {
            isValid: true,
            score: 100,
            errors: [],
            warnings: [],
            suggestions: []
        };

        // 基本结构验证
        this.validateMarkdownStructure(content, 'generic', result);

        // 长度验证
        const wordCount = this.countWords(content);
        if (criteria?.minWords && wordCount < criteria.minWords) {
            result.errors.push({
                type: 'length',
                message: `Content too short: ${wordCount} words (minimum: ${criteria.minWords})`,
                severity: 'major'
            });
        }

        if (criteria?.maxWords && wordCount > criteria.maxWords) {
            result.warnings.push({
                type: 'style',
                message: `Content might be too long: ${wordCount} words (maximum: ${criteria.maxWords})`,
                suggestion: 'Consider breaking into smaller sections'
            });
        }

        // 必需章节验证
        if (criteria?.requiredSections) {
            for (const section of criteria.requiredSections) {
                if (!content.toLowerCase().includes(section.toLowerCase())) {
                    result.errors.push({
                        type: 'structure',
                        message: `Missing required section: ${section}`,
                        severity: 'major'
                    });
                }
            }
        }

        // 通用质量检查
        this.validateContentQuality(content, result);

        // 计算最终分数
        result.score = this.calculateScore(result);
        result.isValid = result.score >= 70 && result.errors.filter(e => e.severity === 'critical').length === 0;

        return result;
    }

    /**
     * 计算单词数
     */
    private countWords(content: string): number {
        return content.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    /**
     * Validates homepage content against template requirements
     */
    validateHomepage(content: string): ValidationResult {
        const result: ValidationResult = {
            isValid: true,
            score: 100,
            errors: [],
            warnings: [],
            suggestions: []
        };

        // Structure validation
        this.validateMarkdownStructure(content, 'homepage', result);
        
        // Content-specific validation
        this.validateHomepageSpecific(content, result);
        
        // General quality checks
        this.validateContentQuality(content, result);
        
        // Calculate final score
        result.score = this.calculateScore(result);
        result.isValid = result.score >= 70 && result.errors.filter(e => e.severity === 'critical').length === 0;
        
        return result;
    }

    /**
     * Validates about page content
     */
    validateAboutPage(content: string): ValidationResult {
        const result: ValidationResult = {
            isValid: true,
            score: 100,
            errors: [],
            warnings: [],
            suggestions: []
        };

        this.validateMarkdownStructure(content, 'about', result);
        this.validateAboutPageSpecific(content, result);
        this.validateContentQuality(content, result);
        
        result.score = this.calculateScore(result);
        result.isValid = result.score >= 70 && result.errors.filter(e => e.severity === 'critical').length === 0;
        
        return result;
    }

    /**
     * Validates FAQ content
     */
    validateFAQ(content: string): ValidationResult {
        const result: ValidationResult = {
            isValid: true,
            score: 100,
            errors: [],
            warnings: [],
            suggestions: []
        };

        this.validateMarkdownStructure(content, 'faq', result);
        this.validateFAQSpecific(content, result);
        this.validateContentQuality(content, result);
        
        result.score = this.calculateScore(result);
        result.isValid = result.score >= 70 && result.errors.filter(e => e.severity === 'critical').length === 0;
        
        return result;
    }

    /**
     * Validates blog post content
     */
    validateBlogPost(content: string): ValidationResult {
        const result: ValidationResult = {
            isValid: true,
            score: 100,
            errors: [],
            warnings: [],
            suggestions: []
        };

        this.validateMarkdownStructure(content, 'blog', result);
        this.validateBlogPostSpecific(content, result);
        this.validateContentQuality(content, result);
        
        result.score = this.calculateScore(result);
        result.isValid = result.score >= 70 && result.errors.filter(e => e.severity === 'critical').length === 0;
        
        return result;
    }

    private validateMarkdownStructure(content: string, pageType: string, result: ValidationResult): void {
        const lines = content.split('\n');
        
        // Check for H1 header
        const h1Count = lines.filter(line => line.startsWith('# ')).length;
        if (h1Count === 0) {
            result.errors.push({
                type: 'structure',
                message: 'Missing H1 header (# title)',
                severity: 'critical'
            });
        } else if (h1Count > 1) {
            result.warnings.push({
                type: 'style',
                message: 'Multiple H1 headers found. Consider using H2 for subsections.',
                suggestion: 'Use only one H1 header per page for better SEO'
            });
        }

        // Check for proper heading hierarchy
        this.validateHeadingHierarchy(lines, result);
        
        // Check for required sections based on page type
        this.validateRequiredSections(content, pageType, result);
    }

    private validateHeadingHierarchy(lines: string[], result: ValidationResult): void {
        const headings: { level: number; text: string; line: number }[] = [];
        
        lines.forEach((line, index) => {
            const match = line.match(/^(#{1,6})\s+(.+)$/);
            if (match) {
                headings.push({
                    level: match[1].length,
                    text: match[2],
                    line: index + 1
                });
            }
        });

        // Check for proper hierarchy (no skipping levels)
        for (let i = 1; i < headings.length; i++) {
            const current = headings[i];
            const previous = headings[i - 1];
            
            if (current.level > previous.level + 1) {
                result.warnings.push({
                    type: 'style',
                    message: `Heading level skipped at line ${current.line}: ${current.text}`,
                    suggestion: 'Use consecutive heading levels (H1 → H2 → H3) for better structure'
                });
            }
        }
    }

    private validateRequiredSections(content: string, pageType: string, result: ValidationResult): void {
        const requiredSections: { [key: string]: string[] } = {
            homepage: ['features', 'getting started', 'call.to.action'],
            about: ['mission', 'story', 'technology'],
            faq: ['questions', 'answers'],
            blog: ['introduction', 'conclusion']
        };

        const sections = requiredSections[pageType] || [];
        const contentLower = content.toLowerCase();
        
        sections.forEach(section => {
            const sectionPattern = section.replace('.', '\\s+');
            if (!new RegExp(sectionPattern).test(contentLower)) {
                result.warnings.push({
                    type: 'style',
                    message: `Missing recommended section: ${section.replace('.', ' ')}`,
                    suggestion: `Consider adding a ${section.replace('.', ' ')} section for better user experience`
                });
            }
        });
    }

    private validateHomepageSpecific(content: string, result: ValidationResult): void {
        // Check for features section with bullet points
        if (!content.includes('##') || !content.includes('- **')) {
            result.errors.push({
                type: 'structure',
                message: 'Missing features section with bullet points',
                severity: 'major'
            });
        }

        // Check for call-to-action
        const ctaPatterns = [
            /get started/i,
            /download/i,
            /try now/i,
            /learn more/i,
            /view documentation/i
        ];
        
        if (!ctaPatterns.some(pattern => pattern.test(content))) {
            result.warnings.push({
                type: 'best-practice',
                message: 'No clear call-to-action found',
                suggestion: 'Add a compelling call-to-action to encourage user engagement'
            });
        }

        // Check word count
        const wordCount = content.split(/\s+/).length;
        if (wordCount < 200) {
            result.errors.push({
                type: 'length',
                message: `Content too short: ${wordCount} words (minimum 200)`,
                severity: 'major'
            });
        } else if (wordCount > 600) {
            result.warnings.push({
                type: 'style',
                message: `Content might be too long: ${wordCount} words`,
                suggestion: 'Consider breaking into smaller sections for better readability'
            });
        }
    }

    private validateAboutPageSpecific(content: string, result: ValidationResult): void {
        // Check for personal/team story elements
        const storyKeywords = ['story', 'mission', 'vision', 'journey', 'started', 'founded'];
        if (!storyKeywords.some(keyword => content.toLowerCase().includes(keyword))) {
            result.warnings.push({
                type: 'best-practice',
                message: 'Missing story or mission elements',
                suggestion: 'Add personal story or mission statement to build connection with readers'
            });
        }

        // Check for technology mentions
        const techKeywords = ['technology', 'built', 'using', 'stack', 'framework'];
        if (!techKeywords.some(keyword => content.toLowerCase().includes(keyword))) {
            result.warnings.push({
                type: 'best-practice',
                message: 'Missing technology information',
                suggestion: 'Mention the technologies used to build credibility'
            });
        }
    }

    private validateFAQSpecific(content: string, result: ValidationResult): void {
        // Count Q&A pairs (H3 headers followed by content)
        const h3Count = (content.match(/^### /gm) || []).length;
        if (h3Count < 5) {
            result.warnings.push({
                type: 'best-practice',
                message: `Only ${h3Count} questions found. Consider adding more FAQs`,
                suggestion: 'Include at least 5-7 common questions for comprehensive coverage'
            });
        }

        // Check for question format
        const questionMarkers = ['?', 'how', 'what', 'why', 'when', 'where'];
        const h3Lines = content.split('\n').filter(line => line.startsWith('### '));
        
        h3Lines.forEach((line, index) => {
            const hasQuestionMarker = questionMarkers.some(marker => 
                line.toLowerCase().includes(marker)
            );
            
            if (!hasQuestionMarker) {
                result.warnings.push({
                    type: 'style',
                    message: `H3 header "${line}" doesn't appear to be a question`,
                    suggestion: 'Format FAQ headers as clear questions'
                });
            }
        });
    }

    private validateBlogPostSpecific(content: string, result: ValidationResult): void {
        // Check for introduction and conclusion
        const hasIntro = /^[^#\n]*\n\n/.test(content); // Content before first heading
        if (!hasIntro) {
            result.warnings.push({
                type: 'style',
                message: 'Missing introduction paragraph',
                suggestion: 'Add an engaging introduction before the first heading'
            });
        }

        // Check for conclusion
        const conclusionKeywords = ['conclusion', 'summary', 'wrap up', 'final thoughts'];
        if (!conclusionKeywords.some(keyword => content.toLowerCase().includes(keyword))) {
            result.warnings.push({
                type: 'style',
                message: 'Missing conclusion section',
                suggestion: 'Add a conclusion to summarize key points'
            });
        }

        // Check word count for blog posts
        const wordCount = content.split(/\s+/).length;
        if (wordCount < 400) {
            result.warnings.push({
                type: 'style',
                message: `Blog post might be too short: ${wordCount} words`,
                suggestion: 'Consider expanding with more details and examples'
            });
        }
    }

    private validateContentQuality(content: string, result: ValidationResult): void {
        // Check for empty sections
        const sections = content.split(/^##/m);
        sections.forEach((section, index) => {
            if (index > 0) { // Skip the part before first H2
                const lines = section.trim().split('\n').filter(line => line.trim());
                if (lines.length <= 1) {
                    result.warnings.push({
                        type: 'style',
                        message: 'Empty or very short section found',
                        suggestion: 'Ensure all sections have meaningful content'
                    });
                }
            }
        });

        // Check for placeholder text
        const placeholders = ['[placeholder]', '[todo]', '[tbd]', 'lorem ipsum'];
        placeholders.forEach(placeholder => {
            if (content.toLowerCase().includes(placeholder)) {
                result.errors.push({
                    type: 'content',
                    message: `Placeholder text found: ${placeholder}`,
                    severity: 'major'
                });
            }
        });

        // Check for proper markdown formatting
        this.validateMarkdownFormatting(content, result);
    }

    private validateMarkdownFormatting(content: string, result: ValidationResult): void {
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
            // Check for unmatched bold/italic markers
            const boldCount = (line.match(/\*\*/g) || []).length;
            const italicCount = (line.match(/(?<!\*)\*(?!\*)/g) || []).length;
            
            if (boldCount % 2 !== 0) {
                result.warnings.push({
                    type: 'style',
                    message: `Unmatched bold markers at line ${index + 1}`,
                    suggestion: 'Ensure all ** markers are properly paired'
                });
            }
            
            if (italicCount % 2 !== 0) {
                result.warnings.push({
                    type: 'style',
                    message: `Unmatched italic markers at line ${index + 1}`,
                    suggestion: 'Ensure all * markers are properly paired'
                });
            }
        });
    }

    private calculateScore(result: ValidationResult): number {
        let score = 100;
        
        // Deduct points for errors
        result.errors.forEach(error => {
            switch (error.severity) {
                case 'critical':
                    score -= 25;
                    break;
                case 'major':
                    score -= 15;
                    break;
                case 'minor':
                    score -= 5;
                    break;
            }
        });

        // Deduct points for warnings
        result.warnings.forEach(() => {
            score -= 2;
        });

        return Math.max(0, score);
    }

    /**
     * Suggests improvements for content based on validation results
     */
    generateImprovementSuggestions(result: ValidationResult): string[] {
        const suggestions: string[] = [];

        if (result.errors.length > 0) {
            suggestions.push('Fix critical errors first:');
            result.errors.forEach(error => {
                suggestions.push(`- ${error.message}`);
            });
        }

        if (result.warnings.length > 0) {
            suggestions.push('Consider these improvements:');
            result.warnings.forEach(warning => {
                suggestions.push(`- ${warning.suggestion}`);
            });
        }

        if (result.score >= 90) {
            suggestions.push('Excellent content quality! Ready for publication.');
        } else if (result.score >= 70) {
            suggestions.push('Good content quality with room for minor improvements.');
        } else {
            suggestions.push('Content needs significant improvements before publication.');
        }

        return suggestions;
    }
}
