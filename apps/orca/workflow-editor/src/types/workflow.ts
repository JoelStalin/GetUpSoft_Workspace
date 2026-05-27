import { Node, Edge } from '@xyflow/react'

/**
 * Discriminated union for node execution status
 */
export type NodeStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped'

/**
 * Extended node data with strict typing
 */
export interface NodeData {
  readonly label: string
  readonly type: string
  readonly color?: string
  readonly status?: NodeStatus
  readonly parameters?: Record<string, unknown>
  readonly inputs?: Record<string, unknown>
  readonly outputs?: Record<string, unknown>
  readonly metadata?: NodeMetadata
  readonly [key: string]: unknown
}

/**
 * Node metadata for tracking and debugging
 */
export interface NodeMetadata {
  readonly createdAt: string
  readonly updatedAt: string
  readonly version: number
  readonly author?: string
  readonly tags?: readonly string[]
}

/**
 * Extended Edge with optional data payload
 */
export interface EdgeData {
  readonly label?: string
  readonly type?: string
  readonly condition?: string
  readonly metadata?: Record<string, unknown>
  readonly [key: string]: unknown
}

/**
 * Extended Node type with ORCA-specific data
 */
export interface WorkflowNode extends Node {
  readonly data: NodeData
}

/**
 * Workflow Edge - extends ReactFlow edge with optional data
 */
export interface WorkflowEdge extends Edge {
  readonly data?: EdgeData
}

/**
 * Workflow metadata
 */
export interface WorkflowMetadata {
  readonly version: number
  readonly createdAt: string
  readonly updatedAt: string
  readonly author?: string
  readonly description?: string
  readonly tags?: readonly string[]
  readonly [key: string]: unknown
}

/**
 * Complete Workflow structure with strict typing
 */
export interface Workflow {
  readonly id: string
  readonly name: string
  readonly active: boolean
  readonly nodes: readonly WorkflowNode[]
  readonly edges: readonly WorkflowEdge[]
  readonly settings?: Record<string, unknown>
  readonly metadata?: WorkflowMetadata
  readonly createdAt: string
  readonly updatedAt: string
  readonly orca_meta?: Record<string, unknown>
}

/**
 * Mutable workflow for editing operations
 */
export interface MutableWorkflow extends Omit<Workflow, 'nodes' | 'edges'> {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

/**
 * Workflow store state
 */
export interface WorkflowState {
  // Core workflow data
  readonly workflow: Workflow | null
  readonly selectedNodeId: string | null
  readonly selectedEdgeId: string | null

  // History stacks for undo/redo
  readonly history: readonly Workflow[]
  readonly historyIndex: number

  // UI state
  readonly isLoading: boolean
  readonly error: string | null
  readonly isDirty: boolean
}

/**
 * Factory function to create a new node
 */
export function createWorkflowNode(
  id: string,
  label: string,
  type: string,
  position: { x: number; y: number },
  data?: Partial<NodeData>
): WorkflowNode {
  return {
    id,
    data: {
      label,
      type,
      status: 'pending',
      ...data,
    },
    position,
  }
}

/**
 * Factory function to create a new workflow
 */
export function createWorkflow(
  id: string,
  name: string,
  nodes?: readonly WorkflowNode[],
  edges?: readonly WorkflowEdge[]
): Workflow {
  const now = new Date().toISOString()
  return {
    id,
    name,
    active: false,
    nodes: nodes || [],
    edges: edges || [],
    createdAt: now,
    updatedAt: now,
    metadata: {
      version: 1,
      createdAt: now,
      updatedAt: now,
    },
  }
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
    (n.data as any)?.label !== undefined &&
    (n.data as any)?.type !== undefined &&
    typeof n.position === 'object'
  )
}

/**
 * Type guard to check if object is a WorkflowEdge
 */
export function isWorkflowEdge(obj: unknown): obj is WorkflowEdge {
  if (!obj || typeof obj !== 'object') return false
  const e = obj as Record<string, unknown>
  return (
    typeof e.id === 'string' &&
    typeof e.source === 'string' &&
    typeof e.target === 'string'
  )
}

/**
 * Type guard for NodeStatus
 */
export function isNodeStatus(value: unknown): value is NodeStatus {
  return ['pending', 'running', 'completed', 'failed', 'skipped'].includes(value as string)
}
