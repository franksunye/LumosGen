import { Agent, Task, Team } from 'kaibanjs';

// 🔍 LumosGen ProjectWatcherAgent
const projectWatcherAgent = new Agent({
    name: 'ProjectWatcher',
    role: 'Project Monitor',
    goal: 'Analyze the LumosGen project and identify key features for marketing.',
    background: `Expert in project analysis and feature identification.
    Specializes in understanding VS Code extensions and developer tools.
    Experienced in identifying unique value propositions and competitive advantages.`,
    tools: []
});

// 📊 LumosGen ContentAnalyzerAgent
const contentAnalyzerAgent = new Agent({
    name: 'ContentAnalyzer',
    role: 'Content Strategist',
    goal: `Analyze project features and create comprehensive marketing content strategy.`,
    background: `Experienced marketing strategist specializing in developer tools and VS Code extensions.
    Expert in creating compelling value propositions for technical products and understanding
    developer pain points and motivations.`,
    tools: []
});

// 📝 LumosGen ContentGeneratorAgent
const contentGeneratorAgent = new Agent({
    name: 'ContentGenerator',
    role: 'Marketing Copywriter',
    goal: `Generate compelling, conversion-focused marketing copy for LumosGen.`,
    background: `Professional copywriter specializing in developer tools and technical products.
    Expert in creating clear, engaging content that converts technical audiences into users.
    Skilled in SEO optimization and conversion copywriting.`,
    tools: []
});

// Define LumosGen marketing tasks
const projectAnalysisTask = new Task({
  description: `Analyze the LumosGen VS Code extension project based on the provided information:

  Project Description: {projectDescription}
  Key Features: {keyFeatures}
  Target Audience: {targetAudience}

  Identify and analyze:
  - Core value propositions that differentiate LumosGen
  - Unique selling points in the VS Code extension marketplace
  - Competitive advantages over manual marketing approaches
  - Specific developer pain points that LumosGen addresses
  - Technical benefits and time-saving aspects`,
  expectedOutput: `Comprehensive project analysis report containing:
  - 3-5 clearly defined value propositions
  - Primary and secondary target audience segments
  - Competitive positioning statement
  - List of main user benefits with impact descriptions
  - Technical differentiators and innovation highlights`,
  agent: projectWatcherAgent
});

const contentStrategyTask = new Task({
    description: `Based on the detailed project analysis: {taskResult:task1}

    Create a comprehensive marketing content strategy that includes:
    - Homepage messaging hierarchy and information architecture
    - Key feature presentation order and emphasis
    - User journey mapping and conversion funnel considerations
    - Call-to-action placement and messaging recommendations
    - Content tone and style guidelines for developer audience
    - SEO keyword strategy and content optimization approach`,
    expectedOutput: `Detailed content strategy document with:
    - Homepage content structure and messaging hierarchy
    - Feature presentation order with rationale
    - Messaging tone and style guide tailored for developers
    - Conversion optimization recommendations and CTA strategy
    - User journey mapping with key decision points
    - SEO content guidelines and keyword integration plan`,
    agent: contentAnalyzerAgent
});

const marketingContentTask = new Task({
    description: `Generate comprehensive marketing content based on:
    - Project analysis insights: {taskResult:task1}
    - Content strategy framework: {taskResult:task2}

    Create complete marketing content package including:
    1. Homepage hero section with compelling headline and value proposition
    2. Feature highlights showcasing 4-5 key capabilities with benefits
    3. About section explaining the product story and team vision
    4. FAQ section addressing 6-8 common developer questions and concerns
    5. Call-to-action sections optimized for conversion

    Ensure all content is:
    - Developer-focused with technical credibility
    - Clear, concise, and action-oriented
    - SEO-optimized with relevant keywords
    - Conversion-focused with clear value propositions`,
    expectedOutput: `Complete marketing content package in structured format:
    - Hero section with compelling headline, subheadline, and primary CTA
    - Feature sections with benefits, use cases, and technical details
    - About section with product story, team background, and vision
    - FAQ section addressing installation, usage, pricing, and technical concerns
    - Meta descriptions and SEO titles for all sections
    - Additional CTAs and conversion elements throughout`,
    agent: contentGeneratorAgent
});

// Create LumosGen Marketing Team
const team = new Team({
  name: 'LumosGen Marketing AI Team',
  agents: [projectWatcherAgent, contentAnalyzerAgent, contentGeneratorAgent],
  tasks: [projectAnalysisTask, contentStrategyTask, marketingContentTask],
  inputs: {
    projectDescription: `LumosGen is an innovative VS Code extension that revolutionizes how developers
    create marketing content for their projects. It automatically generates and updates professional
    marketing websites using AI when you save files in your workspace. The extension transforms
    technical projects into compelling marketing materials with features like intelligent project
    analysis, AI-powered content generation, responsive website building, and seamless GitHub Pages deployment.`,

    keyFeatures: [
      'Intelligent project analysis with automatic tech stack identification',
      'AI-powered marketing content generation (homepage, about, blog, FAQ)',
      'Complete responsive website generation with modern Tailwind CSS design',
      'Intuitive VS Code sidebar integration for seamless content management',
      'One-click GitHub Pages deployment with automated workflows',
      'Advanced SEO optimization with meta tags, structured data, and sitemaps',
      'Real-time content preview and editing capabilities',
      'Multi-language support for global developer audiences'
    ],

    targetAudience: `Primary: Individual developers, indie developers, and small development teams
    who need professional marketing websites for their projects but lack design/marketing expertise
    or time. Secondary: Open source project maintainers, development agencies, startup founders,
    and technical entrepreneurs who want to showcase their work professionally.`,

    competitiveAdvantages: [
      'First VS Code extension specifically designed for marketing automation',
      'Zero-configuration setup with intelligent project detection',
      'AI-powered content that understands technical projects',
      'Seamless integration with developer workflows',
      'No external dependencies or complex setup required'
    ],

    userPainPoints: [
      'Lack of marketing and design skills among developers',
      'Time constraints preventing proper project promotion',
      'Difficulty translating technical features into user benefits',
      'Complex website building and deployment processes',
      'Inconsistent branding and messaging across projects'
    ]
  },
  env: {
    // Set your OpenAI API key in the .env file
    OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE'
  }
});

export default team;

/******************************************************************
 *                                                                *
 *        🚀 LumosGen Multi-Agent Marketing System 🚀            *
 *                                                                *
 * This KaibanJS configuration implements a sophisticated        *
 * multi-agent system for LumosGen's marketing automation:       *
 *                                                                *
 *   🔍 ProjectWatcher - Analyzes project features & value       *
 *   📊 ContentAnalyzer - Creates marketing strategy & structure *
 *   📝 ContentGenerator - Generates compelling marketing copy   *
 *                                                                *
 * To test this system:                                          *
 *   1. Set your OPENAI_API_KEY in the .env file                *
 *   2. Run: npm run kaiban                                      *
 *   3. Open http://localhost:5173 to see the Kanban board      *
 *   4. Click "Start Workflow" to watch agents collaborate      *
 *                                                                *
 * The agents will analyze LumosGen and generate complete        *
 * marketing content including homepage, features, about,        *
 * and FAQ sections optimized for developer audiences.          *
 *                                                                *
 * Next steps: Integrate with VS Code extension APIs            *
 *                                                                *
 ******************************************************************/
