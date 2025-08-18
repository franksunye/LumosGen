# LumosGen Scripts

This directory contains utility scripts for development, testing, and maintenance.

## 📁 Script Files

### Development Scripts
- `demo-test.js` - Standalone demo of core functionality
- `test-runner.js` - Test runner for core modules (legacy)

### Build Scripts
- `build.js` - Production build script
- `package.js` - Extension packaging script
- `clean.js` - Clean build artifacts

### Utility Scripts
- `setup-dev.js` - Development environment setup
- `lint-fix.js` - Automatic code formatting
- `docs-gen.js` - Documentation generation

## 🚀 Usage

### Demo Test
```bash
node scripts/demo-test.js
```
Runs a standalone demonstration of LumosGen core functionality without VS Code.

### Development Setup
```bash
node scripts/setup-dev.js
```
Sets up the development environment with all necessary dependencies.

### Build and Package
```bash
npm run build
npm run package
```
Builds and packages the extension for distribution.

## 🧪 Testing Scripts

### Core Functionality Test
The `demo-test.js` script simulates LumosGen functionality:
- Scans for Markdown files
- Generates mock AI content
- Writes output files
- Validates the process

### Integration Testing
Use these scripts to test different scenarios:
- File watching simulation
- Configuration validation
- Error handling
- Performance testing

## 📋 Script Development

### Adding New Scripts
1. Create script in `scripts/` directory
2. Add appropriate documentation
3. Update this README
4. Add npm script if needed

### Script Standards
- Use Node.js for cross-platform compatibility
- Include error handling
- Add progress logging
- Document usage and parameters

## 🔧 Maintenance

### Regular Tasks
- Run `demo-test.js` to verify core functionality
- Use build scripts for releases
- Execute cleanup scripts periodically

### Troubleshooting
- Check script output for error messages
- Verify Node.js version compatibility
- Ensure all dependencies are installed

---

*These scripts help maintain and develop LumosGen efficiently!* 🛠️
