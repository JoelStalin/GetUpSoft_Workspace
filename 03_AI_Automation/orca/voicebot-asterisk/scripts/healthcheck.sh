#!/bin/bash

echo "=========================================="
echo "Healthcheck: Verificación del Entorno"
echo "=========================================="

echo "[1] Estado de Asterisk:"
systemctl status asterisk --no-pager | grep Active

echo ""
echo "[2] Estado del Servicio Bot ARI (voicebot-ari):"
systemctl status voicebot-ari --no-pager | grep Active || echo "voicebot-ari service no activo o no instalado."

echo ""
echo "[3] Versión de Asterisk:"
asterisk -rx "core show version"

echo ""
echo "[4] Estado HTTP ARI:"
asterisk -rx "http show status" | grep -E "HTTP|Bind"

echo ""
echo "[5] Usuarios ARI Configurados:"
asterisk -rx "ari show users"

echo ""
echo "[6] Endpoints PJSIP Disponibles:"
asterisk -rx "pjsip show endpoints"

echo ""
echo "[7] Últimos Logs del Bot (si existe):"
journalctl -u voicebot-ari -n 10 --no-pager || echo "Sin logs disponibles"

echo "=========================================="
echo "Revisión completada."
echo "=========================================="
