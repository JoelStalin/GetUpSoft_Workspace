# Fix Odoo 18 — OwlError: `res.config.settings.printing_mode` undefined (Settings no abre)

## Modo
DETAIL (debugging guiado por evidencias)

## Resumen del entendimiento
En **chefalitas.com.do** al abrir **Ajustes** aparece un **OwlError** y el “cause” indica:

> `Error: "res.config.settings"."printing_mode" field is undefined.`

Esto significa que **alguna vista** (XML/QWeb/Settings) está intentando renderizar `<field name="printing_mode"/>` **sobre el modelo** `res.config.settings`, pero **ese campo no existe** en Python en ese modelo (o no se está importando/cargando).

## Estado de evidencias
**Provistas por el usuario:**
- Traceback/stack del navegador (Owl lifecycle) indicando el campo faltante en `res.config.settings`.

**No provistas (aún):**
- Nombre del módulo exacto que añade la vista.
- Ruta/archivo XML donde aparece `<field name="printing_mode"/>`.

## Diagnóstico (por qué pasa)
En Odoo 17+ / 18, **si una vista referencia un campo inexistente**, el cliente web (OWL) falla al compilar el árbol de campos y rompe el ciclo de render de Ajustes. Esto deja “Settings” inaccesible hasta corregir el XML o definir el campo.

## Solución recomendada (production‑safe)
Hay 2 soluciones válidas; la correcta depende de **qué signifique** `printing_mode` en tu proyecto.

### Opción A (recomendada): `printing_mode` es por **POS específico**
En Odoo 18 las configuraciones del POS en Ajustes se seleccionan por terminal (dropdown “Point of Sale / Punto de Venta”). Lo común es que `res.config.settings` tenga un `pos_config_id` y los campos de POS en Ajustes sean **related** a `pos_config_id`.

**Fix:** definir `printing_mode` en `res.config.settings` como `related` a `pos_config_id.printing_mode`.

**Python (en tu módulo custom que añadió la vista):**
```py
# models/res_config_settings.py
from odoo import fields, models

class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    # Asume que ya existe pos_config_id en res.config.settings (Odoo POS settings)
    printing_mode = fields.Selection(
        related="pos_config_id.printing_mode",
        readonly=False,
    )
```

**Import obligatorio:**
- `models/__init__.py` debe importar `res_config_settings.py`.
- `__init__.py` del módulo debe importar `models`.

### Opción B: `printing_mode` es un parámetro global (no por POS)
Si realmente quieres un valor global, usa `config_parameter`:

```py
from odoo import fields, models

class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    printing_mode = fields.Selection(
        selection=[
            ("odoo_default", "Odoo Default"),
            ("agent", "Local Printer Agent"),
            ("legacy", "Legacy HW Proxy"),
        ],
        default="odoo_default",
        config_parameter="pos_printing_suite.printing_mode",
    )
```

> Nota: esta opción NO permite configurar distinto por cada POS terminal.

## Paso 1 — Identificar qué vista/módulo está rompiendo Settings (sin adivinar)
En el servidor (modo shell):

```bash
./odoo-bin shell -d <TU_DB>
```

Luego:

```py
# 1) Encontrar vistas que mencionan printing_mode
views = env["ir.ui.view"].search([("arch_db", "ilike", "printing_mode")])
[(v.id, v.name, v.key, v.xml_id, v.model) for v in views]

# 2) Si hay muchas, filtra por res.config.settings
views_settings = views.filtered(lambda v: v.model == "res.config.settings")
[(v.id, v.name, v.key, v.xml_id) for v in views_settings]
```

Con eso obtienes:
- **xml_id** → te dice el módulo que lo define
- **key** / **name** → te ayuda a encontrar el archivo XML

## Paso 2 — Hotfix de emergencia (si no puedes entrar a Ajustes ahora mismo)
Mientras haces el fix definitivo, puedes **desactivar** temporalmente la vista problemática:

```py
# ⚠️ Solo admins, y como medida temporal:
bad = env["ir.ui.view"].search([
    ("model", "=", "res.config.settings"),
    ("arch_db", "ilike", "printing_mode"),
])
bad.write({"active": False})
```

Luego reinicia Odoo y ya podrás entrar a Ajustes para terminar el arreglo.

## Paso 3 — Validación
1) Reinicia Odoo y actualiza el módulo:
```bash
./odoo-bin -d <TU_DB> -u <MODULO_QUE_CONTIENE_EL_FIX> --stop-after-init
```
2) Abre **Ajustes** (Settings) y verifica que ya no aparece el OwlError.
3) Si la opción `printing_mode` debe verse solo para usuarios autorizados:
   - no uses `attrs`/`invisible` legacy en Odoo 17+,
   - usa un **boolean computado** (backend) y decide qué mostrar en UI a partir de esa bandera.

## Prompt optimizado (para que otra IA te genere el PR con el fix)
Copia/pega tal cual:

```md
# Objetivo: arreglar crash de Settings en Odoo 18 (OwlError field undefined)

Actúa como Arquitecto Senior de Odoo (v18.0). Trabaja SOLO con Odoo 18.

## Evidencias
Tengo este error al abrir Ajustes:
- OwlError: "res.config.settings"."printing_mode" field is undefined.

## Contexto
Repo: Chefalitas (addons custom)
Odoo: 18.0
Meta: Ajustes debe abrir sin errores. El campo printing_mode debe funcionar (por POS si aplica) y no romper Settings.

## Tareas
1) Identificar en el repo qué módulo/vista XML agrega `<field name="printing_mode"/>` en `res.config.settings`.
   - Indicar archivo(s), ruta(s) y xml_id(s).
2) Proponer el fix correcto:
   - Opción A (por POS): definir `printing_mode` en `res.config.settings` como `related="pos_config_id.printing_mode"`.
   - Opción B (global): usar `config_parameter="pos_printing_suite.printing_mode"`.
3) Implementar el fix con código listo:
   - Python: `models/res_config_settings.py`
   - imports correctos (`__init__.py`)
   - si hace falta: migración/upgrade seguro
4) Entregar un diff estilo `git diff` + checklist de pruebas.

## Restricciones
- ORM-only.
- Multi-company y ACLs.
- No usar `attrs` / `invisible` legacy en vistas (Odoo 17+).
- `sudo()` solo si justificas.
```

## Checklist de validación
- [ ] Identifiqué el XML exacto que contiene `<field name="printing_mode"/>` en `res.config.settings`.
- [ ] El campo `printing_mode` existe en Python en `res.config.settings` (related o config_parameter).
- [ ] Imports correctos en `__init__.py` (módulo y subcarpetas).
- [ ] `-u <modulo>` corre sin errores.
- [ ] Settings abre sin OwlError.
- [ ] Si aplica, `printing_mode` se comporta por POS (pos_config_id) y no global.
