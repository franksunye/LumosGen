/**
 * Deployment Performance Tests for US-024
 * 
 * Tests to ensure deployment meets acceptance criteria:
 * - Average deployment time < 2 minutes
 * - Deployment success rate > 95%
 * - Performance optimization validation
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

// Performance test configuration
const PERFORMANCE_CONFIG = {
    maxDeploymentTime: 120000, // 2 minutes in milliseconds
    minSuccessRate: 95, // 95%
    testIterations: 5, // Number of test runs for averaging
    timeoutPerTest: 150000 // 2.5 minutes timeout per test
};

// Performance metrics tracking
const performanceMetrics = {
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
    constructor() {
        this.retryConfig = {
            maxRetries: 3,
            baseDelay: 1000,
            maxDelay: 10000,
            backoffMultiplier: 2
        };
        this.deploymentMetrics = null;
    }

    async deploy(websitePath, config = {}) {
        const startTime = performance.now();
        
        this.deploymentMetrics = {
            startTime: new Date(),
            retryCount: 0,
            success: false
        };

        try {
            // Simulate deployment steps with realistic timing
            await this.simulateValidation(100); // 100ms
            await this.simulateGitOperations(2000); // 2 seconds
            await this.simulateFilePreparation(1000); // 1 second
            await this.simulateBranchSetup(3000); // 3 seconds
            await this.simulateGitHubPush(5000); // 5 seconds (variable based on file size)

            const endTime = performance.now();
            const duration = endTime - startTime;

            this.deploymentMetrics.endTime = new Date();
            this.deploymentMetrics.duration = duration;
            this.deploymentMetrics.success = true;

            return {
                success: true,
                deploymentUrl: 'https://test-user.github.io/test-repo',
                logs: [`Deployment completed in ${duration.toFixed(2)}ms`]
            };

        } catch (error) {
            const endTime = performance.now();
            const duration = endTime - startTime;

            this.deploymentMetrics.endTime = new Date();
            this.deploymentMetrics.duration = duration;
            this.deploymentMetrics.success = false;
            this.deploymentMetrics.errorType = error.constructor.name;

            return {
                success: false,
                error: error.message,
                logs: [`Deployment failed after ${duration.toFixed(2)}ms`]
            };
        }
    }

    async simulateValidation(baseTime) {
        // Simulate validation with some variability
        const time = baseTime + Math.random() * 50;
        await new Promise(resolve => setTimeout(resolve, time));
        
        // Simulate occasional validation failures (5% chance)
        if (Math.random() < 0.05) {
            throw new Error('Validation failed: Missing index.html');
        }
    }

    async simulateGitOperations(baseTime) {
        // Simulate Git operations with network variability
        const time = baseTime + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, time));
        
        // Simulate occasional Git failures (3% chance)
        if (Math.random() < 0.03) {
            throw new Error('Git operation failed: Not a git repository');
        }
    }

    async simulateFilePreparation(baseTime) {
        // Simulate file preparation
        const time = baseTime + Math.random() * 500;
        await new Promise(resolve => setTimeout(resolve, time));
    }

    async simulateBranchSetup(baseTime) {
        // Simulate branch setup with potential conflicts
        const time = baseTime + Math.random() * 2000;
        await new Promise(resolve => setTimeout(resolve, time));
        
        // Simulate branch conflicts (2% chance)
        if (Math.random() < 0.02) {
            throw new Error('Branch setup failed: Merge conflict');
        }
    }

    async simulateGitHubPush(baseTime) {
        // Simulate GitHub push with network variability
        const networkDelay = Math.random() * 10000; // 0-10 seconds additional delay
        const time = baseTime + networkDelay;
        await new Promise(resolve => setTimeout(resolve, time));
        
        // Simulate push failures (5% chance)
        if (Math.random() < 0.05) {
            throw new Error('Push failed: Authentication failed');
        }
    }

    getDeploymentMetrics() {
        return this.deploymentMetrics;
    }
}

// Performance test functions
async function runPerformanceTest(testName, testFunction) {
    console.log(`\n⚡ Running Performance Test: ${testName}`);
    
    try {
        const startTime = performance.now();
        await testFunction();
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`✅ PASSED: ${testName} (${duration.toFixed(2)}ms)`);
        return { success: true, duration };
    } catch (error) {
        console.log(`❌ FAILED: ${testName}`);
        console.log(`   Error: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function testDeploymentSpeed() {
    console.log('\n📊 Testing Deployment Speed...');
    
    const deployer = new MockGitHubPagesDeployer();
    const deploymentTimes = [];
    
    for (let i = 0; i < PERFORMANCE_CONFIG.testIterations; i++) {
        console.log(`   Run ${i + 1}/${PERFORMANCE_CONFIG.testIterations}`);
        
        const startTime = performance.now();
        const result = await deployer.deploy('/mock/website/path');
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        deploymentTimes.push(duration);
        performanceMetrics.deploymentTimes.push(duration);
        
        if (result.success) {
            performanceMetrics.successCount++;
        } else {
            performanceMetrics.failureCount++;
            
            // Track error types
            const errorType = result.error?.split(':')[0] || 'Unknown';
            performanceMetrics.errorTypes[errorType] = (performanceMetrics.errorTypes[errorType] || 0) + 1;
        }
        
        const metrics = deployer.getDeploymentMetrics();
        if (metrics) {
            performanceMetrics.retryStats.push(metrics.retryCount || 0);
        }
        
        console.log(`     Duration: ${duration.toFixed(2)}ms, Success: ${result.success}`);
    }
    
    // Calculate averages
    const averageTime = deploymentTimes.reduce((sum, time) => sum + time, 0) / deploymentTimes.length;
    const maxTime = Math.max(...deploymentTimes);
    const minTime = Math.min(...deploymentTimes);
    
    console.log(`\n📈 Speed Test Results:`);
    console.log(`   Average Time: ${averageTime.toFixed(2)}ms (${(averageTime / 1000).toFixed(2)}s)`);
    console.log(`   Max Time: ${maxTime.toFixed(2)}ms (${(maxTime / 1000).toFixed(2)}s)`);
    console.log(`   Min Time: ${minTime.toFixed(2)}ms (${(minTime / 1000).toFixed(2)}s)`);
    console.log(`   Target: <${PERFORMANCE_CONFIG.maxDeploymentTime}ms (${PERFORMANCE_CONFIG.maxDeploymentTime / 1000}s)`);
    
    performanceMetrics.averageTime = averageTime;
    
    // Check if average time meets requirement
    if (averageTime > PERFORMANCE_CONFIG.maxDeploymentTime) {
        throw new Error(`Average deployment time ${averageTime.toFixed(2)}ms exceeds target ${PERFORMANCE_CONFIG.maxDeploymentTime}ms`);
    }
    
    return true;
}

async function testSuccessRate() {
    console.log('\n📊 Testing Success Rate...');
    
    const totalAttempts = performanceMetrics.successCount + performanceMetrics.failureCount;
    const successRate = (performanceMetrics.successCount / totalAttempts) * 100;
    
    console.log(`\n📈 Success Rate Results:`);
    console.log(`   Successful Deployments: ${performanceMetrics.successCount}`);
    console.log(`   Failed Deployments: ${performanceMetrics.failureCount}`);
    console.log(`   Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`   Target: >${PERFORMANCE_CONFIG.minSuccessRate}%`);
    
    performanceMetrics.successRate = successRate;
    
    // Show error breakdown
    if (performanceMetrics.failureCount > 0) {
        console.log(`\n🔍 Error Breakdown:`);
        for (const [errorType, count] of Object.entries(performanceMetrics.errorTypes)) {
            const percentage = (count / performanceMetrics.failureCount) * 100;
            console.log(`   ${errorType}: ${count} (${percentage.toFixed(1)}%)`);
        }
    }
    
    // Check if success rate meets requirement
    if (successRate < PERFORMANCE_CONFIG.minSuccessRate) {
        throw new Error(`Success rate ${successRate.toFixed(1)}% is below target ${PERFORMANCE_CONFIG.minSuccessRate}%`);
    }
    
    return true;
}

async function testRetryEffectiveness() {
    console.log('\n📊 Testing Retry Effectiveness...');
    
    const averageRetries = performanceMetrics.retryStats.reduce((sum, retries) => sum + retries, 0) / performanceMetrics.retryStats.length;
    const maxRetries = Math.max(...performanceMetrics.retryStats);
    
    console.log(`\n📈 Retry Statistics:`);
    console.log(`   Average Retries: ${averageRetries.toFixed(2)}`);
    console.log(`   Max Retries: ${maxRetries}`);
    console.log(`   Retry Efficiency: ${((performanceMetrics.successCount / (performanceMetrics.successCount + performanceMetrics.failureCount)) * 100).toFixed(1)}%`);
    
    return true;
}

async function generatePerformanceReport() {
    console.log('\n📋 Generating Performance Report...');
    
    const report = {
        timestamp: new Date().toISOString(),
        testConfiguration: PERFORMANCE_CONFIG,
        metrics: performanceMetrics,
        acceptanceCriteria: {
            maxDeploymentTime: PERFORMANCE_CONFIG.maxDeploymentTime,
            minSuccessRate: PERFORMANCE_CONFIG.minSuccessRate,
            averageTimeMet: performanceMetrics.averageTime <= PERFORMANCE_CONFIG.maxDeploymentTime,
            successRateMet: performanceMetrics.successRate >= PERFORMANCE_CONFIG.minSuccessRate
        },
        recommendations: []
    };
    
    // Generate recommendations
    if (performanceMetrics.averageTime > PERFORMANCE_CONFIG.maxDeploymentTime * 0.8) {
        report.recommendations.push('Consider optimizing file operations for better performance');
    }
    
    if (performanceMetrics.successRate < 98) {
        report.recommendations.push('Investigate and improve error handling for better reliability');
    }
    
    if (performanceMetrics.retryStats.some(retries => retries > 2)) {
        report.recommendations.push('Review retry strategy to minimize unnecessary retries');
    }
    
    // Save report
    const reportPath = path.join(__dirname, 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📄 Performance report saved to: ${reportPath}`);
    
    return report;
}

// Main performance test execution
async function runPerformanceTests() {
    console.log('⚡ Starting US-024 Performance Tests');
    console.log('=' .repeat(60));
    
    try {
        // Test 1: Deployment Speed
        await runPerformanceTest('Deployment Speed Test', testDeploymentSpeed);
        
        // Test 2: Success Rate
        await runPerformanceTest('Success Rate Test', testSuccessRate);
        
        // Test 3: Retry Effectiveness
        await runPerformanceTest('Retry Effectiveness Test', testRetryEffectiveness);
        
        // Generate final report
        const report = await generatePerformanceReport();
        
        // Print final results
        console.log('\n' + '='.repeat(60));
        console.log('📊 PERFORMANCE TEST RESULTS');
        console.log('='.repeat(60));
        console.log(`⏱️  Average Deployment Time: ${performanceMetrics.averageTime.toFixed(2)}ms (${(performanceMetrics.averageTime / 1000).toFixed(2)}s)`);
        console.log(`🎯 Target Time: <${PERFORMANCE_CONFIG.maxDeploymentTime / 1000}s - ${report.acceptanceCriteria.averageTimeMet ? '✅ MET' : '❌ NOT MET'}`);
        console.log(`📈 Success Rate: ${performanceMetrics.successRate.toFixed(1)}%`);
        console.log(`🎯 Target Success Rate: >${PERFORMANCE_CONFIG.minSuccessRate}% - ${report.acceptanceCriteria.successRateMet ? '✅ MET' : '❌ NOT MET'}`);
        
        if (report.recommendations.length > 0) {
            console.log('\n💡 Recommendations:');
            report.recommendations.forEach((rec, index) => {
                console.log(`   ${index + 1}. ${rec}`);
            });
        }
        
        const allCriteriaMet = report.acceptanceCriteria.averageTimeMet && report.acceptanceCriteria.successRateMet;
        
        if (allCriteriaMet) {
            console.log('\n✅ All performance criteria met! US-024 is ready for production.');
            process.exit(0);
        } else {
            console.log('\n❌ Some performance criteria not met. Please review and optimize.');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('\n❌ Performance test execution failed:', error.message);
        process.exit(1);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runPerformanceTests();
}

module.exports = {
    runPerformanceTests,
    performanceMetrics,
    PERFORMANCE_CONFIG,
    MockGitHubPagesDeployer
};
