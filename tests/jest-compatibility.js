/**
 * Jest兼容层
 * 为使用Jest语法的测试文件提供兼容性支持
 */

// 如果Jest未定义，创建兼容层
if (typeof global.jest === 'undefined') {
    global.jest = {
        fn: (implementation) => {
            const mockFn = implementation || (() => {});
            
            // 添加Jest mock方法
            mockFn.mockReturnValue = (value) => {
                mockFn._mockReturnValue = value;
                return mockFn;
            };
            
            mockFn.mockResolvedValue = (value) => {
                mockFn._mockResolvedValue = value;
                return mockFn;
            };
            
            mockFn.mockRejectedValue = (error) => {
                mockFn._mockRejectedValue = error;
                return mockFn;
            };
            
            mockFn.mockImplementation = (impl) => {
                mockFn._mockImplementation = impl;
                return mockFn;
            };
            
            mockFn.mockClear = () => {
                mockFn.mock.calls = [];
                mockFn.mock.results = [];
                return mockFn;
            };
            
            mockFn.mockReset = () => {
                mockFn.mockClear();
                delete mockFn._mockReturnValue;
                delete mockFn._mockResolvedValue;
                delete mockFn._mockRejectedValue;
                delete mockFn._mockImplementation;
                return mockFn;
            };
            
            // Mock调用跟踪
            mockFn.mock = {
                calls: [],
                results: []
            };
            
            // 包装原函数以跟踪调用
            const wrappedFn = function(...args) {
                mockFn.mock.calls.push(args);
                
                let result;
                let error;
                
                try {
                    if (mockFn._mockImplementation) {
                        result = mockFn._mockImplementation.apply(this, args);
                    } else if (mockFn._mockReturnValue !== undefined) {
                        result = mockFn._mockReturnValue;
                    } else if (mockFn._mockResolvedValue !== undefined) {
                        result = Promise.resolve(mockFn._mockResolvedValue);
                    } else if (mockFn._mockRejectedValue !== undefined) {
                        result = Promise.reject(mockFn._mockRejectedValue);
                    } else {
                        result = implementation ? implementation.apply(this, args) : undefined;
                    }
                    
                    mockFn.mock.results.push({ type: 'return', value: result });
                    return result;
                } catch (err) {
                    error = err;
                    mockFn.mock.results.push({ type: 'throw', value: error });
                    throw error;
                }
            };
            
            // 复制所有mock方法到包装函数
            Object.assign(wrappedFn, mockFn);
            
            return wrappedFn;
        },
        
        spyOn: (object, methodName) => {
            const originalMethod = object[methodName];
            const spy = global.jest.fn(originalMethod);
            
            spy.mockRestore = () => {
                object[methodName] = originalMethod;
            };
            
            object[methodName] = spy;
            return spy;
        },
        
        clearAllMocks: () => {
            // 清理所有mock
        },
        
        resetAllMocks: () => {
            // 重置所有mock
        },

        mock: (moduleName, factory) => {
            // 模块Mock功能
            console.log(`🔧 Mocking module: ${moduleName}`);
            if (factory) {
                // 如果提供了factory函数，使用它
                return factory();
            }
            // 否则返回空对象
            return {};
        },

        unmock: (moduleName) => {
            console.log(`🔧 Unmocking module: ${moduleName}`);
        },

        doMock: (moduleName, factory) => {
            return global.jest.mock(moduleName, factory);
        },

        dontMock: (moduleName) => {
            return global.jest.unmock(moduleName);
        }
    };
    
    // 添加expect兼容层
    if (typeof global.expect === 'undefined') {
        global.expect = (actual) => {
            return {
                toBe: (expected) => {
                    if (actual !== expected) {
                        throw new Error(`Expected ${actual} to be ${expected}`);
                    }
                },
                
                toEqual: (expected) => {
                    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                        throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
                    }
                },
                
                toBeTruthy: () => {
                    if (!actual) {
                        throw new Error(`Expected ${actual} to be truthy`);
                    }
                },
                
                toBeFalsy: () => {
                    if (actual) {
                        throw new Error(`Expected ${actual} to be falsy`);
                    }
                },
                
                toContain: (expected) => {
                    if (!actual.includes(expected)) {
                        throw new Error(`Expected ${actual} to contain ${expected}`);
                    }
                },
                
                toHaveLength: (expected) => {
                    if (actual.length !== expected) {
                        throw new Error(`Expected length ${actual.length} to be ${expected}`);
                    }
                },
                
                toThrow: (expectedError) => {
                    try {
                        actual();
                        throw new Error('Expected function to throw');
                    } catch (error) {
                        if (expectedError && !error.message.includes(expectedError)) {
                            throw new Error(`Expected error to contain "${expectedError}", got "${error.message}"`);
                        }
                    }
                },
                
                resolves: {
                    toBe: async (expected) => {
                        const result = await actual;
                        if (result !== expected) {
                            throw new Error(`Expected ${result} to be ${expected}`);
                        }
                    },
                    
                    toEqual: async (expected) => {
                        const result = await actual;
                        if (JSON.stringify(result) !== JSON.stringify(expected)) {
                            throw new Error(`Expected ${JSON.stringify(result)} to equal ${JSON.stringify(expected)}`);
                        }
                    }
                },
                
                rejects: {
                    toThrow: async (expectedError) => {
                        try {
                            await actual;
                            throw new Error('Expected promise to reject');
                        } catch (error) {
                            if (expectedError && !error.message.includes(expectedError)) {
                                throw new Error(`Expected error to contain "${expectedError}", got "${error.message}"`);
                            }
                        }
                    }
                }
            };
        };
    }
    
    // 添加describe和it兼容层
    if (typeof global.describe === 'undefined') {
        global.describe = (name, fn) => {
            console.log(`📋 Test Suite: ${name}`);
            fn();
        };
    }
    
    if (typeof global.it === 'undefined') {
        global.it = (name, fn) => {
            console.log(`  🧪 Test: ${name}`);
            return fn();
        };
    }
    
    if (typeof global.test === 'undefined') {
        global.test = global.it;
    }
    
    // 添加beforeEach和afterEach
    if (typeof global.beforeEach === 'undefined') {
        global.beforeEach = (fn) => {
            // 在我们的测试框架中，这将在setup中处理
        };
    }
    
    if (typeof global.afterEach === 'undefined') {
        global.afterEach = (fn) => {
            // 在我们的测试框架中，这将在teardown中处理
        };
    }
}

module.exports = {
    setupJestCompatibility: () => {
        console.log('🔧 Jest compatibility layer loaded');
    }
};
