import json
from odoo import models, fields


class OrcaQuotationLog(models.Model):
    _name = 'orca.quotation.log'
    _description = 'Quotation ORCA Audit Log'
    _inherit = 'orca.log'

    quotation_ref = fields.Char(string='Quotation Reference')
    customer_name = fields.Char(string='Customer Name')
    quotation_status = fields.Selection([
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('opened', 'Opened'),
        ('converted', 'Converted'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ], string='Quotation Status')
    validity_date = fields.Date(string='Validity Date')
    quotation_amount = fields.Float(string='Quotation Amount')
    line_count = fields.Integer(string='Line Count')


class SaleOrder(models.Model):
    _inherit = ['sale.order', 'orca.universal.mixin']

    _orca_tier = 'high'
    _orca_log_model = 'orca.quotation.log'
    _orca_tracked_fields = ['state', 'partner_id', 'amount_total', 'validity_date', 'order_line']

    def create(self, vals_list):
        records = super().create(vals_list)
        for record in records:
            self.env['orca.quotation.log'].create({
                'module_name': self._module,
                'model_name': self._name,
                'record_id': record.id,
                'action': 'create',
                'quotation_ref': record.name or 'N/A',
                'customer_name': record.partner_id.name if record.partner_id else '',
                'quotation_status': record.state,
                'validity_date': record.validity_date,
                'quotation_amount': record.amount_total,
                'line_count': len(record.order_line),
                'before_values': json.dumps({}),
                'after_values': json.dumps(self._orca_snapshot(record)),
            })
        return records

    def write(self, vals):
        before_snapshots = {r.id: self._orca_snapshot(r) for r in self}
        result = super().write(vals)
        for record in self:
            self.env['orca.quotation.log'].create({
                'module_name': self._module,
                'model_name': self._name,
                'record_id': record.id,
                'action': 'write',
                'quotation_ref': record.name or 'N/A',
                'customer_name': record.partner_id.name if record.partner_id else '',
                'quotation_status': record.state,
                'validity_date': record.validity_date,
                'quotation_amount': record.amount_total,
                'line_count': len(record.order_line),
                'before_values': json.dumps(before_snapshots[record.id]),
                'after_values': json.dumps(self._orca_snapshot(record)),
            })
        return result

    def unlink(self):
        before_snapshots = {r.id: self._orca_snapshot(r) for r in self}
        for record in self:
            self.env['orca.quotation.log'].create({
                'module_name': self._module,
                'model_name': self._name,
                'record_id': record.id,
                'action': 'unlink',
                'quotation_ref': record.name or 'N/A',
                'customer_name': record.partner_id.name if record.partner_id else '',
                'quotation_status': record.state,
                'validity_date': record.validity_date,
                'quotation_amount': record.amount_total,
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
            'validity_date': str(record.validity_date) if record.validity_date else None,
            'order_line_count': len(record.order_line),
        }
