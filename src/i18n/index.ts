// Simple i18n implementation without external dependencies
interface TranslationResources {
    [key: string]: {
        translation: {
            [key: string]: any;
        };
    };
}

// Language resources
const resources: TranslationResources = {
    en: {
        translation: {
            // Extension messages
            extension: {
                activated: 'LumosGen extension activated',
                deactivated: 'LumosGen extension deactivated',
                welcome: 'LumosGen is now active! 🔮✨',
                openSettings: 'Open Settings',
                viewOutput: 'View Output'
            },
            // Commands
            commands: {
                generateContent: 'Generate Marketing Content',
                analyzeProject: 'Analyze Project',
                previewWebsite: 'Preview Website',
                deployToGitHub: 'Deploy to GitHub Pages',
                toggleWatcher: 'Toggle File Watcher',
                diagnose: 'Diagnose Issues',
                openBrowser: 'Open in Browser',
                stopPreview: 'Stop Preview'
            },
            // UI elements
            ui: {
                sidebar: {
                    title: 'LumosGen Marketing AI',
                    analyzeProject: '📊 Analyze Project',
                    generateContent: '🤖 Generate Content',
                    previewWebsite: '🎨 Preview Website',
                    deployToGitHub: '🚀 Deploy to GitHub Pages',
                    settings: '⚙️ Settings'
                },
                status: {
                    analyzing: 'Analyzing project...',
                    generating: 'Generating marketing content...',
                    building: 'Building website...',
                    previewing: 'Starting preview server...',
                    deploying: 'Deploying to GitHub Pages...',
                    completed: 'Completed successfully!',
                    failed: 'Operation failed'
                }
            },
            // Project analysis
            analysis: {
                scanning: 'Scanning project structure...',
                readmeFound: 'README file found and analyzed',
                techStackDetected: 'Technology stack detected: {{techStack}}',
                featuresExtracted: 'Features extracted: {{count}} items',
                noReadme: 'No README file found. Please add one for better analysis.',
                analysisComplete: 'Project analysis completed'
            },
            // Content generation
            content: {
                generatingHomepage: 'Generating marketing homepage...',
                generatingAbout: 'Generating about page...',
                generatingBlog: 'Generating blog post...',
                generatingFaq: 'Generating FAQ section...',
                contentReady: 'Marketing content generated successfully',
                contentFailed: 'Failed to generate content: {{error}}'
            },
            // Website building
            website: {
                building: 'Building responsive website...',
                buildComplete: 'Website build completed successfully',
                buildFailed: 'Website build failed: {{error}}',
                startingPreview: 'Starting local preview server...',
                previewReady: 'Website preview is ready!',
                previewStarted: 'Preview server started at {{url}}',
                previewStopped: 'Preview server stopped',
                optimizingSEO: 'Optimizing for search engines...',
                generatingAssets: 'Generating website assets...'
            },
            // Deployment
            deployment: {
                preparing: 'Preparing deployment...',
                creatingBranch: 'Creating gh-pages branch...',
                pushingFiles: 'Pushing website files...',
                configuring: 'Configuring GitHub Pages...',
                deploymentSuccess: 'Website deployed successfully to {{url}}',
                deploymentFailed: 'Deployment failed: {{error}}'
            },
            // Errors
            errors: {
                noWorkspace: 'No workspace folder found',
                noGitRepo: 'Not a Git repository',
                noGitHubRepo: 'Not a GitHub repository',
                permissionDenied: 'Permission denied',
                networkError: 'Network error occurred',
                apiError: 'AI service error: {{error}}',
                configError: 'Configuration error: {{error}}',
                noContentToPreview: 'No content available to preview. Please generate content first.'
            }
        }
    },
    es: {
        translation: {
            extension: {
                activated: 'Extensión LumosGen activada',
                deactivated: 'Extensión LumosGen desactivada',
                welcome: '¡LumosGen está activo! 🔮✨',
                openSettings: 'Abrir Configuración',
                viewOutput: 'Ver Salida'
            },
            commands: {
                generateContent: 'Generar Contenido de Marketing',
                analyzeProject: 'Analizar Proyecto',
                previewWebsite: 'Vista Previa del Sitio Web',
                deployToGitHub: 'Desplegar en GitHub Pages',
                toggleWatcher: 'Alternar Observador de Archivos',
                diagnose: 'Diagnosticar Problemas'
            },
            ui: {
                sidebar: {
                    title: 'LumosGen Marketing AI',
                    analyzeProject: '📊 Analizar Proyecto',
                    generateContent: '🤖 Generar Contenido',
                    previewWebsite: '🎨 Vista Previa',
                    deployToGitHub: '🚀 Desplegar en GitHub Pages',
                    settings: '⚙️ Configuración'
                },
                status: {
                    analyzing: 'Analizando proyecto...',
                    generating: 'Generando contenido de marketing...',
                    building: 'Construyendo sitio web...',
                    deploying: 'Desplegando en GitHub Pages...',
                    completed: '¡Completado exitosamente!',
                    failed: 'Operación fallida'
                }
            }
        }
    },
    ja: {
        translation: {
            extension: {
                activated: 'LumosGen拡張機能が有効化されました',
                deactivated: 'LumosGen拡張機能が無効化されました',
                welcome: 'LumosGenがアクティブです！🔮✨',
                openSettings: '設定を開く',
                viewOutput: '出力を表示'
            },
            commands: {
                generateContent: 'マーケティングコンテンツを生成',
                analyzeProject: 'プロジェクトを分析',
                previewWebsite: 'ウェブサイトをプレビュー',
                deployToGitHub: 'GitHub Pagesにデプロイ',
                toggleWatcher: 'ファイルウォッチャーを切り替え',
                diagnose: '問題を診断'
            },
            ui: {
                sidebar: {
                    title: 'LumosGen Marketing AI',
                    analyzeProject: '📊 プロジェクト分析',
                    generateContent: '🤖 コンテンツ生成',
                    previewWebsite: '🎨 プレビュー',
                    deployToGitHub: '🚀 GitHub Pagesにデプロイ',
                    settings: '⚙️ 設定'
                },
                status: {
                    analyzing: 'プロジェクトを分析中...',
                    generating: 'マーケティングコンテンツを生成中...',
                    building: 'ウェブサイトを構築中...',
                    deploying: 'GitHub Pagesにデプロイ中...',
                    completed: '正常に完了しました！',
                    failed: '操作が失敗しました'
                }
            }
        }
    }
};

// Simple i18n state
let currentLanguage = 'en';

// Initialize i18n
export const initI18n = async (language: string = 'en') => {
    currentLanguage = language;
    return Promise.resolve();
};

// Translation function
export const t = (key: string, options?: any): string => {
    const keys = key.split('.');
    let value: any = resources[currentLanguage]?.translation;

    if (!value) {
        value = resources['en'].translation; // Fallback to English
    }

    for (const k of keys) {
        value = value?.[k];
        if (value === undefined) {
            // Try fallback language
            let fallbackValue: any = resources['en'].translation;
            for (const fk of keys) {
                fallbackValue = fallbackValue?.[fk];
            }
            value = fallbackValue || key;
            break;
        }
    }

    // Simple interpolation
    if (typeof value === 'string' && options) {
        return value.replace(/\{\{(\w+)\}\}/g, (match, prop) => {
            return options[prop] || match;
        });
    }

    return typeof value === 'string' ? value : key;
};

// Change language
export const changeLanguage = async (language: string) => {
    if (resources[language]) {
        currentLanguage = language;
    }
    return Promise.resolve();
};

// Get current language
export const getCurrentLanguage = () => {
    return currentLanguage;
};

// Get available languages
export const getAvailableLanguages = () => {
    return Object.keys(resources);
};
