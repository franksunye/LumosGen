/**
 * ThemeManager Unit Tests
 * 
 * Comprehensive testing of theme management functionality including
 * theme loading, validation, switching, and custom theme support.
 */

const { TestUtils, TestAssertions } = require('../test-config');
const fs = require('fs');
const path = require('path');

// Mock file system operations
jest.mock('fs', () => ({
    existsSync: jest.fn(),
    promises: {
        mkdir: jest.fn(),
        readdir: jest.fn(),
        stat: jest.fn(),
        readFile: jest.fn(),
        writeFile: jest.fn()
    }
}));

const themeManagerTests = {
    async setup() {
        console.log('🔧 Setting up ThemeManager tests...');
        
        // Reset all mocks
        jest.clearAllMocks();
        
        // Set up mock file system
        this.setupMockFileSystem();
        
        // Import ThemeManager after mocking
        const { ThemeManager } = require('../../out/website/ThemeManager');
        this.ThemeManager = ThemeManager;
        this.themeManager = new ThemeManager();
        
        // Wait for async initialization
        await TestUtils.sleep(100);
    },

    setupMockFileSystem() {
        // Mock themes directory structure
        fs.existsSync.mockImplementation((path) => {
            const validPaths = [
                '/themes',
                '/themes/modern',
                '/themes/classic',
                '/themes/minimal',
                '/themes/modern/theme.json',
                '/themes/classic/theme.json',
                '/themes/minimal/theme.json'
            ];
            return validPaths.some(validPath => path.includes(validPath));
        });

        fs.promises.readdir.mockResolvedValue(['modern', 'classic', 'minimal']);
        
        fs.promises.stat.mockImplementation((path) => ({
            isDirectory: () => !path.includes('.json')
        }));

        // Mock theme configuration files
        fs.promises.readFile.mockImplementation((filePath) => {
            if (filePath.includes('modern/theme.json')) {
                return Promise.resolve(JSON.stringify({
                    name: 'Modern',
                    description: 'A modern, clean theme with dark mode support',
                    version: '1.0.0',
                    author: 'LumosGen',
                    colors: {
                        primary: '#007acc',
                        secondary: '#f0f0f0',
                        background: '#ffffff',
                        text: '#333333'
                    },
                    features: ['dark-mode', 'responsive', 'animations'],
                    templates: {
                        'main.html': 'main-template.html',
                        'styles.css': 'styles.css'
                    }
                }));
            } else if (filePath.includes('classic/theme.json')) {
                return Promise.resolve(JSON.stringify({
                    name: 'Classic',
                    description: 'A traditional, professional theme',
                    version: '1.0.0',
                    author: 'LumosGen',
                    colors: {
                        primary: '#2c3e50',
                        secondary: '#ecf0f1',
                        background: '#ffffff',
                        text: '#2c3e50'
                    },
                    features: ['responsive'],
                    templates: {
                        'main.html': 'classic-template.html',
                        'styles.css': 'classic-styles.css'
                    }
                }));
            } else if (filePath.includes('minimal/theme.json')) {
                return Promise.resolve(JSON.stringify({
                    name: 'Minimal',
                    description: 'A clean, minimalist theme',
                    version: '1.0.0',
                    author: 'LumosGen',
                    colors: {
                        primary: '#000000',
                        secondary: '#f8f8f8',
                        background: '#ffffff',
                        text: '#000000'
                    },
                    features: ['minimal', 'fast-loading'],
                    templates: {
                        'main.html': 'minimal-template.html',
                        'styles.css': 'minimal-styles.css'
                    }
                }));
            }
            return Promise.reject(new Error('File not found'));
        });
    },

    async testThemeLoading() {
        console.log('🧪 Testing theme loading...');
        
        const availableThemes = this.themeManager.getAvailableThemes();
        
        TestAssertions.assertTrue(Array.isArray(availableThemes), 'Should return array of themes');
        TestAssertions.assertTrue(availableThemes.length >= 3, 'Should load at least 3 themes');
        TestAssertions.assertContains(availableThemes, 'modern', 'Should include modern theme');
        TestAssertions.assertContains(availableThemes, 'classic', 'Should include classic theme');
        TestAssertions.assertContains(availableThemes, 'minimal', 'Should include minimal theme');
    },

    async testThemeMetadata() {
        console.log('🧪 Testing theme metadata retrieval...');
        
        const modernTheme = this.themeManager.getTheme('modern');
        
        TestAssertions.assertTrue(modernTheme !== null, 'Should return modern theme');
        TestAssertions.assertEqual(modernTheme.name, 'Modern', 'Should have correct theme name');
        TestAssertions.assertEqual(modernTheme.description, 'A modern, clean theme with dark mode support', 'Should have correct description');
        TestAssertions.assertEqual(modernTheme.version, '1.0.0', 'Should have version information');
        TestAssertions.assertTrue(modernTheme.colors !== undefined, 'Should have color configuration');
        TestAssertions.assertTrue(modernTheme.features !== undefined, 'Should have features list');
        TestAssertions.assertTrue(modernTheme.templates !== undefined, 'Should have templates configuration');
        
        // Test theme features
        TestAssertions.assertContains(modernTheme.features, 'dark-mode', 'Should support dark mode');
        TestAssertions.assertContains(modernTheme.features, 'responsive', 'Should be responsive');
        
        // Test color configuration
        TestAssertions.assertEqual(modernTheme.colors.primary, '#007acc', 'Should have correct primary color');
        TestAssertions.assertEqual(modernTheme.colors.background, '#ffffff', 'Should have correct background color');
    },

    async testThemeValidation() {
        console.log('🧪 Testing theme validation...');
        
        // Test valid theme
        const validTheme = {
            name: 'Test Theme',
            description: 'A test theme',
            version: '1.0.0',
            colors: {
                primary: '#000000',
                background: '#ffffff',
                text: '#333333'
            },
            templates: {
                'main.html': 'template.html'
            }
        };
        
        const isValid = this.themeManager.validateTheme(validTheme);
        TestAssertions.assertTrue(isValid, 'Should validate correct theme structure');
        
        // Test invalid theme - missing required fields
        const invalidTheme = {
            name: 'Invalid Theme'
            // Missing required fields
        };
        
        const isInvalid = this.themeManager.validateTheme(invalidTheme);
        TestAssertions.assertFalse(isInvalid, 'Should reject theme with missing fields');
        
        // Test invalid theme - malformed colors
        const malformedTheme = {
            name: 'Malformed Theme',
            description: 'Test',
            version: '1.0.0',
            colors: 'invalid-colors',
            templates: {}
        };
        
        const isMalformed = this.themeManager.validateTheme(malformedTheme);
        TestAssertions.assertFalse(isMalformed, 'Should reject theme with malformed colors');
    },

    async testThemeSwitching() {
        console.log('🧪 Testing theme switching...');
        
        // Test switching to existing theme
        const switchResult = this.themeManager.setCurrentTheme('classic');
        TestAssertions.assertTrue(switchResult, 'Should successfully switch to existing theme');
        
        const currentTheme = this.themeManager.getCurrentTheme();
        TestAssertions.assertEqual(currentTheme, 'classic', 'Should update current theme');
        
        // Test switching to non-existent theme
        const invalidSwitchResult = this.themeManager.setCurrentTheme('non-existent');
        TestAssertions.assertFalse(invalidSwitchResult, 'Should fail to switch to non-existent theme');
        
        // Current theme should remain unchanged
        const unchangedTheme = this.themeManager.getCurrentTheme();
        TestAssertions.assertEqual(unchangedTheme, 'classic', 'Should keep previous theme on failed switch');
    },

    async testThemeCustomization() {
        console.log('🧪 Testing theme customization...');
        
        const customColors = {
            primary: '#ff6b6b',
            secondary: '#4ecdc4',
            background: '#f7f7f7',
            text: '#2c3e50'
        };
        
        const customizedTheme = this.themeManager.customizeTheme('modern', { colors: customColors });
        
        TestAssertions.assertTrue(customizedTheme !== null, 'Should return customized theme');
        TestAssertions.assertEqual(customizedTheme.colors.primary, '#ff6b6b', 'Should apply custom primary color');
        TestAssertions.assertEqual(customizedTheme.colors.secondary, '#4ecdc4', 'Should apply custom secondary color');
        
        // Original theme should remain unchanged
        const originalTheme = this.themeManager.getTheme('modern');
        TestAssertions.assertEqual(originalTheme.colors.primary, '#007acc', 'Should not modify original theme');
    },

    async testThemeTemplateRetrieval() {
        console.log('🧪 Testing theme template retrieval...');
        
        // Mock template file content
        fs.promises.readFile.mockImplementation((filePath) => {
            if (filePath.includes('main-template.html')) {
                return Promise.resolve(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>{{title}}</title>
                        <link rel="stylesheet" href="{{cssPath}}">
                    </head>
                    <body>
                        <div class="container">{{content}}</div>
                    </body>
                    </html>
                `);
            } else if (filePath.includes('styles.css')) {
                return Promise.resolve(`
                    .container {
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                `);
            }
            return Promise.reject(new Error('Template not found'));
        });
        
        const htmlTemplate = await this.themeManager.getThemeTemplate('modern', 'main.html');
        TestAssertions.assertTrue(htmlTemplate.length > 0, 'Should return HTML template content');
        TestAssertions.assertContains(htmlTemplate, '{{title}}', 'Should contain template variables');
        TestAssertions.assertContains(htmlTemplate, '{{content}}', 'Should contain content placeholder');
        
        const cssTemplate = await this.themeManager.getThemeTemplate('modern', 'styles.css');
        TestAssertions.assertTrue(cssTemplate.length > 0, 'Should return CSS template content');
        TestAssertions.assertContains(cssTemplate, '.container', 'Should contain CSS rules');
    },

    async testThemeInstallation() {
        console.log('🧪 Testing theme installation...');
        
        const newTheme = {
            name: 'Custom Theme',
            description: 'A custom installed theme',
            version: '1.0.0',
            author: 'User',
            colors: {
                primary: '#8e44ad',
                secondary: '#ecf0f1',
                background: '#ffffff',
                text: '#2c3e50'
            },
            features: ['custom'],
            templates: {
                'main.html': 'custom-template.html',
                'styles.css': 'custom-styles.css'
            }
        };
        
        // Mock successful file writing
        fs.promises.writeFile.mockResolvedValue();
        fs.promises.mkdir.mockResolvedValue();
        
        const installResult = await this.themeManager.installTheme('custom', newTheme);
        TestAssertions.assertTrue(installResult, 'Should successfully install new theme');
        
        // Verify file operations were called
        TestAssertions.assertTrue(fs.promises.writeFile.mock.calls.length > 0, 'Should write theme configuration file');
        TestAssertions.assertTrue(fs.promises.mkdir.mock.calls.length > 0, 'Should create theme directory');
    },

    async testErrorHandling() {
        console.log('🧪 Testing error handling...');
        
        // Test handling of missing theme directory
        fs.existsSync.mockReturnValue(false);
        fs.promises.mkdir.mockRejectedValue(new Error('Permission denied'));
        
        const themeManagerWithError = new this.ThemeManager();
        await TestUtils.sleep(100);
        
        const themes = themeManagerWithError.getAvailableThemes();
        TestAssertions.assertTrue(Array.isArray(themes), 'Should handle missing directory gracefully');
        TestAssertions.assertEqual(themes.length, 0, 'Should return empty array when directory missing');
        
        // Test handling of corrupted theme file
        fs.promises.readFile.mockRejectedValue(new Error('File corrupted'));
        
        const corruptedTheme = this.themeManager.getTheme('corrupted');
        TestAssertions.assertTrue(corruptedTheme === null, 'Should return null for corrupted theme');
        
        // Test handling of invalid JSON
        fs.promises.readFile.mockResolvedValue('invalid json content');
        
        const invalidJsonTheme = this.themeManager.getTheme('invalid');
        TestAssertions.assertTrue(invalidJsonTheme === null, 'Should handle invalid JSON gracefully');
    },

    async testThemeComparison() {
        console.log('🧪 Testing theme comparison and selection...');
        
        const themes = this.themeManager.getAvailableThemes();
        const themeComparison = this.themeManager.compareThemes(themes);
        
        TestAssertions.assertTrue(Array.isArray(themeComparison), 'Should return comparison array');
        TestAssertions.assertEqual(themeComparison.length, themes.length, 'Should compare all themes');
        
        // Each comparison should include theme metadata
        for (const comparison of themeComparison) {
            TestAssertions.assertTrue(comparison.name !== undefined, 'Should include theme name');
            TestAssertions.assertTrue(comparison.features !== undefined, 'Should include features');
            TestAssertions.assertTrue(comparison.colors !== undefined, 'Should include color scheme');
        }
        
        // Test theme recommendation
        const recommendedTheme = this.themeManager.recommendTheme({
            preferDarkMode: true,
            needsResponsive: true,
            style: 'modern'
        });
        
        TestAssertions.assertTrue(recommendedTheme !== null, 'Should recommend a theme');
        TestAssertions.assertEqual(recommendedTheme, 'modern', 'Should recommend modern theme for dark mode preference');
    },

    async testThemeCaching() {
        console.log('🧪 Testing theme caching...');
        
        // First call should read from file system
        const theme1 = this.themeManager.getTheme('modern');
        const readCallsAfterFirst = fs.promises.readFile.mock.calls.length;
        
        // Second call should use cache
        const theme2 = this.themeManager.getTheme('modern');
        const readCallsAfterSecond = fs.promises.readFile.mock.calls.length;
        
        TestAssertions.assertEqual(theme1, theme2, 'Should return same theme object');
        TestAssertions.assertEqual(
            readCallsAfterFirst,
            readCallsAfterSecond,
            'Should not read file again for cached theme'
        );
        
        // Test cache invalidation
        this.themeManager.clearCache();
        const theme3 = this.themeManager.getTheme('modern');
        const readCallsAfterClear = fs.promises.readFile.mock.calls.length;
        
        TestAssertions.assertTrue(
            readCallsAfterClear > readCallsAfterSecond,
            'Should read file again after cache clear'
        );
    }
};

// Export test suite
module.exports = {
    name: 'ThemeManager Unit Tests',
    tests: themeManagerTests
};

// Run tests if this file is executed directly
if (require.main === module) {
    async function runTests() {
        console.log('🚀 Running ThemeManager Unit Tests...\n');
        
        try {
            await themeManagerTests.setup();
            
            const testMethods = [
                'testThemeLoading',
                'testThemeMetadata',
                'testThemeValidation',
                'testThemeSwitching',
                'testThemeCustomization',
                'testThemeTemplateRetrieval',
                'testThemeInstallation',
                'testErrorHandling',
                'testThemeComparison',
                'testThemeCaching'
            ];
            
            let passed = 0;
            let failed = 0;
            
            for (const testMethod of testMethods) {
                try {
                    await themeManagerTests[testMethod]();
                    console.log(`✅ ${testMethod} passed`);
                    passed++;
                } catch (error) {
                    console.log(`❌ ${testMethod} failed: ${error.message}`);
                    failed++;
                }
            }
            
            console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
            
        } catch (error) {
            console.error('❌ Test setup failed:', error);
        }
    }
    
    runTests();
}
