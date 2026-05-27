import { useWorkflowOperations } from '../hooks/useWorkflowOperations'
import { useToast } from '../contexts/ToastContext'
import { Settings, Trash2 } from 'lucide-react'
import RichTextEditor from './ui/RichTextEditor'
import ImageUpload from './ui/ImageUpload'

/**
 * MIGRATED: Uses P2 hooks (useWorkflowOperations)
 */
export default function FloatingPropertiesPanel() {
  const { workflow, selectedNodeId, deleteNode, updateNode } = useWorkflowOperations()
  const { addToast } = useToast()

  if (!selectedNodeId || !workflow) {
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
      </div>
    )
  }

  const selectedNode = workflow.nodes?.find((n) => n.id === selectedNodeId)

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

  const handleDelete = () => {
    deleteNode(selectedNodeId)
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
            value={selectedNodeId}
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
            value={selectedNode.data.description || ''}
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
            value={selectedNode.data.imageUrl || ''}
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
