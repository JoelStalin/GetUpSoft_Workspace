import json
from odoo import models, fields


class OrcaSaleOrderLog(models.Model):
    _name = 'orca.sale.order.log'
    _description = 'Sale Order ORCA Audit Log'
    _inherit = 'orca.log'

    customer_name = fields.Char(string='Customer Name')
    order_total = fields.Float(string='Order Total')
    order_date = fields.Date(string='Order Date')
    delivery_date = fields.Date(string='Delivery Date')
    order_state = fields.Selection([
        ('draft', 'Quotation'),
        ('sent', 'Quotation Sent'),
        ('sale', 'Sales Order'),
        ('done', 'Locked'),
        ('cancel', 'Cancelled'),
    ], string='Order State')
    product_count = fields.Integer(string='Product Count')


class SaleOrder(models.Model):
    _inherit = ['sale.order', 'orca.universal.mixin']

    _orca_tier = 'high'
    _orca_log_model = 'orca.sale.order.log'
    _orca_tracked_fields = ['state', 'partner_id', 'amount_total', 'date_order', 'commitment_date', 'order_line']

    def create(self, vals_list):
        records = super().create(vals_list)
        for record in records:
            self.env['orca.sale.order.log'].create({
                'module_name': self._module,
                'model_name': self._name,
                'record_id': record.id,
                'action': 'create',
                'customer_name': record.partner_id.name if record.partner_id else '',
                'order_total': record.amount_total,
                'order_date': record.date_order,
                'delivery_date': record.commitment_date,
                'order_state': record.state,
                'product_count': len(record.order_line),
                'before_values': json.dumps({}),
                'after_values': json.dumps(self._orca_snapshot(record)),
            })
        return records

    def write(self, vals):
        before_snapshots = {r.id: self._orca_snapshot(r) for r in self}
        result = super().write(vals)
        for record in self:
            self.env['orca.sale.order.log'].create({
                'module_name': self._module,
                'model_name': self._name,
                'record_id': record.id,
                'action': 'write',
                'customer_name': record.partner_id.name if record.partner_id else '',
                'order_total': record.amount_total,
                'order_date': record.date_order,
                'delivery_date': record.commitment_date,
                'order_state': record.state,
                'product_count': len(record.order_line),
                'before_values': json.dumps(before_snapshots[record.id]),
                'after_values': json.dumps(self._orca_snapshot(record)),
            })
        return result

    def unlink(self):
        before_snapshots = {r.id: self._orca_snapshot(r) for r in self}
        for record in self:
            self.env['orca.sale.order.log'].create({
                'module_name': self._module,
                'model_name': self._name,
                'record_id': record.id,
                'action': 'unlink',
                'customer_name': record.partner_id.name if record.partner_id else '',
                'order_total': record.amount_total,
                'order_date': record.date_order,
                'delivery_date': record.commitment_date,
                'order_state': record.state,
                'product_count': len(record.order_line),
                'before_values': json.dumps(before_snapshots[record.id]),
                'after_values': json.dumps({}),
            })
        return super().unlink()

    def _orca_snapshot(self, record):
        return {
            'state': record.state,
            'partner_id': record.partner_id.id if record.partner_id else None,
            'amount_total': record.amount_total,
            'date_order': str(record.date_order) if record.date_order else None,
            'commitment_date': str(record.commitment_date) if record.commitment_date else None,
            'order_line_count': len(record.order_line),
        }
