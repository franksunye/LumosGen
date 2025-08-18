# LumosGen 快速启动指南

## 🚀 问题已修复！

✅ **任务配置已修复** - VS Code 任务现在可以正常工作  
✅ **编译测试通过** - TypeScript 编译无错误  
✅ **调试配置更新** - launch.json 已正确配置  

## 📋 现在可以开始测试了！

### 步骤 1: 启动扩展开发环境

1. 在 VS Code 中确保 LumosGen 项目已打开
2. 按 `F5` 或点击 "Run and Debug" → "Run Extension"
3. VS Code 会自动编译代码并启动新的扩展开发窗口

### 步骤 2: 验证插件激活

在新打开的窗口中：
1. 查看右下角状态栏是否有 LumosGen 相关信息
2. 打开输出面板：`View` → `Output` → 选择 "LumosGen"
3. 应该看到类似以下的激活日志：
   ```
   LumosGen extension activated
   Starting LumosGen file watcher...
   Created watcher for pattern: **/*.md
   File watcher started with 1 pattern(s)
   ```

### 步骤 3: 测试自动生成功能

1. 在新窗口中创建一个测试文件：`test.md`
2. 添加一些内容：
   ```markdown
   # 我的测试文档
   
   这是一个测试文档，用来验证 LumosGen 的功能。
   
   ## 功能特性
   - 自动监听文件变化
   - AI 驱动的内容生成
   - 智能摘要创建
   ```
3. 保存文件 (`Ctrl+S`)
4. 等待 1-2 秒
5. 查看是否生成了 `LumosGen-Summary.md` 文件

### 步骤 4: 测试手动生成

1. 打开命令面板 (`Ctrl+Shift+P`)
2. 输入 "LumosGen: Generate Content"
3. 执行命令
4. 观察输出面板的日志信息

### 步骤 5: 验证生成的内容

打开生成的 `LumosGen-Summary.md` 文件，应该包含：
- 元数据注释（生成时间、模型等）
- 文件分析列表
- 自动生成的摘要
- 关键点总结

## 🎯 预期结果

如果一切正常，您应该看到：
- ✅ 插件成功激活
- ✅ 文件监听器启动
- ✅ 保存 .md 文件后自动生成内容
- ✅ 生成的摘要文件包含有意义的内容
- ✅ 手动生成命令正常工作

## 🔧 如果遇到问题

### 插件未激活
- 检查输出面板是否有错误信息
- 确认 VS Code 版本 ≥ 1.74.0
- 重新按 F5 启动

### 文件未生成
- 检查工作区是否有写入权限
- 确认配置中的文件模式匹配
- 查看输出面板的详细日志

### 配置问题
- 打开设置 (`Ctrl+,`) 搜索 "lumosgen"
- 验证配置项是否正确
- 尝试重置为默认配置

## 🎉 成功标志

当您看到以下内容时，说明 LumosGen 工作正常：

1. **激活消息**: "LumosGen is now active! 🔮✨"
2. **生成通知**: "LumosGen: Content generated and saved to LumosGen-Summary.md"
3. **输出文件**: 包含智能生成内容的摘要文件

---

**准备好了吗？按 F5 开始体验 LumosGen 的魔法！** ✨
