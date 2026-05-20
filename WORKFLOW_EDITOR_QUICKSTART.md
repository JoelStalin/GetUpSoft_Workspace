# Orca Workflow Editor - Quick Start

Visual n8n-style workflow editor for Orca AI Automation Orchestrator.

## Installation & Startup (5 minutes)

### 1. Install Backend Dependencies
```powershell
cd C:\Users\yoeli\Documents\GetUpSoft_Workspace\apps\orca
pip install -e .
```

### 2. Build Frontend (Already done, but if you modify src/)
```powershell
cd workflow-editor
npm install
npm run build
cd ..
```

### 3. Start Orca Server
```powershell
ai-orchestrator serve
# Expected output:
# INFO:     Uvicorn running on http://0.0.0.0:8015
```

### 4. Open Workflow Editor
```
http://localhost:8015/workflow-editor
```

## Features to Try

### 1. Generate Workflow from Prompt
1. Click **✨ Generate** button
2. Enter prompt: `"Automate customer onboarding: send welcome email, verify contact, add to CRM"`
3. Select model (default: Kimi K2-6)
4. Click **Generate**
5. Watch workflow auto-generate with nodes and connections!

### 2. Drag-and-Drop Nodes
1. Left sidebar has 8 node types
2. Drag any node type onto the canvas
3. Drop to create a new node
4. Click node to select and edit properties on the right panel

### 3. Connect Nodes
1. Hover over node edge → green handles appear
2. Drag from handle → draw connection line
3. Release on target node handle

### 4. Save Workflow
1. Edit workflow name in toolbar
2. Click **💾 Save** → saved to backend as JSON

### 5. Export/Import JSON
1. **📥 Export** → downloads `workflow-name.json` (n8n format)
2. **📥 Import** → upload JSON file to load workflow

### 6. Run Workflow (framework ready)
1. Click **▶️ Run**
2. Logs appear in bottom panel (real-time)
3. Each node shows: pending → running → completed/failed

## API Endpoints

Backend provides REST API at `http://localhost:8015/api/n8n/`:

```
GET    /workflows              List all workflows
POST   /workflows              Create/update workflow
GET    /workflows/{id}         Get workflow details
DELETE /workflows/{id}         Delete workflow
GET    /workflows/{id}/export  Export as JSON
POST   /import                 Import JSON file
POST   /workflows/{id}/run     Execute workflow
GET    /node-types             List available node types
POST   /generate               Generate from prompt
```

## Node Types

| Type | Color | Use Case |
|------|-------|----------|
| Trigger | 🔴 Red | Start workflow |
| AI Prompt | 🟣 Purple | Call AI model |
| HTTP Request | 🔵 Cyan | API call |
| Condition | 🟠 Orange | If/else branch |
| Loop | 🟢 Green | Iterate array |
| Set Variable | ⚫ Gray | Store data |
| Execute | 🔴 Red | Run command |
| End | ⚫ Black | Finish workflow |

## Troubleshooting

### "Cannot connect to API"
- Verify `ai-orchestrator serve` is running
- Check http://localhost:8015/health → should return `{"status": "ok"}`

### "Button disabled"
- Need to create or import a workflow first
- Click **✨ Generate** to create one

### Browser refresh loses data
- State is not persisted to server automatically
- Click **💾 Save** after changes

### Dark theme not loading
- Hard refresh: Ctrl+Shift+R (Chrome) or Cmd+Shift+R (Mac)
- Clear browser cache

## Development

### Modify React components
```bash
cd workflow-editor
npm run dev
# Opens http://localhost:5173 with hot reload
# Dev server proxies /api calls to http://localhost:8015
```

### Build for production
```bash
npm run build
# Output: dist/ (served by Orca at /workflow-editor)
```

### Add new node type
1. Edit `n8n_models.py` → `NODE_TYPE_CATALOG`
2. Frontend auto-discovers via `/api/n8n/node-types`

## Architecture

```
┌─ Browser ─────────────────────────────────────┐
│                                                │
│  React 18 + @xyflow/react (ReactFlow v12)     │
│  ├─ WorkflowCanvas (node/edge visualization)  │
│  ├─ NodePalette (draggable node types)        │
│  ├─ NodeConfigPanel (property editor)         │
│  ├─ WorkflowToolbar (actions)                 │
│  ├─ GenerateModal (prompt → workflow)         │
│  └─ ExecutionViewer (logs)                    │
│                                                │
└────────────── http://localhost:8015 ──────────┘
                        ↓ /api/n8n/*
┌─ FastAPI (Python) ────────────────────────────┐
│                                                │
│  n8n_endpoints.py (REST API routes)           │
│  ├─ CRUD: /workflows, /import, /export        │
│  ├─ Exec: /run, /node-types, /generate        │
│  └─ Persist: data/n8n_workflows.json          │
│                                                │
│  n8n_generator.py (prompt → workflow)         │
│  └─ Uses Orca's automation flow generator     │
│                                                │
│  n8n_models.py (Pydantic models)              │
│  └─ N8nNode, N8nWorkflow, NODE_TYPE_CATALOG  │
│                                                │
└────────────────────────────────────────────────┘
```

## Next Steps

1. ✅ Visual editor working
2. ✅ Drag-and-drop, connections, save/load
3. ⏳ Workflow execution engine (hook to Orca services)
4. ⏳ WebSocket for real-time logs
5. ⏳ Multi-user collaboration (sessions)
6. ⏳ Template library
7. ⏳ Conditional branching UI editor
8. ⏳ Variable inspector / debugger

## Support

For issues, check:
- Browser console (F12 → Console)
- Server logs: `ai-orchestrator serve` output
- API response: open DevTools Network tab, check `/api/n8n/*` requests

---

**Version:** 1.0.0  
**Built:** 2026-05-20  
**Tech Stack:** React 18 + ReactFlow v12 + FastAPI + SQLite
