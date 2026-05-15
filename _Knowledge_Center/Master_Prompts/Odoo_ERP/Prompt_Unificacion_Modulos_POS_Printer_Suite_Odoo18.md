# Prompt Maestro para Unificar Módulos de Impresión POS (Odoo 18+) + Agente Windows como Servicio (Batch) + Tokens por Cliente

## Modo
AUTO (asumido: **ChatGPT** como IA objetivo, estilo **DETAIL** con entrega inmediata + supuestos defensivos)

## Resumen del entendimiento
Quieres un **único módulo** (o un “suite” con un solo install) para **Odoo 18+** que:
1) Mantenga **todas** las funcionalidades actuales de `pos_any_printer` y `pos_any_printer_local` (función principal).  
2) Integre las funciones de los demás módulos dentro del ZIP (`pos_client_printer`, `pos_self_order_any_printer`, `pos_self_order_any_printer_local`).  
3) Transforme el **agente local** en un producto “instalable” y/o “compilable” por un admin en el **servidor Odoo**, generando un **ejecutable instalable** descargable por el cliente que se instala como **Windows Service** y corre en **batch** (sin GUI).  
4) Simplifique configuración: **sin IP/puerto configurables**, siempre fijos (ej: `127.0.0.1:9060`).  
5) Maneje seguridad: **token por cliente**, incluido en la instalación para evitar problemas de comunicación.  
6) “Revisar línea por línea” el enfoque del agente para que sea **100% compatible con Windows** (service, permisos, rutas, logs, dependencias).  
7) “Revisar línea por línea” los XML/Assets para que sean compatibles con **Odoo 18** (y alineados a prácticas 17+).

Este prompt toma como base el ZIP compartido (contiene los módulos mencionados) y tu script ejemplo de agente, que ya incluye: servidor HTTP/HTTPS, listado de impresoras, print RAW/PDF/imagen, instalación como servicio pywin32, GUI Tkinter, etc. (Archivo ZIP de referencia del usuario). fileciteturn0file0

---

## Estado de evidencias
**Evidencias provistas:**  
- ZIP con múltiples módulos POS (incluye `pos_any_printer_local`, `pos_any_printer`, `pos_client_printer`, `pos_self_order_any_printer`, `pos_self_order_any_printer_local`). fileciteturn0file0  
- Script ejemplo del agente local (en el mensaje del usuario).

**Evidencias NO provistas (aún):**
- Logs/tracebacks reales de Odoo (server) y del agente.
- Requisitos exactos de impresoras/protocolos (ESC/POS, drivers GDI, Zebra, PDF direct, etc.)
- Alcance de “otros módulos” fuera del ZIP (si existen más).

---

## Prompt optimizado (copiar/pegar en tu IA objetivo)

> ### Rol
> Actúa como **Arquitecto Senior Odoo (v18+)** + **Ingeniero Senior Windows (Python + pywin32 + PyInstaller/Inno Setup)**.  
> Tu objetivo es diseñar e implementar un **único módulo unificado** que cubra impresión POS (caja/cocina), Self-Order y “any printer” (tipo hw_proxy o proxy local), con un **agente local Windows** instalable como servicio, configuración mínima y token por instalación.
>
> ### Restricciones no negociables
> - **Solo Odoo v18+** (v17/v18 ok; v16 o inferior NO).  
> - Priorizar **ORM** y seguridad Odoo (ACLs, record rules, multi-company).  
> - `sudo()` solo donde sea imprescindible y justificado (p. ej. lectura/escritura de `ir.config_parameter` o rutas públicas de descarga con cuidado).  
> - Overrides siempre con `super()`.  
> - **Assets en Odoo 18** declarados en `__manifest__.py` con clave `assets` (p. ej. `point_of_sale._assets_pos`). citeturn1view0turn1view1  
> - Evitar `attrs="..."` y evitar lógica frágil de invisibilidad; preferir UX estable y lógica backend.
>
> ### Entradas disponibles
> - Código actual en ZIP: módulos `pos_any_printer_local`, `pos_any_printer`, `pos_client_printer`, `pos_self_order_any_printer`, `pos_self_order_any_printer_local`. (Asumir que debes partir de ahí y consolidar).  
> - Script ejemplo del agente: contiene servidor HTTP/HTTPS, endpoints `/health`, `/printers`, `/print`, soporte pywin32 service y GUI.
>
> ### Salidas obligatorias
> Devuelve un único documento `.md` con:
> 1) **Arquitectura final** (módulo Odoo + agente Windows + flujos).  
> 2) **Plan de implementación** por fases con estimación de riesgos + pruebas.  
> 3) **Código de ejemplo** listo para producción (no pseudocódigo), incluyendo:
>    - Estructura de addon unificado.
>    - Modelos Odoo + controllers + wizards necesarios.
>    - Assets JS para POS + Self-Order.
>    - Código del agente Windows “batch service” + empaquetado.
>    - Mecanismo de token por cliente e instalación.
> 4) Checklist de compatibilidad Odoo 18 y Windows.
> 5) Estrategia de migración desde los módulos viejos.
>
> ---
>
> ## A) Objetivo funcional exacto
> Implementa un “**POS Printing Suite**” con 2 rutas de impresión:
>
> **Ruta 1 — Local Agent (Windows Service, localhost fijo):**
> - POS web app (en navegador del cliente) imprime llamando al agente local en:
>   - Host fijo: `127.0.0.1`
>   - Puerto fijo: `9060`
>   - Endpoints:
>     - `GET /health` → {status, version}
>     - `GET /printers` → lista
>     - `POST /print` → imprime (RAW / PDF / image)
> - Seguridad: `Authorization: Bearer <token_instalacion>`
> - El token se genera en Odoo por “dispositivo POS” y se inserta en el instalador/config del agente.
>
> **Ruta 2 — Any Printer / hw_proxy compatible:**
> - Mantener la compatibilidad con el enfoque “any printer” existente (que crea un `BasePrinter` y hace RPC/HTTP a un proxy tipo `/hw_proxy/default_printer_action`).
> - Debe quedar como un **printer driver** alternativo dentro del mismo addon, configurable por impresora.
>
> **Self-Order:**
> - Si se usa `pos_self_order`, el mismo sistema debe permitir imprimir tickets/recibos hacia:
>   - local agent (preferido)
>   - o any_printer/hw_proxy (opcional según config)
>
> ---
>
> ## B) Diseño del addon unificado (propuesta)
>
> ### B1) Nombre y estructura
> Crea un único addon llamado por ejemplo: `pos_printing_suite` con subcarpetas:
>
> ```text
> pos_printing_suite/
>   __init__.py
>   __manifest__.py
>   security/
>     ir.model.access.csv
>     security.xml
>   models/
>     __init__.py
>     pos_printer.py
>     pos_config.py
>     pos_device.py
>     res_config_settings.py
>   controllers/
>     __init__.py
>     download.py
>     device_api.py
>   wizards/
>     __init__.py
>     build_agent_wizard.py
>   views/
>     pos_config_views.xml
>     pos_printer_views.xml
>     res_config_settings_views.xml
>     pos_device_views.xml
>   data/
>     ir_cron.xml
>     ir_sequence.xml
>   static/
>     src/
>       app/
>         printers/
>           local_agent_printer.js
>           hw_proxy_printer.js
>       overrides/
>         pos_store_patch.js
>         self_order_service_patch.js
>   agent_src/                # fuente del agente (Python) para compilar
>     local_printer_agent/
>       agent_service.py
>       printer_backends.py
>       installer/
>         build.ps1
>         build.bat
>         pyinstaller.spec
>         inno_setup.iss
>       templates/
>         config.json.j2
>         service_config.json.j2
> ```
>
> **Clave:** el addon incluye el **source del agente** (`agent_src/`) y también puede incluir un **artefacto precompilado** opcional para emergencias.  
> Pero la meta es que el admin genere un nuevo instalador desde Odoo.
>
> ---
>
> ## C) Modelos y configuración en Odoo (mínima, sin IP/puerto)
>
> ### C1) Nuevo modelo “dispositivo POS” para token y descarga
> Crea `pos.print.device` (o similar) para representar cada PC/terminal.
>
> - Campos:
>   - `name` (Char)
>   - `company_id`
>   - `pos_config_id` (Many2one a `pos.config`)
>   - `token` (Char, **secrets.token_urlsafe**)
>   - `agent_version` (Char)
>   - `last_seen` (Datetime) (por pings /health opcional)
>   - `state` (selection: draft/active/revoked)
> - Reglas:
>   - token único por registro
>   - `state=revoked` invalida impresiones
>
> **Ejemplo de modelo:**
> ```python
> # models/pos_device.py
> from odoo import api, fields, models, _
> from odoo.exceptions import ValidationError
> import secrets
>
> class PosPrintDevice(models.Model):
>     _name = "pos.print.device"
>     _description = "POS Print Device (Local Agent binding)"
>     _inherit = ["mail.thread", "mail.activity.mixin"]
>
>     name = fields.Char(required=True, tracking=True)
>     company_id = fields.Many2one("res.company", required=True, default=lambda self: self.env.company)
>     pos_config_id = fields.Many2one("pos.config", ondelete="cascade", required=True)
>     token = fields.Char(readonly=True, copy=False, index=True)
>     agent_version = fields.Char(readonly=True)
>     last_seen = fields.Datetime(readonly=True)
>     state = fields.Selection([("draft","Draft"),("active","Active"),("revoked","Revoked")], default="draft", tracking=True)
>
>     _sql_constraints = [
>         ("token_uniq", "unique(token)", "Token must be unique."),
>     ]
>
>     @api.model_create_multi
>     def create(self, vals_list):
>         for vals in vals_list:
>             if not vals.get("token"):
>                 vals["token"] = secrets.token_urlsafe(32)
>         return super().create(vals_list)
>
>     def action_activate(self):
>         self.write({"state": "active"})
>
>     def action_revoke(self):
>         self.write({"state": "revoked"})
> ```
>
> ### C2) pos.config: selección simple de modo de impresión
> En `pos.config` define:
> - `printing_mode` (selection):
>   - `local_agent` (default)
>   - `hw_proxy`
> - `device_id` Many2one a `pos.print.device` (para token)
> - Nombres de impresoras (caja/cocina) si aplica
> - Flags de “print as image” + ancho si lo mantienes
>
> **Sin** campos de IP/puerto: se fija a `http://127.0.0.1:9060`.
>
> ```python
> # models/pos_config.py
> from odoo import api, fields, models
>
> class PosConfig(models.Model):
>     _inherit = "pos.config"
>
>     printing_mode = fields.Selection(
>         [("local_agent","Local Agent (Windows)"),("hw_proxy","HW Proxy / Any Printer")],
>         default="local_agent",
>         required=True,
>     )
>     print_device_id = fields.Many2one(
>         "pos.print.device",
>         string="Local Agent Device",
>         help="Device record that contains the per-installation token.",
>     )
>
>     local_printer_cashier_name = fields.Char(string="Impresora (Caja)")
>     local_printer_kitchen_name = fields.Char(string="Impresora (Cocina)")
>     local_printer_print_as_image = fields.Boolean(default=False)
>     local_printer_image_width = fields.Integer(default=576)
>
>     # Compat con legado: conservar any_printer_ip solo si realmente se usa hw_proxy
>     any_printer_ip = fields.Char(string="HW Proxy IP (legacy)")
>
>     def _loader_params_pos_config(self):
>         params = super()._loader_params_pos_config()
>         params["fields"].extend([
>             "printing_mode",
>             "print_device_id",
>             "local_printer_cashier_name",
>             "local_printer_kitchen_name",
>             "local_printer_print_as_image",
>             "local_printer_image_width",
>             "any_printer_ip",
>         ])
>         return params
> ```
>
> ### C3) pos.printer: unificar tipos
> Extiende `pos.printer` y agrega tipos:
> - `local_agent`
> - `hw_proxy_any_printer` (lo que hoy se llama any_printer)
>
> Mantén campos relevantes (sin invisibles frágiles):
> ```python
> # models/pos_printer.py
> from odoo import api, fields, models, _
> from odoo.exceptions import ValidationError
>
> class PosPrinter(models.Model):
>     _inherit = "pos.printer"
>
>     printer_type = fields.Selection(selection_add=[
>         ("local_agent", "Local Agent (Windows)"),
>         ("hw_proxy_any_printer", "HW Proxy / Any Printer"),
>     ])
>
>     hw_proxy_ip = fields.Char(string="HW Proxy IP (legacy)")
>     local_printer_name = fields.Char(string="Windows Printer Name")
>
>     @api.constrains("printer_type", "hw_proxy_ip")
>     def _check_hw_proxy_ip(self):
>         for p in self:
>             if p.printer_type == "hw_proxy_any_printer" and not p.hw_proxy_ip:
>                 raise ValidationError(_("HW Proxy IP is required for HW Proxy printers."))
> ```
>
> ---
>
> ## D) Controllers Odoo: descarga del instalador + API opcional
>
> ### D1) Descarga “por dispositivo” con token embebido
> Un endpoint tipo:
> - `GET /pos_printing_suite/agent/download/<device_id>`
>   - auth: `user` (admin/manager)
>   - genera un ZIP/EXE con `config.json` que incluye el token
>
> **Importante:** el servidor Odoo no debería recompilar Windows exe en Linux “a pelo”.  
> Propon: (1) compilación en runner Windows (CI), o (2) build server Windows dentro de la red.  
> Aun así, implementa el wizard en Odoo para disparar y gestionar artefactos.
>
> **Ejemplo de controller de descarga (sirviendo archivo ya construido):**
> ```python
> # controllers/download.py
> import os
> from odoo import http
> from odoo.http import request
> import werkzeug
>
> class AgentDownload(http.Controller):
>     @http.route("/pos_printing_suite/agent/download/<int:device_id>", type="http", auth="user", csrf=False)
>     def download_agent(self, device_id, **kw):
>         device = request.env["pos.print.device"].sudo().browse(device_id)
>         if not device.exists():
>             raise werkzeug.exceptions.NotFound()
>         if not request.env.user.has_group("point_of_sale.group_pos_manager"):
>             raise werkzeug.exceptions.Forbidden()
>
>         attachment = request.env["ir.attachment"].sudo().search([
>             ("res_model","=","pos.print.device"),
>             ("res_id","=",device.id),
>             ("name","ilike","LocalPrinterAgent-Setup"),
>         ], limit=1, order="id desc")
>         if not attachment:
>             raise werkzeug.exceptions.NotFound("No installer built for this device yet.")
>
>         content = attachment.raw
>         headers = [
>             ("Content-Type", "application/octet-stream"),
>             ("Content-Disposition", http.content_disposition(attachment.name)),
>         ]
>         return request.make_response(content, headers=headers)
> ```
>
> ---
>
> ## E) JS POS + Self-Order en Odoo 18 (assets en manifest)
>
> Odoo 18 recomienda declarar assets en `__manifest__.py` (no necesariamente por XML template). citeturn1view0turn1view1
>
> ### E1) __manifest__.py (assets)
> ```python
> {
>   "name": "POS Printing Suite",
>   "version": "18.0.1.0.0",
>   "depends": ["point_of_sale", "pos_self_order"],
>   "assets": {
>     "point_of_sale._assets_pos": [
>        "pos_printing_suite/static/src/**/*.js",
>     ],
>   },
>   "data": [
>     "security/ir.model.access.csv",
>     "views/pos_config_views.xml",
>     "views/pos_printer_views.xml",
>     "views/pos_device_views.xml",
>   ],
>   "installable": True,
> }
> ```
>
> ### E2) Driver LocalAgentPrinter
> ```js
> /** @odoo-module **/
> import { BasePrinter } from "@point_of_sale/app/printer/base_printer";
>
> export class LocalAgentPrinter extends BasePrinter {
>   setup(params) {
>     super.setup(...arguments);
>     this.baseUrl = "http://127.0.0.1:9060";
>     this.token = params.token;
>     this.printerName = params.printerName;
>   }
>   async sendPrintingJob(receiptB64) {
>     const res = await fetch(`${this.baseUrl}/print`, {
>       method: "POST",
>       headers: {
>         "Content-Type": "application/json",
>         "Authorization": `Bearer ${this.token}`,
>       },
>       body: JSON.stringify({ type: "raw", printer: this.printerName, data: receiptB64 }),
>     });
>     if (!res.ok) throw new Error(await res.text());
>     return await res.json();
>   }
> }
> ```
>
> ---
>
> ## F) Agente Windows 100% “batch service” + instalador
>
> - Evitar `--onefile` para servicios persistentes (problemas con extracción en TEMP). Preferir `--onedir`. citeturn0search2  
> - Documentar servicio con pywin32 o alternativa NSSM. citeturn0search10turn0search16
>
> ---
>
> ## G) Checklist Odoo 18 / Windows
> - Assets con `assets` en manifest. citeturn1view0turn1view1  
> - `attrs` ya no se usa desde 17.0; usar sintaxis nueva o UX estable. citeturn2search0turn2search11
>
> ---
>
> ## H) Evidencias solicitadas
> ¿Dispones de logs/tracebacks/código real en producción para priorizar? (lista completa al final del documento).


---

## Análisis del ZIP actual (hallazgos concretos para guiar la unificación)

> Nota: estos hallazgos sirven para orientar la migración. No asumas que están “bien”; corrige durante la unificación. (ZIP de referencia). fileciteturn0file0

### 1) `pos_any_printer`
- Extiende `pos.printer` y agrega `printer_type = any_printer` + campo `any_printer_ip`.
- **Problema detectado:** constraint compara contra `any_epos` en vez de `any_printer` → debe corregirse.
- Vistas: `pos_printer_views.xml` usa `invisible="printer_type != 'any_printer'"` (dinámico). En Odoo 17+ ya no se usa `attrs`, pero sí existen expresiones en `invisible`. Aun así, para una UI estable, recomendamos **evitar** condicionales y mostrar el campo con ayuda contextual. citeturn2search0turn2search11
- JS: driver `AnyPrinter` usa RPC contra endpoints tipo `/hw_proxy/default_printer_action`.

### 2) `pos_any_printer_local`
- Aporta campos en `pos.config` como:
  - `enable_local_printing`, `agent_url`, `local_printer_name`, `local_printer_print_as_image`, etc.
- Controller: expone endpoint para test y/o puente a agente.
- JS: en el ZIP, `static/src/js/main.js` está vacío (“intentionally left blank”), por lo que falta una implementación completa del driver local.

### 3) `pos_self_order_any_printer`
- Patch para Self-Order que usa `AnyPrinter`.
- **Problema:** contiene `alert("hola ...")` de depuración, debe eliminarse en producción.

### 4) `pos_self_order_any_printer_local`
- Patch para Self-Order que intenta importar `LocalAgentPrinter` desde `pos_any_printer_local/static/src/app/local_agent_printer`.
- **Problema:** esa ruta no aparece en el ZIP → hay un faltante/rotura de import que debe resolverse en la unificación.

### 5) `pos_client_printer`
- Trae un enfoque alterno: el agente “jala” jobs desde el servidor Odoo (polling) y luego imprime.
- Esto se puede **integrar como modo opcional** (pull queue), pero el modo recomendado para POS web es **browser → localhost agent** por simplicidad.

---

## Ajustes XML / Vistas (Odoo 18) recomendados

### A) Migrar assets a `__manifest__.py`
En Odoo 18, lo estándar es declarar assets en `__manifest__.py` (`assets` dict). citeturn1view0turn1view1  
Evita depender de `<template inherit_id="point_of_sale.assets">` salvo que haya un caso especial.

### B) Evitar condicionales frágiles en vistas
- Desde 17.0, `attrs` ya no se usa y se recomienda sintaxis directa en `invisible/readonly/required`. citeturn2search0turn2search11  
- Aun así, para un módulo “suite” que debe ser mantenible, evita esconder campos por expresiones complejas:
  - Mejor: mostrar campos agrupados y explicar “solo aplica si modo X”.
  - O separar por páginas/sections.

**Ejemplo (form pos.printer):** siempre muestra los campos `local_printer_name`, `hw_proxy_ip` con help claro:
```xml
<odoo>
  <record id="view_pos_printer_form_inherit_suite" model="ir.ui.view">
    <field name="name">pos.printer.form.printing.suite</field>
    <field name="model">pos.printer</field>
    <field name="inherit_id" ref="point_of_sale.view_pos_printer_form"/>
    <field name="arch" type="xml">
      <xpath expr="//group" position="inside">
        <group string="Printing Suite">
          <field name="printer_type"/>
          <field name="local_printer_name" help="Windows printer name used by Local Agent mode."/>
          <field name="hw_proxy_ip" help="Only for HW Proxy mode (legacy)."/>
        </group>
      </xpath>
    </field>
  </record>
</odoo>
```

---

## Plan de implementación ampliado (con entregables por sprint)

### Sprint 0 — Auditoría y congelación de requisitos (1–2 días)
- Inventario de impresoras reales y formatos.
- Confirmar si se requiere:
  - PDF directo vs render a imagen vs RAW ESC/POS
  - cashdrawer / cut / beep
- Definir si Self-Order imprime siempre o por eventos.

**Entregables:**
- Matriz de compatibilidad de impresoras.
- Lista de endpoints definitivos del agente.

### Sprint 1 — Addon unificado (Odoo) “esqueleto” (2–4 días)
- Crear addon `pos_printing_suite` con:
  - modelos base
  - vistas mínimas
  - assets en manifest
- Migración de campos mínimos desde módulos previos.

**Entregables:**
- Addon instalable en Odoo 18.
- Menú/acciones para `pos.print.device`.

### Sprint 2 — Driver Local Agent + Token (3–6 días)
- Implementar `LocalAgentPrinter` completo.
- Implementar loader para traer token del dispositivo al POS.
- Manejo de errores + UI (toast) si agente no responde.

**Entregables:**
- Impresión POS desde navegador al agente localhost.

### Sprint 3 — Agente Windows batch service v1 (4–8 días)
- Extraer GUI, fijar host/port, ProgramData config.
- Service pywin32 + logs.
- Endpoints: `/health`, `/printers`, `/print`.

**Entregables:**
- Instalación manual (sin installer) + servicio funcionando.

### Sprint 4 — Instalador + “build flow” (4–10 días)
- PyInstaller onedir + Inno Setup.
- Wizard en Odoo para:
  - generar device + token
  - adjuntar/servir instalador por device

**Entregables:**
- Descarga desde Odoo y instalación 1-click (UAC) en Windows.

### Sprint 5 — Self-Order + HW Proxy + compat legado (3–6 días)
- Patch Self-Order con los mismos drivers.
- Integrar `AnyPrinter` (hw_proxy) como alternativa.
- Remover debug/alerts.

**Entregables:**
- Flujo completo POS + Self-Order.

### Sprint 6 — Hardening + QA + Observabilidad (continuo)
- Rotación/revocación de token.
- Health monitoring (opcional) con cron que ping a agentes.
- Documentación de soporte.

---

## Evidencias solicitadas (repetido fuera del prompt, para que lo puedas responder aquí)
¿Dispones de alguna de las siguientes evidencias que puedas compartir?
- Mensajes de error (traceback completo).
- Logs relevantes de Odoo (server) y del agente (agent.log).
- Código actual exacto del agente en producción (si difiere del ejemplo).
- Diferencias entre comportamiento esperado vs. real (qué impresora, qué falla, cuándo).
- Capturas textuales del error (copiadas, no imágenes).
