# GetUpSoft Smart Door - ORCA Workflow Contract

## Purpose

Enable ORCA to automate Smart Door operational workflows without bypassing Smart Door authorization, audit, or policy controls.

## Allowed ORCA intents

- architecture review
- backlog refinement
- supported-device qualification
- tenant onboarding checklist
- technician dispatch planning
- low-battery sweep
- offline device sweep
- QR grant expiry cleanup
- guest access expiry cleanup
- audit timeline generation
- Tuya outage triage

## Forbidden ORCA behavior

- Direct lock unlock without authenticated Smart Door API flow
- Bypass of RBAC, ABAC, audit, idempotency, or expiry checks
- Reading or exposing provider secrets
- Any illegal reverse engineering workflow

## Workflow nodes

1. Prompt classify
2. Tenant scope validate
3. Feature entitlement validate
4. Smart Door API query or command
5. Audit evidence capture
6. Notification or report dispatch

## Inputs

- tenant_id
- user_id or service identity
- workflow_intent
- target doors or properties
- time window
- evidence_required boolean

## Outputs

- workflow_status
- audit_correlation_id
- generated_report_path
- next_actions

## Evidence rules

- Every automation run must emit correlation-aware evidence.
- Every command path must preserve the Smart Door audit trail.
- ORCA may recommend an unlock, but Smart Door must enforce the final command policy.
