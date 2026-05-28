import json
from odoo import models, fields

class OrcaProcurementGroupLog(models.Model):
    _name = 'orca.procurement.group.log'
    _description = 'Procurement Group ORCA Audit Log'
    _inherit = 'orca.log'
    procurement_ref = fields.Char(string='Procurement Reference')
    status = fields.Selection([('confirmed','Confirmed'),('progress','In Progress'),('done','Done'),('cancelled','Cancelled')], string='Status')
    priority = fields.Selection([('0','Low'),('1','Normal'),('2','High')], string='Priority')
    item_count = fields.Integer(string='Item Count')

class ProcurementGroup(models.Model):
    _inherit = ['procurement.group', 'orca.universal.mixin']
    _orca_tier = 'high'
    _orca_log_model = 'orca.procurement.group.log'
    _orca_tracked_fields = ['name', 'state', 'priority', 'move_type']
    
    def create(self, vals_list):
        records = super().create(vals_list)
        for record in records:
            self.env['orca.procurement.group.log'].create({
                'module_name': self._module, 'model_name': self._name, 'record_id': record.id, 'action': 'create',
                'procurement_ref': record.name or 'N/A', 'status': getattr(record, 'state', 'confirmed') or 'confirmed',
                'priority': str(getattr(record, 'priority', '1') or '1'), 'item_count': len(getattr(record, 'procurement_ids', [])) if hasattr(record, 'procurement_ids') else 0,
                'before_values': json.dumps({}), 'after_values': json.dumps(self._orca_snapshot(record))
            })
        return records
    
    def write(self, vals):
        before_snapshots = {r.id: self._orca_snapshot(r) for r in self}
        result = super().write(vals)
        for record in self:
            self.env['orca.procurement.group.log'].create({
                'module_name': self._module, 'model_name': self._name, 'record_id': record.id, 'action': 'write',
                'procurement_ref': record.name or 'N/A', 'status': getattr(record, 'state', 'confirmed') or 'confirmed',
                'priority': str(getattr(record, 'priority', '1') or '1'), 'item_count': len(getattr(record, 'procurement_ids', [])) if hasattr(record, 'procurement_ids') else 0,
                'before_values': json.dumps(before_snapshots[record.id]), 'after_values': json.dumps(self._orca_snapshot(record))
            })
        return result
    
    def _orca_snapshot(self, record):
        return {'name': record.name, 'state': getattr(record, 'state', 'confirmed'), 'priority': str(getattr(record, 'priority', '1'))}
