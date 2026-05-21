import { isRetryableError, getRetryDelay, logError } from './errorHandler'

/**
 * Retry options
 */
export interface RetryOptions {
  maxRetries?: number
  baseDelayMs?: number
  onRetry?: (attempt: number, error: Error) => void
}

/**
 * Retry a function with exponential backoff
 * Returns the result of the function on success
 * Throws the last error if all retries fail
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3
  const baseDelayMs = options.baseDelayMs ?? 1000
  const onRetry = options.onRetry

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Check if error is retryable
      if (!isRetryableError(error)) {
        throw lastError
      }

      // If this was the last attempt, throw
      if (attempt === maxRetries) {
        throw lastError
      }

      // Calculate delay and wait
      const delayMs = getRetryDelay(attempt, baseDelayMs)

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt, lastError)
      }

      // Log retry attempt in development
      const isDev = typeof process !== 'undefined' ? process.env.NODE_ENV === 'development' : true
      if (isDev) {
        logError(lastError, `RETRY_ATTEMPT_${attempt}`)
      }

      // Wait before retrying
      await sleep(delayMs)
    }
  }

  throw lastError || new Error('Unknown error in retry logic')
}

/**
 * Helper to sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retry with timeout
 * Useful for API calls that might hang
 */
export async function withRetryAndTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number = 30000,
  retryOptions: RetryOptions = {}
): Promise<T> {
  return withRetry(
    () => Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs)
      ),
    ]),
    retryOptions
  )
}
