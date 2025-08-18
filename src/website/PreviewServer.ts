import * as vscode from 'vscode';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import { t } from '../i18n';

export interface ServerConfig {
    port: number;
    host: string;
    openBrowser: boolean;
    liveReload: boolean;
}

export class PreviewServer {
    private server: http.Server | null = null;
    private outputChannel: vscode.OutputChannel;
    private config: ServerConfig;
    private watchers: fs.FSWatcher[] = [];

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
        this.config = {
            port: 3000,
            host: 'localhost',
            openBrowser: true,
            liveReload: true
        };
    }

    async start(websiteDir: string, config?: Partial<ServerConfig>): Promise<string> {
        if (this.server) {
            await this.stop();
        }

        this.config = { ...this.config, ...config };
        
        return new Promise((resolve, reject) => {
            this.server = http.createServer((req, res) => {
                this.handleRequest(req, res, websiteDir);
            });

            this.server.on('error', (error: any) => {
                if (error.code === 'EADDRINUSE') {
                    this.config.port++;
                    this.server?.listen(this.config.port, this.config.host);
                } else {
                    reject(error);
                }
            });

            this.server.listen(this.config.port, this.config.host, () => {
                const serverUrl = `http://${this.config.host}:${this.config.port}`;
                this.outputChannel.appendLine(`Preview server started at ${serverUrl}`);
                
                if (this.config.liveReload) {
                    this.setupLiveReload(websiteDir);
                }

                if (this.config.openBrowser) {
                    vscode.env.openExternal(vscode.Uri.parse(serverUrl));
                }

                resolve(serverUrl);
            });
        });
    }

    async stop(): Promise<void> {
        return new Promise((resolve) => {
            // Stop file watchers
            this.watchers.forEach(watcher => watcher.close());
            this.watchers = [];

            if (this.server) {
                this.server.close(() => {
                    this.server = null;
                    this.outputChannel.appendLine('Preview server stopped');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    private handleRequest(req: http.IncomingMessage, res: http.ServerResponse, websiteDir: string): void {
        const parsedUrl = url.parse(req.url || '/', true);
        let pathname = parsedUrl.pathname || '/';

        // Handle root path
        if (pathname === '/') {
            pathname = '/index.html';
        }

        // Security: prevent directory traversal
        if (pathname.includes('..')) {
            this.sendError(res, 403, 'Forbidden');
            return;
        }

        const filePath = path.join(websiteDir, pathname);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            this.sendError(res, 404, 'Not Found');
            return;
        }

        // Get file stats
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            // Try to serve index.html from directory
            const indexPath = path.join(filePath, 'index.html');
            if (fs.existsSync(indexPath)) {
                this.serveFile(res, indexPath);
            } else {
                this.sendError(res, 404, 'Not Found');
            }
            return;
        }

        this.serveFile(res, filePath);
    }

    private serveFile(res: http.ServerResponse, filePath: string): void {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = this.getContentType(ext);

        fs.readFile(filePath, (err, data) => {
            if (err) {
                this.sendError(res, 500, 'Internal Server Error');
                return;
            }

            res.writeHead(200, {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            });

            // Inject live reload script for HTML files
            if (ext === '.html' && this.config.liveReload) {
                const htmlContent = data.toString();
                const liveReloadScript = this.getLiveReloadScript();
                const modifiedContent = htmlContent.replace('</body>', `${liveReloadScript}</body>`);
                res.end(modifiedContent);
            } else {
                res.end(data);
            }
        });
    }

    private sendError(res: http.ServerResponse, statusCode: number, message: string): void {
        res.writeHead(statusCode, { 'Content-Type': 'text/html' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Error ${statusCode}</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    h1 { color: #e74c3c; }
                </style>
            </head>
            <body>
                <h1>Error ${statusCode}</h1>
                <p>${message}</p>
                <p><a href="/">Go back to home</a></p>
            </body>
            </html>
        `);
    }

    private getContentType(ext: string): string {
        const mimeTypes: { [key: string]: string } = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.xml': 'application/xml',
            '.txt': 'text/plain'
        };

        return mimeTypes[ext] || 'application/octet-stream';
    }

    private setupLiveReload(websiteDir: string): void {
        if (!fs.existsSync(websiteDir)) {
            return;
        }

        const watcher = fs.watch(websiteDir, { recursive: true }, (eventType, filename) => {
            if (filename && (filename.endsWith('.html') || filename.endsWith('.css') || filename.endsWith('.js'))) {
                this.outputChannel.appendLine(`File changed: ${filename}`);
                // In a real implementation, you'd send a WebSocket message to reload the browser
                // For now, we just log the change
            }
        });

        this.watchers.push(watcher);
    }

    private getLiveReloadScript(): string {
        return `
        <script>
            // Simple live reload implementation
            (function() {
                let lastModified = Date.now();
                
                function checkForUpdates() {
                    fetch(window.location.href, { 
                        method: 'HEAD',
                        cache: 'no-cache'
                    })
                    .then(response => {
                        const modified = response.headers.get('last-modified');
                        if (modified && new Date(modified).getTime() > lastModified) {
                            window.location.reload();
                        }
                    })
                    .catch(() => {
                        // Ignore errors
                    });
                }
                
                // Check for updates every 2 seconds
                setInterval(checkForUpdates, 2000);
                
                console.log('Live reload enabled');
            })();
        </script>
        `;
    }

    getServerInfo(): { isRunning: boolean; url?: string; port?: number } {
        if (this.server && this.server.listening) {
            return {
                isRunning: true,
                url: `http://${this.config.host}:${this.config.port}`,
                port: this.config.port
            };
        }
        return { isRunning: false };
    }

    async getPerformanceMetrics(websiteDir: string): Promise<any> {
        if (!fs.existsSync(websiteDir)) {
            return null;
        }

        const metrics = {
            totalFiles: 0,
            totalSize: 0,
            htmlFiles: 0,
            cssFiles: 0,
            jsFiles: 0,
            imageFiles: 0,
            largestFile: { name: '', size: 0 }
        };

        const scanDirectory = (dir: string) => {
            const files = fs.readdirSync(dir);
            
            for (const file of files) {
                const filePath = path.join(dir, file);
                const stats = fs.statSync(filePath);
                
                if (stats.isDirectory()) {
                    scanDirectory(filePath);
                } else {
                    metrics.totalFiles++;
                    metrics.totalSize += stats.size;
                    
                    if (stats.size > metrics.largestFile.size) {
                        metrics.largestFile = { name: file, size: stats.size };
                    }
                    
                    const ext = path.extname(file).toLowerCase();
                    switch (ext) {
                        case '.html':
                            metrics.htmlFiles++;
                            break;
                        case '.css':
                            metrics.cssFiles++;
                            break;
                        case '.js':
                            metrics.jsFiles++;
                            break;
                        case '.png':
                        case '.jpg':
                        case '.jpeg':
                        case '.gif':
                        case '.svg':
                            metrics.imageFiles++;
                            break;
                    }
                }
            }
        };

        scanDirectory(websiteDir);
        return metrics;
    }
}
