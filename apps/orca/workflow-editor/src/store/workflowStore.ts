import { create } from 'zustand'
import { Node, Edge } from '@xyflow/react'

export interface WorkflowNode extends Node {
  data: {
    label: string
    type: string
    parameters?: Record<string, any>
  }
}

export interface WorkflowEdge extends Edge {
}

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

interface ExecutionLog {
  timestamp?: string
  nodeId?: string
  node_id?: string
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'error'
  message?: string
  node_name?: string
  error?: string
  execution_id?: string
  workflow_id?: string
  data?: any
  [key: string]: any
}

interface WorkflowStore {
  workflow: Workflow | null
  selectedNodeId: string | null
  isRunning: boolean
  executionLogs: ExecutionLog[]
  currentExecutionId: string | null
  history: Workflow[]
  future: Workflow[]

  // Actions
  setWorkflow: (workflow: Workflow | null) => void
  selectNode: (nodeId: string | null) => void
  setSelectedNodeId: (nodeId: string | null) => void
  addNode: (node: WorkflowNode) => void
  updateNode: (nodeId: string, data: Partial<WorkflowNode>) => void
  deleteNode: (nodeId: string) => void
  addEdge: (edge: WorkflowEdge) => void
  deleteEdge: (edgeId: string) => void
  setRunning: (running: boolean) => void
  addExecutionLog: (log: ExecutionLog) => void
  clearExecutionLogs: () => void
  setCurrentExecutionId: (id: string | null) => void
  pushHistory: () => void
  undo: () => void
  redo: () => void
}

export const useWorkflowStore = create<WorkflowStore>((set) => ({
  workflow: null,
  selectedNodeId: null,
  isRunning: false,
  executionLogs: [],
  currentExecutionId: null,
  history: [],
  future: [],

  setWorkflow: (workflow) => set({ workflow, history: [], future: [] }),

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),

  pushHistory: () =>
    set((state) => {
      if (!state.workflow) return state
      const newHistory = [...state.history, JSON.parse(JSON.stringify(state.workflow))]
      return {
        history: newHistory.slice(-20),
        future: [],
      }
    }),

  undo: () =>
    set((state) => {
      if (state.history.length === 0) return state
      const newHistory = [...state.history]
      const workflowToRestore = newHistory.pop()
      const newFuture = state.workflow ? [...state.future, state.workflow] : state.future
      return {
        workflow: workflowToRestore || null,
        history: newHistory,
        future: newFuture,
      }
    }),

  redo: () =>
    set((state) => {
      if (state.future.length === 0) return state
      const newFuture = [...state.future]
      const workflowToRestore = newFuture.pop()
      const newHistory = state.workflow ? [...state.history, state.workflow] : state.history
      return {
        workflow: workflowToRestore || null,
        history: newHistory,
        future: newFuture,
      }
    }),

  addNode: (node) =>
    set((state) => {
      if (!state.workflow) return state
      return {
        workflow: {
          ...state.workflow,
          nodes: [...state.workflow.nodes, node],
          updatedAt: new Date().toISOString(),
        },
        future: [],
      }
    }),

  updateNode: (nodeId, data) =>
    set((state) => {
      if (!state.workflow) return state
      return {
        workflow: {
          ...state.workflow,
          nodes: state.workflow.nodes.map((n) =>
            n.id === nodeId ? { ...n, ...data } : n
          ),
          updatedAt: new Date().toISOString(),
        },
        future: [],
      }
    }),

  deleteNode: (nodeId) =>
    set((state) => {
      if (!state.workflow) return state
      return {
        workflow: {
          ...state.workflow,
          nodes: state.workflow.nodes.filter((n) => n.id !== nodeId),
          edges: state.workflow.edges.filter(
            (e) => e.source !== nodeId && e.target !== nodeId
          ),
          updatedAt: new Date().toISOString(),
        },
        selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
        future: [],
      }
    }),

  addEdge: (edge) =>
    set((state) => {
      if (!state.workflow) return state
      const exists = state.workflow.edges.some(
        (e) => e.source === edge.source && e.target === edge.target
      )
      if (exists) return state
      return {
        workflow: {
          ...state.workflow,
          edges: [...state.workflow.edges, edge],
          updatedAt: new Date().toISOString(),
        },
        future: [],
      }
    }),

  deleteEdge: (edgeId) =>
    set((state) => {
      if (!state.workflow) return state
      return {
        workflow: {
          ...state.workflow,
          edges: state.workflow.edges.filter((e) => e.id !== edgeId),
          updatedAt: new Date().toISOString(),
        },
        future: [],
      }
    }),

  setRunning: (running) => set({ isRunning: running }),

  addExecutionLog: (log) =>
    set((state) => ({
      executionLogs: [...state.executionLogs, log],
    })),

  clearExecutionLogs: () => set({ executionLogs: [] }),

  setCurrentExecutionId: (id) => set({ currentExecutionId: id }),
}))
