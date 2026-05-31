# Client Solution Card Template

**Template Version:** 1.0
**ISO Reference:** ISO/IEC 12207:2017 §6.6 (Supply Process) · ISO/IEC/IEEE 42010:2011 §4.4

---

<!-- INSTRUCTIONS: Copy this template and rename as CLIENT_SOLUTION_CARD_[CLIENT_NAME].md -->
<!-- Fill in all sections. Delete comments before committing. -->

---

# Client Solution Card: [CLIENT NAME]

**Card ID:** CLIENT-[XXX]
**Date Created:** YYYY-MM-DD
**Last Updated:** YYYY-MM-DD
**Status:** [ ] Discovery | [ ] Development | [ ] Active | [ ] Maintenance | [ ] Closed
**Owner:** [GetUpSoft account manager / delivery lead]
**Domain:** `03_Client_Solutions/`

---

## 1. Client Identity

| Field | Value |
|---|---|
| Client Name | [Full legal name] |
| Short Name (canonical) | [Used in directories and code, e.g., GalantesJewelry] |
| Industry | [e.g., Jewelry / Restaurant / Retail] |
| Country | [e.g., Dominican Republic] |
| Contract Start | YYYY-MM-DD |
| Contract End | YYYY-MM-DD (or "Ongoing") |
| Primary Contact | [Name, role] |

---

## 2. Solution Description

### What we built
[1-2 paragraphs describing what was built for this client]

### Business problem solved
[What problem the client had and how we solved it]

### Solution components
- Component 1: [description]
- Component 2: [description]
- Component 3: [description]

---

## 3. Repository Locations

| Component | Current Path | Target Path | Status |
|---|---|---|---|
| [Component 1] | `[current path]` | `03_Client_Solutions/[client]/[component]` | [Active/Pending migration] |
| [Component 2] | `[current path]` | `03_Client_Solutions/[client]/[component]` | [Active/Pending migration] |

---

## 4. Technical Architecture

### Tech Stack
| Layer | Technology | Notes |
|---|---|---|
| Frontend | [React/Vue/Odoo UI] | [Notes] |
| Backend | [NestJS/Odoo/Python] | [Notes] |
| Database | [PostgreSQL/SQLite] | [Notes] |
| Infrastructure | [Docker/Cloudflare/etc.] | [Notes] |

### Workers Used
| Worker | Path | Purpose |
|---|---|---|
| [Worker name] | `04_Workers/[path]/` | [What it does for this client] |

### GetUpSoft Products Used
| Product | Version | Integration |
|---|---|---|
| [ORCA/EasyCount/etc.] | [Version] | [How it's integrated] |

---

## 5. Client-Specific Configuration

<!-- List configurations that are specific to this client -->

| Config Item | Value/Location |
|---|---|
| Environment File | `[path]/.env.client` (never commit) |
| Cloudflare Domain | [domain.com] |
| Custom Odoo Modules | [list] |
| Custom Branding | [path to assets] |

---

## 6. Data and Privacy

| Item | Value |
|---|---|
| Client Data Stored | [ ] Yes | [ ] No |
| Data Location | [server/cloud description] |
| Backup Frequency | [daily/weekly] |
| Data Retention Policy | [policy or N/A] |
| GDPR/Privacy Applicable | [ ] Yes | [ ] No |

---

## 7. Delivery Status

| Milestone | Status | Date |
|---|---|---|
| Discovery complete | [ ] | YYYY-MM-DD |
| MVP delivered | [ ] | YYYY-MM-DD |
| Production launch | [ ] | YYYY-MM-DD |
| Client acceptance | [ ] | YYYY-MM-DD |
| Post-launch support period | [ ] | YYYY-MM-DD to YYYY-MM-DD |

---

## 8. Migration Status

| Field | Value |
|---|---|
| Migration Risk | [ ] Low | [ ] Medium | [ ] High | [ ] Critical |
| Blocking Condition | [What must happen before moving to 03_Client_Solutions/] |
| ADR Reference | [ADR-XXXX if applicable] |

---

## 9. Known Issues / Technical Debt

| Issue | Severity | Status |
|---|---|---|
| [Issue description] | [ ] Low | [ ] Medium | [ ] High | [Open/In progress/Resolved] |

---

## 10. Change Log

| Date | Change | Author |
|---|---|---|
| YYYY-MM-DD | Card created | [Name] |

---

*GetUpSoft Client Solution Card Template v1.0 — ISO/IEC 12207:2017 §6.6*
