import json
from odoo import models, fields


class OrcaStockMoveLog(models.Model):
    _name = 'orca.stock.move.log'
    _description = 'Stock Movement ORCA Audit Log'
    _inherit = 'orca.log'

    product_name = fields.Char(string='Product Name')
    move_type = fields.Selection([
        ('in', 'Incoming'),
        ('out', 'Outgoing'),
        ('internal', 'Internal Transfer'),
        ('return', 'Return'),
        ('adjustment', 'Adjustment'),
    ], string='Movement Type')
    quantity_moved = fields.Float(string='Quantity Moved')
    source_location = fields.Char(string='Source Location')
    destination_location = fields.Char(string='Destination Location')
    reference = fields.Char(string='Reference')


class StockMove(models.Model):
    _inherit = ['stock.move', 'orca.universal.mixin']

    _orca_tier = 'high'
    _orca_log_model = 'orca.stock.move.log'
    _orca_tracked_fields = ['state', 'product_id', 'quantity_done', 'location_id', 'location_dest_id', 'reference']

    def create(self, vals_list):
        records = super().create(vals_list)
        for record in records:
            self.env['orca.stock.move.log'].create({
                'module_name': self._module,
                'model_name': self._name,
                'record_id': record.id,
                'action': 'create',
                'product_name': record.product_id.name if record.product_id else '',
                'move_type': record.move_type or 'internal',
                'quantity_moved': record.quantity_done or 0,
                'source_location': record.location_id.name if record.location_id else '',
                'destination_location': record.location_dest_id.name if record.location_dest_id else '',
                'reference': record.reference or '',
                'before_values': json.dumps({}),
                'after_values': json.dumps(self._orca_snapshot(record)),
            })
        return records

    def write(self, vals):
        before_snapshots = {r.id: self._orca_snapshot(r) for r in self}
        result = super().write(vals)
        for record in self:
            self.env['orca.stock.move.log'].create({
                'module_name': self._module,
                'model_name': self._name,
                'record_id': record.id,
                'action': 'write',
                'product_name': record.product_id.name if record.product_id else '',
                'move_type': record.move_type or 'internal',
                'quantity_moved': record.quantity_done or 0,
                'source_location': record.location_id.name if record.location_id else '',
                'destination_location': record.location_dest_id.name if record.location_dest_id else '',
                'reference': record.reference or '',
                'before_values': json.dumps(before_snapshots[record.id]),
                'after_values': json.dumps(self._orca_snapshot(record)),
            })
        return result

    def unlink(self):
        before_snapshots = {r.id: self._orca_snapshot(r) for r in self}
        for record in self:
            self.env['orca.stock.move.log'].create({
                'module_name': self._module,
                'model_name': self._name,
                'record_id': record.id,
                'action': 'unlink',
                'product_name': record.product_id.name if record.product_id else '',
                'move_type': record.move_type or 'internal',
                'quantity_moved': record.quantity_done or 0,
                'source_location': record.location_id.name if record.location_id else '',
                'destination_location': record.location_dest_id.name if record.location_dest_id else '',
                'reference': record.reference or '',
                'before_values': json.dumps(before_snapshots[record.id]),
                'after_values': json.dumps({}),
            })
        return super().unlink()

    def _orca_snapshot(self, record):
        return {
            'state': record.state,
            'product_id': record.product_id.id if record.product_id else None,
            'quantity_done': record.quantity_done,
            'location_id': record.location_id.id if record.location_id else None,
            'location_dest_id': record.location_dest_id.id if record.location_dest_id else None,
            'reference': record.reference,
        }
