"""ORCA integration for l10n_do_accounting module.

Tracks all invoice/document changes for fiscal compliance and audit trails.
"""

from odoo import models, fields


class AccountMoveOrcaLog(models.Model):
    """Fiscal-specific ORCA audit log for account.move operations."""

    _name = 'l10n.do.accounting.orca.log'
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
    """Extend account.move with ORCA audit logging."""

    _inherit = ['account.move', 'orca.audit.mixin']

    # Fields to snapshot on create/write/unlink
    _orca_tracked_fields = [
        'name',
        'move_type',
        'state',
        'partner_id',
        'amount_total',
        'amount_untaxed',
        'l10n_latam_document_type_id',
        'l10n_do_fiscal_number',
    ]

    # Concrete log model for this module
    _orca_log_model = 'l10n.do.accounting.orca.log'
