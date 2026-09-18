# 🚀 Orca Agent - Quick Start (3 Steps)

**Goal:** Enable GetUpSoft Orca Agent to see local Docker, Odoo labs, and execute queries  
**Time:** 5 minutes  
**Status:** Ready to deploy  

---

## ⚡ QUICK START (Do This Now)

### Step 1: Start Docker Labs (Your PC)
```powershell
cd C:\Users\yoeli\Documents\GetUpSoft_Workspace

# Start all services
docker-compose up -d

# Wait 5 minutes
docker logs -f odoo19_orca | grep "Waiting for connections"
```

**Expected:** Odoo running at http://localhost:8069

### Step 2: Start Orca Agent Server (Your PC)
```powershell
# Install dependencies (one time)
pip install flask docker requests

# Set API key (choose a strong key)
$env:ORCA_AGENT_API_KEY = "your-super-secret-key-12345"

# Start server
.\scripts\start-orca-agent.ps1
```

**Expected:**
```
🤖 GetUpSoft Orca Agent Server Starting...
✅ Listening on http://localhost:8000
✅ Docker: Available
✅ Available endpoints: 11
```

### Step 3: Test from code.getupsoft.com
```bash
# In code.getupsoft.com terminal:
curl -H "X-API-Key: your-super-secret-key-12345" \
  http://localhost:8000/api/health

# Expected response:
{
  "orca_agent": "running",
  "docker": "available",
  "endpoints": {
    "odoo_v19": {"status": "OK (200)"},
    "n8n": {"status": "DOWN"},
    "workflow_editor": {"status": "DOWN"}
  }
}
```

---

## 📋 WHAT YOU NOW HAVE

| Component | Location | Purpose |
|-----------|----------|---------|
| **Orca Agent Server** | localhost:8000 | Secure API gateway to Docker/Odoo |
| **Docker Access** | /api/docker/* | See containers, logs, stats |
| **Odoo Access** | /api/odoo/* | Query modules, audit logs |
| **Workflow Triggers** | /api/workflows/* | Trigger n8n automations |
| **Health Checks** | /api/health | Monitor all endpoints |

---

## 🔌 AGENT CAN NOW DO

```python
# In code.getupsoft.com, agent can do:

import requests
api_key = "your-super-secret-key-12345"

# 1. List Docker containers
resp = requests.get(
    'http://localhost:8000/api/docker/containers',
    headers={'X-API-Key': api_key}
)
containers = resp.json()['containers']
print(f"✅ {len(containers)} containers")

# 2. Check Odoo modules
resp = requests.get(
    'http://localhost:8000/api/odoo/modules',
    headers={'X-API-Key': api_key}
)
orca_modules = resp.json()['orca_modules']
print(f"✅ {len(orca_modules)} ORCA modules installed")

# 3. Get ORCA audit logs
resp = requests.get(
    'http://localhost:8000/api/odoo/orca-logs',
    headers={'X-API-Key': api_key}
)
logs = resp.json()['recent_logs']
print(f"✅ {len(logs)} recent audit logs")

# 4. Monitor health
resp = requests.get(
    'http://localhost:8000/api/health',
    headers={'X-API-Key': api_key}
)
endpoints = resp.json()['endpoints']
for name, ep in endpoints.items():
    print(f"  {name}: {ep['status']}")
```

---

## 🔒 SECURITY

| Aspect | Security |
|--------|----------|
| **API Key** | Required header: `X-API-Key` |
| **Network** | localhost:8000 only (not exposed) |
| **Agent Permissions** | Read-only (no write/exec) |
| **Docker Access** | Read metadata only (no exec) |
| **Credentials** | Never exposed, managed via .env |

---

## 📚 AVAILABLE ENDPOINTS

### Docker
```
GET /api/docker/containers              → List all containers
GET /api/docker/containers/<id>/logs    → Get container logs
GET /api/docker/containers/<id>/stats   → Get container stats
GET /api/docker/networks                → List networks
GET /api/docker/volumes                 → List volumes
```

### Odoo
```
GET /api/odoo/modules                   → List installed modules
GET /api/odoo/orca-logs                 → Get audit logs
GET /api/odoo/health                    → Check Odoo status
```

### Workflows
```
POST /api/workflows/trigger              → Trigger n8n webhook
```

### Status
```
GET /api/health                          → Health check all endpoints
GET /api/agent/info                      → Agent information
GET /api/status                          → Server status
```

---

## 🎯 NEXT STEPS

### Immediate
1. ✅ Run Step 1-3 above
2. ✅ Verify health check passes
3. ✅ Copy API key to code.getupsoft.com Vault

### In code.getupsoft.com
```
Settings → Integrations → Add HTTP
Name: Orca Agent
URL: http://localhost:8000
Auth: API Key Header (X-API-Key)
Key: [your-super-secret-key-12345]
```

### Agent Automation
Agent can now automatically:
- Monitor Docker containers
- Check ORCA module installation
- Verify audit logging works
- Run tests
- Update documentation

---

## ✅ VERIFICATION CHECKLIST

After setup:

- [ ] Docker labs running (`docker ps`)
- [ ] Orca Agent server running (http://localhost:8000)
- [ ] `/api/health` returns all endpoints
- [ ] `/api/docker/containers` shows services
- [ ] `/api/odoo/modules` shows 46+ modules
- [ ] `/api/odoo/orca-logs` shows audit logs
- [ ] API key set in environment
- [ ] API key added to code.getupsoft.com Vault

---

## 🚀 YOU'RE DONE!

Orca Agent now has **direct access to your local environment**.

Next: 
1. Start labs + Orca Agent (3 steps above)
2. Open code.getupsoft.com
3. Agent automatically monitors and verifies everything

🤖 **Full automation ready!**

---

## 📞 TROUBLESHOOTING

### "Cannot connect to Orca Agent"
```bash
# Check if server is running
curl http://localhost:8000/api/status

# If not, start it:
.\scripts\start-orca-agent.ps1
```

### "Unauthorized - Invalid API Key"
```bash
# Verify API key is set
echo $env:ORCA_AGENT_API_KEY

# Set if needed:
$env:ORCA_AGENT_API_KEY = "your-key"
```

### "Cannot connect to Docker"
```bash
# Verify Docker is running
docker ps

# Start Docker Desktop if needed
```

### "Cannot connect to Odoo"
```bash
# Verify Odoo is online
curl -I http://localhost:8069

# If offline, start docker-compose:
docker-compose up -d
```

---

**Time to implement: 5 minutes**  
**Result: Full agent automation** 🎉
