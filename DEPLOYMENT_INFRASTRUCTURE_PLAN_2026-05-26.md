# 🚀 Deployment & Infrastructure Plan
**Target Date:** 2026-05-26 (Tomorrow) @ 7:30 AM  
**Status:** PREPARING  
**Timeline:** 24-hour critical infrastructure setup  

---

## 📋 CRITICAL OBJECTIVES

### ✅ By 7:30 AM Tomorrow:
1. **All Services Running**
   - PostgreSQL container (single instance, multiple schemas)
   - Backend NestJS API
   - Frontend React applications
   - VSCode Server on getupsoft-lan
   - All CLIs functional (Claude, Codex, Gemini, Copilot)

2. **Remote Development Ready**
   - code.getupsoft.com.do accessible with full IDE functionality
   - GitHub sync working bidirectionally
   - Automated deployments from code.getupsoft.com

3. **Infrastructure Modernized**
   - Kubernetes cluster operational (if implementing tonight)
   - Services containerized and orchestrated
   - PostgreSQL consolidated (single container, separate schemas)

---

## 🔴 PHASE 0: IMMEDIATE (TONIGHT - CRITICAL PATH)

### Task 0.1: Services Inventory & Status Check
**Duration:** 30 minutes  
**Action:** Document current running services
```bash
# On getupsoft-lan, run:
systemctl list-units --type=service --state=running
ps aux | grep -E "(node|python|postgres|vscode)" | head -20
netstat -tlnp | grep LISTEN
```

**Capture:**
- Service names and ports
- Database connection strings
- Environment variables (.env files)
- Current authentication methods

### Task 0.2: Database Consolidation Strategy
**Duration:** 1 hour  
**Current State → Target State:**

**BEFORE:**
```
Multiple PostgreSQL instances:
├── Backend API database (app_production)
├── Analytics database (analytics_db)
├── User service database (users_db)
└── Cache/Sessions (redis or postgres)
```

**AFTER:**
```
Single PostgreSQL Container (getupsoft-postgres):
├── Schema: public (migrations, core tables)
├── Schema: backend_app (API tables)
├── Schema: analytics (analytics tables)
├── Schema: users (user service tables)
├── Schema: sessions (cache/session data)
└── Backup volume: /var/lib/postgresql/backups
```

**Migration Steps:**
1. Backup all current databases
2. Create single PostgreSQL container
3. Run schema migrations in order
4. Test connectivity from all services
5. Verify data integrity

### Task 0.3: VSCode Server Setup
**Duration:** 1.5 hours  
**On getupsoft-lan:**

```bash
# 1. Install VSCode Server
curl -fsSL https://code-server.dev/install.sh | sh

# 2. Create service configuration
sudo nano /etc/systemd/system/code-server.service
```

**code-server.service:**
```ini
[Unit]
Description=VS Code Server
After=network.target

[Service]
Type=simple
User=getupsoft
ExecStart=/usr/local/bin/code-server --bind-addr 0.0.0.0:8080 --auth password
Restart=always
Environment="PASSWORD=SECURE_PASSWORD_HERE"

[Install]
WantedBy=multi-user.target
```

```bash
# 3. Enable and start
sudo systemctl daemon-reload
sudo systemctl enable code-server
sudo systemctl start code-server
sudo systemctl status code-server
```

### Task 0.4: CLI Setup in VSCode Server
**Duration:** 2 hours  
**Install all CLIs inside code-server container/environment:**

#### Claude CLI
```bash
# On getupsoft-lan in VSCode integrated terminal:
npm install -g @anthropic-ai/claude-cli

# Configure auth
claude auth login
claude config set model claude-opus-4-7
claude config set timeout 30000
```

#### Codex CLI  
```bash
npm install -g codex-cli
codex init
codex login
```

#### Gemini CLI
```bash
npm install -g @google/generative-ai-cli
gemini auth --api-key YOUR_GEMINI_API_KEY
```

#### GitHub Copilot CLI
```bash
npm install -g @github-next/github-copilot-cli
github-copilot auth login
```

### Task 0.5: Git & GitHub Integration
**Duration:** 1 hour  

**Setup automated deployment:**
```bash
# On getupsoft-lan:

# 1. Create deployment user
sudo useradd -m -s /bin/bash deployer
sudo mkdir -p /opt/deployments
sudo chown deployer:deployer /opt/deployments

# 2. Generate SSH keypair for deployments
ssh-keygen -t ed25519 -f ~/.ssh/github-deploy-key -N ""

# 3. Add public key to GitHub repo deploy keys
cat ~/.ssh/github-deploy-key.pub
# => Copy to GitHub Settings > Deploy Keys > Add new

# 4. Setup webhook receiver
cd /opt/deployments
cat > github-webhook-handler.js << 'EOF'
const http = require('http');
const { execSync } = require('child_process');
const crypto = require('crypto');

const SECRET = process.env.GITHUB_WEBHOOK_SECRET;
const REPO_PATH = '/opt/getupsoft-workspace';

http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const signature = req.headers['x-hub-signature-256'];
      const hash = 'sha256=' + crypto.createHmac('sha256', SECRET)
        .update(body).digest('hex');
      
      if (signature !== hash) {
        res.writeHead(403);
        res.end('Unauthorized');
        return;
      }
      
      const payload = JSON.parse(body);
      if (payload.ref === 'refs/heads/main') {
        try {
          execSync(`cd ${REPO_PATH} && git pull origin main && npm run build`, 
            { stdio: 'inherit' });
          res.writeHead(200);
          res.end('Deployed');
        } catch (e) {
          res.writeHead(500);
          res.end('Deploy failed');
        }
      } else {
        res.writeHead(200);
        res.end('OK');
      }
    });
  } else {
    res.writeHead(200);
    res.end('OK');
  }
}).listen(9000);

console.log('Webhook handler listening on :9000');
EOF

# 5. Start webhook handler
node github-webhook-handler.js &

# 6. Add GitHub webhook
# Go to: Repository Settings > Webhooks > Add webhook
# Payload URL: https://getupsoft-lan:9000/webhook
# Content type: application/json
# Secret: GITHUB_WEBHOOK_SECRET
```

---

## 🔵 PHASE 1: CONTAINERIZATION (2-3 HOURS)

### Task 1.1: Docker Setup
**Duration:** 30 minutes

```bash
# Ensure Docker is installed
docker --version

# Create docker-compose.yml for all services
cat > /opt/docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  postgresql:
    image: postgres:15-alpine
    container_name: getupsoft-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_INITDB_ARGS: "--encoding=UTF8"
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - postgres-backups:/var/lib/postgresql/backups
      - ./init-schemas.sql:/docker-entrypoint-initdb.d/01-init-schemas.sql
      - ./migrations:/migrations
    ports:
      - "5432:5432"
    networks:
      - getupsoft-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend-api:
    build:
      context: ./apps/backend-nest
      dockerfile: Dockerfile
    container_name: getupsoft-backend
    depends_on:
      postgresql:
        condition: service_healthy
    environment:
      NODE_ENV: production
      DATABASE_URL: postgres://postgres:${DB_PASSWORD}@postgresql:5432/backend_app
      GITHUB_TOKEN: ${GITHUB_TOKEN}
    volumes:
      - ./apps/backend-nest/src:/app/src
    ports:
      - "3000:3000"
    networks:
      - getupsoft-net
    restart: unless-stopped

  frontend:
    build:
      context: ./apps/orca/workflow-editor
      dockerfile: Dockerfile
    container_name: getupsoft-frontend
    environment:
      REACT_APP_API_URL: http://backend-api:3000
      REACT_APP_ENVIRONMENT: production
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
      PASSWORD: ${VSCODE_PASSWORD}
      SUDO_PASSWORD: ${VSCODE_PASSWORD}
    volumes:
      - vscode-data:/home/coder/.local/share/code-server
      - ./:/workspace
    ports:
      - "8080:8080"
    networks:
      - getupsoft-net
    restart: unless-stopped

volumes:
  postgres-data:
    driver: local
  postgres-backups:
    driver: local
  vscode-data:
    driver: local

networks:
  getupsoft-net:
    driver: bridge
EOF
```

### Task 1.2: Schema Migration Script
**Duration:** 30 minutes

```sql
-- init-schemas.sql
-- This script runs when PostgreSQL container starts

-- Create schemas
CREATE SCHEMA IF NOT EXISTS backend_app;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS sessions;

-- Grant permissions
GRANT USAGE ON SCHEMA backend_app TO postgres;
GRANT USAGE ON SCHEMA analytics TO postgres;
GRANT USAGE ON SCHEMA users TO postgres;
GRANT USAGE ON SCHEMA sessions TO postgres;

-- Create initial tables in each schema
-- You'll need to populate this with your actual schema definitions
\ir /migrations/001_backend_app_schema.sql
\ir /migrations/002_analytics_schema.sql
\ir /migrations/003_users_schema.sql
\ir /migrations/004_sessions_schema.sql
```

### Task 1.3: Start Docker Compose
**Duration:** 15 minutes

```bash
cd /opt
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml logs -f

# Verify all services are healthy
docker-compose -f docker-compose.prod.yml ps
```

---

## 🟢 PHASE 2: KUBERNETES SETUP (OPTIONAL - 4+ HOURS)

**Skip this if time is critical. Can be implemented after 7:30 AM with zero downtime.**

### Task 2.1: Kubernetes Cluster Initialization

```bash
# Initialize kubeadm cluster (if not using managed service)
kubeadm init --pod-network-cidr=10.244.0.0/16

# Install CNI (Flannel)
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml

# Join worker nodes
kubeadm token create --print-join-command
```

### Task 2.2: Helm Chart Deployment

```bash
# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Add GetUpSoft charts repo (if exists)
helm repo add getupsoft https://charts.getupsoft.io
helm repo update

# Deploy services
helm install getupsoft-db ./helm/postgres \
  --set password=$DB_PASSWORD \
  --namespace production

helm install getupsoft-backend ./helm/backend-api \
  --set replicaCount=3 \
  --namespace production

helm install getupsoft-frontend ./helm/frontend \
  --set replicaCount=2 \
  --namespace production
```

---

## 🟡 PHASE 3: DOMAIN & REVERSE PROXY (1 HOUR)

### Task 3.1: Nginx Configuration

```nginx
# /etc/nginx/sites-available/getupsoft-prod

upstream backend {
  server getupsoft-backend:3000;
}

upstream frontend {
  server getupsoft-frontend:3000;
}

upstream vscode {
  server getupsoft-code-server:8080;
}

server {
    listen 443 ssl http2;
    server_name code.getupsoft.com.do *.getupsoft.com.do;

    ssl_certificate /etc/ssl/certs/getupsoft.crt;
    ssl_certificate_key /etc/ssl/private/getupsoft.key;

    # VSCode Server
    location ~ ^/(web|vscode|ide) {
        proxy_pass http://vscode;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # API
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
    }
}
```

### Task 3.2: Enable & Test

```bash
sudo ln -s /etc/nginx/sites-available/getupsoft-prod \
         /etc/nginx/sites-enabled/

sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔍 VERIFICATION CHECKLIST

### Before 7:30 AM - MUST PASS ALL:

```
DATABASE:
☐ PostgreSQL running and accepting connections
☐ All 5 schemas created (public, backend_app, analytics, users, sessions)
☐ Tables migrated and data intact
☐ Backup scripts running on schedule

BACKEND:
☐ NestJS API responding on :3000
☐ Health check endpoint: GET /health → 200 OK
☐ Database connectivity working
☐ Authentication middleware functioning

FRONTEND:
☐ React app running on :3001
☐ Can connect to backend API
☐ Workflow editor loads properly
☐ No console errors

CLI TOOLS (in VSCode Server):
☐ claude --version (outputs version)
☐ codex --version
☐ gemini --help
☐ github-copilot --help

VSCODE SERVER:
☐ Accessible at https://code.getupsoft.com.do:8080
☐ All CLIs available in integrated terminal
☐ File system access working
☐ Git integration working

GITHUB INTEGRATION:
☐ Webhook receiver listening on :9000
☐ Test push to main branch triggers deploy
☐ Auto-deployment working
☐ Rollback process verified

NETWORKING:
☐ All containers on getupsoft-net communicating
☐ External ports accessible from workstations
☐ SSL certificates valid
☐ No firewall blocks
```

---

## ⚡ PRIORITY EXECUTION ORDER

**Tonight (EST. 6-8 hours):**
1. ✅ Tasks 0.1-0.5 (Services, DB strategy, VSCode, CLIs, Git) - 6 hours
2. ✅ Tasks 1.1-1.3 (Docker, schemas, compose up) - 1.5 hours
3. ✅ Task 3 (Nginx, domains) - 1 hour

**Total: 8.5 hours**

**If running short on time:**
- Skip Kubernetes (Phase 2) - can add later with zero downtime
- Use Docker Compose instead of K8s for now
- Focus on Phase 0-1 and 3 only

---

## 🔄 MONITORING & ROLLBACK

### 24-Hour Monitoring (After 7:30 AM)

```bash
# Watch logs continuously
docker-compose -f docker-compose.prod.yml logs -f

# Monitor resource usage
docker stats

# Check service health
curl http://localhost:3000/health      # Backend
curl http://localhost:3001/            # Frontend
curl http://localhost:8080/            # VSCode
```

### Emergency Rollback (If Needed)

```bash
# Stop everything
docker-compose -f docker-compose.prod.yml down

# Restore from backup
docker volume rm getupsoft-postgres  # (data preserved if using docker-compose)

# Restart
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📞 SUPPORT & TROUBLESHOOTING

### If PostgreSQL won't start:
```bash
docker logs getupsoft-postgres
# Check: disk space, permissions, schema conflicts
```

### If Backend can't connect to DB:
```bash
docker exec getupsoft-backend \
  nc -zv getupsoft-postgres 5432
```

### If VSCode can't be accessed:
```bash
docker logs getupsoft-code-server
curl http://localhost:8080  # Should work locally
```

### If CLIs aren't working:
```bash
# Enter VSCode container
docker exec -it getupsoft-code-server bash

# Verify CLIs
which claude
which codex
which gemini
```

---

## ✅ SUCCESS CRITERIA (7:30 AM)

- ✅ All services running and healthy
- ✅ code.getupsoft.com.do accessible with VSCode
- ✅ All CLIs available in terminal
- ✅ GitHub auto-deployment working
- ✅ PostgreSQL consolidated in one container
- ✅ Backup & restore tested
- ✅ Team can develop in code.getupsoft.com.do
- ✅ Deployments from code.getupsoft.com working
- ✅ Zero service downtime during setup

---

**Status: READY FOR IMPLEMENTATION**

**Questions about GitHub or CLIs?** Ask Copilot CLI after it's running:
```bash
github-copilot query "How do I setup GitHub Actions?"
```

---

*Plan created: 2026-05-25*  
*Target completion: 2026-05-26 @ 7:30 AM*  
*Estimated effort: 8-10 hours*
