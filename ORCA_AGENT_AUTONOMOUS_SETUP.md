# 🤖 GetUpSoft Orca Agent - Autonomous Cloudflare Setup

**Purpose:** Orca Agent automatically handles PC ↔ Cloudflare ↔ Production Server connection  
**Status:** ARCHITECTURE FOR AUTONOMOUS SETUP  
**Date:** 2026-05-28  

---

## 🎯 AUTONOMOUS WORKFLOW

```
User Action: .\scripts\bootstrap-orca-agent.ps1

↓

Orca Agent Auto-Does:
1. ✅ Detect cloudflared installation
2. ✅ Install cloudflared if missing
3. ✅ Create Cloudflare tunnel
4. ✅ Fix WARP Split Tunnel rules
5. ✅ Expose services (Odoo, Agent, n8n)
6. ✅ Verify connectivity
7. ✅ Start services
8. ✅ Run triangular tests
9. ✅ Report all results

Result: System fully connected & tested automatically
```

---

## 🔧 ENHANCED ORCA AGENT ARCHITECTURE

### New Bootstrap Module: `cloudflare_connector.py`

**Functionality:**
```python
class CloudflareConnector:
    """Auto-configure Cloudflare Tunnel + WARP for GetUpSoft infrastructure"""
    
    def __init__(self):
        self.cloudflared_path = None
        self.tunnel_name = "getupsoft-lab-tunnel"
        self.account_id = None
        self.tunnel_token = None
    
    # 1. Detect/Install cloudflared
    def check_cloudflared_installed(self) -> bool
    def install_cloudflared(self) -> bool
    def verify_cloudflared_version(self) -> str
    
    # 2. Create Cloudflare tunnel
    def list_existing_tunnels(self) -> List[Dict]
    def create_tunnel(self) -> str  # Returns tunnel token
    def delete_tunnel(self, tunnel_name: str) -> bool
    
    # 3. Configure tunnel routes (expose services)
    def route_service(self, hostname: str, local_port: int) -> bool
        # E.g., route_service("odoo-lab.getupsoft.com", 8069)
    def list_tunnel_routes(self) -> List[str]
    
    # 4. WARP configuration (Fix Split Tunnel)
    def check_warp_installed(self) -> bool
    def list_split_tunnel_rules(self) -> List[str]
    def remove_split_tunnel_rule(self, cidr: str) -> bool
        # E.g., remove_split_tunnel_rule("192.168.0.0/16")
    def add_split_tunnel_rule(self, cidr: str, mode: str) -> bool
        # E.g., add_split_tunnel_rule("192.168.1.0/24", "include")
    
    # 5. Verify connectivity
    def test_tunnel_connectivity(self, hostname: str) -> (bool, str)
    def test_warp_network_access(self, ip: str) -> bool
    def test_service_accessibility(self, url: str) -> bool
    
    # 6. Generate credentials
    def generate_api_key(self) -> str
    def save_tunnel_credentials(self) -> None
    
    # 7. Full setup (calls all above in order)
    def autonomous_setup(self) -> Dict[str, Any]
```

### New Routes Configuration: `cloudflare_routes.json`

```json
{
  "services": [
    {
      "name": "Orca Agent API",
      "hostname": "orca-agent.getupsoft.com",
      "local_port": 8000,
      "protocol": "http",
      "verify_endpoint": "/api/health"
    },
    {
      "name": "Odoo v19 Lab",
      "hostname": "odoo-lab.getupsoft.com",
      "local_port": 8069,
      "protocol": "http",
      "verify_endpoint": "/"
    },
    {
      "name": "n8n Workflows",
      "hostname": "n8n-lab.getupsoft.com",
      "local_port": 5678,
      "protocol": "http",
      "verify_endpoint": "/api/health"
    },
    {
      "name": "ORCA Workflow Editor",
      "hostname": "editor-lab.getupsoft.com",
      "local_port": 3000,
      "protocol": "http",
      "verify_endpoint": "/api/status"
    }
  ],
  "warp_rules": {
    "remove": ["192.168.0.0/16"],
    "add_include": ["192.168.1.0/24"],
    "add_exclude": []
  }
}
```

---

## 📋 AUTONOMOUS SETUP STEPS

### Step 1: Bootstrap Script Detects & Installs Dependencies
```powershell
# File: scripts/bootstrap-orca-agent.ps1 (ENHANCED)

function Initialize-CloudflareConnector {
    Write-Host "🌐 Initializing Cloudflare Connector..."
    
    # Check cloudflared
    if (-not (Test-Path "cloudflared.exe")) {
        Write-Host "Installing cloudflared..."
        # Download & install cloudflared
        Invoke-WebRequest https://github.com/cloudflare/cloudflared/releases/download/...
    }
    
    # Check WARP
    if (-not (Get-Process warp-svc -ErrorAction SilentlyContinue)) {
        Write-Host "Installing WARP..."
        # Download & install Cloudflare WARP
    }
    
    Write-Host "✅ Dependencies ready"
}
```

### Step 2: Orca Agent Autonomously Creates Tunnel
```python
# File: scripts/orca-agent-server.py (ENHANCED)

from cloudflare_connector import CloudflareConnector

@app.route('/api/bootstrap/cloudflare', methods=['POST'])
def bootstrap_cloudflare():
    """Auto-configure Cloudflare tunnel"""
    connector = CloudflareConnector()
    
    try:
        # Full autonomous setup
        result = connector.autonomous_setup()
        
        return jsonify({
            'status': 'configured',
            'tunnel': result['tunnel_name'],
            'routes': result['routes'],
            'warp_rules': result['warp_rules'],
            'credentials': result['credentials']
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

### Step 3: Start Services With Connectivity
```powershell
# When Orca Agent starts, it automatically:
1. Creates Cloudflare tunnel
2. Routes services through tunnel
3. Fixes WARP Split Tunnel
4. Starts Docker labs
5. Starts Orca Agent server
6. Runs triangular tests
7. Reports all results
```

---

## 🔗 EXPOSED SERVICES (After Autonomous Setup)

| Service | Local Port | Tunnel URL | Production Access |
|---------|-----------|-----------|-------------------|
| **Orca Agent API** | 8000 | orca-agent.getupsoft.com | ✅ code.getupsoft.com → orca-agent.getupsoft.com |
| **Odoo v19 Lab** | 8069 | odoo-lab.getupsoft.com | ✅ code.getupsoft.com → odoo-lab.getupsoft.com |
| **n8n Workflows** | 5678 | n8n-lab.getupsoft.com | ✅ code.getupsoft.com → n8n-lab.getupsoft.com |
| **Workflow Editor** | 3000 | editor-lab.getupsoft.com | ✅ code.getupsoft.com → editor-lab.getupsoft.com |

---

## 🎯 HOW USER INTERACTION WORKS

### Before: Manual steps (5-10 minutes)
```
1. User installs cloudflared manually
2. User creates tunnel manually
3. User configures routes manually
4. User fixes WARP rules manually
5. User starts services manually
6. User runs tests manually
7. User verifies results manually
```

### After: Autonomous (1 command, 2 minutes)
```powershell
# Single command does everything
.\scripts\bootstrap-orca-agent.ps1

# Orca Agent Auto-Does:
✅ Detects/installs cloudflared
✅ Creates tunnel
✅ Configures routes
✅ Fixes WARP rules
✅ Starts services
✅ Runs tests
✅ Reports results

Result: Fully connected system
```

---

## 🚀 EXECUTION FLOW

```
User runs:
  .\scripts\bootstrap-orca-agent.ps1

↓ (30 seconds)

Orca Agent autonomous_setup():
  1. Check cloudflared installed? → Install if needed
  2. Create Cloudflare tunnel (getupsoft-lab-tunnel)
  3. Route services:
     - 8069 → odoo-lab.getupsoft.com
     - 8000 → orca-agent.getupsoft.com
     - 5678 → n8n-lab.getupsoft.com
     - 3000 → editor-lab.getupsoft.com
  4. Fix WARP Split Tunnel:
     - Remove: 192.168.0.0/16
     - Add Include: 192.168.1.0/24
  5. Start Docker: docker-compose up -d
  6. Wait for Odoo (5 min)
  7. Start Orca Agent server
  8. Run triangular tests (7 sec)
  9. Report results

↓

Result:
  ✅ Tunnel running
  ✅ Routes configured
  ✅ WARP fixed
  ✅ Services online
  ✅ Tests passed
  ✅ System ready
```

---

## 📊 CLOUDFLARE API INTEGRATION

### Required Cloudflare Credentials
```json
{
  "cloudflare_api_token": "v1.0c...",  // Read Secret Storage
  "cloudflare_account_id": "abc123...",
  "cloudflare_zone_id": "xyz789..."
}
```

### Tunnel Creation via API
```python
# POST to Cloudflare API
POST /accounts/{account_id}/tunnels

Response:
{
  "id": "tunnel-uuid",
  "name": "getupsoft-lab-tunnel",
  "token": "tunnel-token-xyz...",
  "status": "active"
}
```

### Route Configuration
```python
# POST to Cloudflare API
POST /accounts/{account_id}/tunnels/{tunnel_id}/routes

Routes:
  orca-agent.getupsoft.com → 127.0.0.1:8000
  odoo-lab.getupsoft.com   → 127.0.0.1:8069
  n8n-lab.getupsoft.com    → 127.0.0.1:5678
  editor-lab.getupsoft.com → 127.0.0.1:3000
```

---

## ✅ VERIFICATION STEPS (Automated)

After setup, Orca Agent auto-verifies:

```python
def verify_full_connectivity():
    checks = {
        'cloudflared_running': check_cloudflared_process(),
        'tunnel_active': check_tunnel_status(),
        'routes_configured': verify_all_routes(),
        'warp_rules_fixed': check_warp_rules(),
        'docker_services': verify_docker_services(),
        'orca_agent_online': test_service('http://localhost:8000/api/health'),
        'odoo_online': test_service('http://localhost:8069'),
        'triangular_tests': run_triangular_tests()
    }
    
    return {
        'all_checks_passed': all(checks.values()),
        'details': checks
    }
```

---

## 🎓 USER EXPERIENCE

### What User Sees:
```
$ .\scripts\bootstrap-orca-agent.ps1

🤖 GetUpSoft Orca Agent - Autonomous Setup
═══════════════════════════════════════════════════════════

Step 1: Checking cloudflared...
  ✅ cloudflared already installed (v2024.05.1)

Step 2: Creating Cloudflare tunnel...
  ✅ Tunnel created: getupsoft-lab-tunnel (ID: abc123...)

Step 3: Configuring routes...
  ✅ odoo-lab.getupsoft.com → localhost:8069
  ✅ orca-agent.getupsoft.com → localhost:8000
  ✅ n8n-lab.getupsoft.com → localhost:5678
  ✅ editor-lab.getupsoft.com → localhost:3000

Step 4: Fixing WARP Split Tunnel...
  ✅ Removed: 192.168.0.0/16
  ✅ Added Include: 192.168.1.0/24

Step 5: Starting Docker services...
  ✅ odoo19_postgres is up
  ✅ odoo19_orca is initializing... (waiting 5 min)

Step 6: Starting Orca Agent server...
  ✅ Listening on http://localhost:8000

Step 7: Running triangular tests...
  ✅ Test 1: Orca Agent Online          → PASSED
  ✅ Test 2: Docker Access              → PASSED
  ✅ Test 3: Odoo Health                → PASSED
  ✅ Test 4: Odoo Modules               → PASSED (46/46)
  ✅ Test 5: ORCA Audit Logs            → PASSED
  ✅ Test 6: Full Health Check          → PASSED
  ✅ Test 7: Bidirectional Flow         → PASSED

═══════════════════════════════════════════════════════════
✅ SETUP COMPLETE

System is fully connected:
  • Cloudflare Tunnel: ACTIVE
  • Local services: ONLINE
  • code.getupsoft.com: CAN ACCESS ALL SERVICES
  • Triangular tests: 7/7 PASSED

Your credentials have been saved to:
  .\.claude\orca-agent-config.json
  .\.claude\cloudflare-tunnel.json

Next step: code.getupsoft.com is now connected to your local lab!
```

---

## 🔒 SECURITY CONSIDERATIONS

1. **API Token Storage**
   - Never hardcoded in scripts
   - Stored in `.claude/` directory (git-ignored)
   - Read from Cloudflare environment variable

2. **Tunnel Token Security**
   - Generated by Cloudflare API
   - Stored securely
   - Only agent server reads it

3. **WARP Rules**
   - Narrows to 192.168.1.0/24 (specific subnet only)
   - Removes broad 192.168.0.0/16 (prevents accidents)

4. **Service Isolation**
   - Each service behind tunnel
   - Only specific ports exposed
   - Health checks verify authenticity

---

## 📋 IMPLEMENTATION ROADMAP

### Phase 1: Enhanced Orca Agent (This)
- [ ] Create `cloudflare_connector.py` module
- [ ] Add Cloudflare API integration
- [ ] Add cloudflared detection/install
- [ ] Add WARP configuration
- [ ] Add route management
- [ ] Add verification tests

### Phase 2: Bootstrap Script Enhancement
- [ ] Modify `bootstrap-orca-agent.ps1` to call Orca Agent
- [ ] Add user feedback/progress reporting
- [ ] Add error handling & recovery

### Phase 3: Production Integration
- [ ] Code.getupsoft.com uses tunnel URLs
- [ ] Update all service endpoints
- [ ] Verify production ↔ local connectivity

---

**Status:** ARCHITECTURE READY FOR IMPLEMENTATION

Next: Implement enhanced Orca Agent with autonomous Cloudflare setup

This makes the user experience **completely automatic** - just one command and everything connects!
