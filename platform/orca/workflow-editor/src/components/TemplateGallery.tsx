'use client'

import { useState, useMemo } from 'react'
import { BookOpen, ChevronRight, Tag } from 'lucide-react'
import { getTemplateMetadata, getTemplateCategories, TemplateMetadata } from '../constants/workflowTemplates'

interface TemplateGalleryProps {
  onSelectTemplate?: (templateId: string) => void
}

/**
 * Gallery component for browsing workflow templates
 */
export default function TemplateGallery({ onSelectTemplate }: TemplateGalleryProps) {
  const allTemplates = useMemo(() => getTemplateMetadata(), [])
  const categories = useMemo(() => getTemplateCategories(), [])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredTemplates = useMemo(() => {
    if (!selectedCategory) return allTemplates
    return allTemplates.filter((t) => t.category === selectedCategory)
  }, [allTemplates, selectedCategory])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '16px',
        backgroundColor: 'rgb(var(--color-base-100))',
        borderRadius: '8px',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <BookOpen size={20} color='rgb(var(--color-primary-400))' />
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--stitch-text)' }}>
            Workflow Templates
          </h2>
        </div>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--stitch-muted)' }}>
          {allTemplates.length} templates available
        </p>
      </div>

      {/* Categories */}
      {categories.length > 1 && (
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              marginBottom: '12px',
            }}
          >
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                padding: '4px 12px',
                borderRadius: '4px',
                border: `1px solid ${selectedCategory === null ? 'rgb(var(--color-primary-400))' : 'var(--stitch-border)'}`,
                backgroundColor: selectedCategory === null ? 'rgba(var(--color-primary-400), 0.1)' : 'transparent',
                color: 'var(--stitch-text)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
              }}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '4px',
                  border: `1px solid ${selectedCategory === category ? 'rgb(var(--color-primary-400))' : 'var(--stitch-border)'}`,
                  backgroundColor: selectedCategory === category ? 'rgba(var(--color-primary-400), 0.1)' : 'transparent',
                  color: 'var(--stitch-text)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Templates List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {filteredTemplates.length === 0 ? (
          <div
            style={{
              padding: '24px',
              textAlign: 'center',
              color: 'var(--stitch-muted)',
            }}
          >
            No templates in this category
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={() => onSelectTemplate?.(template.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

/**
 * Individual template card
 */
function TemplateCard({
  template,
  onSelect,
}: {
  template: TemplateMetadata
  onSelect: () => void
}) {
  const difficultyColor = {
    beginner: '#16c784',
    intermediate: '#ffa500',
    advanced: '#ff6b6b',
  }[template.difficulty]

  return (
    <button
      onClick={onSelect}
      style={{
        padding: '12px',
        border: '1px solid var(--stitch-border)',
        borderRadius: '6px',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(var(--color-primary-400), 0.05)'
        e.currentTarget.style.borderColor = 'rgb(var(--color-primary-400))'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
        e.currentTarget.style.borderColor = 'var(--stitch-border)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--stitch-text)',
              marginBottom: '4px',
            }}
          >
            {template.name}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: 'var(--stitch-muted)',
              marginBottom: '6px',
              lineHeight: '1.4',
            }}
          >
            {template.description}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            {/* Difficulty badge */}
            <span
              style={{
                padding: '2px 6px',
                borderRadius: '3px',
                fontSize: '10px',
                fontWeight: '600',
                color: 'white',
                backgroundColor: difficultyColor,
                textTransform: 'capitalize',
              }}
            >
              {template.difficulty}
            </span>

            {/* Node and edge counts */}
            <span
              style={{
                fontSize: '10px',
                color: 'var(--stitch-muted)',
              }}
            >
              {template.nodeCount} nodes • {template.edgeCount} connections
            </span>
          </div>

          {/* Tags */}
          {template.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
              {template.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '10px',
                    backgroundColor: 'rgba(var(--color-primary-400), 0.1)',
                    color: 'rgb(var(--color-primary-400))',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <Tag size={8} />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <ChevronRight size={16} color='var(--stitch-muted)' style={{ flexShrink: 0 }} />
      </div>
    </button>
  )
}
