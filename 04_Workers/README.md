# 04_Workers — GetUpSoft Workspace

**Domain:** Workers
**ISO Reference:** ISO/IEC 25010:2023 §4.8 (Reusability) · ISO/IEC/IEEE 42010:2011 §4.4

This folder is the target architecture area for reusable, autonomous GetUpSoft workers. Workers are first-class citizens in the Worker-First Architecture (ADR-0001).

Existing workers remain in their current paths (`apps/`, `03_AI_Automation/`) until `migration_manifest.md` approves a controlled move. Each move requires a Worker Card.

## Worker Registry

| Worker | Category | Current Path | Target Path | Migration Phase | Status |
|---|---|---|---|---|---|
| n8n Runtime | `workflow-runtime` | `apps/n8n/` + `03_AI_Automation/n8n/` | `04_Workers/workflow-runtime/n8n/` | Phase 2 (resolve duplication first) | Do not move yet |
| local-printer-agent | `printer` | `apps/local_printer_agent/` | `04_Workers/printer/local-printer-agent/` | Phase 2 (audit ChefAlitas coupling) | Do not move yet |
| printer-proxy | `printer` | `apps/printer_proxy/` | `04_Workers/printer/printer-proxy/` | Phase 2 | Do not move yet |
| insta-manager-pro | `social` | `apps/insta-manager-pro/` | `04_Workers/social/insta-manager-pro/` | Phase 2 | Do not move yet |
| scrapling | `data` | `03_AI_Automation/scrapling/` | `04_Workers/data/scrapling/` | Phase 1 (submodule — special procedure) | Phase 1 candidate |
| hermes-agent | `ai-agents` | `03_AI_Automation/hermes-agent/` | `04_Workers/ai-agents/hermes/` | Phase 2 | Do not move yet |

## Worker Categories

| Category | Description |
|---|---|
| `workflow-runtime/` | Workflow automation engines (n8n) |
| `printer/` | Print job routing and thermal printing |
| `social/` | Social media automation |
| `data/` | Web scraping, data collection |
| `ai-agents/` | Autonomous AI agents |
| `odoo/` | ERP integration workers |
| `sync/` | Data synchronization workers |
| `notification/` | Alert and notification workers |

## Worker Contract Requirements (MANDATORY)

Every worker MUST have a Worker Card at `_Knowledge_Center/Memory/COMPONENT_CARDS/WORKER_CARD_[NAME].md` defining:

1. **Input schema** — explicit JSON schema for all inputs
2. **Output schema** — explicit JSON schema for all outputs
3. **Retry policy** — max retries, delay strategy, dead letter handling
4. **Idempotency** — whether repeated runs are safe
5. **Audit log** — what gets logged and where
6. **Consumer list** — which products/solutions use this worker

## Anti-Patterns (Prohibited)

- Client-specific logic inside a generic worker
- Workers without logs
- Workers without idempotency when mutating external state
- Workers that depend on the UI
- Workers with secrets embedded in code
- Workers that write to production without a dry-run mode
- Copying a worker for a new client instead of making it configurable

## Governance

See `_Knowledge_Center/Memory/COMPONENT_CARDS/WORKER_CARD_TEMPLATE.md` for card template.
See `_Knowledge_Center/Architecture/ADR/ADR-0001-worker-first-monorepo.md` for Worker-First principles.
See `00_Workspace_Governance/MIGRATION_PLAN.md` for migration phases.
