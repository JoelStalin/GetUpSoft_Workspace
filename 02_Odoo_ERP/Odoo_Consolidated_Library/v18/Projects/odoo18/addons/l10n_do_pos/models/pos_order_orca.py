from odoo import models, fields


class OrcaPOSOrderLog(models.Model):
    _name = 'orca.l10n.do.pos.log'
    _description = 'l10n_do_pos ORCA Audit Log'
    _inherit = 'orca.log'

    pos_reference = fields.Char(string='POS Reference')
    amount_total = fields.Float(string='Order Total')
    payment_method = fields.Char(string='Payment Method')
    fiscal_status = fields.Selection([
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ], string='Fiscal Status')


class POSOrder(models.Model):
    _inherit = ['pos.order', 'orca.audit.mixin']

    _orca_tracked_fields = ['name', 'state', 'partner_id', 'amount_total',
                            'amount_paid', 'amount_return', 'lines']
    _orca_log_model = 'orca.l10n.do.pos.log'
