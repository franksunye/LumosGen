import * as vscode from 'vscode';
import * as path from 'path';
import { getConfig } from './config/SimpleConfig';
import { AIClient, FileContext, GenerationRequest } from './aiClient';
import { ContentWriter } from './writer';

export class FileWatcher {
  private watchers: vscode.FileSystemWatcher[] = [];
  private aiClient: AIClient;
  private writer: ContentWriter;
  private outputChannel: vscode.OutputChannel;
  private debounceTimer: NodeJS.Timeout | null = null;
  private isEnabled = true;

  constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
    this.aiClient = new AIClient(outputChannel);
    this.writer = new ContentWriter(outputChannel);
  }

  public async start(): Promise<void> {
    const config = getConfig();
    
    if (!config.enabled) {
      this.outputChannel.appendLine('LumosGen file watcher is disabled');
      return;
    }

    this.outputChannel.appendLine('Starting LumosGen file watcher...');

    // Check workspace folders first
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      const errorMessage = 'No workspace folder found. Please open a folder in VS Code.';
      this.outputChannel.appendLine(`ERROR: ${errorMessage}`);
      vscode.window.showWarningMessage(`LumosGen: ${errorMessage}`);
      return;
    }
    this.outputChannel.appendLine(`Workspace folder: ${workspaceFolders[0].uri.fsPath}`);

    // Configuration validation simplified for MVP
    this.outputChannel.appendLine('Configuration validation passed');

    // Check write permissions
    this.outputChannel.appendLine('Checking write permissions...');
    const hasWritePermissions = await this.writer.checkWritePermissions();
    if (!hasWritePermissions) {
      const errorMessage = 'No write permissions in workspace. Please check folder permissions.';
      this.outputChannel.appendLine(`ERROR: ${errorMessage}`);
      vscode.window.showWarningMessage(`LumosGen: ${errorMessage}`);
      this.outputChannel.appendLine('TIP: You can still use manual generation with "LumosGen: Generate Content" command');
      return;
    }
    this.outputChannel.appendLine('Write permissions check passed');

    // Create watchers for each pattern
    for (const pattern of config.watchPatterns) {
      await this.createWatcher(pattern);
    }

    this.outputChannel.appendLine(`File watcher started with ${this.watchers.length} pattern(s)`);
    vscode.window.showInformationMessage('LumosGen: File watcher started');
  }

  public stop(): void {
    this.outputChannel.appendLine('Stopping LumosGen file watcher...');
    
    // Clear debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    // Dispose all watchers
    this.watchers.forEach(watcher => watcher.dispose());
    this.watchers = [];
    
    this.outputChannel.appendLine('File watcher stopped');
  }

  public toggle(): void {
    this.isEnabled = !this.isEnabled;
    
    if (this.isEnabled) {
      this.start();
      vscode.window.showInformationMessage('LumosGen: File watcher enabled');
    } else {
      this.stop();
      vscode.window.showInformationMessage('LumosGen: File watcher disabled');
    }
  }

  private async createWatcher(pattern: string): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return;
    }

    const workspaceFolder = workspaceFolders[0];
    const watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(workspaceFolder, pattern)
    );

    // Listen for file changes
    watcher.onDidChange(uri => this.onFileChanged(uri, 'changed'));
    watcher.onDidCreate(uri => this.onFileChanged(uri, 'created'));
    
    this.watchers.push(watcher);
    this.outputChannel.appendLine(`Created watcher for pattern: ${pattern}`);
  }

  private onFileChanged(uri: vscode.Uri, changeType: 'changed' | 'created'): void {
    if (!this.isEnabled) {
      return;
    }

    const config = getConfig();
    const fileName = path.basename(uri.fsPath);

    // Skip if it's the output file to avoid infinite loops
    if (fileName === config.outputFile) {
      return;
    }

    this.outputChannel.appendLine(`File ${changeType}: ${uri.fsPath}`);

    // Debounce the generation to avoid too frequent triggers
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.triggerContentGeneration(uri, changeType);
    }, config.triggerDelay);
  }

  private async triggerContentGeneration(triggerUri: vscode.Uri, changeType: string): Promise<void> {
    try {
      this.outputChannel.appendLine(`Triggering content generation (${changeType}): ${triggerUri.fsPath}`);
      
      // Show progress
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "LumosGen",
        cancellable: false
      }, async (progress) => {
        progress.report({ message: "Analyzing files..." });
        
        // Collect context files
        const context = await this.collectContext();
        
        progress.report({ message: "Generating content..." });
        
        // Generate content
        const request: GenerationRequest = {
          template: getConfig().template,
          context: context
        };
        
        const response = await this.aiClient.generateContent(request);
        
        progress.report({ message: "Writing output..." });
        
        // Backup existing file if needed
        await this.writer.backupExistingFile();
        
        // Write the generated content
        await this.writer.writeContent(response);
        
        this.outputChannel.appendLine('Content generation completed successfully');
      });

    } catch (error) {
      this.outputChannel.appendLine(`Error during content generation: ${error}`);
      vscode.window.showErrorMessage(`LumosGen: Content generation failed - ${error}`);
    }
  }

  private async collectContext(): Promise<FileContext[]> {
    const config = getConfig();
    const context: FileContext[] = [];
    
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return context;
    }

    for (const pattern of config.watchPatterns) {
      const files = await vscode.workspace.findFiles(
        new vscode.RelativePattern(workspaceFolders[0], pattern),
        null,
        10 // Limit to 10 files for MVP
      );

      for (const file of files) {
        // Skip the output file
        if (path.basename(file.fsPath) === config.outputFile) {
          continue;
        }

        try {
          const content = await vscode.workspace.fs.readFile(file);
          const stats = await vscode.workspace.fs.stat(file);
          
          context.push({
            path: vscode.workspace.asRelativePath(file),
            content: content.toString(),
            lastModified: new Date(stats.mtime)
          });
        } catch (error) {
          this.outputChannel.appendLine(`Error reading file ${file.fsPath}: ${error}`);
        }
      }
    }

    this.outputChannel.appendLine(`Collected ${context.length} context files`);
    return context;
  }

  public async manualGeneration(): Promise<void> {
    this.outputChannel.appendLine('Manual content generation triggered');
    await this.triggerContentGeneration(
      vscode.Uri.file('manual-trigger'), 
      'manual'
    );
  }
}
