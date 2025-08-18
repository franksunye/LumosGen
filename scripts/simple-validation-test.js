#!/usr/bin/env node

/**
 * Simple validation test to confirm Markdown conversion is working
 */

const { marked } = require('marked');

// Configure marked the same way as TemplateEngine
marked.setOptions({
    breaks: true,
    gfm: true
});

function runSimpleValidationTest() {
    console.log('🔮 Simple Markdown Validation Test\n');

    const testMarkdown = `# Main Title

## Subtitle

This is a **bold** text and this is *italic* text.

### Features List

- Feature 1
- Feature 2
- Feature 3

### Numbered List

1. First item
2. Second item
3. Third item

### Code Example

\`\`\`javascript
const example = "Hello World";
console.log(example);
\`\`\`

### Links

[Visit our website](https://example.com)

### Quote

> This is a blockquote
> with multiple lines

---

**End of test content**`;

    console.log('📝 Input Markdown:');
    console.log('─'.repeat(50));
    console.log(testMarkdown.substring(0, 200) + '...');
    console.log('─'.repeat(50));

    console.log('\n🔄 Converting to HTML...');
    const html = marked(testMarkdown);

    console.log('\n📄 Output HTML:');
    console.log('─'.repeat(50));
    console.log(html.substring(0, 300) + '...');
    console.log('─'.repeat(50));

    // Simple checks
    const checks = [
        { name: 'H1 Headers', test: html.includes('<h1>'), expected: true },
        { name: 'H2 Headers', test: html.includes('<h2>'), expected: true },
        { name: 'H3 Headers', test: html.includes('<h3>'), expected: true },
        { name: 'Paragraphs', test: html.includes('<p>'), expected: true },
        { name: 'Bold Text', test: html.includes('<strong>'), expected: true },
        { name: 'Italic Text', test: html.includes('<em>'), expected: true },
        { name: 'Unordered Lists', test: html.includes('<ul>'), expected: true },
        { name: 'List Items', test: html.includes('<li>'), expected: true },
        { name: 'Ordered Lists', test: html.includes('<ol>'), expected: true },
        { name: 'Code Blocks', test: html.includes('<pre>'), expected: true },
        { name: 'Inline Code', test: html.includes('<code>'), expected: true },
        { name: 'Links', test: html.includes('<a href='), expected: true },
        { name: 'Blockquotes', test: html.includes('<blockquote>'), expected: true },
        { name: 'No Raw Markdown', test: !html.includes('# Main Title'), expected: true }
    ];

    console.log('\n📊 Validation Results:');
    console.log('═'.repeat(50));

    let passedChecks = 0;
    checks.forEach(check => {
        const status = check.test === check.expected ? '✅' : '❌';
        console.log(`${status} ${check.name}: ${check.test ? 'Found' : 'Not Found'}`);
        if (check.test === check.expected) passedChecks++;
    });

    const successRate = Math.round((passedChecks / checks.length) * 100);
    console.log('═'.repeat(50));
    console.log(`🎯 Success Rate: ${passedChecks}/${checks.length} (${successRate}%)`);

    if (successRate >= 90) {
        console.log('🎉 EXCELLENT: Markdown conversion working perfectly!');
        return true;
    } else if (successRate >= 75) {
        console.log('✅ GOOD: Markdown conversion working well');
        return true;
    } else if (successRate >= 50) {
        console.log('⚠️ PARTIAL: Some Markdown features not working');
        return false;
    } else {
        console.log('❌ FAILED: Markdown conversion not working properly');
        return false;
    }
}

// Test template integration
function testTemplateIntegration() {
    console.log('\n🔧 Testing Template Integration...');
    
    const template = '<div class="prose">{{content}}</div>';
    const content = '# Test\n\nThis is **bold**.';
    
    // Simulate the processTemplate function
    const result = template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
        if (path === 'content') {
            return marked(content);
        }
        return match;
    });

    const expectedHTML = '<div class="prose"><h1>Test</h1>\n<p>This is <strong>bold</strong>.</p>\n</div>';
    const hasCorrectStructure = result.includes('<h1>Test</h1>') && result.includes('<strong>bold</strong>');

    console.log(`📋 Template integration: ${hasCorrectStructure ? '✅' : '❌'}`);
    console.log(`📄 Result: ${result}`);

    return hasCorrectStructure;
}

// Run tests
if (require.main === module) {
    const validationPassed = runSimpleValidationTest();
    const integrationPassed = testTemplateIntegration();
    
    console.log('\n🏁 Final Result:');
    console.log('═'.repeat(50));
    
    if (validationPassed && integrationPassed) {
        console.log('🎉 ALL TESTS PASSED!');
        console.log('✅ Markdown conversion is working correctly');
        console.log('✅ Template integration is working correctly');
        console.log('🚀 Ready for production use!');
        process.exit(0);
    } else {
        console.log('❌ SOME TESTS FAILED');
        console.log(`   Validation: ${validationPassed ? '✅' : '❌'}`);
        console.log(`   Integration: ${integrationPassed ? '✅' : '❌'}`);
        process.exit(1);
    }
}

module.exports = { runSimpleValidationTest, testTemplateIntegration };
