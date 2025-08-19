# LumosGen Scripts

This directory contains utility scripts for development, testing, and maintenance.

## 📁 Script Files

### Development Scripts
- `demo-test.js` - Standalone demo of core functionality

> **Note**: For comprehensive testing, see the `tests/` directory which contains the main test suite including sprint tests and integration tests.

## 🚀 Usage

### Demo Test
```bash
npm run demo
# or
npm test
# or
node scripts/demo-test.js
```
Runs a standalone demonstration of LumosGen core functionality without VS Code.

### Build and Package
```bash
npm run compile
npm run package
```
Compiles TypeScript and packages the extension for distribution.

## 🧪 Testing

### Demo Test
The `demo-test.js` script simulates LumosGen functionality:
- Scans for Markdown files in the current directory
- Generates mock AI content
- Writes output to `LumosGen-Summary.md`
- Validates the complete process

### Comprehensive Testing
For full test coverage, use the main test suite:
```bash
# Run specific sprint tests
node tests/sprint1.test.js
node tests/sprint2.test.js
# etc.
```

The `tests/` directory contains comprehensive integration tests, mock AI agent tests, and sprint-specific functionality tests.

## 📋 Development

### Adding New Scripts
1. Create script in `scripts/` directory
2. Add appropriate documentation
3. Update this README
4. Add npm script in `package.json` if needed

### Script Standards
- Use Node.js for cross-platform compatibility
- Include error handling and progress logging
- Document usage and parameters
- Follow the existing code style

## 🔧 Maintenance

### Regular Tasks
- Run `npm run demo` to verify core functionality
- Use `npm run compile` before testing changes
- Check `tests/` directory for comprehensive testing

### Troubleshooting
- Ensure TypeScript compilation succeeds: `npm run compile`
- Check that all dependencies are installed: `npm install`
- Verify Node.js version compatibility (16.x recommended)

---

*Keep it simple and focused! For complex testing, use the `tests/` directory.* 🛠️
