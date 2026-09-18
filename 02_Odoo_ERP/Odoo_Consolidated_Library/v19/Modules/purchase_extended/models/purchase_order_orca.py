import json
from odoo import models, fields


class OrcaPurchaseOrderLog(models.Model):
    _name = 'orca.purchase.order.log'
    _description = 'Purchase Order ORCA Audit Log'
    _inherit = 'orca.log'

    po_reference = fields.Char(string='PO Reference')
    vendor_name = fields.Char(string='Vendor Name')
    po_status = fields.Selection([
        ('draft', 'Draft'),
        ('sent', 'RFQ Sent'),
        ('to approve', 'To Approve'),
        ('purchase', 'Purchase Order'),
        ('done', 'Locked'),
        ('cancel', 'Cancelled'),
    ], string='PO Status')
    order_date = fields.Date(string='Order Date')
    order_amount = fields.Float(string='Order Amount')
    line_count = fields.Integer(string='Line Count')


class PurchaseOrder(models.Model):
    _inherit = ['purchase.order', 'orca.universal.mixin']

    _orca_tier = 'high'
    _orca_log_model = 'orca.purchase.order.log'
    _orca_tracked_fields = ['state', 'partner_id', 'amount_total', 'date_order', 'order_line']

    def create(self, vals_list):
        records = super().create(vals_list)
        for record in records:
            self.env['orca.purchase.order.log'].create({
                'module_name': self._module,
                'model_name': self._name,
                'record_id': record.id,
                'action': 'create',
                'po_reference': record.name or 'N/A',
                'vendor_name': record.partner_id.name if record.partner_id else '',
                'po_status': record.state,
                'order_date': record.date_order,
                'order_amount': record.amount_total,
                'line_count': len(record.order_line),
                'before_values': json.dumps({}),
                'after_values': json.dumps(self._orca_snapshot(record)),
            })
        return records

    def write(self, vals):
        before_snapshots = {r.id: self._orca_snapshot(r) for r in self}
        result = super().write(vals)
        for record in self:
            self.env['orca.purchase.order.log'].create({
                'module_name': self._module,
                'model_name': self._name,
                'record_id': record.id,
                'action': 'write',
                'po_reference': record.name or 'N/A',
                'vendor_name': record.partner_id.name if record.partner_id else '',
                'po_status': record.state,
                'order_date': record.date_order,
                'order_amount': record.amount_total,
                'line_count': len(record.order_line),
                'before_values': json.dumps(before_snapshots[record.id]),
                'after_values': json.dumps(self._orca_snapshot(record)),
            })
        return result

    def unlink(self):
        before_snapshots = {r.id: self._orca_snapshot(r) for r in self}
        for record in self:
            self.env['orca.purchase.order.log'].create({
                'module_name': self._module,
                'model_name': self._name,
                'record_id': record.id,
                'action': 'unlink',
                'po_reference': record.name or 'N/A',
                'vendor_name': record.partner_id.name if record.partner_id else '',
                'po_status': record.state,
                'order_date': record.date_order,
                'order_amount': record.amount_total,
                'line_count': len(record.order_line),
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
