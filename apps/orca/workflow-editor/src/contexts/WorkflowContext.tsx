import React, { createContext, useCallback, useReducer } from 'react'
import { Workflow, WorkflowNode, WorkflowEdge, isWorkflow } from '../types/workflow'

/**
 * Workflow state for context
 */
export interface WorkflowContextState {
  workflow: Workflow | null
  selectedNodeId: string | null
  selectedEdgeId: string | null
  isDirty: boolean
  isLoading: boolean
  error: string | null
  history: readonly Workflow[]
  historyIndex: number
}

/**
 * Workflow context actions
 */
export type WorkflowAction =
  | { type: 'SET_WORKFLOW'; payload: Workflow }
  | { type: 'UPDATE_NODES'; payload: readonly WorkflowNode[] }
  | { type: 'UPDATE_EDGES'; payload: readonly WorkflowEdge[] }
  | { type: 'ADD_NODE'; payload: WorkflowNode }
  | { type: 'DELETE_NODE'; payload: string }
  | { type: 'ADD_EDGE'; payload: WorkflowEdge }
  | { type: 'DELETE_EDGE'; payload: string }
  | { type: 'SELECT_NODE'; payload: string | null }
  | { type: 'SELECT_EDGE'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'MARK_DIRTY' }
  | { type: 'MARK_CLEAN' }
  | { type: 'PUSH_HISTORY'; payload: Workflow }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET' }

/**
 * Workflow context value
 */
export interface WorkflowContextValue {
  state: WorkflowContextState
  dispatch: React.Dispatch<WorkflowAction>
  history: readonly Workflow[]
  future: readonly Workflow[]
  undo: () => void
  redo: () => void
}

/**
 * Create Workflow context
 */
export const WorkflowContext = createContext<WorkflowContextValue | undefined>(undefined)

/**
 * Initial state for workflow
 */
const initialState: WorkflowContextState = {
  workflow: null,
  selectedNodeId: null,
  selectedEdgeId: null,
  isDirty: false,
  isLoading: false,
  error: null,
  history: [],
  historyIndex: -1,
}

/**
 * Workflow reducer function
 */
function workflowReducer(state: WorkflowContextState, action: WorkflowAction): WorkflowContextState {
  switch (action.type) {
    case 'SET_WORKFLOW':
      return {
        ...state,
        workflow: action.payload,
        isDirty: false,
        error: null,
      }

    case 'UPDATE_NODES':
      if (!state.workflow) return state
      return {
        ...state,
        workflow: {
          ...state.workflow,
          nodes: action.payload,
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
      }

    case 'UPDATE_EDGES':
      if (!state.workflow) return state
      return {
        ...state,
        workflow: {
          ...state.workflow,
          edges: action.payload,
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
      }

    case 'ADD_NODE':
      if (!state.workflow) return state
      return {
        ...state,
        workflow: {
          ...state.workflow,
          nodes: [...state.workflow.nodes, action.payload],
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
      }

    case 'DELETE_NODE':
      if (!state.workflow) return state
      return {
        ...state,
        workflow: {
          ...state.workflow,
          nodes: state.workflow.nodes.filter((n) => n.id !== action.payload),
          edges: state.workflow.edges.filter(
            (e) => e.source !== action.payload && e.target !== action.payload
          ),
          updatedAt: new Date().toISOString(),
        },
        selectedNodeId: state.selectedNodeId === action.payload ? null : state.selectedNodeId,
        isDirty: true,
      }

    case 'ADD_EDGE':
      if (!state.workflow) return state
      return {
        ...state,
        workflow: {
          ...state.workflow,
          edges: [...state.workflow.edges, action.payload],
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
      }

    case 'DELETE_EDGE':
      if (!state.workflow) return state
      return {
        ...state,
        workflow: {
          ...state.workflow,
          edges: state.workflow.edges.filter((e) => e.id !== action.payload),
          updatedAt: new Date().toISOString(),
        },
        selectedEdgeId: state.selectedEdgeId === action.payload ? null : state.selectedEdgeId,
        isDirty: true,
      }

    case 'SELECT_NODE':
      return {
        ...state,
        selectedNodeId: action.payload,
        selectedEdgeId: null,
      }

    case 'SELECT_EDGE':
      return {
        ...state,
        selectedEdgeId: action.payload,
        selectedNodeId: null,
      }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      }

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      }

    case 'MARK_DIRTY':
      return {
        ...state,
        isDirty: true,
      }

    case 'MARK_CLEAN':
      return {
        ...state,
        isDirty: false,
      }

    case 'PUSH_HISTORY':
      return {
        ...state,
        history: [...state.history.slice(0, state.historyIndex + 1), action.payload],
        historyIndex: state.historyIndex + 1,
      }

    case 'UNDO':
      if (state.historyIndex <= 0) return state
      return {
        ...state,
        workflow: state.history[state.historyIndex - 1],
        historyIndex: state.historyIndex - 1,
      }

    case 'REDO':
      if (state.historyIndex >= state.history.length - 1) return state
      return {
        ...state,
        workflow: state.history[state.historyIndex + 1],
        historyIndex: state.historyIndex + 1,
      }

    case 'RESET':
      return initialState

    default:
      return state
  }
}

/**
 * Workflow Provider component
 */
export interface WorkflowProviderProps {
  children: React.ReactNode
  initialWorkflow?: Workflow
}

export function WorkflowProvider({ children, initialWorkflow }: WorkflowProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(
    workflowReducer,
    initialWorkflow ? { ...initialState, workflow: initialWorkflow } : initialState
  )

  const history = state.history
  const future = state.history.slice(state.historyIndex + 1)

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' })
  }, [])

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' })
  }, [])

  const value: WorkflowContextValue = {
    state,
    dispatch,
    history,
    future,
    undo,
    redo,
  }

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  )
}

/**
 * Hook to use Workflow context
 */
export function useWorkflowContext(): WorkflowContextValue {
  const context = React.useContext(WorkflowContext)
  if (!context) {
    throw new Error('useWorkflowContext must be used within WorkflowProvider')
  }
  return context
}
