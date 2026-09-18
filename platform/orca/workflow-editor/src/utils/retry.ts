/**
 * Retry options
 */
export interface RetryOptions {
  maxAttempts: number
  delayMs: number
  backoffMultiplier: number
  timeoutMs?: number
}

/**
 * Default retry options
 */
export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  timeoutMs: 30000,
}

export interface LegacyRetryOptions {
  maxRetries?: number
  baseDelayMs?: number
  onRetry?: (attempt: number, error: Error) => void
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  if (error?.name === 'NetworkError') return true
  if (error?.name === 'TimeoutError') return true
  if (error?.statusCode && error.statusCode >= 500) return true
  if (error?.statusCode === 429) return true
  return false
}

/**
 * Execute async function with retry logic
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options }
  let lastError: any
  let delayMs = opts.delayMs

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      if (opts.timeoutMs) {
        return await executeWithTimeout(fn(), opts.timeoutMs)
      }
      return await fn()
    } catch (error) {
      lastError = error
      if (!isRetryableError(error) || attempt === opts.maxAttempts) {
        throw error
      }

      await sleep(delayMs)
      delayMs *= opts.backoffMultiplier
    }
  }

  throw lastError
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: LegacyRetryOptions = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3
  const baseDelayMs = options.baseDelayMs ?? 1000
  let lastError: any

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (!isRetryableError(error) || attempt === maxRetries) {
        throw error
      }
      options.onRetry?.(attempt, error instanceof Error ? error : new Error(String(error)))
      await sleep(baseDelayMs * attempt)
    }
  }

  throw lastError
}

export async function withRetryAndTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs = DEFAULT_RETRY_OPTIONS.timeoutMs || 30000,
  options: LegacyRetryOptions = {}
): Promise<T> {
  return withRetry(() => executeWithTimeout(fn(), timeoutMs), options)
}

/**
 * Execute promise with timeout
 */
export function executeWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ])
}

/**
 * Sleep for specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Batch async operations with concurrency control
 */
export async function batchAsync<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number = 3
): Promise<R[]> {
  const results: R[] = []
  const queue = [...items]
  const executing: Promise<void>[] = []

  while (queue.length > 0 || executing.length > 0) {
    while (executing.length < concurrency && queue.length > 0) {
      const item = queue.shift()!
      const promise = fn(item).then((result) => {
        results.push(result)
      })
      executing.push(promise)
    }

    if (executing.length > 0) {
      await Promise.race(executing)
      executing.splice(
        executing.findIndex((p) => p.then(() => true, () => true)),
        1
      )
    }
  }

  return results
}
