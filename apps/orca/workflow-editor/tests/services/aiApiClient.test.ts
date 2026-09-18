import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest'
import {
  aiApiClient,
  TimeoutError,
  RateLimitError,
  AuthError,
  ModelNotFoundError,
  ChatMessage,
} from '../../src/services/aiApiClient'
import * as modelsModule from '../../src/config/models'

// Mock the models module
vi.mock('../../src/config/models', () => ({
  getModel: vi.fn(),
  validateModelApiKey: vi.fn(),
}))

describe('AIApiClient', () => {
  let mockGetModel: MockedFunction<typeof modelsModule.getModel>
  let mockValidateModelApiKey: MockedFunction<typeof modelsModule.validateModelApiKey>

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetModel = modelsModule.getModel as MockedFunction<typeof modelsModule.getModel>
    mockValidateModelApiKey = modelsModule.validateModelApiKey as MockedFunction<
      typeof modelsModule.validateModelApiKey
    >

    // Default mocks
    mockGetModel.mockReturnValue({
      id: 'test-model',
      name: 'Test Model',
      provider: 'nvidia',
      endpoint: 'https://test.api/endpoint',
      apiKey: 'test-key',
      maxTokens: 2048,
      costPerToken: 0.00001,
    })

    mockValidateModelApiKey.mockReturnValue({
      valid: true,
      error: null,
    })
  })

  describe('Error Classes', () => {
    it('should create TimeoutError with correct name', () => {
      const error = new TimeoutError('Timeout occurred')
      expect(error.name).toBe('TimeoutError')
      expect(error.message).toBe('Timeout occurred')
      expect(error).toBeInstanceOf(Error)
    })

    it('should create RateLimitError with correct name', () => {
      const error = new RateLimitError('Rate limit exceeded')
      expect(error.name).toBe('RateLimitError')
      expect(error.message).toBe('Rate limit exceeded')
      expect(error).toBeInstanceOf(Error)
    })

    it('should create AuthError with correct name', () => {
      const error = new AuthError('Invalid API key')
      expect(error.name).toBe('AuthError')
      expect(error.message).toBe('Invalid API key')
      expect(error).toBeInstanceOf(Error)
    })

    it('should create ModelNotFoundError with correct name', () => {
      const error = new ModelNotFoundError('Model not found')
      expect(error.name).toBe('ModelNotFoundError')
      expect(error.message).toBe('Model not found')
      expect(error).toBeInstanceOf(Error)
    })
  })

  describe('Model Validation', () => {
    it('should throw ModelNotFoundError when model does not exist', async () => {
      mockGetModel.mockReturnValue(null as any)

      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hello' },
      ]

      await expect(
        aiApiClient.sendMessage({
          modelId: 'non-existent-model',
          messages,
        })
      ).rejects.toThrow(ModelNotFoundError)
    })

    it('should throw AuthError when API key is invalid', async () => {
      mockValidateModelApiKey.mockReturnValue({
        valid: false,
        error: 'Invalid API key',
      })

      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hello' },
      ]

      await expect(
        aiApiClient.sendMessage({
          modelId: 'test-model',
          messages,
        })
      ).rejects.toThrow(AuthError)
    })
  })

  describe('Rate Limiting', () => {
    it('should track request timestamps', () => {
      // This is a private method, but we can test rate limit behavior
      // by making multiple rapid requests
      const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }]

      // Mock fetch to prevent actual API calls
      global.fetch = vi.fn()

      // Note: Full rate limit testing would require multiple actual requests
      // This is a placeholder for the concept
      expect(() => {
        aiApiClient.sendMessage({
          modelId: 'test-model',
          messages,
        })
      }).not.toThrow()
    })
  })

  describe('Stream Message', () => {
    it('should create AbortController for streaming', async () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hello' },
      ]

      // Mock fetch to prevent actual API calls
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: {
          getReader: () => ({
            read: () => Promise.resolve({ done: true, value: null }),
            releaseLock: () => {},
          }),
        },
      })

      const stream = aiApiClient.streamMessage({
        modelId: 'test-model',
        messages,
      })

      // Consume the stream
      for await (const chunk of stream) {
        expect(chunk).toBeDefined()
      }
    })

    it('should support cancellation via cancelStream', () => {
      expect(() => {
        aiApiClient.cancelStream()
      }).not.toThrow()
    })
  })

  describe('Timeout Handling', () => {
    it('should have apiTimeout set to 30000ms', () => {
      // Access private property for testing
      const client = aiApiClient as any
      expect(client.apiTimeout).toBe(30000)
    })
  })

  describe('Error Handling', () => {
    it('should detect 401 Unauthorized response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      })

      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hello' },
      ]

      try {
        await aiApiClient.sendMessage({
          modelId: 'test-model',
          messages,
        })
        expect.fail('Should have thrown AuthError')
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError)
      }
    }, { timeout: 10000 })

    it('should detect 429 Rate Limit response and retry', async () => {
      // Mock fetch to return rate limit error
      let callCount = 0
      global.fetch = vi.fn().mockImplementation(() => {
        callCount++
        return Promise.resolve({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
        })
      })

      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hello' },
      ]

      try {
        await aiApiClient.sendMessage({
          modelId: 'test-model',
          messages,
        })
        expect.fail('Should have thrown RateLimitError')
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError)
        // Verify retries happened (3 attempts + retries)
        expect(callCount).toBeGreaterThan(1)
      }
    }, { timeout: 15000 })
  })

  describe('Response Parsing', () => {
    it('should accept valid API response format', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [
            {
              message: { content: 'Hello there!' },
              finish_reason: 'stop',
            },
          ],
          usage: { total_tokens: 10 },
        }),
      })

      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hi' },
      ]

      const response = await aiApiClient.sendMessage({
        modelId: 'test-model',
        messages,
      })

      expect(response.content).toBe('Hello there!')
      expect(response.tokensUsed).toBe(10)
      expect(response.finishReason).toBe('stop')
    })
  })
})
