import { useState, useCallback, useMemo } from 'react'

export interface User {
  id: string
  name: string
  avatar?: string
  color?: string
}

export interface MentionState {
  isOpen: boolean
  query: string
  position: { x: number; y: number }
  selectedIndex: number
}

const MOCK_USERS: User[] = [
  { id: '1', name: 'Claude AI', avatar: '🤖', color: '#4A9EFF' },
  { id: '2', name: 'Design Team', avatar: '👥', color: '#7C4DFF' },
  { id: '3', name: 'Backend Dev', avatar: '⚙️', color: '#1A9BA1' },
  { id: '4', name: 'Product Manager', avatar: '📊', color: '#FF9F43' },
  { id: '5', name: 'QA Engineer', avatar: '🧪', color: '#FF6D5A' },
]

export function useMentions() {
  const [mentions, setMentions] = useState<MentionState>({
    isOpen: false,
    query: '',
    position: { x: 0, y: 0 },
    selectedIndex: 0,
  })

  const filteredUsers = useMemo(() => {
    if (!mentions.isOpen || !mentions.query) return MOCK_USERS
    return MOCK_USERS.filter((user) =>
      user.name.toLowerCase().includes(mentions.query.toLowerCase())
    )
  }, [mentions.isOpen, mentions.query])

  const handleInputChange = useCallback(
    (text: string, cursorPos: number) => {
      // Find the last @ symbol
      const lastAtIndex = text.lastIndexOf('@', cursorPos)

      if (lastAtIndex === -1 || lastAtIndex === cursorPos - 1) {
        setMentions((prev) => ({ ...prev, isOpen: false }))
        return
      }

      // Check if @ is followed by whitespace
      if (lastAtIndex < text.length - 1 && text[lastAtIndex + 1] === ' ') {
        setMentions((prev) => ({ ...prev, isOpen: false }))
        return
      }

      // Extract query after @
      const query = text.substring(lastAtIndex + 1, cursorPos)

      // Only show if @ followed by letters/numbers
      if (/^[a-zA-Z0-9]*$/.test(query)) {
        setMentions((prev) => ({
          ...prev,
          isOpen: true,
          query,
          selectedIndex: 0,
        }))
      } else {
        setMentions((prev) => ({ ...prev, isOpen: false }))
      }
    },
    []
  )

  const selectMention = useCallback((user: User) => {
    setMentions((prev) => ({
      ...prev,
      isOpen: false,
      query: '',
      selectedIndex: 0,
    }))
    return user
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!mentions.isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setMentions((prev) => ({
            ...prev,
            selectedIndex: (prev.selectedIndex + 1) % filteredUsers.length,
          }))
          break
        case 'ArrowUp':
          e.preventDefault()
          setMentions((prev) => ({
            ...prev,
            selectedIndex:
              prev.selectedIndex === 0 ? filteredUsers.length - 1 : prev.selectedIndex - 1,
          }))
          break
        case 'Enter':
          e.preventDefault()
          if (filteredUsers[mentions.selectedIndex]) {
            selectMention(filteredUsers[mentions.selectedIndex])
          }
          break
        case 'Escape':
          setMentions((prev) => ({ ...prev, isOpen: false }))
          break
      }
    },
    [mentions.isOpen, mentions.selectedIndex, filteredUsers, selectMention]
  )

  return {
    mentions,
    filteredUsers,
    handleInputChange,
    selectMention,
    handleKeyDown,
    users: MOCK_USERS,
  }
}
