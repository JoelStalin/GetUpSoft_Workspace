import json
import requests
from datetime import datetime


class AbstractOrcaService:
    """
    ORCA integration service with NestJS HTTP endpoint support.

    Pushes audit logs and fiscal sync notifications to ORCA backend
    for centralized logging, traceability, and compliance enforcement.

    Endpoints:
    - POST /api/orca/audit-log: Record audit log from Odoo module
    - POST /api/orca/fiscal-sync: Notify fiscal operation sync (invoices, reports)

    Expected audit log payload:
    {
        project_id: str (GetUpSoft project identifier),
        module_name: str (e.g., 'l10n_do_accounting'),
        model_name: str (e.g., 'account.move'),
        record_id: int,
        action: 'create'|'write'|'unlink'|'sync'|'validate'|'error',
        user_id: int (Odoo user ID),
        date: ISO8601 timestamp,
        before_values: JSON string,
        after_values: JSON string,
        tier: str ('critical'|'high'|'medium'|'optional'),
        orca_synced: bool
    }
    """

    def __init__(self, env):
        self.env = env
        self.base_url = env['ir.config.parameter'].sudo().get_param('orca.api.url', '')
        self.api_key = env['ir.config.parameter'].sudo().get_param('orca.api.key', '')
        self.project_id = env['ir.config.parameter'].sudo().get_param('orca.project.id', 'default')

    def push_log(self, log_record):
        """
        Push audit log to ORCA via NestJS endpoint.

        Args:
            log_record: orca.log model instance

        Returns:
            bool: True if push succeeded (HTTP 201), False otherwise
        """
        if not self.base_url or not self.api_key:
            return False

        try:
            payload = {
                'project_id': self.project_id,
                'module_name': log_record.module_name,
                'model_name': log_record.model_name,
                'record_id': log_record.record_id,
                'action': log_record.action,
                'user_id': log_record.user_id.id if log_record.user_id else None,
                'date': log_record.date.isoformat() if log_record.date else datetime.now().isoformat(),
                'before_values': log_record.before_values or '{}',
                'after_values': log_record.after_values or '{}',
                'tier': getattr(log_record, 'tier', 'high'),
                'orca_synced': False,
            }

            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json',
            }

            response = requests.post(
                f'{self.base_url}/api/orca/audit-log',
                json=payload,
                headers=headers,
                timeout=30
            )

            if response.status_code == 201:
                response_data = response.json()
                log_record.orca_request_id = response_data.get('id') or response_data.get('orca_request_id')
                log_record.orca_synced = True
                log_record.orca_sync_error = None

                self.env['ir.logging'].create({
                    'name': 'ORCA Audit Log Synced',
                    'type': 'server',
                    'level': 'info',
                    'message': f'{log_record.module_name}.{log_record.model_name}[{log_record.record_id}] → ORCA',
                })
                return True
            else:
                error_msg = f"HTTP {response.status_code}: {response.text[:200]}"
                log_record.orca_sync_error = error_msg

                self.env['ir.logging'].create({
                    'name': 'ORCA Audit Log Sync Error',
                    'type': 'server',
                    'level': 'warning',
                    'message': error_msg,
                })
                return False

        except Exception as e:
            log_record.orca_sync_error = str(e)
            return False

    def notify_sync(self, module_name, model_name, record_id, sync_data: dict, sync_type: str = None):
        """
        Notify ORCA of a fiscal/business operation sync.

        Used by localization modules to report EasyCount syncs, DGII submissions, etc.

        Args:
            module_name: str, e.g., 'l10n_do_accounting'
            model_name: str, e.g., 'account.move'
            record_id: int, ID of synced record
            sync_data: dict with operation details
            sync_type: str, optional type ('invoice', 'report', 'receipt', etc.)

        Returns:
            bool: True if notification succeeded
        """
        if not self.base_url or not self.api_key:
            return False

        try:
            payload = {
                'project_id': self.project_id,
                'module_name': module_name,
                'model_name': model_name,
                'record_id': record_id,
                'sync_data': sync_data,
                'sync_type': sync_type or 'generic',
                'timestamp': datetime.now().isoformat(),
            }

            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json',
            }

            response = requests.post(
                f'{self.base_url}/api/orca/fiscal-sync',
                json=payload,
                headers=headers,
                timeout=30
            )

            return response.status_code in [200, 201]

        except Exception as e:
            self.env['ir.logging'].create({
                'name': 'ORCA Sync Notification Error',
                'type': 'server',
                'level': 'warning',
                'message': str(e),
            })
            return False
