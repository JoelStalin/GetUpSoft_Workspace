from odoo import fields, models


class OrcaInvoiceLineLog(models.Model):
    _name = 'account.move.line.orca.log'
    _description = 'Invoice Line ORCA Audit Log'
    _inherit = 'orca.log'

    product_name = fields.Char(
        string='Product Name',
        help='Product name at time of log'
    )
    product_code = fields.Char(
        string='Product Code',
        help='Product code at time of log'
    )
    quantity = fields.Float(
        string='Quantity',
        help='Line quantity at time of log'
    )
    price_unit = fields.Float(
        string='Unit Price',
        help='Unit price at time of log'
    )
    line_amount = fields.Float(
        string='Line Amount',
        help='Total line amount at time of log'
    )
    invoice_reference = fields.Char(
        string='Invoice Reference',
        help='Invoice reference at time of log'
    )
    account_code = fields.Char(
        string='Account Code',
        help='GL account code at time of log'
    )


class InvoiceLine(models.Model):
    _inherit = ['account.move.line', 'orca.universal.mixin']

    _orca_tier = 'high'
    _orca_log_model = 'account.move.line.orca.log'
