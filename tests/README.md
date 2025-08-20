# LumosGen 测试套件

本目录包含 LumosGen VS Code 扩展的专业测试套件，基于行业最佳实践构建。

## 📐 测试架构

遵循测试金字塔模型，确保测试效率和质量：

### 🔬 单元测试 (Unit Tests) - 70%
```
tests/unit/
├── ai-service.test.ts          # AI服务核心功能
├── content-generator.test.ts   # 内容生成器
├── website-builder.test.ts     # 网站构建器
├── error-handler.test.ts       # 错误处理机制
├── theme-manager.test.ts       # 主题管理
├── simple-config.test.ts       # 配置管理
├── sidebar-provider.test.ts    # 侧边栏提供者
├── monitoring-panel.test.ts    # 监控面板
├── context-engineering.test.ts # 上下文工程
├── prompt-engineering.test.ts  # 提示工程
├── agent-system.test.ts        # 智能代理系统
└── demo.test.ts               # 测试框架演示
```

### 🔗 集成测试 (Integration Tests) - 20%
```
tests/integration/
└── end-to-end.test.ts         # 端到端集成测试
```

### 🎯 性能测试 (Performance Tests) - 10%
```
tests/
├── deployment-e2e.test.ts        # 部署端到端测试
└── deployment-performance.test.ts # 部署性能测试
```

## 🚀 运行测试

### 现代化测试命令 (Vitest)
```bash
# 运行所有测试
npm test
npm run test:run

# 监视模式
npm run test:watch

# 测试UI界面
npm run test:ui

# 覆盖率报告
npm run test:coverage

# 运行特定测试套件
npm run test:unit          # 单元测试
npm run test:integration   # 集成测试
npm run test:ai           # AI服务测试
npm run test:content      # 内容生成测试
npm run test:website      # 网站构建测试
npm run test:config       # 配置管理测试
npm run test:theme        # 主题管理测试
npm run test:sidebar      # 侧边栏测试
```

### 其他测试工具
```bash
# 清理测试输出
npm run clean

# 运行演示测试
npm run demo
```

## 🛠️ 测试基础设施

### 现代化测试架构 (TypeScript + Vitest)
- **vitest.config.ts** - Vitest测试配置
- **tests/setup/vitest.setup.ts** - 全局测试设置
- **tests/mocks/vscode.mock.ts** - VS Code API Mock

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
