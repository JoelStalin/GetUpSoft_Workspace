---
name: getupsoft-design-auditor
description: Visual & UX audit for GetUpSoft Website Redesign - verify design system compliance, WCAG accessibility, responsive design, brand consistency
---

# GetUpSoft Design Auditor

**Role:** Design system architect and UX auditor  
**When to use:** Design system specification, component design review, accessibility validation, responsive design verification  
**Audience:** Claude Code (design domain role)

---

## Purpose

This skill validates the visual and interactive design of the GetUpSoft redesign:

- Design system tokens compliance (colors, typography, spacing)
- Component design (buttons, cards, forms, layouts)
- Accessibility compliance (WCAG AA)
- Responsive design (mobile, tablet, desktop)
- Brand consistency (master prompt §6 visual direction)
- Performance impact (animations, effects)

---

## When to Use

✅ **Use when:**
- Creating design-system.md (Phase 1 start)
- Auditing component designs before coding
- Verifying responsive breakpoints
- Checking accessibility (contrast, focus, ARIA)
- Ensuring brand consistency across pages

❌ **Do NOT use for:**
- Code implementation (that's code-review)
- Copy/content decisions (that's ChatGPT)
- Scrum management (that's scrum-master)

---

## Input Required

1. **Master Prompt** (§6: Visual system, §7: Components, §13: Accessibility)
   - Color tokens, typography, spacing, button styles
   - Component catalog requirements
   - WCAG AA baseline

2. **Design Assets** (When Phase 1 starts)
   - Figma, design specs, or CSS code
   - Responsive breakpoint definitions
   - Component variants

3. **Brand Reference**
   - docs/brand-voice.md (tone, not visual, but related)
   - Master prompt §6 (dark, enterprise, premium, technical)

---

## Design System Specification

### Phase 1 Deliverable: docs/design-system.md

Must include:

**1. Color Tokens** (Master Prompt §6.2)

```ts
colors: {
  background:      '#070B12',      // Page background (darkest)
  surface:         '#0D1320',      // Card/container background
  surfaceElevated: '#111827',      // Elevated surfaces (modals, dropdowns)
  surfaceSoft:     '#162033',      // Soft backgrounds
  border:          'rgba(...)',    // Subtle borders
  borderStrong:    'rgba(...)',    // Stronger borders
  text:            '#E5E7EB',      // Primary text (lightest)
  textMuted:       '#94A3B8',      // Secondary text
  textSubtle:      '#64748B',      // Tertiary text
  primary:         '#5EEAD4',      // Teal (primary action)
  primaryStrong:   '#14B8A6',      // Dark teal (hover)
  accentBlue:      '#60A5FA',      // Blue (secondary)
  accentViolet:    '#A78BFA',      // Purple (tertiary)
  warning:         '#F97316',      // Orange (warnings)
  success:         '#22C55E',      // Green (success)
  danger:          '#EF4444',      // Red (errors)
}
```

**2. Typography** (Master Prompt §6.3)

| Context | Desktop | Mobile | Font | Weight |
|---|---|---|---|---|
| Hero H1 | 72–96px | 42–56px | Inter/Geist | Bold |
| H2 Section | 44–64px | 34–44px | Inter/Geist | Bold |
| H3 | 28–36px | 24–28px | Inter | Semi-bold |
| Body | 16–18px | 16px | Inter | Regular |
| Small | 12–14px | 12px | Inter | Regular |
| Eyebrow | 11–12px uppercase | 11–12px | Inter | Semi-bold |
| Mono (code) | 13–14px | 12px | JetBrains Mono | Regular |

**3. Spacing** (Master Prompt §6.4)

```
Section padding vertical:
- Desktop: 96–144px
- Mobile: 64–88px

Container max-width: 1200–1280px
Padding horizontal: 24–32px (mobile), 32–48px (desktop)

Element spacing:
- Gap (flex items): 16, 24, 32, 48px
- Margin (block items): 12, 16, 24, 32, 48px
- Padding (internal): 12, 16, 24, 32px
```

**4. Button System** (Master Prompt §6.5)

| Variant | Background | Text | Hover | Size |
|---|---|---|---|---|
| Primary | Teal #5EEAD4 | Dark #061014 | Glow + shadow | 48–56px h |
| Secondary | Transparent | Border + teal text | Border glow | 48–56px h |
| Ghost | Transparent | Teal text | Underline | Auto |
| Warning | Orange soft | Dark | Orange glow | 48–56px h |

All with: rounded-full, uppercase 12px, focus visible, disabled state

**5. Components** (Master Prompt §7)

Catalog of:
- Button (5 variants)
- Container/Section
- Card (hover: translateY(-4px))
- Header (sticky, glassmorphism backdrop)
- Footer (columns, responsive)
- Hero section (2-col desktop, 1-col mobile)
- Service Card
- Product Card
- Process Step
- FAQ (accordion)
- Forms (input, select, textarea, validation)

**6. Responsive Breakpoints**

```css
/* Mobile */
@media (max-width: 767px) { ... }

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) { ... }

/* Desktop */
@media (min-width: 1024px) { ... }

/* Large Desktop */
@media (min-width: 1280px) { ... }
```

---

## Audit Checklist (Component Design Review)

For each component/page being designed:

### Visual Compliance

- ☑ Uses design system color tokens (not hardcoded hex)
- ☑ Typography matches spec (font, size, weight)
- ☑ Spacing matches tokens (no random margins/padding)
- ☑ Button styles match variants (primary, secondary, ghost, warning)
- ☑ Dark theme consistent (background #070B12, text #E5E7EB)
- ☑ Premium feel (no bright primary colors, no clutter)
- ☑ Enterprise appearance (clean, minimal, technical)

### Accessibility (WCAG AA)

- ☑ Color contrast ≥ 4.5:1 (normal) or 3:1 (large text)
  - Black text on light background: OK
  - White text on dark: Check ratio
  - Colored text: Verify against color background combo
- ☑ Focus states visible (`:focus` outline or highlight)
- ☑ Interactive elements keyboard-accessible
- ☑ Form labels associated (implicit or explicit)
- ☑ Error messages clear and accessible
- ☑ Icons have alt text or aria-label
- ☑ Respect `prefers-reduced-motion` (no autoplay animations)

### Responsive Design

- ☑ Mobile view: < 768px (stacked layout, readable text)
- ☑ Tablet view: 768–1024px (hybrid layout)
- ☑ Desktop view: > 1024px (optimal layout)
- ☑ Images scale appropriately
- ☑ Text readable at all sizes
- ☑ Buttons/touch targets ≥ 48px × 48px (mobile)
- ☑ No horizontal scroll on mobile
- ☑ Hamburger menu collapses nav (mobile only)

### Performance

- ☑ Animations use CSS (not JavaScript-heavy)
- ☑ Images use `next/image` or lazy loading
- ☑ No inline styles (use Tailwind/CSS)
- ☑ Animation duration 180–240ms (feels smooth)
- ☑ No animation blocking render (use `will-change` if needed)

### Brand Consistency

- ☑ Matches master prompt §6 (dark, enterprise, technical, premium)
- ☑ Feels like cloud infrastructure company (AWS, Google Cloud, Cloudflare tone)
- ☑ Professional tone (not playful, not startup-y)
- ☑ Consistent with existing pages (if any)

---

## Output: Design Audit Report

### Approval (All Compliant)

```
✅ Design Audit PASSED

Component(s): [list]
Reviewed by: Claude (getupsoft-design-auditor)
Date: [date]

Findings: None (all design system tokens and accessibility standards met)
Responsive: Mobile/Tablet/Desktop verified
Accessibility: WCAG AA baseline compliant
Brand consistency: Enterprise visual identity confirmed

Approved for: Development by Codex
```

### Changes Requested

```
⚠️ Design Audit REQUIRES CHANGES

Component(s): [list]
Issues found:

1. **[Issue Title]** (Critical/Major/Minor)
   Location: [component/section]
   Current: [describe what's wrong]
   Fix: [specific recommendation, reference token/spec]

2. [Additional issues...]

Next: Resubmit after fixes for approval
```

---

## Definition of Success

- ☑ Design system spec created (docs/design-system.md, 50+ lines)
- ☑ All tokens defined and used consistently
- ☑ Components documented with variants
- ☑ Responsive breakpoints tested
- ☑ Accessibility baseline verified
- ☑ Brand identity maintained
- ☑ Performance impact assessed
- ☑ Components ready for coding

---

## Limits

❌ Do NOT: Write code (that's Codex)  
❌ Do NOT: Create visual assets (that's Gemini)  
❌ Do NOT: Make content decisions (that's ChatGPT)  

✅ DO: Validate design compliance  
✅ DO: Ensure accessibility  
✅ DO: Verify responsive design  
✅ DO: Maintain brand consistency  

---

_GetUpSoft Design Auditor Skill v1.0 · Created 2026-05-19_
