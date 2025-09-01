// Usage Monitor - Tracks AI service usage, costs, and performance metrics
// Provides insights for cost optimization and service reliability

import { UsageStats, AIResponse } from '../types';

export interface DetailedUsageStats extends UsageStats {
  averageResponseTime: number;
  successRate: number;
  costPerRequest: number;
  costPerToken: number;
  peakUsageHour: number;
  dailyUsage: { [date: string]: UsageStats };
}

export interface CostAlert {
  type: 'daily' | 'monthly' | 'total';
  threshold: number;
  current: number;
  triggered: boolean;
  timestamp: number;
}

export interface PerformanceMetrics {
  averageLatency: number;
  p95Latency: number;
  errorRate: number;
  throughput: number; // requests per minute
  uptime: number; // percentage
}

export class UsageMonitor {
  private stats: Map<string, DetailedUsageStats> = new Map();
  private responseTimes: Map<string, number[]> = new Map();
  private costAlerts: CostAlert[] = [];
  private performanceHistory: Map<string, PerformanceMetrics[]> = new Map();
  private startTime = Date.now();

  constructor() {
    this.initializeStats();
    this.startPeriodicCleanup();
  }

  private initializeStats(): void {
    const providers = ['deepseek', 'openai', 'mock'];
    
    for (const provider of providers) {
      this.stats.set(provider, {
        provider,
        requests: 0,
        tokens: { input: 0, output: 0, total: 0 },
        cost: 0,
        errors: 0,
        lastUsed: 0,
        averageResponseTime: 0,
        successRate: 100,
        costPerRequest: 0,
        costPerToken: 0,
        peakUsageHour: 0,
        dailyUsage: {}
      });
      
      this.responseTimes.set(provider, []);
      this.performanceHistory.set(provider, []);
    }
  }

  recordRequest(provider: string, response: AIResponse | null, responseTime: number, error?: Error): void {
    const stats = this.stats.get(provider);
    if (!stats) return;

    const today = new Date().toISOString().split('T')[0];

    // Initialize daily stats if needed
    if (!stats.dailyUsage[today]) {
      stats.dailyUsage[today] = {
        provider,
        requests: 0,
        tokens: { input: 0, output: 0, total: 0 },
        cost: 0,
        errors: 0,
        lastUsed: 0
      };
    }

    // Update main stats
    stats.requests++;
    stats.lastUsed = Date.now();

    // Update daily stats
    const dailyStats = stats.dailyUsage[today];
    dailyStats.requests++;
    dailyStats.lastUsed = Date.now();

    if (error || !response) {
      stats.errors++;
      dailyStats.errors++;
    } else {
      // Record successful response
      stats.tokens.input += response.usage.promptTokens;
      stats.tokens.output += response.usage.completionTokens;
      stats.tokens.total += response.usage.totalTokens;
      stats.cost += response.cost || 0;

      dailyStats.tokens.input += response.usage.promptTokens;
      dailyStats.tokens.output += response.usage.completionTokens;
      dailyStats.tokens.total += response.usage.totalTokens;
      dailyStats.cost += response.cost || 0;
    }

    // Update response times
    const times = this.responseTimes.get(provider) || [];
    times.push(responseTime);
    
    // Keep only last 100 response times for memory efficiency
    if (times.length > 100) {
      times.shift();
    }
    this.responseTimes.set(provider, times);

    // Recalculate derived metrics
    this.updateDerivedMetrics(provider);
    
    // Check cost alerts
    this.checkCostAlerts(provider, stats);
    
    // Update performance metrics
    this.updatePerformanceMetrics(provider);
  }

  private updateDerivedMetrics(provider: string): void {
    const stats = this.stats.get(provider);
    if (!stats) return;

    const times = this.responseTimes.get(provider) || [];
    
    // Average response time
    if (times.length > 0) {
      stats.averageResponseTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    }

    // Success rate
    if (stats.requests > 0) {
      stats.successRate = ((stats.requests - stats.errors) / stats.requests) * 100;
    }

    // Cost per request
    if (stats.requests > 0) {
      stats.costPerRequest = stats.cost / stats.requests;
    }

    // Cost per token
    if (stats.tokens.total > 0) {
      stats.costPerToken = stats.cost / stats.tokens.total;
    }

    // Peak usage hour (simplified - just track current hour)
    const currentHour = new Date().getHours();
    stats.peakUsageHour = currentHour;
  }

  private updatePerformanceMetrics(provider: string): void {
    const stats = this.stats.get(provider);
    const times = this.responseTimes.get(provider) || [];
    const history = this.performanceHistory.get(provider) || [];
    
    if (!stats || times.length === 0) return;

    // Calculate metrics
    const sortedTimes = [...times].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedTimes.length * 0.95);
    
    const metrics: PerformanceMetrics = {
      averageLatency: stats.averageResponseTime,
      p95Latency: sortedTimes[p95Index] || 0,
      errorRate: 100 - stats.successRate,
      throughput: this.calculateThroughput(provider),
      uptime: this.calculateUptime(provider)
    };

    history.push(metrics);
    
    // Keep only last 24 hours of metrics (assuming 1 metric per hour)
    if (history.length > 24) {
      history.shift();
    }
    
    this.performanceHistory.set(provider, history);
  }

  private calculateThroughput(provider: string): number {
    const stats = this.stats.get(provider);
    if (!stats || !stats.lastUsed) return 0;

    const now = Date.now();
    const minutesActive = (now - (stats.lastUsed - 60000)) / 60000; // Last minute
    
    // This is a simplified calculation - in production you'd want more sophisticated tracking
    return minutesActive > 0 ? 1 / minutesActive : 0;
  }

  private calculateUptime(provider: string): number {
    const stats = this.stats.get(provider);
    if (!stats) return 0;

    const totalTime = Date.now() - this.startTime;
    const errorTime = stats.errors * 1000; // Assume 1 second downtime per error
    
    return totalTime > 0 ? Math.max(0, (totalTime - errorTime) / totalTime * 100) : 100;
  }

  private checkCostAlerts(provider: string, stats: DetailedUsageStats): void {
    // Check daily cost alert
    const today = new Date().toISOString().split('T')[0];
    const dailyCost = stats.dailyUsage[today]?.cost || 0;
    
    if (dailyCost > 10) { // $10 daily threshold
      this.triggerCostAlert('daily', 10, dailyCost);
    }

    // Check total cost alert
    if (stats.cost > 100) { // $100 total threshold
      this.triggerCostAlert('total', 100, stats.cost);
    }
  }

  private triggerCostAlert(type: 'daily' | 'monthly' | 'total', threshold: number, current: number): void {
    const existingAlert = this.costAlerts.find(alert => 
      alert.type === type && alert.threshold === threshold && alert.triggered
    );

    if (!existingAlert) {
      this.costAlerts.push({
        type,
        threshold,
        current,
        triggered: true,
        timestamp: Date.now()
      });
      
      console.warn(`💰 Cost Alert: ${type} usage ($${current.toFixed(2)}) exceeded threshold ($${threshold})`);
    }
  }

  getStats(provider?: string): DetailedUsageStats | { [key: string]: DetailedUsageStats } {
    if (provider) {
      return this.stats.get(provider) || this.createEmptyStats(provider);
    }
    
    const allStats: { [key: string]: DetailedUsageStats } = {};
    for (const [providerName, stats] of this.stats) {
      allStats[providerName] = { ...stats };
    }
    return allStats;
  }

  getPerformanceMetrics(provider: string): PerformanceMetrics[] {
    return this.performanceHistory.get(provider) || [];
  }

  getCostAlerts(): CostAlert[] {
    return [...this.costAlerts];
  }

  getTotalCost(): number {
    let total = 0;
    for (const stats of this.stats.values()) {
      total += stats.cost;
    }
    return total;
  }

  getDailyCost(date?: string): number {
    const targetDate = date || new Date().toISOString().split('T')[0];
    let total = 0;
    
    for (const stats of this.stats.values()) {
      const dailyStats = stats.dailyUsage[targetDate];
      if (dailyStats) {
        total += dailyStats.cost;
      }
    }
    
    return total;
  }

  getCostSavings(): { amount: number; percentage: number; comparison: string } {
    const deepseekStats = this.stats.get('deepseek');
    const openaiStats = this.stats.get('openai');
    
    if (!deepseekStats || !openaiStats) {
      return { amount: 0, percentage: 0, comparison: 'No comparison data available' };
    }

    // Estimate what OpenAI would have cost for DeepSeek usage
    const deepseekTokens = deepseekStats.tokens.total;
    const estimatedOpenAICost = deepseekTokens * 0.0006; // Rough OpenAI cost per token
    const actualDeepSeekCost = deepseekStats.cost;
    
    const savings = estimatedOpenAICost - actualDeepSeekCost;
    const percentage = estimatedOpenAICost > 0 ? (savings / estimatedOpenAICost) * 100 : 0;
    
    return {
      amount: Math.max(0, savings),
      percentage: Math.max(0, percentage),
      comparison: `DeepSeek vs OpenAI for ${deepseekTokens.toLocaleString()} tokens`
    };
  }

  private createEmptyStats(provider: string): DetailedUsageStats {
    return {
      provider,
      requests: 0,
      tokens: { input: 0, output: 0, total: 0 },
      cost: 0,
      errors: 0,
      lastUsed: 0,
      averageResponseTime: 0,
      successRate: 100,
      costPerRequest: 0,
      costPerToken: 0,
      peakUsageHour: 0,
      dailyUsage: {}
    };
  }

  private startPeriodicCleanup(): void {
    // Clean up old daily usage data every 24 hours
    setInterval(() => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30); // Keep 30 days
      const cutoffString = cutoffDate.toISOString().split('T')[0];
      
      for (const stats of this.stats.values()) {
        for (const date in stats.dailyUsage) {
          if (date < cutoffString) {
            delete stats.dailyUsage[date];
          }
        }
      }
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  reset(): void {
    this.stats.clear();
    this.responseTimes.clear();
    this.costAlerts.length = 0;
    this.performanceHistory.clear();
    this.startTime = Date.now();
    this.initializeStats();
  }

  exportData(): string {
    return JSON.stringify({
      stats: Object.fromEntries(this.stats),
      costAlerts: this.costAlerts,
      performanceHistory: Object.fromEntries(this.performanceHistory),
      exportTimestamp: Date.now()
    }, null, 2);
  }
}
