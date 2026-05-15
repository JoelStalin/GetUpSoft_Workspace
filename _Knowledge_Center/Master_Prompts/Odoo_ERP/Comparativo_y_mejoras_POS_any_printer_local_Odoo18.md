# Comparativo y mejoras — POS Any Printer (Odoo 18 / branch 18.0)

## Modo
DETAIL

## Resumen del entendimiento
Quieres dos cosas:

1) **Comparar** los módulos:
- `pos_any_printer` (y su módulo hermano `pos_self_order_any_printer`) vs.
- `pos_any_printer_local`

2) **Mejorar `pos_any_printer_local`** para que cubra la misma intención funcional que los dos módulos “pos_any_printer”:
- POS normal (caja + comandas / cocina)
- POS Self-Order

Y además:
- Que el **usuario pueda elegir 2 impresoras**: una para **cocina** y otra para **caja**.
- Que el trabajo incluya un **prompt** que obligue a buscar en `https://github.com/odoo/odoo` **branch `18.0`** los addons/clases relevantes (POS printer, BasePrinter, SelfOrder, bundles de assets), y que revise **el repositorio donde se están aplicando los cambios**.

> Nota: tengo el código del **agente Windows** pegado en el chat (servidor HTTP/HTTPS con endpoints `/health`, `/printers`, `/print`, y endpoint legado ePOS).  

## Estado de evidencias
**Evidencias provistas:**
- Código de agente Windows (pegado en el chat).
- Código fuente de módulos en ZIP:
  - `pos_any_printer.zip` (contiene `pos_any_printer` y `pos_self_order_any_printer`)
  - `pos_any_printer_local.zip` (contiene `pos_any_printer_local`)

**Evidencias NO provistas (serían útiles si algo falla):**
- Traceback completo de Odoo.
- Logs del agente (agent.log).
- Logs del navegador (consola POS).
- Pasos exactos para reproducir (¿cuándo debe imprimir cocina? ¿al validar? ¿al enviar a cocina?).

---

## Comparativo técnico (alto nivel)

### 1) `pos_any_printer` (Odoo POS)
**Qué hace:**
- Extiende `pos.printer` agregando el tipo `any_printer`.
- Agrega campos para IP del printer (y/o config).
- En frontend POS crea un `AnyPrinter` que hereda `BasePrinter` y manda el trabajo a un endpoint tipo **hw_proxy** (`/hw_proxy/default_printer_action`), enviando un “receipt” (normalmente imagen/base64).

**Fortalezas:**
- Se integra con el flujo estándar de “order printers” de POS (cocina) usando el sistema de impresoras de Odoo (BasePrinter).

**Riesgos/observaciones:**
- El módulo asume un “proxy” compatible con `hw_proxy` (IoT/hw proxy) y **no** un agente genérico local.

### 2) `pos_self_order_any_printer` (Self-Order)
**Qué hace:**
- Parcha `SelfOrder` para setear el printer a `AnyPrinter` si hay config.
- Parcha `create_printer` para soportar `any_printer`.
- El código trae `alert(...)` de pruebas (esto debe eliminarse en producción).

### 3) `pos_any_printer_local`
**Qué hace hoy:**
- Agrega settings y campos a `pos.config` para imprimir hacia un **agente local** (por URL).
- Implementa servicio JS `local_printer_service` que consume `/health`, `/printers`, `/print`.
- Parcha **ReceiptScreen** para imprimir el recibo por el agente local (caja).
- **No** integra cocina (order printers) vía `BasePrinter` ni cubre Self-Order.

**Brechas principales vs. `pos_any_printer` + `pos_self_order_any_printer`:**
- Falta el equivalente a `AnyPrinter` (clase `BasePrinter`) para **cocina**.
- Falta el parche para **Self-Order**.
- Falta una UX clara para **2 impresoras** (caja y cocina).

---

## Mejoras aplicadas al módulo local (entregable)

He preparado un ZIP actualizado con:
- Mejora de `pos_any_printer_local` (caja + soporte de order printers tipo BasePrinter para cocina)
- Un **nuevo addon**: `pos_self_order_any_printer_local` (Self-Order)

### Cambios clave en `pos_any_printer_local`
1) **Dos impresoras** por configuración:
- `local_cashier_printer_name` (Caja)
- `local_kitchen_printer_name` (Cocina)
- Se mantiene `local_printer_name` como **legado** (alias de caja).

2) **Integración cocina / order printers**
- Se agrega tipo de impresora `pos.printer.printer_type = local_agent`
- Se implementa `LocalAgentPrinter` (hereda `BasePrinter`) y manda trabajos al agente (`/print` con `type=image`).
- Se parchea `PosStore.create_printer()` para instanciar `LocalAgentPrinter` cuando la impresora sea `local_agent`.

3) **Settings sin `attrs`/`invisible`**
- Las vistas fueron reescritas para no depender de `invisible=` / `attrs=` (regla v17+).

4) Servicio JS más robusto
- `local_printer_service` ahora soporta:
  - `printRaw`
  - `printReceipt`
  - `printImage` (para futuros usos)

### Nuevo addon: `pos_self_order_any_printer_local`
- Parcha `SelfOrder` para:
  - setear el printer principal a `LocalAgentPrinter` cuando la config esté activa
  - soportar `pos.printer` tipo `local_agent`

---

## Descargas
- **ZIP actualizado (addons)**: `pos_any_printer_local_improved.zip` (incluye `pos_any_printer_local` + `pos_self_order_any_printer_local`)

---

## Recomendaciones críticas para el agente Windows (según tu código)
Tu agente ya soporta:
- Listado de impresoras: `GET /printers`
- Healthcheck: `GET /health`
- Print genérico: `POST /print` con `{type, printer, data(base64)}`

Mejoras recomendadas para cumplir mejor el caso POS:
1) **Soportar 2 impresoras en GUI** (Cocina y Caja) y guardarlas en config:
   - `cashier_printer`
   - `kitchen_printer`

2) En `/print`, permitir `target` opcional:
   - Si el request no manda `printer`, usar:
     - `target="kitchen"` → kitchen_printer
     - `target="cashier"` (default) → cashier_printer

3) **Impresión de imágenes**:
   - Para POS cocina, Odoo suele mandar “tickets” como imagen base64.
   - Actualmente tu `print_image()` convierte a bytes crudos; eso **no imprime una imagen** en la mayoría de drivers Windows.
   - Recomendación: implementar impresión por GDI (`win32ui`) o usar un visor/driver que imprima PNG correctamente.

---

## Prompt optimizado (copiar/pegar)

```md
# Prompt (Odoo 18) — Comparar + Unificar Any Printer (POS + Self-Order) con Agente Local Windows

## Rol
Actúa como **Arquitecto Senior de Odoo v18 (branch 18.0)** y desarrollador POS (JS/OWL + Python ORM).

## Paso previo obligatorio (EVIDENCIAS)
Antes de proponer cambios, indica si el usuario proporcionó:
- Traceback completo (Odoo)
- Logs del agente (agent.log)
- Logs del navegador (POS console)
- Código actual (addons + agente)
- Pasos para reproducir (caja vs cocina vs self-order)

Si faltan evidencias, declara supuestos explícitos y diseña defensivamente.

## Restricciones (no negociables)
- **Solo Odoo v18**.
- ORM-only, respetar ACLs/record rules/multi-company; `sudo()` solo con justificación.
- Overrides con `super()`.
- **Regla XML v17+**: NO usar `attrs` ni `invisible` con expresiones; preferir backend/UX estable.
- Todo debe validarse contra `odoo/odoo` **branch 18.0**.

## Tareas
### A) Comparación
1) Comparar `pos_any_printer` + `pos_self_order_any_printer` vs `pos_any_printer_local`:
   - Modelos Python (`pos.config`, `pos.printer`)
   - Assets JS (BasePrinter / PosStore / SelfOrder)
   - Flujos: recibo (caja), comandas (cocina), self-order

### B) Búsqueda obligatoria en repo oficial (branch 18.0)
1) Clonar repo:
   - `git clone https://github.com/odoo/odoo.git`
   - `git checkout 18.0`
2) Buscar y documentar rutas exactas (con evidencia mínima):
   - `addons/point_of_sale/**`:
     - definición de `pos.printer` y tipos (`printer_type`)
     - `BasePrinter` y flujo `sendPrintingJob(img)`
     - `PosStore.create_printer()`
     - cómo se generan imágenes de tickets/recibos
   - `addons/pos_self_order/**`:
     - `SelfOrder` service y cómo setea printer
   - cualquier referencia a `hw_proxy` / impresión POS
3) En el reporte, listar:
   - Branch consultado
   - Rutas de archivos
   - Fragmentos mínimos relevantes (sin pegar demasiado)

### C) Cambios en el repositorio del proyecto
1) Revisar el repositorio donde se aplican cambios (URL/branch/commit que te pasaré).
2) Proponer PR con:
   - `pos_any_printer_local` mejorado para cocina + caja
   - (si aplica) addon extra para self-order
   - pruebas mínimas/manual test plan

### D) Especificaciones funcionales (obligatorio)
- El usuario debe poder elegir:
  - **Impresora Caja**
  - **Impresora Cocina**
- POS caja:
  - imprime el recibo al validar pago / botón imprimir
- POS cocina:
  - imprime comandas usando impresoras de pedido (order printers)
- Self-order:
  - imprime tickets/recibos por el mismo mecanismo local

### E) Agente Windows (obligatorio)
- Verificar que el agente implementa:
  - `GET /health`, `GET /printers`, `POST /print`
- Proponer mejoras para soportar 2 impresoras (caja/cocina) y `target`.
- Asegurar impresión correcta de **imagen** (PNG base64) en Windows.

## Formato de salida
Devuelve un único `.md` con:
- Comparativo y tabla de diferencias
- Evidencias analizadas o supuestos adoptados
- Branch y rutas exactas (repo oficial 18.0)
- Propuesta técnica + arquitectura
- Parches/código listo para pegar
- Checklist de validación (caja/cocina/self-order)
```

---

## Checklist de validación (QA rápido)
- [ ] Odoo 18: el módulo instala sin errores.
- [ ] POS abre (assets cargan, sin errores en consola).
- [ ] Caja: `printReceipt()` manda job al agente y se imprime.
- [ ] Cocina: se crea al menos una `pos.printer` tipo `local_agent` y se imprime una comanda.
- [ ] Self-Order: el servicio se parchea, y la impresión usa `LocalAgentPrinter`.
- [ ] Agente: `/health` responde, `/printers` lista, `/print` imprime.
- [ ] Seguridad: no se introducen `sudo()` innecesarios; nada rompe multi-company.

---

## Evidencia mínima de repo (lo que sí pude verificar por web)
- Existe el branch `18.0` del repo oficial `odoo/odoo`.  
- Referencias históricas a `point_of_sale.view_pos_config_form` como XMLID del form de `pos.config` (útil para herencias de vista).

