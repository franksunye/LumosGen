# LumosGen Project Structure

This document describes the organization and structure of the LumosGen VS Code extension project.

## 📁 Directory Structure

```
LumosGen/
├── 📁 .vscode/              # VS Code workspace configuration
│   ├── launch.json          # Debug configuration
│   └── tasks.json           # Build tasks
├── 📁 docs/                 # Documentation
│   ├── README.md            # Documentation index
│   ├── DESIGN_DOCUMENT.md   # Technical design
│   ├── QUICK_START.md       # Quick start guide
│   ├── DEBUG_GUIDE.md       # Debugging guide
│   ├── TESTING_GUIDE.md     # Testing procedures
│   ├── TEST_REPORT.md       # Test results
│   └── CONTRIBUTING.md      # Contribution guidelines
├── 📁 examples/             # Example files and demos
│   ├── README.md            # Examples documentation
│   ├── test-content.md      # Sample content file
│   └── another-test.md      # Additional sample
├── 📁 scripts/              # Utility scripts
│   ├── README.md            # Scripts documentation
│   ├── demo-test.js         # Standalone demo
│   └── test-runner.js       # Test runner (legacy)
├── 📁 src/                  # Source code
│   ├── extension.ts         # Main extension entry point
│   ├── config.ts            # Configuration management
│   ├── watcher.ts           # File watching logic
│   ├── aiClient.ts          # AI service integration
│   └── writer.ts            # Content writing utilities
├── 📁 out/                  # Compiled JavaScript (generated)
├── 📁 node_modules/         # Dependencies (generated)
├── 📄 package.json          # Extension manifest and dependencies
├── 📄 package-lock.json     # Dependency lock file
├── 📄 tsconfig.json         # TypeScript configuration
├── 📄 README.md             # Main project documentation
├── 📄 CHANGELOG.md          # Version history
├── 📄 LICENSE               # MIT license
├── 📄 .gitignore            # Git ignore rules
└── 📄 PROJECT_STRUCTURE.md  # This file
```

## 🏗️ Architecture Overview

### Core Modules

#### `src/extension.ts`
- **Purpose**: Main extension entry point
- **Responsibilities**: 
  - Extension activation/deactivation
  - Command registration
  - Configuration change handling
  - User interface integration

#### `src/config.ts`
- **Purpose**: Configuration management
- **Responsibilities**:
  - Load and validate user settings
  - Provide configuration access
  - Handle configuration updates

#### ~~`src/watcher.ts`~~ ❌ REMOVED (PoC Legacy)
- **Was**: File system monitoring for automatic content generation
- **Replaced by**: Manual triggers via sidebar interface (MVP approach)

#### ~~`src/aiClient.ts`~~ ❌ REMOVED (PoC Legacy)
- **Was**: Generic AI service integration for file-watching workflow
- **Replaced by**: `src/ai/SimpleAI.ts` and `src/content/MarketingContentGenerator.ts`

#### ~~`src/writer.ts`~~ ❌ REMOVED (PoC Legacy)
- **Was**: Single-file content writing for PoC
- **Replaced by**: `src/website/WebsiteBuilder.ts` for complete website generation

### Data Flow

```
File Change → Watcher → AI Client → Writer → Output File
     ↑           ↓         ↓          ↓         ↓
Configuration ← Config ← Templates ← Metadata ← User Feedback
```

## 📚 Documentation Structure

### User Documentation
- `README.md` - Main user guide
- `docs/QUICK_START.md` - Getting started
- `examples/` - Practical examples

### Developer Documentation
- `docs/DESIGN_DOCUMENT.md` - Technical architecture
- `docs/CONTRIBUTING.md` - Development guidelines
- `PROJECT_STRUCTURE.md` - This document

### Testing Documentation
- `docs/TESTING_GUIDE.md` - Testing procedures
- `docs/TEST_REPORT.md` - Test results
- `docs/DEBUG_GUIDE.md` - Debugging help

## 🔧 Build and Development

### Key Files
- `package.json` - Extension manifest, dependencies, scripts
- `tsconfig.json` - TypeScript compilation settings
- `.vscode/` - VS Code workspace configuration

### Generated Files
- `out/` - Compiled JavaScript files
- `node_modules/` - Installed dependencies
- `*.vsix` - Extension package files

## 📦 Distribution

### Included in Package
- Compiled JavaScript (`out/`)
- Extension manifest (`package.json`)
- Documentation (`README.md`, `CHANGELOG.md`)
- License (`LICENSE`)

### Excluded from Package
- Source TypeScript files (`src/`)
- Development documentation (`docs/`)
- Test files and scripts
- Build artifacts

## 🎯 Design Principles

### Modularity
- Clear separation of concerns
- Loosely coupled components
- Reusable modules

### Maintainability
- Comprehensive documentation
- Consistent code structure
- Clear naming conventions

### Extensibility
- Plugin architecture for AI services
- Template system for content generation
- Configuration-driven behavior

### User Experience
- Intuitive configuration
- Clear feedback and error messages
- Non-intrusive operation

---

*This structure supports the professional development and maintenance of LumosGen.* 🏗️
