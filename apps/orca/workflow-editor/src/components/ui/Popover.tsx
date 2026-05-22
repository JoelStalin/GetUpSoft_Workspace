import * as PopoverPrimitive from '@radix-ui/react-popover'
import { X } from 'lucide-react'

interface PopoverProps {
  trigger: React.ReactNode
  children: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  showClose?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function Popover({
  trigger,
  children,
  side = 'bottom',
  align = 'center',
  showClose = false,
  onOpenChange,
}: PopoverProps) {
  return (
    <PopoverPrimitive.Root onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        {trigger}
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side={side}
          align={align}
          style={{
            backgroundColor: 'rgb(var(--color-base-200))',
            border: '1px solid var(--stitch-border)',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
            zIndex: 9999,
            animation: 'fadeIn 0.15s ease',
            minWidth: '200px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {showClose && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <PopoverPrimitive.Close
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
                  <X size={14} />
                </PopoverPrimitive.Close>
              </div>
            )}
            {children}
          </div>

          <PopoverPrimitive.Arrow
            style={{
              fill: 'rgb(var(--color-base-200))',
              stroke: 'var(--stitch-border)',
              strokeWidth: 1,
            }}
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>

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
    </PopoverPrimitive.Root>
  )
}
