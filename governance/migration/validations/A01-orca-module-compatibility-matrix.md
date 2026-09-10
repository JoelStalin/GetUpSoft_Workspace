# A01: Matriz de compatibilidad — modulos ORCA y contratos legacy

**Fecha:** 2026-09-09
**Metodo:** inspeccion real del codigo (no supuestos) tras recuperar la fuente del Gateway
en G02.

## Hallazgo principal

ORCA no es un solo backend: coexisten **tres capas reales**, cada una en un lenguaje/stack
distinto, ya con un puente parcial construido entre dos de ellas.

| Capa | Ubicacion real | Stack | Estado |
|---|---|---|---|
| Legado archivado | `legacy/python-fastapi/orca-service` | Python FastAPI | Archivado explicitamente (ya fuera de uso segun su propia ubicacion) |
| Orquestador activo | `apps/orca/src/ai_automation_orchestrator` | Python (CLI, no HTTP — consistente con `fastapi_deprecation_policy.md`: FastAPI HTTP descontinuado, CLI/tooling Python sigue activo) | Activo, invocado por CLI |
| Runtime CareerAI | `apps/orca/src/careerai/*.mjs` + `scripts/start_orca_local.mjs` | Node.js ESM | Activo, es el que se trabajo durante toda la sesion de CareerAI (98 nodos, regresion en verde) |
| Gateway de control | `platform/client-gateway/apps/api/src/modules/orca/` | NestJS + TypeScript | Recuperado en G02, ya tenia el puente construido (ver abajo) |

## El puente ya existe (parcialmente)

`platform/client-gateway/apps/api/src/modules/orca/orca.service.ts`:

```ts
const bridgeMode = (this.config.get('ORCA_BRIDGE_MODE') ?? 'mock').toLowerCase();
if (bridgeMode !== 'python') return this.mockInterpretation(request);
// ...
const python = this.config.get('PYTHON_BIN') ?? 'python';
return this.runOrcaCli(command, request.content); // execFile, no HTTP directo
```

Es decir: el modulo NestJS `orca` **ya esta disenado** para hablar con el orquestador
Python via CLI (`execFile`, nunca HTTP directo a un servidor FastAPI vivo — coherente con
la politica de deprecacion de FastAPI ya vigente en este workspace), con un modo `mock`
para desarrollo sin depender de Python. Lo que falta no es "construir el puente" — ya
existe — sino **verificar que sigue funcionando** contra el orquestador Python real y
**extender el mismo patron** al runtime Node.js de CareerAI, que hoy NO esta conectado a
este gateway en absoluto (corre standalone via `scripts/start_orca_local.mjs`, puerto
4173, sin relacion con el gateway NestJS puerto propio).

## Modulos del gateway ya construidos (inventario real, no plan)

`platform/client-gateway/apps/api/src/modules/`:

| Modulo | Proposito real (segun el codigo) |
|---|---|
| `auth` | Login/autenticacion propia del gateway |
| `orca` | Puente hacia el orquestador Python (arriba) |
| `gateway` | Registro/estado de dispositivos gateway (`gateway.store.ts`) |
| `workers` | Envio de tareas a workers |
| `workspace` | Operaciones sobre el workspace del cliente |
| `ai-automation` | Deploy, n8n (import/export de workflows), providers, orchestrator, web-ui |
| `easycount` | 9 controllers: cliente, admin, auth, dgii, enfc, extended, internal, legacy, receptor — **relevante directo para la integracion EasyCount+Stripe+Odoo19 pendiente**, gran parte del trabajo de conectar EasyCount ya esta hecho aqui |
| `health` | Liveness/readiness |

## Contratos NO relacionados con ORCA (para no confundir en R01/R02)

`integration-contracts/` (`publication-flow.v1.md`, `shop-product.v1.ts`) es el contrato
de publicacion de productos Odoo -> tienda de **Galantes Jewelry**, sin relacion con ORCA.
El diseno original lo mapea a `governance/contracts/` — se mantiene esa clasificacion, pero
queda documentado aqui para que una futura reconciliacion no lo trate como parte de A01.

## Build reproducible: NO verificado en esta pasada

`platform/client-gateway/` no tiene `node_modules` instalado (`pnpm install` no se corrio
— instalar un monorepo pnpm/turbo completo con 4 apps + Prisma toma varios minutos y
depende de red; se deja como siguiente paso explicito, no se fuerza dentro de esta tarea
para no bloquear el resto del wave). El AC de A01 "build reproducible" queda
**parcialmente cumplido**: la matriz de compatibilidad es real y completa; el build
en si es la siguiente accion pendiente, documentada aqui en vez de asumida.

## Conclusion para las tareas siguientes (A02, M01)

- A02 (separar controllers/casos de uso/adapters) debe trabajar SOBRE
  `platform/client-gateway/apps/api/src/modules/orca/` — ya es NestJS, ya tiene la forma
  correcta para aplicar la regla de capas (presentation/application/domain/infrastructure).
- El runtime CareerAI (`apps/orca/src/careerai/`) es Node.js puro, no NestJS — decidir si
  se expone como otro modulo del mismo gateway (via un adapter similar al de `orca.service.ts`)
  o si queda como servicio HTTP separado (como esta hoy, puerto 4173) es una decision de
  arquitectura que no se debe tomar dentro de A01 sin confirmacion — se deja explicita
  para B04/R02.
