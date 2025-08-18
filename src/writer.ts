import * as vscode from 'vscode';
import * as path from 'path';
import { getConfig } from './config/SimpleConfig';
import { GenerationResponse } from './aiClient';

export class ContentWriter {
  private outputChannel: vscode.OutputChannel;

  constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
  }

  public async writeContent(content: GenerationResponse): Promise<void> {
    const config = getConfig();
    const workspaceFolder = this.getWorkspaceFolder();
    
    if (!workspaceFolder) {
      throw new Error('No workspace folder found');
    }

    const outputPath = path.join(workspaceFolder.uri.fsPath, config.outputFile);
    const outputUri = vscode.Uri.file(outputPath);

    try {
      this.outputChannel.appendLine(`[${new Date().toISOString()}] Writing content to: ${outputPath}`);
      
      // Add metadata header to the content
      const contentWithMetadata = this.addMetadata(content);
      
      // Write the file
      await vscode.workspace.fs.writeFile(
        outputUri, 
        Buffer.from(contentWithMetadata, 'utf8')
      );

      this.outputChannel.appendLine(`[${new Date().toISOString()}] Content successfully written`);
      
      // Show success message
      vscode.window.showInformationMessage(
        `LumosGen: Content generated and saved to ${config.outputFile}`,
        'Open File'
      ).then(selection => {
        if (selection === 'Open File') {
          vscode.window.showTextDocument(outputUri);
        }
      });

    } catch (error) {
      this.outputChannel.appendLine(`[${new Date().toISOString()}] Error writing file: ${error}`);
      vscode.window.showErrorMessage(`LumosGen: Failed to write content - ${error}`);
      throw error;
    }
  }

  private addMetadata(response: GenerationResponse): string {
    const metadata = `<!--
LumosGen Metadata:
- Generated: ${response.metadata.timestamp}
- Model: ${response.metadata.model}
${response.metadata.tokens ? `- Tokens: ${response.metadata.tokens}` : ''}
- Template: ${getConfig().template}
-->

`;
    
    return metadata + response.content;
  }

  private getWorkspaceFolder(): vscode.WorkspaceFolder | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return undefined;
    }
    
    // Return the first workspace folder
    return workspaceFolders[0];
  }

  public async checkWritePermissions(): Promise<boolean> {
    const workspaceFolder = this.getWorkspaceFolder();
    if (!workspaceFolder) {
      this.outputChannel.appendLine('ERROR: No workspace folder available for write permission check');
      return false;
    }

    this.outputChannel.appendLine(`Testing write permissions in: ${workspaceFolder.uri.fsPath}`);

    try {
      // Try to create a temporary file to test write permissions
      const testPath = path.join(workspaceFolder.uri.fsPath, '.lumosgen-test');
      const testUri = vscode.Uri.file(testPath);

      this.outputChannel.appendLine(`Creating test file: ${testPath}`);
      await vscode.workspace.fs.writeFile(testUri, Buffer.from('test', 'utf8'));

      this.outputChannel.appendLine('Test file created successfully, cleaning up...');
      await vscode.workspace.fs.delete(testUri);

      this.outputChannel.appendLine('Write permission check passed');
      return true;
    } catch (error) {
      this.outputChannel.appendLine(`ERROR: Write permission check failed: ${error}`);
      this.outputChannel.appendLine(`Error details: ${JSON.stringify(error, null, 2)}`);
      return false;
    }
  }

  public async backupExistingFile(): Promise<void> {
    const config = getConfig();
    const workspaceFolder = this.getWorkspaceFolder();
    
    if (!workspaceFolder) {
      return;
    }

    const outputPath = path.join(workspaceFolder.uri.fsPath, config.outputFile);
    const outputUri = vscode.Uri.file(outputPath);

    try {
      // Check if file exists
      await vscode.workspace.fs.stat(outputUri);
      
      // Create backup
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(
        workspaceFolder.uri.fsPath, 
        `${config.outputFile}.backup.${timestamp}`
      );
      const backupUri = vscode.Uri.file(backupPath);
      
      await vscode.workspace.fs.copy(outputUri, backupUri);
      this.outputChannel.appendLine(`Backup created: ${backupPath}`);
      
    } catch (error) {
      // File doesn't exist, no backup needed
      this.outputChannel.appendLine(`No existing file to backup: ${config.outputFile}`);
    }
  }
}
