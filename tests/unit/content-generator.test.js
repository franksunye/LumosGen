/**
 * 内容生成器单元测试
 * 测试营销内容生成的核心功能
 */

const { TestUtils, TestAssertions } = require('../test-config');

// Mock项目分析结果
const mockProjectAnalysis = {
    name: 'awesome-library',
    description: 'An awesome JavaScript library for developers',
    techStack: ['JavaScript', 'Node.js', 'TypeScript'],
    features: [
        'Easy to use API',
        'High performance',
        'TypeScript support',
        'Comprehensive documentation'
    ],
    useCases: [
        'Web development',
        'API integration',
        'Data processing'
    ],
    targetAudience: 'JavaScript developers',
    repositoryUrl: 'https://github.com/user/awesome-library',
    license: 'MIT',
    keywords: ['javascript', 'library', 'api', 'typescript']
};

// Mock内容生成器
class MockContentGenerator {
    constructor(aiService) {
        this.aiService = aiService;
        this.templates = {
            homepage: {
                sections: ['hero', 'features', 'cta'],
                minLength: 500,
                maxLength: 2000
            },
            about: {
                sections: ['overview', 'technical-details', 'benefits'],
                minLength: 300,
                maxLength: 1500
            },
            blog: {
                sections: ['introduction', 'content', 'conclusion'],
                minLength: 800,
                maxLength: 3000
            },
            faq: {
                sections: ['questions', 'answers'],
                minLength: 400,
                maxLength: 1200
            }
        };
    }

    async generateHomepage(projectAnalysis) {
        const prompt = this.buildHomepagePrompt(projectAnalysis);
        const response = await this.aiService.generateContent(prompt);
        
        return {
            type: 'homepage',
            title: `${projectAnalysis.name} - ${projectAnalysis.description}`,
            content: response.content,
            sections: this.extractSections(response.content, this.templates.homepage.sections),
            metadata: {
                keywords: projectAnalysis.keywords,
                description: projectAnalysis.description,
                author: 'LumosGen',
                generated: new Date().toISOString()
            },
            stats: {
                wordCount: this.countWords(response.content),
                readingTime: this.estimateReadingTime(response.content),
                tokens: response.tokens,
                cost: response.cost
            }
        };
    }

    async generateAboutPage(projectAnalysis) {
        const prompt = this.buildAboutPrompt(projectAnalysis);
        const response = await this.aiService.generateContent(prompt);
        
        return {
            type: 'about',
            title: `About ${projectAnalysis.name}`,
            content: response.content,
            sections: this.extractSections(response.content, this.templates.about.sections),
            metadata: {
                keywords: projectAnalysis.keywords,
                description: `Learn more about ${projectAnalysis.name}`,
                author: 'LumosGen',
                generated: new Date().toISOString()
            },
            stats: {
                wordCount: this.countWords(response.content),
                readingTime: this.estimateReadingTime(response.content),
                tokens: response.tokens,
                cost: response.cost
            }
        };
    }

    async generateBlogPost(projectAnalysis, topic) {
        const prompt = this.buildBlogPrompt(projectAnalysis, topic);
        const response = await this.aiService.generateContent(prompt);
        
        return {
            type: 'blog',
            title: `${topic} with ${projectAnalysis.name}`,
            content: response.content,
            sections: this.extractSections(response.content, this.templates.blog.sections),
            metadata: {
                keywords: [...projectAnalysis.keywords, ...topic.toLowerCase().split(' ')],
                description: `Learn how to ${topic.toLowerCase()} with ${projectAnalysis.name}`,
                author: 'LumosGen',
                generated: new Date().toISOString(),
                topic
            },
            stats: {
                wordCount: this.countWords(response.content),
                readingTime: this.estimateReadingTime(response.content),
                tokens: response.tokens,
                cost: response.cost
            }
        };
    }

    async generateFAQ(projectAnalysis) {
        const prompt = this.buildFAQPrompt(projectAnalysis);
        const response = await this.aiService.generateContent(prompt);
        
        const qaItems = this.extractQAItems(response.content);
        
        return {
            type: 'faq',
            title: `${projectAnalysis.name} FAQ`,
            content: response.content,
            qaItems,
            metadata: {
                keywords: [...projectAnalysis.keywords, 'faq', 'questions', 'help'],
                description: `Frequently asked questions about ${projectAnalysis.name}`,
                author: 'LumosGen',
                generated: new Date().toISOString()
            },
            stats: {
                wordCount: this.countWords(response.content),
                readingTime: this.estimateReadingTime(response.content),
                questionCount: qaItems.length,
                tokens: response.tokens,
                cost: response.cost
            }
        };
    }

    buildHomepagePrompt(projectAnalysis) {
        return `Create a professional homepage for ${projectAnalysis.name}, a ${projectAnalysis.description}.
        
Tech Stack: ${projectAnalysis.techStack.join(', ')}
Key Features: ${projectAnalysis.features.join(', ')}
Use Cases: ${projectAnalysis.useCases.join(', ')}
Target Audience: ${projectAnalysis.targetAudience}

Include:
- Compelling hero section
- Feature highlights
- Clear call-to-action
- Professional tone
- SEO-optimized content`;
    }

    buildAboutPrompt(projectAnalysis) {
        return `Create a detailed about page for ${projectAnalysis.name}.
        
Description: ${projectAnalysis.description}
Technical Details: ${projectAnalysis.techStack.join(', ')}
Key Benefits: ${projectAnalysis.features.join(', ')}

Include:
- Project overview
- Technical architecture
- Benefits and advantages
- Use case examples`;
    }

    buildBlogPrompt(projectAnalysis, topic) {
        return `Write a technical blog post about "${topic}" using ${projectAnalysis.name}.
        
Project: ${projectAnalysis.name}
Description: ${projectAnalysis.description}
Tech Stack: ${projectAnalysis.techStack.join(', ')}

Include:
- Introduction to the topic
- Step-by-step implementation
- Code examples
- Best practices
- Conclusion`;
    }

    buildFAQPrompt(projectAnalysis) {
        return `Create a comprehensive FAQ for ${projectAnalysis.name}.
        
Project: ${projectAnalysis.name}
Description: ${projectAnalysis.description}
Features: ${projectAnalysis.features.join(', ')}
Use Cases: ${projectAnalysis.useCases.join(', ')}

Include common questions about:
- Installation and setup
- Basic usage
- Advanced features
- Troubleshooting
- Best practices`;
    }

    extractSections(content, expectedSections) {
        const sections = {};
        for (const section of expectedSections) {
            // 简单的section提取逻辑
            const regex = new RegExp(`(${section}[^\\n]*\\n[\\s\\S]*?)(?=\\n\\n|$)`, 'i');
            const match = content.match(regex);
            sections[section] = match ? match[1].trim() : '';
        }
        return sections;
    }

    extractQAItems(content) {
        // 简单的Q&A提取逻辑
        const qaRegex = /Q:\s*([^\n]+)\n+A:\s*([^\n]+(?:\n(?!Q:)[^\n]+)*)/g;
        const qaItems = [];
        let match;
        
        while ((match = qaRegex.exec(content)) !== null) {
            qaItems.push({
                question: match[1].trim(),
                answer: match[2].trim()
            });
        }
        
        return qaItems;
    }

    countWords(text) {
        return text.split(/\s+/).filter(word => word.length > 0).length;
    }

    estimateReadingTime(text) {
        const wordsPerMinute = 200;
        const wordCount = this.countWords(text);
        return Math.ceil(wordCount / wordsPerMinute);
    }

    validateContent(content, template) {
        const wordCount = this.countWords(content.content);
        return {
            isValid: wordCount >= template.minLength && wordCount <= template.maxLength,
            wordCount,
            minLength: template.minLength,
            maxLength: template.maxLength,
            hasRequiredSections: template.sections.every(section => 
                content.sections && content.sections[section] && content.sections[section].length > 0
            )
        };
    }
}

// 测试套件
const contentGeneratorTests = {
    async setup() {
        // 创建Mock AI服务
        this.mockAIService = {
            generateContent: async (prompt) => {
                await TestUtils.sleep(100); // 模拟延迟
                return {
                    content: `Generated content for prompt: ${prompt.substring(0, 100)}...\n\nThis is a comprehensive response with multiple sections and detailed information.`,
                    tokens: Math.floor(prompt.length / 4),
                    cost: Math.floor(prompt.length / 4) * 0.0001,
                    provider: 'mock',
                    model: 'mock-model'
                };
            }
        };
        
        this.contentGenerator = new MockContentGenerator(this.mockAIService);
    },

    async testHomepageGeneration() {
        const homepage = await this.contentGenerator.generateHomepage(mockProjectAnalysis);
        
        TestAssertions.assertEqual(homepage.type, 'homepage', 'Content type should be homepage');
        TestAssertions.assertContains(homepage.title, mockProjectAnalysis.name, 'Title should contain project name');
        TestAssertions.assertTrue(homepage.content.length > 0, 'Content should not be empty');
        TestAssertions.assertTrue(homepage.stats.wordCount > 0, 'Word count should be positive');
        TestAssertions.assertTrue(homepage.stats.readingTime > 0, 'Reading time should be positive');
        TestAssertions.assertTrue(Array.isArray(homepage.metadata.keywords), 'Keywords should be an array');
    },

    async testAboutPageGeneration() {
        const aboutPage = await this.contentGenerator.generateAboutPage(mockProjectAnalysis);
        
        TestAssertions.assertEqual(aboutPage.type, 'about', 'Content type should be about');
        TestAssertions.assertContains(aboutPage.title, mockProjectAnalysis.name, 'Title should contain project name');
        TestAssertions.assertTrue(aboutPage.content.length > 0, 'Content should not be empty');
        TestAssertions.assertTrue(aboutPage.stats.wordCount > 0, 'Word count should be positive');
    },

    async testBlogPostGeneration() {
        const topic = 'Getting Started Guide';
        const blogPost = await this.contentGenerator.generateBlogPost(mockProjectAnalysis, topic);
        
        TestAssertions.assertEqual(blogPost.type, 'blog', 'Content type should be blog');
        TestAssertions.assertContains(blogPost.title, topic, 'Title should contain topic');
        TestAssertions.assertContains(blogPost.title, mockProjectAnalysis.name, 'Title should contain project name');
        TestAssertions.assertEqual(blogPost.metadata.topic, topic, 'Metadata should include topic');
        TestAssertions.assertTrue(blogPost.content.length > 0, 'Content should not be empty');
    },

    async testFAQGeneration() {
        const faq = await this.contentGenerator.generateFAQ(mockProjectAnalysis);
        
        TestAssertions.assertEqual(faq.type, 'faq', 'Content type should be faq');
        TestAssertions.assertContains(faq.title, 'FAQ', 'Title should contain FAQ');
        TestAssertions.assertTrue(Array.isArray(faq.qaItems), 'QA items should be an array');
        TestAssertions.assertTrue(faq.stats.questionCount >= 0, 'Question count should be non-negative');
    },

    async testContentValidation() {
        const homepage = await this.contentGenerator.generateHomepage(mockProjectAnalysis);
        const template = this.contentGenerator.templates.homepage;
        const validation = this.contentGenerator.validateContent(homepage, template);
        
        TestAssertions.assertTrue(typeof validation.isValid === 'boolean', 'Validation should return boolean');
        TestAssertions.assertTrue(validation.wordCount > 0, 'Word count should be positive');
        TestAssertions.assertEqual(validation.minLength, template.minLength, 'Min length should match template');
        TestAssertions.assertEqual(validation.maxLength, template.maxLength, 'Max length should match template');
    },

    async testWordCounting() {
        const text = "This is a test sentence with exactly eight words.";
        const wordCount = this.contentGenerator.countWords(text);
        
        TestAssertions.assertEqual(wordCount, 8, 'Word count should be accurate');
    },

    async testReadingTimeEstimation() {
        const text = "word ".repeat(200); // 200 words
        const readingTime = this.contentGenerator.estimateReadingTime(text);
        
        TestAssertions.assertEqual(readingTime, 1, 'Reading time should be 1 minute for 200 words');
    },

    async testEmptyProjectAnalysis() {
        const emptyAnalysis = {
            name: '',
            description: '',
            techStack: [],
            features: [],
            useCases: [],
            keywords: []
        };
        
        const homepage = await this.contentGenerator.generateHomepage(emptyAnalysis);
        
        TestAssertions.assertTrue(homepage.content.length > 0, 'Should generate content even with empty analysis');
        TestAssertions.assertEqual(homepage.type, 'homepage', 'Content type should still be homepage');
    },

    async testConcurrentGeneration() {
        const promises = [
            this.contentGenerator.generateHomepage(mockProjectAnalysis),
            this.contentGenerator.generateAboutPage(mockProjectAnalysis),
            this.contentGenerator.generateFAQ(mockProjectAnalysis)
        ];
        
        const results = await Promise.all(promises);
        
        TestAssertions.assertEqual(results.length, 3, 'Should handle concurrent generation');
        TestAssertions.assertEqual(results[0].type, 'homepage', 'First result should be homepage');
        TestAssertions.assertEqual(results[1].type, 'about', 'Second result should be about');
        TestAssertions.assertEqual(results[2].type, 'faq', 'Third result should be faq');
    },

    async teardown() {
        // 清理资源
        this.mockAIService = null;
        this.contentGenerator = null;
    }
};

module.exports = contentGeneratorTests;
