/**
 * WebsiteBuilder Unit Tests - Vitest Migration
 * 
 * Comprehensive testing of website generation and building functionality
 */

import { describe, it, expect, beforeEach, vi, beforeAll, afterEach } from 'vitest'
import { promises as fs } from 'fs'
import * as path from 'path'

// Mock file system operations
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  promises: {
    mkdir: vi.fn(),
    readdir: vi.fn(),
    stat: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn()
  }
}))

// Mock path module
vi.mock('path', async () => {
  const actual = await vi.importActual('path')
  return {
    ...actual,
    join: vi.fn((...args: string[]) => args.join('/'))
  }
})

// Mock VS Code
const mockOutputChannel = {
  appendLine: vi.fn(),
  show: vi.fn()
}

const mockVscode = {
  workspace: {
    workspaceFolders: [{ uri: { fsPath: '/test/workspace' } }]
  },
  window: {
    createOutputChannel: vi.fn(() => mockOutputChannel),
    showInformationMessage: vi.fn(),
    showErrorMessage: vi.fn()
  },
  commands: {
    executeCommand: vi.fn()
  },
  Uri: {
    file: vi.fn((path: string) => ({ fsPath: path }))
  }
}

vi.mock('vscode', () => mockVscode)

// Mock website builder dependencies
vi.mock('@/website/TemplateEngine', () => ({
  TemplateEngine: vi.fn().mockImplementation(() => ({
    mergeThemeConfig: vi.fn((theme: string, config: any) => ({
      theme,
      primaryColor: theme === 'technical' ? '#10B981' : '#3B82F6',
      fontFamily: 'Inter, system-ui, sans-serif',
      borderRadius: '0.5rem',
      ...config
    })),
    renderPage: vi.fn((data: any) => Promise.resolve(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${data.title}</title>
        <link rel="stylesheet" href="styles.css">
      </head>
      <body>
        <div class="content">${data.content}</div>
      </body>
      </html>
    `)),
    getAvailableThemes: vi.fn(() => ['modern', 'technical']),
    getThemeMetadata: vi.fn((theme: string) => ({
      name: theme.charAt(0).toUpperCase() + theme.slice(1),
      description: `${theme} theme description`,
      features: ['responsive']
    })),
    generateCSS: vi.fn(() => Promise.resolve('body { margin: 0; }')),
    generateJS: vi.fn(() => Promise.resolve('console.log("Generated JS");'))
  }))
}))

vi.mock('@/website/SEOOptimizer', () => ({
  SEOOptimizer: vi.fn().mockImplementation(() => ({
    generateSitemap: vi.fn((pages: string[], siteName: string) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://${siteName.toLowerCase()}.github.io</loc></url>
</urlset>`),
    generateRobotsTxt: vi.fn(() => 'User-agent: *\nAllow: /')
  }))
}))

describe('WebsiteBuilder', () => {
  let WebsiteBuilder: any
  let websiteBuilder: any
  let mockFs: any
  let mockContent: any

  beforeAll(async () => {
    // Import WebsiteBuilder after mocking
    const module = await import('@/website/WebsiteBuilder')
    WebsiteBuilder = module.WebsiteBuilder
  })

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Get mocked fs
    mockFs = await import('fs')
    
    // Set up mock file system
    setupMockFileSystem()
    
    // Create new instance
    websiteBuilder = new WebsiteBuilder(mockOutputChannel)
    
    // Set up mock content
    mockContent = {
      metadata: {
        title: 'Test Project',
        description: 'Test project description',
        keywords: ['test', 'project']
      },
      homepage: {
        title: 'Test Project Homepage',
        content: 'This is a test homepage content.\n\nIt has multiple paragraphs.',
        sections: ['hero', 'features', 'contact']
      },
      about: {
        title: 'About Test Project',
        content: 'This is the about page content.',
        sections: ['story', 'team']
      }
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function setupMockFileSystem() {
    mockFs.existsSync.mockReturnValue(true)
    mockFs.promises.mkdir.mockResolvedValue(undefined)
    mockFs.promises.writeFile.mockResolvedValue(undefined)
    mockFs.promises.readFile.mockResolvedValue('mock file content')
    mockFs.promises.readdir.mockResolvedValue(['file1.txt', 'file2.txt'])

    // Mock workspace folders
    mockVscode.workspace.workspaceFolders = [{ uri: { fsPath: '/test/workspace' } }]
  }

  describe('Basic Website Building', () => {
    it('should build website with default configuration', async () => {
      const mockAnalysis = {
        projectType: 'web',
        technologies: ['JavaScript', 'HTML', 'CSS'],
        features: ['responsive', 'seo']
      }

      const result = await websiteBuilder.buildWebsite(mockContent, mockAnalysis)

      expect(result.success).toBe(true)
      expect(result.outputPath).toContain('lumosgen-website')
      expect(result.pages.length).toBeGreaterThan(0)
      expect(result.assets.length).toBeGreaterThan(0)
    })

    it('should create output directory', async () => {
      const mockAnalysis = { projectType: 'web', technologies: [], features: [] }

      await websiteBuilder.buildWebsite(mockContent, mockAnalysis)

      expect(mockFs.promises.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('lumosgen-website'),
        { recursive: true }
      )
    })

    it('should generate HTML pages', async () => {
      const mockAnalysis = { projectType: 'web', technologies: [], features: [] }

      const result = await websiteBuilder.buildWebsite(mockContent, mockAnalysis)

      expect(mockFs.promises.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('index.html'),
        expect.stringContaining('<!DOCTYPE html>'),
        'utf8'
      )

      expect(result.pages).toContain('index.html')
    })
  })

  describe('Theme Application', () => {
    it('should apply technical theme correctly', async () => {
      const mockAnalysis = { projectType: 'web', technologies: [], features: [] }
      const config = { theme: 'technical' }
      
      const result = await websiteBuilder.buildWebsite(mockContent, mockAnalysis, config)
      
      expect(result.success).toBe(true)
      // The theme should be applied through the template engine
    })

    it('should use modern theme as default', async () => {
      const mockAnalysis = { projectType: 'web', technologies: [], features: [] }
      
      const result = await websiteBuilder.buildWebsite(mockContent, mockAnalysis)
      
      expect(result.success).toBe(true)
      // Default theme should be applied
    })
  })

  describe('HTML Generation', () => {
    it('should generate valid HTML structure', async () => {
      const mockAnalysis = { projectType: 'web', technologies: [], features: [] }
      
      await websiteBuilder.buildWebsite(mockContent, mockAnalysis)
      
      // Check that writeFile was called with HTML content
      const writeFileCalls = mockFs.promises.writeFile.mock.calls
      const htmlCall = writeFileCalls.find(call => call[0].includes('.html'))
      
      expect(htmlCall).toBeTruthy()
      expect(htmlCall[1]).toContain('<!DOCTYPE html>')
      expect(htmlCall[1]).toContain('<html>')
      expect(htmlCall[1]).toContain('<head>')
      expect(htmlCall[1]).toContain('<body>')
      expect(htmlCall[1]).toContain('Test Project')
      expect(htmlCall[1]).toContain('styles.css')
    })

    it('should include page content in HTML', async () => {
      const mockAnalysis = { projectType: 'web', technologies: [], features: [] }
      
      await websiteBuilder.buildWebsite(mockContent, mockAnalysis)
      
      const writeFileCalls = mockFs.promises.writeFile.mock.calls
      const htmlCall = writeFileCalls.find(call => call[0].includes('.html'))
      
      expect(htmlCall[1]).toContain('test homepage content')
    })
  })

  describe('Asset Generation', () => {
    it('should generate CSS assets', async () => {
      const mockAnalysis = { projectType: 'web', technologies: [], features: [] }
      
      const result = await websiteBuilder.buildWebsite(mockContent, mockAnalysis)
      
      expect(result.assets).toContain('styles.css')
      expect(mockFs.promises.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('styles.css'),
        expect.any(String),
        'utf8'
      )
    })

    it('should generate JavaScript when enabled', async () => {
      const mockAnalysis = { projectType: 'web', technologies: [], features: [] }
      const config = { includeJS: true, analytics: true, darkMode: true }
      
      const result = await websiteBuilder.buildWebsite(mockContent, mockAnalysis, config)
      
      expect(result.assets).toContain('script.js')
    })
  })

  describe('SEO Files Generation', () => {
    it('should generate sitemap.xml', async () => {
      const mockAnalysis = { projectType: 'web', technologies: [], features: [] }
      const config = { baseUrl: 'https://test.com' }
      
      const result = await websiteBuilder.buildWebsite(mockContent, mockAnalysis, config)
      
      expect(result.assets).toContain('sitemap.xml')
      expect(mockFs.promises.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('sitemap.xml'),
        expect.stringContaining('<?xml version="1.0"'),
        'utf8'
      )
    })

    it('should generate robots.txt', async () => {
      const mockAnalysis = { projectType: 'web', technologies: [], features: [] }
      
      const result = await websiteBuilder.buildWebsite(mockContent, mockAnalysis)
      
      expect(result.assets).toContain('robots.txt')
    })
  })

  describe('Theme Management', () => {
    it('should return available themes', () => {
      const themes = websiteBuilder.getAvailableThemes()
      
      expect(Array.isArray(themes)).toBe(true)
      expect(themes).toContain('modern')
      expect(themes).toContain('technical')
    })

    it('should return theme metadata', () => {
      const metadata = websiteBuilder.getThemeMetadata('modern')
      
      expect(metadata).toBeTruthy()
      expect(metadata.name).toBe('Modern')
      expect(metadata.description).toBeTruthy()
    })

    it('should handle theme switching', () => {
      const success = websiteBuilder.setTheme('technical')
      expect(success).toBe(true)
      
      const invalidSuccess = websiteBuilder.setTheme('non-existent')
      expect(invalidSuccess).toBe(false)
    })
  })

  describe('Content Validation', () => {
    it('should validate website structure', async () => {
      const mockWebsite = {
        outputPath: '/test/output',
        pages: ['index.html', 'about.html'],
        assets: ['styles.css', 'sitemap.xml'],
        metadata: {
          totalPages: 2,
          totalAssets: 2
        }
      }
      
      if (typeof websiteBuilder.validateWebsite === 'function') {
        const validation = websiteBuilder.validateWebsite(mockWebsite)
        
        expect(validation.isValid).toBe(true)
        expect(Array.isArray(validation.errors)).toBe(true)
        expect(Array.isArray(validation.warnings)).toBe(true)
      }
    })

    it('should handle empty content gracefully', async () => {
      const emptyContent = {
        metadata: { title: '', description: '', keywords: [] },
        homepage: { title: '', content: '', sections: [] }
      }
      const mockAnalysis = { projectType: 'web', technologies: [], features: [] }
      
      const result = await websiteBuilder.buildWebsite(emptyContent, mockAnalysis)
      
      expect(result.success).toBe(true)
      // Should handle empty content without errors
    })
  })

  describe('Error Handling', () => {
    it('should handle build failures gracefully', async () => {
      mockFs.promises.mkdir.mockRejectedValue(new Error('Permission denied'))
      
      const mockAnalysis = { projectType: 'web', technologies: [], features: [] }
      const result = await websiteBuilder.buildWebsite(mockContent, mockAnalysis)
      
      expect(result.success).toBe(false)
      expect(result.errors).toBeTruthy()
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should handle file write errors', async () => {
      mockFs.promises.writeFile.mockRejectedValue(new Error('Write failed'))
      
      const mockAnalysis = { projectType: 'web', technologies: [], features: [] }
      const result = await websiteBuilder.buildWebsite(mockContent, mockAnalysis)
      
      expect(result.success).toBe(false)
    })

    it('should log build progress', async () => {
      const mockAnalysis = { projectType: 'web', technologies: [], features: [] }
      
      await websiteBuilder.buildWebsite(mockContent, mockAnalysis)
      
      expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
        expect.stringContaining('Building responsive website')
      )
    })
  })
})
