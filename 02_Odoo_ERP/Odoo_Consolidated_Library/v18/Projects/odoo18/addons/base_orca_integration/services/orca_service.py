import json
import requests


class AbstractOrcaService:
    """Placeholder ORCA integration service.

    All methods are no-ops until ORCA HTTP endpoints are confirmed.
    Replace push_log() implementation when NestJS ORCA audit endpoint is available.

    DOCUMENTED PLACEHOLDER: POST /api/orca/audit-log (NestJS backend-nest)
    Expected payload: {module, model, record_id, action, user_id, date, before_values, after_values}
    """

    def __init__(self, env):
        self.env = env
        self.base_url = env['ir.config.parameter'].sudo().get_param('orca.api.url', '')
        self.api_key = env['ir.config.parameter'].sudo().get_param('orca.api.key', '')

    def push_log(self, log_record):
        """Push audit log to ORCA.

        Args:
            log_record: orca.log model instance

        Returns:
            bool: True if push succeeded, False otherwise

        Note: Currently a no-op placeholder. Implement when NestJS POST /api/orca/audit-log is ready.
        """
        if not self.base_url or not self.api_key:
            return False

        try:
            payload = {
                'module_name': log_record.module_name,
                'model_name': log_record.model_name,
                'record_id': log_record.record_id,
                'action': log_record.action,
                'user_id': log_record.user_id.id if log_record.user_id else None,
                'user_name': log_record.user_id.name if log_record.user_id else None,
                'date': log_record.date.isoformat() if log_record.date else None,
                'before_values': json.loads(log_record.before_values or '{}'),
                'after_values': json.loads(log_record.after_values or '{}'),
            }

            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json',
            }

            # TODO: uncomment when NestJS endpoint is confirmed ready
            # response = requests.post(
            #     f'{self.base_url}/api/orca/audit-log',
            #     json=payload,
            #     headers=headers,
            #     timeout=30
            # )
            # if response.status_code == 201:
            #     log_record.orca_request_id = response.json().get('id')
            #     log_record.orca_synced = True
            #     return True
            # else:
            #     log_record.orca_sync_error = f"HTTP {response.status_code}: {response.text}"
            #     return False

            return False
        except Exception as e:
            log_record.orca_sync_error = str(e)
            return False

    def notify_sync(self, model_name, record_id, sync_data):
        """Notify ORCA of a fiscal sync event.

        Args:
            model_name: str, e.g., 'account.move'
            record_id: int, ID of the synced record
            sync_data: dict with sync details (odoo_id, status, timestamp, etc.)

        Returns:
            bool: True if notification succeeded, False otherwise

        Note: Currently a no-op placeholder. Implement when NestJS POST /api/orca/fiscal-sync is ready.
        """
        if not self.base_url or not self.api_key:
            return False

        try:
            payload = {
                'model_name': model_name,
                'record_id': record_id,
                'sync_data': sync_data,
            }

            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json',
            }

            # TODO: uncomment when NestJS endpoint is confirmed ready
            # response = requests.post(
            #     f'{self.base_url}/api/orca/fiscal-sync',
            #     json=payload,
            #     headers=headers,
            #     timeout=30
            # )
            # return response.status_code == 201

            return False
        except Exception as e:
            self.env['ir.logging'].create({
                'name': 'ORCA Sync Notification Error',
                'type': 'server',
                'level': 'error',
                'message': str(e),
            })
            return False
