from odoo import models, fields, api
from datetime import datetime


class OrcaLog(models.AbstractModel):
    """Abstract ORCA audit log base model for all modules."""

    _name = 'orca.log'
    _description = 'ORCA Audit Log Base'
    _order = 'date DESC'

    module_name = fields.Char(
        string='Module',
        required=True,
        index=True,
        help='Name of the module creating this log'
    )
    model_name = fields.Char(
        string='Model',
        required=True,
        index=True,
        help='Name of the Odoo model being audited'
    )
    record_id = fields.Integer(
        string='Record ID',
        required=True,
        index=True,
        help='ID of the record being audited'
    )
    action = fields.Selection([
        ('create', 'Create'),
        ('write', 'Write'),
        ('unlink', 'Delete'),
        ('sync', 'Sync'),
        ('form_change', 'Form Field Change'),
    ], required=True, index=True)

    user_id = fields.Many2one(
        'res.users',
        string='User',
        default=lambda self: self.env.user,
        index=True
    )
    date = fields.Datetime(
        string='Date',
        default=fields.Datetime.now,
        index=True
    )

    before_values = fields.Json(
        string='Before Values',
        default={},
        help='JSON snapshot of field values before change'
    )
    after_values = fields.Json(
        string='After Values',
        default={},
        help='JSON snapshot of field values after change'
    )

    # ORCA sync tracking
    orca_synced = fields.Boolean(
        string='ORCA Synced',
        default=False,
        index=True
    )
    orca_sync_date = fields.Datetime(
        string='ORCA Sync Date',
        readonly=True,
        help='Timestamp when log was successfully synced to ORCA'
    )
    orca_sync_error = fields.Text(
        string='ORCA Sync Error',
        readonly=True,
        help='Error message if ORCA sync failed'
    )
    orca_request_id = fields.Char(
        string='ORCA Request ID',
        readonly=True,
        help='Request ID returned by ORCA on successful push'
    )

    # EasyCount sync tracking (for localization modules)
    easycount_synced = fields.Boolean(
        string='EasyCount Synced',
        default=False,
        index=True
    )
    easycount_sync_date = fields.Datetime(
        string='EasyCount Sync Date',
        readonly=True
    )
    easycount_sync_error = fields.Text(
        string='EasyCount Sync Error',
        readonly=True
    )
    easycount_attempt_count = fields.Integer(
        string='EasyCount Sync Attempts',
        default=0,
        readonly=True
    )

    @api.model_create_multi
    def create(self, vals_list):
        """Create audit log entries with automatic timestamp."""
        for vals in vals_list:
            if 'date' not in vals:
                vals['date'] = fields.Datetime.now()
        return super().create(vals_list)

    def _format_snapshot(self, snapshot):
        """Format snapshot for display in views."""
        if not snapshot:
            return ''
        try:
            import json
            if isinstance(snapshot, str):
                data = json.loads(snapshot)
            else:
                data = snapshot
            return json.dumps(data, indent=2, default=str)
        except Exception:
            return str(snapshot)
