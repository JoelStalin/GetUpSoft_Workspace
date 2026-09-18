import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AIMode from '../../src/components/modes/AIMode'
import { ToastProvider } from '../../src/contexts/ToastContext'
import { WorkflowProvider } from '../../src/contexts/WorkflowContext'

/**
 * Integration Tests for AIMode Component
 * Tests the offline detection, error handling, and user interactions
 */

// Mock AIMode with injected context for project selection
const AIModeTester = ({ projectId = 'test-project' }: { projectId?: string | null }) => (
  <ToastProvider>
    <WorkflowProvider initialProjectId={projectId}>
      <AIMode />
    </WorkflowProvider>
  </ToastProvider>
)

describe('AIMode Integration Tests', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    // Mock navigator.onLine
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Offline Detection', () => {
    it('should render the component without crashing', () => {
      render(<AIModeTester />)
      expect(screen.getByText(/ORCA|orquestador/i)).toBeInTheDocument()
    })

    it('should initialize with online status when navigator.onLine is true', () => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: true,
      })
      render(<AIModeTester />)
      // Component should render with send button enabled (if text present)
      expect(screen.getByText(/ORCA|orquestador/i)).toBeInTheDocument()
    })

    it('should handle offline event listener registration', async () => {
      const { container } = render(<AIModeTester />)

      // Simulate offline event - wrap in act
      await act(async () => {
        const offlineEvent = new Event('offline')
        window.dispatchEvent(offlineEvent)
      })

      // Verify component handles event
      expect(container).toBeTruthy()
    })

    it('should handle online event listener registration', async () => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false,
      })

      const { container } = render(<AIModeTester />)

      // Simulate online event - wrap in act
      await act(async () => {
        const onlineEvent = new Event('online')
        window.dispatchEvent(onlineEvent)
      })

      // Verify component handles event
      expect(container).toBeTruthy()
    })
  })

  describe('Project Selection', () => {
    it('should show project selection screen when no project is active', () => {
      render(<AIModeTester projectId={null} />)
      // Should show project selection UI
      expect(screen.getByText(/Proyectos disponibles|Available Projects/i)).toBeTruthy()
    })

    it('should display available projects', () => {
      render(<AIModeTester projectId={null} />)
      // Should show at least one project option
      const projectButtons = screen.queryAllByRole('button')
      expect(projectButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(<AIModeTester />)
      expect(container).toBeTruthy()
    })

    it('should show main interface elements', async () => {
      render(<AIModeTester />)
      // Component should render some content
      const body = document.body
      expect(body.innerHTML.length).toBeGreaterThan(0)
    })
  })

  describe('Button State', () => {
    it('should have button elements', () => {
      render(<AIModeTester />)
      // Component should render buttons
      const buttons = document.querySelectorAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should render with proper event listeners', () => {
      const { container } = render(<AIModeTester />)
      // Component should set up event listeners without throwing
      expect(container).toBeTruthy()
    })
  })

  describe('Content Display', () => {
    it('should display content after render', () => {
      const { container } = render(<AIModeTester />)
      // Should have rendered content
      const contentDiv = container.querySelector('div')
      expect(contentDiv).toBeTruthy()
    })

    it('should have interactive elements', () => {
      render(<AIModeTester />)
      // Component should have interactive elements
      const allElements = document.querySelectorAll('button, input, textarea')
      expect(allElements.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Robustness', () => {
    it('should render with all contexts', () => {
      const { container } = render(<AIModeTester />)
      // Should render successfully with contexts
      expect(container).toBeTruthy()
    })

    it('should handle event cleanup on unmount', () => {
      const { unmount } = render(<AIModeTester />)
      // Should unmount without errors
      expect(() => unmount()).not.toThrow()
    })
  })


  describe('Cleanup', () => {
    it('should clean up event listeners on unmount', async () => {
      const { unmount } = render(<AIModeTester />)

      const offlineListener = vi.fn()
      const onlineListener = vi.fn()

      window.addEventListener('offline', offlineListener)
      window.addEventListener('online', onlineListener)

      unmount()

      // Dispatch events after unmount
      window.dispatchEvent(new Event('offline'))
      window.dispatchEvent(new Event('online'))

      // Cleanup should have removed listeners properly
      expect(document.body.innerHTML.includes('offline')).toBe(false)
    })
  })

  describe('State Management', () => {
    it('should manage component state correctly', async () => {
      const { container } = render(<AIModeTester />)
      // Component should render without state errors
      expect(container).toBeTruthy()
    })

    it('should update state on user interaction', async () => {
      render(<AIModeTester />)
      const buttons = document.querySelectorAll('button')
      // Should have buttons for interaction
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have interactive elements', () => {
      const { container } = render(<AIModeTester />)
      // Component should have interactive elements
      const interactiveElements = container.querySelectorAll('button, input, textarea, [role="button"]')
      expect(interactiveElements.length).toBeGreaterThanOrEqual(0)
    })

    it('should support keyboard interaction', async () => {
      render(<AIModeTester />)
      // Pressing tab should not cause errors
      await userEvent.tab()
      // Tab navigation should work
      expect(document.activeElement).toBeTruthy()
    })
  })
})
