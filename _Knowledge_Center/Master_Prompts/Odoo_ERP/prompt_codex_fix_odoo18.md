# Prompt para Codex – Corrección y mejora de `pos_any_printer_local` (Odoo 18.0)

## Rol
Actúa como **Arquitecto Senior Odoo 18.0** (Community/Enterprise) y desarrollador experto en:
- Vistas XML Odoo 18 (validación estricta)
- POS (point_of_sale) y Restaurant / Kitchen (si aplica)
- OWL POS frontend, assets, loaders
- Seguridad (ACL, record rules, multi-company)
- Integración con agente local HTTP (Windows)

## Contexto y evidencias (ya provistas)
Tenemos un error al **actualizar el módulo**:

- **Modelo**: `ir.module.module`
- **Fecha**: 2025-12-30
- **Error**: `odoo.tools.convert.ParseError`
- **Archivo**: `/mnt/extra-addons/pos_any_printer_local/views/pos_config_view.xml`
- **Causa directa** (mensaje de Odoo):
  - “**El nombre de la etiqueta debe incluir 'para'**. Para que el estilo de la etiqueta sin corresponder coincida con el campo o botón, use `class="o_form_label"`.”

Ocurre “cerca de” este bloque en la vista padre:

```xml
<field name="other_devices" invisible="1"/>
<field name="is_posbox" invisible="1"/>
<field name="module_pos_hr" invisible="1"/>

<div class="oe_title" id="title">
```

Esto indica que el **XML heredado** está inyectando (o modificando) contenido en esa zona y contiene un `<label>` inválido (sin `for`) o un uso de etiqueta que Odoo 18 ya no permite sin `for`/clase.

## Repos y ramas obligatorias a consultar (CRÍTICO)
1) **Repositorio oficial Odoo**: `https://github.com/odoo/odoo`  
   - **Branch objetivo**: `18.0`
2) **Repositorio donde se aplican cambios** (tu repo): el que contiene `pos_any_printer_local` y/o tus addons (usa el remoto configurado en el proyecto / CI).

**Regla:** Antes de tocar XPath o herencias, valida cómo es la vista base en Odoo 18.0 y hereda exactamente de la vista correcta (id + estructura real).

## Restricciones (Odoo 18+ / Proyecto)
- **Solo Odoo 18.0** (no soluciones v16 o inferiores).
- Priorizar **ORM** en backend (`self.env[...]`, `search`, `create`, `write`, etc.).
- Respetar **ACLs, Record Rules y multi-company**.
- `sudo()` solo si es imprescindible y documentado.
- Overrides con **`super()` obligatorio**.
- En vistas Odoo 17+ evitar lógica frágil en XML:
  - No basar UI crítica en `attrs` heredados; preferir campos booleanos computados en backend cuando haya condiciones dinámicas.

---

# Tarea A – Corregir el ParseError de la vista (OBLIGATORIO)

## A1) Reproducir y ubicar el `<label>` inválido
1) Abre `pos_any_printer_local/views/pos_config_view.xml`.
2) Identifica el `<label>` que Odoo está validando como inválido.
   - Puede estar dentro de tu XML heredado, o inyectado por tu XPath en una zona que lo convierte en inválido.
3) Explica **por qué** ese `<label>` no cumple:
   - Odoo exige `for="field_name"` cuando el label corresponde a un campo/botón.
   - Si es un “título visual” sin correspondencia, debe ser `<span class="o_form_label">Texto</span>` o `<div class="o_form_label">...</div>`.

## A2) Corrección compatible con Odoo 18
Aplica **una** de estas correcciones, según corresponda:

### Opción 1 (label asociado a un campo)
Reemplaza:
```xml
<label string="Impresora de cocina"/>
```
por:
```xml
<label for="local_printer_kitchen_name" string="Impresora de cocina"/>
```

### Opción 2 (label decorativo / encabezado)
Reemplaza:
```xml
<label string="Impresoras locales"/>
```
por:
```xml
<span class="o_form_label">Impresoras locales</span>
```

**Importante:** No uses `label` sin `for` en Odoo 18.

## A3) Verificar la vista padre y el XPath
- Confirma en Odoo 18.0 el **xmlid real** de la vista base que heredas (ej. `point_of_sale.pos_config_view_form` u otra).
- Ajusta el `inherit_id` y el `xpath` para que sea **estable**.
- Evita XPaths que dependan de nodos volátiles.
- Si inyectas cerca de `oe_title`, asegúrate de no romper el DOM esperado.

## A4) Entregable de la Tarea A
- Proporciona un **diff** (git patch) con:
  - el cambio exacto en `pos_config_view.xml`
  - explicación breve del root cause
- Asegura que el módulo:
  - instala,
  - actualiza (Upgrade),
  - y no arroja ParseError.

---

# Tarea B – Asegurar 2 impresoras (Caja y Cocina) en Odoo 18 (OBLIGATORIO)

## B1) Backend (pos.config)
1) En `pos.config` añade 2 campos (Char):
   - `local_printer_cashier_name`  (Caja)
   - `local_printer_kitchen_name`  (Cocina)
2) Añade también el endpoint/URL del agente si aplica:
   - `local_printer_agent_url` (Char, default `http://127.0.0.1:9060`)
3) Incluye estos campos en los loaders de POS Odoo 18:
   - Usa el método correcto en Odoo 18 (ver en `addons/point_of_sale` branch 18.0):
     - `_loader_params_pos_config()` y/o `_load_pos_data_fields()`
   - Asegura que estos campos lleguen al frontend POS.

## B2) Vista Odoo 18 (pos.config form)
- En el form de configuración del POS muestra:
  - “Impresora Caja”
  - “Impresora Cocina”
  - “URL Agente”
- Reglas de etiquetas:
  - No `label` sin `for`.
  - Si hay encabezados decorativos, usar `o_form_label`.

## B3) Frontend (POS OWL)
- En el flujo de impresión:
  - El recibo normal imprime en **Caja**.
  - Si hay impresora de **Cocina**, imprime un ticket de cocina adicional.
- Para cocina, mínimo viable:
  - ticket texto (order name, mesa si aplica, líneas, qty, notas).
- No rompas el flujo estándar si no hay impresora configurada.

## B4) Integración con el agente local (Windows)
El agente expone:
- `GET /printers`
- `POST /print` JSON:
  - `{"type": "raw|pdf|image", "printer": "NOMBRE", "data": "BASE64"}`

Asegura que tu JS:
- envíe `printer` = **caja** o **cocina** según corresponda
- use `type` correcto (ideal: `raw` para ESC/POS texto o `image`/`pdf` según tu implementación)

---

# Tarea C – Compatibilidad con “pos_any_printer” y “pos_self_order_any_printer” (Deseable pero recomendado)
1) Compara tu módulo local vs los módulos “pos_any_printer” y “pos_self_order_any_printer” (los dos).
2) Replica funciones esenciales:
   - selección de impresora por dispositivo/tipo
   - flujos de impresión POS + Self Order (si lo tienes instalado)
3) Mantén todo compatible con Odoo 18:
   - assets correctos (`__manifest__.py`)
   - imports OWL correctos
   - rutas y hooks válidos en 18.0

---

# Validaciones obligatorias (Checklist)
- [ ] `Upgrade` del módulo sin errores.
- [ ] Sin `ParseError` de vistas.
- [ ] En POS Config aparecen **Caja** y **Cocina**.
- [ ] Los campos llegan al frontend POS (ver `pos.config` cargado).
- [ ] Se imprime recibo en Caja.
- [ ] Se imprime ticket en Cocina cuando está configurada.
- [ ] Si Cocina está vacía, no falla nada.
- [ ] Multi-company: campos por config, sin fugas.
- [ ] Código y vistas pasan validación Odoo 18.

---

# Output requerido de Codex
Devuelve:
1) **Patch/diff** listo para commit (incluye archivos tocados).
2) Explicación breve del cambio.
3) Notas de prueba y cómo reproducir.

---

## Evidencias adicionales a pedir (si están disponibles)
Antes de finalizar el fix, solicita (si el usuario puede) lo siguiente:
- Contenido actual completo de `views/pos_config_view.xml`
- `__manifest__.py` del módulo
- Lista de addons instalados relacionados (`point_of_sale`, `pos_restaurant`, self order, etc.)
- Logs del servidor con `--log-handler odoo.tools.convert:DEBUG` (si persiste)
