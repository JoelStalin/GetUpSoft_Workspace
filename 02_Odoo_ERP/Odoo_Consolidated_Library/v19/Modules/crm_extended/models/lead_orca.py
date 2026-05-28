import json
from odoo import models, fields


class OrcaLeadLog(models.Model):
    _name = 'orca.lead.log'
    _description = 'Lead ORCA Audit Log'
    _inherit = 'orca.log'

    lead_name = fields.Char(string='Lead Name')
    contact_name = fields.Char(string='Contact Name')
    lead_status = fields.Selection([
        ('new', 'New'),
        ('qualified', 'Qualified'),
        ('proposal', 'Proposal Sent'),
        ('negotiation', 'Negotiation'),
        ('won', 'Won'),
        ('lost', 'Lost'),
    ], string='Lead Status')
    lead_probability = fields.Float(string='Win Probability (%)')
    lead_value = fields.Float(string='Expected Revenue')
    team_name = fields.Char(string='Sales Team')


class CrmLead(models.Model):
    _inherit = ['crm.lead', 'orca.universal.mixin']

    _orca_tier = 'high'
    _orca_log_model = 'orca.lead.log'
    _orca_tracked_fields = ['stage_id', 'partner_id', 'name', 'probability', 'expected_revenue', 'team_id']

    def create(self, vals_list):
        records = super().create(vals_list)
        for record in records:
            self.env['orca.lead.log'].create({
                'module_name': self._module,
                'model_name': self._name,
                'record_id': record.id,
                'action': 'create',
                'lead_name': record.name or 'N/A',
                'contact_name': record.partner_id.name if record.partner_id else '',
                'lead_status': record.stage_id.name if record.stage_id else 'new',
                'lead_probability': record.probability,
                'lead_value': record.expected_revenue,
                'team_name': record.team_id.name if record.team_id else '',
                'before_values': json.dumps({}),
                'after_values': json.dumps(self._orca_snapshot(record)),
            })
        return records

    def write(self, vals):
        before_snapshots = {r.id: self._orca_snapshot(r) for r in self}
        result = super().write(vals)
        for record in self:
            self.env['orca.lead.log'].create({
                'module_name': self._module,
                'model_name': self._name,
                'record_id': record.id,
                'action': 'write',
                'lead_name': record.name or 'N/A',
                'contact_name': record.partner_id.name if record.partner_id else '',
                'lead_status': record.stage_id.name if record.stage_id else 'new',
                'lead_probability': record.probability,
                'lead_value': record.expected_revenue,
                'team_name': record.team_id.name if record.team_id else '',
                'before_values': json.dumps(before_snapshots[record.id]),
                'after_values': json.dumps(self._orca_snapshot(record)),
            })
        return result

    def unlink(self):
        before_snapshots = {r.id: self._orca_snapshot(r) for r in self}
        for record in self:
            self.env['orca.lead.log'].create({
                'module_name': self._module,
                'model_name': self._name,
                'record_id': record.id,
                'action': 'unlink',
                'lead_name': record.name or 'N/A',
                'contact_name': record.partner_id.name if record.partner_id else '',
                'lead_status': record.stage_id.name if record.stage_id else 'new',
                'lead_probability': record.probability,
                'lead_value': record.expected_revenue,
                'team_name': record.team_id.name if record.team_id else '',
                'before_values': json.dumps(before_snapshots[record.id]),
                'after_values': json.dumps({}),
            })
        return super().unlink()

    def _orca_snapshot(self, record):
        return {
            'name': record.name,
            'stage_id': record.stage_id.id if record.stage_id else None,
            'partner_id': record.partner_id.id if record.partner_id else None,
            'probability': record.probability,
            'expected_revenue': record.expected_revenue,
            'team_id': record.team_id.id if record.team_id else None,
        }
