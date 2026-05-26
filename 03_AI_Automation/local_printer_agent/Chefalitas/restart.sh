#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="${COMPOSE_PROJECT_NAME:-$(basename "$SCRIPT_DIR")}"
ODOO_SERVICE="${ODOO_SERVICE:-odoo}"

# Allow DB host override from .env for single-PostgreSQL deployments.
if [ -f "$SCRIPT_DIR/.env" ]; then
  set -a
  . "$SCRIPT_DIR/.env"
  set +a
fi
if [ -n "${ODOO_HOST:-}" ]; then
  sed -i "s/^db_host\\s*=.*/db_host = ${ODOO_HOST}/" "$SCRIPT_DIR/config/odoo.conf"
fi

compose() {
  docker compose -p "$PROJECT_NAME" -f "$SCRIPT_DIR/docker-compose.yml" "$@"
}

echo ">> Construyendo imagen de Odoo (si aplica)..."
compose build "$ODOO_SERVICE"

echo ">> Levantando/actualizando solo el servicio de Odoo (sin tocar la DB)..."
compose up -d --no-deps "$ODOO_SERVICE"

echo ">> Dependencias: instaladas en build (skipping runtime pip install)."

echo ">> Reiniciando solo Odoo para aplicar cambios..."
compose restart "$ODOO_SERVICE"

echo ">> Todo OK."
