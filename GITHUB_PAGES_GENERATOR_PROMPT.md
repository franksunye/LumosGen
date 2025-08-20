Please create and deploy a professional GitHub Pages marketing website for the current project:

**STEP 1: PROJECT ANALYSIS & CONTENT GENERATION**
1. Analyze the project codebase, README, package.json, and documentation files
2. Extract core value propositions, tech stack, features, and use cases
3. Identify target audience and competitive advantages
4. Generate professional English marketing content for international developers

**STEP 2: WEBSITE STRUCTURE CREATION**
Create a complete GitHub Pages website with this structure:

```
website/
├── index.html          # Marketing homepage (Hero + Features + CTA)
├── about.html          # Project details page
├── docs.html           # Documentation and API reference
├── blog/               # Technical blog directory
│   ├── index.html      # Blog homepage
│   └── getting-started.html  # Getting started article
├── assets/
│   ├── css/
│   │   └── styles.css  # Responsive CSS (Tailwind-based)
│   ├── js/
│   │   └── main.js     # Interactive functionality
│   └── images/         # Project screenshots and icons
├── sitemap.xml         # SEO sitemap
├── robots.txt          # Search engine directives
├── manifest.json       # PWA manifest
└── CNAME              # Custom domain (if needed)
```

**DESIGN REQUIREMENTS:**
- Modern responsive design using Tailwind CSS
- Dark/light theme support with toggle
- Complete SEO optimization (Meta tags, Open Graph, Twitter Card, JSON-LD)
- Performance optimization (preloading, compression, CDN)
- Professional technical marketing copy highlighting project value
- Clear CTAs (GitHub Star, Download, Documentation)

**STEP 3: GITHUB ACTIONS DEPLOYMENT**
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './website'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**STEP 4: AUTOMATIC DEPLOYMENT**
Execute these commands in sequence:

```bash
# Add all files to Git
git add .

# Commit changes
git commit -m "Add professional marketing website with auto-deploy

- Created responsive marketing website with Tailwind CSS
- Added comprehensive SEO optimization
- Configured GitHub Actions for automatic deployment
- Included blog section and documentation pages"

# Push to main branch (triggers auto-deployment)
git push origin main

# Display deployment info
echo "🚀 Website deployment initiated!"
echo "📍 Check deployment status at: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions"
echo "🌐 Your website will be available at: https://$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/' | tr '[:upper:]' '[:lower:]' | sed 's/\//.github.io\//')/"

# Setup instructions
echo "💡 If this is first time setup:"
echo "   1. Go to repository Settings > Pages"
echo "   2. Select 'GitHub Actions' as source"
echo "   3. Your site will be live in 2-3 minutes"
```

**STEP 5: DEPLOYMENT VERIFICATION**
After deployment, verify:
- Website is accessible
- All page links work correctly
- Responsive design displays properly on different devices
- SEO tags are correctly set
- Loading speed optimization is effective

**OUTPUT REQUIREMENTS:**
1. Create all website files (HTML, CSS, JS, etc.)
2. Generate GitHub Actions deployment configuration
3. Execute complete Git commit and push workflow
4. Provide deployment status check links
5. Output final website access URL

Please execute this complete workflow now to create and deploy a professional marketing website to GitHub Pages.
