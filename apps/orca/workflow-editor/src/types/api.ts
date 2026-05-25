/**
 * API response status discriminated union
 */
export type ApiStatus = 'success' | 'error'

/**
 * Generic API response wrapper with strict typing
 */
export interface ApiResponse<T = unknown, E = unknown> {
  readonly data?: T
  readonly error?: ApiError<E>
  readonly status: ApiStatus
  readonly timestamp: string
}

/**
 * API error details
 */
export interface ApiError<T = unknown> {
  readonly message: string
  readonly code: string
  readonly details?: T
  readonly timestamp?: string
}

/**
 * Paginated API response with metadata
 */
export interface ApiPaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  readonly pagination: PaginationMetadata
}

/**
 * Pagination metadata
 */
export interface PaginationMetadata {
  readonly total: number
  readonly count: number
  readonly offset: number
  readonly limit: number
  readonly hasMore: boolean
}

/**
 * API Workflow (from backend)
 */
export interface ApiWorkflow {
  readonly id: string
  readonly name: string
  readonly active: boolean
  readonly nodes: readonly ApiNode[]
  readonly connections: Record<string, unknown>
  readonly settings: Record<string, unknown>
  readonly createdAt: string
  readonly updatedAt: string
  readonly orca_meta?: Record<string, unknown>
}

/**
 * API Node with connection info
 */
export interface ApiNode {
  readonly id: string
  readonly type: string
  readonly label: string
  readonly position?: { readonly x: number; readonly y: number }
  readonly data?: Record<string, unknown>
  readonly inputs?: readonly string[]
  readonly outputs?: readonly string[]
}

/**
 * API Node Type definition
 */
export interface ApiNodeType {
  readonly type: string
  readonly label: string
  readonly color?: string
  readonly icon?: string
  readonly description?: string
  readonly inputs: number
  readonly outputs: number
  readonly [key: string]: unknown
}

/**
 * Discriminated union for execution status
 */
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

/**
 * API Execution Result with detailed tracking
 */
export interface ApiExecutionResult {
  readonly executionId: string
  readonly workflowId: string
  readonly status: ExecutionStatus
  readonly startTime: string
  readonly endTime?: string
  readonly duration?: number
  readonly logs: readonly ExecutionLog[]
  readonly output?: unknown
  readonly error?: ApiError
}

/**
 * Execution log entry
 */
export interface ExecutionLog {
  readonly nodeId: string
  readonly nodeName?: string
  readonly status: 'pending' | 'running' | 'completed' | 'failed'
  readonly startTime?: string
  readonly endTime?: string
  readonly duration?: number
  readonly message?: string
  readonly output?: unknown
  readonly error?: string
  readonly metadata?: Record<string, unknown>
}

/**
 * Type guard for ApiResponse success
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiResponse<T> & { data: T } {
  return response.status === 'success' && response.data !== undefined
}

/**
 * Type guard for ApiResponse error
 */
export function isApiError<T>(response: ApiResponse<T>): response is ApiResponse<T> & { error: ApiError } {
  return response.status === 'error' && response.error !== undefined
}

/**
 * Type guard for ApiPaginatedResponse
 */
export function isApiPaginatedResponse<T>(response: unknown): response is ApiPaginatedResponse<T> {
  if (!response || typeof response !== 'object') return false
  const r = response as Record<string, unknown>
  return (
    'pagination' in r &&
    typeof r.pagination === 'object' &&
    'total' in (r.pagination as object)
  )
}

/**
 * Factory function to create a success response
 */
export function createApiSuccess<T>(data: T, timestamp?: string): ApiResponse<T> {
  return {
    data,
    status: 'success',
    timestamp: timestamp || new Date().toISOString(),
  }
}

/**
 * Factory function to create an error response
 */
export function createApiError<E>(
  message: string,
  code: string,
  details?: E,
  timestamp?: string
): ApiResponse<unknown, E> {
  return {
    error: {
      message,
      code,
      details,
      timestamp: timestamp || new Date().toISOString(),
    },
    status: 'error',
    timestamp: timestamp || new Date().toISOString(),
  }
}
