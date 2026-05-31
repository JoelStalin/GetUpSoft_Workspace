#!/bin/bash

# Script para importar volúmenes de Staging en Server 2
# Uso: bash 02-import-staging-volumes.sh /path/to/backup

set -e

BACKUP_DIR="${1:-.}/staging-volumes-backup"

if [ ! -d "$BACKUP_DIR" ]; then
  echo "❌ Directorio de backup no encontrado: $BACKUP_DIR"
  exit 1
fi

echo "=============================================="
echo "Importando volúmenes de Staging"
echo "=============================================="
echo "Origen: $BACKUP_DIR"
echo ""

# Crear volúmenes si no existen
VOLUMES=(
  "getupsoft_odoo_staging_data"
  "getupsoft_odoo_staging_config"
  "galantes_stg_odoo_data"
  "galantes_stg_odoo_config"
  "galantes_stg_web_data"
  "getupsoft-shared-postgres-data"
)

echo "📦 Creando volúmenes..."
for volume in "${VOLUMES[@]}"; do
  docker volume create "$volume" 2>/dev/null || echo "   (Volumen ya existe: $volume)"
done
echo ""

# Importar volúmenes
echo "📥 Restaurando volúmenes..."
for volume in "${VOLUMES[@]}"; do
  backup_file="$BACKUP_DIR/$volume.tar.gz"
  if [ -f "$backup_file" ]; then
    echo "   Restaurando: $volume"
    docker run --rm \
      -v "$volume:/data" \
      -v "$BACKUP_DIR:/backup" \
      alpine tar xzf "/backup/$volume.tar.gz" -C /data
    echo "   ✅ Completado"
  else
    echo "   ⚠️  Archivo no encontrado: $volume.tar.gz (saltando)"
  fi
done
echo ""

# Restaurar PostgreSQL
echo "📊 Restaurando base de datos..."
if [ -f "$BACKUP_DIR/postgres-staging-dump.sql.gz" ]; then
  echo "   Esperando a que PostgreSQL esté listo..."
  sleep 5
  gunzip -c "$BACKUP_DIR/postgres-staging-dump.sql.gz" | \
    docker exec -i getupsoft-shared-postgres psql -U postgres
  echo "   ✅ PostgreSQL restaurado"
else
  echo "   ⚠️  Dump de PostgreSQL no encontrado"
fi
echo ""

# Restaurar Redis
echo "📊 Restaurando Redis..."
if [ -f "$BACKUP_DIR/redis-staging-dump.rdb" ]; then
  docker cp "$BACKUP_DIR/redis-staging-dump.rdb" server-redis-1:/data/dump.rdb
  docker exec server-redis-1 redis-cli SHUTDOWN NOSAVE
  sleep 2
  docker start server-redis-1
  sleep 5
  echo "   ✅ Redis restaurado"
else
  echo "   ⚠️  Dump de Redis no encontrado"
fi
echo ""

echo "=============================================="
echo "✅ Importación completada"
echo "=============================================="
echo ""
echo "VERIFICAR:"
echo "  1. docker volume ls | grep staging"
echo "  2. docker exec getupsoft-shared-postgres psql -U postgres -c 'SELECT datname FROM pg_database;'"
echo "  3. docker-compose up -d getupsoft_odoo_staging galantes_stg_odoo"
echo ""
