import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AnalyticsService, analytics } from '../../src/services/analytics'

describe('Phase 8 Step 3: Analytics & Monitoring', () => {
  let analyticsService: AnalyticsService

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    analyticsService = new AnalyticsService('test-user')
  })

  describe('Event Tracking', () => {
    it('should track API call events', () => {
      analyticsService.trackApiCall('gpt4-model', 'openai', 0.001, 100, 500)

      const apiCalls = analyticsService.getEvents('api_call')
      expect(apiCalls).toHaveLength(1) // only api_call when filtered by type
    })

    it('should track cache hits', () => {
      analyticsService.trackCacheHit('gpt4-model')

      const hits = analyticsService.getEvents('cache_hit')
      expect(hits).toHaveLength(1)
      expect(hits[0].modelId).toBe('gpt4-model')
    })

    it('should track cache misses', () => {
      analyticsService.trackCacheMiss('gpt4-model')

      const misses = analyticsService.getEvents('cache_miss')
      expect(misses).toHaveLength(1)
      expect(misses[0].modelId).toBe('gpt4-model')
    })

    it('should track errors', () => {
      analyticsService.trackError('TimeoutError', 'gpt4-model')

      const errors = analyticsService.getEvents('error')
      expect(errors).toHaveLength(1)
      expect(errors[0].errorType).toBe('TimeoutError')
    })

    it('should track fallbacks', () => {
      analyticsService.trackFallback('nvidia', 'openai', 'test-model')

      const fallbacks = analyticsService.getEvents('fallback')
      expect(fallbacks).toHaveLength(1)
      expect(fallbacks[0].provider).toBe('nvidia->openai')
    })
  })

  describe('Analytics Statistics', () => {
    it('should calculate total cost', () => {
      analyticsService.trackApiCall('model1', 'openai', 0.001, 100, 500)
      analyticsService.trackApiCall('model2', 'openai', 0.002, 200, 600)

      const stats = analyticsService.getStats()
      expect(stats.totalCost).toBeCloseTo(0.003, 5)
    })

    it('should track total tokens used', () => {
      analyticsService.trackApiCall('model1', 'openai', 0.001, 100, 500)
      analyticsService.trackApiCall('model2', 'openai', 0.002, 200, 600)

      const stats = analyticsService.getStats()
      expect(stats.totalTokensUsed).toBe(300)
    })

    it('should calculate average response time', () => {
      analyticsService.trackApiCall('model1', 'openai', 0.001, 100, 1000)
      analyticsService.trackApiCall('model2', 'openai', 0.001, 100, 2000)

      const stats = analyticsService.getStats()
      expect(stats.averageResponseTime).toBeCloseTo(1500, 1)
    })

    it('should calculate cache hit rate', () => {
      analyticsService.trackCacheHit('model1')
      analyticsService.trackCacheHit('model1')
      analyticsService.trackCacheMiss('model1')

      const stats = analyticsService.getStats()
      expect(stats.cacheHitRate).toBeCloseTo(66.67, 1)
    })

    it('should count errors', () => {
      analyticsService.trackError('TimeoutError', 'model1')
      analyticsService.trackError('AuthError', 'model2')

      const stats = analyticsService.getStats()
      expect(stats.errorCount).toBe(2)
    })

    it('should count fallbacks', () => {
      analyticsService.trackFallback('nvidia', 'openai', 'model1')
      analyticsService.trackFallback('openai', 'anthropic', 'model1')

      const stats = analyticsService.getStats()
      expect(stats.fallbackCount).toBe(2)
    })
  })

  describe('Session Management', () => {
    it('should generate unique session ID', () => {
      const service1 = new AnalyticsService()
      const service2 = new AnalyticsService()

      expect(service1.getStats().sessionId).not.toBe(service2.getStats().sessionId)
    })

    it('should track user ID', () => {
      const service = new AnalyticsService('user123')
      const stats = service.getStats()

      expect(stats.userId).toBe('user123')
    })

    it('should default to anonymous user', () => {
      const service = new AnalyticsService()
      const stats = service.getStats()

      expect(stats.userId).toBe('anonymous')
    })

    it('should log session start event', () => {
      localStorage.clear()
      const service = new AnalyticsService('test-user')
      const events = service.getEvents('session_start')

      expect(events).toHaveLength(1)
      expect(events[0].userId).toBe('test-user')
    })
  })

  describe('Event Filtering', () => {
    it('should get all events without filter', () => {
      analyticsService.trackApiCall('model1', 'openai', 0.001, 100, 500)
      analyticsService.trackCacheHit('model1')
      analyticsService.trackError('TimeoutError', 'model1')

      const allEvents = analyticsService.getEvents()
      expect(allEvents.length).toBeGreaterThan(0)
    })

    it('should filter events by type', () => {
      analyticsService.trackApiCall('model1', 'openai', 0.001, 100, 500)
      analyticsService.trackApiCall('model1', 'openai', 0.001, 100, 500)
      analyticsService.trackCacheHit('model1')

      const apiCalls = analyticsService.getEvents('api_call')
      expect(apiCalls.length).toBe(2)
    })

    it('should filter events by time range', () => {
      const before = Date.now()
      analyticsService.trackApiCall('model1', 'openai', 0.001, 100, 500)
      const after = Date.now()

      const events = analyticsService.getEventsByTimeRange(before, after)
      expect(events.length).toBeGreaterThan(0)
    })
  })

  describe('Cost Tracking', () => {
    it('should calculate cost per provider', () => {
      const service = new AnalyticsService('test')
      service.trackApiCall('model1', 'openai', 0.001, 100, 500)
      service.trackApiCall('model2', 'openai', 0.002, 100, 500)
      service.trackApiCall('model3', 'anthropic', 0.003, 100, 500)

      const costByProvider = service.getCostPerProvider()
      expect(costByProvider['openai']).toBeCloseTo(0.003, 5)
      expect(costByProvider['anthropic']).toBeCloseTo(0.003, 5)
    })

    it('should track model usage with cost', () => {
      analyticsService.trackApiCall('gpt4', 'openai', 0.001, 100, 500)
      analyticsService.trackApiCall('gpt4', 'openai', 0.002, 200, 600)

      const modelStats = analyticsService.getModelUsageStats()
      expect(modelStats['gpt4'].calls).toBe(2)
      expect(modelStats['gpt4'].cost).toBeCloseTo(0.003, 5)
      expect(modelStats['gpt4'].tokens).toBe(300)
    })

    it('should handle multiple models', () => {
      const service = new AnalyticsService('test')
      service.trackApiCall('gpt4', 'openai', 0.001, 100, 500)
      service.trackApiCall('claude3', 'anthropic', 0.002, 200, 600)

      const modelStats = service.getModelUsageStats()
      expect(Object.keys(modelStats)).toHaveLength(2)
      expect(modelStats['gpt4']).toBeDefined()
      expect(modelStats['claude3']).toBeDefined()
    })
  })

  describe('Data Persistence', () => {
    it('should persist events to localStorage', () => {
      const service = new AnalyticsService('test-user')
      service.trackApiCall('model1', 'openai', 0.001, 100, 500)

      const stored = localStorage.getItem(`analytics_${service.getStats().sessionId}`)
      expect(stored).toBeDefined()
      const data = JSON.parse(stored!)
      expect(data.events).toBeDefined()
    })

    it('should enforce max stored events', () => {
      const service = new AnalyticsService()

      // Add more events than max
      for (let i = 0; i < 1100; i++) {
        service.trackApiCall(`model${i}`, 'openai', 0.001, 100, 500)
      }

      const stats = service.getStats()
      // Should not exceed max (includes session start event)
      const allEvents = service.getEvents()
      expect(allEvents.length).toBeLessThanOrEqual(1001)
    })

    it('should handle localStorage errors gracefully', () => {
      const service = new AnalyticsService()

      // Mock localStorage to throw error
      const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      // Should not throw, just log warning
      expect(() => {
        service.trackApiCall('model1', 'openai', 0.001, 100, 500)
      }).not.toThrow()

      spy.mockRestore()
    })
  })

  describe('Data Export', () => {
    it('should export complete analytics data', () => {
      analyticsService.trackApiCall('model1', 'openai', 0.001, 100, 500)
      analyticsService.trackCacheHit('model1')

      const exported = analyticsService.export()

      expect(exported.stats).toBeDefined()
      expect(exported.events).toBeDefined()
      expect(exported.costPerProvider).toBeDefined()
      expect(exported.modelUsage).toBeDefined()
    })

    it('should include correct data in export', () => {
      analyticsService.trackApiCall('model1', 'openai', 0.001, 100, 500)

      const exported = analyticsService.export()
      expect(exported.stats.totalApiCalls).toBeGreaterThan(0)
      expect(exported.stats.totalCost).toBeGreaterThan(0)
      expect(exported.events.length).toBeGreaterThan(0)
    })
  })

  describe('Clear Operations', () => {
    it('should clear all events', () => {
      analyticsService.trackApiCall('model1', 'openai', 0.001, 100, 500)
      analyticsService.trackCacheHit('model1')

      analyticsService.clear()

      const stats = analyticsService.getStats()
      expect(stats.totalApiCalls).toBe(0)
      expect(stats.totalCacheHits).toBe(0)
    })

    it('should reflect cleared state in stats', () => {
      analyticsService.trackApiCall('model1', 'openai', 0.001, 100, 500)
      analyticsService.clear()

      const stats = analyticsService.getStats()
      expect(stats.totalCost).toBe(0)
      expect(stats.totalTokensUsed).toBe(0)
    })
  })

  describe('Singleton Instance', () => {
    it('should provide singleton analytics instance', () => {
      expect(analytics).toBeDefined()
      expect(analytics).toBeInstanceOf(AnalyticsService)
    })

    it('should share state across imports', () => {
      analytics.trackApiCall('test-model', 'openai', 0.001, 100, 500)
      const stats = analytics.getStats()
      expect(stats.totalApiCalls).toBeGreaterThan(0)
    })
  })

  describe('Integration Scenarios', () => {
    it('should track complete user workflow', () => {
      // Simulate user workflow: cache hit, cache miss, API call, error
      const service = new AnalyticsService('test')
      service.trackCacheHit('model1')
      service.trackCacheMiss('model1')
      service.trackApiCall('model1', 'openai', 0.001, 100, 500)
      service.trackError('TimeoutError', 'model1')

      const stats = service.getStats()
      expect(stats.totalCacheHits).toBe(1)
      expect(stats.totalCacheMisses).toBe(1)
      expect(stats.totalApiCalls).toBe(1)
      expect(stats.errorCount).toBe(1)
    })

    it('should track multi-provider scenario', () => {
      // User tries primary, falls back to secondary
      const service = new AnalyticsService('test')
      service.trackFallback('nvidia', 'openai', 'model1')
      service.trackApiCall('model1', 'openai', 0.002, 150, 600)

      const stats = service.getStats()
      expect(stats.fallbackCount).toBe(1)
      expect(stats.totalApiCalls).toBe(1)

      const costByProvider = service.getCostPerProvider()
      expect(costByProvider['openai']).toBe(0.002)
    })

    it('should handle high-volume event tracking', () => {
      // Simulate 100 API calls
      const service = new AnalyticsService('test')
      for (let i = 0; i < 100; i++) {
        service.trackApiCall(`model${i % 5}`, 'openai', 0.001, 100, 500)
      }

      const stats = service.getStats()
      expect(stats.totalApiCalls).toBe(100)
      expect(stats.totalCost).toBeCloseTo(0.1, 5)
    })
  })

  describe('Console Logging', () => {
    it('should log events to console', () => {
      const consoleSpy = vi.spyOn(console, 'log')

      const service = new AnalyticsService()
      service.trackApiCall('model1', 'openai', 0.001, 100, 500)

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should include statistics in log message', () => {
      const consoleSpy = vi.spyOn(console, 'log')

      analyticsService.trackApiCall('model1', 'openai', 0.001, 100, 500)

      const lastCall = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]
      expect(lastCall).toContain('Analytics')
      expect(lastCall).toContain('Cost:')
      expect(lastCall).toContain('Cache Hit Rate')

      consoleSpy.mockRestore()
    })
  })
})
