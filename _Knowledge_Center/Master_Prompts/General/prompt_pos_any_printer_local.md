Hello! I'm Lyra, your AI prompt optimizer. I transform vague requests into precise, effective prompts that deliver better results.

*What I need to know:*
- *Target AI:* ChatGPT, Claude, Gemini, or Other
- *Prompt Style:* DETAIL (I'll ask clarifying questions first) or BASIC (quick optimization)

*Examples:*
- "DETAIL using ChatGPT → Write me a marketing email"
- "BASIC using Claude → Help with my resume"

Just share your rough prompt and I'll handle the optimization!

---

# Diagnóstico y prompt maestro para corregir assets POS + agregar impresión de factura como imagen (pos_any_printer_local)

## Modo
DETAIL (auto)

## Resumen del entendimiento
Tienes un POS (Odoo v17+ asumido) donde aparece en consola:

- `The following modules are needed by other modules but have not been defined...` (assets/bundle incorrecto o rutas/imports incorrectos).
- `The following modules could not be loaded because they have unmet dependencies...` (error secundario por el anterior).
- `Failed to load resource: net::ERR_CONNECTION_TIMED_OUT` hacia `192.168.1.150/hw_proxy/customer_facing_display` (proxy/hw_proxy no accesible o mal configurado).

Quieres:
1) Un **prompt** listo para copiar/pegar que guíe a una IA a **solucionar** el problema de assets y conectividad, y  
2) **Agregar una función** para **imprimir la factura (ticket/recibo) como una imagen**, y  
3) Hacer una **revisión completa** del módulo **`pos_any_printer_local`**.

## Estado de evidencias
**Provistas (parcial):**
- Fragmentos de consola del navegador con el error de assets y el timeout a `/hw_proxy/customer_facing_display`.

**No provistas (críticas para una revisión real del módulo):**
- Código fuente de `pos_any_printer_local` (zip o repo).
- `__manifest__.py` y listado de assets.
- Logs del servidor Odoo (nivel debug) durante carga del POS.
- Versión exacta de Odoo (17/18/19) y edición (CE/EE).
- Config del hardware proxy/IoT (servicio, puertos, host).

## Preguntas (máximo 3) — responde si puedes
1) ¿Confirmas la **versión exacta**: Odoo 17, 18 o 19?  
2) ¿Puedes compartir el módulo **`pos_any_printer_local`** (zip o pegar `__manifest__.py` + `static/src/**/*` + cualquier controlador Python)?  
3) **¿Dispones de alguna de las siguientes evidencias que puedas compartir?**  
   - Mensajes de error (traceback completo).  
   - Logs relevantes de Odoo (servidor, `_logger`).  
   - Código actual (modelo, método, vista, assets).  
   - Diferencias entre comportamiento esperado vs. real.  
   - Capturas textuales del error (copiadas, no imágenes).

> Si no tienes nada más, el prompt de abajo funciona igual: obliga a trabajar con supuestos y a pedir lo mínimo.

---

## Prompt optimizado (copiar/pegar tal cual)

```md
# Prompt de debugging + feature (Odoo v17+) — POS assets + impresión como imagen + auditoría de módulo

## Rol
Actúa como **Arquitecto Senior de Odoo (v17+)** y especialista en **POS (Point of Sale) frontend** (OWL/JS) + backend Python.

## Paso previo obligatorio (NO lo omitas)
1) Indica qué **evidencias** fueron proporcionadas (logs, traceback, código, manifest, screenshots de consola).
2) Si hay evidencias, **analízalas primero** y cita exactamente qué línea/archivo sugiere la causa.
3) Si NO hay evidencias suficientes, declara explícitamente **supuestos** y diseña un plan defensivo.

## Restricciones no negociables
- Solo Odoo **v17, v18 o v19** (si existe públicamente). Si el proyecto está en v16 o inferior: **proponer migración o adaptación a v17+**.
- Priorizar ORM, respetar ACL/Record Rules/multi-company.
- `sudo()` solo con justificación.
- Overrides con `super()`.
- **Odoo v17+ (XML): NO usar `attrs="..."` ni `invisible="..."` con dominios/expresiones antiguas.** Trasladar condiciones a backend (campos booleanos/compute) o rediseñar UX.
- Para assets POS en v17: usar bundle **`point_of_sale._assets_pos`** (no `point_of_sale.assets_pos`). (Referencia comunitaria y ejemplo de clave de bundle en Odoo 17). 

## Contexto (rellenar con lo que tenga el usuario)
- Versión Odoo: {17/18/19 o "desconocida"}
- Edición: {CE/EE}
- Módulo a revisar: `pos_any_printer_local`
- Error consola (texto exacto):
  - "The following modules are needed by other modules but have not been defined..."
  - "The following modules could not be loaded..."
  - Timeout: `http://192.168.1.150/hw_proxy/customer_facing_display`
- Objetivo:
  1) Arreglar carga de módulos JS en POS (assets/deps/imports).
  2) Arreglar conectividad del customer facing display (hw_proxy).
  3) Implementar **Imprimir factura/recibo como IMAGEN** desde POS usando impresora local (módulo `pos_any_printer_local`).

## Tarea A — Diagnóstico de Assets (causa raíz y fix)
1) Explica por qué aparece "modules needed but not defined" en Odoo v17+:
   - bundle incorrecto en `__manifest__.py` (clave errónea o assets fuera de `point_of_sale._assets_pos`)
   - rutas mal declaradas, archivos no incluidos, glob incorrecto
   - archivos sin `/** @odoo-module **/` (cuando aplique)
   - imports con path equivocado (`@point_of_sale/...` vs `point_of_sale....`)
   - nombre de módulo JS (`odoo.define('x.y', ...)`) no coincide con `require(...)` o se mezclan estilos (AMD vs ES module)
2) Inspecciona `pos_any_printer_local/__manifest__.py` y determina:
   - clave de assets usada
   - orden/precedencia de archivos
   - si hay dependencias faltantes en `depends`
3) Entrega un **parche concreto** (diff o snippets) para:
   - corregir `assets` → incluir JS/XML/CSS en `point_of_sale._assets_pos`
   - asegurar `/** @odoo-module **/` y migración a imports correctos para v17
   - limpiar caché: `-u pos_any_printer_local --stop-after-init`, `?debug=assets`, borrar `web.assets_*` si aplica, hard reload.

## Tarea B — Customer Facing Display (hw_proxy timeout)
1) Explica qué significa `ERR_CONNECTION_TIMED_OUT` hacia `/hw_proxy/customer_facing_display`:
   - host IP inaccesible (red/VLAN/WiFi)
   - servicio hw_proxy/IoT box caído
   - firewall/puerto incorrecto
   - URL base mal configurada en POS/IoT
2) Propón un checklist de verificación con comandos/URLs:
   - `ping 192.168.1.150`
   - abrir `http://192.168.1.150/hw_proxy/status` (o endpoint equivalente)
   - revisar servicio (systemd/docker), puertos, reverse proxy, CORS si aplica
3) Proponer ajustes seguros y mínimos (sin abrir puertos innecesarios).

## Tarea C — Feature: Imprimir factura/recibo como **imagen**
### Requisito funcional
Desde el POS, el usuario puede imprimir el recibo/factura como imagen (PNG) en una impresora local soportada por `pos_any_printer_local`.

### Diseño técnico (obligatorio)
1) Define el flujo:
   - Obtener HTML/QWeb del receipt (Order receipt).
   - Renderizar a canvas (p.ej. `html2canvas` o estrategia equivalente compatible con Odoo POS).
   - Convertir a imagen PNG en base64.
   - Enviar al backend/proxy local de impresión (según arquitectura del módulo) como:
     - PNG base64, o
     - raster ESC/POS (si la impresora es térmica ESC/POS), o
     - imagen para driver nativo.
2) Implementa un **adapter**:
   - `printReceiptAsImage(order)` que devuelva `Promise<{ mime, data, width, height }>`
   - `sendToLocalPrinter(payload)` que use la API existente del módulo (websocket/http).
3) Considera:
   - ancho máximo (58mm ~ 384px, 80mm ~ 576px) y escalado
   - conversión a blanco/negro y dither (si ESC/POS)
   - manejo offline/cola de impresión
   - fallback: si falla imagen, imprimir texto como antes.

### Entregables mínimos de código
- Snippet(s) JS OWL POS (v17+), ubicados en `pos_any_printer_local/static/src/...`
- Actualización de `__manifest__.py` assets
- Si se requiere backend:
  - controlador/route para recibir la imagen y pasarla al driver local
  - seguridad: solo POS sessions autorizadas, tokens, CSRF según corresponda
- Pequeño test manual reproducible (pasos + criterio de aceptación)

## Tarea D — Revisión completa del módulo `pos_any_printer_local`
Produce una auditoría técnica con:
1) **Mapa de arquitectura** (frontend/back, servicios, endpoints, dependencias).
2) Revisión de:
   - `__manifest__.py` (depends, assets, data)
   - JS: imports, estilo (`@odoo-module`), nombres, registry, patches, uso de services
   - Python: modelos, controllers, `sudo()` indebido, multi-company
   - Seguridad: ACL, record rules, exposición de endpoints
   - Calidad: logs, manejo de errores, i18n, lint, pruebas
3) Lista de **issues** priorizados (P0/P1/P2) con impacto y fix recomendado.
4) Pull-request plan: commits sugeridos por tema.

## Formato de salida (obligatorio)
Devuelve un único `.md` con:
1) Diagnóstico basado en evidencias (o supuestos)
2) Causa raíz + fix exacto (diff/snippets)
3) Diseño + código para impresión como imagen
4) Checklist de validación y pruebas
5) Riesgos y rollback plan
```

---

## Mejoras clave introducidas en el prompt
- Enfoca el error real (assets POS) y obliga a encontrar **causa raíz** (bundle/rutas/imports).
- Separa el timeout de `hw_proxy` como problema independiente (red/servicio).
- Define una implementación concreta de **“imprimir como imagen”** con adapter + payload.
- Fuerza revisión integral del módulo con prioridades (P0/P1/P2) y plan de PR.

## Técnicas aplicadas
- 4-D: Deconstruct → Diagnose → Develop → Deliver.
- Guardrails Odoo v17+: assets y prohibiciones de XML (`attrs`/`invisible` legacy).
- “Evidencia primero”: no inventar causas si hay logs/código.

## Odoo (verificación / evidencia mínima)
- En Odoo v17, la inyección de assets POS se realiza mediante bundles declarados en el manifest; la documentación explica el concepto de **bundles** y su declaración en `__manifest__.py`.  
- En discusiones de la comunidad para Odoo 17 se indica usar `point_of_sale._assets_pos` para POS assets (y no `point_of_sale.assets_pos`).  

Referencias:
- Documentación de assets Odoo 17: https://www.odoo.com/documentation/17.0/developer/reference/frontend/assets.html  
- Hilo comunitario sobre `point_of_sale._assets_pos`: https://www.odoo.com/forum/point-of-sale-15/pos-product-info-popup-inheritance-not-loading-from-custom-module-280121  

Nota: si me compartes el código del módulo, puedo “rellenar” el prompt con rutas/archivos exactos y un diff listo.

## Checklist de validación (para ejecutar)
- [ ] POS abre sin errores de assets en consola.
- [ ] `?debug=assets` muestra que tus JS/XML están en `point_of_sale._assets_pos`.
- [ ] Las funciones del módulo se registran en el POS (logs/control button/popup).
- [ ] `192.168.1.150/hw_proxy/...` responde (status) desde el dispositivo POS.
- [ ] Imprimir como imagen:
  - [ ] genera PNG base64 correctamente
  - [ ] llega al servicio local de impresión
  - [ ] imprime a escala correcta (58/80mm)
  - [ ] fallback funcional si falla la imagen
```

---

## Nota sobre el PDF adjunto
Se incluyó como referencia general sobre Odoo/ERP (no contiene detalles del módulo ni del error actual). fileciteturn0file0
