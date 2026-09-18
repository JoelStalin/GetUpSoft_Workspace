#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$SCRIPT_DIR}"
TS="$(date +%F_%H-%M-%S)"

if [ ! -f "$PROJECT_DIR/.env" ]; then
  echo "ERROR: Missing $PROJECT_DIR/.env"
  exit 1
fi

set -a
. "$PROJECT_DIR/.env"
set +a

: "${POSTGRES_DB:?POSTGRES_DB is required in .env}"
: "${POSTGRES_USER:?POSTGRES_USER is required in .env}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required in .env}"

PG_BACKUP_CONTAINER="${PG_BACKUP_CONTAINER:-getupsoft-shared-postgres}"

mkdir -p "$BACKUP_DIR"
DB_OUT="$BACKUP_DIR/chefalitas_db_${TS}.sql.gz"
FILES_OUT="$BACKUP_DIR/chefalitas_files_${TS}.tgz"

echo "Backing up database from container: $PG_BACKUP_CONTAINER"
docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" "$PG_BACKUP_CONTAINER" \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$DB_OUT"

echo "Backing up service files from: $PROJECT_DIR"
tar czf "$FILES_OUT" -C "$PROJECT_DIR" \
  addons config nginx odoo postgres-config docker-compose.yml restart.sh .env

echo "DB_BACKUP=$DB_OUT"
echo "FILES_BACKUP=$FILES_OUT"
