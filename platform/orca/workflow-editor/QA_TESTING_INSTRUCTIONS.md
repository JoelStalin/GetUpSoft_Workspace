# QA Testing Instructions - Recent Changes Validation
**Date:** 2026-05-22  
**Dev Server:** http://localhost:5182  
**Session Type:** Browser validation after code changes

---

## 🎯 REQUIRED TESTING CHECKLIST

### 1. COMPONENT DESCRIPTIONS - Expand on Click (NEW FEATURE)
**Expected Behavior:** Component items should show ONLY the label. Description appears ONLY when clicked.

**Test Steps:**
- [ ] Open http://localhost:5182 in Chrome
- [ ] Look at the "Triggers" category (should be expanded by default)
- [ ] Hover over "Trigger" item - description should NOT be visible
- [ ] Click on "Trigger" item - description "Start a workflow execution" should appear
- [ ] Click again - description should disappear
- [ ] Repeat for all items: "AI Prompt", "HTTP Request", "Condition", "Loop", "Set Variable", "Execute", "End"
- [ ] All descriptions should show only when that specific item is clicked
- [ ] Multiple descriptions should NOT show simultaneously (only one at a time)

**Verification:**
- [ ] ✅ PASS - Descriptions appear on click, disappear on second click
- [ ] ❌ FAIL - Descriptions visible by default or not toggleable

---

### 2. SEARCH DISABLED BY DEFAULT ON PAGE LOAD (NEW)
**Expected Behavior:** Search dialog should NOT open when page first loads.

**Test Steps:**
- [ ] Open http://localhost:5182 in Chrome (fresh load, clear cache if needed)
- [ ] Wait 2 seconds for full page load
- [ ] Search dialog should NOT be open (should see the canvas and components panel only)
- [ ] Press Ctrl+K (or Cmd+K on Mac) - search should open
- [ ] Press Escape - search should close
- [ ] Refresh the page (Ctrl+R) - search should remain closed

**Verification:**
- [ ] ✅ PASS - Search dialog closed on page load, opens only when user presses Ctrl+K
- [ ] ❌ FAIL - Search dialog open automatically or doesn't respond to Ctrl+K

---

### 3. MINIZOOM DISABLED BY DEFAULT ON PAGE LOAD (NEW)
**Expected Behavior:** MiniZoom (cursor preview box) should NOT appear when page loads.

**Test Steps:**
- [ ] Open http://localhost:5182 in Chrome
- [ ] Move cursor around the canvas - should NOT see a zoomed preview box following the cursor
- [ ] In bottom QuickAccessBar, find the MiniZoom toggle button (green magnifying glass icon)
- [ ] Click the MiniZoom toggle - cursor preview box should appear
- [ ] Move cursor around - preview box should follow cursor showing 2x zoom
- [ ] Click toggle again - preview box should disappear
- [ ] Refresh page (Ctrl+R) - MiniZoom should be OFF again (no preview box)

**Verification:**
- [ ] ✅ PASS - MiniZoom starts disabled, toggles on/off correctly, persists OFF after refresh
- [ ] ❌ FAIL - MiniZoom visible by default or toggle doesn't work

---

### 4. COLLAPSED CATEGORY BAR - Vertical Icons (EXISTING - VERIFY STILL WORKS)
**Expected Behavior:** When components panel is minimized, vertical icon bar should appear on left.

**Test Steps:**
- [ ] Open http://localhost:5182
- [ ] Look for components panel on left (should be visible and expanded)
- [ ] Find the minimize button in the components panel header (looks like minimize icon)
- [ ] Click minimize - components panel should collapse
- [ ] A vertical icon bar should appear showing category icons:
  - [ ] Bell icon (red/orange) = Triggers
  - [ ] Brain icon (purple) = AI
  - [ ] Globe icon (teal/blue) = Network
  - [ ] Git Branch icon (orange) = Control Flow
  - [ ] Wrench icon (gray) = Utils
- [ ] Hover over each icon - should highlight with subtle background
- [ ] Click any icon - components panel should expand showing that category
- [ ] Click minimize again - panel collapses, icons show again

**Verification:**
- [ ] ✅ PASS - All 5 category icons appear, have correct colors, are clickable
- [ ] ❌ FAIL - Icons missing, wrong colors, or don't expand panel

---

### 5. VISUAL REGRESSION CHECK - Overall UI (EXISTING)
**Expected Behavior:** UI should match previous state (no accidental breakage).

**Test Steps:**
- [ ] Compare current state with previous session:
  - [ ] Canvas renders correctly (white background, grid visible)
  - [ ] Sample nodes show (3 default nodes: trigger, HTTP, AI)
  - [ ] Floating windows draggable (try dragging components panel around)
  - [ ] Colors consistent (blue accents #4A9EFF, text white, dark background)
  - [ ] No layout shifts or broken positioning
  - [ ] No console errors (press F12, check Console tab)

**Verification:**
- [ ] ✅ PASS - UI looks correct, no visual regressions
- [ ] ❌ FAIL - Components broken, colors wrong, console errors

---

### 6. MINMAP TOGGLE (EXISTING - VERIFY)
**Expected Behavior:** MiniMap toggle in QuickAccessBar should work.

**Test Steps:**
- [ ] Look at QuickAccessBar at bottom center
- [ ] Find MiniMap toggle button (it's one of the icon buttons, not the green MiniZoom)
- [ ] Canvas should show MiniMap in bottom-left corner (small preview of full workflow)
- [ ] Click MiniMap toggle - it should disappear
- [ ] Click again - it should reappear
- [ ] Note: MiniMap is NOT the cursor preview (that's MiniZoom)

**Verification:**
- [ ] ✅ PASS - MiniMap appears/disappears correctly when toggled
- [ ] ❌ FAIL - MiniMap broken or toggle doesn't work

---

### 7. BROWSER DEVTOOLS VALIDATION (CRITICAL)
**Test Steps:**
- [ ] Open Chrome DevTools (F12)
- [ ] Go to Console tab
- [ ] Check for red errors - should be ZERO red errors
- [ ] Check for TypeScript/CSS warnings - should be minimal
- [ ] Go to Elements tab → search for component by ID or class
- [ ] Verify CSS variables are resolving (--stitch-text, --stitch-accent, etc.)

**Verification:**
- [ ] ✅ PASS - 0 red console errors, CSS variables resolve correctly
- [ ] ❌ FAIL - Red errors present, undefined CSS variables

---

### 8. KEYBOARD NAVIGATION (WCAG AA)
**Test Steps:**
- [ ] Press Tab repeatedly - focus should move through buttons logically
- [ ] Press Escape when search is open - search should close
- [ ] Press Escape when component description is expanded - should collapse it
- [ ] Focus should always be visible (blue outline around elements)

**Verification:**
- [ ] ✅ PASS - All keyboard shortcuts work, focus visible
- [ ] ❌ FAIL - Keyboard shortcuts broken or focus invisible

---

### 9. RESPONSIVE DESIGN
**Test Steps:**
- [ ] Resize browser window to 1024px wide - UI should adapt gracefully
- [ ] Resize to 1440px - should look normal
- [ ] Resize to 1920px - should spread out nicely without breaking
- [ ] Test on mobile size (400px) - optional but recommended

**Verification:**
- [ ] ✅ PASS - UI responsive at all sizes, no clipping or overflow
- [ ] ❌ FAIL - Layout breaks at certain sizes

---

## 📸 SCREENSHOT EVIDENCE REQUIRED

Take these screenshots to document the testing:

1. **Full page load state:**
   - Filename: `before_full_page_2026-05-22_14-30.png`
   - What: Entire ORCA UI at 1440px width, search closed, MiniZoom off

2. **Component description expanded:**
   - Filename: `after_description_expanded_2026-05-22_14-30.png`
   - What: One component item expanded showing its description

3. **Collapsed category bar:**
   - Filename: `after_category_bar_vertical_2026-05-22_14-30.png`
   - What: Components panel minimized, showing vertical icon bar

4. **MiniZoom active:**
   - Filename: `after_minizoom_active_2026-05-22_14-30.png`
   - What: Cursor preview box visible on canvas

5. **Search dialog open:**
   - Filename: `after_search_dialog_2026-05-22_14-30.png`
   - What: Search dialog open (press Ctrl+K)

**Save to:** `C:\Users\yoeli\Documents\GetUpSoft_Workspace\apps\orca\workflow-editor\QA_REPORTS\screenshots\2026-05-22\`

---

## 🔍 QA CHECKLIST SUMMARY

| Item | Status | Notes |
|------|--------|-------|
| Component descriptions toggle on click | ⬜ | Test clicking each item |
| Search closed on page load | ⬜ | Verify no auto-open |
| MiniZoom disabled on page load | ⬜ | Verify no cursor preview |
| Vertical icon bar on minimize | ⬜ | All 5 icons visible |
| MiniMap toggle works | ⬜ | Can show/hide |
| Visual regression | ⬜ | Compare with previous |
| Console clean (0 errors) | ⬜ | Check DevTools |
| Keyboard navigation works | ⬜ | Tab, Escape keys |
| Responsive design | ⬜ | 1024/1440/1920px |
| Screenshots provided | ⬜ | All 5 screenshots |

---

## ✅ SIGN-OFF

**When all tests pass:**
1. Fill in dates and times in this document
2. Save screenshots to QA_REPORTS/screenshots/
3. Commit with message:
   ```
   chore: qa validation - component descriptions, search/minizoom defaults, icon bar
   
   - ✅ Component descriptions now expand on click (not auto-visible)
   - ✅ Search dialog closed by default on page load
   - ✅ MiniZoom disabled by default on page load
   - ✅ Vertical icon bar appears when components minimized
   - ✅ All QA checks passed (10 sections)
   - ✅ Console clean (0 errors)
   - ✅ Before/after screenshots included
   
   QA Verified: 2026-05-22 by Manual Testing
   ```

---

**Dev Server URL:** http://localhost:5182  
**Expected time to test:** 10-15 minutes  
**Contact:** User for any issues

