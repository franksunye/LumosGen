# Contributing to LumosGen

Thank you for your interest in contributing to LumosGen! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 16.x or higher
- VS Code 1.74.0 or higher
- Git

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/LumosGen.git`
3. Install dependencies: `npm install`
4. Open in VS Code and press F5 to start debugging

## 📋 Development Workflow

### Project Structure
```
LumosGen/
├── src/                 # Source code
│   ├── extension.ts     # Main extension entry
│   ├── config.ts        # Configuration management
│   ├── watcher.ts       # File watching logic
│   ├── aiClient.ts      # AI service integration
│   └── writer.ts        # Content writing utilities
├── docs/                # Documentation
├── examples/            # Example files
├── scripts/             # Build and utility scripts
└── tests/               # Test files
```

### Coding Standards
- Use TypeScript with strict mode
- Follow ESLint configuration
- Add JSDoc comments for public APIs
- Write unit tests for new features

### Commit Guidelines
- Use conventional commit format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore
- Keep commits atomic and focused

### Pull Request Process
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and add tests
3. Ensure all tests pass: `npm test`
4. Update documentation if needed
5. Submit a pull request with clear description

## 🧪 Testing

### Running Tests
```bash
npm test                 # Run all tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests
```

### Test Coverage
- Aim for >80% code coverage
- Test both happy path and error cases
- Include integration tests for VS Code API usage

## 📝 Documentation

### Documentation Standards
- Update README.md for user-facing changes
- Add JSDoc comments for new APIs
- Update CHANGELOG.md for releases
- Include examples for new features

### Writing Guidelines
- Use clear, concise language
- Include code examples
- Add screenshots for UI changes
- Keep documentation up-to-date

## 🐛 Bug Reports

### Before Submitting
- Check existing issues
- Test with latest version
- Gather system information

### Bug Report Template
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior.

**Expected behavior**
What you expected to happen.

**Environment**
- OS: [e.g. Windows 10]
- VS Code version: [e.g. 1.74.0]
- LumosGen version: [e.g. 0.1.0]
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Additional context**
Any other context about the feature request.
```

## 🏷️ Release Process

### Version Numbering
- Follow Semantic Versioning (SemVer)
- Major.Minor.Patch format
- Update CHANGELOG.md for each release

### Release Checklist
- [ ] Update version in package.json
- [ ] Update CHANGELOG.md
- [ ] Run full test suite
- [ ] Build and test extension package
- [ ] Create release notes
- [ ] Tag release in Git

## 📞 Getting Help

- 📖 Check the [documentation](./README.md)
- 🐛 Search [existing issues](https://github.com/your-repo/LumosGen/issues)
- 💬 Start a [discussion](https://github.com/your-repo/LumosGen/discussions)
- 📧 Contact maintainers

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to LumosGen! ✨
