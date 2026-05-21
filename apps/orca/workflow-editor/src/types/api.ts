/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  data?: T
  error?: {
    message: string
    code: string
    details?: any
  }
  status: 'success' | 'error'
  timestamp: string
}

/**
 * Paginated API response
 */
export interface ApiPaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number
    count: number
    offset: number
    limit: number
  }
}

/**
 * API Workflow (from backend)
 */
export interface ApiWorkflow {
  id: string
  name: string
  active: boolean
  nodes: any[]
  connections: Record<string, any>
  settings: Record<string, any>
  createdAt: string
  updatedAt: string
  orca_meta?: Record<string, any>
}

/**
 * API Node Type
 */
export interface ApiNodeType {
  type: string
  label: string
  color?: string
  icon?: string
  description?: string
  inputs: number
  outputs: number
  [key: string]: any
}

/**
 * API Execution Result
 */
export interface ApiExecutionResult {
  executionId: string
  workflowId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  startTime: string
  endTime?: string
  logs: any[]
  output?: any
  error?: string
}
