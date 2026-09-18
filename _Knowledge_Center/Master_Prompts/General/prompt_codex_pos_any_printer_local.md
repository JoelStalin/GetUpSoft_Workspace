# Prompt para Codex — Paridad de `pos_any_printer_local` + Agente descargable (Odoo v18+)

## Modo
DETAIL

## Resumen del entendimiento
Quieres un **prompt para Codex** que guíe la implementación/ajuste de un módulo **`pos_any_printer_local`** para **Odoo v18+**, asegurando que:
- Tenga **las mismas funciones** que `pos_any_printer` (módulo base en el ZIP que compartiste).
- Añada **integración con un agente local Windows** (el script que compartiste), y que **el agente sea descargable desde Odoo** (UI/acción/botón/ruta).
- El agente funcione **sin SSL** (HTTP plano / WS plano) para reducir fricción en clientes.

## Estado de evidencias
**Provistas:**
- ZIP `pos_any_printer.zip` (contiene módulos `pos_any_printer` y `pos_self_order_any_printer`).
- Script del agente (Windows Service + GUI) para impresión local.

**No provistas (aún):**
- Logs/traceback del agente al fallar (agent.log, Event Viewer, stdout/err).
- Logs del navegador (Consola/Red) cuando POS intenta imprimir.
- Versión exacta de Odoo (17.0 / 18.0) y tipo (Community/Enterprise).

## Prompt optimizado (copiar/pegar en Codex)

### Rol
Actúa como **Arquitecto Senior de Odoo v18+** y **Fullstack POS (JS/OWL + Python)**. Tu objetivo es **modificar/crear** el módulo `pos_any_printer_local` para que:
1) replique funcionalidad de `pos_any_printer` (paridad funcional), y  
2) incorpore un **agente local descargable** para imprimir desde POS vía HTTP/WS **sin SSL**.

### Paso previo obligatorio
1. **Inspecciona el ZIP** `pos_any_printer.zip`:
   - Identifica features existentes (POS y Self Order).
   - Enumera rutas de archivos relevantes (manifest, JS, XML, Python, controllers).
   - Describe “qué hace” y “cómo imprime” hoy (flujo de impresión, endpoints, dependencias).
2. **Inspecciona el script del agente** provisto y extrae:
   - Puerto/host por defecto, rutas HTTP (ej. `/cgi-bin/epos/service.cgi`), CORS, formatos (RAW, PDF, imagen).
   - Cómo se selecciona impresora y cómo se guarda configuración.
   - Cómo se instala/ejecuta como servicio (pywin32).
3. Si faltan evidencias, declara supuestos explícitos antes de codificar.

### Restricciones (no negociables)
- **Solo Odoo v18+** (si hay v18/v19 público, soportar; si no, limitar).
- En Odoo: **ORM-only**, seguridad (ACLs/record rules/multi-company), `sudo()` solo con razón.
- Overrides con `super()`.
- **Regla XML v18+**: NO usar `attrs="..."` ni `invisible="..."`. Si se requiere lógica condicional de UI, usar campos técnicos/booleanos computados en backend o rediseñar UI.
- En POS v18: usar bundles de assets correctos (**`point_of_sale._assets_pos`** para assets POS). citeturn2search1turn3view0

### Objetivo funcional
Implementar en `pos_any_printer_local`:

#### A) Paridad funcional con `pos_any_printer`
- Mantener las mismas pantallas/configuraciones/acciones de impresión existentes.
- Soportar el mismo set de features (impresión ticket, reimpresión, selección impresora, fallback, etc.).
- Debe funcionar también para `pos_self_order_any_printer` si aplica (o proveer un plan de integración).

#### B) Agente local (Windows) + descarga desde Odoo
- Añadir en Odoo una **acción “Descargar agente”** visible desde:
  - POS Config / Ajustes de POS (backend), y/o
  - Pantalla de POS (opcional si quieres onboarding).
- La descarga debe ser:
  - `Content-Disposition: attachment`
  - con versionado (ej. `LocalPrinterAgent-<version>.zip` o `.exe`).
- Empaquetado recomendado:
  - `.exe` generado con PyInstaller `--onefile --noconsole` para evitar ventana CMD (si se entrega binario),
  - o `.zip` con script + requirements + README + instalador `.bat` (si se entrega fuente).
- El módulo debe incluir el artefacto en:
  - `pos_any_printer_local/static/agent/LocalPrinterAgent.zip` (o `.exe`),
  - y servirlo vía `http.route`.

#### C) Comunicación POS → agente (sin SSL)
- Definir una URL por defecto: `http://127.0.0.1:9060` (o configurable).
- Implementar endpoints esperados (si el agente no los expone aún, ajustar el agente):
  - `GET /health` → `{status:"ok", version:"x.y.z"}`
  - `GET /printers` → lista de impresoras
  - `POST /print` → imprime (raw/pdf/image)
- Manejar CORS en el agente para permitir requests desde el origen de Odoo (y desde `file://` si aplica).
- Implementar en POS:
  - Cola de impresión (queue),
  - reintentos,
  - manejo de “agente no disponible”,
  - mensajes UX claros.

#### D) Seguridad mínima razonable (local)
- Restringir el agente a **bind 127.0.0.1** por defecto.
- Implementar token simple `Authorization: Bearer <token>` configurable en Odoo.
- En Odoo, guardar token en `pos.config` y enviar en cada request.
- No exponer endpoints del agente en `0.0.0.0` por defecto.

### Entregables
1. **Diff o código completo** del módulo `pos_any_printer_local` (Odoo v18):
   - `__manifest__.py` con assets correctos (bundle POS).
   - Modelos (`pos.config` extension): campos `enable_local_printer_agent`, `agent_url`, `agent_token`, `agent_download_url`, `agent_version`, etc.
   - Vistas backend (sin `attrs/invisible` prohibidos).
   - Controlador para descarga (`/pos_any_printer_local/agent/download`).
   - JS/OWL para integración POS (servicio/adapter de printer).
2. **Ajustes mínimos del agente** para soportar modo **sin SSL**:
   - Parámetro `use_ssl=False` por defecto o switch en config.
   - Endpoints de health/printers/print (o mapping al endpoint existente `/cgi-bin/epos/service.cgi`).
   - CORS headers.
   - Logging robusto (agent.log).
3. **README.md**:
   - instalación del agente (Windows),
   - cómo configurar Odoo POS,
   - troubleshooting (puertos, firewall, logs, “1053”, etc.).
4. **Checklist de validación** y pasos para pruebas manuales:
   - listar impresoras desde POS,
   - imprimir ticket,
   - imprimir PDF/imagen si aplica,
   - reiniciar servicio, persistencia config.

### Validaciones técnicas obligatorias
- POS assets cargan en v18 usando el bundle correcto (`point_of_sale._assets_pos`). citeturn2search1turn3view0
- No hay `attrs=` / `invisible=` prohibidos en vistas (v18+).
- El botón “Descargar agente” descarga el archivo y no abre en el navegador.
- El POS detecta `agent online/offline` mediante `GET /health`.
- Impresiones funcionan con agente corriendo como servicio y también en modo GUI.

### Preguntas (máx. 3) — solo si bloquean decisiones
1) ¿Versión exacta de Odoo: 17.0, 18.0 o 19.0 (si existe) y Community/Enterprise?  
2) ¿Quieres descargar **.exe** (PyInstaller) o **.zip** con script?  
3) ¿El agente debe imprimir **solo texto/RAW** o también **PDF/imagen** (como tu script)?

### Evidencias solicitadas (si las tienes)
¿Dispones de alguna de las siguientes evidencias que puedas compartir?
- Traceback completo / mensajes de error del agente.
- `agent.log` y/o logs del Event Viewer (Application/System) cuando el servicio falla.
- Captura textual del error y pasos exactos para reproducir.
- Logs del navegador (Consola + Network) al imprimir desde POS.
- Tu versión de Windows y si el POS corre en navegador (Chrome/Edge) o PWA.

---

## Mejoras clave incluidas en el prompt
- Paridad funcional basada en inspección del ZIP antes de codificar.
- Arquitectura clara POS ↔ agente (HTTP/WS sin SSL), con cola y UX.
- Descarga del agente desde Odoo por `http.route` con attachment.
- Guardrails de Odoo v18 (assets y XML sin `attrs/invisible`).

## Técnicas aplicadas
- Deconstruct → mapeo de features en ZIP + mapeo de endpoints del agente.
- Diagnose → supuestos explícitos si faltan logs y limitación de preguntas.
- Develop → entregables por capas (Odoo backend, POS JS, agente).
- Deliver → checklist y validaciones reproducibles.

## Odoo (v18+) — versión, branch, rutas, evidencia
- Versión objetivo: **Odoo 17.0+**.
- Branch a verificar en `odoo/odoo`: **`17.0`**.
- Evidencia clave (assets POS v18): el bundle correcto es **`point_of_sale._assets_pos`** (no `point_of_sale.assets_pos`). citeturn2search1turn3view0
- Referencia general de assets y bundles en Odoo 17: documentación oficial de assets. citeturn2search12

## Checklist de validación
- [ ] El módulo `pos_any_printer_local` instala en Odoo 17 sin errores.
- [ ] POS carga assets del módulo (JS/OWL) en el bundle correcto.
- [ ] En backend existe opción para habilitar agente local y descargarlo.
- [ ] La ruta de descarga responde con `attachment` y nombre de archivo versionado.
- [ ] `GET /health` funciona y el POS refleja estado online/offline.
- [ ] `GET /printers` lista impresoras reales del cliente.
- [ ] `POST /print` imprime ticket (y PDF/imagen si se requiere).
- [ ] Agente no abre ventana CMD (si empaquetado `--noconsole`) o no aparece CMD en operaciones internas.
- [ ] Logs útiles en `agent.log` y mensajes claros en POS.
