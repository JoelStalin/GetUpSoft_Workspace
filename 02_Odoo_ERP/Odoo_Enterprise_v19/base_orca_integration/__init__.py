from . import models, services


def _post_init_orca_config(cr, registry):
    from odoo import api
    env = api.Environment(cr, 1, {})
    env['ir.config.parameter'].set_param('orca.api.url', 'http://localhost:3000')
    env['ir.config.parameter'].set_param('orca.project.id', 'default')
