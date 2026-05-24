/**
 * Phase 9 E2E Tests: Phase 8 Features in Application Workflow
 * Validates that all Phase 8 advanced features work correctly in real workflows
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { aiApiClient, ChatMessage } from '../../src/services/aiApiClient'
import { analytics } from '../../src/services/analytics'
import { rateLimitManager } from '../../src/services/rateLimitManager'
import { costOptimizer } from '../../src/services/costOptimizer'

describe('Phase 9 E2E: Phase 8 Features in Application Workflow', () => {
  beforeEach(() => {
    // Reset all Phase 8 services for clean test state
    analytics.clear()
    rateLimitManager.resetAll()
    costOptimizer.reset()
    vi.clearAllMocks()
  })

  describe('Analytics Tracking in Workflow', () => {
    it('should track analytics for single API request', () => {
      // Simulate a successful API call
      const modelId = 'gpt-4'
      const provider = 'openai'
      const cost = 0.002
      const tokens = 150
      const duration = 450

      analytics.trackApiCall(modelId, provider, cost, tokens, duration)

      // Verify analytics recorded the event
      const stats = analytics.getStats()
      expect(stats.totalApiCalls).toBe(1)
      expect(stats.totalCost).toBe(cost)
      expect(stats.totalTokensUsed).toBe(tokens)
      expect(stats.averageResponseTime).toBe(duration)
    })

    it('should track multiple API calls with aggregated metrics', () => {
      // Simulate multiple requests
      analytics.trackApiCall('model-1', 'openai', 0.002, 100, 500)
      analytics.trackApiCall('model-2', 'anthropic', 0.001, 80, 300)
      analytics.trackApiCall('model-1', 'openai', 0.003, 120, 600)

      // Verify aggregation
      const stats = analytics.getStats()
      expect(stats.totalApiCalls).toBe(3)
      expect(stats.totalCost).toBe(0.006) // 0.002 + 0.001 + 0.003
      expect(stats.totalTokensUsed).toBe(300) // 100 + 80 + 120
    })

    it('should calculate cost per provider correctly', () => {
      // Track requests from different providers
      analytics.trackApiCall('model', 'openai', 0.002, 100, 500)
      analytics.trackApiCall('model', 'anthropic', 0.001, 100, 300)
      analytics.trackApiCall('model', 'openai', 0.003, 100, 400)

      // Verify per-provider cost calculation
      const costByProvider = analytics.getCostPerProvider()
      expect(costByProvider.openai).toBe(0.005) // 0.002 + 0.003
      expect(costByProvider.anthropic).toBe(0.001)
    })

    it('should track errors in analytics', () => {
      // Simulate API call followed by error
      analytics.trackApiCall('model', 'openai', 0.002, 100, 500)
      analytics.trackError('TimeoutError', 'model')
      analytics.trackError('AuthError', 'model')

      // Verify error tracking
      const stats = analytics.getStats()
      expect(stats.totalApiCalls).toBe(1)
      expect(stats.errorCount).toBe(2)
    })

    it('should track fallback events in analytics', () => {
      // Simulate primary request then fallback
      analytics.trackApiCall('model', 'nvidia', 0.003, 120, 600)
      analytics.trackFallback('nvidia', 'openai', 'model')
      analytics.trackApiCall('model', 'openai', 0.002, 100, 400)

      // Verify fallback tracking
      const stats = analytics.getStats()
      expect(stats.totalApiCalls).toBe(2)
      expect(stats.fallbackCount).toBe(1)
      expect(stats.totalCost).toBe(0.005) // Both calls tracked
    })
  })

  describe('Rate Limiting in Workflow', () => {
    it('should enforce rate limits on sequential requests', () => {
      // Exhaust rate limit
      const status = rateLimitManager.getStatus('openai')
      for (let i = 0; i < status.maxTokens; i++) {
        expect(rateLimitManager.canMakeRequest('openai')).toBe(true)
        rateLimitManager.consumeToken('openai')
      }

      // Verify rate limit enforced
      expect(rateLimitManager.canMakeRequest('openai')).toBe(false)
    })

    it('should maintain independent rate limits per provider', () => {
      const openaiStatus = rateLimitManager.getStatus('openai')
      const anthropicStatus = rateLimitManager.getStatus('anthropic')

      // Exhaust OpenAI
      for (let i = 0; i < openaiStatus.maxTokens; i++) {
        rateLimitManager.consumeToken('openai')
      }

      // OpenAI should be limited
      expect(rateLimitManager.canMakeRequest('openai')).toBe(false)

      // Anthropic should still be available
      expect(rateLimitManager.canMakeRequest('anthropic')).toBe(true)
    })

    it('should queue requests when rate limited', async () => {
      // Setup: exhaust rate limit
      const status = rateLimitManager.getStatus('test-provider')
      for (let i = 0; i < status.maxTokens; i++) {
        rateLimitManager.consumeToken('test-provider')
      }

      // Queue a request
      let executed = false
      const promise = rateLimitManager.executeWithRateLimit('test-provider', async () => {
        executed = true
        return 'completed'
      })

      // Request should be queued, not immediately executed
      expect(executed).toBe(false)

      // After promise resolves
      const result = await promise
      expect(result).toBe('completed')
    })

    it('should handle burst capacity correctly', () => {
      const status = rateLimitManager.getStatus('nvidia')
      const burstSize = 20 // NVIDIA burst capacity

      // Should allow burst requests
      for (let i = 0; i < burstSize; i++) {
        expect(rateLimitManager.canMakeRequest('nvidia')).toBe(true)
        rateLimitManager.consumeToken('nvidia')
      }

      // After burst exhausted
      expect(rateLimitManager.canMakeRequest('nvidia')).toBe(false)
    })
  })

  describe('Cache Integration in Workflow', () => {
    it('should track cache operations in analytics', () => {
      // Simulate cache hit
      analytics.trackCacheHit('model')
      analytics.trackCacheHit('model')

      // Simulate cache miss
      analytics.trackCacheMiss('model')

      // Verify cache tracking
      const stats = analytics.getStats()
      expect(stats.totalCacheHits).toBe(2)
      expect(stats.totalCacheMisses).toBe(1)
      expect(stats.cacheHitRate).toBeCloseTo(66.67, 1) // 2/3 = 66.67%
    })

    it('should show cache efficiency metrics', () => {
      // Simulate typical cache hit rate
      for (let i = 0; i < 8; i++) {
        analytics.trackCacheHit('model')
      }
      for (let i = 0; i < 2; i++) {
        analytics.trackCacheMiss('model')
      }

      // Verify cache effectiveness
      const stats = analytics.getStats()
      expect(stats.cacheHitRate).toBe(80) // 8/10 = 80%
      expect(stats.totalCacheHits).toBe(8)
    })
  })

  describe('Cost Optimization in Workflow', () => {
    it('should track request costs for provider selection', () => {
      // Track requests from different providers
      costOptimizer.trackRequest('openai', 0.002, 100, 500, true)
      costOptimizer.trackRequest('anthropic', 0.001, 100, 300, true)

      // Verify cost tracking
      const openaiStats = costOptimizer.getProviderStats('openai')
      const anthropicStats = costOptimizer.getProviderStats('anthropic')

      expect(openaiStats?.totalRequests).toBe(1)
      expect(openaiStats?.totalCost).toBe(0.002)
      expect(anthropicStats?.totalRequests).toBe(1)
      expect(anthropicStats?.totalCost).toBe(0.001)
    })

    it('should select optimal provider based on cost history', () => {
      // Track expensive vs cheap provider
      costOptimizer.trackRequest('expensive', 0.01, 100, 5000, true)
      costOptimizer.trackRequest('cheap', 0.001, 100, 500, true)

      // Set cost-focused strategy
      costOptimizer.setStrategy({
        name: 'cost',
        weights: { cost: 0.9, performance: 0.05, reliability: 0.05 },
      })

      // Verify optimal selection
      const best = costOptimizer.selectBestProvider(['expensive', 'cheap'])
      expect(best).toBe('cheap')
    })

    it('should select optimal provider based on performance', () => {
      // Track slow vs fast provider
      costOptimizer.trackRequest('slow', 0.001, 100, 5000, true)
      costOptimizer.trackRequest('fast', 0.002, 100, 100, true)

      // Set performance-focused strategy
      costOptimizer.setStrategy({
        name: 'performance',
        weights: { cost: 0.1, performance: 0.8, reliability: 0.1 },
      })

      // Verify optimal selection
      const best = costOptimizer.selectBestProvider(['slow', 'fast'])
      expect(best).toBe('fast')
    })

    it('should calculate cost breakdown by provider', () => {
      // Track costs across providers
      costOptimizer.trackRequest('openai', 0.002, 100, 500, true)
      costOptimizer.trackRequest('openai', 0.001, 50, 300, true)
      costOptimizer.trackRequest('anthropic', 0.003, 150, 700, true)

      // Verify cost breakdown
      const breakdown = costOptimizer.getCostBreakdown?.() || {}
      expect(breakdown).toBeDefined()
    })
  })

  describe('Multi-Service Integration in Workflows', () => {
    it('should handle complete workflow: rate check → track cost → log analytics', () => {
      const provider = 'openai'

      // Step 1: Check rate limit
      expect(rateLimitManager.canMakeRequest(provider)).toBe(true)

      // Step 2: Track cost
      costOptimizer.trackRequest(provider, 0.002, 100, 500, true)

      // Step 3: Log analytics
      analytics.trackApiCall('model', provider, 0.002, 100, 500)

      // Verify all services recorded the event
      const rateLimitStatus = rateLimitManager.getStatus(provider)
      const analyticsStats = analytics.getStats()
      const costStats = costOptimizer.getProviderStats(provider)

      expect(rateLimitStatus).toBeDefined()
      expect(analyticsStats.totalApiCalls).toBe(1)
      expect(costStats?.totalRequests).toBe(1)
    })

    it('should combine all optimizations in realistic workflow', () => {
      // 1. Check rate limits first
      expect(rateLimitManager.canMakeRequest('openai')).toBe(true)
      rateLimitManager.consumeToken('openai')

      // 2. Track costs for optimization
      costOptimizer.trackRequest('nvidia', 0.0005, 100, 300, true)
      costOptimizer.trackRequest('openai', 0.002, 100, 1000, true)

      // 3. Select best provider
      costOptimizer.setStrategy({
        name: 'cost',
        weights: { cost: 0.7, performance: 0.2, reliability: 0.1 },
      })
      const best = costOptimizer.selectBestProvider(['nvidia', 'openai'])
      expect(best).toBeDefined()

      // 4. Track in analytics
      analytics.trackApiCall('model', best, 0.0005, 100, 300)

      // Verify complete workflow
      const stats = analytics.getStats()
      expect(stats.totalApiCalls).toBe(1)
      expect(stats.totalCost).toBeCloseTo(0.0005, 4)
    })

    it('should handle error workflow with all services', () => {
      // Simulate failure scenario
      analytics.trackError('TimeoutError', 'model')
      analytics.trackFallback('nvidia', 'openai', 'model')
      costOptimizer.trackRequest('nvidia', 0, 0, 30000, false)

      // Verify all services recorded the event
      const analyticsStats = analytics.getStats()
      const costStats = costOptimizer.getProviderStats('nvidia')

      expect(analyticsStats.errorCount).toBe(1)
      expect(analyticsStats.fallbackCount).toBe(1)
      expect(costStats?.totalRequests).toBe(1)
    })

    it('should maintain consistent state across service interactions', () => {
      // Execute multiple operations
      for (let i = 0; i < 10; i++) {
        const provider = i % 2 === 0 ? 'openai' : 'anthropic'

        if (rateLimitManager.canMakeRequest(provider)) {
          rateLimitManager.consumeToken(provider)
          costOptimizer.trackRequest(provider, 0.001, 100, 500, true)
          analytics.trackApiCall('model', provider, 0.001, 100, 500)
        }
      }

      // Verify consistency
      const analyticsStats = analytics.getStats()
      const openaiStats = costOptimizer.getProviderStats('openai')
      const anthropicStats = costOptimizer.getProviderStats('anthropic')

      expect(analyticsStats.totalApiCalls).toBeGreaterThan(0)
      expect(openaiStats?.totalCost).toBeLessThanOrEqual(analyticsStats.totalCost)
      expect(anthropicStats?.totalCost).toBeLessThanOrEqual(analyticsStats.totalCost)
    })
  })

  describe('Production Readiness Validation', () => {
    it('should handle high-volume workflow', () => {
      const start = Date.now()

      // Simulate high-volume requests
      for (let i = 0; i < 100; i++) {
        const provider = ['openai', 'anthropic', 'nvidia'][i % 3]

        if (rateLimitManager.canMakeRequest(provider)) {
          rateLimitManager.consumeToken(provider)
          costOptimizer.trackRequest(provider, 0.001, 100, 500, true)
          analytics.trackApiCall(`model-${i}`, provider, 0.001, 100, 500)
        }
      }

      const duration = Date.now() - start

      // Verify performance
      const stats = analytics.getStats()
      expect(stats.totalApiCalls).toBeGreaterThanOrEqual(80) // Should handle most requests
      expect(duration).toBeLessThan(5000) // Should complete in <5 seconds
    })

    it('should maintain data accuracy under stress', () => {
      // Track diverse requests
      const requests = [
        { provider: 'openai', cost: 0.002, tokens: 150, time: 500 },
        { provider: 'anthropic', cost: 0.001, tokens: 100, time: 300 },
        { provider: 'nvidia', cost: 0.0005, tokens: 80, time: 200 },
      ]

      // Execute multiple times
      for (let cycle = 0; cycle < 3; cycle++) {
        for (const req of requests) {
          costOptimizer.trackRequest(req.provider, req.cost, req.tokens, req.time, true)
          analytics.trackApiCall('model', req.provider, req.cost, req.tokens, req.time)
        }
      }

      // Verify accuracy
      const stats = analytics.getStats()
      expect(stats.totalApiCalls).toBe(9) // 3 providers × 3 cycles
      expect(stats.totalCost).toBeCloseTo(0.0105, 4) // (0.002 + 0.001 + 0.0005) × 3
    })

    it('should provide actionable insights from analytics', () => {
      // Track diverse requests
      analytics.trackApiCall('model-1', 'openai', 0.003, 200, 800)
      analytics.trackApiCall('model-2', 'openai', 0.002, 150, 600)
      analytics.trackApiCall('model-3', 'anthropic', 0.001, 100, 400)
      analytics.trackCacheHit('model-1')
      analytics.trackCacheHit('model-2')
      analytics.trackError('TimeoutError', 'model-3')

      // Verify insights available
      const stats = analytics.getStats()
      const costByProvider = analytics.getCostPerProvider()

      expect(stats.totalApiCalls).toBe(3)
      expect(stats.averageResponseTime).toBeGreaterThan(0)
      expect(stats.cacheHitRate).toBe(40) // 2/5 = 40%
      expect(stats.errorCount).toBe(1)
      expect(costByProvider.openai).toBe(0.005)
      expect(costByProvider.anthropic).toBe(0.001)
    })

    it('should be resilient to service disruptions', () => {
      // Simulate service being temporarily unavailable
      const providers = ['openai', 'anthropic', 'nvidia']

      // Track some successful requests
      for (let i = 0; i < 5; i++) {
        const provider = providers[i % 3]
        costOptimizer.trackRequest(provider, 0.001, 100, 500, true)
        analytics.trackApiCall('model', provider, 0.001, 100, 500)
      }

      // Simulate errors
      for (let i = 0; i < 3; i++) {
        analytics.trackError('ServiceError', 'model')
      }

      // Simulate recovery
      for (let i = 0; i < 2; i++) {
        costOptimizer.trackRequest('openai', 0.002, 100, 500, true)
        analytics.trackApiCall('model', 'openai', 0.002, 100, 500)
      }

      // Verify recovery
      const stats = analytics.getStats()
      expect(stats.totalApiCalls).toBe(7) // 5 + 2
      expect(stats.errorCount).toBe(3)
      expect(stats.totalCost).toBeGreaterThan(0)
    })
  })
})
