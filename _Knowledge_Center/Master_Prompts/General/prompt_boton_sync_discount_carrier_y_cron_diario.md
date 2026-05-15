# Botón de sincronización en lista `discount.carrier` + CRON diario (Odoo v17+) — Prompt optimizado

## Modo
BASIC

## Resumen del entendimiento
Quieres un **prompt listo para copiar/pegar** para implementar en **Odoo v17+**:

1) Un botón en la vista **lista/tree** de `discount.carrier` para **sincronizar/verificar** que **todos los transportistas** estén correctamente parametrizados en todos los modelos relacionados (descuentos/beneficios/config EXO, etc.).  
2) La sincronización debe **validar vía API de EXO** la **cantidad de GPS asignados**; si no existen GPS, debe mostrar al usuario un mensaje indicando que debe **registrar/asignar el GPS en EXO**.  
3) El botón **solo puede ejecutarlo el usuario Admin**.  
4) Además, agregar un **CRON diario** que ejecute:
```xml
<field name="code">model._cron_generate_pending_benefits()</field>
```
y que **también valide la sincronización** de transportistas para que el proceso sea más certero.

## Estado de evidencias
No se proporcionaron evidencias (XML actual de la vista, `xml_id`, endpoint exacto de GPS en EXO, definición exacta de “parametrización completa”). Se trabajará con supuestos razonables y diseño defensivo.

---

## Prompt optimizado (copiar/pegar)
```md
# Objetivo: Botón en lista `discount.carrier` + CRON diario de beneficios con verificación de sincronización (Odoo v17+)

## Rol
Actúa como **Arquitecto Senior de Odoo v17+** y desarrollador experto (ORM-first, seguridad ACL/record rules, multi-company).

## Paso previo obligatorio (Evidencias)
Antes de proponer cambios definitivos, indica si el usuario proporcionó:
- XML actual de la vista tree/list de `discount.carrier` y su `xml_id`
- Código del modelo `discount.carrier` y del método `res.partner._cron_generate_pending_benefits()`
- Endpoint exacto del API EXO para consultar **GPS asignados** por transportista (por RNC o por object_id), con ejemplo de response
Si no existe evidencia, declara supuestos y procede de forma defensiva.

## Restricciones (NO negociables)
- Solo Odoo **v17+**.
- ORM (evitar SQL salvo justificación).
- Respetar ACLs/record rules y multi-company.
- `sudo()` solo con justificación (aquí: acción masiva y CRON; limitar alcance y validar grupos).
- Overrides con `super()`.
- En v17+ evitar condiciones frágiles en XML (no usar `attrs`/`invisible` legado).

---

# A) Botón “Sincronizar transportistas” en vista lista/tree de `discount.carrier`

## Requisitos
- Botón en `<header>` del `<tree>`:
  - `type="object"` → llama método `action_sync_transporters()`
  - Visible solo Admin: `groups="base.group_system"`
- Seguridad adicional server-side:
  - En el método validar grupo: si no es Admin → `AccessError`.

## Qué hace la sincronización
- Recorre **todos** los transportistas activos: `res.partner` con `internal_partner_type='transporter'`.
- Verifica “parametrización completa” en módulos relacionados.
- Verifica EXO: **GPS asignados > 0**.
- Si hay errores, muestra un mensaje único con lista de transportistas y causas.
- Si todo OK, notificación de éxito.

## Parametrización completa (base sugerida, ajustable)
Para cada transportista `partner`:
- `vat` (normalizado) existe.
- `company_id` existe (y si aplica, validar compañía esperada).
- Si integra EXO:
  - `partner_object_ids` no vacío.
- Configuración EXO/cargas si aplica:
  - `exo_load_start_date` definido
  - `load_statuses` contiene los estados obligatorios
  - `load_payment_term_id` definido
- Descuentos/beneficios coherentes:
  - Si existe `discount.carrier` para el partner, su parametrización crea/relaciona correctamente:
    - `unique.benefit.discount.carrier_ids` (m2o a `discount.carrier`)
    - `partner.benefit.discount.carrier_ids` (m2o a `discount.carrier`)
  - No hay inconsistencias por company / active / fechas (según reglas del negocio).

## EXO (GPS)
- Implementar un método helper reutilizable:
  - `_exo_get_gps_count(partner)` → retorna entero
- Si `gps_count == 0`, agregar error:
  - “Transportista X (RNC Y): no tiene GPS registrado/asignado en EXO. Debe registrar el GPS en EXO.”

## Entregables Botón
1) **XML** (vista tree) para agregar botón:
```xml
<record id="discount_carrier_tree_inherit_sync" model="ir.ui.view">
    <field name="name">discount.carrier.tree.sync</field>
    <field name="model">discount.carrier</field>
    <field name="inherit_id" ref="TU_MODULO.discount_carrier_tree_view_xmlid"/>
    <field name="arch" type="xml">
        <xpath expr="//tree" position="inside">
            <header>
                <button name="action_sync_transporters"
                        type="object"
                        string="Sincronizar transportistas"
                        class="oe_highlight"
                        groups="base.group_system"/>
            </header>
        </xpath>
    </field>
</record>
```

2) **Python** (modelo `discount.carrier`) método:
- `action_sync_transporters()`:
  - valida Admin
  - llama a un validador común (idealmente en `res.partner` o servicio) para reutilizar también en el CRON
  - devuelve `display_notification` si OK o `UserError/ValidationError` si hay fallos

---

# B) CRON diario: `model._cron_generate_pending_benefits()` + verificación de sincronización

## Requisitos
- Crear un registro `ir.cron` que corra **todos los días**.
- Debe ejecutar exactamente:
```xml
<field name="code">model._cron_generate_pending_benefits()</field>
```
- Y además, dentro de `_cron_generate_pending_benefits()` (o antes de crear beneficios), debe verificarse que los transportistas estén sincronizados:
  - Parametrización completa
  - GPS en EXO
- Como el CRON no tiene UI, los errores deben registrarse:
  - En log (`_logger_benefits`) y/o
  - En un modelo de auditoría (recomendado) `benefits.sync.log` o reutilizar tu `account.load.error` si aplica

## Implementación recomendada (sin romper tu método actual)
1) Crear método previo:
- `res.partner._cron_verify_transporters_synced()`:
  - retorna `(ok_count, error_lines)` o lanza excepción controlada
  - registra detalles en log/modelo
2) Modificar `_cron_generate_pending_benefits()` para:
- ejecutar verificación al inicio
- si hay errores:
  - **no abortar todo**: decidir política:
    - Opción A (estricta): aborta y no genera beneficios
    - Opción B (tolerante): solo salta transportistas con error y genera a los correctos
  - (Recomendado B) para operación diaria: generar para los OK, loguear los NO OK

## Entregable CRON (XML)
Ejemplo (ajusta `model_id` y `xml_id` del modelo real donde vive el método):
```xml
<record id="ir_cron_generate_pending_benefits_daily" model="ir.cron">
    <field name="name">Beneficios: Generar pendientes (diario)</field>
    <field name="active">True</field>

    <!-- Modelo donde está definido _cron_generate_pending_benefits -->
    <field name="model_id" ref="base.model_res_partner"/>

    <!-- Usuario que ejecuta el cron: normalmente Admin -->
    <field name="user_id" ref="base.user_admin"/>

    <field name="interval_number">1</field>
    <field name="interval_type">days</field>
    <field name="numbercall">-1</field>
    <field name="doall">False</field>

    <!-- Lo que solicitaste explícitamente -->
    <field name="code">model._cron_generate_pending_benefits()</field>
</record>
```

## Nota importante de exactitud
Si `_cron_generate_pending_benefits()` está en `res.partner` (como en tu código), `model_id` debe apuntar a `res.partner`.  
Si el método está en otro modelo, ajustar el `model_id` en consecuencia.

---

# C) Seguridad: botón solo Admin
- UI: `groups="base.group_system"`
- Backend: `AccessError` si no es Admin (si intentan llamar RPC igualmente)

---

# D) Salida UX
- Botón: mostrar lista de transportistas con fallos (GPS EXO faltante / falta parametrización).
- CRON: registrar en log/modelo; opcional enviar notificación a Admin (mail.message / mail.activity).

---

## Preguntas (máximo 3) si falta información crítica
1) ¿Cuál es el `xml_id` exacto de la vista tree/list de `discount.carrier` (para `inherit_id`)?
2) ¿Cuál es el endpoint exacto de EXO para consultar GPS asignados (por RNC o por object_id), y cómo luce el response?
3) Define “parametrización completa”: ¿qué campos/modelos son obligatorios sí o sí para considerar un transportista “sincronizado”?
```

---

## Mejoras clave incluidas
- Botón en lista/tree con seguridad doble (UI + backend).
- Verificación de parametrización + GPS EXO (mensaje claro al usuario).
- CRON diario con `model._cron_generate_pending_benefits()` y recomendación de verificación previa para mayor certeza.
- Diseño reutilizable: la misma validación sirve para botón y para CRON.

## Checklist de validación
- [ ] Botón aparece en tree/list de `discount.carrier` solo para Admin.
- [ ] No-Admin no ve el botón y si fuerza llamada → `AccessError`.
- [ ] Validación EXO GPS: si 0 GPS → mensaje “registrar GPS en EXO”.
- [ ] CRON creado y corre diario (`interval_number=1`, `interval_type=days`).
- [ ] El CRON ejecuta `<field name="code">model._cron_generate_pending_benefits()</field>`.
- [ ] El CRON verifica sincronización y registra fallos sin romper operación (según política definida).
