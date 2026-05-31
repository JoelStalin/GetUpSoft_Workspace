# GSTACK + ORCA Multi-Agent Adapter

## Objective
Standardize how Gemini, Claude, Codex, and Copilot use GSTACK with this repository and ORCA, so clients can run multi-model workflows with one operating policy.

## Scope
- Workspace-level agent behavior
- ORCA model routing conventions
- Client-facing multi-model operation (single base in ORCA, multiple model providers)

## Backlog, DoR, DoD, and Tests
- Backlog item: Multi-agent GSTACK adoption for ORCA projects
- DoR:
  - GSTACK credentials available
  - ORCA base provider configured
  - At least one fallback provider configured
  - Agent rule files updated to reference this guide
- DoD:
  - Gemini, Claude, Codex, and Copilot rules point to this guide
  - Shared routing contract is documented and reused
  - Smoke checks executed and documented
  - Risks and technical debt explicitly listed
- Minimum tests:
  - Env validation for required GSTACK and ORCA variables
  - Provider routing decision check
  - Fallback route check when primary model is unavailable

## Required Environment Contract
Use the same environment contract for all agents:

Reference template: `apps/orca/env.gstack.example`
Local secret setup: `docs/GSTACK_SECRET_SETUP.md`

- GSTACK_BASE_URL
- GSTACK_API_KEY
- GSTACK_DEFAULT_MODEL
- GSTACK_FALLBACK_MODELS
- ORCA_DEFAULT_PROVIDER
- ORCA_DEFAULT_MODEL
- ORCA_ENABLE_MULTI_MODEL=true

Example:

```bash
export GSTACK_BASE_URL="https://api.gstack.ai"
export GSTACK_API_KEY="replace-me"
export GSTACK_DEFAULT_MODEL="gemini-2.5-pro"
export GSTACK_FALLBACK_MODELS="claude-sonnet-4,gpt-5-mini"
export ORCA_DEFAULT_PROVIDER="gstack"
export ORCA_DEFAULT_MODEL="gemini-2.5-pro"
export ORCA_ENABLE_MULTI_MODEL="true"
```

## Shared Routing Contract
All agents should use this routing contract when they prepare prompts or workflows:

```json
{
  "task_type": "analysis|coding|planning|review",
  "primary_model": "gemini-2.5-pro",
  "fallback_models": ["claude-sonnet-4", "gpt-5-mini"],
  "safety_mode": "strict",
  "workspace": "GetUpSoft_Workspace",
  "orchestrator": "ORCA"
}
```

## Agent-Specific Alignment

### Gemini
- Use GSTACK as first provider when ORCA multi-model is enabled.
- Keep ORCA as orchestration base and source of truth for task state.
- If Gemini route fails, delegate to fallback list from this guide.

### Claude
- Use the same GSTACK contract and fallback order.
- Keep existing workspace safety and QA mandates intact.
- Do not bypass ORCA task governance.

### Codex
- Follow this guide before selecting model for implementation tasks.
- Keep changes small and verifiable.
- Prefer the workspace bootstrap policy and shared skills.

### Copilot
- Reuse this same contract from copilot instructions.
- Require backlog/DoR/DoD/test references in outputs.
- Route through ORCA + GSTACK when multi-model is needed.

## ORCA Integration Notes
- ORCA remains the base orchestrator and policy layer.
- GSTACK is the model-routing abstraction.
- Client flows can switch models per task without changing business workflow definitions.

## Smoke Check
Run:

```bash
bash scripts/gstack_orca_smoke.sh
```

For local credential loading + validation:

```bash
bash scripts/gstack_orca_load_env.sh
```

Expected result:
- PASS when required variables exist and multi-model is enabled.
- FAIL with explicit missing variable names.

## Risks and Technical Debt
- Risk: Different agent prompts may drift from this standard.
- Risk: Missing fallback models can cause downtime on provider outages.
- Debt: Add automated CI validation for the routing contract JSON schema.
- Debt: Add real GSTACK connectivity tests once credentials are available in secure CI secrets.
