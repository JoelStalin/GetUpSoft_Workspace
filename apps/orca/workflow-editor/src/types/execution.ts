/**
 * Discriminated union for execution event types
 */
export type ExecutionEventType =
  | 'execution-start'
  | 'execution-node-start'
  | 'execution-node-complete'
  | 'execution-node-error'
  | 'execution-complete'
  | 'execution-failed'
  | 'execution-cancelled'

/**
 * Discriminated union for execution status
 */
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

/**
 * Discriminated union for node execution status
 */
export type NodeExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped'

/**
 * Error information in execution context
 */
export interface ExecutionError {
  readonly message: string
  readonly code?: string
  readonly stack?: string
  readonly context?: Record<string, unknown>
}

/**
 * Single execution event from backend with strict typing
 */
export interface ExecutionEvent {
  readonly id: string
  readonly type: ExecutionEventType
  readonly workflowId: string
  readonly executionId: string
  readonly nodeId?: string
  readonly timestamp: string
  readonly data: Record<string, unknown>
  readonly error?: ExecutionError
  readonly metadata?: Record<string, unknown>
}

/**
 * Execution log for a single node
 */
export interface ExecutionLog {
  readonly nodeId: string
  readonly nodeName?: string
  readonly status: NodeExecutionStatus
  readonly output?: unknown
  readonly error?: ExecutionError
  readonly startTime?: string
  readonly endTime?: string
  readonly duration?: number
  readonly message?: string
  readonly metadata?: Record<string, unknown>
}

/**
 * Execution summary with comprehensive metrics
 */
export interface ExecutionSummary {
  readonly id: string
  readonly workflowId: string
  readonly status: ExecutionStatus
  readonly startTime: string
  readonly endTime?: string
  readonly duration?: number
  readonly totalNodes: number
  readonly completedNodes: number
  readonly failedNodes: number
  readonly skippedNodes: number
  readonly logs: readonly ExecutionLog[]
  readonly error?: ExecutionError
  readonly metadata?: Record<string, unknown>
}

/**
 * Execution state for tracking progress
 */
export interface ExecutionState {
  readonly executionId: string
  readonly workflowId: string
  readonly status: ExecutionStatus
  readonly currentNodeId?: string
  readonly progress: number // 0-100
  readonly startTime: string
  readonly estimatedEndTime?: string
  readonly logs: readonly ExecutionLog[]
  readonly errors: readonly ExecutionError[]
}

/**
 * Type guard for ExecutionEvent
 */
export function isExecutionEvent(obj: unknown): obj is ExecutionEvent {
  if (!obj || typeof obj !== 'object') return false
  const e = obj as Record<string, unknown>
  return (
    typeof e.id === 'string' &&
    typeof e.type === 'string' &&
    typeof e.workflowId === 'string' &&
    typeof e.timestamp === 'string' &&
    typeof e.executionId === 'string'
  )
}

/**
 * Type guard for ExecutionLog
 */
export function isExecutionLog(obj: unknown): obj is ExecutionLog {
  if (!obj || typeof obj !== 'object') return false
  const l = obj as Record<string, unknown>
  return (
    typeof l.nodeId === 'string' &&
    ['pending', 'running', 'completed', 'failed', 'skipped'].includes(l.status as string)
  )
}

/**
 * Type guard for ExecutionStatus
 */
export function isExecutionStatus(value: unknown): value is ExecutionStatus {
  return ['pending', 'running', 'completed', 'failed', 'cancelled'].includes(value as string)
}

/**
 * Type guard for ExecutionEventType
 */
export function isExecutionEventType(value: unknown): value is ExecutionEventType {
  const validTypes = [
    'execution-start',
    'execution-node-start',
    'execution-node-complete',
    'execution-node-error',
    'execution-complete',
    'execution-failed',
    'execution-cancelled',
  ]
  return validTypes.includes(value as string)
}

/**
 * Factory function to create an execution summary
 */
export function createExecutionSummary(
  id: string,
  workflowId: string,
  startTime: string,
  totalNodes: number
): ExecutionSummary {
  return {
    id,
    workflowId,
    status: 'pending',
    startTime,
    totalNodes,
    completedNodes: 0,
    failedNodes: 0,
    skippedNodes: 0,
    logs: [],
  }
}

/**
 * Factory function to create an execution log entry
 */
export function createExecutionLog(
  nodeId: string,
  status: NodeExecutionStatus,
  nodeName?: string
): ExecutionLog {
  return {
    nodeId,
    nodeName,
    status,
    startTime: new Date().toISOString(),
    metadata: {},
  }
}
