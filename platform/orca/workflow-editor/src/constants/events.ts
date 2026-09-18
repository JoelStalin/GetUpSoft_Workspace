/**
 * Workflow event types
 */
export const WORKFLOW_EVENTS = {
  CREATED: 'workflow:created',
  UPDATED: 'workflow:updated',
  DELETED: 'workflow:deleted',
  ACTIVATED: 'workflow:activated',
  DEACTIVATED: 'workflow:deactivated',
  PUBLISHED: 'workflow:published',
} as const

export const WORKFLOW_ACTIONS = {
  PUSH_HISTORY: 'PUSH_HISTORY',
  UNDO: 'UNDO',
  REDO: 'REDO',
} as const

/**
 * Node event types
 */
export const NODE_EVENTS = {
  ADDED: 'node:added',
  REMOVED: 'node:removed',
  UPDATED: 'node:updated',
  SELECTED: 'node:selected',
  DESELECTED: 'node:deselected',
  EXECUTED: 'node:executed',
  FAILED: 'node:failed',
  SKIPPED: 'node:skipped',
} as const

/**
 * Connection event types
 */
export const CONNECTION_EVENTS = {
  CREATED: 'connection:created',
  REMOVED: 'connection:removed',
  VALIDATED: 'connection:validated',
  INVALID: 'connection:invalid',
} as const

/**
 * Execution event types
 */
export const EXECUTION_EVENTS = {
  STARTED: 'execution:started',
  NODE_START: 'execution:node-start',
  NODE_COMPLETE: 'execution:node-complete',
  NODE_ERROR: 'execution:node-error',
  PROGRESS: 'execution:progress',
  COMPLETED: 'execution:completed',
  FAILED: 'execution:failed',
  CANCELLED: 'execution:cancelled',
} as const

export const EXECUTION_ACTIONS = {
  ADD_LOG: 'ADD_LOG',
  UPDATE_LOG: 'UPDATE_LOG',
  SET_LOGS: 'SET_LOGS',
  CLEAR_LOGS: 'CLEAR_LOGS',
  SET_CURRENT_EXECUTION: 'SET_CURRENT_EXECUTION',
  SET_IS_EXECUTING: 'SET_IS_EXECUTING',
} as const

/**
 * UI event types
 */
export const UI_EVENTS = {
  PANEL_OPENED: 'ui:panel-opened',
  PANEL_CLOSED: 'ui:panel-closed',
  MODE_CHANGED: 'ui:mode-changed',
  ZOOM_CHANGED: 'ui:zoom-changed',
  SEARCH_OPENED: 'ui:search-opened',
  SEARCH_CLOSED: 'ui:search-closed',
} as const

/**
 * All event types union
 */
export type EventType =
  | (typeof WORKFLOW_EVENTS)[keyof typeof WORKFLOW_EVENTS]
  | (typeof NODE_EVENTS)[keyof typeof NODE_EVENTS]
  | (typeof CONNECTION_EVENTS)[keyof typeof CONNECTION_EVENTS]
  | (typeof EXECUTION_EVENTS)[keyof typeof EXECUTION_EVENTS]
  | (typeof UI_EVENTS)[keyof typeof UI_EVENTS]

/**
 * Event payload structure
 */
export interface EventPayload<T = any> {
  readonly type: EventType
  readonly timestamp: string
  readonly data: T
  readonly source?: string
  readonly userId?: string
}

/**
 * Workspace event bus
 */
export class EventBus {
  private listeners = new Map<EventType, Set<(payload: EventPayload) => void>>()

  subscribe(eventType: EventType, callback: (payload: EventPayload) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    this.listeners.get(eventType)!.add(callback)

    return () => {
      this.listeners.get(eventType)?.delete(callback)
    }
  }

  subscribeAll(callback: (payload: EventPayload) => void): () => void {
    let unsubscribers: Array<() => void> = []
    const allEvents: EventType[] = [
      ...Object.values(WORKFLOW_EVENTS),
      ...Object.values(NODE_EVENTS),
      ...Object.values(CONNECTION_EVENTS),
      ...Object.values(EXECUTION_EVENTS),
      ...Object.values(UI_EVENTS),
    ] as EventType[]

    allEvents.forEach((eventType) => {
      unsubscribers.push(this.subscribe(eventType, callback))
    })

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe())
    }
  }

  publish(payload: EventPayload): void {
    const callbacks = this.listeners.get(payload.type)
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(payload)
        } catch (error) {
          console.error(`Error in event listener for ${payload.type}:`, error)
        }
      })
    }
  }

  clear(): void {
    this.listeners.clear()
  }
}

/**
 * Singleton event bus instance
 */
export const eventBus = new EventBus()
