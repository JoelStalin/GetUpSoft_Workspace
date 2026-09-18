#!/bin/bash
set -euo pipefail

echo "=========================================="
echo "Instalando Asterisk 20 LTS"
echo "=========================================="

if [ "$EUID" -ne 0 ]; then
  echo "Por favor, ejecuta este script como root (sudo)."
  exit 1
fi

if command -v asterisk >/dev/null 2>&1; then
    CURRENT_VERSION=$(asterisk -rx "core show version" || echo "Asterisk instalado pero no en ejecución")
    echo "Asterisk ya está instalado en este sistema: $CURRENT_VERSION"
    read -p "¿Deseas recompilar/reinstalar? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Omitiendo instalación de Asterisk."
        exit 0
    fi
fi

cd /usr/src
wget https://downloads.asterisk.org/pub/telephony/asterisk/asterisk-20-current.tar.gz
tar -zxvf asterisk-20-current.tar.gz
cd asterisk-20.*/

echo "Compilando Asterisk 20..."
./configure
make menuselect.makeopts
make
make install
make samples
make config
ldconfig

echo "Habilitando e iniciando el servicio de Asterisk..."
systemctl enable asterisk
systemctl start asterisk

echo "=========================================="
echo "Asterisk instalado y corriendo."
echo "Verificando módulos..."
asterisk -rx "core show version"
asterisk -rx "module show like res_ari"
asterisk -rx "module show like res_http_websocket"
asterisk -rx "module show like chan_pjsip"
echo "=========================================="
