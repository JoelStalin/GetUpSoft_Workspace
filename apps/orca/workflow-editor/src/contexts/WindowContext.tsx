import { createContext, useContext, useState, useCallback, useEffect } from 'react'

export interface FloatingWindow {
  id: string
  title: string
  type: 'components' | 'chat' | 'properties' | 'settings' | 'tools'
  x: number
  y: number
  width: number
  height: number
  isMinimized: boolean
  isVisible: boolean
  isLocked: boolean
  zIndex: number
}

interface WindowContextType {
  windows: FloatingWindow[]
  activeWindowId: string | null
  addWindow: (window: Omit<FloatingWindow, 'zIndex'>) => void
  removeWindow: (id: string) => void
  updateWindow: (id: string, updates: Partial<FloatingWindow>) => void
  setActiveWindow: (id: string) => void
  bringToFront: (id: string) => void
  toggleMinimize: (id: string) => void
  toggleLock: (id: string) => void
}

const WindowContext = createContext<WindowContextType | undefined>(undefined)

const STORAGE_KEY = 'orca_windows_state_v3'

const loadWindowsFromStorage = (): FloatingWindow[] => {
  if (typeof window === 'undefined') return getDefaultWindows()
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.warn('Failed to load windows from localStorage:', e)
  }
  return getDefaultWindows()
}

const getDefaultWindows = (): FloatingWindow[] => [
    {
      id: 'components',
      title: 'Components',
      type: 'components',
      x: 16,
      y: 72,
      width: 280,
      height: 500,
      isMinimized: false,
      isVisible: false,
      isLocked: false,
      zIndex: 10,
    },
    {
      id: 'chat',
      title: 'Agent Log',
      type: 'chat',
      x: typeof window !== 'undefined' ? window.innerWidth / 2 - 200 : 540,
      y: typeof window !== 'undefined' ? window.innerHeight / 2 - 140 : 540,
      width: 400,
      height: 280,
      isMinimized: false,
      isVisible: false,
      isLocked: false,
      zIndex: 9,
    },
    {
      id: 'properties',
      title: 'Properties',
      type: 'properties',
      x: typeof window !== 'undefined' ? window.innerWidth - 296 : 1624,
      y: 72,
      width: 280,
      height: 500,
      isMinimized: false,
      isVisible: false,
      isLocked: false,
      zIndex: 8,
    },
  ]

export function WindowProvider({ children }: { children: React.ReactNode }) {
  const [windows, setWindows] = useState<FloatingWindow[]>(loadWindowsFromStorage())
  const [activeWindowId, setActiveWindowId] = useState<string | null>('components')
  const [maxZIndex, setMaxZIndex] = useState(100)

  const addWindow = useCallback(
    (window: Omit<FloatingWindow, 'zIndex'>) => {
      setWindows((prev) => [...prev, { ...window, zIndex: maxZIndex + 1 }])
      setMaxZIndex((prev) => prev + 1)
    },
    [maxZIndex]
  )

  const removeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id))
    if (activeWindowId === id) {
      setActiveWindowId(null)
    }
  }, [activeWindowId])

  const updateWindow = useCallback((id: string, updates: Partial<FloatingWindow>) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...updates } : w))
    )
  }, [])

  const setActiveWindow = useCallback((id: string) => {
    setActiveWindowId(id)
  }, [])

  const bringToFront = useCallback(
    (id: string) => {
      setMaxZIndex((prev) => prev + 1)
      updateWindow(id, { zIndex: maxZIndex + 1 })
      setActiveWindow(id)
    },
    [maxZIndex, updateWindow, setActiveWindow]
  )

  const toggleMinimize = useCallback((id: string) => {
    updateWindow(id, { isMinimized: !windows.find((w) => w.id === id)?.isMinimized })
  }, [windows, updateWindow])

  const toggleLock = useCallback((id: string) => {
    updateWindow(id, { isLocked: !windows.find((w) => w.id === id)?.isLocked })
  }, [windows, updateWindow])

  // Save windows to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(windows))
    } catch (e) {
      console.warn('Failed to save windows to localStorage:', e)
    }
  }, [windows])

  return (
    <WindowContext.Provider
      value={{
        windows,
        activeWindowId,
        addWindow,
        removeWindow,
        updateWindow,
        setActiveWindow,
        bringToFront,
        toggleMinimize,
        toggleLock,
      }}
    >
      {children}
    </WindowContext.Provider>
  )
}

export function useWindows() {
  const context = useContext(WindowContext)
  if (!context) {
    throw new Error('useWindows must be used within WindowProvider')
  }
  return context
}
