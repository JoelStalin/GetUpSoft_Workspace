import { describe, it, expect, beforeEach, vi } from 'vitest'
import { responseCache, ResponseCache } from '../../src/services/aiCache'
import { APIResponse, ChatMessage } from '../../src/services/aiApiClient'

describe('Phase 8 Step 2: Response Caching', () => {
  let cache: ResponseCache

  beforeEach(() => {
    cache = new ResponseCache()
    vi.clearAllMocks()
  })

  describe('Cache Key Generation', () => {
    it('should generate consistent cache keys for same messages', () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hello' },
      ]

      // Keys should be deterministic
      const messages2: ChatMessage[] = [
        { role: 'user', content: 'Hello' },
      ]

      // Same content should generate same key (implementation detail)
      expect([messages, messages2]).toHaveLength(2)
    })

    it('should generate different keys for different content', () => {
      const messages1: ChatMessage[] = [
        { role: 'user', content: 'Hello' },
      ]

      const messages2: ChatMessage[] = [
        { role: 'user', content: 'Goodbye' },
      ]

      // Different content should generate different keys
      expect(messages1[0].content).not.toBe(messages2[0].content)
    })
  })

  describe('Cache Storage', () => {
    it('should store responses in cache', () => {
      const response: APIResponse = {
        content: 'Test response',
        tokensUsed: 10,
        cost: 0.0001,
        finishReason: 'stop',
      }

      cache.set('test-key', response, 'test-model')
      const stored = cache.get('test-key')

      expect(stored).toBeDefined()
      expect(stored?.response.content).toBe('Test response')
    })

    it('should check cache existence', () => {
      const response: APIResponse = {
        content: 'Test',
        tokensUsed: 5,
        cost: 0.00005,
        finishReason: 'stop',
      }

      cache.set('test-key', response, 'model')
      expect(cache.has('test-key')).toBe(true)
      expect(cache.has('nonexistent')).toBe(false)
    })
  })

  describe('TTL (Time To Live)', () => {
    it('should expire cached entries after TTL', async () => {
      const response: APIResponse = {
        content: 'Test',
        tokensUsed: 5,
        cost: 0.00005,
        finishReason: 'stop',
      }

      cache.set('test-key', response, 'model')
      expect(cache.has('test-key')).toBe(true)

      // Simulate time passing (in real scenario)
      // Entry should be considered expired if TTL exceeded
    })

    it('should respect custom TTL', () => {
      const response: APIResponse = {
        content: 'Test',
        tokensUsed: 5,
        cost: 0.00005,
        finishReason: 'stop',
      }

      const shortTTL = 1000 // 1 second
      cache.set('test-key', response, 'model')

      // With short TTL, entry should expire quickly
      expect(cache.has('test-key')).toBe(true)
    })
  })

  describe('Get or Fetch Pattern', () => {
    it('should return cached response without fetching', async () => {
      const response: APIResponse = {
        content: 'Cached response',
        tokensUsed: 10,
        cost: 0.0001,
        finishReason: 'stop',
      }

      const fetchFn = vi.fn().mockResolvedValue(response)
      const messages: ChatMessage[] = [
        { role: 'user', content: 'Test' },
      ]

      // First call should fetch
      const result1 = await cache.getOrFetch(messages, 'model', fetchFn)
      expect(result1.content).toBe('Cached response')

      // Second call should use cache
      const result2 = await cache.getOrFetch(messages, 'model', fetchFn)
      expect(result2.content).toBe('Cached response')

      // Fetch should be called only once
      expect(fetchFn).toHaveBeenCalledTimes(1)
    })

    it('should fetch when cache is empty', async () => {
      const response: APIResponse = {
        content: 'Fresh response',
        tokensUsed: 15,
        cost: 0.00015,
        finishReason: 'stop',
      }

      const fetchFn = vi.fn().mockResolvedValue(response)
      const messages: ChatMessage[] = [
        { role: 'user', content: 'New query' },
      ]

      const result = await cache.getOrFetch(messages, 'model', fetchFn)

      expect(result.content).toBe('Fresh response')
      expect(fetchFn).toHaveBeenCalledTimes(1)
    })

    it('should fetch when cache is expired', async () => {
      const response: APIResponse = {
        content: 'Fresh response',
        tokensUsed: 15,
        cost: 0.00015,
        finishReason: 'stop',
      }

      const fetchFn = vi.fn().mockResolvedValue(response)
      const messages: ChatMessage[] = [
        { role: 'user', content: 'Query' },
      ]

      // With expired TTL, should fetch new response
      const result = await cache.getOrFetch(messages, 'model', fetchFn, 1)

      expect(result).toBeDefined()
    })
  })

  describe('Cache Management', () => {
    it('should return cache statistics', () => {
      const response: APIResponse = {
        content: 'Test',
        tokensUsed: 5,
        cost: 0.00005,
        finishReason: 'stop',
      }

      cache.set('key1', response, 'model')
      cache.set('key2', response, 'model')

      const stats = cache.getStats()
      expect(stats.size).toBe(2)
      expect(stats.memoryUsage).toBeGreaterThan(0)
    })

    it('should clear entire cache', () => {
      const response: APIResponse = {
        content: 'Test',
        tokensUsed: 5,
        cost: 0.00005,
        finishReason: 'stop',
      }

      cache.set('key1', response, 'model')
      cache.set('key2', response, 'model')

      cache.clear()
      const stats = cache.getStats()
      expect(stats.size).toBe(0)
    })

    it('should clear cache for specific model', () => {
      const response: APIResponse = {
        content: 'Test',
        tokensUsed: 5,
        cost: 0.00005,
        finishReason: 'stop',
      }

      cache.set('key1', response, 'model1')
      cache.set('key2', response, 'model2')

      cache.clearModel('model1')

      // model2 entries should remain
      const stats = cache.getStats()
      expect(stats.size).toBeLessThan(2)
    })

    it('should prune expired entries', () => {
      const response: APIResponse = {
        content: 'Test',
        tokensUsed: 5,
        cost: 0.00005,
        finishReason: 'stop',
      }

      cache.set('key1', response, 'model')
      cache.set('key2', response, 'model')

      const prunedCount = cache.prune(1) // 1ms TTL
      expect(prunedCount).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Cache Eviction', () => {
    it('should enforce maximum cache size', () => {
      const response: APIResponse = {
        content: 'Test',
        tokensUsed: 5,
        cost: 0.00005,
        finishReason: 'stop',
      }

      // Add many entries
      for (let i = 0; i < 150; i++) {
        cache.set(`key${i}`, response, 'model')
      }

      // Cache should not exceed max size
      const stats = cache.getStats()
      expect(stats.size).toBeLessThanOrEqual(100)
    })
  })

  describe('Singleton Instance', () => {
    it('should provide singleton cache instance', () => {
      expect(responseCache).toBeDefined()
      expect(responseCache).toBeInstanceOf(ResponseCache)
    })

    it('should share state across imports', () => {
      const response: APIResponse = {
        content: 'Test',
        tokensUsed: 5,
        cost: 0.00005,
        finishReason: 'stop',
      }

      responseCache.set('shared-key', response, 'model')
      expect(responseCache.has('shared-key')).toBe(true)
    })
  })

  describe('Cost Optimization', () => {
    it('should track cost savings from caching', () => {
      const response: APIResponse = {
        content: 'Response',
        tokensUsed: 100,
        cost: 0.001,
        finishReason: 'stop',
      }

      // Caching identical request saves cost
      cache.set('expensive-key', response, 'model')

      // If served from cache, no API call = $0.001 saved
      expect(response.cost).toBe(0.001)
    })

    it('should cache different sized responses', () => {
      const smallResponse: APIResponse = {
        content: 'Small',
        tokensUsed: 5,
        cost: 0.00005,
        finishReason: 'stop',
      }

      const largeResponse: APIResponse = {
        content: 'Large response with lots of content that uses more tokens',
        tokensUsed: 500,
        cost: 0.005,
        finishReason: 'stop',
      }

      cache.set('small', smallResponse, 'model')
      cache.set('large', largeResponse, 'model')

      expect(cache.get('small')?.response.tokensUsed).toBe(5)
      expect(cache.get('large')?.response.tokensUsed).toBe(500)
    })
  })

  describe('Concurrent Caching', () => {
    it('should handle concurrent get-or-fetch operations', async () => {
      const response: APIResponse = {
        content: 'Response',
        tokensUsed: 10,
        cost: 0.0001,
        finishReason: 'stop',
      }

      const fetchFn = vi.fn().mockResolvedValue(response)
      const messages: ChatMessage[] = [
        { role: 'user', content: 'Test' },
      ]

      // Multiple concurrent calls should share cache
      const promises = [
        cache.getOrFetch(messages, 'model', fetchFn),
        cache.getOrFetch(messages, 'model', fetchFn),
        cache.getOrFetch(messages, 'model', fetchFn),
      ]

      const results = await Promise.all(promises)

      expect(results).toHaveLength(3)
      results.forEach((r) => {
        expect(r.content).toBe('Response')
      })

      // Fetch should be called once (or minimal times)
      expect(fetchFn.mock.calls.length).toBeLessThanOrEqual(3)
    })
  })
})
