# Migration Plan — GetUpSoft Workspace Restructuring

**Document ID:** GOV-003
**Date:** 2026-05-31
**Owner:** Joel Stalin Martinez Espinal
**Status:** Active — Phase 0 (Documentation)
**ISO Reference:** ISO/IEC 12207:2017 (Section 6.3 — Infrastructure Management Process)

---

## Guiding Principles

1. Document before moving. Every migration entry must exist in this plan BEFORE any file is moved.
2. Low-risk docs first. High-risk code directories must wait for full dependency audits.
3. Never break production. No migration happens during active deployments.
4. Rollback-first design. Every move has a documented rollback strategy.
5. ADR required for High/Critical. A documented Architecture Decision Record must exist.

---

## Target Repository Structure

```
GetUpSoft_Workspace/
├── 00_Workspace_Governance/    # Rules, manifests, classification matrices
├── 01_Core_Platform/           # Branding, ops, site infra (keep current)
├── 02_Products/                # GetUpSoft products: ORCA, EasyCount, GetUpSoftSite
├── 03_Client_Solutions/        # GalantesJewelry, ChefAlitas
├── 04_Workers/                 # Autonomous workers: print, social, data, AI
├── 05_ERP_Odoo/                # Target rename for 02_Odoo_ERP (long term)
├── 06_Infrastructure_Networking/  # Docker, VPN, Nginx, Cloudflare
├── 07_Libraries_Tools/         # SDKs, CLI tools, shared libraries (libs/)
├── 08_Research_Labs/           # POCs, experiments, research
├── 09_Archives/                # Obsolete / legacy code
├── _Knowledge_Center/          # Architecture memory, ADRs, agent rules (keep current)
├── apps/                       # Active monorepo apps (keep current during migration)
├── libs/                       # Critical libraries (keep during migration)
└── scripts/                    # Workspace automation (keep in place)
```

---

## Phase 0 — Documentation Only (Current Phase)

**Duration:** 2026-05-31 (complete this sprint)
**Goal:** Create all governance documents. Zero code or folder moves.

| Task | Target File | Status |
|---|---|---|
| Create ARCHITECTURE_GOVERNANCE.md | `00_Workspace_Governance/` | Done |
| Create REPOSITORY_CLASSIFICATION_MATRIX.md | `00_Workspace_Governance/` | Done |
| Create MIGRATION_PLAN.md | `00_Workspace_Governance/` | Done |
| Create ISO_TRACEABILITY_MATRIX.md | `00_Workspace_Governance/` | Done |
| Create ARCHITECTURE_OVERVIEW.md (C4 diagrams) | `_Knowledge_Center/Architecture/` | Done |
| Create 5 ADRs | `_Knowledge_Center/Architecture/ADR/` | Done |
| Create REPOSITORY_MEMORY.md | `_Knowledge_Center/Memory/` | Done |
| Create AGENT_RULES.md | `_Knowledge_Center/Memory/` | Done |
| Create 5 Component Card Templates | `_Knowledge_Center/Memory/COMPONENT_CARDS/` | Done |
| Update migration_manifest.md | `00_Workspace_Governance/` | Done |

---

## Phase 1 — Low Risk Documentation Moves

**Prerequisite:** Phase 0 complete.
**Duration:** 1 sprint (3 days)
**Goal:** Move only documentation files and empty/stub directories. No code changes.

### Items approved for Phase 1

| Current Path | Target Path | Risk | Validation Required | Rollback Strategy | Owner |
|---|---|---|---|---|---|
| `archive/` | `09_Archives/root-archive/` | Low | Verify no CI references to `archive/` path | `git mv` is reversible; restore via git | Architecture Lead |
| `04_Archive_Legacy/` | `09_Archives/legacy/` | Low | Verify no script references | Reverse git mv | Architecture Lead |
| `docs/` (non-GitHub-Pages) | `_Knowledge_Center/Docs/` | Low | Check GitHub Pages config in `.github/` | Reverse git mv + update GH Pages config | Architecture Lead |
| `03_AI_Automation/rowboat/` | `08_Research_Labs/rowboat/` | Low | Confirm no production consumer | Reverse git mv | Engineering Lead |
| `03_AI_Automation/scrapling/` | `04_Workers/data/scrapling/` | Low | Confirm no production consumer | Reverse git mv | Engineering Lead |
| `03_AI_Automation/notebooklm-py/` | `08_Research_Labs/notebooklm-py/` | Low | Confirm no production consumer | Reverse git mv | Engineering Lead |
| `apps/nexus/` | `07_Libraries_Tools/nexus/` | Low | Confirm no production consumer | Reverse git mv | Engineering Lead |
| `apps/QR_generetor/` + `apps/web_qr_generetor/` | `07_Libraries_Tools/qr-tools/` | Low | No CI/CD references found | Reverse git mv | Engineering Lead |
| `apps/research-ai/` | `08_Research_Labs/research-ai/` | Low | No CI/CD references found | Reverse git mv | Engineering Lead |
| `apps/ida-pro-mcp/` | `08_Research_Labs/ida-pro-mcp/` | Low | No CI/CD references found | Reverse git mv | Engineering Lead |

### Phase 1 Pre-Validation Checklist

- [ ] `grep -r "archive/" .github/` returns no active workflow references
- [ ] `grep -r "04_Archive_Legacy" scripts/` returns nothing
- [ ] `grep -r "rowboat" apps/` returns no imports
- [ ] GitHub Pages source directory confirmed (not `docs/`)
- [ ] All Phase 1 items have been assigned owners
- [ ] Migration manifest updated with all Phase 1 entries

### Phase 1 Post-Validation Checklist

- [ ] `git status` shows only expected moves
- [ ] CI/CD pipelines pass (no broken references)
- [ ] `docker compose config` has no warnings
- [ ] Agent memory updated in `_Knowledge_Center/Memory/REPOSITORY_MEMORY.md`

---

## Phase 2 — Medium Risk Code Moves (Requires Sprint Planning)

**Prerequisite:** Phase 1 complete + dependency audits for each item.
**Duration:** 1-2 sprints per item
**Goal:** Move medium-risk code directories with full impact matrices.

| Current Path | Target Path | Risk | Required Audit | ADR Reference |
|---|---|---|---|---|
| `06_E_Commerce_Lux/Galantesjewelry/` | `03_Client_Solutions/GalantesJewelry/` | Medium | Cloudflare Pages routes, deploy scripts, DNS references | ADR-0002 |
| `01_Core_Platform/getupsoft-mail-infra/` + `infra/mail/` | `06_Infrastructure_Networking/mail/` | Medium | Docker Compose volumes, Mailcow config | TBD ADR |
| `01_Core_Platform/infrastructure/` + `infra/vpn/` | `06_Infrastructure_Networking/vpn-cloudflare/` | Medium | OpenVPN configs, Cloudflare Zero Trust | TBD ADR |
| `apps/insta-manager-pro/` | `04_Workers/social/insta-manager-pro/` | Medium | Deploy scripts, Instagram API credentials | TBD ADR |
| `apps/local_printer_agent/` | `04_Workers/printer/local-printer-agent/` | Medium | ChefAlitas coupling audit required first | TBD ADR |
| `apps/printer_proxy/` | `04_Workers/printer/printer-proxy/` | Medium | Depends on local_printer_agent audit | TBD ADR |
| `03_AI_Automation/hermes-agent/` | `04_Workers/ai-agents/hermes/` | Medium | Confirm production usage | TBD ADR |
| `03_AI_Automation/NemoClaw/` | `08_Research_Labs/NemoClaw/` | Medium | ORCA integration references | TBD ADR |
| `libs/traffic_control/` | `07_Libraries_Tools/traffic-control/` | Medium | traffic-control.stitch.yml consumers | TBD ADR |
| `task-ledger/` | `_Knowledge_Center/TaskLedger/` | Medium | All agent memory references | TBD ADR |

---

## Phase 3 — High Risk Migrations (Requires Full ADR + Sprint)

**Prerequisite:** Phase 2 complete. Full dependency audit. Approved ADR. Staging validation.
**Duration:** 1 sprint per item minimum
**Goal:** Migrate high-risk code with full traceability and staging environment validation.

| Current Path | Target Path | Risk | Blocking Condition |
|---|---|---|---|
| `apps/site/` + `01_Core_Platform/getupsoft-site/` | `02_Products/GetUpSoftSite/` | High | Resolve duplication first. Confirm CI/CD canonical path |
| `apps/easycount/` | `02_Products/EasyCount/` | High | Full Docker + alembic + Python import audit |
| `apps/orca/` | `02_Products/ORCA/` | High | Resolve duplication with `03_AI_Automation/orca/` first |
| `apps/backend-nest/` | `02_Products/ORCA/backend/` or stay | High | Confirm monorepo workspace config (pnpm/yarn) |
| `apps/orca-client-gateway/` | `02_Products/ORCA/client-gateway/` | High | Electron build paths, pnpm workspace |
| `03_AI_Automation/orca/` | Merge into `apps/orca/` | High | Canonical path decision — see ADR-0002 |
| `03_AI_Automation/n8n/` + `apps/n8n/` | `04_Workers/workflow-runtime/n8n/` | High | Resolve duplication, audit all workflow JSON files |

---

## Items That Must NEVER Be Moved

| Path | Reason |
|---|---|
| `02_Odoo_ERP/` (any version with data) | Production business data, active DGII modules, fiscal compliance |
| `libs/easycount-core/` | DGII fiscal silo — regulatory critical |
| `scripts/` | Too many hardcoded references across entire workspace |
| `_Knowledge_Center/` | Agent memory — moving would break all agent sessions |
| `apps/orca/config/` | Contains live model configurations for production |

---

## Rollback Plan (Universal)

For any git-tracked move:

```powershell
# Option 1: Revert the specific commit
git revert <commit-hash>

# Option 2: Restore specific path
git checkout HEAD~1 -- <original-path>

# Option 3: Full branch rollback
git reset --hard <pre-migration-commit>
git push --force origin <branch>  # Only after team approval
```

For Docker-volume-referenced paths:
1. Stop all containers: `docker compose down`
2. Restore path via git
3. Restart: `docker compose up -d`
4. Validate all services healthy

---

## Pre/Post Migration Validation Template

For each Phase 2+ migration:

**Pre-Migration:**
- [ ] Dependency scan complete (zero unresolved refs)
- [ ] Docker Compose config validated (`docker compose config`)
- [ ] CI/CD pipeline dry-run passes
- [ ] Migration manifest entry created
- [ ] ADR written and committed
- [ ] Team notified / no active deployments in progress

**Post-Migration:**
- [ ] All tests pass (`npm test`, `pytest`, etc.)
- [ ] Docker builds succeed
- [ ] CI/CD pipeline green
- [ ] Agent memory updated
- [ ] Migration manifest status set to "complete"
- [ ] ADR consequence section updated

---

*Generated: 2026-05-31 | GetUpSoft Migration Plan*
