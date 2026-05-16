# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

import logging
import serial
import time

from odoo.addons.hw_drivers.event_manager import event_manager
from odoo.addons.hw_drivers.iot_handlers.drivers.SerialBaseDriver import SerialDriver, SerialProtocol, serial_connection

_logger = logging.getLogger(__name__)

# -----------------------------------------------------------
# Protocolo de comunicación para Sylvac S_Cal Pro
# -----------------------------------------------------------
SylvacSCalProProtocol = SerialProtocol(
    name='Sylvac S_Cal pro',
    baudrate=4800,
    bytesize=serial.SEVENBITS,
    stopbits=serial.STOPBITS_TWO,
    parity=serial.PARITY_EVEN,
    timeout=0.2,                 # Tiempo de espera para lectura
    measureRegexp=b'\+|-\d+\.\d+\r',
    statusRegexp=None,
    commandTerminator=b'\r',
    commandDelay=0.2,
    measureDelay=0.2,
    newMeasureDelay=0.2,
    measureCommand=b'?',          # Comando para solicitar una nueva medida
    emptyAnswerValid=False,
)

# -----------------------------------------------------------
# Driver para Sylvac S_Cal Pro
# -----------------------------------------------------------
class SylvacSCalProDriver(SerialDriver):
    """Driver para calibradores digitales Sylvac vía USB."""

    _protocol = SylvacSCalProProtocol

    def __init__(self, identifier, device):
        super().__init__(identifier, device)
        self.device_type = 'device'
        _logger.info(f"Initialized Sylvac S_Cal Pro driver for device: {self.device_identifier}")

    def _take_measure(self):
        """Envía un comando de medición y actualiza el valor recibido."""
        with self._device_lock:
            try:
                self._connection.write(self._protocol.measureCommand + self._protocol.commandTerminator)
                measure = self._get_raw_response(self._connection)

                if measure:
                    if measure != self.data.get('value'):
                        self.data['value'] = measure
                        event_manager.device_changed(self)
                        _logger.info(f"Measurement received: {measure}")
            except Exception as e:
                _logger.error(f"Failed to take measure: {e}")

    @staticmethod
    def _get_raw_response(connection):
        """
        Obtiene la respuesta del dispositivo desde el puerto serie.

        :param connection: Conexión al puerto serie
        :type connection: serial.Serial
        :return: Valor medido como cadena
        :rtype: str
        """
        TIMEOUT = 1
        BUFFER_SIZE = 256   # Tamaño máximo del búfer para evitar desbordamiento
        answer = []
        t0 = time.time()

        while True:
            if len(answer) > BUFFER_SIZE:
                _logger.warning("Buffer overflow detected, discarding response")
                break

            char = connection.read()
            if char:
                if ord(char) == 13:  # Fin de línea (\r)
                    response = b''.join(answer[:-1]).decode('utf-8').strip()
                    _logger.debug(f"Raw response: {response}")
                    return response
                answer.append(char)
                t0 = time.time()
            elif time.time() - t0 > TIMEOUT:
                _logger.warning("Timeout while reading serial response")
                break
        
        return ""

    @classmethod
    def supported(cls, device):
        """
        Verifica si el dispositivo es compatible con el protocolo Sylvac.

        :param device: Información del dispositivo
        :type device: dict
        :return: True si el dispositivo es compatible
        :rtype: bool
        """
        protocol = cls._protocol

        try:
            with serial_connection(device['identifier'], protocol, is_probing=True) as connection:
                connection.write(protocol.measureCommand + protocol.commandTerminator)
                time.sleep(protocol.commandDelay)

                measure = cls._get_raw_response(connection)
                if measure:
                    try:
                        float(measure)  # Validar que sea un número
                        return True
                    except ValueError:
                        _logger.warning(f"Invalid measure value: {measure}")
                        return False
        except serial.serialutil.SerialTimeoutException:
            _logger.warning("Serial timeout exception during probing")
        except Exception as e:
            _logger.error(f"Error probing device {device}: {e}")
        return False
