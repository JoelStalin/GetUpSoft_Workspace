# 🤖 GetUpSoft Orca Agent - Local Access Configuration

**Date:** 2026-05-28  
**Purpose:** Enable Orca Agent direct access to local machine (Docker, Labs, LLM)  
**Status:** Configuration Ready  

---

## 🎯 WHAT IS ORCA AGENT?

**Orca Agent** = Intelligent agent running in code.getupsoft.com that:
- ✅ Has direct access to THIS machine (localhost)
- ✅ Can see Docker containers, volumes, networks
- ✅ Can query Odoo v19 RPC directly
- ✅ Can trigger n8n workflows
- ✅ Can query LLM endpoints
- ✅ Operates via secure tunnel/SSH/API
- ❌ CANNOT edit files locally (only via code.getupsoft.com git)
- ❌ CANNOT execute arbitrary commands (only approved operations)

---

## 🔌 ARCHITECTURE: Orca Agent ↔️ Local Machine

```
code.getupsoft.com                      YOUR PC (localhost)
─────────────────────────────────────   ──────────────────────────
                                       
Orca Agent                              Connection Method
├─ Language: Python/Node.js         ←→  ├─ HTTP Tunnel (port 8000)
├─ Auth: API Key                        ├─ SSH (optional)
├─ Tools: HTTP, RPC, Webhook            ├─ Docker API
└─ Memory: Persistent                   └─ REST endpoints

Agent can see:
├─ Docker Desktop processes
├─ Running containers (odoo, n8n, etc.)
├─ Local volumes
├─ Network ports (8069, 5678, 3000)
└─ Lab endpoints (query via HTTP)
```

---

## ✅ SETUP: Enable Orca Agent Access (3 Steps)

### Step 1: Create Agent Configuration
File: `.claude/agents/orca-agent.yaml`

```yaml
name: GetUpSoft Orca Agent
version: 1.0.0
type: remote_agent
enabled: true

# Direct access to this machine
local_access:
  enabled: true
  machine: "GetUpSoft-PC"
  user: "yoeli"
  
  # Available endpoints
  endpoints:
    - name: odoo_v19
      url: http://localhost:8069
      type: json-rpc
      auth: basic
      credentials:
        username: admin
        password: admin
    
    - name: n8n
      url: http://localhost:5678
      type: rest
    
    - name: workflow_editor
      url: http://localhost:3000
      type: rest+websocket
    
    - name: docker
      type: docker_socket
      socket: /var/run/docker.sock  # or Docker Desktop equivalent
    
    - name: nvidia_api
      url: https://integrate.api.nvidia.com/v1
      type: http_bearer
      auth_key: ${NVIDIA_API_KEY}
    
    - name: ollama
      url: http://getupsoft-lan:11434/v1
      type: http
      optional: true

# What agent can do
permissions:
  read_docker: true
  read_odoo_data: true
  trigger_workflows: true
  query_lms: true
  
  # What agent CANNOT do
  no_local_edits: true
  no_container_exec: false  # Can execute approved commands
  no_volume_writes: true
  no_system_config_changes: true

# Monitoring & Logging
monitoring:
  enabled: true
  log_all_queries: true
  alert_on_failure: true
  health_check_interval: 60  # seconds

# Security
security:
  api_key_required: true
  rate_limit: 1000  # requests per hour
  ip_whitelist: ["127.0.0.1", "::1"]  # localhost only
  tls_verify: true
```

### Step 2: Create Agent API Endpoint (Local)
File: `scripts/orca-agent-server.py`

```python
#!/usr/bin/env python3
"""
Orca Agent Server - Enables direct access from code.getupsoft.com
Runs on localhost:8000 as secure tunnel
"""

from flask import Flask, request, jsonify
import docker
import requests
import os
from functools import wraps

app = Flask(__name__)
API_KEY = os.getenv('ORCA_AGENT_API_KEY', 'your-secure-key-here')

# Initialize Docker client
docker_client = docker.from_env()

def require_api_key(f):
    """Verify API key in requests"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        key = request.headers.get('X-API-Key')
        if key != API_KEY:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated_function

# ============================================
# DOCKER OPERATIONS
# ============================================

@app.route('/api/docker/containers', methods=['GET'])
@require_api_key
def list_containers():
    """List all Docker containers"""
    try:
        containers = docker_client.containers.list(all=True)
        return jsonify({
            'containers': [
                {
                    'id': c.id[:12],
                    'name': c.name,
                    'status': c.status,
                    'image': c.image.tags[0] if c.image.tags else 'unknown'
                }
                for c in containers
            ]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/docker/containers/<container_id>/logs', methods=['GET'])
@require_api_key
def get_container_logs(container_id):
    """Get logs from a specific container"""
    try:
        container = docker_client.containers.get(container_id)
        logs = container.logs(tail=100).decode('utf-8')
        return jsonify({'logs': logs})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/docker/containers/<container_id>/stats', methods=['GET'])
@require_api_key
def get_container_stats(container_id):
    """Get container stats (CPU, memory, etc.)"""
    try:
        container = docker_client.containers.get(container_id)
        stats = container.stats(stream=False)
        return jsonify({
            'container': container_id,
            'status': container.status,
            'stats': stats
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================
# ODOO RPC OPERATIONS
# ============================================

@app.route('/api/odoo/modules', methods=['GET'])
@require_api_key
def get_odoo_modules():
    """List installed modules in Odoo"""
    try:
        response = requests.post(
            'http://localhost:8069/json/2/ir.module.module/search',
            json={"params": {"filter": [["state", "=", "installed"]]}},
            headers={"Content-Type": "application/json"}
        )
        modules = response.json()
        return jsonify({
            'count': len(modules),
            'modules': modules,
            'orca_modules': [m for m in modules if 'orca' in m.lower()]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/odoo/orca-logs', methods=['GET'])
@require_api_key
def get_orca_logs():
    """Get recent ORCA audit logs from all modules"""
    try:
        response = requests.post(
            'http://localhost:8069/json/2/account_extended.orca.log/search_read',
            json={"params": {"order": "id DESC", "limit": 50}},
            headers={"Content-Type": "application/json"}
        )
        logs = response.json()
        return jsonify({
            'count': len(logs),
            'recent_logs': logs[:10]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================
# WORKFLOW OPERATIONS
# ============================================

@app.route('/api/workflows/trigger', methods=['POST'])
@require_api_key
def trigger_workflow():
    """Trigger an n8n workflow"""
    data = request.json
    webhook_url = data.get('webhook_url')
    payload = data.get('payload', {})
    
    try:
        response = requests.post(webhook_url, json=payload)
        return jsonify({
            'status': 'triggered',
            'response': response.text
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================
# HEALTH & STATUS
# ============================================

@app.route('/api/health', methods=['GET'])
@require_api_key
def health_check():
    """Check health of all lab endpoints"""
    endpoints = {
        'odoo': {'url': 'http://localhost:8069', 'status': 'checking'},
        'n8n': {'url': 'http://localhost:5678', 'status': 'checking'},
        'workflow_editor': {'url': 'http://localhost:3000', 'status': 'checking'},
    }
    
    for name, endpoint in endpoints.items():
        try:
            resp = requests.head(endpoint['url'], timeout=5)
            endpoint['status'] = f"OK ({resp.status_code})"
        except:
            endpoint['status'] = "DOWN"
    
    return jsonify({
        'orca_agent': 'running',
        'endpoints': endpoints,
        'docker': 'available' if docker_client else 'unavailable'
    })

@app.route('/api/agent/info', methods=['GET'])
@require_api_key
def agent_info():
    """Get Orca Agent information"""
    return jsonify({
        'name': 'GetUpSoft Orca Agent',
        'version': '1.0.0',
        'machine': 'GetUpSoft-PC',
        'user': 'yoeli',
        'capabilities': [
            'docker_monitoring',
            'odoo_rpc',
            'workflow_triggers',
            'lms_queries',
            'orca_audit_logs'
        ],
        'status': 'active'
    })

if __name__ == '__main__':
    # Run on localhost:8000
    app.run(host='127.0.0.1', port=8000, debug=False)
```

### Step 3: Start Orca Agent Server

**Create startup script:**
File: `scripts/start-orca-agent.sh` (Linux/Mac) or `.ps1` (Windows)

**For Windows PowerShell:**
```powershell
# File: scripts/start-orca-agent.ps1

# Install dependencies
pip install flask docker requests

# Set API key (use a strong key)
$env:ORCA_AGENT_API_KEY = "your-super-secret-key-12345"

# Start server
python scripts/orca-agent-server.py

# Expected output:
# * Running on http://127.0.0.1:8000
# * WARNING: This is a development server. Do not use it in production!
```

**Run it:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser
.\scripts\start-orca-agent.ps1
```

**For Linux/Mac:**
```bash
# File: scripts/start-orca-agent.sh
#!/bin/bash

export ORCA_AGENT_API_KEY="your-super-secret-key-12345"
python3 scripts/orca-agent-server.py
```

---

## 🔐 SECURITY SETUP

### API Key Management

**Store API key securely:**

1. **Option A: Environment Variable (Easy)**
   ```bash
   # Add to .env.local (NOT committed to git)
   ORCA_AGENT_API_KEY=your-secure-key
   ```

2. **Option B: Vault (Recommended)**
   ```bash
   # In code.getupsoft.com:
   Settings → Vault → Add Secret
   Name: ORCA_AGENT_API_KEY
   Value: [your-secure-key]
   ```

3. **Option C: Docker Secret (Advanced)**
   ```yaml
   # In docker-compose.yml
   secrets:
     orca_agent_key:
       file: ./secrets/orca_agent_key.txt
   ```

### Network Security

**Orca Agent server runs on localhost:8000 (NOT exposed to internet)**

```bash
# Verify it's only accessible locally
curl http://localhost:8000/api/health \
  -H "X-API-Key: your-key"

# Should work from localhost
# Should NOT work from remote
```

---

## 🚀 INTEGRATION: code.getupsoft.com → Orca Agent

**In code.getupsoft.com, agent can now do:**

```python
# 1. Check Docker containers
import requests
response = requests.get(
    'http://localhost:8000/api/docker/containers',
    headers={'X-API-Key': api_key}
)
containers = response.json()
print(f"✅ Found {len(containers)} containers")

# 2. Verify Odoo modules
response = requests.get(
    'http://localhost:8000/api/odoo/modules',
    headers={'X-API-Key': api_key}
)
modules = response.json()
print(f"✅ {modules['count']} modules installed")
print(f"✅ {len(modules['orca_modules'])} ORCA modules")

# 3. Get ORCA audit logs
response = requests.get(
    'http://localhost:8000/api/odoo/orca-logs',
    headers={'X-API-Key': api_key}
)
logs = response.json()
print(f"✅ Recent logs: {logs}")

# 4. Health check all labs
response = requests.get(
    'http://localhost:8000/api/health',
    headers={'X-API-Key': api_key}
)
health = response.json()
for endpoint, status in health['endpoints'].items():
    print(f"  {endpoint}: {status['status']}")
```

---

## ✅ VERIFICATION CHECKLIST

After setup, verify:

```bash
# 1. Server is running
curl http://localhost:8000/api/agent/info \
  -H "X-API-Key: your-key"
# Expected: {"name": "GetUpSoft Orca Agent", ...}

# 2. Can see Docker
curl http://localhost:8000/api/docker/containers \
  -H "X-API-Key: your-key"
# Expected: list of containers

# 3. Can access Odoo
curl http://localhost:8000/api/odoo/modules \
  -H "X-API-Key: your-key"
# Expected: {"count": 46, "modules": [...]}

# 4. Can see health status
curl http://localhost:8000/api/health \
  -H "X-API-Key: your-key"
# Expected: all endpoints "OK"
```

---

## 📊 WHAT ORCA AGENT CAN NOW DO

| Operation | Method | Result |
|-----------|--------|--------|
| List Docker containers | `GET /api/docker/containers` | ✅ See all running services |
| Get container logs | `GET /api/docker/containers/<id>/logs` | ✅ Debug containers |
| Monitor Odoo modules | `GET /api/odoo/modules` | ✅ Verify 46 modules installed |
| Check ORCA logs | `GET /api/odoo/orca-logs` | ✅ See audit trail |
| Trigger workflows | `POST /api/workflows/trigger` | ✅ Run automations |
| Health check | `GET /api/health` | ✅ Verify all labs online |
| Agent info | `GET /api/agent/info` | ✅ Confirm agent running |

---

## 🎯 DAILY WORKFLOW

### Morning
```bash
# 1. Start Docker labs
docker-compose up -d

# 2. Start Orca Agent server
./scripts/start-orca-agent.ps1  # or .sh

# Expected:
# ✅ Docker running
# ✅ Odoo v19 online
# ✅ n8n ready
# ✅ Orca Agent listening on :8000
```

### During Day
```
code.getupsoft.com:
├─ Orca Agent connects to localhost:8000
├─ Gets Docker status
├─ Verifies 46 ORCA modules
├─ Monitors audit logs
├─ Triggers workflows
└─ Updates documentation
```

### Evening
```bash
# 1. Stop Orca Agent
Ctrl+C

# 2. Stop Docker labs
docker-compose down
```

---

## 🔒 RESTRICTIONS (For Safety)

**Orca Agent CANNOT:**
- ❌ Write to volumes
- ❌ Execute arbitrary commands in containers
- ❌ Modify Docker configs
- ❌ Edit system files
- ❌ Access private keys
- ❌ Execute privileged operations

**Orca Agent CAN ONLY:**
- ✅ Read Docker metadata
- ✅ Read container logs
- ✅ Query Odoo via RPC
- ✅ Trigger webhooks
- ✅ Query LLM endpoints
- ✅ Monitor health

---

## 📝 CONFIGURATION FILE

**Save as: `.claude/orca-agent-config.json`**

```json
{
  "orca_agent": {
    "enabled": true,
    "server": "http://localhost:8000",
    "api_key_env": "ORCA_AGENT_API_KEY",
    "timeout": 30,
    "retry_count": 3
  },
  "endpoints": {
    "docker": {
      "enabled": true,
      "socket": "/var/run/docker.sock"
    },
    "odoo": {
      "enabled": true,
      "url": "http://localhost:8069",
      "database": "odoo19_orca"
    },
    "n8n": {
      "enabled": true,
      "url": "http://localhost:5678"
    },
    "workflow_editor": {
      "enabled": true,
      "url": "http://localhost:3000"
    },
    "nvidia_api": {
      "enabled": true,
      "url": "https://integrate.api.nvidia.com/v1"
    }
  },
  "monitoring": {
    "health_check_interval": 60,
    "log_level": "INFO",
    "alerts_enabled": true
  }
}
```

---

## 🚀 READY TO ENABLE

**Orca Agent is now configured for:**
- ✅ Direct access to local Docker
- ✅ Direct access to Odoo v19 lab
- ✅ Visibility of all running services
- ✅ Monitoring of ORCA audit logs
- ✅ Workflow automation triggers
- ✅ LLM querying

**Next steps:**
1. Choose API key and set in `.env.local` or Vault
2. Run `./scripts/start-orca-agent.ps1`
3. Open code.getupsoft.com
4. Agent automatically connects and starts monitoring

🤖 **Orca Agent ready to work!**
