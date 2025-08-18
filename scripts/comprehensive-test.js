#!/usr/bin/env node

/**
 * Comprehensive test script for LumosGen MVP
 * Tests all core functionality according to MVP_USER_GUIDE.md
 */

const fs = require('fs');
const path = require('path');

// Mock output channel for testing
class MockOutputChannel {
    constructor() {
        this.logs = [];
    }
    
    appendLine(message) {
        this.logs.push(message);
        console.log(`📝 ${message}`);
    }
    
    show() {
        console.log('📺 Output channel shown');
    }
    
    getLogs() {
        return this.logs;
    }
}

async function runComprehensiveTest() {
    console.log('🔮 LumosGen Comprehensive Test Suite\n');
    
    const outputChannel = new MockOutputChannel();
    let testResults = {
        projectAnalysis: false,
        contentGeneration: false,
        websiteBuilding: false,
        deployment: false,
        errorHandling: false
    };
    
    try {
        // Test 1: Project Analysis
        console.log('1️⃣ Testing Project Analysis...');
        const { ProjectAnalyzer } = require('../out/analysis/ProjectAnalyzer');
        const analyzer = new ProjectAnalyzer(process.cwd(), outputChannel);
        
        const analysis = await analyzer.analyzeProject();
        
        if (analysis && analysis.name && analysis.description) {
            console.log('✅ Project analysis successful');
            console.log(`   📊 Project: ${analysis.name}`);
            console.log(`   📝 Description: ${analysis.description.substring(0, 100)}...`);
            console.log(`   🔧 Technologies: ${analysis.technologies.join(', ')}`);
            console.log(`   📋 Features: ${analysis.features.length} found`);
            testResults.projectAnalysis = true;
        } else {
            throw new Error('Project analysis returned invalid data');
        }
        
    } catch (error) {
        console.log('❌ Project analysis failed:', error.message);
    }
    
    try {
        // Test 2: Marketing Content Generation
        console.log('\n2️⃣ Testing Marketing Content Generation...');
        const { MarketingContentGenerator } = require('../out/content/MarketingContentGenerator');
        const contentGen = new MarketingContentGenerator(outputChannel);
        
        // Create mock project analysis for content generation
        const mockAnalysis = {
            name: 'LumosGen Test Project',
            description: 'A test project for LumosGen functionality',
            technologies: ['TypeScript', 'Node.js', 'VS Code Extension'],
            features: ['AI Content Generation', 'Website Building', 'GitHub Deployment'],
            repository: 'https://github.com/test/project'
        };
        
        const content = await contentGen.generateMarketingContent(mockAnalysis);
        
        if (content && content.homepage && content.about && content.blog && content.faq) {
            console.log('✅ Marketing content generation successful');
            console.log(`   🏠 Homepage: ${content.homepage.length} characters`);
            console.log(`   📖 About: ${content.about.length} characters`);
            console.log(`   📝 Blog: ${content.blog.length} characters`);
            console.log(`   ❓ FAQ: ${content.faq.length} characters`);
            
            // Verify content quality requirements
            const minLength = 1000;
            if (content.homepage.length >= minLength && 
                content.about.length >= minLength && 
                content.blog.length >= minLength && 
                content.faq.length >= minLength) {
                console.log('✅ Content length requirements met');
                testResults.contentGeneration = true;
            } else {
                console.log('⚠️ Some content below minimum length requirement');
            }
        } else {
            throw new Error('Content generation returned incomplete data');
        }
        
    } catch (error) {
        console.log('❌ Content generation failed:', error.message);
    }
    
    try {
        // Test 3: Website Building
        console.log('\n3️⃣ Testing Website Building...');
        const { WebsiteBuilder } = require('../out/website/WebsiteBuilder');
        const builder = new WebsiteBuilder(outputChannel);
        
        // Mock content for website building
        const mockContent = {
            homepage: 'Mock homepage content with professional marketing copy...',
            about: 'Mock about page with detailed project description...',
            blog: 'Mock blog post with technical insights...',
            faq: 'Mock FAQ with comprehensive questions and answers...',
            seoMetadata: {
                title: 'Test Project',
                description: 'A test project for LumosGen',
                keywords: ['test', 'project', 'lumosgen']
            }
        };
        
        const mockAnalysis = {
            name: 'LumosGen Test Project',
            description: 'A test project for LumosGen functionality',
            technologies: ['TypeScript', 'Node.js']
        };
        
        const buildResult = await builder.buildWebsite(mockContent, mockAnalysis);
        
        if (buildResult && buildResult.success) {
            console.log('✅ Website building successful');
            console.log(`   📁 Output directory: ${buildResult.outputPath}`);
            console.log(`   📄 Files generated: ${buildResult.files ? buildResult.files.length : 'N/A'}`);
            
            // Check if website files exist
            const websiteDir = path.join(process.cwd(), 'lumosgen-website');
            if (fs.existsSync(websiteDir)) {
                const files = fs.readdirSync(websiteDir);
                console.log(`   📋 Website files: ${files.join(', ')}`);
                
                // Verify required files
                const requiredFiles = ['index.html', 'about.html', 'blog.html', 'faq.html'];
                const hasAllFiles = requiredFiles.every(file => files.includes(file));
                
                if (hasAllFiles) {
                    console.log('✅ All required website files generated');
                    testResults.websiteBuilding = true;
                } else {
                    console.log('⚠️ Some required website files missing');
                }
            }
        } else {
            throw new Error(`Website building failed: ${buildResult.errors?.join(', ')}`);
        }
        
    } catch (error) {
        console.log('❌ Website building failed:', error.message);
    }
    
    try {
        // Test 4: Error Handling
        console.log('\n4️⃣ Testing Error Handling...');
        const { ErrorHandler } = require('../out/utils/ErrorHandler');
        const errorHandler = new ErrorHandler(outputChannel);
        
        // Test error logging
        const testError = new Error('Test error for validation');
        errorHandler.logError('TEST_ERROR', testError, { context: 'comprehensive-test' });
        
        // Check if error log file was created
        const errorLogPath = path.join(process.cwd(), '.lumosgen', 'logs', 'error.log');
        if (fs.existsSync(errorLogPath)) {
            console.log('✅ Error logging working');
            console.log(`   📄 Error log: ${errorLogPath}`);
            testResults.errorHandling = true;
        } else {
            console.log('⚠️ Error log file not created');
        }
        
    } catch (error) {
        console.log('❌ Error handling test failed:', error.message);
    }
    
    // Test Summary
    console.log('\n📊 Test Results Summary:');
    console.log('═══════════════════════════════════════');
    
    const tests = [
        { name: 'Project Analysis', result: testResults.projectAnalysis },
        { name: 'Content Generation', result: testResults.contentGeneration },
        { name: 'Website Building', result: testResults.websiteBuilding },
        { name: 'Error Handling', result: testResults.errorHandling }
    ];
    
    tests.forEach(test => {
        const status = test.result ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} ${test.name}`);
    });
    
    const passedTests = tests.filter(t => t.result).length;
    const totalTests = tests.length;
    const successRate = Math.round((passedTests / totalTests) * 100);
    
    console.log(`\n🎯 Overall Success Rate: ${passedTests}/${totalTests} (${successRate}%)`);
    
    if (successRate >= 75) {
        console.log('🎉 LumosGen MVP is ready for manual testing!');
        console.log('\n📋 Next Steps:');
        console.log('1. Press F5 in VS Code to launch Extension Development Host');
        console.log('2. Open a project folder in the new window');
        console.log('3. Look for LumosGen sparkle icon in Activity Bar');
        console.log('4. Click the icon to open LumosGen sidebar');
        console.log('5. Test the complete workflow: Analyze → Generate → Preview → Deploy');
    } else {
        console.log('⚠️ Some tests failed. Please review the errors above.');
    }
    
    // Output logs summary
    console.log(`\n📝 Total log entries: ${outputChannel.getLogs().length}`);
    
    return { testResults, successRate, logs: outputChannel.getLogs() };
}

// Run the test if this script is executed directly
if (require.main === module) {
    runComprehensiveTest().catch(error => {
        console.error('💥 Test suite failed:', error);
        process.exit(1);
    });
}

module.exports = { runComprehensiveTest };
