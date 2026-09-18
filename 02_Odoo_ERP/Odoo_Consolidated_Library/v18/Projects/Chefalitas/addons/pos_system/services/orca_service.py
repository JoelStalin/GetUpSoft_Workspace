# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

import json
import logging

_logger = logging.getLogger(__name__)


class PosSystemOrcaService:
    """ORCA integration service for POS system operations.

    Handles audit logging for order state changes and sales operations.
    DOCUMENTED PLACEHOLDER: POST /api/orca/audit-log (NestJS backend-nest)
    """

    def __init__(self, env):
        self.env = env
        self.base_url = env['ir.config.parameter'].get_param('orca.api.url', '')
        self.api_key = env['ir.config.parameter'].get_param('orca.api.key', '')

    def notify_order_state_change(self, order_id: int, state: str, amount: float) -> dict:
        """Notify ORCA of order state change.

        Currently a no-op placeholder.
        TODO: implement when NestJS POST /api/orca/audit-log is confirmed ready

        Expected payload:
            {
                "module": "pos_system",
                "model": "pos.order",
                "record_id": order_id,
                "action": "state_change",
                "state": state,
                "amount": amount,
                "timestamp": "2026-05-26T...",
                "user_id": current_user_id
            }
        """
        if not self.base_url or not self.api_key:
            _logger.warning('ORCA service not configured for POS operations')
            return {'status': 'placeholder', 'notified': False, 'reason': 'service_not_configured'}

        return {'status': 'placeholder', 'notified': False, 'reason': 'endpoint_not_ready'}

    def notify_order_completion(self, order_id: int, customer_name: str, total: float) -> dict:
        """Notify ORCA of order completion.

        Currently a no-op placeholder.
        TODO: implement when NestJS endpoint is confirmed ready
        """
        return {'status': 'placeholder', 'notified': False}

    def sync_order_metrics(self, order_id: int, state: str) -> dict:
        """Sync order metrics with ORCA.

        Currently a no-op placeholder.
        TODO: implement when NestJS endpoint is confirmed ready
        """
        return {'status': 'placeholder', 'synced': False}
