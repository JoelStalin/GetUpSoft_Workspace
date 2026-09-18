# GetUpSoft + EasyCount Transformation Roadmap

Created: 2026-05-09

This roadmap converts the GetUpSoft + EasyCount strategy into an executable backlog. The canonical task records live in `task-ledger/tasks.json` under phase `GUS_EASYCNT`.

## Execution Rules

- Start with `GUS-001`, `GUS-004`, `GUS-007`, `GUS-012`, `GUS-027`, and `GUS-028`.
- Each task must move through the ledger with evidence before being marked completed.
- Use the task-level `skills` field before implementation or research.
- Keep production Galantes Jewelry work separate unless a task explicitly touches this repository.
- Do not hardcode secrets, domains, callbacks, or credentials.

## Initial Sprint

| ID | Outcome | Skills |
| --- | --- | --- |
| GUS-001 | ADR-001 for repository strategy | `senior-architect`, `pm-skills` |
| GUS-004 | ADR-003 for `.com` / `.com.do` domain strategy | `senior-architect`, `ai-seo` |
| GUS-007 | Inventory of legacy branding and hardcodes | `senior-fullstack`, `brand-guidelines` |
| GUS-012 | ADR-002 for Odoo integration pattern | `senior-architect`, `odoo-json2-sync`, `api-design-reviewer` |
| GUS-027 | 90-day execution roadmap | `senior-pm`, `scrum-master` |
| GUS-028 | Phase Go/No-Go checklist | `senior-pm`, `release-manager` |

## Backlog Summary

| Epic | Focus | Task IDs |
| --- | --- | --- |
| Governance | Repo structure, ownership, operating model | GUS-001 - GUS-003 |
| Headless Odoo | API integration, contract, resilience | GUS-012 - GUS-014 |
| Domains | `.com`, `.com.do`, EasyCount DNS/TLS | GUS-004 - GUS-006 |
| Brand | Corporate and product identity | GUS-019 - GUS-022 |
| Repo cleanup | Branding, env vars, CORS, docs | GUS-007 - GUS-011 |
| Environments | Naming, data isolation, secrets, CI/CD | GUS-015 - GUS-018 |
| Quality | Security, observability, E2E, SLO/SLA | GUS-023 - GUS-026 |
| 90-day plan | Roadmap, gates, rollback | GUS-027 - GUS-029 |
| Benchmark | External validation and final blueprint | GUS-030 - GUS-031 |

## Definition of Done

- Ledger task has status `completed`.
- Evidence is attached in `task-ledger/tasks.json`.
- Any ADR, OpenAPI contract, checklist, or runbook exists in `docs/`.
- Tests or validation commands are recorded when the task changes code, infrastructure, deployment, or runtime configuration.
- Memory/current files are updated when the decision changes active operating context.
