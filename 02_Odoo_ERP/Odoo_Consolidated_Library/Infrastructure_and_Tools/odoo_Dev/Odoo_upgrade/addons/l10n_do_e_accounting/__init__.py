from . import models  # noqa: F401

from odoo import api, SUPERUSER_ID


def _update_account_fiscal_position(env):
    # ✅ Buscar directamente por `name` en lugar de `id`
    chart_template = env['account.chart.template'].search([], limit=1, order="name")
    if chart_template:
        template_positions = env['account.fiscal.position'].search(
            [('chart_template_id', '=', chart_template.id)]
        )
        for template_position in template_positions:
            template_xmlids = template_position.get_external_id()
            if template_xmlids.get(template_position.id):
                module, name = template_xmlids[template_position.id].split('.', 1)
                xml_id = f"{module}.{env.company.id}_{name}"

                try:
                    # ✅ Buscar la posición fiscal mediante `env.ref`
                    position = env.ref(xml_id)
                except ValueError:
                    # ✅ Si no existe, crearla
                    vals = chart_template._get_fp_vals(env.company, template_position)
                    chart_template.create_record_with_xmlid(
                        env.company,
                        template_position,
                        "account.fiscal.position",
                        vals,
                    )
                    position = env.ref(xml_id)

                # ✅ Actualizar valores opcionales
                if template_position.l10n_do_to_invoice:
                    position.write({
                        'l10n_do_to_invoice': template_position.l10n_do_to_invoice
                    })

    # ✅ Crear los e-NCF en los diarios
    journals = env['account.journal'].sudo().search([
        ('l10n_latam_use_documents', '=', True),
        ('type', 'in', ('sale', 'purchase')),
        ('company_id', '=', env.company.id)
    ])
    for journal in journals:
        journal._l10n_do_create_ncf_controles()


# ✅ Firma corregida para Odoo 18
def _l10n_do_pos_post_init(env):
    _update_account_fiscal_position(env)
