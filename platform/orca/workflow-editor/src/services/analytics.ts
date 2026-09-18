/**
 * Analytics Service
 * Tracks API calls, costs, performance metrics, and events
 */

export interface AnalyticsEvent {
  type: 'api_call' | 'cache_hit' | 'cache_miss' | 'error' | 'fallback' | 'session_start'
  timestamp: number
  modelId?: string
  provider?: string
  cost?: number
  tokensUsed?: number
  duration?: number
  errorType?: string
  sessionId?: string
  userId?: string
}

export interface AnalyticsStats {
  totalApiCalls: number
  totalCacheHits: number
  totalCacheMisses: number
  totalCost: number
  totalTokensUsed: number
  averageResponseTime: number
  errorCount: number
  fallbackCount: number
  cacheHitRate: number
  sessionId: string
  userId: string
}

export class AnalyticsService {
  private events: AnalyticsEvent[] = []
  private readonly maxStoredEvents = 1000
  private sessionId: string
  private userId: string
  private startTime: number

  constructor(userId?: string) {
    this.sessionId = this.generateSessionId()
    this.userId = userId || 'anonymous'
    this.startTime = Date.now()
    this.loadEventsFromStorage()
    this.trackEvent({
      type: 'session_start',
      timestamp: Date.now(),
    })
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Track an analytics event
   */
  trackEvent(event: Omit<AnalyticsEvent, 'sessionId' | 'userId'>): void {
    const fullEvent: AnalyticsEvent = {
      ...event,
      sessionId: this.sessionId,
      userId: this.userId,
    }

    this.events.push(fullEvent)

    // Enforce max stored events with FIFO eviction
    if (this.events.length > this.maxStoredEvents) {
      this.events.shift()
    }

    this.persistToStorage()
    this.logEvent(fullEvent)
  }

  /**
   * Track API call
   */
  trackApiCall(modelId: string, provider: string, cost: number, tokensUsed: number, duration: number): void {
    this.trackEvent({
      type: 'api_call',
      timestamp: Date.now(),
      modelId,
      provider,
      cost,
      tokensUsed,
      duration,
    })
  }

  /**
   * Track cache hit
   */
  trackCacheHit(modelId: string): void {
    this.trackEvent({
      type: 'cache_hit',
      timestamp: Date.now(),
      modelId,
    })
  }

  /**
   * Track cache miss
   */
  trackCacheMiss(modelId: string): void {
    this.trackEvent({
      type: 'cache_miss',
      timestamp: Date.now(),
      modelId,
    })
  }

  /**
   * Track error
   */
  trackError(errorType: string, modelId?: string): void {
    this.trackEvent({
      type: 'error',
      timestamp: Date.now(),
      errorType,
      modelId,
    })
  }

  /**
   * Track provider fallback
   */
  trackFallback(fromProvider: string, toProvider: string, modelId: string): void {
    this.trackEvent({
      type: 'fallback',
      timestamp: Date.now(),
      provider: `${fromProvider}->${toProvider}`,
      modelId,
    })
  }

  /**
   * Get analytics statistics
   */
  getStats(): AnalyticsStats {
    const apiCalls = this.events.filter((e) => e.type === 'api_call')
    const cacheHits = this.events.filter((e) => e.type === 'cache_hit')
    const cacheMisses = this.events.filter((e) => e.type === 'cache_miss')
    const errors = this.events.filter((e) => e.type === 'error')
    const fallbacks = this.events.filter((e) => e.type === 'fallback')

    const totalCost = apiCalls.reduce((sum, e) => sum + (e.cost || 0), 0)
    const totalTokens = apiCalls.reduce((sum, e) => sum + (e.tokensUsed || 0), 0)
    const avgResponseTime = apiCalls.length > 0
      ? apiCalls.reduce((sum, e) => sum + (e.duration || 0), 0) / apiCalls.length
      : 0

    const totalRequests = cacheHits.length + cacheMisses.length
    const cacheHitRate = totalRequests > 0 ? (cacheHits.length / totalRequests) * 100 : 0

    return {
      totalApiCalls: apiCalls.length,
      totalCacheHits: cacheHits.length,
      totalCacheMisses: cacheMisses.length,
      totalCost,
      totalTokensUsed: totalTokens,
      averageResponseTime: avgResponseTime,
      errorCount: errors.length,
      fallbackCount: fallbacks.length,
      cacheHitRate,
      sessionId: this.sessionId,
      userId: this.userId,
    }
  }

  /**
   * Get events filtered by type
   */
  getEvents(type?: AnalyticsEvent['type']): AnalyticsEvent[] {
    if (!type) return [...this.events]
    return this.events.filter((e) => e.type === type)
  }

  /**
   * Get events in time range
   */
  getEventsByTimeRange(startTime: number, endTime: number): AnalyticsEvent[] {
    return this.events.filter((e) => e.timestamp >= startTime && e.timestamp <= endTime)
  }

  /**
   * Get cost per provider
   */
  getCostPerProvider(): Record<string, number> {
    const costByProvider: Record<string, number> = {}

    this.events
      .filter((e) => e.type === 'api_call' && e.provider)
      .forEach((e) => {
        if (e.provider) {
          costByProvider[e.provider] = (costByProvider[e.provider] || 0) + (e.cost || 0)
        }
      })

    return costByProvider
  }

  /**
   * Get model usage statistics
   */
  getModelUsageStats(): Record<string, { calls: number; cost: number; tokens: number }> {
    const stats: Record<string, { calls: number; cost: number; tokens: number }> = {}

    this.events
      .filter((e) => e.modelId)
      .forEach((e) => {
        if (e.modelId) {
          if (!stats[e.modelId]) {
            stats[e.modelId] = { calls: 0, cost: 0, tokens: 0 }
          }

          if (e.type === 'api_call') {
            stats[e.modelId].calls++
            stats[e.modelId].cost += e.cost || 0
            stats[e.modelId].tokens += e.tokensUsed || 0
          }
        }
      })

    return stats
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events = []
    this.persistToStorage()
  }

  /**
   * Persist events to localStorage
   */
  private persistToStorage(): void {
    try {
      const data = {
        sessionId: this.sessionId,
        userId: this.userId,
        events: this.events,
        timestamp: Date.now(),
      }
      localStorage.setItem(`analytics_${this.sessionId}`, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to persist analytics to localStorage:', error)
    }
  }

  /**
   * Load events from localStorage
   */
  private loadEventsFromStorage(): void {
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith('analytics_'))
      keys.forEach((key) => {
        const data = JSON.parse(localStorage.getItem(key) || '{}')
        if (data.events && Array.isArray(data.events)) {
          this.events.push(...data.events)
        }
      })

      // Keep only most recent events
      if (this.events.length > this.maxStoredEvents) {
        this.events = this.events.slice(-this.maxStoredEvents)
      }
    } catch (error) {
      console.warn('Failed to load analytics from localStorage:', error)
    }
  }

  /**
   * Export analytics data
   */
  export(): {
    stats: AnalyticsStats
    events: AnalyticsEvent[]
    costPerProvider: Record<string, number>
    modelUsage: Record<string, { calls: number; cost: number; tokens: number }>
  } {
    return {
      stats: this.getStats(),
      events: this.events,
      costPerProvider: this.getCostPerProvider(),
      modelUsage: this.getModelUsageStats(),
    }
  }

  /**
   * Log event to console for debugging
   */
  private logEvent(event: AnalyticsEvent): void {
    const stats = this.getStats()
    console.log(
      `[Analytics] ${event.type.toUpperCase()} | Cost: $${stats.totalCost.toFixed(4)} | Cache Hit Rate: ${stats.cacheHitRate.toFixed(1)}%`
    )
  }
}

// Export singleton instance
export const analytics = new AnalyticsService()
