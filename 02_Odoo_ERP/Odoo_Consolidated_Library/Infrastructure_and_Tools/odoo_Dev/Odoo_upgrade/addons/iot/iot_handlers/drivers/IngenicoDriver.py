# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

import logging
import socket
from time import sleep
from binascii import unhexlify
from zlib import crc32

from odoo.addons.hw_drivers.driver import Driver
from odoo.addons.hw_drivers.event_manager import event_manager
from odoo.addons.hw_drivers.iot_handlers.interfaces.SocketInterface import socket_devices

_logger = logging.getLogger(__name__)

class IngenicoDriver(Driver):
    connection_type = 'socket'
    _ecrId = 'odoo'

    def __init__(self, identifier, device):
        super().__init__(identifier, device)
        self.dev = device.dev
        self._terminalId = device.terminalId
        self._protocolId = device.protocolId
        self._sequence = 0
        self.device_type = 'payment'
        self.device_connection = 'network'
        self.device_name = 'Ingenico payment terminal'
        self.device_manufacturer = 'Ingenico'
        self.cid = None

        self._actions.update({
            '': self._action_default,
        })

    @classmethod
    def supported(cls, device):
        """Verifica si el dispositivo Ingenico es compatible."""
        try:
            msg = IncomingIngenicoMessage(device.dev)
            if msg and msg.magic == b'P4Y-ECR!' and msg.getMessageType() == "HelloRequest":
                device.terminalId = msg.getTerminalId()
                device.protocolId = msg.getProtocolId()
                OutgoingIngenicoMessage(
                    device.dev, device.terminalId, cls._ecrId,
                    device.protocolId, "HelloResponse", b'\x00'
                )
                return True
            elif msg and msg.magic == b'P4Y-ECR!' and msg.getMessageType() == "KeepAliveRequest":
                device.terminalId = msg.getTerminalId()
                device.protocolId = msg.getProtocolId()
                OutgoingIngenicoMessage(
                    device.dev, device.terminalId, cls._ecrId,
                    device.protocolId, "KeepAliveResponse", b'\x00',
                    reason=msg.getKeepAliveReasonId()
                )
                return True
            return False
        except Exception as e:
            _logger.error(f"Error in supported check: {e}")
            return False

    def disconnect(self):
        """Cierra la conexión con el socket de manera segura."""
        sock = socket_devices[self.device_identifier].dev
        try:
            if sock.fileno() != -1:
                sock.shutdown(socket.SHUT_RDWR)
                sock.close()
        except Exception as e:
            _logger.warning(f"Failed to close socket: {e}")

        super().disconnect()

    def _getSequence(self):
        """Obtiene el número de secuencia para mensajes."""
        self._sequence = (self._sequence + 1) % 65536  # Reiniciar en 65535
        return self._sequence.to_bytes(2, byteorder='big')

    def _outgoingMessage(self, messageType, **kwargs):
        """Genera un mensaje de salida."""
        try:
            OutgoingIngenicoMessage(
                self, self._terminalId, self._ecrId,
                self._protocolId, messageType,
                self._getSequence(), **kwargs
            )
        except Exception as e:
            _logger.error(f"Failed to send outgoing message: {e}")

    def _action_default(self, data):
        """Acción por defecto."""
        try:
            self.data["Ticket"] = False
            if data['messageType'] == 'Transaction':
                self.cid = data['cid']
                self._outgoingMessage("TransactionRequest", transactionId=data['TransactionID'], amount=data['amount'])
            elif data['messageType'] == 'Cancel':
                self._outgoingMessage("CancelRequest", reason=data['reason'])
        except Exception as e:
            _logger.error(f"Failed to execute action: {e}")

    def run(self):
        """Inicia la escucha de mensajes desde el terminal de pago."""
        try:
            self.data = {'value': '', 'Stage': False, 'Response': False, 'Ticket': False, 'Error': False}
            while not self._stopped.is_set():
                sleep(1)
                msg = IncomingIngenicoMessage(self)
                if msg and msg.magic == b'P4Y-ECR!':
                    self.data['value'] = 'Connected'
                    msgType = msg.getMessageType()
                    if msgType == "KeepAliveRequest":
                        self._outgoingMessage("KeepAliveResponse", reason=msg.getKeepAliveReasonId())
                    elif msgType == "TransactionResponse":
                        self.data["Response"] = msg.getTransactionResult() or self.data["Response"]
                        self.data["Ticket"] = msg.getTransactionTicket() or self.data["Ticket"]
                        self.data["Stage"] = msg.getTransactionStage() or self.data["Stage"]
                        if self.data["Response"] == 'Error':
                            self.data["Error"] = 'Transaction failed'
                    event_manager.device_changed(self)
                else:
                    _logger.warning("Invalid message received, ignoring...")
        except Exception as e:
            _logger.error(f"Exception in run: {e}")
            self.disconnect()

