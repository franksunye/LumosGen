// Template-Aware Content Generation Demo
// Demonstrates the new structured prompt system

console.log('🧪 LumosGen Template-Aware Content Generation Demo\n');

// Mock project analysis for testing
const mockProjectAnalysis = {
    metadata: {
        name: 'LumosGen',
        description: 'AI-powered marketing content generation for VS Code',
        author: 'LumosGen Team',
        repositoryUrl: 'https://github.com/user/lumosgen'
    },
    techStack: [
        { language: 'TypeScript', framework: 'VS Code API', category: 'frontend', confidence: 0.9 },
        { language: 'JavaScript', framework: 'Node.js', category: 'backend', confidence: 0.8 }
    ],
    features: [
        { name: 'AI Content Generation', description: 'Generate marketing content using AI', category: 'core', importance: 0.9 },
        { name: 'VS Code Integration', description: 'Seamless integration with VS Code', category: 'integration', importance: 0.8 },
        { name: 'Template System', description: 'Flexible template-based generation', category: 'customization', importance: 0.7 },
        { name: 'GitHub Pages Deployment', description: 'One-click deployment to GitHub Pages', category: 'deployment', importance: 0.8 }
    ]
};

const mockOptions = {
    tone: 'professional',
    includeCodeExamples: true,
    targetMarkets: ['developers', 'technical teams'],
    seoOptimization: true,
    language: 'en'
};

// Simulate the template library functionality
function demonstrateTemplateSystem() {
    console.log('📋 Available Templates:');
    console.log('   - Homepage: Marketing homepage with hero section, features, and CTA');
    console.log('   - About: Detailed about page with mission, team, and story');
    console.log('   - FAQ: Frequently asked questions with clear Q&A format');
    console.log('   - Blog: Technical blog post with introduction, content, and conclusion\n');

    // Demonstrate homepage template
    console.log('🎯 HOMEPAGE Template Demo');
    console.log('=' .repeat(50));
    
    const homepagePrompt = generateHomepagePrompt(mockProjectAnalysis, mockOptions);
    console.log('📄 Generated Structured Prompt (preview):');
    console.log(`"${homepagePrompt.substring(0, 300)}..."\n`);

    const mockHomepageContent = `# LumosGen - AI-Powered Marketing Automation

Transform your development workflow with intelligent marketing content generation directly in VS Code.

## 🚀 Key Features

- **AI Content Generation**: Create compelling marketing copy using advanced AI models
- **VS Code Integration**: Seamless workflow integration with your favorite editor
- **Template System**: Flexible, customizable templates for different content types
- **GitHub Pages Deployment**: One-click deployment to showcase your projects

## 🎯 Why Choose LumosGen?

LumosGen eliminates the friction between building great software and marketing it effectively.

## 🔧 Quick Start

1. Install from VS Code Marketplace
2. Configure your AI provider
3. Generate your first marketing website

---

**Ready to get started?** [Download now](#) and transform your project marketing today.`;

    console.log('🤖 Mock AI Response:');
    console.log(mockHomepageContent.substring(0, 200) + '...\n');

    // Demonstrate validation
    const validationResult = validateHomepageContent(mockHomepageContent);
    console.log('✅ Validation Results:');
    console.log(`   Score: ${validationResult.score}/100`);
    console.log(`   Valid: ${validationResult.isValid ? '✅ Yes' : '❌ No'}`);
    console.log(`   Errors: ${validationResult.errors.length}`);
    console.log(`   Warnings: ${validationResult.warnings.length}\n`);

    if (validationResult.errors.length > 0) {
        console.log('❌ Errors Found:');
        validationResult.errors.forEach(error => {
            console.log(`   - ${error.message}`);
        });
        console.log();
    }

    if (validationResult.warnings.length > 0) {
        console.log('⚠️  Warnings:');
        validationResult.warnings.slice(0, 3).forEach(warning => {
            console.log(`   - ${warning.message}`);
        });
        console.log();
    }

    // Demonstrate FAQ template
    console.log('🎯 FAQ Template Demo');
    console.log('=' .repeat(50));
    
    const faqPrompt = generateFAQPrompt(mockProjectAnalysis, mockOptions);
    console.log('📄 Generated Structured Prompt (preview):');
    console.log(`"${faqPrompt.substring(0, 200)}..."\n`);

    const mockFAQContent = `# Frequently Asked Questions

Get quick answers to common questions about LumosGen.

## 🚀 Getting Started

### What is LumosGen?
LumosGen is a VS Code extension that uses AI to generate professional marketing content.

### How do I install LumosGen?
Install directly from the VS Code Marketplace by searching for "LumosGen".

### What are the system requirements?
LumosGen requires VS Code 1.60+ and an active internet connection.

## 🔧 Usage & Features

### How do I get started after installation?
Open any project in VS Code and run "LumosGen: Generate Website".

### What are the key features?
AI-powered content generation, multiple templates, and GitHub Pages deployment.

---

**Still have questions?** Check our documentation or open an issue on GitHub.`;

    console.log('🤖 Mock AI Response:');
    console.log(mockFAQContent.substring(0, 200) + '...\n');

    const faqValidation = validateFAQContent(mockFAQContent);
    console.log('✅ FAQ Validation Results:');
    console.log(`   Score: ${faqValidation.score}/100`);
    console.log(`   Valid: ${faqValidation.isValid ? '✅ Yes' : '❌ No'}`);
    console.log(`   Questions found: ${(mockFAQContent.match(/^### /gm) || []).length}\n`);

    console.log('🎉 Template System Demo Complete!\n');
    console.log('📊 Key Improvements:');
    console.log('   ✅ Structured prompts with detailed requirements');
    console.log('   ✅ Template-specific validation rules');
    console.log('   ✅ Content quality scoring (0-100)');
    console.log('   ✅ Automatic retry with improved prompts');
    console.log('   ✅ Fallback content for reliability');
    console.log('   ✅ Integration with existing VS Code workflow\n');

    console.log('🚀 Next Steps:');
    console.log('   1. Test with real AI providers (DeepSeek/OpenAI)');
    console.log('   2. Integrate with VS Code extension commands');
    console.log('   3. Add more specialized templates');
    console.log('   4. Implement content improvement suggestions');
}

function generateHomepagePrompt(analysis, options) {
    return `Generate a marketing homepage content in Markdown format for the project.

PROJECT CONTEXT:
- Name: ${analysis.metadata.name}
- Description: ${analysis.metadata.description}
- Tech Stack: ${analysis.techStack.map(t => t.language).join(', ')}
- Key Features: ${analysis.features.map(f => f.name).join(', ')}

CONTENT REQUIREMENTS:
1. Write for ${options.tone} tone targeting developers and technical teams
2. Focus on developer benefits and technical value
3. Use action-oriented language
4. Include specific technical details when relevant
5. Make it scannable with clear sections

REQUIRED STRUCTURE:
# ${analysis.metadata.name} - [Compelling Headline]

[2-3 sentence hero description that clearly explains what the project does and its main benefit]

## 🚀 Key Features

- **[Feature 1 Name]**: [Specific benefit and technical detail]
- **[Feature 2 Name]**: [Specific benefit and technical detail]  
- **[Feature 3 Name]**: [Specific benefit and technical detail]
- **[Feature 4 Name]**: [Specific benefit and technical detail]

## 🎯 Why Choose ${analysis.metadata.name}?

[2-3 paragraphs explaining unique value proposition, competitive advantages, and why developers should choose this solution]

## 🔧 Quick Start

[Brief getting started section with 2-3 simple steps]

---

**Ready to get started?** [Download now](#) or [View documentation](#) to begin transforming your workflow today.

FORMATTING RULES:
- Use emoji icons for section headers
- Bold important terms and feature names
- Keep paragraphs concise (2-3 sentences max)
- End with clear call-to-action
- Total length: 300-500 words`;
}

function generateFAQPrompt(analysis, options) {
    return `Generate a FAQ page content in Markdown format for the project.

PROJECT CONTEXT:
- Name: ${analysis.metadata.name}
- Description: ${analysis.metadata.description}
- Tech Stack: ${analysis.techStack.map(t => t.language).join(', ')}
- Key Features: ${analysis.features.map(f => f.name).join(', ')}

CONTENT REQUIREMENTS:
1. Address common developer questions
2. Provide clear, actionable answers
3. Include technical details where needed
4. Cover installation, usage, and troubleshooting
5. Maintain helpful and professional tone

REQUIRED STRUCTURE:
# Frequently Asked Questions

Get quick answers to common questions about ${analysis.metadata.name}.

## 🚀 Getting Started

### What is ${analysis.metadata.name}?
[Clear, concise explanation]

### How do I install ${analysis.metadata.name}?
[Step-by-step installation instructions]

### What are the system requirements?
[List requirements and dependencies]

## 🔧 Usage & Features

### How do I get started after installation?
[Basic usage instructions]

### What are the key features?
[List and explain main features]

### Can I customize [specific feature]?
[Explain customization options]

## 🛠️ Technical Questions

### What technologies does ${analysis.metadata.name} use?
[Explain tech stack and choices]

### Is ${analysis.metadata.name} compatible with [tools]?
[Address compatibility]

### How do I troubleshoot common issues?
[Common issues and solutions]

---

**Still have questions?** Check our documentation or open an issue on GitHub.

FORMATTING RULES:
- Use H3 (###) for questions
- Provide specific, actionable answers
- Group related questions under H2 sections
- Total length: 500-800 words`;
}

function validateHomepageContent(content) {
    let score = 100;
    const errors = [];
    const warnings = [];

    // Check for H1 header
    if (!content.includes('# ')) {
        errors.push({ message: 'Missing H1 header', severity: 'critical' });
        score -= 25;
    }

    // Check for features section
    if (!content.includes('## 🚀') || !content.includes('- **')) {
        errors.push({ message: 'Missing features section with bullet points', severity: 'major' });
        score -= 15;
    }

    // Check for call-to-action
    if (!content.toLowerCase().includes('ready to') && !content.toLowerCase().includes('get started')) {
        warnings.push({ message: 'No clear call-to-action found' });
        score -= 5;
    }

    // Check word count
    const wordCount = content.split(/\s+/).length;
    if (wordCount < 200) {
        errors.push({ message: `Content too short: ${wordCount} words (minimum 200)`, severity: 'major' });
        score -= 15;
    }

    return {
        isValid: score >= 70 && errors.filter(e => e.severity === 'critical').length === 0,
        score: Math.max(0, score),
        errors,
        warnings
    };
}

function validateFAQContent(content) {
    let score = 100;
    const errors = [];
    const warnings = [];

    // Check for H1 header
    if (!content.includes('# ')) {
        errors.push({ message: 'Missing H1 header', severity: 'critical' });
        score -= 25;
    }

    // Count Q&A pairs
    const h3Count = (content.match(/^### /gm) || []).length;
    if (h3Count < 5) {
        warnings.push({ message: `Only ${h3Count} questions found. Consider adding more FAQs` });
        score -= 5;
    }

    // Check for question format
    const h3Lines = content.split('\n').filter(line => line.startsWith('### '));
    h3Lines.forEach(line => {
        if (!line.includes('?') && !line.toLowerCase().includes('how') && !line.toLowerCase().includes('what')) {
            warnings.push({ message: `"${line}" doesn't appear to be a question` });
            score -= 2;
        }
    });

    return {
        isValid: score >= 70 && errors.filter(e => e.severity === 'critical').length === 0,
        score: Math.max(0, score),
        errors,
        warnings
    };
}

// Run the demo
demonstrateTemplateSystem();
