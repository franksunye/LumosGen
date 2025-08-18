# LumosGen 技术架构设计文档

## 📋 文档概述

**文档目的：** 定义LumosGen项目的技术架构演进路径，重点解决文档变更追踪和知识库管理的架构设计

**适用范围：** LumosGen VS Code扩展的核心技术架构

**版本：** v1.0

**最后更新：** 2025-01-18

## 🎯 架构设计目标

### 核心需求
1. **文档变更记忆**：系统能够"记住"哪些Markdown文档被修改，实现增量更新
2. **知识库管理**：高效处理GitHub项目中的文档作为知识源
3. **内容生成优化**：基于文档变更智能生成和更新营销网站内容
4. **可扩展性**：支持从MVP到企业级的架构演进

### 设计原则
- **渐进式演进**：分阶段实施，避免过度工程化
- **向后兼容**：每个阶段保持API兼容性
- **性能优先**：确保VS Code扩展的响应速度
- **KISS原则**：保持架构简洁，符合MVP精神

## 🏗️ 当前架构分析

### 现有组件
```
LumosGen/
├── src/
│   ├── analysis/          # 项目分析引擎
│   │   └── ProjectAnalyzer.ts
│   ├── content/           # 内容生成引擎
│   │   └── MarketingContentGenerator.ts
│   ├── ai/               # AI服务抽象层
│   │   └── SimpleAI.ts
│   ├── website/          # 网站构建器
│   │   ├── WebsiteBuilder.ts
│   │   └── SEOOptimizer.ts
│   ├── ui/               # 用户界面
│   │   └── SidebarProvider.ts
│   └── extension.ts      # 主扩展入口
```

### 架构优势
- ✅ 清晰的模块分离
- ✅ 完整的项目分析能力
- ✅ 响应式网站生成
- ✅ SEO优化支持

### 架构局限
- ❌ 缺乏文档变更追踪
- ❌ 无增量更新机制
- ❌ 无知识库持久化
- ❌ 无语义检索能力

## 🚀 渐进式架构演进方案

### 阶段1：智能缓存架构（Sprint 4-5）

#### 核心组件设计

**1. 文档变更追踪器**
```typescript
interface DocumentChangeTracker {
  // 追踪文档变更
  trackChanges(filePath: string, content: string): ChangeSet;
  
  // 获取增量更新
  getIncrementalUpdates(): DocumentDelta[];
  
  // 检测语义变更
  detectSemanticChanges(oldContent: string, newContent: string): SemanticChange[];
  
  // 失效缓存
  invalidateCache(patterns: string[]): void;
}

interface ChangeSet {
  filePath: string;
  changeType: 'created' | 'modified' | 'deleted';
  timestamp: Date;
  contentHash: string;
  semanticChanges: SemanticChange[];
}

interface SemanticChange {
  type: 'title' | 'section' | 'content' | 'structure';
  location: string;
  oldValue?: string;
  newValue?: string;
  impact: 'high' | 'medium' | 'low';
}
```

**2. 知识缓存系统**
```typescript
interface KnowledgeCache {
  // 存储内容
  store(key: string, content: string, metadata: CacheMetadata): void;
  
  // 检索内容
  retrieve(key: string): CachedContent | null;
  
  // 检查是否过期
  isStale(key: string): boolean;
  
  // 批量更新
  batchUpdate(updates: CacheUpdate[]): void;
}

interface CacheMetadata {
  contentHash: string;
  lastModified: Date;
  dependencies: string[];
  generationContext: GenerationContext;
}

interface CachedContent {
  content: string;
  metadata: CacheMetadata;
  hitCount: number;
  lastAccessed: Date;
}
```

**3. 增强的内容生成器**
```typescript
class EnhancedMarketingContentGenerator extends MarketingContentGenerator {
  private documentTracker: DocumentChangeTracker;
  private knowledgeCache: KnowledgeCache;
  private incrementalProcessor: IncrementalProcessor;

  async generateContent(
    analysis: ProjectAnalysis, 
    options: ContentGenerationOptions
  ): Promise<GeneratedContent> {
    // 1. 检查文档变更
    const changes = this.documentTracker.getIncrementalUpdates();
    
    // 2. 如果有变更，进行增量处理
    if (changes.length > 0) {
      return this.generateIncrementalContent(changes, analysis, options);
    }
    
    // 3. 使用缓存内容
    const cachedContent = this.knowledgeCache.retrieve(this.getCacheKey(analysis));
    if (cachedContent && !this.knowledgeCache.isStale(this.getCacheKey(analysis))) {
      return this.deserializeContent(cachedContent.content);
    }
    
    // 4. 全量生成（首次或缓存失效）
    return this.generateFullContent(analysis, options);
  }

  private async generateIncrementalContent(
    changes: DocumentDelta[],
    analysis: ProjectAnalysis,
    options: ContentGenerationOptions
  ): Promise<GeneratedContent> {
    // 智能增量更新逻辑
    const impactAnalysis = this.analyzeChangeImpact(changes);
    const updateStrategy = this.determineUpdateStrategy(impactAnalysis);
    
    return this.incrementalProcessor.processChanges(changes, updateStrategy);
  }
}
```

#### 实施计划
1. **Week 1-2**: 实现DocumentChangeTracker基础功能
2. **Week 3-4**: 开发KnowledgeCache系统
3. **Week 5-6**: 集成增量内容生成逻辑
4. **Week 7-8**: 测试和优化性能

### 阶段2：轻量级向量存储（Phase 2）

#### 架构扩展

**1. 本地向量存储**
```typescript
interface LightweightVectorStore {
  // 文档向量化
  embedDocuments(docs: Document[]): Promise<void>;
  
  // 语义搜索
  semanticSearch(query: string, limit: number): Promise<SearchResult[]>;
  
  // 更新文档
  updateDocument(id: string, content: string): Promise<void>;
  
  // 删除文档
  deleteDocument(id: string): Promise<void>;
  
  // 批量操作
  batchOperations(operations: VectorOperation[]): Promise<void>;
}

class SQLiteVectorStore implements LightweightVectorStore {
  private db: SQLiteDatabase;
  private embeddingModel: EmbeddingModel;
  
  constructor(dbPath: string) {
    this.db = new SQLiteDatabase(dbPath);
    this.embeddingModel = new LocalEmbeddingModel();
  }
  
  async embedDocuments(docs: Document[]): Promise<void> {
    const embeddings = await this.embeddingModel.embed(docs.map(d => d.content));
    
    const insertQuery = `
      INSERT INTO document_vectors (id, content, embedding, metadata)
      VALUES (?, ?, ?, ?)
    `;
    
    for (let i = 0; i < docs.length; i++) {
      await this.db.run(insertQuery, [
        docs[i].id,
        docs[i].content,
        JSON.stringify(embeddings[i]),
        JSON.stringify(docs[i].metadata)
      ]);
    }
  }
  
  async semanticSearch(query: string, limit: number): Promise<SearchResult[]> {
    const queryEmbedding = await this.embeddingModel.embed([query]);
    
    // 使用余弦相似度搜索
    const searchQuery = `
      SELECT id, content, metadata,
             vector_cosine_similarity(embedding, ?) as similarity
      FROM document_vectors
      ORDER BY similarity DESC
      LIMIT ?
    `;
    
    const results = await this.db.all(searchQuery, [
      JSON.stringify(queryEmbedding[0]),
      limit
    ]);
    
    return results.map(row => ({
      id: row.id,
      content: row.content,
      metadata: JSON.parse(row.metadata),
      similarity: row.similarity
    }));
  }
}
```

**2. 语义检索增强的内容生成**
```typescript
class SemanticContentGenerator extends EnhancedMarketingContentGenerator {
  private vectorStore: LightweightVectorStore;
  private retrievalChain: RetrievalChain;

  async generateContextualContent(
    query: string,
    analysis: ProjectAnalysis
  ): Promise<GeneratedContent> {
    // 1. 语义检索相关文档
    const relevantDocs = await this.vectorStore.semanticSearch(query, 10);
    
    // 2. 构建上下文
    const context = this.buildContext(relevantDocs, analysis);
    
    // 3. 生成内容
    const prompt = this.buildPrompt(query, context);
    const content = await this.ai.generateContent(prompt);
    
    return this.formatContent(content, analysis);
  }

  private buildContext(docs: SearchResult[], analysis: ProjectAnalysis): string {
    // 智能上下文构建
    const sortedDocs = docs.sort((a, b) => b.similarity - a.similarity);
    const contextDocs = sortedDocs.slice(0, 5); // 取前5个最相关的文档
    
    return contextDocs.map(doc => `
      Document: ${doc.metadata.title}
      Content: ${doc.content.substring(0, 500)}...
      Relevance: ${(doc.similarity * 100).toFixed(1)}%
    `).join('\n\n');
  }
}
```

### 阶段3：企业级RAG架构（Phase 3）

#### 完整RAG系统设计

**1. 企业级向量数据库集成**
```typescript
interface EnterpriseVectorStore {
  // 支持Chroma、Pinecone等
  provider: 'chroma' | 'pinecone' | 'weaviate';
  
  // 高级检索功能
  hybridSearch(query: string, filters: SearchFilter[]): Promise<SearchResult[]>;
  
  // 集群管理
  scaleCluster(nodes: number): Promise<void>;
  
  // 备份恢复
  backup(): Promise<BackupResult>;
  restore(backupId: string): Promise<void>;
}

class ChromaVectorStore implements EnterpriseVectorStore {
  private client: ChromaClient;
  private collection: Collection;
  
  async hybridSearch(
    query: string, 
    filters: SearchFilter[]
  ): Promise<SearchResult[]> {
    // 结合向量搜索和关键词搜索
    const vectorResults = await this.collection.query({
      queryTexts: [query],
      nResults: 20,
      where: this.buildWhereClause(filters)
    });
    
    const keywordResults = await this.keywordSearch(query, filters);
    
    // 融合排序
    return this.fuseResults(vectorResults, keywordResults);
  }
}
```

**2. 高级AI Agent系统**
```typescript
interface AIAgentSystem {
  // 自主学习
  learn(feedback: UserFeedback[]): Promise<void>;
  
  // 策略优化
  optimizeStrategy(metrics: PerformanceMetrics): Promise<void>;
  
  // 多模态处理
  processMultiModal(inputs: MultiModalInput[]): Promise<GeneratedContent>;
}

class LumosGenAIAgent implements AIAgentSystem {
  private vectorStore: EnterpriseVectorStore;
  private llm: LanguageModel;
  private memorySystem: ConversationMemory;
  private learningSystem: ContinuousLearning;

  async generateIntelligentContent(
    request: ContentRequest
  ): Promise<GeneratedContent> {
    // 1. 多维度分析
    const analysis = await this.analyzeRequest(request);
    
    // 2. 智能检索
    const context = await this.intelligentRetrieval(analysis);
    
    // 3. 策略选择
    const strategy = await this.selectStrategy(analysis, context);
    
    // 4. 内容生成
    const content = await this.generateWithStrategy(strategy, context);
    
    // 5. 质量评估
    const quality = await this.assessQuality(content);
    
    // 6. 自适应优化
    if (quality.score < 0.8) {
      return this.refineContent(content, quality.feedback);
    }
    
    return content;
  }
}
```

## 📊 性能与扩展性考虑

### VS Code扩展优化

**1. 异步处理架构**
```typescript
class BackgroundProcessor {
  private workerPool: WorkerPool;
  private taskQueue: TaskQueue;

  async processDocumentChanges(changes: DocumentChange[]): Promise<void> {
    // 使用Web Worker避免阻塞主线程
    const tasks = changes.map(change => ({
      type: 'process_change',
      data: change,
      priority: this.calculatePriority(change)
    }));

    await this.taskQueue.addTasks(tasks);
    return this.workerPool.processTasks(tasks);
  }

  private calculatePriority(change: DocumentChange): number {
    // 根据文件重要性和变更影响计算优先级
    const fileWeight = this.getFileWeight(change.filePath);
    const impactWeight = this.getImpactWeight(change.semanticChanges);
    return fileWeight * impactWeight;
  }
}
```

**2. 渐进式加载**
```typescript
class ProgressiveKnowledgeLoader {
  async loadKnowledgeBase(projectPath: string): Promise<void> {
    // 1. 优先加载核心文档
    const coreFiles = await this.identifyCoreFiles(projectPath);
    await this.loadFiles(coreFiles, 'high');

    // 2. 后台加载其他文档
    const otherFiles = await this.identifyOtherFiles(projectPath);
    this.loadFilesInBackground(otherFiles, 'low');

    // 3. 增量索引
    this.startIncrementalIndexing();
  }

  private async loadFilesInBackground(
    files: string[], 
    priority: 'high' | 'low'
  ): Promise<void> {
    // 使用requestIdleCallback在空闲时处理
    const processChunk = async (chunk: string[]) => {
      for (const file of chunk) {
        await this.processFile(file);
        // 让出控制权，避免阻塞
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    };

    const chunks = this.chunkArray(files, 5);
    for (const chunk of chunks) {
      await processChunk(chunk);
    }
  }
}
```

### 内存管理

**1. 智能缓存策略**
```typescript
class IntelligentCache {
  private lruCache: LRUCache<string, CachedContent>;
  private memoryMonitor: MemoryMonitor;

  constructor(maxMemoryMB: number = 100) {
    this.lruCache = new LRUCache({
      max: this.calculateMaxItems(maxMemoryMB),
      dispose: this.onItemDisposed.bind(this)
    });
    
    this.memoryMonitor = new MemoryMonitor();
    this.memoryMonitor.onMemoryPressure(this.handleMemoryPressure.bind(this));
  }

  private handleMemoryPressure(level: 'low' | 'medium' | 'high'): void {
    switch (level) {
      case 'low':
        this.evictLowPriorityItems(0.1); // 清理10%
        break;
      case 'medium':
        this.evictLowPriorityItems(0.3); // 清理30%
        break;
      case 'high':
        this.evictLowPriorityItems(0.5); // 清理50%
        break;
    }
  }
}
```

## 🔧 实施路线图

### Sprint 4-5：智能缓存架构
- **Week 1-2**: DocumentChangeTracker实现
- **Week 3-4**: KnowledgeCache系统开发
- **Week 5-6**: 增量内容生成集成
- **Week 7-8**: 性能优化和测试

### Phase 2：轻量级向量存储
- **Month 1**: SQLite向量存储实现
- **Month 2**: 语义检索功能开发
- **Month 3**: 多语言支持集成
- **Month 4**: 性能调优和用户测试

### Phase 3：企业级RAG架构
- **Quarter 1**: Chroma/Pinecone集成
- **Quarter 2**: AI Agent智能化功能
- **Quarter 3**: 企业级功能开发
- **Quarter 4**: 开放API和生态建设

## 📈 成功指标

### 技术指标
- **响应时间**: 文档变更检测 < 100ms
- **内存使用**: VS Code扩展内存占用 < 50MB
- **缓存命中率**: > 80%
- **增量更新效率**: 比全量更新快 > 5x

### 业务指标
- **用户满意度**: 内容生成质量评分 > 4.5/5
- **使用频率**: 日活跃用户增长 > 20%
- **转化率**: 完整流程完成率 > 70%

## 🔮 未来扩展

### 多模态支持
- 图片和视频内容分析
- 代码可视化生成
- 交互式演示创建

### 协作功能
- 团队知识库共享
- 实时协作编辑
- 版本控制集成

### AI能力增强
- 自然语言查询
- 智能推荐系统
- 自动化A/B测试

---

*文档版本：v1.0*  
*最后更新：2025-01-18*  
*下次审查：2025-02-01*
