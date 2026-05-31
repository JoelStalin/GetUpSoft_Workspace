import os
import requests
from odoo.exceptions import ValidationError
import logging

_logger = logging.getLogger(__name__)

def get_cookie(cookie=None):
    if cookie:
        return cookie

    data = {
        "email": str(os.getenv('EXO_USER')),
        "password": str(os.getenv('EXO_PASSWORD'))
    }
    endpoint_url = str(os.getenv('HOST_EXO')) + '/exo/authenticate/'
    response_authenticate = requests.post(url=endpoint_url, json=data)
    if response_authenticate.status_code != 200:
        raise ValidationError(
            'La carga no pudo ser procesada debido a temas de autenticación.\nCode: %s\nContent: %s' %
            (response_authenticate.status_code, response_authenticate.content)
        )

    resp = response_authenticate.json()
    cookie = resp['data']['cookie'][0]
    return cookie


def post_request_exo(endpoint, data):
    host_exo = os.getenv('HOST_EXO')
    cookie = get_cookie()
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Catch-Control": "no-cache",
        "auth": cookie
    }
    url = f'{host_exo}/{endpoint}'
    _logger.debug("post_request_exo: url=%s, cookie=%s, data=%s", url, cookie, data)
    response = requests.post(url, json=data, headers=headers)
    _logger.debug("Response: %s, Status Code: %s", response, response.status_code)
    if response.status_code != 200:
        raise ValidationError(
            'La carga no pudo ser procesada.\nCode: %s\nContent: %s' %
            (response.status_code, response.content)
        )
    return response.json()


def get_request_exo(endpoint):
    """
    Realiza una solicitud GET autenticada a un endpoint de EXO.
    """
    host_exo = os.getenv('HOST_EXO')
    cookie = get_cookie()
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Catch-Control": "no-cache",
        "auth": cookie
    }
    url = f'{host_exo}/{endpoint}'
    _logger.debug("get_request_exo: url=%s, cookie=%s", url, cookie)

    response = requests.get(url, headers=headers)
    _logger.debug("Response: %s, Status Code: %s", response, response.status_code)

    if response.status_code != 200:
        raise ValidationError(
            'La carga no pudo ser procesada (GET).\nCode: %s\nContent: %s' %
            (response.status_code, response.content)
        )
    return response.json()
