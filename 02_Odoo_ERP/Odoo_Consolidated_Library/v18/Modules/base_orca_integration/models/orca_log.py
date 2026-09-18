from odoo import fields, models


class OrcaLog(models.AbstractModel):
    _name = 'orca.log'
    _description = 'ORCA Audit Log Base'
    _order = 'date desc'

    # Core audit fields
    project_id = fields.Char(
        string='Project ID',
        required=True,
        index=True,
        help='GetUpSoft project identifier for multi-tenant isolation'
    )
    module_name = fields.Char(
        string='Module',
        required=True,
        index=True,
        help='Odoo module name (e.g., l10n_do_accounting)'
    )
    model_name = fields.Char(
        string='Model',
        required=True,
        index=True,
        help='Odoo model name (e.g., account.move)'
    )
    record_id = fields.Integer(
        string='Record ID',
        required=True,
        index=True,
        help='ID of the record that was changed'
    )
    action = fields.Selection(
        selection=[
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
        help='Type of operation that triggered the log'
    )
    user_id = fields.Many2one(
        comodel_name='res.users',
        string='User',
        index=True,
        help='User who triggered the change'
    )
    date = fields.Datetime(
        string='Date',
        required=True,
        index=True,
        default=lambda self: fields.Datetime.now(),
        help='Timestamp of the change'
    )

    # Change tracking
    before_values = fields.Text(
        string='Before Values',
        help='JSON snapshot of tracked fields before change'
    )
    after_values = fields.Text(
        string='After Values',
        help='JSON snapshot of tracked fields after change'
    )

    # ORCA sync tracking
    orca_synced = fields.Boolean(
        string='ORCA Synced',
        default=False,
        index=True,
        help='Whether this log has been synced to ORCA backend'
    )
    orca_sync_error = fields.Text(
        string='ORCA Sync Error',
        help='Error message if sync failed'
    )
    orca_request_id = fields.Char(
        string='ORCA Request ID',
        help='Request ID returned by ORCA backend on successful sync'
    )

    # Tier classification (for filtering and logging depth)
    tier = fields.Selection(
        selection=[
            ('critical', 'Critical - Full audit (Tier 1)'),
            ('high', 'High - Standard audit (Tier 2)'),
            ('medium', 'Medium - Summary audit (Tier 3)'),
            ('optional', 'Optional - Minimal audit (Tier 4)'),
        ],
        string='Tier',
        required=True,
        default='high',
        index=True,
        help='Module tier determines audit depth: CRITICAL=all fields, OPTIONAL=id+state only'
    )

    # EasyCount fiscal sync tracking
    easycount_synced = fields.Boolean(
        string='EasyCount Synced',
        default=False,
        index=True,
        help='Whether this fiscal operation has been synced to EasyCount'
    )
    easycount_sync_error = fields.Text(
        string='EasyCount Sync Error',
        help='Error message if EasyCount sync failed'
    )
    easycount_sync_date = fields.Datetime(
        string='EasyCount Sync Date',
        help='Timestamp of last EasyCount sync attempt'
    )
