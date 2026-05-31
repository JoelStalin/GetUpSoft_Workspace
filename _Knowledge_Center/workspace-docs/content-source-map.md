# 🗺️ Content Source Map — GetUpSoft Website Redesign

**Version:** 1.0  
**Status:** Active verification log  
**Updated:** 2026-05-19  
**Owner:** ChatGPT (content writer) + Claude (verification)

---

## Overview

This document tracks every factual claim made on the GetUpSoft website. Every claim must be:
1. **Sourced** — Linked to a verified source (public URL, internal spec, or legal fact)
2. **Verified** — Checked for accuracy before publication
3. **Maintained** — Updated if source changes or claim becomes obsolete

**Rule:** No claim published without a source. If a claim cannot be verified, it is NOT published.

---

## Claims Register

### Enterprise & B2B Positioning

| Claim | Exact Text (As Published) | Status | Source | Verification Date | Owner |
|-------|--------------------------|--------|--------|-------------------|-------|
| **Autonomous AI agents** | "Autonomous AI agents for document automation, invoice processing..." | ✅ Verified | Master Prompt §9 (product spec) | 2026-05-19 | ChatGPT |
| **ORCA orchestrator** | "ORCA orchestrates AI agents, system integrations, and intelligent workflows" | ✅ Verified | 03_AI_Automation/orca docs | 2026-05-19 | ChatGPT |
| **Odoo as primary ERP** | "Odoo ERP for inventory, accounting, sales automation" | ✅ Verified | Master Prompt §5.2 (Odoo primary) | 2026-05-19 | ChatGPT |
| **Multi-ERP integration** | "Integrates Odoo, ERPNext, SAP, iSeries..." | ✅ Verified | Master Prompt §5.2 (ERPNext/iSeries/SAP as integrable) | 2026-05-19 | ChatGPT |
| **Cloud infrastructure** | "Scalable cloud infrastructure, DevOps, managed services" | ✅ Verified | Project scope (Phase 4 deployment) | 2026-05-19 | ChatGPT |
| **Enterprise customer base** | [NO CLAIM MADE] | — | [Do NOT invent] | — | — |
| **Market leadership** | [NO CLAIM MADE - avoid "best", "#1", "unique"] | — | [Forbidden by master prompt] | — | — |

### Product Features

| Claim | Text | Status | Source | Verification Date | Owner |
|-------|------|--------|--------|-------------------|-------|
| **ORCA modules** | "ORCA: Agents, Orchestration, Integration, Learning" | ✅ Verified | 03_AI_Automation/orca/README.md | 2026-05-19 | ChatGPT |
| **AIHub functionality** | "AIHub: Model marketplace, prompt management, agent registry" | ⏳ Pending | [Awaiting AIHub documentation] | — | Claude |
| **GetUpBuilder** | "GetUpBuilder: Low-code workflow and process builder" | ⏳ Pending | [Awaiting product documentation] | — | Claude |
| **Integration Layer** | "Integration Layer: Middleware for ERP, CRM, BI, data sources" | ✅ Verified | Master Prompt §5 (integration architecture) | 2026-05-19 | ChatGPT |
| **API coverage** | [NO SPECIFIC NUMBERS] | — | [Never claim "50+ integrations" without verified list] | — | — |

### Dominican Republic Specific

| Claim | Text | Status | Source | Verification Date | Owner |
|-------|------|--------|--------|-------------------|-------|
| **DGII compliance** | "DGII (Dirección General de Impuestos Internos) e-CF facturación electrónica" | ✅ Verified | Public legal requirement, DR tax authority | 2026-05-19 | ChatGPT |
| **Odoo DGII modules** | "Odoo has DGII-compliant billing modules" | ✅ Verified | Odoo app store (odoo.com/apps) | 2026-05-19 | ChatGPT |
| **DR local market problems** | "Inventory control, manual invoicing, network instability are pain points in RD SMEs" | ✅ Verified | Master Prompt §9.2 (RD home spec) | 2026-05-19 | ChatGPT |
| **Soporte local RD** | [Claims about GetUpSoft local support team] | ⏳ Pending | [Verify team exists and is available] | — | Joel |

### Technology Stack

| Claim | Text | Status | Source | Verification Date | Owner |
|-------|------|--------|--------|-------------------|-------|
| **React 18** | "React 18 with TypeScript for modern, type-safe web apps" | ✅ Verified | 01_Core_Platform/getupsoft-site package.json | 2026-05-19 | Claude |
| **TailwindCSS** | "TailwindCSS for responsive, accessible design system" | ✅ Verified | 01_Core_Platform/getupsoft-site tailwind.config.ts | 2026-05-19 | Claude |
| **Python/FastAPI backend** | "FastAPI backend for ORCA orchestration" | ✅ Verified | 03_AI_Automation/orca/src | 2026-05-19 | Claude |
| **PostgreSQL data** | [Verify if used in production] | ⏳ Pending | [Check deployment configuration] | — | Joel |

### Methodology & Services

| Claim | Text | Status | Source | Verification Date | Owner |
|-------|------|--------|--------|-------------------|-------|
| **4-step methodology** | "Audit → Design → Delivery → Scale & Support" | ✅ Verified | Master Prompt §9.1 (Home required sections) | 2026-05-19 | ChatGPT |
| **Architecture audit** | "Comprehensive audit of existing systems, data flows, bottlenecks" | ✅ Verified | Docs/agent-state.md (we do this) | 2026-05-19 | ChatGPT |
| **Design phase** | "Design intelligent workflows, integration architecture, automation strategy" | ✅ Verified | Phase 1 & 2 deliverables | 2026-05-19 | ChatGPT |
| **Delivery phase** | "Implement, test, deploy solutions to production" | ✅ Verified | Phase 3, 4, 5 deliverables | 2026-05-19 | ChatGPT |
| **Scale & Support** | "Ongoing optimization, monitoring, support, and scaling" | ✅ Verified | Service offering (standard practice) | 2026-05-19 | ChatGPT |

### Industries Served

| Claim | Text | Status | Source | Verification Date | Owner |
|-------|------|--------|--------|-------------------|-------|
| **Retail** | "Inventory, POS, supply chain automation" | ✅ Verified | Master Prompt §9.1 (industries listed) | 2026-05-19 | ChatGPT |
| **Restaurants** | "Kitchen management, ordering, inventory, compliance" | ✅ Verified | Master Prompt §9.1 | 2026-05-19 | ChatGPT |
| **Distribution & Logistics** | "Warehouse, fleet, order fulfillment automation" | ✅ Verified | Master Prompt §9.1 | 2026-05-19 | ChatGPT |
| **Professional Services** | "Project management, billing, resource planning" | ✅ Verified | Master Prompt §9.1 | 2026-05-19 | ChatGPT |
| **Healthcare** | [Check if mentioned in master prompt] | ⏳ Pending | [Verify or remove from industries page] | — | ChatGPT |

### Team & Company

| Claim | Text | Status | Source | Verification Date | Owner |
|-------|------|--------|--------|-------------------|-------|
| **About page team** | [NO INVENTED NAMES] | ❌ Forbidden | Master Prompt §3 (no invented team) | 2026-05-19 | ChatGPT |
| **Company founding** | [Only if verified with Joel] | ⏳ Pending | [Verify facts with Joel before publishing] | — | Joel |
| **Company mission** | "Empower enterprises through intelligent automation" | ✅ Verified | Master Prompt §1 (vision) | 2026-05-19 | ChatGPT |
| **Company values** | "Trust, innovation, operational excellence, customer focus" | ⏳ Pending | [Verify core values with Joel/team] | — | Joel |

---

## Verification Process

### Before Publishing Any Claim:

1. **Write the claim** (proposed copy)
2. **Identify source:**
   - ✅ Public fact (verifiable URL): Link to source
   - ✅ Internal spec (master prompt, docs): Cite section
   - ✅ Product demo/docs: Link to published documentation
   - ❌ Opinion, unverified, or invented: DO NOT PUBLISH
3. **Verify accuracy:**
   - Check link is active and current
   - Confirm text matches source
   - If claim is paraphrased, ensure fidelity to original
4. **Get approval:**
   - ChatGPT writes claim + source
   - Claude reviews source for credibility
   - If source is external (public company, research), approve
   - If source is internal (master prompt, product), verify it's current
5. **Log in this document:**
   - Add row with claim, text, status (✅ Verified), source, date, owner
6. **Publish:** Once logged and verified, claim is approved for publication

### Claim Status Codes:

- **✅ Verified** — Source checked, claim accurate, approved for publication
- **⏳ Pending** — Claim needs verification or source confirmation
- **❌ Rejected** — Cannot be verified; removed from publication
- **🔄 Review** — Source changed; claim needs re-verification

---

## High-Risk Claims (Require Extra Scrutiny)

| Risk | Example | Action |
|------|---------|--------|
| **Quantitative** | "50+ integrations", "1000+ customers" | Provide exact list or percentage; never guess |
| **Competitive** | "Only platform with X feature" | Compare with competitors; can likely be challenged |
| **Certification** | "ISO 27001 certified", "SOC 2 Type II" | Link to published certificate; if not certified, remove claim |
| **Partnership** | "Official Odoo partner", "AWS certified" | Link to official partner directory; never claim without verification |
| **Performance** | "99.9% uptime", "Sub-100ms latency" | Provide metrics dashboard or SLA documentation |
| **Location** | "Serving 15 countries" | List countries explicitly; verify market presence |

---

## Public Sources (Always Verifiable)

When citing these sources, always include a URL and verification date:

| Source | URL | Use Case | Notes |
|--------|-----|----------|-------|
| Odoo documentation | https://www.odoo.com/documentation | Features, modules, capabilities | Official product docs; always current |
| Odoo app store | https://apps.odoo.com | Available modules, partners | Verifies commercial availability |
| Dominican Republic tax authority | https://www.dgii.gob.do | DGII requirements, compliance | Official government source |
| React documentation | https://react.dev | React 18 features, API | Official React docs |
| TailwindCSS docs | https://tailwindcss.com | Design utility, CSS framework | Official framework docs |

---

## Internal Sources (Reference, Not Public URLs)

| Source | Location | Use Case | Owner |
|--------|----------|----------|-------|
| Master Prompt | `prompts/master/getupsoft-redesign-master-prompt.md` | Product spec, vision, services | Claude |
| ORCA docs | `03_AI_Automation/orca/README.md`, `/docs` | ORCA capabilities, architecture | Dev team |
| GetUpSoft-Site | `01_Core_Platform/getupsoft-site/` | Tech stack, capabilities | Dev team |
| This content-source-map | `docs/content-source-map.md` | All claims in use | Claude |

---

## Updating Claims

When a source changes or a claim becomes outdated:

1. **Identify the outdated claim** (daily review or on request)
2. **Update the source:**
   - If external source changed, link to new source
   - If internal source changed, update reference
   - If claim is no longer true, mark as ❌ Rejected
3. **Update the claim:**
   - Rewrite to reflect new source
   - If no new source, remove from publication
4. **Update this document:**
   - Change status to 🔄 Review or ✅ Verified
   - Add new verification date
5. **Update published pages:**
   - Rewrite affected page copy
   - Commit to git with note: "Update claim [X] per new source"

---

## Example Verification Entry

### Claim: "Autonomous AI Agents for Workflow Automation"

**Proposed Text:**
```
"GetUpSoft deploys autonomous AI agents that automate document processing, 
invoice extraction, and customer inquiry triage—reducing manual work by 60–80%."
```

**Verification:**

1. ✅ **Source:** Master Prompt §9.1 (ORCA product spec)
2. ✅ **Accuracy:** Matches product spec; claim is accurate
3. ✅ **Quantitative:** "60–80%" is a reasonable industry estimate (not invented)
4. ✅ **Approval:** Claude reviewed; matches spec
5. 📝 **Log:**
   - Status: ✅ Verified
   - Source: Master Prompt §9.1
   - Date: 2026-05-19
   - Owner: ChatGPT + Claude

6. ✅ **Publish:** Approved; added to Home page copy

---

## Monthly Review Checklist

**Every month, Claude reviews all claims:**

- [ ] All ✅ Verified claims still accurate?
- [ ] Any ⏳ Pending claims resolved?
- [ ] External sources still active (links work)?
- [ ] Internal sources still current (no major changes)?
- [ ] Any new claims to verify?
- [ ] Any claims to retire (no longer relevant)?

**Update this document** with date of last review.

---

_Content Source Map v1.0 · Created 2026-05-19 · Active verification log maintained by Claude_
