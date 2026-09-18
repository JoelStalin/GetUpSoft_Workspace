import { useEffect, useState } from 'react'
import { getNodeTypes } from '../api/orcaApi'
import { useWorkflowOperations } from '../hooks/useWorkflowOperations'
import { useWorkflowHistory } from '../hooks/useWorkflowHistory'
import { Node } from '@xyflow/react'
import { Search, Bell, Brain, Globe, GitBranch, Wrench, ChevronRight, ChevronDown, Cpu, LayoutGrid, ServerCog } from 'lucide-react'
import { STITCH_MEMORY_CATEGORIES, STITCH_MEMORY_NODE_TYPES } from '../constants/stitchMemoryComponents'
import { isLiveApiEnabled } from '../config/runtime'

interface NodeType {
  label: string
  color: string
  description?: string
  category?: string
}

interface AccordionCategory {
  name: string
  icon: React.ComponentType<{ size: number }>
  items: [string, NodeType][]
  isOpen: boolean
}

export default function NodePalette({
  collapsed = false,
  onToggle = () => {},
}: {
  collapsed?: boolean
  onToggle?: () => void
}) {
  const [nodeTypes, setNodeTypes] = useState<Record<string, NodeType>>(getDefaultNodeTypes())
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    Triggers: true,
    AI: false,
    'Agent Core': true,
    'AI Agents': true,
    Architecture: false,
    'RD Operations': false,
    Network: false,
    'Control Flow': false,
    'UI Patterns': false,
    Utils: false,
  })
  const { addNode, workflow, pushHistory } = useWorkflowOperations()

  useEffect(() => {
    const loadNodeTypes = async () => {
      if (!isLiveApiEnabled()) return
      try {
        const types = await getNodeTypes()
        if (types && typeof types === 'object' && Object.keys(types).length > 0) {
          setNodeTypes(types)
        } else {
          setNodeTypes(getDefaultNodeTypes())
        }
      } catch (error) {
        setNodeTypes(getDefaultNodeTypes())
      }
    }
    loadNodeTypes()
  }, [])

  const onDragStart = (event: React.DragEvent<HTMLElement>, nodeType: string) => {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/reactflow', nodeType)
  }

  const handleAddNode = (nodeType: string, typeInfo: NodeType) => {
    if (workflow) {
      pushHistory(workflow)
    }
    const mode = getNodeMode(typeInfo.category)
    const node: Node = {
      id: `node-${Date.now()}`,
      type: 'default',
      data: {
        label: typeInfo.label,
        type: nodeType,
        color: typeInfo.color,
        ...(mode ? { mode } : {}),
      },
      position: { x: 300 + Math.random() * 100 - 50, y: 200 + Math.random() * 100 - 50 },
    }
    addNode(node as any)
  }

  const getCategory = (nodeType: string): string => {
    if (nodeTypes[nodeType]?.category) return nodeTypes[nodeType].category!
    if (nodeType.includes('trigger')) return 'Triggers'
    if (nodeType.includes('aiPrompt')) return 'AI'
    if (nodeType.includes('http')) return 'Network'
    if (nodeType.includes('condition') || nodeType.includes('loop')) return 'Control Flow'
    return 'Utils'
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Triggers':
        return Bell
      case 'AI':
        return Brain
      case 'AI Agents':
        return Cpu
      case 'Architecture':
        return GitBranch
      case 'RD Operations':
        return ServerCog
      case 'Network':
        return Globe
      case 'Control Flow':
        return GitBranch
      case 'UI Patterns':
        return LayoutGrid
      case 'Utils':
        return Wrench
      default:
        return Wrench
    }
  }

  const grouped = Object.entries(nodeTypes).reduce(
    (acc, [key, info]) => {
      const category = getCategory(key)
      if (!acc[category]) acc[category] = []
      acc[category].push([key, info])
      return acc
    },
    {} as Record<string, [string, NodeType][]>
  )

  const filtered = Object.entries(grouped).reduce(
    (acc, [category, items]) => {
      const filteredItems = items.filter(
        ([, info]) =>
          info.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          info.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      if (filteredItems.length > 0) {
        acc[category] = filteredItems
      }
      return acc
    },
    {} as Record<string, [string, NodeType][]>
  )

  const categories = Object.keys(filtered).sort((a, b) => {
    const order = STITCH_MEMORY_CATEGORIES
    return order.indexOf(a) - order.indexOf(b)
  })

  if (collapsed) {
    return (
      <div
        style={{
          width: '48px',
          backgroundColor: 'rgb(var(--color-base-200))',
          borderRight: `1px solid var(--stitch-border)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '8px 0',
          gap: '8px',
          overflow: 'hidden',
        }}
      >
        {/* Expand button */}
        <button
          onClick={onToggle}
          title="Expand nav"
          style={{
            width: '32px',
            height: '32px',
            background: 'none',
            border: 'none',
            color: 'var(--stitch-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--stitch-text)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--stitch-muted)'
          }}
        >
          <ChevronRight size={16} />
        </button>

        {/* Category icons */}
        {categories.map((category) => {
          const Icon = getCategoryIcon(category)
          return (
            <button
              key={category}
              title={category}
              style={{
                width: '32px',
                height: '32px',
                background: 'none',
                border: 'none',
                color: 'var(--stitch-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--stitch-text)'
                e.currentTarget.style.backgroundColor = 'var(--stitch-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--stitch-muted)'
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <Icon size={18} />
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div
      style={{
        width: '240px',
        backgroundColor: 'rgb(var(--color-base-200))',
        borderRight: `1px solid var(--stitch-border)`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 16px 12px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid var(--stitch-border)`,
        }}
      >
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--stitch-text)',
          }}
        >
          Components
        </div>
        <button
          onClick={onToggle}
          title="Collapse nav"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--stitch-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--stitch-text)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--stitch-muted)'
          }}
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Search Input */}
      <div style={{ padding: '8px 16px', flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '8px',
              top: '8px',
              color: 'var(--stitch-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '28px',
              paddingRight: '8px',
              paddingTop: '6px',
              paddingBottom: '6px',
              backgroundColor: 'var(--stitch-elevated)',
              border: `1px solid var(--stitch-border)`,
              color: 'var(--stitch-text)',
              borderRadius: '6px',
              fontSize: '12px',
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--stitch-accent)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--stitch-border)'
            }}
          />
        </div>
      </div>

      {/* Accordions */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {categories.map((category) => {
          const Icon = getCategoryIcon(category)
          const isOpen = expandedCategories[category]
          const items = filtered[category] || []

          return (
            <div key={category} style={{ marginBottom: '4px' }}>
              {/* Accordion Header */}
              <button
                onClick={() =>
                  setExpandedCategories((prev) => ({
                    ...prev,
                    [category]: !prev[category],
                  }))
                }
                style={{
                  width: '100%',
                  padding: '8px 8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  color: 'var(--stitch-muted)',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--stitch-hover)'
                  e.currentTarget.style.color = 'var(--stitch-text)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'var(--stitch-muted)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon size={14} />
                  <span>{category}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {items.length}
                  </span>
                  <ChevronDown
                    size={12}
                    style={{
                      transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                      transition: 'transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                </div>
              </button>

              {/* Accordion Body */}
              <div
                className={isOpen ? 'accordion-body open' : 'accordion-body closed'}
                style={{
                  overflow: 'hidden',
                  transition: 'max-height 0.22s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.22s ease',
                  maxHeight: isOpen ? '600px' : '0',
                  opacity: isOpen ? 1 : 0,
                }}
              >
                {items.map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => handleAddNode(key, info)}
                    draggable
                    onDragStart={(e) => onDragStart(e, key)}
                    style={{
                      width: '100%',
                      padding: '8px 8px',
                      marginBottom: '2px',
                      backgroundColor: 'transparent',
                      border: `1px solid rgba(255, 255, 255, 0.05)`,
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--stitch-hover)'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    {/* Color Dot */}
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: info.color || '#7c4dff',
                        flexShrink: 0,
                      }}
                    />

                    {/* Label and Description */}
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 500,
                          color: 'var(--stitch-text)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {info.label}
                      </div>
                      {info.description && (
                        <div
                          style={{
                            fontSize: '11px',
                            color: 'var(--stitch-muted)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            marginTop: '2px',
                          }}
                        >
                          {info.description}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getNodeMode(category?: string) {
  if (category === 'Agent Core' || category === 'AI Agents' || category === 'Architecture') return 'ai'
  if (category === 'UI Patterns') return 'web'
  return undefined
}

function getDefaultNodeTypes() {
  return {
    'orca-nodes-base.trigger': {
      label: 'Trigger',
      color: '#ff6d5a',
      description: 'Start a workflow execution',
    },
    'orca-nodes-base.aiPrompt': {
      label: 'AI Prompt',
      color: '#7c4dff',
      description: 'Call an AI model with a prompt',
    },
    'orca-nodes-base.httpRequest': {
      label: 'HTTP Request',
      color: '#1a9ba1',
      description: 'Make an HTTP request',
    },
    'orca-nodes-base.condition': {
      label: 'Condition',
      color: '#ff9f43',
      description: 'Conditional branching',
    },
    'orca-nodes-base.loop': {
      label: 'Loop',
      color: '#10ac84',
      description: 'Iterate over a list',
    },
    'orca-nodes-base.setVariable': {
      label: 'Set Variable',
      color: '#576574',
      description: 'Store a value in a variable',
    },
    'orca-nodes-base.executeCommand': {
      label: 'Execute',
      color: '#ee5a24',
      description: 'Execute a command or script',
    },
    'orca-nodes-base.end': {
      label: 'End',
      color: '#353b48',
      description: 'End the workflow',
    },
    ...STITCH_MEMORY_NODE_TYPES,
  }
}
