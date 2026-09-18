import { describe, it, expect, vi, beforeEach } from 'vitest'
import { withRetry, withRetryAndTimeout } from './retry'
import { NetworkError, TimeoutError, ValidationError, ApiError } from '@/constants/errors'

describe('retry', () => {
  describe('withRetry', () => {
    it('should succeed on first try', async () => {
      const fn = vi.fn().mockResolvedValue('success')
      const result = await withRetry(fn)
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should retry on retryable error', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new NetworkError('Connection failed'))
        .mockResolvedValueOnce('success')
      const result = await withRetry(fn, { maxRetries: 3 })
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('should not retry on non-retryable error', async () => {
      const fn = vi.fn().mockRejectedValue(new ValidationError('Invalid input'))
      await expect(withRetry(fn, { maxRetries: 3 })).rejects.toThrow(ValidationError)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should retry up to maxRetries', async () => {
      const fn = vi.fn().mockRejectedValue(new NetworkError('Connection failed'))
      await expect(withRetry(fn, { maxRetries: 3 })).rejects.toThrow()
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('should call onRetry callback', async () => {
      const onRetry = vi.fn()
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new NetworkError('Connection failed'))
        .mockResolvedValueOnce('success')
      await withRetry(fn, { maxRetries: 3, onRetry })
      expect(onRetry).toHaveBeenCalledTimes(1)
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error))
    })

    it('should use custom baseDelayMs', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new NetworkError('Connection failed'))
        .mockResolvedValueOnce('success')

      const start = Date.now()
      await withRetry(fn, { maxRetries: 2, baseDelayMs: 100 })
      const duration = Date.now() - start

      expect(duration).toBeGreaterThanOrEqual(100)
    })

    it('should throw TimeoutError for timeout', async () => {
      const fn = vi.fn().mockRejectedValue(new TimeoutError('Timeout', 5000))
      await expect(withRetry(fn, { maxRetries: 3 })).rejects.toThrow()
    })

    it('should handle multiple retries and succeed', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new NetworkError('Fail 1'))
        .mockRejectedValueOnce(new NetworkError('Fail 2'))
        .mockResolvedValueOnce('success')
      const result = await withRetry(fn, { maxRetries: 5 })
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(3)
    })
  })

  describe('withRetryAndTimeout', () => {
    it('should succeed with timeout buffer', async () => {
      const fn = vi.fn().mockResolvedValue('success')
      const result = await withRetryAndTimeout(fn, 5000)
      expect(result).toBe('success')
    })

    it('should timeout on slow function', async () => {
      const fn = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('slow'), 10000))
      )
      await expect(withRetryAndTimeout(fn, 1000, { maxRetries: 1 })).rejects.toThrow()
    })

    it('should combine timeout and retry', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new NetworkError('Connection failed'))
        .mockResolvedValueOnce('success')
      const result = await withRetryAndTimeout(fn, 5000, { maxRetries: 3 })
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('should use default timeout', async () => {
      const fn = vi.fn().mockResolvedValue('success')
      const result = await withRetryAndTimeout(fn)
      expect(result).toBe('success')
    })

    it('should handle API error with timeout', async () => {
      const fn = vi.fn().mockRejectedValue(new ApiError('Server error', 503))
      await expect(withRetryAndTimeout(fn, 5000, { maxRetries: 2 })).rejects.toThrow(ApiError)
    })
  })
})
