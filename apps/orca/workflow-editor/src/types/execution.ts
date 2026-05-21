/**
 * Execution event types
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
 * Single execution event from backend
 */
export interface ExecutionEvent {
  id: string
  type: ExecutionEventType
  workflowId: string
  nodeId?: string
  timestamp: string
  data: Record<string, any>
  error?: {
    message: string
    code?: string
    stack?: string
  }
}

/**
 * Execution log for a single node
 */
export interface ExecutionLog {
  nodeId: string
  node_id?: string // Compatibility with backend
  status: 'pending' | 'running' | 'completed' | 'failed'
  output?: any
  error?: string
  startTime?: string
  endTime?: string
  duration?: number
  message?: string
  node_name?: string
  execution_id?: string
  workflow_id?: string
  data?: any
  [key: string]: any
}

/**
 * Execution summary
 */
export interface ExecutionSummary {
  id: string
  workflowId: string
  startTime: string
  endTime?: string
  duration?: number
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  totalNodes: number
  completedNodes: number
  failedNodes: number
  logs: ExecutionLog[]
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
    typeof e.timestamp === 'string'
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
    ['pending', 'running', 'completed', 'failed', 'error'].includes(l.status as string)
  )
}
