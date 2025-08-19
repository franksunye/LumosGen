# LumosGen 综合上下文与提示工程系统

## 📋 概述

LumosGen的综合上下文工程系统实现了**智能化、多层次的上下文分析与提示生成**，通过先进的文档选择策略、多提供商AI服务和质量保证机制，为营销内容生成提供最优质的技术支持。

## 🏗️ 系统架构

### 核心组件关系图
```
用户请求 → ContextEngine → ProjectAnalyzer → ContextSelector → AgentWorkflow → AI服务 → 内容验证 → 结果输出
    ↓           ↓              ↓              ↓              ↓         ↓        ↓         ↓
VS Code    统一接口        项目分析        智能选择        工作流编排   多提供商   质量保证   网站构建
```

### 三层上下文策略

1. **结构化数据层** - 规则提取的精确信息
   - 项目元数据 (package.json, Cargo.toml等)
   - 技术栈识别和依赖关系分析
   - 脚本和配置信息提取

2. **半结构化文档层** - 重要文档的智能解析
   - README.md (项目介绍和特性)
   - CHANGELOG.md (版本历史)
   - 用户指南和技术文档

3. **全文本上下文层** - 所有markdown文件的智能处理
   - 基于任务类型的优先级排序
   - Token预算管理和动态选择
   - 上下文压缩和优化

## 🧠 核心组件实现

### 1. ContextEngine - 统一上下文引擎 (`src/analysis/ContextEngineering.ts`)

**核心功能**:
```typescript
export class ContextEngine {
    private analyzer: ProjectAnalyzer;
    private selector: ContextSelector;
    private workflow?: LumosGenWorkflow;
    
    // 项目分析
    async analyzeProject(): Promise<ContextEngineResult>;
    
    // 任务特定上下文选择
    async selectContextForTask(taskType: AITaskType): Promise<SelectedContext>;
    
    // 完整工作流执行
    async executeFullWorkflow(projectPath: string, contentType: AITaskType): Promise<any>;
}
```

**配置选项**:
```typescript
interface ContextEngineConfig {
    analysisStrategy: 'minimal' | 'balanced' | 'comprehensive';
    enableCaching: boolean;
    maxDocuments: number;
    maxTokensPerDocument: number;
    defaultContentType: AITaskType;
    defaultAudience: string;
    defaultTone: string;
}
```

### 2. ContextSelector - 智能文档选择器 (`src/analysis/ContextSelector.ts`)

**任务特定策略**:
```typescript
export class ContextSelector {
    private strategies: Record<AITaskType, ContextSelectionStrategy> = {
        'marketing-content': {
            requiredCategories: ['readme'],
            optionalCategories: ['docs', 'guide', 'example', 'changelog'],
            priorityWeights: { readme: 1.0, docs: 0.8, guide: 0.7, ... },
            maxTokens: 8000,
            includeStructured: true,
            includeSemiStructured: true
        },
        'technical-docs': { /* 技术文档策略 */ },
        'api-documentation': { /* API文档策略 */ }
    };
}
```

**选择流程**:
1. 筛选相关文档 (基于文件类型和内容)
2. 应用优先级权重 (任务特定权重)
3. Token预算管理 (智能截断和选择)
4. 生成选择原因 (可解释的决策过程)

### 3. ProjectAnalyzer - 增强项目分析器 (`src/analysis/ProjectAnalyzer.ts`)

**分析能力**:
```typescript
export interface ProjectAnalysis {
    metadata: ProjectMetadata;        // 项目基本信息
    structure: FileStructure;         // 文件结构分析
    techStack: TechStack[];          // 技术栈识别
    features: ProjectFeature[];       // 功能特性提取
    documents: MarkdownDocument[];    // 文档解析结果
    dependencies: Dependency[];       // 依赖关系分析
    scripts: ScriptInfo[];           // 脚本信息
}
```

**智能特性**:
- 文档缓存机制 (提升重复分析性能)
- 多格式配置文件支持 (package.json, Cargo.toml, etc.)
- 递归文档扫描 (智能跳过无关目录)
- 特性自动提取 (从README和代码注释)

## 🤖 Agent系统架构

### 1. AgentWorkflow - 轻量级工作流引擎 (`src/agents/AgentSystem.ts`)

**核心特性**:
```typescript
export class AgentWorkflow extends EventEmitter {
    private agents: Map<string, IAgent>;
    private tasks: AgentTask[];
    private results: Map<string, AgentResult>;
    private globalState: Map<string, any>;
    
    // 动态上下文引用系统
    private processTaskInput(input: any, context: AgentContext): any;
    
    // 拓扑排序任务执行
    async execute(initialInput: any): Promise<Map<string, AgentResult>>;
}
```

### 2. 专业化Agent实现

**ContentAnalyzerAgent** (`src/agents/ContentAnalyzerAgent.ts`):
- 基于上下文工程的内容策略分析
- 多维度内容差距识别
- SEO和转化优化建议

**ContentGeneratorAgent** (`src/agents/ContentGeneratorAgent.ts`):
- 上下文感知的内容生成
- 模板驱动的结构化输出
- 质量评估和优化建议

**WebsiteBuilderAgent** (`src/agents/WebsiteBuilderAgent.ts`):
- 响应式网站构建
- SEO优化和元数据生成
- 多页面网站架构

### 3. LumosGenWorkflow - 增强工作流管理器 (`src/agents/Workflow.ts`)

**工作流配置**:
```typescript
interface WorkflowConfig {
    contextStrategy: 'minimal' | 'balanced' | 'comprehensive';
    contentTypes: AITaskType[];
    targetAudience: string;
    tone: string;
    enableCaching: boolean;
    maxRetries: number;
}
```

**执行流程**:
1. **内容策略分析** - 基于完整项目上下文
2. **内容生成** - 使用选定的最佳上下文
3. **网站构建** - 可选的完整网站生成

## 🎯 AI服务架构

### 1. AIServiceProvider - 多提供商服务 (`src/ai/AIServiceProvider.ts`)

**智能降级策略**:
```typescript
// 降级顺序: DeepSeek → OpenAI → Mock
async generateContent(request: AIRequest): Promise<AIResponse> {
    for (const providerType of this.config.degradationStrategy) {
        const provider = this.providers.get(providerType);
        
        if (!provider || !provider.isAvailable()) {
            continue; // 尝试下一个提供商
        }

        try {
            const response = await provider.generateContent(request);
            return response; // 成功返回
        } catch (error) {
            // 记录错误，继续尝试下一个提供商
        }
    }
    
    throw new Error('All AI providers failed');
}
```

**成本优化**:
- DeepSeek非高峰时段检测 (16:30-00:30 UTC)
- 实时成本计算和预警
- 使用统计和性能监控

### 2. PromptTemplates - 结构化提示模板 (`src/content/PromptTemplates.ts`)

**模板系统**:
```typescript
export interface PromptTemplate {
    name: string;
    description: string;
    template: string;
    expectedStructure: string[];
    validationRules: string[];
}
```

**动态上下文注入**:
- 项目信息自动替换 ({{projectName}}, {{techStack}})
- 智能推断 (项目类型、安装方法)
- 上下文压缩 (保留最重要信息)

### 3. ContentValidator - 质量保证系统 (`src/content/ContentValidator.ts`)

**多维度验证**:
```typescript
interface ValidationResult {
    isValid: boolean;
    score: number;           // 0-100分综合评分
    errors: ValidationError[];
    warnings: ValidationWarning[];
    suggestions: string[];
}
```

**验证层次**:
- 结构验证 (Markdown格式、标题层级)
- 内容验证 (字数、关键信息完整性)
- 质量评分 (基于错误严重程度)
- 改进建议 (具体优化方向)

## 📊 分析策略对比

| 策略 | 文档数量 | Token使用 | 分析深度 | 适用场景 |
|------|----------|-----------|----------|----------|
| **minimal** | 5-10个 | 2K-4K | 基础 | 快速预览、简单项目 |
| **balanced** | 10-20个 | 4K-8K | 中等 | 大多数项目、日常使用 |
| **comprehensive** | 20-50个 | 8K-16K | 深度 | 复杂项目、详细分析 |

## 🚀 快速开始

### 基础使用
```typescript
import { ContextEngine } from '../src/analysis/ContextEngineering';

// 创建上下文引擎
const engine = new ContextEngine(workspaceRoot, outputChannel, {
    analysisStrategy: 'balanced',
    enableCaching: true,
    defaultContentType: 'marketing-content'
});

// 执行项目分析
const result = await engine.analyzeProject();
console.log(`处理了 ${result.performance.documentsProcessed} 个文档`);
```

### 完整工作流
```typescript
// 初始化工作流
engine.initializeWorkflow(workspaceRoot, aiService);

// 执行完整的内容生成
const workflowResult = await engine.executeFullWorkflow(
    projectPath,
    'marketing-content',
    { changedFiles: ['README.md'], buildWebsite: true }
);
```

## 🔧 配置与监控

### AI服务配置 (`src/config/SimpleConfig.ts`)
```typescript
export function getAIServiceConfig(): AIServiceConfig {
    return {
        primary: { type: 'deepseek', apiKey: '...', model: 'deepseek-chat' },
        fallback: { type: 'openai', apiKey: '...', model: 'gpt-4o-mini' },
        degradationStrategy: ['deepseek', 'openai', 'mock'],
        monitoring: { enabled: true, trackCosts: true, trackUsage: true }
    };
}
```

### 使用监控 (`src/ai/monitoring/UsageMonitor.ts`)
- 实时请求统计 (成功/失败率)
- Token使用跟踪 (输入/输出/总计)
- 成本计算和预警 (日/月限额)
- 性能指标 (响应时间、可用性)

## 🎯 最佳实践

### 1. 策略选择
- **开发阶段**: `minimal` - 快速迭代
- **日常使用**: `balanced` - 平衡质量和性能
- **重要发布**: `comprehensive` - 最高质量

### 2. 性能优化
- 启用缓存 (显著提升重复分析速度)
- 合理设置Token预算 (避免超出限制)
- 定期清理缓存 (项目结构变更后)

### 3. 质量保证
- 多重验证 (结构、内容、格式)
- 智能重试 (基于验证结果)
- 持续改进 (A/B测试提示词)

## 📈 技术优势

### 核心优势
1. **智能上下文选择** - 任务特定的文档选择策略
2. **多提供商支持** - 智能降级确保服务可用性
3. **质量保证机制** - 多层验证和评分系统
4. **性能优化** - 缓存、增量更新、Token管理
5. **成本控制** - 实时监控和优化建议

### 技术创新
- **规则与全文本平衡** - 结合结构化和非结构化信息
- **动态上下文压缩** - 智能保留最重要信息
- **可解释的选择过程** - 透明的决策机制
- **自适应质量控制** - 基于内容类型的验证标准

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
        guide: 0.6
    }
});
```

### 营销准备度评估
```typescript
const assessment = await engine.assessMarketingReadiness();
console.log(`营销准备度: ${assessment.score}/100`);
console.log('优势:', assessment.strengths);
console.log('建议:', assessment.recommendations);
```

### 增量更新
```typescript
// 初始分析
const initialResult = await workflow.executeWorkflow(projectPath, 'marketing-content');

// 文件变更后的增量更新
const changedFiles = ['README.md', 'package.json'];
const updateResult = await workflow.updateWithChanges(changedFiles, initialResult.projectAnalysis);
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

## 🧪 测试与验证

### 提示词A/B测试框架
```typescript
interface PromptTest {
    testId: string;
    variants: {
        control: string;    // 对照组提示词
        treatment: string;  // 实验组提示词
    };
    metrics: {
        qualityScore: number;
        generationTime: number;
        retryCount: number;
        userSatisfaction: number;
    };
}
```

### 质量基准测试
```typescript
// 标准测试项目集合
const benchmarkProjects = [
    {
        type: 'VS Code Extension',
        complexity: 'medium',
        techStack: ['TypeScript', 'Node.js'],
        expectedQuality: 85
    },
    {
        type: 'React Library',
        complexity: 'high',
        techStack: ['React', 'TypeScript', 'Webpack'],
        expectedQuality: 90
    }
];
```

## 📚 实际应用示例

### 完整的内容生成流程

1. **项目分析**: 扫描代码库，提取技术栈和特性
2. **上下文构建**: 组装项目信息、用户配置、历史结果
3. **提示生成**: 根据模板和上下文生成结构化提示词
4. **AI调用**: 通过降级策略调用AI服务
5. **内容验证**: 验证输出质量，必要时重试
6. **结果输出**: 返回验证通过的高质量内容

### 使用示例

#### VS Code集成
```typescript
import { MarketingWorkflowManager } from './agents/Workflow';

// 1. 初始化工作流管理器
const workflowManager = new MarketingWorkflowManager(
    workspaceRoot,
    outputChannel,
    aiService
);

// 2. 监听文件变化 - 自动触发分析
vscode.workspace.onDidSaveTextDocument(async (document) => {
    if (document.fileName.endsWith('.md') || document.fileName.includes('package.json')) {
        await workflowManager.onFileChanged([document.fileName], workspaceRoot);
    }
});

// 3. 手动生成内容
const content = await workflowManager.generateContent('homepage');
```

#### 批量内容生成
```typescript
// 生成多种类型的内容
const contentTypes: AITaskType[] = ['marketing-content', 'technical-docs', 'user-guide'];

for (const contentType of contentTypes) {
    const result = await engine.executeFullWorkflow(projectPath, contentType, {
        buildWebsite: false
    });

    console.log(`${contentType} 生成完成:`, result.generatedContent);
}
```

## 🚀 未来发展方向

### 智能化提升
- **自适应提示词**: 根据项目类型自动调整提示策略
- **学习型系统**: 从历史生成结果中学习优化模式
- **个性化定制**: 基于用户偏好定制提示风格

### 技术演进
- **多模态支持**: 整合图像、代码、文档等多种输入
- **实时优化**: 基于实时反馈动态调整生成策略
- **协作增强**: 支持团队协作的上下文共享机制

### 扩展功能
- **向量存储集成**: 支持语义搜索和内容检索
- **更多Agent类型**: 专门的SEO优化Agent、质量保证Agent
- **多语言支持**: 国际化内容生成能力

---

通过这套综合的上下文与提示工程系统，LumosGen能够为每个项目提供最适合的上下文信息，确保AI生成的内容既技术准确又具有高度的相关性和转化潜力。系统的模块化设计和智能化特性使其能够适应各种项目需求，同时保持高性能和成本效益。
