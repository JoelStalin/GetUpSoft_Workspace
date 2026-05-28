from odoo import fields, models


class OrcaAccountMoveLog(models.Model):
    """ORCA audit log for accounting moves.

    Inherits from base orca.log with additional accounting-specific fields.
    Auto-populated when account.move records are created, written, or deleted.
    """
    _name = 'account.move.orca.log'
    _description = 'Account Move ORCA Audit Log'
    _inherit = 'orca.log'

    # Accounting-specific fields captured at log time
    move_type = fields.Selection(
        [
            ('entry', 'Journal Entry'),
            ('out_invoice', 'Customer Invoice'),
            ('in_invoice', 'Vendor Bill'),
            ('out_refund', 'Customer Credit Note'),
            ('in_refund', 'Vendor Credit Note'),
        ],
        string='Move Type',
        help='Type of accounting move at time of log'
    )
    journal_name = fields.Char(
        string='Journal Name',
        help='Journal name at time of log'
    )
    amount_total = fields.Float(
        string='Amount Total',
        help='Total amount of move at time of log'
    )
    partner_name = fields.Char(
        string='Partner Name',
        help='Partner name at time of log'
    )
    move_state = fields.Selection(
        [
            ('draft', 'Draft'),
            ('posted', 'Posted'),
            ('cancel', 'Cancelled'),
        ],
        string='Move State',
        help='Accounting move state at time of log'
    )


class AccountMove(models.Model):
    """Account move with ORCA universal audit logging.

    Uses OrcaUniversalMixin for automatic field detection and audit logging.
    All relevant accounting fields are tracked without manual configuration.
    Supports multi-currency, bank reconciliation, and inter-company transfers.
    """

    _inherit = ['account.move', 'orca.universal.mixin']

    # Tier classification: CRITICAL for all accounting operations
    # OrcaUniversalMixin will auto-detect ~20-30 accounting-related fields
    _orca_tier = 'critical'

    # Concrete log model for account operations
    _orca_log_model = 'account.move.orca.log'
