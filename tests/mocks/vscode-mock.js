/**
 * Mock VS Code API for testing
 * 提供测试环境中需要的 VS Code API 模拟
 */

// Mock OutputChannel
class MockOutputChannel {
    constructor(name) {
        this.name = name;
        this.messages = [];
    }

    appendLine(message) {
        this.messages.push(message);
        console.log(`[${this.name}] ${message}`);
    }

    append(message) {
        this.messages.push(message);
        console.log(`[${this.name}] ${message}`);
    }

    show() {
        console.log(`Showing output channel: ${this.name}`);
    }

    hide() {
        console.log(`Hiding output channel: ${this.name}`);
    }

    clear() {
        this.messages = [];
        console.log(`Cleared output channel: ${this.name}`);
    }

    dispose() {
        this.messages = [];
        console.log(`Disposed output channel: ${this.name}`);
    }
}

// Mock Workspace
const mockWorkspace = {
    workspaceFolders: [
        {
            uri: { fsPath: '/test/workspace' },
            name: 'test-workspace',
            index: 0
        }
    ],

    getConfiguration: (section) => ({
        get: (key, defaultValue) => {
            // 返回一些测试配置
            const config = {
                'lumosGen.enabled': true,
                'lumosGen.language': 'en',
                'lumosGen.aiService.deepseekApiKey': 'test-key',
                'lumosGen.aiService.openaiApiKey': 'test-key',
                'lumosGen.aiService.degradationStrategy': ['deepseek', 'openai', 'mock'],
                'lumosGen.aiService.monitoringEnabled': true
            };
            
            const fullKey = section ? `${section}.${key}` : key;
            return config[fullKey] !== undefined ? config[fullKey] : defaultValue;
        },

        update: (key, value, target) => {
            console.log(`Config updated: ${key} = ${value}`);
            return Promise.resolve();
        },

        has: (key) => true,
        inspect: (key) => ({ key, defaultValue: undefined })
    }),

    onDidSaveTextDocument: (callback) => {
        console.log('Registered onDidSaveTextDocument listener');
        return { dispose: () => {} };
    },

    onDidChangeTextDocument: (callback) => {
        console.log('Registered onDidChangeTextDocument listener');
        return { dispose: () => {} };
    },

    findFiles: (pattern, exclude, maxResults) => {
        console.log(`Finding files: ${pattern}`);
        return Promise.resolve([]);
    }
};

// Mock Window
const mockWindow = {
    createOutputChannel: (name) => {
        console.log(`Creating output channel: ${name}`);
        return new MockOutputChannel(name);
    },

    showInformationMessage: (message, ...items) => {
        console.log(`Info: ${message}`);
        return Promise.resolve(items[0]);
    },

    showWarningMessage: (message, ...items) => {
        console.log(`Warning: ${message}`);
        return Promise.resolve(items[0]);
    },

    showErrorMessage: (message, ...items) => {
        console.log(`Error: ${message}`);
        return Promise.resolve(items[0]);
    },

    showQuickPick: (items, options) => {
        console.log(`Quick pick: ${items.length} items`);
        return Promise.resolve(items[0]);
    },

    showInputBox: (options) => {
        console.log(`Input box: ${options?.prompt || 'No prompt'}`);
        return Promise.resolve('test-input');
    }
};

// Mock Commands
const mockCommands = {
    registerCommand: (command, callback) => {
        console.log(`Registered command: ${command}`);
        return { dispose: () => {} };
    },

    executeCommand: (command, ...args) => {
        console.log(`Executing command: ${command}`);
        return Promise.resolve();
    }
};

// Mock Extensions
const mockExtensions = {
    getExtension: (id) => {
        console.log(`Getting extension: ${id}`);
        return {
            id,
            isActive: true,
            exports: {},
            activate: () => Promise.resolve()
        };
    }
};

// Mock Uri
const mockUri = {
    file: (path) => ({
        scheme: 'file',
        fsPath: path,
        path: path,
        toString: () => `file://${path}`
    }),

    parse: (uri) => ({
        scheme: 'file',
        fsPath: uri.replace('file://', ''),
        path: uri.replace('file://', ''),
        toString: () => uri
    })
};

// Mock Position and Range
class MockPosition {
    constructor(line, character) {
        this.line = line;
        this.character = character;
    }
}

class MockRange {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
}

// Mock TextDocument
class MockTextDocument {
    constructor(uri, content = '') {
        this.uri = uri;
        this.fileName = uri.fsPath;
        this.languageId = 'markdown';
        this.version = 1;
        this.isDirty = false;
        this.isClosed = false;
        this.eol = 1; // LF
        this.lineCount = content.split('\n').length;
        this._content = content;
    }

    getText(range) {
        if (!range) return this._content;
        // 简化实现，返回全部内容
        return this._content;
    }

    lineAt(line) {
        const lines = this._content.split('\n');
        return {
            lineNumber: line,
            text: lines[line] || '',
            range: new MockRange(new MockPosition(line, 0), new MockPosition(line, (lines[line] || '').length)),
            rangeIncludingLineBreak: new MockRange(new MockPosition(line, 0), new MockPosition(line + 1, 0)),
            firstNonWhitespaceCharacterIndex: 0,
            isEmptyOrWhitespace: !(lines[line] || '').trim()
        };
    }

    save() {
        return Promise.resolve(true);
    }
}

// 主要的 VS Code API Mock
const vscode = {
    workspace: mockWorkspace,
    window: mockWindow,
    commands: mockCommands,
    extensions: mockExtensions,
    Uri: mockUri,
    Position: MockPosition,
    Range: MockRange,
    TextDocument: MockTextDocument,
    OutputChannel: MockOutputChannel,

    // 常用的枚举和常量
    ViewColumn: {
        One: 1,
        Two: 2,
        Three: 3,
        Active: -1,
        Beside: -2
    },

    StatusBarAlignment: {
        Left: 1,
        Right: 2
    },

    // 事件相关
    EventEmitter: class MockEventEmitter {
        constructor() {
            this.listeners = [];
        }

        event(listener) {
            this.listeners.push(listener);
            return { dispose: () => {} };
        }

        fire(data) {
            this.listeners.forEach(listener => listener(data));
        }
    }
};

// 导出 mock
module.exports = vscode;

// 如果在 Node.js 环境中，设置全局 mock
if (typeof global !== 'undefined') {
    global.vscode = vscode;
}

console.log('VS Code API mock loaded successfully');
