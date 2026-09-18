#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$SCRIPT_DIR}"

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

DB_IN="$(ls -1t "$BACKUP_DIR"/chefalitas_db_*.sql.gz 2>/dev/null | head -n 1 || true)"
FILES_IN="$(ls -1t "$BACKUP_DIR"/chefalitas_files_*.tgz 2>/dev/null | head -n 1 || true)"

if [ -z "$DB_IN" ] || [ -z "$FILES_IN" ]; then
  echo "ERROR: Missing backup files in $BACKUP_DIR"
  exit 1
fi

echo "Restoring files from $FILES_IN"
tar xzf "$FILES_IN" -C "$PROJECT_DIR"

echo "Restoring database from $DB_IN into $PG_BACKUP_CONTAINER/$POSTGRES_DB"
gunzip -c "$DB_IN" | docker exec -i -e PGPASSWORD="$POSTGRES_PASSWORD" "$PG_BACKUP_CONTAINER" \
  psql -U "$POSTGRES_USER" "$POSTGRES_DB"

echo "RESTORE_DONE=1"
