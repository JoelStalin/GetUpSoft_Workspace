/**
 * Cost Optimizer
 * Intelligently selects best provider based on cost and performance trade-offs
 */

export interface CostMetrics {
  provider: string
  costPerToken: number
  averageResponseTime: number
  successRate: number
  cost?: number
  score?: number
}

export interface ProviderStats {
  provider: string
  totalRequests: number
  successfulRequests: number
  totalCost: number
  totalTokens: number
  averageResponseTime: number
  successRate: number
}

export interface OptimizationStrategy {
  name: 'cost' | 'performance' | 'balanced' | 'reliability'
  weights: {
    cost: number
    performance: number
    reliability: number
  }
}

export class CostOptimizer {
  private providerStats = new Map<string, ProviderStats>()
  private strategy: OptimizationStrategy = {
    name: 'balanced',
    weights: {
      cost: 0.4,
      performance: 0.3,
      reliability: 0.3,
    },
  }

  constructor(strategy?: OptimizationStrategy) {
    if (strategy) {
      this.setStrategy(strategy)
    }
  }

  /**
   * Set optimization strategy
   */
  setStrategy(strategy: OptimizationStrategy): void {
    this.strategy = strategy
    console.log(`Cost optimization strategy set to: ${strategy.name}`)
  }

  /**
   * Get current strategy
   */
  getStrategy(): OptimizationStrategy {
    return this.strategy
  }

  /**
   * Track request statistics
   */
  trackRequest(
    provider: string,
    cost: number,
    tokensUsed: number,
    responseTime: number,
    success: boolean
  ): void {
    let stats = this.providerStats.get(provider)

    if (!stats) {
      stats = {
        provider,
        totalRequests: 0,
        successfulRequests: 0,
        totalCost: 0,
        totalTokens: 0,
        averageResponseTime: 0,
        successRate: 100,
      }
      this.providerStats.set(provider, stats)
    }

    stats.totalRequests++
    if (success) {
      stats.successfulRequests++
    }
    stats.totalCost += cost
    stats.totalTokens += tokensUsed

    // Update average response time (exponential moving average)
    stats.averageResponseTime =
      stats.averageResponseTime * 0.7 + responseTime * 0.3

    stats.successRate = (stats.successfulRequests / stats.totalRequests) * 100
  }

  /**
   * Calculate cost per token
   */
  private getCostPerToken(provider: string): number {
    const stats = this.providerStats.get(provider)
    if (!stats || stats.totalTokens === 0) return Infinity
    return stats.totalCost / stats.totalTokens
  }

  /**
   * Get provider statistics
   */
  getProviderStats(provider: string): ProviderStats | undefined {
    return this.providerStats.get(provider)
  }

  /**
   * Get all provider statistics
   */
  getAllStats(): ProviderStats[] {
    return Array.from(this.providerStats.values())
  }

  /**
   * Calculate provider score based on strategy
   */
  private calculateScore(provider: string): number {
    const stats = this.providerStats.get(provider)
    if (!stats) return 0

    // Normalize metrics to 0-1 scale
    const costPerToken = this.getCostPerToken(provider)
    const allProviders = Array.from(this.providerStats.values())

    // Find min/max for normalization
    const minCost = Math.min(...allProviders.map((s) => this.getCostPerToken(s.provider)))
    const maxCost = Math.max(...allProviders.map((s) => this.getCostPerToken(s.provider)))
    const minResponseTime = Math.min(...allProviders.map((s) => s.averageResponseTime))
    const maxResponseTime = Math.max(...allProviders.map((s) => s.averageResponseTime))

    // Normalize scores (lower is better for cost/time)
    const costScore =
      maxCost === minCost ? 0.5 : 1 - (costPerToken - minCost) / (maxCost - minCost)
    const performanceScore =
      maxResponseTime === minResponseTime
        ? 0.5
        : 1 - (stats.averageResponseTime - minResponseTime) / (maxResponseTime - minResponseTime)
    const reliabilityScore = stats.successRate / 100

    // Calculate weighted score
    const weights = this.strategy.weights
    const totalWeight = weights.cost + weights.performance + weights.reliability
    const score =
      (costScore * weights.cost +
        performanceScore * weights.performance +
        reliabilityScore * weights.reliability) /
      totalWeight

    return score
  }

  /**
   * Get best provider based on current strategy
   */
  selectBestProvider(availableProviders: string[]): string {
    if (availableProviders.length === 0) {
      throw new Error('No providers available')
    }

    if (availableProviders.length === 1) {
      return availableProviders[0]
    }

    // Calculate scores for each provider
    const scores = availableProviders.map((provider) => ({
      provider,
      score: this.calculateScore(provider),
    }))

    // Sort by score (highest is best)
    scores.sort((a, b) => b.score - a.score)

    const selected = scores[0].provider
    console.log(
      `Selected provider: ${selected} (score: ${scores[0].score.toFixed(3)}) using ${this.strategy.name} strategy`
    )

    return selected
  }

  /**
   * Get cost breakdown
   */
  getCostBreakdown(): Record<string, number> {
    const breakdown: Record<string, number> = {}

    this.providerStats.forEach((stats, provider) => {
      breakdown[provider] = stats.totalCost
    })

    return breakdown
  }

  /**
   * Estimate cost for next request
   */
  estimateCost(provider: string, tokens: number): number {
    const costPerToken = this.getCostPerToken(provider)
    return costPerToken === Infinity ? 0 : costPerToken * tokens
  }

  /**
   * Compare providers
   */
  compareProviders(): CostMetrics[] {
    return this.getAllStats().map((stats) => ({
      provider: stats.provider,
      costPerToken: this.getCostPerToken(stats.provider),
      averageResponseTime: stats.averageResponseTime,
      successRate: stats.successRate,
      cost: stats.totalCost,
      score: this.calculateScore(stats.provider),
    }))
  }

  /**
   * Get recommendations
   */
  getRecommendations(): {
    cheapest: string
    fastest: string
    mostReliable: string
    bestOverall: string
  } {
    const stats = this.getAllStats()

    if (stats.length === 0) {
      throw new Error('No providers have been tracked')
    }

    const cheapest = stats.reduce((prev, curr) => {
      const prevCost = this.getCostPerToken(prev.provider)
      const currCost = this.getCostPerToken(curr.provider)
      return currCost < prevCost ? curr : prev
    })

    const fastest = stats.reduce((prev, curr) =>
      curr.averageResponseTime < prev.averageResponseTime ? curr : prev
    )

    const mostReliable = stats.reduce((prev, curr) =>
      curr.successRate > prev.successRate ? curr : prev
    )

    const bestOverall = stats[0].provider
    try {
      const available = stats.map((s) => s.provider)
      return {
        cheapest: cheapest.provider,
        fastest: fastest.provider,
        mostReliable: mostReliable.provider,
        bestOverall: this.selectBestProvider(available),
      }
    } catch {
      return {
        cheapest: cheapest.provider,
        fastest: fastest.provider,
        mostReliable: mostReliable.provider,
        bestOverall: bestOverall,
      }
    }
  }

  /**
   * Reset statistics
   */
  reset(): void {
    this.providerStats.clear()
    console.log('Cost optimizer statistics reset')
  }

  /**
   * Reset provider statistics
   */
  resetProvider(provider: string): void {
    this.providerStats.delete(provider)
    console.log(`Cost optimizer statistics reset for ${provider}`)
  }

  /**
   * Get detailed report
   */
  getReport(): {
    strategy: OptimizationStrategy
    stats: ProviderStats[]
    breakdown: Record<string, number>
    recommendations: ReturnType<CostOptimizer['getRecommendations']>
    comparison: CostMetrics[]
  } {
    return {
      strategy: this.strategy,
      stats: this.getAllStats(),
      breakdown: this.getCostBreakdown(),
      recommendations: this.getRecommendations(),
      comparison: this.compareProviders(),
    }
  }
}

// Export singleton instance
export const costOptimizer = new CostOptimizer({
  name: 'balanced',
  weights: {
    cost: 0.4,
    performance: 0.3,
    reliability: 0.3,
  },
})
