# 🔴 QA UI-UX MANDATORY PROCESS

**This is BINDING. Non-compliance will block your code review.**

---

## TL;DR (30 seconds)

1. Make UI-UX change
2. Take BEFORE screenshot
3. Rebuild: `npm run build`
4. Open http://localhost:5173 (Chrome)
5. Take AFTER screenshot
6. Fill `QA_CHECKLIST.txt` (20 min)
7. Commit screenshots + checklist
8. Submit for code review

**If ANY checklist item fails:** Fix it before submitting.

---

## STEP-BY-STEP PROCESS

### Step 1: BEFORE You Change Anything
```bash
# Take screenshot of CURRENT state
# Filename: before_2026-05-22_14-30.png
# Location: Chrome DevTools → Capture screenshot
```

### Step 2: Make Your UI-UX Change
Edit component files as needed.

### Step 3: Build & Verify
```bash
cd apps/orca/workflow-editor
npm run build
```

Expected:
- ✅ `✓ built in XX.XXs`
- ✅ No red errors in console
- ✅ TypeScript passes

If FAIL: Fix errors before continuing.

### Step 4: Test in Browser
```
1. Open http://localhost:5173
2. Wait for page to load
3. Clear browser cache (Ctrl+Shift+Delete)
4. Hard refresh (Ctrl+F5)
```

### Step 5: Take AFTER Screenshot
Same viewport as BEFORE screenshot.
```
Filename: after_2026-05-22_14-30.png
(Use same dimensions as BEFORE)
```

### Step 6: Run QA Checklist
**Open:** `QA_CHECKLIST.txt`

**Fill out ALL 10 sections:**
- A. Visual Regression (5 min)
- B. Contrast & Accessibility (3 min)
- C. Interaction States (3 min)
- D. Z-Index & Layering (2 min)
- E. Responsive Design (3 min)
- F. Keyboard Navigation (2 min)
- G. Browser DevTools (2 min)
- H. Bundle Size & Performance (auto)
- I. Screenshots (documentation)
- J. Consistency Matrix (5 min)

**Total time: ~25 minutes**

### Step 7: Generate QA Report
Create file: `QA_REPORTS/[date]-[component]-QA-REPORT.md`

Template:
```markdown
# QA Report - [Component Name]
**Date:** 2026-05-22  
**Agent:** Your Name  
**Component Changed:** ComponentName.tsx  

## Checklist Results
- [ ] A. Visual Regression: ✅ PASS
- [ ] B. Contrast & Accessibility: ✅ PASS
- [ ] C. Interaction States: ✅ PASS
- [ ] D. Z-Index & Layering: ✅ PASS
- [ ] E. Responsive Design: ✅ PASS
- [ ] F. Keyboard Navigation: ✅ PASS
- [ ] G. Browser DevTools: ✅ PASS
- [ ] H. Bundle Size: ✅ PASS
- [ ] I. Screenshots: ✅ PROVIDED
- [ ] J. Consistency: ✅ OK

## Issues Found
None.

## Sign-off
QA Status: ✅ APPROVED
Ready for Code Review: YES
```

### Step 8: Commit Everything
```bash
git add .
git commit -m "feat: [component] - UI improvement

- Changed [what changed]
- Verified WCAG AA accessibility
- All QA checks passed
- Before/after screenshots included

QA Report: QA_REPORTS/2026-05-22-component-qa.md"
```

### Step 9: Push & Create PR
```bash
git push origin [branch]
gh pr create --title "UI: [component] improvements"
```

In PR description, include:
```markdown
## QA Verification
- [x] All 10 QA categories passed
- [x] WCAG AA accessibility verified
- [x] Color contrast ≥ 4.5:1
- [x] Responsive tested (1024/1440/1920px)
- [x] Browser tested (Chrome/Firefox/Safari)
- [x] Before/after screenshots attached
- [x] Performance impact <50KB

See: QA_REPORTS/[date]-[component]-qa.md
```

---

## WHAT EACH QA SECTION CHECKS

### A. Visual Regression (5 min)
Does the component look right?
- Colors visible (not too dim)
- Text readable
- Icons render
- Spacing correct
- Shadows/borders work

**Tool:** Browser + DevTools  
**Fail criteria:** Color too dim, icon missing, text tiny

### B. Contrast & Accessibility (3 min)
Can all users see/understand it?
- Text contrast ≥ 4.5:1
- Buttons ≥ 44px
- Font size ≥ 12px
- Color + icon (not just color)
- No flashing animations

**Tool:** axe DevTools + contrast checker  
**Fail criteria:** Contrast <4.5:1, button <44px, text <12px

### C. Interaction States (3 min)
Do all states work?
- Hover: scale/color change
- Focus: visible ring/glow
- Active: highlighted
- Disabled: grayed (if applicable)
- Loading: spinner shows (if applicable)

**Tool:** Browser + keyboard  
**Fail criteria:** State missing, not visible, no feedback

### D. Z-Index & Layering (2 min)
Is stacking order correct?
- Search dialog: 9995-9996
- Toast: 9999
- Popover: ≥100
- No overlapping conflicts

**Tool:** DevTools → Elements tab  
**Fail criteria:** Z-index collision, overlap unintended

### E. Responsive Design (3 min)
Works on all screen sizes?
- 1024px (tablet)
- 1440px (desktop)
- 1920px (4K)

**Tool:** Browser → resize window  
**Fail criteria:** Overflow, clipping, layout breaks

### F. Keyboard Navigation (2 min)
Fully keyboard accessible?
- Tab moves logically
- Escape closes dialogs
- Enter activates buttons
- Arrow keys navigate lists
- No keyboard traps

**Tool:** Keyboard only (no mouse)  
**Fail criteria:** Can't reach element, Tab trap, no focus visible

### G. Browser DevTools (2 min)
Console clean?
- 0 red errors
- No CSS warnings
- No jank on interactions
- Performance ≥70 (Lighthouse)

**Tool:** Chrome DevTools → Console, Lighthouse  
**Fail criteria:** Red errors, warnings, jank, low score

### H. Bundle Size & Performance (auto)
Build efficient?
- Build completes
- Bundle <900KB
- Increase <50KB

**Tool:** `npm run build`  
**Fail criteria:** Build fails, bundle >500KB, increase >50KB

### I. Screenshots (documentation)
Evidence provided?
- Before screenshot
- After screenshot
- Same viewport
- Timestamps in filename

**Tool:** Screenshot tool  
**Fail criteria:** Missing screenshots, different sizes, no timestamp

### J. Consistency Matrix (5 min)
Matches existing design?
- Padding: 8px, 12px, 16px
- Border-radius: 8px
- Colors: #4A9EFF, #1DB954, etc.
- Shadows: standard patterns
- Typography: 16px headers, 12px body

**Tool:** Code review + design doc  
**Fail criteria:** Inconsistent sizing, color mismatch, broken pattern

---

## COMMON MISTAKES (Learn from these)

❌ **DON'T:**
- Change UI without taking BEFORE screenshot
- Skip the QA checklist
- Submit without screenshots
- Assume "looks good" means accessible
- Use colors < 4.5:1 contrast
- Make buttons < 44px
- Ignore DevTools errors
- Test on 1 browser only
- Merge without checklist filled

✅ **DO:**
- Screenshot BEFORE change
- Fill every section of QA_CHECKLIST.txt
- Provide before/after screenshots
- Use axe DevTools for accessibility
- Check contrast ratio
- Make buttons 44px minimum
- Fix ALL console errors
- Test Chrome + Firefox + Safari
- Get QA sign-off before merge

---

## WHAT HAPPENS IF YOU SKIP QA

| Violation | 1st Time | 2nd Time | 3rd Time |
|-----------|----------|----------|----------|
| Missing checklist | ⚠️ Warning | 🚫 Blocked | 🔴 Escalated |
| Failed QA check | ⚠️ Warning | 🚫 Blocked | 🔴 Escalated |
| No screenshots | ⚠️ Warning | 🚫 Blocked | 🔴 Escalated |
| Contrast issue | 🚫 Blocked | 🚫 Blocked | 🔴 Escalated |

**Escalated = removed from ORCA UI-UX tasks**

---

## TOOLS YOU'LL NEED

**Free & Built-in:**
- Chrome DevTools (F12)
- axe DevTools (Chrome extension)
- Lighthouse (in DevTools)
- Accessible Colors (https://accessible-colors.com/)

**Commands:**
```bash
npm run build      # Compile & check bundle
npm run dev        # Start dev server
```

---

## DOCUMENTATION LINKS

- **Full QA Rules:** `.claude/projects/.../memory/qa_ui_ux_mandatory_rules.md`
- **QA Checklist:** `apps/orca/workflow-editor/QA_CHECKLIST.txt` (THIS FILE)
- **Accessibility:** `apps/orca/workflow-editor/ACCESSIBILITY_STATEMENT.md`
- **Audit Template:** `apps/orca/workflow-editor/QA_UI_UX_AUDIT.md`
- **Previous Audits:** `QA_REPORTS/` directory

---

## SUPPORT & QUESTIONS

**Where's my answer?**
1. Read `qa_ui_ux_mandatory_rules.md` (95% of questions answered)
2. Check `ACCESSIBILITY_STATEMENT.md` (accessibility questions)
3. Look in `QA_REPORTS/` for examples of passing audits
4. Ask QA Lead in Slack #orca-qa

---

## QUICK REFERENCE CARD

```
WCAG AA STANDARDS (Minimum)
├── Text Contrast: 4.5:1
├── UI Contrast: 3:1
├── Button Size: 44x44px
├── Font Size: 12px (body), 16px (header)
├── Keyboard: Full navigation support
└── Colors: Not the only signal

STANDARD DESIGN VALUES
├── Padding: 8px, 12px, 16px
├── Border-radius: 8px
├── Transitions: 0.2s
├── Shadows: Light/Medium
├── Colors:
│   ├── Primary: #4A9EFF (blue)
│   ├── Success: #1DB954 (green)
│   └── Danger: #ed315d (red)
└── Z-Index:
    ├── Toast: 9999
    ├── Search: 9995-9996
    └── Popover: 100+
```

---

**Last Updated:** 2026-05-22  
**Status:** ACTIVE & MANDATORY  
**Violations:** 🔴 BLOCKING MERGES

✨ *Good UI-UX is invisible. Bad UI-UX is the first thing users notice. Let's make ORCA exceptional.* ✨
