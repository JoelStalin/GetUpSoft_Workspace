import json
import requests


class RncSearchOrcaService:
    """RNC Search ORCA integration service.

    Logs all RNC searches to ORCA for audit trail and compliance.
    Notifies ORCA of DGII API calls and their outcomes.
    """

    def __init__(self, env):
        self.env = env
        self.base_url = env['ir.config.parameter'].sudo().get_param('orca.api.url', '')
        self.api_key = env['ir.config.parameter'].sudo().get_param('orca.api.key', '')

    def log_rnc_search(self, search_term: str, result_count: int = 0,
                      result_status: str = 'success', searched_rnc: str = '',
                      dgii_response_code: str = '') -> dict:
        """Log RNC search to ORCA.

        Args:
            search_term: The RNC or name being searched
            result_count: Number of results found
            result_status: Status of search (success, error, etc.)
            searched_rnc: The RNC that was searched
            dgii_response_code: Response code from DGII API

        Returns:
            dict: Result with status and orca_id if successful
        """
        if not self.base_url or not self.api_key:
            return {'status': 'error', 'logged': False, 'reason': 'ORCA API not configured'}

        try:
            payload = {
                'module': 'l10n_do_rnc_search',
                'model': 'l10n_do_rnc_search',
                'record_id': 0,
                'action': 'search',
                'search_term': search_term,
                'result_count': result_count,
                'result_status': result_status,
                'searched_rnc': searched_rnc,
                'dgii_response_code': dgii_response_code,
                'date': self.env.context.get('timestamp', ''),
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
                return {
                    'status': 'success',
                    'logged': True,
                    'orca_id': response.json().get('request_id'),
                }
            else:
                return {
                    'status': 'error',
                    'logged': False,
                    'error': f"HTTP {response.status_code}: {response.text}"
                }

        except Exception as e:
            return {'status': 'error', 'logged': False, 'error': str(e)}

    def notify_dgii_query(self, dgii_endpoint: str, search_term: str,
                         dgii_response_code: int, found: bool) -> bool:
        """Notify ORCA of DGII API query.

        Args:
            dgii_endpoint: The DGII endpoint called (check_dgii, search_dgii)
            search_term: The term searched
            dgii_response_code: HTTP response code from DGII
            found: Whether results were found

        Returns:
            bool: True if notification succeeded, False otherwise
        """
        if not self.base_url or not self.api_key:
            return False

        try:
            payload = {
                'module': 'l10n_do_rnc_search',
                'model': 'dgii_query',
                'record_id': 0,
                'action': 'sync',
                'sync_data': {
                    'dgii_endpoint': dgii_endpoint,
                    'search_term': search_term,
                    'response_code': dgii_response_code,
                    'found': found,
                },
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
            return response.status_code == 201

        except Exception as e:
            self.env['ir.logging'].create({
                'name': 'RNC Search ORCA Notification Error',
                'type': 'server',
                'level': 'error',
                'message': str(e),
            })
            return False
