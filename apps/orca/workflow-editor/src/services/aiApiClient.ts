/**
 * Unified AI API Client
 * Handles requests to NVIDIA, OpenAI, and Anthropic APIs
 * Supports both regular and streaming responses
 */

import { getModel, validateModelApiKey } from '../config/models'
import { analytics } from './analytics'
import { rateLimitManager } from './rateLimitManager'
import { costOptimizer } from './costOptimizer'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AIClientOptions {
  modelId: string
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
  onStream?: (chunk: string) => void
}

export interface APIResponse {
  content: string
  tokensUsed: number
  cost: number
  finishReason: string
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RateLimitError'
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export class ModelNotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ModelNotFoundError'
  }
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TimeoutError'
  }
}

export class AllProvidersFailedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AllProvidersFailedError'
  }
}

/**
 * Main AI API Client
 */
export class AIApiClient {
  private requestCount = 0
  private requestTimestamps: number[] = []
  private readonly rateLimitPerMinute = 60
  private readonly apiTimeout = 30000 // 30 seconds
  private abortController: AbortController | null = null
  private readonly providerPriority = ['nvidia', 'openai', 'anthropic'] // Fallback order
  private failedProviders = new Set<string>() // Track provider failures

  /**
   * Get available fallback providers (exclude primary and failed ones)
   */
  private getAvailableFallbackProviders(primaryProvider: string): string[] {
    return this.providerPriority.filter(
      (p) => p !== primaryProvider && !this.failedProviders.has(p)
    )
  }

  /**
   * Reset provider failure tracking (e.g., after successful request)
   */
  private resetProviderFailureTracking(): void {
    this.failedProviders.clear()
  }

  /**
   * Send a message and get a complete response
   */
  async sendMessage(options: AIClientOptions): Promise<APIResponse> {
    const { modelId, messages, temperature = 0.7, maxTokens = 2048 } = options
    const startTime = Date.now()

    // Check legacy rate limit
    this.checkRateLimit()

    // Validate model
    let model = getModel(modelId)
    if (!model) {
      throw new ModelNotFoundError(`Model ${modelId} not found`)
    }

    // Validate API key
    const keyValidation = validateModelApiKey(modelId)
    if (!keyValidation.valid) {
      throw new AuthError(keyValidation.error || `Invalid API key for ${modelId}`)
    }

    let response: APIResponse
    let retries = 3
    const primaryProvider = model.provider

    while (retries > 0) {
      try {
        // Check Phase 8 rate limiter before making request
        const canRequest = rateLimitManager.canMakeRequest(model.provider)
        if (!canRequest) {
          // Execute with rate limiting (will queue if necessary)
          response = await rateLimitManager.executeWithRateLimit(model.provider, async () => {
            return await this.makeProviderRequest(model, messages, temperature, maxTokens)
          })
        } else {
          // Consume token and make request
          rateLimitManager.consumeToken(model.provider)
          response = await this.makeProviderRequest(model, messages, temperature, maxTokens)
        }

        // Success: reset failure tracking
        this.resetProviderFailureTracking()

        // Calculate cost
        const cost = response.tokensUsed * model.costPerToken
        response.cost = cost

        // Track in analytics
        const duration = Date.now() - startTime
        analytics.trackApiCall(modelId, model.provider, cost, response.tokensUsed, duration)

        // Track cost for optimization
        costOptimizer.trackRequest(model.provider, cost, response.tokensUsed, duration, true)

        return response
      } catch (error) {
        retries--

        // Track error in analytics
        if (error instanceof Error) {
          analytics.trackError(error.name, modelId)
        }

        if (error instanceof RateLimitError) {
          // Wait and retry on rate limit
          if (retries > 0) {
            await this.sleep(1000 * (4 - retries))
            continue
          }
          throw error
        }

        // On critical errors, try fallback providers
        if (error instanceof AuthError || error instanceof TimeoutError) {
          this.failedProviders.add(model.provider)
          const fallbackProviders = this.getAvailableFallbackProviders(primaryProvider)

          if (fallbackProviders.length > 0) {
            const fallbackModel = getModel(fallbackProviders[0])
            if (fallbackModel) {
              console.log(`Fallback from ${model.provider} to ${fallbackModel.provider}`)
              // Track fallback in analytics
              analytics.trackFallback(model.provider, fallbackModel.provider, modelId)
              model = fallbackModel
              retries = 3 // Reset retries for fallback provider
              continue
            }
          }
        }

        if (retries === 0) {
          if (this.failedProviders.size > 0) {
            throw new AllProvidersFailedError(
              `All providers failed. Tried: ${[primaryProvider, ...Array.from(this.failedProviders)].join(', ')}`
            )
          }
          throw error
        }

        // Exponential backoff for other errors
        await this.sleep(100 * (4 - retries))
      }
    }

    throw new Error('Failed to get response after retries')
  }

  /**
   * Make a provider request (extracted for rate limit wrapping)
   */
  private async makeProviderRequest(
    model: ReturnType<typeof getModel>,
    messages: ChatMessage[],
    temperature: number,
    maxTokens: number
  ): Promise<APIResponse> {
    if (!model) {
      throw new ModelNotFoundError('Model is required')
    }

    switch (model.provider) {
      case 'nvidia':
        return await this.nvidiaRequest(model.endpoint, model.apiKey, messages, temperature, maxTokens)
      case 'openai':
        return await this.openaiRequest(model.endpoint, model.apiKey, messages, temperature, maxTokens)
      case 'anthropic':
        return await this.anthropicRequest(model.endpoint, model.apiKey, messages, temperature, maxTokens)
      default:
        throw new Error(`Unknown provider: ${model.provider}`)
    }
  }

  /**
   * Stream a message response
   */
  async *streamMessage(options: AIClientOptions): AsyncGenerator<string> {
    const { modelId, messages, temperature = 0.7, maxTokens = 2048 } = options

    // Check rate limit
    this.checkRateLimit()

    // Validate model
    const model = getModel(modelId)
    if (!model) {
      throw new ModelNotFoundError(`Model ${modelId} not found`)
    }

    // Validate API key
    const keyValidation = validateModelApiKey(modelId)
    if (!keyValidation.valid) {
      throw new AuthError(keyValidation.error || `Invalid API key for ${modelId}`)
    }

    // Create abort controller for this stream
    this.abortController = new AbortController()

    try {
      switch (model.provider) {
        case 'nvidia':
          yield* this.nvidiaStream(model.endpoint, model.apiKey, messages, temperature, maxTokens)
          break
        case 'openai':
          yield* this.openaiStream(model.endpoint, model.apiKey, messages, temperature, maxTokens)
          break
        case 'anthropic':
          yield* this.anthropicStream(model.endpoint, model.apiKey, messages, temperature, maxTokens)
          break
        default:
          throw new Error(`Unknown provider: ${model.provider}`)
      }
    } finally {
      // Clean up abort controller
      this.abortController = null
    }
  }

  /**
   * NVIDIA API Request
   * Uses NIM (NVIDIA Inference Microservice) endpoints
   */
  private async nvidiaRequest(
    endpoint: string,
    apiKey: string,
    messages: ChatMessage[],
    temperature: number,
    maxTokens: number
  ): Promise<APIResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.apiTimeout)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama2_70b',
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: false,
        }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 429) {
          throw new RateLimitError('NVIDIA rate limit exceeded')
        }
        if (response.status === 401) {
          throw new AuthError('Invalid NVIDIA API key')
        }
        throw new Error(`NVIDIA API error: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        content: data.choices[0]?.message?.content || '',
        tokensUsed: data.usage?.total_tokens || 0,
        cost: 0, // Calculated by caller
        finishReason: data.choices[0]?.finish_reason || 'stop',
      }
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new TimeoutError('Request timed out after 30 seconds')
      }
      throw error
    }
  }

  /**
   * NVIDIA Streaming Request
   */
  private async *nvidiaStream(
    endpoint: string,
    apiKey: string,
    messages: ChatMessage[],
    temperature: number,
    maxTokens: number
  ): AsyncGenerator<string> {
    const timeoutId = setTimeout(() => this.abortController?.abort(), this.apiTimeout)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama2_70b',
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: true,
        }),
        signal: this.abortController?.signal,
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 429) {
          throw new RateLimitError('NVIDIA rate limit exceeded')
        }
        if (response.status === 401) {
          throw new AuthError('Invalid NVIDIA API key')
        }
        throw new Error(`NVIDIA streaming error: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                const content = data.choices[0]?.delta?.content || ''
                if (content) yield content
              } catch {
                // Skip invalid JSON lines
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new TimeoutError('Request timed out after 30 seconds')
      }
      throw error
    }
  }

  /**
   * OpenAI API Request
   */
  private async openaiRequest(
    endpoint: string,
    apiKey: string,
    messages: ChatMessage[],
    temperature: number,
    maxTokens: number
  ): Promise<APIResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.apiTimeout)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: false,
        }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 429) {
          throw new RateLimitError('OpenAI rate limit exceeded')
        }
        if (response.status === 401) {
          throw new AuthError('Invalid OpenAI API key')
        }
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        content: data.choices[0]?.message?.content || '',
        tokensUsed: data.usage?.total_tokens || 0,
        cost: 0, // Calculated by caller
        finishReason: data.choices[0]?.finish_reason || 'stop',
      }
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new TimeoutError('Request timed out after 30 seconds')
      }
      throw error
    }
  }

  /**
   * OpenAI Streaming Request
   */
  private async *openaiStream(
    endpoint: string,
    apiKey: string,
    messages: ChatMessage[],
    temperature: number,
    maxTokens: number
  ): AsyncGenerator<string> {
    const timeoutId = setTimeout(() => this.abortController?.abort(), this.apiTimeout)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: true,
        }),
        signal: this.abortController?.signal,
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 429) {
          throw new RateLimitError('OpenAI rate limit exceeded')
        }
        if (response.status === 401) {
          throw new AuthError('Invalid OpenAI API key')
        }
        throw new Error(`OpenAI streaming error: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6))
                const content = data.choices[0]?.delta?.content || ''
                if (content) yield content
              } catch {
                // Skip invalid JSON lines
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new TimeoutError('Request timed out after 30 seconds')
      }
      throw error
    }
  }

  /**
   * Anthropic API Request
   */
  private async anthropicRequest(
    endpoint: string,
    apiKey: string,
    messages: ChatMessage[],
    temperature: number,
    maxTokens: number
  ): Promise<APIResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.apiTimeout)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          max_tokens: maxTokens,
          temperature,
          messages,
        }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 429) {
          throw new RateLimitError('Anthropic rate limit exceeded')
        }
        if (response.status === 401) {
          throw new AuthError('Invalid Anthropic API key')
        }
        throw new Error(`Anthropic API error: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        content: data.content[0]?.text || '',
        tokensUsed: data.usage?.output_tokens || 0,
        cost: 0, // Calculated by caller
        finishReason: data.stop_reason || 'end_turn',
      }
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new TimeoutError('Request timed out after 30 seconds')
      }
      throw error
    }
  }

  /**
   * Anthropic Streaming Request
   */
  private async *anthropicStream(
    endpoint: string,
    apiKey: string,
    messages: ChatMessage[],
    temperature: number,
    maxTokens: number
  ): AsyncGenerator<string> {
    const timeoutId = setTimeout(() => this.abortController?.abort(), this.apiTimeout)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          max_tokens: maxTokens,
          temperature,
          messages,
          stream: true,
        }),
        signal: this.abortController?.signal,
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 429) {
          throw new RateLimitError('Anthropic rate limit exceeded')
        }
        if (response.status === 401) {
          throw new AuthError('Invalid Anthropic API key')
        }
        throw new Error(`Anthropic streaming error: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.type === 'content_block_delta' && data.delta?.type === 'text_delta') {
                  yield data.delta.text || ''
                }
              } catch {
                // Skip invalid JSON lines
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new TimeoutError('Request timed out after 30 seconds')
      }
      throw error
    }
  }

  /**
   * Rate limiting check
   */
  private checkRateLimit(): void {
    const now = Date.now()
    const oneMinuteAgo = now - 60000

    // Remove old timestamps
    this.requestTimestamps = this.requestTimestamps.filter((t) => t > oneMinuteAgo)

    if (this.requestTimestamps.length >= this.rateLimitPerMinute) {
      throw new RateLimitError(`Rate limit exceeded: ${this.rateLimitPerMinute} requests per minute`)
    }

    this.requestTimestamps.push(now)
  }

  /**
   * Utility: sleep for a given milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Cancel the current streaming request
   */
  cancelStream(): void {
    if (this.abortController) {
      this.abortController.abort()
    }
  }
}

/**
 * Create singleton instance
 */
export const aiApiClient = new AIApiClient()
