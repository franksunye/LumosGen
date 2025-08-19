# LumosGen 提示与上下文工程详细说明

## 📋 概述

本文档详细说明LumosGen项目中与大模型（AI）交互的核心机制，包括提示工程（Prompt Engineering）和上下文构建（Context Engineering）的完整实现。

## 🏗️ 系统架构

### 核心组件关系图
```
用户请求 → 项目分析 → 上下文构建 → 提示生成 → AI调用 → 内容验证 → 结果输出
    ↓         ↓         ↓         ↓        ↓        ↓         ↓
VS Code   ProjectAnalyzer  AgentContext  PromptTemplates  AIService  ContentValidator  WebsiteBuilder
```

## 🧠 上下文工程 (Context Engineering)

### 1. 项目上下文分析 (`src/analysis/ProjectAnalyzer.ts`)

**目的**: 从项目代码中提取结构化信息，为AI提供丰富的上下文

**核心功能**:
```typescript
interface ProjectAnalysis {
    metadata: {
        name: string;           // 项目名称
        description: string;    // 项目描述
        author: string;         // 作者信息
        repositoryUrl: string;  // 仓库地址
    };
    techStack: TechStackItem[];  // 技术栈分析
    features: ProjectFeature[];  // 功能特性提取
    targetAudience: string[];    // 目标用户群体
    marketingPotential: number;  // 营销潜力评分
}
```

**上下文提取策略**:
- **文件扫描**: 分析`package.json`, `tsconfig.json`, `Cargo.toml`等配置文件
- **技术栈识别**: 自动检测编程语言、框架、依赖关系
- **特性提取**: 从README.md和代码注释中提取功能描述
- **置信度评分**: 为每个识别结果分配0-1的置信度分数

**实现示例**:
```typescript
private async detectTechStack(): Promise<TechStackItem[]> {
    const indicators = [
        { file: 'package.json', tech: { language: 'JavaScript', confidence: 0.9 } },
        { file: 'tsconfig.json', tech: { language: 'TypeScript', confidence: 0.9 } },
        { file: 'requirements.txt', tech: { language: 'Python', confidence: 0.8 } }
    ];
    
    // 扫描项目文件并匹配技术指标
    // 分析依赖关系确定框架
    // 计算技术栈置信度
}
```

### 2. Agent上下文系统 (`src/agents/simple-agent-system.ts`)

**目的**: 在多Agent协作中传递和管理上下文信息

**上下文结构**:
```typescript
interface AgentContext {
    previousResults: Map<string, AgentResult>;  // 前序Agent结果
    globalState: Map<string, any>;             // 全局状态信息
    config: {
        apiKey: string;
        model: string;
        timeout: number;
    };
    aiService: AIServiceProvider;              // AI服务提供者
}
```

**上下文传递机制**:
```typescript
// 动态上下文引用系统
private processTaskInput(input: any, context: AgentContext): any {
    // 替换任务结果引用: {taskResult:projectAnalysis}
    let processed = input.replace(/\{taskResult:(\w+)\}/g, (match, taskId) => {
        const result = context.previousResults.get(taskId);
        return result?.success ? JSON.stringify(result.data) : match;
    });

    // 替换全局状态引用: {globalState.projectPath}
    processed = processed.replace(/\{globalState\.(\w+)\}/g, (match, key) => {
        const value = context.globalState.get(key);
        return value !== undefined ? String(value) : match;
    });

    return processed;
}
```

### 3. 工作流上下文编排 (`src/agents/lumosgen-workflow.ts`)

**目的**: 协调多个Agent之间的上下文流转

**工作流定义**:
```typescript
// 项目分析 → 内容策略 → 内容生成 → 网站构建
workflow.addTask({
    id: 'projectAnalysis',
    agentName: 'ProjectWatcher',
    input: {
        projectPath: '{globalState.projectPath}',
        changedFiles: '{globalState.changedFiles}',
        projectInfo: '{globalState.projectInfo}'
    },
    dependencies: []
});

workflow.addTask({
    id: 'contentStrategy', 
    agentName: 'ContentAnalyzer',
    input: {
        projectAnalysis: '{taskResult:projectAnalysis}',  // 引用上一步结果
        existingContent: '{globalState.existingContent}',
        targetAudience: 'developers and technical teams'
    },
    dependencies: ['projectAnalysis']  // 依赖关系
});
```

## 🎯 提示工程 (Prompt Engineering)

### 1. 结构化提示模板系统 (`src/content/PromptTemplates.ts`)

**设计原则**:
- **上下文注入**: 将项目分析结果动态注入提示词
- **结构化要求**: 明确指定输出格式和结构
- **质量标准**: 定义内容质量和验证规则
- **示例驱动**: 提供具体的格式示例

**模板结构**:
```typescript
interface PromptTemplate {
    name: string;                    // 模板名称
    description: string;             // 模板描述
    template: string;                // 提示词模板
    expectedStructure: string[];     // 期望的内容结构
    validationRules: string[];       // 验证规则
}
```

### 2. 分层提示策略

**系统角色层** (System Message):
```typescript
{
    role: 'system',
    content: `You are ${this.name}, a ${this.role}. ${this.background}
    
    Goal: ${this.goal}
    
    You are an expert technical writer specializing in developer-focused marketing content. 
    Generate high-quality, structured content that follows the provided template exactly.`
}
```

**用户指令层** (User Message):
```typescript
{
    role: 'user', 
    content: `
    Generate a marketing homepage content in Markdown format for the project.

    PROJECT CONTEXT:
    - Name: ${analysis.metadata.name}
    - Description: ${analysis.metadata.description}
    - Tech Stack: ${analysis.techStack.map(t => t.language).join(', ')}
    - Key Features: ${analysis.features.map(f => f.name).join(', ')}

    CONTENT REQUIREMENTS:
    1. Write for ${options.tone} tone targeting ${targetAudience}
    2. Focus on developer benefits and technical value
    3. Use action-oriented language
    4. Include specific technical details when relevant
    5. Make it scannable with clear sections

    REQUIRED STRUCTURE:
    # ${projectName} - [Compelling Headline]
    [Hero description paragraph]
    ## 🚀 Key Features
    - **Feature 1**: Description
    ## 🎯 Why Choose ${projectName}?
    [Value proposition]
    ## 🔧 Quick Start
    [Getting started steps]
    ---
    **Ready to get started?** [CTA]

    FORMATTING RULES:
    - Use emoji icons for section headers
    - Bold important terms and feature names  
    - Keep paragraphs concise (2-3 sentences max)
    - End with clear call-to-action
    - Total length: 300-500 words
    `
}
```

### 3. 动态上下文注入

**项目信息注入**:
```typescript
public generatePrompt(templateName: string, analysis: ProjectAnalysis, options: ContentGenerationOptions): string {
    let prompt = template.template;
    
    // 基础信息替换
    prompt = prompt.replace(/\{\{projectName\}\}/g, analysis.metadata.name);
    prompt = prompt.replace(/\{\{projectDescription\}\}/g, analysis.metadata.description);
    prompt = prompt.replace(/\{\{techStack\}\}/g, analysis.techStack.map(t => t.language).join(', '));
    prompt = prompt.replace(/\{\{features\}\}/g, analysis.features.map(f => f.name).join(', '));
    
    // 智能推断
    prompt = prompt.replace(/\{\{projectType\}\}/g, this.determineProjectType(analysis));
    prompt = prompt.replace(/\{\{installationMethod\}\}/g, this.determineInstallationMethod(analysis));
    
    return prompt;
}
```

### 4. Agent专用提示策略

**项目分析Agent**:
```typescript
const prompt = `
Analyze this project and identify marketing opportunities:

Project Information:
${JSON.stringify(projectInfo, null, 2)}

Changed Files: ${changedFiles.join(', ')}

Focus Areas:
1. Technical innovation and uniqueness
2. Developer pain points this project solves  
3. Market positioning and competitive advantages
4. Target audience identification
5. Marketing angle recommendations

Provide a structured analysis with actionable recommendations.
`;
```

**内容策略Agent**:
```typescript
const prompt = `
Based on the project analysis, create a content strategy:

Project Analysis: ${JSON.stringify(projectAnalysis, null, 2)}
Existing Content: ${existingContent}
Target Audience: ${targetAudience}

Strategy Requirements:
1. Content gap analysis
2. SEO optimization opportunities  
3. Marketing messaging framework
4. Content priority ranking
5. Conversion optimization tactics

Focus on developer-friendly content that converts technical audiences.
`;
```

**内容生成Agent**:
```typescript
const prompt = `
Generate ${contentType} content based on:

Project Analysis: ${JSON.stringify(projectAnalysis, null, 2)}
Content Strategy: ${JSON.stringify(contentStrategy, null, 2)}

Generation Guidelines:
- Target audience: Developers and technical teams
- Tone: Professional yet approachable, technical but accessible
- Format: Ready-to-use marketing copy in Markdown format
- Structure: Follow template requirements exactly
- Quality: Ensure high engagement and conversion potential

Create compelling, technically accurate content that resonates with developer audiences.
`;
```

## 🔄 AI服务调用机制

### 1. 智能降级策略 (`src/ai/AIServiceProvider.ts`)

**多提供商支持**:
```typescript
// 降级顺序: DeepSeek → OpenAI → Mock
async generateContent(request: AIRequest): Promise<AIResponse> {
    for (const providerType of this.config.degradationStrategy) {
        const provider = this.providers.get(providerType);
        
        if (!provider || !provider.isAvailable()) {
            console.log(`Provider ${providerType} is not available, trying next...`);
            continue;
        }

        try {
            const response = await provider.generateContent(request);
            this.currentProvider = provider;
            return response;
        } catch (error) {
            console.log(`Provider ${providerType} failed: ${error}`);
            // 继续尝试下一个提供商
        }
    }
    
    throw new Error('All AI providers failed');
}
```

### 2. 请求参数优化

**基础请求配置**:
```typescript
const request: AIRequest = {
    messages: [systemMessage, userMessage],
    temperature: isRetry ? 0.5 : 0.7,  // 重试时降低随机性
    maxTokens: 2500,                   // 足够的输出长度
    stream: false                      // 同步响应
};
```

**重试机制**:
```typescript
for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const content = await this.generateContent(prompt, attempt > 0);
    const validation = this.validateContent(content, templateName);
    
    if (validation.isValid && validation.score >= 85) {
        return content; // 高质量内容，直接返回
    }
    
    if (attempt < maxRetries) {
        // 调整提示词，降低temperature，重试
        prompt = this.enhancePromptForRetry(prompt, validation.errors);
    }
}
```

## 📊 质量保证机制

### 1. 内容验证系统 (`src/content/ContentValidator.ts`)

**多维度验证**:
- **结构验证**: Markdown格式、标题层级、必需章节
- **内容验证**: 字数统计、关键信息完整性、占位符检查
- **质量评分**: 0-100分综合评分系统
- **改进建议**: 具体的优化建议生成

**验证流程**:
```typescript
validateHomepage(content: string): ValidationResult {
    const result = { isValid: true, score: 100, errors: [], warnings: [] };
    
    // 结构验证
    this.validateMarkdownStructure(content, 'homepage', result);
    // 内容特定验证  
    this.validateHomepageSpecific(content, result);
    // 通用质量检查
    this.validateContentQuality(content, result);
    
    // 计算最终分数
    result.score = this.calculateScore(result);
    result.isValid = result.score >= 70 && 
                     result.errors.filter(e => e.severity === 'critical').length === 0;
    
    return result;
}
```

### 2. 评分算法

**分数计算逻辑**:
```typescript
private calculateScore(result: ValidationResult): number {
    let score = 100;
    
    // 错误扣分
    result.errors.forEach(error => {
        switch (error.severity) {
            case 'critical': score -= 25; break;
            case 'major': score -= 15; break;
            case 'minor': score -= 5; break;
        }
    });
    
    // 警告扣分
    result.warnings.forEach(() => score -= 2);
    
    return Math.max(0, score);
}
```

## 🎛️ 配置与监控

### 1. AI服务配置 (`src/config/SimpleConfig.ts`)

**多提供商配置**:
```typescript
export function getAIServiceConfig(): AIServiceConfig {
    const config = getConfig();
    
    // DeepSeek作为主要提供商
    if (deepseekApiKey && deepseekApiKey !== 'mock') {
        primaryProvider = {
            type: 'deepseek',
            apiKey: deepseekApiKey,
            endpoint: 'https://api.deepseek.com',
            model: 'deepseek-chat',
            enabled: true
        };
    }
    
    // OpenAI作为备用
    if (openaiApiKey && openaiApiKey !== 'mock') {
        fallbackProvider = {
            type: 'openai', 
            apiKey: openaiApiKey,
            endpoint: 'https://api.openai.com/v1',
            model: 'gpt-4o-mini',
            enabled: true
        };
    }
    
    return {
        primary: primaryProvider,
        fallback: fallbackProvider,
        degradationStrategy: ['deepseek', 'openai', 'mock']
    };
}
```

### 2. 使用监控 (`src/ai/monitoring/UsageMonitor.ts`)

**实时监控指标**:
- **请求统计**: 成功/失败请求数量
- **Token使用**: 输入/输出Token消耗
- **成本跟踪**: 实时成本计算和预警
- **性能指标**: 响应时间、错误率、可用性

**成本优化**:
```typescript
// DeepSeek非高峰时段优惠检测
export function isOffPeakHour(): boolean {
    const now = new Date();
    const utcHour = now.getUTCHours();
    // 非高峰: 16:30-00:30 UTC (DeepSeek折扣时段)
    return utcHour >= 16 || utcHour < 1;
}

// 动态成本计算
export function calculateCost(provider: string, model: string, inputTokens: number, outputTokens: number): number {
    if (provider === 'deepseek') {
        const isOffPeak = isOffPeakHour();
        const inputCost = (inputTokens / 1000000) * (isOffPeak ? pricing.input.offPeak : pricing.input.standard);
        const outputCost = (outputTokens / 1000000) * (isOffPeak ? pricing.output.offPeak : pricing.output.standard);
        return inputCost + outputCost;
    }
    // ... 其他提供商计算逻辑
}
```

## 🔧 实际应用示例

### 完整的内容生成流程

1. **项目分析**: 扫描代码库，提取技术栈和特性
2. **上下文构建**: 组装项目信息、用户配置、历史结果
3. **提示生成**: 根据模板和上下文生成结构化提示词
4. **AI调用**: 通过降级策略调用AI服务
5. **内容验证**: 验证输出质量，必要时重试
6. **结果输出**: 返回验证通过的高质量内容

### 关键优势

- **上下文丰富**: 深度项目分析提供充分的背景信息
- **提示精确**: 结构化模板确保输出符合要求
- **质量保证**: 多层验证和重试机制
- **成本优化**: 智能提供商选择和非高峰时段优惠
- **可扩展性**: 模块化设计支持新模板和提供商

## 📈 性能优化策略

### 1. 提示词优化技巧

**长度控制**:
- 保持提示词在合理长度内（通常1000-3000 tokens）
- 使用结构化格式提高AI理解效率
- 避免冗余信息，专注核心要求

**上下文压缩**:
```typescript
// 智能上下文摘要
private compressProjectContext(analysis: ProjectAnalysis): string {
    // 只保留最重要的信息
    const essentialInfo = {
        name: analysis.metadata.name,
        description: analysis.metadata.description,
        mainTech: analysis.techStack.filter(t => t.confidence > 0.8).slice(0, 3),
        topFeatures: analysis.features.sort((a, b) => b.importance - a.importance).slice(0, 5)
    };
    return JSON.stringify(essentialInfo, null, 2);
}
```

**提示词版本控制**:
```typescript
// 提示词模板版本管理
interface PromptVersion {
    version: string;
    template: string;
    performanceMetrics: {
        averageScore: number;
        successRate: number;
        averageRetries: number;
    };
}
```

### 2. 缓存策略

**上下文缓存**:
```typescript
// 项目分析结果缓存
class ProjectAnalysisCache {
    private cache = new Map<string, { analysis: ProjectAnalysis; timestamp: number }>();
    private TTL = 30 * 60 * 1000; // 30分钟

    get(projectPath: string): ProjectAnalysis | null {
        const cached = this.cache.get(projectPath);
        if (cached && Date.now() - cached.timestamp < this.TTL) {
            return cached.analysis;
        }
        return null;
    }
}
```

**生成内容缓存**:
```typescript
// 内容生成结果缓存
interface ContentCache {
    projectHash: string;      // 项目内容哈希
    templateName: string;     // 模板类型
    content: string;          // 生成的内容
    validationScore: number;  // 质量分数
    timestamp: number;        // 生成时间
}
```

## 🧪 测试与验证

### 1. 提示词A/B测试框架

**测试结构**:
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

**自动化测试**:
```typescript
// 批量测试不同提示词变体
async function runPromptABTest(testCases: ProjectAnalysis[], variants: PromptVariants): TestResults {
    const results = [];

    for (const testCase of testCases) {
        for (const [variantName, prompt] of Object.entries(variants)) {
            const startTime = Date.now();
            const content = await generateContent(prompt, testCase);
            const validation = await validateContent(content);

            results.push({
                variant: variantName,
                project: testCase.metadata.name,
                score: validation.score,
                duration: Date.now() - startTime,
                retries: validation.retryCount
            });
        }
    }

    return analyzeTestResults(results);
}
```

### 2. 质量基准测试

**基准数据集**:
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
    // ... 更多基准项目
];
```

## 🔍 调试与故障排除

### 1. 提示词调试工具

**详细日志记录**:
```typescript
class PromptDebugger {
    logPromptExecution(prompt: string, response: string, validation: ValidationResult) {
        console.log('=== PROMPT DEBUG ===');
        console.log('Input Prompt Length:', prompt.length);
        console.log('Response Length:', response.length);
        console.log('Validation Score:', validation.score);
        console.log('Errors:', validation.errors.map(e => e.message));
        console.log('Warnings:', validation.warnings.map(w => w.message));

        // 保存到调试文件
        this.saveDebugSession({
            timestamp: new Date().toISOString(),
            prompt: prompt.substring(0, 500) + '...',
            response: response.substring(0, 500) + '...',
            validation
        });
    }
}
```

### 2. 常见问题诊断

**提示词问题诊断**:
```typescript
function diagnosePromptIssues(prompt: string, response: string): DiagnosisResult {
    const issues = [];

    // 检查提示词长度
    if (prompt.length > 4000) {
        issues.push({
            type: 'prompt_too_long',
            message: '提示词过长，可能影响AI理解',
            suggestion: '简化上下文信息，专注核心要求'
        });
    }

    // 检查结构化程度
    if (!prompt.includes('REQUIRED STRUCTURE') || !prompt.includes('FORMATTING RULES')) {
        issues.push({
            type: 'insufficient_structure',
            message: '提示词结构化程度不足',
            suggestion: '添加明确的结构要求和格式规则'
        });
    }

    // 检查响应质量
    if (response.length < 200) {
        issues.push({
            type: 'response_too_short',
            message: 'AI响应过短',
            suggestion: '增加最小长度要求或调整temperature参数'
        });
    }

    return { issues, severity: calculateSeverity(issues) };
}
```

## 📚 最佳实践总结

### 1. 提示词设计原则

1. **明确性**: 使用具体、明确的指令，避免模糊表达
2. **结构化**: 采用清晰的章节划分和格式要求
3. **上下文丰富**: 提供充分的项目背景信息
4. **示例驱动**: 包含具体的格式示例
5. **质量标准**: 明确定义期望的输出质量

### 2. 上下文工程最佳实践

1. **分层构建**: 从项目→策略→内容的层次化上下文
2. **动态注入**: 根据项目特点动态调整上下文内容
3. **缓存优化**: 合理使用缓存减少重复分析
4. **版本控制**: 跟踪上下文变化对生成质量的影响

### 3. 质量保证策略

1. **多重验证**: 结构、内容、格式的全方位检查
2. **智能重试**: 基于验证结果的自适应重试机制
3. **渐进优化**: 通过A/B测试持续改进提示词
4. **用户反馈**: 收集用户满意度数据指导优化

## 🚀 未来发展方向

### 1. 智能化提升

- **自适应提示词**: 根据项目类型自动调整提示策略
- **学习型系统**: 从历史生成结果中学习优化模式
- **个性化定制**: 基于用户偏好定制提示风格

### 2. 技术演进

- **多模态支持**: 整合图像、代码、文档等多种输入
- **实时优化**: 基于实时反馈动态调整生成策略
- **协作增强**: 支持团队协作的上下文共享机制

这套提示与上下文工程系统确保了LumosGen能够生成高质量、结构化、符合模板要求的营销内容，同时保持成本效益和系统可靠性。通过持续的测试、优化和监控，系统能够不断提升内容生成的质量和效率。
