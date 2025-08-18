# LumosGen Tests

This directory contains test files for the LumosGen VS Code extension.

## 📁 Test Structure

### Unit Tests
- Test individual modules and functions
- Mock external dependencies
- Verify core functionality

### Integration Tests
- Test VS Code API integration
- Verify file system operations
- Test AI service interactions

### End-to-End Tests
- Test complete user workflows
- Verify extension activation and commands
- Test real file watching scenarios

## 🧪 Running Tests

### Prerequisites
- VS Code Extension Test Runner
- Node.js test framework (Jest/Mocha)
- Mock VS Code environment

### Test Commands
```bash
npm test                 # Run all tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests
npm run test:e2e         # End-to-end tests
```

## 📋 Test Categories

### Core Module Tests
- `config.test.ts` - Configuration management
- `watcher.test.ts` - File watching logic
- `aiClient.test.ts` - AI service integration
- `writer.test.ts` - Content writing utilities

### Integration Tests
- `extension.test.ts` - Extension lifecycle
- `commands.test.ts` - Command execution
- `vscode-api.test.ts` - VS Code API usage

### Mock Data
- Sample Markdown files
- Mock AI responses
- Test configurations

## 🎯 Test Coverage Goals

- **Unit Tests**: >80% code coverage
- **Integration Tests**: All VS Code API interactions
- **E2E Tests**: Complete user workflows

## 📝 Writing Tests

### Test Standards
- Use descriptive test names
- Include both positive and negative cases
- Mock external dependencies
- Test error conditions

### Example Test Structure
```typescript
describe('LumosGen Module', () => {
  beforeEach(() => {
    // Setup
  });

  it('should handle normal operation', () => {
    // Test implementation
  });

  it('should handle error conditions', () => {
    // Error testing
  });
});
```

---

*Tests ensure LumosGen reliability and quality.* 🧪
