# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from gatt import Device
import logging

from odoo.addons.hw_drivers.driver import Driver
from odoo.addons.hw_drivers.event_manager import event_manager
from odoo.addons.hw_drivers.main import iot_devices
from odoo.addons.hw_drivers.iot_handlers.interfaces.BTInterface import bt_devices

_logger = logging.getLogger(__name__)

# -----------------------------------------------------------
# Driver para dispositivos Sylvac (Bluetooth)
# -----------------------------------------------------------
class SylvacBtDriver(Driver):
    connection_type = 'bluetooth'

    def __init__(self, identifier, device):
        super().__init__(identifier, device)
        self.device_type = 'device'
        self.device_connection = 'bluetooth'
        self.device_name = device.alias()

        try:
            self.gatt_device = GattSylvacBtDriver(mac_address=device.mac_address, manager=device.manager)
            self.gatt_device.btdriver = self
            self.gatt_device.connect()
            _logger.info(f"Connected to Sylvac device: {device.alias()}")
        except Exception as e:
            _logger.error(f"Failed to connect to Sylvac device: {e}")

    @classmethod
    def supported(cls, device):
        try:
            # Solo permitir dispositivos con nombre válido
            if device.alias() in ["SY295", "SY304", "SY276"]:
                return True
            return False
        except Exception as e:
            _logger.warning(f"Failed to verify device: {e}")
            return False

    def disconnect(self):
        """
        Desconecta el dispositivo y elimina de la lista de dispositivos.
        """
        try:
            super().disconnect()
            bt_devices.pop(self.device_identifier, None)
            _logger.info(f"Sylvac device {self.device_name} disconnected.")
        except Exception as e:
            _logger.error(f"Failed to disconnect device: {e}")


# -----------------------------------------------------------
# Clase para gestionar notificaciones de Bluetooth (Gatt)
# -----------------------------------------------------------
class GattSylvacBtDriver(Device):
    btdriver = None

    def services_resolved(self):
        """
        Llamado cuando los servicios Bluetooth están disponibles.
        """
        super().services_resolved()
        try:
            device_information_service = next(
                s for s in self.services if s.uuid == '00005000-0000-1000-8000-00805f9b34fb'
            )
            measurement_characteristic = next(
                c for c in device_information_service.characteristics 
                if c.uuid == '00005020-0000-1000-8000-00805f9b34fb'
            )
            measurement_characteristic.enable_notifications()
            _logger.info("Notifications enabled for Sylvac device.")
        except Exception as e:
            _logger.error(f"Failed to enable notifications: {e}")

    def characteristic_value_updated(self, characteristic, value):
        """
        Actualiza los valores cuando el dispositivo envía una notificación.
        """
        try:
            # Leer el valor como entero (little-endian)
            total = int.from_bytes(value, byteorder='little', signed=True)

            # Validar el rango para evitar valores desbordados
            if total > (256 ** 4) / 2:
                total -= 256 ** 4

            # Convertir el valor a unidades específicas
            self.btdriver.data['value'] = total / 1000000.0
            event_manager.device_changed(self.btdriver)
            _logger.info(f"Received value from Sylvac: {self.btdriver.data['value']}")
        except Exception as e:
            _logger.error(f"Failed to update value: {e}")

    def characteristic_enable_notification_succeeded(self):
        _logger.info("Notifications enabled successfully for Sylvac device.")

    def characteristic_enable_notification_failed(self):
        _logger.error("Failed to enable notifications for Sylvac device.")

    def disconnect_succeeded(self):
        """
        Llamado cuando el dispositivo se desconecta correctamente.
        """
        super().disconnect_succeeded()
        if self.btdriver:
            _logger.info(f"Sylvac device {self.btdriver.device_name} disconnected.")
            self.btdriver.disconnect()

# -----------------------------------------------------------
# Registro de logs
# -----------------------------------------------------------
_logger.info("Sylvac Bluetooth driver loaded successfully.")
