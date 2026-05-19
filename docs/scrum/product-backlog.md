# 📚 Product Backlog — GetUpSoft Website Redesign

**Total:** 20 Epics, 60+ User Stories  
**Status:** Active (Phase 0–5)  
**Last Updated:** 2026-05-19

---

## Backlog Overview

Organized by **Phase** and **Epic**. Each epic has 2–4 user stories.

---

## PHASE 0 — Pre-flight & Foundation (Sprint 0)

### EPIC-001 — Foundation & Pre-flight AI Skills

Establish baseline, lock spec, install orchestration.

| ID | Title | Effort | Owner | Status |
|---|---|---|---|---|
| **US-000** | Save prompt + lock + SHA256 | 1h | Claude | ✅ DONE |
| **US-001** | Repository audit → docs/agent-state.md | 2h | Claude | ✅ DONE |
| **US-002** | Skills research → docs/ai/skill-research.md | 2h | Claude | ✅ DONE |
| **US-003** | Install Claude skills in .claude/skills/ | 1h | Claude | ✅ DONE |
| **US-004** | Install AGENTS.md + Codex skills | 1h | Claude | ✅ DONE |
| **US-005** | Create multi-model routing matrix | 1.5h | Claude | ✅ DONE |
| **US-006** | Create Scrum backlog + Sprint 0 | 3h | Claude | 🔄 IN PROGRESS |
| **US-007** | Create design system + content architecture docs | 2h | Claude | ⏳ TODO |
| **US-008** | Create content-source-map + brand-voice | 1.5h | Claude | ⏳ TODO |
| **US-009** | Create verification criteria + report template | 1h | Claude | ⏳ TODO |

**Epic Completion Criteria:**
- [ ] All 10 stories marked DONE
- [ ] All docs created and comprehensive
- [ ] Backlog ready (20 epics, 50+ stories)
- [ ] Skills and agents operational
- [ ] Phase 1 can start without context loss

---

## PHASE 1 — Design System & Layout

### EPIC-002 — Design System & Brand Refresh

Create visual foundation: tokens, typography, components.

| ID | Title | Effort | Owner | Depends On |
|---|---|---|---|---|
| **US-101** | Define design system tokens (colors, spacing, typography) | 2h | Claude | US-007 |
| **US-102** | Create Button component (5 variants: primary, secondary, ghost, warning, region pill) | 2h | Codex | US-101 |
| **US-103** | Create Container, Section, Eyebrow base components | 1.5h | Codex | US-101 |
| **US-104** | Create Card, ServiceCard, ProductCard components | 2h | Codex | US-101 |

### EPIC-003 — Global Navigation & Footer

Header and footer, region/language selectors.

| ID | Title | Effort | Owner | Depends On |
|---|---|---|---|---|
| **US-105** | Design Header (sticky, glassmorphism, nav, selectors) | 2h | Codex | US-101 |
| **US-106** | Implement Header desktop + mobile nav | 3h | Codex | US-105 |
| **US-107** | Design Footer (columns, responsive, links) | 1.5h | Codex | US-101 |
| **US-108** | Implement Footer | 2h | Codex | US-107 |
| **US-109** | Region selector (Global / RD toggle) | 1h | Codex | US-105 |
| **US-110** | Language selector (EN / ES toggle) | 1h | Codex | US-105 |

**Epic 2–3 Completion Criteria:**
- [ ] All components match design system
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Header/Footer on all pages
- [ ] Selectors functional
- [ ] Accessibility baseline (focus, contrast, ARIA)
- [ ] `npm run build` succeeds

---

## PHASE 2 — Pages & Content

### EPIC-004 — Home Pages (Global + RD)

Global and RD-specific home page variants.

| ID | Title | Effort | Owner | Depends On |
|---|---|---|---|---|
| **US-201** | Write Home copy global (ES/EN) | 3h | ChatGPT | US-007 |
| **US-202** | Build Home page global | 4h | Codex | US-201, US-106, US-108 |
| **US-203** | Write Home copy RD (ES only) | 2h | ChatGPT | US-007 |
| **US-204** | Build Home page RD variant | 3h | Codex | US-203, US-202 |
| **US-205** | Verify Hero component responsive + accessible | 1h | Codex QA | US-202, US-204 |

### EPIC-005 — AI Agents Page

AI agents capabilities and ORCA orchestrator.

| ID | Title | Effort | Owner | Depends On |
|---|---|---|---|---|
| **US-206** | Write AI Agents page copy (ES/EN) | 2h | ChatGPT | US-008 |
| **US-207** | Build AI Agents page | 3h | Codex | US-206 |
| **US-208** | Create agent use case cards | 2h | Codex | US-207 |

### EPIC-006 — Integrations Page

Multi-system integration patterns and architecture.

| ID | Title | Effort | Owner | Depends On |
|---|---|---|---|---|
| **US-209** | Write Integrations page copy (ES/EN) | 2h | ChatGPT | US-008 |
| **US-210** | Build Integrations page | 3h | Codex | US-209 |
| **US-211** | Create integration pattern cards | 2h | Codex | US-210 |

### EPIC-007 — ERP & Billing Page

Odoo ERP, DGII/e-CF, multi-ERP integration.

| ID | Title | Effort | Owner | Depends On |
|---|---|---|---|---|
| **US-212** | Write ERP & Billing copy (ES/EN) | 2.5h | ChatGPT | US-008 |
| **US-213** | Build ERP & Billing page | 3h | Codex | US-212 |
| **US-214** | Create ERP capability cards (Odoo, ERPNext, iSeries, SAP) | 2h | Codex | US-213 |

### EPIC-008 — Infrastructure & Cloud Page

Networks, servers, cloud, security, support.

| ID | Title | Effort | Owner | Depends On |
|---|---|---|---|---|
| **US-215** | Write Infrastructure page copy (ES/EN) | 2h | ChatGPT | US-008 |
| **US-216** | Build Infrastructure page | 3h | Codex | US-215 |

### EPIC-009 — Industries / Sectores Page

Retail, restaurants, distribution, logistics, professional services.

| ID | Title | Effort | Owner | Depends On |
|---|---|---|---|---|
| **US-217** | Write industry solutions copy (ES/EN) | 2h | ChatGPT | US-008 |
| **US-218** | Build Industries page (6 cards) | 3h | Codex | US-217 |
| **US-219** | Create industry-specific CTAs | 1h | Codex | US-218 |

### EPIC-010 — Products Ecosystem

ORCA, AIHub, GetUpBuilder, Integration Layer.

| ID | Title | Effort | Owner | Depends On |
|---|---|---|---|---|
| **US-220** | Write Products ecosystem copy (ES/EN) | 2h | ChatGPT | US-008 |
| **US-221** | Build Products page | 3h | Codex | US-220 |
| **US-222** | Create product cards with verification status | 1.5h | Codex | US-221 |

### EPIC-011 — Methodology Page

4-step methodology: Audit → Design → Delivery → Scale & Support.

| ID | Title | Effort | Owner | Depends On |
|---|---|---|---|---|
| **US-223** | Write Methodology copy (ES/EN) | 2h | ChatGPT | US-008 |
| **US-224** | Build Methodology page (4 process steps) | 3h | Codex | US-223 |

### EPIC-012 — About Page

Vision, execution, values, team.

| ID | Title | Effort | Owner | Depends On |
|---|---|---|---|---|
| **US-225** | Write About page copy (ES/EN, no invented team) | 2h | ChatGPT | US-008 |
| **US-226** | Build About page | 2h | Codex | US-225 |

### EPIC-013 — Contact & Diagnostic Forms

Contact form, diagnostic form, booking flows.

| ID | Title | Effort | Owner | Depends On |
|---|---|---|---|---|
| **US-227** | Build Contact form (validation, submit, states) | 2h | Codex | US-102 |
| **US-228** | Build Diagnostic form (extended fields) | 2.5h | Codex | US-102 |
| **US-229** | Write form labels + help text (ES/EN) | 1h | ChatGPT | US-227, US-228 |

**Phase 2 Completion Criteria:**
- [ ] All 12 pages built (Home Global, Home RD, AI Agents, Integrations, ERP & Billing, Infrastructure, Industries, Products, Methodology, About, Contact, Diagnostic)
- [ ] Copy ES/EN complete for all pages
- [ ] Responsive design verified
- [ ] Accessibility baseline met
- [ ] Forms functional
- [ ] All CTAs to real pages (no #tbd-)
- [ ] `npm run build` succeeds

---

## PHASE 3 — Forms & Integration

### EPIC-014 — ERP Adapter Architecture

lib/erp/ abstraction layer for Odoo, ERPNext, iSeries, SAP.

| ID | Title | Effort | Owner | Depends On |
|---|---|---|---|---|
| **US-301** | Design lib/erp/ types and interface | 1h | Claude | US-008 |
| **US-302** | Implement Odoo provider (real credentials path) | 2h | Codex | US-301 |
| **US-303** | Implement ERPNext stub provider (clear error messages) | 1h | Codex | US-301 |
| **US-304** | Implement IBM iSeries stub provider | 1h | Codex | US-301 |
| **US-305** | Implement SAP stub provider | 1h | Codex | US-301 |
| **US-306** | Implement mock provider (default, safe dev) | 0.5h | Codex | US-301 |
| **US-307** | Create POST /api/leads endpoint | 1.5h | Codex | US-302 |

### EPIC-015 — i18n Content System

Centralized content structure for ES/EN.

| ID | Title | Effort | Owner | Depends On |
|---|---|---|---|---|
| **US-308** | Design i18n strategy (next-intl vs. local content file) | 1h | Claude | US-008 |
| **US-309** | Create content/site.es.ts and content/site.en.ts | 2h | ChatGPT | US-308 |
| **US-310** | Update all components to use i18n (no hardcoding) | 3h | Codex | US-309 |
| **US-311** | Test language switching on all pages | 1h | Codex QA | US-310 |

### EPIC-016 — SEO, Analytics & CRO

SEO metadata, OpenGraph, schema.org, analytics hooks.

| ID | Title | Effort | Owner | Depends On |
|---|---|---|---|---|
| **US-312** | Write SEO metadata per page (title, description, og:*, canonical) | 2h | ChatGPT | US-201–US-226 |
| **US-313** | Implement schema.org (Organization, Service, FAQPage) | 1.5h | Codex | US-312 |
| **US-314** | Create sitemap.xml | 1h | Codex | US-201–US-226 |
| **US-315** | Prepare analytics event hooks (cta_click, lead_submit, etc.) | 1h | Codex | US-227–US-228 |

**Phase 3 Completion Criteria:**
- [ ] lib/erp/ fully implemented and tested
- [ ] POST /api/leads endpoint functional
- [ ] Forms submit to API with mock provider by default
- [ ] i18n system functional (both ES/EN on all pages)
- [ ] SEO metadata complete and unique per page
- [ ] No hardcoded secrets in .env
- [ ] `.env.example` documents all variables
- [ ] `npm run build` succeeds

---

## PHASE 4 — DevOps & Deployment

### EPIC-017 — Dockerfile & CI/CD

Docker containerization, GitHub Actions, automated deployment.

| ID | Title | Effort | Owner | Depends On |
|---|---|---|---|---|
| **US-401** | Create Dockerfile for getupsoft-site | 1.5h | Codex | All Phase 2 done |
| **US-402** | Create .dockerignore | 0.5h | Codex | US-401 |
| **US-403** | Create GitHub Actions deploy workflow | 2h | Codex | US-401 |
| **US-404** | Test Docker build locally | 1h | Codex QA | US-401, US-402 |

### EPIC-018 — Google Cloud Deployment Readiness

Cloud Run, Artifact Registry, deployment documentation.

| ID | Title | Effort | Owner | Depends On |
|---|---|---|---|---|
| **US-405** | Write docs/deployment-google-cloud.md | 1.5h | ChatGPT | US-401–US-403 |
| **US-406** | Document Cloud Run deployment steps | 1h | ChatGPT | US-405 |
| **US-407** | Document health check endpoints | 0.5h | ChatGPT | US-405 |
| **US-408** | Document rollback procedures | 0.5h | ChatGPT | US-405 |

**Phase 4 Completion Criteria:**
- [ ] Dockerfile builds successfully
- [ ] Docker image runs and serves app
- [ ] GitHub Actions workflow triggered on push
- [ ] Google Cloud deployment documented
- [ ] Health endpoints functional
- [ ] Secrets in Secret Manager (not .env)
- [ ] CI/CD ready for Phase 5

---

## PHASE 5 — QA, Accessibility & Performance

### EPIC-019 — QA & Verification

Lint, type check, tests, build, E2E smoke tests.

| ID | Title | Effort | Owner | Depends On |
|---|---|---|---|---|
| **US-501** | Run full lint and typecheck | 1h | Codex QA | All Phase 4 done |
| **US-502** | Run accessibility audit (WCAG AA) | 2h | Codex QA | All Phase 2 done |
| **US-503** | Run performance audit (Lighthouse ≥ 90) | 1h | Codex QA | All Phase 4 done |
| **US-504** | Execute E2E smoke tests (navigation, forms) | 2h | Codex QA | All Phase 3 done |
| **US-505** | Run responsive design verification (mobile, tablet, desktop) | 1.5h | Codex QA | All Phase 2 done |
| **US-506** | Populate docs/verification-report.md | 1h | Codex QA | US-501–US-505 |

### EPIC-020 — Documentation & Handoff

Final documentation, handoff, launch preparation.

| ID | Title | Effort | Owner | Depends On |
|---|---|---|---|---|
| **US-507** | Complete docs/implementation-log.md with all sessions | 1h | Claude | All phases |
| **US-508** | Complete docs/decision-log.md with all decisions | 1h | Claude | All phases |
| **US-509** | Update docs/handoff.md for team continuity | 0.5h | Claude | All phases |
| **US-510** | Final review against success criteria (master prompt §19) | 2h | Claude | All US done |
| **US-511** | Launch readiness sign-off | 0.5h | Claude + Joel | US-510 |

**Phase 5 Completion Criteria:**
- [ ] All lint checks pass
- [ ] All type checks pass
- [ ] WCAG AA accessibility baseline met
- [ ] Lighthouse Performance ≥ 90
- [ ] E2E smoke tests pass
- [ ] Responsive design verified
- [ ] All documentation complete and accurate
- [ ] Ready for production deployment

---

## Velocity Estimation

| Phase | Epics | Stories | Est. Hours | Est. Days | Risk |
|---|---|---|---|---|---|
| Phase 0 | 1 | 10 | 20h | 2–3 days | Medium (docs-heavy) |
| Phase 1 | 2 | 10 | 18h | 2–3 days | Medium (design system) |
| Phase 2 | 8 | 28 | 60h | 8–10 days | High (12 pages) |
| Phase 3 | 3 | 11 | 20h | 2–3 days | Medium (i18n critical) |
| Phase 4 | 2 | 8 | 10h | 1–2 days | Low (ops-focused) |
| Phase 5 | 2 | 11 | 14h | 2 days | Medium (QA-intensive) |
| **Total** | **20** | **60+** | **142h** | **17–24 days** | — |

---

## Definition of Ready & Done

See:
- `docs/scrum/definition-of-ready.md`
- `docs/scrum/definition-of-done.md`

---

## Risk Register

See: `docs/scrum/risks-blockers.md`

---

_Product Backlog v1.0 · Created 2026-05-19 · 20 Epics, 60+ Stories, 142 hours estimated_
