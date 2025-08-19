# 增强上下文工程系统使用指南

## 🎯 概述

LumosGen的增强上下文工程系统实现了**规则与全文本平衡策略**，通过智能文档选择、多层次上下文分析和动态优化，为AI内容生成提供最优质的上下文信息。

## 🏗️ 系统架构

### 核心组件

```
用户请求 → ContextEngine → EnhancedProjectAnalyzer → ContextSelector → EnhancedAgents → 优质内容
    ↓           ↓                ↓                    ↓              ↓
配置管理    项目分析        智能文档选择        上下文优化      内容生成
```

### 三层上下文策略

1. **结构化数据层** - 规则提取的精确信息
   - 项目元数据 (package.json, Cargo.toml等)
   - 技术栈识别
   - 依赖关系分析
   - 脚本和配置信息

2. **半结构化文档层** - 可解析的重要文档
   - README.md (项目介绍)
   - CHANGELOG.md (版本历史)
   - USER_GUIDE.md (用户指南)
   - 主要技术文档

3. **全文本上下文层** - 所有markdown文件
   - 智能优先级排序
   - Token预算管理
   - 动态文档选择
   - 上下文压缩优化

## 🚀 快速开始

### 基础使用

```typescript
import { ContextEngine } from '../src/analysis/ContextEngineering';
import * as vscode from 'vscode';

// 创建上下文引擎
const engine = new ContextEngine(
    workspaceRoot,
    outputChannel,
    {
        analysisStrategy: 'balanced',  // minimal | balanced | comprehensive
        enableCaching: true,
        defaultContentType: 'marketing-content'
    }
);

// 执行项目分析
const result = await engine.analyzeProject();
console.log(`处理了 ${result.performance.documentsProcessed} 个文档`);
console.log(`使用了 ${result.performance.tokensUsed} 个tokens`);
```

### 完整工作流

```typescript
// 初始化工作流
engine.initializeWorkflow(workspaceRoot, aiService);

// 执行完整的内容生成
const workflowResult = await engine.executeFullWorkflow(
    projectPath,
    'marketing-content',
    {
        changedFiles: ['README.md'],
        buildWebsite: true
    }
);
```

## 📊 分析策略对比

| 策略 | 文档数量 | Token使用 | 分析深度 | 适用场景 |
|------|----------|-----------|----------|----------|
| **minimal** | 5-10个 | 2K-4K | 基础 | 快速预览、简单项目 |
| **balanced** | 10-20个 | 4K-8K | 中等 | 大多数项目、日常使用 |
| **comprehensive** | 20-50个 | 8K-16K | 深度 | 复杂项目、详细分析 |

## 🎯 任务类型与上下文选择

### 支持的任务类型

```typescript
type AITaskType = 
    | 'marketing-content'     // 营销内容生成
    | 'technical-docs'        // 技术文档生成
    | 'api-documentation'     // API文档生成
    | 'user-guide'           // 用户指南生成
    | 'changelog'            // 变更日志生成
    | 'readme-enhancement'   // README增强
    | 'project-analysis'     // 项目分析
    | 'feature-extraction'   // 特性提取
    | 'general';             // 通用任务
```

### 智能上下文选择示例

```typescript
const selector = new ContextSelector();

// 为营销内容选择上下文
const marketingContext = selector.selectContext(analysis, 'marketing-content');
// 优先选择: README, docs, guide, example

// 为API文档选择上下文  
const apiContext = selector.selectContext(analysis, 'api-documentation');
// 优先选择: api, docs, example, readme

// 为用户指南选择上下文
const guideContext = selector.selectContext(analysis, 'user-guide');
// 优先选择: guide, readme, example, docs
```

## 🔧 配置选项

### ContextEngine配置

```typescript
interface ContextEngineConfig {
    // 分析策略
    analysisStrategy: 'minimal' | 'balanced' | 'comprehensive';
    
    // 缓存设置
    enableCaching: boolean;
    cacheTimeout: number; // 分钟
    
    // 性能设置
    maxDocuments: number;
    maxTokensPerDocument: number;
    
    // 内容生成设置
    defaultContentType: AITaskType;
    defaultAudience: string;
    defaultTone: string;
}
```

### 工作流配置

```typescript
interface EnhancedWorkflowConfig {
    contextStrategy: 'minimal' | 'balanced' | 'comprehensive';
    contentTypes: AITaskType[];
    targetAudience: string;
    tone: string;
    enableCaching: boolean;
    maxRetries: number;
}
```

## 📈 性能优化

### 缓存机制

```typescript
// 启用缓存
const engine = new ContextEngine(workspaceRoot, outputChannel, {
    enableCaching: true,
    cacheTimeout: 30 // 30分钟
});

// 清理缓存
engine.clearCache();

// 获取缓存统计
const stats = engine.getCacheStats();
console.log(`缓存大小: ${stats.size}, 命中率: ${stats.hitRate}%`);
```

### 增量更新

```typescript
// 初始分析
const initialResult = await workflow.executeEnhancedWorkflow(projectPath, 'marketing-content');

// 文件变更后的增量更新
const changedFiles = ['README.md', 'package.json'];
const updateResult = await workflow.updateWithChanges(changedFiles, initialResult.projectAnalysis);
```

### Token预算管理

```typescript
// 系统自动根据策略管理token预算
// minimal: 4K tokens
// balanced: 8K tokens  
// comprehensive: 16K tokens

// 智能文档截断和优先级排序确保在预算内获得最佳上下文
```

## 🎨 高级用法

### 自定义上下文策略

```typescript
const customStrategy = selector.createCustomStrategy('marketing-content', {
    requiredCategories: ['readme', 'docs'],
    optionalCategories: ['example', 'guide'],
    maxTokens: 10000,
    priorityWeights: {
        readme: 1.0,
        docs: 0.9,
        example: 0.7,
        // ... 其他权重
    }
});
```

### 营销准备度评估

```typescript
const assessment = await engine.assessMarketingReadiness();

console.log(`营销准备度: ${assessment.score}/100`);
console.log('优势:', assessment.strengths);
console.log('不足:', assessment.weaknesses);
console.log('建议:', assessment.recommendations);
```

### 特定内容类型生成

```typescript
// 生成技术文档
const techDocs = await engine.generateContent('technical-docs', {
    audience: 'developers',
    tone: 'technical and precise'
});

// 生成用户指南
const userGuide = await engine.generateContent('user-guide', {
    audience: 'end users',
    tone: 'friendly and helpful'
});
```

## 📊 质量监控

### 分析质量指标

```typescript
const result = await engine.analyzeProject();

// 性能指标
console.log('分析耗时:', result.performance.analysisTime);
console.log('文档处理数:', result.performance.documentsProcessed);
console.log('Token使用量:', result.performance.tokensUsed);

// 质量评估
console.log('文档平均优先级:', result.analysis.fullText.averagePriority);
console.log('技术栈复杂度:', result.analysis.structured.techStack.length);
console.log('文档类别分布:', result.analysis.fullText.categories);
```

### 内容质量评估

```typescript
const contentResult = await workflow.executeEnhancedWorkflow(projectPath, 'marketing-content');

// 质量指标
console.log('分析置信度:', contentResult.quality.analysisConfidence);
console.log('策略置信度:', contentResult.quality.strategyConfidence);
console.log('内容质量:', contentResult.quality.contentQuality);

// 内容分析
const content = contentResult.generatedContent;
console.log('技术准确性:', content.contentAnalysis.technicalAccuracy);
console.log('受众匹配度:', content.contentAnalysis.audienceAlignment);
console.log('转化潜力:', content.contentAnalysis.conversionPotential);
```

## 🔍 故障排除

### 常见问题

1. **分析速度慢**
   ```typescript
   // 使用minimal策略
   const result = await engine.analyzeProject('minimal');
   
   // 或减少最大文档数
   engine.updateConfig({ maxDocuments: 20 });
   ```

2. **Token使用过多**
   ```typescript
   // 降低每文档token限制
   engine.updateConfig({ maxTokensPerDocument: 1000 });
   
   // 或使用更保守的策略
   engine.updateConfig({ analysisStrategy: 'minimal' });
   ```

3. **缓存问题**
   ```typescript
   // 清理缓存
   engine.clearCache();
   
   // 禁用缓存
   engine.updateConfig({ enableCaching: false });
   ```

### 调试模式

```typescript
// 启用详细日志
const engine = new ContextEngine(workspaceRoot, outputChannel, {
    // 配置会自动输出详细的分析过程
});

// 查看选择的文档
const context = await engine.selectContextForTask('marketing-content');
console.log('选择的文档:', context.selectedFiles.map(f => f.path));
console.log('选择原因:', context.selectionReason);
```

## 🎯 最佳实践

1. **选择合适的策略**
   - 开发阶段: `minimal`
   - 日常使用: `balanced`  
   - 重要发布: `comprehensive`

2. **启用缓存**
   - 显著提升重复分析速度
   - 减少不必要的文件读取

3. **定期清理**
   - 项目结构大变更后清理缓存
   - 定期评估营销准备度

4. **监控性能**
   - 关注token使用量
   - 优化文档质量和结构

5. **渐进式改进**
   - 从基础分析开始
   - 逐步完善项目文档
   - 持续优化内容质量

## 📚 更多资源

- [技术架构文档](./TECHNICAL_ARCHITECTURE.md)
- [提示工程详解](./PROMPT_CONTEXT_ENGINEERING.md)
- [使用示例](../examples/enhanced-context-usage.ts)
- [API参考文档](./API_REFERENCE.md)

---

通过这个增强的上下文工程系统，LumosGen能够为每个项目提供最适合的上下文信息，确保AI生成的内容既技术准确又具有高度的相关性和转化潜力。
