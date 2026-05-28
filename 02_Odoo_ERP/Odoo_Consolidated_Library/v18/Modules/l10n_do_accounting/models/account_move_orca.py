from odoo import fields, models


class OrcaAccountMoveLog(models.Model):
    _name = 'orca.l10n.do.accounting.log'
    _description = 'l10n_do_accounting ORCA Audit Log'
    _inherit = 'orca.log'

    encf = fields.Char(
        string='e-CF Number',
        help='Electronic Fiscal Voucher number at time of log'
    )
    fiscal_state = fields.Char(
        string='Fiscal State',
        help='Fiscal state (draft, validated, sent, accepted, rejected) at time of log'
    )
    dgii_uuid = fields.Char(
        string='DGII UUID',
        help='DGII UUID at time of log (if already sent to DGII)'
    )
    move_type = fields.Char(
        string='Move Type',
        help='Type of accounting move (out_invoice, out_refund, etc.)'
    )
    amount_total = fields.Float(
        string='Amount Total',
        help='Total amount in move'
    )


class AccountMove(models.Model):
    """Account move with ORCA universal audit logging.

    Uses OrcaUniversalMixin which auto-detects fields based on CRITICAL tier.
    Automatically tracks all relevant accounting fields without explicit configuration.
    """

    _inherit = ['account.move', 'orca.universal.mixin']

    # Tier classification: CRITICAL for fiscal/accounting operations
    # OrcaUniversalMixin will auto-select ~20 accounting-related fields
    _orca_tier = 'critical'

    # Concrete log model for this module
    _orca_log_model = 'orca.l10n.do.accounting.log'
