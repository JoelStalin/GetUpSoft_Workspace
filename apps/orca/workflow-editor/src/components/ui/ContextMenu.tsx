import * as ContextMenuPrimitive from '@radix-ui/react-context-menu'
import { Edit, Copy, Trash2, Lock } from 'lucide-react'

interface ContextMenuProps {
  children: React.ReactNode
  items: Array<{
    icon?: any
    label?: string
    onClick?: () => void
    color?: string
    separator?: boolean
  }>
}

export default function ContextMenu({ children, items }: ContextMenuProps) {
  return (
    <ContextMenuPrimitive.Root>
      <ContextMenuPrimitive.Trigger asChild>
        {children}
      </ContextMenuPrimitive.Trigger>

      <ContextMenuPrimitive.Content
        style={{
          backgroundColor: 'rgb(var(--color-base-200))',
          border: '1px solid var(--stitch-border)',
          borderRadius: '8px',
          padding: '4px 0',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
          zIndex: 10000,
          minWidth: '180px',
          animation: 'fadeIn 0.15s ease',
        }}
      >
        {items.map((item, idx) => {
          if (item.separator) {
            return (
              <ContextMenuPrimitive.Separator
                key={`separator-${idx}`}
                style={{
                  height: '1px',
                  backgroundColor: 'var(--stitch-border)',
                  margin: '4px 0',
                }}
              />
            )
          }

          const Icon = item.icon

          return (
            <ContextMenuPrimitive.Item
              key={idx}
              onSelect={item.onClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                fontSize: '12px',
                color: item.color || 'var(--stitch-text)',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--stitch-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {Icon && <Icon size={14} />}
              <span>{item.label}</span>
            </ContextMenuPrimitive.Item>
          )
        })}
      </ContextMenuPrimitive.Content>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </ContextMenuPrimitive.Root>
  )
}

export { Edit, Copy, Trash2, Lock }
