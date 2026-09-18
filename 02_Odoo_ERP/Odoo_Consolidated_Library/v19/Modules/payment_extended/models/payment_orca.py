from odoo import fields, models


class OrcaAccountPaymentLog(models.Model):
    _name = 'orca.account.payment.log'
    _description = 'Payment ORCA Audit Log'
    _inherit = 'orca.log'

    payment_reference = fields.Char(
        string='Payment Reference',
        help='Payment reference at time of log'
    )
    partner_name = fields.Char(
        string='Partner Name',
        help='Payment partner name at time of log'
    )
    amount = fields.Float(
        string='Amount',
        help='Payment amount at time of log'
    )
    currency_code = fields.Char(
        string='Currency',
        help='Payment currency at time of log'
    )
    payment_method = fields.Char(
        string='Payment Method',
        help='Payment method at time of log'
    )
    payment_state = fields.Selection(
        [
            ('draft', 'Draft'),
            ('posted', 'Posted'),
            ('sent', 'Sent'),
            ('reconciled', 'Reconciled'),
            ('cancelled', 'Cancelled'),
        ],
        string='Payment State',
        help='Payment state at time of log'
    )


class AccountPayment(models.Model):
    _inherit = ['account.payment', 'orca.universal.mixin']

    _orca_tier = 'high'
    _orca_log_model = 'orca.account.payment.log'
