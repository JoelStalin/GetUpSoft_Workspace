#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-/home/ubuntu/workspaces/GetUpSoft_Workspace}"
ENV_FILE="/home/ubuntu/.env.getupsoft-apps"
BACKUP_DIR="/home/ubuntu/backups/getupsoft-rebuild-$(date +%Y%m%d-%H%M%S)"

mkdir -p "$BACKUP_DIR"

bash "$ROOT/deploy/server/scripts/prepare_remote_env.sh" "$ENV_FILE" >/dev/null

read_env_key() {
  local key="$1"
  grep -m1 "^${key}=" "$ENV_FILE" 2>/dev/null | cut -d= -f2- || true
}

GETUPSOFT_ODOO_DB_USER="$(read_env_key GETUPSOFT_ODOO_DB_USER)"
GETUPSOFT_ODOO_DB_PASSWORD="$(read_env_key GETUPSOFT_ODOO_DB_PASSWORD)"
GETUPSOFT_ODOO_DB_LAB="$(read_env_key GETUPSOFT_ODOO_DB_LAB)"
GETUPSOFT_ODOO_DB_STAGING="$(read_env_key GETUPSOFT_ODOO_DB_STAGING)"
GETUPSOFT_ODOO_DB_PRODUCTION="$(read_env_key GETUPSOFT_ODOO_DB_PRODUCTION)"
GALANTES_ODOO_DB_LAB="$(read_env_key GALANTES_ODOO_DB_LAB)"
GALANTES_ODOO_DB_STAGING="$(read_env_key GALANTES_ODOO_DB_STAGING)"
GALANTES_ODOO_DB_PRODUCTION="$(read_env_key GALANTES_ODOO_DB_PRODUCTION)"

export GETUPSOFT_ODOO_DB_USER GETUPSOFT_ODOO_DB_PASSWORD
export GETUPSOFT_ODOO_DB_LAB GETUPSOFT_ODOO_DB_STAGING GETUPSOFT_ODOO_DB_PRODUCTION
export GALANTES_ODOO_DB_LAB GALANTES_ODOO_DB_STAGING GALANTES_ODOO_DB_PRODUCTION

docker network inspect getupsoft-network >/dev/null 2>&1 || docker network create getupsoft-network >/dev/null

if docker ps -a --format '{{.Names}}' | grep -qx 'galantes_stg_db'; then
  docker exec galantes_stg_db sh -lc 'export PGPASSWORD="$POSTGRES_PASSWORD"; pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' >"$BACKUP_DIR/galantes_staging.sql" || true
fi

if [[ -f /home/ubuntu/getupsoft/getupsoft-web/docker-compose.prod.yml ]]; then
  docker compose -f /home/ubuntu/getupsoft/getupsoft-web/docker-compose.prod.yml down --remove-orphans || true
fi

if [[ -f /home/ubuntu/galantesjewelry_staging_live/docker-compose.staging.yml ]]; then
  docker compose --env-file /home/ubuntu/.env.staging -f /home/ubuntu/galantesjewelry_staging_live/docker-compose.staging.yml down --remove-orphans || true
fi

containers=(
  getupsoft-web-prod-web-1
  galantes_stg_web
  galantes_stg_odoo
  galantes_stg_db
  galantes_stg_nginx
  galantes_prod_web
  galantes_prod_odoo
  galantes_prod_nginx
  galantes_lab_web
  galantes_lab_odoo
  galantes_lab_nginx
  getupsoft_odoo_lab_test
  getupsoft_odoo_staging
  getupsoft_odoo_production
)

for name in "${containers[@]}"; do
  docker rm -f "$name" >/dev/null 2>&1 || true
done

while IFS= read -r volume_name; do
  docker volume rm "$volume_name" >/dev/null 2>&1 || true
done < <(
  docker volume ls --format '{{.Name}}' | grep -E \
    '(^|_)(stg-app-data|stg-odoo-data|stg-postgres-data|galantes_prod_app_data|galantes_prod_odoo_data|galantes_stg_app_data|galantes_stg_odoo_data|galantes_lab_app_data|galantes_lab_odoo_data|getupsoft_odoo_lab_data|getupsoft_odoo_staging_data|getupsoft_odoo_production_data)$' || true
)

sql_escape() {
  printf "%s" "$1" | sed "s/'/''/g"
}

role_password="$(sql_escape "${GETUPSOFT_ODOO_DB_PASSWORD}")"
admin_user="$(sql_escape "${GETUPSOFT_ODOO_DB_USER}")"

docker exec -i getupsoft-shared-postgres psql -U admin -d postgres <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${admin_user}') THEN
    EXECUTE 'CREATE ROLE ${admin_user} LOGIN PASSWORD ''${role_password}''';
  ELSE
    EXECUTE 'ALTER ROLE ${admin_user} WITH LOGIN PASSWORD ''${role_password}''';
  END IF;
END
\$\$;
SQL

for db_name in \
  "$GETUPSOFT_ODOO_DB_LAB" \
  "$GETUPSOFT_ODOO_DB_STAGING" \
  "$GETUPSOFT_ODOO_DB_PRODUCTION" \
  "$GALANTES_ODOO_DB_LAB" \
  "$GALANTES_ODOO_DB_STAGING" \
  "$GALANTES_ODOO_DB_PRODUCTION"; do
  docker exec -i getupsoft-shared-postgres psql -U admin -d postgres <<SQL
SELECT 'CREATE DATABASE ${db_name} OWNER ${admin_user}'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = '${db_name}')\gexec
GRANT ALL PRIVILEGES ON DATABASE ${db_name} TO ${admin_user};
SQL
done

docker compose -p getupsoft-site -f "$ROOT/01_Core_Platform/getupsoft-site/docker-compose.prod.yml" up -d --build
docker compose -p getupsoft-odoo --env-file "$ENV_FILE" -f "$ROOT/deploy/server/docker-compose.getupsoft-odoo.yml" up -d --build
docker compose -p galantes-stg --env-file "$ENV_FILE" -f "$ROOT/deploy/server/docker-compose.galantes.staging.yml" up -d --build
docker compose -p galantes-lab --env-file "$ENV_FILE" -f "$ROOT/deploy/server/docker-compose.galantes.lab_test.yml" up -d --build

rm -rf /home/ubuntu/getupsoft /home/ubuntu/galantesjewelry_staging /home/ubuntu/galantesjewelry_staging_live
bash "$ROOT/deploy/server/scripts/cleanup_transfer_artifacts.sh"

docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
