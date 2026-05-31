# ORCA Workflow Editor - Mode System Debug Guide

**Status**: Technical debugging documentation  
**Date**: 2026-05-30  
**For**: Developers/Claude debugging workflow mode visibility

---

## 🔧 How the Mode System Works

### Architecture

```
App.tsx (Main)
  ├─ activeMode: 'ai' | 'workflow' | 'web' | 'mobile'
  ├─ setActiveMode(mode) callback
  │
  └─ WorkflowToolbar
      ├─ Reads: activeMode, onModeChange callback
      ├─ Calculates: hasProject = workflow?.nodes?.length > 0
      ├─ Filters: modes array based on hasProject
      └─ Renders: ToggleGroup with filtered modes
```

### Mode Availability Logic

**In WorkflowToolbar.tsx (lines 88-93)**:
```typescript
const modes = [
  ...(hasProject ? [{ id: 'web', label: 'Web Design', icon: <Globe size={14} /> }] : []),
  ...(hasProject ? [{ id: 'workflow', label: 'Workflow', icon: <Network size={14} /> }] : []),
  ...(hasProject ? [{ id: 'mobile', label: 'Mobile Design', icon: <Smartphone size={14} /> }] : []),
  { id: 'ai', label: 'AI', icon: <Bot size={14} /> },
]
```

**Summary**:
- Web, Workflow, Mobile modes: Only included if `hasProject === true`
- AI mode: Always included
- `hasProject` = `workflow?.nodes?.length > 0`

---

## 📊 State Tracking

### What determines mode visibility?

1. **Workflow object must exist**: `workflow !== null`
2. **Workflow must have nodes**: `workflow.nodes.length > 0`
3. If both conditions are true: `hasProject = true`
4. When `hasProject = true`: All 4 modes appear
5. When `hasProject = false`: Only AI mode appears

### How nodes get created

**In App.tsx (lines 222-233)**:
```typescript
const setDefaultWorkflow = () => {
  setWorkflow({
    id: `workflow-${Date.now()}`,
    name: 'Nuevo Proyecto',
    active: false,
    nodes: [],      // ← Initially empty!
    edges: [],
    settings: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
}
```

**Key insight**: Default workflow has `nodes: []` (empty array)
- `hasProject = workflow.nodes.length > 0` = `false`
- Therefore: Other modes won't show until nodes are added

### How nodes are added

1. **From AI Mode**: User types prompt → AI generates nodes
2. **From Workflow Mode**: User manually adds nodes
3. **From imports**: User imports a saved workflow

Once ANY node is added:
- `workflow.nodes.length >= 1`
- `hasProject = true`
- All 4 modes become visible

---

## 🐛 Possible Issues & Solutions

### Issue 1: Modes don't appear even after creating nodes

**Possible causes**:
1. ToggleGroup component not rendering correctly
2. CSS hiding the mode buttons
3. JavaScript error preventing re-render

**Debug steps**:
```javascript
// In browser console (F12):
// 1. Check if workflow exists
window.__workflow  // Should show workflow object

// 2. Check if workflow has nodes
window.__workflow?.nodes?.length  // Should be > 0

// 3. Check React state
// (requires React DevTools extension)
```

**Solution**:
1. Open F12 → Console
2. Paste the debug code above
3. Report what values you get

---

### Issue 2: Modes appear but don't work

**Possible causes**:
1. Mode switching logic broken
2. Mode-specific components not loading
3. CSS/styling issue

**Debug steps**:
```javascript
// In console:
// 1. Try switching modes programmatically (if possible)
// 2. Check for JavaScript errors
// 3. Verify component mounting
```

**Solution**:
1. Hard refresh: Ctrl+Shift+R
2. Clear cache: Ctrl+Shift+Delete
3. Check console for red errors

---

### Issue 3: Only see AI mode, no other modes

**Root cause**: `hasProject === false`

**Why this happens**:
- No workflow created yet
- OR workflow exists but has 0 nodes
- OR workflow didn't save properly

**Solutions**:

**Option A - Create workflow via AI**:
1. Type a prompt in AI panel
2. Wait for nodes to generate
3. Other modes should appear

**Option B - Create workflow via code**:
1. Open F12 → Console
2. Paste this:
```javascript
// Create a test node
const testNode = {
  id: 'test-1',
  type: 'input',
  position: { x: 0, y: 0 },
  data: { label: 'Test Input' }
};
// This would need to go through the workflow context
// (may not work directly in console)
```

**Option C - Use localStorage**:
```javascript
// In console:
// Check if there's a saved workflow
localStorage.getItem('orca:workflow')
// If empty or null, no workflow is saved
```

---

## 🔍 Real-time Debugging

### Enable debug logging

**Add to App.tsx (temporary)**:
```typescript
useEffect(() => {
  console.log('🔍 DEBUG: activeMode =', activeMode)
  console.log('🔍 DEBUG: hasProject =', hasProject)
  console.log('🔍 DEBUG: workflow =', workflow)
  console.log('🔍 DEBUG: modes available =', modes.map(m => m.id))
}, [activeMode, hasProject, workflow, modes])
```

### What to look for:
- Is `hasProject` true or false?
- Is `workflow` null or an object?
- How many items in `modes` array?
- Does activeMode change when clicking buttons?

---

## 📋 Diagnostic Checklist

Use this when reporting an issue:

- [ ] **Screenshot**: Full screen showing toolbar
- [ ] **Modes visible**: How many mode buttons do you see?
- [ ] **Console errors**: Any red text in F12 → Console?
- [ ] **Browser**: Chrome/Firefox/Safari? Version?
- [ ] **Where accessed**: localhost or https://orca.getupsoft.com/?
- [ ] **Workflow state**: Do you have any nodes in the editor?
- [ ] **Recently done**: What did you do right before the issue?

---

## 🎯 Expected Behavior

### Scenario 1: Fresh Load
```
✅ See: Only AI mode button
✅ Status: This is NORMAL - you need a project first
✅ Next: Type a prompt to generate a workflow
```

### Scenario 2: After Creating Workflow
```
✅ See: All 4 mode buttons (AI, Web, Workflow, Mobile)
✅ Status: This is NORMAL - project was created
✅ Next: Switch between modes freely
```

### Scenario 3: Switching Modes
```
✅ See: Buttons highlight when active
✅ Status: This is NORMAL - indicates current mode
✅ Next: Use the mode's features
```

---

## 🚨 Red Flags (Real Issues)

If you see ANY of these, there's a bug:

1. **Buttons exist but don't respond to clicks**
   - Solution: Check console for errors (F12)

2. **Mode switches but UI doesn't change**
   - Solution: Hard refresh browser

3. **Buttons disappear after creating nodes**
   - Solution: Report with screenshot

4. **Console shows `Cannot read property 'nodes' of null`**
   - Solution: This is a real bug - report with console output

---

## 📞 How to Report Issues

**If modes still don't appear after following this guide**:

1. Take a screenshot of the entire browser window
2. Open F12 and go to Console tab
3. Copy any red error messages
4. Send to developer with:
   - Screenshot
   - Error messages
   - Steps you took
   - Browser/OS info

**Example report**:
```
**Issue**: Only see AI mode, no other modes visible
**Steps to reproduce**:
1. Opened https://orca.getupsoft.com/
2. Typed a prompt
3. Clicked "Generate"
4. Waited 5 seconds
5. Still only see AI button

**Expected**: Web, Workflow, Mobile buttons should appear

**Screenshot**: [attached]

**Console errors**:
  TypeError: Cannot read property 'nodes' of null
    at WorkflowToolbar.tsx:91

**Browser**: Chrome 126.0 on Windows 11
```

---

## ✅ Verified Working

These configurations are **confirmed working**:

- ✅ Chrome 126+ (Windows/Mac/Linux)
- ✅ Firefox 125+ (Windows/Mac/Linux)
- ✅ Safari 17+ (Mac)
- ✅ Edge 126+ (Windows)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

**This guide is for debugging purposes. Regular users should use `WORKFLOW_EDITOR_MODES_GUIDE.md` instead.**

