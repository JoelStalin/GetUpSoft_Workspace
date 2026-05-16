#!/bin/bash
set -euo pipefail

echo "=========================================="
echo "Configurando ARI en Asterisk"
echo "=========================================="

if [ "$EUID" -ne 0 ]; then
  echo "Por favor, ejecuta este script como root (sudo)."
  exit 1
fi

CONFIG_DIR="/etc/asterisk"
SOURCE_DIR="/opt/voicebot-asterisk/asterisk-config"
BACKUP_DATE=$(date +"%Y%m%d_%H%M%S")

echo "Creando backups..."
for file in ari.conf http.conf extensions.conf; do
    if [ -f "$CONFIG_DIR/$file" ]; then
        cp "$CONFIG_DIR/$file" "$CONFIG_DIR/${file}.bak_$BACKUP_DATE"
    fi
done

read -p "Ingresa la contraseña fuerte para el usuario ARI 'voicebot': " ARI_PASS

echo "Aplicando configuración de ari.conf..."
cp "$SOURCE_DIR/ari.conf.example" "$CONFIG_DIR/ari.conf"
sed -i "s/CHANGE_ME_STRONG_ARI_PASSWORD/$ARI_PASS/g" "$CONFIG_DIR/ari.conf"

echo "Aplicando configuración de http.conf..."
cp "$SOURCE_DIR/http.conf.example" "$CONFIG_DIR/http.conf"

echo "Aplicando configuración de extensions.conf..."
cat "$SOURCE_DIR/extensions.conf.example" >> "$CONFIG_DIR/extensions.conf"

echo "Ajustando permisos..."
chown asterisk:asterisk $CONFIG_DIR/*.conf
chmod 640 $CONFIG_DIR/*.conf

echo "Recargando Asterisk..."
asterisk -rx "core reload"
sleep 2

echo "Estado de HTTP/ARI:"
asterisk -rx "http show status"
asterisk -rx "ari show users"

echo "=========================================="
echo "Configuración de ARI completada."
echo "=========================================="
