import { Workflow } from '../types/workflow'

/**
 * Predefined workflow templates for users to get started
 */
export const WORKFLOW_TEMPLATES: Record<string, Workflow> = {
  'simple-http': {
    id: 'template-simple-http',
    name: 'Simple HTTP Request',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 50, y: 150 },
        data: {
          label: 'Trigger',
          type: 'trigger',
          color: '#7c4dff',
        },
      },
      {
        id: 'http-1',
        type: 'http',
        position: { x: 300, y: 150 },
        data: {
          label: 'HTTP Request',
          type: 'http',
          color: '#4a9eff',
          parameters: {
            url: 'https://api.example.com/data',
            method: 'GET',
          },
        },
      },
      {
        id: 'debug-1',
        type: 'debug',
        position: { x: 550, y: 150 },
        data: {
          label: 'Debug Output',
          type: 'debug',
          color: '#16c784',
        },
      },
    ],
    edges: [
      {
        id: 'trigger-1-http-1',
        source: 'trigger-1',
        target: 'http-1',
        animated: true,
        type: 'smoothstep',
      },
      {
        id: 'http-1-debug-1',
        source: 'http-1',
        target: 'debug-1',
        animated: true,
        type: 'smoothstep',
      },
    ],
    orca_meta: {
      description: 'Basic workflow that makes an HTTP request and logs the response',
      tags: ['http', 'api', 'beginner'],
      category: 'API',
    },
  },

  'data-processing': {
    id: 'template-data-processing',
    name: 'Data Processing Pipeline',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: [
      {
        id: 'trigger-2',
        type: 'trigger',
        position: { x: 50, y: 200 },
        data: {
          label: 'Data Source',
          type: 'trigger',
          color: '#7c4dff',
        },
      },
      {
        id: 'filter-1',
        type: 'filter',
        position: { x: 300, y: 100 },
        data: {
          label: 'Filter Data',
          type: 'filter',
          color: '#ffa500',
        },
      },
      {
        id: 'transform-1',
        type: 'transform',
        position: { x: 300, y: 300 },
        data: {
          label: 'Transform',
          type: 'transform',
          color: '#ff6b6b',
        },
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 550, y: 200 },
        data: {
          label: 'Save Result',
          type: 'output',
          color: '#16c784',
        },
      },
    ],
    edges: [
      {
        id: 'trigger-2-filter-1',
        source: 'trigger-2',
        target: 'filter-1',
        animated: true,
        type: 'smoothstep',
      },
      {
        id: 'trigger-2-transform-1',
        source: 'trigger-2',
        target: 'transform-1',
        animated: true,
        type: 'smoothstep',
      },
      {
        id: 'filter-1-output-1',
        source: 'filter-1',
        target: 'output-1',
        animated: true,
        type: 'smoothstep',
      },
      {
        id: 'transform-1-output-1',
        source: 'transform-1',
        target: 'output-1',
        animated: true,
        type: 'smoothstep',
      },
    ],
    orca_meta: {
      description: 'Workflow for filtering and transforming data with parallel processing',
      tags: ['data', 'processing', 'intermediate'],
      category: 'Data Processing',
    },
  },

  'notification-system': {
    id: 'template-notification-system',
    name: 'Notification System',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: [
      {
        id: 'trigger-3',
        type: 'trigger',
        position: { x: 50, y: 200 },
        data: {
          label: 'Event Trigger',
          type: 'trigger',
          color: '#7c4dff',
        },
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 300, y: 200 },
        data: {
          label: 'Check Condition',
          type: 'condition',
          color: '#ffa500',
        },
      },
      {
        id: 'email-1',
        type: 'email',
        position: { x: 550, y: 100 },
        data: {
          label: 'Send Email',
          type: 'email',
          color: '#ff6b6b',
        },
      },
      {
        id: 'slack-1',
        type: 'slack',
        position: { x: 550, y: 300 },
        data: {
          label: 'Send Slack Message',
          type: 'slack',
          color: '#4a9eff',
        },
      },
    ],
    edges: [
      {
        id: 'trigger-3-condition-1',
        source: 'trigger-3',
        target: 'condition-1',
        animated: true,
        type: 'smoothstep',
      },
      {
        id: 'condition-1-email-1',
        source: 'condition-1',
        target: 'email-1',
        animated: true,
        type: 'smoothstep',
      },
      {
        id: 'condition-1-slack-1',
        source: 'condition-1',
        target: 'slack-1',
        animated: true,
        type: 'smoothstep',
      },
    ],
    orca_meta: {
      description: 'Sends notifications via email or Slack based on conditions',
      tags: ['notification', 'email', 'slack', 'advanced'],
      category: 'Notifications',
    },
  },

  'scheduled-task': {
    id: 'template-scheduled-task',
    name: 'Scheduled Task Executor',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: [
      {
        id: 'schedule-1',
        type: 'schedule',
        position: { x: 50, y: 150 },
        data: {
          label: 'Schedule (Daily)',
          type: 'schedule',
          color: '#7c4dff',
          parameters: {
            frequency: 'daily',
            time: '09:00',
          },
        },
      },
      {
        id: 'http-2',
        type: 'http',
        position: { x: 300, y: 150 },
        data: {
          label: 'API Call',
          type: 'http',
          color: '#4a9eff',
        },
      },
      {
        id: 'db-1',
        type: 'database',
        position: { x: 550, y: 150 },
        data: {
          label: 'Store in Database',
          type: 'database',
          color: '#16c784',
        },
      },
    ],
    edges: [
      {
        id: 'schedule-1-http-2',
        source: 'schedule-1',
        target: 'http-2',
        animated: true,
        type: 'smoothstep',
      },
      {
        id: 'http-2-db-1',
        source: 'http-2',
        target: 'db-1',
        animated: true,
        type: 'smoothstep',
      },
    ],
    orca_meta: {
      description: 'Executes an API call on a schedule and stores results in database',
      tags: ['schedule', 'cron', 'database', 'intermediate'],
      category: 'Scheduling',
    },
  },
}

/**
 * Template metadata for UI display
 */
export interface TemplateMetadata {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  nodeCount: number
  edgeCount: number
}

/**
 * Get all template metadata
 */
export function getTemplateMetadata(): TemplateMetadata[] {
  return Object.entries(WORKFLOW_TEMPLATES).map(([key, workflow]) => ({
    id: key,
    name: workflow.name,
    description: (workflow.orca_meta?.description as string) || 'No description',
    category: (workflow.orca_meta?.category as string) || 'Other',
    tags: (workflow.orca_meta?.tags as string[]) || [],
    difficulty: getDifficulty((workflow.orca_meta?.tags as string[]) || []),
    nodeCount: workflow.nodes?.length || 0,
    edgeCount: workflow.edges?.length || 0,
  }))
}

/**
 * Get template by ID
 */
export function getTemplate(templateId: string): Workflow | null {
  return WORKFLOW_TEMPLATES[templateId] || null
}

/**
 * Get all templates in a category
 */
export function getTemplatesByCategory(category: string): Workflow[] {
  return Object.values(WORKFLOW_TEMPLATES).filter(
    (w) => w.orca_meta?.category === category
  )
}

/**
 * Get all unique categories
 */
export function getTemplateCategories(): string[] {
  const categories = new Set<string>()
  Object.values(WORKFLOW_TEMPLATES).forEach((w) => {
    if (w.orca_meta?.category) {
      categories.add(w.orca_meta.category as string)
    }
  })
  return Array.from(categories).sort()
}

/**
 * Determine difficulty level from tags
 */
function getDifficulty(tags: string[]): 'beginner' | 'intermediate' | 'advanced' {
  if (tags.includes('advanced')) return 'advanced'
  if (tags.includes('intermediate')) return 'intermediate'
  return 'beginner'
}
