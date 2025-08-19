# LumosGen 测试框架文档

## 🎯 测试框架概述

LumosGen采用分层测试策略，确保代码质量和功能可靠性：

- **单元测试** - 测试独立组件和函数
- **集成测试** - 测试组件间的协作
- **端到端测试** - 测试完整用户工作流
- **性能测试** - 验证响应时间和资源使用
- **手工测试** - 验证用户体验和边界情况

## 🏗️ 测试架构

### 核心组件

```
tests/
├── test-config.js          # 测试配置和工具类
├── test-runner.js          # 统一测试运行器
├── quick-validation.js     # 快速系统验证
├── manual-test-helper.js   # 手工测试辅助
├── unit/                   # 单元测试
│   ├── ai-service.test.js
│   ├── content-generator.test.js
│   └── website-builder.test.js
├── integration/            # 集成测试
│   └── end-to-end.test.js
├── fixtures/               # 测试固件
├── mocks/                  # Mock数据
├── outputs/                # 测试输出
└── reports/                # 测试报告
```

### 测试工具类

#### TestConfig
- 统一的测试配置管理
- 路径管理和目录创建
- 测试报告生成

#### TestUtils
- 异步工具函数（sleep, timeout, retry）
- Mock对象创建
- 对象比较和验证

#### TestAssertions
- 丰富的断言方法
- 类型安全的验证
- 详细的错误信息

## 🚀 使用指南

### 运行所有测试
```bash
npm test
```

### 运行特定类型的测试
```bash
# 单元测试
npm run test:unit

# 集成测试  
npm run test:integration

# 端到端测试
npm run test:e2e
```

### 运行特定测试套件
```bash
# AI服务测试
npm run test:ai

# 内容生成器测试
npm run test:content

# 网站构建器测试
npm run test:website
```

### 快速验证
```bash
# 系统快速验证
npm run test:validate

# 手工测试准备
npm run test:manual-prep

# 列出所有测试套件
npm run test:list
```

### 清理测试文件
```bash
npm run clean
```

## 📝 编写测试

### 单元测试示例

```javascript
const { TestUtils, TestAssertions } = require('../test-config');

const myComponentTests = {
    async setup() {
        // 测试前准备
        this.component = new MyComponent();
    },

    async testBasicFunctionality() {
        const result = await this.component.doSomething();
        
        TestAssertions.assertTrue(result.success, 'Operation should succeed');
        TestAssertions.assertEqual(result.value, 'expected', 'Should return expected value');
    },

    async testErrorHandling() {
        await TestAssertions.assertThrowsAsync(
            () => this.component.doInvalidOperation(),
            Error,
            'Should throw error for invalid operation'
        );
    },

    async teardown() {
        // 测试后清理
        this.component = null;
    }
};

module.exports = myComponentTests;
```

### 集成测试示例

```javascript
const integrationTests = {
    async setup() {
        this.system = new MockSystem();
    },

    async testWorkflow() {
        const input = { /* test data */ };
        const result = await this.system.executeWorkflow(input);
        
        TestAssertions.assertTrue(result.success, 'Workflow should succeed');
        TestAssertions.assertTrue(result.steps.length > 0, 'Should execute steps');
    },

    async teardown() {
        await this.system.cleanup();
    }
};
```

## 🎯 测试最佳实践

### 1. 测试命名
- 使用描述性的测试名称
- 遵循 `test[功能描述]` 格式
- 清楚表达测试意图

### 2. 测试结构
- 使用 setup/teardown 管理测试状态
- 每个测试应该独立运行
- 避免测试间的依赖关系

### 3. 断言使用
- 使用具体的断言方法
- 提供有意义的错误消息
- 验证所有重要的输出

### 4. Mock和Stub
- 隔离被测试的组件
- 模拟外部依赖
- 控制测试环境

### 5. 异步测试
- 正确处理Promise和async/await
- 设置合理的超时时间
- 测试并发场景

## 📊 测试报告

### 报告格式
测试运行器自动生成JSON格式的详细报告：

```json
{
  "summary": {
    "total": 25,
    "passed": 23,
    "failed": 2,
    "skipped": 0,
    "duration": 5432
  },
  "results": [
    {
      "id": "test_1234567890_abc123",
      "name": "testBasicFunctionality",
      "status": "passed",
      "duration": 123,
      "message": "Test passed successfully"
    }
  ],
  "timestamp": "2025-08-19T08:00:00.000Z",
  "environment": {
    "nodeVersion": "v22.17.1",
    "platform": "linux",
    "arch": "x64"
  }
}
```

### 报告位置
- 详细报告：`tests/reports/test-report-[timestamp].json`
- 控制台输出：实时测试结果和摘要

## 🔧 配置选项

### 测试环境配置
```javascript
// tests/test-config.js
this.testEnv = {
    timeout: 30000,     // 测试超时时间
    retries: 3,         // 重试次数
    parallel: false,    // 是否并行执行
    verbose: true       // 详细输出
};
```

### Mock配置
```javascript
this.mockConfig = {
    aiService: {
        responseDelay: 100,
        errorRate: 0.05,
        simulateNetworkIssues: false
    },
    github: {
        simulateDeployment: true,
        deploymentDelay: 1000
    }
};
```

## 🚨 故障排除

### 常见问题

#### 1. 测试超时
```bash
Error: Timeout after 30000ms
```
**解决方案：**
- 增加超时时间
- 检查异步操作是否正确处理
- 优化测试性能

#### 2. Mock对象错误
```bash
Error: Cannot read property 'method' of undefined
```
**解决方案：**
- 确保Mock对象正确初始化
- 检查方法名称拼写
- 验证Mock对象结构

#### 3. 文件路径错误
```bash
Error: ENOENT: no such file or directory
```
**解决方案：**
- 使用TestConfig获取正确路径
- 确保测试文件存在
- 检查相对路径设置

### 调试技巧

#### 1. 启用详细输出
```bash
# 设置环境变量
DEBUG=true npm test
```

#### 2. 运行单个测试
```bash
npm run test:ai  # 只运行AI服务测试
```

#### 3. 检查测试报告
```bash
# 查看最新的测试报告
cat tests/reports/test-report-*.json | tail -1
```

## 📈 持续集成

### GitHub Actions配置
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:validate
      - run: npm test
```

### 测试覆盖率
```bash
# 安装覆盖率工具
npm install --save-dev nyc

# 运行带覆盖率的测试
npx nyc npm test
```

## 🎯 质量标准

### 通过标准
- 单元测试覆盖率 > 80%
- 集成测试通过率 > 95%
- 性能测试达到基准要求
- 无严重错误或内存泄漏

### 代码质量
- 所有测试必须有清晰的文档
- 遵循一致的命名约定
- 适当的错误处理和边界测试
- 定期重构和维护测试代码

---

**维护者：** LumosGen开发团队  
**最后更新：** 2025-08-19  
**版本：** 1.0.0
