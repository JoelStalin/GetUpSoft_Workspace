# Prompt de reparación + compatibilidad Odoo 18.0 — `pos_printing_suite` (Agent + Legacy) con impresión de imagen y sin bloquear la impresión estándar
## Modo
DETAIL
## Resumen del entendimiento
- Se adjuntó el módulo **`pos_printing_suite`** (ZIP) que agrega 2 tipos de impresoras POS:
  - **Local Agent (Windows)** (`printer_type="local_agent"`) que imprime vía un agente local (endpoint `/print`).
  - **HW Proxy / Legacy** (`printer_type="hw_proxy_any_printer"`) que imprime vía `/hw_proxy/print_receipt` apuntando a un IP.
- Objetivo: **100% compatible con Odoo 18.0 (branch `18.0`)**, **sin romper** el flujo de impresión estándar de Odoo.
- Requisito adicional: **“tanto en el agente como en el legacy se imprima una img”**.
  - Interpretación aplicada (defensiva):
    1) el **trabajo de impresión** se envía como **imagen** (raster) a ambos backends cuando se use la suite, y
    2) el **recibo** (OrderReceipt / Kitchen receipt) **incluye** una imagen embebida (base64 data URI) para que se vea tanto en **print agent** como en **legacy**.
## Estado de evidencias (provistas / no provistas)
**Provistas:**
- Código del módulo ZIP (`pos_printing_suite.zip`) con:
  - JS: `static/src/printers/*.js`
  - Modelos: `models/*.py`
  - Controller descarga instalador: `controllers/download.py`
  - Agente: `agent_src/local_printer_agent/*.py`
**No provistas (aún):** logs/tracebacks de Odoo 18, capturas del payload que recibe `/hw_proxy/print_receipt`, ni comportamiento esperado vs real en impresión de imagen.
### Pregunta obligatoria sobre evidencias (para debugging y fix fino)
**¿Dispones de alguna de estas evidencias que puedas compartir (texto, no capturas)?**
- Traceback completo (Odoo server) al imprimir por Agent o por Legacy.
- Logs del agente (`agent_service.py`) cuando recibe el job.
- Ejemplo real de request/response a `/hw_proxy/print_receipt` (payload).
- Qué imagen exacta debe imprimirse (logo de compañía, QR, banner, etc.) y en qué recibos (cliente, cocina, ambos).
---
## Prompt optimizado (copiar/pegar)
```md
# Rol
Actúa como **Arquitecto Senior de Odoo v18.0** (ORM + seguridad) y **Frontend POS (OWL)**. Tu objetivo es dejar el módulo `pos_printing_suite` 100% compatible con **branch `18.0`** del repo oficial `https://github.com/odoo/odoo`.
# Paso previo obligatorio (evidencias)
1. Indica si el usuario proporcionó: logs/tracebacks, payloads reales y código.
2. Si existen, **analízalos primero** y extrae el “root cause”.
3. Si no existen, declara supuestos explícitos y diseña una solución defensiva.
# Restricciones (no negociables)
- Solo Odoo **18.0** (branch `18.0`).
- Priorizar **ORM**, respetar ACLs, record rules y multi-company.
- `sudo()` solo con justificación.
- Overrides/patches controlados y **llamada obligatoria a `super`**.
- No romper la impresión estándar de Odoo: por defecto debe seguir funcionando “como viene”.
- Para JS usa `patch(objToPatch, extension)` con `super` según doc oficial. (Odoo 18 doc “Patching code”).
# Contexto (módulo adjunto)
- Módulo: `pos_printing_suite`
- Archivos clave del módulo:
  - `pos_printing_suite/static/src/printers/local_printer_agent_printer.js`
  - `pos_printing_suite/static/src/printers/local_printer_proxy_printer.js`
  - `pos_printing_suite/models/pos_config.py`
  - `pos_printing_suite/models/pos_printer.py`
  - Agente: `pos_printing_suite/agent_src/local_printer_agent/agent_service.py`
# Objetivos técnicos (entregables)
## A) Compatibilidad Odoo 18 + No bloquear impresión estándar
1. **No forzar** `printing_mode="local_agent"` como default en `pos.config` porque genera configuración obligatoria y puede interferir con setups existentes.
2. Introduce un modo “por defecto Odoo” (ej. `printing_mode="odoo_default"`), o un boolean `enable_printing_suite`, con default **desactivado**.
3. En POS frontend, el patch a `PosStore._createPrinter` debe:
   - Ejecutarse **solo si** la suite está habilitada en la configuración y el usuario tiene permisos.
   - Si no, debe hacer `return super._createPrinter(...arguments)` para mantener el comportamiento estándar.
## B) Permisos: habilitar suite solo a usuarios autorizados
1. Crea un grupo nuevo:
   - `pos_printing_suite.group_pos_printing_suite_printing`
2. JS debe consultar `user.hasGroup(...)` y **solo** activar impresoras custom si pertenece al grupo.
3. Backend UI (vistas) debe mostrar opciones avanzadas solo a usuarios con ese grupo (usar atributo `groups="..."`).
## C) “Agente” + “Legacy” imprimen como imagen y además se imprime una imagen embebida
### C1) Envío del job como imagen
1. Revisa `agent_service.py`: soporta `type="image"` y `type="raw"`; `image` decodifica base64 y manda al backend.
2. En `local_printer_agent_printer.js` y `local_printer_proxy_printer.js`, corrige el payload:
   - Si se está enviando un PNG/JPEG base64 del recibo, **usar** `type: "image"` (no `"raw"`).
   - Asegura `filename` (ej: `receipt.png`) cuando aplique.
> Nota: En Odoo 18, el flujo de impresión POS incluye servicios como `printer_service` / `render_service` usados por `PosStore.printReceipt` (ver stack trace oficial).
### C2) Imprimir una imagen dentro del recibo (OrderReceipt y/o Kitchen)
1. Agrega un campo `receipt_image` (Image) en `pos.config` (o usa `company_id.logo` si aplica), y **cárgalo al POS** mediante `_loader_params_pos_config`.
2. En frontend:
   - expón `receiptImageSrc = "data:image/png;base64," + pos.config.receipt_image` (si existe).
   - Inserta un `<img>` en el template del recibo (OrderReceipt y opcionalmente OrderChangeReceipt).
   - **Obligatorio**: usa data URI para evitar problemas de carga async/CORS en render-to-image.
3. Verifica también recibo de cambios (cocina). En Odoo, se renderiza un template tipo `OrderChangeReceipt` usado en la impresión de cocina/self-order según referencias oficiales.
# Procedimiento de verificación en el repo oficial (OBLIGATORIO)
1. Checkout branch `18.0`.
2. Localiza y confirma:
   - Clase/método `PosStore._createPrinter` (o el punto de extensión real en 18.0).
   - Firmas esperadas de impresión para HW proxy (`/hw_proxy/print_receipt`) y el formato de payload (keys esperadas).
   - Templates de recibos (`OrderReceipt`, `OrderChangeReceipt`) y cómo reciben props/env.
3. Documenta en la respuesta:
   - Branch consultado: `18.0`
   - Rutas de archivos verificadas
   - Evidencia mínima (extractos relevantes, sin pegar archivos completos)
# Cambios esperados (código)
Entrega commits (o patches) con:
- Python:
  - nuevos campos/selecciones en `pos.config`
  - grupo de seguridad + access si aplica
- XML:
  - vistas ajustadas con `groups=...` y sin romper UX
- JS:
  - patch condicional a `_createPrinter` con `super`
  - envío correcto `type:"image"` en Agent/Legacy
  - extensión de templates para imprimir imagen embebida
# Checklist de aceptación
- [ ] Con el módulo instalado y **suite desactivada**, POS imprime exactamente como Odoo estándar.
- [ ] Solo usuarios con el grupo nuevo pueden activar/usar la suite.
- [ ] En modo Agent, el agente recibe `type="image"` y se imprime el recibo incluyendo la imagen embebida.
- [ ] En modo Legacy (HW proxy), el recibo se imprime como imagen y contiene la imagen embebida.
- [ ] Multi-company: record rules y company_id respetados.
- [ ] No se introducen `sudo()` innecesarios.
```
---
## Mejoras clave incluidas en el prompt
- “Feature flag” + grupo de seguridad para **no interferir** con Odoo estándar.
- Corrección del **tipo** de impresión en el agente (`image` vs `raw`).
- Inserción de imagen en recibo usando **data URI** para compatibilidad con render-to-image.
- Procedimiento explícito de verificación en repo oficial y evidencias mínimas.
## Técnicas aplicadas
- DECONSTRUCT → separación de compatibilidad, permisos y requerimiento de imagen.
- DIAGNOSE → detección de punto de falla probable: `type:"raw"` para base64 de imagen.
- DEVELOP → guardrails (no romper impresión estándar) + cambios defensivos.
- DELIVER → prompt ejecutable con checklist.
## Odoo (si aplica): versión, branch, rutas, evidencia
- Versión objetivo: **Odoo 18.0**
- Branch objetivo: **`18.0`** (verificar en `https://github.com/odoo/odoo`)
- Evidencias usadas:
  - Documentación oficial de patching en Odoo 18 (firma `patch(objToPatch, extension)` + `super`).
  - Referencias oficiales a bundles POS (`point_of_sale._assets_pos`) en Odoo 18 (forum Odoo).
  - Stack trace oficial de impresión POS que referencia `pos_store.js` y servicios de impresión/render.
  - Referencias oficiales a impresión de cambios/recibos de cocina/self-order y template relacionado.
> Nota de transparencia: el navegador de GitHub (blob) no devolvió el contenido de archivos directamente en esta sesión; por eso la verificación exacta de firmas/props/templates se deja como paso obligatorio en el prompt (checkout local del branch `18.0`).
## Checklist de validación rápida (manual)
1. Instalar el módulo en Odoo 18.0, **sin tocar** configuración → POS debe seguir imprimiendo como siempre.
2. Activar la suite en una `pos.config` y asignar impresoras:
   - Agent: prueba `POST /print` con `type=image`.
   - Legacy: prueba `/hw_proxy/print_receipt` con el payload correcto.
3. Verificar que el recibo incluye la imagen (logo/QR) en:
   - pantalla de recibo
   - impresión por Agent
   - impresión por Legacy
4. Probar con usuario sin grupo → no ve/usa suite, no afecta impresión.
