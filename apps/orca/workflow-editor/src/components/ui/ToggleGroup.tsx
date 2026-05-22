import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'

interface ToggleGroupItem {
  id: string
  label: string
  icon: any
}

interface ToggleGroupProps {
  items: ToggleGroupItem[]
  value: string
  onChange: (value: string) => void
}

export default function ToggleGroup({ items, value, onChange }: ToggleGroupProps) {
  return (
    <ToggleGroupPrimitive.Root
      type="single"
      value={value}
      onValueChange={onChange}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      {items.map((item) => {
        const Icon = item.icon
        const isActive = value === item.id

        return (
          <ToggleGroupPrimitive.Item
            key={item.id}
            value={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              backgroundColor: isActive ? 'rgba(74, 158, 255, 0.15)' : 'transparent',
              border: `1.5px solid ${isActive ? 'var(--stitch-accent)' : 'var(--stitch-border)'}`,
              color: isActive ? 'var(--stitch-accent)' : 'var(--stitch-muted)',
              fontWeight: isActive ? 600 : 400,
              cursor: 'pointer',
              borderRadius: '6px',
              transition: 'all 0.2s ease',
              userSelect: 'none',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = 'var(--stitch-accent)'
                e.currentTarget.style.color = 'var(--stitch-accent)'
                e.currentTarget.style.backgroundColor = 'rgba(74, 158, 255, 0.08)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = 'var(--stitch-border)'
                e.currentTarget.style.color = 'var(--stitch-muted)'
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            <Icon size={14} />
            <span>{item.label}</span>
          </ToggleGroupPrimitive.Item>
        )
      })}
    </ToggleGroupPrimitive.Root>
  )
}
