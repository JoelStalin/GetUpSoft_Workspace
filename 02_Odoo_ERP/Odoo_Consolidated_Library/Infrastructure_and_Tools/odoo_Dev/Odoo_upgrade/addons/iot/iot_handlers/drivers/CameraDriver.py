# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

import base64
import subprocess
import logging

from odoo.addons.hw_drivers.driver import Driver
from odoo.addons.hw_drivers.event_manager import event_manager

_logger = logging.getLogger(__name__)

class CameraDriver(Driver):
    connection_type = 'video'

    def __init__(self, identifier, device):
        super().__init__(identifier, device)
        self.device_type = 'camera'
        self.device_connection = 'direct'
        self.device_name = device.card.decode('utf-8', errors='ignore')

        self._actions.update({
            '': self._action_default,
        })

    @classmethod
    def supported(cls, device):
        """Verifica si el dispositivo está soportado por el driver de video."""
        try:
            driver_name = device.driver.decode('utf-8', errors='ignore')
            return driver_name == 'uvcvideo'
        except Exception as e:
            _logger.warning(f"Failed to get driver name: {e}")
            return False

    def _get_max_resolution(self):
        """Obtiene la resolución máxima de la cámara."""
        try:
            result = subprocess.run(
                ['v4l2-ctl', '--list-formats-ext'],
                check=True,
                capture_output=True,
                text=True
            )
            sizes = [
                line.split()[-1] for line in result.stdout.splitlines()
                if 'Size' in line
            ]
            if sizes:
                sizes.sort(key=lambda x: tuple(map(int, x.split('x'))), reverse=True)
                return sizes[0]
            else:
                _logger.warning("No valid resolution sizes found.")
                return '640x480'  # Valor por defecto
        except subprocess.CalledProcessError as e:
            _logger.error(f"Failed to get camera resolution: {e}")
            return '640x480'

    def _action_default(self, data):
        """Toma una foto usando la cámara y la convierte en base64."""
        try:
            resolution = self._get_max_resolution()
            _logger.info(f"Using resolution: {resolution}")

            result = subprocess.run(
                ['fswebcam', '-d', self.dev.interface, '-', '-r', resolution],
                check=True,
                capture_output=True
            )

            # Codificar imagen en base64
            image_base64 = base64.b64encode(result.stdout).decode('utf-8', errors='ignore')
            self.data['image'] = image_base64
            self.data['message'] = 'Image captured successfully'
            _logger.info("Image captured successfully.")

        except subprocess.CalledProcessError as e:
            _logger.error(f"Failed to capture image: {e}")
            self.data['message'] = f"Failed to capture image: {e}"
        except Exception as e:
            _logger.error(f"Unexpected error during capture: {e}")
            self.data['message'] = f"Unexpected error during capture: {e}"

        # Notificar cambio de estado al frontend
        event_manager.device_changed(self)

