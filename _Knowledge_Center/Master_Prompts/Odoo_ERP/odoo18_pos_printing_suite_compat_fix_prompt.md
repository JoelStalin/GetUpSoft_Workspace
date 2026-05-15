# Auditoría de compatibilidad (Odoo 18.0) + Prompt de reparación — `pos_printing_suite`

## Modo
DETAIL (con supuestos defensivos)

## Resumen del entendimiento
Se adjuntó el módulo **`pos_printing_suite`** (ZIP) que añade un “Printing Suite” para POS (impresión vía **Local Agent en Windows** y/o **HW Proxy / Any Printer**).  
Necesitas:

1) Revisar que sea **100% compatible con Odoo 18.0** (branch `18.0` del repo oficial `odoo/odoo`).  
2) Elaborar un **prompt** listo para copiar/pegar que guíe a un desarrollador/IA a **corregir los fixes** necesarios.  
3) Incluir una **modificación funcional** para que el módulo **no interfiera con la impresión estándar** y/o **bloquee la funcionalidad de impresión** salvo que el usuario tenga el **permiso explícito** para imprimir (manteniendo el comportamiento por defecto “como se imprime actualmente”, según lo que definas como baseline en tu proyecto).

## Estado de evidencias
**Provistas:**
- Código del módulo (ZIP): `pos_printing_suite`.

**No provistas:**
- Traceback/logs del error actual, pasos de reproducción, consola del navegador, captura textual de fallos.

### Pregunta obligatoria (evidencias)
**¿Dispones de alguna de las siguientes evidencias que puedas compartir?**
- Traceback completo (server).
- Logs relevantes de Odoo (`--log-level=debug`, `_logger`).
- Errores de consola en POS (DevTools) y/o `web.assets_*` en modo debug.
- Comportamiento esperado vs. real (pasos 1..N).
- Código adicional local (otros módulos POS instalados) que pueda colisionar.

> Si no se aportan evidencias, se trabajará con supuestos razonables y una solución defensiva.

---

## DECONSTRUCT
### Componentes relevantes del módulo
- Modelos:
  - `pos.print.device`, `pos.print.device.token` (gestión de dispositivo + token).
  - Extensión de `pos.config` (modo de impresión, device, token, nombres).
  - Extensión de `pos.printer` (nuevos tipos `local_agent` y `hw_proxy_any_printer`).
- UI backend:
  - Vistas de `pos.config`, `pos.print.device` y wizard de build del agente.
- Frontend POS (OWL):
  - Parche de `PosStore._createPrinter()` para instanciar impresoras custom.

### Restricciones no negociables (Odoo 17+ / 18.0)
- ORM-only, seguridad (ACL/record rules, multi-company), overrides con `super()`.
- Evitar lógicas frágiles en XML (no `attrs` legacy; preferir booleanos técnicos computados en backend + `groups`).

---

## DIAGNOSE — Riesgos de compatibilidad detectados (sin ejecutar Odoo)
1) **Interferencia con flujo estándar de impresión**
   - `pos.config.printing_mode` está definido como `required=True` con `default="local_agent"`.
   - Esto puede inducir a que instalaciones existentes queden “forzadas” a la modalidad del módulo y potencialmente afecten el comportamiento actual.
   - Además, el constraint `_check_print_device` actualmente obliga `print_device_id` cuando `printing_mode == "local_agent"`: esto puede bloquear la configuración si el usuario no pretende usar Local Agent.

2) **Parche JS potencialmente frágil**
   - Se parchea `PosStore.prototype._createPrinter`.
   - Si el método cambió de nombre/ubicación en `18.0` (o su firma cambió), romperá el arranque de POS o la impresión.

3) **Modificadores `invisible="..."` en XML**
   - El módulo usa `invisible="printing_mode != 'local_agent'"`, `invisible="state != 'active'"`, etc.
   - Dependiendo del motor de vistas exacto en 18.0, esto puede requerir ajuste (ideal: booleanos técnicos computados).

4) **Campos backend no consumidos por frontend**
   - `pos.config` define `local_printer_*` pero el JS usa `pos.printer.local_printer_name` para elegir el nombre en Windows.
   - Puede haber un gap funcional (campos que no impactan realmente la impresión).

---

## DEVELOP — Ajustes recomendados para 100% compatibilidad + “no bloquear funciones actuales”
### Objetivo funcional propuesto (interpretación más segura)
- El módulo debe ser **opt-in**:
  - Por defecto debe seguir funcionando la impresión estándar de Odoo (sin alterar flujos).
  - Solo si un **administrador** configura el modo de impresión del módulo y el usuario tiene permiso, se activa el comportamiento “Printing Suite”.

### Cambios mínimos recomendados (arquitectura)
1) **Hacer `printing_mode` no intrusivo**
   - Añadir opción `odoo_default` (o `standard`) y ponerla como `default`.
   - Mantener `required=True` si quieres, pero con default no intrusivo.
   - Ajustar constraint para exigir `print_device_id` **solo** cuando `printing_mode == "local_agent"`.

2) **Permiso explícito para imprimir con el suite**
   - Crear grupo `pos_printing_suite.group_pos_printing_allowed`.
   - Exponer a POS (vía `pos.config` loader) un boolean `printing_suite_allowed` calculado con:
     - `self.env.user.has_group('pos_printing_suite.group_pos_printing_allowed')`
     - y `printing_mode in ('local_agent','hw_proxy')` (según tu diseño).
   - El JS debe **no** activar el printer custom si `printing_suite_allowed` es falso.

3) **No filtrar solo por “UI”**
   - Para Local Agent, si el usuario no tiene permiso, **no entregar** token en el payload a POS (token `None`).
   - Así, aunque “forceen” JS en consola, no tendrán token para imprimir.

4) **Vistas: reemplazar invisibles frágiles por booleanos técnicos**
   - Ejemplo: `show_local_agent_fields`, `show_hw_proxy_fields`, `can_activate`, etc. computados en backend.
   - Usar `groups="pos_printing_suite.group_pos_printing_allowed"` en secciones si aplica.

---

## DELIVER — Prompt optimizado (copiar/pegar)

```md
# Prompt: Reparar `pos_printing_suite` para Odoo 18.0 (compatibilidad total + no intrusivo + permisos)

## Rol
Actúa como **Arquitecto Senior de Odoo (v18.0)** y desarrollador experto en POS (OWL). Prioriza **ORM**, seguridad (ACL/record rules), multi-company, y overrides con `super()`.

## Paso previo obligatorio
1) Indica si el usuario proporcionó **tracebacks/logs/código adicional**.
2) Si existen evidencias, **analízalas primero** y deriva hipótesis desde ahí.
3) Si no existen, declara **supuestos** y procede de forma defensiva.

## Fuente de verificación (obligatoria)
- Repo oficial: `https://github.com/odoo/odoo`  
- Branch objetivo: **`18.0`**

Verifica, con rutas exactas:
- `addons/point_of_sale/...` (POS OWL store/printer)
- `addons/hw_proxy/...` (si aplica)
- IDs de vistas core para `pos.config` y `pos.printer`
- Campos/métodos core: `_loader_params_pos_config`, `_load_pos_data_fields`, `PosStore` y el método correcto para crear/gestionar printers

## Objetivo
A) Garantizar instalación/upgrade sin romper instancias existentes (no intrusivo).  
B) Asegurar compatibilidad 100% con Odoo 18.0 (backend + POS OWL).  
C) Implementar **bloqueo/permiso de impresión**: el Printing Suite solo se usa si el usuario tiene permiso explícito; de lo contrario se mantiene el flujo estándar de Odoo.

## Reglas técnicas (obligatorias)
- Odoo 18.0 only.
- ORM-only.
- Seguridad: ACL, record rules, multi-company.
- Evitar `sudo()` salvo justificación.
- Overrides con `super()`.
- Evitar `attrs` legacy y expresiones frágiles en vistas: preferir booleanos técnicos computados + `groups`.

## Tareas
### 1) Auditoría de compatibilidad
- Ejecuta un “diff mental” entre el módulo y Odoo 18.0:
  - Confirma si el método parcheado en JS (`PosStore._createPrinter`) existe en 18.0, o si cambió (p. ej. a un service).
  - Confirma el bundle correcto de assets en 18.0 (`point_of_sale._assets_pos`) y paths de import.
  - Confirma que `pos.printer` mantiene el campo `printer_type` y su semántica (para `selection_add`).
  - Confirma los IDs de vistas heredadas (`point_of_sale.view_pos_config_form`, `point_of_sale.view_pos_printer_form`, etc.).

### 2) Hacer el módulo opt-in (no intrusivo)
- Cambia `pos.config.printing_mode` para que el default sea “estándar Odoo”:
  - Añade selección `('odoo_default','Odoo (Standard)')` y úsala como `default`.
  - Ajusta constraints: exigir `print_device_id` **solo** si el usuario selecciona `local_agent`.
- Asegura que si printing_mode es `odoo_default`, el POS no intenta usar el suite.

### 3) Permiso explícito para imprimir (suite)
- Crea grupo `pos_printing_suite.group_pos_printing_allowed`.
- Implementa un boolean `printing_suite_allowed` (en `pos.config`, `store=False`) basado en:
  - grupo + printing_mode.
- Exponer `printing_suite_allowed` al POS (loader params).
- En JS:
  - Si `printing_suite_allowed` es falso → no crear impresora custom, delegar a `super()` / comportamiento estándar.
- Seguridad adicional:
  - Si no tiene permiso, **no enviar** token de Local Agent (`local_agent_token = None`) al POS.

### 4) Vistas
- Sustituye `invisible="..."` por booleanos técnicos computados cuando sea necesario.
- Aplica `groups="pos_printing_suite.group_pos_printing_allowed"` a secciones “Printing Suite” si procede.

### 5) Entregables
- PR/diff con cambios en:
  - `models/pos_config.py`, `models/pos_printer.py` (si aplica),
  - `security/*.xml` (+ csv si hace falta),
  - `views/*.xml`,
  - `static/src/js/*`.
- Notas de migración (qué cambia respecto a instalaciones existentes).
- Checklist de QA manual:
  - Instalar en DB limpia Odoo 18.0.
  - Actualizar desde DB con POS ya configurado.
  - POS arranca sin errores.
  - Sin permiso: impresión suite no se activa y la impresión estándar no se rompe.
  - Con permiso: impresión suite funciona en Local Agent y/o HW Proxy.

## Formato de salida
Devuelve un único archivo `.md` con:
- Hallazgos y evidencias (branch, rutas, commits si aplica)
- Supuestos si faltan evidencias
- Cambios propuestos + código
- Checklist de validación
```

---

## Mejoras clave incluidas en el prompt
- Fuerza verificación contra branch `18.0` antes de tocar código.
- Hace el módulo **opt-in** (no intrusivo) y mantiene el flujo estándar por defecto.
- Introduce **permission gating** robusto (no solo UI) evitando entregar token.
- Reduce fragilidad en vistas con booleanos backend.

## Técnicas aplicadas
- 4-D (Deconstruct/Diagnose/Develop/Deliver).
- Guardrails de seguridad Odoo (ACL/record rules).
- Portabilidad OWL: no asumir nombres de métodos, exigir verificación en repo.

---

## Odoo (aplica)
- Versión objetivo: **Odoo 18.0**
- Branch: **`18.0`**
- Rutas del módulo:
  - `pos_printing_suite/models/*`
  - `pos_printing_suite/static/src/js/*`
  - `pos_printing_suite/views/*`
- Evidencia mínima (a validar en repo):
  - Ubicación de `PosStore` y método correcto de creación de printers en 18.0.
  - Bundle de assets POS en 18.0.

---

## Checklist de validación (rápido)
- [ ] Instala sin warnings/fallos en Odoo 18.0.
- [ ] POS abre y carga assets sin errores de import.
- [ ] `printing_mode=odoo_default` → no cambia impresión estándar.
- [ ] Sin grupo permitido → no hay token en payload y no hay impresora custom activa.
- [ ] Con grupo permitido → impresión suite funciona.
- [ ] Multi-company: record rule de `pos.print.device` no filtra indebidamente el device necesario.
