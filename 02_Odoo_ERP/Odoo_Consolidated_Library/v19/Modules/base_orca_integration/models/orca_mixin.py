from odoo import models, api
import json


class OrcaAuditMixin(models.AbstractModel):
    """Mixin for automatic ORCA audit logging on create/write/unlink.

    Subclasses must set:
    - _orca_tracked_fields: List of field names to snapshot
    - _orca_log_model: Name of concrete log model (e.g., 'l10n.do.accounting.orca.log')
    """

    _name = 'orca.audit.mixin'
    _description = 'ORCA Audit Mixin for Tracked Models'

    # Subclasses MUST override these
    _orca_tracked_fields = []
    _orca_log_model = 'orca.log'

    @api.model_create_multi
    def create(self, vals_list):
        """Log record creation with before/after snapshot."""
        records = super().create(vals_list)
        for record in records:
            snapshot = record._orca_snapshot()
            self.env[self._orca_log_model].create({
                'module_name': self._module,
                'model_name': self._name,
                'record_id': record.id,
                'action': 'create',
                'before_values': {},
                'after_values': snapshot,
            })
        return records

    def write(self, vals):
        """Log record modification with before/after snapshot."""
        before_snapshots = {r.id: r._orca_snapshot() for r in self}
        result = super().write(vals)

        for record in self:
            after_snapshot = record._orca_snapshot()
            if before_snapshots[record.id] != after_snapshot:
                self.env[self._orca_log_model].create({
                    'module_name': self._module,
                    'model_name': self._name,
                    'record_id': record.id,
                    'action': 'write',
                    'before_values': before_snapshots[record.id],
                    'after_values': after_snapshot,
                })
        return result

    def unlink(self):
        """Log record deletion with before snapshot."""
        before_snapshots = {r.id: r._orca_snapshot() for r in self}

        for record in self:
            self.env[self._orca_log_model].create({
                'module_name': self._module,
                'model_name': self._name,
                'record_id': record.id,
                'action': 'unlink',
                'before_values': before_snapshots[record.id],
                'after_values': {},
            })

        return super().unlink()

    def _orca_snapshot(self):
        """Create JSON snapshot of tracked fields.

        Handles relational fields (many2one, many2many) specially by capturing
        ID and display_name. Returns JSON-serializable dict.
        """
        snapshot = {}
        for field_name in self._orca_tracked_fields:
            try:
                value = getattr(self, field_name, None)
                # Handle many2one/many2many relational fields
                if hasattr(value, 'id') and hasattr(value, 'display_name'):
                    snapshot[field_name] = {
                        'id': value.id,
                        'name': value.display_name
                    }
                elif hasattr(value, 'ids'):
                    snapshot[field_name] = {'ids': value.ids}
                else:
                    snapshot[field_name] = value
            except Exception as e:
                snapshot[field_name] = f'<error: {str(e)}>'
        return snapshot
