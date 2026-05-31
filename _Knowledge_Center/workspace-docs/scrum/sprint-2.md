# 🎯 Sprint 2 — Phase 2 Page Templates & i18n

**Duration:** 2026-05-19 to 2026-05-19 (1 day actual, 5 days estimated)  
**Goal:** Implement i18n (next-intl + local content), build Home (Global/RD), page templates, lock all copy (ES/EN)  
**Status:** ✅ DONE (Started 2026-05-19, All 12/12 stories DONE, 100%)

---

## Sprint Board

### Phase 2A: i18n Foundation (US-301 — US-310)

| US | Title | Story | Effort | Owner | Status | Due |
|---|---|---|---|---|---|---|
| **301** | Design i18n strategy (Hybrid Option C) | next-intl + local content files approach | 1h | Claude | ✅ DONE | 2026-05-19 |
| **302** | Install next-intl + create file structure | npm install, i18n.ts config, middleware setup | 1.5h | Claude | ✅ DONE | 2026-05-19 |
| **303** | Create content/site.es.ts + site.en.ts | All copy (home, pages, forms, etc.) bilingual | 3h | Claude | ✅ DONE | 2026-05-19 |
| **304** | Create Language + Region context providers | React context for language/region switching | 1h | Claude | ✅ DONE | 2026-05-19 |
| **305** | Implement language switcher middleware | Route /es/* and /en/* paths correctly | 1.5h | Claude | ✅ DONE | 2026-05-19 |

**Subtotal (i18n foundation):** 8 hours

### Phase 2B: Page Templates & Home (US-311 — US-320)

| US | Title | Story | Effort | Owner | Status | Due |
|---|---|---|---|---|---|---|
| **311** | Build Home page template (layout + sections) | Hero, features, services, CTA layout | 3h | Claude | ✅ DONE | 2026-05-19 |
| **312** | Integrate Home page copy (ES/EN) | Add all homepage text + images | 1h | Claude | ✅ DONE | 2026-05-19 |
| **313** | Build Global Home variant | Region-specific CTAs, messaging | 1h | Claude | ✅ DONE | 2026-05-19 |
| **314** | Build RD Home variant | RD-specific branding, contact info | 1h | Claude | ✅ DONE | 2026-05-19 |
| **315** | Verify Home responsive (mobile/tablet/desktop) | Mobile < 768px, tablet 768–1024px, desktop > 1024px | 1.5h | Claude | ✅ DONE | 2026-05-19 |

**Subtotal (Home page):** 7.5 hours

### Phase 2C: Other Key Pages (US-321 — US-330)

| US | Title | Story | Effort | Owner | Status | Due |
|---|---|---|---|---|---|---|
| **321** | Build Products page template | Product cards, status badges, CTA | 2h | Claude | ✅ DONE | 2026-05-19 |
| **322** | Build Solutions page template | Solution cards, benefits, CTA | 2h | Claude | ✅ DONE | 2026-05-19 |
| **323** | Build About page template | Vision, values, contact CTA | 1.5h | Claude | ✅ DONE | 2026-05-19 |
| **324** | Build Contact form page | Form component, validation, styling | 2h | Claude | ✅ DONE | 2026-05-19 |
| **325** | Verify all pages responsive + accessible | WCAG AA baseline, lighthouse audit | 2h | Claude | ✅ DONE | 2026-05-19 |

**Subtotal (Other pages):** 9.5 hours

---

**Phase 2 Total Effort:** 25 hours | **Est. Duration:** 5 days (5h/day)

---

## Completion Criteria (Phase 2 Gate)

Phase 2 is DONE when:
- [x] All 12 page stories marked DONE (US-301 through US-325) ✅ 2026-05-19
- [x] i18n system functional (language switching works, localStorage persistence) ✅
- [x] All copy (ES/EN) complete and verified ✅
- [x] All pages responsive (mobile/tablet/desktop tested) ✅
- [x] All pages accessible (WCAG AA baseline) ✅
- [x] No hardcoded copy (all from content/site.es.ts + site.en.ts) ✅
- [x] `npm run build` succeeds (zero errors) ✅
- [x] No breaking changes from Phase 1 components ✅
- [x] Implementation log updated ✅
- [x] No blockers preventing Phase 3 ✅

---

## Phase 2 Dependencies

⏳ **Blocker:** i18n strategy decision (resolved in US-301 as Option C)

✅ **Unblocked:** All page copy can be written in parallel (US-303 ChatGPT task)

✅ **Unblocked:** Home page templates can build while copy is pending

---

## Known Risks (Phase 2)

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| ChatGPT delays copy writing | Medium | Pages blocked waiting for content | Parallelize: templates ready, copy integrated after |
| next-intl configuration complex | Low | Setup delays; middleware not working | Use official template + test immediately (US-302) |
| Language switching breaks pages | Low | Route errors; users stuck on one language | Test /es/* and /en/* routes early in US-305 |
| Copy verification delays | Medium | Content-source-map incomplete; can't verify facts | ChatGPT creates source links in US-303 |
| Mobile responsiveness issues | Low | Phase gate fails; must rework layouts | Test on real mobile device; use DevTools |

---

## Resources & Setup

**Before starting US-301:**

1. Phase 1 is complete (✅ all 10 stories DONE)
2. Design system tokens tested in Button component (✅ US-102)
3. Header + Footer components ready (✅ US-105 through US-110)
4. All layout components (Container, Section, Card) available (✅ US-103, US-104)
5. Selector components (RegionPill, LanguageSelector) ready (✅ US-109, US-110)

**Tech Stack (unchanged from Phase 1):**
- React 18 + TypeScript (strict mode)
- TailwindCSS (token-driven)
- Vite (build tool)
- **NEW:** next-intl (i18n framework)
- **NEW:** React Router (page routing)

**i18n Implementation Approach (Option C — Hybrid):**
```typescript
// Layer 1: next-intl handles routing/SEO
// /en/* routes → English
// /es/* routes → Spanish

// Layer 2: Local content files for GetUpSoft copy
// content/site.es.ts exports { home: {...}, products: {...}, ... }
// content/site.en.ts exports { home: {...}, products: {...}, ... }

// Layer 3: Components consume content via useContent hook
// const content = useContent('es'); // or 'en'
// return <h1>{content.home.heading}</h1>
```

**File Structure:**
```
src/
  components/
    ui/                    # Phase 1 components
    pages/
      Home.tsx             # US-311/312/313/314
      Products.tsx         # US-321
      Solutions.tsx        # US-322
      About.tsx            # US-323
      Contact.tsx          # US-324
  i18n.ts                  # next-intl config
  middleware.ts            # Route middleware
  content/
    site.es.ts             # US-303 (all ES copy)
    site.en.ts             # US-303 (all EN copy)
  hooks/
    useContent.ts          # Hook to access current language content
```

---

## Daily Standup Template

```markdown
## [Date] Standup

**Stories in progress:** US-XXX, US-YYY  
**Blockers:** (none) or [describe]  
**Completed today:** 
- US-301: [status]
- US-302: [status]

**Next 24h:**
- Start US-303 (ChatGPT writes copy)
- Implement language switcher middleware (US-305)

**Confidence:** 🟢 Green / 🟡 Yellow / 🔴 Red
```

---

## QA Checklist (Per Story, Before Marking DONE)

Every story must pass Definition of Done (from docs/scrum/definition-of-done.md):

- [ ] Code/component implemented
- [ ] Responsive: Mobile < 768px, tablet 768–1024px, desktop > 1024px
- [ ] Accessibility: Focus visible, labels, contrast ≥ 4.5:1
- [ ] No hardcoded copy (uses content/site.es.ts + site.en.ts)
- [ ] Build: `npm run build` ✅
- [ ] Language switching tested (/en/* and /es/* work)
- [ ] Implementation log updated
- [ ] Product backlog updated (status = DONE)
- [ ] Code review passed (if critical)

---

_Sprint 2 Board v1.0 · Created 2026-05-19 · Completed 2026-05-19 · Phase 2 Page Templates & i18n ✅ DONE_
