from odoo import fields, models


class AccountMoveOrcaLog(models.Model):
    _name = 'l10n.do.accounting.orca.log'
    _description = 'l10n_do_accounting ORCA Audit Log'
    _inherit = 'orca.log'

    encf = fields.Char(
        string='e-CF Number',
        help='Electronic Fiscal Voucher number at time of log'
    )
    fiscal_state = fields.Char(
        string='Fiscal State',
        help='Fiscal state (draft, validated, sent, accepted, rejected) at time of log'
    )
    dgii_uuid = fields.Char(
        string='DGII UUID',
        help='DGII UUID at time of log (if already sent to DGII)'
    )
    move_type = fields.Char(
        string='Move Type',
        help='Type of accounting move (out_invoice, out_refund, etc.)'
    )
    amount_total = fields.Float(
        string='Amount Total',
        help='Total amount in move'
    )


class AccountMove(models.Model):
    _inherit = ['account.move', 'orca.audit.mixin']
    _orca_tracked_fields = [
        'name',
        'state',
        'amount_total',
        'partner_id',
        'l10n_latam_document_type_id',
        'l10n_do_fiscal_number',
    ]
    _orca_log_model = 'l10n.do.accounting.orca.log'

    def _orca_log_action(self, action, before_snapshot, after_snapshot):
        if not self._orca_log_model or self._orca_log_model == 'orca.log':
            return False
        try:
            log_model = self.env[self._orca_log_model]
            log_model.create({
                'module_name': self._module,
                'model_name': self._name,
                'record_id': self.id,
                'action': action,
                'before_values': before_snapshot if isinstance(before_snapshot, str) else str(before_snapshot),
                'after_values': after_snapshot if isinstance(after_snapshot, str) else str(after_snapshot),
                'encf': getattr(self, 'l10n_do_fiscal_number', None),
                'fiscal_state': getattr(self, 'state', None),
                'dgii_uuid': getattr(self, 'l10n_do_dgii_uuid', None),
                'move_type': getattr(self, 'move_type', None),
                'amount_total': getattr(self, 'amount_total', 0.0),
            })
            return True
        except Exception as e:
            self.env['ir.logging'].create({
                'name': f'ORCA Logging Error: {self._name}',
                'type': 'server',
                'level': 'error',
                'message': str(e),
            })
            return False
