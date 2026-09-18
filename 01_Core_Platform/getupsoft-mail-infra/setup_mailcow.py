#!/usr/bin/env python3
from __future__ import annotations


DISABLED_MESSAGE = (
    "Mailcow fue deshabilitado en este workspace. "
    "No se permite configurarlo desde este repositorio."
)


def main() -> int:
    print(DISABLED_MESSAGE)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
