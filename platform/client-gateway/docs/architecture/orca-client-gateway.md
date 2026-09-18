# ORCA Client Gateway Architecture (Draft)

## Scope

Producto multi-tenant para operar agentes cliente Windows/macOS con control centralizado desde ORCA.

## Core components

1. Control Plane API (NestJS)
2. Admin CLI (Node/TypeScript)
3. Client Agent (Java)
4. Tunnel Provider abstraction
5. Portable Runtime abstraction

## MVP vertical slice

`tenant -> pairing -> enroll -> heartbeat -> command -> poll -> result -> audit -> revoke`

## Current implementation status

- Monorepo scaffold created.
- API base bootstrapped from existing NestJS service.
- CLI bootstrap created.
- Java agent skeleton created.
- Pending: Prisma model set + modules/auth/rbac + full e2e.
