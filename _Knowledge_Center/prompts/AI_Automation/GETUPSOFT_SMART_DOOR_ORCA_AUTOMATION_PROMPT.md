# GetUpSoft Smart Door - ORCA automation prompt

## Purpose

Operate GetUpSoft Smart Door as a governed product under ORCA, Hermes, and gstack without bypassing Smart Door policy, tenancy, or audit controls.

## Repository context

- Canonical product docs: `02_Products/GetUpSoftSmartDoor/`
- Product card: `_Knowledge_Center/Memory/COMPONENT_CARDS/PRODUCT_CARD_GETUPSOFT_SMART_DOOR.md`
- Delivery backlog: `task-ledger/getupsoft-smartdoor-backlog.md`
- ORCA workflow contract: `task-ledger/automation/getupsoft-smartdoor-orca-workflow.md`
- API foundation: `apps/backend-nest/`
- ORCA runtime: `apps/orca/src/ai_automation_orchestrator/`

## Non-negotiable rules

1. Use official provider integrations only.
2. Do not reverse engineer or bypass proprietary Tuya protections.
3. Treat Smart Door unlock as a regulated command with RBAC, ABAC, idempotency, expiry, correlation, and audit.
4. ORCA may orchestrate and analyze, but Smart Door remains the command authority.
5. Every automation output must reference backlog, DoR, DoD, and tests.

## Approved ORCA jobs

- refine Smart Door epics and stories
- classify supported lock models and capability gaps
- generate tenant onboarding checklists
- review audit anomalies
- summarize Tuya incidents
- plan technician jobs
- identify expired QR or guest grants
- build rollout reports for dev, QA, and production readiness

## Suggested workflow sequence

```text
User or operator
-> ORCA prompt router
-> Smart Door workflow contract
-> API or reporting action
-> evidence and audit review
-> next-action output
```

## Required outputs

- objective
- backlog reference
- DoR
- DoD
- test plan
- evidence path
- risks
- rollback notes where relevant

<!-- BEGIN:shared-agent-memory-rule -->
# Multi-Agent Shared Memory & Task Ledger Protocol (GetUpSoft / Orca)

## Mandatory Multi-Agent Rules
1. **Identify Yourself**: Each agent session MUST have a unique `agent_id` (e.g., `antigravity-main`, `codex-worker-01`, `claude-dev-02`).
2. **Check Shared Memory & Ledger First**: At the start of every session, read `C:\Users\yoeli\.agents_shared_memory\ACTIVE_TASKS.md` and `TASKS_LEDGER.json` to see active agents and claimed tasks.
3. **Claim & Mark Active Tasks**: Never work on a task currently locked by another `agent_id`. Claim your `task_id` using `sync_memory.py start-task` or by writing to `TASKS_LEDGER.json`.
4. **Update Progress & Hand-Off**: Before ending a turn, hitting token limits, or context switching, update your task progress in `TASKS_LEDGER.json` and `ACTIVE_SESSION.md` so peer agents can collaborate smoothly on the same project without duplicating effort.
5. **Brand & Ecosystem Identity**: Remember GetUpSoft (mother company), Orca (automation engine), Galantes Jewelry (e-commerce client). Use Google AI Studio / Antigravity (never Vertex AI).
<!-- END:shared-agent-memory-rule -->
