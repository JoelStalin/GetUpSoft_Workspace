import json
from odoo import models, fields


class OrcaPhoneCallLog(models.Model):
    _name = 'orca.phone.call.log'
    _description = 'Phone Call ORCA Audit Log'
    _inherit = 'orca.log'

    call_reference = fields.Char(string='Call Reference')
    contact_name = fields.Char(string='Contact Name')
    call_type = fields.Selection([
        ('inbound', 'Inbound'),
        ('outbound', 'Outbound'),
        ('missed', 'Missed'),
        ('voicemail', 'Voicemail'),
    ], string='Call Type')
    call_duration = fields.Integer(string='Duration (seconds)')
    call_outcome = fields.Selection([
        ('completed', 'Completed'),
        ('no_answer', 'No Answer'),
        ('busy', 'Busy'),
        ('left_message', 'Left Message'),
        ('pending', 'Pending'),
    ], string='Call Outcome')
    next_action_date = fields.Date(string='Next Action Date')


class PhoneCall(models.Model):
    _inherit = ['phone.call', 'orca.universal.mixin']

    _orca_tier = 'high'
    _orca_log_model = 'orca.phone.call.log'
    _orca_tracked_fields = ['name', 'direction', 'duration', 'outcome', 'next_activity_date', 'lead_id']

    def create(self, vals_list):
        records = super().create(vals_list)
        for record in records:
            self.env['orca.phone.call.log'].create({
                'module_name': self._module,
                'model_name': self._name,
                'record_id': record.id,
                'action': 'create',
                'call_reference': record.name or 'N/A',
                'contact_name': record.lead_id.partner_id.name if record.lead_id and record.lead_id.partner_id else '',
                'call_type': record.direction or 'outbound',
                'call_duration': record.duration or 0,
                'call_outcome': record.outcome or 'pending',
                'next_action_date': record.next_activity_date,
                'before_values': json.dumps({}),
                'after_values': json.dumps(self._orca_snapshot(record)),
            })
        return records

    def write(self, vals):
        before_snapshots = {r.id: self._orca_snapshot(r) for r in self}
        result = super().write(vals)
        for record in self:
            self.env['orca.phone.call.log'].create({
                'module_name': self._module,
                'model_name': self._name,
                'record_id': record.id,
                'action': 'write',
                'call_reference': record.name or 'N/A',
                'contact_name': record.lead_id.partner_id.name if record.lead_id and record.lead_id.partner_id else '',
                'call_type': record.direction or 'outbound',
                'call_duration': record.duration or 0,
                'call_outcome': record.outcome or 'pending',
                'next_action_date': record.next_activity_date,
                'before_values': json.dumps(before_snapshots[record.id]),
                'after_values': json.dumps(self._orca_snapshot(record)),
            })
        return result

    def unlink(self):
        before_snapshots = {r.id: self._orca_snapshot(r) for r in self}
        for record in self:
            self.env['orca.phone.call.log'].create({
                'module_name': self._module,
                'model_name': self._name,
                'record_id': record.id,
                'action': 'unlink',
                'call_reference': record.name or 'N/A',
                'contact_name': record.lead_id.partner_id.name if record.lead_id and record.lead_id.partner_id else '',
                'call_type': record.direction or 'outbound',
                'call_duration': record.duration or 0,
                'call_outcome': record.outcome or 'pending',
                'next_action_date': record.next_activity_date,
                'before_values': json.dumps(before_snapshots[record.id]),
                'after_values': json.dumps({}),
            })
        return super().unlink()

    def _orca_snapshot(self, record):
        return {
            'name': record.name,
            'direction': record.direction,
            'duration': record.duration,
            'outcome': record.outcome,
            'next_activity_date': str(record.next_activity_date) if record.next_activity_date else None,
            'lead_id': record.lead_id.id if record.lead_id else None,
        }
