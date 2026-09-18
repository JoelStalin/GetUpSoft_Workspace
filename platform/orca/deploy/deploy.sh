#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-$PWD}"
DEPLOY_DIR="$APP_DIR/deploy"
NGINX_CONF="${NGINX_CONF:-/opt/EasyCounting/deploy/server/nginx.conf}"
NGINX_CONTAINER="${NGINX_CONTAINER:-server-nginx-1}"
APP_DOMAIN="${APP_DOMAIN:-}"
PYTHON_BIN="${PYTHON_BIN:-$(command -v python3 || command -v python)}"
MARKER_BEGIN="# BEGIN orca"
MARKER_END="# END orca"

if [[ -z "$APP_DOMAIN" ]]; then
  echo "APP_DOMAIN is required"
  exit 1
fi

APP_DOMAINS="${APP_DOMAINS:-$APP_DOMAIN}"

if [[ ! -f "$DEPLOY_DIR/.env" ]]; then
  echo "Missing $DEPLOY_DIR/.env"
  exit 1
fi

cd "$APP_DIR"

if [[ ! -f "$APP_DIR/config/models.json" ]]; then
  cp "$APP_DIR/config/models.example.json" "$APP_DIR/config/models.json"
fi

docker compose -f "$DEPLOY_DIR/docker-compose.yml" --env-file "$DEPLOY_DIR/.env" up -d --build

export APP_DOMAIN APP_DOMAINS NGINX_CONF MARKER_BEGIN MARKER_END APP_DIR
"$PYTHON_BIN" "$DEPLOY_DIR/update_nginx.py"

docker exec "$NGINX_CONTAINER" nginx -t
docker exec "$NGINX_CONTAINER" nginx -s reload

for _ in $(seq 1 30); do
  if curl --silent --show-error --fail -H "Host: $APP_DOMAIN" http://127.0.0.1/health >/dev/null; then
    echo "Deployment completed for $APP_DOMAIN"
    exit 0
  fi
  sleep 2
done

echo "Deployment failed health check for $APP_DOMAIN"
exit 1

