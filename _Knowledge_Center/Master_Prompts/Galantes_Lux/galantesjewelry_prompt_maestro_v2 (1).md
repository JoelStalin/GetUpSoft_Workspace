# Prompt maestro milimétrico v2 — Galante's Jewelry

## Propósito
Este documento define **cómo ejecutar el proyecto de integración entre Odoo y la web actual de Galante's Jewelry** de la forma más rápida, barata, controlada y retomable posible.

Está diseñado para que:
- un agente orquestador coordine el trabajo,
- varios agentes especializados trabajen en paralelo sin pisarse,
- el proyecto pueda **reanudar exactamente** donde quedó si se agotan créditos, cambia el modelo o se interrumpe la sesión,
- se use Odoo como backend comercial real sin reescribir la web actual desde cero.

---

## 0. Modo de uso
Usa este documento de una de estas formas:

1. Como **prompt maestro** para un agente orquestador.
2. Como fuente de prompts para **agentes paralelos especializados**.
3. Como contrato operativo y documento de continuidad del proyecto.

### Regla de entrada obligatoria
Antes de hacer cualquier propuesta o cambio, el agente debe leer, si existen:
- `docs/agent-state.md`
- `docs/handoff.md`
- `docs/timeline.md`
- `docs/implementation-log.md`
- `docs/shop-integration-plan.md`
- `docs/decision-log.md`
- `docs/open-questions.md`

### Regla de reanudación
Si esos archivos ya existen, **no replantees el proyecto desde cero**.
Primero resume:
- último task completado,
- task actual,
- siguiente task,
- bloqueos,
- decisiones vigentes que no deben revertirse.

---

## 1. Contexto real del proyecto actual
Debes asumir y verificar en el repositorio actual de `Galantesjewelry` lo siguiente:

### 1.1 Stack actual esperado
- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- autenticación con JWT usando `jose`
- procesamiento de imágenes con `sharp`
- CMS persistido en archivos:
  - `data/cms.json`
  - `data/blobs`
- Docker
- Nginx
- Cloudflare Tunnel opcional
- panel admin autenticado ya existente
- scripts de validación ya existentes:
  - lint
  - Vitest
  - Playwright
  - Selenium/Pytest

### 1.2 Restricción estructural
La web actual **no debe reescribirse desde cero**.
Debe evolucionarse preservando lo que ya funciona.

### 1.3 Diagnóstico base esperado
La web actual es válida para:
- branding,
- contenido,
- catálogo visual,
- marketing,
- páginas editoriales,
- administración ligera de contenido.

No debe seguir siendo la base principal para:
- stock transaccional,
- checkout complejo,
- pedidos reales,
- catálogo maestro comercial,
- sincronización multicanal.

---

## 2. Objetivo de negocio
Cliente: **Galante's Jewelry**, Islamorada, Florida.

### 2.1 Meta principal
Permitir compras reales por la web con la ruta **más rápida, más barata y más mantenible**.

### 2.2 Restricción estratégica
Aprovechar experiencia previa del owner con Odoo.

### 2.3 Arquitectura objetivo de negocio
- `galantesjewelry.com` → sitio principal actual
- `shop.galantesjewelry.com` → tienda pública / storefront comercial
- `odoo.galantesjewelry.com` → backend Odoo, admin, inventario, pedidos, catálogo maestro, operación comercial

### 2.4 Meta multicanal
Cuando un producto se publique desde la fuente de verdad definida, debe habilitar el flujo correcto para:
- web,
- Facebook,
- Instagram,
- WhatsApp Business.

### 2.5 Regla de honestidad técnica
No inventes capacidades no soportadas oficialmente.
Si un canal no soporta “post orgánico de producto” equivalente, usa el flujo correcto documentado por esa plataforma.

---

## 3. Rutas locales de referencia Odoo
Estas rutas deben usarse **solo como referencia funcional, estructural y de patrones**:

- `C:\Users\yoeli\Documents\cell_odoo`
- `C:\Users\yoeli\Documents\jabiya_test\jabiyaprod`

### 3.1 Uso permitido
Puedes analizarlas para extraer:
- estructura de addons,
- naming conventions,
- patrones de website sale,
- modelos extendidos,
- flujos de publicación,
- organización por módulos,
- patrones de integración entre website, sale, stock y catálogo.

### 3.2 Uso prohibido
- No copies código enterprise verbatim en un repo público.
- No pegues módulos enterprise completos.
- No dupliques assets o implementaciones licenciadas sin adaptación.

### 3.3 Regla de acceso
Si el agente no tiene acceso real a esas rutas locales, debe:
1. declararlo explícitamente,
2. pedir árbol de carpetas, resúmenes o fragmentos necesarios,
3. continuar con la mejor aproximación posible sin fingir que vio esos archivos.

### 3.4 Resultado esperado
Crear un **proyecto Odoo propio para Galante's Jewelry**, inspirado en esas referencias, pero adaptado al negocio y mantenible.

---

## 4. Decisión arquitectónica objetivo

### 4.1 Fuente de verdad
**Odoo será la fuente de verdad para:**
- productos,
- precios,
- stock,
- disponibilidad,
- clientes,
- pedidos,
- catálogo comercial.

### 4.2 Rol de la web actual
La web actual Next.js debe quedar como:
- sitio principal,
- branding,
- SEO,
- contenido editorial,
- marketing,
- páginas institucionales,
- puente o landing hacia la tienda.

### 4.3 Checkout
No construyas un checkout complejo custom en Next.js salvo que el agente documente por qué es indispensable.

### 4.4 Preferencia de MVP
Orden de preferencia:
1. Odoo Website / eCommerce nativo en `shop.galantesjewelry.com`
2. Redirección desde Next.js al flujo público de compra alojado en Odoo
3. Integración más profunda de catálogo en Next.js solo como fase posterior

### 4.5 Conclusión operativa
El MVP ideal debe:
- dejar la web actual intacta en lo esencial,
- lanzar la tienda en subdominio propio,
- resolver catálogo, stock, pedidos y compra en Odoo,
- permitir evolución futura sin rehacer trabajo.

---

## 5. Principios de ejecución

### 5.1 Principio de costo
El proyecto debe minimizar:
- retrabajo,
- dependencias nuevas,
- duplicidad de lógica,
- tiempo de implementación,
- superficies de mantenimiento.

### 5.2 Principio de separación
Cada agente trabaja en un scope delimitado con archivos permitidos y prohibidos.

### 5.3 Principio de contratos
Ningún workstream dependiente debe inventar contratos.
- Frontend no inventa contrato de producto sin Odoo.
- Meta no inventa modelo de publicación sin Odoo.
- DevOps no mueve arquitectura comercial sin decisión del orquestador.

### 5.4 Principio de trazabilidad
Toda decisión importante debe quedar escrita.

### 5.5 Principio de parada segura
Antes de detenerse, el agente debe dejar el proyecto retomable por otro agente.

---

## 6. Non-goals explícitos
Para evitar desvíos, estos NO son objetivos del MVP:
- rehacer toda la web actual,
- crear checkout custom completo en Next.js,
- migrar todo el contenido del sitio actual a Odoo,
- reconstruir ERP completo beyond lo necesario para el MVP,
- implementar automatizaciones avanzadas de marketing no esenciales,
- introducir microservicios innecesarios,
- crear un marketplace multi-vendor,
- resolver omnicanal avanzado beyond catálogo/publicación base.

---

## 7. Workstreams paralelos

# 7.1 Workstream A — Arquitectura y estado
### Objetivo
Coordinar, secuenciar, documentar y dejar el proyecto retomable.

### Responsabilidades
- auditar el repo,
- definir arquitectura objetivo,
- definir timeline,
- registrar decisiones,
- registrar blockers,
- preparar handoff,
- mantener estado global.

### Archivos permitidos
- `docs/agent-state.md`
- `docs/timeline.md`
- `docs/shop-integration-plan.md`
- `docs/handoff.md`
- `docs/implementation-log.md`
- `docs/verification-report.md`
- `docs/decision-log.md`
- `docs/open-questions.md`

### Archivos prohibidos
- `app/*`
- `components/*`
- `lib/*`
- `infra/*`
- `odoo/*`

### Entregables mínimos
- mapa de arquitectura actual,
- arquitectura objetivo,
- matriz reuse-vs-replace,
- timeline por sprint,
- plan de workstreams,
- riesgos,
- siguiente tarea exacta por agente.

---

# 7.2 Workstream B — Odoo backend
### Objetivo
Crear el proyecto Odoo adaptado a Galante’s Jewelry.

### Responsabilidades
- base del proyecto Odoo,
- custom addons,
- modelo de producto orientado a joyería,
- publicación web,
- precio,
- disponibilidad,
- stock,
- URL pública,
- contrato de integración consumible por otros workstreams.

### Archivos permitidos
- `odoo/*`
- `odoo/custom_addons/*`
- `odoo/docker/*`
- `integration-contracts/*`
- `docs/*` solo para estado y documentación relacionada

### Archivos prohibidos
- `app/shop/*`
- `components/shop/*`
- `lib/integrations/*`
- `infra/*`

### Entregables mínimos
- estructura base Odoo,
- addons custom,
- README de instalación,
- contrato de producto,
- contrato de compra/URLs,
- env vars requeridas,
- notas de integración.

---

# 7.3 Workstream C — Frontend Next.js
### Objetivo
Integrar una experiencia de tienda o puente comercial sin romper la web actual.

### Responsabilidades
- crear o adaptar `shop`,
- usar datos de Odoo cuando exista contrato,
- conservar branding,
- evitar checkout custom complejo,
- respetar el CMS actual como sistema editorial, no comercial.

### Archivos permitidos
- `app/shop/*`
- `components/shop/*`
- `lib/odoo/*`
- `lib/shop/*`
- `docs/*` solo para notas relacionadas al workstream

### Archivos prohibidos
- `odoo/*`
- `infra/*`
- `lib/integrations/*`

### Entregables mínimos
- páginas `/shop` y/o rutas puente según decisión del MVP,
- estados loading/error/empty,
- contrato de consumo bien tipado,
- CTA real hacia compra.

---

# 7.4 Workstream D — Meta / Facebook / Instagram / WhatsApp
### Objetivo
Implementar una base multicanal realista y documentada.

### Responsabilidades
- catálogo Meta,
- Facebook Shop / Instagram Shopping si aplica,
- WhatsApp Business catálogo si aplica,
- publicación orgánica opcional en Facebook/Instagram si es soportada,
- documentación exacta de límites y prerequisitos.

### Archivos permitidos
- `lib/integrations/*`
- `app/api/integrations/*`
- `docs/meta-*`
- `docs/*` solo para estado y documentación de este workstream

### Archivos prohibidos
- `odoo/*`
- `app/shop/*`
- `infra/*`

### Entregables mínimos
- arquitectura de sync,
- endpoints o jobs de sync,
- variables de entorno,
- matriz de capacidades por canal,
- pasos de configuración.

---

# 7.5 Workstream E — DevOps / dominios / proxy / despliegue
### Objetivo
Preparar infraestructura para web actual, tienda y backend Odoo.

### Responsabilidades
- reverse proxy,
- Docker / compose,
- networking,
- Nginx,
- SSL,
- dominios,
- despliegue,
- hardening básico,
- compatibilidad con la arquitectura final.

### Archivos permitidos
- `infra/*`
- `docker-compose*.yml`
- `.env.example`
- `deploy/*`
- `context/operations/*`
- `docs/deployment*`
- `docs/*` solo para estado y despliegue

### Archivos prohibidos
- `odoo/custom_addons/*`
- `app/shop/*`
- `lib/integrations/*`

### Entregables mínimos
- propuesta de proxy y rutas,
- compose actualizado o planificado,
- variables necesarias,
- checklist de despliegue,
- notas de seguridad.

---

## 8. Dependencias entre workstreams

### Dependencias críticas
- Workstream C depende del contrato de producto definido por Workstream B.
- Workstream D depende del modelo de publicación/catalogación definido por Workstream B.
- Workstream E puede avanzar en paralelo desde el inicio.
- Workstream A corre durante todo el proyecto.

### Orden de activación recomendado
## Ola 1
Lanzar en paralelo:
- Workstream A
- Workstream B
- Workstream E

## Ola 2
Cuando B defina contrato mínimo de producto:
- lanzar Workstream C

## Ola 3
Cuando B defina modelo de publicación/catalogación:
- lanzar Workstream D

### Regla anti-retrabajo
No lances C ni D antes de tener contrato mínimo desde B.

---

## 9. Contratos obligatorios

### 9.1 Contrato mínimo de producto
El workstream B debe producir temprano un contrato equivalente a este:

```ts
export type ShopProduct = {
  id: string
  slug: string
  name: string
  shortDescription?: string
  longDescription?: string
  price: number
  currency: string
  availability: 'in_stock' | 'out_of_stock' | 'preorder'
  imageUrl?: string
  gallery?: string[]
  sku?: string
  material?: string
  category?: string
  buyUrl: string
  publicUrl?: string
}
```

### 9.2 Contrato de publicación
El workstream B también debe definir:
- qué significa “producto publicado”,
- qué campos mínimos requiere Meta,
- cuál es la URL pública canónica,
- cómo se resuelve disponibilidad,
- qué evento o trigger dispara sincronización.

### 9.3 Versionado de contratos
Crear, si aplica:
- `integration-contracts/shop-product.v1.md`
- `integration-contracts/publication-flow.v1.md`

Regla:
- si el contrato cambia, debe incrementarse versión o documentarse el breaking change.

---

## 10. Estado, continuidad y archivos obligatorios
Debes dejar el proyecto retomable en cualquier momento.

### 10.1 Archivos obligatorios de continuidad
Crear y mantener:
- `docs/agent-state.md`
- `docs/implementation-log.md`
- `docs/shop-integration-plan.md`
- `docs/timeline.md`
- `docs/handoff.md`
- `docs/verification-report.md`
- `docs/decision-log.md`
- `docs/open-questions.md`

### 10.2 Formato obligatorio para `docs/agent-state.md`

```md
# Agent State

## Current Status
- PROJECT_PHASE: <AUDIT | PLAN | IMPLEMENTATION | VALIDATION | DOCUMENTATION | HANDOFF>
- CURRENT_SPRINT: <Sprint 0/1/2/3/4/5>
- CURRENT_TASK_ID: <ej. S2-T04>
- CURRENT_TASK_TITLE: <texto exacto>
- STATUS: <NOT_STARTED | IN_PROGRESS | BLOCKED | DONE>
- LAST_COMPLETED_TASK_ID: <id>
- LAST_COMPLETED_TASK_TITLE: <texto>
- NEXT_TASK_ID: <id>
- NEXT_TASK_TITLE: <texto>
- BLOCKERS: <lista o none>
- DECISIONS_MADE: <resumen corto>
- FILES_CREATED: <lista>
- FILES_MODIFIED: <lista>
- FILES_PENDING: <lista>
- ENV_VARS_ADDED: <lista>
- TEST_STATUS: <not run | partial | passing | failing>
- BUILD_STATUS: <unknown | passing | failing>
- DOCKER_STATUS: <unknown | passing | failing>
- INTEGRATION_STATUS:
  - ODOO: <not started / partial / complete>
  - SHOP_PAGES: <not started / partial / complete>
  - META_CATALOG: <not started / partial / complete>
  - FACEBOOK_POSTING: <not started / partial / complete>
  - INSTAGRAM_PUBLISHING: <not started / partial / complete>
  - WHATSAPP_CATALOG: <not started / partial / complete>
- RISKS: <lista corta>
- RESUME_INSTRUCTIONS: <qué hacer inmediatamente al retomar>
```

### 10.3 Formato obligatorio para `docs/implementation-log.md`
Append-only:

```md
## Session X - Step Y
- Goal:
- Actions:
- Files changed:
- Outcome:
- Errors / blockers:
- Next step:
```

### 10.4 Formato obligatorio para `docs/decision-log.md`

```md
## DEC-001 - <Título>
- Date:
- Status: proposed | accepted | superseded | rejected
- Context:
- Decision:
- Consequences:
- Supersedes:
```

### 10.5 Formato obligatorio para `docs/open-questions.md`

```md
## Q-001 - <Pregunta>
- Owner workstream:
- Blocking: yes | no
- Needed from:
- Current best assumption:
- Resolution:
```

### 10.6 Formato obligatorio para `docs/handoff.md`
Debe responder de forma operativa:
- qué se completó,
- qué falta,
- qué quedó a medias,
- cuál es la siguiente tarea exacta,
- qué archivos leer primero,
- qué comandos ejecutar,
- qué riesgos existen,
- qué decisiones no deben revertirse sin revisar.

### 10.7 Regla de actualización
Actualizar `docs/agent-state.md`:
- al iniciar sesión,
- al completar tarea importante,
- antes de refactor grande,
- antes de detenerse,
- cuando aparezca bloqueo.

### 10.8 Regla de parada segura
Si la sesión se corta, el siguiente agente debe poder:
1. abrir `docs/agent-state.md`,
2. leer `docs/handoff.md`,
3. ubicar `NEXT_TASK_ID`,
4. continuar sin reinterpretar el proyecto completo.

---

## 11. Timeline maestro por sprints

# Sprint 0 — Auditoría y diseño
### Objetivo
Entender el repo y fijar la ruta más barata/rápida.

### Tareas
- **S0-T01** Inspeccionar estructura del repo actual
- **S0-T02** Identificar rutas públicas, admin y CMS
- **S0-T03** Identificar reusable vs replaceable
- **S0-T04** Determinar arquitectura MVP
- **S0-T05** Definir dominios y subdominios
- **S0-T06** Redactar `docs/shop-integration-plan.md`
- **S0-T07** Crear `docs/agent-state.md`
- **S0-T08** Crear `docs/timeline.md`
- **S0-T09** Crear `docs/handoff.md`
- **S0-T10** Crear `docs/decision-log.md`
- **S0-T11** Crear `docs/open-questions.md`

### Salida requerida
- arquitectura objetivo documentada,
- checkout MVP decidido,
- scopes definidos,
- workstreams listos,
- proyecto retomable.

---

# Sprint 1 — Fundación Odoo
### Objetivo
Crear base Odoo adaptada a Galante’s Jewelry.

### Tareas
- **S1-T01** Crear estructura base de proyecto Odoo
- **S1-T02** Definir custom addons Galante
- **S1-T03** Diseñar modelo de producto para joyería
- **S1-T04** Definir publicación web/shop
- **S1-T05** Definir precio, stock e imágenes
- **S1-T06** Definir slug / URL pública
- **S1-T07** Definir contrato de integración con Next.js
- **S1-T08** Definir estrategia de checkout en Odoo
- **S1-T09** Documentar instalación/configuración
- **S1-T10** Emitir contratos versionados

### Salida requerida
- base Odoo lista,
- contrato de producto,
- URL de compra definida,
- integración inicial factible.

---

# Sprint 2 — Shop UI / puente comercial
### Objetivo
Conectar la tienda con la web actual de manera estable y barata.

### Tareas
- **S2-T01** Decidir si `shop.galantesjewelry.com` será Odoo puro o puente desde Next.js
- **S2-T02** Crear/adaptar sección `shop`
- **S2-T03** Mostrar catálogo/productos desde Odoo si aplica
- **S2-T04** Diseñar CTA hacia compra real
- **S2-T05** Asegurar consistencia visual de marca
- **S2-T06** Agregar loading/error/empty states
- **S2-T07** Validar responsive
- **S2-T08** Documentar frontera CMS vs catálogo comercial

### Salida requerida
- usuario puede entrar a tienda,
- catálogo real visible,
- compra real alcanzable.

---

# Sprint 3 — Separación CMS vs catálogo comercial
### Objetivo
Evitar que el CMS file-based siga siendo fuente comercial.

### Tareas
- **S3-T01** Auditar responsabilidades del admin actual
- **S3-T02** Separar contenido editorial de datos comerciales
- **S3-T03** Mantener CMS para marketing/contenido
- **S3-T04** Deshabilitar o documentar flujos incorrectos de edición de producto
- **S3-T05** Actualizar documentación funcional

### Salida requerida
- Odoo = source of truth comercial,
- CMS actual = editorial.

---

# Sprint 4 — Meta / Facebook / Instagram / WhatsApp
### Objetivo
Implementar base multicanal correcta.

### Tareas
- **S4-T01** Definir arquitectura de sync a Meta
- **S4-T02** Crear capa `lib/integrations/meta.ts`
- **S4-T03** Implementar o definir sync a catálogo Meta
- **S4-T04** Definir Facebook publishing si aplica
- **S4-T05** Definir Instagram publishing si aplica
- **S4-T06** Modelar WhatsApp como catálogo/conversación si no existe post orgánico equivalente
- **S4-T07** Crear trigger webhook/cron/manual seguro
- **S4-T08** Documentar límites por plataforma

### Salida requerida
- sync realista,
- límites claros,
- pasos de configuración exactos.

---

# Sprint 5 — Hardening, despliegue y handoff
### Objetivo
Dejar el proyecto listo para continuidad y despliegue.

### Tareas
- **S5-T01** Actualizar `.env.example`
- **S5-T02** Revisar secretos/defaults inseguros
- **S5-T03** Validar Docker
- **S5-T04** Validar Nginx / proxy / dominios
- **S5-T05** Crear checklist de despliegue
- **S5-T06** Crear verification report
- **S5-T07** Crear handoff final
- **S5-T08** Dejar estado persistido y retomable

### Salida requerida
- documentación suficiente,
- despliegue trazable,
- continuidad garantizada.

---

## 12. Estrategia de ramas y merges
Para evitar colisiones, usa esta convención:
- `orchestrator/state-docs`
- `odoo/foundation-galante`
- `frontend/shop-integration`
- `meta/catalog-sync`
- `devops/domains-proxy`

### Regla de aislamiento
Cada workstream trabaja solo en su rama.
No mezclar workstreams en una sola rama.

### Orden recomendado de merge
1. `orchestrator/state-docs`
2. `devops/domains-proxy`
3. `odoo/foundation-galante`
4. `frontend/shop-integration`
5. `meta/catalog-sync`

### Regla de merge
No abrir PR si:
- el estado no está actualizado,
- falta handoff,
- no está claro el siguiente task,
- cambió un contrato sin documentarlo.

---

## 13. Reglas de ahorro de créditos
Todas las respuestas deben seguir estas reglas:
- no repetir contexto completo en cada turno,
- no reexplicar decisiones ya documentadas,
- leer primero los archivos de estado,
- trabajar solo en el scope permitido,
- elegir una ruta y justificarla breve,
- devolver cambios concretos,
- evitar brainstorming infinito,
- no inspeccionar carpetas ajenas al scope sin necesidad,
- mantener respuestas compactas,
- actualizar estado antes de terminar.

### Regla de escalamiento
Si un agente necesita cambiar una decisión fuera de su scope:
1. lo registra en `docs/open-questions.md`,
2. propone la modificación,
3. espera decisión del orquestador o la deja marcada como bloqueo.

---

## 14. Variables de entorno sugeridas
Extender `.env.example` sin romper variables existentes.

### 14.1 Odoo
- `ODOO_BASE_URL=`
- `ODOO_PUBLIC_SHOP_URL=`
- `ODOO_DB=`
- `ODOO_USERNAME=`
- `ODOO_PASSWORD=`
- `ODOO_API_KEY=`
- `ODOO_WEBSITE_ID=`
- `ODOO_COMPANY_ID=`

### 14.2 Meta
- `META_APP_ID=`
- `META_APP_SECRET=`
- `META_ACCESS_TOKEN=`
- `META_CATALOG_ID=`
- `META_VERIFY_TOKEN=`
- `FACEBOOK_PAGE_ID=`
- `INSTAGRAM_BUSINESS_ACCOUNT_ID=`
- `WHATSAPP_BUSINESS_ACCOUNT_ID=`

### 14.3 Dominios
- `SITE_URL=https://galantesjewelry.com`
- `SHOP_URL=https://shop.galantesjewelry.com`
- `ODOO_URL=https://odoo.galantesjewelry.com`

---

## 15. Criterios de aceptación por workstream

### A — Arquitectura y estado
Hecho cuando:
- existen docs base,
- timeline está definido,
- next tasks por agente están claros,
- handoff está operativo.

### B — Odoo backend
Hecho cuando:
- existe base de proyecto Odoo,
- hay contrato de producto,
- buyUrl/publicUrl están definidos,
- el modelo comercial mínimo es utilizable.

### C — Frontend
Hecho cuando:
- existe ruta clara a tienda,
- hay `/shop` o puente equivalente según arquitectura decidida,
- los datos vienen del contrato Odoo o el flujo hacia Odoo es real,
- el sitio actual no se rompió.

### D — Meta
Hecho cuando:
- existe arquitectura de sync,
- hay capacidad mínima definida por canal,
- las limitaciones están documentadas,
- no hay claims falsos.

### E — DevOps
Hecho cuando:
- dominios están contemplados,
- proxy y rutas están definidos,
- despliegue está documentado,
- variables/env están claras.

---

## 16. Prompt del agente orquestador

```text
Actúa como Technical Orchestrator del proyecto Galante's Jewelry.

Objetivo:
coordinar la evolución del proyecto actual de Galante's Jewelry hacia una arquitectura híbrida:
- sitio principal actual en Next.js
- tienda pública en shop.galantesjewelry.com
- backend Odoo en odoo.galantesjewelry.com

Contexto obligatorio:
- El proyecto actual ya existe y no debe reescribirse desde cero.
- El sitio actual es un storefront Next.js con admin panel, CMS file-based, Docker y Nginx.
- Odoo será el backend comercial y la fuente de verdad para productos, stock, precios, clientes y pedidos.
- El checkout debe resolverse en Odoo o por redirección al flujo Odoo.
- Las integraciones con WhatsApp, Instagram y Facebook deben ser reales y documentadas honestamente.
- Deben agregarse estos dominios:
  - shop.galantesjewelry.com
  - odoo.galantesjewelry.com

Rutas locales de referencia Odoo:
- C:\Users\yoeli\Documents\cell_odoo
- C:\Users\yoeli\Documents\jabiya_test\jabiyaprod

Esas rutas solo son referencia funcional y estructural.
No copies código enterprise verbatim.
Crea módulos propios adaptados a Galante's Jewelry.

Tu función:
1. dividir el trabajo en tareas paralelas de bajo costo,
2. asignar tareas a agentes distintos con contexto mínimo,
3. evitar solapamientos,
4. mantener estado persistente,
5. dejar el proyecto retomable si la sesión se corta.

Debes crear y mantener:
- docs/agent-state.md
- docs/timeline.md
- docs/shop-integration-plan.md
- docs/handoff.md
- docs/verification-report.md
- docs/implementation-log.md
- docs/decision-log.md
- docs/open-questions.md

Debes dividir el proyecto en estos workstreams:
1. Arquitectura/Estado
2. Odoo backend
3. Frontend Next.js
4. Integraciones Meta
5. DevOps/Dominios/Proxy

Tu primera salida debe ser:
1. mapa de workstreams
2. timeline por sprint
3. archivos por agente
4. dependencias
5. riesgos
6. next task exacta por agente

Reglas de eficiencia:
- no repitas el contexto completo en cada respuesta
- no reexplique decisiones ya escritas en docs
- lee primero docs/agent-state.md y docs/handoff.md
- trabaja solo en tu scope
- no propongas alternativas infinitas
- entrega cambios concretos
- mantén respuestas compactas
- actualiza el estado antes de terminar
```

---

## 17. Prompt del agente A — Arquitectura y estado

```text
Actúa como Architecture & State Agent para Galante's Jewelry.

No hagas implementación grande todavía.
Tu trabajo es auditar, planificar y dejar el proyecto retomable.

Objetivo:
- inspeccionar el repo actual
- resumir arquitectura actual
- definir arquitectura objetivo
- crear timeline de trabajo paralelo
- crear documentación de estado y handoff

Debes crear/actualizar:
- docs/agent-state.md
- docs/timeline.md
- docs/shop-integration-plan.md
- docs/handoff.md
- docs/implementation-log.md
- docs/decision-log.md
- docs/open-questions.md

Contexto:
- sitio actual en Next.js
- Odoo será backend comercial
- shop.galantesjewelry.com = tienda
- odoo.galantesjewelry.com = backend Odoo
- referencia Odoo:
  - C:\Users\yoeli\Documents\cell_odoo
  - C:\Users\yoeli\Documents\jabiya_test\jabiyaprod

No copies enterprise literalmente.
Diseña módulos adaptados.

Debes entregar:
1. auditoría del repo
2. arquitectura actual
3. arquitectura objetivo
4. matriz reuse vs replace
5. timeline por sprint
6. workstreams paralelos
7. blockers y riesgos
8. next task por agente

No toques frontend, integraciones ni docker salvo para documentar.
```

---

## 18. Prompt del agente B — Odoo backend

```text
Actúa como Odoo Backend Agent para Galante's Jewelry.

Objetivo:
crear la base del proyecto Odoo que se integrará con la web actual de Galante’s Jewelry.

Arquitectura objetivo:
- odoo.galantesjewelry.com = backend Odoo
- Odoo será source of truth para:
  - productos
  - precios
  - stock
  - clientes
  - pedidos
- shop.galantesjewelry.com y/o el sitio actual consumirá catálogo desde Odoo

Referencias obligatorias:
- C:\Users\yoeli\Documents\cell_odoo
- C:\Users\yoeli\Documents\jabiya_test\jabiyaprod

Usa esas rutas solo como referencia funcional y estructural para:
- naming
- flujos
- vistas
- módulos
- patrones de integración
- organización de addons
No copies código enterprise verbatim.
Crea una versión adaptada para Galante’s Jewelry.

Debes construir una base Odoo con:
- estructura de proyecto
- custom addons para Galante
- modelo de producto orientado a joyería
- campos útiles para catálogo web
- publicación web/shop
- stock/disponibilidad
- precio
- slug o identificador web
- imágenes
- endpoint o capa de integración para Next.js
- documentación de instalación/configuración
- contrato de producto versionado
- contrato de publicación versionado

Debes dejar estos entregables:
- estructura de carpetas Odoo
- custom addons
- README del proyecto Odoo
- contrato de integración con Next.js
- lista de env vars necesarias
- estado persistido en docs

Debes priorizar:
- bajo costo
- rapidez
- mantenibilidad
- mínima complejidad para MVP

No construyas integraciones Meta todavía.
No reescribas el frontend.
```

---

## 19. Prompt del agente C — Frontend Next.js

```text
Actúa como Frontend Integration Agent para Galante's Jewelry.

Objetivo:
modificar el proyecto actual Next.js para agregar una sección Shop conectada a Odoo o servir como puente limpio hacia la tienda, sin romper la web actual.

Debes crear o adaptar:
- /shop
- /shop/[slug] si la arquitectura decidida lo justifica

Requisitos:
- productos vienen de Odoo o del contrato emitido por Odoo
- no usar data/cms.json como source of truth para productos
- mantener CMS actual para contenido editorial si aplica
- CTA principal debe enviar al flujo real de compra en Odoo
- no construir checkout custom complejo

Debes trabajar solo en:
- app/shop/*
- components/shop/*
- lib/odoo/*
- lib/shop/*
- docs relacionados con frontend

No toques:
- docker/nginx
- meta integrations
- módulos Odoo

Debes usar el contrato Odoo definido por B.
No inventes campos si aún no existen; documenta gap o usa fallback temporal explícito.

Debes entregar:
- páginas funcionales o puente limpio
- loading/error/empty states
- tipado TS fuerte
- manejo de errores
- documentación de configuración
- actualización de estado en docs
```

---

## 20. Prompt del agente D — Meta / WhatsApp / Instagram / Facebook

```text
Actúa como Meta Integrations Agent para Galante's Jewelry.

Objetivo:
diseñar e implementar una integración realista con:
- Facebook
- Instagram
- WhatsApp Business
- Meta Catalog

Contexto:
- Odoo es source of truth de productos
- el sitio actual y/o shop consumen catálogo desde Odoo
- no inventes capacidades inexistentes
- si WhatsApp no soporta publicación orgánica equivalente, usa el flujo correcto de catálogo y conversación
- documenta honestamente limitaciones

Debes implementar o dejar lista la base para:
- sync de productos a Meta Catalog
- disponibilidad para Facebook Shop / Instagram Shopping si aplica
- catálogo de WhatsApp Business si aplica
- publicación opcional en Facebook e Instagram cuando el producto se publique
- endpoint/job/manual trigger seguro

Trabaja solo en:
- lib/integrations/*
- app/api/integrations/*
- docs/meta*
- docs/verification-report.md en lo relativo a Meta

No toques:
- frontend shop
- Docker
- Odoo core

Debes dejar:
- arquitectura de sync
- código modular
- variables de entorno
- limitaciones técnicas por canal
- pasos de configuración
- estado persistido
```

---

## 21. Prompt del agente E — DevOps / dominios / proxy

```text
Actúa como DevOps & Deployment Agent para Galante's Jewelry.

Objetivo:
preparar la infraestructura para soportar:
- galantesjewelry.com
- shop.galantesjewelry.com
- odoo.galantesjewelry.com

Debes diseñar e implementar la configuración necesaria para:
- Nginx / reverse proxy
- Docker compose
- networking entre servicios
- variables de entorno
- SSL / dominios / headers apropiados
- compatibilidad con el proyecto actual
- integración futura con Odoo

Reglas:
- no romper el sitio actual
- no reescribir despliegue completo si no hace falta
- mantener bajo costo
- documentar claramente cómo enrutar:
  - web actual
  - shop
  - Odoo backend

Trabaja solo en:
- infra/*
- docker-compose*.yml
- .env.example
- deploy/*
- context/operations/*
- docs/deployment*

Debes dejar:
- propuesta de despliegue
- cambios de compose/nginx
- variables necesarias
- checklist de despliegue
- notas de seguridad
- estado persistido
```

---

## 22. Plan de ejecución simultánea

### Sesión 1
Lanzar en paralelo:
- Agente A
- Agente B
- Agente E

### Sesión 2
Cuando B publique contrato/API mínimo de producto:
- lanzar Agente C

### Sesión 3
Cuando B publique contrato de publicación/catálogo:
- lanzar Agente D

### Regla de activación
No actives C ni D antes de tiempo.
Eso evita retrabajo y gasto extra.

---

## 23. Checklist de salida por sesión
Antes de detenerte, debes dejar siempre:
1. `docs/agent-state.md` actualizado
2. `docs/implementation-log.md` actualizado
3. `docs/handoff.md` actualizado
4. `docs/timeline.md` actualizado si cambió algo
5. `docs/decision-log.md` actualizado si hubo decisión importante
6. `docs/open-questions.md` actualizado si apareció dependencia o duda
7. lista exacta de archivos tocados
8. último task completado
9. task actual
10. siguiente task exacta
11. blockers
12. comandos de validación

---

## 24. Prompt corto de reanudación

```text
Retoma el proyecto desde el estado persistido en:
- docs/agent-state.md
- docs/handoff.md
- docs/timeline.md
- docs/implementation-log.md
- docs/decision-log.md
- docs/open-questions.md

No replantees el proyecto desde cero.
Primero resume:
- último task completado
- task actual
- siguiente task
- blockers
- decisiones vigentes
Luego continúa exactamente desde NEXT_TASK_ID.
```

---

## 25. Definición de done
El proyecto está en estado aceptable si:
- el sitio actual sigue funcionando,
- existe ruta clara a la tienda,
- `shop.galantesjewelry.com` está definido y documentado,
- `odoo.galantesjewelry.com` está definido y documentado,
- Odoo es la fuente de verdad de productos,
- el usuario puede comprar mediante flujo real,
- Meta/Facebook/Instagram/WhatsApp están definidos con honestidad técnica,
- la infraestructura está documentada,
- el proyecto puede retomarse exactamente desde los archivos de estado.

---

## 26. Instrucción final al agente
Empieza por este orden exacto:
1. inspeccionar el repo real,
2. crear o actualizar `docs/agent-state.md`,
3. crear o actualizar `docs/timeline.md`,
4. crear o actualizar `docs/shop-integration-plan.md`,
5. crear o actualizar `docs/handoff.md`,
6. crear o actualizar `docs/decision-log.md`,
7. crear o actualizar `docs/open-questions.md`,
8. definir mapa de workstreams,
9. definir siguiente tarea exacta de cada agente,
10. solo después pasar a implementación.

No empieces por código grande.
Primero deja el proyecto coordinado, aislado por workstreams y retomable.
