import json
from odoo import models, fields


class OrcaECommerceOrderLog(models.Model):
    _name = 'orca.ecommerce.order.log'
    _description = 'E-Commerce Order ORCA Audit Log'
    _inherit = 'orca.log'

    order_reference = fields.Char(string='Order Reference')
    customer_email = fields.Char(string='Customer Email')
    order_status = fields.Selection([
        ('draft', 'Draft'),
        ('sent', 'Quotation Sent'),
        ('sale', 'Sales Order'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ], string='Order Status')
    order_date = fields.Date(string='Order Date')
    order_total = fields.Float(string='Order Total')
    item_count = fields.Integer(string='Item Count')


class SaleOrder(models.Model):
    _inherit = ['sale.order', 'orca.universal.mixin']

    _orca_tier = 'high'
    _orca_log_model = 'orca.ecommerce.order.log'
    _orca_tracked_fields = ['state', 'partner_id', 'amount_total', 'date_order', 'order_line']

    def create(self, vals_list):
        records = super().create(vals_list)
        for record in records:
            self.env['orca.ecommerce.order.log'].create({
                'module_name': self._module,
                'model_name': self._name,
                'record_id': record.id,
                'action': 'create',
                'order_reference': record.name or 'N/A',
                'customer_email': record.partner_id.email if record.partner_id else '',
                'order_status': record.state,
                'order_date': record.date_order,
                'order_total': record.amount_total,
                'item_count': len(record.order_line),
                'before_values': json.dumps({}),
                'after_values': json.dumps(self._orca_snapshot(record)),
            })
        return records

    def write(self, vals):
        before_snapshots = {r.id: self._orca_snapshot(r) for r in self}
        result = super().write(vals)
        for record in self:
            self.env['orca.ecommerce.order.log'].create({
                'module_name': self._module,
                'model_name': self._name,
                'record_id': record.id,
                'action': 'write',
                'order_reference': record.name or 'N/A',
                'customer_email': record.partner_id.email if record.partner_id else '',
                'order_status': record.state,
                'order_date': record.date_order,
                'order_total': record.amount_total,
                'item_count': len(record.order_line),
                'before_values': json.dumps(before_snapshots[record.id]),
                'after_values': json.dumps(self._orca_snapshot(record)),
            })
        return result

    def unlink(self):
        before_snapshots = {r.id: self._orca_snapshot(r) for r in self}
        for record in self:
            self.env['orca.ecommerce.order.log'].create({
                'module_name': self._module,
                'model_name': self._name,
                'record_id': record.id,
                'action': 'unlink',
                'order_reference': record.name or 'N/A',
                'customer_email': record.partner_id.email if record.partner_id else '',
                'order_status': record.state,
                'order_date': record.date_order,
                'order_total': record.amount_total,
                'item_count': len(record.order_line),
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
            'order_line_count': len(record.order_line),
        }
