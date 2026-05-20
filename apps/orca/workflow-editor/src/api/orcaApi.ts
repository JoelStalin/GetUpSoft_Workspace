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

export async function listWorkflows(limit = 50, offset = 0) {
  const response = await fetch(
    `${API_BASE}/workflows?limit=${limit}&offset=${offset}`
  )
  if (!response.ok) throw new Error('Failed to list workflows')
  return response.json()
}

export async function getWorkflow(id: string) {
  const response = await fetch(`${API_BASE}/workflows/${id}`)
  if (!response.ok) throw new Error('Failed to get workflow')
  return response.json()
}

export async function createWorkflow(workflow: Partial<ApiWorkflow>) {
  const response = await fetch(`${API_BASE}/workflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflow),
  })
  if (!response.ok) throw new Error('Failed to create workflow')
  return response.json()
}

export async function updateWorkflow(id: string, workflow: Partial<ApiWorkflow>) {
  const response = await fetch(`${API_BASE}/workflows/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflow),
  })
  if (!response.ok) throw new Error('Failed to update workflow')
  return response.json()
}

export async function deleteWorkflow(id: string) {
  const response = await fetch(`${API_BASE}/workflows/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete workflow')
  return response.json()
}

export async function exportWorkflow(id: string) {
  const response = await fetch(`${API_BASE}/workflows/${id}/export`)
  if (!response.ok) throw new Error('Failed to export workflow')
  return response.blob()
}

export async function importWorkflow(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch(`${API_BASE}/import`, {
    method: 'POST',
    body: formData,
  })
  if (!response.ok) throw new Error('Failed to import workflow')
  return response.json()
}

export async function runWorkflow(id: string, inputData?: Record<string, any>) {
  const response = await fetch(`${API_BASE}/workflows/${id}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workflow_id: id, input_data: inputData || {} }),
  })
  if (!response.ok) throw new Error('Failed to run workflow')
  return response.json()
}

export async function getNodeTypes() {
  const response = await fetch(`${API_BASE}/node-types`)
  if (!response.ok) throw new Error('Failed to get node types')
  return response.json()
}

export async function generateWorkflow(
  prompt: string,
  modelId = 'kimi-k2-6',
  context = ''
) {
  const response = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, model_id: modelId, context }),
  })
  if (!response.ok) throw new Error('Failed to generate workflow')
  return response.json()
}
