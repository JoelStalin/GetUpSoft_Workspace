# 🔄 Triangular Communication Test

**Purpose:** Verify 3-way communication between:
- 🌐 **Node 1:** code.getupsoft.com (Cloud/External)
- 💻 **Node 2:** PC Local (Orca Agent Server)
- 🐳 **Node 3:** Docker Odoo Lab (localhost:8069)

---

## 🚀 QUICK START (Run Now)

### Step 1: Prepare Environment
```powershell
# Terminal 1: Start Docker labs
cd C:\Users\yoeli\Documents\GetUpSoft_Workspace
docker-compose up -d
# Wait 5 minutes for Odoo to initialize
```

### Step 2: Start Orca Agent
```powershell
# Terminal 2: Set API key and start Orca Agent
$env:ORCA_AGENT_API_KEY = "test-key-12345"
.\scripts\start-orca-agent.ps1

# Expected output:
# 🤖 GetUpSoft Orca Agent Server Starting...
# ✅ Listening on http://localhost:8000
```

### Step 3: Run Triangular Tests
```powershell
# Terminal 3: Run tests
python scripts/test-triangular-communication.py "test-key-12345"

# Or PowerShell version:
.\scripts\test-triangular-communication.ps1 -ApiKey "test-key-12345"
```

---

## 📊 TEST STRUCTURE

### Node 1 → Node 2 (Request)
```
code.getupsoft.com 
    ↓ (curl/requests)
http://localhost:8000/api/...
    ↓
Orca Agent Server
```

### Node 2 → Node 3 (Query)
```
Orca Agent Server
    ↓ (HTTP POST)
http://localhost:8069/json/2/...
    ↓
Odoo v19 RPC
```

### Node 3 → Node 2 → Node 1 (Response)
```
Odoo Database
    ↓ (JSON response)
Orca Agent Server
    ↓ (HTTP 200)
code.getupsoft.com
```

---

## 🧪 INDIVIDUAL TESTS

### Test 1: Orca Agent Online
```
Verifies: Node 1 can reach Node 2
Endpoint: GET /api/agent/info
Expected: {"name": "GetUpSoft Orca Agent", ...}
```

### Test 2: Docker Access
```
Verifies: Node 2 can access Docker
Endpoint: GET /api/docker/containers
Expected: List of containers including odoo19_orca
```

### Test 3: Odoo Health
```
Verifies: Node 2 can reach Node 3
Endpoint: GET /api/odoo/health
Expected: {"odoo_status": "online"}
```

### Test 4: Odoo Modules
```
Verifies: Node 3 returns module list
Endpoint: GET /api/odoo/modules
Expected: {
  "total_count": 46+,
  "orca_count": 20+,
  "modules": [...]
}
```

### Test 5: ORCA Audit Logs
```
Verifies: Node 3 audit logging works
Endpoint: GET /api/odoo/orca-logs
Expected: {"count": N, "recent_logs": [...]}
```

### Test 6: Full Health Check
```
Verifies: All endpoints are accessible
Endpoint: GET /api/health
Expected: {
  "orca_agent": "running",
  "docker": "available",
  "endpoints": {...}
}
```

---

## ✅ SUCCESS CRITERIA

All tests pass if:
- ✅ Orca Agent responds to API calls (Node 1 → Node 2)
- ✅ Docker containers are visible (Node 2 → Docker)
- ✅ Odoo responds to RPC calls (Node 2 → Node 3)
- ✅ 46+ modules installed (Node 3 data)
- ✅ Health checks pass (All nodes)

---

## 📋 EXPECTED OUTPUT

### Python Test Output
```
[HH:MM:SS] ℹ️  TRIANGULAR COMMUNICATION TEST
[HH:MM:SS] ℹ️  Testing: getupsoft.com ↔ PC Local ↔ Docker Odoo
[HH:MM:SS] ℹ️  =====================================

[HH:MM:SS] ✅ Orca Agent Online
[HH:MM:SS] ✅ Docker Access
[HH:MM:SS] ✅ Odoo Health
[HH:MM:SS] ✅ Odoo Modules (46 total, 20 ORCA)
[HH:MM:SS] ✅ ORCA Audit Logs
[HH:MM:SS] ✅ Full Health Check
[HH:MM:SS] ✅ Bidirectional Flow

[HH:MM:SS] ========== TEST RESULTS ==========
PASSED: 7/7
🎉 ALL TESTS PASSED - Communication triangulation successful!
✅ code.getupsoft.com → PC Local
✅ PC Local → Docker Odoo
✅ Docker Odoo → PC Local → code.getupsoft.com
🚀 System is READY for production use!
```

### PowerShell Test Output
```
╔════════════════════════════════════════════════════════════╗
║   TRIANGULAR COMMUNICATION TEST                           ║
║   Testing: code.getupsoft.com ↔ PC Local ↔ Docker Odoo   ║
╚════════════════════════════════════════════════════════════╝

[Testing: Orca Agent Online]
  ✅ PASSED: Status 200

[Testing: Docker Access]
  ✅ PASSED: Status 200

[Testing: Odoo Health]
  ✅ PASSED: Found odoo_status in response

[Testing: Odoo Modules]
  ✅ PASSED: Found total_count in response

[Testing: ORCA Audit Logs]
  ✅ PASSED: Status 200

[Testing: Full Health Check]
  ✅ PASSED: Found orca_agent in response

╔════════════════════════════════════════════════════════════╗
║ ✅ ALL TESTS PASSED                                       ║
║ 🎉 Communication triangulation successful!               ║
╚════════════════════════════════════════════════════════════╝

Communication verified:
  ✅ code.getupsoft.com → PC Local (Orca Agent)
  ✅ PC Local (Orca Agent) → Docker Odoo Lab
  ✅ Docker Odoo → PC Local → code.getupsoft.com

🚀 System is READY for production!
```

---

## 🔧 TROUBLESHOOTING

### "Cannot connect to Orca Agent"
**Symptom:** First test fails
```
❌ FAILED: Connection refused
```

**Solution:**
```powershell
# Check if Orca Agent is running
curl http://localhost:8000/api/status

# If not, start it:
$env:ORCA_AGENT_API_KEY = "test-key-12345"
.\scripts\start-orca-agent.ps1
```

### "Cannot connect to Odoo"
**Symptom:** Odoo Health test fails
```
❌ FAILED: Odoo offline
```

**Solution:**
```powershell
# Check if Docker labs are running
docker ps | grep odoo

# If not running:
docker-compose up -d

# Wait 5-8 minutes
docker logs -f odoo19_orca | grep "Ready"
```

### "0 modules found"
**Symptom:** Odoo Modules test shows 0
```
⚠️  LOW MODULE COUNT: 0 modules found
```

**Solution:**
```powershell
# Check if Odoo initialization is complete
docker logs odoo19_orca | tail -50

# Wait for "Ready" message, then retry test
```

### "Invalid API Key"
**Symptom:** Every test fails with "Unauthorized"
```
❌ FAILED: Unauthorized - Invalid API Key
```

**Solution:**
```powershell
# Verify API key is set
echo $env:ORCA_AGENT_API_KEY

# Must match between:
# 1. Orca Agent server (env var)
# 2. Test script (parameter)

# Set both to same value:
$env:ORCA_AGENT_API_KEY = "test-key-12345"
.\scripts\test-triangular-communication.ps1 -ApiKey "test-key-12345"
```

### "Connection timeout"
**Symptom:** Tests hang and timeout
```
❌ FAILED: [WinError 10060] A connection attempt failed
```

**Solution:**
```powershell
# Check network connectivity
ping localhost

# Check if services are actually listening
netstat -ano | findstr :8000
netstat -ano | findstr :8069

# Restart services if needed
```

---

## 📈 PERFORMANCE EXPECTATIONS

**Normal test execution time:**
```
Test 1 (Orca Agent):    ~200ms ✅
Test 2 (Docker):        ~300ms ✅
Test 3 (Odoo Health):   ~1000ms ✅
Test 4 (Modules):       ~2000ms ✅
Test 5 (Audit Logs):    ~1500ms ✅
Test 6 (Health Check):  ~1500ms ✅
────────────────────────────
Total: ~7000ms (7 seconds)  ✅
```

**If any test exceeds 10 seconds:** Check network/Docker performance

---

## 🔒 SECURITY VERIFICATION

Tests verify:
- ✅ API Key authentication working
- ✅ localhost:8000 only (no internet exposure)
- ✅ Docker read-only access
- ✅ Odoo RPC connectivity
- ✅ No credentials in responses

---

## 🎯 NEXT STEPS AFTER TESTS PASS

1. **Update code.getupsoft.com**
   - Add Orca Agent integration
   - Configure API key in Vault
   - Test from cloud environment

2. **Run Full Test Suite**
   ```bash
   cd apps/orca/workflow-editor
   npm test
   ```

3. **Deploy to Production**
   - Verify all modules working
   - Check audit logging
   - Create final PR

4. **Monitor System**
   - Watch Odoo logs
   - Monitor agent health
   - Verify continuous operation

---

## 📞 GETTING HELP

If tests fail:

1. **Check logs:**
   ```bash
   docker logs odoo19_orca
   # Look for errors during initialization
   ```

2. **Check Orca Agent logs:**
   ```
   Look at terminal where start-orca-agent.ps1 is running
   ```

3. **Verify endpoints manually:**
   ```powershell
   curl -H "X-API-Key: test-key-12345" http://localhost:8000/api/health
   ```

4. **Consult documentation:**
   - ORCA_AGENT_LOCAL_ACCESS.md
   - AGENT_REMOTE_LABS_ARCHITECTURE.md

---

**Status:** Ready to test  
**Next:** Run the 3 steps above, then execute tests

Good luck! 🚀
