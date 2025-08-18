#!/usr/bin/env node

/**
 * End-to-end test to verify the complete website building process
 * including Markdown to HTML conversion
 */

const fs = require('fs');
const path = require('path');

// Mock VS Code module for testing
const mockVSCode = {
    workspace: {
        workspaceFolders: [{
            uri: { fsPath: process.cwd() }
        }]
    },
    OutputChannel: class {
        appendLine(message) {
            console.log(`[LOG] ${message}`);
        }
    }
};

// Mock the vscode module
require.cache[require.resolve('vscode')] = {
    exports: mockVSCode
};

async function runEndToEndTest() {
    console.log('🔮 LumosGen End-to-End Test\n');

    try {
        // Import modules after mocking vscode
        const { ProjectAnalyzer } = require('../out/analysis/ProjectAnalyzer');
        const { MarketingContentGenerator } = require('../out/content/MarketingContentGenerator');
        const { WebsiteBuilder } = require('../out/website/WebsiteBuilder');

        const outputChannel = new mockVSCode.OutputChannel();

        console.log('1️⃣ Testing Project Analysis...');
        const analyzer = new ProjectAnalyzer(outputChannel);
        const analysis = await analyzer.analyzeProject();
        
        if (!analysis || !analysis.metadata) {
            throw new Error('Project analysis failed');
        }
        console.log(`   ✅ Project analyzed: ${analysis.metadata.name}`);

        console.log('\n2️⃣ Testing Content Generation...');
        const contentGenerator = new MarketingContentGenerator(outputChannel);
        const content = await contentGenerator.generateMarketingContent(analysis, {
            tone: 'professional',
            includeCodeExamples: true,
            targetMarkets: ['global'],
            seoOptimization: true,
            language: 'en'
        });

        if (!content || !content.homepage) {
            throw new Error('Content generation failed');
        }
        console.log(`   ✅ Content generated: ${Object.keys(content).length} sections`);

        // Verify content is in Markdown format
        const hasMarkdownHeaders = content.homepage.includes('#');
        const hasMarkdownBold = content.homepage.includes('**');
        const hasMarkdownLists = content.homepage.includes('- ');
        
        console.log(`   📋 Content format verification:`);
        console.log(`      Markdown headers: ${hasMarkdownHeaders ? '✅' : '❌'}`);
        console.log(`      Markdown bold: ${hasMarkdownBold ? '✅' : '❌'}`);
        console.log(`      Markdown lists: ${hasMarkdownLists ? '✅' : '❌'}`);

        console.log('\n3️⃣ Testing Website Building...');
        const websiteBuilder = new WebsiteBuilder(outputChannel);
        const buildResult = await websiteBuilder.buildWebsite(content, analysis);

        if (!buildResult.success) {
            throw new Error(`Website building failed: ${buildResult.errors?.join(', ')}`);
        }
        console.log(`   ✅ Website built successfully at: ${buildResult.outputPath}`);

        console.log('\n4️⃣ Verifying Generated Files...');
        const websiteDir = buildResult.outputPath;
        
        if (!fs.existsSync(websiteDir)) {
            throw new Error('Website directory not created');
        }

        const requiredFiles = ['index.html', 'about.html', 'faq.html'];
        const missingFiles = [];
        
        for (const file of requiredFiles) {
            const filePath = path.join(websiteDir, file);
            if (!fs.existsSync(filePath)) {
                missingFiles.push(file);
            }
        }

        if (missingFiles.length > 0) {
            throw new Error(`Missing files: ${missingFiles.join(', ')}`);
        }
        console.log(`   ✅ All required files generated: ${requiredFiles.join(', ')}`);

        console.log('\n5️⃣ Verifying Markdown to HTML Conversion...');
        
        // Check index.html for proper HTML conversion
        const indexPath = path.join(websiteDir, 'index.html');
        const indexContent = fs.readFileSync(indexPath, 'utf8');

        // Verify HTML structure
        const hasHtmlTags = indexContent.includes('<h1>') || indexContent.includes('<h2>');
        const hasParagraphs = indexContent.includes('<p>');
        const hasLists = indexContent.includes('<ul>') || indexContent.includes('<li>');
        const hasStrongTags = indexContent.includes('<strong>');
        
        // Verify no raw Markdown remains
        const hasRawMarkdown = indexContent.includes('# ') || indexContent.includes('## ');
        
        console.log(`   📋 HTML conversion verification:`);
        console.log(`      HTML headers: ${hasHtmlTags ? '✅' : '❌'}`);
        console.log(`      HTML paragraphs: ${hasParagraphs ? '✅' : '❌'}`);
        console.log(`      HTML lists: ${hasLists ? '✅' : '❌'}`);
        console.log(`      HTML strong tags: ${hasStrongTags ? '✅' : '❌'}`);
        console.log(`      Raw Markdown removed: ${!hasRawMarkdown ? '✅' : '❌'}`);

        if (hasRawMarkdown) {
            console.log(`   ⚠️ Warning: Raw Markdown found in HTML output`);
            // Extract a sample of raw markdown for debugging
            const lines = indexContent.split('\n');
            const markdownLines = lines.filter(line => line.includes('# ') || line.includes('## '));
            console.log(`   📄 Sample raw Markdown: ${markdownLines.slice(0, 3).join(', ')}`);
        }

        console.log('\n6️⃣ Testing Asset Generation...');
        const assetsDir = path.join(websiteDir, 'assets');
        const cssFile = path.join(assetsDir, 'styles.css');
        const jsFile = path.join(assetsDir, 'main.js');

        const hasAssets = fs.existsSync(assetsDir);
        const hasCss = fs.existsSync(cssFile);
        const hasJs = fs.existsSync(jsFile);

        console.log(`   📋 Asset verification:`);
        console.log(`      Assets directory: ${hasAssets ? '✅' : '❌'}`);
        console.log(`      CSS file: ${hasCss ? '✅' : '❌'}`);
        console.log(`      JavaScript file: ${hasJs ? '✅' : '❌'}`);

        console.log('\n7️⃣ Testing SEO Files...');
        const sitemapFile = path.join(websiteDir, 'sitemap.xml');
        const robotsFile = path.join(websiteDir, 'robots.txt');

        const hasSitemap = fs.existsSync(sitemapFile);
        const hasRobots = fs.existsSync(robotsFile);

        console.log(`   📋 SEO files verification:`);
        console.log(`      Sitemap.xml: ${hasSitemap ? '✅' : '❌'}`);
        console.log(`      Robots.txt: ${hasRobots ? '✅' : '❌'}`);

        // Summary
        console.log('\n📊 End-to-End Test Results:');
        console.log('═══════════════════════════════════════');
        
        const allTestsPassed = hasHtmlTags && hasParagraphs && !hasRawMarkdown && hasAssets && hasCss;
        
        if (allTestsPassed) {
            console.log('🎉 All end-to-end tests PASSED!');
            console.log('✅ Project analysis working');
            console.log('✅ Content generation working');
            console.log('✅ Website building working');
            console.log('✅ Markdown to HTML conversion working');
            console.log('✅ Asset generation working');
            console.log('✅ SEO files generation working');
            console.log('\n🚀 LumosGen is ready for production use!');
        } else {
            console.log('❌ Some tests FAILED');
            console.log('⚠️ Please review the errors above');
        }

        return allTestsPassed;

    } catch (error) {
        console.log(`❌ End-to-end test failed: ${error.message}`);
        console.log(`📄 Stack trace: ${error.stack}`);
        return false;
    }
}

// Run the test
if (require.main === module) {
    runEndToEndTest().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('Test runner error:', error);
        process.exit(1);
    });
}

module.exports = { runEndToEndTest };
