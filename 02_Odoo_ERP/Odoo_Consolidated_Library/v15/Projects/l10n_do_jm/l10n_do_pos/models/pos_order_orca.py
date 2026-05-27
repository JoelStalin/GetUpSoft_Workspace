from odoo import models, fields


class PosOrderOrcaLog(models.Model):
    _name = 'pos.order.orca.log'
    _description = 'POS Order ORCA Audit Log'
    _inherit = 'orca.log'
    _table = 'pos_order_orca_log'

    ncf = fields.Char(
        string='NCF',
        help='Fiscal number assigned to the POS order'
    )
    order_state = fields.Char(
        string='Order State at Log Time',
        help='State of the POS order when this log entry was created'
    )
    fiscal_type = fields.Char(
        string='Fiscal Type at Log Time',
        help='Fiscal type of the order when this log entry was created'
    )


class PosOrder(models.Model):
    _inherit = ['pos.order', 'orca.audit.mixin']

    _orca_tracked_fields = [
        'name',
        'state',
        'amount_total',
        'partner_id',
    ]
    _orca_log_model = 'pos.order.orca.log'
