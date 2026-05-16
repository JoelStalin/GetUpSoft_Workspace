#!/usr/bin/env bash
set -euo pipefail

ARCHIVE_PATH="${1:?archive path required}"
APP_DIR="${2:-/opt/getupsoft-orca}"
PORT="${3:-8787}"
SERVICE_NAME="${4:-getupsoft-orca}"
RELEASE_ID="$(date +%Y%m%d%H%M%S)"
RELEASE_DIR="$APP_DIR/releases/$RELEASE_ID"
EXTRACTED_DIR="$APP_DIR/releases/getupsoft-orca"

sudo mkdir -p "$APP_DIR/releases"
sudo mkdir -p /etc/systemd/system
sudo rm -rf "$EXTRACTED_DIR"
sudo tar -xzf "$ARCHIVE_PATH" -C "$APP_DIR/releases"
sudo mv "$EXTRACTED_DIR" "$RELEASE_DIR"

sudo chown -R ubuntu:ubuntu "$APP_DIR"
cd "$RELEASE_DIR"

python3 -m venv .venv
.venv/bin/pip install --upgrade pip
.venv/bin/pip install .

sudo ln -sfn "$RELEASE_DIR" "$APP_DIR/current"
sudo cp deploy/systemd/orca.service "/etc/systemd/system/${SERVICE_NAME}.service"
sudo sed -i "s/--port 8787/--port ${PORT}/" "/etc/systemd/system/${SERVICE_NAME}.service"
sudo systemctl daemon-reload
sudo systemctl enable --now "${SERVICE_NAME}.service"
sleep 3

python3 - <<PY
import json
import urllib.request

url = "http://127.0.0.1:${PORT}/health"
with urllib.request.urlopen(url, timeout=10) as response:
    payload = json.loads(response.read().decode("utf-8"))
print(json.dumps(payload, ensure_ascii=False))
PY
