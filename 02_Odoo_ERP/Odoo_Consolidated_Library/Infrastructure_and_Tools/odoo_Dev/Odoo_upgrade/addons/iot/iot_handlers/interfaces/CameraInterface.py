import os
import logging
from fcntl import ioctl
from glob import glob
import v4l2

from odoo.addons.hw_drivers.interface import Interface

_logger = logging.getLogger(__name__)

class CameraInterface(Interface):
    connection_type = 'video'

    def get_devices(self):
        """
        Detecta dispositivos de cámara en `/dev/video*` y devuelve información detallada.
        """
        camera_devices = {}
        videos = glob('/dev/video*')

        for video in videos:
            # Verificar permisos de lectura/escritura para el dispositivo
            if not os.access(video, os.R_OK):
                _logger.warning("No read permissions for device: %s", video)
                continue

            try:
                # Abrir el dispositivo en modo lectura binaria
                with open(video, 'rb') as path:
                    dev = v4l2.v4l2_capability()
                    
                    # Obtener la información del dispositivo mediante ioctl
                    ioctl(path, v4l2.VIDIOC_QUERYCAP, dev)

                    # Definir identificador (bus_info puede estar vacío)
                    identifier = dev.bus_info.decode('utf-8').strip() or dev.card.decode('utf-8').strip()
                    
                    if not identifier:
                        _logger.warning("Device %s has no bus_info or card info", video)
                        continue

                    # Registrar el dispositivo detectado
                    dev.interface = video
                    camera_devices[identifier] = dev

                    _logger.info("Detected video device: %s - %s", identifier, video)

            except PermissionError:
                _logger.error("Permission denied for device: %s", video)
            except OSError as e:
                _logger.error("Failed to open video device: %s - Error: %s", video, e)
            except Exception as e:
                _logger.error("Unexpected error while detecting video device %s: %s", video, e)

        return camera_devices
