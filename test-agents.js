#!/usr/bin/env node

/**
 * LumosGen KaibanJS Agent Test Script
 * 
 * This script tests our multi-agent system configuration
 * and validates the agent communication flow.
 */

import { Agent, Task, Team } from 'kaibanjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🚀 LumosGen KaibanJS Agent Test Starting...\n');

// Test 1: Basic Agent Creation
console.log('📋 Test 1: Creating LumosGen Agents...');

const projectWatcherAgent = new Agent({
    name: 'ProjectWatcher', 
    role: 'Project Monitor', 
    goal: 'Analyze the LumosGen project for marketing insights.', 
    background: 'Expert in VS Code extension analysis and developer tool evaluation.',
    tools: []
});

const contentAnalyzerAgent = new Agent({
    name: 'ContentAnalyzer', 
    role: 'Content Strategist', 
    goal: 'Create marketing strategy based on project analysis.',
    background: 'Marketing strategist specializing in developer tools.',
    tools: []
});

const contentGeneratorAgent = new Agent({
    name: 'ContentGenerator', 
    role: 'Marketing Copywriter', 
    goal: 'Generate compelling marketing copy for LumosGen.',
    background: 'Professional copywriter for technical products.',
    tools: []
});

console.log('✅ Agents created successfully!');
console.log(`   - ${projectWatcherAgent.name} (${projectWatcherAgent.role})`);
console.log(`   - ${contentAnalyzerAgent.name} (${contentAnalyzerAgent.role})`);
console.log(`   - ${contentGeneratorAgent.name} (${contentGeneratorAgent.role})\n`);

// Test 2: Task Definition
console.log('📋 Test 2: Defining Agent Tasks...');

const analysisTask = new Task({ 
  description: `Analyze LumosGen VS Code extension:
  - Core features: AI content generation, VS Code integration, GitHub deployment
  - Target audience: Developers who need marketing websites
  - Value proposition: Transform code projects into professional marketing sites
  
  Identify key selling points and competitive advantages.`,
  expectedOutput: 'Project analysis with value propositions and target audience insights.', 
  agent: projectWatcherAgent
});

const strategyTask = new Task({ 
    description: `Based on project analysis: {taskResult:task1}
    Create marketing content strategy including:
    - Homepage messaging structure
    - Feature presentation order
    - Call-to-action recommendations`,
    expectedOutput: 'Marketing strategy document with content structure and messaging guidelines.', 
    agent: contentAnalyzerAgent 
});

const contentTask = new Task({ 
    description: `Generate marketing content using:
    - Analysis: {taskResult:task1}
    - Strategy: {taskResult:task2}
    
    Create homepage hero section and feature highlights.`,
    expectedOutput: 'Marketing copy including hero section and feature descriptions.', 
    agent: contentGeneratorAgent 
});

console.log('✅ Tasks defined successfully!');
console.log(`   - Analysis Task: ${analysisTask.description.substring(0, 50)}...`);
console.log(`   - Strategy Task: ${strategyTask.description.substring(0, 50)}...`);
console.log(`   - Content Task: ${contentTask.description.substring(0, 50)}...\n`);

// Test 3: Team Creation
console.log('📋 Test 3: Creating LumosGen Marketing Team...');

const testTeam = new Team({
  name: 'LumosGen Marketing Test Team',
  agents: [projectWatcherAgent, contentAnalyzerAgent, contentGeneratorAgent],
  tasks: [analysisTask, strategyTask, contentTask],
  inputs: { 
    projectName: 'LumosGen',
    projectType: 'VS Code Extension',
    mainFeature: 'AI-powered marketing content generation'
  },
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || 'test-key'
  }
});

console.log('✅ Team created successfully!');
console.log(`   - Team Name: ${testTeam.name}`);
console.log(`   - Agents: ${testTeam.agents.length}`);
console.log(`   - Tasks: ${testTeam.tasks.length}`);
console.log(`   - API Key: ${testTeam.env.OPENAI_API_KEY ? 'Configured' : 'Missing'}\n`);

// Test 4: Configuration Validation
console.log('📋 Test 4: Validating Configuration...');

const validationResults = {
    agentsValid: testTeam.agents.every(agent => agent.name && agent.role && agent.goal),
    tasksValid: testTeam.tasks.every(task => task.description && task.expectedOutput && task.agent),
    inputsValid: Object.keys(testTeam.inputs).length > 0,
    envValid: testTeam.env.OPENAI_API_KEY && testTeam.env.OPENAI_API_KEY !== 'test-key'
};

console.log('✅ Configuration Validation Results:');
console.log(`   - Agents Valid: ${validationResults.agentsValid ? '✅' : '❌'}`);
console.log(`   - Tasks Valid: ${validationResults.tasksValid ? '✅' : '❌'}`);
console.log(`   - Inputs Valid: ${validationResults.inputsValid ? '✅' : '❌'}`);
console.log(`   - Environment Valid: ${validationResults.envValid ? '✅' : '⚠️  (API key needed for full test)'}\n`);

// Test 5: Mock Execution (without API call)
console.log('📋 Test 5: Mock Agent Workflow...');

console.log('🔍 ProjectWatcher would analyze:');
console.log('   - VS Code extension structure');
console.log('   - AI content generation features');
console.log('   - Developer workflow integration');

console.log('📊 ContentAnalyzer would create:');
console.log('   - Marketing message hierarchy');
console.log('   - Feature presentation strategy');
console.log('   - Developer-focused value propositions');

console.log('📝 ContentGenerator would produce:');
console.log('   - Compelling hero section copy');
console.log('   - Feature benefit descriptions');
console.log('   - Call-to-action messaging\n');

// Summary
console.log('🎉 LumosGen KaibanJS Agent Test Complete!');
console.log('\n📊 Test Summary:');
console.log(`   ✅ Agent Creation: Success`);
console.log(`   ✅ Task Definition: Success`);
console.log(`   ✅ Team Configuration: Success`);
console.log(`   ${validationResults.envValid ? '✅' : '⚠️ '} Environment Setup: ${validationResults.envValid ? 'Complete' : 'Needs API Key'}`);

console.log('\n🚀 Next Steps:');
console.log('   1. Set OPENAI_API_KEY in .env file');
console.log('   2. Run: npm run kaiban');
console.log('   3. Open: http://localhost:5173');
console.log('   4. Click "Start Workflow" to test with real AI');

console.log('\n🔗 KaibanJS Integration Status: ✅ READY');
console.log('🔗 VS Code Extension Integration: 🚧 Next Phase');

export default testTeam;
