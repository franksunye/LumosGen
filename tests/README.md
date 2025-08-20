# LumosGen 测试套件

本目录包含 LumosGen VS Code 扩展的专业测试套件，基于行业最佳实践构建。

## 📐 测试架构

遵循测试金字塔模型，确保测试效率和质量：

### 🔬 单元测试 (Unit Tests) - 70%
```
tests/unit/
├── ai-service.test.js          # AI服务核心功能
├── content-generator.test.js   # 内容生成器
├── website-builder.test.js     # 网站构建器
├── error-handler.test.js       # 错误处理机制
├── theme-manager.test.js       # 主题管理
├── simple-config.test.js       # 配置管理
├── sidebar-provider.test.js    # 侧边栏提供者
├── monitoring-panel.test.js    # 监控面板
├── context-engineering.test.js # 上下文工程
├── prompt-engineering.test.js  # 提示工程
└── demo.test.js               # 测试框架演示
```

### 🔗 集成测试 (Integration Tests) - 20%
```
tests/integration/
└── end-to-end.test.js         # 端到端集成测试
```

### 🎯 端到端测试 (E2E Tests) - 10%
- 完整用户工作流验证
- VS Code 扩展生命周期测试
- 真实环境功能验证

## 🚀 运行测试

### 基础命令
```bash
# 运行所有测试
npm test
node tests/test-runner.js

# 运行特定测试套件
node tests/test-runner.js suite ai-service.test
node tests/test-runner.js suite content-generator.test

# 列出所有可用测试套件
node tests/test-runner.js list

# 快速验证
npm run test:validate
node tests/quick-validation.js
```

### 专业测试命令
```bash
# 单元测试
npm run test:unit

# 集成测试
npm run test:integration

# 端到端测试
npm run test:e2e

# 覆盖率报告
npm run test:coverage

# 性能测试
npm run test:performance
```

## 🛠️ 测试基础设施

### 核心组件
- **test-config.js** - 测试配置和工具类
- **test-runner.js** - 统一测试运行器
- **quick-validation.js** - 快速系统验证
- **manual-test-helper.js** - 手工测试辅助

### 支持目录
```
tests/
├── fixtures/           # 测试固件和数据
├── mocks/             # Mock对象和数据
├── reports/           # 测试报告输出
└── outputs/           # 测试输出文件
```

## 📊 质量标准

### 覆盖率要求
- **单元测试覆盖率**: ≥ 80%
- **集成测试覆盖率**: 关键路径 100%
- **端到端测试覆盖率**: 核心用户流程 100%

### 性能要求
- **单元测试执行时间**: < 5分钟
- **集成测试执行时间**: < 10分钟
- **测试稳定性**: 失败率 < 1%

## 📝 测试编写规范

### TDD 开发流程
1. **Red**: 编写失败的测试
2. **Green**: 编写最少代码使测试通过
3. **Refactor**: 重构代码保持测试通过

### 测试结构 (AAA Pattern)
```javascript
describe('ComponentName', () => {
  beforeEach(() => {
    // Arrange - 准备测试环境
  });

  it('should perform expected behavior when given valid input', async () => {
    // Arrange - 准备测试数据
    const input = createTestInput();

    // Act - 执行被测试的操作
    const result = await component.process(input);

    // Assert - 验证结果
    expect(result).toMatchExpectedOutput();
  });

  it('should handle error conditions gracefully', () => {
    // 错误处理测试
  });
});
```

### Mock 策略
```javascript
// 外部依赖隔离
const mockAIService = {
  generateContent: jest.fn().mockResolvedValue('mocked content')
};

// VS Code API Mock
const mockVSCode = require('./mocks/vscode-mock');
```

## 🔍 测试分类

### 功能测试
- ✅ **AI服务测试** - 内容生成、API集成
- ✅ **UI组件测试** - 侧边栏、面板交互
- ✅ **配置管理测试** - 设置读取、验证
- ✅ **错误处理测试** - 异常情况处理

### 非功能测试
- ✅ **性能测试** - 响应时间、资源使用
- ✅ **可靠性测试** - 错误恢复、重试机制
- ✅ **兼容性测试** - VS Code版本兼容

## 📈 持续改进

### 测试度量
- 定期审查测试覆盖率
- 监控测试执行时间
- 分析测试失败模式
- 优化测试套件性能

### 最佳实践
- 保持测试独立性
- 使用描述性测试名称
- 定期重构测试代码
- 维护高质量测试数据

---

*基于行业最佳实践，确保 LumosGen 的质量和可靠性。* 🧪

📚 **相关文档**: [测试策略与管理](../docs/TESTING_STRATEGY.md)
