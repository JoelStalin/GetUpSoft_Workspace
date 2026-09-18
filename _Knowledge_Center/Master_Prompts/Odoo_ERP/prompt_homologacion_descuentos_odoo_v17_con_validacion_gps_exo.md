# Homologación de Descuentos + Validación GPS (EXO) — Prompt optimizado (Odoo v17+)

## Modo
AUTO (BASIC+)

## Resumen del entendimiento
Quieres modificar **3 scripts** (modelos Odoo) para que los **descuentos/beneficios queden homologados** (misma lógica, mismos nombres/relaciones, mismas validaciones) **en todos los modelos** involucrados, y además **agregar una validación obligatoria**:  
**siempre** verificar en el **API de EXO** la **cantidad de GPS asignados** al transportista y, si **no existe** o es **0**, mostrar un mensaje al usuario indicando que **debe registrar/asignar el GPS en EXO**.

Modelos que aparecen en el código compartido:
- `partner.benefit.discount`
- `discount.carrier`
- `unique.benefit.discount` (referenciado)
- `res.partner` (inherit) + `res.partner.object`
- Wizard `account.load` (transiente) y procesos relacionados

## Estado de evidencias
**No provistas** (no se incluyeron tracebacks, logs, ni el detalle del endpoint exacto de EXO para GPS).

## Pregunta de evidencias (si puedes compartir, ayuda a hacerlo exacto)
¿Dispones de alguna de estas evidencias para integrar la validación con precisión?
- Endpoint exacto del API EXO para GPS (ruta y método), y ejemplo de request/response.
- Nombre del campo en la respuesta que representa “cantidad de GPS asignados”.
- Caso real donde hoy se cuela un transportista sin GPS (flujo exacto: ¿create partner? ¿create discount.carrier? ¿cron? ¿wizard account.load?).

> Si no tienes esto, se trabajará con supuestos razonables y se dejará el código preparado para adaptar el endpoint en 1 solo lugar.

---

## Prompt optimizado (copiar/pegar)

```md
# Rol
Actúa como **Arquitecto Senior de Odoo v17+** e integrador de APIs (EXO). Prioriza **ORM**, seguridad (ACLs, record rules, multi-company), y overrides con `super()`.

# Paso previo obligatorio (evidencias)
1) Indica si el usuario aportó: logs/tracebacks, endpoints EXO, ejemplos de response, o código adicional.
2) Si hay evidencias, analízalas primero.
3) Si no hay evidencias, declara supuestos explícitos.

# Objetivo
Modificar y homologar la lógica de **descuentos/beneficios** en los siguientes modelos (y sus flujos):
- `partner.benefit.discount`
- `discount.carrier`
- `unique.benefit.discount` (si aplica)
- Cualquier flujo que cree/actualice descuentos: create/write, imports, botones, crons, wizards.

Además, implementar una validación obligatoria:
- **Siempre** verificar en el API EXO la **cantidad de GPS asignados** al transportista.
- Si EXO no devuelve GPS o la cantidad es 0 → bloquear con `ValidationError` y mostrar mensaje:
  **"Este transportista no tiene GPS registrado/asignado en EXO. Debe registrar el GPS en EXO para continuar."**

# Restricciones Odoo v17+
- ORM-only (`self.env[...]`, `search`, `create`, `write`, `read_group`, etc.).
- Respetar multi-company y record rules.
- `sudo()` solo con justificación.
- Overrides con `super()`.
- Regla XML v17+ (NO usar attrs/invisible legacy).

# Requerimientos de homologación (arquitectura)
1) Definir una **fuente de verdad única** para “descuento/beneficio”:
   - Campos estándar que deben existir/ser consistentes:
     - `partner_id` (transportista)
     - `product_quantity`
     - `product_tmpl_id` o `benefit_discount_id` (definir estrategia única)
     - `analytic_account_id` / `analytic_tag_ids` (si aplica)
     - `carrier_ids` (si aplica, pero corregir naming si realmente es Many2one)
     - fechas: `month_start` / `transaction_date` según frecuencia
     - claves únicas: `unique_key` / constraints coherentes
2) Unificar **reglas de duplicidad**:
   - one_time: evitar duplicar por partner + producto + fecha (o clave definida)
   - monthly/recurrent: evitar duplicar por partner + beneficio + month_start
3) Unificar **flujos de creación**:
   - Creación manual (UI)
   - Importación
   - Generación automática (crons / wizards)
4) Crear **servicio/helper** centralizado para:
   - Normalizar VAT/RNC
   - Generar/validar descuentos según frecuencia
   - Validar EXO (GPS + otras dependencias)
   - Esto debe evitar duplicación de lógica entre modelos

# Validación GPS en EXO (obligatoria)
Implementar una función reusable en backend, por ejemplo en `res.partner` o en un mixin/service:

- `def _exo_get_gps_count(self):` (o equivalente)
  - Recibe el partner transportista (o su object_id EXO).
  - Llama al endpoint EXO para obtener GPS asignados.
  - Retorna un entero `gps_count`.
  - Maneja errores de red de forma clara (ValidationError con mensaje amigable).

- `def _check_exo_gps_required(self):`
  - Si el partner es `internal_partner_type == 'transporter'`:
    - si `gps_count <= 0` → `raise ValidationError("...Debe registrar el GPS en EXO...")`

## Dónde debe dispararse la validación (mínimo)
- Al crear/modificar:
  - `discount.carrier` (porque genera descuentos).
  - `partner.benefit.discount` (recurrentes).
  - `unique.benefit.discount` (one_time), si se crea desde UI/import/botón.
- En flujos automáticos (si aplican):
  - cron de generación de pendientes (si depende de vehículos/GPS).
  - wizard `account.load` o proceso que termine generando facturas para transportistas.

**Importante:** evitar múltiples llamadas a EXO en loops:
- Cachear por request/transacción usando contexto (ej: `self.env.context`) o un dict local.
- Hacer 1 llamada por partner por operación.

# Entregables obligatorios
1) Propuesta de arquitectura de homologación (qué modelo es “source of truth”).
2) Cambios concretos en Python:
   - Refactor mínimo viable (sin romper compatibilidad).
   - Helper/service de validación GPS EXO en un solo lugar.
   - Aplicación de la validación en los puntos de entrada adecuados.
3) Mensajes de error claros para usuario final (en español).
4) Revisión de campos mal nombrados / inconsistentes:
   - Ejemplo: `carrier_ids` siendo Many2one (debería llamarse `carrier_id`).
5) Checklist de pruebas:
   - UI create/write
   - import_file
   - cron
   - multi-company
   - concurrencia (si aplica)

# Si faltan datos del endpoint EXO
Declara supuestos y deja el endpoint encapsulado en 1 función para adaptar luego.
```

---

## Mejoras clave incluidas
- Validación **obligatoria** de GPS en EXO con mensaje claro al usuario.
- Diseño “**single source of truth**” para evitar lógicas distintas entre modelos.
- Centralización en **helper/service** para:
  - evitar duplicación,
  - facilitar mantenimiento,
  - cachear llamadas a EXO,
  - y aplicar validaciones uniformes.

## Técnicas aplicadas
- 4-D (Deconstruct → Diagnose → Develop → Deliver)
- Guardrails Odoo v17+ (ORM, seguridad, multi-company, `super()`)
- Diseño por servicio/helper para integración EXO
- Validación defensiva + mensajes de negocio

## Odoo: versión, branch, rutas, evidencia
- Versión objetivo: **Odoo v17+**
- Branch a verificar (si se consulta repo): **17.0**
- Rutas y evidencias: **no provistas** (necesario que indiques los paths reales de tus módulos en `addons/...` o compartas el repo/zip).

## Checklist de validación
- [ ] Se centralizó la validación EXO GPS en 1 función reutilizable.
- [ ] La validación se ejecuta al crear/editar descuentos (manual e import).
- [ ] La validación se ejecuta también en procesos automáticos relevantes.
- [ ] No hay llamadas EXO repetitivas en loops (cache por partner).
- [ ] Mensaje al usuario: “Debe registrar/asignar el GPS en EXO”.
- [ ] Pruebas multi-company y record rules.
- [ ] No se usaron `attrs/invisible` legacy (v17+).
