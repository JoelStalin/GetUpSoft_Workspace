#!/bin/bash
set -euo pipefail

echo "=========================================="
echo "Configuración Básica de Firewall (UFW)"
echo "=========================================="

if [ "$EUID" -ne 0 ]; then
  echo "Por favor, ejecuta este script como root (sudo)."
  exit 1
fi

echo "ADVERTENCIA: No exponga el puerto 8088 (ARI) a Internet."
echo "ARI debe quedar local, detrás de VPN o reverse proxy seguro."

echo "Permitiendo SSH..."
ufw allow ssh

echo "Permitiendo RTP (10000:20000 UDP)..."
ufw allow 10000:20000/udp

read -p "¿Deseas restringir SIP (5060 UDP) a una IP específica? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Ingresa la IP permitida para SIP (ej. 192.168.1.100): " SIP_IP
    ufw allow from $SIP_IP to any port 5060 proto udp
    echo "SIP permitido solo para $SIP_IP."
else
    echo "Abriendo SIP 5060 UDP para todos (Usa contraseñas fuertes y fail2ban)."
    ufw allow 5060/udp
fi

echo "Habilitando UFW..."
ufw --force enable
ufw status verbose

echo "=========================================="
echo "Firewall configurado."
echo "=========================================="
