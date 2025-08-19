"use strict";
/**
 * Context Engineering Usage Examples
 *
 * 演示如何使用上下文工程系统
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAllExamples = exports.incrementalUpdateDemo = exports.marketingReadinessAssessment = exports.fullContentWorkflow = exports.taskSpecificContext = exports.strategyComparison = exports.basicContextAnalysis = void 0;
const ContextEngineering_1 = require("../src/analysis/ContextEngineering");
const ContextSelector_1 = require("../src/analysis/ContextSelector");
// 模拟VS Code输出通道
const mockOutputChannel = {
    appendLine: (message) => console.log(`[LumosGen] ${message}`),
    append: (message) => console.log(message),
    clear: () => { },
    dispose: () => { },
    hide: () => { },
    show: () => { },
    name: 'LumosGen'
};
/**
 * 示例1: 基础上下文分析
 */
async function basicContextAnalysis() {
    console.log('🔍 示例1: 基础上下文分析');
    const engine = new ContextEngineering_1.ContextEngine(process.cwd(), mockOutputChannel, {
        analysisStrategy: 'balanced',
        enableCaching: true,
        defaultContentType: 'marketing-content'
    });
    try {
        const result = await engine.analyzeProject();
        console.log('📊 分析结果:');
        console.log(`- 处理文档数: ${result.performance.documentsProcessed}`);
        console.log(`- 使用Token数: ${result.performance.tokensUsed}`);
        console.log(`- 分析耗时: ${result.performance.analysisTime}ms`);
        console.log(`- 平均文档优先级: ${result.analysis.fullText.averagePriority}`);
        console.log('\n💡 内容机会:');
        result.recommendations.contentOpportunities.forEach(opp => console.log(`  - ${opp}`));
        console.log('\n🔧 改进建议:');
        result.recommendations.improvementSuggestions.forEach(suggestion => console.log(`  - ${suggestion}`));
        return result;
    }
    catch (error) {
        console.error('❌ 分析失败:', error);
        throw error;
    }
}
exports.basicContextAnalysis = basicContextAnalysis;
/**
 * 示例2: 不同策略对比
 */
async function strategyComparison() {
    console.log('\n🔍 示例2: 不同策略对比');
    const engine = new ContextEngineering_1.ContextEngine(process.cwd(), mockOutputChannel);
    const strategies = ['minimal', 'balanced', 'comprehensive'];
    for (const strategy of strategies) {
        console.log(`\n📋 测试策略: ${strategy}`);
        try {
            const result = await engine.analyzeProject(strategy);
            console.log(`  - 文档数: ${result.performance.documentsProcessed}`);
            console.log(`  - Token数: ${result.performance.tokensUsed}`);
            console.log(`  - 耗时: ${result.performance.analysisTime}ms`);
            console.log(`  - 文档类别: ${Object.keys(result.analysis.fullText.categories).length}`);
        }
        catch (error) {
            console.error(`  ❌ ${strategy} 策略失败:`, error);
        }
    }
}
exports.strategyComparison = strategyComparison;
/**
 * 示例3: 特定任务的上下文选择
 */
async function taskSpecificContext() {
    console.log('\n🔍 示例3: 特定任务的上下文选择');
    const engine = new ContextEngineering_1.ContextEngine(process.cwd(), mockOutputChannel);
    const selector = new ContextSelector_1.ContextSelector();
    // 先进行项目分析
    const analysisResult = await engine.analyzeProject('comprehensive');
    const analysis = analysisResult.analysis;
    const taskTypes = [
        'marketing-content',
        'technical-docs',
        'api-documentation',
        'user-guide',
        'readme-enhancement'
    ];
    console.log('\n📋 不同任务类型的上下文选择:');
    for (const taskType of taskTypes) {
        const context = selector.selectContext(analysis, taskType);
        console.log(`\n${taskType}:`);
        console.log(`  - 选择文档数: ${context.selectedFiles.length}`);
        console.log(`  - 总Token数: ${context.totalTokens}`);
        console.log(`  - 选择原因: ${context.selectionReason}`);
        console.log(`  - 文档类别: ${context.selectedFiles.map(f => f.category).join(', ')}`);
    }
}
exports.taskSpecificContext = taskSpecificContext;
/**
 * 示例4: 完整的内容生成工作流
 */
async function fullContentWorkflow() {
    console.log('\n🔍 示例4: 完整的内容生成工作流');
    const engine = new ContextEngineering_1.ContextEngine(process.cwd(), mockOutputChannel, {
        analysisStrategy: 'balanced',
        defaultContentType: 'marketing-content',
        defaultAudience: 'developers and technical teams',
        defaultTone: 'professional yet approachable'
    });
    // 初始化工作流
    engine.initializeWorkflow(process.cwd(), undefined, {
        contextStrategy: 'balanced',
        enableCaching: true,
        maxRetries: 2
    });
    try {
        console.log('🚀 执行完整工作流...');
        const result = await engine.executeFullWorkflow(process.cwd(), 'marketing-content', {
            changedFiles: [],
            buildWebsite: false
        });
        console.log('\n✅ 工作流完成!');
        console.log(`📊 性能指标:`);
        console.log(`  - 总耗时: ${result.performance.totalTime}ms`);
        console.log(`  - 分析文档数: ${result.performance.documentsAnalyzed}`);
        console.log(`  - 使用Token数: ${result.performance.totalTokens}`);
        console.log(`\n🎯 质量指标:`);
        console.log(`  - 分析置信度: ${result.quality.analysisConfidence}%`);
        console.log(`  - 策略置信度: ${result.quality.strategyConfidence}%`);
        console.log(`  - 内容质量: ${result.quality.contentQuality}%`);
        if (result.generatedContent) {
            console.log(`\n📝 生成的内容:`);
            console.log(`  - 标题: ${result.generatedContent.headline || '未生成'}`);
            console.log(`  - 副标题: ${result.generatedContent.subheadline || '未生成'}`);
            console.log(`  - 功能数: ${result.generatedContent.features?.length || 0}`);
            console.log(`  - 技术准确性: ${result.generatedContent.contentAnalysis?.technicalAccuracy || 0}%`);
        }
        return result;
    }
    catch (error) {
        console.error('❌ 工作流失败:', error);
        throw error;
    }
}
exports.fullContentWorkflow = fullContentWorkflow;
/**
 * 示例5: 营销准备度评估
 */
async function marketingReadinessAssessment() {
    console.log('\n🔍 示例5: 营销准备度评估');
    const engine = new ContextEngineering_1.ContextEngine(process.cwd(), mockOutputChannel);
    try {
        const assessment = await engine.assessMarketingReadiness();
        console.log(`\n📊 营销准备度评分: ${assessment.score}/100`);
        if (assessment.strengths.length > 0) {
            console.log('\n💪 优势:');
            assessment.strengths.forEach(strength => console.log(`  ✅ ${strength}`));
        }
        if (assessment.weaknesses.length > 0) {
            console.log('\n⚠️ 不足:');
            assessment.weaknesses.forEach(weakness => console.log(`  ❌ ${weakness}`));
        }
        if (assessment.recommendations.length > 0) {
            console.log('\n💡 建议:');
            assessment.recommendations.forEach(rec => console.log(`  🔧 ${rec}`));
        }
        return assessment;
    }
    catch (error) {
        console.error('❌ 评估失败:', error);
        throw error;
    }
}
exports.marketingReadinessAssessment = marketingReadinessAssessment;
/**
 * 示例6: 增量更新演示
 */
async function incrementalUpdateDemo() {
    console.log('\n🔍 示例6: 增量更新演示');
    const workflow = new EnhancedLumosGenWorkflow(process.cwd(), mockOutputChannel, undefined, {
        contextStrategy: 'balanced',
        enableCaching: true
    });
    try {
        // 初始分析
        console.log('📊 执行初始分析...');
        const initialResult = await workflow.executeEnhancedWorkflow(process.cwd(), 'marketing-content');
        console.log(`初始分析完成: ${initialResult.performance.documentsAnalyzed} 文档`);
        // 模拟文件变更
        const changedFiles = ['README.md', 'package.json'];
        console.log(`\n🔄 模拟文件变更: ${changedFiles.join(', ')}`);
        // 增量更新
        const updateResult = await workflow.updateWithChanges(changedFiles, initialResult.projectAnalysis);
        console.log(`增量更新完成: ${updateResult.performance.totalTime}ms`);
        console.log(`缓存命中: ${updateResult.performance.cacheHits} 次`);
        return { initialResult, updateResult };
    }
    catch (error) {
        console.error('❌ 增量更新失败:', error);
        throw error;
    }
}
exports.incrementalUpdateDemo = incrementalUpdateDemo;
/**
 * 运行所有示例
 */
async function runAllExamples() {
    console.log('🚀 开始运行增强上下文工程示例\n');
    try {
        await basicContextAnalysis();
        await strategyComparison();
        await taskSpecificContext();
        await fullContentWorkflow();
        await marketingReadinessAssessment();
        await incrementalUpdateDemo();
        console.log('\n🎉 所有示例运行完成!');
    }
    catch (error) {
        console.error('\n💥 示例运行失败:', error);
    }
}
exports.runAllExamples = runAllExamples;
// 如果直接运行此文件
if (require.main === module) {
    runAllExamples().catch(console.error);
}
//# sourceMappingURL=enhanced-context-usage.js.map