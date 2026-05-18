#!/usr/bin/env bash
# ============================================================
#  setup_code_server.sh — Install & configure code-server
#  Integrates with existing nginx at /opt/EasyCounting/deploy/server/
#  Runs ON the remote server (getupsoft-lan / ssh.getupsoft.com.do)
#
#  Usage: bash setup_code_server.sh [workspace_path] [password]
# ============================================================
set -euo pipefail

WORKSPACE="${1:-/home/ubuntu/workspaces/GetUpSoft_Workspace}"
CS_PASSWORD="${2:-}"
CS_PORT=8443
DOMAIN="code.getupsoft.com.do"
NGINX_CONF="/opt/EasyCounting/deploy/server/nginx.conf"

log() { echo "[code-server] $*"; }

# ----------------------------------------------------------
#  1. Install code-server if missing
# ----------------------------------------------------------
if command -v code-server &>/dev/null; then
  log "OK: code-server $(code-server --version | head -1)"
else
  log "Installing code-server..."
  curl -fsSL https://code-server.dev/install.sh | sh
  log "Installed: $(code-server --version | head -1)"
fi

# ----------------------------------------------------------
#  2. Generate password if not provided
# ----------------------------------------------------------
if [[ -z "$CS_PASSWORD" ]]; then
  CS_PASSWORD=$(openssl rand -base64 18 | tr -d '/+=' | head -c 16)
fi
log "Password: $CS_PASSWORD"

# ----------------------------------------------------------
#  3. Write code-server config
# ----------------------------------------------------------
mkdir -p ~/.config/code-server
cat > ~/.config/code-server/config.yaml <<EOF
bind-addr: 127.0.0.1:${CS_PORT}
auth: password
password: ${CS_PASSWORD}
cert: false
EOF
log "Config: ~/.config/code-server/config.yaml"

# ----------------------------------------------------------
#  4. Systemd service
# ----------------------------------------------------------
sudo tee /etc/systemd/system/code-server.service > /dev/null <<EOF
[Unit]
Description=code-server (VS Code in browser)
After=network.target

[Service]
Type=simple
User=$(whoami)
Environment=PASSWORD=${CS_PASSWORD}
ExecStart=$(command -v code-server) --config /home/$(whoami)/.config/code-server/config.yaml ${WORKSPACE}
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable code-server
sudo systemctl restart code-server
sleep 2

if systemctl is-active --quiet code-server; then
  log "Service: RUNNING on 127.0.0.1:${CS_PORT}"
else
  log "ERROR: code-server failed to start"
  journalctl -u code-server --no-pager -n 15
  exit 1
fi

# ----------------------------------------------------------
#  5. Add server block to existing nginx
# ----------------------------------------------------------
log "Configuring nginx reverse proxy..."

# Check if the block already exists
if grep -q "server_name.*${DOMAIN}" "$NGINX_CONF" 2>/dev/null; then
  log "nginx block for ${DOMAIN} already exists, skipping"
else
  # Backup current config
  sudo cp "$NGINX_CONF" "${NGINX_CONF}.bak-$(date +%Y%m%d-%H%M%S)"

  # Insert code-server server block before the closing } of the http block
  # We create a snippet file and include it
  SNIPPET="/opt/EasyCounting/deploy/server/code-server.conf"
  sudo tee "$SNIPPET" > /dev/null <<NGINX
# code-server — code.getupsoft.com.do
server {
    listen 80;
    server_name ${DOMAIN};

    location / {
        proxy_pass http://host.docker.internal:${CS_PORT}/;
        proxy_set_header Host \$host;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \$connection_upgrade;
        proxy_set_header Accept-Encoding gzip;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_http_version 1.1;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
        client_max_body_size 100M;
    }
}
NGINX

  # Check if nginx.conf already has an include for conf snippets
  if grep -q "include.*code-server.conf" "$NGINX_CONF" 2>/dev/null; then
    log "Include already present in nginx.conf"
  else
    # Insert include before the last closing brace of http {}
    # Strategy: use sed to insert before the last }
    sudo sed -i '/^}$/i\    include /opt/EasyCounting/deploy/server/code-server.conf;' "$NGINX_CONF"
    log "Added include directive to nginx.conf"
  fi
fi

# ----------------------------------------------------------
#  6. Also set up host-level nginx as fallback
#     (in case Docker nginx doesn't handle it)
# ----------------------------------------------------------
if command -v nginx &>/dev/null && [[ -d /etc/nginx/sites-available ]]; then
  sudo tee /etc/nginx/sites-available/code-server.conf > /dev/null <<NGINX2
server {
    listen 80;
    server_name ${DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:${CS_PORT}/;
        proxy_set_header Host \$host;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_http_version 1.1;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
        client_max_body_size 100M;
    }
}
NGINX2
  sudo ln -sf /etc/nginx/sites-available/code-server.conf /etc/nginx/sites-enabled/
  sudo nginx -t && sudo systemctl reload nginx
  log "Host nginx: configured as fallback"
fi

# ----------------------------------------------------------
#  7. Reload Docker nginx (server-nginx-1)
# ----------------------------------------------------------
if docker ps --format '{{.Names}}' | grep -q "server-nginx"; then
  NGINX_CONTAINER=$(docker ps --format '{{.Names}}' | grep "server-nginx" | head -1)
  docker exec "$NGINX_CONTAINER" nginx -t 2>&1 && \
    docker exec "$NGINX_CONTAINER" nginx -s reload && \
    log "Docker nginx ($NGINX_CONTAINER): reloaded" || \
    log "WARNING: Docker nginx reload failed — may need manual fix"
else
  log "NOTE: No server-nginx container running. Host nginx will handle routing."
fi

# ----------------------------------------------------------
#  8. Install VS Code extensions
# ----------------------------------------------------------
log "Installing extensions..."
code-server --install-extension ms-python.python 2>/dev/null || true
code-server --install-extension esbenp.prettier-vscode 2>/dev/null || true
code-server --install-extension dbaeumer.vscode-eslint 2>/dev/null || true
code-server --install-extension bradlc.vscode-tailwindcss 2>/dev/null || true

# ----------------------------------------------------------
#  9. Verify connectivity
# ----------------------------------------------------------
log "Verifying local connectivity..."
if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:${CS_PORT}/healthz | grep -q "200"; then
  log "HEALTH CHECK: OK (code-server responding)"
else
  log "WARNING: code-server not responding on ${CS_PORT} yet (may still be starting)"
fi

# ----------------------------------------------------------
#  DONE
# ----------------------------------------------------------
echo ""
echo "============================================"
echo "  code-server READY"
echo "============================================"
echo "  URL:        https://${DOMAIN}"
echo "  Password:   ${CS_PASSWORD}"
echo "  Workspace:  ${WORKSPACE}"
echo "  Port:       ${CS_PORT} (localhost)"
echo "  Service:    sudo systemctl status code-server"
echo "  Logs:       journalctl -u code-server -f"
echo ""
echo "  NEXT STEP:  Ensure DNS record exists:"
echo "    code.getupsoft.com.do -> CNAME -> ssh.getupsoft.com.do"
echo "    (Cloudflare proxied / orange cloud)"
echo "============================================"
echo ""
