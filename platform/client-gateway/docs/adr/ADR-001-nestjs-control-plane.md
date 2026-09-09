# ADR-001 — NestJS as ORCA Control Plane

## Context

Se requiere migrar y consolidar backend HTTP de ORCA en un stack TypeScript multi-tenant con contratos claros y seguridad.

## Decision

Usar NestJS como plataforma de Control Plane para ORCA Client Gateway.

## Consequences

- Ventajas:
  - DI modular para dominios (`auth`, `tenants`, `devices`, `commands`, `audit`).
  - Integración nativa con validación, guards y swagger.
  - Reutilización de base existente `apps/backend-nest`.
- Costos:
  - Trabajo de adaptación de módulos heredados.
  - Reescritura incremental de contratos orientados a agent API.

## Alternatives considered

- FastAPI (rechazada para este producto por estrategia de unificación TS/NestJS).
- Express puro (rechazada por menor estandarización arquitectónica).
