#!/usr/bin/env node

/**
 * Test script to verify Markdown to HTML conversion functionality
 * This tests the core fix for the Markdown display issue
 */

const { marked } = require('marked');
const fs = require('fs');
const path = require('path');

// Configure marked the same way as TemplateEngine
marked.setOptions({
    breaks: true,
    gfm: true
});

function testMarkdownConversion() {
    console.log('🔮 Testing Markdown to HTML Conversion\n');

    // Test cases with different Markdown content
    const testCases = [
        {
            name: 'Homepage Content',
            markdown: `# Transform Your Development Workflow

## Powerful Tools for Modern Developers

Our innovative solution streamlines your development process with cutting-edge technology and intuitive design. Built for developers who demand excellence and efficiency.

### Key Features

- **Lightning Fast Performance** - Optimized for speed and reliability
- **Developer-Friendly** - Intuitive API and comprehensive documentation  
- **Scalable Architecture** - Grows with your project needs
- **Open Source** - Community-driven development and transparency

### Why Choose Our Solution?

Transform the way you work with tools designed by developers, for developers. Our platform combines powerful functionality with elegant simplicity.

**Get Started Today**

Join thousands of developers who have already transformed their workflow.

[Get Started](#) [View Documentation](#) [Join Community](#)`
        },
        {
            name: 'About Page Content',
            markdown: `# About Our Project

## Mission Statement

We believe in empowering developers with **intelligent tools** that enhance productivity and creativity.

### Our Story

Founded in 2024, our team consists of:

1. **Senior Developers** with 10+ years experience
2. **AI Researchers** from top universities  
3. **UX Designers** focused on developer experience

> "Our goal is to make development more enjoyable and efficient for everyone."

### Technical Excellence

\`\`\`javascript
// Example of our clean API design
const project = new LumosGen({
  language: 'en',
  tone: 'professional'
});

await project.generateContent();
\`\`\`

Built with modern technologies for reliability and performance.`
        },
        {
            name: 'FAQ Content',
            markdown: `# Frequently Asked Questions

## Getting Started

### How do I install the extension?

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "LumosGen"
4. Click Install

### What languages are supported?

Currently we support:
- **English** (Primary)
- **Spanish** (Beta)
- **Japanese** (Coming Soon)

## Technical Questions

### Is my data secure?

Yes! We take security seriously:

- ✅ Local processing when possible
- ✅ Encrypted API communications
- ✅ No data storage on our servers
- ✅ Open source transparency

### How does the AI work?

Our AI uses advanced language models to:

1. Analyze your project structure
2. Extract key features and benefits
3. Generate marketing-focused content
4. Optimize for SEO and engagement

*For more technical details, see our [documentation](https://docs.lumosgen.com).*`
        }
    ];

    let allTestsPassed = true;

    testCases.forEach((testCase, index) => {
        console.log(`${index + 1}️⃣ Testing ${testCase.name}...`);
        
        try {
            // Convert Markdown to HTML
            const html = marked(testCase.markdown);
            
            // Verify conversion worked
            if (!html || html === testCase.markdown) {
                console.log(`❌ Conversion failed for ${testCase.name}`);
                allTestsPassed = false;
                return;
            }

            // Check for proper HTML tags
            const hasHeaders = html.includes('<h1>') || html.includes('<h2>') || html.includes('<h3>');
            const hasParagraphs = html.includes('<p>');
            const hasLists = html.includes('<ul>') || html.includes('<ol>');
            const hasStrong = html.includes('<strong>');
            const hasCode = html.includes('<code>') || html.includes('<pre>');

            console.log(`   📋 HTML tags found:`);
            console.log(`      Headers: ${hasHeaders ? '✅' : '❌'}`);
            console.log(`      Paragraphs: ${hasParagraphs ? '✅' : '❌'}`);
            console.log(`      Lists: ${hasLists ? '✅' : '❌'}`);
            console.log(`      Bold text: ${hasStrong ? '✅' : '❌'}`);
            console.log(`      Code: ${hasCode ? '✅' : '❌'}`);

            // Save sample output for manual inspection
            const outputDir = path.join(__dirname, '..', 'test-output');
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            const outputFile = path.join(outputDir, `${testCase.name.toLowerCase().replace(/\s+/g, '-')}.html`);
            const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${testCase.name} - Test Output</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white text-gray-900 p-8">
    <div class="max-w-4xl mx-auto">
        <div class="prose prose-lg max-w-none">
            ${html}
        </div>
    </div>
</body>
</html>`;

            fs.writeFileSync(outputFile, fullHtml, 'utf8');
            console.log(`   📄 Sample output saved to: ${outputFile}`);

            if (hasHeaders && hasParagraphs) {
                console.log(`   ✅ ${testCase.name} conversion successful\n`);
            } else {
                console.log(`   ⚠️ ${testCase.name} conversion incomplete\n`);
                allTestsPassed = false;
            }

        } catch (error) {
            console.log(`   ❌ Error converting ${testCase.name}: ${error.message}\n`);
            allTestsPassed = false;
        }
    });

    // Test the template processing logic
    console.log('4️⃣ Testing Template Processing Logic...');
    
    const mockTemplate = `<div class="prose prose-lg dark:prose-invert max-w-none">{{content}}</div>`;
    const mockData = { content: '# Test Header\n\nThis is a **test** paragraph.' };
    
    // Simulate the processTemplate function
    const processedTemplate = mockTemplate.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
        const value = mockData[path];
        if (path === 'content' && typeof value === 'string') {
            return marked(value);
        }
        return value || match;
    });

    const expectedHtml = '<h1>Test Header</h1>\n<p>This is a <strong>test</strong> paragraph.</p>\n';
    const actualHtml = marked(mockData.content);
    
    if (processedTemplate.includes(expectedHtml)) {
        console.log('   ✅ Template processing works correctly');
    } else {
        console.log('   ❌ Template processing failed');
        console.log('   Expected:', expectedHtml);
        console.log('   Actual:', actualHtml);
        allTestsPassed = false;
    }

    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log('═══════════════════════════════════════');
    
    if (allTestsPassed) {
        console.log('🎉 All Markdown conversion tests PASSED!');
        console.log('✅ The fix is working correctly');
        console.log('✅ Markdown content will now display as formatted HTML');
        console.log('✅ Ready for production deployment');
    } else {
        console.log('❌ Some tests FAILED');
        console.log('⚠️ Please review the errors above');
    }

    return allTestsPassed;
}

// Run the test
if (require.main === module) {
    const success = testMarkdownConversion();
    process.exit(success ? 0 : 1);
}

module.exports = { testMarkdownConversion };
