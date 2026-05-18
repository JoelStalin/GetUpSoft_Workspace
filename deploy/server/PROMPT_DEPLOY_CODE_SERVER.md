# Prompt: Deploy code-server en getupsoft-lan

Copia este prompt completo y pégalo a un agente con acceso SSH (Claude Code, Codex, terminal, etc.)

---

## Contexto

Tengo un servidor Ubuntu (AWS Lightsail) accesible como `getupsoft-lan` (alias SSH local) y también como `ssh.getupsoft.com.do`. El usuario es `ubuntu`. El servidor ya tiene:

- Docker corriendo con múltiples servicios (Odoo, Next.js, Postgres)
- Un nginx en Docker (`server-nginx-1`) en `/opt/EasyCounting/deploy/server/nginx.conf` que enruta por Host header a: getupsoft.com, admin.getupsoft.com, easycount.getupsoft.com, y sus variantes .com.do
- Cloudflare como DNS (todos los subdominios son CNAME proxied a `ssh.getupsoft.com.do`)
- El workspace del proyecto en `/home/ubuntu/workspaces/GetUpSoft_Workspace`

## Objetivo

Instalar y configurar **code-server** (VS Code en el navegador) para que sea accesible desde `https://code.getupsoft.com.do`, permitiendo editar el proyecto remotamente.

## Pasos a ejecutar via SSH

Conéctate a `ssh getupsoft-lan` y ejecuta estos pasos en orden:

### 1. Instalar code-server

```bash
curl -fsSL https://code-server.dev/install.sh | sh
code-server --version
```

### 2. Configurar code-server

```bash
mkdir -p ~/.config/code-server
PASSWORD=$(openssl rand -base64 18 | tr -d '/+=' | head -c 16)
cat > ~/.config/code-server/config.yaml <<EOF
bind-addr: 127.0.0.1:8443
auth: password
password: ${PASSWORD}
cert: false
EOF
echo "PASSWORD GENERADO: $PASSWORD"
```

### 3. Crear servicio systemd

```bash
sudo tee /etc/systemd/system/code-server.service > /dev/null <<EOF
[Unit]
Description=code-server
After=network.target

[Service]
Type=simple
User=ubuntu
ExecStart=$(which code-server) --config /home/ubuntu/.config/code-server/config.yaml /home/ubuntu/workspaces/GetUpSoft_Workspace
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable code-server
sudo systemctl start code-server
sudo systemctl status code-server
```

### 4. Configurar nginx (agregar al existente)

El nginx del servidor está en Docker. Hay dos opciones — intenta la opción A primero:

**Opción A: Agregar al nginx Docker existente**

```bash
# Crear snippet de configuración
sudo tee /opt/EasyCounting/deploy/server/code-server.conf > /dev/null <<'NGINX'
server {
    listen 80;
    server_name code.getupsoft.com.do;

    location / {
        proxy_pass http://host.docker.internal:8443/;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
        client_max_body_size 100M;
    }
}
NGINX

# Agregar include al nginx.conf principal (si no existe)
if ! grep -q "code-server.conf" /opt/EasyCounting/deploy/server/nginx.conf; then
  sudo sed -i '/^}$/i\    include /opt/EasyCounting/deploy/server/code-server.conf;' /opt/EasyCounting/deploy/server/nginx.conf
fi

# Reload del container nginx
NGINX_CONTAINER=$(docker ps --format '{{.Names}}' | grep "server-nginx" | head -1)
docker exec "$NGINX_CONTAINER" nginx -t && docker exec "$NGINX_CONTAINER" nginx -s reload
```

**Opción B: Si host.docker.internal no funciona, usar nginx del host**

```bash
sudo apt-get install -y nginx

sudo tee /etc/nginx/sites-available/code-server.conf > /dev/null <<'NGINX'
server {
    listen 8880;
    server_name code.getupsoft.com.do;

    location / {
        proxy_pass http://127.0.0.1:8443/;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
        client_max_body_size 100M;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/code-server.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### 5. Agregar DNS en Cloudflare

Crear un registro CNAME:
- **Name:** `code`
- **Target:** `ssh.getupsoft.com.do`
- **Proxy:** ON (naranja)
- **Zone:** `getupsoft.com.do`

Esto se puede hacer desde el dashboard de Cloudflare o via API:

```bash
# Via API (reemplaza YOUR_CF_TOKEN y ZONE_ID):
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/dns_records" \
  -H "Authorization: Bearer YOUR_CF_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"type":"CNAME","name":"code.getupsoft.com.do","content":"ssh.getupsoft.com.do","proxied":true,"ttl":1}'
```

### 6. Verificar

```bash
# Verificar servicio
systemctl is-active code-server

# Verificar respuesta local
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8443/healthz

# Verificar desde fuera (esperar propagación DNS)
curl -sI https://code.getupsoft.com.do
```

## Resultado esperado

- `https://code.getupsoft.com.do` muestra login de code-server
- Se ingresa la contraseña generada en paso 2
- Se abre VS Code con el proyecto `/home/ubuntu/workspaces/GetUpSoft_Workspace`

## Información adicional

- Cloudflare Account ID: `efce4179a7ee96c19b43c42bced58587`
- Email cuenta: `joelstalin2105@gmail.com`
- El nginx Docker existente ya maneja el `map $http_upgrade $connection_upgrade` (necesario para WebSockets de code-server)
- Si Cloudflare está en modo "Full (Strict)" SSL, el proxy necesita cert — en ese caso Cloudflare origin cert o cambiar a "Flexible" para este subdominio
- Puerto 8443 fue elegido para no colisionar con otros servicios (8069 Odoo, 3000 Next.js, etc.)
