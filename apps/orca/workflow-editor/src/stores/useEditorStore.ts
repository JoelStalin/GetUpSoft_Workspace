/**
 * Visual Editor State Store (Zustand)
 *
 * Manages the complete state of the visual web editor:
 * - Section metadata (position, size, URL)
 * - Selection and focus state
 * - Undo/redo history
 * - Sync status with iframes
 * - Performance metrics
 *
 * FUTURO: Advanced state management
 * - Implement Command pattern for undo/redo
 * - Add collaborative editing with CRDTs
 * - Implement time-travel debugging
 * - Add state persistence to IndexedDB
 * - Create middleware for analytics events
 * - Add state migration/versioning
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface EditorSection {
  id: string;
  title: string;
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  width: number;
  height: number;
  zIndex: number;
  locked: boolean;
  visible: boolean;
  editMode: 'view' | 'edit' | 'debug';
}

interface EditorHistoryEntry {
  timestamp: number;
  action: string;
  state: EditorState;
}

interface EditorState {
  // Sections management
  sections: EditorSection[];
  selectedSectionId: string | null;
  hoveredSectionId: string | null;

  // Camera state
  cameraPosition: [number, number, number];
  cameraZoom: number;
  cameraRotation: [number, number, number];

  // Editor state
  isDirty: boolean;
  isSaving: boolean;
  saveError: string | null;
  lastSaveTime: string | null;

  // Undo/redo
  history: EditorHistoryEntry[];
  historyIndex: number;

  // Performance
  fps: number;
  memoryUsage: number;

  // Actions
  addSection: (section: EditorSection) => void;
  updateSection: (id: string, updates: Partial<EditorSection>) => void;
  deleteSection: (id: string) => void;
  selectSection: (id: string | null) => void;
  hoverSection: (id: string | null) => void;

  setCameraPosition: (position: [number, number, number]) => void;
  setCameraZoom: (zoom: number) => void;

  reorderSections: (fromIndex: number, toIndex: number) => void;
  duplicateSection: (id: string) => void;

  // History operations
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;

  // Save/Load
  setSaving: (saving: boolean) => void;
  setSaveError: (error: string | null) => void;
  markSaved: () => void;

  // Performance
  setFps: (fps: number) => void;
  setMemoryUsage: (memory: number) => void;
}

export const useEditorStore = create<EditorState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        sections: [],
        selectedSectionId: null,
        hoveredSectionId: null,

        cameraPosition: [0, 10, 20],
        cameraZoom: 1,
        cameraRotation: [0, 0, 0],

        isDirty: false,
        isSaving: false,
        saveError: null,
        lastSaveTime: null,

        history: [],
        historyIndex: -1,

        fps: 0,
        memoryUsage: 0,

        // Section management
        addSection: (section) => {
          set((state) => {
            state.sections.push(section);
            state.isDirty = true;
          });
        },

        updateSection: (id, updates) => {
          set((state) => {
            const section = state.sections.find((s) => s.id === id);
            if (section) {
              Object.assign(section, updates);
              state.isDirty = true;
            }
          });
        },

        deleteSection: (id) => {
          set((state) => {
            state.sections = state.sections.filter((s) => s.id !== id);
            if (state.selectedSectionId === id) {
              state.selectedSectionId = null;
            }
            state.isDirty = true;
          });
        },

        selectSection: (id) => {
          set((state) => {
            state.selectedSectionId = id;
          });
        },

        hoverSection: (id) => {
          set((state) => {
            state.hoveredSectionId = id;
          });
        },

        // Camera management
        setCameraPosition: (position) => {
          set((state) => {
            state.cameraPosition = position;
          });
        },

        setCameraZoom: (zoom) => {
          set((state) => {
            state.cameraZoom = zoom;
          });
        },

        // Section operations
        reorderSections: (fromIndex, toIndex) => {
          set((state) => {
            const [section] = state.sections.splice(fromIndex, 1);
            state.sections.splice(toIndex, 0, section);
            state.isDirty = true;
          });
        },

        duplicateSection: (id) => {
          set((state) => {
            const section = state.sections.find((s) => s.id === id);
            if (section) {
              const copy: EditorSection = {
                ...section,
                id: `${section.id}-copy-${Date.now()}`,
                position: [
                  section.position[0] + 2,
                  section.position[1],
                  section.position[2],
                ],
              };
              state.sections.push(copy);
              state.isDirty = true;
            }
          });
        },

        // History operations
        // FUTURO: Implement proper undo/redo with Command pattern
        undo: () => {
          // TODO: Implement
        },

        redo: () => {
          // TODO: Implement
        },

        clearHistory: () => {
          set((state) => {
            state.history = [];
            state.historyIndex = -1;
          });
        },

        // Save/Load
        setSaving: (saving) => {
          set((state) => {
            state.isSaving = saving;
          });
        },

        setSaveError: (error) => {
          set((state) => {
            state.saveError = error;
          });
        },

        markSaved: () => {
          set((state) => {
            state.isDirty = false;
            state.lastSaveTime = new Date().toISOString();
            state.isSaving = false;
          });
        },

        // Performance monitoring
        setFps: (fps) => {
          set((state) => {
            state.fps = fps;
          });
        },

        setMemoryUsage: (memory) => {
          set((state) => {
            state.memoryUsage = memory;
          });
        },
      })),
      {
        name: 'editor-store', // localStorage key
        version: 1,
      }
    ),
    { name: 'EditorStore' }
  )
);

// FUTURO: Add selectors for performance
// export const selectSections = (state: EditorState) => state.sections;
// export const selectSelectedSection = (state: EditorState) =>
//   state.sections.find((s) => s.id === state.selectedSectionId);
// export const selectDirtyState = (state: EditorState) => state.isDirty;
