# ADR-0001: Worker-First Monorepo Architecture

**Date:** 2026-05-31
**Status:** Accepted
**Authors:** Joel Stalin Martinez Espinal, Architecture Team

---

## Context

The GetUpSoft workspace has grown organically to include products (ORCA, EasyCount), client solutions (GalantesJewelry, ChefAlitas), ERP customizations (Odoo v15-v19), and automation tooling (n8n, printer agents, social workers). Without an explicit architectural pattern, this growth has produced:

- Duplicated logic across products and client solutions
- Workers embedded inside client-specific code
- No explicit contracts for reusable components
- Difficulty determining what can be reused vs what is client-specific

A decision was needed on whether to organize the monorepo by technology (frontend/backend), by client, or by architectural pattern.

---

## Decision

The GetUpSoft workspace adopts the **Worker-First Monorepo** pattern as its primary architectural style, combined with **Hexagonal/Clean Architecture** per domain.

This means:

1. **Workers are first-class citizens.** Any logic that could be consumed by more than one product or client solution MUST be extracted into an autonomous `Worker` with an explicit contract (defined input, output, retry policy, audit log).

2. **Workers live in `04_Workers/`**, organized by type: `printer/`, `social/`, `data/`, `workflow-runtime/`, `ai-agents/`.

3. **Products (`02_Products/`) consume workers** via their contracts. Products MUST NOT contain worker logic internally.

4. **Client Solutions (`03_Client_Solutions/`) also consume workers** and may configure them for client-specific needs, but MUST NOT copy or duplicate worker logic.

5. **Hexagonal Architecture within each domain.** Each product/solution domain has:
   - A domain core (business rules, entities)
   - Ports (input/output interfaces)
   - Adapters (implementations for specific technologies)

6. **Supported patterns:** Worker Pattern, Adapter Pattern, Strategy Pattern, Command Pattern, Queue Consumer, Scheduler, Idempotency Key, Retry with Backoff, Dead Letter Queue, Repository Pattern, Policy Gate, Circuit Breaker, Outbox, Saga.

7. **Anti-patterns are prohibited** (see `_Knowledge_Center/Architecture/WORKER_FIRST_ARCHITECTURE.md` §5).

---

## Consequences

### Positive
- Reusable workers reduce duplication across products and client solutions
- Explicit contracts enable independent testing and deployment of workers
- Hexagonal architecture enables technology swaps without business logic changes
- Worker isolation supports the FastAPI-to-NestJS migration without breaking consumers
- New client solutions can be built faster by composing existing workers

### Negative
- Initial overhead to extract workers from existing embedded code
- Requires discipline to maintain contract boundaries (especially for AI agents)
- Agents must be explicitly trained on worker contracts before making code changes
- Refactoring existing code to fit the pattern takes sprint time

### Neutral
- Workers may need versioning if their contracts evolve (v1, v2)
- Worker contracts must be documented in `_Knowledge_Center/Memory/COMPONENT_CARDS/`

---

## ISO Reference

- **ISO/IEC/IEEE 42010:2011 §4.6** — Architecture Decisions must be recorded with rationale
- **ISO/IEC 25010:2023 §4.8** — Maintainability: Modularity, Reusability, Modifiability
- **ISO/IEC 12207:2017 §6.8.4** — Architectural Design Process

---

## Related Decisions

- ADR-0002: Domain-Based Repository Layout (how workers are organized)
- ADR-0003: EasyCount Canonical Product (applies worker principle to EasyCount)
- ADR-0004: Odoo Controlled Migration (exception: ERP is not worker-based)

---

*GetUpSoft Architecture Decision Record*
