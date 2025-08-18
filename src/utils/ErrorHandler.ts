import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface ErrorContext {
    operation: string;
    component: string;
    timestamp: Date;
    workspaceRoot?: string;
    additionalInfo?: Record<string, any>;
}

export interface ErrorLog {
    id: string;
    error: Error;
    context: ErrorContext;
    severity: 'low' | 'medium' | 'high' | 'critical';
    resolved: boolean;
    resolutionSteps?: string[];
}

export interface RecoveryAction {
    label: string;
    action: () => Promise<void>;
    description: string;
}

export class ErrorHandler {
    private outputChannel: vscode.OutputChannel;
    private errorLogs: ErrorLog[] = [];
    private logFilePath?: string;

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
        // Defer log file initialization to avoid blocking extension startup
        this.initializeLogFileAsync();
    }

    private async initializeLogFileAsync(): Promise<void> {
        try {
            const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (workspaceRoot) {
                const logsDir = path.join(workspaceRoot, '.lumosgen', 'logs');
                await fs.promises.mkdir(logsDir, { recursive: true });
                this.logFilePath = path.join(logsDir, 'error.log');
            }
        } catch (error) {
            // Silently fail if we can't create log file
            this.outputChannel.appendLine(`Warning: Could not initialize error log file: ${error}`);
        }
    }

    public async handleError(
        error: Error,
        context: ErrorContext,
        recoveryActions?: RecoveryAction[]
    ): Promise<void> {
        const errorLog = this.createErrorLog(error, context);
        this.errorLogs.push(errorLog);

        // Log to output channel
        this.logToOutput(errorLog);

        // Log to file
        await this.logToFile(errorLog);

        // Show user-friendly error message with recovery options
        await this.showErrorToUser(errorLog, recoveryActions);
    }

    private createErrorLog(error: Error, context: ErrorContext): ErrorLog {
        const severity = this.determineSeverity(error, context);
        
        return {
            id: this.generateErrorId(),
            error,
            context,
            severity,
            resolved: false,
            resolutionSteps: this.generateResolutionSteps(error, context)
        };
    }

    private determineSeverity(error: Error, context: ErrorContext): 'low' | 'medium' | 'high' | 'critical' {
        const message = error.message.toLowerCase();
        
        // Critical errors that prevent core functionality
        if (message.includes('no workspace') || 
            message.includes('permission denied') ||
            message.includes('not a git repository')) {
            return 'critical';
        }
        
        // High severity for deployment and build failures
        if (context.operation.includes('deploy') || 
            context.operation.includes('build') ||
            message.includes('failed to push')) {
            return 'high';
        }
        
        // Medium severity for content generation issues
        if (context.operation.includes('generate') || 
            context.operation.includes('analyze')) {
            return 'medium';
        }
        
        return 'low';
    }

    private generateResolutionSteps(error: Error, context: ErrorContext): string[] {
        const message = error.message.toLowerCase();
        const steps: string[] = [];

        if (message.includes('no workspace')) {
            steps.push('Open a folder in VS Code (File → Open Folder)');
            steps.push('Ensure the folder contains your project files');
        }

        if (message.includes('not a git repository')) {
            steps.push('Initialize Git repository: git init');
            steps.push('Add remote origin: git remote add origin <your-repo-url>');
            steps.push('Make initial commit: git add . && git commit -m "Initial commit"');
        }

        if (message.includes('permission denied')) {
            steps.push('Check file/folder permissions');
            steps.push('Try running VS Code as administrator (if on Windows)');
            steps.push('Ensure you have write access to the workspace folder');
        }

        if (message.includes('failed to push')) {
            steps.push('Check your Git credentials');
            steps.push('Ensure you have push access to the repository');
            steps.push('Try: git push origin gh-pages --force (if safe to do so)');
        }

        if (message.includes('network') || message.includes('timeout')) {
            steps.push('Check your internet connection');
            steps.push('Try again in a few moments');
            steps.push('Check if GitHub is experiencing issues');
        }

        if (steps.length === 0) {
            steps.push('Try the operation again');
            steps.push('Check the output channel for more details');
            steps.push('Report this issue if it persists');
        }

        return steps;
    }

    private generateErrorId(): string {
        return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    }

    private logToOutput(errorLog: ErrorLog): void {
        const { error, context, severity, id } = errorLog;
        
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine('='.repeat(60));
        this.outputChannel.appendLine(`ERROR [${severity.toUpperCase()}] - ${id}`);
        this.outputChannel.appendLine('='.repeat(60));
        this.outputChannel.appendLine(`Operation: ${context.operation}`);
        this.outputChannel.appendLine(`Component: ${context.component}`);
        this.outputChannel.appendLine(`Timestamp: ${context.timestamp.toISOString()}`);
        this.outputChannel.appendLine(`Message: ${error.message}`);
        
        if (error.stack) {
            this.outputChannel.appendLine(`Stack Trace:`);
            this.outputChannel.appendLine(error.stack);
        }
        
        if (context.additionalInfo) {
            this.outputChannel.appendLine(`Additional Info:`);
            this.outputChannel.appendLine(JSON.stringify(context.additionalInfo, null, 2));
        }
        
        if (errorLog.resolutionSteps && errorLog.resolutionSteps.length > 0) {
            this.outputChannel.appendLine(`Suggested Resolution Steps:`);
            errorLog.resolutionSteps.forEach((step, index) => {
                this.outputChannel.appendLine(`  ${index + 1}. ${step}`);
            });
        }
        
        this.outputChannel.appendLine('='.repeat(60));
    }

    private async logToFile(errorLog: ErrorLog): Promise<void> {
        if (!this.logFilePath) return;

        try {
            const logEntry = {
                id: errorLog.id,
                timestamp: errorLog.context.timestamp.toISOString(),
                severity: errorLog.severity,
                operation: errorLog.context.operation,
                component: errorLog.context.component,
                message: errorLog.error.message,
                stack: errorLog.error.stack,
                additionalInfo: errorLog.context.additionalInfo,
                resolutionSteps: errorLog.resolutionSteps
            };

            const logLine = JSON.stringify(logEntry) + '\n';
            await fs.promises.appendFile(this.logFilePath, logLine, 'utf8');
        } catch (error) {
            // Don't throw if logging fails
            this.outputChannel.appendLine(`Warning: Could not write to error log: ${error}`);
        }
    }

    private async showErrorToUser(errorLog: ErrorLog, recoveryActions?: RecoveryAction[]): Promise<void> {
        const { error, severity, resolutionSteps } = errorLog;
        
        // Create user-friendly message
        const friendlyMessage = this.createFriendlyMessage(error, severity);
        
        // Prepare action buttons
        const actions: string[] = ['View Details'];
        
        if (resolutionSteps && resolutionSteps.length > 0) {
            actions.push('Show Solutions');
        }
        
        if (recoveryActions && recoveryActions.length > 0) {
            actions.push('Try Recovery');
        }

        // Show appropriate message based on severity
        let selection: string | undefined;
        
        switch (severity) {
            case 'critical':
                selection = await vscode.window.showErrorMessage(friendlyMessage, ...actions);
                break;
            case 'high':
                selection = await vscode.window.showErrorMessage(friendlyMessage, ...actions);
                break;
            case 'medium':
                selection = await vscode.window.showWarningMessage(friendlyMessage, ...actions);
                break;
            case 'low':
                selection = await vscode.window.showInformationMessage(friendlyMessage, ...actions);
                break;
        }

        // Handle user selection
        if (selection) {
            await this.handleUserSelection(selection, errorLog, recoveryActions);
        }
    }

    private createFriendlyMessage(error: Error, severity: string): string {
        const message = error.message.toLowerCase();
        
        if (message.includes('no workspace')) {
            return 'Please open a folder in VS Code to use LumosGen';
        }
        
        if (message.includes('not a git repository')) {
            return 'This folder is not a Git repository. LumosGen needs Git for deployment.';
        }
        
        if (message.includes('permission denied')) {
            return 'Permission denied. Please check file permissions or run VS Code as administrator.';
        }
        
        if (message.includes('failed to push')) {
            return 'Failed to deploy to GitHub. Please check your Git credentials and repository access.';
        }
        
        if (message.includes('network') || message.includes('timeout')) {
            return 'Network error occurred. Please check your internet connection and try again.';
        }
        
        // Generic message based on severity
        switch (severity) {
            case 'critical':
                return 'A critical error occurred that prevents LumosGen from working properly.';
            case 'high':
                return 'An error occurred during the operation. Some features may not work correctly.';
            case 'medium':
                return 'A minor issue occurred. The operation may have completed partially.';
            default:
                return 'A minor issue was detected but shouldn\'t affect functionality.';
        }
    }

    private async handleUserSelection(
        selection: string,
        errorLog: ErrorLog,
        recoveryActions?: RecoveryAction[]
    ): Promise<void> {
        switch (selection) {
            case 'View Details':
                this.outputChannel.show();
                break;
                
            case 'Show Solutions':
                await this.showResolutionSteps(errorLog);
                break;
                
            case 'Try Recovery':
                if (recoveryActions) {
                    await this.showRecoveryOptions(recoveryActions);
                }
                break;
        }
    }

    private async showResolutionSteps(errorLog: ErrorLog): Promise<void> {
        if (!errorLog.resolutionSteps || errorLog.resolutionSteps.length === 0) {
            vscode.window.showInformationMessage('No specific resolution steps available.');
            return;
        }

        const steps = errorLog.resolutionSteps.map((step, index) => `${index + 1}. ${step}`).join('\n');
        const message = `Here are some steps to resolve this issue:\n\n${steps}`;
        
        vscode.window.showInformationMessage(message, 'Copy Steps', 'View Output').then(selection => {
            if (selection === 'Copy Steps') {
                vscode.env.clipboard.writeText(steps);
                vscode.window.showInformationMessage('Resolution steps copied to clipboard');
            } else if (selection === 'View Output') {
                this.outputChannel.show();
            }
        });
    }

    private async showRecoveryOptions(recoveryActions: RecoveryAction[]): Promise<void> {
        const actionLabels = recoveryActions.map(action => action.label);
        
        const selection = await vscode.window.showQuickPick(actionLabels, {
            placeHolder: 'Select a recovery action',
            ignoreFocusOut: true
        });

        if (selection) {
            const action = recoveryActions.find(a => a.label === selection);
            if (action) {
                try {
                    await action.action();
                    vscode.window.showInformationMessage(`Recovery action "${action.label}" completed successfully.`);
                } catch (error) {
                    vscode.window.showErrorMessage(`Recovery action failed: ${error}`);
                }
            }
        }
    }

    public getErrorLogs(): ErrorLog[] {
        return [...this.errorLogs];
    }

    public clearErrorLogs(): void {
        this.errorLogs = [];
    }

    public markErrorResolved(errorId: string): void {
        const errorLog = this.errorLogs.find(log => log.id === errorId);
        if (errorLog) {
            errorLog.resolved = true;
        }
    }
}
