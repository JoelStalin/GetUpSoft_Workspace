#!/usr/bin/env python3
"""Mailcow disabled in this workspace."""

import sys


def send_test_email() -> int:
    print("Mailcow fue deshabilitado en este workspace. No se permiten pruebas SMTP de Mailcow desde este repositorio.")
    return 1


if __name__ == '__main__':
    sys.exit(send_test_email())
