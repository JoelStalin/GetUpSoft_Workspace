from odoo import fields, models


class OrcaPosOrderLog(models.Model):
    _name = 'orca.pos.order.log'
    _description = 'POS Order ORCA Audit Log'
    _inherit = 'orca.log'

    pos_reference = fields.Char(
        string='POS Reference',
        help='Order reference at time of log'
    )
    pos_config_name = fields.Char(
        string='POS Config Name',
        help='Point of Sale configuration name at time of log'
    )
    session_name = fields.Char(
        string='Session Name',
        help='POS session identifier at time of log'
    )
    partner_name = fields.Char(
        string='Partner Name',
        help='Customer name at time of log'
    )
    cashier_name = fields.Char(
        string='Cashier Name',
        help='User who processed the order at time of log'
    )
    amount_total = fields.Float(
        string='Amount Total',
        help='Total amount of order at time of log'
    )
    amount_paid = fields.Float(
        string='Amount Paid',
        help='Amount paid at time of log'
    )
    order_state = fields.Selection(
        [
            ('draft', 'Draft'),
            ('paid', 'Paid'),
            ('done', 'Done'),
            ('invoiced', 'Invoiced'),
            ('cancel', 'Cancelled'),
        ],
        string='Order State',
        help='Order state at time of log'
    )


class PosOrder(models.Model):
    _inherit = ['pos.order', 'orca.universal.mixin']

    _orca_tier = 'critical'
    _orca_log_model = 'orca.pos.order.log'
