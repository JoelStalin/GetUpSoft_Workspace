from odoo import fields, models


class DgiiReportOrcaLog(models.Model):
    _name = 'dgii.report.orca.log'
    _description = 'DGII Report ORCA Audit Log'
    _inherit = 'orca.log'
    _table = 'dgii_report_orca_log'

    report_period = fields.Char(
        string='Report Period',
        help='Period of the DGII report (MM/YYYY)'
    )
    report_state = fields.Char(
        string='Report State at Log Time',
        help='Report state when this log entry was created'
    )


class DgiiReport(models.Model):
    """DGII report with ORCA universal audit logging.

    Uses OrcaUniversalMixin which auto-detects fields based on CRITICAL tier.
    Automatically tracks all relevant DGII reporting fields without explicit configuration.
    """

    _inherit = ['dgii.reports', 'orca.universal.mixin']

    # Tier classification: CRITICAL for fiscal/reporting operations
    # OrcaUniversalMixin will auto-select ~20 reporting fields
    _orca_tier = 'critical'

    # Concrete log model for this module
    _orca_log_model = 'dgii.report.orca.log'
