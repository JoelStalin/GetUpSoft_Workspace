# Módulo **Agenda** para **Odoo 19** (Community/Enterprise) – Plantilla lista para instalar

## Modo
AUTO

## Resumen del entendimiento
Quieres un **módulo de Agenda** para **Odoo 19** que permita gestionar **eventos/citas** (inicio/fin, responsable, asistentes, etiquetas), con **vista calendario**, permisos básicos y soporte **multi-compañía**, listo para copiar en tu `addons_path` e instalar.

## Estado de evidencias
- **Evidencias provistas:** ninguna (no hay requerimientos detallados, ni pantallazos, ni comportamiento esperado vs real).
- **Supuestos adoptados (defensivos):**
  - “Agenda” = gestión de **eventos internos** (no reservas públicas).
  - Acceso por grupos: **Usuario** (solo sus eventos) y **Manager** (todos en su compañía).
  - Sin lógica dinámica en XML (sin `attrs` / `invisible`), todo lo sensible se valida en backend.

## Pregunta de evidencias (por si hay algo ya hecho)
**¿Dispones de alguna de las siguientes evidencias que puedas compartir?**  
- Mensajes de error (traceback completo).  
- Logs relevantes de Odoo (`_logger`, servidor).  
- Código actual (modelo, método, vista, test).  
- Diferencias entre comportamiento esperado vs. real.  
- Capturas textuales del error (copiadas, no imágenes).  

---

## Prompt optimizado (copiar/pegar)
> Úsalo si quieres que otro AI (o yo) amplíe el módulo con requisitos exactos.

```md
Actúa como Arquitecto Senior de Odoo (v19) y desarrollador experto.
Necesito un módulo de “Agenda” para gestionar eventos internos con:
- Eventos con título, inicio/fin, duración, ubicación, descripción, responsable (usuario), asistentes (contactos), etiquetas con color, estado.
- Vista lista, formulario, calendario.
- Seguridad: grupo usuario (ver/editar solo sus eventos) y grupo manager (ver todo en su compañía).
- Multi-company correcto.
- Sin usar attrs/invisible prohibidos en XML; cualquier restricción por estado debe validarse en Python.
Entregables: estructura de módulo completa (manifest, modelos, vistas, seguridad, datos) + checklist de instalación.
```

---

## Mejoras clave incluidas en la solución
- **Multi-company** (`company_id`) con defaults correctos.
- **Restricciones de integridad**: fin > inicio; duración computada.
- **Chatter** y **actividades** (mail.thread + mail.activity.mixin).
- **Permisos** + **record rules** por usuario/manager.
- **Vista calendario** para usar como agenda real.

## Técnicas aplicadas
- ORM-first (`create`, `write`, constraints, computes).
- Seguridad Odoo: grupos, `ir.model.access.csv`, `ir.rule`.
- Validaciones en backend (sin condiciones frágiles en XML).

---

## Odoo (verificación)
- Versión objetivo: **Odoo 19**
- Branch consultado: **`19.0`** (repositorio oficial `odoo/odoo`)
- Evidencia: el repo oficial muestra rama seleccionada **19.0**. (ver referencias en la respuesta del chat)
- Rutas relevantes (estructura estándar): `addons/<tu_modulo>/...`

---

# Entregable: módulo `agenda_app`

## 1) Árbol de archivos
Crea esta carpeta dentro de tu `addons_path`:

```text
agenda_app/
├─ __init__.py
├─ __manifest__.py
├─ security/
│  ├─ ir.model.access.csv
│  └─ agenda_security.xml
├─ data/
│  └─ agenda_sequence.xml
├─ models/
│  ├─ __init__.py
│  ├─ agenda_event.py
│  └─ agenda_tag.py
└─ views/
   ├─ agenda_event_views.xml
   ├─ agenda_tag_views.xml
   └─ agenda_menus.xml
```

---

## 2) Código

### `__manifest__.py`
```python
{
    "name": "Agenda (Eventos Internos)",
    "version": "19.0.1.0.0",
    "category": "Productivity",
    "summary": "Agenda interna: eventos/citas con vista calendario",
    "license": "LGPL-3",
    "author": "Tu Empresa",
    "website": "",
    "depends": ["base", "mail"],
    "data": [
        "security/agenda_security.xml",
        "security/ir.model.access.csv",
        "data/agenda_sequence.xml",
        "views/agenda_event_views.xml",
        "views/agenda_tag_views.xml",
        "views/agenda_menus.xml",
    ],
    "application": True,
    "installable": True,
}
```

### `__init__.py`
```python
from . import models
```

### `models/__init__.py`
```python
from . import agenda_event
from . import agenda_tag
```

---

## Modelos

### `models/agenda_tag.py`
```python
from odoo import api, fields, models


class AgendaTag(models.Model):
    _name = "agenda.tag"
    _description = "Etiqueta de Agenda"
    _order = "name"

    name = fields.Char(required=True, index=True)
    color = fields.Integer(string="Color")

    company_id = fields.Many2one(
        "res.company",
        default=lambda self: self.env.company,
        index=True,
        required=True,
    )

    _sql_constraints = [
        ("name_company_uniq", "unique(name, company_id)", "La etiqueta ya existe en esta compañía."),
    ]
```

### `models/agenda_event.py`
```python
from odoo import api, fields, models, _
from odoo.exceptions import ValidationError


class AgendaEvent(models.Model):
    _name = "agenda.event"
    _description = "Evento de Agenda"
    _inherit = ["mail.thread", "mail.activity.mixin"]
    _order = "start_datetime desc, id desc"

    name = fields.Char(string="Título", required=True, tracking=True)
    sequence = fields.Char(string="Referencia", readonly=True, copy=False, default="/")

    company_id = fields.Many2one(
        "res.company",
        default=lambda self: self.env.company,
        required=True,
        index=True,
        tracking=True,
    )

    user_id = fields.Many2one(
        "res.users",
        string="Responsable",
        default=lambda self: self.env.user,
        required=True,
        index=True,
        tracking=True,
    )

    partner_ids = fields.Many2many(
        "res.partner",
        "agenda_event_partner_rel",
        "event_id",
        "partner_id",
        string="Asistentes",
        tracking=True,
    )

    tag_ids = fields.Many2many(
        "agenda.tag",
        "agenda_event_tag_rel",
        "event_id",
        "tag_id",
        string="Etiquetas",
    )

    location = fields.Char(string="Ubicación")
    description = fields.Html(string="Descripción")

    start_datetime = fields.Datetime(string="Inicio", required=True, tracking=True)
    stop_datetime = fields.Datetime(string="Fin", required=True, tracking=True)

    duration_hours = fields.Float(
        string="Duración (horas)",
        compute="_compute_duration_hours",
        store=True,
        readonly=True,
    )

    reminder_minutes = fields.Integer(
        string="Recordatorio (min)",
        default=0,
        help="Si > 0, al confirmar crea una actividad para el responsable antes del inicio.",
    )

    state = fields.Selection(
        [
            ("draft", "Borrador"),
            ("confirmed", "Confirmado"),
            ("done", "Realizado"),
            ("cancelled", "Cancelado"),
        ],
        default="draft",
        tracking=True,
        required=True,
    )

    active = fields.Boolean(default=True)

    @api.depends("start_datetime", "stop_datetime")
    def _compute_duration_hours(self):
        for rec in self:
            if rec.start_datetime and rec.stop_datetime:
                delta = rec.stop_datetime - rec.start_datetime
                rec.duration_hours = max(delta.total_seconds() / 3600.0, 0.0)
            else:
                rec.duration_hours = 0.0

    @api.constrains("start_datetime", "stop_datetime")
    def _check_dates(self):
        for rec in self:
            if rec.start_datetime and rec.stop_datetime and rec.stop_datetime <= rec.start_datetime:
                raise ValidationError(_("La fecha/hora de fin debe ser posterior al inicio."))

    @api.model_create_multi
    def create(self, vals_list):
        seq = self.env["ir.sequence"]
        for vals in vals_list:
            if vals.get("sequence", "/") == "/":
                vals["sequence"] = seq.next_by_code("agenda.event") or "/"
        return super().create(vals_list)

    def _ensure_editable(self):
        for rec in self:
            if rec.state in ("done", "cancelled"):
                raise ValidationError(_("No puedes modificar un evento en estado Realizado o Cancelado."))

    def write(self, vals):
        # Validación por estado (sin depender de invisibles en XML)
        if any(k in vals for k in ("name", "start_datetime", "stop_datetime", "user_id", "partner_ids", "tag_ids", "location", "description")):
            self._ensure_editable()
        return super().write(vals)

    # Acciones
    def action_confirm(self):
        for rec in self:
            if rec.state != "draft":
                continue
            rec.state = "confirmed"
            rec._create_reminder_activity_if_needed()
        return True

    def action_done(self):
        for rec in self:
            if rec.state not in ("confirmed", "draft"):
                continue
            rec.state = "done"
        return True

    def action_cancel(self):
        for rec in self:
            if rec.state == "done":
                raise ValidationError(_("No puedes cancelar un evento ya realizado."))
            rec.state = "cancelled"
        return True

    def action_reset_to_draft(self):
        for rec in self:
            if rec.state == "done":
                raise ValidationError(_("No puedes volver a borrador un evento realizado."))
            rec.state = "draft"
        return True

    def _create_reminder_activity_if_needed(self):
        self.ensure_one()
        if not self.reminder_minutes or self.reminder_minutes <= 0:
            return
        if not self.start_datetime:
            return

        # Fecha límite = inicio - reminder_minutes
        deadline = fields.Datetime.subtract(self.start_datetime, minutes=self.reminder_minutes)

        activity_type = self.env.ref("mail.mail_activity_data_todo", raise_if_not_found=False)
        if not activity_type:
            return

        summary = _("Recordatorio: %s") % (self.name or "")
        note = _("Evento inicia en %s (recordatorio %s min antes).") % (self.start_datetime, self.reminder_minutes)

        self.activity_schedule(
            activity_type_id=activity_type.id,
            user_id=self.user_id.id,
            date_deadline=deadline.date(),
            summary=summary,
            note=note,
        )
```

---

## Seguridad

### `security/agenda_security.xml`
```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>

    <!-- Grupos -->
    <record id="group_agenda_user" model="res.groups">
        <field name="name">Agenda / Usuario</field>
        <field name="category_id" ref="base.module_category_productivity"/>
    </record>

    <record id="group_agenda_manager" model="res.groups">
        <field name="name">Agenda / Manager</field>
        <field name="category_id" ref="base.module_category_productivity"/>
        <field name="implied_ids" eval="[(4, ref('agenda_app.group_agenda_user'))]"/>
    </record>

    <!-- Record rule: usuarios solo ven sus eventos (misma compañía) -->
    <record id="rule_agenda_event_user_own" model="ir.rule">
        <field name="name">Agenda Event: usuario solo sus eventos</field>
        <field name="model_id" ref="model_agenda_event"/>
        <field name="domain_force">[
            '&amp;',
            ('company_id', 'in', company_ids),
            ('user_id', '=', user.id)
        ]</field>
        <field name="groups" eval="[(4, ref('agenda_app.group_agenda_user'))]"/>
    </record>

    <!-- Record rule: manager ve todo en sus compañías -->
    <record id="rule_agenda_event_manager_all" model="ir.rule">
        <field name="name">Agenda Event: manager todo por compañía</field>
        <field name="model_id" ref="model_agenda_event"/>
        <field name="domain_force">[('company_id', 'in', company_ids)]</field>
        <field name="groups" eval="[(4, ref('agenda_app.group_agenda_manager'))]"/>
    </record>

    <!-- Tags: por compañía -->
    <record id="rule_agenda_tag_company" model="ir.rule">
        <field name="name">Agenda Tag: por compañía</field>
        <field name="model_id" ref="model_agenda_tag"/>
        <field name="domain_force">[('company_id', 'in', company_ids)]</field>
        <field name="groups" eval="[(4, ref('agenda_app.group_agenda_user'))]"/>
    </record>

</odoo>
```

### `security/ir.model.access.csv`
```csv
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_agenda_event_user,agenda.event user,model_agenda_event,agenda_app.group_agenda_user,1,1,1,0
access_agenda_event_manager,agenda.event manager,model_agenda_event,agenda_app.group_agenda_manager,1,1,1,1
access_agenda_tag_user,agenda.tag user,model_agenda_tag,agenda_app.group_agenda_user,1,0,0,0
access_agenda_tag_manager,agenda.tag manager,model_agenda_tag,agenda_app.group_agenda_manager,1,1,1,1
```

---

## Datos

### `data/agenda_sequence.xml`
```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <record id="seq_agenda_event" model="ir.sequence">
        <field name="name">Agenda Event</field>
        <field name="code">agenda.event</field>
        <field name="prefix">AGD/%(year)s/</field>
        <field name="padding">5</field>
        <field name="company_id" eval="False"/>
    </record>
</odoo>
```

---

## Vistas

### `views/agenda_event_views.xml`
> Sin `attrs` / `invisible`. Las restricciones por estado se validan en Python.

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>

    <record id="view_agenda_event_tree" model="ir.ui.view">
        <field name="name">agenda.event.tree</field>
        <field name="model">agenda.event</field>
        <field name="arch" type="xml">
            <tree>
                <field name="sequence"/>
                <field name="name"/>
                <field name="start_datetime"/>
                <field name="stop_datetime"/>
                <field name="duration_hours"/>
                <field name="user_id"/>
                <field name="company_id"/>
                <field name="state"/>
            </tree>
        </field>
    </record>

    <record id="view_agenda_event_form" model="ir.ui.view">
        <field name="name">agenda.event.form</field>
        <field name="model">agenda.event</field>
        <field name="arch" type="xml">
            <form>
                <header>
                    <button name="action_confirm" type="object" string="Confirmar" class="btn-primary"/>
                    <button name="action_done" type="object" string="Marcar realizado"/>
                    <button name="action_cancel" type="object" string="Cancelar" class="btn-secondary"/>
                    <button name="action_reset_to_draft" type="object" string="Volver a borrador" class="btn-secondary"/>
                    <field name="state" widget="statusbar" statusbar_visible="draft,confirmed,done,cancelled"/>
                </header>

                <sheet>
                    <div class="oe_title">
                        <h1>
                            <field name="name" placeholder="Ej. Llamada con cliente"/>
                        </h1>
                        <div>
                            <field name="sequence" readonly="1"/>
                        </div>
                    </div>

                    <group>
                        <group>
                            <field name="start_datetime"/>
                            <field name="stop_datetime"/>
                            <field name="duration_hours" readonly="1"/>
                            <field name="reminder_minutes"/>
                        </group>
                        <group>
                            <field name="user_id"/>
                            <field name="company_id"/>
                            <field name="location"/>
                            <field name="tag_ids" widget="many2many_tags"/>
                        </group>
                    </group>

                    <notebook>
                        <page string="Asistentes">
                            <field name="partner_ids" widget="many2many_tags" options="{'no_create': False}"/>
                        </page>
                        <page string="Descripción">
                            <field name="description"/>
                        </page>
                        <page string="Seguimiento">
                            <group>
                                <field name="message_follower_ids" widget="mail_followers"/>
                                <field name="activity_ids" widget="mail_activity"/>
                            </group>
                        </page>
                    </notebook>
                </sheet>

                <chatter/>
            </form>
        </field>
    </record>

    <record id="view_agenda_event_calendar" model="ir.ui.view">
        <field name="name">agenda.event.calendar</field>
        <field name="model">agenda.event</field>
        <field name="arch" type="xml">
            <calendar string="Agenda"
                      date_start="start_datetime"
                      date_stop="stop_datetime"
                      color="user_id">
                <field name="name"/>
                <field name="user_id"/>
                <field name="location"/>
            </calendar>
        </field>
    </record>

    <record id="action_agenda_event" model="ir.actions.act_window">
        <field name="name">Eventos</field>
        <field name="res_model">agenda.event</field>
        <field name="view_mode">calendar,tree,form</field>
        <field name="help" type="html">
            <p class="o_view_nocontent_smiling_face">
                Crea tu primer evento de agenda.
            </p>
        </field>
    </record>

</odoo>
```

### `views/agenda_tag_views.xml`
```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>

    <record id="view_agenda_tag_tree" model="ir.ui.view">
        <field name="name">agenda.tag.tree</field>
        <field name="model">agenda.tag</field>
        <field name="arch" type="xml">
            <tree>
                <field name="name"/>
                <field name="color"/>
                <field name="company_id"/>
            </tree>
        </field>
    </record>

    <record id="view_agenda_tag_form" model="ir.ui.view">
        <field name="name">agenda.tag.form</field>
        <field name="model">agenda.tag</field>
        <field name="arch" type="xml">
            <form>
                <sheet>
                    <group>
                        <field name="name"/>
                        <field name="color"/>
                        <field name="company_id"/>
                    </group>
                </sheet>
            </form>
        </field>
    </record>

    <record id="action_agenda_tag" model="ir.actions.act_window">
        <field name="name">Etiquetas</field>
        <field name="res_model">agenda.tag</field>
        <field name="view_mode">tree,form</field>
    </record>

</odoo>
```

### `views/agenda_menus.xml`
```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>

    <menuitem id="menu_agenda_root" name="Agenda" sequence="10"/>

    <menuitem id="menu_agenda_events"
              name="Eventos"
              parent="menu_agenda_root"
              action="action_agenda_event"
              sequence="10"/>

    <menuitem id="menu_agenda_config"
              name="Configuración"
              parent="menu_agenda_root"
              sequence="90"
              groups="agenda_app.group_agenda_manager"/>

    <menuitem id="menu_agenda_tags"
              name="Etiquetas"
              parent="menu_agenda_config"
              action="action_agenda_tag"
              sequence="10"
              groups="agenda_app.group_agenda_manager"/>

</odoo>
```

---

## 3) Checklist de validación (instalación y QA)
- [ ] Copiar `agenda_app/` a tu `addons_path`.
- [ ] Reiniciar Odoo y actualizar lista de apps.
- [ ] Instalar “Agenda (Eventos Internos)”.
- [ ] Asignar grupos:
  - Usuarios normales → **Agenda / Usuario**
  - Administradores → **Agenda / Manager**
- [ ] Verificar multi-compañía:
  - Cambiar de compañía y confirmar que solo ves registros de esa compañía.
- [ ] Probar flujo:
  - Crear evento (draft) → Confirmar → Marcar realizado / Cancelar.
  - Intentar editar un evento “Realizado” y confirmar que bloquea.
- [ ] Probar calendario (vista Calendar).

---

## Opciones rápidas para ampliar (si lo necesitas)
- Invitaciones por email a asistentes (integración con `mail.mail`).
- Conflictos de horario (validación de solapes por responsable).
- Recurrencia (semanal/mensual) y generación automática.
- Compartir agenda por equipo (grupo/usuario, no solo owner).

