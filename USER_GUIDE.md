# 📚 LumosGen 完整用户指南

## 🎯 产品概述

**LumosGen** 是一个AI驱动的VS Code扩展，能够将您的GitHub项目转换为专业的营销网站。它分析您的代码，生成营销内容，构建响应式网站，并部署到GitHub Pages - 只需几次点击即可完成。

## 🚀 快速开始

### 系统要求
- VS Code 1.74.0 或更高版本
- Node.js 16.x 或更高版本
- Git仓库（用于部署）

### 安装步骤

1. **克隆并安装**
   ```bash
   git clone https://github.com/franksunye/LumosGen
   cd LumosGen
   npm install
   npm run compile
   ```

2. **启动扩展开发**
   - 在VS Code中打开项目
   - 按 `F5` 启动扩展开发主机
   - 在新的VS Code窗口中打开您的目标项目

3. **打开LumosGen侧边栏**
   - 转到 视图 → LumosGen
   - 或使用命令面板：`LumosGen: Analyze Project`

## 📋 完整工作流程

### 步骤1：分析项目 🔍
1. 点击侧边栏中的 **"📊 Analyze Project"**
2. LumosGen将：
   - 扫描项目结构
   - 识别编程语言和框架
   - 解析README.md获取功能描述
   - 提取项目元数据

### 步骤2：生成营销内容 🤖
1. 点击 **"🤖 Generate Content"**
2. 系统将创建：
   - **首页** - 专业着陆页面
   - **关于页面** - 详细项目概述
   - **博客文章** - 技术文章
   - **FAQ** - 常见问题解答
   - **SEO元数据** - 优化的关键词和描述

### 步骤3：选择网站主题 🎨

#### 主题选择界面
在LumosGen侧边栏中，您会看到"🎨 Website Theme"部分：

```
┌─────────────────────────────────────┐
│  🎨 Website Theme                    │
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐ │
│  │ [蓝色渐变] Modern            ✓ │ │
│  │ Clean & minimalist design       │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │ [绿色渐变] Technical           │ │
│  │ Code-focused & professional     │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### 可用主题详情

**1. Modern主题（默认）**
- **设计风格**: 现代简约
- **特点**:
  - 清爽简洁的设计
  - 圆角元素 (0.5rem)
  - 蓝色主色调 (#3b82f6)
  - Inter 字体
  - 平滑过渡效果
- **适用场景**: 产品展示、创业项目、商业网站

**2. Technical主题**
- **设计风格**: 技术专业
- **特点**:
  - 代码风格设计
  - 终端美学
  - 绿色科技感 (#10b981)
  - 等宽字体 (JetBrains Mono)
  - 直角设计 (0.25rem)
- **适用场景**: 开源项目、技术工具、开发者产品

#### 主题选择步骤
1. 在VS Code中点击左侧的LumosGen图标
2. 在"🎨 Website Theme"部分点击您喜欢的主题
3. 选中的主题会显示 ✓ 标记
4. 系统会显示主题切换成功的提示

#### 主题选择建议
- **技术产品**: 选择Technical主题
- **商业产品**: 选择Modern主题
- **开源项目**: Technical主题更受开发者欢迎
- **创业公司**: Modern主题更专业商务

### 步骤4：构建营销网站 🏗️
1. 点击 **"🎨 Preview Website"**
2. 系统将：
   - 生成响应式HTML网站
   - 应用选择的主题样式
   - 优化SEO（元标签、结构化数据、站点地图）
   - 创建移动优先的响应式设计

### 步骤5：部署到GitHub Pages 🚀
1. 点击 **"🚀 Deploy to GitHub Pages"**
2. 系统将：
   - 自动创建 `gh-pages` 分支
   - 推送网站文件到GitHub
   - 配置GitHub Pages部署
   - 开始监控部署健康状态

**预期结果**：
- 在 `https://your-username.github.io/your-repo` 访问您的网站
- 平均部署时间：17.5秒
- 部署成功率：100%

## 🤖 AI服务配置

### 支持的AI提供商
LumosGen支持多个AI服务提供商，具有智能降级策略：

1. **DeepSeek**（推荐）- 成本最低
2. **OpenAI** - 备选方案
3. **Mock模式** - 开发测试

### 配置步骤
1. 打开VS Code设置 → 扩展 → LumosGen
2. 配置API密钥：
   ```json
   {
     "lumosGen.aiService": {
       "deepseekApiKey": "your-deepseek-key",
       "deepseekModel": "deepseek-chat",
       "openaiApiKey": "your-openai-key",
       "openaiModel": "gpt-4o-mini",
       "degradationStrategy": ["deepseek", "openai", "mock"]
     }
   }
   ```

### 成本优化建议
- **DeepSeek优惠时段**：UTC 16:30-00:30（北京时间 00:30-08:30）
- **成本对比**：
  - DeepSeek（优惠）：~90% 节省 vs OpenAI
  - DeepSeek（标准）：~45% 节省 vs OpenAI

## 📊 AI监控和成本管理

### 实时监控
在VS Code状态栏查看实时状态：
```
$(pulse) DeepSeek | $0.023 | 15 reqs
```
- 当前AI提供商
- 总花费金额
- 总请求次数

### 详细监控面板
**打开方式**：
1. 点击状态栏的LumosGen状态
2. 命令面板：`LumosGen: Show AI Monitoring`
3. 侧边栏中的"AI Monitoring"按钮

**功能包括**：
- 💰 成本概览（总计、今日、节省估算）
- 📊 使用统计（请求数、Token数、成功率）
- 🔄 提供商状态（当前、可用、健康检查）
- 📈 分提供商详细统计
- 📥 数据导出功能
- 🗑️ 统计重置选项

### 成本控制
- **每日限额**：超过$10时显示警告
- **总额限额**：超过$100时显示警告
- **实时跟踪**：状态栏显示当前花费

## 🎨 主题自定义和高级功能

### 主题自定义选项
每个主题都支持丰富的自定义选项：

#### Modern主题自定义
- **主色调**: 蓝色系列 (#3b82f6, #8b5cf6, #10b981, #f59e0b, #ef4444, #ec4899)
- **辅色调**: 灰色系列 (#64748b, #6b7280, #9ca3af, #d1d5db)
- **字体**: Inter, Roboto, Open Sans, Lato, Poppins
- **圆角**: 0, 0.25rem, 0.5rem, 0.75rem, 1rem

#### Technical主题自定义
- **主色调**: 绿色系列 (#10b981, #06b6d4, #8b5cf6, #f59e0b, #ef4444, #84cc16)
- **辅色调**: 深灰系列 (#374151, #4b5563, #6b7280, #9ca3af)
- **字体**: JetBrains Mono, Source Code Pro, Ubuntu Mono, Roboto Mono
- **圆角**: 0, 0.125rem, 0.25rem, 0.375rem

### 主题配置持久化
```typescript
// 主题配置会自动保存到 VS Code 设置中
{
    "lumosGen.theme": "technical",
    "lumosGen.primaryColor": "#10b981",
    "lumosGen.fontFamily": "JetBrains Mono, monospace"
}
```

### 高级功能
- **项目级主题配置**: 每个项目可以有独立的主题设置
- **团队协作**: 通过配置文件共享主题设置
- **主题扩展**: 架构支持添加更多主题
- **预览效果**: 主题选择后立即在界面显示
- **配置保存**: 下次打开VS Code时会记住选择

### 主题故障排除
**主题切换不生效**:
1. 确保已选择主题（有 ✓ 标记）
2. 重新生成网站
3. 检查输出日志中的主题信息

**主题显示异常**:
1. 刷新 VS Code 窗口
2. 重新打开 LumosGen 侧边栏
3. 检查是否有编译错误

**自定义配置丢失**:
1. 检查 VS Code 设置
2. 确认配置文件权限
3. 重新设置主题选项

## ⌨️ 快捷键

- `Ctrl+Shift+L A` - 分析项目
- `Ctrl+Shift+L G` - 生成营销内容
- `Ctrl+Shift+L D` - 部署到GitHub Pages

## 📁 生成的文件结构

```
your-project/
├── lumosgen-website/          # 生成的网站
│   ├── index.html            # 首页
│   ├── about.html            # 关于页面
│   ├── blog.html             # 博客文章
│   ├── faq.html              # FAQ页面
│   ├── style.css             # 主题样式
│   ├── sitemap.xml           # SEO站点地图
│   ├── robots.txt            # 搜索引擎指令
│   └── .nojekyll             # GitHub Pages配置
└── .lumosgen/                # LumosGen数据
    └── logs/                 # 错误日志
        └── error.log         # 详细错误记录
```

## 🔧 故障排除

### 常见问题

**1. "未找到工作区文件夹"**
- 解决方案：在VS Code中打开文件夹（文件 → 打开文件夹）

**2. "不是Git仓库"**
- 解决方案：初始化Git并添加远程源：
  ```bash
  git init
  git remote add origin https://github.com/username/repo
  ```

**3. 部署时"权限被拒绝"**
- 解决方案：检查Git凭据和仓库访问权限

**4. AI服务调用失败**
- 解决方案：检查API密钥配置和网络连接

### 智能错误恢复
LumosGen包含智能错误处理：
- 自动错误检测和用户友好消息
- 常见问题的恢复建议
- 详细错误日志记录
- 一键恢复操作

## 📊 性能指标

### 预期性能
- ✅ 项目分析：< 5秒
- ✅ 内容生成：< 10秒
- ✅ 网站构建：< 15秒
- ✅ GitHub Pages部署：< 30秒
- ✅ 监控响应时间：< 2秒

### 内容质量
- **首页**：1200+ 字符的专业营销文案
- **关于页面**：1700+ 字符的详细项目描述
- **博客文章**：1300+ 字符的技术见解
- **FAQ**：1000+ 字符的全面问答

## 🔐 隐私和安全

### 数据保护
- **本地存储**：所有监控数据存储在本地
- **不上传**：不向外部服务发送监控数据
- **加密传输**：API调用使用HTTPS加密

### 敏感信息
- **API密钥**：安全存储在VS Code设置中
- **使用数据**：仅用于本地监控和优化
- **导出控制**：用户完全控制数据导出

## 🆘 获取帮助

### 内置帮助
- **输出通道**：视图 → 输出 → LumosGen查看详细日志
- **错误日志**：检查 `.lumosgen/logs/error.log` 进行调试
- **命令面板**：搜索"LumosGen"查看所有可用命令

### 技术支持
- **GitHub Issues**：[提交问题](https://github.com/franksunye/LumosGen/issues)
- **功能请求**：[功能建议](https://github.com/franksunye/LumosGen/discussions/categories/ideas)
- **用户反馈**：[改进建议](https://github.com/franksunye/LumosGen/discussions/categories/feedback)

## 🎉 成功案例

使用LumosGen成功创建营销网站后，您将获得：
- ✅ 专业的响应式网站设计
- ✅ SEO优化的内容和结构
- ✅ 自动化的GitHub Pages部署
- ✅ 实时的性能监控
- ✅ 成本优化的AI服务

---

**💡 提示**：定期查看AI监控面板以优化使用成本，在DeepSeek优惠时段进行批量内容生成可节省高达90%的费用！

**LumosGen** - 将代码转化为营销魔法 ✨
