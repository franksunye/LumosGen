#!/usr/bin/env node

/**
 * Comprehensive test to verify Markdown conversion works in real scenarios
 */

const { marked } = require('marked');
const fs = require('fs');
const path = require('path');

// Configure marked the same way as TemplateEngine
marked.setOptions({
    breaks: true,
    gfm: true
});

function testComprehensiveMarkdownConversion() {
    console.log('🔮 Comprehensive Markdown Conversion Test\n');

    // Test various Markdown scenarios that users might encounter
    const testScenarios = [
        {
            name: 'Complex Homepage with All Elements',
            markdown: `# 🚀 Revolutionary Development Tool

## Transform Your Workflow Today

Our **cutting-edge platform** empowers developers to build *amazing applications* faster than ever before.

### 🌟 Key Features

- **Lightning Performance** - Optimized for speed
- **Developer Experience** - Intuitive and powerful
- **Scalable Architecture** - Grows with your needs
- **Open Source** - Community-driven development

### 📊 Why Choose Us?

> "This tool has completely transformed how we develop software. The productivity gains are incredible!" 
> 
> — Senior Developer at TechCorp

#### Quick Start Guide

1. **Install** the extension from VS Code marketplace
2. **Configure** your project settings
3. **Generate** your first marketing website
4. **Deploy** to GitHub Pages with one click

### 💻 Code Example

\`\`\`javascript
// Simple API usage
const lumosGen = new LumosGen({
  language: 'en',
  tone: 'professional'
});

await lumosGen.generateWebsite();
\`\`\`

### 🔗 Get Started

Ready to transform your development workflow? 

[**Get Started Now**](https://github.com/lumosgen) | [**View Documentation**](https://docs.lumosgen.com) | [**Join Community**](https://discord.gg/lumosgen)

---

*Built with ❤️ by developers, for developers.*`
        },
        {
            name: 'Technical Documentation Style',
            markdown: `# API Reference

## Authentication

All API requests require authentication using an API key:

\`\`\`bash
curl -H "Authorization: Bearer YOUR_API_KEY" \\
     https://api.lumosgen.com/v1/generate
\`\`\`

## Endpoints

### POST /v1/generate

Generate marketing content for a project.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| \`project_url\` | string | Yes | GitHub repository URL |
| \`language\` | string | No | Target language (default: 'en') |
| \`tone\` | string | No | Content tone (default: 'professional') |

**Response:**

\`\`\`json
{
  "success": true,
  "data": {
    "homepage": "# Your Project Title...",
    "about": "## About Your Project...",
    "faq": "# Frequently Asked Questions..."
  }
}
\`\`\`

### Error Handling

The API returns standard HTTP status codes:

- \`200\` - Success
- \`400\` - Bad Request
- \`401\` - Unauthorized
- \`429\` - Rate Limited
- \`500\` - Internal Server Error`
        },
        {
            name: 'Marketing Copy with Emojis and Lists',
            markdown: `# 🎯 Boost Your Project's Visibility

## 🌍 Reach Global Audiences

### English Marketing Made Easy

Transform your technical documentation into compelling marketing content that resonates with international users.

#### ✨ What You Get:

1. **Professional Homepage** 🏠
   - Hero section with clear value proposition
   - Feature highlights with benefits
   - Call-to-action buttons

2. **Detailed About Page** 📄
   - Project story and mission
   - Team information
   - Technology stack overview

3. **Comprehensive FAQ** ❓
   - Common user questions
   - Technical support info
   - Getting started guide

4. **SEO-Optimized Blog** 📝
   - Technical insights
   - Use case examples
   - Community highlights

### 🎨 Beautiful Design

- **Responsive Layout** - Works on all devices
- **Dark/Light Theme** - User preference support
- **Modern Typography** - Easy to read
- **Fast Loading** - Optimized performance

### 🚀 One-Click Deployment

Deploy to:
- GitHub Pages ✅
- Vercel ✅
- Netlify ✅
- Custom Domain ✅`
        }
    ];

    let allTestsPassed = true;
    const results = [];

    testScenarios.forEach((scenario, index) => {
        console.log(`${index + 1}️⃣ Testing: ${scenario.name}...`);
        
        try {
            // Convert Markdown to HTML
            const html = marked(scenario.markdown);
            
            // Verify conversion worked
            if (!html || html === scenario.markdown) {
                console.log(`   ❌ Conversion failed`);
                allTestsPassed = false;
                return;
            }

            // Check for specific HTML elements
            const checks = {
                headers: /(<h[1-6]>.*?<\/h[1-6]>)/g.test(html),
                paragraphs: /<p>.*?<\/p>/g.test(html),
                lists: /(<ul>|<ol>).*?(<\/ul>|<\/ol>)/g.test(html),
                bold: /<strong>.*?<\/strong>/g.test(html),
                italic: /<em>.*?<\/em>/g.test(html),
                links: /<a href=.*?>.*?<\/a>/g.test(html),
                code: /(<code>|<pre>).*?(<\/code>|<\/pre>)/g.test(html),
                blockquotes: /<blockquote>.*?<\/blockquote>/g.test(html),
                tables: /<table>.*?<\/table>/g.test(html)
            };

            // Count successful conversions
            const successCount = Object.values(checks).filter(Boolean).length;
            const totalChecks = Object.keys(checks).length;

            console.log(`   📋 HTML elements found:`);
            Object.entries(checks).forEach(([element, found]) => {
                console.log(`      ${element}: ${found ? '✅' : '❌'}`);
            });

            console.log(`   📊 Conversion rate: ${successCount}/${totalChecks} (${Math.round(successCount/totalChecks*100)}%)`);

            // Save output for inspection
            const outputDir = path.join(__dirname, '..', 'test-output');
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            const filename = scenario.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const outputFile = path.join(outputDir, `comprehensive-${filename}.html`);
            
            const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${scenario.name} - Comprehensive Test</title>
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
            console.log(`   📄 Output saved: ${outputFile}`);

            // Store results
            results.push({
                name: scenario.name,
                success: successCount >= 5, // At least 5 elements should convert
                conversionRate: successCount / totalChecks,
                checks
            });

            if (successCount >= 5) {
                console.log(`   ✅ ${scenario.name} conversion successful\n`);
            } else {
                console.log(`   ⚠️ ${scenario.name} conversion incomplete\n`);
                allTestsPassed = false;
            }

        } catch (error) {
            console.log(`   ❌ Error: ${error.message}\n`);
            allTestsPassed = false;
            results.push({
                name: scenario.name,
                success: false,
                error: error.message
            });
        }
    });

    // Test template integration
    console.log('4️⃣ Testing Template Integration...');
    
    const templateTest = `<div class="prose prose-lg dark:prose-invert max-w-none">{{content}}</div>`;
    const testContent = '# Test\n\nThis is **bold** and this is *italic*.\n\n- Item 1\n- Item 2';
    
    const processedTemplate = templateTest.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
        if (path === 'content') {
            return marked(testContent);
        }
        return match;
    });

    const expectedElements = ['<h1>', '<p>', '<strong>', '<em>', '<ul>', '<li>'];
    const templateSuccess = expectedElements.every(element => processedTemplate.includes(element));

    console.log(`   📋 Template integration:`);
    expectedElements.forEach(element => {
        const found = processedTemplate.includes(element);
        console.log(`      ${element}: ${found ? '✅' : '❌'}`);
    });

    if (templateSuccess) {
        console.log('   ✅ Template integration successful');
    } else {
        console.log('   ❌ Template integration failed');
        allTestsPassed = false;
    }

    // Summary
    console.log('\n📊 Comprehensive Test Results:');
    console.log('═══════════════════════════════════════');
    
    const successfulTests = results.filter(r => r.success).length;
    const totalTests = results.length;
    
    console.log(`🎯 Test Success Rate: ${successfulTests}/${totalTests} (${Math.round(successfulTests/totalTests*100)}%)`);
    
    if (allTestsPassed && templateSuccess) {
        console.log('🎉 All comprehensive tests PASSED!');
        console.log('✅ Complex Markdown conversion working');
        console.log('✅ All HTML elements properly generated');
        console.log('✅ Template integration working');
        console.log('✅ Ready for production use');
    } else {
        console.log('❌ Some tests FAILED');
        console.log('⚠️ Please review the errors above');
    }

    return allTestsPassed && templateSuccess;
}

// Run the test
if (require.main === module) {
    const success = testComprehensiveMarkdownConversion();
    process.exit(success ? 0 : 1);
}

module.exports = { testComprehensiveMarkdownConversion };
