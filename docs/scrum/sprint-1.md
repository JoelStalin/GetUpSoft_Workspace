# 🎯 Sprint 1 — Phase 1 Design System & Layout

**Duration:** 2026-05-20 to 2026-05-22 (2–3 days estimated)  
**Goal:** Lock design system tokens, build base components (Button, Card, Container, Section), implement Header + Footer  
**Status:** 🔄 IN PROGRESS (Started 2026-05-20, 4/10 stories DONE, 40%)

---

## Sprint Board

| US | Title | Story | Effort | Owner | Status | Due |
|---|---|---|---|---|---|---|
| **101** | Define & verify design system tokens | Verify colors, typography, spacing in TailwindCSS config | 1h | Claude | ✅ DONE | 2026-05-20 |
| **102** | Build Button component (5 variants) | Primary, secondary, ghost, warning, region pill | 2h | Claude | ✅ DONE | 2026-05-20 |
| **103** | Build Container, Section, Eyebrow components | Layout base components | 1.5h | Claude | ✅ DONE | 2026-05-20 |
| **104** | Build Card, ServiceCard, ProductCard | Card hierarchy with hover states | 2h | Claude | ✅ DONE | 2026-05-20 |
| **105** | Design Header (sticky, nav, selectors) | Header visual & layout spec | 2h | Codex | ⏳ TODO | 2026-05-21 |
| **106** | Implement Header (desktop + mobile nav) | Sticky header, hamburger menu, language/region selectors | 3h | Codex | ⏳ TODO | 2026-05-21 |
| **107** | Design Footer (columns, responsive, links) | Footer layout spec | 1.5h | Codex | ⏳ TODO | 2026-05-21 |
| **108** | Implement Footer | Footer columns, links, responsive | 2h | Codex | ⏳ TODO | 2026-05-21 |
| **109** | Build Region selector (Global / RD toggle) | Toggle functional | 1h | Codex | ⏳ TODO | 2026-05-21 |
| **110** | Build Language selector (EN / ES toggle) | Toggle functional | 1h | Codex | ⏳ TODO | 2026-05-21 |

**Phase Effort:** 18 hours total | **Est. Duration:** 2–3 days

---

## Completion Criteria (Phase 1 Gate)

Phase 1 is DONE when:
- [ ] All 10 stories marked DONE
- [ ] All components created and responsive
- [ ] npm run build ✅ (zero errors)
- [ ] Accessibility baseline met (WCAG AA)
- [ ] Design system verified in code
- [ ] No blockers preventing Phase 2

---

## Phase 1 Dependencies

✅ **No blocking dependencies** — Phase 1 (design system) is independent of i18n decision (affects Phase 2+).

⏳ **Note:** i18n strategy decision (Option A/B/C) needed before Phase 2 but NOT required for Phase 1.

---

## Known Risks (Phase 1)

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| TailwindCSS token import fails | Low | Cannot build components | Test import in first 30min; fallback to CSS variables |
| Design tokens don't match spec | Medium | Visual regression; Phase 2 delayed | Use WebAIM contrast checker on all colors before Phase 2 |
| Mobile nav complexity (hamburger) | Low | Accessibility issues | Use Headless UI components; test keyboard nav early |
| Build breaks during component creation | Low | Blocks all other work | Run `npm run build` after each component; commit frequently |

---

## Resources & Setup

**Before starting US-101:**

1. ✅ `docs/design-system.md` — Ready (all tokens defined)
2. ✅ `docs/content-architecture.md` — Ready (page structure)
3. ✅ `.agents/skills/getupsoft-qa-verification/SKILL.md` — QA skill ready
4. ✅ `.agents/skills/getupsoft-implementation/SKILL.md` — Implementation skill ready

**Tech Stack (unchanged from Phase 0):**
- React 18 + TypeScript
- TailwindCSS (token-driven)
- Vite (build tool)
- Headless UI (accessible components)

**TailwindCSS Token Setup Checklist:**
- [ ] `tailwind.config.ts` updated with all colors from design-system.md
- [ ] `tailwind.config.ts` includes spacing scale (xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl)
- [ ] Typography scale configured (responsive)
- [ ] Breakpoints set (sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px)
- [ ] `npm run build` succeeds with zero errors

---

## Daily Standup Template

```markdown
## [Date] Standup

**Stories in progress:** US-XXX, US-YYY  
**Blockers:** (none) or [describe]  
**Completed today:** 
- US-101: [status]
- US-102: [status]

**Next 24h:**
- Start US-103
- Verify button hover states on mobile

**Confidence:** 🟢 Green / 🟡 Yellow / 🔴 Red
```

---

## QA Checklist (Per Story, Before Marking DONE)

Every story must pass Definition of Done (from docs/scrum/definition-of-done.md):

- [ ] Code/component implemented
- [ ] Build: `npm run build` ✅
- [ ] Responsive: Mobile < 768px, tablet 768–1024px, desktop > 1024px
- [ ] Accessibility: Focus visible, labels, contrast ≥ 4.5:1
- [ ] No hardcoded colors/sizing (uses design-system tokens)
- [ ] Implementation log updated
- [ ] Product backlog updated (status = DONE)
- [ ] Code review passed (if critical)

---

_Sprint 1 Board v1.0 · Created 2026-05-20 · Phase 1 Design System & Layout IN PROGRESS_
