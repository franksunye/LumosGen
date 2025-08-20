/**
 * AI服务单元测试
 * 测试AI服务提供商的核心功能
 */

const { TestUtils, TestAssertions } = require('../test-config');

// Mock AI服务提供商
class MockAIServiceProvider {
    constructor(config = {}) {
        this.config = {
            responseDelay: config.responseDelay || 100,
            errorRate: config.errorRate || 0,
            simulateErrors: config.simulateErrors || false,
            ...config
        };
        this.requestCount = 0;
        this.totalTokens = 0;
        this.totalCost = 0;
    }

    async generateContent(prompt, options = {}) {
        this.requestCount++;
        
        // 模拟网络延迟
        await TestUtils.sleep(this.config.responseDelay);
        
        // 模拟错误
        if (this.config.simulateErrors && Math.random() < this.config.errorRate) {
            throw new Error('Simulated AI service error');
        }
        
        // 模拟token使用和成本
        const estimatedTokens = prompt.length / 4; // 粗略估算
        this.totalTokens += estimatedTokens;
        this.totalCost += estimatedTokens * 0.0001; // 模拟成本
        
        // 生成模拟响应
        const response = {
            content: `Generated content for: ${prompt.substring(0, 50)}...`,
            tokens: estimatedTokens,
            cost: estimatedTokens * 0.0001,
            provider: 'mock',
            model: 'mock-model',
            timestamp: new Date().toISOString()
        };
        
        return response;
    }

    getUsageStats() {
        return {
            requestCount: this.requestCount,
            totalTokens: this.totalTokens,
            totalCost: this.totalCost,
            averageTokensPerRequest: this.requestCount > 0 ? this.totalTokens / this.requestCount : 0
        };
    }

    reset() {
        this.requestCount = 0;
        this.totalTokens = 0;
        this.totalCost = 0;
    }
}

// 智能降级策略测试
class MockDegradationStrategy {
    constructor(providers) {
        this.providers = providers;
        this.currentProviderIndex = 0;
        this.failureCount = new Map();
    }

    async executeWithDegradation(prompt, options = {}) {
        let lastError;
        
        for (let i = 0; i < this.providers.length; i++) {
            const provider = this.providers[i];
            const providerName = provider.constructor.name;
            
            try {
                const result = await provider.generateContent(prompt, options);
                
                // 重置失败计数
                this.failureCount.set(providerName, 0);
                
                return {
                    ...result,
                    usedProvider: providerName,
                    attemptNumber: i + 1
                };
                
            } catch (error) {
                lastError = error;
                
                // 增加失败计数
                const currentFailures = this.failureCount.get(providerName) || 0;
                this.failureCount.set(providerName, currentFailures + 1);
                
                console.log(`Provider ${providerName} failed (attempt ${i + 1}): ${error.message}`);
            }
        }
        
        throw new Error(`All providers failed. Last error: ${lastError.message}`);
    }

    getFailureStats() {
        return Object.fromEntries(this.failureCount);
    }
}

// 测试套件
const aiServiceTests = {
    async setup() {
        this.mockProvider = new MockAIServiceProvider();
        this.errorProvider = new MockAIServiceProvider({
            simulateErrors: true,
            errorRate: 1.0 // 100% 错误率
        });
        this.slowProvider = new MockAIServiceProvider({
            responseDelay: 2000
        });
    },

    async testBasicContentGeneration() {
        const prompt = "Generate a marketing description for a JavaScript library";
        const result = await this.mockProvider.generateContent(prompt);

        TestAssertions.assertTrue(result.content.length > 0, 'Content should not be empty');
        TestAssertions.assertEqual(result.provider, 'mock', 'Provider should be mock');
        TestAssertions.assertTrue(result.tokens > 0, 'Tokens should be positive');
        TestAssertions.assertTrue(result.cost >= 0, 'Cost should be non-negative');
        TestAssertions.assertContains(result.content, 'Generated content for:', 'Content should contain expected prefix');
    },

    async testUsageStatistics() {
        this.mockProvider.reset();
        
        // 生成几个请求
        await this.mockProvider.generateContent("Test prompt 1");
        await this.mockProvider.generateContent("Test prompt 2");
        await this.mockProvider.generateContent("Test prompt 3");
        
        const stats = this.mockProvider.getUsageStats();
        
        TestAssertions.assertEqual(stats.requestCount, 3, 'Request count should be 3');
        TestAssertions.assertTrue(stats.totalTokens > 0, 'Total tokens should be positive');
        TestAssertions.assertTrue(stats.totalCost > 0, 'Total cost should be positive');
        TestAssertions.assertTrue(stats.averageTokensPerRequest > 0, 'Average tokens should be positive');
    },

    async testErrorHandling() {
        await TestAssertions.assertThrowsAsync(
            () => this.errorProvider.generateContent("This will fail"),
            Error,
            'Error provider should throw an error'
        );
    },

    async testResponseTiming() {
        const startTime = Date.now();
        await this.mockProvider.generateContent("Test timing");
        const duration = Date.now() - startTime;
        
        TestAssertions.assertBetween(duration, 90, 200, 'Response time should be within expected range');
    },

    async testDegradationStrategy() {
        const workingProvider = new MockAIServiceProvider();
        const failingProvider = new MockAIServiceProvider({ simulateErrors: true, errorRate: 1.0 });
        
        const strategy = new MockDegradationStrategy([failingProvider, workingProvider]);
        
        const result = await strategy.executeWithDegradation("Test degradation");
        
        TestAssertions.assertEqual(result.usedProvider, 'MockAIServiceProvider', 'Should use working provider');
        TestAssertions.assertEqual(result.attemptNumber, 2, 'Should be second attempt');
        TestAssertions.assertTrue(result.content.length > 0, 'Should generate content');
    },

    async testAllProvidersFail() {
        const failingProvider1 = new MockAIServiceProvider({ simulateErrors: true, errorRate: 1.0 });
        const failingProvider2 = new MockAIServiceProvider({ simulateErrors: true, errorRate: 1.0 });
        
        const strategy = new MockDegradationStrategy([failingProvider1, failingProvider2]);
        
        await TestAssertions.assertThrowsAsync(
            () => strategy.executeWithDegradation("This will fail"),
            Error,
            'Should throw error when all providers fail'
        );
    },

    async testConcurrentRequests() {
        const promises = [];
        const requestCount = 5;
        
        for (let i = 0; i < requestCount; i++) {
            promises.push(this.mockProvider.generateContent(`Concurrent request ${i}`));
        }
        
        const results = await Promise.all(promises);
        
        TestAssertions.assertEqual(results.length, requestCount, 'Should handle all concurrent requests');
        
        for (let i = 0; i < results.length; i++) {
            TestAssertions.assertTrue(results[i].content.length > 0, `Request ${i} should have content`);
            TestAssertions.assertContains(results[i].content, `Concurrent request ${i}`, `Request ${i} should contain correct prompt`);
        }
    },

    async testLongPrompt() {
        const longPrompt = 'A'.repeat(10000); // 10K字符的长提示
        const result = await this.mockProvider.generateContent(longPrompt);
        
        TestAssertions.assertTrue(result.content.length > 0, 'Should handle long prompts');
        TestAssertions.assertTrue(result.tokens > 1000, 'Long prompt should use many tokens');
    },

    async testEmptyPrompt() {
        const result = await this.mockProvider.generateContent("");
        
        TestAssertions.assertTrue(result.content.length > 0, 'Should handle empty prompts');
        TestAssertions.assertTrue(result.tokens >= 0, 'Empty prompt should have non-negative tokens');
    },

    async testProviderConfiguration() {
        const customProvider = new MockAIServiceProvider({
            responseDelay: 50,
            errorRate: 0.1,
            simulateErrors: true
        });
        
        TestAssertions.assertEqual(customProvider.config.responseDelay, 50, 'Should use custom response delay');
        TestAssertions.assertEqual(customProvider.config.errorRate, 0.1, 'Should use custom error rate');
        TestAssertions.assertTrue(customProvider.config.simulateErrors, 'Should enable error simulation');
    },

    async teardown() {
        // 清理资源
        if (this.mockProvider) {
            this.mockProvider.reset();
        }
    }
};

module.exports = aiServiceTests;
