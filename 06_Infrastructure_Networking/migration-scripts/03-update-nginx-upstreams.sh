#!/bin/bash

# Script para actualizar upstreams de Nginx en Server 1
# Cambia todos los upstreams de staging/lab a apuntar a Server 2 y Server 3
# Uso: bash 03-update-nginx-upstreams.sh

set -e

echo "=============================================="
echo "Actualizando Nginx Upstreams"
echo "=============================================="
echo ""

# Variables de servidores
SERVER1_IP="192.168.1.233"
SERVER2_IP="192.168.1.234"
SERVER3_IP="192.168.1.235"

# Crear backup de configuración actual
NGINX_CONFIG="/etc/nginx/sites-available"
BACKUP_DIR="./nginx-backup-$(date +%Y%m%d-%H%M%S)"

echo "📋 Creando backup de configuración Nginx..."
cp -r "$NGINX_CONFIG" "$BACKUP_DIR"
echo "   Backup en: $BACKUP_DIR"
echo ""

# Función para reemplazar upstream
update_upstream() {
  local config_file=$1
  local service_name=$2
  local new_upstream=$3

  if [ -f "$config_file" ]; then
    echo "   Actualizando: $service_name → $new_upstream"
    # Buscar línea con "server localhost:xxxxx" o "server 127.0.0.1:xxxxx" para este servicio
    # y reemplazarla con "server $new_upstream:puerto"
    sed -i "s/server localhost:\([0-9]\+\);/server $new_upstream:\1;/g" "$config_file"
    sed -i "s/server 127.0.0.1:\([0-9]\+\);/server $new_upstream:\1;/g" "$config_file"
  else
    echo "   ⚠️  Archivo no encontrado: $config_file"
  fi
}

# Actualizar staging upstreams → Server 2
echo "🔄 Reemplazando upstreams de STAGING..."
for site in getupsoft-staging galantes-staging staging; do
  config="$NGINX_CONFIG/$site"
  [ -f "$config" ] && update_upstream "$config" "$site" "$SERVER2_IP"
done
echo ""

# Actualizar lab upstreams → Server 3 (opcional)
echo "🔄 Reemplazando upstreams de LAB (opcional)..."
for site in getupsoft-lab galantes-lab lab; do
  config="$NGINX_CONFIG/$site"
  [ -f "$config" ] && update_upstream "$config" "$site" "$SERVER3_IP"
done
echo ""

# Validar configuración Nginx
echo "✅ Validando configuración Nginx..."
if nginx -t &>/dev/null; then
  echo "   Configuración válida"

  # Recargar Nginx
  echo "🔄 Recargando Nginx..."
  systemctl reload nginx || docker exec server-nginx-1 nginx -s reload
  echo "   ✅ Nginx recargado"
else
  echo "   ❌ Error en configuración Nginx!"
  echo "   Restaurando backup..."
  rm -rf "$NGINX_CONFIG"
  cp -r "$BACKUP_DIR" "$NGINX_CONFIG"
  exit 1
fi
echo ""

echo "=============================================="
echo "✅ Upstreams actualizados"
echo "=============================================="
echo ""
echo "Cambios realizados:"
grep -r "server.*192.168.1.23[0-9]" "$NGINX_CONFIG" || echo "(Sin cambios detectados)"
echo ""
echo "Próximo paso:"
echo "  1. Verificar: curl -H 'Host: staging.example.com' http://localhost"
echo "  2. Confirmar: Los datos vienen desde Server 2"
echo ""
echo "Rollback si es necesario:"
echo "  cp -r $BACKUP_DIR $NGINX_CONFIG"
echo "  systemctl reload nginx"
echo ""
