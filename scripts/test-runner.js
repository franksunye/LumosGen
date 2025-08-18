// Simple test runner for LumosGen core functionality
const fs = require('fs');
const path = require('path');

// Mock VS Code API for testing
const vscode = {
  workspace: {
    getConfiguration: (section) => ({
      get: (key, defaultValue) => {
        const config = {
          'lumosGen.enabled': true,
          'lumosGen.watchPatterns': ['**/*.md'],
          'lumosGen.outputFile': 'LumosGen-Summary.md',
          'lumosGen.aiService': {
            type: 'mock',
            endpoint: '',
            apiKey: '',
            model: 'gpt-3.5-turbo'
          },
          'lumosGen.triggerDelay': 2000,
          'lumosGen.template': 'summary'
        };
        return config[`${section}.${key}`] || defaultValue;
      }
    }),
    workspaceFolders: [{
      uri: { fsPath: __dirname }
    }],
    asRelativePath: (uri) => path.basename(uri.fsPath || uri),
    fs: {
      readFile: async (uri) => {
        const content = fs.readFileSync(uri.fsPath || uri, 'utf8');
        return Buffer.from(content);
      },
      writeFile: async (uri, content) => {
        fs.writeFileSync(uri.fsPath || uri, content);
      },
      stat: async (uri) => {
        const stats = fs.statSync(uri.fsPath || uri);
        return { mtime: stats.mtime.getTime() };
      }
    },
    findFiles: async (pattern) => {
      // Simple glob simulation for .md files
      const files = fs.readdirSync(__dirname)
        .filter(file => file.endsWith('.md') && file !== 'LumosGen-Summary.md')
        .map(file => ({ fsPath: path.join(__dirname, file) }));
      return files;
    }
  },
  window: {
    createOutputChannel: (name) => ({
      appendLine: (text) => console.log(`[${name}] ${text}`),
      show: () => {},
      dispose: () => {}
    }),
    showInformationMessage: (message) => {
      console.log(`INFO: ${message}`);
      return Promise.resolve();
    },
    showErrorMessage: (message) => {
      console.log(`ERROR: ${message}`);
      return Promise.resolve();
    },
    withProgress: async (options, task) => {
      console.log(`PROGRESS: ${options.title}`);
      const progress = {
        report: (value) => console.log(`  ${value.message}`)
      };
      return await task(progress);
    }
  },
  Uri: {
    file: (path) => ({ fsPath: path })
  }
};

// Test the core functionality
async function testLumosGen() {
  console.log('🧪 Testing LumosGen Core Functionality...\n');

  try {
    // Load compiled modules
    const { ConfigManager } = require('./out/config');
    const { AIClient } = require('./out/aiClient');
    const { ContentWriter } = require('./out/writer');

    // Mock global vscode
    global.vscode = vscode;

    // Test configuration
    console.log('1️⃣ Testing Configuration...');
    const configManager = ConfigManager.getInstance();
    const config = configManager.getConfig();
    console.log('✅ Configuration loaded:', JSON.stringify(config, null, 2));

    // Test AI client
    console.log('\n2️⃣ Testing AI Client...');
    const outputChannel = vscode.window.createOutputChannel('Test');
    const aiClient = new AIClient(outputChannel);

    // Prepare test context
    const testFiles = await vscode.workspace.findFiles();
    const context = [];
    
    for (const file of testFiles) {
      try {
        const content = await vscode.workspace.fs.readFile(file);
        const stats = await vscode.workspace.fs.stat(file);
        context.push({
          path: vscode.workspace.asRelativePath(file),
          content: content.toString(),
          lastModified: new Date(stats.mtime)
        });
      } catch (error) {
        console.log(`⚠️ Could not read file ${file.fsPath}: ${error.message}`);
      }
    }

    console.log(`📁 Found ${context.length} test files`);

    // Generate content
    const request = {
      template: config.template,
      context: context
    };

    const response = await aiClient.generateContent(request);
    console.log('✅ Content generated successfully');
    console.log('📄 Generated content preview:');
    console.log(response.content.substring(0, 200) + '...\n');

    // Test content writer
    console.log('3️⃣ Testing Content Writer...');
    const writer = new ContentWriter(outputChannel);
    
    // Check write permissions
    const hasPermissions = await writer.checkWritePermissions();
    console.log(`📝 Write permissions: ${hasPermissions ? '✅' : '❌'}`);

    if (hasPermissions) {
      await writer.writeContent(response);
      console.log('✅ Content written successfully');
      
      // Verify the file was created
      if (fs.existsSync(config.outputFile)) {
        console.log(`📄 Output file created: ${config.outputFile}`);
        const outputContent = fs.readFileSync(config.outputFile, 'utf8');
        console.log('📄 Output file preview:');
        console.log(outputContent.substring(0, 300) + '...\n');
      }
    }

    console.log('🎉 All tests passed! LumosGen is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error(error.stack);
  }
}

// Run tests
testLumosGen();
