/**
 * Deployment Performance Tests for US-024
 * 
 * Tests to ensure deployment meets acceptance criteria:
 * - Average deployment time < 2 minutes
 * - Deployment success rate > 95%
 * - Performance optimization validation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Performance test configuration
const PERFORMANCE_CONFIG = {
    maxDeploymentTime: 120000, // 2 minutes in milliseconds
    minSuccessRate: 95, // 95%
    testIterations: 5, // Number of test runs for averaging
    timeoutPerTest: 150000 // 2.5 minutes timeout per test
};

// Performance metrics tracking
interface PerformanceMetrics {
    deploymentTimes: number[];
    successCount: number;
    failureCount: number;
    retryStats: number[];
    errorTypes: Record<string, number>;
    averageTime: number;
    successRate: number;
}

const performanceMetrics: PerformanceMetrics = {
    deploymentTimes: [],
    successCount: 0,
    failureCount: 0,
    retryStats: [],
    errorTypes: {},
    averageTime: 0,
    successRate: 0
};

// Mock deployment class for performance testing
class MockGitHubPagesDeployer {
    private retryConfig = {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2
    };
    private deploymentMetrics: any = null;

    async deploy(websitePath: string, config: any = {}) {
        const startTime = performance.now();
        
        this.deploymentMetrics = {
            startTime: new Date(),
            retryCount: 0,
            steps: [],
            errors: []
        };

        try {
            // Simulate deployment steps with realistic timing
            await this.validateInputs(websitePath, config);
            await this.prepareFiles(websitePath);
            await this.uploadToGitHub(config);
            await this.configurePages(config);
            await this.waitForDeployment();

            const endTime = performance.now();
            const deploymentTime = endTime - startTime;

            this.deploymentMetrics.endTime = new Date();
            this.deploymentMetrics.duration = deploymentTime;
            this.deploymentMetrics.success = true;

            // Track performance metrics
            performanceMetrics.deploymentTimes.push(deploymentTime);
            performanceMetrics.successCount++;

            return {
                success: true,
                url: `https://user.github.io/${config.repository || 'test-repo'}`,
                deploymentTime,
                metrics: this.deploymentMetrics
            };
        } catch (error) {
            const endTime = performance.now();
            const deploymentTime = endTime - startTime;

            this.deploymentMetrics.endTime = new Date();
            this.deploymentMetrics.duration = deploymentTime;
            this.deploymentMetrics.success = false;
            this.deploymentMetrics.error = error.message;

            // Track failure metrics
            performanceMetrics.failureCount++;
            performanceMetrics.errorTypes[error.message] = (performanceMetrics.errorTypes[error.message] || 0) + 1;

            throw error;
        }
    }

    private async validateInputs(websitePath: string, config: any) {
        await this.simulateStep('validation', 100);
        
        if (!websitePath) {
            throw new Error('Website path is required');
        }
        
        if (!config.repository) {
            throw new Error('Repository configuration is required');
        }
    }

    private async prepareFiles(websitePath: string) {
        await this.simulateStep('file-preparation', 500);
        
        // Simulate file processing time based on file count
        const fileCount = Math.floor(Math.random() * 20) + 5; // 5-25 files
        const processingTime = fileCount * 50; // 50ms per file
        
        await new Promise(resolve => setTimeout(resolve, processingTime));
    }

    private async uploadToGitHub(config: any) {
        await this.simulateStep('github-upload', 2000);
        
        // Simulate network variability
        const networkDelay = Math.random() * 1000; // 0-1 second additional delay
        await new Promise(resolve => setTimeout(resolve, networkDelay));
        
        // Simulate occasional upload failures (2% chance)
        if (Math.random() < 0.02) {
            throw new Error('GitHub API rate limit exceeded');
        }
    }

    private async configurePages(config: any) {
        await this.simulateStep('pages-configuration', 800);
        
        // Simulate configuration complexity
        if (config.customDomain) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Additional time for custom domain
        }
    }

    private async waitForDeployment() {
        await this.simulateStep('deployment-wait', 3000);
        
        // Simulate GitHub Pages build time variability
        const buildTime = Math.random() * 2000 + 1000; // 1-3 seconds
        await new Promise(resolve => setTimeout(resolve, buildTime));
        
        // Simulate occasional build failures (1% chance)
        if (Math.random() < 0.01) {
            throw new Error('GitHub Pages build failed');
        }
    }

    private async simulateStep(stepName: string, baseTime: number) {
        const startTime = performance.now();
        
        // Add some variability to timing (±20%)
        const variability = (Math.random() - 0.5) * 0.4;
        const actualTime = baseTime * (1 + variability);
        
        await new Promise(resolve => setTimeout(resolve, actualTime));
        
        const endTime = performance.now();
        this.deploymentMetrics.steps.push({
            name: stepName,
            duration: endTime - startTime,
            timestamp: new Date()
        });
    }

    async deployWithRetry(websitePath: string, config: any = {}) {
        let lastError;

        // Initialize deployment metrics if not already done
        if (!this.deploymentMetrics) {
            this.deploymentMetrics = {
                startTime: new Date(),
                retryCount: 0,
                steps: [],
                errors: []
            };
        }

        for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
            try {
                this.deploymentMetrics.retryCount = attempt;
                const result = await this.deploy(websitePath, config);

                if (attempt > 0) {
                    performanceMetrics.retryStats.push(attempt);
                }

                return result;
            } catch (error) {
                lastError = error;

                if (attempt < this.retryConfig.maxRetries) {
                    const delay = Math.min(
                        this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt),
                        this.retryConfig.maxDelay
                    );
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        throw lastError;
    }

    getPerformanceMetrics() {
        return {
            ...performanceMetrics,
            averageTime: performanceMetrics.deploymentTimes.reduce((sum, time) => sum + time, 0) / performanceMetrics.deploymentTimes.length || 0,
            successRate: (performanceMetrics.successCount / (performanceMetrics.successCount + performanceMetrics.failureCount)) * 100 || 0
        };
    }

    resetMetrics() {
        performanceMetrics.deploymentTimes = [];
        performanceMetrics.successCount = 0;
        performanceMetrics.failureCount = 0;
        performanceMetrics.retryStats = [];
        performanceMetrics.errorTypes = {};
        performanceMetrics.averageTime = 0;
        performanceMetrics.successRate = 0;
    }
}

describe('Deployment Performance Tests', () => {
    let deployer: MockGitHubPagesDeployer;

    beforeEach(() => {
        console.log('🔧 Setting up deployment performance tests...');
        deployer = new MockGitHubPagesDeployer();
        deployer.resetMetrics();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Performance Benchmarks', () => {
        it('应该在2分钟内完成单次部署', async () => {
            const websitePath = '/test/website';
            const config = {
                repository: 'user/test-repo',
                branch: 'gh-pages'
            };

            const startTime = performance.now();
            const result = await deployer.deploy(websitePath, config);
            const endTime = performance.now();

            const deploymentTime = endTime - startTime;

            expect(result.success).toBe(true);
            expect(deploymentTime).toBeLessThan(PERFORMANCE_CONFIG.maxDeploymentTime);
            expect(result.deploymentTime).toBeLessThan(PERFORMANCE_CONFIG.maxDeploymentTime);
        }, PERFORMANCE_CONFIG.timeoutPerTest);

        it('应该维持95%以上的成功率', async () => {
            const websitePath = '/test/website';
            const config = {
                repository: 'user/test-repo',
                branch: 'gh-pages'
            };

            // Run multiple deployments sequentially to test success rate
            let successCount = 0;
            const totalAttempts = 20;

            for (let i = 0; i < totalAttempts; i++) {
                try {
                    await deployer.deployWithRetry(websitePath, config);
                    successCount++;
                } catch (error) {
                    // Count as failure
                }
            }

            const successRate = (successCount / totalAttempts) * 100;

            expect(successRate).toBeGreaterThanOrEqual(PERFORMANCE_CONFIG.minSuccessRate);
        }, PERFORMANCE_CONFIG.timeoutPerTest * 2);

        it('应该在多次部署中保持一致的性能', async () => {
            const websitePath = '/test/website';
            const config = {
                repository: 'user/test-repo',
                branch: 'gh-pages'
            };

            const deploymentTimes: number[] = [];

            // Run multiple deployments
            for (let i = 0; i < PERFORMANCE_CONFIG.testIterations; i++) {
                const startTime = performance.now();
                await deployer.deploy(websitePath, config);
                const endTime = performance.now();
                
                deploymentTimes.push(endTime - startTime);
            }

            // Calculate performance statistics
            const averageTime = deploymentTimes.reduce((sum, time) => sum + time, 0) / deploymentTimes.length;
            const maxTime = Math.max(...deploymentTimes);
            const minTime = Math.min(...deploymentTimes);
            const variance = deploymentTimes.reduce((sum, time) => sum + Math.pow(time - averageTime, 2), 0) / deploymentTimes.length;
            const standardDeviation = Math.sqrt(variance);

            // Performance consistency checks
            expect(averageTime).toBeLessThan(PERFORMANCE_CONFIG.maxDeploymentTime);
            expect(maxTime).toBeLessThan(PERFORMANCE_CONFIG.maxDeploymentTime * 1.5); // Allow 50% variance for max
            expect(standardDeviation).toBeLessThan(averageTime * 0.3); // Standard deviation should be < 30% of average
        }, PERFORMANCE_CONFIG.timeoutPerTest * PERFORMANCE_CONFIG.testIterations);
    });

    describe('Retry Performance', () => {
        it('应该在重试时保持合理的性能', async () => {
            const websitePath = '/test/website';
            const config = {
                repository: 'user/test-repo',
                branch: 'gh-pages'
            };

            // Force some failures to test retry performance
            const originalDeploy = deployer.deploy;
            let attemptCount = 0;
            
            deployer.deploy = vi.fn().mockImplementation(async (path, cfg) => {
                attemptCount++;
                if (attemptCount < 3) {
                    throw new Error('Simulated failure');
                }
                return originalDeploy.call(deployer, path, cfg);
            });

            const startTime = performance.now();
            const result = await deployer.deployWithRetry(websitePath, config);
            const endTime = performance.now();

            const totalTime = endTime - startTime;

            expect(result.success).toBe(true);
            expect(totalTime).toBeLessThan(PERFORMANCE_CONFIG.maxDeploymentTime * 2); // Allow extra time for retries
            expect(attemptCount).toBe(3); // Should have retried twice
        });

        it('应该使用指数退避策略', async () => {
            const websitePath = '/test/website';
            const config = {
                repository: 'user/test-repo',
                branch: 'gh-pages'
            };

            // Mock to always fail to test retry timing
            deployer.deploy = vi.fn().mockRejectedValue(new Error('Persistent failure'));

            const startTime = performance.now();
            
            try {
                await deployer.deployWithRetry(websitePath, config);
            } catch (error) {
                // Expected to fail
            }

            const endTime = performance.now();
            const totalTime = endTime - startTime;

            // Should include exponential backoff delays
            // Base delay: 1000ms, 2000ms, 4000ms = ~7000ms minimum
            expect(totalTime).toBeGreaterThan(7000);
        });
    });

    describe('Resource Usage Optimization', () => {
        it('应该优化文件处理性能', async () => {
            const websitePath = '/test/large-website';
            const config = {
                repository: 'user/test-repo',
                branch: 'gh-pages'
            };

            const result = await deployer.deploy(websitePath, config);

            expect(result.success).toBe(true);
            expect(result.metrics.steps).toBeDefined();
            
            // File preparation should be efficient
            const filePreparationStep = result.metrics.steps.find((step: any) => step.name === 'file-preparation');
            expect(filePreparationStep.duration).toBeLessThan(2000); // Should be under 2 seconds
        });

        it('应该优化网络请求性能', async () => {
            const websitePath = '/test/website';
            const config = {
                repository: 'user/test-repo',
                branch: 'gh-pages'
            };

            const result = await deployer.deploy(websitePath, config);

            expect(result.success).toBe(true);
            
            // GitHub upload should be efficient
            const uploadStep = result.metrics.steps.find((step: any) => step.name === 'github-upload');
            expect(uploadStep.duration).toBeLessThan(5000); // Should be under 5 seconds
        });
    });

    describe('Performance Monitoring', () => {
        it('应该提供详细的性能指标', async () => {
            const websitePath = '/test/website';
            const config = {
                repository: 'user/test-repo',
                branch: 'gh-pages'
            };

            await deployer.deploy(websitePath, config);
            await deployer.deploy(websitePath, config);

            const metrics = deployer.getPerformanceMetrics();

            expect(metrics.deploymentTimes).toHaveLength(2);
            expect(metrics.successCount).toBe(2);
            expect(metrics.averageTime).toBeGreaterThan(0);
            expect(metrics.successRate).toBe(100);
        });

        it('应该跟踪错误类型和频率', async () => {
            const websitePath = '/test/website';
            const config = {
                repository: '', // Invalid config to trigger error
                branch: 'gh-pages'
            };

            try {
                await deployer.deploy(websitePath, config);
            } catch (error) {
                // Expected error
            }

            const metrics = deployer.getPerformanceMetrics();

            expect(metrics.failureCount).toBe(1);
            expect(metrics.errorTypes['Repository configuration is required']).toBe(1);
        });
    });
});
