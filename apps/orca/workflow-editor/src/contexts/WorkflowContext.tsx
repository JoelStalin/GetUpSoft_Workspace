'use client'

import { createContext, useReducer, ReactNode, useCallback } from 'react'
import { Workflow, WorkflowState, WorkflowNode } from '../types/workflow'
import { WORKFLOW_ACTIONS } from '../constants/events'
import { Edge } from '@xyflow/react'

/**
 * Workflow Context Type
 */
export interface WorkflowContextType extends WorkflowState {
  dispatch: (action: WorkflowAction) => void
}

/**
 * Workflow Action Types
 */
export type WorkflowAction =
  | { type: 'SET_WORKFLOW'; payload: Workflow }
  | { type: 'ADD_NODE'; payload: WorkflowNode }
  | { type: 'DELETE_NODE'; payload: string }
  | { type: 'UPDATE_NODE'; payload: { id: string; data: any } }
  | { type: 'SELECT_NODE'; payload: string | null }
  | { type: 'ADD_EDGE'; payload: Edge }
  | { type: 'DELETE_EDGE'; payload: string }
  | { type: 'PUSH_HISTORY' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean }

/**
 * Initial state
 */
const initialState: WorkflowState = {
  workflow: null,
  selectedNodeId: null,
  selectedEdgeId: null,
  history: [],
  future: [],
  isLoading: false,
  error: null,
}

/**
 * Create Workflow Context
 */
export const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined)

/**
 * Reducer function
 */
function workflowReducer(state: WorkflowState, action: WorkflowAction): WorkflowState {
  switch (action.type) {
    case WORKFLOW_ACTIONS.SET_WORKFLOW:
      return {
        ...state,
        workflow: action.payload,
        history: [],
        future: [],
        selectedNodeId: null,
      }

    case WORKFLOW_ACTIONS.ADD_NODE:
      if (!state.workflow) return state
      return {
        ...state,
        workflow: {
          ...state.workflow,
          nodes: [...state.workflow.nodes, action.payload],
          updatedAt: new Date().toISOString(),
        },
        future: [],
      }

    case WORKFLOW_ACTIONS.DELETE_NODE: {
      if (!state.workflow) return state
      const nodeId = action.payload
      return {
        ...state,
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
    }

    case WORKFLOW_ACTIONS.UPDATE_NODE:
      if (!state.workflow) return state
      return {
        ...state,
        workflow: {
          ...state.workflow,
          nodes: state.workflow.nodes.map((n) =>
            n.id === action.payload.id ? { ...n, ...action.payload.data } : n
          ),
          updatedAt: new Date().toISOString(),
        },
        future: [],
      }

    case WORKFLOW_ACTIONS.SELECT_NODE:
      return {
        ...state,
        selectedNodeId: action.payload,
      }

    case WORKFLOW_ACTIONS.ADD_EDGE:
      if (!state.workflow) return state
      // Check if edge already exists
      const edgeExists = state.workflow.edges.some(
        (e) => e.source === action.payload.source && e.target === action.payload.target
      )
      if (edgeExists) return state

      return {
        ...state,
        workflow: {
          ...state.workflow,
          edges: [...state.workflow.edges, action.payload],
          updatedAt: new Date().toISOString(),
        },
        future: [],
      }

    case WORKFLOW_ACTIONS.DELETE_EDGE:
      if (!state.workflow) return state
      return {
        ...state,
        workflow: {
          ...state.workflow,
          edges: state.workflow.edges.filter((e) => e.id !== action.payload),
          updatedAt: new Date().toISOString(),
        },
        future: [],
      }

    case WORKFLOW_ACTIONS.PUSH_HISTORY:
      if (!state.workflow) return state
      // Keep only last 20 history entries
      const newHistory = [
        ...state.history,
        JSON.parse(JSON.stringify(state.workflow)),
      ].slice(-20)

      return {
        ...state,
        history: newHistory,
        future: [],
      }

    case WORKFLOW_ACTIONS.UNDO: {
      if (state.history.length === 0 || !state.workflow) return state
      const newHistory = [...state.history]
      const workflowToRestore = newHistory.pop()
      const newFuture = [...state.future, JSON.parse(JSON.stringify(state.workflow))]

      return {
        ...state,
        workflow: workflowToRestore || null,
        history: newHistory,
        future: newFuture,
      }
    }

    case WORKFLOW_ACTIONS.REDO: {
      if (state.future.length === 0 || !state.workflow) return state
      const newFuture = [...state.future]
      const workflowToRestore = newFuture.pop()
      const newHistory = [...state.history, JSON.parse(JSON.stringify(state.workflow))]

      return {
        ...state,
        workflow: workflowToRestore || null,
        history: newHistory,
        future: newFuture,
      }
    }

    case WORKFLOW_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      }

    case WORKFLOW_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }

    case WORKFLOW_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      }

    default:
      return state
  }
}

/**
 * Workflow Provider Component
 */
export interface WorkflowProviderProps {
  children: ReactNode
  initialWorkflow?: Workflow | null
}

export function WorkflowProvider({ children, initialWorkflow }: WorkflowProviderProps) {
  const [state, dispatch] = useReducer(
    workflowReducer,
    initialWorkflow
      ? {
          ...initialState,
          workflow: initialWorkflow,
        }
      : initialState
  )

  const value: WorkflowContextType = {
    ...state,
    dispatch,
  }

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  )
}

