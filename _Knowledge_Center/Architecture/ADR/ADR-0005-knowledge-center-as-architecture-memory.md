# ADR-0005: Knowledge Center as the Persistent Architecture Memory

**Date:** 2026-05-31
**Status:** Accepted
**Authors:** Joel Stalin Martinez Espinal, Architecture Team

---

## Context

The GetUpSoft workspace is operated by a mix of human developers and AI agents (Claude Code, Codex, Gemini CLI, ORCA, Copilot, AutoGen, NemoClaw, Rowboat, Hermes). Between sessions, AI agents lose working memory. This has produced:

- Repeated architectural mistakes across sessions
- Re-inventing decisions that were already made
- Inconsistent naming conventions across documents
- Agents that don't know about the FastAPI deprecation, EasyCount canonical name, or Odoo migration policy
- Multiple "memory files" scattered across the repository root

Additionally, the workspace has:
- A `_Knowledge_Center/` directory (established early with architecture docs)
- A `Knowledge_Center/` directory (duplicate without underscore prefix)
- Agent memory in `.agents/memory/`
- Claude memory in `.claude/projects/.../memory/`
- Session summaries scattered at root level

A unified, canonical memory system was needed.

---

## Decision

`_Knowledge_Center/` (with underscore prefix) is the **single canonical architecture memory** for the GetUpSoft workspace.

### Structure

```
_Knowledge_Center/
├── Architecture/
│   ├── ARCHITECTURE_OVERVIEW.md       — C4 diagrams, domain views
│   ├── WORKER_FIRST_ARCHITECTURE.md   — Worker pattern reference
│   ├── ADR/                           — Architecture Decision Records
│   │   ├── ADR-0001-worker-first-monorepo.md
│   │   ├── ADR-0002-domain-based-repository-layout.md
│   │   ├── ADR-0003-easycount-canonical-product.md
│   │   ├── ADR-0004-odoo-controlled-migration.md
│   │   └── ADR-0005-knowledge-center-as-architecture-memory.md
├── Memory/
│   ├── REPOSITORY_MEMORY.md           — What each domain means, key decisions
│   ├── AGENT_RULES.md                 — Rules for all AI agents
│   ├── COMPONENT_CARDS/               — Per-component documentation cards
│   │   ├── PRODUCT_CARD_TEMPLATE.md
│   │   ├── CLIENT_SOLUTION_CARD_TEMPLATE.md
│   │   ├── WORKER_CARD_TEMPLATE.md
│   │   ├── ODOO_MODULE_CARD_TEMPLATE.md
│   │   └── INFRA_COMPONENT_CARD_TEMPLATE.md
├── Agents_Skills/                     — Agent skill definitions
├── Backlogs/                          — Product and sprint backlogs
├── Long_Term_Memory/                  — Per-project historical context
├── Master_Prompts/                    — Prompt engineering library
├── Orca_Workflows/                    — ORCA workflow definitions
└── KNOWLEDGE_PROTOCOL.md             — Original protocol (keep for compatibility)
```

### Rules

1. **AI agents MUST read** `_Knowledge_Center/Memory/AGENT_RULES.md` before modifying any domain directory.

2. **Architectural decisions MUST be recorded** as ADRs in `_Knowledge_Center/Architecture/ADR/`. No decision is "decided" until it has an ADR.

3. **Component state is tracked** in `_Knowledge_Center/Memory/COMPONENT_CARDS/`. Every production-ready product, worker, or client solution gets a card.

4. **The duplicate `Knowledge_Center/` directory** (without underscore) is treated as legacy. New content goes to `_Knowledge_Center/` only.

5. **Session summaries at root** (`SESSION_*.md`) are valid as historical records but MUST NOT be the source of truth for architectural decisions. Decisions must be promoted to ADRs.

6. **Agent session memory** (`.agents/memory/`, `.claude/projects/.../memory/`) is session-scoped cache. Architecture-level decisions must be promoted to `_Knowledge_Center/` to persist across sessions.

7. **This directory is never moved.** Its presence at root level ensures all agents can locate it without knowing the domain layout.

---

## Consequences

### Positive
- AI agents have a single, reliable place to read architectural rules
- New agents joining the workspace find all context in one directory
- ADRs provide rationale — agents won't re-open decided questions
- Component cards provide structured, scannable component state
- Eliminates fragmentation of architecture knowledge across root-level MD files

### Negative
- Agents must be explicitly instructed to read `_Knowledge_Center/Memory/AGENT_RULES.md` — there is no technical enforcement
- Session summary files at root will still be created by agents (by habit) — this is acceptable as historical log
- Maintaining ADRs requires discipline — decisions made in chat that are not promoted to ADRs will be lost

### Neutral
- The `KNOWLEDGE_PROTOCOL.md` original document remains for backward compatibility
- `.claude/projects/.../memory/` remains valid for Claude-session-scoped context
- `task-ledger/` remains for sprint and backlog tracking (separate concern from architecture memory)

---

## ISO Reference

- **ISO/IEC/IEEE 42010:2011 §4.6** — Architecture Decisions must be recorded
- **ISO/IEC/IEEE 42010:2011 §4.7** — Rationale must be captured
- **ISO/IEC 12207:2017 §7.2.2** — Configuration Management (architecture as configuration)
- **ISO/IEC 12207:2017 §7.2.3** — Quality Management (architecture review)

---

## Related Decisions

- ADR-0001: Worker-First Monorepo
- ADR-0002: Domain-Based Repository Layout
- ADR-0003: EasyCount Canonical Product
- ADR-0004: Odoo Controlled Migration

---

*GetUpSoft Architecture Decision Record*
