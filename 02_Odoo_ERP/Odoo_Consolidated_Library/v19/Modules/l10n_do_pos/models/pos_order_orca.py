from odoo import models, fields


class OrcaPOSOrderLog(models.Model):
    _name = 'orca.l10n.do.pos.log'
    _description = 'l10n_do_pos ORCA Audit Log'
    _inherit = 'orca.log'

    pos_reference = fields.Char(string='POS Reference')
    amount_total = fields.Float(string='Order Total')
    payment_method = fields.Char(string='Payment Method')
    fiscal_status = fields.Selection([
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ], string='Fiscal Status')


class POSOrder(models.Model):
    """POS order with ORCA universal audit logging.

    Uses OrcaUniversalMixin which auto-detects fields based on CRITICAL tier.
    Automatically tracks all relevant POS fields without explicit configuration.
    """

    _inherit = ['pos.order', 'orca.universal.mixin']

    # Tier classification: CRITICAL for fiscal POS operations
    # OrcaUniversalMixin will auto-select ~15 POS-related fields
    _orca_tier = 'critical'

    # Concrete log model for this module
    _orca_log_model = 'orca.l10n.do.pos.log'
