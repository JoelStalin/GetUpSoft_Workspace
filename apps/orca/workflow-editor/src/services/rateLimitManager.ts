/**
 * Rate Limit Manager
 * Manages provider-specific rate limits with token bucket algorithm
 */

export interface RateLimitConfig {
  provider: string
  requestsPerMinute: number
  burstSize?: number
}

export interface ProviderLimitState {
  provider: string
  tokens: number
  maxTokens: number
  refillRate: number
  lastRefillTime: number
  requestQueue: Array<() => Promise<any>>
  isProcessing: boolean
}

export interface RateLimitStatus {
  provider: string
  availableTokens: number
  maxTokens: number
  requestsPerMinute: number
  queued: number
  isLimited: boolean
}

export class RateLimitManager {
  private providerLimits = new Map<string, ProviderLimitState>()
  private defaultConfig: RateLimitConfig = {
    provider: 'default',
    requestsPerMinute: 60,
    burstSize: 10,
  }

  constructor(configs?: RateLimitConfig[]) {
    if (configs) {
      configs.forEach((config) => this.setLimit(config))
    }
  }

  /**
   * Set rate limit for a provider
   */
  setLimit(config: RateLimitConfig): void {
    const burstSize = config.burstSize ?? Math.ceil(config.requestsPerMinute / 6)
    const refillRate = config.requestsPerMinute / 60 // tokens per second

    this.providerLimits.set(config.provider, {
      provider: config.provider,
      tokens: burstSize,
      maxTokens: burstSize,
      refillRate,
      lastRefillTime: Date.now(),
      requestQueue: [],
      isProcessing: false,
    })

    console.log(
      `Rate limit set for ${config.provider}: ${config.requestsPerMinute} req/min, burst: ${burstSize}`
    )
  }

  /**
   * Get or create limit state for provider
   */
  private getProviderLimit(provider: string): ProviderLimitState {
    let limit = this.providerLimits.get(provider)

    if (!limit) {
      const burstSize = this.defaultConfig.burstSize ?? 10
      limit = {
        provider,
        tokens: burstSize,
        maxTokens: burstSize,
        refillRate: this.defaultConfig.requestsPerMinute / 60,
        lastRefillTime: Date.now(),
        requestQueue: [],
        isProcessing: false,
      }
      this.providerLimits.set(provider, limit)
    }

    return limit
  }

  /**
   * Refill tokens based on elapsed time
   */
  private refillTokens(limit: ProviderLimitState): void {
    const now = Date.now()
    const elapsedSeconds = (now - limit.lastRefillTime) / 1000
    const tokensToAdd = elapsedSeconds * limit.refillRate

    if (tokensToAdd > 0) {
      limit.tokens = Math.min(limit.maxTokens, limit.tokens + tokensToAdd)
      limit.lastRefillTime = now
    }
  }

  /**
   * Check if request can proceed immediately
   */
  canMakeRequest(provider: string): boolean {
    const limit = this.getProviderLimit(provider)
    this.refillTokens(limit)
    return limit.tokens >= 1
  }

  /**
   * Consume a token (make a request)
   */
  consumeToken(provider: string): void {
    const limit = this.getProviderLimit(provider)
    this.refillTokens(limit)

    if (limit.tokens >= 1) {
      limit.tokens--
      console.log(
        `Token consumed for ${provider}. Remaining: ${limit.tokens.toFixed(2)}/${limit.maxTokens}`
      )
    } else {
      console.warn(`Rate limit exceeded for ${provider}. Request queued.`)
    }
  }

  /**
   * Execute request with rate limiting
   */
  async executeWithRateLimit<T>(
    provider: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const limit = this.getProviderLimit(provider)

    // Wait until token available
    while (!this.canMakeRequest(provider)) {
      await this.sleep(100) // Exponential backoff would be better
      this.refillTokens(limit)
    }

    this.consumeToken(provider)
    return fn()
  }

  /**
   * Queue request if rate limited
   */
  async queueRequest<T>(
    provider: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const limit = this.getProviderLimit(provider)

    if (this.canMakeRequest(provider)) {
      this.consumeToken(provider)
      return fn()
    }

    // Queue the request
    return new Promise<T>((resolve, reject) => {
      limit.requestQueue.push(async () => {
        try {
          this.consumeToken(provider)
          const result = await fn()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })

      // Process queue if not already processing
      if (!limit.isProcessing) {
        this.processQueue(provider)
      }
    })
  }

  /**
   * Process queued requests
   */
  private async processQueue(provider: string): Promise<void> {
    const limit = this.getProviderLimit(provider)

    if (limit.isProcessing) return

    limit.isProcessing = true

    while (limit.requestQueue.length > 0) {
      // Wait for token availability
      while (!this.canMakeRequest(provider)) {
        await this.sleep(100)
        this.refillTokens(limit)
      }

      const request = limit.requestQueue.shift()
      if (request) {
        try {
          await request()
        } catch (error) {
          console.error(`Error processing queued request for ${provider}:`, error)
        }
      }
    }

    limit.isProcessing = false
  }

  /**
   * Get rate limit status
   */
  getStatus(provider: string): RateLimitStatus {
    const limit = this.getProviderLimit(provider)
    this.refillTokens(limit)

    return {
      provider,
      availableTokens: Math.floor(limit.tokens),
      maxTokens: limit.maxTokens,
      requestsPerMinute: limit.refillRate * 60,
      queued: limit.requestQueue.length,
      isLimited: limit.tokens < 1,
    }
  }

  /**
   * Get status for all providers
   */
  getAllStatus(): RateLimitStatus[] {
    return Array.from(this.providerLimits.values()).map((limit) =>
      this.getStatus(limit.provider)
    )
  }

  /**
   * Reset limits for a provider
   */
  reset(provider: string): void {
    const limit = this.getProviderLimit(provider)
    limit.tokens = limit.maxTokens
    limit.lastRefillTime = Date.now()
    limit.requestQueue = []
    console.log(`Rate limit reset for ${provider}`)
  }

  /**
   * Reset all limits
   */
  resetAll(): void {
    this.providerLimits.forEach((_, provider) => this.reset(provider))
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Get metrics for monitoring
   */
  getMetrics(): {
    providers: string[]
    statuses: RateLimitStatus[]
    totalQueued: number
    limitedProviders: string[]
  } {
    const statuses = this.getAllStatus()
    const totalQueued = statuses.reduce((sum, s) => sum + s.queued, 0)
    const limitedProviders = statuses.filter((s) => s.isLimited).map((s) => s.provider)

    return {
      providers: Array.from(this.providerLimits.keys()),
      statuses,
      totalQueued,
      limitedProviders,
    }
  }
}

// Export singleton instance with default provider configs
export const rateLimitManager = new RateLimitManager([
  {
    provider: 'nvidia',
    requestsPerMinute: 120,
    burstSize: 20,
  },
  {
    provider: 'openai',
    requestsPerMinute: 60,
    burstSize: 10,
  },
  {
    provider: 'anthropic',
    requestsPerMinute: 60,
    burstSize: 10,
  },
])
