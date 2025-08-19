import { Agent, Task, Team } from 'kaibanjs';

// 🔍 ProjectWatcherAgent - 监控项目变化
const projectWatcherAgent = new Agent({
    name: 'ProjectWatcher', 
    role: 'Project Monitor', 
    goal: 'Monitor project files and detect changes that require marketing content updates.', 
    background: `Expert in file system monitoring and change detection. 
    Specializes in identifying meaningful project changes that impact marketing content.
    Understands various project structures and can distinguish between code changes 
    and documentation updates.`,
    tools: []  // 将在后续添加文件监控工具
});

// 📊 ContentAnalyzerAgent - 分析内容质量
const contentAnalyzerAgent = new Agent({
    name: 'ContentAnalyzer', 
    role: 'Content Quality Analyst', 
    goal: `Analyze project content and determine the quality and completeness 
    of existing marketing materials.`,
    background: `Experienced content strategist with expertise in technical documentation,
    marketing copy analysis, and SEO optimization. Capable of evaluating content quality,
    identifying gaps, and recommending improvements for better user engagement.`,
    tools: []
});

// 🧠 UpdateDecisionAgent - 智能决策引擎
const updateDecisionAgent = new Agent({
    name: 'UpdateDecision', 
    role: 'Marketing Update Decision Maker', 
    goal: `Make intelligent decisions about when and how to update marketing content 
    based on project changes and content analysis.`,
    background: `Strategic decision maker with deep understanding of marketing automation,
    content lifecycle management, and user experience optimization. Uses data-driven
    insights to determine optimal timing and scope for content updates.`,
    tools: []
});

// 📝 ContentGeneratorAgent - 内容生成专家
const contentGeneratorAgent = new Agent({
    name: 'ContentGenerator', 
    role: 'Marketing Content Creator', 
    goal: `Generate high-quality marketing content including homepages, about pages,
    blog posts, and FAQ sections based on project analysis.`,
    background: `Professional copywriter and content strategist specializing in technical
    product marketing. Expert in creating compelling, SEO-optimized content that converts
    developers and technical audiences into users and customers.`,
    tools: []
});

// 定义任务流程

// Task 1: 项目监控任务
const projectMonitoringTask = new Task({ 
  description: `Monitor the project directory for significant changes.
  Analyze file modifications, additions, and deletions.
  Focus on changes that might impact marketing content:
  - README.md updates
  - Package.json changes (new features, version updates)
  - New documentation files
  - Code structure changes
  - Configuration updates
  
  Project path: {projectPath}
  Watch patterns: {watchPatterns}`,
  expectedOutput: `Structured report of detected changes with impact assessment:
  - List of modified files with timestamps
  - Change significance rating (high/medium/low)
  - Recommended marketing content updates
  - Priority level for each change`, 
  agent: projectWatcherAgent
});

// Task 2: 内容分析任务
const contentAnalysisTask = new Task({ 
    description: `Analyze existing marketing content quality and completeness.
    Review current marketing materials and identify gaps or improvement opportunities.
    
    Based on project changes from previous task: {taskResult:task1}
    
    Evaluate:
    - Content freshness and accuracy
    - SEO optimization level
    - User engagement potential
    - Technical accuracy
    - Competitive positioning`,
    expectedOutput: `Comprehensive content analysis report:
    - Current content quality score (1-10)
    - Identified content gaps
    - SEO improvement recommendations
    - User experience enhancement suggestions
    - Priority areas for content updates`, 
    agent: contentAnalyzerAgent 
});

// Task 3: 更新决策任务
const updateDecisionTask = new Task({ 
    description: `Make intelligent decisions about content updates based on:
    - Project changes: {taskResult:task1}
    - Content analysis: {taskResult:task2}
    
    Consider factors:
    - Change impact on user experience
    - Content update urgency
    - Resource requirements
    - SEO implications
    - User engagement potential
    
    Provide clear recommendations with confidence scores.`,
    expectedOutput: `Strategic update decision with detailed rationale:
    - Update recommendation (proceed/defer/partial)
    - Confidence score (0-100%)
    - Specific content areas to update
    - Estimated effort and timeline
    - Success metrics to track`, 
    agent: updateDecisionAgent 
});

// Task 4: 内容生成任务 (条件执行)
const contentGenerationTask = new Task({ 
    description: `Generate updated marketing content based on decisions from previous tasks.
    
    Update decisions: {taskResult:task3}
    Project context: {taskResult:task1}
    Content gaps: {taskResult:task2}
    
    Generate content for:
    - Homepage copy
    - About page content
    - Feature descriptions
    - FAQ sections
    - Blog post outlines
    
    Ensure content is:
    - SEO optimized
    - Technically accurate
    - Engaging for developers
    - Conversion-focused`,
    expectedOutput: `Complete marketing content package:
    - Updated homepage content (HTML/Markdown)
    - Refreshed about page copy
    - Feature highlight sections
    - FAQ content with technical details
    - Blog post drafts for major updates
    - SEO metadata and descriptions`, 
    agent: contentGeneratorAgent 
});

// 创建LumosGen多Agent团队
const lumosGenTeam = new Team({
  name: 'LumosGen Marketing AI Team',
  agents: [projectWatcherAgent, contentAnalyzerAgent, updateDecisionAgent, contentGeneratorAgent],
  tasks: [projectMonitoringTask, contentAnalysisTask, updateDecisionTask, contentGenerationTask],
  inputs: { 
    projectPath: process.cwd(),
    watchPatterns: ['**/*.md', '**/package.json', '**/README*', '**/docs/**'],
    contentTypes: ['homepage', 'about', 'features', 'faq', 'blog'],
    targetAudience: 'developers and technical teams',
    tone: 'professional yet approachable',
    seoKeywords: ['VS Code extension', 'AI content generation', 'developer tools', 'marketing automation']
  },
  env: {
    // 需要在.env文件中设置VITE_OPENAI_API_KEY
    OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE'
  }
});

export default lumosGenTeam;

/******************************************************************
 *                                                                *
 *        🚀 LumosGen Multi-Agent Marketing System 🚀            *
 *                                                                *
 * This configuration defines a sophisticated multi-agent system  *
 * specifically designed for LumosGen's marketing automation:     *
 *                                                                *
 *   🔍 ProjectWatcher - Monitors file changes intelligently      *
 *   📊 ContentAnalyzer - Evaluates content quality & gaps       *
 *   🧠 UpdateDecision - Makes smart update decisions            *
 *   📝 ContentGenerator - Creates compelling marketing copy     *
 *                                                                *
 * Next steps:                                                    *
 *   1. Add file monitoring tools to ProjectWatcher              *
 *   2. Integrate content analysis APIs                          *
 *   3. Implement decision logic with confidence scoring         *
 *   4. Connect to VS Code extension APIs                        *
 *                                                                *
 * Visit: https://kaibanjs.com for advanced configurations       *
 *                                                                *
 ******************************************************************/
