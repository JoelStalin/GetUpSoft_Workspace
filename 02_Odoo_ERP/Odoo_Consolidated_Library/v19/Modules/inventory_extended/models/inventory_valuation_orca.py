import json
from odoo import models, fields

class OrcaInventoryValuationLog(models.Model):
    _name = 'orca.inventory.valuation.log'
    _description = 'Inventory Valuation ORCA Audit Log'
    _inherit = 'orca.log'
    product_name = fields.Char(string='Product')
    valuation_method = fields.Selection([('fifo','FIFO'),('lifo','LIFO'),('average','Average')], string='Valuation')
    unit_cost = fields.Float(string='Unit Cost')
    total_value = fields.Float(string='Total Value')

class ProductProduct(models.Model):
    _inherit = ['product.product', 'orca.universal.mixin']
    _orca_tier = 'high'
    _orca_log_model = 'orca.inventory.valuation.log'
    _orca_tracked_fields = ['name', 'cost_method', 'standard_price', 'list_price']
    
    def create(self, vals_list):
        records = super().create(vals_list)
        for record in records:
            self.env['orca.inventory.valuation.log'].create({
                'module_name': self._module, 'model_name': self._name, 'record_id': record.id, 'action': 'create',
                'product_name': record.name, 'valuation_method': record.cost_method or 'fifo', 'unit_cost': record.standard_price,
                'total_value': record.standard_price * record.qty_available if hasattr(record, 'qty_available') else 0,
                'before_values': json.dumps({}), 'after_values': json.dumps(self._orca_snapshot(record))
            })
        return records
    
    def write(self, vals):
        before_snapshots = {r.id: self._orca_snapshot(r) for r in self}
        result = super().write(vals)
        for record in self:
            self.env['orca.inventory.valuation.log'].create({
                'module_name': self._module, 'model_name': self._name, 'record_id': record.id, 'action': 'write',
                'product_name': record.name, 'valuation_method': record.cost_method or 'fifo', 'unit_cost': record.standard_price,
                'total_value': record.standard_price * (record.qty_available if hasattr(record, 'qty_available') else 0),
                'before_values': json.dumps(before_snapshots[record.id]), 'after_values': json.dumps(self._orca_snapshot(record))
            })
        return result
    
    def _orca_snapshot(self, record):
        return {'name': record.name, 'cost_method': record.cost_method, 'standard_price': record.standard_price}
