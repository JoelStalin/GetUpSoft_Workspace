# Phase 6: Workflow Automation — Implementation Plan
**Date Created:** 2026-05-23  
**Status:** 🚀 In Planning  
**Estimated Duration:** 3-4 hours  
**Priority:** HIGH (Makes app functional)

---

## 🎯 Objective

Connect the AI chat interface to the workflow canvas so users can:
1. Ask the chat to create workflows (e.g., "Create email automation workflow")
2. Chat generates appropriate workflow nodes automatically
3. User sees nodes appear on the canvas
4. User can edit/execute the workflow

---

## 📋 Requirements

### User Stories
1. **As a user**, I want to describe a workflow in chat and have it automatically generated
2. **As a user**, I want to see workflow nodes created based on my chat input
3. **As a user**, I want to be able to connect and modify auto-generated nodes

### Technical Requirements
1. Parse chat messages for workflow creation intent
2. Map natural language to workflow node types
3. Generate nodes with appropriate properties
4. Connect nodes with edges
5. Update canvas in real-time
6. Provide feedback to user about created workflow

---

## 🔧 Implementation Steps

### Step 1: Create Workflow Parser (30 min)
**Goal:** Extract workflow intent from chat messages

```typescript
// apps/orca/workflow-editor/src/utils/workflowParser.ts
interface WorkflowIntent {
  type: 'create' | 'modify' | 'delete' | 'execute'
  description: string
  nodes: NodeProposal[]
  edges: EdgeProposal[]
}

interface NodeProposal {
  label: string
  type: 'trigger' | 'action' | 'condition' | 'output'
  properties?: Record<string, any>
}

// Detect patterns like:
// "Create a workflow that processes emails and sends notifications"
// -> triggers: [Email trigger], actions: [Process email, Send notification], outputs: []
```

**Tasks:**
- [ ] Create `workflowParser.ts` utility
- [ ] Implement keyword matching for node types
- [ ] Map descriptions to node types
- [ ] Handle multiple node generation
- [ ] Return structured workflow intent

### Step 2: Workflow Generator Service (45 min)
**Goal:** Convert parsed intent to actual workflow nodes

```typescript
// apps/orca/workflow-editor/src/services/workflowGenerator.ts
function generateWorkflow(intent: WorkflowIntent): {
  nodes: Node[],
  edges: Edge[]
}
```

**Tasks:**
- [ ] Create node generation logic
- [ ] Set appropriate positions (auto-layout)
- [ ] Create proper connections between nodes
- [ ] Add default properties to nodes
- [ ] Handle error cases

### Step 3: Chat Integration (45 min)
**Goal:** Connect chat to workflow generator

**Location:** `apps/orca/workflow-editor/src/components/modes/AIMode.tsx`

**Changes:**
- [ ] Detect workflow creation intent in `sendMessage()`
- [ ] Call `parseWorkflow()` on message
- [ ] If workflow detected, call `generateWorkflow()`
- [ ] Update workflow state with new nodes
- [ ] Provide user feedback in chat

```typescript
const sendMessage = async (text?: string) => {
  // ... existing code ...
  
  // NEW: Check if message contains workflow creation intent
  const intent = parseWorkflow(plainText)
  if (intent.type === 'create' && intent.nodes.length > 0) {
    const { nodes: newNodes, edges: newEdges } = generateWorkflow(intent)
    const updatedWorkflow = {
      ...workflow,
      nodes: [...workflow.nodes, ...newNodes],
      edges: [...workflow.edges || [], ...newEdges]
    }
    setWorkflow(updatedWorkflow)
    
    // Send confirmation to user
    agentMsg.content = `✅ Created workflow with ${newNodes.length} nodes. You can now edit them on the canvas.`
  }
}
```

### Step 4: Canvas View Management (30 min)
**Goal:** Switch to workflow canvas after creation

**Changes:**
- [ ] Auto-switch to "Workflow" mode after creation
- [ ] Center canvas on new nodes
- [ ] Highlight created nodes
- [ ] Show creation confirmation toast

### Step 5: Testing (30 min)
**Goal:** Test workflow generation end-to-end

**Test Cases:**
- [ ] Simple single-node workflow ("Create a trigger")
- [ ] Multi-node workflow ("Email → Process → Notify")
- [ ] Complex workflow with conditions
- [ ] Invalid input handling
- [ ] Edge connection validation

---

## 📊 Implementation Details

### Node Type Mapping

```javascript
const nodeTypeMapping = {
  // Triggers
  'email': { type: 'trigger', label: 'Email Trigger', color: '#ff6d5a' },
  'webhook': { type: 'trigger', label: 'Webhook', color: '#ff6d5a' },
  'schedule': { type: 'trigger', label: 'Schedule', color: '#ff6d5a' },
  'api': { type: 'trigger', label: 'API Call', color: '#ff6d5a' },
  
  // Actions
  'send': { type: 'action', label: 'Send', color: '#7c4dff' },
  'process': { type: 'action', label: 'Process', color: '#7c4dff' },
  'transform': { type: 'action', label: 'Transform', color: '#7c4dff' },
  'database': { type: 'action', label: 'Database', color: '#7c4dff' },
  'notification': { type: 'action', label: 'Notify', color: '#7c4dff' },
  
  // Conditions
  'if': { type: 'condition', label: 'If', color: '#ff9f43' },
  'switch': { type: 'condition', label: 'Switch', color: '#ff9f43' },
  
  // Outputs
  'log': { type: 'output', label: 'Log', color: '#1DB954' },
  'export': { type: 'output', label: 'Export', color: '#1DB954' },
}
```

### Example Workflow: Email Automation

**User Message:**
> "Crear un workflow que procese emails con adjuntos y los guarde en una base de datos"

**Parsed Intent:**
```javascript
{
  type: 'create',
  description: 'Process emails with attachments and save to database',
  nodes: [
    { label: 'Email Trigger', type: 'trigger' },
    { label: 'Check Attachments', type: 'condition' },
    { label: 'Process Email', type: 'action' },
    { label: 'Save to Database', type: 'action' },
    { label: 'Send Confirmation', type: 'action' }
  ],
  edges: [
    { source: 0, target: 1 },
    { source: 1, target: 2 },
    { source: 2, target: 3 },
    { source: 3, target: 4 }
  ]
}
```

**Generated Nodes (Canvas):**
```
[Email Trigger] 
    ↓
[Check Attachments]
    ↓
[Process Email]
    ↓
[Save to Database]
    ↓
[Send Confirmation]
```

---

## 🎯 Success Criteria

- ✅ Chat detects workflow creation intent
- ✅ Workflow nodes generated automatically
- ✅ Nodes appear on canvas with proper positioning
- ✅ Nodes are connected with edges
- ✅ User receives confirmation message
- ✅ No console errors
- ✅ Keyboard navigation works
- ✅ Touch-friendly (for future mobile)
- ✅ Accessible (WCAG AA)
- ✅ Performance: <500ms generation

---

## 🚀 Next Phase Options (Phase 7)

1. **Backend API Integration** - Real AI responses from NVIDIA/OpenAI
2. **Advanced Chat Commands** - Slash commands (/create, /modify, /delete)
3. **Workflow Execution** - Actually run workflows with real logic
4. **Testing Framework** - E2E and unit tests
5. **Mobile Optimization** - Touch-friendly UI
6. **Deployment** - CI/CD and hosting

---

## 📝 Dependencies & Risks

### Dependencies
- ✅ TipTap editor (Phase 5) - Already integrated
- ✅ Workflow state (useWorkflowOperations) - Already available
- ✅ Node types (existing types) - Available in codebase
- ✅ Canvas rendering (React Flow) - Already integrated

### Risks
- 🟡 **NLP Accuracy** - Natural language parsing might be imprecise
- 🟡 **Performance** - Generating many nodes might cause lag
- 🟡 **User Education** - Users need to know what workflows can be created

### Mitigation
- Use keyword matching initially (simple & reliable)
- Test with 5-10 node workflows
- Provide help text in chat about supported workflows
- Show example workflows in quick actions

---

## 📦 Files to Create/Modify

### New Files
- `apps/orca/workflow-editor/src/utils/workflowParser.ts` (150 lines)
- `apps/orca/workflow-editor/src/services/workflowGenerator.ts` (200 lines)
- `apps/orca/workflow-editor/src/types/workflowTypes.ts` (50 lines)

### Modified Files
- `apps/orca/workflow-editor/src/components/modes/AIMode.tsx` (+ ~100 lines)

**Total New Code:** ~500 lines

---

## ✅ Implementation Checklist

### Part 1: Parser & Generator
- [ ] Create `workflowParser.ts`
- [ ] Create `workflowGenerator.ts`
- [ ] Test parser with various inputs
- [ ] Test generator produces valid nodes

### Part 2: Chat Integration
- [ ] Modify `AIMode.tsx` to call parser
- [ ] Hook up generator to workflow state
- [ ] Add user feedback messages
- [ ] Test end-to-end

### Part 3: Canvas Integration
- [ ] Auto-switch to workflow mode
- [ ] Center canvas on new nodes
- [ ] Add visual highlight for new nodes
- [ ] Test node interaction

### Part 4: Testing & QA
- [ ] Write unit tests for parser
- [ ] Write unit tests for generator
- [ ] E2E testing (chat → workflow → canvas)
- [ ] QA audit (accessibility, performance)
- [ ] Create test cases documentation

### Part 5: Documentation
- [ ] Create implementation summary
- [ ] Document supported workflows
- [ ] Create user guide
- [ ] Update CHANGE_TIMELINE.md

---

**Ready to implement?** ✅

This phase makes the application truly functional by allowing users to describe workflows in natural language and automatically generate them. It bridges the gap between the chat interface and the workflow canvas.

