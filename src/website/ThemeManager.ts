import * as fs from 'fs';
import * as path from 'path';

export interface ThemeMetadata {
    name: string;
    description: string;
    version: string;
    author: string;
    category: 'modern' | 'technical' | 'creative' | 'minimal';
}

export interface ThemeConfig {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    headingFont?: string;
    borderRadius?: string;
    customProperties?: Record<string, string>;
}

export interface ThemeCustomization {
    colors: {
        primary: { default: string; options: string[] };
        secondary: { default: string; options: string[] };
    };
    fonts: {
        body: { default: string; options: string[] };
        heading: { default: string; options: string[] };
    };
    styles: {
        borderRadius?: { default: string; options: string[] };
        spacing?: { default: string; options: string[] };
    };
}

export interface Theme {
    metadata: ThemeMetadata;
    defaultConfig: ThemeConfig;
    customization: ThemeCustomization;
    templateFiles: string[];
}

export class ThemeManager {
    private themes: Map<string, Theme> = new Map();
    private themesPath: string;

    constructor() {
        this.themesPath = path.join(__dirname, 'themes');
        this.loadThemes();
    }

    private async loadThemes(): Promise<void> {
        try {
            if (!fs.existsSync(this.themesPath)) {
                // Create themes directory if it doesn't exist
                await fs.promises.mkdir(this.themesPath, { recursive: true });
                return;
            }

            const themeDirectories = await fs.promises.readdir(this.themesPath);
            
            for (const themeDir of themeDirectories) {
                const themePath = path.join(this.themesPath, themeDir);
                const stat = await fs.promises.stat(themePath);
                
                if (stat.isDirectory()) {
                    await this.loadTheme(themeDir, themePath);
                }
            }
        } catch (error) {
            console.error('Failed to load themes:', error);
        }
    }

    private async loadTheme(themeName: string, themePath: string): Promise<void> {
        try {
            const themeConfigPath = path.join(themePath, 'theme.json');
            
            if (!fs.existsSync(themeConfigPath)) {
                console.warn(`Theme config not found for ${themeName}`);
                return;
            }

            const themeConfigContent = await fs.promises.readFile(themeConfigPath, 'utf8');
            const theme: Theme = JSON.parse(themeConfigContent);
            
            // Validate theme structure
            if (this.validateTheme(theme)) {
                this.themes.set(themeName, theme);
            } else {
                console.warn(`Invalid theme structure for ${themeName}`);
            }
        } catch (error) {
            console.error(`Failed to load theme ${themeName}:`, error);
        }
    }

    private validateTheme(theme: Theme): boolean {
        return !!(
            theme.metadata?.name &&
            theme.defaultConfig &&
            theme.customization &&
            theme.templateFiles?.length > 0
        );
    }

    getAvailableThemes(): string[] {
        return Array.from(this.themes.keys());
    }

    getTheme(themeName: string): Theme | undefined {
        return this.themes.get(themeName);
    }

    getThemeMetadata(themeName: string): ThemeMetadata | undefined {
        return this.themes.get(themeName)?.metadata;
    }

    getThemeConfig(themeName: string): ThemeConfig | undefined {
        return this.themes.get(themeName)?.defaultConfig;
    }

    getThemeCustomization(themeName: string): ThemeCustomization | undefined {
        return this.themes.get(themeName)?.customization;
    }

    async getThemeTemplate(themeName: string, templateName: string): Promise<string | null> {
        const theme = this.themes.get(themeName);
        if (!theme) {
            return null;
        }

        const templatePath = path.join(this.themesPath, themeName, templateName);
        
        try {
            if (fs.existsSync(templatePath)) {
                return await fs.promises.readFile(templatePath, 'utf8');
            }
        } catch (error) {
            console.error(`Failed to read template ${templateName} for theme ${themeName}:`, error);
        }
        
        return null;
    }

    validateThemeConfig(themeName: string, config: Partial<ThemeConfig>): boolean {
        const theme = this.themes.get(themeName);
        if (!theme) {
            return false;
        }

        // Validate colors
        if (config.primaryColor && !this.isValidColor(config.primaryColor)) {
            return false;
        }
        
        if (config.secondaryColor && !this.isValidColor(config.secondaryColor)) {
            return false;
        }

        return true;
    }

    private isValidColor(color: string): boolean {
        // Basic color validation (hex, rgb, named colors)
        const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        const rgbPattern = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
        const namedColors = ['red', 'blue', 'green', 'black', 'white', 'gray', 'purple', 'orange', 'yellow'];
        
        return hexPattern.test(color) || rgbPattern.test(color) || namedColors.includes(color.toLowerCase());
    }

    mergeThemeConfig(themeName: string, customConfig: Partial<ThemeConfig>): ThemeConfig | null {
        const theme = this.themes.get(themeName);
        if (!theme) {
            return null;
        }

        return {
            ...theme.defaultConfig,
            ...customConfig
        };
    }
}
