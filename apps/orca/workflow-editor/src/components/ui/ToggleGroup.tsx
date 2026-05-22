import { useCallback } from 'react'

interface ToggleItem {
  id: string
  label: string
  icon?: React.ReactNode
}

interface ToggleGroupProps {
  items: ToggleItem[]
  value: string
  onChange: (value: string) => void
  variant?: 'default' | 'small'
}

export default function ToggleGroup({
  items,
  value,
  onChange,
  variant = 'default',
}: ToggleGroupProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, itemId: string) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        const currentIndex = items.findIndex((item) => item.id === itemId)
        const nextItem = items[(currentIndex + 1) % items.length]
        onChange(nextItem.id)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        const currentIndex = items.findIndex((item) => item.id === itemId)
        const prevItem = items[(currentIndex - 1 + items.length) % items.length]
        onChange(prevItem.id)
      }
    },
    [items, onChange]
  )

  const baseSize = variant === 'small' ? '32px' : '40px'
  const fontSize = variant === 'small' ? '11px' : '12px'
  const padding = variant === 'small' ? '8px 6px' : '8px 12px'

  return (
    <div
      role="group"
      style={{
        display: 'flex',
        gap: '4px',
        backgroundColor: 'rgba(var(--color-base-300), 0.5)',
        padding: '4px',
        borderRadius: '6px',
        border: '1px solid var(--stitch-border)',
      }}
    >
      {items.map((item) => {
        const isActive = item.id === value

        return (
          <button
            key={item.id}
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(item.id)}
            onKeyDown={(e) => handleKeyDown(e, item.id)}
            tabIndex={isActive ? 0 : -1}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              minWidth: baseSize,
              height: baseSize,
              padding,
              backgroundColor: isActive ? 'rgba(74, 158, 255, 0.15)' : 'transparent',
              border: isActive ? '1px solid rgb(74, 158, 255)' : '1px solid var(--stitch-border)',
              borderRadius: '4px',
              color: isActive ? 'rgb(74, 158, 255)' : 'var(--stitch-text)',
              fontSize,
              fontWeight: isActive ? '600' : '500',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'rgba(var(--color-base-400), 0.3)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            {item.icon && <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>}
            {item.label && variant !== 'small' && <span>{item.label}</span>}
          </button>
        )
      })}
    </div>
  )
}
