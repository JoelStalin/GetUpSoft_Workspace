# ORCA-U Phase 1: React Feature Mapping ✅ ANALYSIS COMPLETE

**Date:** 2026-05-26  
**Status:** Analysis Complete - Ready for Phase 2  
**Based on:** Production HTML capture from orca.getupsoft.com  

---

## Executive Summary

The legacy ORCA panel serves **6 main views** via tab-based navigation in a single HTML document. Each view is a self-contained section with overlapping UI patterns (chat, status panels, action buttons, provider listings).

The existing React app already covers **3 of 6 views** natively. The remaining 3 views require either component creation or refactoring of existing components.

---

## Legacy Panel Structure

### Layout Hierarchy
```
orca.getupsoft.com (root)
  └── Shell (80px sidebar + main content area)
      ├── Sidebar Navigation (nav-icons)
      │   ├── Brand icon (logo)
      │   └── View tabs (Chat, Workflow, Vault, Providers, Deploy, Config)
      └── Main Content Area (view-container)
          ├── Chat-View (default active)
          ├── Workflow-View
          ├── Vault-View
          ├── Providers-View
          ├── Deploy-View
          └── Config-View
```

### Navigation Pattern
- 6 labeled navigation buttons in left sidebar
- Each button activates a `.view` div
- Only one view visible at a time (`.active` class)
- Same sidebar/nav behavior across all views

---

## Feature-to-Component Mapping

### ✅ EXISTING - Already in React App

#### 1. **Chat View** → `AIMode.tsx`
**Status:** ✅ IMPLEMENTED & RUNNING

**Legacy Elements:**
- `.chat-hero` - main chat container
- `.chat-messages` - message list display
- `.msg.user / .msg.orca` - user/ORCA messages
- `.chat-input-area` - input bar + send button
- `.orca-input` - textarea input
- Status indicators (model selector, provider badge)

**React Implementation:**
- `AIMode.tsx` - chat UI & state
- `ChatInput` - message input component
- `ChatMessage` - message renderer
- Provider selector in header
- Model selector (`activeModel` state)

**Verdict:** ✅ **Ready** - Chat view is fully migrated. No new component needed.

#### 2. **Workflow View** → `WorkflowCanvas.tsx` + `WorkflowToolbar.tsx`
**Status:** ✅ IMPLEMENTED & RUNNING

**Legacy Elements:**
- `.workbench-grid` - canvas container
- Toolbar with node creation buttons
- Node palette/inspector
- Execution status display
- Workflow nodes canvas

**React Implementation:**
- `WorkflowCanvas` - React Flow canvas renderer
- `WorkflowToolbar` - toolbar actions
- `OrcaNode` - workflow node component
- `ExecutionTimeline` - execution log viewer
- `FloatingPropertiesPanel` - node inspector

**Verdict:** ✅ **Ready** - Workflow view is fully migrated.

---

### ⚠️ PARTIAL - Needs Refactoring/Extension

#### 3. **Vault View** → `KnowledgeVaultPanel` (MISSING)
**Status:** ⚠️ NOT IMPLEMENTED

**Legacy Elements:**
```html
<div id="vault-view" class="view">
  <div class="card">
    <h3>Knowledge Vault</h3>
    <ul class="item-list">
      <li data-source="obsidian">Obsidian vault sync status</li>
      <li data-source="notebooklm">NotebookLM projects</li>
    </ul>
  </div>
</div>
```

**Features:**
- Vault sync status (last sync timestamp)
- Obsidian integration status
- NotebookLM project listing
- Sync action button ("Re-sync Vault")
- Item count badge

**Existing React Equivalent:** None

**Required React Component:**
```typescript
// apps/orca/workflow-editor/src/components/KnowledgeVaultPanel.tsx
interface VaultStatus {
  source: 'obsidian' | 'notebooklm'
  lastSync: string
  itemCount: number
  syncInProgress: boolean
}

export function KnowledgeVaultPanel() {
  // Render vault status cards
  // Trigger sync action
}
```

**Priority:** P1 (moderate - info-only panel)

---

#### 4. **Providers View** → `ProvidersPanel` + `ProviderAuthPanel` (PARTIAL)
**Status:** ⚠️ PARTIALLY IMPLEMENTED

**Legacy Elements:**
```html
<div id="providers-view" class="view">
  <div class="providers-grid">
    <!-- Per provider card -->
    <div class="provider-card">
      <div class="provider-badge">NVIDIA</div>
      <div class="status-dot live"></div>
      <div class="form-group">
        <label>API Key</label>
        <input type="password" id="nvidia-key-input" />
      </div>
      <button class="btn btn-primary">Save</button>
    </div>
  </div>
</div>
```

**Features:**
- Provider status cards (NVIDIA, OpenAI, Anthropic, etc.)
- API key input fields (password-masked)
- Validation/test buttons
- Live status dot (green = connected, gray = offline)
- Per-provider save actions
- **DUPLICATE IDs FOUND:** `id="nvidia-key-input"`, `id="openai-key-input"` (conflicts if rendered twice)

**Existing React Equivalent:**
- `AIMode.tsx` has provider selector dropdown
- No dedicated provider management panel exists

**Required React Component:**
```typescript
// apps/orca/workflow-editor/src/components/ProvidersPanel.tsx
export function ProvidersPanel() {
  // List all providers with status
  // API key input (backend-secured)
  // Test connection button
  // Save validation
}

// apps/orca/workflow-editor/src/components/ProviderAuthPanel.tsx
export function ProviderAuthPanel({ provider }: { provider: string }) {
  // Single provider auth flow
  // OAuth or API key path
  // Session persistence
}
```

**Issues Identified:**
1. ❌ Duplicate input IDs in legacy HTML (will break React if cloned)
2. ❌ Raw API key display in HTML (must use backend validation instead)
3. ❌ No centralized provider status API (need NestJS endpoint: `GET /api/v1/orca/providers`)

**Priority:** P0 (critical - used to initialize all AI providers)

---

#### 5. **Deploy View** → `DeployCopilotPanel` (MISSING)
**Status:** ⚠️ NOT IMPLEMENTED

**Legacy Elements:**
```html
<div id="deploy-view" class="view">
  <div class="deploy-copilot-section">
    <h3>Deploy Copilot</h3>
    <div class="projects-grid">
      <!-- Project card -->
      <div class="card project-card">
        <div class="project-name">Project-1</div>
        <div class="project-meta">
          <span class="status-badge status-deployed">Deployed</span>
          <span class="history-timestamp">2h ago</span>
        </div>
        <div class="project-actions">
          <button class="btn-exec">Deploy</button>
          <button class="btn-danger">Rollback</button>
        </div>
        <div class="deployment-history">
          <div class="history-item">
            <span class="mono">4f2a8d1</span> commit
            <span class="history-timestamp">2 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Features:**
- Project list grid (multiple projects)
- Per-project deployment status
- Last deployment timestamp
- Deployment history list (commit hash + time)
- Deploy button (trigger new deployment)
- Rollback button (revert to previous version)

**Existing React Equivalent:** None

**Required React Component:**
```typescript
// apps/orca/workflow-editor/src/components/DeployCopilotPanel.tsx
export function DeployCopilotPanel() {
  // List projects with deployment status
  // Show deployment history
  // Trigger deploy/rollback actions
  // Monitor deployment progress
}
```

**API Requirements:**
- `GET /api/v1/orca/deployments` - list projects + status
- `GET /api/v1/orca/deployments/:id/history` - deployment history
- `POST /api/v1/orca/deployments/:id/deploy` - trigger deployment
- `POST /api/v1/orca/deployments/:id/rollback` - rollback deployment

**Priority:** P1 (non-blocking for MVP)

---

#### 6. **Config View** → `KernelSettingsPanel` (MISSING)
**Status:** ⚠️ NOT IMPLEMENTED

**Legacy Elements:**
```html
<div id="config-view" class="view">
  <div class="card">
    <h3>Kernel & Credentials</h3>
    <div class="form-group">
      <label>Database Connection</label>
      <input type="text" value="postgres://..." disabled />
    </div>
    <div class="form-group">
      <label>ORCA API Key</label>
      <input type="password" placeholder="••••••••" />
    </div>
    <button class="btn btn-primary">Save Configuration</button>
  </div>
</div>
```

**Features:**
- Kernel connection status display
- Credential inputs (API keys, database URLs)
- **Security concern:** raw credentials displayed in HTML
- Configuration save action
- Status indicators

**Existing React Equivalent:** None

**Required React Component:**
```typescript
// apps/orca/workflow-editor/src/components/KernelSettingsPanel.tsx
export function KernelSettingsPanel() {
  // Display kernel connection status
  // Show masked credentials (no raw display)
  // Credential validation form
  // Sync settings to backend
}
```

**Security Requirements:**
- ❌ **NEVER** display raw API keys, passwords, or connection strings
- ✅ Show masked indicators (••••••••)
- ✅ Validate credentials via backend API call (NestJS)
- ✅ Use backend session storage for secrets

**API Requirements:**
- `GET /api/v1/orca/kernel/status` - kernel health check
- `POST /api/v1/orca/credentials/validate` - validate secret without storing
- `GET /api/v1/orca/credentials/status` - masked credential status

**Priority:** P1 (needed for prod deployment)

---

### ❌ OUT OF SCOPE - Remove from UI

#### 7. **Live Browser Window**
**Status:** Will be moved to Canvas as `OdooLiveBrowserNode`

**Legacy Implementation:** Inline iframe with hard-coded size, no move/resize controls

**New Implementation:** Canvas portal component (Phase 3)
- Movable & resizable within canvas bounds
- Responsive layout
- Tutorial step list overlay
- No HTML injection - React component tree

**Removal:** Delete from legacy views, integrate into workflow canvas as a node type

---

## Duplicate ID & State Issues Found

### ❌ CRITICAL: Duplicate Input IDs
In legacy HTML `providers-view`:
```html
<input type="password" id="nvidia-key-input" />   <!-- Conflict -->
<input type="password" id="openai-key-input" />   <!-- Conflict -->
<input type="password" id="anthropic-key-input" /><!-- Conflict -->
```

**Problem:** If legacy HTML is cloned or rendered twice, these IDs will be duplicated in the DOM, breaking accessibility and form targeting.

**Solution in React:** Use component state + refs instead of IDs
```typescript
function ProviderInput({ provider }) {
  const [value, setValue] = useState('')
  // No ID needed, use state-driven rendering
  return <input value={value} onChange={e => setValue(e.target.value)} />
}
```

---

### ⚠️ MODERATE: Duplicate State

The legacy HTML maintains separate state for:
- Active view (JS variable `currentView`)
- Provider connections (per-input form state)
- Chat message history (array in memory)
- Workflow node state (serialized in hidden fields)

**Problem:** State spread across HTML attributes, JS variables, and form fields - hard to sync and debug.

**Solution in React:** Centralize in context + reducers
```typescript
// WorkflowContext (already exists)
// ExecutionContext (already exists)
// ProvidersContext (needs creation)
// VaultContext (needs creation)
// DeployContext (needs creation)
```

---

## Component Summary Table

| Legacy View | React Component | Status | Priority | Complexity |
|---|---|---|---|---|
| chat-view | `AIMode.tsx` | ✅ DONE | - | Low |
| workflow-view | `WorkflowCanvas.tsx` | ✅ DONE | - | Medium |
| vault-view | `KnowledgeVaultPanel` | ❌ MISSING | P1 | Low |
| providers-view | `ProvidersPanel` | ⚠️ PARTIAL | P0 | High |
| deploy-view | `DeployCopilotPanel` | ❌ MISSING | P1 | Medium |
| config-view | `KernelSettingsPanel` | ❌ MISSING | P1 | Medium |

---

## Phase 1 Deliverables

### ✅ Created
- [x] Feature mapping document (this file)
- [x] Component gap analysis
- [x] Duplicate ID/state audit
- [x] Priority ranking
- [x] Missing API endpoints list

### 📋 Acceptance Criteria
- [x] No legacy feature remains unmapped
- [x] Missing feature list is explicit and prioritized
- [x] Duplicate issues identified and remediation planned

---

## Next Steps: Phase 2 Preparation

**Phase 2 Tasks (Ready to Begin):**
1. Create `KnowledgeVaultPanel` component
2. Merge/refactor `ProvidersPanel` with API key safety
3. Create `DeployCopilotPanel` component
4. Create `KernelSettingsPanel` with credential masking
5. Create missing context providers (ProvidersContext, VaultContext, DeployContext)
6. Define NestJS API endpoints for Phase 2+ integration

**Blocking API Requirements:**
- `GET /api/v1/orca/providers` - needed for ProvidersPanel
- `GET /api/v1/orca/providers/:provider/status` - needed for provider status
- `GET /api/v1/orca/kernel/status` - needed for KernelSettingsPanel
- `GET /api/v1/orca/vault/status` - needed for KnowledgeVaultPanel
- `GET /api/v1/orca/deployments` - needed for DeployCopilotPanel

---

**Phase 1 Status:** ✅ COMPLETE - Ready for Phase 2 Component Implementation
