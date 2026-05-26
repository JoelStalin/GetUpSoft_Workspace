# ⚡ QUICK START - 7:30 AM Deployment
**Tonight's Critical Tasks - Do These First**

---

## 🎯 TONIGHT'S MISSION (6-8 hours)

### Step 1: SSH into getupsoft-lan
```bash
ssh getupsoft@getupsoft-lan

# Verify you're in the right place
hostname
pwd
```

### Step 2: Check Current Services Status
```bash
# See what's running now
systemctl list-units --type=service --state=running | head -20

# Document database connections
ps aux | grep postgres

# List all listening ports
netstat -tlnp | grep LISTEN

# Take screenshot/save output for reference
```

### Step 3: Backup Everything (SAFETY FIRST)
```bash
# On getupsoft-lan
cd /opt

# Backup all databases
pg_dump -U postgres -Fc -v -f full-backup-$(date +%Y%m%d_%H%M%S).dump

# Backup current docker configs
tar czf docker-compose-backup-$(date +%Y%m%d_%H%M%S).tar.gz docker-compose*.yml

# List backups
ls -lh *backup* *dump* 2>/dev/null
```

### Step 4: Install Docker (if not present)
```bash
# Check if Docker is installed
docker --version

# If not installed:
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group (so you don't need sudo)
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
docker ps
```

### Step 5: Create Docker Compose File
```bash
cd /opt

# Create the main production compose file
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  postgresql:
    image: postgres:15-alpine
    container_name: getupsoft-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: SecurePassword123!
      POSTGRES_INITDB_ARGS: "--encoding=UTF8"
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - postgres-backups:/var/lib/postgresql/backups
    ports:
      - "5432:5432"
    networks:
      - getupsoft-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  backend-api:
    image: getupsoft/backend-api:latest
    container_name: getupsoft-backend
    depends_on:
      postgresql:
        condition: service_healthy
    environment:
      NODE_ENV: production
      DATABASE_URL: postgres://postgres:SecurePassword123!@postgresql:5432/backend_app
      LOG_LEVEL: info
    ports:
      - "3000:3000"
    networks:
      - getupsoft-net
    restart: unless-stopped

  frontend:
    image: getupsoft/frontend:latest
    container_name: getupsoft-frontend
    ports:
      - "3001:3000"
    networks:
      - getupsoft-net
    restart: unless-stopped
    depends_on:
      - backend-api

  vscode-server:
    image: codercom/code-server:latest
    container_name: getupsoft-code-server
    environment:
      PASSWORD: CodeServerPassword123!
      SUDO_PASSWORD: CodeServerPassword123!
    volumes:
      - vscode-data:/home/coder/.local/share/code-server
      - /opt:/workspace
    ports:
      - "8080:8080"
    networks:
      - getupsoft-net
    restart: unless-stopped

volumes:
  postgres-data:
  postgres-backups:
  vscode-data:

networks:
  getupsoft-net:
    driver: bridge
EOF

# Verify file was created
cat docker-compose.prod.yml | head -20
```

### Step 6: Start Docker Services
```bash
cd /opt

# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Wait 30 seconds for services to stabilize
sleep 30

# Check status
docker-compose -f docker-compose.prod.yml ps

# Should see all containers in "Up" state
```

### Step 7: Install VSCode Server CLIs
```bash
# Enter the VSCode container terminal
docker exec -it getupsoft-code-server bash

# Install Claude CLI
npm install -g @anthropic-ai/claude-cli

# Install Copilot CLI
npm install -g @github-next/github-copilot-cli

# Install Codex CLI
npm install -g codex-cli

# Install Gemini CLI
npm install -g @google/generative-ai-cli

# Verify all installed
which claude
which github-copilot
which codex
which gemini

# Exit container
exit
```

### Step 8: Configure CLIs with Credentials
```bash
# IMPORTANT: You need API keys for these
# Get them from:
# - Claude: https://console.anthropic.com
# - GitHub Copilot: https://github.com/copilot/signup
# - Gemini: https://aistudio.google.com/app/apikeys
# - Codex: Your internal system

# Configure Claude CLI
docker exec -it getupsoft-code-server bash
claude auth login
# Paste API key when prompted
exit

# Configure GitHub Copilot
docker exec -it getupsoft-code-server bash
github-copilot auth login
exit

# Configure Gemini
docker exec -it getupsoft-code-server bash
export GOOGLE_API_KEY="your-key-here"
gemini config set api_key your-key-here
exit
```

### Step 9: Test Services
```bash
# From your laptop, test connectivity

# Backend API
curl http://getupsoft-lan:3000/health

# Frontend
curl http://getupsoft-lan:3001/

# VSCode Server
open http://getupsoft-lan:8080
# Username: coder
# Password: CodeServerPassword123!

# PostgreSQL (from getupsoft-lan)
docker exec getupsoft-postgres psql -U postgres -c "SELECT version();"
```

### Step 10: Setup Nginx Proxy (Optional but Recommended)
```bash
# On getupsoft-lan
sudo apt-get update
sudo apt-get install -y nginx

# Create config
sudo tee /etc/nginx/sites-available/default << 'EOF'
upstream backend {
    server 127.0.0.1:3000;
}

upstream frontend {
    server 127.0.0.1:3001;
}

upstream vscode {
    server 127.0.0.1:8080;
}

server {
    listen 80 default_server;
    server_name _;

    # API routes
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # VSCode
    location ~ ^/(vscode|code|ide) {
        proxy_pass http://vscode;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_buffering off;
    }

    # Default to frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
    }
}
EOF

# Test config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

---

## 📊 VERIFICATION (Before 7:30 AM)

```bash
# ALL OF THESE MUST RETURN SUCCESS:

# 1. Containers running
docker-compose -f /opt/docker-compose.prod.yml ps | grep "Up"
# Expected: 4 services all "Up"

# 2. PostgreSQL healthy
docker exec getupsoft-postgres pg_isready -U postgres
# Expected: "accepting connections"

# 3. Backend responding
curl http://localhost:3000/health
# Expected: 200 OK

# 4. Frontend responding
curl http://localhost:3001 | head -5
# Expected: HTML content

# 5. VSCode responding
curl http://localhost:8080 | head -5
# Expected: HTML content

# 6. All CLIs installed
docker exec getupsoft-code-server bash -c "which claude && which github-copilot && which codex && which gemini"
# Expected: Paths to all 4 CLIs

# 7. GitHub webhook running (if set up)
curl http://localhost:9000
# Expected: "OK"
```

---

## ⚠️ IF SOMETHING GOES WRONG

### Docker Container Won't Start
```bash
# Check logs
docker logs getupsoft-postgres
docker logs getupsoft-backend
docker logs getupsoft-frontend
docker logs getupsoft-code-server

# Troubleshoot specific service
docker-compose -f docker-compose.prod.yml logs -f postgresql
```

### Can't Connect to Database
```bash
# Test connectivity
docker exec getupsoft-backend \
  npm run test:db

# Or manually
docker exec -it getupsoft-postgresql \
  psql -U postgres -c "SELECT 1"
```

### CLIs Not Working
```bash
# Verify they're installed
docker exec getupsoft-code-server npm list -g | grep -E "(claude|copilot|codex|gemini)"

# Reinstall if needed
docker exec -it getupsoft-code-server bash
npm install -g @anthropic-ai/claude-cli
npm cache clean --force
exit
```

### Complete Reset (Last Resort)
```bash
# ONLY if nothing else works
# This will delete all containers and volumes

docker-compose -f docker-compose.prod.yml down -v

# Restore from backup
pg_restore -U postgres -d backend_app full-backup-YYYYMMDD_HHMMSS.dump

# Rebuild from scratch
docker-compose -f docker-compose.prod.yml up -d
```

---

## ✅ FINAL CHECKLIST (7:30 AM)

Print this and check off as you go:

```
DATABASE:
☐ PostgreSQL container running and healthy
☐ Can connect with: psql -U postgres -h getupsoft-lan
☐ Core schemas exist
☐ Tables have data
☐ Backups created

SERVICES:
☐ Backend API (port 3000) responding
☐ Frontend (port 3001) loads
☐ VSCode (port 8080) accessible
☐ All ports accessible from workstations

CLIs:
☐ claude --version works
☐ github-copilot --help works
☐ codex --version works
☐ gemini --help works

NETWORK:
☐ code.getupsoft.com.do resolves
☐ code.getupsoft.com.do:8080 accessible
☐ All services behind Nginx proxy
☐ SSL certificates valid (if using HTTPS)

GITHUB:
☐ Webhook receiver running
☐ Test commit deployed successfully
☐ Rollback procedure tested

MONITORING:
☐ Logs being collected
☐ Health checks configured
☐ Auto-restart enabled for all services
☐ 24-hour monitoring schedule confirmed
```

---

## 🎉 YOU'RE READY!

Once all items above are checked:
1. Take screenshots of everything working
2. Document any issues found
3. Test each service from a different machine
4. Confirm developers can access code.getupsoft.com.do
5. Celebrate! ✨

---

**Questions?** Ask GitHub Copilot in VSCode:
```
"How do I troubleshoot docker-compose"
"How do I setup PostgreSQL schemas"
```

**Status: READY TO EXECUTE TONIGHT**

**Target completion: 2026-05-26 @ 7:30 AM**
