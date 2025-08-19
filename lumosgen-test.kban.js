import { Agent, Task, Team } from 'kaibanjs';

// 🔍 简化的ProjectWatcherAgent - 用于测试
const projectWatcherAgent = new Agent({
    name: 'ProjectWatcher', 
    role: 'Project Monitor', 
    goal: 'Analyze the current LumosGen project and identify key features for marketing.', 
    background: `Expert in project analysis and feature identification. 
    Specializes in understanding VS Code extensions and developer tools.`,
    tools: []
});

// 📊 简化的ContentAnalyzerAgent - 用于测试
const contentAnalyzerAgent = new Agent({
    name: 'ContentAnalyzer', 
    role: 'Content Strategist', 
    goal: `Analyze project features and create marketing content strategy.`,
    background: `Experienced marketing strategist specializing in developer tools.
    Expert in creating compelling value propositions for technical products.`,
    tools: []
});

// 📝 简化的ContentGeneratorAgent - 用于测试
const contentGeneratorAgent = new Agent({
    name: 'ContentGenerator', 
    role: 'Marketing Copywriter', 
    goal: `Generate compelling marketing copy for LumosGen VS Code extension.`,
    background: `Professional copywriter specializing in developer tools and VS Code extensions.
    Expert in creating conversion-focused marketing content.`,
    tools: []
});

// 定义简化的任务流程

// Task 1: 项目分析
const projectAnalysisTask = new Task({ 
  description: `Analyze the LumosGen project based on the provided information:
  
  Project Description: {projectDescription}
  Key Features: {keyFeatures}
  Target Audience: {targetAudience}
  
  Identify:
  - Core value propositions
  - Unique selling points
  - Competitive advantages
  - User pain points addressed`,
  expectedOutput: `Project analysis report with:
  - 3-5 key value propositions
  - Primary and secondary target audiences
  - Competitive positioning
  - Main user benefits`, 
  agent: projectWatcherAgent
});

// Task 2: 内容策略
const contentStrategyTask = new Task({ 
    description: `Based on the project analysis: {taskResult:task1}
    
    Create a comprehensive content strategy including:
    - Homepage messaging hierarchy
    - Key feature highlights
    - User journey considerations
    - Call-to-action recommendations`,
    expectedOutput: `Content strategy document with:
    - Homepage content structure
    - Feature presentation order
    - Messaging tone and style guide
    - Conversion optimization recommendations`, 
    agent: contentAnalyzerAgent 
});

// Task 3: 营销内容生成
const marketingContentTask = new Task({ 
    description: `Generate marketing content based on:
    - Project analysis: {taskResult:task1}
    - Content strategy: {taskResult:task2}
    
    Create:
    1. Homepage hero section
    2. Feature highlights (3-4 key features)
    3. About section
    4. FAQ section (5-6 common questions)
    
    Ensure content is:
    - Developer-focused
    - Clear and concise
    - Action-oriented
    - SEO-friendly`,
    expectedOutput: `Complete marketing content package in Markdown format:
    - Hero section with compelling headline and CTA
    - Feature sections with benefits and use cases
    - About section with team/product story
    - FAQ section addressing common concerns
    - Meta descriptions for SEO`, 
    agent: contentGeneratorAgent 
});

// 创建测试团队
const lumosGenTestTeam = new Team({
  name: 'LumosGen Marketing Test Team',
  agents: [projectWatcherAgent, contentAnalyzerAgent, contentGeneratorAgent],
  tasks: [projectAnalysisTask, contentStrategyTask, marketingContentTask],
  inputs: { 
    projectDescription: `LumosGen is a VS Code extension that automatically generates and updates 
    marketing content using AI when you save files in your workspace. It transforms technical 
    projects into professional marketing websites with features like project analysis, 
    AI content generation, website building, and GitHub Pages deployment.`,
    
    keyFeatures: [
      'Automatic project analysis and tech stack identification',
      'AI-powered marketing content generation (homepage, about, blog, FAQ)',
      'Complete responsive website generation with modern design',
      'VS Code sidebar integration for easy content management',
      'One-click GitHub Pages deployment',
      'SEO optimization with meta tags and structured data'
    ],
    
    targetAudience: `Primary: Individual developers and small development teams who need 
    professional marketing websites for their projects but lack design/marketing expertise.
    Secondary: Open source project maintainers, indie developers, and development agencies.`,
    
    tone: 'professional yet approachable, technical but accessible',
    
    goals: [
      'Increase VS Code extension downloads',
      'Drive GitHub repository stars',
      'Convert users to active extension users',
      'Build developer community around the tool'
    ]
  },
  env: {
    // 使用环境变量或默认值进行测试
    OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY || 'test-key-for-demo'
  }
});

export default lumosGenTestTeam;

/******************************************************************
 *                                                                *
 *        🧪 LumosGen Agent System - Test Configuration 🧪       *
 *                                                                *
 * This is a simplified test version of the LumosGen multi-agent *
 * system designed to validate core functionality:               *
 *                                                                *
 *   ✅ Agent communication and task flow                        *
 *   ✅ Content generation pipeline                              *
 *   ✅ KaibanJS integration with VS Code project               *
 *   ✅ Marketing content creation workflow                      *
 *                                                                *
 * To run this test:                                             *
 *   1. Set OPENAI_API_KEY in .env file                         *
 *   2. Run: npm run kaiban                                      *
 *   3. Open http://localhost:5173 to see Kanban board          *
 *   4. Click "Start Workflow" to test the agents               *
 *                                                                *
 ******************************************************************/
