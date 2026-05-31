# Agent Rules — GetUpSoft Workspace

**Document ID:** MEM-002
**Date:** 2026-05-31
**Owner:** Joel Stalin Martinez Espinal
**Status:** MANDATORY — All AI Agents Must Read Before Operating
**ISO Reference:** ISO/IEC 27001:2022 A.5.1, A.5.10 · ISO/IEC 12207:2017 §7.2.3

---

## Mandatory Pre-Task Checklist

Before performing ANY task in the GetUpSoft Workspace, every AI agent MUST complete:

- [ ] Read this file (`AGENT_RULES.md`)
- [ ] Read `REPOSITORY_MEMORY.md` for domain decisions
- [ ] Check `00_Workspace_Governance/ARCHITECTURE_GOVERNANCE.md` if structural changes are involved
- [ ] Check `00_Workspace_Governance/migration_manifest.md` if moving any folder
- [ ] Read the relevant component card in `COMPONENT_CARDS/` if modifying a component

---

## Section 1: Structural Rules (Never Violate)

### 1.1 — Never Move Critical Directories Without Approval
The following directories MUST NOT be moved, renamed, or restructured under any circumstances without an explicit ADR and human approval:

| Directory | Reason |
|---|---|
| `02_Odoo_ERP/` | Production ERP, DGII fiscal compliance, active development |
| `libs/easycount-core/` | DGII fiscal silo — Dominican tax law compliance |
| `_Knowledge_Center/` | Architecture memory — moving breaks all agent sessions |
| `scripts/` | Too many hardcoded paths — audit required first |
| `apps/orca/config/` | Live model configurations for production |

### 1.2 — Never Invent Structure
Do not create new top-level directories, domain directories, or architectural components that are not documented in:
- `00_Workspace_Governance/ARCHITECTURE_GOVERNANCE.md`
- `00_Workspace_Governance/REPOSITORY_CLASSIFICATION_MATRIX.md`

If you believe a new directory is needed, document it in `migration_manifest.md` and propose an ADR — do not create it unilaterally.

### 1.3 — Never Delete Without Backup Confirmation
Do not `rm -rf`, `git clean`, or delete any code directory without:
1. Confirming the directory is in `09_Archives/` target
2. Confirming content is committed to git history
3. Human approval for production-related directories

### 1.4 — Update Manifest for Every Folder Move
Any folder move MUST have:
- A `migration_manifest.md` entry (date, from, to, risk, status)
- Pre and post validation completed
- CI/CD confirmed working after move

### 1.5 — Create or Update ADR for Structural Decisions
Structural decisions (new domains, major refactors, framework changes) MUST have an ADR in `_Knowledge_Center/Architecture/ADR/`. Format defined in ADR-0001 to ADR-0005.

---

## Section 2: Code Rules

### 2.1 — FastAPI HTTP Services Are Prohibited
**Effective 2026-05-25.** Do NOT:
- Create new FastAPI routes or services
- Add FastAPI dependencies to any project
- Call legacy FastAPI endpoints (`legacy/python-fastapi/*`, `apps/orca/ai_automation_orchestrator/*`)
- Fix or extend existing FastAPI services

DO:
- Use `apps/backend-nest/` (NestJS) for all new HTTP APIs
- Use Python CLI (`orca/cli.py`) for local ORCA tooling
- Reference `00_Workspace_Governance/FASTAPI_DEPRECATION_POLICY.md`

### 2.2 — DGII Fiscal Logic Is Siloed
All Dominican fiscal logic (NCF, RNC, ITBIS, e-CF, DGII API) lives ONLY in `libs/easycount-core/`. Do NOT:
- Copy fiscal logic to other modules
- Implement DGII validation outside `easycount-core`
- Create alternative fiscal calculators

DO:
- Import from `easycount-core` via its public API
- Reference fiscal functions by name from the library
- File a ticket if `easycount-core` is missing a fiscal feature

### 2.3 — EasyCount Canonical Name
The product is called **EasyCount**. References to "EasyCounting," "easycouting," "Easycouting_Refactor" in new code or documents are prohibited. In historical documents, leave the original names as-is.

### 2.4 — NestJS Is the HTTP Framework
New HTTP endpoints go in `apps/backend-nest/`. The NestJS service follows Clean/Hexagonal Architecture. All route handlers delegate to service classes, not inline business logic.

### 2.5 — Hexagonal Architecture Per Domain
Inside each product domain (`apps/orca/`, `apps/easycount/`, etc.):
- Domain core has no framework dependencies
- Ports are interfaces only (TypeScript interfaces, Python ABCs)
- Adapters are framework-specific implementations
- Workers are called through their contracts, not imported directly

---

## Section 3: Security Rules

### 3.1 — Never Hardcode Secrets
No API keys, passwords, database credentials, tokens, or private keys in any code file. Always use environment variables. The `.env` file is in `.gitignore`. Use `.env.example` to document required variables.

**Files that may contain secrets (never commit these):**
- `.env`
- `.env.local`
- `.env.production`
- Any file with `_secret`, `_credentials`, `_key` in the name

### 3.2 — Never Touch Production Databases
Do not run database migrations, DROP statements, or schema changes against production databases. All database operations go through:
1. Local Docker Compose instance
2. Staging environment (if available)
3. Production — only with explicit human approval and backup confirmed

### 3.3 — Never Expose Internal Network Details
Do not hardcode LAN IPs, VPN credentials, or server hostnames in public-facing code. Use environment variables. The `getupsoft-lan` hostname is a private LAN alias.

### 3.4 — Log Security Findings
If you discover a secret accidentally committed, a vulnerable dependency, or an exposed endpoint, log it immediately to `task-ledger/` as a security finding and alert the human operator.

---

## Section 4: Quality Rules

### 4.1 — UI/UX Changes Require QA Checklist
Before committing any frontend/UI change:
1. Visual regression check (colors, icons, spacing)
2. Contrast validation (text >= 4.5:1, WCAG AA)
3. Interaction states (hover, focus, active, disabled)
4. Z-index hierarchy (no overlapping)
5. Responsive test (1024px, 1440px, 1920px)
6. Keyboard navigation (Tab, Escape, Enter)
7. Browser DevTools (0 console errors)

Evidence required: before/after screenshots with timestamps.

### 4.2 — Tests Before Commit
All code changes must pass existing tests:
- `pytest` for Python projects
- `npm test` or `pnpm test` for JavaScript/TypeScript
- Playwright E2E for UI changes
- No new test failures allowed

### 4.3 — Evidence-Based Reporting
Only report tests that were actually executed. Evidence files (screenshots, logs, test output) must be real. Do not generate fake evidence.

### 4.4 — Odoo Module Changes Require ORCA Integration
Per `V19_COMPLETE_MODULE_REFACTORING_MANDATE.md`: every Odoo v19 module change MUST:
- Apply `OrcaAuditMixin` to tracked models
- Include `_orca_tracked_fields` definition
- Have 5+ unit tests proving ORCA logging works
- Include security rules (ir.model.access.csv)
- Include list/form views for audit logs

---

## Section 5: Agent-Specific Rules

### 5.1 — Claude Code Agents
- Run `.\scripts\agent_start.ps1` at start of every session
- Use `WORKSPACE.map` as primary structural reference
- Update `_Knowledge_Center/Memory/` after architectural milestones
- Commit only when explicitly requested by the human

### 5.2 — Codex Agents
- Read `CODEX.md` at root for Codex-specific configuration
- Follow the same structural and security rules as Claude
- Codex must not push to `main` without human approval

### 5.3 — ORCA Agents (automated)
- ORCA agents operate via defined workflow contracts
- ORCA agents MUST NOT modify governance documents
- ORCA agents MUST NOT create new architectural structures
- ORCA agents log all operations via OrcaAuditMixin

### 5.4 — All Agents
- **Do not re-open decided questions** — check ADRs before proposing structural changes
- **Do not move High/Critical risk directories** — document only
- **Do not push to main/master** — use feature branches
- **Do not run destructive git commands** (reset --hard, push --force, clean -f) without explicit human instruction
- **Do not skip CI hooks** — if a hook fails, fix the root cause

---

## Section 6: Escalation Rules

Escalate to human operator (Joel Stalin) if:
1. You encounter a directory or file marked "never move" that appears to need restructuring
2. You discover a security vulnerability or exposed secret
3. A test fails that was passing before your change
4. A Docker service fails to start after your change
5. You are unsure whether a change falls under "High" or "Critical" risk
6. You need to modify `02_Odoo_ERP/` in any structural way
7. You encounter conflicting governance documents

Do NOT proceed unilaterally on any of the above. Stop, document the situation in a session summary, and wait for human direction.

---

## Violations and Consequences

| Violation | Consequence |
|---|---|
| FastAPI HTTP code in PRs | Blocked — PR rejected, agent escalation note |
| Moving Critical directory | Immediate rollback, incident report |
| Hardcoded secret committed | Security incident, immediate secret rotation |
| UI change without QA checklist | Blocked — no merge until checklist complete |
| Odoo module without ORCA mixin | Blocked — per V19 mandate |
| Fake evidence reported | Agent credibility review, session logs audited |

---

*Generated: 2026-05-31 | GetUpSoft Agent Rules — Mandatory Reading*
