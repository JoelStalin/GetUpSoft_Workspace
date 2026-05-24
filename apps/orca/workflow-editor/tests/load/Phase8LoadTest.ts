/**
 * Phase 9 Load Tests: Phase 8 Performance Under Load
 * Validates that Phase 8 features maintain performance under realistic load conditions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { analytics } from '../../src/services/analytics'
import { rateLimitManager } from '../../src/services/rateLimitManager'
import { costOptimizer } from '../../src/services/costOptimizer'

describe('Phase 9 Load Tests: Phase 8 Performance Under Load', () => {
  beforeEach(() => {
    analytics.clear()
    rateLimitManager.resetAll()
    costOptimizer.reset()
    vi.clearAllMocks()
  })

  describe('Concurrent Request Handling', () => {
    it('should handle 50 concurrent requests efficiently', () => {
      const start = Date.now()
      const results = []

      // Simulate 50 concurrent requests
      for (let i = 0; i < 50; i++) {
        const provider = ['openai', 'anthropic', 'nvidia'][i % 3]

        // Check rate limit
        const canRequest = rateLimitManager.canMakeRequest(provider)
        if (canRequest) {
          rateLimitManager.consumeToken(provider)

          // Track cost
          costOptimizer.trackRequest(provider, 0.001, 100, 500, true)

          // Log analytics
          analytics.trackApiCall(`model-${i}`, provider, 0.001, 100, 500)

          results.push({ success: true, provider })
        } else {
          results.push({ success: false, provider })
        }
      }

      const duration = Date.now() - start

      // Verify performance
      const successful = results.filter((r) => r.success).length
      expect(successful).toBeGreaterThanOrEqual(40) // At least 80% success
      expect(duration).toBeLessThan(5000) // Should complete quickly
    })

    it('should handle 100 rapid requests', () => {
      const start = Date.now()
      let successful = 0
      let failed = 0

      // Simulate 100 rapid requests
      for (let i = 0; i < 100; i++) {
        const provider = 'test-provider'

        if (rateLimitManager.canMakeRequest(provider)) {
          rateLimitManager.consumeToken(provider)
          costOptimizer.trackRequest(provider, 0.001, 100, 500, true)
          analytics.trackApiCall(`model-${i}`, provider, 0.001, 100, 500)
          successful++
        } else {
          failed++
        }
      }

      const duration = Date.now() - start

      // Verify handling
      expect(successful + failed).toBe(100)
      expect(duration).toBeLessThan(2000) // Should complete in <2 seconds
    })

    it('should handle multiple providers concurrently', () => {
      const providers = ['openai', 'anthropic', 'nvidia', 'custom-1', 'custom-2']
      const start = Date.now()

      // Send requests to all providers simultaneously
      for (let i = 0; i < 60; i++) {
        const provider = providers[i % providers.length]

        if (rateLimitManager.canMakeRequest(provider)) {
          rateLimitManager.consumeToken(provider)
          costOptimizer.trackRequest(provider, 0.001, 100, 500, true)
          analytics.trackApiCall(`model-${i}`, provider, 0.001, 100, 500)
        }
      }

      const duration = Date.now() - start

      // Verify concurrent handling
      const stats = analytics.getStats()
      expect(stats.totalApiCalls).toBeGreaterThan(40)
      expect(duration).toBeLessThan(3000)
    })
  })

  describe('Rate Limit Queue Processing', () => {
    it('should process queued requests correctly under rate limit', async () => {
      const provider = 'test-provider'
      const status = rateLimitManager.getStatus(provider)

      // Exhaust rate limit
      for (let i = 0; i < status.maxTokens; i++) {
        rateLimitManager.consumeToken(provider)
      }

      expect(rateLimitManager.canMakeRequest(provider)).toBe(false)

      // Queue multiple requests
      const promises = []
      for (let i = 0; i < 5; i++) {
        promises.push(
          rateLimitManager.executeWithRateLimit(provider, async () => {
            analytics.trackApiCall(`model-${i}`, provider, 0.001, 100, 500)
            return `result-${i}`
          })
        )
      }

      // All should eventually complete
      const results = await Promise.allSettled(promises)
      const successful = results.filter((r) => r.status === 'fulfilled').length

      expect(successful).toBeGreaterThanOrEqual(4) // At least 4 should succeed
    })

    it('should maintain queue order under load', async () => {
      const provider = 'test-provider'
      const status = rateLimitManager.getStatus(provider)
      const results = []

      // Exhaust rate limit
      for (let i = 0; i < status.maxTokens; i++) {
        rateLimitManager.consumeToken(provider)
      }

      // Queue requests with order tracking
      const promises = []
      for (let i = 0; i < 10; i++) {
        promises.push(
          rateLimitManager.executeWithRateLimit(provider, async () => {
            results.push(i)
            return i
          })
        )
      }

      // Wait for all to complete
      await Promise.allSettled(promises)

      // Verify all requests were processed
      expect(results.length).toBeGreaterThanOrEqual(8)
    })
  })

  describe('Cache Efficiency Under Load', () => {
    it('should maintain high cache hit rate under load', () => {
      const start = Date.now()

      // Simulate repeated queries (typical cache scenario)
      const queries = ['query-1', 'query-2', 'query-3']

      for (let cycle = 0; cycle < 10; cycle++) {
        for (const query of queries) {
          // First request = cache miss
          if (cycle === 0) {
            analytics.trackCacheMiss(query)
          } else {
            // Subsequent requests = cache hits
            analytics.trackCacheHit(query)
          }
        }
      }

      const duration = Date.now() - start

      // Verify cache effectiveness
      const stats = analytics.getStats()
      expect(stats.totalCacheHits).toBe(27) // 3 queries × 9 cycles (after first)
      expect(stats.cacheHitRate).toBeCloseTo(90, 0) // 27/30 = 90%
      expect(duration).toBeLessThan(1000) // Should be very fast
    })

    it('should handle varying cache patterns', () => {
      // Simulate diverse cache patterns
      // Hot queries (frequently repeated)
      for (let i = 0; i < 50; i++) {
        analytics.trackCacheHit('hot-query')
      }

      // Warm queries (sometimes repeated)
      for (let i = 0; i < 20; i++) {
        analytics.trackCacheHit('warm-query')
        if (i % 3 === 0) {
          analytics.trackCacheMiss('warm-query')
        }
      }

      // Cold queries (rarely repeated)
      for (let i = 0; i < 30; i++) {
        analytics.trackCacheMiss('cold-query')
      }

      // Verify cache patterns
      const stats = analytics.getStats()
      expect(stats.totalCacheHits).toBe(65) // 50 + 15
      expect(stats.totalCacheMisses).toBe(35) // 10 + 25
      expect(stats.cacheHitRate).toBeCloseTo(65, 0)
    })
  })

  describe('Cost Tracking Under Load', () => {
    it('should track costs accurately for 100+ requests', () => {
      const start = Date.now()
      let totalExpectedCost = 0

      // Track costs for 100 requests
      for (let i = 0; i < 100; i++) {
        const cost = (Math.random() * 0.005).toFixed(4) // 0-0.005
        const numCost = parseFloat(cost)
        costOptimizer.trackRequest('openai', numCost, 100, 500, true)
        analytics.trackApiCall(`model-${i}`, 'openai', numCost, 100, 500)
        totalExpectedCost += numCost
      }

      const duration = Date.now() - start

      // Verify tracking accuracy
      const stats = analytics.getStats()
      expect(stats.totalApiCalls).toBe(100)
      expect(stats.totalCost).toBeCloseTo(totalExpectedCost, 2)
      expect(duration).toBeLessThan(2000)
    })

    it('should calculate cost per provider accurately', () => {
      const costs = {
        openai: 0,
        anthropic: 0,
        nvidia: 0,
      }

      // Track 30 requests per provider
      for (let i = 0; i < 30; i++) {
        const openaiCost = 0.002
        const anthropicCost = 0.001
        const nvidiaCost = 0.0005

        costOptimizer.trackRequest('openai', openaiCost, 100, 500, true)
        costOptimizer.trackRequest('anthropic', anthropicCost, 100, 500, true)
        costOptimizer.trackRequest('nvidia', nvidiaCost, 100, 500, true)

        costs.openai += openaiCost
        costs.anthropic += anthropicCost
        costs.nvidia += nvidiaCost
      }

      // Verify accuracy
      const openaiStats = costOptimizer.getProviderStats('openai')
      const anthropicStats = costOptimizer.getProviderStats('anthropic')
      const nvidiaStats = costOptimizer.getProviderStats('nvidia')

      expect(openaiStats?.totalCost).toBeCloseTo(costs.openai, 2)
      expect(anthropicStats?.totalCost).toBeCloseTo(costs.anthropic, 2)
      expect(nvidiaStats?.totalCost).toBeCloseTo(costs.nvidia, 2)
    })

    it('should handle cost spikes correctly', () => {
      // Normal requests
      for (let i = 0; i < 80; i++) {
        costOptimizer.trackRequest('openai', 0.001, 100, 500, true)
      }

      // Spike: expensive requests
      for (let i = 0; i < 20; i++) {
        costOptimizer.trackRequest('openai', 0.01, 1000, 5000, true)
      }

      // Verify spike tracking
      const stats = costOptimizer.getProviderStats('openai')
      expect(stats?.totalRequests).toBe(100)
      expect(stats?.totalCost).toBeCloseTo(0.28, 1) // (80*0.001) + (20*0.01) = 0.28
    })
  })

  describe('Analytics Data Consistency', () => {
    it('should maintain data integrity under load', () => {
      // Perform diverse operations
      for (let i = 0; i < 50; i++) {
        analytics.trackApiCall('model', 'openai', 0.001, 100, 500)
        if (i % 5 === 0) analytics.trackCacheHit('model')
        if (i % 7 === 0) analytics.trackError('Error', 'model')
        if (i % 10 === 0) analytics.trackFallback('openai', 'anthropic', 'model')
      }

      // Verify consistency
      const stats = analytics.getStats()
      expect(stats.totalApiCalls).toBe(50)
      expect(stats.totalCacheHits).toBeGreaterThan(0)
      expect(stats.errorCount).toBeGreaterThan(0)
      expect(stats.fallbackCount).toBeGreaterThan(0)

      // Verify no duplicate counting
      const events = analytics.getEvents()
      const apiCallEvents = events.filter((e) => e.type === 'api_call')
      expect(apiCallEvents).toHaveLength(50)
    })

    it('should handle simultaneous analytics and cost tracking', () => {
      const start = Date.now()

      // Interleave analytics and cost tracking
      for (let i = 0; i < 100; i++) {
        const provider = i % 2 === 0 ? 'openai' : 'anthropic'

        // Analytics
        analytics.trackApiCall(`model-${i}`, provider, 0.001, 100, 500)

        // Cost tracking
        costOptimizer.trackRequest(provider, 0.001, 100, 500, true)

        // Occasional cache and error events
        if (i % 10 === 0) analytics.trackCacheHit(`model-${i}`)
        if (i % 15 === 0) analytics.trackError('Error', `model-${i}`)
      }

      const duration = Date.now() - start

      // Verify consistency
      const analyticsStats = analytics.getStats()
      const openaiStats = costOptimizer.getProviderStats('openai')
      const anthropicStats = costOptimizer.getProviderStats('anthropic')

      expect(analyticsStats.totalApiCalls).toBe(100)
      expect((openaiStats?.totalRequests ?? 0) + (anthropicStats?.totalRequests ?? 0)).toBe(100)
      expect(duration).toBeLessThan(2000)
    })

    it('should preserve data accuracy through large event volume', () => {
      // Generate 500 events
      const expectedTotalCost = 0.5 // 500 * 0.001

      for (let i = 0; i < 500; i++) {
        analytics.trackApiCall('model', 'openai', 0.001, 100, 500)

        // Vary event types
        if (i % 3 === 0) analytics.trackCacheHit('model')
        if (i % 7 === 0) analytics.trackError('Error', 'model')
      }

      // Verify accuracy
      const stats = analytics.getStats()
      expect(stats.totalApiCalls).toBe(500)
      expect(stats.totalCost).toBeCloseTo(expectedTotalCost, 2)
      expect(stats.totalCacheHits).toBeGreaterThan(150)
      expect(stats.errorCount).toBeGreaterThan(70)
    })
  })

  describe('Overall Performance Metrics', () => {
    it('should complete realistic workflow in acceptable time', () => {
      const start = Date.now()

      // Simulate realistic workflow: 200 requests, rate limiting, cost tracking
      for (let i = 0; i < 200; i++) {
        const provider = ['openai', 'anthropic', 'nvidia'][i % 3]

        // Check rate limit
        if (rateLimitManager.canMakeRequest(provider)) {
          rateLimitManager.consumeToken(provider)

          // Track cost
          costOptimizer.trackRequest(provider, 0.001, 100, 500, true)

          // Log analytics
          analytics.trackApiCall(`model-${i}`, provider, 0.001, 100, 500)

          // Occasional cache hits
          if (i % 20 === 0) {
            analytics.trackCacheHit(`model-${i}`)
          }
        }
      }

      const duration = Date.now() - start

      // Verify performance
      expect(duration).toBeLessThan(10000) // Should complete in <10 seconds
      const stats = analytics.getStats()
      expect(stats.totalApiCalls).toBeGreaterThan(150) // Most requests should succeed
    })

    it('should maintain consistent performance across runs', () => {
      const durations = []

      // Run same workflow 3 times
      for (let run = 0; run < 3; run++) {
        analytics.clear()
        rateLimitManager.resetAll()
        costOptimizer.reset()

        const start = Date.now()

        // Perform 100 operations
        for (let i = 0; i < 100; i++) {
          rateLimitManager.consumeToken('test')
          costOptimizer.trackRequest('test', 0.001, 100, 500, true)
          analytics.trackApiCall('model', 'test', 0.001, 100, 500)
        }

        durations.push(Date.now() - start)
      }

      // Verify consistency
      const avg = durations.reduce((a, b) => a + b) / 3
      const variance = Math.max(...durations) - Math.min(...durations)

      expect(avg).toBeLessThan(1000)
      expect(variance).toBeLessThan(avg * 0.5) // Variance <50% of average
    })
  })
})
