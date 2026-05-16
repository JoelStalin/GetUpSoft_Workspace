#!/bin/bash
set -euo pipefail

echo "=========================================="
echo "Instalando Dependencias para Asterisk 20"
echo "=========================================="

if [ "$EUID" -ne 0 ]; then
  echo "Por favor, ejecuta este script como root (sudo)."
  exit 1
fi

echo "Actualizando repositorios..."
apt-get update

echo "Instalando paquetes esenciales..."
apt-get install -y \
  build-essential git curl wget subversion pkg-config \
  libjansson-dev libxml2-dev libsqlite3-dev uuid-dev \
  libssl-dev libedit-dev libcurl4-openssl-dev \
  libspeex-dev libspeexdsp-dev libopus-dev \
  libnewt-dev libncurses5-dev \
  python3 python3-venv python3-pip \
  sox ffmpeg ufw fail2ban

echo "=========================================="
echo "Dependencias instaladas correctamente."
echo "=========================================="
