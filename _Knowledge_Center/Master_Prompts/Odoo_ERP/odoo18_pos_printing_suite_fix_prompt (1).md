# Fix Odoo 18.0: POS Printing Suite + solución RPC_ERROR (relaxng) + impresión como imagen (Agent & Legacy)

## Modo
DETAIL (con evidencias provistas)

## Resumen del entendimiento
Quieres:

1) **Resolver el RPC_ERROR** al actualizar módulos en tu instancia (`AssertionError: Element odoo has extra content: data, line 3`).
2) Asegurar que el módulo **pos_printing_suite** (adjunto) sea **compatible con Odoo 18.0**.
3) Incluir una modificación para que el módulo **NO bloquee** la impresión “por defecto” de Odoo, **a menos** que el usuario tenga permiso explícito para usar la suite.
4) Que **tanto en el Agent (Local Printer Agent)** como en el modo **Legacy / HW Proxy** se **imprima como imagen**.

## Estado de evidencias
**Provistas por ti:**
- Traceback completo del servidor (RPC_ERROR) con `relaxng.assert_(doc)` y mensaje: `Element odoo has extra content: data, line 3`.

**Analizadas en el módulo adjunto (pos_printing_suite.zip):**
- El **Local Printer Agent** expone `POST /print` y soporta `type: raw|pdf|image`. (En el código del agente, `type == "image"` llama a `print_image`.)
- En el frontend del módulo, el printer Local Agent estaba enviando `type: "raw"`, lo que **impide/imposibilita** imprimir imágenes correctamente (y explica tu requerimiento de imprimir como imagen).

## Prompt optimizado (copiar/pegar)

> **Rol:** Actúa como **Arquitecto Senior Odoo 18.0** y desarrollador full-stack (Python + OWL/JS) experto en POS e integración con agentes locales/IoT.  
> **Restricciones:** ORM-only, seguridad (ACL/record rules/multi-company), overrides con `super()`. No romper impresión nativa por defecto.  
> **Repositorios a usar:**  
> - Odoo Community: `odoo/odoo` branch `18.0`  
> - Repo del cliente: `JoelStalin/Chefalitas` (rama actual)  
> - Módulo a corregir: `pos_printing_suite` (zip adjunto / o carpeta del repo)

### 1) Diagnóstico obligatorio (antes de tocar código)
1. Reproducir el error en modo developer/verbose:
   - Ejecutar upgrade del módulo que dispara el crash.
   - Activar logs: `--log-level=debug` y capturar la línea donde Odoo indica el **archivo XML** que falla.
2. Confirmar versión exacta: **Odoo 18.0** (community/enterprise) y commit/paquete instalado.
3. Identificar **qué XML** está causando: `AssertionError: Element odoo has extra content: data, line 3`.

### 2) Fix del RPC_ERROR (relaxng)
**Hipótesis principal (muy probable en Odoo 18.0):**
- Hay un XML con estructura:
  ```xml
  <odoo>
    <data> ... </data>
  </odoo>
  ```
  y el validador relaxng de Odoo 18 rechaza `<data>` como hijo de `<odoo>` (de ahí: “extra content: data, line 3”).

**Acción:**
- Para cada XML de `data/` y `views/` del repo del cliente, buscar `<odoo>` seguido de `<data>` en las primeras líneas y **eliminar el wrapper `<data>`**:
  - Mover los `<record/>`, `<template/>`, `<menuitem/>`, etc. directamente dentro de `<odoo>`.
- Confirmar que **no quedan** archivos con `<odoo><data>`.

**Entregable:** commit/PR que elimina esos wrappers y el upgrade deja de fallar.

### 3) Compatibilidad Odoo 18.0 del módulo pos_printing_suite
Validar en `odoo/odoo` 18.0 (código fuente):
- Keys de assets POS (p. ej. `point_of_sale._assets_pos`).
- APIs POS para carga de campos (p. ej. `_loader_params_pos_config`, `_load_pos_data_fields`).
- Ruta/módulo correcto de `PosStore` (en Odoo 18 suele estar en `@point_of_sale/app/services/pos_store`).

**Acción:**
- Ajustar imports/patches JS del módulo para apuntar a la ruta real del `PosStore` en 18.0.
- Mantener el patch con `patch(PosStore.prototype, {...})` y el hook que crea impresoras por tipo.

### 4) No bloquear la impresión nativa por defecto (gating por permisos)
**Objetivo:** Si el usuario **NO** tiene permiso de la suite, el POS debe comportarse igual que Odoo estándar.

Implementar:
1. Un grupo nuevo `pos_printing_suite.group_pos_printing_suite_print`.
2. Campo booleano en `pos.config` (no almacenado) `printing_suite_allowed`, computed con:
   - `self.env.user.has_group("pos_printing_suite.group_pos_printing_suite_print")`
3. Incluir `printing_suite_allowed` en el loader del POS.
4. En el patch JS, **si `printing_suite_allowed` es false → NO crear printers custom** (retornar `null` y dejar que el core resuelva).

Además:
- Cambiar `printing_mode` para que por defecto sea **Odoo default** (opt-in):
  - Agregar opción `odoo_default`
  - Default = `odoo_default`
  - No requerir device/token si no se usa local_agent.

### 5) Imprimir como imagen en Agent y Legacy
**Agent (Local Printer Agent):**
- Enviar al endpoint `/print`:
  ```json
  { "type": "image", "printer": "...", "data": "<base64>" }
  ```

**Legacy / HW Proxy:**
- Enviar el base64 como **imagen**, con payload compatible y fallback de endpoints:
  - Probar `/hw_proxy/print_image`, luego `/hw_proxy/print_receipt`, luego `/hw_proxy/default_printer_action`
  - Incluir keys: `type`, `printer`, `printerName`, `data`, `receipt`

**Criterio de aceptación:**
- Ticket/recibo sale como imagen en ambos modos (agent y proxy).
- Sin permisos de la suite: impresión estándar de Odoo sigue intacta.

### 6) Entregables
1. PR/commit con el fix del XML (RPC_ERROR).
2. PR/commit con cambios del módulo `pos_printing_suite`:
   - gating por grupo
   - default no bloqueante
   - impresión como imagen en agent y legacy
   - ajustes de rutas JS para Odoo 18
3. Checklist de validación + pasos de prueba manual (POS en modo debug).

## Mejoras clave incluidas
- Gating por grupo (opt-in) para no interferir con impresión nativa.
- Impresión como imagen alineada con capacidades reales del agente (`type=image`).
- Fallback de endpoints en HW Proxy para compatibilidad con proxies legacy.
- Default de configuración “Odoo default” para evitar bloqueos por constraints.

## Técnicas aplicadas
- 4-D (Deconstruct / Diagnose / Develop / Deliver)
- Diseño defensivo (fallbacks + no-breaking default)
- Validación contra branch oficial objetivo (18.0)

## Odoo (si aplica): versión, branch, rutas, evidencia
- Versión objetivo: **Odoo 18.0** (branch `18.0` en `odoo/odoo`)
- Componentes relevantes:
  - POS loader backend: `_loader_params_pos_config`, `_load_pos_data_fields`
  - POS frontend: `PosStore` (ubicación real a confirmar en 18.0)
  - Printing pipeline: `BasePrinter` y render service (recibo como imagen)

## Checklist de validación
- [ ] El upgrade ya no lanza: `Element odoo has extra content: data`
- [ ] No existen XML con `<odoo><data>` en el repo de addons custom
- [ ] `pos_printing_suite` instala y actualiza en Odoo 18.0
- [ ] POS abre sin errores JS (assets compilan)
- [ ] Sin grupo `group_pos_printing_suite_print` → impresión nativa funciona igual que antes
- [ ] Con el grupo → imprime vía Agent (type=image) y vía Proxy (type=image, endpoints fallback)
- [ ] Multi-company: device rule OK
- [ ] Sin `sudo()` innecesario (justificado donde aplique)

## Evidencias adicionales que ayudarían (si las tienes)
- ¿Puedes indicar **qué módulo** estabas actualizando cuando explotó (nombre técnico)?
- ¿Tienes el **log de Odoo** con la línea que indica el **archivo XML exacto** que falla?
- ¿Puedes compartir el **XML** que sospechas o la ruta en el repo?
