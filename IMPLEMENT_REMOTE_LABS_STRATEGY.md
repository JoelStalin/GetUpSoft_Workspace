# 🚀 Implement Remote Labs Strategy: Step-by-Step

**Goal:** Set up labs locally, connect them to code.getupsoft.com, agent operates ONLY via HTTP/RPC

---

## 📋 PHASE 1: Prepare Local Labs (Done on your PC)

### Step 1.1: Start Odoo v19 Lab
```bash
cd C:\Users\yoeli\Documents\GetUpSoft_Workspace

# Verify Docker is running
docker ps

# Start lab
docker-compose up -d

# Wait 5-8 minutes for Odoo to initialize
docker logs -f odoo19_orca | grep "Waiting for connections"

# Expected output:
# ✅ odoo19_postgres: UP (healthy)
# ✅ odoo19_orca: UP (initializing)
```

**Verify Odoo is online:**
```bash
# Should return HTTP 200
curl -s -I http://localhost:8069 | head -1

# Should show installed modules
curl -X POST http://localhost:8069/json/2/ir.module.module/search \
  -H "Content-Type: application/json" \
  -d '{"params": {}}' | jq length
```

### Step 1.2: Start Other Labs (Optional)
```bash
# If using n8n workflows
docker run -d \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  n8nio/n8n

# If using Workflow Editor locally
cd apps/orca/workflow-editor
npm run dev  # Runs on http://localhost:3000
```

### Step 1.3: Verify All Labs Online
```bash
# Create health check script
# File: check-labs.sh

#!/bin/bash
echo "🔍 Lab Health Check"
echo ""

echo "1️⃣  Odoo v19:"
curl -s -I http://localhost:8069 | head -1

echo ""
echo "2️⃣  n8n (optional):"
curl -s -I http://localhost:5678 | head -1

echo ""
echo "3️⃣  Workflow Editor (optional):"
curl -s -I http://localhost:3000 | head -1

echo ""
echo "4️⃣  NVIDIA API (remote):"
curl -s -H "Authorization: Bearer $NVIDIA_API_KEY" \
  https://integrate.api.nvidia.com/v1/models | jq '.data[0].id' 2>/dev/null || echo "❌ No API key"
```

**Run health check:**
```bash
bash check-labs.sh

# Expected:
# ✅ Odoo v19: HTTP/1.1 200 OK
# ✅ n8n: HTTP/1.1 200 OK
# ✅ Workflow Editor: HTTP/1.1 200 OK
# ✅ NVIDIA: meta/llama-2-7b
```

---

## 🌐 PHASE 2: Configure code.getupsoft.com

### Step 2.1: Open code.getupsoft.com
```
URL: https://code.getupsoft.com
Email: joelstalin2105@gmail.com
Password: [your password]
```

### Step 2.2: Create/Open GetUpSoft_Workspace
```
Projects → New Project
Name: GetUpSoft_Workspace
Repository: C:\Users\yoeli\Documents\GetUpSoft_Workspace
```

### Step 2.3: Configure Lab Endpoints
1. **Settings ⚙️ → Integrations**
2. **Add Integration → Custom HTTP**
3. **Name:** Odoo v19 Lab
4. **URL:** http://localhost:8069
5. **Type:** JSON-RPC
6. **Auth:** Basic (admin/admin)
7. **Test Connection:** ✅ Should succeed

### Step 2.4: Save Lab Configuration
Create file in code.getupsoft.com:
```
File: .claude/lab-config.json

{
  "odoo_v19": {
    "url": "http://localhost:8069",
    "type": "json-rpc",
    "auth": "basic",
    "database": "odoo19_orca",
    "user": "admin"
  },
  "nvidia_api": {
    "url": "https://integrate.api.nvidia.com/v1",
    "type": "bearer_token",
    "key": "[stored in vault]"
  }
}
```

### Step 2.5: Enable Agent Restrictions
```
⚙️ Settings → Agent Restrictions:
  ☑️ No local file edits
  ☑️ No docker commands
  ☑️ No git commits
  ☑️ HTTP connections only
  ☑️ Read-only filesystem
```

---

## 🔌 PHASE 3: Agent Workflow (How Agent Works)

### Example 1: Verify ORCA Modules Installed

**Agent in code.getupsoft.com:**
```python
# Step 1: Connect to Odoo lab
import requests

lab_url = "http://localhost:8069"
response = requests.post(
    f"{lab_url}/json/2/ir.module.module/search",
    json={"params": {"filter": [["name", "ilike", "orca"]]}},
    headers={"Content-Type": "application/json"}
)

modules = response.json()
print(f"✅ Found {len(modules)} ORCA modules installed")

# Step 2: Verify 46 modules
assert len(modules) >= 46, "❌ Not all modules installed"

# Step 3: Report results
print("✅ All 46 ORCA modules verified!")
```

**Agent CANNOT do (blocked):**
```python
# ❌ These are BLOCKED:
os.system("docker exec odoo19_orca ...")  # NO docker
subprocess.run(["git", "commit"])         # NO git
open("file.py", "w").write(code)          # NO local edits
```

### Example 2: Run ORCA Audit Test

**Agent workflow:**
```
1. Connect to Odoo RPC → http://localhost:8069/xmlrpc/2/object
2. Create test invoice → account.move.create({...})
3. Check ORCA log created → account_extended.orca.log.search([...])
4. Verify audit entry → Check before/after values
5. Report results in conversation
6. Update memory with findings
```

**Code example:**
```python
from xmlrpc import client

# Connect to lab
models = client.ServerProxy('http://localhost:8069/xmlrpc/2/object')
uid = 2  # Admin user
db = 'odoo19_orca'
pwd = 'admin'

# Create test invoice
move_id = models.execute_kw(db, uid, pwd, 'account.move', 'create', [{
    'move_type': 'out_invoice',
    'partner_id': 1,
    'state': 'draft'
}])

# Check ORCA log was created
logs = models.execute_kw(db, uid, pwd, 'account_extended.orca.log', 'search', [
    ['record_id', '=', move_id],
    ['action', '=', 'create']
])

if logs:
    print("✅ ORCA audit logging works!")
else:
    print("❌ ORCA logging failed")
```

---

## 📋 PHASE 4: Agent Operations (Allowed)

### Operation 1: Monitor Labs
```bash
# Agent can run (READ-ONLY):
curl -s -I http://localhost:8069         # Health check
curl -s http://localhost:8069/json/2/... # RPC calls
git status                                # Check git status
git log --oneline -5                      # View commits
```

### Operation 2: Connect to NVIDIA LLM
```python
# Agent CAN do this:
import requests

response = requests.post(
    'https://integrate.api.nvidia.com/v1/chat/completions',
    headers={'Authorization': f'Bearer {api_key}'},
    json={
        'model': 'meta/llama-2-70b',
        'messages': [{'role': 'user', 'content': 'Explain ORCA audit logging'}]
    }
)

print(response.json()['choices'][0]['message']['content'])
```

### Operation 3: Trigger Workflows
```bash
# Agent CAN trigger n8n workflows:
curl -X POST http://localhost:5678/webhook/test-workflow \
  -H "Content-Type: application/json" \
  -d '{"action": "verify_orca_modules", "count": 46}'
```

### Operation 4: Write to code.getupsoft.com Git
```bash
# Agent CAN (in code.getupsoft.com environment):
git add documentation/verification-results.md
git commit -m "docs: Verified all 46 ORCA modules installed in lab"
git push origin feature/orca-phase-2-sales
```

---

## ❌ PHASE 5: Blocked Operations

These are **PREVENTED** by agent restrictions:

```bash
# ❌ NO: Local commands
docker ps
docker exec odoo19_orca odoo-bin shell
cd /path && npm install

# ❌ NO: Local edits
nano odoo/modules/account_extended/models/account_move_orca.py
vim .env
gedit docker-compose.yml

# ❌ NO: File system operations
rm -rf node_modules
mkdir -p new/directory
python script.py

# ❌ NO: Local git operations
git commit -m "..."
git push
git checkout feature/branch
```

---

## ✅ PHASE 6: Running Agent Tasks

### Task: Verify ORCA Installation

**In code.getupsoft.com (as agent):**

1. **Load lab config**
   ```python
   import json
   with open('.claude/lab-config.json') as f:
       config = json.load(f)
   ```

2. **Connect to Odoo**
   ```python
   import requests
   odoo_url = config['odoo_v19']['url']
   response = requests.post(f"{odoo_url}/json/2/ir.module.module/search", ...)
   ```

3. **Verify modules**
   ```python
   modules = [m for m in modules if 'orca' in m.lower()]
   assert len(modules) >= 46
   ```

4. **Report results**
   ```
   ✅ Connected to Odoo at http://localhost:8069
   ✅ Found 46 ORCA modules installed
   ✅ Database: odoo19_orca
   ✅ Ready for testing
   ```

5. **Update memory**
   ```
   Save findings to .claude/memory/
   ```

6. **Update PR**
   ```bash
   git commit -m "docs: Verified ORCA lab installation"
   git push
   ```

---

## 🎯 DAILY WORKFLOW

### Morning: Startup
```bash
# 1. Your PC: Start labs
docker-compose up -d
npm run dev  # workflow editor

# 2. code.getupsoft.com: Connect
Login → GetUpSoft_Workspace → Ready
```

### Daytime: Agent Work
```
code.getupsoft.com (Agent):
├─ Connect to labs via HTTP
├─ Run tests/verification
├─ Update code/docs
├─ Commit/push via git
└─ Update memory/timeline
```

### Evening: Shutdown
```bash
# 1. code.getupsoft.com: Final commit
git push origin feature/orca-phase-2-sales

# 2. Your PC: Stop labs
docker-compose down
```

---

## 📊 SUMMARY TABLE

| Task | Agent Can? | How |
|------|-----------|-----|
| Edit code | ✅ | Via code.getupsoft.com git |
| Verify Odoo | ✅ | HTTP RPC to localhost:8069 |
| Run tests | ✅ | npm test in code.getupsoft.com |
| Create PR | ✅ | git commit + gh pr create |
| Restart containers | ❌ | You must run docker-compose |
| Edit .env | ❌ | You must edit locally |
| Install packages | ❌ | Only in code.getupsoft.com npm |
| Call NVIDIA API | ✅ | HTTPS requests with bearer token |
| SSH to servers | ❌ | No SSH shell access |
| Check git status | ✅ | Read-only git commands |

---

## 🚀 START NOW

**Step 1: Your PC (1 command)**
```bash
cd C:\Users\yoeli\Documents\GetUpSoft_Workspace
docker-compose up -d
# Wait 5 min for initialization
```

**Step 2: Browser (3 clicks)**
```
code.getupsoft.com → GetUpSoft_Workspace → Ready
```

**Step 3: Agent Runs Tasks**
```
Agent connects to http://localhost:8069
Verifies all modules
Updates documentation
Creates PR
```

---

**Status:** ✅ Ready to implement  
**Next:** Start labs + open code.getupsoft.com

🔒 Agent operates safely: NO local edits, ONLY HTTP to labs
