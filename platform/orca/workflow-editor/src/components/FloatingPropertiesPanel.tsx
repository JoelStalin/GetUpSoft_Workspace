import { useWorkflowOperations } from '../hooks/useWorkflowOperations'
import { useToast } from '../contexts/ToastContext'
import { Settings, Trash2 } from 'lucide-react'
import RichTextEditor from './ui/RichTextEditor'
import ImageUpload from './ui/ImageUpload'
import N8nNodeConfiguration from './N8nNodeConfiguration'
import NodeDebugPanel from './NodeDebugPanel'
import { useEffect, useState } from 'react'

/**
 * MIGRATED: Uses P2 hooks (useWorkflowOperations)
 */
export default function FloatingPropertiesPanel() {
  const { workflow, selectedNodeId, deleteNode, updateNode } = useWorkflowOperations()
  const { addToast } = useToast()
  const [announcedNodeId, setAnnouncedNodeId] = useState<string | null>(() => (window as any).__ORCA_SELECTED_NODE_ID__ || null)
  useEffect(() => { const listener=(event:Event)=>setAnnouncedNodeId((event as CustomEvent<string>).detail); window.addEventListener('orca-node-selected',listener); return()=>window.removeEventListener('orca-node-selected',listener) }, [])
  const effectiveNodeId = selectedNodeId || announcedNodeId

  if (!effectiveNodeId || !workflow) {
    return (
      <div
        style={{
          padding: '24px 16px',
          textAlign: 'center',
          color: 'var(--stitch-muted)',
          fontSize: '12px',
        }}
      >
        <Settings size={24} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
        <p>Select a node to view properties</p>
        {workflow?.nodes?.length ? <select aria-label="Seleccionar nodo" defaultValue="" onChange={(event) => setAnnouncedNodeId(event.target.value || null)} style={{width:'100%',padding:8,background:'var(--stitch-elevated)',color:'var(--stitch-text)',border:'1px solid var(--stitch-border)',borderRadius:6}}><option value="" disabled>Selecciona un nodo…</option>{workflow.nodes.map((node)=><option key={node.id} value={node.id}>{node.data.label || node.id}</option>)}</select> : null}
      </div>
    )
  }

  const selectedNode = workflow.nodes?.find((n) => n.id === effectiveNodeId)

  if (!selectedNode) {
    return (
      <div
        style={{
          padding: '24px 16px',
          textAlign: 'center',
          color: 'var(--stitch-muted)',
          fontSize: '12px',
        }}
      >
        <p>Node not found</p>
      </div>
    )
  }

  const handleLabelChange = (newLabel: string) => {
    updateNode({
      ...selectedNode,
      data: {
        ...selectedNode.data,
        label: newLabel,
      },
    })
  }

  const handleDescriptionChange = (newDescription: string) => {
    updateNode({
      ...selectedNode,
      data: {
        ...selectedNode.data,
        description: newDescription,
      },
    })
  }

  const handleImageChange = (imageUrl: string) => {
    updateNode({
      ...selectedNode,
      data: {
        ...selectedNode.data,
        imageUrl,
      },
    })
  }

  const handleParametersChange = (parameters: Record<string, unknown>) => {
    updateNode({ ...selectedNode, data: { ...selectedNode.data, parameters } })
  }

  const handleDelete = () => {
    deleteNode(effectiveNodeId)
    addToast(`Node "${selectedNode.data.label}" deleted`, 'success')
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'auto',
        padding: '0',
      }}
    >
      {/* Header Section */}
      <div
        style={{
          padding: '16px',
          borderBottom: `1px solid var(--stitch-border)`,
          flexShrink: 0,
        }}
      >
        <h3
          style={{
            margin: '0 0 8px 0',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--stitch-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Node Properties
        </h3>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px',
            backgroundColor: 'var(--stitch-elevated)',
            borderRadius: '6px',
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: selectedNode.data.color || 'var(--stitch-accent)',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: '13px',
              color: 'var(--stitch-text)',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {selectedNode.data.label}
          </span>
        </div>
        <select aria-label="Cambiar nodo seleccionado" value={effectiveNodeId} onChange={(event) => setAnnouncedNodeId(event.target.value)} style={{width:'100%',marginTop:8,padding:7,background:'var(--stitch-elevated)',color:'var(--stitch-text)',border:'1px solid var(--stitch-border)',borderRadius:6,fontSize:11}}>{workflow.nodes.map((node)=><option key={node.id} value={node.id}>{node.data.label || node.id}</option>)}</select>
      </div>

      {/* Properties */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        {/* Node ID */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--stitch-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '6px',
            }}
          >
            Node ID
          </label>
          <input
            type="text"
            value={effectiveNodeId}
            disabled
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: 'var(--stitch-elevated)',
              border: `1px solid var(--stitch-border)`,
              borderRadius: '6px',
              color: 'var(--stitch-muted)',
              fontSize: '12px',
              fontFamily: 'monospace',
              cursor: 'not-allowed',
              outline: 'none',
            }}
          />
        </div>

        {/* Label */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--stitch-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '6px',
            }}
          >
            Label
          </label>
          <input
            type="text"
            value={selectedNode.data.label || ''}
            onChange={(e) => handleLabelChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: 'var(--stitch-elevated)',
              border: `1px solid var(--stitch-border)`,
              borderRadius: '6px',
              color: 'var(--stitch-text)',
              fontSize: '12px',
              fontFamily: 'Inter, sans-serif',
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

        {/* Description */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--stitch-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '6px',
            }}
          >
            Description
          </label>
          <RichTextEditor
            value={(selectedNode.data.description as string) || ''}
            onChange={handleDescriptionChange}
            placeholder="Add a description..."
            simple={false}
          />
        </div>

        {/* Node Type */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--stitch-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '6px',
            }}
          >
            Type
          </label>
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: 'var(--stitch-elevated)',
              border: `1px solid var(--stitch-border)`,
              borderRadius: '6px',
              color: 'var(--stitch-text)',
              fontSize: '12px',
            }}
          >
            {selectedNode.data.type || 'unknown'}
          </div>
        </div>

        {/* Position */}
        <N8nNodeConfiguration node={selectedNode} onChange={handleParametersChange} />

        {/* Position */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--stitch-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '6px',
            }}
          >
            Position
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
            }}
          >
            <div>
              <small
                style={{
                  display: 'block',
                  fontSize: '10px',
                  color: 'var(--stitch-muted)',
                  marginBottom: '4px',
                }}
              >
                X
              </small>
              <input
                type="number"
                value={Math.round(selectedNode.position.x)}
                disabled
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  backgroundColor: 'var(--stitch-elevated)',
                  border: `1px solid var(--stitch-border)`,
                  borderRadius: '4px',
                  color: 'var(--stitch-muted)',
                  fontSize: '11px',
                  cursor: 'not-allowed',
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <small
                style={{
                  display: 'block',
                  fontSize: '10px',
                  color: 'var(--stitch-muted)',
                  marginBottom: '4px',
                }}
              >
                Y
              </small>
              <input
                type="number"
                value={Math.round(selectedNode.position.y)}
                disabled
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  backgroundColor: 'var(--stitch-elevated)',
                  border: `1px solid var(--stitch-border)`,
                  borderRadius: '4px',
                  color: 'var(--stitch-muted)',
                  fontSize: '11px',
                  cursor: 'not-allowed',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Cover Image */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--stitch-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '6px',
            }}
          >
            Cover Image
          </label>
          <ImageUpload
            value={(selectedNode.data.imageUrl as string) || ''}
            onChange={handleImageChange}
            maxSize={5}
          />
        </div>

        {/* Status */}
        {selectedNode.data.status && (
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--stitch-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '6px',
              }}
            >
              Status
            </label>
            <div
              style={{
                display: 'inline-block',
                padding: '4px 8px',
                backgroundColor: 'var(--stitch-elevated)',
                border: `1px solid var(--stitch-border)`,
                borderRadius: '4px',
                color: 'var(--stitch-accent)',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'capitalize',
              }}
            >
              {selectedNode.data.status}
            </div>
          </div>
        )}

        {/* Debug: input/output real de la ultima ejecucion, estilo n8n */}
        <NodeDebugPanel nodeId={effectiveNodeId} />
      </div>

      {/* Delete Button */}
      <div
        style={{
          padding: '16px',
          borderTop: `1px solid var(--stitch-border)`,
          flexShrink: 0,
        }}
      >
        <button
          onClick={handleDelete}
          style={{
            width: '100%',
            padding: '10px 12px',
            backgroundColor: 'rgba(237, 49, 93, 0.15)',
            border: `1px solid rgb(237, 49, 93)`,
            borderRadius: '6px',
            color: 'rgb(237, 49, 93)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(237, 49, 93, 0.25)'
            e.currentTarget.style.borderColor = 'rgb(237, 49, 93)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(237, 49, 93, 0.15)'
            e.currentTarget.style.borderColor = 'rgb(237, 49, 93)'
          }}
        >
          <Trash2 size={14} />
          Delete Node
        </button>
      </div>
    </div>
  )
}
