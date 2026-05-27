# Part of Domincana Premium.
# See LICENSE file for full copyright and licensing details.

from odoo import models, fields


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
    _inherit = ['dgii.reports', 'orca.audit.mixin']

    _orca_tracked_fields = [
        'name',
        'state',
        'company_id',
        'start_date',
        'end_date',
    ]
    _orca_log_model = 'dgii.report.orca.log'
