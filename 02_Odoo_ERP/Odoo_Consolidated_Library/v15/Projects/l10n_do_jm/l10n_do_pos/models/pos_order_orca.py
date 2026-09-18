from odoo import fields, models


class OrcaPosOrderLog(models.Model):
    _name = 'orca.pos.order.log'
    _description = 'POS Order ORCA Audit Log'
    _inherit = 'orca.log'
    _table = 'pos_order_orca_log'

    ncf = fields.Char(
        string='NCF',
        help='Fiscal number assigned to the POS order'
    )
    order_state = fields.Char(
        string='Order State at Log Time',
        help='State of the POS order when this log entry was created'
    )
    fiscal_type = fields.Char(
        string='Fiscal Type at Log Time',
        help='Fiscal type of the order when this log entry was created'
    )


class PosOrder(models.Model):
    """POS order with ORCA universal audit logging.

    Uses OrcaUniversalMixin which auto-detects fields based on CRITICAL tier.
    Automatically tracks all relevant POS order fields without explicit configuration.
    """

    _inherit = ['pos.order', 'orca.universal.mixin']

    # Tier classification: CRITICAL for fiscal/POS operations
    # OrcaUniversalMixin will auto-select ~20 POS order fields
    _orca_tier = 'critical'

    # Concrete log model for this module
    _orca_log_model = 'orca.pos.order.log'
