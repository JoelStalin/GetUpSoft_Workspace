import { ExecutionError, ApiError, NetworkError, TimeoutError, ValidationError } from './errors'

/**
 * Extended error types with context
 */
export type WorkflowEditorError =
  | ValidationError
  | ApiError
  | NetworkError
  | TimeoutError
  | ExecutionError
  | WorkflowValidationError
  | NodeExecutionError
  | ConnectionValidationError
  | DataSourceError
  | FileOperationError

/**
 * Workflow validation error (invalid structure)
 */
export class WorkflowValidationError extends Error {
  constructor(
    message: string,
    public workflowId?: string,
    public issues?: string[]
  ) {
    super(message)
    this.name = 'WorkflowValidationError'
    Object.setPrototypeOf(this, WorkflowValidationError.prototype)
  }
}

/**
 * Node execution error with context
 */
export class NodeExecutionError extends Error {
  constructor(
    message: string,
    public nodeId: string,
    public executionId: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'NodeExecutionError'
    Object.setPrototypeOf(this, NodeExecutionError.prototype)
  }
}

/**
 * Connection validation error
 */
export class ConnectionValidationError extends Error {
  constructor(
    message: string,
    public sourceNodeId?: string,
    public targetNodeId?: string
  ) {
    super(message)
    this.name = 'ConnectionValidationError'
    Object.setPrototypeOf(this, ConnectionValidationError.prototype)
  }
}

/**
 * Data source connection error
 */
export class DataSourceError extends Error {
  constructor(
    message: string,
    public sourceId?: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'DataSourceError'
    Object.setPrototypeOf(this, DataSourceError.prototype)
  }
}

/**
 * File operation error (import/export)
 */
export class FileOperationError extends Error {
  constructor(
    message: string,
    public operation: 'import' | 'export',
    public fileName?: string
  ) {
    super(message)
    this.name = 'FileOperationError'
    Object.setPrototypeOf(this, FileOperationError.prototype)
  }
}

/**
 * Error type guards
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError
}

export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof TimeoutError
}

export function isExecutionError(error: unknown): error is ExecutionError {
  return error instanceof ExecutionError
}

export function isWorkflowValidationError(error: unknown): error is WorkflowValidationError {
  return error instanceof WorkflowValidationError
}

export function isNodeExecutionError(error: unknown): error is NodeExecutionError {
  return error instanceof NodeExecutionError
}

export function isConnectionValidationError(error: unknown): error is ConnectionValidationError {
  return error instanceof ConnectionValidationError
}

export function isDataSourceError(error: unknown): error is DataSourceError {
  return error instanceof DataSourceError
}

export function isFileOperationError(error: unknown): error is FileOperationError {
  return error instanceof FileOperationError
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

/**
 * Get error code for reporting
 */
export function getErrorCode(error: unknown): string {
  if (error instanceof ValidationError) return 'VALIDATION_ERROR'
  if (error instanceof ApiError) return `API_ERROR_${error.statusCode}`
  if (error instanceof NetworkError) return 'NETWORK_ERROR'
  if (error instanceof TimeoutError) return 'TIMEOUT_ERROR'
  if (error instanceof ExecutionError) return 'EXECUTION_ERROR'
  if (error instanceof WorkflowValidationError) return 'WORKFLOW_VALIDATION_ERROR'
  if (error instanceof NodeExecutionError) return 'NODE_EXECUTION_ERROR'
  if (error instanceof ConnectionValidationError) return 'CONNECTION_VALIDATION_ERROR'
  if (error instanceof DataSourceError) return 'DATA_SOURCE_ERROR'
  if (error instanceof FileOperationError) return `FILE_OPERATION_${error.operation}`
  return 'UNKNOWN_ERROR'
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error: unknown): boolean {
  return (
    error instanceof NetworkError ||
    error instanceof TimeoutError ||
    (error instanceof ApiError && (error.statusCode >= 500 || error.statusCode === 429)) ||
    error instanceof DataSourceError
  )
}
