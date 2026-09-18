import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  handleApiError,
  logError,
  isRetryableError,
  getRetryDelay,
  validateApiResponse,
} from './errorHandler'
import {
  ApiError,
  NetworkError,
  TimeoutError,
  ValidationError,
  ExecutionError,
} from '@/constants/errors'

describe('errorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('handleApiError', () => {
    it('should handle ApiError', () => {
      const error = new ApiError('Server error', 500)
      const result = handleApiError(error)
      expect(result.code).toBe('SERVER_ERROR')
      expect(result.originalError).toBe(error)
    })

    it('should handle NetworkError', () => {
      const error = new NetworkError('Connection failed')
      const result = handleApiError(error)
      expect(result.code).toBe('NETWORK_ERROR')
      expect(result.message).toBe('Network connection failed. Please check your internet connection.')
    })

    it('should handle TimeoutError', () => {
      const error = new TimeoutError('Request timeout', 5000)
      const result = handleApiError(error)
      expect(result.code).toBe('TIMEOUT_ERROR')
      expect(result.message).toBe('Request timed out. Please try again.')
    })

    it('should handle ValidationError', () => {
      const error = new ValidationError('Invalid input')
      const result = handleApiError(error)
      expect(result.code).toBe('VALIDATION_ERROR')
      expect(result.message).toBe('Invalid input')
    })

    it('should handle ExecutionError', () => {
      const error = new ExecutionError('Node failed', 'node-1')
      const result = handleApiError(error)
      expect(result.code).toBe('EXECUTION_ERROR')
      expect(result.message).toBe('Node failed')
    })

    it('should handle generic Error', () => {
      const error = new Error('Generic error')
      const result = handleApiError(error)
      expect(result.code).toBe('UNKNOWN_ERROR')
      expect(result.message).toBe('Generic error')
    })

    it('should handle non-Error types', () => {
      const result = handleApiError('string error')
      expect(result.code).toBe('UNKNOWN_ERROR')
      expect(result.message).toBe('An unexpected error occurred.')
    })
  })

  describe('logError', () => {
    it('should log error in development', () => {
      const originalEnv = process.env.NODE_ENV
      try {
        process.env.NODE_ENV = 'development'
        const consoleSpy = vi.spyOn(console, 'error')
        const error = new Error('Test error')
        logError(error, 'TEST_CONTEXT')
        expect(consoleSpy).toHaveBeenCalled()
        consoleSpy.mockRestore()
      } finally {
        process.env.NODE_ENV = originalEnv
      }
    })

    it('should log error with context', () => {
      const originalEnv = process.env.NODE_ENV
      try {
        process.env.NODE_ENV = 'development'
        const consoleSpy = vi.spyOn(console, 'error')
        const error = new Error('Test error')
        logError(error, 'MY_CONTEXT')
        expect(consoleSpy).toHaveBeenCalledWith(
          '[MY_CONTEXT]',
          expect.anything(),
          expect.anything(),
          expect.anything()
        )
        consoleSpy.mockRestore()
      } finally {
        process.env.NODE_ENV = originalEnv
      }
    })
  })

  describe('isRetryableError', () => {
    it('should return true for NetworkError', () => {
      const error = new NetworkError('Connection failed')
      expect(isRetryableError(error)).toBe(true)
    })

    it('should return true for TimeoutError', () => {
      const error = new TimeoutError('Timeout', 5000)
      expect(isRetryableError(error)).toBe(true)
    })

    it('should return true for 5xx errors', () => {
      const error = new ApiError('Server error', 503)
      expect(isRetryableError(error)).toBe(true)
    })

    it('should return true for 429 rate limit', () => {
      const error = new ApiError('Rate limited', 429)
      expect(isRetryableError(error)).toBe(true)
    })

    it('should return false for 4xx errors', () => {
      const error = new ApiError('Bad request', 400)
      expect(isRetryableError(error)).toBe(false)
    })

    it('should return false for 401 unauthorized', () => {
      const error = new ApiError('Unauthorized', 401)
      expect(isRetryableError(error)).toBe(false)
    })

    it('should return false for ValidationError', () => {
      const error = new ValidationError('Invalid input')
      expect(isRetryableError(error)).toBe(false)
    })

    it('should return false for generic errors', () => {
      const error = new Error('Generic error')
      expect(isRetryableError(error)).toBe(false)
    })
  })

  describe('getRetryDelay', () => {
    it('should return exponential backoff', () => {
      const delay1 = getRetryDelay(1, 1000)
      const delay2 = getRetryDelay(2, 1000)
      const delay3 = getRetryDelay(3, 1000)

      expect(delay1).toBeLessThan(2000) // ~1000 + jitter
      expect(delay2).toBeLessThan(4000) // ~2000 + jitter
      expect(delay3).toBeLessThan(8000) // ~4000 + jitter

      expect(delay1 < delay2).toBe(true)
      expect(delay2 < delay3).toBe(true)
    })

    it('should cap at 30 seconds', () => {
      const delay = getRetryDelay(10, 1000)
      expect(delay).toBeLessThanOrEqual(30000)
    })

    it('should add jitter', () => {
      const delays = Array.from({ length: 10 }, () => getRetryDelay(1, 1000))
      const unique = new Set(delays)
      expect(unique.size).toBeGreaterThan(1) // jitter should vary
    })
  })

  describe('validateApiResponse', () => {
    it('should not throw for valid response', () => {
      expect(() => validateApiResponse({ data: 'test' })).not.toThrow()
    })

    it('should throw for empty response', () => {
      expect(() => validateApiResponse(null)).toThrow()
    })

    it('should throw for undefined response', () => {
      expect(() => validateApiResponse(undefined)).toThrow()
    })
  })
})
