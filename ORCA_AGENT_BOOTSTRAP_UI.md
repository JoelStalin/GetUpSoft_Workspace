# 🎛️ Orca Agent Bootstrap & Credentials UI

**Purpose:** Auto-bootstrap Orca Agent and provide web UI for credential management  
**Status:** Architecture & Implementation Plan  
**Date:** 2026-05-28  

---

## 🎯 REQUIREMENTS

User Request:
- ✅ GetUpSoft Orca Agent must have auto-bootstrap
- ✅ When connected, show UI layout in ORCA dashboard
- ✅ Configure credentials via web interface
- ✅ Default login: root user

---

## 🏗️ ARCHITECTURE

```
Orca Agent Bootstrap Flow:

1. Start Agent
   ↓
2. Check Configuration
   ├─ Config exists? → Skip to step 4
   └─ No config? → Go to step 3
   ↓
3. Bootstrap Mode
   ├─ Generate temp credentials
   ├─ Start config UI at http://localhost:8000/bootstrap
   ├─ User sets root password
   ├─ Save config to file
   └─ Restart agent
   ↓
4. Normal Mode
   ├─ API Server running
   ├─ ORCA Dashboard integration ready
   └─ Accept authenticated requests
   ↓
5. ORCA Dashboard
   ├─ Show Agent Status Panel
   ├─ Configure Credentials Form
   ├─ Test Endpoints Button
   └─ Monitor Health
```

---

## 📋 COMPONENTS TO CREATE

### 1. Bootstrap Server (Enhanced orca-agent-server.py)
```python
# Add bootstrap routes:
@app.route('/bootstrap', methods=['GET', 'POST'])
def bootstrap():
    """Initial setup UI for first-time configuration"""
    if request.method == 'GET':
        # Return HTML form for credentials setup
        return render_template('bootstrap.html')
    
    if request.method == 'POST':
        # Save credentials
        password = request.json.get('password')
        save_credentials(password)
        return {'status': 'configured'}

@app.route('/api/bootstrap/status', methods=['GET'])
def bootstrap_status():
    """Check if agent is configured"""
    if is_configured():
        return {'bootstrapped': True, 'status': 'ready'}
    else:
        return {'bootstrapped': False, 'status': 'needs_config'}
```

### 2. Bootstrap HTML UI
```html
<!-- templates/bootstrap.html -->
<!DOCTYPE html>
<html>
<head>
    <title>GetUpSoft Orca Agent - Setup</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI"; }
        .container { max-width: 500px; margin: 100px auto; }
        .form-group { margin: 20px 0; }
        input { width: 100%; padding: 10px; font-size: 16px; }
        button { width: 100%; padding: 12px; background: #007AFF; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 Orca Agent Setup</h1>
        <form id="setupForm">
            <div class="form-group">
                <label>Root Password</label>
                <input type="password" id="password" placeholder="Enter root password" required>
            </div>
            <div class="form-group">
                <label>Confirm Password</label>
                <input type="password" id="confirm" placeholder="Confirm password" required>
            </div>
            <button type="submit">Complete Setup</button>
        </form>
    </div>
</body>
</html>
```

### 3. ORCA Dashboard Component (React)
```typescript
// apps/orca/components/OrcaAgentPanel.tsx

import React, { useState, useEffect } from 'react';

export const OrcaAgentPanel: React.FC = () => {
  const [agentStatus, setAgentStatus] = useState('disconnected');
  const [showCredentialForm, setShowCredentialForm] = useState(false);
  const [credentials, setCredentials] = useState({
    username: 'root',
    password: '',
    apiKey: ''
  });

  useEffect(() => {
    // Check agent status on mount
    checkAgentStatus();
  }, []);

  const checkAgentStatus = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/agent/info', {
        headers: { 'X-API-Key': credentials.apiKey || 'default' }
      });
      
      if (res.ok) {
        setAgentStatus('connected');
      } else {
        setAgentStatus('auth_failed');
      }
    } catch {
      setAgentStatus('disconnected');
    }
  };

  const handleSaveCredentials = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/credentials/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': credentials.apiKey
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password
        })
      });

      if (res.ok) {
        alert('✅ Credentials saved');
        setShowCredentialForm(false);
        checkAgentStatus();
      }
    } catch (e) {
      alert('❌ Failed to save: ' + e.message);
    }
  };

  return (
    <div className="orca-agent-panel">
      <h2>🤖 Orca Agent Control</h2>
      
      {/* Status Indicator */}
      <div className="status-indicator">
        <span className={`dot ${agentStatus}`}></span>
        <span>{agentStatus.toUpperCase()}</span>
      </div>

      {/* Credential Management */}
      <div className="credentials-section">
        <button onClick={() => setShowCredentialForm(!showCredentialForm)}>
          ⚙️ Configure Credentials
        </button>

        {showCredentialForm && (
          <form className="credential-form">
            <label>Username</label>
            <input 
              type="text" 
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
            />

            <label>Password</label>
            <input 
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              placeholder="Enter password"
            />

            <label>API Key</label>
            <input 
              type="password"
              value={credentials.apiKey}
              onChange={(e) => setCredentials({...credentials, apiKey: e.target.value})}
              placeholder="Enter API key"
            />

            <button type="button" onClick={handleSaveCredentials}>
              Save Credentials
            </button>
          </form>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button onClick={checkAgentStatus}>🔄 Refresh Status</button>
        <button onClick={() => window.open('http://localhost:8069', '_blank')}>
          🐳 Open Odoo Lab
        </button>
        <button onClick={() => window.open('http://localhost:8000/api/health', '_blank')}>
          🏥 Health Check
        </button>
      </div>
    </div>
  );
};
```

### 4. Enhanced Bootstrap Script (PowerShell)
```powershell
# scripts/bootstrap-orca-agent.ps1

param(
    [string]$RootPassword = ""
)

Write-Host "🤖 GetUpSoft Orca Agent Bootstrap" -ForegroundColor Cyan
Write-Host ""

# Check if already configured
$configPath = ".\.claude\orca-agent-config.json"

if (Test-Path $configPath) {
    Write-Host "✅ Agent already configured" -ForegroundColor Green
    Write-Host "To reconfigure, delete: $configPath" -ForegroundColor Gray
    exit 0
}

# Get root password
if (-not $RootPassword) {
    $secure = Read-Host "Enter root password (will be hashed)" -AsSecureString
    $RootPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($secure)
    )
}

# Generate API key
$ApiKey = "orca-key-$(Get-Random -Minimum 100000000 -Maximum 999999999)"

# Create configuration
$config = @{
    bootstrapped = $true
    root_user = "root"
    api_key = $ApiKey
    created_at = (Get-Date).ToString("o")
    version = "1.0.0"
}

# Save configuration
New-Item -ItemType Directory -Path ".\.claude" -Force | Out-Null
$config | ConvertTo-Json | Set-Content $configPath

Write-Host ""
Write-Host "✅ Bootstrap configuration saved" -ForegroundColor Green
Write-Host ""
Write-Host "API Key: $ApiKey" -ForegroundColor Yellow
Write-Host "⚠️  Save this API key - you'll need it!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Set environment variable:"
Write-Host "   `$env:ORCA_AGENT_API_KEY = '$ApiKey'" -ForegroundColor Gray
Write-Host "2. Start agent:"
Write-Host "   .\scripts\start-orca-agent.ps1" -ForegroundColor Gray
Write-Host "3. Open ORCA dashboard:"
Write-Host "   http://localhost:3000" -ForegroundColor Gray
Write-Host ""
