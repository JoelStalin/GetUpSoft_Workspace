# 🚀 Orca Agent Gateway - Quick Start Guide

**Date:** 2026-05-28  
**Status:** PHASE 1 COMPLETE - Ready for Setup  
**What This Does:** Makes your local lab accessible from code.getupsoft.com via Cloudflare  

---

## ⚡ 5-Minute Setup

### Prerequisites
You need 3 things from Cloudflare:
1. **API Token** — From Cloudflare Dashboard → Profile → API Tokens
2. **Account ID** — From Cloudflare Dashboard → Account home (right column)
3. **Zone ID** — From Cloudflare Dashboard → Domain → Right sidebar

### Step 1: Gather Cloudflare Credentials (2 minutes)

**Go to:** https://dash.cloudflare.com

**Get API Token:**
1. Click Profile (top right)
2. Go to API Tokens
3. Click "Create Token"
4. Select "Edit Cloudflare Workers" template
5. Create and copy the token (you'll need it)

**Get Account ID:**
1. From dashboard home
2. Look at right sidebar
3. Copy "Account ID"

**Get Zone ID:**
1. Click on your domain
2. Look at right sidebar under API
3. Copy "Zone ID"

### Step 2: Run Bootstrap with Gateway Setup (3 minutes)

```powershell
# Open PowerShell as Administrator
cd C:\Users\yoeli\Documents\GetUpSoft_Workspace

# Run bootstrap script
.\scripts\bootstrap-orca-agent.ps1

# Follow prompts:
# 1. Enter root password (8+ chars)
# 2. Confirm password
# [API Key is generated automatically]
# 3. When asked "Setup Cloudflare gateway now?", type: y
# 4. When asked "Do you have Cloudflare credentials ready?", type: y
# 5. Paste the 3 credentials you gathered
# [Autonomous setup starts - takes ~50 seconds]
```

### Step 3: What Happens Automatically

```
CloudflareConnector runs:
  ✅ Detects cloudflared (installs if missing)
  ✅ Creates tunnel: getupsoft-lab-tunnel
  ✅ Configures routes:
     • orca-agent.getupsoft.com → localhost:8000
     • odoo-lab.getupsoft.com → localhost:8069
     • n8n-lab.getupsoft.com → localhost:5678
     • editor-lab.getupsoft.com → localhost:3000
  ✅ Fixes WARP Split Tunnel:
     • Removes 192.168.0.0/16 (too broad)
     • Adds 192.168.1.0/24 (specific)
  ✅ Verifies connectivity
  ✅ Saves credentials

Result: code.getupsoft.com CAN NOW ACCESS YOUR LOCAL LAB
```

---

## 🎯 After Setup

### Verify Gateway is Working

```powershell
# Start Docker labs
docker-compose up -d

# Wait for Odoo to initialize (5 minutes)
docker logs -f odoo19_orca | grep Ready

# Set API key
$env:ORCA_AGENT_API_KEY = "orca-agent-key-XXXXX"  # From bootstrap output

# Start Orca Agent
.\scripts\start-orca-agent.ps1

# In another terminal, test the gateway
curl https://orca-agent.getupsoft.com/api/health
# Expected: {"status": "ok", "services": [...]}

curl https://odoo-lab.getupsoft.com
# Expected: Odoo login page
```

### Access from code.getupsoft.com

Now anyone with the API key can:
```
GET https://orca-agent.getupsoft.com/api/status
GET https://odoo-lab.getupsoft.com/web
GET https://n8n-lab.getupsoft.com/editor
GET https://editor-lab.getupsoft.com
```

---

## 📋 What Gets Created

### Files Created by Bootstrap

```
.claude/
  ├── orca-agent-config.json       (API key & root credentials)
  └── cloudflare-config.json       (Cloudflare API credentials)
```

**Important:** These files are git-ignored and secure. Keep them safe!

---

## ⚠️ Troubleshooting

### "cloudflared not found"
→ Bootstrap will auto-install it. Just wait.

### "Cloudflare API error"
→ Check:
- API Token is valid (hasn't expired)
- Account ID is correct (from dashboard)
- Zone ID is correct (from domain dashboard)

### "WARP rules not updated"
→ WARP must be installed. Install from:
https://one.dash.cloudflare.com/

### "Gateway not accessible from code.getupsoft.com"
→ Check:
1. Tunnel is running: `cloudflared tunnel list`
2. Routes are configured: Check Cloudflare Dashboard → DNS
3. WARP is connected: Check system tray

---

## 🔄 Manual Setup (if automatic fails)

If bootstrap has issues, run manually:

```powershell
# Check cloudflared
python scripts/cloudflare_connector.py --check-cloudflared

# Check WARP
python scripts/cloudflare_connector.py --check-warp

# List tunnels
python scripts/cloudflare_connector.py --list-tunnels

# Run full setup with debug
python scripts/cloudflare_connector.py --setup | ConvertFrom-Json | Format-List
```

---

## 🔐 Security Notes

- ✅ API tokens stored in `.claude/` (git-ignored)
- ✅ Credentials are NEVER logged
- ✅ WARP narrows access to specific subnet (192.168.1.0/24)
- ✅ Tunnel routes only expose specific ports
- ✅ Each service requires API key authentication

---

## 📚 Next Steps

1. **Run Bootstrap** → Creates credentials & gateway
2. **Start Docker** → `docker-compose up -d`
3. **Start Orca Agent** → `.\scripts\start-orca-agent.ps1`
4. **Test Gateway** → Run triangular tests
5. **Deploy** → Use gateway URLs from code.getupsoft.com

---

## 🆘 Need Help?

- **Bootstrap issues?** → Check `bootstrap-orca-agent.ps1` output
- **Cloudflare issues?** → See ORCA_AGENT_AUTONOMOUS_SETUP.md
- **Gateway issues?** → See ORCA_AGENT_LOCAL_ACCESS.md
- **General?** → See AGENT_REMOTE_LABS_ARCHITECTURE.md

---

**Status:** ✅ Ready to deploy  
**Time to setup:** ~5 minutes (plus docker initialization)  
**Result:** Secure gateway to local lab from code.getupsoft.com  

🚀 **Let's connect your lab to the cloud!**
