#!/usr/bin/env python3
"""Mailcow disabled in this workspace."""

import sys


def setup_mailcow() -> int:
    print("Mailcow fue deshabilitado en este workspace. No se permite configurarlo desde este repositorio.")
    return 1


if __name__ == "__main__":
    sys.exit(setup_mailcow())
