/**
 * Workflow Generator - Creates workflow nodes and edges from parsed intent
 * Handles layout, positioning, and node properties
 */

import type { NodeProposal, EdgeProposal, NodeType } from '../utils/workflowParser'

export interface GeneratedNode {
  id: string
  type: string
  data: {
    label: string
    type: NodeType
    color: string
    status: 'pending' | 'running' | 'success' | 'error'
  }
  position: {
    x: number
    y: number
  }
}

export interface GeneratedEdge {
  id: string
  source: string
  target: string
  animated?: boolean
}

export interface GeneratedWorkflow {
  nodes: GeneratedNode[]
  edges: GeneratedEdge[]
}

/**
 * Node type to color mapping
 */
const NODE_COLORS: Record<NodeType, string> = {
  trigger: '#ff6d5a', // Red/Orange
  action: '#7c4dff', // Purple
  condition: '#ff9f43', // Orange
  output: '#1DB954', // Green
}

/**
 * Calculates auto-layout positions for nodes
 * Uses a vertical/horizontal grid layout
 */
function calculateNodePositions(nodeCount: number, nodeIndex: number): { x: number; y: number } {
  const SPACING = 180
  const ROW_HEIGHT = 100

  // For now, use vertical layout (each node below the previous)
  // In the future, could use more sophisticated layouts (grid, tree, etc.)

  return {
    x: 150, // Fixed x position
    y: 50 + nodeIndex * ROW_HEIGHT, // Stacked vertically
  }
}

/**
 * Creates a workflow node from a proposal
 */
function createNode(proposal: NodeProposal, index: number, baseId: string = 'gen'): GeneratedNode {
  const id = `${baseId}-${index}-${Date.now()}`
  const color = NODE_COLORS[proposal.type]

  return {
    id,
    type: 'default',
    data: {
      label: proposal.label,
      type: proposal.type,
      color,
      status: 'pending',
      ...proposal.properties,
    },
    position: calculateNodePositions(10, index), // Assume max 10 nodes for layout
  }
}

/**
 * Creates workflow edges from proposals
 */
function createEdges(edgeProposals: EdgeProposal[], nodeIds: string[]): GeneratedEdge[] {
  return edgeProposals.map((proposal, index) => ({
    id: `edge-${index}-${Date.now()}`,
    source: nodeIds[proposal.sourceIndex],
    target: nodeIds[proposal.targetIndex],
    animated: true,
  }))
}

/**
 * Generates complete workflow from proposals
 */
export function generateWorkflow(proposals: {
  nodes: NodeProposal[]
  edges: EdgeProposal[]
}): GeneratedWorkflow {
  // Generate nodes
  const generatedNodes = proposals.nodes.map((proposal, index) =>
    createNode(proposal, index, 'wf')
  )

  // Extract node IDs for edge creation
  const nodeIds = generatedNodes.map((n) => n.id)

  // Generate edges
  const generatedEdges = createEdges(proposals.edges, nodeIds)

  return {
    nodes: generatedNodes,
    edges: generatedEdges,
  }
}

/**
 * Validates generated workflow
 */
export function validateGeneratedWorkflow(workflow: GeneratedWorkflow): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check nodes
  if (workflow.nodes.length === 0) {
    errors.push('Workflow must have at least one node')
  }

  if (workflow.nodes.length > 50) {
    errors.push('Workflow cannot have more than 50 nodes')
  }

  // Check for duplicate IDs
  const nodeIds = new Set(workflow.nodes.map((n) => n.id))
  if (nodeIds.size !== workflow.nodes.length) {
    errors.push('Duplicate node IDs detected')
  }

  // Check edges reference valid nodes
  const validIds = new Set(workflow.nodes.map((n) => n.id))
  for (const edge of workflow.edges) {
    if (!validIds.has(edge.source)) {
      errors.push(`Edge references non-existent source: ${edge.source}`)
    }
    if (!validIds.has(edge.target)) {
      errors.push(`Edge references non-existent target: ${edge.target}`)
    }
  }

  // Check for circular references
  const adj = new Map<string, string[]>()
  for (const node of workflow.nodes) {
    adj.set(node.id, [])
  }
  for (const edge of workflow.edges) {
    adj.get(edge.source)?.push(edge.target)
  }

  // Simple cycle detection using DFS
  const visited = new Set<string>()
  const recStack = new Set<string>()

  function hasCycle(node: string): boolean {
    visited.add(node)
    recStack.add(node)

    for (const neighbor of adj.get(node) || []) {
      if (!visited.has(neighbor)) {
        if (hasCycle(neighbor)) return true
      } else if (recStack.has(neighbor)) {
        return true
      }
    }

    recStack.delete(node)
    return false
  }

  for (const nodeId of workflow.nodes.map((n) => n.id)) {
    if (!visited.has(nodeId)) {
      if (hasCycle(nodeId)) {
        errors.push('Workflow contains circular reference')
        break
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Exports workflow to a shareable format
 */
export function exportWorkflow(workflow: GeneratedWorkflow): string {
  return JSON.stringify(workflow, null, 2)
}

/**
 * Imports workflow from shared format
 */
export function importWorkflow(json: string): {
  success: boolean
  workflow?: GeneratedWorkflow
  error?: string
} {
  try {
    const parsed = JSON.parse(json)

    // Validate structure
    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
      return { success: false, error: 'Invalid workflow format' }
    }

    return { success: true, workflow: parsed as GeneratedWorkflow }
  } catch (error) {
    return { success: false, error: `Failed to parse workflow: ${String(error)}` }
  }
}

/**
 * Creates a summary description of a workflow
 */
export function summarizeWorkflow(workflow: GeneratedWorkflow): string {
  const nodeCount = workflow.nodes.length
  const edgeCount = workflow.edges.length

  const nodeTypes = {
    trigger: workflow.nodes.filter((n) => n.data.type === 'trigger').length,
    action: workflow.nodes.filter((n) => n.data.type === 'action').length,
    condition: workflow.nodes.filter((n) => n.data.type === 'condition').length,
    output: workflow.nodes.filter((n) => n.data.type === 'output').length,
  }

  return `Workflow with ${nodeCount} nodes (${nodeTypes.trigger} trigger, ${nodeTypes.action} actions, ${nodeTypes.condition} conditions, ${nodeTypes.output} outputs) and ${edgeCount} connections`
}
