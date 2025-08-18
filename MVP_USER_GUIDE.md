# LumosGen MVP User Guide

## 🎯 What is LumosGen?

**LumosGen** is an AI-powered VS Code extension that transforms your GitHub projects into professional marketing websites. It analyzes your code, generates marketing content, builds responsive websites, and deploys them to GitHub Pages - all with just a few clicks.

## 🚀 Quick Start Guide

### Prerequisites
- VS Code 1.74.0 or higher
- Node.js 16.x or higher
- Git repository with remote origin (for deployment)

### Installation & Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/franksunye/LumosGen
   cd LumosGen
   npm install
   npm run compile
   ```

2. **Launch Extension Development**
   - Open the project in VS Code
   - Press `F5` to launch Extension Development Host
   - Open your target project in the new VS Code window

3. **Open LumosGen Sidebar**
   - Go to View → LumosGen (or use Command Palette: `LumosGen: Analyze Project`)
   - The LumosGen sidebar will appear on the left

## 📋 Complete Workflow

### Step 1: Analyze Your Project 🔍
1. Click **"📊 Analyze Project"** in the sidebar
2. LumosGen will:
   - Scan your project structure
   - Identify programming languages and frameworks
   - Parse README.md for features and descriptions
   - Extract project metadata

**Expected Output:**
- Project name and description
- Technology stack detection
- Feature list extraction
- Marketing potential assessment

### Step 2: Generate Marketing Content 🤖
1. Click **"🤖 Generate Content"** in the sidebar
2. LumosGen will create:
   - **Homepage** - Professional landing page with hero section
   - **About Page** - Detailed project overview and features
   - **Blog Post** - Technical article about your project
   - **FAQ** - Common questions and answers
   - **SEO Metadata** - Optimized keywords and descriptions

**Expected Output:**
- 4 marketing content files (1000-2000 characters each)
- SEO-optimized metadata
- Professional marketing copy in English

### Step 3: Build Marketing Website 🎨
1. Click **"🎨 Preview Website"** in the sidebar
2. LumosGen will:
   - Generate responsive HTML website
   - Apply modern Tailwind CSS styling
   - Optimize for SEO (meta tags, structured data, sitemap)
   - Create mobile-first responsive design

**Expected Output:**
- Complete website in `lumosgen-website/` folder
- Responsive design with dark/light theme support
- SEO-optimized structure
- Production-ready static files

### Step 4: Deploy to GitHub Pages 🚀
1. Click **"🚀 Deploy to GitHub Pages"** in the sidebar
2. LumosGen will:
   - Create `gh-pages` branch automatically
   - Push website files to GitHub
   - Configure GitHub Pages deployment
   - Start monitoring deployment health

**Expected Output:**
- Live website at `https://your-username.github.io/your-repo`
- Automatic deployment monitoring
- Real-time health checks

## ⌨️ Keyboard Shortcuts

- `Ctrl+Shift+L A` - Analyze Project
- `Ctrl+Shift+L G` - Generate Marketing Content
- `Ctrl+Shift+L D` - Deploy to GitHub Pages

## 🎛️ Configuration Options

Access settings via VS Code Settings → Extensions → LumosGen:

```json
{
  "lumosgen": {
    "language": "en",
    "marketingSettings": {
      "tone": "professional",
      "includeCodeExamples": true,
      "targetMarkets": ["global"],
      "seoOptimization": true
    },
    "deployment": {
      "platform": "github-pages",
      "customDomain": ""
    }
  }
}
```

## 📁 Generated File Structure

After running the complete workflow:

```
your-project/
├── lumosgen-website/          # Generated website
│   ├── index.html            # Homepage
│   ├── about.html            # About page
│   ├── blog.html             # Blog post
│   ├── faq.html              # FAQ page
│   ├── style.css             # Tailwind CSS
│   ├── sitemap.xml           # SEO sitemap
│   ├── robots.txt            # Search engine directives
│   └── .nojekyll             # GitHub Pages config
└── .lumosgen/                # LumosGen data
    └── logs/                 # Error logs
        └── error.log         # Detailed error logging
```

## 🔧 Troubleshooting

### Common Issues

**1. "No workspace folder found"**
- Solution: Open a folder in VS Code (File → Open Folder)

**2. "Not a Git repository"**
- Solution: Initialize Git and add remote origin:
  ```bash
  git init
  git remote add origin https://github.com/username/repo
  ```

**3. "Permission denied" during deployment**
- Solution: Check Git credentials and repository access
- Ensure you have push access to the repository

**4. "Website build failed"**
- Solution: Check the output channel for detailed error messages
- Ensure all previous steps completed successfully

### Error Recovery

LumosGen includes intelligent error handling:
- **Automatic error detection** with user-friendly messages
- **Recovery suggestions** for common issues
- **Detailed error logging** in `.lumosgen/logs/error.log`
- **One-click recovery actions** for most problems

## 📊 Monitoring & Health Checks

### Deployment Monitoring
- **Real-time health checks** every 5 minutes
- **Uptime tracking** with percentage calculations
- **Response time monitoring** for performance insights
- **Automatic notifications** for status changes

### Accessing Monitoring
1. Use Command Palette: `LumosGen: Monitor Deployment Health`
2. Enter your website URL
3. View real-time status in the output channel

## 🎯 Expected Results

### Content Quality
- **Homepage**: 1200+ characters of professional marketing copy
- **About Page**: 1700+ characters of detailed project description
- **Blog Post**: 1300+ characters of technical insights
- **FAQ**: 1000+ characters of comprehensive Q&A

### Website Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **SEO Optimization**: Meta tags, structured data, sitemap
- **Performance**: Fast loading with optimized assets
- **Accessibility**: WCAG 2.1 compliant structure

### Deployment
- **GitHub Pages**: Automatic deployment to `gh-pages` branch
- **Custom Domain**: Support for custom domain configuration
- **Health Monitoring**: Continuous uptime and performance tracking

## 🚀 Success Metrics

A successful LumosGen workflow should achieve:
- ✅ Complete project analysis in < 5 seconds
- ✅ Professional marketing content generation in < 10 seconds
- ✅ Responsive website build in < 15 seconds
- ✅ GitHub Pages deployment in < 30 seconds
- ✅ 100% uptime monitoring with < 2 second response times

## 🆘 Getting Help

### Built-in Help
- **Output Channel**: View → Output → LumosGen for detailed logs
- **Error Logs**: Check `.lumosgen/logs/error.log` for debugging
- **Command Palette**: Search "LumosGen" for all available commands

### Manual Testing Checklist

1. **Project Analysis**
   - [ ] Project metadata extracted correctly
   - [ ] Technology stack identified
   - [ ] Features list populated
   - [ ] No error messages in output

2. **Content Generation**
   - [ ] All 4 content types generated
   - [ ] Content length meets requirements (1000+ chars)
   - [ ] Professional tone and quality
   - [ ] SEO metadata included

3. **Website Building**
   - [ ] Website folder created
   - [ ] All HTML files present
   - [ ] Responsive design working
   - [ ] SEO elements included

4. **Deployment**
   - [ ] GitHub Pages deployment successful
   - [ ] Website accessible at GitHub Pages URL
   - [ ] Health monitoring active
   - [ ] No deployment errors

## 🎉 Congratulations!

You've successfully used LumosGen to transform your project into a professional marketing website! Your site is now live and being monitored for optimal performance.

---

**LumosGen MVP v1.0** - Transforming code into marketing magic ✨
