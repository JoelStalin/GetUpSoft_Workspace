import { Workflow, WorkflowNode, WorkflowEdge } from '../types/workflow'
import { ValidationError } from '../constants/errors'

/**
 * Validation result with details
 */
export interface ValidationResult {
  valid: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
}

/**
 * Individual validation issue
 */
export interface ValidationIssue {
  type: 'error' | 'warning'
  field: string
  message: string
  nodeId?: string
}

/**
 * Validate entire workflow structure and integrity
 */
export function validateWorkflow(workflow: Workflow | null): ValidationResult {
  const errors: ValidationIssue[] = []
  const warnings: ValidationIssue[] = []

  // Check if workflow exists
  if (!workflow) {
    errors.push({
      type: 'error',
      field: 'workflow',
      message: 'Workflow is required',
    })
    return { valid: false, errors, warnings }
  }

  // Validate workflow metadata
  if (!workflow.id || workflow.id.trim() === '') {
    errors.push({
      type: 'error',
      field: 'id',
      message: 'Workflow ID is required',
    })
  }

  if (!workflow.name || workflow.name.trim() === '') {
    errors.push({
      type: 'error',
      field: 'name',
      message: 'Workflow name is required',
    })
  }

  // Validate nodes
  if (!workflow.nodes || workflow.nodes.length === 0) {
    warnings.push({
      type: 'warning',
      field: 'nodes',
      message: 'Workflow has no nodes',
    })
  } else {
    workflow.nodes.forEach((node) => {
      const nodeErrors = validateNode(node)
      errors.push(...nodeErrors.filter((e) => e.type === 'error'))
      warnings.push(...nodeErrors.filter((e) => e.type === 'warning'))
    })
  }

  // Validate edges
  if (workflow.edges) {
    workflow.edges.forEach((edge) => {
      const edgeErrors = validateEdge(edge, workflow.nodes || [])
      errors.push(...edgeErrors.filter((e) => e.type === 'error'))
      warnings.push(...edgeErrors.filter((e) => e.type === 'warning'))
    })
  }

  // Check for orphaned nodes (disconnected nodes)
  const orphanedNodes = findOrphanedNodes(workflow.nodes || [], workflow.edges || [])
  if (orphanedNodes.length > 0) {
    orphanedNodes.forEach((nodeId) => {
      warnings.push({
        type: 'warning',
        field: 'nodes',
        message: `Node "${nodeId}" is not connected to any other node`,
        nodeId,
      })
    })
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate individual node
 */
export function validateNode(node: WorkflowNode): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  if (!node.id || node.id.trim() === '') {
    issues.push({
      type: 'error',
      field: 'id',
      message: 'Node ID is required',
      nodeId: node.id,
    })
  }

  if (!node.type || node.type.trim() === '') {
    issues.push({
      type: 'error',
      field: 'type',
      message: 'Node type is required',
      nodeId: node.id,
    })
  }

  if (!node.data) {
    issues.push({
      type: 'error',
      field: 'data',
      message: 'Node data is required',
      nodeId: node.id,
    })
  }

  if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
    issues.push({
      type: 'error',
      field: 'position',
      message: 'Node must have valid position (x, y)',
      nodeId: node.id,
    })
  }

  // Check for required label
  if (!node.data?.label || (typeof node.data.label === 'string' && node.data.label.trim() === '')) {
    issues.push({
      type: 'warning',
      field: 'label',
      message: 'Node should have a descriptive label',
      nodeId: node.id,
    })
  }

  return issues
}

/**
 * Validate edge connection
 */
export function validateEdge(edge: WorkflowEdge, nodes: readonly WorkflowNode[]): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  if (!edge.id || edge.id.trim() === '') {
    issues.push({
      type: 'error',
      field: 'id',
      message: 'Edge ID is required',
    })
  }

  if (!edge.source || edge.source.trim() === '') {
    issues.push({
      type: 'error',
      field: 'source',
      message: 'Edge must have a source node',
    })
  } else {
    const sourceExists = nodes.some((n) => n.id === edge.source)
    if (!sourceExists) {
      issues.push({
        type: 'error',
        field: 'source',
        message: `Source node "${edge.source}" does not exist`,
      })
    }
  }

  if (!edge.target || edge.target.trim() === '') {
    issues.push({
      type: 'error',
      field: 'target',
      message: 'Edge must have a target node',
    })
  } else {
    const targetExists = nodes.some((n) => n.id === edge.target)
    if (!targetExists) {
      issues.push({
        type: 'error',
        field: 'target',
        message: `Target node "${edge.target}" does not exist`,
      })
    }
  }

  return issues
}

/**
 * Validate workflow inputs/parameters
 */
export function validateWorkflowInputs(
  inputs: Record<string, any>,
  schema?: Record<string, { type: string; required?: boolean }>
): ValidationResult {
  const errors: ValidationIssue[] = []
  const warnings: ValidationIssue[] = []

  if (!schema) {
    return { valid: true, errors, warnings }
  }

  Object.entries(schema).forEach(([field, config]) => {
    const value = inputs[field]

    // Check required fields
    if (config.required && (value === undefined || value === null || value === '')) {
      errors.push({
        type: 'error',
        field,
        message: `${field} is required`,
      })
      return
    }

    // Check type if value is provided
    if (value !== undefined && value !== null && value !== '') {
      const expectedType = config.type.toLowerCase()
      const actualType = typeof value

      if (expectedType === 'string' && actualType !== 'string') {
        errors.push({
          type: 'error',
          field,
          message: `${field} must be a string`,
        })
      } else if (expectedType === 'number' && actualType !== 'number') {
        errors.push({
          type: 'error',
          field,
          message: `${field} must be a number`,
        })
      } else if (expectedType === 'boolean' && actualType !== 'boolean') {
        errors.push({
          type: 'error',
          field,
          message: `${field} must be a boolean`,
        })
      } else if (expectedType === 'array' && !Array.isArray(value)) {
        errors.push({
          type: 'error',
          field,
          message: `${field} must be an array`,
        })
      } else if (expectedType === 'object' && actualType !== 'object') {
        errors.push({
          type: 'error',
          field,
          message: `${field} must be an object`,
        })
      }
    }
  })

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Find orphaned nodes (nodes with no incoming or outgoing connections)
 */
export function findOrphanedNodes(nodes: readonly WorkflowNode[], edges: readonly WorkflowEdge[]): string[] {
  if (nodes.length === 0) return []
  if (nodes.length === 1) return nodes.map((n) => n.id) // Single node is orphaned

  const nodeIds = new Set(nodes.map((n) => n.id))
  const connectedNodes = new Set<string>()

  // Mark all nodes that have connections
  edges.forEach((edge) => {
    connectedNodes.add(edge.source)
    connectedNodes.add(edge.target)
  })

  // Return nodes that aren't connected
  return Array.from(nodeIds).filter((id) => !connectedNodes.has(id))
}

/**
 * Check if workflow is ready for execution
 */
export function isWorkflowReady(workflow: Workflow | null): { ready: boolean; reason?: string } {
  if (!workflow) {
    return { ready: false, reason: 'Workflow not found' }
  }

  const validation = validateWorkflow(workflow)
  if (!validation.valid) {
    const errorCount = validation.errors.length
    return {
      ready: false,
      reason: `Workflow has ${errorCount} validation error${errorCount !== 1 ? 's' : ''}`,
    }
  }

  if (!workflow.nodes || workflow.nodes.length === 0) {
    return { ready: false, reason: 'Workflow has no nodes' }
  }

  return { ready: true }
}

/**
 * Throw validation error with details
 */
export function throwValidationError(result: ValidationResult): never {
  const errorMessages = result.errors.map((e) => `${e.field}: ${e.message}`).join(', ')
  throw new ValidationError(errorMessages)
}
