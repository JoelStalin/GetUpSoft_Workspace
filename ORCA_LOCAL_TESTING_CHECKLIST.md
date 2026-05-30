# ORCA Workflow Editor - Local Testing Checklist

**Date**: 2026-05-30  
**Server**: http://localhost:5173  
**Status**: Running (npm run dev)

---

## 🎯 QUICK START

### Step 1: Open in Browser
```
http://localhost:5173
```

### Step 2: Visual Check
- [ ] **ORCA Logo** appears in top-left corner
- [ ] **Dark theme** is active (dark background)
- [ ] **Canvas area** is visible in center (white/light background)
- [ ] **Top bar** shows mode buttons
- [ ] **Right panel** shows AI chat interface

### Step 3: Create Your First Workflow
In the **AI panel** on the right, type:
```
Create a simple calculator workflow with input, add, and output nodes
```

Then press **Enter** or click **Generate**.

### Step 4: Verify Modes Appear
After workflow generates, check if these buttons appear in the top bar:
- [ ] **Web Design** (globe icon)
- [ ] **Workflow** (network icon)  
- [ ] **Mobile Design** (phone icon)
- [ ] **AI** (robot icon - should already be there)

---

## ✅ TESTING CHECKLIST

### UI Elements
- [ ] ORCA logo visible
- [ ] Top navigation bar present
- [ ] Canvas/workspace visible
- [ ] Right side panel visible
- [ ] Dark theme active
- [ ] Responsive layout

### Mode System
- [ ] AI mode always visible
- [ ] Web/Workflow/Mobile modes appear AFTER creating nodes
- [ ] Mode switching works (click button → UI changes)
- [ ] Current mode is highlighted/active

### Workflow Creation
- [ ] Can type in AI panel
- [ ] Can send prompt (Enter or Generate button)
- [ ] Workflow generates successfully
- [ ] Nodes appear on canvas
- [ ] Canvas is interactive

### Node Interactions
- [ ] Can click on nodes
- [ ] Node properties appear when selected
- [ ] Can drag nodes around canvas
- [ ] Can zoom in/out on canvas
- [ ] Can pan/move viewport

### Performance
- [ ] Page loads in < 2 seconds
- [ ] Mode switching is instant
- [ ] No lag when interacting
- [ ] No console errors (F12)

---

## 🐛 TROUBLESHOOTING

### Issue: Page doesn't load
**Solution:**
1. Wait 10 seconds and refresh (Ctrl+R)
2. Check browser console (F12 → Console)
3. Report any red error messages

### Issue: Only see "AI" mode, not others
**This is NORMAL** - see section below

### Issue: Modes don't appear even after creating workflow
**Check:**
1. Do you have any nodes on the canvas?
2. Open F12 → Console
3. Check for error messages
4. Refresh page

### Issue: Cannot type in AI panel
**Try:**
1. Click inside the text input field
2. Try a simple prompt: `Create 3 nodes`
3. If still doesn't work, report in feedback

### Issue: Canvas is blank
**Try:**
1. Create a workflow via AI
2. Or manually add nodes from left sidebar
3. If still blank, report in feedback

---

## 📝 EXPECTED BEHAVIOR

### Initial Load (No workflow yet)
```
✅ Toolbar shows: [AI] mode only
✅ Canvas: Empty white area
✅ Right panel: Ready for prompt
```

### After Creating Workflow
```
✅ Toolbar shows: [Web] [Workflow] [Mobile] [AI]
✅ Canvas: Shows generated nodes
✅ Can click nodes, switch modes, edit
```

### Workflow Modes System

| Situation | Expected Behavior |
|-----------|-------------------|
| No workflow created | Only AI mode visible |
| Workflow created, no nodes | Only AI mode visible |
| Workflow with nodes | **All 4 modes visible** ← KEY REQUIREMENT |
| Click different mode | UI changes, mode highlights |

---

## 📊 TEST REPORT

Please report:

```markdown
## ORCA Local Testing Report

**Date**: [Today's date]
**Browser**: [Chrome/Firefox/Safari]
**OS**: [Windows/Mac/Linux]

### ✅ What Works
- [list items that work]

### ❌ What Doesn't Work
- [list items with issues]

### 🐛 Errors Found
[Paste any console errors from F12]

### ⚠️ Other Issues
[Any other observations]

### 🎯 Conclusion
- [ ] Ready for Cloudflare Pages upload
- [ ] Needs fixes first
```

---

## 🔍 ADVANCED DEBUGGING

### Check Server Logs
```bash
tail -f C:\Users\yoeli\AppData\Local\Temp\orca-dev-session.log
```

### Open Browser DevTools
- **F12** or **Ctrl+Shift+I**
- Check **Console** tab for errors
- Check **Network** tab for failed requests
- Check **Elements** tab for DOM

### Test Server Directly
```powershell
curl http://localhost:5173/
```

### Kill and Restart Server
```powershell
Stop-Job
cd apps\orca\workflow-editor
npm run dev
```

---

## ✅ SUCCESS CRITERIA

ORCA is working correctly when:

1. ✅ Page loads at http://localhost:5173
2. ✅ ORCA UI is visible
3. ✅ Can create workflow with AI prompt
4. ✅ Modes appear after creating nodes
5. ✅ Can switch between modes
6. ✅ No console errors
7. ✅ Responsive and fast

---

## 📞 HOW TO REPORT

When you've tested, reply with:

```
ORCA Testing Complete:

✅ Loads: YES / NO
✅ UI visible: YES / NO  
✅ Modes appear: YES / NO
✅ No errors: YES / NO

Ready for upload: YES / NO

[Any other notes]
```

---

**Server is running at http://localhost:5173**  
**Ready for testing whenever you are!**
