# Repository Classification Matrix

**Document ID:** GOV-002
**Date:** 2026-05-31
**Owner:** Joel Stalin Martinez Espinal
**Status:** Active
**ISO Reference:** ISO/IEC/IEEE 42010:2011 · ISO/IEC 12207:2017

---

## Classification Summary

Total directories inventoried: 43
- Low risk (can move): 8
- Medium risk (plan required): 14
- High risk (ADR required): 12
- Critical (never move): 9

---

## Full Classification Matrix

| Current Path | Type | Target Domain | Risk | Known Dependencies | Recommended Action | Status |
|---|---|---|---|---|---|---|
| `apps/backend-nest/` | NestJS HTTP API | `02_Products/ORCA/backend/` or stay in apps | High | ORCA frontend, ORCA client gateway, CI/CD workflows | Document target. Audit imports before move | Do not move yet |
| `apps/easycount/` | Product (full stack) | `02_Products/EasyCount/` | High | libs/easycount-core, Docker Compose, CI/CD, alembic migrations | Impact matrix required. Move in planned sprint | Do not move yet |
| `apps/orca/` | Product (AI platform) | `02_Products/ORCA/` | High | backend-nest, orca-client-gateway, scripts/, docker-compose.yml | Audit all imports. Critical path for production | Do not move yet |
| `apps/orca/workflow-editor/` | Product sub-module (React UI) | `02_Products/ORCA/workflow-editor/` | High | orca/src, backend-nest, Playwright tests, CI/CD | Part of ORCA. Move as unit with parent | Do not move yet |
| `apps/orca-client-gateway/` | Product sub-module (desktop gateway) | `02_Products/ORCA/client-gateway/` | High | orca/src, pnpm workspace, Electron/desktop | Audit pnpm workspace references first | Do not move yet |
| `apps/site/` | Product (marketing site) | `02_Products/GetUpSoftSite/` | Medium | Cloudflare Pages, CI/CD, Docker | Audit CI workflows. Low code risk | Plan sprint |
| `apps/easycount/` | Product (accounting) | `02_Products/EasyCount/` | High | Python/FastAPI legacy, Postgres, Docker, alembic | Canonical name = EasyCount. Major migration | Do not move yet |
| `apps/hyperframes/` | Research/tooling | `08_Research_Labs/hyperframes/` | Medium | Used by 03_AI_Automation | Confirm consumers, then move | Plan sprint |
| `apps/ida-pro-mcp/` | Security tooling | `08_Research_Labs/ida-pro-mcp/` | Low | No known runtime consumers | Move after doc update | Pending |
| `apps/insta-manager-pro/` | AI Worker (Instagram) | `04_Workers/social/insta-manager-pro/` | Medium | scripts/deploy, CI/CD | Audit deploy scripts | Plan sprint |
| `apps/kaliman-mcp/` | MCP tooling/library | `07_Libraries_Tools/mcp/kaliman/` | Low | mcp-servers.shared.json | Update MCP manifest then move | Pending |
| `apps/local_printer_agent/` | Worker (printer) | `04_Workers/printer/local-printer-agent/` | Medium | ChefAlitas dependency suspected | Audit client-specific coupling first | Plan sprint |
| `apps/n8n/` | Worker runtime | `04_Workers/workflow-runtime/n8n/` | Medium | n8n workflows, Docker Compose | Audit workflow configs. Critical runtime | Do not move yet |
| `apps/nexus/` | Internal tooling | `07_Libraries_Tools/nexus/` | Low | Not confirmed in production | Classify usage, then move | Pending |
| `apps/notebooklm-py/` | AI worker/library | `08_Research_Labs/notebooklm-py/` | Low | No confirmed runtime consumer | Move after classification | Pending |
| `apps/odoo/` | ERP integration layer | `02_Odoo_ERP/integration/` | Critical | Odoo Docker, DGII modules, production DB | Never move without full ERP audit | Never move |
| `apps/printer_proxy/` | Worker (printer proxy) | `04_Workers/printer/printer-proxy/` | Medium | local_printer_agent, client ref | Audit coupling with ChefAlitas | Plan sprint |
| `apps/QR_generetor/` | Utility tool | `07_Libraries_Tools/qr-generator/` | Low | No confirmed consumers | Fix typo in name, move to libs | Pending |
| `apps/research-ai/` | Research lab | `08_Research_Labs/research-ai/` | Low | No production consumers confirmed | Move to labs | Pending |
| `apps/web_qr_generetor/` | Utility tool | `07_Libraries_Tools/qr-generator-web/` | Low | No confirmed consumers | Consolidate with QR_generetor | Pending |
| `01_Core_Platform/getupsoft-site/` | Product (site) | `02_Products/GetUpSoftSite/` | Medium | apps/site overlaps — confirm canonical | Resolve duplication with apps/site first | Plan sprint |
| `01_Core_Platform/branding_assets/` | Core branding | `01_Core_Platform/branding_assets/` | Low | Referenced by site, docs | Keep in core, ensure README exists | Keep in place |
| `01_Core_Platform/getupsoft-mail-infra/` | Infrastructure (mail) | `06_Infrastructure_Networking/mail/` | Medium | Docker Compose, mail scripts | Matches infra/mail — resolve duplication | Plan sprint |
| `01_Core_Platform/getupsoft-ops/` | Operations tooling | `01_Core_Platform/getupsoft-ops/` | Low | CI/CD, ops scripts | Audit and keep or move to governance | Keep in place |
| `01_Core_Platform/infrastructure/` | Infrastructure (VPN, Cloudflare) | `06_Infrastructure_Networking/` | Medium | OpenVPN configs, Cloudflare docs | Merge with infra/ directory | Plan sprint |
| `02_Odoo_ERP/` | ERP — all versions | `05_ERP_Odoo/` (target name) | Critical | Production data, DGII modules, Docker, RNC/NCF logic | Never move. Rename target documented in ADR-0004 | Never move (rename only) |
| `02_Odoo_ERP/Odoo_Enterprise_v15/` | ERP archive | `09_Archives/Odoo_v15/` | High | Old migrations may be referenced | Document first, never move without audit | Do not move yet |
| `02_Odoo_ERP/Odoo_Enterprise_v19/` | ERP active | `05_ERP_Odoo/v19/` | Critical | Active development, ORCA integration, DGII | Current active version — never move | Never move |
| `02_Odoo_ERP/Odoo_Consolidated_Library/` | ERP library | `05_ERP_Odoo/library/` | High | ChefAlitas embedded inside, multiple module refs | Extract ChefAlitas first, then classify | Do not move yet |
| `02_Products/` | Products root | `02_Products/` | Low | README only currently | Populate with product cards | Active — add content |
| `03_AI_Automation/` | AI automation domain | See sub-items | High | Multiple overlapping products and workers | Classify each sub-directory individually | Classify per item |
| `03_AI_Automation/orca/` | Product (ORCA mirror?) | `02_Products/ORCA/` | High | Overlaps with apps/orca — verify canonical | Resolve duplication, pick canonical path | Do not move yet |
| `03_AI_Automation/n8n/` | Worker runtime | `04_Workers/workflow-runtime/n8n/` | Medium | Docker, workflow configs | Resolve with apps/n8n duplication | Do not move yet |
| `03_AI_Automation/NemoClaw/` | Research/product | `08_Research_Labs/NemoClaw/` | Medium | ORCA NeMo integration references | Classify as Lab or Product | Plan sprint |
| `03_AI_Automation/hermes-agent/` | AI agent worker | `04_Workers/ai-agents/hermes/` | Medium | Not confirmed in production | Classify and card | Plan sprint |
| `03_AI_Automation/rowboat/` | AI agent framework | `08_Research_Labs/rowboat/` | Low | Not confirmed in production | Move to labs | Pending |
| `03_AI_Automation/scrapling/` | Web scraping worker | `04_Workers/data/scrapling/` | Low | Not confirmed in production | Move to workers/data | Pending |
| `03_Client_Solutions/` | Client solutions root | `03_Client_Solutions/` | Low | README only — needs content | Populate with ChefAlitas, GalantesJewelry cards | Active — add content |
| `06_E_Commerce_Lux/Galantesjewelry/` | Client Solution (active) | `03_Client_Solutions/GalantesJewelry/` | Medium | Active e-commerce, Cloudflare, deploy scripts | Create client card first, then migrate path | Do not move yet |
| `02_Odoo_ERP/Odoo_Consolidated_Library/v18/Projects/Chefalitas/` | Client Solution (embedded in ERP) | `03_Client_Solutions/ChefAlitas/` | High | Embedded in Odoo v18 library, printer agent | Extract requires ERP module audit | Do not move yet |
| `04_Archive_Legacy/` | Archives | `09_Archives/` | Low | No active consumers | Rename/merge with archive/ | Plan sprint |
| `archive/` | Archives (root) | `09_Archives/` | Low | No active consumers | Merge with 04_Archive_Legacy | Plan sprint |
| `infra/` | Infrastructure | `06_Infrastructure_Networking/` | Medium | Docker configs, VPN, mail | Merge with 01_Core_Platform/infrastructure | Plan sprint |
| `libs/` | Libraries | `07_Libraries_Tools/` | High | libs/easycount-core is DGII critical, libs/traffic_control | easycount-core is Critical — never move | Keep in place |
| `libs/easycount-core/` | DGII fiscal library (Critical) | `07_Libraries_Tools/easycount-core/` | Critical | EasyCount app, Odoo DGII modules, fiscal reports | DGII silo — never move | Never move |
| `libs/traffic_control/` | Network control library | `07_Libraries_Tools/traffic-control/` | Medium | traffic-control.stitch.yml, scripts | Audit consumers before move | Plan sprint |
| `scripts/` | Workspace scripts | `00_Workspace_Governance/scripts/` or stay | Medium | All CI/CD, agent_start, bootstrap, deploy | Many hardcoded paths — audit before move | Keep in place |
| `task-ledger/` | Task tracking & planning | `_Knowledge_Center/TaskLedger/` or stay | Low | Referenced by agents, session summaries | Move only after updating all agent memory refs | Plan sprint |
| `_Knowledge_Center/` | Architecture memory | `_Knowledge_Center/` | Low | Read by all agents | Keep in place. Expand with new docs | Never move |
| `docs/` | Root docs | `_Knowledge_Center/Docs/` or `00_Workspace_Governance/` | Low | GitHub Pages, CI workflow refs | Audit GitHub Pages config first | Plan sprint |

---

## Duplication Alerts

These items appear in multiple locations and MUST be resolved before any migration:

| Item | Location 1 | Location 2 | Resolution |
|---|---|---|---|
| ORCA | `apps/orca/` | `03_AI_Automation/orca/` | Determine canonical — likely `apps/orca/` |
| n8n runtime | `apps/n8n/` | `03_AI_Automation/n8n/` | Merge into single worker runtime location |
| GetUpSoft site | `apps/site/` | `01_Core_Platform/getupsoft-site/` | Confirm canonical — likely `apps/site/` |
| Mail infra | `01_Core_Platform/getupsoft-mail-infra/` | `infra/mail/` | Merge under `06_Infrastructure_Networking/mail/` |
| QR Generator | `apps/QR_generetor/` | `apps/web_qr_generetor/` | Consolidate, fix typo |
| EasyCount | `apps/easycount/` | `libs/easycount-core/` | Different layers — document separation clearly |

---

*Generated: 2026-05-31 | GetUpSoft Repository Classification Matrix*
