# LumosGen - AI-Powered Content Generation for VS Code

> *"Lumos!"* - Illuminate your content creation process with AI ✨

**Status: MVP Development** 🚧

LumosGen is a VS Code extension that automatically generates and updates content using AI when you save files in your workspace. Perfect for maintaining documentation, summaries, and overviews of your projects.

## 🌟 Features

- **🔮 Automatic File Watching**: Monitors your Markdown files for changes
- **🤖 AI-Powered Generation**: Creates summaries, table of contents, and more
- **⚙️ Flexible Configuration**: Customize patterns, output files, and AI services
- **📋 Multiple Templates**: Choose from summary, TOC, or changelog generation
- **📊 Real-time Feedback**: Progress notifications and detailed logging
- **🛡️ Safe & Secure**: Local processing with optional cloud AI integration

## 🚀 Development Setup

### Prerequisites
- VS Code 1.74.0 or higher
- Node.js 16.x or higher

### Getting Started
1. Clone this repository
2. Install dependencies: `npm install`
3. Compile TypeScript: `npm run compile`
4. Press `F5` in VS Code to launch Extension Development Host

## ⚙️ Configuration

Configure LumosGen through VS Code settings (`Ctrl+,` → search "lumosgen"):

```json
{
  "lumosGen.enabled": true,
  "lumosGen.watchPatterns": ["**/*.md"],
  "lumosGen.outputFile": "LumosGen-Summary.md",
  "lumosGen.aiService": {
    "type": "mock",
    "endpoint": "https://api.openai.com/v1/chat/completions",
    "apiKey": "",
    "model": "gpt-3.5-turbo"
  },
  "lumosGen.triggerDelay": 2000,
  "lumosGen.template": "summary"
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
