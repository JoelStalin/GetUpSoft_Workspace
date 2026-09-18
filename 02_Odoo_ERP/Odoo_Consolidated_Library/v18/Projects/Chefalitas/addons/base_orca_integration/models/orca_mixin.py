import json
from odoo import api, fields, models


class OrcaAuditMixin(models.AbstractModel):
    _name = 'orca.audit.mixin'
    _description = 'ORCA Audit Mixin for automatic change tracking'

    _orca_tracked_fields = []
    _orca_log_model = 'orca.log'

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
        if not self._orca_tracked_fields:
            return '{}'
        snapshot = {}
        for field_name in self._orca_tracked_fields:
            if hasattr(self, field_name):
                value = getattr(self, field_name, None)
                if hasattr(value, 'id'):
                    snapshot[field_name] = value.id
                elif isinstance(value, (list, tuple)):
                    snapshot[field_name] = [v.id if hasattr(v, 'id') else v for v in value]
                else:
                    snapshot[field_name] = value
        return json.dumps(snapshot, default=str)

    def _orca_log_action(self, action, before_snapshot, after_snapshot):
        if not self._orca_log_model or self._orca_log_model == 'orca.log':
            return False
        try:
            log_model = self.env[self._orca_log_model]
            log_model.create({
                'module_name': self._module,
                'model_name': self._name,
                'record_id': self.id,
                'action': action,
                'before_values': before_snapshot if isinstance(before_snapshot, str) else json.dumps(before_snapshot),
                'after_values': after_snapshot if isinstance(after_snapshot, str) else json.dumps(after_snapshot),
            })
            return True
        except Exception as e:
            self.env['ir.logging'].create({
                'name': f'ORCA Logging Error: {self._name}',
                'type': 'server',
                'level': 'error',
                'message': str(e),
            })
            return False
