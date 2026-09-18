#!/bin/bash

if [ "$EUID" -ne 0 ]; then
  echo "Por favor, ejecuta este script como root (sudo)."
  exit 1
fi

echo "Recargando configuraciones de Asterisk (core, dialplan, pjsip)..."
asterisk -rx "core reload"
asterisk -rx "dialplan reload"
asterisk -rx "pjsip reload"

echo "Recarga completada."
