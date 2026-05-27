from odoo import models, fields


class AccountMoveOrcaLog(models.Model):
    _name = 'l10n.do.accounting.orca.log'
    _description = 'l10n_do_accounting ORCA Audit Log'
    _inherit = 'orca.log'

    encf = fields.Char(string='e-CF Number')
    fiscal_state = fields.Char(string='Fiscal State at Log Time')
    dgii_uuid = fields.Char(string='DGII UUID')


class AccountMove(models.Model):
    _inherit = ['account.move', 'orca.audit.mixin']
    _orca_tracked_fields = ['name', 'move_type', 'state', 'partner_id', 'amount_total',
                            'amount_untaxed', 'l10n_latam_document_type_id', 'l10n_do_fiscal_number']
    _orca_log_model = 'l10n.do.accounting.orca.log'
