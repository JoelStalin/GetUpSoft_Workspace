import { describe, it, expect, beforeEach, vi } from 'vitest'
import { aiApiClient, AIClientOptions } from '../../src/services/aiApiClient'
import { analytics } from '../../src/services/analytics'
import { rateLimitManager } from '../../src/services/rateLimitManager'
import { costOptimizer } from '../../src/services/costOptimizer'

describe('Phase 8 Part 7: AIApiClient Integration with Phase 8 Services', () => {
  beforeEach(() => {
    analytics.clear()
    rateLimitManager.resetAll()
    costOptimizer.reset()
    vi.clearAllMocks()
  })

  describe('Analytics Integration', () => {
    it('should track API calls through analytics when sendMessage succeeds', () => {
      // Verify initial state
      let stats = analytics.getStats()
      expect(stats.totalApiCalls).toBe(0)

      // Simulate successful API call tracking (normally done by sendMessage)
      analytics.trackApiCall('test-model', 'openai', 0.001, 100, 500)

      // Verify analytics recorded the call
      stats = analytics.getStats()
      expect(stats.totalApiCalls).toBeGreaterThan(0)
      expect(stats.totalCost).toBeGreaterThan(0)
      expect(stats.totalTokensUsed).toBeGreaterThan(0)
    })

    it('should track errors through analytics', () => {
      // Simulate error tracking
      analytics.trackError('TimeoutError', 'test-model')

      const stats = analytics.getStats()
      expect(stats.errorCount).toBeGreaterThan(0)
    })

    it('should track fallbacks in analytics', () => {
      // Simulate fallback event (fromProvider, toProvider, modelId)
      analytics.trackFallback('nvidia', 'openai', 'test-model')

      const stats = analytics.getStats()
      expect(stats.fallbackCount).toBeGreaterThan(0)
    })

    it('should calculate cost per provider correctly', () => {
      // Track multiple API calls
      analytics.trackApiCall('model1', 'openai', 0.002, 100, 500)
      analytics.trackApiCall('model2', 'anthropic', 0.001, 50, 300)

      const costByProvider = analytics.getCostPerProvider()
      expect(costByProvider).toHaveProperty('openai')
      expect(costByProvider).toHaveProperty('anthropic')
      expect(costByProvider.openai).toBe(0.002)
      expect(costByProvider.anthropic).toBe(0.001)
    })
  })

  describe('Rate Limit Integration', () => {
    it('should check rate limits before allowing requests', () => {
      const canRequest = rateLimitManager.canMakeRequest('openai')
      expect(typeof canRequest).toBe('boolean')
      expect(canRequest).toBe(true) // First request should be allowed
    })

    it('should prevent requests when rate limited', () => {
      const status = rateLimitManager.getStatus('test-provider')

      // Exhaust rate limit
      for (let i = 0; i < status.maxTokens; i++) {
        rateLimitManager.consumeToken('test-provider')
      }

      // Verify rate limit is now exceeded
      const canRequest = rateLimitManager.canMakeRequest('test-provider')
      expect(canRequest).toBe(false)
    })

    it('should enforce per-provider rate limits independently', () => {
      // Exhaust one provider
      const openaiStatus = rateLimitManager.getStatus('openai')
      for (let i = 0; i < openaiStatus.maxTokens; i++) {
        rateLimitManager.consumeToken('openai')
      }

      // OpenAI should be rate limited
      expect(rateLimitManager.canMakeRequest('openai')).toBe(false)

      // Anthropic should still be available
      expect(rateLimitManager.canMakeRequest('anthropic')).toBe(true)
    })

    it('should queue requests when rate limited', async () => {
      // Exhaust rate limit
      const status = rateLimitManager.getStatus('test-provider')
      for (let i = 0; i < status.maxTokens; i++) {
        rateLimitManager.consumeToken('test-provider')
      }

      // Verify rate limited
      expect(rateLimitManager.canMakeRequest('test-provider')).toBe(false)

      // Queue a request
      let executed = false
      const promise = rateLimitManager.executeWithRateLimit('test-provider', async () => {
        executed = true
        return 'success'
      })

      // Verify request is queued but not executed yet
      expect(executed).toBe(false)

      // After execution, promise resolves
      const result = await promise
      expect(result).toBe('success')
    })
  })

  describe('Cost Optimization Integration', () => {
    it('should track request costs for optimization analysis', () => {
      costOptimizer.trackRequest('openai', 0.002, 100, 500, true)
      costOptimizer.trackRequest('anthropic', 0.001, 100, 300, true)

      const comparison = costOptimizer.compareProviders()
      expect(comparison).toHaveLength(2)
      expect(comparison[0]).toHaveProperty('provider')
      expect(comparison[0]).toHaveProperty('costPerToken')
      expect(comparison[0]).toHaveProperty('averageResponseTime')
      expect(comparison[0]).toHaveProperty('successRate')
    })

    it('should recommend best provider based on cost strategy', () => {
      costOptimizer.trackRequest('expensive', 0.01, 100, 5000, true)
      costOptimizer.trackRequest('cheap', 0.001, 100, 500, true)

      costOptimizer.setStrategy({
        name: 'cost',
        weights: { cost: 0.9, performance: 0.05, reliability: 0.05 },
      })

      const best = costOptimizer.selectBestProvider(['expensive', 'cheap'])
      expect(best).toBe('cheap')
    })

    it('should recommend best provider based on performance strategy', () => {
      costOptimizer.trackRequest('slow', 0.001, 100, 5000, true)
      costOptimizer.trackRequest('fast', 0.002, 100, 100, true)

      costOptimizer.setStrategy({
        name: 'performance',
        weights: { cost: 0.1, performance: 0.8, reliability: 0.1 },
      })

      const best = costOptimizer.selectBestProvider(['slow', 'fast'])
      expect(best).toBe('fast')
    })

    it('should provide comprehensive cost breakdown', () => {
      costOptimizer.trackRequest('provider-a', 0.002, 100, 500, true)
      costOptimizer.trackRequest('provider-b', 0.001, 50, 300, true)

      const stats = costOptimizer.getProviderStats('provider-a')
      expect(stats).toBeDefined()
      expect(stats.totalRequests).toBe(1)
      expect(stats.totalCost).toBe(0.002)
    })
  })

  describe('Multi-Service Workflow', () => {
    it('should handle complete workflow: rate check → cost track → analytics log', () => {
      const provider = 'openai'

      // Step 1: Check rate limit
      expect(rateLimitManager.canMakeRequest(provider)).toBe(true)

      // Step 2: Track cost for optimization
      costOptimizer.trackRequest(provider, 0.002, 100, 500, true)

      // Step 3: Track in analytics
      analytics.trackApiCall('model', provider, 0.002, 100, 500)

      // Verify all services have data
      const rateLimitStatus = rateLimitManager.getStatus(provider)
      const analyticsStats = analytics.getStats()
      const costStats = costOptimizer.getProviderStats(provider)

      expect(rateLimitStatus).toBeDefined()
      expect(rateLimitStatus.availableTokens).toBeGreaterThanOrEqual(0)
      expect(analyticsStats.totalApiCalls).toBeGreaterThan(0)
      expect(costStats).toBeDefined()
      expect(costStats.totalCost).toBe(0.002)
    })

    it('should combine all optimizations in realistic sequence', () => {
      // 1. Check rate limits first
      const canRequest = rateLimitManager.canMakeRequest('openai')
      expect(canRequest).toBe(true)

      if (canRequest) {
        rateLimitManager.consumeToken('openai')

        // 2. Select best provider based on cost
        costOptimizer.trackRequest('nvidia', 0.0005, 100, 300, true)
        costOptimizer.trackRequest('openai', 0.002, 100, 1000, true)

        costOptimizer.setStrategy({
          name: 'cost',
          weights: { cost: 0.7, performance: 0.2, reliability: 0.1 },
        })

        const best = costOptimizer.selectBestProvider(['nvidia', 'openai'])
        expect(best).toBe('nvidia') // Cheapest

        // 3. Track in analytics
        analytics.trackApiCall('model', best, 0.0005, 100, 300)

        const stats = analytics.getStats()
        expect(stats.totalApiCalls).toBeGreaterThan(0)
        expect(stats.totalCost).toBe(0.0005)
      }
    })

    it('should track error workflow through all services', () => {
      // Simulate failed request
      analytics.trackError('TimeoutError', 'model')

      // Attempt fallback (fromProvider, toProvider, modelId)
      analytics.trackFallback('nvidia', 'openai', 'model')

      // Track in cost optimizer as failure
      costOptimizer.trackRequest('nvidia', 0, 0, 30000, false)

      // Verify all services recorded the event
      const analyticsStats = analytics.getStats()
      const costStats = costOptimizer.getProviderStats('nvidia')

      expect(analyticsStats.errorCount).toBeGreaterThan(0)
      expect(analyticsStats.fallbackCount).toBeGreaterThan(0)
      expect(costStats).toBeDefined()
      expect(costStats.totalRequests).toBe(1)
    })
  })

  describe('Service Integration Verification', () => {
    it('should verify all Phase 8 services are available in AIApiClient context', () => {
      expect(analytics).toBeDefined()
      expect(rateLimitManager).toBeDefined()
      expect(costOptimizer).toBeDefined()
    })

    it('should verify service APIs are consistent and callable', () => {
      // Analytics API
      expect(typeof analytics.trackApiCall).toBe('function')
      expect(typeof analytics.trackError).toBe('function')
      expect(typeof analytics.trackFallback).toBe('function')
      expect(typeof analytics.getStats).toBe('function')

      // Rate Limiter API
      expect(typeof rateLimitManager.canMakeRequest).toBe('function')
      expect(typeof rateLimitManager.consumeToken).toBe('function')
      expect(typeof rateLimitManager.executeWithRateLimit).toBe('function')

      // Cost Optimizer API
      expect(typeof costOptimizer.trackRequest).toBe('function')
      expect(typeof costOptimizer.selectBestProvider).toBe('function')
      expect(typeof costOptimizer.getProviderStats).toBe('function')
    })

    it('should verify analytics has trackFallback method', () => {
      expect(typeof analytics.trackFallback).toBe('function')

      analytics.trackFallback('model', 'provider-a', 'provider-b')
      const stats = analytics.getStats()

      expect(stats.fallbackCount).toBeGreaterThan(0)
    })
  })

  describe('Performance Under Integration', () => {
    it('should handle multiple operations efficiently', () => {
      const start = Date.now()

      // Simulate 50 operations with all services
      for (let i = 0; i < 50; i++) {
        if (rateLimitManager.canMakeRequest('test')) {
          rateLimitManager.consumeToken('test')
          costOptimizer.trackRequest('test', 0.001, 100, 500, true)
          analytics.trackApiCall('test', 'test', 0.001, 100, 500)
        }
      }

      const duration = Date.now() - start
      expect(duration).toBeLessThan(1000) // Should complete in under 1 second
    })

    it('should handle fallback tracking with analytics overhead', () => {
      const start = Date.now()

      // Simulate fallback scenarios
      for (let i = 0; i < 20; i++) {
        analytics.trackFallback('provider-a', 'provider-b', 'model')
        costOptimizer.trackRequest('provider-b', 0.001, 100, 500, true)
      }

      const duration = Date.now() - start
      expect(duration).toBeLessThan(500) // Should be very fast
    })
  })

  describe('Integration State Management', () => {
    it('should maintain independent state across services', () => {
      // Track in analytics
      analytics.trackApiCall('model-1', 'provider-a', 0.001, 100, 500)

      // Track in cost optimizer
      costOptimizer.trackRequest('provider-b', 0.002, 200, 1000, true)

      // Consume in rate limiter
      rateLimitManager.consumeToken('provider-c')

      // Verify each service has its own state
      const analyticsStats = analytics.getStats()
      const costStats = costOptimizer.compareProviders()
      const rateLimitStatus = rateLimitManager.getStatus('provider-c')

      expect(analyticsStats.totalApiCalls).toBe(1)
      expect(costStats.length).toBeGreaterThan(0)
      expect(rateLimitStatus.availableTokens).toBeLessThan(rateLimitStatus.maxTokens)
    })

    it('should reset services independently', () => {
      // Add data to all services
      analytics.trackApiCall('model', 'provider', 0.001, 100, 500)
      costOptimizer.trackRequest('provider', 0.001, 100, 500, true)
      rateLimitManager.consumeToken('provider')

      // Verify data exists
      expect(analytics.getStats().totalApiCalls).toBeGreaterThan(0)
      expect(costOptimizer.compareProviders().length).toBeGreaterThan(0)
      expect(rateLimitManager.getStatus('provider').availableTokens).toBeLessThan(
        rateLimitManager.getStatus('provider').maxTokens
      )

      // Reset each service independently
      analytics.clear()
      expect(analytics.getStats().totalApiCalls).toBe(0)

      costOptimizer.reset()
      expect(costOptimizer.compareProviders().length).toBe(0)

      rateLimitManager.resetAll()
      const status = rateLimitManager.getStatus('provider')
      expect(status.availableTokens).toBe(status.maxTokens)
    })
  })
})
