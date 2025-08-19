// Structured Prompt Templates for Content Generation
// Ensures AI generates content that matches website template requirements

import { ProjectAnalysis } from '../analysis/ProjectAnalyzer';
import { ContentGenerationOptions } from './MarketingContentGenerator';

export interface PromptTemplate {
    name: string;
    description: string;
    template: string;
    expectedStructure: string[];
    validationRules: string[];
}

export class PromptTemplateLibrary {
    private templates: Map<string, PromptTemplate> = new Map();

    constructor() {
        this.initializeTemplates();
    }

    private initializeTemplates(): void {
        // Homepage Template
        this.templates.set('homepage', {
            name: 'Homepage',
            description: 'Marketing homepage with hero section, features, and CTA',
            template: this.getHomepageTemplate(),
            expectedStructure: [
                'H1 headline',
                'Hero description paragraph',
                'Features section with H2',
                'Value proposition section',
                'Getting started section',
                'Call-to-action'
            ],
            validationRules: [
                'Must start with H1 (#)',
                'Must include at least 3 features with bullet points',
                'Must end with call-to-action',
                'Features must use emoji icons',
                'Must be 300-500 words'
            ]
        });

        // About Page Template
        this.templates.set('about', {
            name: 'About Page',
            description: 'Detailed about page with mission, team, and story',
            template: this.getAboutTemplate(),
            expectedStructure: [
                'H1 About title',
                'Mission statement',
                'Story/background section',
                'Team/values section',
                'Technology section',
                'Contact/connect section'
            ],
            validationRules: [
                'Must start with H1 (#)',
                'Must include mission statement',
                'Must mention technology stack',
                'Must be 400-600 words',
                'Should include team/company values'
            ]
        });

        // FAQ Template
        this.templates.set('faq', {
            name: 'FAQ Page',
            description: 'Frequently asked questions with clear Q&A format',
            template: this.getFAQTemplate(),
            expectedStructure: [
                'H1 FAQ title',
                'Introduction paragraph',
                'Q&A sections with H3 questions',
                'Contact section for more questions'
            ],
            validationRules: [
                'Must start with H1 (#)',
                'Questions must use H3 (###)',
                'Must have at least 5 Q&A pairs',
                'Answers must be concise but helpful',
                'Must include contact info for additional questions'
            ]
        });

        // Blog Post Template
        this.templates.set('blog', {
            name: 'Blog Post',
            description: 'Technical blog post with introduction, content, and conclusion',
            template: this.getBlogTemplate(),
            expectedStructure: [
                'H1 blog title',
                'Introduction paragraph',
                'Main content sections with H2/H3',
                'Code examples (if applicable)',
                'Conclusion',
                'Call-to-action'
            ],
            validationRules: [
                'Must start with H1 (#)',
                'Must have clear introduction',
                'Must include practical examples',
                'Must have conclusion section',
                'Should be 600-1000 words'
            ]
        });
    }

    private getHomepageTemplate(): string {
        return `
Generate a marketing homepage content in Markdown format for the project.

PROJECT CONTEXT:
- Name: {{projectName}}
- Description: {{projectDescription}}
- Tech Stack: {{techStack}}
- Key Features: {{features}}
- Target Audience: {{targetAudience}}

CONTENT REQUIREMENTS:
1. Write for {{tone}} tone targeting {{targetAudience}}
2. Focus on developer benefits and technical value
3. Use action-oriented language
4. Include specific technical details when relevant
5. Make it scannable with clear sections

REQUIRED STRUCTURE:
# {{projectName}} - [Compelling Headline]

[2-3 sentence hero description that clearly explains what the project does and its main benefit]

## 🚀 Key Features

- **[Feature 1 Name]**: [Specific benefit and technical detail]
- **[Feature 2 Name]**: [Specific benefit and technical detail]  
- **[Feature 3 Name]**: [Specific benefit and technical detail]
- **[Feature 4 Name]**: [Specific benefit and technical detail]

## 🎯 Why Choose {{projectName}}?

[2-3 paragraphs explaining unique value proposition, competitive advantages, and why developers should choose this solution]

## 🔧 Quick Start

[Brief getting started section with 2-3 simple steps]

## 💡 Perfect For

- [Target user type 1] who need [specific benefit]
- [Target user type 2] looking for [specific solution]
- [Target user type 3] wanting to [specific outcome]

---

**Ready to get started?** [Download now](#) or [View documentation](#) to begin transforming your workflow today.

FORMATTING RULES:
- Use emoji icons for section headers
- Bold important terms and feature names
- Keep paragraphs concise (2-3 sentences max)
- End with clear call-to-action
- Total length: 300-500 words
`;
    }

    private getAboutTemplate(): string {
        return `
Generate an about page content in Markdown format for the project.

PROJECT CONTEXT:
- Name: {{projectName}}
- Description: {{projectDescription}}
- Tech Stack: {{techStack}}
- Author/Team: {{author}}
- Project Type: {{projectType}}

CONTENT REQUIREMENTS:
1. Tell the story behind the project
2. Explain the mission and vision
3. Highlight technical expertise
4. Build trust and credibility
5. Connect with developer audience

REQUIRED STRUCTURE:
# About {{projectName}}

## 🎯 Our Mission

[2-3 sentences about the project's purpose and what problem it solves]

## 📖 The Story

[2-3 paragraphs about how the project started, the inspiration, and the journey. Make it personal and relatable to developers]

## 🛠️ Built With Excellence

{{projectName}} is built using cutting-edge technologies:

- **{{techStack}}**: [Brief explanation of why these technologies were chosen]
- **Architecture**: [Brief description of the technical approach]
- **Quality**: [Mention testing, documentation, or other quality measures]

## 💡 Our Values

- **Developer-First**: We understand developers because we are developers
- **Open & Transparent**: [Mention open source, documentation, or transparency practices]
- **Continuous Innovation**: Always improving and adding new features
- **Community-Driven**: Built with and for the developer community

## 🤝 Connect With Us

We're always excited to connect with fellow developers and hear your feedback.

- **GitHub**: [Repository link]
- **Issues & Feedback**: [How to provide feedback]
- **Community**: [Discord, forum, or other community links if applicable]

---

*{{projectName}} is more than just a tool – it's a solution built by developers, for developers.*

FORMATTING RULES:
- Use emoji icons for section headers
- Include personal/team story elements
- Mention specific technologies and why they were chosen
- Build credibility through technical details
- Total length: 400-600 words
`;
    }

    private getFAQTemplate(): string {
        return `
Generate a FAQ page content in Markdown format for the project.

PROJECT CONTEXT:
- Name: {{projectName}}
- Description: {{projectDescription}}
- Tech Stack: {{techStack}}
- Key Features: {{features}}
- Installation/Usage: {{installationMethod}}

CONTENT REQUIREMENTS:
1. Address common developer questions
2. Provide clear, actionable answers
3. Include technical details where needed
4. Cover installation, usage, and troubleshooting
5. Maintain helpful and professional tone

REQUIRED STRUCTURE:
# Frequently Asked Questions

Get quick answers to common questions about {{projectName}}. Can't find what you're looking for? [Contact us](#contact) for additional support.

## 🚀 Getting Started

### What is {{projectName}}?
[Clear, concise explanation of what the project does and its main purpose]

### How do I install {{projectName}}?
[Step-by-step installation instructions specific to the project type]

### What are the system requirements?
[List minimum requirements, supported platforms, dependencies]

## 🔧 Usage & Features

### How do I get started after installation?
[Basic usage instructions and first steps]

### What are the key features?
[List and briefly explain the main features]

### Can I customize [specific feature]?
[Explain customization options and configuration]

## 🛠️ Technical Questions

### What technologies does {{projectName}} use?
[Explain the tech stack and why these technologies were chosen]

### Is {{projectName}} compatible with [common tools/frameworks]?
[Address compatibility with popular tools in the ecosystem]

### How do I troubleshoot common issues?
[List 2-3 common issues and their solutions]

## 🤝 Support & Community

### How do I report bugs or request features?
[Explain the process for reporting issues and requesting features]

### Is there a community or support forum?
[Information about community resources, documentation, support channels]

### How can I contribute to the project?
[If applicable, explain how others can contribute]

---

**Still have questions?** Check our [documentation](#) or [open an issue]({{repositoryUrl}}/issues) on GitHub.

FORMATTING RULES:
- Use H3 (###) for questions
- Provide specific, actionable answers
- Include links where helpful
- Group related questions under H2 sections
- Total length: 500-800 words
`;
    }

    private getBlogTemplate(): string {
        return `
Generate a blog post content in Markdown format about the project.

PROJECT CONTEXT:
- Name: {{projectName}}
- Description: {{projectDescription}}
- Tech Stack: {{techStack}}
- Key Features: {{features}}
- Recent Updates: {{recentChanges}}

CONTENT REQUIREMENTS:
1. Write an engaging technical blog post
2. Include practical examples and use cases
3. Explain technical concepts clearly
4. Provide value to developer readers
5. Include code examples if relevant

REQUIRED STRUCTURE:
# [Engaging Blog Title Related to {{projectName}}]

[Compelling introduction paragraph that hooks the reader and explains what they'll learn]

## 🎯 What Makes {{projectName}} Special?

[2-3 paragraphs explaining the unique aspects and benefits of the project]

## 🚀 Key Features in Action

### [Feature 1 Name]
[Explanation of the feature with practical example or use case]

### [Feature 2 Name]  
[Explanation of the feature with practical example or use case]

### [Feature 3 Name]
[Explanation of the feature with practical example or use case]

## 💡 Real-World Use Cases

[2-3 paragraphs with specific examples of how developers can use the project]

## 🔧 Getting Started

[Brief section with practical steps for readers to try the project themselves]

## 🌟 What's Next?

[Information about future plans, upcoming features, or how readers can get involved]

---

**Ready to try {{projectName}}?** [Get started today]({{repositoryUrl}}) and see how it can improve your development workflow.

FORMATTING RULES:
- Use engaging, descriptive headlines
- Include practical examples and use cases
- Break up text with subheadings and bullet points
- End with clear call-to-action
- Total length: 600-1000 words
`;
    }

    public getTemplate(templateName: string): PromptTemplate | undefined {
        return this.templates.get(templateName);
    }

    public generatePrompt(
        templateName: string, 
        analysis: ProjectAnalysis, 
        options: ContentGenerationOptions
    ): string {
        const template = this.templates.get(templateName);
        if (!template) {
            throw new Error(`Template '${templateName}' not found`);
        }

        // Replace template variables with actual project data
        let prompt = template.template;
        
        // Basic replacements
        prompt = prompt.replace(/\{\{projectName\}\}/g, analysis.metadata.name);
        prompt = prompt.replace(/\{\{projectDescription\}\}/g, analysis.metadata.description || 'An innovative software project');
        prompt = prompt.replace(/\{\{techStack\}\}/g, analysis.techStack.map(t => t.language).join(', '));
        prompt = prompt.replace(/\{\{features\}\}/g, analysis.features.map(f => f.name).join(', '));
        prompt = prompt.replace(/\{\{author\}\}/g, analysis.metadata.author || 'Development Team');
        prompt = prompt.replace(/\{\{tone\}\}/g, options.tone);
        prompt = prompt.replace(/\{\{targetAudience\}\}/g, 'developers and technical teams');
        prompt = prompt.replace(/\{\{repositoryUrl\}\}/g, analysis.metadata.repositoryUrl || '#');
        prompt = prompt.replace(/\{\{projectType\}\}/g, this.determineProjectType(analysis));
        prompt = prompt.replace(/\{\{installationMethod\}\}/g, this.determineInstallationMethod(analysis));

        return prompt;
    }

    private determineProjectType(analysis: ProjectAnalysis): string {
        if (analysis.techStack.some(t => t.framework?.includes('VS Code'))) {
            return 'VS Code Extension';
        }
        if (analysis.techStack.some(t => t.language === 'JavaScript' || t.language === 'TypeScript')) {
            return 'JavaScript/TypeScript Project';
        }
        if (analysis.techStack.some(t => t.language === 'Python')) {
            return 'Python Project';
        }
        return 'Software Project';
    }

    private determineInstallationMethod(analysis: ProjectAnalysis): string {
        if (analysis.techStack.some(t => t.framework?.includes('VS Code'))) {
            return 'VS Code Extension Marketplace';
        }
        if (analysis.techStack.some(t => t.language === 'JavaScript' || t.language === 'TypeScript')) {
            return 'npm install';
        }
        if (analysis.techStack.some(t => t.language === 'Python')) {
            return 'pip install';
        }
        return 'Download and install';
    }

    public getAvailableTemplates(): string[] {
        return Array.from(this.templates.keys());
    }

    public getTemplateInfo(templateName: string): { name: string; description: string; structure: string[] } | undefined {
        const template = this.templates.get(templateName);
        if (!template) return undefined;
        
        return {
            name: template.name,
            description: template.description,
            structure: template.expectedStructure
        };
    }
}
