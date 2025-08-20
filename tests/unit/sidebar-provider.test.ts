/**
 * SidebarProvider Unit Tests - Vitest Migration
 * 
 * Comprehensive testing of VS Code sidebar functionality including
 * webview management, user interactions, theme switching, and agent integration.
 */

import { describe, it, expect, beforeEach, vi, beforeAll, afterEach } from 'vitest'
import type { WebviewView, OutputChannel } from 'vscode'

// Mock VS Code API types
interface MockWebviewView {
  webview: {
    html: string
    options: any
    onDidReceiveMessage: ReturnType<typeof vi.fn>
    postMessage: ReturnType<typeof vi.fn>
  }
  viewType: string
}

interface MockWindow {
  showInformationMessage: ReturnType<typeof vi.fn>
  showErrorMessage: ReturnType<typeof vi.fn>
  showWarningMessage: ReturnType<typeof vi.fn>
}

interface MockCommands {
  executeCommand: ReturnType<typeof vi.fn>
}

interface MockWorkspace {
  workspaceFolders: Array<{ uri: { fsPath: string } }> | null
}

// Create mocks
const mockWebviewView: MockWebviewView = {
  webview: {
    html: '',
    options: {},
    onDidReceiveMessage: vi.fn(),
    postMessage: vi.fn()
  },
  viewType: 'lumosgen.sidebar'
}

const mockWindow: MockWindow = {
  showInformationMessage: vi.fn(),
  showErrorMessage: vi.fn(),
  showWarningMessage: vi.fn()
}

const mockCommands: MockCommands = {
  executeCommand: vi.fn()
}

const mockWorkspace: MockWorkspace = {
  workspaceFolders: [{
    uri: { fsPath: '/test/workspace' }
  }]
}

const mockVscode = {
  window: mockWindow,
  commands: mockCommands,
  workspace: mockWorkspace,
  WebviewViewResolveContext: {},
  CancellationToken: {}
}

// Mock dependencies
const mockOutputChannel = {
  appendLine: vi.fn(),
  show: vi.fn()
}

const mockAgentManager = {
  generateContentWithPath: vi.fn(),
  on: vi.fn(),
  emit: vi.fn(),
  stop: vi.fn(),
  start: vi.fn(),
  isRunning: vi.fn(() => false)
}

const mockWebsiteBuilder = {
  getAvailableThemes: vi.fn(() => ['modern', 'classic', 'minimal']),
  getThemeMetadata: vi.fn((theme: string) => ({
    name: theme.charAt(0).toUpperCase() + theme.slice(1),
    description: `${theme} theme description`,
    features: ['responsive']
  })),
  buildWebsite: vi.fn(() => Promise.resolve({
    success: true,
    outputPath: '/test/output',
    pages: ['index.html'],
    assets: ['styles.css']
  }))
}

const mockDeployer = {
  deploy: vi.fn(),
  onStatusChange: vi.fn()
}

const mockDeploymentMonitor = {
  startMonitoring: vi.fn(),
  stopMonitoring: vi.fn()
}

// Mock constructors
vi.mock('@/deployment/GitHubPagesDeployer', () => ({
  GitHubPagesDeployer: vi.fn().mockImplementation(() => mockDeployer)
}))

vi.mock('@/deployment/DeploymentMonitor', () => ({
  DeploymentMonitor: vi.fn().mockImplementation(() => mockDeploymentMonitor)
}))

vi.mock('@/website/WebsiteBuilder', () => ({
  WebsiteBuilder: vi.fn().mockImplementation(() => mockWebsiteBuilder)
}))

// Mock vscode module
vi.mock('vscode', () => mockVscode)

describe('SidebarProvider', () => {
  let SidebarProvider: any
  let sidebarProvider: any
  let extensionUri: any

  beforeAll(async () => {
    // Import SidebarProvider after mocking
    const module = await import('@/ui/SidebarProvider')
    SidebarProvider = module.SidebarProvider
  })

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    extensionUri = { fsPath: '/test/extension' }
    sidebarProvider = new SidebarProvider(
      extensionUri,
      mockOutputChannel,
      mockAgentManager
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initialization', () => {
    it('should initialize with correct view type', () => {
      expect(SidebarProvider.viewType).toBe('lumosgen.sidebar')
    })

    it('should log initialization messages', () => {
      expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
        expect.stringContaining('SidebarProvider constructor called')
      )
    })

    it('should set up agent event listeners if agent manager provided', () => {
      if (mockAgentManager) {
        expect(mockAgentManager.on).toHaveBeenCalled()
      }
    })
  })

  describe('Webview View Resolution', () => {
    it('should resolve webview view correctly', () => {
      const context = {}
      const token = {}
      
      sidebarProvider.resolveWebviewView(mockWebviewView, context, token)
      
      // Verify webview options were set
      expect(mockWebviewView.webview.options.enableScripts).toBe(true)
      expect(Array.isArray(mockWebviewView.webview.options.localResourceRoots)).toBe(true)
      
      // Verify HTML content was set
      expect(mockWebviewView.webview.html.length).toBeGreaterThan(0)
      expect(mockWebviewView.webview.html).toContain('LumosGen')
      
      // Verify message handler was registered
      expect(mockWebviewView.webview.onDidReceiveMessage).toHaveBeenCalled()
    })

    it('should generate valid HTML content', () => {
      sidebarProvider.resolveWebviewView(mockWebviewView, {}, {})
      
      const htmlContent = mockWebviewView.webview.html
      
      // Test HTML structure
      expect(htmlContent).toContain('<!DOCTYPE html>')
      expect(htmlContent).toContain('<html')
      expect(htmlContent).toContain('<head>')
      expect(htmlContent).toContain('<body>')
      expect(htmlContent).toContain('</html>')
      
      // Test content sections
      expect(htmlContent).toContain('Generate Marketing Website')
      expect(htmlContent).toContain('Deploy to GitHub Pages')
      expect(htmlContent).toContain('Settings')

      // Test theme selection
      expect(htmlContent).toContain('theme-option')
      expect(htmlContent).toContain('Modern')
      expect(htmlContent).toContain('Technical')
      
      // Test JavaScript functionality
      expect(htmlContent).toContain('vscode.postMessage')
      expect(htmlContent).toContain('selectTheme')
      expect(htmlContent).toContain('generateContent')
    })
  })

  describe('Message Handling', () => {
    let messageHandler: Function

    beforeEach(() => {
      sidebarProvider.resolveWebviewView(mockWebviewView, {}, {})
      messageHandler = mockWebviewView.webview.onDidReceiveMessage.mock.calls[0][0]
    })

    it('should register message handler function', () => {
      expect(typeof messageHandler).toBe('function')
    })

    it('should handle generateContent message', async () => {
      vi.clearAllMocks()
      mockAgentManager.generateContentWithPath.mockResolvedValue({
        success: true,
        data: { content: 'Generated content' }
      })
      
      await messageHandler({ type: 'generateContent' })
      
      expect(mockAgentManager.generateContentWithPath).toHaveBeenCalled()
    })

    it('should handle openSettings message', async () => {
      vi.clearAllMocks()
      await messageHandler({ type: 'openSettings' })
      
      expect(mockCommands.executeCommand).toHaveBeenCalledWith(
        'workbench.action.openSettings',
        'lumosGen'
      )
    })

    it('should handle theme change message', async () => {
      vi.clearAllMocks()
      await messageHandler({ type: 'changeTheme', theme: 'classic' })
      
      // Should show theme change confirmation
      expect(mockWindow.showInformationMessage).toHaveBeenCalled()
      
      // Should post message to webview
      expect(mockWebviewView.webview.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'themeChanged'
        })
      )
    })

    it('should handle getThemes message', async () => {
      vi.clearAllMocks()
      await messageHandler({ type: 'getThemes' })
      
      expect(mockWebsiteBuilder.getAvailableThemes).toHaveBeenCalled()
      expect(mockWebsiteBuilder.getThemeMetadata).toHaveBeenCalled()
    })
  })

  describe('Content Generation', () => {
    let messageHandler: Function

    beforeEach(() => {
      sidebarProvider.resolveWebviewView(mockWebviewView, {}, {})
      messageHandler = mockWebviewView.webview.onDidReceiveMessage.mock.calls[0][0]
    })

    it('should handle successful content generation', async () => {
      mockAgentManager.generateContentWithPath.mockResolvedValue({
        success: true,
        data: {
          content: 'Generated marketing content',
          metadata: { wordCount: 500 }
        }
      })
      
      await messageHandler({ type: 'generateContent' })
      
      expect(mockAgentManager.generateContentWithPath).toHaveBeenCalledWith(
        'homepage',
        '/test/workspace'
      )
      
      // Should show success message
      expect(mockWindow.showInformationMessage).toHaveBeenCalled()
    })

    it('should handle failed content generation', async () => {
      vi.clearAllMocks()
      mockAgentManager.generateContentWithPath.mockResolvedValue({
        success: false,
        error: 'Generation failed'
      })
      
      await messageHandler({ type: 'generateContent' })
      
      expect(mockWindow.showErrorMessage).toHaveBeenCalled()
    })

    it('should handle content generation errors', async () => {
      mockAgentManager.generateContentWithPath.mockRejectedValue(
        new Error('Agent system error')
      )
      
      await messageHandler({ type: 'generateContent' })
      
      expect(mockWindow.showErrorMessage).toHaveBeenCalled()
    })
  })

  describe('Deployment Workflow', () => {
    let messageHandler: Function

    beforeEach(() => {
      sidebarProvider.resolveWebviewView(mockWebviewView, {}, {})
      messageHandler = mockWebviewView.webview.onDidReceiveMessage.mock.calls[0][0]
    })

    it('should handle deployment to GitHub', async () => {
      mockDeployer.deploy.mockResolvedValue({
        success: true,
        url: 'https://test.github.io',
        branch: 'gh-pages'
      })
      
      await messageHandler({ type: 'deployToGitHub' })
      
      expect(mockDeployer.deploy).toHaveBeenCalled()
      
      const deployCall = mockDeployer.deploy.mock.calls[0]
      expect(deployCall[0]).toContain('lumosgen-website')
      expect(deployCall[1].branch).toBe('gh-pages')
      
      // Verify status change handler was set up
      expect(mockDeployer.onStatusChange).toHaveBeenCalled()
    })

    it('should handle deployment errors', async () => {
      vi.clearAllMocks()
      mockDeployer.deploy.mockRejectedValue(new Error('Deployment failed'))
      
      await messageHandler({ type: 'deployToGitHub' })
      
      expect(mockWindow.showErrorMessage).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    let messageHandler: Function

    beforeEach(() => {
      sidebarProvider.resolveWebviewView(mockWebviewView, {}, {})
      messageHandler = mockWebviewView.webview.onDidReceiveMessage.mock.calls[0][0]
    })

    it('should handle missing workspace error', async () => {
      vi.clearAllMocks()
      mockWorkspace.workspaceFolders = null
      
      await messageHandler({ type: 'generateContent' })
      
      expect(mockWindow.showErrorMessage).toHaveBeenCalled()
      
      // Restore workspace
      mockWorkspace.workspaceFolders = [{ uri: { fsPath: '/test/workspace' } }]
    })

    it('should handle workflow stopping', async () => {
      await messageHandler({ type: 'stopAgentWorkflow' })
      
      // Should log the stop action
      expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
        expect.stringMatching(/stop|Stop/)
      )
    })
  })
})
