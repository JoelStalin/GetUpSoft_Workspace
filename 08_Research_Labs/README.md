# 08_Research_Labs — GetUpSoft Workspace

**Domain:** Research Labs
**ISO Reference:** ISO/IEC 12207:2017 §6.2.2 · ISO/IEC/IEEE 42010:2011 §4.4

This directory contains experimental projects, proof-of-concepts, and research initiatives that are not yet in production. Code here has no guaranteed stability or API contract.

## Rules

- Research code MUST NOT be imported by production systems
- If a research project graduates to production, create an ADR and move it to `02_Products/` or `04_Workers/`
- Each project should have a README with its research question and current status
- No client-specific logic in research projects

## Contents

| Directory | Research Topic | Status |
|---|---|---|
| `rowboat/` | Multi-agent framework exploration | Experimental |
| `notebooklm-py/` | NotebookLM Python automation | Experimental |
| `research-ai/` | AI research tooling | Experimental |
| `ida-pro-mcp/` | IDA Pro MCP security tooling | Experimental |

## Governance

See `00_Workspace_Governance/MIGRATION_PLAN.md` Phase 1 for migration details.
See `_Knowledge_Center/Architecture/ADR/ADR-0001-worker-first-monorepo.md` for graduation criteria.
