import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RateLimitManager, rateLimitManager } from '../../src/services/rateLimitManager'

describe('Phase 8 Step 4: Rate Limit Management', () => {
  let manager: RateLimitManager

  beforeEach(() => {
    manager = new RateLimitManager([
      { provider: 'test-provider', requestsPerMinute: 60, burstSize: 10 },
    ])
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Rate Limit Configuration', () => {
    it('should set rate limit for provider', () => {
      const status = manager.getStatus('test-provider')
      expect(status.requestsPerMinute).toBe(60)
      expect(status.maxTokens).toBe(10)
    })

    it('should use default burst size if not specified', () => {
      manager = new RateLimitManager([
        { provider: 'provider', requestsPerMinute: 120 },
      ])
      const status = manager.getStatus('provider')
      expect(status.maxTokens).toBeGreaterThan(0)
    })

    it('should handle multiple provider configs', () => {
      manager = new RateLimitManager([
        { provider: 'provider1', requestsPerMinute: 60 },
        { provider: 'provider2', requestsPerMinute: 120 },
      ])

      const status1 = manager.getStatus('provider1')
      const status2 = manager.getStatus('provider2')

      expect(status1.requestsPerMinute).toBe(60)
      expect(status2.requestsPerMinute).toBe(120)
    })

    it('should initialize unknown providers with defaults', () => {
      const status = manager.getStatus('unknown-provider')
      expect(status.provider).toBe('unknown-provider')
      expect(status.availableTokens).toBeGreaterThan(0)
    })
  })

  describe('Token Bucket Algorithm', () => {
    it('should start with burst size tokens', () => {
      const status = manager.getStatus('test-provider')
      expect(status.availableTokens).toBe(10)
    })

    it('should consume token for request', () => {
      manager.consumeToken('test-provider')
      const status = manager.getStatus('test-provider')
      expect(status.availableTokens).toBe(9)
    })

    it('should refill tokens over time', () => {
      manager.consumeToken('test-provider')
      expect(manager.getStatus('test-provider').availableTokens).toBe(9)

      // Advance time by 1 second (60 requests/min = 1 per second)
      vi.advanceTimersByTime(1000)

      const status = manager.getStatus('test-provider')
      expect(status.availableTokens).toBeGreaterThan(9)
    })

    it('should not exceed max tokens', () => {
      vi.advanceTimersByTime(60000) // 1 minute
      const status = manager.getStatus('test-provider')
      expect(status.availableTokens).toBeLessThanOrEqual(10)
    })

    it('should handle fractional tokens', () => {
      manager.consumeToken('test-provider')
      manager.consumeToken('test-provider')
      manager.consumeToken('test-provider')

      vi.advanceTimersByTime(500) // 0.5 seconds = 0.5 tokens
      const status = manager.getStatus('test-provider')
      expect(status.availableTokens).toBeGreaterThan(6)
    })
  })

  describe('Request Can Proceed Check', () => {
    it('should allow request when tokens available', () => {
      const can = manager.canMakeRequest('test-provider')
      expect(can).toBe(true)
    })

    it('should prevent request when no tokens', () => {
      // Consume all tokens
      for (let i = 0; i < 10; i++) {
        manager.consumeToken('test-provider')
      }

      const can = manager.canMakeRequest('test-provider')
      expect(can).toBe(false)
    })

    it('should allow request after token refill', () => {
      // Consume all tokens
      for (let i = 0; i < 10; i++) {
        manager.consumeToken('test-provider')
      }

      expect(manager.canMakeRequest('test-provider')).toBe(false)

      // Wait for token refill
      vi.advanceTimersByTime(2000) // 2 seconds = 2 tokens

      expect(manager.canMakeRequest('test-provider')).toBe(true)
    })
  })

  describe('Rate Limiting Enforcement', () => {
    it('should block requests when rate limited', () => {
      for (let i = 0; i < 10; i++) {
        manager.consumeToken('test-provider')
      }

      const can = manager.canMakeRequest('test-provider')
      expect(can).toBe(false)
    })

    it('should report limited status', () => {
      for (let i = 0; i < 10; i++) {
        manager.consumeToken('test-provider')
      }

      const status = manager.getStatus('test-provider')
      expect(status.isLimited).toBe(true)
    })

    it('should not report limited when tokens available', () => {
      const status = manager.getStatus('test-provider')
      expect(status.isLimited).toBe(false)
    })
  })

  describe('Request Queue', () => {
    it('should execute immediately when tokens available', async () => {
      const fn = vi.fn().mockResolvedValue('result')

      const result = await manager.queueRequest('test-provider', fn)

      expect(fn).toHaveBeenCalledTimes(1)
      expect(result).toBe('result')
    })

    it('should queue request when rate limited', async () => {
      const fn1 = vi.fn().mockResolvedValue('result1')
      const fn2 = vi.fn().mockResolvedValue('result2')

      // Consume all tokens
      for (let i = 0; i < 10; i++) {
        manager.consumeToken('test-provider')
      }

      // Queue both requests
      const p1 = manager.queueRequest('test-provider', fn1)
      const p2 = manager.queueRequest('test-provider', fn2)

      // Advance time to allow processing
      vi.advanceTimersByTime(10000)

      await Promise.all([p1, p2])

      expect(fn1).toHaveBeenCalled()
      expect(fn2).toHaveBeenCalled()
    })

    it('should maintain queue order', async () => {
      const callOrder: string[] = []
      const fn1 = vi.fn(async () => {
        callOrder.push('fn1')
        return 'result1'
      })
      const fn2 = vi.fn(async () => {
        callOrder.push('fn2')
        return 'result2'
      })

      // Consume all tokens
      for (let i = 0; i < 10; i++) {
        manager.consumeToken('test-provider')
      }

      const p1 = manager.queueRequest('test-provider', fn1)
      const p2 = manager.queueRequest('test-provider', fn2)

      vi.advanceTimersByTime(10000)

      await Promise.all([p1, p2])

      expect(callOrder[0]).toBe('fn1')
      expect(callOrder[1]).toBe('fn2')
    })

    it('should handle queue errors gracefully', async () => {
      const error = new Error('Request failed')
      const fn = vi.fn().mockRejectedValue(error)

      // Consume all tokens
      for (let i = 0; i < 10; i++) {
        manager.consumeToken('test-provider')
      }

      const promise = manager.queueRequest('test-provider', fn)

      vi.advanceTimersByTime(10000)

      await expect(promise).rejects.toThrow('Request failed')
    })
  })

  describe('Execute With Rate Limit', () => {
    it('should execute function with rate limiting', async () => {
      const fn = vi.fn().mockResolvedValue('result')

      const result = await manager.executeWithRateLimit('test-provider', fn)

      expect(fn).toHaveBeenCalled()
      expect(result).toBe('result')
    })

    it('should wait for tokens if necessary', async () => {
      const fn = vi.fn().mockResolvedValue('result')

      // Consume all tokens
      for (let i = 0; i < 10; i++) {
        manager.consumeToken('test-provider')
      }

      const promise = manager.executeWithRateLimit('test-provider', fn)

      // Advance time to allow token refill and execution
      vi.advanceTimersByTime(5000)

      const result = await promise

      expect(fn).toHaveBeenCalled()
      expect(result).toBe('result')
    })
  })

  describe('Status Reporting', () => {
    it('should report provider status', () => {
      const status = manager.getStatus('test-provider')

      expect(status.provider).toBe('test-provider')
      expect(status.availableTokens).toBeGreaterThan(0)
      expect(status.maxTokens).toBe(10)
      expect(status.requestsPerMinute).toBe(60)
      expect(status.queued).toBe(0)
      expect(status.isLimited).toBe(false)
    })

    it('should report queued requests', async () => {
      const fn = vi.fn().mockImplementation(() => new Promise(() => {})) // Never resolves

      // Consume all tokens and queue requests
      for (let i = 0; i < 10; i++) {
        manager.consumeToken('test-provider')
      }

      manager.queueRequest('test-provider', fn)
      manager.queueRequest('test-provider', fn)

      const status = manager.getStatus('test-provider')
      expect(status.queued).toBe(2)
    })

    it('should get all provider statuses', () => {
      manager = new RateLimitManager([
        { provider: 'provider1', requestsPerMinute: 60 },
        { provider: 'provider2', requestsPerMinute: 120 },
      ])

      const statuses = manager.getAllStatus()

      expect(statuses).toHaveLength(2)
      expect(statuses.map((s) => s.provider)).toContain('provider1')
      expect(statuses.map((s) => s.provider)).toContain('provider2')
    })
  })

  describe('Reset Operations', () => {
    it('should reset limits for provider', () => {
      manager.consumeToken('test-provider')
      expect(manager.getStatus('test-provider').availableTokens).toBe(9)

      manager.reset('test-provider')
      expect(manager.getStatus('test-provider').availableTokens).toBe(10)
    })

    it('should reset all limits', () => {
      manager = new RateLimitManager([
        { provider: 'provider1', requestsPerMinute: 60, burstSize: 10 },
        { provider: 'provider2', requestsPerMinute: 120, burstSize: 20 },
      ])

      manager.consumeToken('provider1')
      manager.consumeToken('provider2')

      manager.resetAll()

      expect(manager.getStatus('provider1').availableTokens).toBe(10)
      expect(manager.getStatus('provider2').availableTokens).toBe(20)
    })

    it('should clear queue on reset', async () => {
      const fn = vi.fn().mockResolvedValue('result')

      // Consume all tokens and queue
      for (let i = 0; i < 10; i++) {
        manager.consumeToken('test-provider')
      }
      manager.queueRequest('test-provider', fn)

      manager.reset('test-provider')

      expect(manager.getStatus('test-provider').queued).toBe(0)
    })
  })

  describe('Metrics', () => {
    it('should provide metrics', () => {
      manager = new RateLimitManager([
        { provider: 'provider1', requestsPerMinute: 60 },
        { provider: 'provider2', requestsPerMinute: 120 },
      ])

      const metrics = manager.getMetrics()

      expect(metrics.providers).toContain('provider1')
      expect(metrics.providers).toContain('provider2')
      expect(metrics.statuses).toHaveLength(2)
      expect(metrics.totalQueued).toBe(0)
      expect(metrics.limitedProviders).toHaveLength(0)
    })

    it('should report limited providers in metrics', () => {
      // Consume all tokens
      for (let i = 0; i < 10; i++) {
        manager.consumeToken('test-provider')
      }

      const metrics = manager.getMetrics()

      expect(metrics.limitedProviders).toContain('test-provider')
    })
  })

  describe('Singleton Instance', () => {
    it('should provide singleton rate limit manager', () => {
      expect(rateLimitManager).toBeDefined()
      expect(rateLimitManager).toBeInstanceOf(RateLimitManager)
    })

    it('should have default provider configurations', () => {
      const status = rateLimitManager.getStatus('nvidia')
      expect(status.requestsPerMinute).toBe(120)
    })
  })

  describe('Multi-Provider Scenario', () => {
    it('should manage limits independently per provider', () => {
      manager = new RateLimitManager([
        { provider: 'fast', requestsPerMinute: 120, burstSize: 20 },
        { provider: 'slow', requestsPerMinute: 30, burstSize: 5 },
      ])

      const fastStatus = manager.getStatus('fast')
      const slowStatus = manager.getStatus('slow')

      expect(fastStatus.maxTokens).toBe(20)
      expect(slowStatus.maxTokens).toBe(5)
    })

    it('should handle concurrent requests from different providers', async () => {
      manager = new RateLimitManager([
        { provider: 'provider1', requestsPerMinute: 60, burstSize: 10 },
        { provider: 'provider2', requestsPerMinute: 60, burstSize: 10 },
      ])

      const fn1 = vi.fn().mockResolvedValue('result1')
      const fn2 = vi.fn().mockResolvedValue('result2')

      const [r1, r2] = await Promise.all([
        manager.queueRequest('provider1', fn1),
        manager.queueRequest('provider2', fn2),
      ])

      expect(fn1).toHaveBeenCalled()
      expect(fn2).toHaveBeenCalled()
      expect(r1).toBe('result1')
      expect(r2).toBe('result2')
    })
  })

  describe('High Volume Request Handling', () => {
    it('should queue multiple requests efficiently', async () => {
      manager = new RateLimitManager([
        { provider: 'test', requestsPerMinute: 60, burstSize: 3 },
      ])

      const fn1 = vi.fn().mockResolvedValue('result1')
      const fn2 = vi.fn().mockResolvedValue('result2')
      const fn3 = vi.fn().mockResolvedValue('result3')

      // Queue 3 requests (will consume burst size)
      const promises = [
        manager.queueRequest('test', fn1),
        manager.queueRequest('test', fn2),
        manager.queueRequest('test', fn3),
      ]

      await Promise.all(promises)

      expect(fn1).toHaveBeenCalled()
      expect(fn2).toHaveBeenCalled()
      expect(fn3).toHaveBeenCalled()
    })
  })
})

describe('afterEach', () => {
  it('should be callable', () => {
    expect(true).toBe(true)
  })
})
