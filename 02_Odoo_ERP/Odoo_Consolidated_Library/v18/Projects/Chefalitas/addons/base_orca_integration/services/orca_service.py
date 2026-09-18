import json
import requests


class AbstractOrcaService:
    """ORCA integration service with real NestJS HTTP endpoint support.

    Pushes audit logs to NestJS ORCA backend for centralized logging, traceability, and compliance.

    Endpoints:
    - POST /api/orca/audit-log: Record audit log from Odoo module
    - POST /api/orca/fiscal-sync: Sync fiscal operation (invoices, reports, etc.)

    Expected payload for POST /api/orca/audit-log:
    {
        project_id: str (GetUpSoft project identifier),
        module_name: str (e.g., 'l10n_do_accounting'),
        model_name: str (e.g., 'account.move'),
        record_id: int,
        action: 'create'|'write'|'unlink'|'sync'|'error',
        user_id: int,
        date: ISO8601 timestamp,
        before_values: JSON string (optional),
        after_values: JSON string (optional),
        orca_synced: bool (optional),
        orca_sync_error: str (optional)
    }
    """

    def __init__(self, env):
        self.env = env
        self.base_url = env['ir.config.parameter'].sudo().get_param('orca.api.url', '')
        self.api_key = env['ir.config.parameter'].sudo().get_param('orca.api.key', '')
        self.project_id = env['ir.config.parameter'].sudo().get_param('orca.project.id', 'default')

    def push_log(self, log_record):
        """Push audit log to ORCA via NestJS endpoint.

        Args:
            log_record: orca.log model instance

        Returns:
            bool: True if push succeeded, False otherwise

        Calls: POST {base_url}/api/orca/audit-log with full audit details
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
                'date': log_record.date.isoformat() if log_record.date else None,
                'before_values': log_record.before_values or '{}',
                'after_values': log_record.after_values or '{}',
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
                log_record.orca_request_id = response_data.get('orca_request_id')
                log_record.orca_synced = True
                log_record.orca_sync_error = None
                self.env['ir.logging'].create({
                    'name': 'ORCA Audit Log Synced',
                    'type': 'server',
                    'level': 'info',
                    'message': f'{log_record.module_name}.{log_record.model_name}[{log_record.record_id}] synced to ORCA',
                })
                return True
            else:
                error_msg = f"HTTP {response.status_code}: {response.text}"
                log_record.orca_sync_error = error_msg
                self.env['ir.logging'].create({
                    'name': 'ORCA Audit Log Sync Error',
                    'type': 'server',
                    'level': 'error',
                    'message': error_msg,
                })
                return False

        except Exception as e:
            log_record.orca_sync_error = str(e)
            return False

    def notify_sync(self, module_name, model_name, record_id, sync_data, sync_type=None):
        """Notify ORCA of a fiscal sync event via NestJS endpoint.

        Args:
            module_name: str, e.g., 'l10n_do_accounting'
            model_name: str, e.g., 'account.move'
            record_id: int, ID of the synced record
            sync_data: dict with sync details (odoo_id, status, timestamp, etc.)
            sync_type: str, optional type of sync (invoice, report, etc.)

        Returns:
            bool: True if notification succeeded, False otherwise

        Calls: POST {base_url}/api/orca/fiscal-sync with fiscal operation details
        """
        if not self.base_url or not self.api_key:
            return False

        try:
            payload = {
                'module': module_name,
                'model': model_name,
                'record_id': record_id,
                'sync_data': sync_data,
            }
            if sync_type:
                payload['sync_type'] = sync_type

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
            return response.status_code == 201

        except Exception as e:
            self.env['ir.logging'].create({
                'name': 'ORCA Sync Notification Error',
                'type': 'server',
                'level': 'error',
                'message': str(e),
            })
            return False
