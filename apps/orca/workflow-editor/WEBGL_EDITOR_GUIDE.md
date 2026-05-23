# WebGL/Three.js Visual Editor - Integration Guide

**Status:** ✅ Foundation Components Complete  
**Components:** 4 modules ready for integration  
**Cost:** $0 (all open-source)

---

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

New packages added:
- `@react-three/fiber` - React bindings for Three.js
- `@react-three/drei` - Useful helpers (OrbitControls, Html, TransformControls)
- `penpal` - Iframe communication bridge
- `moveable` - Transform controls library

### 2. Import Components

```typescript
import { VisualCanvas } from './components/VisualCanvas';
import { useEditorStore } from './stores/useEditorStore';

function EditorPage() {
  const sections = useEditorStore((state) => state.sections);

  return (
    <VisualCanvas
      width="100%"
      height="800px"
      enableControls={true}
      zoom={1}
    />
  );
}
```

### 3. Core Components

#### **VisualCanvas.tsx**
Main 3D rendering canvas with interactive controls.

Features:
- Ambient + directional lighting
- Grid reference system
- OrbitControls for pan/zoom
- Suspense boundary for lazy loading
- Performance monitoring hooks (FUTURO)

```typescript
<VisualCanvas
  width="100%"
  height="100%"
  enableControls={true}
  zoom={1.5}
  backgroundColor="#0f1228"
/>
```

#### **IframeSection.tsx**
Individual section editor inside the 3D space.

Features:
- Live HTML/CSS editing
- Transform controls (move, rotate, scale)
- Penpal communication bridge
- Responsive resizing
- CSS 3D transformations

```typescript
<IframeSection
  section={{
    id: 'header-1',
    url: 'http://localhost:3000/header',
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    width: 1024,
    height: 200,
    zIndex: 100,
  }}
  onUpdate={updateSection}
/>
```

#### **useEditorStore.ts**
Zustand store for complete editor state.

Features:
- Section management (add, update, delete)
- Selection and hover state
- Camera position/zoom tracking
- Undo/redo history (FUTURO)
- Save/load operations
- Performance metrics

```typescript
const sections = useEditorStore((state) => state.sections);
const addSection = useEditorStore((state) => state.addSection);
const selectSection = useEditorStore((state) => state.selectSection);
```

#### **penpal-bridge.ts**
Bidirectional communication with iframes.

Features:
- Parent ↔ Iframe message passing
- CSS update operations
- HTML getter/setter
- Viewport sizing
- Script execution sandbox
- Change notifications

```typescript
const connection = await initPenpal(iframeWindow);
await connection.iframe.updateCss(newCss);
const html = await connection.iframe.getHtml();
```

---

## Architecture

```
┌─────────────────────────────────────────┐
│        Visual Editor (Parent)            │
├─────────────────────────────────────────┤
│                                         │
│  VisualCanvas (Three.js + React)       │
│  ├─ OrbitControls (camera)             │
│  ├─ Grid + Lighting                    │
│  └─ Suspense boundary                  │
│                                         │
│  ├─ IframeSection #1                   │
│  │  ├─ TransformControls (move/scale)  │
│  │  ├─ Html component                  │
│  │  └─ Penpal bridge                   │
│  │                                     │
│  ├─ IframeSection #2                   │
│  └─ IframeSection #N                   │
│                                         │
│  useEditorStore (Zustand)              │
│  ├─ sections[]                         │
│  ├─ selectedSection                    │
│  ├─ cameraPosition                     │
│  └─ history (FUTURO)                   │
│                                         │
└─────────────────────────────────────────┘
           ↕️ (Penpal Bridge)
┌─────────────────────────────────────────┐
│          Iframe Content                  │
│         (HTML/CSS Editor)                │
├─────────────────────────────────────────┤
│ - Dynamic styles                        │
│ - HTML updates                          │
│ - Event listeners                       │
│ - MutationObserver for tracking         │
└─────────────────────────────────────────┘
```

---

## Usage Examples

### Example 1: Basic Setup

```typescript
import { VisualCanvas } from './components/VisualCanvas';
import { useEditorStore } from './stores/useEditorStore';
import { useState } from 'react';

export function WebEditor() {
  const addSection = useEditorStore((state) => state.addSection);
  const [newUrl, setNewUrl] = useState('');

  const handleAddSection = () => {
    addSection({
      id: `section-${Date.now()}`,
      title: 'New Section',
      url: newUrl,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      width: 1024,
      height: 600,
      zIndex: 100,
      locked: false,
      visible: true,
      editMode: 'view',
    });
  };

  return (
    <div>
      <div style={{ padding: '16px', backgroundColor: '#1a1a2e' }}>
        <input
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="Enter iframe URL"
        />
        <button onClick={handleAddSection}>Add Section</button>
      </div>
      <VisualCanvas width="100%" height="calc(100vh - 60px)" />
    </div>
  );
}
```

### Example 2: CSS Editing

```typescript
import { initPenpal, updateIframeCss } from './utils/penpal-bridge';

async function updateSectionCSS(iframeElement: HTMLIFrameElement, css: string) {
  const connection = await initPenpal(iframeElement.contentWindow!);
  await updateIframeCss(connection, css);
}

// Use with CodeMirror or Monaco
const newCss = `
body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Inter', sans-serif;
  color: white;
}
`;

await updateSectionCSS(iframeRef.current!, newCss);
```

### Example 3: Transform Operations

```typescript
const handleDuplicate = (sectionId: string) => {
  useEditorStore.setState((state) => {
    const duplicate = useEditorStore.getState().duplicateSection;
    duplicate(sectionId);
  });
};

const handleDelete = (sectionId: string) => {
  useEditorStore.setState((state) => {
    const deleteSection = useEditorStore.getState().deleteSection;
    deleteSection(sectionId);
  });
};

const handleSelect = (sectionId: string) => {
  useEditorStore.setState((state) => {
    const select = useEditorStore.getState().selectSection;
    select(sectionId);
  });
};
```

---

## FUTURO: Planned Enhancements

### Short-term (Next phase)
- [ ] Gizmo visualizer for position/rotation/scale
- [ ] Multi-select and batch operations
- [ ] Grid snap-to-grid alignment
- [ ] Keyboard shortcuts (Ctrl+D duplicate, Del delete)
- [ ] Visual hierarchy/z-index reordering
- [ ] Section properties panel

### Medium-term (2-3 weeks)
- [ ] GrapesJS integration for visual HTML editing
- [ ] Live code editor (CodeMirror/Monaco)
- [ ] CSS variable inspector
- [ ] Responsive viewport presets (mobile, tablet, desktop)
- [ ] Asset management (images, fonts, icons)
- [ ] Color picker and typography controls

### Long-term (1-2 months)
- [ ] Real-time collaboration (Yjs + Websockets)
- [ ] Advanced undo/redo with Command pattern
- [ ] Immer-based state snapshots
- [ ] Performance profiling (FPS, memory, render time)
- [ ] AI-assisted design suggestions
- [ ] Export to HTML/CSS/React
- [ ] Design system component library

### Advanced Features (Backlog)
- [ ] 3D model import (GLTF/GLB)
- [ ] Physics simulation for sections
- [ ] Particle effects and animations
- [ ] WebGL shaders and custom materials
- [ ] Real-time collaborative editing
- [ ] Version control and branching
- [ ] Component sharing and marketplace

---

## Performance Optimization

### Current Optimizations
- Suspense boundary for lazy loading
- Memoized transform callbacks
- Efficient Zustand selectors
- Immer middleware for immutable updates

### FUTURO: Performance Enhancements
- GPU acceleration for transforms
- Virtualization for many sections
- Web Workers for heavy computations
- Service Workers for offline support
- IndexedDB for persistent storage
- Compression for network traffic

---

## Keyboard Shortcuts (FUTURO)

```
Selection:
  Click on section          - Select
  Ctrl+A                    - Select all
  Esc                       - Deselect

Editing:
  Ctrl+D                    - Duplicate selected
  Del                       - Delete selected
  Ctrl+C / Ctrl+V           - Copy / Paste

Transform:
  Arrow keys                - Move (1px)
  Shift + Arrow keys        - Move (10px)
  R                         - Rotate mode
  S                         - Scale mode
  T                         - Translate mode

View:
  Scroll wheel              - Zoom
  Middle mouse              - Pan
  Home                      - Frame all
  1/2/3                     - Preset views

History:
  Ctrl+Z                    - Undo
  Ctrl+Y / Ctrl+Shift+Z     - Redo
```

---

## Troubleshooting

### Canvas not rendering
```
Check:
1. Three.js version compatibility
2. WebGL support in browser (chrome://gpu)
3. Canvas size and styling
4. Lighting setup
```

### Iframe communication failing
```
Check:
1. CORS policy for iframe URL
2. Sandbox attributes
3. Penpal version compatibility
4. Browser console for errors
```

### Performance issues
```
Check:
1. Number of sections
2. Iframe complexity
3. CPU/GPU usage in DevTools
4. Canvas resolution
5. Lighting quality settings
```

---

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ⚠️ Limited WebGL
- Mobile: ⚠️ Touch controls needed

---

## References

- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [@react-three/drei](https://github.com/pmndrs/drei)
- [Penpal Documentation](https://github.com/alexjlockwood/penpal)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

---

**Status:** ✅ Foundation Complete - Ready for Enhancement  
**Next Step:** Add visual properties panel and CSS editor  
**Estimated Completion:** Phase complete in 2-3 weeks

