/**
 * 全局 Mock 设置
 * 在所有测试运行前设置必要的 Mock 环境
 */

const path = require('path');
const Module = require('module');

// 保存原始的 require 函数
const originalRequire = Module.prototype.require;

// 创建 VS Code Mock
const vscode = require('./mocks/vscode-mock');

// 重写 require 函数来拦截 vscode 模块
Module.prototype.require = function(id) {
    if (id === 'vscode') {
        console.log(`[MOCK] Intercepted vscode require from: ${this.filename}`);
        return vscode;
    }
    
    // 对于其他模块，使用原始的 require
    return originalRequire.apply(this, arguments);
};

// 设置全局变量
global.vscode = vscode;

// 设置环境变量标识测试环境
process.env.NODE_ENV = 'test';
process.env.VSCODE_TESTING = 'true';

console.log('🔧 Global mocks initialized successfully');
console.log('📦 VS Code module will be mocked for all requires');

// 导出清理函数
module.exports = {
    cleanup: () => {
        Module.prototype.require = originalRequire;
        delete global.vscode;
        delete process.env.VSCODE_TESTING;
        console.log('🧹 Global mocks cleaned up');
    }
};
