# ORCA Workflow Editor - Mode Selector Guide

**Status**: Troubleshooting guide  
**Date**: 2026-05-30  
**Issue**: "I don't see the workflow editor modes"

---

## 🎯 Understanding the Mode System

The ORCA Workflow Editor has 4 modes:

| Mode | Icon | Availability | Purpose |
|------|------|--------------|---------|
| **AI** | 🤖 Bot | Always | Generate workflows from natural language prompts |
| **Web Design** | 🌐 Globe | Project only | Design web-based components |
| **Workflow** | 🔗 Network | Project only | Edit workflow logic and connections |
| **Mobile Design** | 📱 Phone | Project only | Design mobile-optimized components |

**Key**: The first 3 modes (Web, Workflow, Mobile) only appear **after you have created a workflow project**.

---

## ✅ Quick Start (How to See All Modes)

### Step 1: Start in AI Mode
When you first load the editor, you'll see:
- ✅ **AI** button (always visible)
- ❌ Web Design button (hidden)
- ❌ Workflow button (hidden)  
- ❌ Mobile Design button (hidden)

### Step 2: Create a Project in AI Mode
In the **AI** panel on the right side:

**Option A - Use a Sample Prompt**:
```
Create a simple workflow with 3 nodes:
1. Input node that takes a number
2. Math node that doubles it
3. Output node that shows the result
```

**Option B - Use the "New Workflow" Button**:
- Look for a **"+ New Workflow"** button
- Click it to create an empty project

### Step 3: Unlock All Modes
Once your project has at least 1 node, you'll see all 4 modes in the toolbar:
- ✅ AI Mode
- ✅ Web Design
- ✅ Workflow
- ✅ Mobile Design

---

## 🔍 Troubleshooting

### Issue 1: "I only see the AI button"

**Diagnosis**: You don't have a workflow project created yet

**Solution**:
1. Go to AI mode (if not already there)
2. At the bottom right, look for a text input field
3. Type a prompt like:
   ```
   Create a calculator workflow with add, subtract, multiply nodes
   ```
4. Press Enter or click "Generate"
5. Wait for the workflow to be generated
6. Now refresh the page - all modes should appear

### Issue 2: "The mode buttons look faded/disabled"

**Diagnosis**: You're in a mode that's not available for your project

**Solution**:
1. Click the **AI** button (always available)
2. Create or modify your workflow
3. Return to the desired mode

### Issue 3: "I see the buttons but clicking them does nothing"

**Diagnosis**: JavaScript might not be loaded correctly

**Solution**:
1. **Clear browser cache**: Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
2. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. **Check console for errors**: Press F12 → Console → Look for red error messages
4. **Report errors** in the format below

---

## 🐛 If None of This Works

Please provide:

1. **Screenshot of what you see** - including the toolbar at the top
2. **Browser console errors** - Press F12, go to Console, copy any red text
3. **Browser/OS info** - What browser? Windows/Mac/Linux?

**Console Error Format**:
```
❌ ERROR: [Copy the exact error message here]
📍 Location: WorkflowToolbar.tsx line 142
🔧 Fix attempted: [what you tried]
```

**Share in a reply with**:
- Screenshot (if possible)
- Console errors (from F12)
- Browser name + version

---

## 📋 Complete Mode Reference

### AI Mode (🤖)
- **Always available**
- **Location**: Right side panel
- **What to do**:
  - Type prompts to generate workflows
  - Ask AI to "add a loop", "modify this node", etc.
  - Preview workflow before committing
- **Example prompts**:
  ```
  Create an invoice processing workflow
  Add error handling to the email node
  Change the database operation to use SQL
  ```

### Workflow Mode (🔗)
- **Available**: When you have a project
- **Location**: Canvas takes full space
- **What to do**:
  - Add/edit/delete nodes manually
  - Draw connections between nodes
  - Configure node properties
  - Set workflow variables
- **Toolbar in this mode**:
  - Quick access bar (left side)
  - Editor tools panel (right side)
  - Mini zoom preview (optional)

### Web Design Mode (🌐)
- **Available**: When you have a project
- **Location**: Right side panel
- **What to do**:
  - Design web UI components
  - Preview responsive layouts
  - Test on different screen sizes
- **Note**: Desktop/tablet/mobile previews

### Mobile Design Mode (📱)
- **Available**: When you have a project
- **Location**: Right side panel
- **What to do**:
  - Design mobile-specific layouts
  - Test touch interactions
  - Optimize for small screens
- **Note**: Vertical layout focused

---

## 🎮 Keyboard Shortcuts

| Shortcut | Action | Available In |
|----------|--------|--------------|
| `Cmd/Ctrl + K` | Open search | All modes |
| `Cmd/Ctrl + Z` | Undo | Workflow mode |
| `Cmd/Ctrl + Shift + Z` | Redo | Workflow mode |
| `Delete` | Delete selected node | Workflow mode |
| `Escape` | Deselect/close panels | All modes |

---

## 💡 Pro Tips

1. **Start with AI Mode** - It's the easiest way to get started
2. **Create a sample workflow first** - Then explore the other modes
3. **Use the search** (Cmd+K) - Find nodes and components quickly
4. **Check the console** (F12) - Most issues show error messages there
5. **Dark theme is default** - Stay in it for the best experience

---

## 🔗 Related Documentation

- `ORCA_PRODUCTION_READY.md` - Build status and features
- `DEPLOYMENT_READY_SUMMARY.md` - What's included in the build
- `CLOUDFLARE_PAGES_UPLOAD_GUIDE.md` - How to deploy

---

**Status**: Ready to help  
**Next**: Provide screenshot + console errors if still having issues

