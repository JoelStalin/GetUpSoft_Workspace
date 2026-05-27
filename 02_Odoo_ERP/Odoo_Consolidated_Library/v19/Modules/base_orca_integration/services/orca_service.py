"""Abstract ORCA integration service for Odoo 19.

All methods are documented no-ops until ORCA HTTP endpoints are confirmed.

DOCUMENTED PLACEHOLDER ENDPOINTS:
- POST /api/orca/audit-log (v1) — NestJS backend-nest
- POST /api/orca/fiscal-sync (v1) — NestJS backend-nest
"""

import logging
import uuid
from datetime import datetime

_logger = logging.getLogger(__name__)


class AbstractOrcaService:
    """Placeholder ORCA integration service.

    This service provides integration points for ORCA audit logging and
    fiscal event synchronization. All HTTP calls are placeholders until
    NestJS endpoints are confirmed.

    Initialize with:
        orca_svc = AbstractOrcaService(env)
    """

    def __init__(self, env):
        self.env = env
        self.base_url = env['ir.config.parameter'].sudo().get_param(
            'orca.api.url',
            default=''
        )
        self.api_key = env['ir.config.parameter'].sudo().get_param(
            'orca.api.key',
            default=''
        )
        self.timeout = 30

    def push_log(self, log_record):
        """Push audit log to ORCA.

        Status: NO-OP PLACEHOLDER
        Expected endpoint: POST /api/orca/audit-log (v1)

        Payload structure (when implemented):
        {
            'module': str,
            'model': str,
            'record_id': int,
            'action': str (create|write|unlink|sync),
            'user': str (user.login),
            'date': datetime.isoformat(),
            'before': dict,
            'after': dict,
            'request_id': str (uuid)
        }

        Args:
            log_record: orca.log record to push

        Returns:
            dict: {
                'synced': bool,
                'request_id': str|None,
                'error': str|None,
                'status': 'placeholder'
            }
        """
        if not self.base_url or not self.api_key:
            return {
                'synced': False,
                'error': 'ORCA credentials not configured'
            }

        _logger.debug(
            'ORCA push_log: %s.%s (record_id=%s, action=%s)',
            log_record.module_name,
            log_record.model_name,
            log_record.record_id,
            log_record.action
        )

        # TODO: Implement real HTTP POST when NestJS endpoint confirmed
        return {
            'synced': False,
            'note': 'placeholder - awaiting endpoint confirmation'
        }

    def notify_sync(self, model_name, record_id, sync_data):
        """Notify ORCA of a fiscal sync event.

        Status: NO-OP PLACEHOLDER
        Expected endpoint: POST /api/orca/fiscal-sync (v1)

        Payload structure (when implemented):
        {
            'module': str,
            'model': str,
            'record_id': int,
            'sync_type': str (dgii|easycount|encf),
            'timestamp': datetime.isoformat(),
            'metadata': dict
        }

        Args:
            model_name: Odoo model name
            record_id: Record ID
            sync_data: dict with sync metadata

        Returns:
            dict: {
                'notified': bool,
                'error': str|None,
                'status': 'placeholder'
            }
        """
        if not self.base_url or not self.api_key:
            return {
                'notified': False,
                'error': 'ORCA credentials not configured'
            }

        _logger.debug(
            'ORCA notify_sync: %s (record_id=%s, sync_type=%s)',
            model_name,
            record_id,
            sync_data.get('sync_type', 'unknown')
        )

        # TODO: Implement real HTTP POST when NestJS endpoint confirmed
        return {
            'notified': False,
            'note': 'placeholder - awaiting endpoint confirmation'
        }

    def generate_request_id(self):
        """Generate unique request ID for ORCA tracking."""
        return str(uuid.uuid4())
