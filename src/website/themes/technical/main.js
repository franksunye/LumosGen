// Technical Theme JavaScript for LumosGen
document.addEventListener('DOMContentLoaded', function() {
    // Initialize technical theme functionality
    initializeTerminalEffects();
    initializeTheme();
    initializeCodeFeatures();
    initializeAccessibility();
    initializePerformanceMonitoring();
});

// Terminal-style Effects
function initializeTerminalEffects() {
    // Add typing effect to terminal content
    const terminalElements = document.querySelectorAll('.terminal-content');
    terminalElements.forEach(element => {
        addTypingEffect(element);
    });
    
    // Add blinking cursor to active elements
    addBlinkingCursor();
    
    // Terminal command simulation
    simulateTerminalCommands();
    
    // Line and character counting
    updateContentStats();
}

function addTypingEffect(element) {
    const text = element.textContent;
    element.textContent = '';
    element.style.opacity = '1';
    
    let i = 0;
    const typeInterval = setInterval(() => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(typeInterval);
            addBlinkingCursor(element);
        }
    }, 20);
}

function addBlinkingCursor(element = null) {
    if (!element) {
        // Add cursor to the main content area
        const contentArea = document.querySelector('.prose');
        if (contentArea) {
            const cursor = document.createElement('span');
            cursor.className = 'terminal-cursor text-primary-400';
            cursor.textContent = '█';
            contentArea.appendChild(cursor);
        }
    } else {
        const cursor = document.createElement('span');
        cursor.className = 'terminal-cursor text-primary-400 ml-1';
        cursor.textContent = '█';
        element.appendChild(cursor);
    }
}

function simulateTerminalCommands() {
    const commandElements = document.querySelectorAll('[data-command]');
    commandElements.forEach(element => {
        const command = element.getAttribute('data-command');
        element.addEventListener('click', () => {
            executeTerminalCommand(command, element);
        });
    });
}

function executeTerminalCommand(command, element) {
    const output = document.createElement('div');
    output.className = 'text-gray-400 text-sm mt-2';
    
    switch(command) {
        case 'ls':
            output.textContent = 'index.html  about.html  faq.html  assets/';
            break;
        case 'pwd':
            output.textContent = '/var/www/lumosgen-website';
            break;
        case 'whoami':
            output.textContent = 'developer';
            break;
        default:
            output.textContent = `bash: ${command}: command not found`;
    }
    
    element.appendChild(output);
}

function updateContentStats() {
    const content = document.querySelector('.prose');
    if (content) {
        const text = content.textContent || '';
        const lines = text.split('\n').length;
        const chars = text.length;
        
        const lineCount = document.getElementById('line-count');
        const charCount = document.getElementById('char-count');
        
        if (lineCount) lineCount.textContent = lines;
        if (charCount) charCount.textContent = chars;
    }
}

// Theme Management for Technical Theme
function initializeTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    // Technical theme defaults to dark, but supports light mode
    const savedTheme = localStorage.getItem('technical-theme') || 'dark';
    
    function setTheme(theme) {
        if (theme === 'light') {
            html.classList.remove('dark');
            document.body.style.backgroundColor = '#f3f4f6';
            document.body.style.color = '#1f2937';
        } else {
            html.classList.add('dark');
            document.body.style.backgroundColor = '#111827';
            document.body.style.color = '#f3f4f6';
        }
        localStorage.setItem('technical-theme', theme);
        updateTerminalTheme(theme);
    }
    
    function updateTerminalTheme(theme) {
        const terminals = document.querySelectorAll('.bg-black');
        terminals.forEach(terminal => {
            if (theme === 'light') {
                terminal.style.backgroundColor = '#1f2937';
                terminal.style.color = '#f3f4f6';
            } else {
                terminal.style.backgroundColor = '#000000';
                terminal.style.color = '#00ff00';
            }
        });
    }
    
    // Set initial theme
    setTheme(savedTheme);
    
    // Theme toggle functionality
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = localStorage.getItem('technical-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
            
            // Terminal-style feedback
            showTerminalFeedback(`Theme switched to ${newTheme} mode`);
        });
    }
}

function showTerminalFeedback(message) {
    const feedback = document.createElement('div');
    feedback.className = 'fixed bottom-4 right-4 bg-black text-primary-400 px-4 py-2 rounded border border-primary-500 font-mono text-sm z-50';
    feedback.textContent = `> ${message}`;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(feedback);
        }, 300);
    }, 2000);
}

// Code-specific Features
function initializeCodeFeatures() {
    // Syntax highlighting for code blocks
    highlightCodeBlocks();
    
    // Add copy functionality to code blocks
    addCodeCopyButtons();
    
    // Line numbers for code blocks
    addLineNumbers();
    
    // Code folding functionality
    addCodeFolding();
}

function highlightCodeBlocks() {
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        // Basic syntax highlighting
        let html = block.innerHTML;
        
        // Keywords
        html = html.replace(/\b(function|const|let|var|if|else|for|while|return|class|import|export)\b/g, 
            '<span class="syntax-keyword">$1</span>');
        
        // Strings
        html = html.replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, 
            '<span class="syntax-string">$1$2$1</span>');
        
        // Comments
        html = html.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, 
            '<span class="syntax-comment">$1</span>');
        
        // Numbers
        html = html.replace(/\b(\d+\.?\d*)\b/g, 
            '<span class="syntax-number">$1</span>');
        
        block.innerHTML = html;
    });
}

function addCodeCopyButtons() {
    const codeBlocks = document.querySelectorAll('pre');
    codeBlocks.forEach(block => {
        const button = document.createElement('button');
        button.className = 'absolute top-2 right-2 px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors';
        button.textContent = 'copy';
        
        block.style.position = 'relative';
        block.appendChild(button);
        
        button.addEventListener('click', async () => {
            const code = block.querySelector('code');
            if (code) {
                try {
                    await navigator.clipboard.writeText(code.textContent);
                    button.textContent = 'copied!';
                    button.style.color = '#10b981';
                    setTimeout(() => {
                        button.textContent = 'copy';
                        button.style.color = '';
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy code: ', err);
                    button.textContent = 'failed';
                    setTimeout(() => {
                        button.textContent = 'copy';
                    }, 2000);
                }
            }
        });
    });
}

function addLineNumbers() {
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        const lines = block.textContent.split('\n');
        const numberedLines = lines.map((line, index) => {
            const lineNumber = (index + 1).toString().padStart(3, ' ');
            return `<span class="line"><span class="text-gray-500">${lineNumber}</span> ${line}</span>`;
        }).join('\n');
        
        block.innerHTML = numberedLines;
        block.parentElement.classList.add('line-numbers');
    });
}

function addCodeFolding() {
    const codeBlocks = document.querySelectorAll('pre');
    codeBlocks.forEach(block => {
        if (block.scrollHeight > 300) {
            const foldButton = document.createElement('button');
            foldButton.className = 'absolute top-2 left-2 px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors';
            foldButton.textContent = 'fold';
            
            block.appendChild(foldButton);
            
            foldButton.addEventListener('click', () => {
                if (block.style.maxHeight === '300px') {
                    block.style.maxHeight = 'none';
                    foldButton.textContent = 'fold';
                } else {
                    block.style.maxHeight = '300px';
                    block.style.overflow = 'hidden';
                    foldButton.textContent = 'unfold';
                }
            });
        }
    });
}

// Enhanced Accessibility for Technical Theme
function initializeAccessibility() {
    // Keyboard shortcuts for developers
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K for command palette simulation
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            showCommandPalette();
        }
        
        // Ctrl/Cmd + / for help
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            showKeyboardShortcuts();
        }
    });
    
    // Focus management for terminal-style navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach((link, index) => {
        link.addEventListener('keydown', function(e) {
            if (e.key === 'Tab' && e.shiftKey) {
                // Custom tab behavior for terminal feel
                e.preventDefault();
                const prevIndex = (index - 1 + navLinks.length) % navLinks.length;
                navLinks[prevIndex].focus();
            } else if (e.key === 'Tab' && !e.shiftKey) {
                e.preventDefault();
                const nextIndex = (index + 1) % navLinks.length;
                navLinks[nextIndex].focus();
            }
        });
    });
}

function showCommandPalette() {
    const palette = document.createElement('div');
    palette.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
    palette.innerHTML = `
        <div class="bg-gray-900 border border-primary-500 rounded p-4 w-96">
            <div class="text-primary-400 mb-2">Command Palette</div>
            <input type="text" placeholder="Type a command..." 
                   class="w-full bg-black text-primary-400 border border-gray-700 rounded px-3 py-2 font-mono">
            <div class="mt-2 text-gray-500 text-sm">
                Available: home, about, faq, theme, help
            </div>
        </div>
    `;
    
    document.body.appendChild(palette);
    
    const input = palette.querySelector('input');
    input.focus();
    
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.body.removeChild(palette);
        } else if (e.key === 'Enter') {
            executeCommand(input.value);
            document.body.removeChild(palette);
        }
    });
    
    palette.addEventListener('click', function(e) {
        if (e.target === palette) {
            document.body.removeChild(palette);
        }
    });
}

function executeCommand(command) {
    switch(command.toLowerCase()) {
        case 'home':
            window.location.href = 'index.html';
            break;
        case 'about':
            window.location.href = 'about.html';
            break;
        case 'faq':
            window.location.href = 'faq.html';
            break;
        case 'theme':
            document.getElementById('theme-toggle')?.click();
            break;
        case 'help':
            showKeyboardShortcuts();
            break;
        default:
            showTerminalFeedback(`Unknown command: ${command}`);
    }
}

function showKeyboardShortcuts() {
    const help = document.createElement('div');
    help.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
    help.innerHTML = `
        <div class="bg-gray-900 border border-primary-500 rounded p-6 max-w-md">
            <div class="text-primary-400 mb-4 font-bold">Keyboard Shortcuts</div>
            <div class="space-y-2 font-mono text-sm">
                <div><span class="text-primary-400">Ctrl+K</span> - Command Palette</div>
                <div><span class="text-primary-400">Ctrl+/</span> - Show Help</div>
                <div><span class="text-primary-400">Tab</span> - Navigate Links</div>
                <div><span class="text-primary-400">Esc</span> - Close Dialogs</div>
            </div>
            <button class="mt-4 px-4 py-2 bg-primary-600 text-black rounded hover:bg-primary-500 transition-colors">
                Close
            </button>
        </div>
    `;
    
    document.body.appendChild(help);
    
    const closeBtn = help.querySelector('button');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(help);
    });
    
    help.addEventListener('click', function(e) {
        if (e.target === help) {
            document.body.removeChild(help);
        }
    });
}

// Performance Monitoring for Technical Theme
function initializePerformanceMonitoring() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
            
            // Show performance stats in console (developer-friendly)
            console.log(`%c⚡ Technical Theme Performance`, 'color: #10b981; font-weight: bold');
            console.log(`Load Time: ${loadTime}ms`);
            console.log(`DOM Content Loaded: ${perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart}ms`);
            
            // Optional: Show performance indicator
            if (loadTime > 1000) {
                showTerminalFeedback(`Slow load detected: ${loadTime}ms`);
            }
        });
    }
}
