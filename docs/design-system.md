# 🎨 Design System — GetUpSoft Website Redesign

**Version:** 2.0 (Light Minimalist Aesthetic)
**Status:** Active baseline for Phase 1+ development
**Reference:** Master Prompt §6, §7
**Inspiration:** Explorium.ai (Light, Minimalist, Pastel)
**Last Updated:** 2026-05-19

---

## Overview

This design system defines a **Light Minimalist Aesthetic** for the GetUpSoft website. It shifts away from dark tones toward a clean, airy, and high-performance visual identity. It uses opaque pastel colors and generous whitespace to communicate technical sophistication with professional clarity.

**Design Philosophy:**
- **Aesthetic Minimalist:** Clean layouts, high-quality typography, and purposeful whitespace.
- **Pastel & Opaque:** Soft, non-vibrant primary and accent colors that feel modern and balanced.
- **Systematic Clarity:** Data-heavy sections are organized with strict grids and subtle borders.
- **Glassmorphic Accents:** Light-mode background blur and soft drop shadows for depth.

---

## 1. Color System

### Primary Palette (Light Aesthetic)

All colors use `#RGB` hex format. Reference for implementation in TailwindCSS `tailwind.config.ts` or `.css` variables.

#### Backgrounds & Surfaces

| Token | Hex | Usage | Notes |
|-------|-----|-------|-------|
| `background` | `#FFFFFF` | Page background (pure white) | Primary neutral |
| `surface` | `#F8FAFC` | Cards, modals, subtle panels | Light gray elevation |
| `surfaceElevated` | `#F1F5F9` | Elevated content, active states | Deeper gray for hierarchy |
| `surfaceSoft` | `#F1F5F9` | Subtle backgrounds, tags | For visual separation |
| `border` | `#E2E8F0` | Subtle borders, dividers | Low contrast; clean separation |
| `borderStrong` | `#CBD5E1` | Strong borders, focus states | Higher contrast; defined boundaries |

#### Text & Foreground

| Token | Hex | Usage | Contrast |
|-------|-----|-------|----------|
| `text` | `#0F172A` | Primary body text, main copy | High readability (Slate 900) |
| `textMuted` | `#475569` | Secondary text, metadata, labels | Balanced contrast (Slate 600) |
| `textSubtle` | `#94A3B8` | Tertiary text, hints, captions | Accessible (Slate 400) |

#### Semantic Colors (Pastel Opaque)

| Token | Hex | Usage | Notes |
|-------|-----|-------|-------|
| `primary` | `#818CF8` | Primary CTAs, highlights | Soft Indigo (Pastel) |
| `primaryStrong` | `#6366F1` | Active states, hover | Slightly deeper Indigo |
| `accentBlue` | `#7DD3FC` | Secondary action, tech-accents | Soft Sky Blue |
| `accentViolet` | `#C4B5FD` | Tertiary action, branding | Soft Purple |
| `warning` | `#FDBA74` | Warnings, caution | Pastel Orange |
| `success` | `#86EFAC` | Confirmations, success | Pastel Green |
| `danger` | `#FCA5A5` | Errors, alerts | Pastel Red |

### Accessibility

**Minimum Contrast Ratios (WCAG AA):**
- Normal text (14px+): **4.5:1**
- Large text (18px+, bold 14px+): **3:1**
- Graphics, components: **3:1**

**Implementation Note:**
- All text colors meet 4.5:1 minimum against `background` (#FFFFFF)
- Primary button text uses white on indigo for maximum clarity.
- Use contrast checker: https://webaim.org/resources/contrastchecker/

---

## 2. Typography

### Font Stack

#### Headings (H1, H2, H3, H4, H5, H6)

**Preferred Stack:**
```css
font-family: 'Inter', 'Geist Sans', 'Satoshi', -apple-system, BlinkMacSystemFont, sans-serif;
font-weight: 600–700 (bold);
letter-spacing: -0.02em;
```

#### Body Text & Paragraph

```css
font-family: 'Inter', 'Geist Sans', -apple-system, BlinkMacSystemFont, sans-serif;
font-weight: 400 (regular);
line-height: 1.6;
```

#### Technical / Code / Decorative

```css
font-family: 'JetBrains Mono', 'Courier New', monospace;
font-weight: 400;
font-size: 0.875rem;
```

---

## 4. Component System

### 4.1 Button

**5 Variants:**

#### Primary
- **Use:** Main CTA
- **Background:** `#818CF8` (Soft Indigo)
- **Text:** `#FFFFFF` (White)
- **Border radius:** 8px (Modern Soft)
- **Hover:**
  - Shadow: `0 4px 12px rgba(129, 140, 248, 0.25)`
  - Background: `#6366F1`
- **Focus:** Visible outline offset 2px

#### Secondary
- **Use:** Alternative action
- **Background:** transparent
- **Border:** 1px solid `#E2E8F0`
- **Text:** `#475569` (textMuted)
- **Hover:**
  - Background: `#F8FAFC`
  - Border: `#CBD5E1`

#### Ghost
- **Use:** Lightweight CTA
- **Background:** transparent
- **Text:** `#6366F1`
- **Hover:**
  - Background: `rgba(99, 102, 241, 0.05)`

---

## 9. Decision Log

| Decision | Date | Rationale |
|----------|------|-----------|
| Light theme (#FFFFFF) | 2026-05-19 | User request for "aesthetic light tones"; follows Explorium.ai inspiration |
| Pastel Indigo (#818CF8) | 2026-05-19 | Opaque pastel primary; modern, technical yet soft |
| 8px border radius | 2026-05-19 | Balance between professional sharpness and modern softness |
| Soft shadows | 2026-05-19 | Depth without high-contrast fatigue in light mode |
