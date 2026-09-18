"""ORCA integration for l10n_do_accounting module.

Tracks all invoice/document changes for fiscal compliance and audit trails.
"""

from odoo import models, fields


class OrcaAccountMoveLog(models.Model):
    """Fiscal-specific ORCA audit log for account.move operations."""

    _name = 'orca.l10n.do.accounting.log'
    _description = 'Dominican Accounting ORCA Audit Log'
    _inherit = 'orca.log'

    # Fiscal-specific fields
    encf = fields.Char(
        string='e-CF Number',
        help='Electronic Fiscal Certificate number'
    )
    fiscal_state = fields.Char(
        string='Fiscal State',
        help='Document fiscal status at log time'
    )
    dgii_uuid = fields.Char(
        string='DGII UUID',
        help='Dominican DGII unique identifier'
    )
    document_type = fields.Char(
        string='Document Type',
        help='Type code (01=invoice, 02=credit note, etc.)'
    )


class AccountMove(models.Model):
    """Extend account.move with ORCA universal audit logging.

    Uses OrcaUniversalMixin which auto-detects fields based on CRITICAL tier.
    Automatically tracks all relevant accounting fields without explicit configuration.
    """

    _inherit = ['account.move', 'orca.universal.mixin']

    # Tier classification: CRITICAL for fiscal/accounting operations
    # OrcaUniversalMixin will auto-select ~20 accounting-related fields
    _orca_tier = 'critical'

    # Concrete log model for this module
    _orca_log_model = 'orca.l10n.do.accounting.log'
