# LumosGen MVP 规格说明

## 🎯 MVP 概述

**目标：** 验证"开发者愿意使用AI Agent自动生成英语营销内容"的核心价值假设

**核心假设：** 开发者愿意使用AI工具基于GitHub项目自动生成英语营销网站，以进入国际市场并提升项目影响力。

**MVP聚焦：** 最小可行的Marketing AI Agent - 专注英语市场，验证核心价值后再扩展到多语言和多平台。

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

### 3. 英语营销网站生成
**功能描述：** 生成专业的英语营销网站
- 响应式网站模板（1个精选模板）
- 基础SEO优化结构
- 现代化设计风格
- 快速加载性能

**网站结构（MVP简化）：**
```
/
├── index.html          # 营销首页
├── about.html          # 项目详情
├── blog/              # 博客目录
│   └── post1.html     # 1篇示例文章
├── assets/            # 静态资源
└── sitemap.xml        # 基础站点地图
```

### 4. GitHub Pages部署
**功能描述：** 自动部署到GitHub Pages
- 自动创建gh-pages分支
- 推送生成的网站文件
- 基础域名配置
- 简单的部署状态反馈

### 5. 基础SEO优化
**功能描述：** 英语网站的基础SEO优化
- 语义化HTML结构
- Meta标签和描述优化
- Open Graph社交分享标签
- 基础结构化数据
- 站点地图生成

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

**主要操作流程（MVP简化）：**
1. 点击"Analyze Project" → AI分析项目特征和营销要点
2. 点击"Generate Content" → AI生成英语营销内容
3. 点击"Preview Website" → 本地预览生成的网站
4. 点击"Deploy to GitHub Pages" → 一键部署到GitHub Pages

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

**1. 知识库分析器 (KnowledgeBaseAnalyzer)**
```typescript
interface KnowledgeBaseAnalysis {
  structure: FileStructure;
  techStack: TechStack[];
  features: Feature[];
  documents: MarkdownDocument[];
  contentAssets: ContentAsset[];
  metadata: ProjectMetadata;
}
```

**2. 营销内容生成器 (MarketingContentGenerator)**
```typescript
interface MarketingContentGenerator {
  generateMarketingHomepage(analysis: KnowledgeBaseAnalysis): string;
  generateMarketingBlogPost(topic: string, analysis: KnowledgeBaseAnalysis): string;
  generateUserFAQ(analysis: KnowledgeBaseAnalysis): string;
  transformTechnicalToMarketing(content: string): string;
}
```

**3. 网站构建器 (SiteBuilder)**
```typescript
interface SiteBuilder {
  buildSite(content: GeneratedContent): StaticSite;
  optimizeForSEO(site: StaticSite): StaticSite;
  generateSitemap(site: StaticSite): string;
}
```

**4. 部署管理器 (DeployManager)**
```typescript
interface DeployManager {
  deployToGitHubPages(site: StaticSite): Promise<DeployResult>;
  updateDeployment(site: StaticSite): Promise<UpdateResult>;
}
```

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

**使用指标（MVP聚焦）：**
- 插件安装数量：目标 500+ 安装
- 活跃用户数：目标 100+ 周活跃用户
- 英语内容生成成功率：目标 >90%

**质量指标：**
- 用户满意度：目标 4.0+ 星评分
- 内容质量评分：目标 >80% 用户认为生成的英语内容有用
- 网站访问量：目标生成的网站平均月访问 >100

**转化指标：**
- 完整流程完成率：目标 >60%
- 重复使用率：目标 >40%
- 推荐意愿：目标 NPS >30

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
