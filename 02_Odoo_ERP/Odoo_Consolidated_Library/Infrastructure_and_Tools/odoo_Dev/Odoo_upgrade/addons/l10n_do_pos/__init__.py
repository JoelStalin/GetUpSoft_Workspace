from odoo import api, SUPERUSER_ID, _
from odoo.exceptions import UserError

from . import models  # noqa: F401


def _update_account_fiscal_position(env):
    # ✅ Buscar directamente en `account.chart.template`
    chart_template = env['account.chart.template'].search([], limit=1, order='name')
    if not chart_template:
        env.cr.commit()
        env['mail.message'].create({
            'subject': _('No chart template found'),
            'body': _('No chart template found. The fiscal position update was skipped.'),
            'subtype_id': env.ref('mail.mt_comment').id,
        })
        return

    # ✅ Buscar las posiciones fiscales basadas en la plantilla activa
    template_positions = env['account.fiscal.position'].search([
        ('chart_template_id', '=', chart_template.id)
    ])

    for template_position in template_positions:
        template_xmlids = template_position.get_external_id()
        if template_xmlids.get(template_position.id):
            module, name = template_xmlids[template_position.id].split('.', 1)
            xml_id = f"{module}.{env.company.id}_{name}"

            try:
                # ✅ Intentar obtener la posición fiscal desde `env.ref`
                position = env.ref(xml_id)
            except ValueError:
                # ✅ Si no existe, crearla usando la plantilla
                vals = chart_template._get_fp_vals(env.company, template_position)
                chart_template.create_record_with_xmlid(
                    env.company,
                    template_position,
                    'account.fiscal.position',
                    vals
                )
                position = env.ref(xml_id)

            # ✅ Solo actualizar si `l10n_do_to_invoice` está definido
            if template_position.l10n_do_to_invoice:
                try:
                    position.write({
                        'l10n_do_to_invoice': template_position.l10n_do_to_invoice
                    })
                except Exception as e:
                    env.cr.rollback()
                    env['mail.message'].create({
                        'subject': _('Failed to update fiscal position'),
                        'body': _('Error: %s') % e,
                        'subtype_id': env.ref('mail.mt_comment').id,
                    })

    # ✅ Crear NCF en los diarios
    journals = env['account.journal'].sudo().search([
        ('l10n_latam_use_documents', '=', True),
        ('type', 'in', ('sale', 'purchase')),
        ('company_id', '=', env.company.id)
    ])
    for journal in journals:
        try:
            journal._l10n_do_create_ncf_controles()
        except Exception as e:
            env.cr.rollback()
            env['mail.message'].create({
                'subject': _('Failed to create NCF controls'),
                'body': _('Error: %s') % e,
                'subtype_id': env.ref('mail.mt_comment').id,
            })


# ✅ Firma corregida para Odoo 18 (solo recibe `env`)
def _l10n_do_pos_post_init(env):
    try:
        _update_account_fiscal_position(env)
    except Exception as e:
        env.cr.rollback()
        env['mail.message'].create({
            'subject': _('Error in post init'),
            'body': _('Error: %s') % e,
            'subtype_id': env.ref('mail.mt_comment').id,
        })
