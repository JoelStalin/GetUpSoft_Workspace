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
  - `validate_logs` (`true|false` para validar `journalctl` en runner self-hosted)
  - `remote_runner_label` (label del runner self-hosted para log gate, por defecto `getupsoft-lan`)
  - `run_sandbox_link_test` (`true|false` para ejecutar prueba ORCA producción -> cliente -> sandbox)
  - `run_macos_client_test` (`true|false` para ejecutar prueba del cliente en runner macOS)
  - `internal_base_url` (URL interna usada por `sandbox-link-test` en self-hosted, por defecto `http://localhost:8915`)

Secrets requeridos para validación de logs:

- `SUDO_PASSWORD`

Prerequisito para log gate:

- Runner self-hosted Linux activo con labels:
  - `self-hosted`
  - `getupsoft-lan` (o el label que uses en `remote_runner_label`)

Referencia operativa:

- [`docs/operations/self-hosted-runner.md`](/C:/Users/yoeli/Documents/GetUpSoft_Workspace/apps/orca-client-gateway/docs/operations/self-hosted-runner.md)

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
