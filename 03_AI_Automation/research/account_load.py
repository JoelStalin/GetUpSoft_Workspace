from odoo import models, fields, api
from odoo.exceptions import ValidationError
import requests
import os
import logging

_logger = logging.getLogger(__name__)

class AccountLoad(models.TransientModel):
    _name = 'account.load'
    _description = 'Load'

    def get_cookie(self):
        """
        Obtiene la cookie de autenticación de EXO usando las credenciales de entorno.
        """
        data = {
            "email": os.getenv('EXO_USER'),
            "password": os.getenv('EXO_PASSWORD')
        }
        endpoint_url = f"{os.getenv('HOST_EXO')}/exo/authenticate/"
        try:
            response = requests.post(url=endpoint_url, json=data)
            if response.status_code != 200:
                raise ValidationError(f"Error de autenticación con EXO: {response.status_code} - {response.content}")
            resp = response.json()
            cookie = resp['data']['cookie'][0]
            return cookie
        except Exception as e:
            _logger.error(f"Error al obtener cookie de EXO: {str(e)}")
            raise ValidationError(f"No se pudo obtener la cookie de autenticación de EXO: {str(e)}")