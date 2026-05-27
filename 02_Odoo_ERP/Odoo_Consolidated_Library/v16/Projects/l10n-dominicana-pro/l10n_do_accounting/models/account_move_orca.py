from odoo import models, fields, api


class AccountMoveOrcaLog(models.Model):
    _name = 'l10n.do.accounting.orca.log'
    _description = 'l10n_do_accounting ORCA Audit Log'
    _inherit = 'orca.log'
    _table = 'account_move_orca_log'

    encf = fields.Char(
        string='e-CF Number',
        help='Electronic Fiscal Receipt number'
    )
    fiscal_state = fields.Char(
        string='Fiscal State at Log Time',
        help='Fiscal state of the invoice when this log was created'
    )
    dgii_uuid = fields.Char(
        string='DGII UUID',
        help='UUID assigned by DGII for this fiscal document'
    )


class AccountMove(models.Model):
    _inherit = ['account.move', 'orca.audit.mixin']

    _orca_tracked_fields = [
        'name',
        'state',
        'amount_total',
        'partner_id',
        'l10n_latam_document_type_id',
        'l10n_do_fiscal_number',
        'journal_id',
    ]
    _orca_log_model = 'l10n.do.accounting.orca.log'
