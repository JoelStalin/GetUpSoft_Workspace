# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

import json
import logging

_logger = logging.getLogger(__name__)


class PosKitchenOrcaService:
    """ORCA integration service for kitchen operations.

    Handles audit logging for recipe and preparation changes.
    DOCUMENTED PLACEHOLDER: POST /api/orca/audit-log (NestJS backend-nest)
    """

    def __init__(self, env):
        self.env = env
        self.base_url = env['ir.config.parameter'].get_param('orca.api.url', '')
        self.api_key = env['ir.config.parameter'].get_param('orca.api.key', '')

    def notify_recipe_change(self, recipe_id: int, recipe_name: str, action: str) -> dict:
        """Notify ORCA of recipe change.

        Currently a no-op placeholder.
        TODO: implement when NestJS POST /api/orca/audit-log is confirmed ready

        Expected payload:
            {
                "module": "pos_kitchen_core",
                "model": "rest.recipe",
                "record_id": recipe_id,
                "action": action,
                "recipe_name": recipe_name,
                "timestamp": "2026-05-26T...",
                "user_id": current_user_id
            }
        """
        if not self.base_url or not self.api_key:
            _logger.warning('ORCA service not configured for kitchen operations')
            return {'status': 'placeholder', 'notified': False, 'reason': 'service_not_configured'}

        return {'status': 'placeholder', 'notified': False, 'reason': 'endpoint_not_ready'}

    def notify_preparation_state_change(self, preparation_id: int, state: str) -> dict:
        """Notify ORCA of preparation state change.

        Currently a no-op placeholder.
        TODO: implement when NestJS endpoint is confirmed ready
        """
        return {'status': 'placeholder', 'notified': False}

    def sync_preparation_metrics(self, preparation_id: int, portions: float, weight_g: float) -> dict:
        """Sync preparation metrics with ORCA.

        Currently a no-op placeholder.
        TODO: implement when NestJS endpoint is confirmed ready
        """
        return {'status': 'placeholder', 'synced': False}
