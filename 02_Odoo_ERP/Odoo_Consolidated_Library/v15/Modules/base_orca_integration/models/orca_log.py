from odoo import api, fields, models


class OrcaLog(models.AbstractModel):
    _name = 'orca.log'
    _description = 'ORCA Audit Log Base'
    _table = 'orca_log'

    project_id = fields.Char(
        string='Project ID',
        required=True,
        index=True,
        default='default',
        help='Project/customer identifier for multi-tenant isolation'
    )
    module_name = fields.Char(
        string='Module',
        required=True,
        index=True,
        help='Name of the module that generated this log entry'
    )
    model_name = fields.Char(
        string='Model',
        required=True,
        index=True,
        help='Odoo model (e.g., account.move)'
    )
    record_id = fields.Integer(
        string='Record ID',
        required=True,
        index=True,
        help='ID of the record that was affected'
    )
    action = fields.Selection(
        [
            ('create', 'Create'),
            ('write', 'Write'),
            ('unlink', 'Delete'),
            ('sync', 'Sync'),
            ('error', 'Error'),
            ('validate', 'Validate'),
        ],
        string='Action',
        required=True,
        index=True,
        help='Type of action performed'
    )
    user_id = fields.Many2one(
        'res.users',
        string='User',
        default=lambda self: self.env.user,
        index=True,
        help='User who triggered this action'
    )
    date = fields.Datetime(
        string='Date',
        default=fields.Datetime.now,
        index=True,
        help='When this action occurred'
    )
    before_values = fields.Text(
        string='Before Values',
        help='JSON snapshot of tracked fields before change'
    )
    after_values = fields.Text(
        string='After Values',
        help='JSON snapshot of tracked fields after change'
    )
    tier = fields.Selection(
        [
            ('critical', 'Critical'),
            ('high', 'High'),
            ('medium', 'Medium'),
            ('optional', 'Optional'),
        ],
        string='ORCA Tier',
        help='Classification tier for audit log depth'
    )
    orca_synced = fields.Boolean(
        string='ORCA Synced',
        default=False,
        index=True,
        help='Whether this log entry has been pushed to ORCA'
    )
    orca_sync_error = fields.Text(
        string='ORCA Sync Error',
        help='Error message if ORCA sync failed'
    )
    orca_request_id = fields.Char(
        string='ORCA Request ID',
        index=True,
        help='ID returned by ORCA on successful push'
    )
    easycount_synced = fields.Boolean(
        string='EasyCount Synced',
        default=False,
        index=True,
        help='Whether fiscal data has been synced to EasyCount'
    )
    easycount_sync_error = fields.Text(
        string='EasyCount Sync Error',
        help='Error message if EasyCount sync failed'
    )
    easycount_sync_date = fields.Datetime(
        string='EasyCount Sync Date',
        help='Timestamp of last successful EasyCount sync'
    )

    _order = 'date DESC'

    @api.model_create_multi
    def create(self, vals_list):
        return super().create(vals_list)
