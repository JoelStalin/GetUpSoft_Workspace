import logging
import threading
from gatt import DeviceManager as Gatt_DeviceManager
from odoo.addons.hw_drivers.interface import Interface

_logger = logging.getLogger(__name__)

bt_devices = {}

# --------------------------------------------
# Clase para gestión de dispositivos Bluetooth
# --------------------------------------------
class GattBtManager(Gatt_DeviceManager):
    def device_discovered(self, device):
        identifier = f"bt_{device.mac_address}"
        if identifier not in bt_devices:
            device.manager = self
            bt_devices[identifier] = device
            _logger.info(f"New Bluetooth device discovered: {identifier}")

# --------------------------------------------
# Hilo para búsqueda de dispositivos Bluetooth
# --------------------------------------------
class BtManager(threading.Thread):
    def __init__(self, adapter_name='hci0'):
        super().__init__()
        self.adapter_name = adapter_name
        self._stop_event = threading.Event()
        self.dm = None

    def stop(self):
        _logger.info("Stopping Bluetooth discovery thread...")
        self._stop_event.set()
        if self.dm:
            self.dm.stop_discovery()

    def run(self):
        _logger.info("Starting Bluetooth discovery on adapter: %s", self.adapter_name)
        try:
            self.dm = GattBtManager(adapter_name=self.adapter_name)

            # Desconectar dispositivos activos antes de iniciar la detección
            for device in (self.dm.devices() or []):
                if device.is_connected():
                    try:
                        device.disconnect()
                        _logger.info(f"Device {device.mac_address} disconnected")
                    except Exception as e:
                        _logger.warning(f"Failed to disconnect device {device.mac_address}: {e}")

            self.dm.start_discovery()

            # Ejecutar en un hilo separado para evitar bloqueos
            while not self._stop_event.is_set():
                self.dm.run(timeout=1.0)  # Llamada no bloqueante con `timeout`
        
        except Exception as e:
            _logger.error(f"Bluetooth manager error: {e}")
        finally:
            _logger.info("Bluetooth discovery stopped.")

# --------------------------------------------
# Interfaz de dispositivos Bluetooth
# --------------------------------------------
class BTInterface(Interface):
    connection_type = 'bluetooth'

    def get_devices(self):
        """
        Retorna una copia de los dispositivos Bluetooth detectados.
        """
        if not bt_devices:
            _logger.info("No Bluetooth devices found.")
        return bt_devices.copy()

# --------------------------------------------
# Iniciar el hilo de Bluetooth de forma segura
# --------------------------------------------
try:
    _logger.info("Initializing Bluetooth interface...")
    bm = BtManager()
    bm.start()
    _logger.info("Bluetooth discovery thread started successfully.")
except Exception as e:
    _logger.error(f"Failed to start Bluetooth discovery: {e}")

# --------------------------------------------
# Detener el hilo al cerrar la aplicación
# --------------------------------------------
import atexit
atexit.register(bm.stop)

