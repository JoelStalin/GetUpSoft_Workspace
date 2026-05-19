# ⚠️ Risks & Blockers — GetUpSoft Website Redesign

**Purpose:** Track identified risks, active blockers, and mitigations  
**Reference:** Master Prompt §17.3 (risks in Definition of Ready)  
**Last Updated:** 2026-05-19  
**Status:** Sprint 0 in progress; 2 active blockers, both mitigable

---

## Active Blockers (🔴 Blocking Work)

| Blocker | Status | Impact | Story | Mitigation | Owner | ETA |
|---------|--------|--------|-------|-----------|-------|-----|
| **Server connectivity lost** | 🔴 Active | Cannot test Docker builds on prod; Phase 4 blocked | US-401, US-404 | Document all changes; execute when server back online | Joel | TBD |
| **i18n strategy not finalized** | 🟡 Pending | Blocks Phase 2 page implementation; need next-intl vs. local file decision | US-308 | Decide between next-intl vs. local content file in US-007/008 | Joel / Claude | 2026-05-20 |

---

## Blocker Details

### BLOCKER-001: Server Connectivity Lost

**Severity:** 🔴 High (Blocks Phase 4 deployment testing)

**Description:**
Production server is unreachable. Cannot SSH for deployment, cannot verify Docker builds on production hardware, cannot test post-deploy health checks.

**Affected Stories:**
- US-401: Create Dockerfile (unaffected — local dev can test)
- US-402: Create .dockerignore (unaffected)
- US-403: Create GitHub Actions deploy workflow (partially affected — can write but not test)
- US-404: Test Docker build locally (OK) + test on prod (BLOCKED)

**Root Cause:**
Network connectivity issue on production server. Unknown ETA for restoration.

**Current Mitigation:**
1. Continue Phase 0, 1, 2, 3 development (can all run locally)
2. Document all Phase 4 changes with rationale (commit messages + implementation-log.md)
3. When server comes back online, execute full Phase 4 deployment workflow and test end-to-end
4. If Phase 4 testing needs to happen before server is available, use staging environment as fallback

**Alternative Path (if server stays down > 48 hours):**
- Deploy to staging environment (GCP Cloud Run) instead of production for testing purposes
- This unblocks Phase 4 testing but doesn't test prod-specific infrastructure

**Owner:** Joel (infrastructure/network contact)  
**Resolution Criteria:** Server responds to ping, SSH connection works, Docker can pull images  
**Next Check:** Daily at 9:00 AM; escalate to Joel if no improvement by 2026-05-21

---

### BLOCKER-002: i18n Strategy Not Finalized

**Severity:** 🟡 Medium (Blocks Phase 2 page implementation until decided)

**Description:**
Master Prompt §3.4 specifies bilingual content (ES/EN) required for all pages, but the technical approach is undecided:
- **Option A: next-intl package** — Full i18n framework, server-side rendering, dynamic language switching
- **Option B: Local content files** — Hardcoded content objects in `content/site.es.ts` + `content/site.en.ts`, consumed by components
- **Option C: Hybrid** — next-intl for infrastructure, local files for GetUpSoft-specific copy

**Affected Stories:**
- US-007: Design system + content architecture (UNBLOCKED — can design both approaches)
- US-008: Content source map + brand voice (UNBLOCKED — can define content independently)
- US-201 onwards: All page copy stories depend on this decision
- US-308: Design i18n strategy (currently TODO, has 1h effort, should be done ASAP)
- US-309: Create content/site.es.ts + content/site.en.ts (depends on US-308 decision)
- US-310: Update all components to use i18n (depends on US-309)

**Consequences of Each Option:**

#### Option A: next-intl Package
**Pros:**
- Professional i18n framework with middleware support
- Automatic language detection
- SEO-friendly (hreflang, canonical URLs)
- Scalable for future languages
- Community support

**Cons:**
- Adds dependency (10 KB bundle)
- Complexity for simple GetUpSoft use case (only ES/EN)
- Requires server-side component setup
- Higher learning curve for non-technical contributors

**Tech Requirements:**
```bash
npm install next-intl
# File structure:
# - messages/es.json
# - messages/en.json
# - i18n.ts (config)
# - middleware.ts (request routing)
```

#### Option B: Local Content Files
**Pros:**
- Zero dependencies, pure TypeScript
- Simple: import objects, no middleware
- Fast (static data, no runtime lookup)
- Developers easily see all copy in one place
- Easy to maintain for small app

**Cons:**
- Manual language switching logic
- Must handle routing separately (e.g., `/es/*` vs `/en/*` paths)
- SEO requires manual hreflang implementation
- Not scalable if more languages added later

**Tech Requirements:**
```typescript
// content/site.es.ts
export const site = {
  home: { heading: "...", subheading: "..." },
  contact: { label: "...", placeholder: "..." },
}
// content/site.en.ts
export const site = { /* English versions */ }

// In components:
import { site } from "@/content/site.es" // or .en
```

#### Option C: Hybrid
**Pros:**
- next-intl for infrastructure (routing, SEO, middleware)
- Local files for GetUpSoft brand copy (easier to edit)
- Scalable + maintainable
- Professional + simple

**Cons:**
- Requires integration between next-intl and custom content files
- More setup than pure Option B
- Slightly more bundle size than pure Option B

**Tech Requirements:**
```typescript
// Use next-intl for routing/SEO
// But load GetUpSoft copy from content/site.es.ts + content/site.en.ts
// Wrap components with next-intl provider + custom content provider
```

**Recommendation:** **Option C (Hybrid)** offers best balance:
- Leverage next-intl's professional SEO and routing infrastructure
- Keep GetUpSoft copy in simple local files (easier to edit)
- Scalable + professional + maintainable

**Root Cause:**
Decision requires Product Owner (Joel) sign-off. Different options have trade-offs (complexity vs. scalability vs. bundle size).

**Mitigation:**
1. **SHORT TERM (US-007/008):** Document all three options with pros/cons in architecture doc
2. **IMMEDIATE (before Phase 2):** Joel decides Option A, B, or C
3. **PHASE 2 START:** Selected option is implemented in US-308/309/310

**Owner:** Joel (Product Owner decision), Claude (technical recommendation)  
**Decision Deadline:** 2026-05-20 EOD (must be decided before Phase 2 starts)  
**Resolution Criteria:** Option A, B, or C selected; architecture documented; approval recorded in decision-log.md

---

## Known Risks (Not Yet Blocking, But Tracked)

| Risk | Probability | Impact | Mitigation | Owner |
|------|------------|--------|-----------|-------|
| **Design System Incomplete** | Medium | Phase 1 blocked if tokens undefined | US-007 explicitly defines all tokens before Phase 2 | Claude |
| **ERP Connectivity (Dev/Staging)** | Low | Phase 3 testing difficult if Odoo sandbox unreachable | Mock provider by default; use staging Odoo instance | Codex |
| **Large Backlog Scope (60+ stories)** | Medium | Timeline risk if velocity slower than estimated | Sprint board tracks actual velocity; adjust Phase 3+ if needed | Claude |
| **Model Coordination** | Low | If model doesn't deliver on time, dependent stories blocked | Clear ownership + daily implementation-log.md updates | Claude |
| **Content Verification** | Medium | If sources for claims not verifiable, page copy delayed | docs/content-source-map.md created early; ChatGPT links all claims | ChatGPT |
| **Accessibility Compliance** | Low | Lighthouse/WCAG AA audit late in Phase 5 reveals issues | Baseline checks in every story DoD; phase gate in US-502 | Codex QA |

---

## Risk Severity Levels

| Level | Color | Definition | Action |
|-------|-------|-----------|--------|
| Critical (Blocks Launch) | 🔴 | Project cannot ship without resolving | Escalate immediately to Joel; stop other work if necessary |
| High (Blocks Phase) | 🔴 | Current phase cannot complete | Document blocker; adjust Phase timeline; escalate daily |
| Medium (Delays Progress) | 🟡 | Slows work but has workaround | Track closely; revisit daily; escalate if workaround fails |
| Low (Monitor) | 🟢 | Unlikely to impact; good to track | Review weekly; escalate if probability increases |

---

## Escalation Path

### When a Risk Becomes a Blocker

1. **Identify:** Developer/model notices a blocker (e.g., "i18n decision blocks US-201")
2. **Document:** Create entry in this file with:
   - Blocker name, severity, affected stories
   - Root cause
   - Initial mitigation attempt
   - Owner (who can resolve)
3. **Flag:** Add to implementation-log.md:
   ```markdown
   **BLOCKER:** i18n strategy not finalized. Affects US-201+. Owner: Joel. ETA: TBD
   ```
4. **Escalate to Claude Scrum Master:** If blocking current sprint story, escalate immediately
5. **Claude escalates to Joel:** If requires Product Owner decision (budget, vendor, scope), escalate daily
6. **Resolve:** Joel makes decision, documents in decision-log.md, unblocks team

### Escalation Contacts

- **Technical Decision:** Claude (AI orchestrator) — analyze options, recommend path
- **Product Decision:** Joel (Product Owner) — scope, priorities, trade-offs
- **Infrastructure Decision:** Joel + ops team — server uptime, deployment strategy
- **Urgent (< 4h impact):** Daily standup + chat notification
- **Non-Urgent (> 4h impact):** Document + weekly review

---

## Mitigations by Phase

### Phase 0 (Pre-flight) — Current
**Blockers:** 2 active (server connectivity, i18n strategy)
**Mitigations:**
- Continue all work not dependent on server or i18n
- Document decisions thoroughly
- Make i18n decision ASAP (blocker release trigger)

**Phase Gate Criteria:**
- [ ] Server connectivity resolved OR Phase 4 timeline adjusted
- [ ] i18n strategy decided + documented in architecture-doc

### Phase 1 (Design System)
**Known Risks:**
- Design system definition incomplete → US-101 unblocks all Phase 1
- TailwindCSS token configuration not tested → validate in US-101

**Mitigations:**
- Complete US-007 (design-system.md) before any Phase 1 component work
- Test tokens on Button component (US-102) as proof of concept

**Phase Gate Criteria:**
- [ ] All design tokens defined and tested
- [ ] All base components (Button, Card, Section, etc.) built and responsive

### Phase 2 (Pages)
**Known Risks:**
- Copy ES/EN dependent on ChatGPT; if delayed, page builders (Codex) blocked
- i18n not implemented → every page must wait for US-308/309/310

**Mitigations:**
- Parallelize: ChatGPT writes copy while design is finalized
- i18n implementation ready before first page (US-201)
- Codex can build page layouts while copy is being written, then integrate copy

**Phase Gate Criteria:**
- [ ] All page copy (ES/EN) complete
- [ ] i18n system functional (language switching works)
- [ ] All 12 pages rendered and responsive

### Phase 3 (Forms & ERP)
**Known Risks:**
- Odoo API connectivity (sandbox or staging)
- Form validation (Zod schema complexity)

**Mitigations:**
- Mock provider by default (safe for dev)
- Zod schema tested locally before ERP integration
- Clear error messages if real Odoo unreachable

**Phase Gate Criteria:**
- [ ] Forms validate and submit
- [ ] ERP adapters tested (Odoo real, others stubs)
- [ ] No hardcoded secrets in code

### Phase 4 (DevOps)
**Known Risks:**
- Server connectivity still down (current blocker)
- Docker image size > expected → slow deployment

**Mitigations:**
- Build Dockerfile locally (testing unblocked)
- Test on staging/GCP Cloud Run if prod server unavailable
- .dockerignore optimized before final build

**Phase Gate Criteria:**
- [ ] Docker image builds successfully
- [ ] Image runs and serves app
- [ ] Health endpoints respond
- [ ] Secrets in GCP Secret Manager (not .env)

### Phase 5 (QA & Verification)
**Known Risks:**
- Accessibility audit late; many violations discovered
- Performance audit shows LCP > target

**Mitigations:**
- Accessibility baseline in every story (DoD)
- Phase gate in US-502: WCAG AA compliance validated
- Lazy-load images below fold (implement early in Phase 2)
- Bundle size monitored during Phase 2+ (npm run build)

**Phase Gate Criteria:**
- [ ] All lint + type checks pass
- [ ] WCAG AA baseline met
- [ ] Lighthouse Performance ≥ 90
- [ ] E2E smoke tests pass

---

## Risk Register Template (For New Risks)

Copy into this file if a new risk emerges:

```markdown
### RISK-[NNN]: [Risk Title]

**Probability:** [High / Medium / Low]  
**Impact:** [Critical / High / Medium / Low]  
**Severity:** [Blocker / Risk]

**Description:**
[What could go wrong? When? Why?]

**Affected Stories:**
- US-XXX
- US-YYY

**Root Cause:**
[Why might this happen?]

**Mitigation:**
[What will you do to prevent or minimize impact?]

**Contingency:**
[If mitigation fails, what's Plan B?]

**Owner:** [Who monitors this risk?]  
**Next Review:** [Date]

**Status:** 🟢 Monitored / 🟡 Escalated / 🔴 Blocker
```

---

## Weekly Risk Review (Fridays EOD)

Claude (Scrum Master) reviews this file every Friday and:
1. Updates blocker status (resolved? new ones?)
2. Adjusts risk probability based on sprint progress
3. Escalates any risks moving toward "blocker" status
4. Documents decisions in decision-log.md
5. Reports to Product Owner (Joel) if changes

---

## Historical Blockers (Archive)

*To be populated as blockers are resolved*

**Example (not actual):**
- **BLOCKER-[OLD]:** Example blocker [✅ RESOLVED 2026-05-21] — Resolved by [action taken]

---

## Communication

**When blocker identified:**
- Flag in implementation-log.md immediately (same day)
- Notify Claude Scrum Master in standup or chat
- If Product Owner decision needed, escalate in 1h

**When blocker resolved:**
- Document resolution in this file with date and method
- Close in implementation-log.md
- Notify affected story owners so they can resume

---

_Risks & Blockers Register v1.0 · Created 2026-05-19 · Updated daily during Phase 0_
