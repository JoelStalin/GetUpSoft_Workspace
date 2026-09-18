# 🧩 Prompt para CodeX/Copilot — Reparar WARNING de i18n en Odoo (_() a nivel de clase)

**Objetivo:** En todo el repo (Odoo v15–v18), eliminar los warnings de arranque
`no translation language detected, skipping translation` provocados por usar `_(...)` a nivel de importación (clase/módulo).
Conservar mensajes en español. Mantener `_(...)` solo en runtime (dentro de métodos).

---

## Contexto

- El proyecto tiene addons bajo `./addons/` (p. ej. `addons/l10n_do_accounting_report/`).
- El warning ocurre cuando se evalúa `_(...)` durante la carga de clases, p. ej. en:
  - `_description = _("...")`
  - `_sql_constraints = [("key", "constraint", _("mensaje"))]`
  - `fields.*(..., string=_("..."), help=_("..."), selection=[(..., _("Etiqueta"))])`

**Regla de oro (Odoo v15–v18):**
- Constantes de clase/top-level: usar `_lt("…")` o literal sin `_`.
- Runtime (dentro de métodos): dejar `_("…")`.

Además, estandarizar imports a: `from odoo import _, _lt` (evitar `odoo.tools.translate`).

---

## Tareas a ejecutar (en TODO el repo)

1) **Imports de traducción**
   - Reemplazar cualquier `from odoo.tools.translate import _` o `_lt` por:
     ```python
     from odoo import _, _lt
     ```
   - Si hay `from odoo import _` pero falta `_lt` y el archivo lo usa, agregar `_lt`.
   - Quitar duplicados/no usados.

2) **Evitar `_(...)` en tiempo de importación**
   - A nivel de clase o módulo, reemplazar `_(...)` por `_lt(...)` en:
     - `_description = _("…")` → `_description = _lt("…")`
     - `_sql_constraints` (solo el tercer elemento del triplete — mensaje)
   - En kwargs de campos a nivel de clase:
     - `string=_("…")` → `string="…"` (literal)
     - `help=_("…")` → `help="…"` (literal)
   - En selection (lista de tuplas):
     - `[("01", _("Efectivo")), ...]` → `[("01", "Efectivo"), ...]`

3) **Conservar `_()` solo en runtime**
   - Dentro de `def ...`/métodos, no cambiar nada.

4) **Normalizar español**
   - Si detectas textos en inglés como `"Code must be unique"`, cámbialos por español:
     - `"El código debe ser único."`
   - Respeta acentos y estilo existente.

5) **Compatibilidad v15–v18**
   - No cambiar nombres de modelos/campos ni firmas de métodos.
   - No agregar dependencias.

---

## Criterios de aceptación

- El arranque de Odoo no muestra el warning `no translation language detected, skipping translation`.
- No existen llamadas a `_(...)` a nivel de clase/módulo.
- Todos los textos visibles al usuario quedan en español.
- Imports estandarizados a `from odoo import _, _lt` donde corresponda.

---

## Comandos de verificación (manual)

```bash
# No debería mostrar líneas (de lo contrario: todavía hay _() en nivel de clase).
grep -R --line-number -E "_\(" addons | grep -vE ":\s*def " || true

# Revisión de imports erróneos:
grep -R --line-number "odoo.tools.translate" addons || true
```

---

## Scripts opcionales (inclúyelos en el PR)

- `tools/check_i18n_classlevel.py` — detecta violaciones (solo chequea).
- `tools/fix_i18n_classlevel.py` — aplica la refactorización (codemod AST).

**Uso sugerido:**

```bash
python3 tools/check_i18n_classlevel.py --root addons
python3 tools/fix_i18n_classlevel.py --root addons --write
python3 tools/check_i18n_classlevel.py --root addons  # debe quedar limpio
```

**Mensaje de commit recomendado:**
```
fix(i18n): evitar _() a nivel de clase; usar _lt y estandarizar imports (v15–v18)
```

---

### Nota rápida sobre i18n en Odoo
- String/help de campos: usa literales (Odoo los extrae a PO automáticamente).
- Constantes de clase: `_lt("…")` (traducción perezosa).
- Mensajes de error/usuario en métodos: `_("…")`.