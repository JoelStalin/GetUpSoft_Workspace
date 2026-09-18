# Codex Workspace Rules

Use the same workspace policy as AGENTS.md and align model usage with docs/GSTACK_ORCA_MULTIAGENT_ADAPTER.md.

## Required Sequence
1. Run .\\scripts\\agent_start.ps1 when available.
2. If needed, run .\\scripts\\workspace_bootstrap.ps1.
3. Read task-ledger\\skill-recommendations.md.
4. Normalize request with .\\scripts\\caveman_route.ps1.
5. Use the most specific shared skill from .agents\\skills.

## GSTACK + ORCA Policy
- Use ORCA as orchestration base.
- Use GSTACK as model router for multi-model tasks.
- Respect shared routing contract in docs/GSTACK_ORCA_MULTIAGENT_ADAPTER.md.
- Keep fallback models configured for client continuity.

## Mandatory Delivery Rules
- Reference backlog, DoR, DoD, and tests for each task.
- Prefer small, verifiable changes.
- If a command fails, document diagnosis, probable cause, and validation path.
