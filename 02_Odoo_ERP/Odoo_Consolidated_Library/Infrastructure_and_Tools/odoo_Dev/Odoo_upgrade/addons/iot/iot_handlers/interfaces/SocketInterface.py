import logging
import socket
import threading
from types import SimpleNamespace
from odoo.addons.hw_drivers.interface import Interface
from odoo.addons.hw_drivers.main import iot_devices

_logger = logging.getLogger(__name__)

socket_devices = {}
MAX_CONNECTIONS = 5
SOCKET_TIMEOUT = 10

class SocketInterface(Interface):
    connection_type = 'socket'

    def __init__(self):
        super().__init__()
        self.sock = None
        self._connections = 0
        self.open_socket(9000)

    def open_socket(self, port):
        try:
            self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            self.sock.bind(('', port))
            self.sock.listen(MAX_CONNECTIONS)
            self.sock.settimeout(SOCKET_TIMEOUT)
            _logger.info("Socket opened on port %s", port)
        except OSError as e:
            _logger.error("Failed to open socket on port %s: %s", port, e)
            self.sock = None

    @staticmethod
    def create_socket_device(dev, addr):
        """Creates a socket_devices entry that wraps the socket."""
        _logger.debug("Creating new socket_device at %s", addr)
        socket_devices[addr] = SimpleNamespace(dev=dev)

    def replace_socket_device(self, dev, addr):
        """Replaces an existing socket_devices entry."""
        driver_thread = iot_devices.get(addr)

        old_dev = socket_devices.get(addr).dev
        if old_dev:
            _logger.debug("Closing old socket connection at %s", addr)
            try:
                old_dev.shutdown(socket.SHUT_RDWR)
            except OSError:
                _logger.warning("Old socket was already closed")

            old_dev.close()

        if driver_thread:
            _logger.debug("Waiting for driver thread to terminate")
            try:
                driver_thread.join(timeout=3)
                _logger.debug("Driver thread terminated")
            except RuntimeError:
                _logger.warning("Failed to terminate driver thread")

        # Remove old entry from socket_devices
        socket_devices.pop(addr, None)

        # Clean up from _detected_devices
        _logger.debug("Cleaning up _detected_devices")
        new_detected_devices = dict.fromkeys(list(self._detected_devices), 0)
        if addr in new_detected_devices:
            del new_detected_devices[addr]
            _logger.debug("Removed %s from _detected_devices", addr)
        else:
            _logger.warning("Address %s not found in _detected_devices", addr)

        self._detected_devices = new_detected_devices

        # Create new socket device
        self.create_socket_device(dev, addr)

    def get_devices(self):
        if not self.sock:
            _logger.error("Socket not initialized")
            return socket_devices.copy()

        try:
            dev, addr = self.sock.accept()
            _logger.debug("Accepted new socket connection from %s", addr)
            if not addr:
                _logger.warning("Socket accept returned no address")
                return socket_devices.copy()

            if addr[0] not in socket_devices:
                self.create_socket_device(dev, addr[0])
            else:
                # Device is reconnecting -> Replace existing connection
                self.replace_socket_device(dev, addr[0])

            self._connections += 1
            if self._connections >= MAX_CONNECTIONS:
                _logger.warning("Maximum connections reached. Closing oldest connection.")
                oldest_addr = list(socket_devices.keys())[0]
                self.replace_socket_device(None, oldest_addr)
                self._connections -= 1

        except socket.timeout:
            _logger.debug("Socket accept timed out after %s seconds", SOCKET_TIMEOUT)
        except OSError as e:
            _logger.error("Socket error: %s", e)

        # Return a copy to avoid modification during iteration
        return socket_devices.copy()

    def close_socket(self):
        if self.sock:
            _logger.info("Closing socket")
            try:
                self.sock.close()
            except OSError:
                _logger.warning("Socket already closed")

            self.sock = None
            socket_devices.clear()

    def __del__(self):
        _logger.info("Shutting down socket interface")
        self.close_socket()

