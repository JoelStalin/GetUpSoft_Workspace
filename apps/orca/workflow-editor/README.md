# Orca Workflow Editor

Visual workflow editor for the Orca AI Automation Orchestrator, with n8n-compatible JSON format.

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev
```

The dev server proxies `/api` calls to `http://localhost:8015` (Orca backend).

### Production Build

```bash
# Build for production
npm run build

# Output: dist/
```

The built SPA is served by Orca at `http://localhost:8015/workflow-editor`.

## Features

- 🎨 Visual workflow canvas with drag-and-drop nodes
- 🔗 Connection lines between nodes
- 📝 Node configuration panel
- ✨ Generate workflows from natural language prompts
- 📥 Import/export n8n-compatible JSON
- ▶️ Execute workflows with real-time logs
- 🎯 Node type palette with 8+ node types

## Architecture

```
workflow-editor/
├── src/
│   ├── store/         # Zustand state management
│   ├── api/           # Fetch wrappers for /api/n8n/*
│   ├── components/    # React components
│   │   ├── WorkflowCanvas.tsx     # ReactFlow canvas
│   │   ├── NodePalette.tsx        # Node palette sidebar
│   │   ├── NodeConfigPanel.tsx    # Properties editor
│   │   ├── WorkflowToolbar.tsx    # Main toolbar
│   │   ├── GenerateModal.tsx      # AI generation modal
│   │   └── ExecutionViewer.tsx    # Logs viewer
│   ├── main.tsx       # Entry point
│   ├── App.tsx        # Root component
│   └── index.css      # Tailwind + ReactFlow styles
```

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Canvas**: @xyflow/react (ReactFlow v12)
- **State**: Zustand
- **Styling**: Tailwind CSS
- **Build**: Vite
- **API**: Fetch + async/await

## Environment Setup

### Prerequisites
- Node.js 18+
- npm or pnpm
- Orca backend running on http://localhost:8015

### Install & Build

```bash
cd apps/orca/workflow-editor
npm install
npm run build
```

## API Integration

Orca backend provides these endpoints:

- `GET /api/n8n/workflows` - List workflows
- `GET /api/n8n/workflows/{id}` - Get workflow
- `POST /api/n8n/workflows` - Create/update
- `DELETE /api/n8n/workflows/{id}` - Delete
- `POST /api/n8n/import` - Import JSON
- `GET /api/n8n/workflows/{id}/export` - Export JSON
- `POST /api/n8n/workflows/{id}/run` - Execute
- `GET /api/n8n/node-types` - Available node types
- `POST /api/n8n/generate` - Generate from prompt

## Development Tips

### Adding New Node Types

1. Update backend `NODE_TYPE_CATALOG` in `n8n_models.py`
2. The frontend automatically picks up new types via `/api/n8n/node-types`

### Custom Node Rendering

The `WorkflowCanvas` uses default node styling. To customize:

1. Create custom node components in `src/components/nodes/`
2. Register in ReactFlow `nodeTypes` prop

### State Management

Workflow state is centralized in `useWorkflowStore` (Zustand):

```typescript
const { workflow, selectedNodeId, isRunning, addNode, deleteNode } = useWorkflowStore()
```

## Troubleshooting

### "Cannot reach API"
- Ensure Orca backend is running: `ai-orchestrator serve`
- Check proxy config in `vite.config.ts`

### Build fails
- Run `npm ci` to clean install dependencies
- Delete `node_modules/` and retry

### Styles don't apply
- Rebuild Tailwind: `npm run build`
- Clear browser cache and reload

## Deployment

1. Build: `npm run build`
2. Orca automatically serves `dist/index.html` at `/workflow-editor`
3. Static assets served from `/workflow-editor/assets/`

The HTML entrypoint is configured in `apps/orca/src/ai_automation_orchestrator/webapp.py`.

## License

Same as Orca (see parent LICENSE file).
