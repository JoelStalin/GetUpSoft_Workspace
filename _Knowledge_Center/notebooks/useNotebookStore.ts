/**
 * Zustand Store for JupyterLab Notebook Management
 *
 * Manages state for:
 * - Notebook metadata and structure
 * - Sync status with Obsidian
 * - Memory categories and tags
 * - Export/conversion status
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// FUTURO: Add complex memory graph operations
// - Track relationships between notebooks
// - Build knowledge graph visualization
// - Implement semantic search

export interface NotebookMetadata {
  id: string;
  title: string;
  category: 'memory' | 'analysis' | 'code' | 'research';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  path: string;
  status: 'draft' | 'complete' | 'review';
  confidenceLevel: 'high' | 'medium' | 'low';
}

export interface SyncStatus {
  notebookId: string;
  synced: boolean;
  lastSyncTime: string;
  obsidianPath: string;
  exportFormat: 'markdown' | 'html' | 'pdf';
}

interface NotebookStore {
  // State
  notebooks: NotebookMetadata[];
  syncStatuses: Map<string, SyncStatus>;
  selectedNotebook: NotebookMetadata | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  addNotebook: (notebook: NotebookMetadata) => void;
  updateNotebook: (id: string, updates: Partial<NotebookMetadata>) => void;
  deleteNotebook: (id: string) => void;
  selectNotebook: (id: string) => void;
  setSyncStatus: (notebookId: string, status: SyncStatus) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Query operations
  getNotebooksByCategory: (category: NotebookMetadata['category']) => NotebookMetadata[];
  getNotebooksByTag: (tag: string) => NotebookMetadata[];
  searchNotebooks: (query: string) => NotebookMetadata[];
}

export const useNotebookStore = create<NotebookStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        notebooks: [],
        syncStatuses: new Map(),
        selectedNotebook: null,
        isLoading: false,
        error: null,

        // Actions - State mutations
        addNotebook: (notebook) =>
          set(
            (state) => ({
              notebooks: [...state.notebooks, notebook],
            }),
            false,
            'addNotebook'
          ),

        updateNotebook: (id, updates) =>
          set(
            (state) => ({
              notebooks: state.notebooks.map((nb) =>
                nb.id === id ? { ...nb, ...updates, updatedAt: new Date().toISOString() } : nb
              ),
            }),
            false,
            'updateNotebook'
          ),

        deleteNotebook: (id) =>
          set(
            (state) => ({
              notebooks: state.notebooks.filter((nb) => nb.id !== id),
              syncStatuses: new Map(
                Array.from(state.syncStatuses).filter(([key]) => key !== id)
              ),
              selectedNotebook: state.selectedNotebook?.id === id ? null : state.selectedNotebook,
            }),
            false,
            'deleteNotebook'
          ),

        selectNotebook: (id) =>
          set(
            (state) => ({
              selectedNotebook: state.notebooks.find((nb) => nb.id === id) || null,
            }),
            false,
            'selectNotebook'
          ),

        setSyncStatus: (notebookId, status) =>
          set(
            (state) => {
              const newSyncStatuses = new Map(state.syncStatuses);
              newSyncStatuses.set(notebookId, status);
              return { syncStatuses: newSyncStatuses };
            },
            false,
            'setSyncStatus'
          ),

        setLoading: (loading) =>
          set({ isLoading: loading }, false, 'setLoading'),

        setError: (error) =>
          set({ error }, false, 'setError'),

        // Query operations - Read-only selectors
        getNotebooksByCategory: (category) => {
          const state = get();
          return state.notebooks.filter((nb) => nb.category === category);
        },

        getNotebooksByTag: (tag) => {
          const state = get();
          return state.notebooks.filter((nb) => nb.tags.includes(tag));
        },

        searchNotebooks: (query) => {
          const state = get();
          const lowerQuery = query.toLowerCase();
          return state.notebooks.filter(
            (nb) =>
              nb.title.toLowerCase().includes(lowerQuery) ||
              nb.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
              nb.category.toLowerCase().includes(lowerQuery)
          );
        },
      }),
      {
        name: 'notebook-store', // Persist to localStorage
      }
    )
  )
);

// FUTURO: Add derived selectors
// - useNotebooksByDate()
// - useMemoryGraphData()
// - useSyncProgress()
// - useDashboardMetrics()
