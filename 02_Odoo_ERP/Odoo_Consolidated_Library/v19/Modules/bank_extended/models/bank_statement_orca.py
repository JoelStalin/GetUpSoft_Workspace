from odoo import fields, models


class OrcaBankStatementLog(models.Model):
    _name = 'orca.account.bank.statement.log'
    _description = 'Bank Statement ORCA Audit Log'
    _inherit = 'orca.log'

    statement_name = fields.Char(
        string='Statement Name',
        help='Bank statement name at time of log'
    )
    bank_account = fields.Char(
        string='Bank Account',
        help='Bank account number at time of log'
    )
    statement_date = fields.Date(
        string='Statement Date',
        help='Bank statement date at time of log'
    )
    starting_balance = fields.Float(
        string='Starting Balance',
        help='Opening balance at time of log'
    )
    ending_balance = fields.Float(
        string='Ending Balance',
        help='Closing balance at time of log'
    )
    total_transactions = fields.Float(
        string='Total Transactions',
        help='Total amount of transactions at time of log'
    )
    statement_state = fields.Selection(
        [
            ('open', 'Open'),
            ('posted', 'Posted'),
            ('reconciled', 'Reconciled'),
            ('cancel', 'Cancelled'),
        ],
        string='Statement State',
        help='Bank statement state at time of log'
    )


class BankStatement(models.Model):
    _inherit = ['account.bank.statement', 'orca.universal.mixin']

    _orca_tier = 'high'
    _orca_log_model = 'orca.account.bank.statement.log'
