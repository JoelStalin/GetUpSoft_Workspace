# Prompt maestro milimétrico para Claude / Codex

## Proyecto
Integración de **Odoo + tienda web actual de Galante's Jewelry** con ejecución por agentes paralelos, bajo consumo de créditos, checkpoints persistentes y capacidad de reanudación exacta si se interrumpe la sesión.

---

## 0. Instrucción de uso
Este archivo está diseñado para usarse de una de estas formas:

1. **Como prompt maestro único** para un agente orquestador.
2. **Como fuente de prompts especializados** para varios agentes trabajando en paralelo.
3. **Como documento de continuidad** para retomar el proyecto desde el punto exacto donde quedó.

No replantees el proyecto desde cero si ya existen archivos de estado. Antes de actuar, revisa siempre:

- `docs/agent-state.md`
- `docs/handoff.md`
- `docs/timeline.md`
- `docs/implementation-log.md`
- `docs/shop-integration-plan.md`

---

## 1. Contexto real del proyecto actual
Debes asumir y verificar en el repositorio actual de `Galantesjewelry` lo siguiente:

### 1.1 Stack actual esperado
- **Next.js 16 App Router**
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- Autenticación con **JWT** usando `jose`
- Procesamiento de imágenes con `sharp`
- CMS persistido en archivos:
  - `data/cms.json`
  - `data/blobs`
- Docker
- Nginx
- Cloudflare Tunnel opcional
- Panel admin autenticado ya existente
- Scripts de pruebas y validación ya existentes, incluyendo:
  - lint
  - Vitest
  - Playwright
  - Selenium/Pytest

### 1.2 Restricción estructural
El proyecto actual **NO debe ser reescrito desde cero**.
Debe evolucionarse conservando lo que ya funciona.

### 1.3 Conclusión arquitectónica inicial
El sitio actual funciona bien como:
- branding
- catálogo visual
- contenido de marketing
- panel de contenido

Pero no debe seguir siendo la base principal para:
- inventario transaccional
- pedidos
- checkout complejo
- stock real
- sincronización multicanal comercial

---

## 2. Objetivo de negocio
Cliente: **Galante's Jewelry**, Islamorada, Florida.

### 2.1 Objetivo principal
Permitir que los clientes compren por la página web con la ruta **más rápida, más barata y más mantenible**.

### 2.2 Requisito estratégico
Aprovechar experiencia previa con Odoo.

### 2.3 Resultado deseado
Construir una solución híbrida:

- **galantesjewelry.com** → sitio principal actual
- **shop.galantesjewelry.com** → experiencia pública de compra / storefront comercial
- **odoo.galantesjewelry.com** → backend Odoo, admin, catálogo maestro, pedidos, stock, clientes

### 2.4 Requisito multicanal
Al publicar un producto desde la fuente de verdad definida, se debe habilitar el flujo correcto para:
- web
- Facebook
- Instagram
- WhatsApp Business

### 2.5 Regla de honestidad técnica
No inventes capacidades no soportadas por las APIs oficiales.
Si WhatsApp no tiene un equivalente real a “post orgánico de producto”, usa el modelo correcto:
- catálogo
- mensajes de producto
- conversación comercial

---

## 3. Rutas locales de referencia Odoo
Estas dos rutas deben usarse **como referencia funcional y estructural**, no como fuente para copiar literalmente código enterprise dentro de un repo público:

- `C:\Users\yoeli\Documents\cell_odoo`
- `C:\Users\yoeli\Documents\jabiya_test\jabiyaprod`

### 3.1 Cómo deben usarse
Puedes usarlas para estudiar y adaptar:
- estructura de addons
- organización modular
- vistas
- patrones de website sale
- modelos extendidos
- flujos de publicación
- naming conventions
- integración entre website, sale, stock y catálogo

### 3.2 Lo que NO debes hacer
- No copies código enterprise verbatim a un repo público.
- No dupliques módulos enterprise completos.
- No pegues assets o código licenciado sin adaptación.

### 3.3 Lo que SÍ debes hacer
- Crear un **proyecto Odoo propio** para Galante’s Jewelry.
- Diseñar **módulos adaptados** a este negocio.
- Reutilizar conceptos, no clonar paquetes enterprise completos.

---

## 4. Decisión arquitectónica objetivo
La arquitectura preferida es la siguiente:

### 4.1 Dominios
- `https://galantesjewelry.com` → web principal actual
- `https://www.galantesjewelry.com` → redirect opcional al principal
- `https://shop.galantesjewelry.com` → tienda pública
- `https://odoo.galantesjewelry.com` → backend Odoo y administración

### 4.2 Fuente de verdad
**Odoo debe convertirse en la fuente de verdad para:**
- productos
- precios
- stock
- disponibilidad
- clientes
- pedidos
- catálogo comercial

### 4.3 Responsabilidad del sitio actual Next.js
El sitio actual debe quedar como:
- sitio principal
- branding
- SEO
- marketing content
- páginas editoriales
- posible catálogo visual o landing hacia la tienda

### 4.4 Checkout
No construyas un checkout complejo custom en Next.js si eso encarece el proyecto.
El checkout del MVP debe resolverse mediante una de estas dos rutas, en este orden de preferencia:

1. **Odoo Website / eCommerce nativo**
2. Redirección desde Next.js hacia el flujo público de compra alojado en Odoo

### 4.5 Shop
La forma más económica y rápida es:
- lanzar una tienda en `shop.galantesjewelry.com`
- respaldada por Odoo
- con integración visual y de marca consistente con Galante’s Jewelry

### 4.6 Fase posterior opcional
Más adelante puede integrarse catálogo directamente dentro del sitio Next.js consumiendo datos desde Odoo, pero eso no debe bloquear el MVP.

---

## 5. Estrategia para ahorrar créditos
### 5.1 Regla principal
No uses un solo agente para todo el proyecto.
Divide el trabajo en agentes paralelos con scopes pequeños y archivos delimitados.

### 5.2 Objetivo de optimización
Reducir consumo de créditos evitando:
- relectura constante del repo completo
- respuestas excesivamente largas sin cambios concretos
- que varios agentes toquen los mismos archivos
- que frontend e integraciones inventen contratos antes de que Odoo los defina

### 5.3 Modelo operativo recomendado
Trabajar con **5 workstreams paralelos**:

1. Arquitectura y estado
2. Odoo backend
3. Frontend Next.js
4. Integraciones Meta
5. DevOps / dominios / proxy / despliegue

---

## 6. Workstreams y scopes exactos

# 6.1 Workstream A — Arquitectura y estado
### Objetivo
Coordinar, documentar, secuenciar y dejar el proyecto retomable.

### Responsabilidades
- auditar el repo
- definir arquitectura objetivo
- definir timeline
- registrar decisiones
- registrar blockers
- dejar handoff

### Archivos permitidos
- `docs/agent-state.md`
- `docs/timeline.md`
- `docs/shop-integration-plan.md`
- `docs/handoff.md`
- `docs/implementation-log.md`
- `docs/verification-report.md`

### Archivos prohibidos
- `app/*`
- `components/*`
- `lib/*`
- `infra/*`
- `odoo/*`

### Salida esperada
Documentación de coordinación lista para que otros agentes trabajen sin conflicto.

---

# 6.2 Workstream B — Odoo backend
### Objetivo
Crear el proyecto Odoo adaptado para Galante’s Jewelry.

### Responsabilidades
- crear la base de proyecto Odoo
- crear custom addons
- modelar producto comercial
- website/ecommerce base
- stock/disponibilidad
- integración con la tienda pública
- contrato de datos para Next.js

### Archivos permitidos
- `odoo/*`
- `odoo/custom_addons/*`
- `odoo/docker/*`
- `integration-contracts/*`
- `docs/*` solo para actualizar estado de este workstream

### Archivos prohibidos
- `app/shop/*`
- `components/shop/*`
- `lib/integrations/*`
- `infra/*`

### Resultado esperado
Un proyecto Odoo funcional y adaptado al negocio, listo para integrarse con la web.

---

# 6.3 Workstream C — Frontend Next.js
### Objetivo
Integrar una experiencia de tienda o puente comercial en el sitio actual sin romperlo.

### Responsabilidades
- crear o adaptar sección `shop`
- integrar catálogo desde Odoo si ya existe contrato
- conservar diseño y branding
- mantener admin actual sin romperlo
- evitar checkout custom complejo

### Archivos permitidos
- `app/shop/*`
- `components/shop/*`
- `lib/odoo/*`
- `lib/shop/*`
- `docs/*` solo para estado y frontend notes

### Archivos prohibidos
- `odoo/*`
- `infra/*`
- `lib/integrations/*`

### Resultado esperado
Sección `shop` conectada a Odoo o ruta sólida hacia `shop.galantesjewelry.com`.

---

# 6.4 Workstream D — Meta / Facebook / Instagram / WhatsApp
### Objetivo
Implementar o dejar lista una integración multicanal realista.

### Responsabilidades
- catálogo Meta
- Facebook Shop / Instagram Shopping si aplica
- WhatsApp Business catálogo si aplica
- publicación orgánica en Facebook/Instagram si es soportada
- documentar límites reales de cada API

### Archivos permitidos
- `lib/integrations/*`
- `app/api/integrations/*`
- `docs/meta-*`
- `docs/*` solo para estado y verificación de este workstream

### Archivos prohibidos
- `odoo/*`
- `app/shop/*`
- `infra/*`

### Resultado esperado
Base modular para sincronización Meta y documentación honesta de capacidades reales.

---

# 6.5 Workstream E — DevOps / dominios / proxy / despliegue
### Objetivo
Preparar la infraestructura para soportar web actual, tienda y Odoo.

### Responsabilidades
- reverse proxy
- Docker / compose
- networking
- variables de entorno
- Nginx
- SSL
- dominios/subdominios
- despliegue y hardening

### Archivos permitidos
- `infra/*`
- `docker-compose*.yml`
- `.env.example`
- `deploy/*`
- `context/operations/*`
- `docs/deployment*`
- `docs/*` solo para estado y handoff técnico

### Archivos prohibidos
- `odoo/custom_addons/*`
- `app/shop/*`
- `lib/integrations/*`

### Resultado esperado
Infraestructura preparada para:
- `galantesjewelry.com`
- `shop.galantesjewelry.com`
- `odoo.galantesjewelry.com`

---

## 7. Dependencias entre workstreams

### 7.1 Dependencias críticas
- Workstream C depende del contrato de datos definido por Workstream B.
- Workstream D depende del modelo de publicación/catálogo definido por Workstream B.
- Workstream E puede avanzar en paralelo desde el inicio.
- Workstream A corre desde el principio hasta el final.

### 7.2 Orden recomendado
## Ola 1
Lanzar en paralelo:
- Workstream A
- Workstream B
- Workstream E

## Ola 2
Cuando B defina contrato mínimo de producto:
- Workstream C

## Ola 3
Cuando B defina publicación/catalogación real:
- Workstream D

---

## 8. Checkpoints y resumabilidad obligatoria
Debes dejar el proyecto retomable en cualquier momento.

### 8.1 Archivos obligatorios de continuidad
Crear y mantener:
- `docs/agent-state.md`
- `docs/implementation-log.md`
- `docs/shop-integration-plan.md`
- `docs/timeline.md`
- `docs/handoff.md`
- `docs/verification-report.md`

### 8.2 Formato obligatorio para `docs/agent-state.md`
Usa esta estructura:

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

### 8.3 Regla de actualización del estado
Actualiza `docs/agent-state.md`:
- al comenzar una sesión
- al terminar una tarea importante
- antes de cambios grandes
- antes de detenerte
- cuando encuentres un bloqueo

### 8.4 Formato obligatorio para `docs/implementation-log.md`
Bitácora append-only:

```md
## Session X - Step Y
- Goal:
- Actions:
- Files changed:
- Outcome:
- Errors / blockers:
- Next step:
```

### 8.5 Formato obligatorio para `docs/handoff.md`
Debe responder de forma práctica:
- qué se completó
- qué falta
- qué está a medias
- cuál es la siguiente tarea exacta
- qué archivos leer primero
- qué comandos ejecutar
- qué riesgos existen
- qué decisiones no deben revertirse sin revisar

### 8.6 Regla de parada segura
Si la sesión se corta o se acaban los créditos, el siguiente agente debe poder:
1. abrir `docs/agent-state.md`
2. leer `docs/handoff.md`
3. ir a `NEXT_TASK_ID`
4. continuar sin replantear todo el proyecto

---

## 9. Timeline maestro por sprints

# Sprint 0 — Auditoría y diseño
### Objetivo
Entender el repo y definir la ruta más barata/rápida.

### Tareas
- **S0-T01** Inspeccionar la estructura del repo actual
- **S0-T02** Identificar rutas públicas, admin y contenido CMS
- **S0-T03** Identificar qué se puede reutilizar y qué no
- **S0-T04** Determinar arquitectura MVP
- **S0-T05** Definir dominios y subdominios
- **S0-T06** Redactar `docs/shop-integration-plan.md`
- **S0-T07** Crear `docs/agent-state.md`
- **S0-T08** Crear `docs/timeline.md`
- **S0-T09** Crear `docs/handoff.md`

### Criterio de salida
- arquitectura objetivo documentada
- decision de checkout documentada
- scopes de agentes definidos
- handoff inicial listo

---

# Sprint 1 — Fundación Odoo
### Objetivo
Crear la base del proyecto Odoo adaptado.

### Tareas
- **S1-T01** Crear estructura de proyecto Odoo
- **S1-T02** Definir addons custom para Galante
- **S1-T03** Diseñar modelo de producto para joyería
- **S1-T04** Definir publicación web y shop visibility
- **S1-T05** Definir campos de precio, stock e imágenes
- **S1-T06** Definir identificador web / slug / URL pública
- **S1-T07** Definir contrato de integración con Next.js
- **S1-T08** Definir estrategia de checkout en Odoo
- **S1-T09** Documentar instalación/configuración inicial

### Criterio de salida
- Odoo base listo
- contrato de producto definido
- flujo comercial principal decidido

---

# Sprint 2 — Shop UI / integración con web actual
### Objetivo
Conectar la tienda con el sitio actual de forma barata y estable.

### Tareas
- **S2-T01** Decidir si `shop.galantesjewelry.com` será Odoo puro o puente desde Next.js
- **S2-T02** Crear / adaptar sección `shop`
- **S2-T03** Mostrar producto y catálogo desde Odoo si aplica
- **S2-T04** Diseñar CTA hacia compra real
- **S2-T05** Asegurar consistencia visual con la marca
- **S2-T06** Agregar estados loading/error/empty
- **S2-T07** Validar responsive
- **S2-T08** Documentar la frontera entre CMS y catálogo comercial

### Criterio de salida
- usuario puede navegar a tienda
- catálogo real accesible
- flujo de compra real alcanzable

---

# Sprint 3 — Separación CMS vs Catálogo transaccional
### Objetivo
Evitar que el CMS file-based siga siendo la fuente de verdad de productos.

### Tareas
- **S3-T01** Auditar responsabilidades actuales del admin
- **S3-T02** Separar contenido editorial de datos comerciales
- **S3-T03** Mantener CMS para marketing y contenido
- **S3-T04** Deshabilitar o documentar edición de productos en flujos incorrectos
- **S3-T05** Actualizar documentación funcional

### Criterio de salida
- Odoo = source of truth comercial
- CMS actual = contenido editorial

---

# Sprint 4 — Meta / Facebook / Instagram / WhatsApp
### Objetivo
Implementar una base multicanal correcta y realista.

### Tareas
- **S4-T01** Definir arquitectura de sync a Meta
- **S4-T02** Crear capa `lib/integrations/meta.ts`
- **S4-T03** Definir o implementar sync a catálogo Meta
- **S4-T04** Definir Facebook publishing si aplica
- **S4-T05** Definir Instagram publishing si aplica
- **S4-T06** Modelar WhatsApp como catálogo y conversación si no existe post orgánico equivalente
- **S4-T07** Crear trigger: webhook / cron / manual seguro
- **S4-T08** Documentar límites por plataforma

### Criterio de salida
- flujo realista y documentado
- no hay simulaciones falsas

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

### Criterio de salida
- documentación clara
- despliegue trazable
- continuidad garantizada

---

## 10. Estrategia de ramas y merges
Para evitar colisiones entre agentes, usa esta convención de ramas:

- `orchestrator/state-docs`
- `odoo/foundation-galante`
- `frontend/shop-integration`
- `meta/catalog-sync`
- `devops/domains-proxy`

### Regla
Cada agente trabaja **solo en su rama**.
No mezclar varios workstreams en una sola rama.

### Orden recomendado de merge
1. `orchestrator/state-docs`
2. `devops/domains-proxy`
3. `odoo/foundation-galante`
4. `frontend/shop-integration`
5. `meta/catalog-sync`

---

## 11. Prompt del agente orquestador
Copia y pega este bloque si usarás un agente principal.

```text
Actúa como Technical Orchestrator del proyecto Galante's Jewelry.

Objetivo:
coordinar la evolución del proyecto actual de Galante's Jewelry hacia una arquitectura híbrida:
- sitio principal actual en Next.js
- tienda pública en shop.galantesjewelry.com
- backend Odoo en odoo.galantesjewelry.com

Contexto obligatorio:
- El proyecto actual de Galante's Jewelry ya existe y no debe reescribirse desde cero.
- El sitio actual es un storefront Next.js con admin panel, CMS file-based, Docker y Nginx.
- Odoo será el backend comercial y la fuente de verdad para productos, stock, precios, clientes y pedidos.
- El checkout debe resolverse en Odoo o mediante redirección al flujo Odoo, no con un checkout custom complejo en Next.js.
- Las integraciones con WhatsApp, Instagram y Facebook deben ser reales y documentadas honestamente.
- Deben agregarse estos dominios:
  - shop.galantesjewelry.com
  - odoo.galantesjewelry.com

Rutas locales de referencia Odoo:
- C:\Users\yoeli\Documents\cell_odoo
- C:\Users\yoeli\Documents\jabiya_test\jabiyaprod

Esas rutas deben usarse como referencia funcional y estructural para diseñar módulos adaptados a Galante's Jewelry.
No copies código enterprise verbatim dentro de un repo público.
Crea módulos propios inspirados en esos proyectos.

Tu función:
1. dividir el trabajo en tareas paralelas de bajo costo
2. asignar tareas a agentes distintos con contexto mínimo
3. evitar solapamientos de archivos
4. mantener estado persistente del proyecto
5. dejar el proyecto retomable si la sesión se corta

Debes crear y mantener:
- docs/agent-state.md
- docs/timeline.md
- docs/shop-integration-plan.md
- docs/handoff.md
- docs/verification-report.md
- docs/implementation-log.md

Debes dividir el proyecto en estos workstreams:
1. Arquitectura/Estado
2. Odoo backend
3. Frontend Next.js
4. Integraciones Meta
5. DevOps/Dominios/Proxy

Debes definir:
- alcance de cada agente
- archivos permitidos por agente
- dependencias entre tareas
- checkpoint de reanudación
- siguiente tarea exacta por workstream

Tu primera salida debe ser:
1. mapa de workstreams
2. timeline por sprint
3. archivos por agente
4. dependencias
5. riesgos
6. siguiente tarea exacta para cada agente

Reglas de eficiencia:
- no repitas el contexto completo en cada respuesta
- no reexplique decisiones ya escritas en docs
- lee primero docs/agent-state.md y docs/handoff.md
- trabaja sólo en tu scope
- no propongas alternativas infinitas; elige una y justifícala breve
- entrega cambios concretos
- mantén respuestas compactas
- actualiza el estado antes de terminar
```

---

## 12. Prompt del agente A — Arquitectura y estado

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

Reglas de eficiencia:
- no repitas el contexto completo en cada respuesta
- no reexplique decisiones ya escritas en docs
- lee primero docs/agent-state.md y docs/handoff.md
- trabaja sólo en tu scope
- no propongas alternativas infinitas; elige una y justifícala breve
- entrega cambios concretos
- mantén respuestas compactas
- actualiza el estado antes de terminar
```

---

## 13. Prompt del agente B — Odoo backend

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

Usa esas rutas sólo como referencia funcional y estructural para:
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

Reglas de eficiencia:
- no repitas el contexto completo en cada respuesta
- no reexplique decisiones ya escritas en docs
- lee primero docs/agent-state.md y docs/handoff.md
- trabaja sólo en tu scope
- no propongas alternativas infinitas; elige una y justifícala breve
- entrega cambios concretos
- mantén respuestas compactas
- actualiza el estado antes de terminar
```

---

## 14. Prompt del agente C — Frontend Next.js

```text
Actúa como Frontend Integration Agent para Galante's Jewelry.

Objetivo:
modificar el proyecto actual Next.js para agregar una sección Shop conectada a Odoo, sin romper la web actual.

Debes crear o adaptar:
- /shop
- /shop/[slug]

Requisitos:
- productos vienen de Odoo
- no usar data/cms.json como source of truth para productos
- mantener CMS actual para contenido editorial si aplica
- CTA principal debe enviar al flujo real de compra en Odoo
- no construir checkout custom complejo

Debes trabajar sólo en:
- app/shop/*
- components/shop/*
- lib/odoo/*
- lib/shop/*
- docs relacionados con frontend

No toques:
- docker/nginx
- meta integrations
- módulos Odoo

Espera o define un contrato claro con Odoo:
- fetchProducts()
- fetchProductBySlug()
- precio
- stock/disponibilidad
- imagen
- descripción
- buyUrl / productUrl

Debes entregar:
- páginas funcionales
- loading/error/empty states
- tipado TS fuerte
- manejo de errores
- documentación de configuración
- actualización de estado en docs

Reglas de eficiencia:
- no repitas el contexto completo en cada respuesta
- no reexplique decisiones ya escritas en docs
- lee primero docs/agent-state.md y docs/handoff.md
- trabaja sólo en tu scope
- no propongas alternativas infinitas; elige una y justifícala breve
- entrega cambios concretos
- mantén respuestas compactas
- actualiza el estado antes de terminar
```

---

## 15. Prompt del agente D — Meta / WhatsApp / Instagram / Facebook

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

Trabaja sólo en:
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

Reglas de eficiencia:
- no repitas el contexto completo en cada respuesta
- no reexplique decisiones ya escritas en docs
- lee primero docs/agent-state.md y docs/handoff.md
- trabaja sólo en tu scope
- no propongas alternativas infinitas; elige una y justifícala breve
- entrega cambios concretos
- mantén respuestas compactas
- actualiza el estado antes de terminar
```

---

## 16. Prompt del agente E — DevOps / dominios / proxy

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

Trabaja sólo en:
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

Reglas de eficiencia:
- no repitas el contexto completo en cada respuesta
- no reexplique decisiones ya escritas en docs
- lee primero docs/agent-state.md y docs/handoff.md
- trabaja sólo en tu scope
- no propongas alternativas infinitas; elige una y justifícala breve
- entrega cambios concretos
- mantén respuestas compactas
- actualiza el estado antes de terminar
```

---

## 17. Plan de ejecución en simultáneo

### Sesión 1
Lanzar en paralelo:
- Agente A
- Agente B
- Agente E

### Sesión 2
Cuando el Agente B defina contrato/API mínimo de producto:
- lanzar Agente C

### Sesión 3
Cuando el Agente B defina publicación/catálogo:
- lanzar Agente D

### Regla de costo
No lances C y D antes de tener contrato mínimo desde B.
Eso evita retrabajo y consumo extra.

---

## 18. Contrato mínimo esperado de producto desde Odoo
Este contrato puede ajustarse, pero el agente debe intentar llegar rápido a una versión equivalente:

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

---

## 19. Variables de entorno sugeridas
Extender `.env.example` sin borrar ni romper las existentes.

### 19.1 Odoo
- `ODOO_BASE_URL=`
- `ODOO_PUBLIC_SHOP_URL=`
- `ODOO_DB=`
- `ODOO_USERNAME=`
- `ODOO_PASSWORD=`
- `ODOO_API_KEY=`
- `ODOO_WEBSITE_ID=`
- `ODOO_COMPANY_ID=`

### 19.2 Meta
- `META_APP_ID=`
- `META_APP_SECRET=`
- `META_ACCESS_TOKEN=`
- `META_CATALOG_ID=`
- `META_VERIFY_TOKEN=`
- `FACEBOOK_PAGE_ID=`
- `INSTAGRAM_BUSINESS_ACCOUNT_ID=`
- `WHATSAPP_BUSINESS_ACCOUNT_ID=`

### 19.3 Dominios
- `SITE_URL=https://galantesjewelry.com`
- `SHOP_URL=https://shop.galantesjewelry.com`
- `ODOO_URL=https://odoo.galantesjewelry.com`

---

## 20. Regla sobre el shop
La instrucción preferida para reducir tiempo/costo es esta:

### MVP recomendado
- Mantener la web actual como sitio principal
- Lanzar Odoo Website/eCommerce en `shop.galantesjewelry.com`
- Lanzar backend Odoo en `odoo.galantesjewelry.com`
- Conectar productos, stock, pedidos y checkout en Odoo
- En la web principal, agregar botones y secciones que apunten a la tienda
- Luego, como fase 2, integrar catálogo consumido desde Odoo directamente dentro de Next.js si sigue siendo necesario

### Razón
Es la opción con menor costo, menor riesgo y menor cantidad de código nuevo.

---

## 21. Entregables obligatorios al final de cada sesión
Antes de detenerte, debes dejar siempre:

1. `docs/agent-state.md` actualizado
2. `docs/implementation-log.md` actualizado
3. `docs/handoff.md` actualizado
4. `docs/timeline.md` actualizado si cambió algo
5. lista exacta de archivos tocados
6. último task completado
7. task actual
8. siguiente task exacta
9. blockers
10. comandos de validación

---

## 22. Prompt corto de reanudación
Usa este prompt cuando la sesión se interrumpa:

```text
Retoma el proyecto desde el estado persistido en:
- docs/agent-state.md
- docs/handoff.md
- docs/timeline.md
- docs/implementation-log.md

No replantees el proyecto desde cero.
Primero resume:
- último task completado
- task actual
- siguiente task
- blockers
Luego continúa exactamente desde NEXT_TASK_ID.
```

---

## 23. Definición de done
El proyecto está en estado aceptable si:

- el sitio actual sigue funcionando
- existe una ruta clara a la tienda
- `shop.galantesjewelry.com` está definido y documentado
- `odoo.galantesjewelry.com` está definido y documentado
- Odoo es la fuente de verdad de productos
- el usuario puede comprar a través de un flujo real
- Meta/Facebook/Instagram/WhatsApp están definidos con honestidad técnica
- la infraestructura queda documentada
- el proyecto se puede retomar exactamente desde los archivos de estado

---

## 24. Instrucción final al agente
Empieza por este orden exacto:

1. inspeccionar el repo real
2. crear o actualizar `docs/agent-state.md`
3. crear o actualizar `docs/timeline.md`
4. crear o actualizar `docs/shop-integration-plan.md`
5. crear o actualizar `docs/handoff.md`
6. definir el mapa de workstreams
7. definir la siguiente tarea exacta de cada agente
8. solo después pasar a implementación por workstream

No empieces por código grande.
Primero deja el proyecto coordinado y retomable.
