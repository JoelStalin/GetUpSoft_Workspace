import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CostOptimizer, costOptimizer } from '../../src/services/costOptimizer'

describe('Phase 8 Step 5: Cost Optimization', () => {
  let optimizer: CostOptimizer

  beforeEach(() => {
    optimizer = new CostOptimizer()
    vi.clearAllMocks()
  })

  describe('Strategy Configuration', () => {
    it('should set optimization strategy', () => {
      optimizer.setStrategy({
        name: 'cost',
        weights: {
          cost: 0.7,
          performance: 0.2,
          reliability: 0.1,
        },
      })

      const strategy = optimizer.getStrategy()
      expect(strategy.name).toBe('cost')
      expect(strategy.weights.cost).toBe(0.7)
    })

    it('should use balanced strategy by default', () => {
      const strategy = optimizer.getStrategy()
      expect(strategy.name).toBe('balanced')
    })

    it('should support cost-focused strategy', () => {
      optimizer.setStrategy({
        name: 'cost',
        weights: {
          cost: 0.8,
          performance: 0.1,
          reliability: 0.1,
        },
      })

      expect(optimizer.getStrategy().name).toBe('cost')
    })

    it('should support performance-focused strategy', () => {
      optimizer.setStrategy({
        name: 'performance',
        weights: {
          cost: 0.1,
          performance: 0.8,
          reliability: 0.1,
        },
      })

      expect(optimizer.getStrategy().name).toBe('performance')
    })

    it('should support reliability-focused strategy', () => {
      optimizer.setStrategy({
        name: 'reliability',
        weights: {
          cost: 0.1,
          performance: 0.1,
          reliability: 0.8,
        },
      })

      expect(optimizer.getStrategy().name).toBe('reliability')
    })
  })

  describe('Request Tracking', () => {
    it('should track successful request', () => {
      optimizer.trackRequest('openai', 0.001, 100, 500, true)

      const stats = optimizer.getProviderStats('openai')
      expect(stats).toBeDefined()
      expect(stats?.totalRequests).toBe(1)
      expect(stats?.successfulRequests).toBe(1)
      expect(stats?.totalCost).toBe(0.001)
      expect(stats?.totalTokens).toBe(100)
    })

    it('should track failed request', () => {
      optimizer.trackRequest('openai', 0.001, 100, 500, false)

      const stats = optimizer.getProviderStats('openai')
      expect(stats?.totalRequests).toBe(1)
      expect(stats?.successfulRequests).toBe(0)
      expect(stats?.successRate).toBe(0)
    })

    it('should accumulate multiple requests', () => {
      optimizer.trackRequest('openai', 0.001, 100, 500, true)
      optimizer.trackRequest('openai', 0.001, 100, 600, true)
      optimizer.trackRequest('openai', 0.001, 100, 400, true)

      const stats = optimizer.getProviderStats('openai')
      expect(stats?.totalRequests).toBe(3)
      expect(stats?.totalCost).toBeCloseTo(0.003, 5)
      expect(stats?.totalTokens).toBe(300)
    })

    it('should calculate success rate', () => {
      optimizer.trackRequest('openai', 0.001, 100, 500, true)
      optimizer.trackRequest('openai', 0.001, 100, 500, true)
      optimizer.trackRequest('openai', 0.001, 100, 500, false)

      const stats = optimizer.getProviderStats('openai')
      expect(stats?.successRate).toBeCloseTo(66.67, 1)
    })

    it('should calculate average response time', () => {
      optimizer.trackRequest('openai', 0.001, 100, 1000, true)
      optimizer.trackRequest('openai', 0.001, 100, 2000, true)

      const stats = optimizer.getProviderStats('openai')
      // EMA: initial 0, then 0 * 0.7 + 1000 * 0.3 = 300, then 300 * 0.7 + 2000 * 0.3 = 810
      expect(stats?.averageResponseTime).toBeCloseTo(810, 0)
    })
  })

  describe('Cost Analysis', () => {
    it('should calculate cost per token', () => {
      optimizer.trackRequest('openai', 0.002, 100, 500, true)
      optimizer.trackRequest('openai', 0.002, 100, 500, true)

      const stats = optimizer.getProviderStats('openai')
      // Total cost: 0.004, Total tokens: 200, Cost per token: 0.00002
      expect(stats?.totalCost / stats!.totalTokens).toBeCloseTo(0.00002, 5)
    })

    it('should compare provider costs', () => {
      optimizer.trackRequest('openai', 0.002, 100, 500, true)
      optimizer.trackRequest('anthropic', 0.001, 100, 500, true)

      const comparison = optimizer.compareProviders()
      const anthropic = comparison.find((c) => c.provider === 'anthropic')
      const openai = comparison.find((c) => c.provider === 'openai')

      expect(anthropic!.costPerToken).toBeLessThan(openai!.costPerToken)
    })

    it('should estimate cost for future request', () => {
      optimizer.trackRequest('openai', 0.002, 100, 500, true)

      const estimated = optimizer.estimateCost('openai', 50)
      expect(estimated).toBeCloseTo(0.001, 5)
    })

    it('should handle zero token cost estimation', () => {
      const estimated = optimizer.estimateCost('unknown', 100)
      expect(estimated).toBe(0)
    })
  })

  describe('Provider Selection', () => {
    it('should select best provider overall', () => {
      optimizer.trackRequest('openai', 0.002, 100, 1000, true)
      optimizer.trackRequest('openai', 0.002, 100, 1000, true)

      optimizer.trackRequest('anthropic', 0.001, 100, 500, true)
      optimizer.trackRequest('anthropic', 0.001, 100, 500, true)

      const best = optimizer.selectBestProvider(['openai', 'anthropic'])
      expect(['openai', 'anthropic']).toContain(best)
    })

    it('should select single provider when only one available', () => {
      const selected = optimizer.selectBestProvider(['openai'])
      expect(selected).toBe('openai')
    })

    it('should respect cost-focused strategy', () => {
      optimizer.setStrategy({
        name: 'cost',
        weights: { cost: 0.9, performance: 0.05, reliability: 0.05 },
      })

      optimizer.trackRequest('expensive', 0.01, 100, 500, true)
      optimizer.trackRequest('cheap', 0.001, 100, 600, true)

      const best = optimizer.selectBestProvider(['expensive', 'cheap'])
      expect(best).toBe('cheap')
    })

    it('should respect performance-focused strategy', () => {
      optimizer.setStrategy({
        name: 'performance',
        weights: { cost: 0.05, performance: 0.9, reliability: 0.05 },
      })

      optimizer.trackRequest('slow', 0.001, 100, 5000, true)
      optimizer.trackRequest('fast', 0.002, 100, 500, true)

      const best = optimizer.selectBestProvider(['slow', 'fast'])
      expect(best).toBe('fast')
    })

    it('should throw error when no providers available', () => {
      expect(() => optimizer.selectBestProvider([])).toThrow()
    })
  })

  describe('Recommendations', () => {
    beforeEach(() => {
      // Set up multi-provider scenario
      optimizer.trackRequest('openai', 0.002, 100, 1000, true)
      optimizer.trackRequest('openai', 0.002, 100, 1000, true)

      optimizer.trackRequest('anthropic', 0.001, 100, 500, true)
      optimizer.trackRequest('anthropic', 0.001, 100, 500, true)

      optimizer.trackRequest('nvidia', 0.0005, 100, 800, true)
      optimizer.trackRequest('nvidia', 0.0005, 100, 800, false)
    })

    it('should recommend cheapest provider', () => {
      const recs = optimizer.getRecommendations()
      expect(recs.cheapest).toBe('nvidia')
    })

    it('should recommend fastest provider', () => {
      const recs = optimizer.getRecommendations()
      expect(recs.fastest).toBe('anthropic')
    })

    it('should recommend most reliable provider', () => {
      const recs = optimizer.getRecommendations()
      expect(['openai', 'anthropic']).toContain(recs.mostReliable)
    })

    it('should recommend best overall provider', () => {
      const recs = optimizer.getRecommendations()
      expect(recs.bestOverall).toBeDefined()
    })
  })

  describe('Cost Breakdown', () => {
    it('should provide cost breakdown by provider', () => {
      optimizer.trackRequest('openai', 0.001, 100, 500, true)
      optimizer.trackRequest('anthropic', 0.002, 100, 500, true)

      const breakdown = optimizer.getCostBreakdown()
      expect(breakdown['openai']).toBeCloseTo(0.001, 5)
      expect(breakdown['anthropic']).toBeCloseTo(0.002, 5)
    })

    it('should handle empty breakdown', () => {
      const breakdown = optimizer.getCostBreakdown()
      expect(Object.keys(breakdown)).toHaveLength(0)
    })
  })

  describe('Provider Comparison', () => {
    it('should compare all providers', () => {
      optimizer.trackRequest('openai', 0.002, 100, 1000, true)
      optimizer.trackRequest('anthropic', 0.001, 100, 500, true)

      const comparison = optimizer.compareProviders()
      expect(comparison).toHaveLength(2)
      expect(comparison.map((c) => c.provider)).toContain('openai')
      expect(comparison.map((c) => c.provider)).toContain('anthropic')
    })

    it('should include metrics in comparison', () => {
      optimizer.trackRequest('openai', 0.002, 100, 1000, true)

      const comparison = optimizer.compareProviders()
      const openai = comparison[0]

      expect(openai).toHaveProperty('costPerToken')
      expect(openai).toHaveProperty('averageResponseTime')
      expect(openai).toHaveProperty('successRate')
      expect(openai).toHaveProperty('score')
    })
  })

  describe('Reset Operations', () => {
    it('should reset all statistics', () => {
      optimizer.trackRequest('openai', 0.001, 100, 500, true)
      optimizer.reset()

      const stats = optimizer.getProviderStats('openai')
      expect(stats).toBeUndefined()
    })

    it('should reset specific provider', () => {
      optimizer.trackRequest('openai', 0.001, 100, 500, true)
      optimizer.trackRequest('anthropic', 0.002, 100, 500, true)

      optimizer.resetProvider('openai')

      expect(optimizer.getProviderStats('openai')).toBeUndefined()
      expect(optimizer.getProviderStats('anthropic')).toBeDefined()
    })
  })

  describe('Reporting', () => {
    it('should generate comprehensive report', () => {
      optimizer.trackRequest('openai', 0.002, 100, 1000, true)
      optimizer.trackRequest('anthropic', 0.001, 100, 500, true)

      const report = optimizer.getReport()

      expect(report).toHaveProperty('strategy')
      expect(report).toHaveProperty('stats')
      expect(report).toHaveProperty('breakdown')
      expect(report).toHaveProperty('recommendations')
      expect(report).toHaveProperty('comparison')
    })

    it('should include all stats in report', () => {
      optimizer.trackRequest('openai', 0.001, 100, 500, true)

      const report = optimizer.getReport()
      expect(report.stats).toHaveLength(1)
      expect(report.stats[0].provider).toBe('openai')
    })
  })

  describe('Multi-Provider Optimization', () => {
    it('should optimize across multiple providers', () => {
      // Simulate realistic scenario
      optimizer.setStrategy({
        name: 'balanced',
        weights: { cost: 0.4, performance: 0.3, reliability: 0.3 },
      })

      // NVIDIA: fast, cheap, reliable
      for (let i = 0; i < 100; i++) {
        optimizer.trackRequest('nvidia', 0.0005, 100, 300, true)
      }

      // OpenAI: slower, more expensive, less reliable
      for (let i = 0; i < 100; i++) {
        optimizer.trackRequest('openai', 0.002, 100, 1000, i < 95) // 95% success rate
      }

      const recs = optimizer.getRecommendations()
      expect(recs.cheapest).toBe('nvidia')
      expect(recs.fastest).toBe('nvidia')
    })
  })

  describe('Singleton Instance', () => {
    it('should provide singleton cost optimizer', () => {
      expect(costOptimizer).toBeDefined()
      expect(costOptimizer).toBeInstanceOf(CostOptimizer)
    })

    it('should maintain state across imports', () => {
      costOptimizer.trackRequest('test', 0.001, 100, 500, true)
      const stats = costOptimizer.getProviderStats('test')

      expect(stats).toBeDefined()
      expect(stats?.totalRequests).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero tokens', () => {
      optimizer.trackRequest('openai', 0.001, 0, 500, true)
      // Should not crash
      expect(true).toBe(true)
    })

    it('should handle multiple errors in succession', () => {
      optimizer.trackRequest('openai', 0, 100, 500, false)
      optimizer.trackRequest('openai', 0, 100, 500, false)
      optimizer.trackRequest('openai', 0, 100, 500, false)

      const stats = optimizer.getProviderStats('openai')
      expect(stats?.successRate).toBe(0)
    })

    it('should handle very high costs', () => {
      optimizer.trackRequest('expensive', 100.0, 100, 500, true)
      const stats = optimizer.getProviderStats('expensive')
      expect(stats?.totalCost).toBe(100.0)
    })
  })
})
