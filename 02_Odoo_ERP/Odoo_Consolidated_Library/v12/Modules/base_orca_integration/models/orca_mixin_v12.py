from odoo import models, api
import json


class OrcaAuditMixinV12(models.AbstractModel):
    _name = 'orca.audit.mixin.v12'
    _description = 'ORCA Audit Mixin for Odoo v12 (Legacy API)'

    _orca_tracked_fields = []
    _orca_log_model = 'orca.log'

    @api.multi
    def create(self, vals):
        records = super(OrcaAuditMixinV12, self).create(vals)
        for record in records:
            self._orca_log_action(record, 'create', {}, record._orca_snapshot())
        return records

    @api.multi
    def write(self, vals):
        before = {r.id: r._orca_snapshot() for r in self}
        result = super(OrcaAuditMixinV12, self).write(vals)
        for record in self:
            self._orca_log_action(record, 'write', before[record.id], record._orca_snapshot())
        return result

    @api.multi
    def unlink(self):
        before = {r.id: r._orca_snapshot() for r in self}
        for record in self:
            self._orca_log_action(record, 'unlink', before[record.id], {})
        return super(OrcaAuditMixinV12, self).unlink()

    @api.multi
    def _orca_snapshot(self):
        return json.dumps({f: getattr(self, f, None) for f in self._orca_tracked_fields}, default=str)

    def _orca_log_action(self, record, action, before, after):
        self.env[self._orca_log_model].create({
            'module_name': self._module,
            'model_name': self._name,
            'record_id': record.id,
            'action': action,
            'before_values': before,
            'after_values': after,
        })
