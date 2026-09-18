# Prompt para modificar `get_benefits_and_discounts_to_create` y traer **todos** los descuentos pendientes (sin filtrar por fecha) en Odoo v17+

## Modo
AUTO (asumo **ChatGPT** y enfoque **BASIC**, entrego prompt listo + supuestos)

## Resumen del entendimiento
Tienes un wizard `account.load` con el método `get_benefits_and_discounts_to_create()` que hoy:
- Busca beneficios recurrentes pendientes con: `('state', '=', 'pending')` ✅ (ya **no** filtra por fecha).
- Pero también obtiene beneficios/desc. “únicos” mediante `partner.get_unique_benefits_line_to_create_to_this_months()` ❌ (por nombre, **sí** parece filtrar por mes/fecha).

Quieres modificar el script para que **toda** la información mostrada (recurrente + único) incluya **todos los descuentos pendientes**, sin importar la fecha, manteniendo ORM y buenas prácticas en Odoo v17+.

## Estado de evidencias
No se proporcionaron evidencias (tracebacks/logs) ni el código del modelo/método de los “beneficios únicos”. Se trabajará con supuestos razonables.

### ¿Dispones de alguna de las siguientes evidencias que puedas compartir?
- Mensajes de error (traceback completo).
- Logs relevantes de Odoo (`_logger`, servidor).
- Código actual (modelo de beneficios/descuentos y el método `get_unique_benefits_line_to_create_to_this_months()`).
- Diferencias entre comportamiento esperado vs. real (ej.: “solo trae los del mes actual”).
- Capturas **textuales** del error (copiadas, no imágenes).

## Prompt optimizado (copiar/pegar)
```md
# Rol
Actúa como **Arquitecto Senior de Odoo v17+** y desarrollador experto. Prioriza ORM, ACLs/Record Rules y multi-company.
No uses `sudo()` salvo que lo justifiques. Si haces overrides, llama a `super()`.

# Contexto
Tengo un wizard `account.load` con el compute:

```python
@api.depends('account_load_client_id')
def get_benefits_and_discounts_to_create(self):
    for wizard in self:
        wizard.odoo_load_benefits_and_discounts_to_create = ''
        partner = wizard.account_load_client_id
        if partner:
            pending_recurrent = self.env['partner.benefit.pending'].search([
                ('partner_id', '=', partner.id),
                ('state', '=', 'pending')
            ])
            pending_unique = partner.get_unique_benefits_line_to_create_to_this_months()
            ...
```

Necesito que **la función muestre TODOS los descuentos/beneficios con `state='pending'` sin importar la fecha**.

# Paso previo obligatorio
1) Indica qué evidencias recibiste (código de modelos, logs, tracebacks).  
2) Si existe el método `get_unique_benefits_line_to_create_to_this_months()`, analízalo primero y confirma **dónde** se filtra por fecha/mes.  
3) Si no se provee ese código, declara supuestos y diseña la solución de forma defensiva.

# Tareas
1) Proponer el cambio mínimo y seguro para que el listado incluya **todos** los pendientes:
   - Mantén la búsqueda de `partner.benefit.pending` con `state='pending'`.
   - Reemplaza o complementa el cálculo de `pending_unique` para que NO dependa del mes actual.
2) Implementa una solución robusta con estas opciones (elige la mejor según el modelo real):
   - **Opción A (preferida):** crear un nuevo método en `res.partner` tipo `get_unique_benefits_line_to_create_all_pending()` que busque por dominio `state='pending'` (y `partner_id=...`) **sin filtro de fecha**, y luego modificar el wizard para usarlo.
   - **Opción B:** cambiar el método existente `get_unique_benefits_line_to_create_to_this_months()` para aceptar un parámetro `ignore_date=True` (o `date_from/date_to=None`) y cuando esté activo, no aplicar filtros temporales.
   - **Opción C:** si “beneficios únicos” vienen de otro modelo (por ej. `partner.benefit.line`, `partner.benefit.unique`, etc.), usa un `search()` con dominio correcto y sin fechas.
3) Asegura:
   - Multi-company: respeta `company_id` si aplica (no mezclar compañías).
   - Rendimiento: evita N+1 queries; si puedes, usa `search_read()` o agrupa por partner cuando corresponda.
   - La salida del wizard debe seguir mostrando un string legible, pero ahora con todos los pendientes.
4) Devuelve el **diff de código** (antes/después) SOLO de las partes necesarias:
   - Wizard `get_benefits_and_discounts_to_create()`.
   - Método(s) en `res.partner` o modelo de beneficios que modifiques/crees.
5) Incluye pruebas rápidas:
   - Caso con pendientes de meses anteriores.
   - Caso multi-company (si aplica).
   - Caso sin pendientes.

# Formato de salida
Devuelve un único `.md` con:
- Diagnóstico del filtro por fecha (dónde estaba y por qué)
- Solución recomendada (A/B/C) y por qué
- Código final (Python) listo para pegar
- Checklist de validación
```

## Mejoras clave incluidas en el prompt
- Fuerza a revisar el método que “filtra por mes” (probable causa raíz).
- Da 3 rutas de implementación (A/B/C) para adaptarse a tu modelo real sin inventarlo.
- Añade guardrails Odoo v17+ (ORM, seguridad, multi-company, rendimiento).
- Pide diff y pruebas (más fácil de revisar y desplegar).

## Técnicas aplicadas
- Deconstruct → detecté que el filtro temporal probablemente está en `get_unique_benefits_line_to_create_to_this_months()`.
- Diagnose → riesgo por falta de código del método “único”; por eso ofrezco opciones.
- Develop → prompt con tareas, restricciones y entregables verificables.
- Deliver → prompt listo para copiar/pegar en otra IA.

## Odoo (si aplica): versión, branch, rutas, evidencia
- Versión objetivo asumida: **Odoo 17+**
- Branch oficial: **no aplica** (código custom; no requiere validar en `odoo/odoo` para este cambio específico).
- Rutas: tu módulo custom (`models/...`) donde vive el wizard `account.load` y el método en `res.partner`.

## Checklist de validación
- [ ] El wizard lista recurrentes pendientes (state=pending) sin filtros de fecha.
- [ ] El wizard lista “únicos” pendientes sin filtros de fecha.
- [ ] No se introdujo `sudo()` innecesario.
- [ ] No se rompe multi-company (si hay `company_id` en los modelos).
- [ ] Con datos históricos (meses pasados) el listado incluye todos los pendientes.
- [ ] Prueba con partner sin pendientes muestra “No hay beneficios pendientes…”.
