#!/bin/bash

# Script para exportar volúmenes de Staging desde Server 1 (Producción)
# Uso: bash 01-export-staging-volumes.sh /path/to/backup

set -e

BACKUP_DIR="${1:-.}/staging-volumes-backup"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_PATH="$BACKUP_DIR/$TIMESTAMP"

echo "=============================================="
echo "Exportando volúmenes de Staging"
echo "=============================================="
echo "Destino: $BACKUP_PATH"
echo ""

mkdir -p "$BACKUP_PATH"

# Detener staging gracefully
echo "⏸️  Deteniendo servicios de Staging..."
docker-compose -f docker-compose.yml stop getupsoft_odoo_staging galantes_stg_odoo galantes_stg_web 2>/dev/null || true
sleep 10

# Lista de volúmenes a exportar
VOLUMES=(
  "getupsoft_odoo_staging_data"
  "getupsoft_odoo_staging_config"
  "galantes_stg_odoo_data"
  "galantes_stg_odoo_config"
  "galantes_stg_web_data"
  "getupsoft-shared-postgres-data"  # Staging DB
)

# Exportar volúmenes
for volume in "${VOLUMES[@]}"; do
  if docker volume inspect "$volume" &>/dev/null; then
    echo "📦 Exportando volumen: $volume"
    docker run --rm \
      -v "$volume:/data" \
      -v "$BACKUP_PATH:/backup" \
      alpine tar czf "/backup/$volume.tar.gz" -C /data .
    echo "   ✅ Completado: $volume.tar.gz"
  else
    echo "   ⚠️  Volumen no encontrado: $volume (ignorando)"
  fi
  echo ""
done

# Backup de PostgreSQL
echo "📊 Exportando base de datos Staging..."
docker exec getupsoft-shared-postgres pg_dumpall -U postgres | \
  gzip > "$BACKUP_PATH/postgres-staging-dump.sql.gz"
echo "   ✅ Completado: postgres-staging-dump.sql.gz"
echo ""

# Backup de Redis (si existe staging redis)
if docker exec server-redis-1 redis-cli ping &>/dev/null; then
  echo "📊 Exportando Redis Staging..."
  docker exec server-redis-1 redis-cli BGSAVE
  sleep 5
  docker cp server-redis-1:/data/dump.rdb "$BACKUP_PATH/redis-staging-dump.rdb"
  echo "   ✅ Completado: redis-staging-dump.rdb"
else
  echo "   ⚠️  Redis no disponible (ignorando)"
fi
echo ""

# Backup de configuración
echo "📄 Exportando configuraciones..."
docker-compose -f docker-compose.yml config > "$BACKUP_PATH/docker-compose-staging.yml"
cp -r /etc/nginx/sites-available/ "$BACKUP_PATH/nginx-staging-sites/" 2>/dev/null || true
echo "   ✅ Completado: configuraciones"
echo ""

# Resumen
echo "=============================================="
echo "✅ Backup completado"
echo "=============================================="
echo "Ubicación: $BACKUP_PATH"
echo "Tamaño total: $(du -sh $BACKUP_PATH | cut -f1)"
echo ""
echo "Archivos:"
ls -lh "$BACKUP_PATH"
echo ""
echo "Próximo paso:"
echo "  1. Transferir a Server 2: scp -r $BACKUP_PATH ubuntu@192.168.1.234:/home/ubuntu/backups/"
echo "  2. Ejecutar: 02-import-staging-volumes.sh en Server 2"
echo ""
