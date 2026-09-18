#!/usr/bin/env bash
set -euo pipefail

TARGET_ENV="${1:-/home/ubuntu/.env.getupsoft-apps}"
SOURCE_ENV="/home/ubuntu/.env.staging"

mkdir -p "$(dirname "$TARGET_ENV")"

if [[ ! -f "$TARGET_ENV" ]]; then
  if [[ -f "$SOURCE_ENV" ]]; then
    cp "$SOURCE_ENV" "$TARGET_ENV"
  else
    touch "$TARGET_ENV"
  fi
fi

ensure_key() {
  local key="$1"
  local value="$2"
  if grep -q "^${key}=" "$TARGET_ENV" 2>/dev/null; then
    return 0
  fi
  printf '%s=%s\n' "$key" "$value" >>"$TARGET_ENV"
}

read_key() {
  local key="$1"
  local value
  value="$(grep -m1 "^${key}=" "$TARGET_ENV" 2>/dev/null | cut -d= -f2- || true)"
  printf '%s' "$value"
}

admin_password="$(read_key ADMIN_PASSWORD)"
postgres_password="$(read_key POSTGRES_PASSWORD)"
google_oauth_client_id="$(read_key GOOGLE_OAUTH_CLIENT_ID)"
google_oauth_client_secret="$(read_key GOOGLE_OAUTH_CLIENT_SECRET)"

if [[ -z "$google_oauth_client_id" ]]; then
  google_oauth_client_id="$(read_key GOOGLE_OAUTH_client_id)"
fi

if [[ -z "$google_oauth_client_secret" ]]; then
  google_oauth_client_secret="$(read_key GOOGLE_OAUTH_client_secret)"
fi

if [[ -z "$postgres_password" ]]; then
  postgres_password="shared_password_change_me"
fi

if [[ -z "$admin_password" ]]; then
  admin_password="$postgres_password"
fi

ensure_key SHARED_PGHOST getupsoft-shared-postgres
ensure_key SHARED_PGPORT 5432
ensure_key GOOGLE_OAUTH_CLIENT_ID "$google_oauth_client_id"
ensure_key GOOGLE_OAUTH_CLIENT_SECRET "$google_oauth_client_secret"
ensure_key GETUPSOFT_ODOO_DB_USER odoo
ensure_key GETUPSOFT_ODOO_DB_PASSWORD "$postgres_password"
ensure_key GETUPSOFT_ODOO_ADMIN_PASSWORD "$admin_password"
ensure_key GETUPSOFT_ODOO_DB_LAB getupsoft_lab_test
ensure_key GETUPSOFT_ODOO_DB_STAGING getupsoft_staging
ensure_key GETUPSOFT_ODOO_DB_PRODUCTION getupsoft_production
ensure_key GALANTES_ODOO_DB_USER odoo
ensure_key GALANTES_ODOO_DB_PASSWORD "$postgres_password"
ensure_key GALANTES_ODOO_DB_LAB galantes_lab_test
ensure_key GALANTES_ODOO_DB_STAGING galantes_staging
ensure_key GALANTES_ODOO_DB_PRODUCTION galantes_prod
ensure_key GALANTES_STAGING_SITE_URL http://192.168.1.233:8082
ensure_key GALANTES_STAGING_SHOP_URL http://192.168.1.233:8079
ensure_key GALANTES_STAGING_ODOO_URL http://192.168.1.233:8079
ensure_key GALANTES_LAB_SITE_URL http://192.168.1.233:8085
ensure_key GALANTES_LAB_SHOP_URL http://192.168.1.233:8089
ensure_key GALANTES_LAB_ODOO_URL http://192.168.1.233:8089

chmod 600 "$TARGET_ENV"
echo "$TARGET_ENV ready"
