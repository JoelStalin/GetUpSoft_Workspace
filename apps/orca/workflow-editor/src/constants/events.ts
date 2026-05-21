/**
 * Execution event type constants
 */
export const EXECUTION_EVENTS = {
  START: 'execution-start',
  NODE_START: 'execution-node-start',
  NODE_COMPLETE: 'execution-node-complete',
  NODE_ERROR: 'execution-node-error',
  COMPLETE: 'execution-complete',
  FAILED: 'execution-failed',
  CANCELLED: 'execution-cancelled',
} as const

/**
 * Workflow action type constants
 */
export const WORKFLOW_ACTIONS = {
  SET_WORKFLOW: 'SET_WORKFLOW',
  ADD_NODE: 'ADD_NODE',
  DELETE_NODE: 'DELETE_NODE',
  UPDATE_NODE: 'UPDATE_NODE',
  SELECT_NODE: 'SELECT_NODE',
  ADD_EDGE: 'ADD_EDGE',
  DELETE_EDGE: 'DELETE_EDGE',
  PUSH_HISTORY: 'PUSH_HISTORY',
  UNDO: 'UNDO',
  REDO: 'REDO',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING',
} as const

/**
 * Execution action constants
 */
export const EXECUTION_ACTIONS = {
  SET_LOGS: 'SET_LOGS',
  ADD_LOG: 'ADD_LOG',
  UPDATE_LOG: 'UPDATE_LOG',
  CLEAR_LOGS: 'CLEAR_LOGS',
  SET_CURRENT_EXECUTION: 'SET_CURRENT_EXECUTION',
  SET_IS_EXECUTING: 'SET_IS_EXECUTING',
} as const
