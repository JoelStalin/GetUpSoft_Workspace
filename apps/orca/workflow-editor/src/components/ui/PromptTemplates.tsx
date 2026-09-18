import { useState } from 'react'
import { Search, Star, Copy, Plus } from 'lucide-react'

export interface Prompt {
  id: string
  title: string
  category: string
  description: string
  template: string
  icon?: string
  favorite?: boolean
}

interface PromptTemplatesProps {
  onSelectPrompt: (prompt: Prompt) => void
}

const DEFAULT_PROMPTS: Prompt[] = [
  {
    id: '1',
    title: 'Add Node',
    category: 'Workflow',
    description: 'Add a new node to the workflow',
    template: 'Add a {nodeType} node that {action}',
    icon: '➕',
    favorite: true,
  },
  {
    id: '2',
    title: 'Connect Nodes',
    category: 'Workflow',
    description: 'Connect two nodes in the workflow',
    template: 'Connect {sourceNode} to {targetNode}',
    icon: '🔗',
    favorite: true,
  },
  {
    id: '3',
    title: 'Debug Node',
    category: 'Debug',
    description: 'Debug and troubleshoot a node',
    template: 'Debug the {nodeName} node. Why is it {issue}?',
    icon: '🐛',
    favorite: false,
  },
  {
    id: '4',
    title: 'Optimize Flow',
    category: 'Optimization',
    description: 'Optimize workflow performance',
    template: 'Optimize this workflow for {metric}. Current bottleneck: {bottleneck}',
    icon: '⚡',
    favorite: false,
  },
  {
    id: '5',
    title: 'Generate Code',
    category: 'Dev',
    description: 'Generate code snippet for a task',
    template: 'Generate {language} code for {task}',
    icon: '💻',
    favorite: false,
  },
  {
    id: '6',
    title: 'Test Workflow',
    category: 'Testing',
    description: 'Create test cases for workflow',
    template: 'Create test cases for {workflow}. Test scenarios: {scenarios}',
    icon: '✅',
    favorite: false,
  },
]

export default function PromptTemplates({ onSelectPrompt }: PromptTemplatesProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<string[]>(
    DEFAULT_PROMPTS.filter((p) => p.favorite).map((p) => p.id)
  )

  const categories = Array.from(new Set(DEFAULT_PROMPTS.map((p) => p.category)))

  const filteredPrompts = DEFAULT_PROMPTS.filter((prompt) => {
    const matchesSearch = prompt.title.toLowerCase().includes(search.toLowerCase()) ||
      prompt.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !selectedCategory || prompt.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: '12px',
      }}
    >
      {/* Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 8px',
          backgroundColor: 'var(--stitch-elevated)',
          border: `1px solid var(--stitch-border)`,
          borderRadius: '6px',
        }}
      >
        <Search size={14} style={{ color: 'var(--stitch-muted)' }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search prompts..."
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--stitch-text)',
            fontSize: '11px',
            outline: 'none',
          }}
        />
      </div>

      {/* Categories */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setSelectedCategory(null)}
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            backgroundColor: selectedCategory === null ? 'var(--stitch-accent)' : 'var(--stitch-hover)',
            border: 'none',
            color: selectedCategory === null ? '#fff' : 'var(--stitch-text)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              backgroundColor: selectedCategory === cat ? 'var(--stitch-accent)' : 'var(--stitch-hover)',
              border: 'none',
              color: selectedCategory === cat ? '#fff' : 'var(--stitch-text)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Prompts List */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        {filteredPrompts.length === 0 ? (
          <div
            style={{
              padding: '16px',
              textAlign: 'center',
              color: 'var(--stitch-muted)',
              fontSize: '11px',
            }}
          >
            No prompts found
          </div>
        ) : (
          filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              style={{
                padding: '8px',
                backgroundColor: 'var(--stitch-elevated)',
                border: `1px solid var(--stitch-border)`,
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--stitch-hover)'
                e.currentTarget.style.borderColor = 'var(--stitch-accent)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--stitch-elevated)'
                e.currentTarget.style.borderColor = 'var(--stitch-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <span style={{ fontSize: '14px' }}>{prompt.icon || '📝'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--stitch-text)',
                      marginBottom: '2px',
                    }}
                  >
                    {prompt.title}
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: 'var(--stitch-muted)',
                      marginBottom: '4px',
                      lineHeight: 1.3,
                    }}
                  >
                    {prompt.description}
                  </div>
                  <div
                    style={{
                      fontSize: '9px',
                      color: 'var(--stitch-muted)',
                      fontFamily: 'monospace',
                      padding: '4px',
                      backgroundColor: 'rgb(var(--color-base-200))',
                      borderRadius: '3px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {prompt.template}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  marginTop: '6px',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleFavorite(prompt.id)
                  }}
                  title={favorites.includes(prompt.id) ? 'Remove from favorites' : 'Add to favorites'}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: favorites.includes(prompt.id)
                      ? 'rgb(255, 159, 67)'
                      : 'var(--stitch-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'rgb(255, 159, 67)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = favorites.includes(prompt.id)
                      ? 'rgb(255, 159, 67)'
                      : 'var(--stitch-muted)'
                  }}
                >
                  <Star size={12} fill={favorites.includes(prompt.id) ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigator.clipboard.writeText(prompt.template)
                  }}
                  title="Copy template"
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
                    e.currentTarget.style.color = 'var(--stitch-accent)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--stitch-muted)'
                  }}
                >
                  <Copy size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectPrompt(prompt)
                  }}
                  title="Use this prompt"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--stitch-accent)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--stitch-accent)'
                    e.currentTarget.style.opacity = '0.8'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--stitch-accent)'
                    e.currentTarget.style.opacity = '1'
                  }}
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
