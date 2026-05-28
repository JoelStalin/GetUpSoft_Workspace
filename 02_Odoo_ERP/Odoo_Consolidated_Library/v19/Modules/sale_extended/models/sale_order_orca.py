from odoo import fields, models


class OrcaSaleOrderLog(models.Model):
    _name = 'orca.sale.order.log'
    _description = 'Sale Order ORCA Audit Log'
    _inherit = 'orca.log'

    order_reference = fields.Char(
        string='Order Reference',
        help='Sales order reference at time of log'
    )
    partner_name = fields.Char(
        string='Partner Name',
        help='Customer name at time of log'
    )
    salesperson_name = fields.Char(
        string='Salesperson Name',
        help='Sales representative at time of log'
    )
    amount_total = fields.Float(
        string='Amount Total',
        help='Total amount of sales order at time of log'
    )
    amount_untaxed = fields.Float(
        string='Amount Untaxed',
        help='Untaxed total at time of log'
    )
    order_state = fields.Selection(
        [
            ('draft', 'Draft'),
            ('sent', 'Quotation Sent'),
            ('sale', 'Sales Order'),
            ('done', 'Done'),
            ('cancel', 'Cancelled'),
        ],
        string='Order State',
        help='Sales order state at time of log'
    )


class SaleOrder(models.Model):
    _inherit = ['sale.order', 'orca.universal.mixin']

    _orca_tier = 'critical'
    _orca_log_model = 'orca.sale.order.log'
