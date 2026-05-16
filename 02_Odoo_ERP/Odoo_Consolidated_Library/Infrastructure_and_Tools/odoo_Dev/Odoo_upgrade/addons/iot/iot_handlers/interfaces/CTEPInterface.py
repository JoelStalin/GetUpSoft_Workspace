# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

import ctypes
from pathlib import Path
import subprocess
import logging

from odoo.addons.hw_drivers.interface import Interface

_logger = logging.getLogger(__name__)

# Ruta a la biblioteca CTEP
easyCTEPPath = Path(__file__).parent.parent / 'lib/ctep/libeasyctep.so'

# Si la biblioteca no existe, intenta cargarla mediante el script de instalación
if not easyCTEPPath.exists():
    load_library = Path(__file__).parent.parent / 'lib/load_worldline_library.sh'
    if load_library.exists() and load_library.is_file():
        try:
            _logger.info("Attempting to load Worldline library...")
            result = subprocess.run(
                ["sh", load_library],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=True
            )
            _logger.info("Library loaded successfully: %s", result.stdout.decode('utf-8'))
        except subprocess.CalledProcessError as e:
            _logger.error("Failed to load library: %s", e.stderr.decode('utf-8'))
        except FileNotFoundError:
            _logger.error("Library load script not found: %s", load_library)
    else:
        _logger.warning("Load library script not found or not executable: %s", load_library)
else:
    try:
        easyCTEP = ctypes.CDLL(str(easyCTEPPath))
        _logger.info("CTEP library loaded successfully from %s", easyCTEPPath)
    except OSError as e:
        _logger.error("Failed to load CTEP library: %s", e)

# ----------------------------------------------------------
# Clase de interfaz CTEP
# ----------------------------------------------------------
class CTEPInterface(Interface):
    _loop_delay = 10
    connection_type = 'ctep'

    def __init__(self):
        super().__init__()
        if easyCTEP:
            try:
                self.manager = easyCTEP.createCTEPManager()
                _logger.info("CTEP manager created successfully.")
            except AttributeError:
                _logger.error("Failed to create CTEP manager. Missing symbol in library.")
            except Exception as e:
                _logger.error("Failed to create CTEP manager: %s", e)
        else:
            _logger.warning("CTEP library is not loaded. Manager not initialized.")

    def get_devices(self):
        """
        Devuelve los dispositivos conectados mediante CTEP.
        """
        devices = {}
        if not easyCTEP:
            _logger.warning("CTEP library not loaded. Cannot fetch devices.")
            return devices
        
        terminal_id = ctypes.create_string_buffer(20)
        device = ctypes.c_void_p()

        try:
            # Verifica que la llamada a la biblioteca devuelva un valor válido
            connected = easyCTEP.connectedTerminal(self.manager, ctypes.byref(terminal_id), ctypes.byref(device))
            if connected:
                decoded_id = terminal_id.value.decode('utf-8').strip()
                devices[decoded_id] = device
                _logger.info("CTEP device connected: %s", decoded_id)
            else:
                _logger.warning("No CTEP devices connected.")
        except (AttributeError, ctypes.ArgumentError) as e:
            _logger.error("Failed to get devices from CTEP library: %s", e)
        except Exception as e:
            _logger.error("Unexpected error while fetching CTEP devices: %s", e)

        return devices

    def close(self):
        """
        Cierra la conexión CTEP.
        """
        if easyCTEP and hasattr(easyCTEP, 'closeCTEPManager'):
            try:
                easyCTEP.closeCTEPManager(self.manager)
                _logger.info("CTEP manager closed successfully.")
            except Exception as e:
                _logger.error("Failed to close CTEP manager: %s", e)
        else:
            _logger.warning("No CTEP manager to close.")

    def __del__(self):
        self.close()
