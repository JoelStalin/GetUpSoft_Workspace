# 🎨 Design System — GetUpSoft Website Redesign

**Version:** 1.0  
**Status:** Reference for Phase 1+ development  
**Reference:** Master Prompt §6, §7  
**Last Updated:** 2026-05-19

---

## Overview

This design system defines all visual tokens, typography, components, and patterns for GetUpSoft website redesign. It ensures consistency across all pages, regions (Global / RD), and languages (ES / EN).

**Design Philosophy:**
- Enterprise, dark, sobering, premium, technical, clean, architectural
- Trustworthy B2B conversion-focused
- Cloud infrastructure + AI platform aesthetic
- Generous whitespace; avoid dense blocks

---

## 1. Color System

### Primary Palette

All colors use `#RGB` hex format. Reference for implementation in TailwindCSS `tailwind.config.ts` or `.css` variables.

#### Backgrounds & Surfaces

| Token | Hex | Usage | Notes |
|-------|-----|-------|-------|
| `background` | `#070B12` | Page background (darkest) | Primary dark neutral |
| `surface` | `#0D1320` | Cards, modals, elevated content | Slight elevation from background |
| `surfaceElevated` | `#111827` | Deeper cards, high elevation | Maximum elevation for card hierarchy |
| `surfaceSoft` | `#162033` | Subtle backgrounds, panels | For visual separation |
| `border` | `rgba(148, 163, 184, 0.18)` | Subtle borders, dividers | Low contrast; semantic visual separation |
| `borderStrong` | `rgba(226, 232, 240, 0.28)` | Strong borders, active states | Higher contrast; interactive boundaries |

#### Text & Foreground

| Token | Hex | Usage | Contrast |
|-------|-----|-------|----------|
| `text` | `#E5E7EB` | Primary body text, main copy | 16:1 ratio (AAA on background) |
| `textMuted` | `#94A3B8` | Secondary text, metadata, labels | 8:1 ratio (AA on background) |
| `textSubtle` | `#64748B` | Tertiary text, hints, captions | 4.5:1 ratio (AA minimum) |

#### Semantic Colors

| Token | Hex | Usage | Hover | Notes |
|-------|-----|-------|-------|-------|
| `primary` | `#5EEAD4` | Primary CTAs, highlights, accents | `#14B8A6` (darker teal) | Main brand color (teal) |
| `primaryStrong` | `#14B8A6` | Active states, primary button filled | — | Darker variant for pressed/active |
| `accentBlue` | `#60A5FA` | Secondary action, info, interactive | — | Complementary to primary teal |
| `accentViolet` | `#A78BFA` | Tertiary action, decorative, branding | — | For visual variety in special contexts |
| `warning` | `#F97316` | Urgent actions, warnings, caution | Darker orange on hover | Audits, diagnostics |
| `success` | `#22C55E` | Confirmations, completed, success | Darker green on hover | Form submissions, confirmations |
| `danger` | `#EF4444` | Errors, destructive actions, alerts | Darker red on hover | Form errors, critical failures |

### Accessibility

**Minimum Contrast Ratios (WCAG AA):**
- Normal text (14px+): **4.5:1**
- Large text (18px+, bold 14px+): **3:1**
- Graphics, components: **3:1**

**Implementation Note:**
- All text colors meet 4.5:1 minimum against `background` (#070B12)
- Primary button text (`#061014` on `#5EEAD4`) exceeds 10:1 ratio
- Use contrast checker: https://webaim.org/resources/contrastchecker/

---

## 2. Typography

### Font Stack

#### Headings (H1, H2, H3, H4, H5, H6)

**Preferred Stack:**
```css
font-family: 'Inter', 'Geist Sans', 'Satoshi', -apple-system, BlinkMacSystemFont, sans-serif;
font-weight: 600–700 (bold);
```

**Fallback Stack (if Inter unavailable):**
```css
font-family: 'Geist Sans', 'Satoshi', -apple-system, BlinkMacSystemFont, sans-serif;
```

#### Body Text & Paragraph

```css
font-family: 'Inter', 'Geist Sans', -apple-system, BlinkMacSystemFont, sans-serif;
font-weight: 400–500 (regular to medium);
```

#### Technical / Code / Decorative

```css
font-family: 'JetBrains Mono', 'Courier New', monospace;
font-weight: 400 (regular);
font-size: smaller (typically 12–14px);
```

### Type Scales

#### Desktop (1280px+)

| Element | Size | Weight | Line Height | Spacing |
|---------|------|--------|-------------|---------|
| H1 (Hero) | 72–96px | 700 | 1.1 | 1.5rem bottom |
| H2 (Section) | 44–64px | 700 | 1.2 | 1.5rem bottom |
| H3 (Subsection) | 28–36px | 600 | 1.3 | 1rem bottom |
| H4 (Card title) | 18–24px | 600 | 1.4 | 0.75rem bottom |
| Body | 16–18px | 400 | 1.6 | 1rem bottom |
| Small / Metadata | 12–14px | 500 | 1.5 | 0.5rem bottom |
| Eyebrow | 11–12px | 500 uppercase tracking-wide | 1.5 | 0.75rem bottom |

#### Mobile (< 768px)

| Element | Size | Weight | Line Height | Spacing |
|---------|------|--------|-------------|---------|
| H1 (Hero) | 42–56px | 700 | 1.1 | 1.25rem bottom |
| H2 (Section) | 34–44px | 700 | 1.2 | 1.25rem bottom |
| H3 | 22–28px | 600 | 1.3 | 0.75rem bottom |
| H4 (Card) | 16–18px | 600 | 1.4 | 0.5rem bottom |
| Body | 16px | 400 | 1.6 | 1rem bottom |
| Small | 12px | 500 | 1.5 | 0.5rem bottom |
| Eyebrow | 11px | 500 uppercase tracking-wide | 1.5 | 0.75rem bottom |

### Text Hierarchy

1. **H1 Hero:** Largest, bold, primary visual anchor
2. **H2 Section:** Introduces major section; visible from far away
3. **H3 Subsection:** Breaks up H2 content; card titles
4. **Body:** Main copy; 16–18px for readability
5. **Small/Metadata:** Dates, tags, secondary info; must be ≥12px
6. **Eyebrow:** Category label; uppercase, tracking-wide, ≥11px

---

## 3. Spacing & Layout

### Spacing Scale

Use TailwindCSS spacing or equivalent. All values in rem (1rem = 16px).

| Scale | Value | Usage |
|-------|-------|-------|
| `xs` | 0.25rem (4px) | Micro spacing between elements |
| `sm` | 0.5rem (8px) | Tight spacing within components |
| `md` | 1rem (16px) | Standard spacing, margins |
| `lg` | 1.5rem (24px) | Component spacing |
| `xl` | 2rem (32px) | Section spacing |
| `2xl` | 3rem (48px) | Large section spacing |
| `3xl` | 4rem (64px) | Major sections |
| `4xl` | 6rem (96px) | Hero + large visual spacing |
| `5xl` | 8rem (128px) | Page vertical spacing |

### Layout Grid

- **Max-width container:** 1200–1280px (adjust per breakpoint)
- **Gutters (horizontal padding):** 
  - Desktop: 2rem (32px) per side
  - Tablet: 1.5rem (24px) per side
  - Mobile: 1rem (16px) per side

### Section Spacing (Vertical)

| Breakpoint | Spacing | Notes |
|------------|---------|-------|
| Desktop (1280px+) | 96–144px | Generous whitespace; visual breathing room |
| Tablet (768–1279px) | 80–120px | Proportional reduction |
| Mobile (< 768px) | 64–88px | Tighter on small screens; still spacious |

### Breakpoints (TailwindCSS Standard)

```ts
// tailwind.config.ts
theme: {
  screens: {
    'sm': '640px',   // Small devices
    'md': '768px',   // Tablets
    'lg': '1024px',  // Small laptops
    'xl': '1280px',  // Standard desktop
    '2xl': '1536px', // Large desktop
  }
}
```

**Mobile-First Approach:**
- Default styles: mobile (< 640px)
- `sm:` prefix: 640px+
- `md:` prefix: 768px+ (tablets)
- `lg:` prefix: 1024px+
- `xl:` prefix: 1280px+ (desktop)

---

## 4. Component System

### 4.1 Button

**5 Variants (per master prompt §6.5):**

#### Primary
- **Use:** Book Strategy Session, Solicitar Diagnóstico, main CTA
- **Background:** `#5EEAD4` (primary teal)
- **Text:** `#061014` (dark, high contrast)
- **Border radius:** full (48px)
- **Padding:** 12–16px horizontal, 10–12px vertical
- **Typography:** uppercase, 12–14px, letter-spacing
- **Hover:** 
  - Glow: `box-shadow: 0 0 20px rgba(94, 234, 212, 0.4)`
  - Translate: `translateY(-1px)`
  - Transition: 180ms ease
- **Focus:** Visible outline offset 2px
- **Loading State:** Spinner icon + disabled opacity
- **Disabled:** opacity 50%, cursor not-allowed

#### Secondary
- **Use:** Explore services, View methodology, alternative action
- **Background:** transparent
- **Border:** 2px solid `borderStrong` (rgba(226, 232, 240, 0.28))
- **Text:** `#E5E7EB` (primary text)
- **Hover:** 
  - Border + text: shift to `primary` teal (#5EEAD4)
  - Transition: 180ms ease
- **Focus:** Outline visible
- **Padding/Radius:** Same as primary

#### Ghost
- **Use:** Learn more, View more, lightweight CTA
- **Background:** transparent
- **Border:** none
- **Text:** `primary` teal (#5EEAD4)
- **Icon:** Right arrow `→` suffix (optional)
- **Hover:** 
  - Arrow shifts +4px right
  - Text maintains teal
  - Transition: 180ms ease
- **No loading state** (typically simple navigation)

#### Warning
- **Use:** Urgent audits, diagnostics, caution actions
- **Background:** `#F97316` (orange, soft)
- **Text:** `#061014` (dark for contrast)
- **Border radius:** full
- **Hover:** 
  - Glow: `box-shadow: 0 0 20px rgba(249, 115, 22, 0.4)`
  - Transition: 180ms ease
- **Focus:** Visible outline

#### Region Pill (selector: Global / RD)
- **Use:** Region selector; small, inline
- **Style:** Small pill button (~8–10px padding)
- **Active state:** Background `primary` teal (10% opacity), border teal
- **Inactive:** Subtle text, light border
- **Size:** Compact; ~32–40px width each
- **Grouped:** Two pills side-by-side; only one active

**Universal Button Rules:**
- All variants must have **visible focus state** (outline 2px offset 2px)
- Icon-only buttons must have `aria-label`
- All CTAs must have real destination or documented `#tbd-` placeholder
- Disabled state: opacity 50%, cursor not-allowed

### 4.2 Card & Service Cards

#### Generic Card
- **Background:** `surface` (#0D1320)
- **Border:** 1px solid `border` (rgba(148, 163, 184, 0.18))
- **Border radius:** 12–16px
- **Padding:** 1.5–2rem
- **Box shadow:** None (flat design) OR subtle elevation on dark theme
- **Hover state:**
  - `translateY(-4px)` (lift effect)
  - Border: shift to `borderStrong` (rgba(226, 232, 240, 0.28))
  - Transition: 180–240ms ease
- **Responsive:** Full width mobile, fixed/flex desktop

#### Service Card
- **Extends Generic Card**
- **Contains:**
  - Icon (24–32px)
  - Title (H4)
  - Description (body text)
  - CTA button or link (optional)
- **Layout:** Icon top, title below, description, CTA at bottom
- **Mobile:** Stacked vertical
- **Desktop:** Icon left OR top; flexible

#### Product Card
- **Extends Generic Card**
- **Contains:**
  - Product name / logo
  - Feature list (3–5 bullets)
  - Status badge (e.g., "Production", "Coming Soon")
  - CTA button
- **Status Badge Styling:**
  - `success` (#22C55E) for production
  - `warning` (#F97316) for in development
  - `textMuted` for experimental

#### Industry Card
- **Similar to Product Card**
- **Contains:**
  - Industry name (e.g., "Retail", "Logistics")
  - Icon or visual
  - 2–3 key benefits
  - CTA ("Learn More", "Request Consultation")

### 4.3 Container, Section, Layout

#### Container
- **Max-width:** 1200–1280px
- **Margin:** `0 auto` (center)
- **Padding horizontal:** 2rem desktop / 1rem mobile
- **Purpose:** Wrapper for full-width sections

#### Section
- **Component wrapper for major page section**
- **Vertical spacing:** 96–144px desktop / 64–88px mobile
- **Contains:** Optional background color, optional pattern
- **Pattern:** Optional subtle gradient or texture (dark theme)
- **Children:** Usually `Container` + heading + content

#### Eyebrow
- **Pre-heading label**
- **Font:** 11–12px, uppercase, tracking-wide
- **Color:** `textMuted` or `primary` teal
- **Margin:** 0.75rem bottom
- **Usage:** Above every H1 and major H2

### 4.4 Forms

#### Form Field
- **Label:** Associated via `<label htmlFor="id">`
- **Input:** 16px, padding 12px horizontal / 10px vertical
- **Border:** 1px solid `border`
- **Border radius:** 8px
- **Focus:** Outline 2px solid `primary` (teal), offset 2px
- **Placeholder:** `textSubtle` (#64748B)
- **Error state:** Border + text `danger` (#EF4444), helper message via `aria-describedby`

#### Validation
- **Client-side:** Zod schema validation (TypeScript)
- **Server-side:** Repeat validation (defense in depth)
- **Error message:**
  - Color: `danger` (#EF4444)
  - Font size: 12px
  - Margin top: 0.5rem
  - Associated with input via `aria-describedby="error-[id]"`

#### States
- **Default:** Border `border`, text `text`
- **Focus:** Border outline 2px `primary`, shadow subtle
- **Error:** Border `danger`, helper text red, `aria-invalid="true"`
- **Disabled:** Opacity 50%, background `surfaceSoft`, cursor not-allowed
- **Loading:** Spinner in button, disabled input during submission

### 4.5 Navigation

#### Header
- **Position:** `sticky` or `fixed` at top
- **Height:** 70–80px desktop / 60–70px mobile
- **Background:** `background` (#070B12) OR glassmorphism effect (backdrop-filter: blur)
- **Border bottom:** 1px solid `border`
- **Layout:** Logo left, nav center, selectors right
- **Responsive:** Hamburger menu on mobile (< 768px)

#### Footer
- **Background:** `surface` (#0D1320) OR darker
- **Border top:** 1px solid `border`
- **Columns (desktop):** 4–5 columns (Product, Company, Resources, Legal)
- **Mobile:** Single column stacked
- **Content:** Links, copyright, social icons
- **Typography:** Body text reduced slightly; links `primary` teal

### 4.6 Additional Components

#### Badge
- **Use:** Tags, status labels, categories
- **Background:** `surfaceSoft` (#162033)
- **Text:** `text` or semantic color (success, warning, danger)
- **Padding:** 4–8px horizontal / 2–4px vertical
- **Border radius:** 12px (pill)
- **Typography:** 12px, medium weight

#### FAQ / Accordion
- **Item background:** `surface` (#0D1320)
- **Border:** 1px solid `border`
- **Border radius:** 8px
- **Padding:** 1rem
- **Question (trigger):** Bold, interactive (pointer cursor)
- **Hover question:** Text shift to `primary` teal
- **Answer:** Collapse/expand animation (180ms ease)
- **Icon:** Chevron or `+`/`-` rotates on toggle

---

## 5. Motion & Animation

### Principles

- **Duration:** 180–240ms for UI transitions
- **Easing:** `ease` (cubic-bezier) or `ease-in-out`
- **Accessibility:** Always respect `prefers-reduced-motion` media query
- **No excessive animation:** Focus on purposeful, subtle transitions

### Common Transitions

```css
/* Hover effects */
transition: all 180ms ease;

/* Slow reveal on viewport entry */
animation: fadeInUp 400ms ease 100ms both;

/* Button hover */
.button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(94, 234, 212, 0.1);
  transition: 180ms ease;
}

/* Respect motion preference */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Entrance Animations

- **Fade in:** opacity 0 → 1 (200ms)
- **Slide up:** translateY(20px) → 0 (300ms)
- **Fade + slide:** Combine for delicate entrance

### Exit Animations

- **Fade out:** opacity 1 → 0 (150ms)
- **Slide down:** translateY(0) → translateY(20px) (200ms)

---

## 6. Responsive Design Strategy

### Mobile-First

Start with mobile (< 640px) styles by default. Use breakpoints to enhance for larger screens:

```tsx
// In React/TailwindCSS
<div className="
  text-16px              // Mobile default
  md:text-18px           // Tablet+
  lg:text-18px           // Desktop+
  md:grid md:grid-cols-2 // Mobile: 1 col, Tablet+: 2 cols
">
```

### Touch Targets

- Minimum 48px × 48px (iOS guidelines)
- Account for fingers; avoid cramped buttons
- Mobile padding: 1rem min, 1.5rem ideal

### Image Handling

- Lazy load images below fold (`loading="lazy"`)
- Responsive images: `srcset` + `sizes`
- Max-width: 100%; height: auto for scale
- No horizontal scroll on any breakpoint

---

## 7. Implementation Checklist

### Phase 1 Tasks (Design System Lock-In)

- [ ] Color tokens imported into TailwindCSS config
- [ ] Font stack imported (Inter from Google Fonts, fallbacks defined)
- [ ] Spacing scale defined in TailwindCSS
- [ ] Breakpoints configured (sm, md, lg, xl, 2xl)
- [ ] Button component created with 5 variants
- [ ] Card component created with hover states
- [ ] Container component created (max-width, padding)
- [ ] Form field component created with validation styling
- [ ] Header created with sticky positioning
- [ ] Footer created with column layout
- [ ] Focus states visible on all interactive elements
- [ ] Accessibility: contrast verified on all text colors
- [ ] `prefers-reduced-motion` respected in animations
- [ ] Responsive design tested: 375px (mobile), 768px (tablet), 1280px (desktop)

### Phase 2+ Tasks (Component Expansion)

- [ ] Service cards created
- [ ] Product cards created
- [ ] Industry cards created
- [ ] Hero component with split layout
- [ ] Navigation responsive on mobile (hamburger menu)
- [ ] Form validation with error states
- [ ] FAQ accordion component
- [ ] Badge component
- [ ] All forms tested for accessibility + validation
- [ ] All pages responsive on all breakpoints

---

## 8. Tools & Resources

### Development

| Tool | Purpose | Link |
|------|---------|------|
| TailwindCSS | Utility CSS framework | https://tailwindcss.com/ |
| Headless UI | Accessible component library | https://headlessui.com/ |
| Inter Font | Heading/body typeface | https://rsms.me/inter/ |
| Figma | Design collaboration | https://figma.com/ |

### Validation

| Tool | Purpose | Link |
|------|---------|------|
| WebAIM Contrast Checker | Verify color contrast WCAG AA | https://webaim.org/resources/contrastchecker/ |
| axe DevTools | Accessibility audit | https://www.deque.com/axe/devtools/ |
| Chrome Lighthouse | Performance + accessibility | Chrome DevTools → Lighthouse |
| Responsive Viewer | Multi-breakpoint testing | Chrome extension |

---

## 9. Decision Log

| Decision | Date | Rationale |
|----------|------|-----------|
| Dark theme (#070B12) | 2026-05-19 | Enterprise SaaS aesthetic; reduces eye strain; premium feel |
| Teal primary (#5EEAD4) | 2026-05-19 | Tech-forward, modern; good contrast on dark bg; supports accessibility |
| 12–14px button text | 2026-05-19 | Visibility; uppercase ensures emphasis without large font size |
| 96–144px section padding | 2026-05-19 | Generous whitespace; enterprise feel; breathing room |
| Mobile-first approach | 2026-05-19 | Progressive enhancement; faster on mobile; scalable to desktop |

---

_Design System v1.0 · Created 2026-05-19 · Reference for Phase 1+ implementation_
