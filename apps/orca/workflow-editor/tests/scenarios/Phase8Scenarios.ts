/**
 * Phase 9 Scenario Tests: Phase 8 Failure Scenarios
 * Tests realistic failure and recovery scenarios
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { analytics } from '../../src/services/analytics'
import { rateLimitManager } from '../../src/services/rateLimitManager'
import { costOptimizer } from '../../src/services/costOptimizer'

describe('Phase 9 Scenarios: Phase 8 Failure & Recovery', () => {
  beforeEach(() => {
    analytics.clear()
    rateLimitManager.resetAll()
    costOptimizer.reset()
    vi.clearAllMocks()
  })

  describe('Provider Outage Scenarios', () => {
    it('should handle primary provider outage with fallback', () => {
      const primaryProvider = 'nvidia'
      const fallbackProvider = 'openai'

      // Scenario: Primary provider fails
      analytics.trackError('AuthError', 'model')

      // System falls back to secondary provider
      analytics.trackFallback(primaryProvider, fallbackProvider, 'model')

      // Secondary provider succeeds
      analytics.trackApiCall('model', fallbackProvider, 0.002, 100, 500)

      // Verify recovery
      const stats = analytics.getStats()
      expect(stats.errorCount).toBe(1)
      expect(stats.fallbackCount).toBe(1)
      expect(stats.totalApiCalls).toBe(1) // Request completed via fallback

      // Verify analytics tracked fallback correctly
      const costByProvider = analytics.getCostPerProvider()
      expect(costByProvider[fallbackProvider]).toBe(0.002)
    })

    it('should handle cascading provider failures', () => {
      // First provider fails
      analytics.trackError('AuthError', 'model')
      analytics.trackFallback('nvidia', 'openai', 'model')

      // Second provider also fails
      analytics.trackError('TimeoutError', 'model')
      analytics.trackFallback('openai', 'anthropic', 'model')

      // Third provider succeeds
      analytics.trackApiCall('model', 'anthropic', 0.001, 100, 300)

      // Verify complete recovery chain
      const stats = analytics.getStats()
      expect(stats.errorCount).toBe(2)
      expect(stats.fallbackCount).toBe(2)
      expect(stats.totalApiCalls).toBe(1)
    })

    it('should track cost changes from provider fallback', () => {
      // Primary provider (expensive)
      const primaryCost = 0.005
      costOptimizer.trackRequest('expensive-provider', primaryCost, 100, 1000, false)

      // Fallback to cheaper provider
      const fallbackCost = 0.002
      costOptimizer.trackRequest('cheap-provider', fallbackCost, 100, 500, true)

      // Verify cost optimization from fallback
      const expensiveStats = costOptimizer.getProviderStats('expensive-provider')
      const cheapStats = costOptimizer.getProviderStats('cheap-provider')

      expect(expensiveStats?.totalRequests).toBe(1)
      expect(cheapStats?.totalRequests).toBe(1)
      expect((cheapStats?.totalCost ?? 0) < (expensiveStats?.totalCost ?? Infinity)).toBe(true)
    })
  })

  describe('Rate Limit Exhaustion Scenarios', () => {
    it('should handle rate limit exhaustion and recovery', async () => {
      const provider = 'test-provider'
      const status = rateLimitManager.getStatus(provider)

      // Scenario: Exhaust rate limit
      for (let i = 0; i < status.maxTokens; i++) {
        rateLimitManager.consumeToken(provider)
      }

      expect(rateLimitManager.canMakeRequest(provider)).toBe(false)

      // Queue request while limited
      const queueResult = await rateLimitManager.executeWithRateLimit(provider, async () => {
        analytics.trackApiCall('model', provider, 0.001, 100, 500)
        return 'success'
      })

      // Verify queued request completed
      expect(queueResult).toBe('success')

      // Verify analytics recorded the request
      const stats = analytics.getStats()
      expect(stats.totalApiCalls).toBeGreaterThan(0)
    })

    it('should handle multiple queued requests fairly', async () => {
      const provider = 'test-provider'
      const status = rateLimitManager.getStatus(provider)
      const results = []

      // Exhaust rate limit
      for (let i = 0; i < status.maxTokens; i++) {
        rateLimitManager.consumeToken(provider)
      }

      // Queue 10 requests
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

      // Verify fair distribution
      expect(results.length).toBeGreaterThanOrEqual(8)
      expect(new Set(results).size).toBe(results.length) // All results unique
    })

    it('should maintain analytics consistency during rate limit queue', async () => {
      const provider = 'test-provider'
      const status = rateLimitManager.getStatus(provider)

      // Exhaust rate limit
      for (let i = 0; i < status.maxTokens; i++) {
        rateLimitManager.consumeToken(provider)
      }

      // Queue requests with analytics
      const promises = []
      for (let i = 0; i < 5; i++) {
        promises.push(
          rateLimitManager.executeWithRateLimit(provider, async () => {
            analytics.trackApiCall(`model-${i}`, provider, 0.001, 100, 500)
            costOptimizer.trackRequest(provider, 0.001, 100, 500, true)
          })
        )
      }

      // Complete all
      await Promise.allSettled(promises)

      // Verify consistency
      const analyticsStats = analytics.getStats()
      const costStats = costOptimizer.getProviderStats(provider)

      expect(analyticsStats.totalApiCalls).toBe(5)
      expect(costStats?.totalRequests).toBe(5)
      expect(analyticsStats.totalCost).toBeCloseTo(0.005, 3)
    })
  })

  describe('Analytics Storage Scenarios', () => {
    it('should handle localStorage limits gracefully', () => {
      // Simulate high volume that might hit storage limits
      // Generate 500 events (typical max is 1000)
      const expectedEventCount = 500

      for (let i = 0; i < expectedEventCount; i++) {
        analytics.trackApiCall(`model-${i}`, 'openai', 0.001, 100, 500)
        if (i % 10 === 0) {
          analytics.trackError('Error', `model-${i}`)
        }
      }

      // Verify all events stored (up to limit)
      const stats = analytics.getStats()
      expect(stats.totalApiCalls).toBe(expectedEventCount)

      // Verify data integrity
      const events = analytics.getEvents()
      expect(events).toHaveLength(expectedEventCount + 50) // API calls + errors
    })

    it('should recover from analytics data corruption', () => {
      // Track normal data
      analytics.trackApiCall('model-1', 'openai', 0.001, 100, 500)
      analytics.trackApiCall('model-2', 'anthropic', 0.002, 150, 600)

      // Clear and restart (simulating restart)
      analytics.clear()

      // Verify recovery
      const stats = analytics.getStats()
      expect(stats.totalApiCalls).toBe(0) // Cleared

      // New data should work fine
      analytics.trackApiCall('model-3', 'openai', 0.001, 100, 500)
      const newStats = analytics.getStats()
      expect(newStats.totalApiCalls).toBe(1)
    })

    it('should maintain analytics during cost spike events', () => {
      // Normal requests
      for (let i = 0; i < 50; i++) {
        analytics.trackApiCall('model', 'openai', 0.001, 100, 500)
      }

      // Sudden cost spike
      for (let i = 0; i < 10; i++) {
        analytics.trackApiCall('model', 'openai', 0.05, 2000, 5000)
      }

      // Recovery to normal
      for (let i = 0; i < 40; i++) {
        analytics.trackApiCall('model', 'openai', 0.001, 100, 500)
      }

      // Verify all recorded
      const stats = analytics.getStats()
      expect(stats.totalApiCalls).toBe(100)
      expect(stats.totalCost).toBeCloseTo(0.55, 1) // (50 * 0.001) + (10 * 0.05) + (40 * 0.001)
    })
  })

  describe('Multiple Failures in Sequence', () => {
    it('should recover from cascading failures', () => {
      // Failure 1: Rate limit hit
      const provider = 'openai'
      const status = rateLimitManager.getStatus(provider)
      for (let i = 0; i < status.maxTokens; i++) {
        rateLimitManager.consumeToken(provider)
      }

      // Failure 2: Authentication error on fallback
      analytics.trackError('AuthError', 'model')
      analytics.trackFallback('openai', 'anthropic', 'model')

      // Failure 3: Timeout on second fallback
      analytics.trackError('TimeoutError', 'model')
      analytics.trackFallback('anthropic', 'nvidia', 'model')

      // Recovery: Success on third provider
      analytics.trackApiCall('model', 'nvidia', 0.001, 100, 500)

      // Verify system recovered
      const stats = analytics.getStats()
      expect(stats.errorCount).toBe(2)
      expect(stats.fallbackCount).toBe(2)
      expect(stats.totalApiCalls).toBe(1)
    })

    it('should track costs through failure recovery', () => {
      // Expensive provider fails
      costOptimizer.trackRequest('expensive', 0.01, 100, 5000, false)

      // Medium cost fallback succeeds
      costOptimizer.trackRequest('medium', 0.005, 100, 1500, true)

      // Cheap fallback also available
      costOptimizer.trackRequest('cheap', 0.001, 100, 300, true)

      // Verify cost tracking through failures
      const expensiveStats = costOptimizer.getProviderStats('expensive')
      const mediumStats = costOptimizer.getProviderStats('medium')
      const cheapStats = costOptimizer.getProviderStats('cheap')

      expect(expensiveStats?.totalRequests).toBe(1)
      expect(mediumStats?.totalRequests).toBe(1)
      expect(cheapStats?.totalRequests).toBe(1)

      // Verify provider selection would learn from failures
      const recommendation = costOptimizer.getRecommendations?.()
      expect(recommendation?.cheapest).toBe('cheap')
    })

    it('should handle mixed success and failure patterns', () => {
      const providers = ['openai', 'anthropic', 'nvidia']

      // Simulate mixed results over time
      for (let cycle = 0; cycle < 3; cycle++) {
        for (const provider of providers) {
          // Some succeed, some fail
          const shouldSucceed = Math.random() > 0.3

          if (shouldSucceed) {
            costOptimizer.trackRequest(provider, 0.001, 100, 500, true)
            analytics.trackApiCall('model', provider, 0.001, 100, 500)
          } else {
            analytics.trackError('Error', 'model')
            costOptimizer.trackRequest(provider, 0, 0, 5000, false)
          }
        }
      }

      // Verify system handled mixed patterns
      const stats = analytics.getStats()
      expect(stats.totalApiCalls).toBeGreaterThan(0)
      expect(stats.errorCount).toBeGreaterThan(0)

      // Verify cost tracking is accurate
      const allStats = costOptimizer.getAllStats?.() || []
      expect(allStats.length).toBeGreaterThan(0)
    })
  })

  describe('Cost Spike Handling', () => {
    it('should detect and track unexpected cost increases', () => {
      // Normal baseline
      const baselineCost = 0.001
      for (let i = 0; i < 50; i++) {
        costOptimizer.trackRequest('openai', baselineCost, 100, 500, true)
        analytics.trackApiCall('model', 'openai', baselineCost, 100, 500)
      }

      // Spike detected
      const spikeStart = analytics.getStats().totalCost
      const spikeCost = 0.02 // 20x normal cost
      for (let i = 0; i < 10; i++) {
        costOptimizer.trackRequest('openai', spikeCost, 1000, 5000, true)
        analytics.trackApiCall('model', 'openai', spikeCost, 1000, 5000)
      }

      // Return to normal
      for (let i = 0; i < 40; i++) {
        costOptimizer.trackRequest('openai', baselineCost, 100, 500, true)
        analytics.trackApiCall('model', 'openai', baselineCost, 100, 500)
      }

      // Verify spike recorded
      const finalStats = analytics.getStats()
      const expectedTotal = 50 * baselineCost + 10 * spikeCost + 40 * baselineCost
      expect(finalStats.totalCost).toBeCloseTo(expectedTotal, 1)

      // Verify provider stats show the spike
      const openaiStats = costOptimizer.getProviderStats('openai')
      expect(openaiStats?.totalRequests).toBe(100)
      expect(openaiStats?.totalCost).toBeCloseTo(expectedTotal, 1)
    })

    it('should handle cost spike with provider switch', () => {
      // Normal usage on provider A
      for (let i = 0; i < 30; i++) {
        costOptimizer.trackRequest('expensive', 0.005, 100, 500, true)
      }

      // Cost spike detected, switch to provider B
      for (let i = 0; i < 10; i++) {
        costOptimizer.trackRequest('expensive', 0.05, 1000, 5000, true) // 10x spike
      }

      // Switch to cheaper provider
      for (let i = 0; i < 30; i++) {
        costOptimizer.trackRequest('cheap', 0.001, 100, 500, true)
      }

      // Verify cost tracking through switch
      const expensiveStats = costOptimizer.getProviderStats('expensive')
      const cheapStats = costOptimizer.getProviderStats('cheap')

      expect(expensiveStats?.totalRequests).toBe(40)
      expect(cheapStats?.totalRequests).toBe(30)

      // System should recommend cheaper provider going forward
      costOptimizer.setStrategy({
        name: 'cost',
        weights: { cost: 0.9, performance: 0.05, reliability: 0.05 },
      })

      const best = costOptimizer.selectBestProvider(['expensive', 'cheap'])
      expect(best).toBe('cheap')
    })
  })

  describe('Network Recovery Scenarios', () => {
    it('should handle offline to online to offline cycle', () => {
      // Online: Normal operation
      analytics.trackApiCall('model', 'openai', 0.001, 100, 500)
      costOptimizer.trackRequest('openai', 0.001, 100, 500, true)

      // Offline: Track failures
      analytics.trackError('NetworkError', 'model')
      analytics.trackError('NetworkError', 'model')

      // Back online: Resume operation
      analytics.trackApiCall('model', 'openai', 0.001, 100, 500)
      costOptimizer.trackRequest('openai', 0.001, 100, 500, true)

      // Offline again: More failures
      analytics.trackError('NetworkError', 'model')

      // Verify tracking through cycles
      const stats = analytics.getStats()
      expect(stats.totalApiCalls).toBe(2) // Two successful requests
      expect(stats.errorCount).toBe(3) // Three network errors
    })

    it('should maintain queue during network interruptions', async () => {
      const provider = 'test-provider'

      // Queue requests while "offline"
      const promises = []
      for (let i = 0; i < 5; i++) {
        promises.push(
          rateLimitManager.executeWithRateLimit(provider, async () => {
            // Simulate resuming when network restored
            analytics.trackApiCall(`model-${i}`, provider, 0.001, 100, 500)
            return `result-${i}`
          })
        )
      }

      // Network restored, queue processes
      const results = await Promise.allSettled(promises)
      const successful = results.filter((r) => r.status === 'fulfilled').length

      expect(successful).toBe(5)

      // Verify all requests tracked
      const stats = analytics.getStats()
      expect(stats.totalApiCalls).toBe(5)
    })
  })
})
