# Product Card Template

**Template Version:** 1.0
**ISO Reference:** ISO/IEC 12207:2017 §6.2.2 · ISO/IEC/IEEE 42010:2011 §4.4

---

<!-- INSTRUCTIONS: Copy this template and rename as PRODUCT_CARD_[PRODUCT_NAME].md -->
<!-- Fill in all sections. Delete comments before committing. -->

---

# Product Card: [PRODUCT CANONICAL NAME]

**Card ID:** PROD-[XXX]
**Date Created:** YYYY-MM-DD
**Last Updated:** YYYY-MM-DD
**Status:** [ ] Draft | [ ] Active | [ ] Deprecated | [ ] Archived
**Owner:** [Name]
**Domain:** `02_Products/`

---

## 1. Identity

| Field | Value |
|---|---|
| Canonical Name | [Required — use this name everywhere] |
| Deprecated Names | [List any old/alternate names] |
| Current Path | `apps/[name]/` or `02_Products/[name]/` |
| Target Path | `02_Products/[name]/` |
| Repository | [GitHub URL if applicable] |
| Version | [Current version] |
| Tech Stack | [e.g., React + NestJS + PostgreSQL] |

---

## 2. Description

### What it does
[1-2 paragraphs describing the product purpose and main value proposition]

### Who uses it
[Describe the target users — internal? External? Which country/market?]

### Primary features
- Feature 1
- Feature 2
- Feature 3

---

## 3. Architecture Summary

### Components
| Component | Path | Technology | Role |
|---|---|---|---|
| Frontend | `apps/[name]/frontend/` | [React/Vue/etc.] | User interface |
| API | `apps/[name]/api/` or `apps/backend-nest/` | [NestJS/Python] | Business logic |
| Database | N/A (Docker) | [PostgreSQL/SQLite] | Data storage |

### External Dependencies
| System | Type | Purpose |
|---|---|---|
| [System name] | [API/DB/SDK] | [What it does for this product] |

### Workers Used
| Worker | Path | Contract |
|---|---|---|
| [Worker name] | `04_Workers/[path]/` | [Link to contract doc] |

---

## 4. Infrastructure

| Item | Value |
|---|---|
| Docker Compose File | `[path]/docker-compose.yml` |
| Production URL | [URL or N/A] |
| Staging URL | [URL or N/A] |
| CI/CD Pipeline | `.github/workflows/[name].yml` |
| Cloudflare Config | [Page rule / Zero Trust app or N/A] |
| Environment File | `.env.example` |

---

## 5. Critical Rules

<!-- List product-specific rules that agents must never violate -->

- [ ] [Rule 1]
- [ ] [Rule 2]
- [ ] [Rule 3]

---

## 6. Migration Status

| Field | Value |
|---|---|
| Migration Risk | [ ] Low | [ ] Medium | [ ] High | [ ] Critical |
| Migration Phase | [ ] Phase 0 (doc only) | [ ] Phase 1 | [ ] Phase 2 | [ ] Phase 3 | [ ] Complete |
| Blocking Conditions | [What must be resolved before migration] |
| ADR Reference | [ADR-XXXX] |

---

## 7. Test Coverage

| Test Type | Tool | Status | Last Run |
|---|---|---|---|
| Unit Tests | [pytest/jest] | [ ] Passing | YYYY-MM-DD |
| Integration Tests | [Tool] | [ ] Passing | YYYY-MM-DD |
| E2E Tests | [Playwright/Selenium] | [ ] Passing | YYYY-MM-DD |

---

## 8. Change Log

| Date | Change | Author |
|---|---|---|
| YYYY-MM-DD | Card created | [Name] |

---

*GetUpSoft Product Card Template v1.0 — ISO/IEC 12207:2017*
