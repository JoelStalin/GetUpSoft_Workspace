# -*- coding: utf-8 -*-
"""
ORCA Integration for l10n_do_accounting

Provides automatic audit logging for all account.move operations
including fiscal document lifecycle tracking.

Author: getupsoft
License: LGPL-3
"""

from odoo import models, fields


class L10nDoAccountingOrcaLog(models.Model):
    """ORCA Audit Log for l10n_do_accounting module"""
    _name = 'l10n.do.accounting.orca.log'
    _description = 'l10n_do_accounting ORCA Audit Log'
    _inherit = 'orca.log'

    # Fiscal document specific fields
    encf = fields.Char(
        string='e-CF Number',
        help='Electronic Comprobante Fiscal number'
    )
    fiscal_state = fields.Char(
        string='Fiscal State',
        help='Fiscal state at time of audit'
    )
    dgii_uuid = fields.Char(
        string='DGII UUID',
        help='DGII-assigned UUID for fiscal document'
    )
    document_type = fields.Char(
        string='Document Type Code',
        help='LATAM document type code (e.g., 01, 02, 03)'
    )
    operation_type = fields.Selection([
        ('create', 'Create'),
        ('modify', 'Modify'),
        ('cancel', 'Cancel'),
        ('reverse', 'Reverse'),
        ('validate', 'Validate'),
    ], string='Operation Type', help='Type of fiscal operation')

    # Impact assessment
    amount_impacted = fields.Float(
        string='Amount Impacted',
        help='Invoice total affected by operation'
    )
    impact_level = fields.Selection([
        ('critical', 'Critical'),
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ], string='Impact Level', help='Business impact of the change')


class AccountMoveOrcaAudit(models.Model):
    """Extend account.move with ORCA audit tracking"""
    _inherit = ['account.move', 'orca.audit.mixin']

    # ORCA Configuration for account.move
    _orca_tracked_fields = [
        'name',  # NCF/Sequence
        'state',  # Posted, Draft, Cancelled
        'amount_total',  # Total invoice amount
        'amount_tax',  # Tax amount
        'amount_untaxed',  # Untaxed amount
        'partner_id',  # Customer/Vendor
        'l10n_latam_document_type_id',  # LATAM document type
        'l10n_do_fiscal_number',  # Dominican fiscal number
        'journal_id',  # Accounting journal
        'currency_id',  # Currency
        'invoice_date',  # Invoice date
        'due_date',  # Due date
    ]
    _orca_log_model = 'l10n.do.accounting.orca.log'

    def _orca_log_action(self, record, action, before, after):
        """Override to add fiscal-specific context to ORCA logs"""
        # Call parent implementation
        super()._orca_log_action(record, action, before, after)

        # Enhance log with fiscal document information
        if action in ['create', 'write', 'validate']:
            try:
                log = self.env[self._orca_log_model].search([
                    ('record_id', '=', record.id),
                    ('action', '=', action),
                    ('model_name', '=', 'account.move'),
                ], order='date desc', limit=1)

                if log:
                    # Add fiscal-specific fields
                    log.write({
                        'encf': record.l10n_do_fiscal_number or '',
                        'fiscal_state': record.state or 'draft',
                        'document_type': record.l10n_latam_document_type_id.code if record.l10n_latam_document_type_id else '',
                        'operation_type': self._get_fiscal_operation_type(action),
                        'amount_impacted': record.amount_total,
                        'impact_level': self._calculate_impact_level(record),
                    })
            except Exception as e:
                # Log errors but don't block the operation
                self.env.cr.execute(
                    "UPDATE orca_log SET orca_sync_error = %s WHERE id = %s",
                    (str(e), log.id if log else None)
                )

    def _get_fiscal_operation_type(self, action):
        """Determine fiscal operation type from action"""
        mapping = {
            'create': 'create',
            'write': 'modify',
            'unlink': 'cancel',
            'validate': 'validate',
        }
        return mapping.get(action, 'modify')

    def _calculate_impact_level(self, record):
        """Calculate business impact level based on amount"""
        amount = record.amount_total or 0
        if amount > 100000:
            return 'critical'
        elif amount > 50000:
            return 'high'
        elif amount > 10000:
            return 'medium'
        else:
            return 'low'

    def action_view_orca_logs(self):
        """Action to view ORCA audit logs for this move"""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'ORCA Audit Logs',
            'res_model': 'l10n.do.accounting.orca.log',
            'view_mode': 'tree,form',
            'domain': [
                ('model_name', '=', 'account.move'),
                ('record_id', '=', self.id),
            ],
            'context': {'search_default_group_by_action': 1},
        }
