/**
 * Response Cache Service
 * Caches API responses to reduce costs and improve performance
 */

import { APIResponse, ChatMessage } from './aiApiClient'

export interface CachedResponse {
  response: APIResponse
  timestamp: number
  modelId: string
}

export class ResponseCache {
  private cache = new Map<string, CachedResponse>()
  private readonly defaultTTL = 3600000 // 1 hour default
  private readonly maxCacheSize = 100 // Maximum number of cached responses

  /**
   * Generate cache key from messages and model
   */
  private getCacheKey(messages: ChatMessage[], modelId: string): string {
    // Create a deterministic key from messages and model
    const messageHash = messages
      .map((m) => `${m.role}:${m.content}`)
      .join('|')
    return `${modelId}:${messageHash}`
  }

  /**
   * Check if cached response is expired
   */
  private isExpired(cached: CachedResponse, ttl: number = this.defaultTTL): boolean {
    return Date.now() - cached.timestamp > ttl
  }

  /**
   * Get or fetch response
   */
  async getOrFetch(
    messages: ChatMessage[],
    modelId: string,
    fetchFn: () => Promise<APIResponse>,
    ttl?: number
  ): Promise<APIResponse> {
    const cacheKey = this.getCacheKey(messages, modelId)
    const cached = this.cache.get(cacheKey)

    // Return cached response if valid
    if (cached && !this.isExpired(cached, ttl)) {
      console.log(`Cache hit: ${cacheKey.substring(0, 30)}...`)
      return cached.response
    }

    // Fetch fresh response
    console.log(`Cache miss: ${cacheKey.substring(0, 30)}...`)
    const response = await fetchFn()

    // Cache the response
    this.set(cacheKey, response, modelId)

    return response
  }

  /**
   * Set cache entry
   */
  set(key: string, response: APIResponse, modelId: string): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      modelId,
    })
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; hitRate: number; memoryUsage: number } {
    const size = this.cache.size
    const hitRate = 0 // Would track hits/misses
    const memoryUsage = size * 1000 // Rough estimate: 1KB per entry

    return { size, hitRate, memoryUsage }
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear()
    console.log('Cache cleared')
  }

  /**
   * Clear specific model cache
   */
  clearModel(modelId: string): void {
    const keysToDelete: string[] = []

    this.cache.forEach((cached, key) => {
      if (cached.modelId === modelId) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach((key) => this.cache.delete(key))
    console.log(`Cleared ${keysToDelete.length} cache entries for model ${modelId}`)
  }

  /**
   * Prune expired entries
   */
  prune(ttl: number = this.defaultTTL): number {
    const keysToDelete: string[] = []

    this.cache.forEach((cached, key) => {
      if (this.isExpired(cached, ttl)) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach((key) => this.cache.delete(key))
    console.log(`Pruned ${keysToDelete.length} expired cache entries`)

    return keysToDelete.length
  }

  /**
   * Get cache entry
   */
  get(key: string): CachedResponse | undefined {
    return this.cache.get(key)
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    const cached = this.cache.get(key)
    return cached ? !this.isExpired(cached) : false
  }
}

// Export singleton instance
export const responseCache = new ResponseCache()
