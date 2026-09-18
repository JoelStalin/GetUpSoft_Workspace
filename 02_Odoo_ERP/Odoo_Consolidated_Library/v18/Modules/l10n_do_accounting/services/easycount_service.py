import json
import requests


class EasyCountFiscalService:
    """Placeholder EasyCount integration service.

    Validates fiscal data and notifies EasyCount of invoice operations.

    DOCUMENTED PLACEHOLDER: Uses OdooJSON2Client from apps/easycount/
    Real endpoint: POST /api/easycount/fiscal-operations (NestJS backend-nest)

    This service is a no-op placeholder until the NestJS endpoints are confirmed and
    the OdooAccountingSyncService integration is finalized.
    """

    def __init__(self, env):
        self.env = env
        self.base_url = env['ir.config.parameter'].sudo().get_param('easycount.api.url', '')
        self.api_key = env['ir.config.parameter'].sudo().get_param('easycount.api.key', '')

    def validate_encf(self, encf: str) -> bool:
        """Validate e-CF number format.

        Args:
            encf (str): Electronic Fiscal Voucher number

        Returns:
            bool: True if valid format, False otherwise

        Note: Placeholder — currently always returns True until real validation is available.
        TODO: call /api/easycount/validate-encf when endpoint is confirmed
        """
        # Basic format check: must start with E followed by digits
        if not encf or not encf.startswith('E'):
            return False
        return len(encf) >= 4

    def notify_invoice_created(self, move_id: int, encf: str, amount: float) -> dict:
        """Notify EasyCount of new fiscal document creation.

        Args:
            move_id (int): ID of the account.move in Odoo
            encf (str): Electronic Fiscal Voucher number
            amount (float): Total amount of the invoice

        Returns:
            dict: Result with status and notified boolean
        """
        if not self.base_url or not self.api_key:
            return {'status': 'error', 'notified': False, 'reason': 'EasyCount API not configured'}

        try:
            payload = {
                'move_id': move_id,
                'encf': encf,
                'amount': amount,
                'timestamp': json.dumps(self.env.context.get('timestamp', '')),
            }

            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json',
            }

            response = requests.post(
                f'{self.base_url}/api/easycount/fiscal-operations/notify',
                json=payload,
                headers=headers,
                timeout=30
            )
            if response.status_code == 201:
                return {
                    'status': 'success',
                    'notified': True,
                    'easycount_id': response.json().get('id'),
                }
            else:
                return {
                    'status': 'error',
                    'notified': False,
                    'error': f"HTTP {response.status_code}: {response.text}"
                }

        except Exception as e:
            return {'status': 'error', 'notified': False, 'error': str(e)}

    def sync_to_odoo_accounting(self, move_id: int) -> dict:
        """Trigger Odoo accounting sync via EasyCount OdooAccountingSyncService.

        References: apps/easycount/app/infrastructure/odoo/json2_client.py
        References: apps/easycount/app/services/orca/odoo_accounting_sync_service.py

        Args:
            move_id (int): ID of the account.move to sync

        Returns:
            dict: Result with synced status and remote_record_id if successful
        """
        if not self.base_url or not self.api_key:
            return {'status': 'error', 'synced': False, 'reason': 'EasyCount API not configured'}

        try:
            payload = {
                'move_id': move_id,
                'action': 'sync_to_accounting',
            }

            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json',
            }

            response = requests.post(
                f'{self.base_url}/api/easycount/sync-odoo-accounting',
                json=payload,
                headers=headers,
                timeout=60
            )
            if response.status_code == 201:
                return {
                    'status': 'success',
                    'synced': True,
                    'remote_record_id': response.json().get('remote_record_id'),
                    'odoo_sync_state': 'SYNCED_TO_ODOO',
                }
            else:
                return {
                    'status': 'error',
                    'synced': False,
                    'error': f"HTTP {response.status_code}: {response.text}"
                }

        except Exception as e:
            return {'status': 'error', 'synced': False, 'error': str(e)}

    def get_dgii_status(self, encf: str) -> dict:
        """Get DGII acceptance status for a fiscal document.

        Args:
            encf (str): Electronic Fiscal Voucher number

        Returns:
            dict: DGII status (accepted, rejected, pending, unknown)

        Note: Placeholder.
        TODO: call /api/easycount/dgii-status when endpoint confirmed
        """
        return {'status': 'placeholder', 'dgii_state': 'unknown'}
