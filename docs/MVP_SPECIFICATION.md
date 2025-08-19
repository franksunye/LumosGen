# LumosGen MVP 规格说明

## 🎯 MVP 概述

**目标：** 验证"开发者愿意与真正的Agentic AI系统协作"的核心价值假设

**核心假设：** 开发者愿意使用具备自主感知、智能决策、持续学习能力的AI Agent系统，实现项目营销的智能化管理，从被动工具使用转向主动智能协作。

**MVP聚焦：** 最小可行的Agentic Marketing AI系统 - 专注核心Agent能力验证，证明多Agent协作的价值后再扩展到完整生态。

**核心技术验证：** Agentic架构是否能提供超越传统工具的智能化体验和价值。

## 🚀 MVP 核心功能

### 1. 项目智能分析
**功能描述：** AI分析GitHub项目的营销潜力
- 扫描项目文件结构和README
- 识别技术栈和核心功能
- 提取项目价值点和使用场景
- 分析现有文档内容

**输入：** GitHub项目URL或本地项目路径
**输出：** 项目特征分析和营销要点提取

### 2. AI英语内容生成
**功能描述：** AI生成专业的英语营销内容
- 将技术文档转化为营销文案
- 基于项目特点生成价值主张
- 生成面向国际用户的使用场景
- 优化英语SEO关键词

**内容类型（MVP核心）：**
- **营销首页**：Hero Section, Features, CTA
- **项目介绍页**：详细功能说明和优势
- **基础博客文章**：1-2篇技术分享
- **简单FAQ**：常见问题解答

### 3. 英语营销网站生成 ✅ COMPLETED
**功能描述：** 生成专业的英语营销网站
- ✅ 响应式网站模板（Tailwind CSS）
- ✅ 完整SEO优化结构
- ✅ 现代化设计风格（深色/浅色主题）
- ✅ 快速加载性能优化

**网站结构（已实现）：**
```
/lumosgen-website/
├── index.html          # 营销首页 ✅
├── about.html          # 项目详情 ✅
├── faq.html           # FAQ页面 ✅
├── blog.html          # 博客文章 ✅
├── assets/            # 静态资源 ✅
│   ├── styles.css     # 响应式CSS
│   └── main.js        # 交互功能
├── sitemap.xml        # SEO站点地图 ✅
├── robots.txt         # 搜索引擎指令 ✅
└── manifest.json      # PWA清单 ✅
```

### 4. 轻量级Agent系统 🎯 SIMPLIFIED ARCHITECTURE
**功能描述：** 简洁高效的多Agent协作系统
- **ProjectWatcherAgent**：项目变化监控和分析
- **ContentAnalyzerAgent**：内容策略分析和建议
- **ContentGeneratorAgent**：营销内容生成和优化

**核心特性：**
- **事件驱动**：基于EventEmitter的简单通信
- **任务依赖**：自动拓扑排序执行
- **零外部依赖**：仅需Node.js + OpenAI API
- **完美嵌入**：专为VS Code扩展设计
- **立即可用**：无需复杂配置

### 5. GitHub Pages部署
**功能描述：** 简化的自动部署到GitHub Pages
- 基础gh-pages分支创建和部署
- 简单的部署状态反馈
- **优先级降低**：非核心差异化功能

### 6. 基础SEO优化 ✅ COMPLETED
**功能描述：** 英语网站的完整SEO优化
- ✅ 语义化HTML结构
- ✅ 完整Meta标签和描述优化
- ✅ Open Graph和Twitter Card标签
- ✅ JSON-LD结构化数据
- ✅ XML站点地图和robots.txt生成
- ✅ 性能优化和预加载策略

## 🎨 用户界面设计

### VS Code 插件界面

**侧边栏面板（MVP简化）：**
```
LumosGen
├── 📊 Analyze Project
├── 🤖 Generate Content
├── 🎨 Preview Website
├── 🚀 Deploy to GitHub Pages
└── ⚙️ Settings
```

**主要操作流程（当前实现）：**
1. 点击"Analyze Project" → AI分析项目特征和营销要点 ✅
2. 点击"Generate Content" → AI生成英语营销内容 ✅
3. 点击"Preview Website" → 构建网站并显示文件位置 ✅
4. 点击"Deploy to GitHub Pages" → 一键部署到GitHub Pages 📋 (Sprint 4)

### 配置界面（MVP简化）
```json
{
  "lumosgen": {
    "project": {
      "name": "My Project",
      "description": "Auto-generated from README",
      "repositoryUrl": "https://github.com/user/repo"
    },
    "content": {
      "language": "en",
      "tone": "professional",
      "includeCodeExamples": true
    },
    "deployment": {
      "platform": "github-pages",
      "customDomain": ""
    }
  }
}
```

## 🔧 技术架构

### 核心模块

**1. 轻量级Agent系统** ✅ NEW
```typescript
// 核心Agent框架 (simple-agent-system.ts)
abstract class BaseAgent {
  abstract execute(context: AgentContext): Promise<AgentResult>;
}

class SimpleWorkflow {
  async execute(tasks: WorkflowTask[]): Promise<WorkflowResult>;
}

// 专用Agent实现 (lumosgen-agents.ts)
class ProjectWatcherAgent extends BaseAgent { }
class ContentAnalyzerAgent extends BaseAgent { }
class ContentGeneratorAgent extends BaseAgent { }

// VS Code集成 (lumosgen-workflow.ts)
class LumosGenAgentManager {
  async onFileChanged(files: string[], path: string): Promise<WorkflowResult>;
  async generateContent(type: string): Promise<AgentResult>;
}
```

**2. 现有模块 (保留)**
- **ProjectAnalyzer**: 项目分析引擎 ✅
- **MarketingContentGenerator**: 内容生成引擎 ✅
- **WebsiteBuilder**: 网站构建器 ✅
- **SEOOptimizer**: SEO优化器 ✅

### AI 模型集成

**本地模型（优先）：**
- 轻量级语言模型（如 Phi-3 Mini）
- 本地运行，保护隐私
- 快速响应，离线可用

**云端模型（备选）：**
- OpenAI GPT-4o Mini
- Anthropic Claude-3.5 Haiku
- 用户可选择配置API密钥

## 📊 MVP 验证指标

### 核心指标

**核心Agent系统指标：**
- Agent工作流成功率：目标 >95%
- Agent执行效率：目标 <5秒/任务
- 多Agent协作稳定性：目标 >98%
- 系统资源占用：目标 <10MB内存

**用户体验指标：**
- 内容生成质量满意度：目标 >4.5/5
- 系统响应速度：目标 <3秒完整流程
- 错误恢复能力：目标自动恢复 >90%
- 易用性评分：目标 >4.0/5

**技术性能指标：**
- 启动时间：目标 <100ms
- 内存占用：目标 <10MB
- 错误率：目标 <5%
- VS Code集成稳定性：目标 >99%

### 成功标准

**MVP 成功标准：**
1. ✅ 500+ VS Code插件安装
2. ✅ 100+ 成功生成的英语营销网站
3. ✅ 4.0+ 用户评分
4. ✅ 60%+ 完整流程完成率
5. ✅ 获得20+ 用户反馈和改进建议
6. ✅ 验证英语市场的核心价值假设

## 🚧 MVP 限制和约束

### MVP功能限制
- **仅支持英语**：专注验证核心价值，多语言在后续版本
- **单一模板**：1个精选的响应式模板
- **基础内容类型**：首页、关于页、1篇博客文章、简单FAQ
- **基础SEO**：不包含高级SEO分析和优化
- **无协作功能**：专注个人开发者使用场景

### MVP技术限制
- **仅GitHub Pages部署**：简化部署流程，专注核心功能
- **云端AI模型**：使用OpenAI API，不包含本地模型
- **无内容管理**：生成后的内容需要手动编辑
- **基础分析**：不包含详细的网站分析和性能监控

### MVP用户限制
- **面向个人开发者**：不支持团队协作
- **需要GitHub账号**：依赖GitHub Pages部署
- **需要VS Code**：插件形式，需要VS Code环境
- **需要基础英语**：生成的内容为英语

## 🎯 用户故事

### 核心用户故事

**故事1：开源项目英语推广（MVP核心）**
> 作为一个开源项目维护者，我希望能够快速为我的项目生成专业的英语营销网站，这样我就能吸引国际用户和贡献者，而不需要花时间学习英语营销文案写作。

**验收标准：**
- AI能够分析我的开源项目并提取核心价值点
- 生成专业的英语项目介绍和营销内容
- 自动部署到GitHub Pages
- 基础SEO优化，能被英语搜索引擎收录

**故事2：个人项目国际化展示（MVP核心）**
> 作为一个希望展示项目给国际用户的开发者，我希望能够快速建立英语的项目展示网站，这样我就能获得更多的关注和反馈。

**验收标准：**
- AI能够分析我的项目，生成适合国际用户的英语内容
- 生成包含项目特性、使用方法、案例的英语网站
- 包含清晰的项目介绍和使用指南
- 支持GitHub链接和基础联系方式

## 📅 开发计划

### Sprint 1：核心架构 (2周)
- [ ] VS Code插件基础框架
- [ ] 项目分析引擎
- [ ] 基础UI界面
- [ ] 简化配置系统

### Sprint 2：AI内容生成 (2周)
- [ ] OpenAI API集成
- [ ] 英语内容生成算法
- [ ] 单一网站模板
- [ ] 内容质量优化

### Sprint 3：网站构建 (2周)
- [ ] 静态网站生成器
- [ ] 基础SEO优化功能
- [ ] 响应式模板
- [ ] 本地预览功能

### Sprint 4：部署集成 (2周)
- [ ] GitHub Pages集成
- [ ] 自动部署流程
- [ ] 错误处理和日志
- [ ] 用户文档和教程

## 🚀 可扩展功能规划

### 多语言扩展能力
**设计考虑：** MVP架构支持后续多语言扩展
- **西班牙语**：拉美和西班牙市场
- **日语**：高价值的日本市场
- **德语**：欧洲技术中心
- **法语**：法国和加拿大市场
- **葡萄牙语**：巴西市场

### 多平台部署扩展
**设计考虑：** 部署引擎支持多平台适配
- **Vercel**：全球CDN优化
- **Netlify**：JAMstack优化
- **AWS S3**：企业级部署
- **自定义域名**：品牌化支持

### AI Agent智能化扩展
**设计考虑：** AI引擎支持更高级的智能分析
- **全球市场分析**：不同地区的市场机会评估
- **竞品分析**：同类项目的营销策略分析
- **A/B测试**：不同营销内容的效果对比
- **持续学习**：基于用户反馈的内容优化

### 团队协作扩展
**设计考虑：** 架构支持多用户协作
- **团队工作空间**：多人协作编辑
- **品牌管理**：统一的品牌调性和风格
- **审批流程**：内容发布前的审核机制
- **权限管理**：不同角色的访问控制

## 🔄 迭代计划

### MVP 后续迭代

**v1.1：多语言扩展**
- 西班牙语和日语支持
- 多语言网站模板
- 基础的本地化SEO
- 多语言内容管理

**v1.2：平台和功能增强**
- Vercel/Netlify部署支持
- 更多网站模板选择
- 高级SEO分析功能
- 内容效果追踪

**v1.3：AI Agent智能化**
- 市场分析和竞品分析
- 个性化内容生成
- A/B测试功能
- 团队协作功能

---

*文档版本：v1.0*  
*最后更新：2025-01-18*
