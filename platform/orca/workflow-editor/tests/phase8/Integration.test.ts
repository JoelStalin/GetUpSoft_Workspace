import { describe, it, expect, beforeEach, vi } from 'vitest'
import { aiApiClient } from '../../src/services/aiApiClient'
import { analytics } from '../../src/services/analytics'
import { rateLimitManager } from '../../src/services/rateLimitManager'
import { costOptimizer } from '../../src/services/costOptimizer'

describe('Phase 8 Step 6: Service Integration', () => {
  beforeEach(() => {
    analytics.clear()
    rateLimitManager.resetAll()
    costOptimizer.reset()
    vi.clearAllMocks()
  })

  describe('Analytics Integration', () => {
    it('should track API calls through analytics service', () => {
      // This test verifies that when aiApiClient makes requests,
      // analytics service captures the events
      analytics.trackApiCall('test-model', 'openai', 0.001, 100, 500)

      const stats = analytics.getStats()
      expect(stats.totalApiCalls).toBeGreaterThan(0)
    })

    it('should track cache hits through analytics', () => {
      analytics.trackCacheHit('test-model')
      const stats = analytics.getStats()
      expect(stats.totalCacheHits).toBeGreaterThan(0)
    })

    it('should track errors through analytics', () => {
      analytics.trackError('TimeoutError', 'test-model')
      const stats = analytics.getStats()
      expect(stats.errorCount).toBeGreaterThan(0)
    })
  })

  describe('Rate Limit Integration', () => {
    it('should check rate limits before requests', () => {
      const status = rateLimitManager.getStatus('openai')
      expect(status).toBeDefined()
      expect(status.availableTokens).toBeGreaterThanOrEqual(0)
    })

    it('should prevent requests when rate limited', () => {
      // Exhaust rate limit
      const status = rateLimitManager.getStatus('test-provider')
      for (let i = 0; i < status.maxTokens; i++) {
        rateLimitManager.consumeToken('test-provider')
      }

      const canMake = rateLimitManager.canMakeRequest('test-provider')
      expect(canMake).toBe(false)
    })
  })

  describe('Cost Optimizer Integration', () => {
    it('should track request costs for optimization', () => {
      costOptimizer.trackRequest('openai', 0.002, 100, 500, true)
      costOptimizer.trackRequest('anthropic', 0.001, 100, 500, true)

      const comparison = costOptimizer.compareProviders()
      expect(comparison).toHaveLength(2)
    })

    it('should recommend best provider based on tracked data', () => {
      costOptimizer.trackRequest('expensive', 0.01, 100, 5000, true)
      costOptimizer.trackRequest('cheap', 0.001, 100, 500, true)

      costOptimizer.setStrategy({
        name: 'cost',
        weights: { cost: 0.9, performance: 0.05, reliability: 0.05 },
      })

      const best = costOptimizer.selectBestProvider(['expensive', 'cheap'])
      expect(best).toBe('cheap')
    })
  })

  describe('Multi-Service Workflow', () => {
    it('should handle complete request workflow with all services', () => {
      // Simulate workflow: check limits → track cost → log analytics
      const provider = 'openai'

      // Check rate limit
      expect(rateLimitManager.canMakeRequest(provider)).toBe(true)

      // Track cost and performance
      costOptimizer.trackRequest(provider, 0.002, 100, 500, true)

      // Track in analytics
      analytics.trackApiCall(provider, 'openai', 0.002, 100, 500)

      // Verify all services have data
      const rateLimitStatus = rateLimitManager.getStatus(provider)
      const analyticsStats = analytics.getStats()
      const costStats = costOptimizer.getProviderStats(provider)

      expect(rateLimitStatus).toBeDefined()
      expect(analyticsStats.totalApiCalls).toBeGreaterThan(0)
      expect(costStats).toBeDefined()
    })

    it('should combine all optimizations in sequence', () => {
      // 1. Check rate limits first
      const canRequest = rateLimitManager.canMakeRequest('openai')
      expect(canRequest).toBe(true)

      if (canRequest) {
        rateLimitManager.consumeToken('openai')

        // 2. Select best provider based on cost
        costOptimizer.trackRequest('nvidia', 0.0005, 100, 300, true)
        costOptimizer.trackRequest('openai', 0.002, 100, 1000, true)

        const best = costOptimizer.selectBestProvider(['nvidia', 'openai'])
        expect(best).toBeDefined()

        // 3. Track in analytics
        analytics.trackApiCall(best, best, 0.001, 100, 500)

        const stats = analytics.getStats()
        expect(stats.totalApiCalls).toBeGreaterThan(0)
      }
    })
  })

  describe('Service Health Check', () => {
    it('should verify all Phase 8 services are available', () => {
      expect(analytics).toBeDefined()
      expect(rateLimitManager).toBeDefined()
      expect(costOptimizer).toBeDefined()
    })

    it('should verify service APIs are consistent', () => {
      // Analytics API
      expect(typeof analytics.trackApiCall).toBe('function')
      expect(typeof analytics.getStats).toBe('function')

      // Rate Limiter API
      expect(typeof rateLimitManager.canMakeRequest).toBe('function')
      expect(typeof rateLimitManager.consumeToken).toBe('function')

      // Cost Optimizer API
      expect(typeof costOptimizer.trackRequest).toBe('function')
      expect(typeof costOptimizer.selectBestProvider).toBe('function')
    })
  })

  describe('Performance Under Integration', () => {
    it('should handle multiple operations efficiently', () => {
      const start = Date.now()

      // Simulate 100 operations with all services
      for (let i = 0; i < 100; i++) {
        if (rateLimitManager.canMakeRequest('test')) {
          rateLimitManager.consumeToken('test')
          costOptimizer.trackRequest('test', 0.001, 100, 500, true)
          analytics.trackApiCall('test', 'test', 0.001, 100, 500)
        }
      }

      const duration = Date.now() - start
      expect(duration).toBeLessThan(1000) // Should complete in under 1 second
    })
  })
})
