import json
from odoo import models, fields


class OrcaManufacturingOrderLog(models.Model):
    _name = 'orca.manufacturing.order.log'
    _description = 'Manufacturing Order ORCA Audit Log'
    _inherit = 'orca.log'

    mo_reference = fields.Char(string='MO Reference')
    product_name = fields.Char(string='Product Name')
    mo_status = fields.Selection([
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
        ('progress', 'In Progress'),
        ('done', 'Done'),
        ('cancel', 'Cancelled'),
    ], string='MO Status')
    quantity_to_produce = fields.Float(string='Quantity to Produce')
    quantity_produced = fields.Float(string='Quantity Produced')
    bom_id = fields.Char(string='Bill of Materials')


class ManufacturingOrder(models.Model):
    _inherit = ['mrp.production', 'orca.universal.mixin']

    _orca_tier = 'critical'
    _orca_log_model = 'orca.manufacturing.order.log'
    _orca_tracked_fields = ['state', 'product_id', 'product_qty', 'qty_produced', 'bom_id']

    def create(self, vals_list):
        records = super().create(vals_list)
        for record in records:
            self.env['orca.manufacturing.order.log'].create({
                'module_name': self._module,
                'model_name': self._name,
                'record_id': record.id,
                'action': 'create',
                'mo_reference': record.name or 'N/A',
                'product_name': record.product_id.name if record.product_id else '',
                'mo_status': record.state,
                'quantity_to_produce': record.product_qty,
                'quantity_produced': record.qty_produced,
                'bom_id': record.bom_id.name if record.bom_id else '',
                'before_values': json.dumps({}),
                'after_values': json.dumps(self._orca_snapshot(record)),
            })
        return records

    def write(self, vals):
        before_snapshots = {r.id: self._orca_snapshot(r) for r in self}
        result = super().write(vals)
        for record in self:
            self.env['orca.manufacturing.order.log'].create({
                'module_name': self._module,
                'model_name': self._name,
                'record_id': record.id,
                'action': 'write',
                'mo_reference': record.name or 'N/A',
                'product_name': record.product_id.name if record.product_id else '',
                'mo_status': record.state,
                'quantity_to_produce': record.product_qty,
                'quantity_produced': record.qty_produced,
                'bom_id': record.bom_id.name if record.bom_id else '',
                'before_values': json.dumps(before_snapshots[record.id]),
                'after_values': json.dumps(self._orca_snapshot(record)),
            })
        return result

    def unlink(self):
        before_snapshots = {r.id: self._orca_snapshot(r) for r in self}
        for record in self:
            self.env['orca.manufacturing.order.log'].create({
                'module_name': self._module,
                'model_name': self._name,
                'record_id': record.id,
                'action': 'unlink',
                'mo_reference': record.name or 'N/A',
                'product_name': record.product_id.name if record.product_id else '',
                'mo_status': record.state,
                'quantity_to_produce': record.product_qty,
                'quantity_produced': record.qty_produced,
                'bom_id': record.bom_id.name if record.bom_id else '',
                'before_values': json.dumps(before_snapshots[record.id]),
                'after_values': json.dumps({}),
            })
        return super().unlink()

    def _orca_snapshot(self, record):
        return {
            'state': record.state,
            'product_id': record.product_id.id if record.product_id else None,
            'product_qty': record.product_qty,
            'qty_produced': record.qty_produced,
            'bom_id': record.bom_id.id if record.bom_id else None,
        }
