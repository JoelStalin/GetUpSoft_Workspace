import { Node, Edge } from '@xyflow/react'

/**
 * Extended Node type with ORCA-specific data
 */
export interface WorkflowNode extends Node {
  data: {
    label: string
    type: string
    color?: string
    status?: 'pending' | 'running' | 'completed' | 'failed'
    parameters?: Record<string, any>
    [key: string]: any
  }
}

/**
 * Workflow Edge - extends ReactFlow edge
 */
export interface WorkflowEdge extends Edge {
  [key: string]: any
}

/**
 * Complete Workflow structure
 */
export interface Workflow {
  id: string
  name: string
  active: boolean
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  settings?: Record<string, any>
  createdAt: string
  updatedAt: string
  orca_meta?: Record<string, any>
}

/**
 * Workflow store state
 */
export interface WorkflowState {
  // Core workflow data
  workflow: Workflow | null
  selectedNodeId: string | null
  selectedEdgeId: string | null

  // History stacks for undo/redo
  history: Workflow[]
  future: Workflow[]

  // UI state
  isLoading: boolean
  error: string | null
}

/**
 * Type guard to check if object is a Workflow
 */
export function isWorkflow(obj: unknown): obj is Workflow {
  if (!obj || typeof obj !== 'object') return false
  const w = obj as Record<string, unknown>
  return (
    typeof w.id === 'string' &&
    typeof w.name === 'string' &&
    typeof w.active === 'boolean' &&
    Array.isArray(w.nodes) &&
    Array.isArray(w.edges) &&
    typeof w.createdAt === 'string' &&
    typeof w.updatedAt === 'string'
  )
}

/**
 * Type guard to check if object is a WorkflowNode
 */
export function isWorkflowNode(obj: unknown): obj is WorkflowNode {
  if (!obj || typeof obj !== 'object') return false
  const n = obj as Record<string, unknown>
  return (
    typeof n.id === 'string' &&
    typeof n.data === 'object' &&
    (n.data as any).label !== undefined &&
    (n.data as any).type !== undefined
  )
}
