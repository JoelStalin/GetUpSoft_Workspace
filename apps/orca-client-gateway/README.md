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

## QA Gates

Workflow QA manual:

- Archivo: [`.github/workflows/orca-gateway-qa.yml`](/C:/Users/yoeli/Documents/GetUpSoft_Workspace/.github/workflows/orca-gateway-qa.yml)
- Tipo: `workflow_dispatch`
- Inputs:
  - `base_url` (endpoint a validar)
  - `validate_logs` (`true|false` para validar `journalctl` remoto por SSH)

Secrets requeridos para validación de logs remotos:

- `SSH_HOST`
- `SSH_USER`
- `SSH_KEY`
- `SUDO_PASSWORD`

Evidencia QA:

- Reporte funcional: [`docs/qa/QA_REPORT.md`](/C:/Users/yoeli/Documents/GetUpSoft_Workspace/apps/orca-client-gateway/docs/qa/QA_REPORT.md)
- Evidencias JSON: [`docs/qa/evidence/`](/C:/Users/yoeli/Documents/GetUpSoft_Workspace/apps/orca-client-gateway/docs/qa/evidence)

## Ejecutar QA local/manual

```powershell
powershell -ExecutionPolicy Bypass -File apps/orca-client-gateway/scripts/qa/run-vertical-flow.ps1 `
  -BaseUrl "https://ethernet-deck-frog-holds.trycloudflare.com" `
  -OutDir "apps/orca-client-gateway/docs/qa/evidence" `
  -ValidateLogs `
  -SshHost "ubuntu@ssh.getupsoft.com.do" `
  -SystemdService "orca-client-gateway-api.service" `
  -SudoPassword "********"
```
