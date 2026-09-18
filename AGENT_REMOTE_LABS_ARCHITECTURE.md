# 🏗️ Agent Remote Labs Architecture

**Date:** 2026-05-28  
**Strategy Change:** Agent operates ONLY via remote connections to labs, NO local edits  
**Status:** Architecture Definition

---

## 🎯 PRINCIPLE

**Agent (Claude Code on code.getupsoft.com):**
- ❌ NO local file edits
- ❌ NO local Docker commands
- ❌ NO local git commits
- ✅ ONLY connects to remote labs
- ✅ ONLY uses lab servers + LLMs
- ✅ ONLY sends commands via API/SSH/RPC

**Local Environment:**
- 🖥️ Lab servers running (Odoo, n8n, etc.)
- 🖥️ LLM endpoints (NVIDIA, Ollama)
- 🖥️ Git repository (READ ONLY for status checks)
- 🖥️ Nothing else

---

## 🌐 ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│         code.getupsoft.com (Claude Agent)                  │
│         ✅ Edits code/docs                                 │
│         ✅ Manages workflows                               │
│         ✅ Coordinates labs                                │
│                                                             │
└────────────────┬──────────────────────────────────────────┘
                 │
        ┌────────┴────────┬─────────────┬──────────────┐
        │                 │             │              │
        ▼                 ▼             ▼              ▼
   
   Lab 1:            Lab 2:        Lab 3:          LLM:
   Odoo v19          n8n          Workflow        NVIDIA
   HTTP API          WebHook       Editor          API
   (localhost:8069)  (localhost)   (localhost)     (cloud)
   
   RPC/JSON API      REST API      WebSocket       HTTP API
   
   ✅ Remote         ✅ Remote     ✅ Remote       ✅ Remote
   ❌ Local edits    ❌ Local edits ❌ Local edits  ❌ Local edits
```

---

## 💻 LAB SERVERS (Keep Running Locally)

### Lab 1: Odoo v19 ORCA
```
Status: Docker Container (keep running)
URL: http://localhost:8069
Database: odoo19_orca
API: XML-RPC / JSON-RPC
Port: 8069, 8072

Agent connects via:
- HTTP requests to /json/* endpoints
- XML-RPC for module operations
- Database queries (if exposed)
```

### Lab 2: n8n Workflow Engine
```
Status: Docker Container (keep running)
URL: http://localhost:5678
API: REST + WebHook
Port: 5678

Agent connects via:
- n8n REST API
- Workflow trigger webhooks
- Credential management
```

### Lab 3: Workflow Editor (ORCA UI)
```
Status: Local development server (keep running)
URL: http://localhost:3000
API: REST + WebSocket
Port: 3000

Agent connects via:
- React component updates
- WebSocket for real-time sync
- File system (read-only for verification)
```

### Lab 4: LLM Endpoints
```
Status: Remote + Local
- NVIDIA Build API: https://integrate.api.nvidia.com/v1 (remote)
- Ollama Local: http://getupsoft-lan:11434/v1 (if available)

Agent connects via:
- HTTP requests to inference endpoints
```

---

## 🔌 CONNECTION METHODS

### Method 1: Odoo RPC/JSON
```python
# Agent NEVER edits local Odoo files
# Agent connects via RPC to running Odoo server

from xmlrpc import client

odoo_url = "http://localhost:8069"
db = "odoo19_orca"
username = "admin"
password = "admin"

# RPC call to check ORCA logs
models = client.ServerProxy('{}/xmlrpc/2/object'.format(odoo_url))
logs = models.execute_kw(db, uid, password, 
    'account_extended.orca.log', 'search', [])
```

### Method 2: HTTP/REST to Labs
```bash
# Agent uses HTTP, NEVER local commands

# Check Odoo status
curl -s -I http://localhost:8069

# Trigger n8n workflow
curl -X POST http://localhost:5678/webhook/my-webhook \
  -H "Content-Type: application/json" \
  -d '{"data": "value"}'

# Get workflow editor state
curl -s http://localhost:3000/api/state
```

### Method 3: SSH to Lab Server (if needed)
```bash
# Agent NEVER: docker ps, docker exec, etc.
# Agent ONLY: SSH for read-only checks

ssh user@lab-server "docker ps | grep odoo"
ssh user@lab-server "curl http://localhost:8069"
```

---

## 📋 WHAT AGENT CAN DO

✅ **Allowed Actions:**
1. HTTP requests to lab endpoints
2. RPC/JSON calls to Odoo
3. Webhook triggers to n8n
4. Read-only git status checks
5. Memory writes to code.getupsoft.com
6. Plan updates
7. Conversation logging
8. SSH read-only checks
9. LLM API calls (NVIDIA, Ollama)
10. File reads from .claude/ for verification only

---

## 📋 WHAT AGENT CANNOT DO

❌ **Prohibited Actions:**
1. ~~Edit Python files locally~~ → Update via code.getupsoft.com
2. ~~Run docker commands~~ → Labs stay running
3. ~~Execute git commits~~ → Code.getupsoft.com handles git
4. ~~Modify Odoo addons locally~~ → Use Odoo RPC to change
5. ~~Restart containers~~ → Labs must stay running
6. ~~Install npm packages locally~~ → Only in code.getupsoft.com
7. ~~Edit Docker volumes~~ → Read-only mounts
8. ~~Direct database edits~~ → Via Odoo models/RPC
9. ~~File system operations~~ → Only read-only for verification
10. ~~Shell commands on local machine~~ → Only queries/health checks

---

## 🔄 WORKFLOW EXAMPLE: Fix Bug in Odoo Module

### OLD (❌ Local Agent - NO MORE):
```bash
# Agent edits locally
claude edit odoo/account_extended/models/account_move_orca.py
# Bug fix...
git commit -m "fix: ..."
git push
docker-compose up -d
```

### NEW (✅ Remote Agent - REQUIRED):
```
1. Agent in code.getupsoft.com edits file
   File: /02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules/account_extended/...

2. Agent commits via git (in code.getupsoft.com)
   git commit -m "fix: ..."
   git push

3. Agent CONNECTS to lab (HTTP)
   POST http://localhost:8069/json/2/account.move/search
   
4. Agent VERIFIES via RPC
   xmlrpc_client.search([('id', '=', 1)])
   
5. Tests run in code.getupsoft.com (via npm test)

6. Result: No local edits, only lab connections ✅
```

---

## 🚀 LAB STARTUP CHECKLIST

**Before code.getupsoft.com starts work:**

- [ ] `docker-compose up -d` (Odoo v19)
  ```bash
  docker-compose -f docker-compose.yml up -d
  ```

- [ ] Verify Odoo online:
  ```bash
  curl -I http://localhost:8069
  # Expected: HTTP/1.1 200 OK
  ```

- [ ] Verify n8n running (if used):
  ```bash
  curl -I http://localhost:5678
  ```

- [ ] Verify Workflow Editor running:
  ```bash
  npm run dev  # In apps/orca/workflow-editor/
  curl -I http://localhost:3000
  ```

- [ ] Verify LLM endpoints:
  ```bash
  # NVIDIA (remote)
  curl -s https://integrate.api.nvidia.com/v1/models
  
  # Ollama (local)
  curl -s http://getupsoft-lan:11434/v1/models
  ```

- [ ] All 46 ORCA modules installed in Odoo:
  ```bash
  curl -X POST http://localhost:8069/json/2/ir.module.module/search \
    -d '{}' -H "Content-Type: application/json"
  ```

---

## 🛠️ AGENT COMMANDS (Allowed)

### Health Check Labs
```bash
# ALLOWED: Read-only HTTP checks
curl -I http://localhost:8069
curl -I http://localhost:5678
curl -I http://localhost:3000

# Check git status (read-only)
git status
git log --oneline -5
```

### Connect to Odoo
```python
# ALLOWED: RPC/JSON calls
from xmlrpc import client

models = client.ServerProxy('http://localhost:8069/xmlrpc/2/object')
logs = models.execute_kw('odoo19_orca', 2, 'admin', 
    'account_extended.orca.log', 'search', [])

print(f"Found {len(logs)} ORCA logs")
```

### Trigger Workflows
```bash
# ALLOWED: HTTP POST to webhooks
curl -X POST http://localhost:5678/webhook/test-workflow \
  -H "Content-Type: application/json" \
  -d '{"action": "verify_modules"}'
```

### Query LLMs
```python
# ALLOWED: Call NVIDIA Build API
import requests

response = requests.post(
    'https://integrate.api.nvidia.com/v1/chat/completions',
    headers={'Authorization': f'Bearer {api_key}'},
    json={'model': 'meta/llama-2-7b', 'messages': [...]}
)
```

---

## 🚫 DISABLED COMMANDS (NOT ALLOWED)

```bash
# ❌ NO: docker commands
docker ps
docker exec odoo19_orca ...
docker-compose up

# ❌ NO: local file edits (must use code.getupsoft.com)
code 02_Odoo_ERP/.../models/account_move_orca.py
nano file.py

# ❌ NO: git commits from agent
git commit -m "..."
git push

# ❌ NO: npm install locally
npm install

# ❌ NO: package edits
pip install ...
```

---

## 📊 LAB MONITORING

Agent can monitor labs via read-only endpoints:

```python
# Health Check Function (Agent can use)
def check_lab_health():
    labs = {
        'odoo_v19': 'http://localhost:8069',
        'n8n': 'http://localhost:5678',
        'workflow_editor': 'http://localhost:3000',
    }
    
    for name, url in labs.items():
        try:
            resp = requests.head(url, timeout=5)
            print(f"✅ {name}: {resp.status_code}")
        except:
            print(f"❌ {name}: DOWN")
```

---

## 🔐 SECURITY: No Local Access

This architecture means:

✅ **Secure because:**
- Agent can't modify local files
- Agent can't break local setup
- Agent can't access secrets in .env files
- Labs stay isolated and reproducible
- All changes tracked in code.getupsoft.com git

❌ **Risk if agent had local access:**
- Could delete entire directories
- Could corrupt Docker volumes
- Could expose .env secrets
- Could break lab setup

---

## 📝 SUMMARY

| Task | Old (❌) | New (✅) |
|------|---------|---------|
| Edit code | Local edits + commit | code.getupsoft.com git |
| Run tests | Local npm test | code.getupsoft.com npm |
| Check Odoo | docker exec | HTTP RPC to http://localhost:8069 |
| Restart labs | docker-compose up | Labs stay running, agent connects |
| Debug | Local logs | HTTP requests to lab endpoints |
| Deploy | Manual steps | Lab APIs + automation |

---

## 🎯 NEXT: Configure Labs for Remote Access

**Create connection config for code.getupsoft.com:**

File: `lab-endpoints.json`
```json
{
  "labs": {
    "odoo_v19": {
      "url": "http://localhost:8069",
      "api_type": "json-rpc",
      "database": "odoo19_orca",
      "username": "admin",
      "password": "admin",
      "modules": 46
    },
    "n8n": {
      "url": "http://localhost:5678",
      "api_type": "rest"
    },
    "workflow_editor": {
      "url": "http://localhost:3000",
      "api_type": "rest+websocket"
    },
    "llm_nvidia": {
      "url": "https://integrate.api.nvidia.com/v1",
      "api_type": "http",
      "auth": "bearer_token"
    }
  },
  "security": {
    "local_edits_allowed": false,
    "docker_commands_allowed": false,
    "git_commits_allowed": false,
    "http_connections_allowed": true,
    "read_only_filesystem": true
  }
}
```

---

**Status:** ✅ Architecture defined  
**Next:** Configure lab endpoints for code.getupsoft.com access

Agent will ONLY connect to labs via HTTP/RPC/WebSocket. No local edits. 🔒
