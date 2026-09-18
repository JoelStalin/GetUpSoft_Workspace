#!/bin/bash
set -euo pipefail

echo "=========================================="
echo "Configurando Endpoint PJSIP de Prueba (1001)"
echo "=========================================="

if [ "$EUID" -ne 0 ]; then
  echo "Por favor, ejecuta este script como root (sudo)."
  exit 1
fi

CONFIG_DIR="/etc/asterisk"
SOURCE_DIR="/opt/voicebot-asterisk/asterisk-config"
BACKUP_DATE=$(date +"%Y%m%d_%H%M%S")

echo "Creando backup de pjsip.conf..."
if [ -f "$CONFIG_DIR/pjsip.conf" ]; then
    cp "$CONFIG_DIR/pjsip.conf" "$CONFIG_DIR/pjsip.conf.bak_$BACKUP_DATE"
fi

read -p "Ingresa la contraseña fuerte para la extensión SIP 1001: " SIP_PASS

echo "Aplicando configuración de pjsip.conf..."
cp "$SOURCE_DIR/pjsip.conf.example" "$CONFIG_DIR/pjsip.conf"
sed -i "s/CHANGE_ME_EXTENSION_PASSWORD/$SIP_PASS/g" "$CONFIG_DIR/pjsip.conf"

echo "Ajustando permisos..."
chown asterisk:asterisk $CONFIG_DIR/pjsip.conf
chmod 640 $CONFIG_DIR/pjsip.conf

echo "Recargando PJSIP..."
asterisk -rx "pjsip reload"
sleep 2

echo "Endpoints PJSIP configurados:"
asterisk -rx "pjsip show endpoints"

echo "=========================================="
echo "Configuración SIP completada."
echo "Revisa TESTING.md para saber cómo conectar el softphone."
echo "=========================================="
