import { useEffect } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  cmd?: boolean
  shift?: boolean
  alt?: boolean
  callback: () => void
}

/**
 * Hook for managing global keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()

        const ctrlMatches = (shortcut.ctrl || shortcut.cmd) ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey
        const altMatches = shortcut.alt ? event.altKey : !event.altKey

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
          event.preventDefault()
          shortcut.callback()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

/**
 * Common keyboard shortcuts
 */
export const SHORTCUTS = {
  SEARCH: { key: 'k', cmd: true },
  UNDO: { key: 'z', cmd: true },
  REDO: { key: 'y', cmd: true },
  SAVE: { key: 's', cmd: true },
  EXECUTE: { key: 'Enter', cmd: true },
  ESCAPE: { key: 'Escape' },
  ENTER: { key: 'Enter' },
  ARROW_UP: { key: 'ArrowUp' },
  ARROW_DOWN: { key: 'ArrowDown' },
  ARROW_LEFT: { key: 'ArrowLeft' },
  ARROW_RIGHT: { key: 'ArrowRight' },
}

/**
 * Format keyboard shortcut for display
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const keys = []

  if (shortcut.cmd) keys.push('⌘')
  if (shortcut.ctrl && !shortcut.cmd) keys.push('Ctrl')
  if (shortcut.shift) keys.push('Shift')
  if (shortcut.alt) keys.push('Alt')

  let keyName = shortcut.key
  if (shortcut.key.toLowerCase() === 'k') keyName = 'K'
  if (shortcut.key.toLowerCase() === 'z') keyName = 'Z'
  if (shortcut.key.toLowerCase() === 'y') keyName = 'Y'
  if (shortcut.key.toLowerCase() === 's') keyName = 'S'

  keys.push(keyName)

  return keys.join(' + ')
}

/**
 * Detect if running on Mac
 */
export function isMac(): boolean {
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform)
}

/**
 * Get platform-specific shortcut display (Cmd on Mac, Ctrl elsewhere)
 */
export function getPlatformShortcut(key: string, useCmd = true): string {
  const modifier = isMac() && useCmd ? '⌘' : 'Ctrl'
  return `${modifier} + ${key}`
}
