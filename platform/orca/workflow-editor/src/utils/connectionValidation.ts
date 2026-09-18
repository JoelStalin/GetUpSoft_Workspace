import { Edge, Node } from '@xyflow/react'

/**
 * Validates workflow connections for safety and correctness
 */

/**
 * Check if adding an edge would create a cycle
 * Uses depth-first search to detect cycles
 */
export function wouldCreateCycle(
  sourceId: string,
  targetId: string,
  edges: Edge[],
  nodes: Node[]
): boolean {
  // Self-loop is always invalid
  if (sourceId === targetId) {
    return true
  }

  // Build adjacency list from current edges
  const adjacencyList: Map<string, string[]> = new Map()

  nodes.forEach((node) => {
    adjacencyList.set(node.id, [])
  })

  edges.forEach((edge) => {
    if (!adjacencyList.has(edge.source)) {
      adjacencyList.set(edge.source, [])
    }
    adjacencyList.get(edge.source)!.push(edge.target)
  })

  // Check if targetId can reach sourceId (which would create a cycle)
  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  function hasCycleDFS(nodeId: string): boolean {
    visited.add(nodeId)
    recursionStack.add(nodeId)

    const neighbors = adjacencyList.get(nodeId) || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycleDFS(neighbor)) {
          return true
        }
      } else if (recursionStack.has(neighbor)) {
        return true
      }
    }

    recursionStack.delete(nodeId)
    return false
  }

  // Check if adding edge sourceId → targetId would create cycle
  // This means: can targetId reach sourceId in current graph?
  const tempVisited = new Set<string>()
  const tempStack = new Set<string>()

  function canReach(from: string, to: string): boolean {
    if (from === to) return true

    tempVisited.add(from)
    tempStack.add(from)

    const neighbors = adjacencyList.get(from) || []
    for (const neighbor of neighbors) {
      if (neighbor === to) return true
      if (!tempVisited.has(neighbor)) {
        if (canReach(neighbor, to)) return true
      }
    }

    tempStack.delete(from)
    return false
  }

  return canReach(targetId, sourceId)
}

/**
 * Validate a connection between two nodes
 */
export function isValidConnection(
  sourceId: string | null,
  targetId: string | null,
  edges: Edge[],
  nodes: Node[]
): { valid: boolean; reason?: string } {
  // Check basic validity
  if (!sourceId || !targetId) {
    return { valid: false, reason: 'Missing source or target node' }
  }

  if (sourceId === targetId) {
    return { valid: false, reason: 'Cannot connect node to itself' }
  }

  // Check if source and target exist
  const sourceExists = nodes.some((n) => n.id === sourceId)
  const targetExists = nodes.some((n) => n.id === targetId)

  if (!sourceExists || !targetExists) {
    return { valid: false, reason: 'Source or target node does not exist' }
  }

  // Check for duplicate edges
  const edgeExists = edges.some((e) => e.source === sourceId && e.target === targetId)
  if (edgeExists) {
    return { valid: false, reason: 'Connection already exists' }
  }

  // Check for cycles
  if (wouldCreateCycle(sourceId, targetId, edges, nodes)) {
    return { valid: false, reason: 'Connection would create a cycle' }
  }

  return { valid: true }
}

/**
 * Get all downstream nodes from a given node
 */
export function getDownstreamNodes(nodeId: string, edges: Edge[]): string[] {
  const downstream = new Set<string>()
  const queue = [nodeId]

  while (queue.length > 0) {
    const current = queue.shift()!
    const children = edges.filter((e) => e.source === current).map((e) => e.target)

    for (const child of children) {
      if (!downstream.has(child)) {
        downstream.add(child)
        queue.push(child)
      }
    }
  }

  return Array.from(downstream)
}

/**
 * Get all upstream nodes from a given node
 */
export function getUpstreamNodes(nodeId: string, edges: Edge[]): string[] {
  const upstream = new Set<string>()
  const queue = [nodeId]

  while (queue.length > 0) {
    const current = queue.shift()!
    const parents = edges.filter((e) => e.target === current).map((e) => e.source)

    for (const parent of parents) {
      if (!upstream.has(parent)) {
        upstream.add(parent)
        queue.push(parent)
      }
    }
  }

  return Array.from(upstream)
}

/**
 * Check if workflow has any cycles
 */
export function hasWorkflowCycles(edges: Edge[], nodes: Node[]): boolean {
  const adjacencyList: Map<string, string[]> = new Map()

  nodes.forEach((node) => {
    adjacencyList.set(node.id, [])
  })

  edges.forEach((edge) => {
    if (!adjacencyList.has(edge.source)) {
      adjacencyList.set(edge.source, [])
    }
    adjacencyList.get(edge.source)!.push(edge.target)
  })

  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  function hasCycleDFS(nodeId: string): boolean {
    visited.add(nodeId)
    recursionStack.add(nodeId)

    const neighbors = adjacencyList.get(nodeId) || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycleDFS(neighbor)) {
          return true
        }
      } else if (recursionStack.has(neighbor)) {
        return true
      }
    }

    recursionStack.delete(nodeId)
    return false
  }

  for (const nodeId of nodes.map((n) => n.id)) {
    if (!visited.has(nodeId)) {
      if (hasCycleDFS(nodeId)) {
        return true
      }
    }
  }

  return false
}

/**
 * Get execution order of nodes (topological sort)
 */
export function getExecutionOrder(edges: Edge[], nodes: Node[]): string[] | null {
  if (hasWorkflowCycles(edges, nodes)) {
    return null // Cannot determine order if there are cycles
  }

  const adjacencyList: Map<string, string[]> = new Map()
  const inDegree: Map<string, number> = new Map()

  nodes.forEach((node) => {
    adjacencyList.set(node.id, [])
    inDegree.set(node.id, 0)
  })

  edges.forEach((edge) => {
    if (!adjacencyList.has(edge.source)) {
      adjacencyList.set(edge.source, [])
    }
    adjacencyList.get(edge.source)!.push(edge.target)
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1)
  })

  const queue: string[] = []
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      queue.push(nodeId)
    }
  })

  const result: string[] = []

  while (queue.length > 0) {
    const nodeId = queue.shift()!
    result.push(nodeId)

    const neighbors = adjacencyList.get(nodeId) || []
    for (const neighbor of neighbors) {
      inDegree.set(neighbor, inDegree.get(neighbor)! - 1)
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor)
      }
    }
  }

  return result.length === nodes.length ? result : null
}
