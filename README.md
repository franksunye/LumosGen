# LumosGen - AI-Powered Marketing Website Generator for VS Code

> *"Lumos!"* - Illuminate your project's marketing potential with AI ✨

**Status: Sprint 3 Completed - Website Builder Ready** 🎉

LumosGen is a VS Code extension that transforms your GitHub projects into professional marketing websites using AI. Analyze your project, generate compelling marketing content, and build responsive websites - all from within VS Code.

## 🌟 Features

### ✅ Completed (Sprint 1-3)
- **📊 Smart Project Analysis**: Automatically analyzes GitHub project structure, tech stack, and features
- **🤖 AI Marketing Content**: Generates professional homepage, about page, blog posts, and FAQ
- **🏗️ Website Builder**: Creates responsive marketing websites with modern design
- **🎨 Responsive Templates**: Mobile-first design with Tailwind CSS and dark/light themes
- **🔍 SEO Optimization**: Complete SEO with meta tags, structured data, and sitemaps
- **📁 Simple Preview**: Shows generated website location for easy developer access
- **🌍 Internationalization**: Multi-language support (English, Spanish, Japanese)
- **⚙️ Flexible Configuration**: Multiple AI providers and customizable content options

### 📋 Coming Soon (Sprint 4)
- **🚀 GitHub Pages Deployment**: One-click deployment to GitHub Pages
- **📊 Deployment Monitoring**: Real-time deployment status and health checks
- **🛠️ Enhanced Commands**: Improved command palette integration

## 🚀 Development Setup

### Prerequisites
- VS Code 1.74.0 or higher
- Node.js 16.x or higher

### Getting Started
1. Clone this repository
2. Install dependencies: `npm install`
3. Compile TypeScript: `npm run compile`
4. Press `F5` in VS Code to launch Extension Development Host

## 🚀 Quick Start

1. **Install the Extension** (when published)
2. **Open your GitHub project** in VS Code
3. **Open LumosGen sidebar** (View → LumosGen)
4. **Follow the workflow:**
   - 📊 **Analyze Project** → AI analyzes your project structure
   - 🤖 **Generate Content** → Creates professional marketing content
   - 🎨 **Preview Website** → Builds responsive website and shows location
   - 🚀 **Deploy** → (Coming in Sprint 4) Deploy to GitHub Pages

## ⚙️ Configuration

Configure LumosGen through VS Code settings (`Ctrl+,` → search "lumosgen"):

```json
{
  "lumosGen.language": "en",
  "lumosGen.marketingSettings": {
    "tone": "professional",
    "includeCodeExamples": true,
    "targetMarkets": ["global"],
    "seoOptimization": true
  },
  "lumosGen.aiService": {
    "type": "mock",
    "endpoint": "https://api.openai.com/v1",
    "apiKey": "",
    "model": "gpt-4o-mini"
  }
}
```

### Configuration Options

| Setting | Description | Default |
|---------|-------------|---------|
| `enabled` | Enable/disable the extension | `true` |
| `watchPatterns` | File patterns to monitor | `["**/*.md"]` |
| `outputFile` | Generated content output file | `"LumosGen-Summary.md"` |
| `aiService.type` | AI service type (`mock` or `openai`) | `"mock"` |
| `aiService.endpoint` | API endpoint URL | `""` |
| `aiService.apiKey` | API key for authentication | `""` |
| `aiService.model` | AI model to use | `"gpt-3.5-turbo"` |
| `triggerDelay` | Delay before generation (ms) | `2000` |
| `template` | Generation template | `"summary"` |

## 🎯 Usage

### Automatic Generation

1. Save any Markdown file in your workspace
2. LumosGen will automatically detect the change
3. After a brief delay, content will be generated
4. Check the output file (default: `LumosGen-Summary.md`)

### Manual Generation

- **Command Palette**: `Ctrl+Shift+P` → "LumosGen: Generate Content"
- **Toggle Watcher**: `Ctrl+Shift+P` → "LumosGen: Toggle File Watcher"

### AI Service Setup

#### Mock Mode (Default)
Perfect for testing - generates sample content without external API calls.

#### OpenAI Mode
1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Set `lumosGen.aiService.type` to `"openai"`
3. Set `lumosGen.aiService.apiKey` to your API key
4. Set `lumosGen.aiService.endpoint` to `"https://api.openai.com/v1/chat/completions"`

## 📋 Templates

### Summary Template
Generates a comprehensive summary of your files with key points and metadata.

### Table of Contents Template
Creates a structured TOC based on your file structure.

### Changelog Template
Generates changelog entries based on file modifications.

## 🔧 Development

### Building from Source

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch
```

### Project Structure

```
lumosgen/
├── src/
│   ├── extension.ts       # Main extension entry point
│   ├── watcher.ts         # File monitoring logic
│   ├── aiClient.ts        # AI service integration
│   ├── writer.ts          # Content writing utilities
│   └── config.ts          # Configuration management
├── package.json           # Extension manifest
└── README.md             # This file
```

## 🐛 Troubleshooting

### Common Issues

**Extension not starting**
- Check VS Code version (requires 1.74.0+)
- View output panel: `View` → `Output` → `LumosGen`

**No content generated**
- Verify file patterns match your files
- Check AI service configuration
- Ensure write permissions in workspace

**API errors**
- Verify API key and endpoint
- Check network connectivity
- Review rate limits

### Debug Mode

1. Open output panel: `View` → `Output` → `LumosGen`
2. Monitor real-time logs and error messages
3. Check configuration validation results

## 🤝 Contributing

This is an MVP version. Contributions welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by the "Lumos" spell from Harry Potter
- Built with VS Code Extension API
- Powered by AI for intelligent content generation

## 🔧 Development Status

This is an MVP (Minimum Viable Product) in active development. Core features are functional but the project is not yet ready for production use.

### Current Features ✅
- File watching for Markdown files
- AI-powered content generation (Mock + OpenAI)
- Multiple templates (Summary, TOC, Changelog)
- VS Code integration and commands

### TODO 🚧
- Performance optimization
- Enhanced error handling
- Additional AI service providers
- VS Code Marketplace preparation

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

*"Just as Lumos illuminates the darkness, LumosGen illuminates your content creation process."* ✨
