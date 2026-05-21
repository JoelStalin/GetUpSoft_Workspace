import { withRetryAndTimeout } from '../utils/retry'
import { ApiError, ValidationError } from '../constants/errors'

const API_BASE = '/api/n8n'

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

function handleResponse(response: Response): Promise<any> {
  if (!response.ok) {
    if (response.status === 404) {
      throw new ApiError('Resource not found', response.status)
    } else if (response.status === 401) {
      throw new ApiError('Unauthorized', response.status)
    } else if (response.status >= 500) {
      throw new ApiError(`Server error: ${response.statusText}`, response.status)
    } else if (response.status >= 400) {
      throw new ValidationError(`Invalid request: ${response.statusText}`)
    }
  }
  return response.json()
}

export async function listWorkflows(limit = 50, offset = 0) {
  return withRetryAndTimeout(
    () =>
      fetch(`${API_BASE}/workflows?limit=${limit}&offset=${offset}`).then(
        handleResponse
      ),
    30000,
    { maxRetries: 3 }
  )
}

export async function getWorkflow(id: string) {
  return withRetryAndTimeout(
    () =>
      fetch(`${API_BASE}/workflows/${id}`).then(
        handleResponse
      ),
    30000,
    { maxRetries: 3 }
  )
}

export async function createWorkflow(workflow: Partial<ApiWorkflow>) {
  return withRetryAndTimeout(
    () =>
      fetch(`${API_BASE}/workflows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow),
      }).then(handleResponse),
    30000,
    { maxRetries: 2 }
  )
}

export async function updateWorkflow(id: string, workflow: Partial<ApiWorkflow>) {
  return withRetryAndTimeout(
    () =>
      fetch(`${API_BASE}/workflows/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow),
      }).then(handleResponse),
    30000,
    { maxRetries: 2 }
  )
}

export async function deleteWorkflow(id: string) {
  return withRetryAndTimeout(
    () =>
      fetch(`${API_BASE}/workflows/${id}`, {
        method: 'DELETE',
      }).then(handleResponse),
    30000,
    { maxRetries: 2 }
  )
}

export async function exportWorkflow(id: string): Promise<Blob> {
  return withRetryAndTimeout(
    () =>
      fetch(`${API_BASE}/workflows/${id}/export`).then((response) => {
        if (!response.ok) throw new ApiError('Failed to export workflow', response.status)
        return response.blob()
      }),
    30000,
    { maxRetries: 2 }
  )
}

export async function importWorkflow(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return withRetryAndTimeout(
    () =>
      fetch(`${API_BASE}/import`, {
        method: 'POST',
        body: formData,
      }).then(handleResponse),
    30000,
    { maxRetries: 2 }
  )
}

export async function runWorkflow(id: string, inputData?: Record<string, any>) {
  return withRetryAndTimeout(
    () =>
      fetch(`${API_BASE}/workflows/${id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow_id: id, input_data: inputData || {} }),
      }).then(handleResponse),
    60000, // Longer timeout for workflow execution
    { maxRetries: 1 }
  )
}

export async function getNodeTypes() {
  return withRetryAndTimeout(
    () => fetch(`${API_BASE}/node-types`).then(handleResponse),
    5000,
    { maxRetries: 3 }
  )
}

export async function generateWorkflow(
  prompt: string,
  modelId = 'kimi-k2-6',
  context = ''
) {
  return withRetryAndTimeout(
    () =>
      fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model_id: modelId, context }),
      }).then(handleResponse),
    60000, // Longer timeout for AI generation
    { maxRetries: 1 }
  )
}

