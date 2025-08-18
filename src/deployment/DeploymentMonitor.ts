import * as vscode from 'vscode';
import * as https from 'https';
import { URL } from 'url';

export interface HealthCheckResult {
    url: string;
    status: 'healthy' | 'unhealthy' | 'unknown';
    responseTime: number;
    statusCode?: number;
    error?: string;
    timestamp: Date;
}

export interface DeploymentHealth {
    url: string;
    isHealthy: boolean;
    lastCheck: Date;
    uptime: number;
    averageResponseTime: number;
    checks: HealthCheckResult[];
}

export class DeploymentMonitor {
    private outputChannel: vscode.OutputChannel;
    private monitoredSites: Map<string, DeploymentHealth> = new Map();
    private monitoringInterval?: NodeJS.Timeout;
    private healthCheckCallbacks: ((health: DeploymentHealth) => void)[] = [];

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
    }

    public onHealthUpdate(callback: (health: DeploymentHealth) => void): void {
        this.healthCheckCallbacks.push(callback);
    }

    public startMonitoring(url: string, intervalMinutes: number = 5): void {
        this.outputChannel.appendLine(`Starting monitoring for: ${url}`);
        
        // Initialize health tracking
        if (!this.monitoredSites.has(url)) {
            this.monitoredSites.set(url, {
                url,
                isHealthy: false,
                lastCheck: new Date(),
                uptime: 0,
                averageResponseTime: 0,
                checks: []
            });
        }

        // Perform initial health check
        this.performHealthCheck(url);

        // Set up periodic monitoring
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

        this.monitoringInterval = setInterval(() => {
            this.performHealthCheck(url);
        }, intervalMinutes * 60 * 1000);
    }

    public stopMonitoring(): void {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = undefined;
        }
        this.outputChannel.appendLine('Deployment monitoring stopped');
    }

    public async performHealthCheck(url: string): Promise<HealthCheckResult> {
        const startTime = Date.now();
        const result: HealthCheckResult = {
            url,
            status: 'unknown',
            responseTime: 0,
            timestamp: new Date()
        };

        try {
            const response = await this.makeHttpRequest(url);
            const endTime = Date.now();
            
            result.responseTime = endTime - startTime;
            result.statusCode = response.statusCode;

            if (response.statusCode && response.statusCode >= 200 && response.statusCode < 400) {
                result.status = 'healthy';
            } else {
                result.status = 'unhealthy';
                result.error = `HTTP ${response.statusCode}`;
            }

        } catch (error) {
            const endTime = Date.now();
            result.responseTime = endTime - startTime;
            result.status = 'unhealthy';
            result.error = error instanceof Error ? error.message : String(error);
        }

        // Update health tracking
        this.updateHealthTracking(url, result);

        // Log result
        const statusIcon = result.status === 'healthy' ? '✅' : '❌';
        this.outputChannel.appendLine(
            `${statusIcon} Health check for ${url}: ${result.status} (${result.responseTime}ms)`
        );

        if (result.error) {
            this.outputChannel.appendLine(`   Error: ${result.error}`);
        }

        return result;
    }

    private async makeHttpRequest(url: string): Promise<{ statusCode?: number; data: string }> {
        return new Promise((resolve, reject) => {
            const parsedUrl = new URL(url);
            const options = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
                path: parsedUrl.pathname + parsedUrl.search,
                method: 'GET',
                timeout: 10000,
                headers: {
                    'User-Agent': 'LumosGen-Monitor/1.0'
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        data
                    });
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            req.end();
        });
    }

    private updateHealthTracking(url: string, result: HealthCheckResult): void {
        const health = this.monitoredSites.get(url);
        if (!health) return;

        // Add new check result
        health.checks.push(result);
        health.lastCheck = result.timestamp;

        // Keep only last 100 checks
        if (health.checks.length > 100) {
            health.checks = health.checks.slice(-100);
        }

        // Update health status
        health.isHealthy = result.status === 'healthy';

        // Calculate uptime (percentage of healthy checks)
        const healthyChecks = health.checks.filter(check => check.status === 'healthy').length;
        health.uptime = (healthyChecks / health.checks.length) * 100;

        // Calculate average response time
        const totalResponseTime = health.checks.reduce((sum, check) => sum + check.responseTime, 0);
        health.averageResponseTime = totalResponseTime / health.checks.length;

        // Notify callbacks
        this.healthCheckCallbacks.forEach(callback => callback(health));

        // Show notification for status changes
        this.checkForStatusChanges(url, health);
    }

    private checkForStatusChanges(url: string, health: DeploymentHealth): void {
        if (health.checks.length < 2) return;

        const currentStatus = health.checks[health.checks.length - 1].status;
        const previousStatus = health.checks[health.checks.length - 2].status;

        if (currentStatus !== previousStatus) {
            if (currentStatus === 'healthy') {
                vscode.window.showInformationMessage(
                    `✅ Website is back online: ${url}`,
                    'View Site'
                ).then(selection => {
                    if (selection === 'View Site') {
                        vscode.env.openExternal(vscode.Uri.parse(url));
                    }
                });
            } else {
                vscode.window.showWarningMessage(
                    `❌ Website appears to be down: ${url}`,
                    'Check Status'
                ).then(selection => {
                    if (selection === 'Check Status') {
                        this.showHealthReport(url);
                    }
                });
            }
        }
    }

    public getHealthStatus(url: string): DeploymentHealth | undefined {
        return this.monitoredSites.get(url);
    }

    public getAllHealthStatuses(): DeploymentHealth[] {
        return Array.from(this.monitoredSites.values());
    }

    public showHealthReport(url: string): void {
        const health = this.monitoredSites.get(url);
        if (!health) {
            vscode.window.showErrorMessage('No health data available for this URL');
            return;
        }

        const report = this.generateHealthReport(health);
        
        // Show in output channel
        this.outputChannel.clear();
        this.outputChannel.appendLine(report);
        this.outputChannel.show();

        // Also show summary in information message
        const summary = `${health.isHealthy ? '✅' : '❌'} ${url}\n` +
                       `Uptime: ${health.uptime.toFixed(1)}%\n` +
                       `Avg Response: ${health.averageResponseTime.toFixed(0)}ms\n` +
                       `Last Check: ${health.lastCheck.toLocaleString()}`;

        vscode.window.showInformationMessage(summary, 'View Full Report').then(selection => {
            if (selection === 'View Full Report') {
                this.outputChannel.show();
            }
        });
    }

    private generateHealthReport(health: DeploymentHealth): string {
        const report = [
            '='.repeat(60),
            `DEPLOYMENT HEALTH REPORT`,
            '='.repeat(60),
            `URL: ${health.url}`,
            `Status: ${health.isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`,
            `Uptime: ${health.uptime.toFixed(2)}%`,
            `Average Response Time: ${health.averageResponseTime.toFixed(0)}ms`,
            `Last Check: ${health.lastCheck.toLocaleString()}`,
            `Total Checks: ${health.checks.length}`,
            '',
            'RECENT CHECKS:',
            '-'.repeat(40)
        ];

        // Show last 10 checks
        const recentChecks = health.checks.slice(-10).reverse();
        for (const check of recentChecks) {
            const statusIcon = check.status === 'healthy' ? '✅' : '❌';
            const timestamp = check.timestamp.toLocaleTimeString();
            const responseTime = `${check.responseTime}ms`;
            const statusCode = check.statusCode ? ` (${check.statusCode})` : '';
            const error = check.error ? ` - ${check.error}` : '';
            
            report.push(`${statusIcon} ${timestamp} - ${responseTime}${statusCode}${error}`);
        }

        report.push('');
        report.push('='.repeat(60));

        return report.join('\n');
    }

    public dispose(): void {
        this.stopMonitoring();
        this.monitoredSites.clear();
        this.healthCheckCallbacks = [];
    }
}
