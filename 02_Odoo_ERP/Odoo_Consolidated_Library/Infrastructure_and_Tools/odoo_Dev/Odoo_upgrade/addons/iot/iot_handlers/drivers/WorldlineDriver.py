# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

import ctypes
from pathlib import Path
from queue import Queue, Empty
from time import sleep

from odoo.addons.hw_drivers.driver import Driver
from odoo.addons.hw_drivers.event_manager import event_manager

# --------------------------------------------
# Cargar la biblioteca CTEP
# --------------------------------------------
easyCTEPPath = Path(__file__).parent.parent / 'lib/ctep/libeasyctep.so'

easyCTEP = None
if easyCTEPPath.exists():
    try:
        easyCTEP = ctypes.CDLL(easyCTEPPath)
    except OSError as e:
        print(f"Failed to load CTEP library: {e}")

# --------------------------------------------
# Definir errores comunes
# --------------------------------------------
TERMINAL_ERRORS = {
    '1802': 'Terminal is busy',
    '1803': 'Timeout expired',
    '2629': 'User cancellation',
}

IGNORE_ERRORS = [
    '2630',  # Manually cancelled by cashier, do not show the error
]

# --------------------------------------------
# Clase Driver para Worldline
# --------------------------------------------
class WorldlineDriver(Driver):
    connection_type = 'ctep'

    def __init__(self, identifier, device):
        super().__init__(identifier, device)
        self.device_type = 'payment'
        self.device_connection = 'network'
        self.device_name = f'Worldline terminal {self.device_identifier}'
        self.device_manufacturer = 'Worldline'
        self.actions = Queue()
        self._actions.update({'': self._action_default})

    @classmethod
    def supported(cls, device):
        return True

    def _action_default(self, data):
        action = {
            'type': data.get('messageType'),
            'action_identifier': data.get('actionIdentifier'),
            'amount': data.get('amount', 0) / 100,
            'reference': data.get('TransactionID'),
            'cid': data.get('cid'),
            'owner': data.get('owner'),
        }
        self.actions.put(action)

    def run(self):
        while True:
            try:
                action = self.actions.get(timeout=1)  # Evitar bloqueos
            except Empty:
                continue

            if action['type'] == 'Transaction':
                self.processTransaction(action)
            elif action['type'] == 'LastTransactionStatus':
                self.lastTransactionStatus()

            sleep(2)  # Breve pausa entre transacciones para evitar saturación

    def processTransaction(self, transaction):
        if transaction['amount'] <= 0:
            self.send_status(error='Invalid amount.')

        merchant_receipt = ctypes.create_string_buffer(500)
        customer_receipt = ctypes.create_string_buffer(500)
        card = ctypes.create_string_buffer(20)
        error_code = ctypes.create_string_buffer(10)

        try:
            result = easyCTEP.startTransaction(
                ctypes.byref(self.dev),
                ctypes.c_char_p(str(transaction['amount']).encode('utf-8')),
                ctypes.c_char_p(str(transaction['reference']).encode('utf-8')),
                ctypes.c_ulong(transaction['action_identifier']),
                ctypes.byref(merchant_receipt),
                ctypes.byref(customer_receipt),
                ctypes.byref(card),
                ctypes.byref(error_code),
            )

            if result == 1:
                self.send_status(
                    response='Approved',
                    ticket=customer_receipt.value.decode('utf-8').strip(),
                    ticket_merchant=merchant_receipt.value.decode('utf-8').strip(),
                    card=card.value.decode('utf-8').strip(),
                    transaction_id=transaction['action_identifier']
                )
            else:
                error = error_code.value.decode('utf-8')
                error_msg = TERMINAL_ERRORS.get(error, f"Unknown error (Code: {error})")
                self.send_status(error=error_msg)
        except Exception as e:
            self.send_status(error=f"Transaction failed: {e}")

    def lastTransactionStatus(self):
        try:
            action_identifier = ctypes.c_ulong()
            amount = ctypes.c_double()
            time = ctypes.create_string_buffer(20)
            error_code = ctypes.create_string_buffer(10)

            result = easyCTEP.lastTransactionStatus(
                ctypes.byref(self.dev),
                ctypes.byref(action_identifier),
                ctypes.byref(amount),
                ctypes.byref(time),
                ctypes.byref(error_code),
            )

            if result:
                self.send_status(value={
                    'action_identifier': action_identifier.value,
                    'amount': amount.value,
                    'time': time.value.decode('utf-8'),
                })

        except Exception as e:
            self.send_status(error=f"Failed to get transaction status: {e}")

    def send_status(self, **kwargs):
        self.data = kwargs
        event_manager.device_changed(self)

