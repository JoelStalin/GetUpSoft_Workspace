import json
from odoo import api, fields, models


class OrcaUniversalMixin(models.AbstractModel):
    """
    Universal ORCA audit mixin for all 595+ Odoo modules.

    Instead of requiring each module to declare _orca_tracked_fields,
    this mixin auto-detects relevant fields based on tier classification.

    Features:
    - Automatic field detection (no per-module config needed)
    - Tier-based filtering (CRITICAL=all, HIGH=core only, MEDIUM=key, OPTIONAL=minimal)
    - Dynamic DTO generation (inherent in JSON snapshots)
    - Scales from minimal (3 fields) to verbose (20+ fields)

    Usage in model:
        class AccountMove(models.Model):
            _inherit = ['account.move', 'orca.universal.mixin']
            _orca_tier = 'critical'  # or 'high', 'medium', 'optional'
            _orca_log_model = 'account.move.orca.log'  # or None to skip logging
    """

    _name = 'orca.universal.mixin'
    _description = 'Universal ORCA Audit Mixin - Auto-detects fields by tier'

    _orca_tier = 'high'  # default: critical, high, medium, optional
    _orca_log_model = None  # override in child model
    _orca_exclude_fields = {'create_date', 'write_date', 'create_uid', 'write_uid', '__last_update'}

    def _orca_get_tier_config(self):
        """
        Returns field-selection rules based on tier.
        Tiers match EPIC-ORCA-v19 classification:
        - critical: Accounting, fiscal, POS, e-commerce (all 595+ fields tracked)
        - high: Sales, procurement, HR, inventory (8-12 core fields)
        - medium: CRM, marketing, projects (5-8 key fields)
        - optional: UI modules, reports (3-5 minimal fields: id, name, state)
        """
        tier = self._orca_tier.lower() if hasattr(self, '_orca_tier') else 'high'

        field_filters = {
            'critical': {
                'include_types': ['Char', 'Integer', 'Float', 'Boolean', 'Date', 'Datetime',
                                 'Selection', 'Many2one', 'Many2many', 'One2many', 'Text', 'Html'],
                'exclude_fields': self._orca_exclude_fields,
                'description': 'All fields (fiscal/accounting depth)',
            },
            'high': {
                'include_types': ['Char', 'Integer', 'Float', 'Boolean', 'Date', 'Datetime',
                                 'Selection', 'Many2one'],
                'exclude_fields': self._orca_exclude_fields | {'description', 'notes', 'comments'},
                'include_keywords': ['amount', 'state', 'partner', 'date', 'number', 'code', 'type', 'name'],
                'description': 'Core fields only',
            },
            'medium': {
                'include_types': ['Char', 'Integer', 'Float', 'Boolean', 'Date', 'Selection', 'Many2one'],
                'exclude_fields': self._orca_exclude_fields | {'description', 'notes', 'comments', 'tags'},
                'include_keywords': ['amount', 'state', 'name', 'date', 'user', 'type'],
                'description': 'Summary fields',
            },
            'optional': {
                'include_types': ['Char', 'Integer', 'Selection'],
                'exclude_fields': self._orca_exclude_fields,
                'include_keywords': ['id', 'name', 'state'],
                'max_fields': 5,
                'description': 'Minimal: id, name, state only',
            },
        }

        return field_filters.get(tier, field_filters['high'])

    def _orca_get_tracked_fields(self):
        """
        Auto-detects which fields to track based on tier configuration.

        Returns list of field names to include in audit logs.
        """
        if not self._orca_log_model:
            return []

        config = self._orca_get_tier_config()
        tracked = []

        for field_name, field in self._fields.items():
            # Skip excluded fields
            if field_name in config.get('exclude_fields', set()):
                continue

            # Skip computed/related fields (no audit value)
            if getattr(field, 'compute', None) or getattr(field, 'related', None):
                continue

            # Check field type matches tier
            field_type = field.__class__.__name__
            if field_type not in config.get('include_types', []):
                continue

            # For high/medium/optional, further filter by keyword relevance
            if self._orca_tier in ['high', 'medium']:
                if not any(kw in field_name.lower() for kw in config.get('include_keywords', [])):
                    continue

            tracked.append(field_name)

        # Apply max_fields limit if set (for optional tier)
        if 'max_fields' in config and len(tracked) > config['max_fields']:
            tracked = tracked[:config['max_fields']]

        return tracked

    @api.model_create_multi
    def create(self, vals_list):
        records = super().create(vals_list)
        for record in records:
            record._orca_log_action('create', {}, record._orca_snapshot())
        return records

    def write(self, vals):
        before = {r.id: r._orca_snapshot() for r in self}
        result = super().write(vals)
        for record in self:
            record._orca_log_action('write', before[record.id], record._orca_snapshot())
        return result

    def unlink(self):
        before = {r.id: r._orca_snapshot() for r in self}
        for record in self:
            record._orca_log_action('unlink', before[record.id], {})
        return super().unlink()

    def _orca_snapshot(self):
        """
        Creates a JSON snapshot of tracked fields.

        Converts field values to JSON-serializable format (id for M2O, list of ids for M2M).
        """
        tracked_fields = self._orca_get_tracked_fields()
        if not tracked_fields:
            return '{}'

        snapshot = {}
        for field_name in tracked_fields:
            try:
                if not hasattr(self, field_name):
                    continue

                value = getattr(self, field_name, None)

                # Convert recordset to id/list of ids
                if hasattr(value, 'id'):
                    snapshot[field_name] = value.id
                elif isinstance(value, (list, tuple)):
                    snapshot[field_name] = [
                        v.id if hasattr(v, 'id') else v
                        for v in value
                    ]
                else:
                    snapshot[field_name] = value
            except Exception:
                # Skip fields that raise access errors
                pass

        return json.dumps(snapshot, default=str)

    def _orca_log_action(self, action, before_snapshot, after_snapshot):
        """
        Creates an audit log entry in the configured log model.

        Args:
            action: 'create', 'write', 'unlink', 'sync', 'error', 'validate'
            before_snapshot: JSON or dict of before values
            after_snapshot: JSON or dict of after values
        """
        if not self._orca_log_model or self._orca_log_model == 'orca.log':
            return False

        try:
            log_model = self.env[self._orca_log_model]

            # Get project_id from config
            project_id = self.env['ir.config.parameter'].get_param('orca.project.id', 'default')

            log_model.create({
                'project_id': project_id,
                'module_name': self._module,
                'model_name': self._name,
                'record_id': self.id,
                'action': action,
                'before_values': (
                    before_snapshot
                    if isinstance(before_snapshot, str)
                    else json.dumps(before_snapshot)
                ),
                'after_values': (
                    after_snapshot
                    if isinstance(after_snapshot, str)
                    else json.dumps(after_snapshot)
                ),
                'tier': self._orca_tier.lower(),
            })
            return True

        except Exception as e:
            self.env['ir.logging'].create({
                'name': f'ORCA Universal Logging Error: {self._name}',
                'type': 'server',
                'level': 'error',
                'message': str(e),
            })
            return False

    def orca_notify_sync(self, sync_data: dict, sync_type: str = None):
        """
        Notify ORCA of a fiscal/business operation sync.

        Used by localization modules (l10n_do_accounting, etc.) to report
        EasyCount syncs, DGII submissions, etc.

        Args:
            sync_data: dict with operation details (status, timestamp, dgii_uuid, etc.)
            sync_type: str, type of sync ('invoice', 'report', 'receipt', etc.)
        """
        if not self._orca_log_model:
            return False

        try:
            log_model = self.env[self._orca_log_model]
            project_id = self.env['ir.config.parameter'].get_param('orca.project.id', 'default')

            log_model.create({
                'project_id': project_id,
                'module_name': self._module,
                'model_name': self._name,
                'record_id': self.id,
                'action': 'sync',
                'after_values': json.dumps(sync_data, default=str),
                'tier': self._orca_tier.lower(),
            })

            # Also trigger ORCA service to push to NestJS backend
            orca_service_name = f'{self._module}.orca.service'
            if orca_service_name in self.env:
                service = self.env[orca_service_name]
                service.notify_sync(
                    self._module,
                    self._name,
                    self.id,
                    sync_data,
                    sync_type
                )

            return True

        except Exception as e:
            self.env['ir.logging'].create({
                'name': f'ORCA Sync Notification Error: {self._name}',
                'type': 'server',
                'level': 'error',
                'message': str(e),
            })
            return False
