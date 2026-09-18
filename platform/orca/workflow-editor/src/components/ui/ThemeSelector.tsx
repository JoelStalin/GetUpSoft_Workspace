import { useState, useEffect } from 'react'
import { Sun, Moon, Palette } from 'lucide-react'

export type Theme = 'dark' | 'light'
export type ColorScheme = 'default' | 'ocean' | 'forest' | 'sunset' | 'purple'

interface ColorPalette {
  name: string
  primary: string
  accent: string
  success: string
  warning: string
  error: string
}

const PALETTES: Record<ColorScheme, ColorPalette> = {
  default: {
    name: 'Default',
    primary: '#4A9EFF',
    accent: '#4A9EFF',
    success: '#1DB954',
    warning: '#FF9F43',
    error: '#ED315D',
  },
  ocean: {
    name: 'Ocean',
    primary: '#0096D6',
    accent: '#00D4FF',
    success: '#00B894',
    warning: '#FFB347',
    error: '#FF6B6B',
  },
  forest: {
    name: 'Forest',
    primary: '#27AE60',
    accent: '#2ECC71',
    success: '#16A085',
    warning: '#F39C12',
    error: '#E74C3C',
  },
  sunset: {
    name: 'Sunset',
    primary: '#E74C3C',
    accent: '#E67E22',
    success: '#F39C12',
    warning: '#F1C40F',
    error: '#C0392B',
  },
  purple: {
    name: 'Purple',
    primary: '#9B59B6',
    accent: '#AF7AC5',
    success: '#8E44AD',
    warning: '#D35400',
    error: '#E91E63',
  },
}

interface ThemeSelectorProps {
  onThemeChange?: (theme: Theme) => void
  onSchemeChange?: (scheme: ColorScheme) => void
}

export default function ThemeSelector({ onThemeChange, onSchemeChange }: ThemeSelectorProps) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [colorScheme, setColorScheme] = useState<ColorScheme>('default')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('orca_theme') as Theme | null
    const savedScheme = localStorage.getItem('orca_color_scheme') as ColorScheme | null

    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.setAttribute('data-mode', savedTheme)
    }

    if (savedScheme) {
      setColorScheme(savedScheme)
      applyColorScheme(savedScheme)
    }
  }, [])

  const applyColorScheme = (scheme: ColorScheme) => {
    const palette = PALETTES[scheme]
    const root = document.documentElement

    root.style.setProperty('--stitch-primary', palette.primary)
    root.style.setProperty('--stitch-accent', palette.accent)
    root.style.setProperty('--stitch-green', palette.success)
    root.style.setProperty('--stitch-warning', palette.warning)
    root.style.setProperty('--stitch-error', palette.error)
  }

  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-mode', newTheme)
    localStorage.setItem('orca_theme', newTheme)
    onThemeChange?.(newTheme)
  }

  const handleSchemeChange = (scheme: ColorScheme) => {
    setColorScheme(scheme)
    applyColorScheme(scheme)
    localStorage.setItem('orca_color_scheme', scheme)
    onSchemeChange?.(scheme)
    setIsOpen(false)
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Theme Toggle Button */}
      <button
        onClick={handleThemeToggle}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        style={{
          padding: '6px 10px',
          borderRadius: '6px',
          backgroundColor: 'var(--stitch-hover)',
          border: `1px solid var(--stitch-border)`,
          color: 'var(--stitch-text)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '11px',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--stitch-accent)'
          e.currentTarget.style.color = 'var(--stitch-accent)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--stitch-border)'
          e.currentTarget.style.color = 'var(--stitch-text)'
        }}
      >
        {theme === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
      </button>

      {/* Color Scheme Selector */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Change color scheme"
        style={{
          padding: '6px 10px',
          borderRadius: '6px',
          backgroundColor: 'var(--stitch-hover)',
          border: `1px solid var(--stitch-border)`,
          color: 'var(--stitch-text)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '11px',
          marginLeft: '4px',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--stitch-accent)'
          e.currentTarget.style.color = 'var(--stitch-accent)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--stitch-border)'
          e.currentTarget.style.color = 'var(--stitch-text)'
        }}
      >
        <Palette size={12} />
      </button>

      {/* Color Scheme Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '4px',
            backgroundColor: 'rgb(var(--color-base-200))',
            border: `1px solid var(--stitch-border)`,
            borderRadius: '8px',
            padding: '6px',
            zIndex: 10000,
            minWidth: '200px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
          }}
        >
          {(Object.entries(PALETTES) as [ColorScheme, ColorPalette][]).map(([key, palette]) => (
            <button
              key={key}
              onClick={() => handleSchemeChange(key)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: '6px',
                backgroundColor: colorScheme === key ? 'var(--stitch-hover)' : 'transparent',
                border: 'none',
                color: 'var(--stitch-text)',
                cursor: 'pointer',
                fontSize: '11px',
                textAlign: 'left',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--stitch-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  colorScheme === key ? 'var(--stitch-hover)' : 'transparent'
              }}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: palette.primary,
                  flexShrink: 0,
                }}
              />
              <span>{palette.name}</span>
              {colorScheme === key && (
                <div
                  style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--stitch-accent)',
                    marginLeft: 'auto',
                  }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
