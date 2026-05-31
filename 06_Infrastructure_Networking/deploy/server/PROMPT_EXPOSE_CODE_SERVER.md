# Prompt: Exponer code-server en code.getupsoft.com y code.getupsoft.com.do

## Contexto

code-server YA está corriendo en el servidor (`getupsoft-lan` / `ssh.getupsoft.com.do`) en `127.0.0.1:8443`. Funciona correctamente via tunnel local en puerto 18083. Ahora necesito exponerlo públicamente en:

- `https://code.getupsoft.com`
- `https://code.getupsoft.com.do`

La infraestructura existente:
- Nginx en Docker (`server-nginx-1`) en `/opt/EasyCounting/deploy/server/nginx.conf` rutea por Host header
- Cloudflare maneja DNS (todos los subdominios son CNAME proxied a `ssh.getupsoft.com.do`)
- Cloudflare Account ID: `efce4179a7ee96c19b43c42bced58587`
- Email: `joelstalin2105@gmail.com`

## Ejecutar via SSH a getupsoft-lan

### Paso 1: Agregar bloque al nginx Docker

```bash
# Ver qué puerto escucha el nginx Docker externamente
docker ps --format '{{.Names}} {{.Ports}}' | grep nginx
```

```bash
# Crear config para code-server
sudo tee /opt/EasyCounting/deploy/server/code-server.conf > /dev/null <<'NGINX'
server {
    listen 80;
    server_name code.getupsoft.com.do code.getupsoft.com;

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
```

```bash
# Agregar include al nginx.conf si no existe
if ! grep -q "code-server.conf" /opt/EasyCounting/deploy/server/nginx.conf; then
  sudo sed -i '/^}$/i\    include /opt/EasyCounting/deploy/server/code-server.conf;' /opt/EasyCounting/deploy/server/nginx.conf
fi
```

```bash
# Reload nginx Docker
NGINX_CONTAINER=$(docker ps --format '{{.Names}}' | grep "server-nginx" | head -1)
echo "Container: $NGINX_CONTAINER"
docker exec "$NGINX_CONTAINER" nginx -t
docker exec "$NGINX_CONTAINER" nginx -s reload
```

**SI `host.docker.internal` no resuelve** (común en Linux sin Docker Desktop), usar la IP del host en la red Docker:

```bash
# Obtener IP del host desde dentro del container
HOST_IP=$(docker exec "$NGINX_CONTAINER" sh -c "getent hosts host.docker.internal 2>/dev/null | awk '{print \$1}'" || ip -4 addr show docker0 | grep -oP '(?<=inet\s)\d+(\.\d+){3}')
echo "Host IP para Docker: $HOST_IP"

# Si host.docker.internal no funciona, reemplazar en el conf:
sudo sed -i "s|host.docker.internal|$HOST_IP|g" /opt/EasyCounting/deploy/server/code-server.conf
docker exec "$NGINX_CONTAINER" nginx -t && docker exec "$NGINX_CONTAINER" nginx -s reload
```

**SI el nginx Docker NO tiene acceso al puerto 8443 del host**, alternativa directa con nginx del host:

```bash
# Instalar nginx en el host si no existe
sudo apt-get install -y nginx

sudo tee /etc/nginx/sites-available/code-server.conf > /dev/null <<'NGINX'
server {
    listen 8880;
    server_name code.getupsoft.com.do code.getupsoft.com;

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
sudo nginx -t && sudo systemctl reload nginx
```

### Paso 2: Verificar que nginx rutea correctamente

```bash
# Test local con Host header
curl -s -o /dev/null -w "%{http_code}" -H "Host: code.getupsoft.com.do" http://127.0.0.1:80/
# Debe devolver 200 o 302
```

### Paso 3: Agregar DNS en Cloudflare

Crear dos registros CNAME en Cloudflare:

| Zone | Name | Target | Proxy |
|------|------|--------|-------|
| getupsoft.com.do | code | ssh.getupsoft.com.do | ON (naranja) |
| getupsoft.com | code | ssh.getupsoft.com.do | ON (naranja) |

**Via API:**

```bash
# Reemplaza CF_TOKEN con tu Cloudflare API Token
CF_TOKEN="YOUR_TOKEN_HERE"

# Obtener Zone IDs
ZONE_COM_DO=$(curl -s -H "Authorization: Bearer $CF_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones?name=getupsoft.com.do" | jq -r '.result[0].id')
ZONE_COM=$(curl -s -H "Authorization: Bearer $CF_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones?name=getupsoft.com" | jq -r '.result[0].id')

echo "Zone .com.do: $ZONE_COM_DO"
echo "Zone .com: $ZONE_COM"

# Crear CNAME code.getupsoft.com.do
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_COM_DO/dns_records" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"type":"CNAME","name":"code.getupsoft.com.do","content":"ssh.getupsoft.com.do","proxied":true,"ttl":1}'

# Crear CNAME code.getupsoft.com
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_COM/dns_records" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"type":"CNAME","name":"code.getupsoft.com","content":"ssh.getupsoft.com.do","proxied":true,"ttl":1}'
```

**O manualmente** en https://dash.cloudflare.com → DNS → Add Record.

### Paso 4: Verificar acceso público

```bash
# Esperar 30 segundos para propagación DNS, luego:
curl -sI https://code.getupsoft.com.do
curl -sI https://code.getupsoft.com
```

Ambos deben devolver HTTP 200 o 302 con la página de login de code-server.

## Notas importantes

- Si Cloudflare usa SSL mode "Full (Strict)", necesitarás un origin certificate o cambiar a "Full" para este subdominio
- El `$connection_upgrade` ya está definido en el nginx.conf existente (hay un `map` al inicio)
- Puerto 8443 elegido para no colisionar con 8069 (Odoo), 3000 (Next.js), etc.
- Si cambias la contraseña: `sudo systemctl restart code-server` después de editar `~/.config/code-server/config.yaml`
