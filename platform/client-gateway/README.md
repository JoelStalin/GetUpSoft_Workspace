# ORCA Client Gateway

Monorepo del producto ORCA Client Gateway.

## Estructura

- `apps/api`: NestJS control plane API.
- `apps/cli`: Admin CLI.
- `packages/*`: contratos y utilidades compartidas.
- `prisma`: schema y migraciones.
- `client-agent/java`: agent Windows/macOS.

## Comandos

```bash
pnpm install
pnpm build
pnpm test
```

## Ejecutar API con Prisma

Prerequisito: PostgreSQL accesible en `DATABASE_URL`.

```bash
cd apps/api
npm run prisma:generate
npm run prisma:push
set GATEWAY_STORE_MODE=prisma
npm run start:dev
```

## Estado actual

- Backlog Scrum creado.
- Scaffold base del monorepo creado.
- API inicial copiada desde `apps/backend-nest` como base de migración.
- CLI inicial con comando `health` listo.

## Siguiente hito

Implementar vertical slice MVP:

`tenant -> pairing -> enroll -> heartbeat -> command -> poll -> result -> audit -> revoke`.
