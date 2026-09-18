import {
  ApiError,
  NetworkError,
  TimeoutError,
  ValidationError,
  ExecutionError,
  ERROR_MESSAGES,
  ERROR_CODES,
} from '../constants/errors'

/**
 * Handle API errors and return user-friendly message
 */
export function handleApiError(error: unknown): {
  message: string
  code: string
  originalError: Error
} {
  if (error instanceof ApiError) {
    return {
      message: error.message || ERROR_MESSAGES.SERVER_ERROR,
      code: ERROR_CODES.SERVER_ERROR,
      originalError: error,
    }
  }

  if (error instanceof NetworkError) {
    return {
      message: ERROR_MESSAGES.NETWORK_ERROR,
      code: ERROR_CODES.NETWORK_ERROR,
      originalError: error,
    }
  }

  if (error instanceof TimeoutError) {
    return {
      message: ERROR_MESSAGES.TIMEOUT_ERROR,
      code: ERROR_CODES.TIMEOUT_ERROR,
      originalError: error,
    }
  }

  if (error instanceof ValidationError) {
    return {
      message: error.message || ERROR_MESSAGES.VALIDATION_ERROR,
      code: ERROR_CODES.VALIDATION_ERROR,
      originalError: error,
    }
  }

  if (error instanceof ExecutionError) {
    return {
      message: error.message || ERROR_MESSAGES.EXECUTION_ERROR,
      code: ERROR_CODES.EXECUTION_ERROR,
      originalError: error,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
      code: ERROR_CODES.UNKNOWN_ERROR,
      originalError: error,
    }
  }

  return {
    message: ERROR_MESSAGES.UNKNOWN_ERROR,
    code: ERROR_CODES.UNKNOWN_ERROR,
    originalError: new Error(String(error)),
  }
}

/**
 * Log error to console (development) or monitoring service (production)
 * PHASE 2+: Integrate with Sentry/DataDog for production error tracking
 * Deferred: Requires SDK setup, environment configuration, and error sampling strategy
 */
export function logError(error: Error, context?: string): void {
  const isDev = typeof process !== 'undefined' ? process.env.NODE_ENV === 'development' : true
  if (isDev) {
    console.error(
      `[${context || 'ERROR'}]`,
      error.name,
      error.message,
      error.stack
    )
  } else {
    // Phase 2+: Deferred error tracking integration
    // When implemented, send to monitoring service (Sentry, DataDog, etc)
    // Placeholder: Log to console for now (will be replaced with monitoring service call)
    console.error(
      `[PROD-${context || 'ERROR'}]`,
      error.name,
      error.message,
      'Error tracking SDK not yet configured - scheduled for infrastructure phase'
    )
  }
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof NetworkError) return true
  if (error instanceof TimeoutError) return true
  if (error instanceof ApiError && error.statusCode >= 500) return true
  if (error instanceof ApiError && error.statusCode === 429) return true // Rate limited
  return false
}

/**
 * Get retry delay in milliseconds (exponential backoff)
 */
export function getRetryDelay(attempt: number, baseDelayMs: number = 1000): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, etc. with jitter
  const exponentialDelay = baseDelayMs * Math.pow(2, attempt - 1)
  const jitter = Math.random() * 0.1 * exponentialDelay
  return Math.min(exponentialDelay + jitter, 30000) // Cap at 30s
}

/**
 * Validate API response
 */
export function validateApiResponse(response: any): void {
  if (!response) {
    throw new ValidationError('Invalid response: empty response')
  }

  // Add more validation as needed
}
