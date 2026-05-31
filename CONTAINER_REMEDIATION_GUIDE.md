# 🔧 Orca Container Remediation Guide

**Date**: 2026-05-29  
**Issue**: ModuleNotFoundError: No module named 'ai_automation_orchestrator.tinder_dashboard_section'  
**Status**: BLOCKED - Requires Manual Intervention

---

## 🎯 Problem Statement

The Orca Docker container fails to start during application initialization:

```
File: /usr/local/lib/python3.11/site-packages/ai_automation_orchestrator/webapp.py:44
Error: from ai_automation_orchestrator.tinder_dashboard_section import get_tinder_dashboard_html
ModuleNotFoundError: No module named 'ai_automation_orchestrator.tinder_dashboard_section'
```

**Root Cause**: The `ai_automation_orchestrator` package is trying to import a module that doesn't exist.

---

## 🔍 Investigation Steps

### Step 1: Locate the Problem File
```bash
docker exec orca cat /usr/local/lib/python3.11/site-packages/ai_automation_orchestrator/webapp.py | head -50
```

### Step 2: Check What Module Exists
```bash
docker exec orca ls -la /usr/local/lib/python3.11/site-packages/ai_automation_orchestrator/
```

### Step 3: Verify the Import Path
```bash
docker exec orca python3 -c "from ai_automation_orchestrator import tinder_dashboard_section" 2>&1
```

---

## 🛠️ Solution Options

### **Option A: Remove the Problematic Import (RECOMMENDED)**

**If the module is not needed:**

1. **Edit the Dockerfile**:
   ```dockerfile
   # Find the line that imports webapp.py and comment it out or modify it
   # In Dockerfile, around line 50-60, look for:
   # FROM python:3.11-slim
   # ...
   # RUN pip install ai_automation_orchestrator
   ```

2. **Fix the webapp.py file**:
   ```python
   # In webapp.py line 44, either:
   # Option 1: Comment out the import
   # from ai_automation_orchestrator.tinder_dashboard_section import get_tinder_dashboard_html
   
   # Option 2: Make it optional
   try:
       from ai_automation_orchestrator.tinder_dashboard_section import get_tinder_dashboard_html
   except ImportError:
       get_tinder_dashboard_html = None
   ```

3. **Rebuild the container**:
   ```bash
   cd apps/orca/deploy
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

### **Option B: Install Missing Module**

**If the module should exist:**

1. **Check pip packages**:
   ```bash
   pip search tinder-dashboard-section
   # or
   pip index versions tinder-dashboard-section
   ```

2. **Add to Dockerfile**:
   ```dockerfile
   RUN pip install tinder-dashboard-section
   # or
   RUN pip install git+https://github.com/yourrepo/tinder-dashboard-section.git
   ```

3. **Rebuild**:
   ```bash
   cd apps/orca/deploy
   docker-compose build --no-cache
   docker-compose up -d
   ```

### **Option C: Create the Missing Module**

**If the module should be created locally:**

1. **Create the file**:
   ```bash
   mkdir -p apps/orca/tinder_dashboard_section
   touch apps/orca/tinder_dashboard_section/__init__.py
   ```

2. **Implement the required function**:
   ```python
   # apps/orca/tinder_dashboard_section/__init__.py
   def get_tinder_dashboard_html():
       """Return HTML for tinder dashboard"""
       return """<div id="tinder-dashboard">Welcome to Orca Dashboard</div>"""
   ```

3. **Update Dockerfile**:
   ```dockerfile
   COPY apps/orca /app
   ```

---

## ✅ Verification Steps

After applying any of the above solutions:

1. **Rebuild and start**:
   ```bash
   cd apps/orca/deploy
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

2. **Check container logs**:
   ```bash
   docker-compose logs app --tail 50
   ```

3. **Test health endpoint**:
   ```bash
   curl http://localhost:8000/api/health
   ```
   Should return `200 OK` instead of connection error

4. **Run functional tests**:
   ```powershell
   cd C:\Users\yoeli\Documents\GetUpSoft_Workspace
   & ".\scripts\functional-tests-orca.ps1"
   ```

---

## 🚀 Success Criteria

✅ Container starts without ModuleNotFoundError  
✅ Health endpoint responds with 200 OK  
✅ Functional tests return at least 3/6 PASS  
✅ Docker logs show no "Traceback" errors  

---

## 📝 Reference Files

- **Container logs**: `docker-compose logs app`
- **Dockerfile**: `apps/orca/Dockerfile`
- **docker-compose config**: `apps/orca/deploy/docker-compose.yml`
- **Test suite**: `scripts/functional-tests-orca.ps1`
- **Deployment report**: `SESSION_14_DEPLOYMENT_REPORT.md`

---

## 🆘 If Still Stuck

1. Check the exact version of `ai_automation_orchestrator` in pip freeze
2. Look for similar issues in the ORCA repo GitHub issues
3. Consider using a Python virtual environment to test locally
4. Check if there's a requirements.txt or setup.py with the full dependency list

---

**Last Updated**: 2026-05-29  
**Status**: Awaiting User Action  
**Estimated Fix Time**: 15-30 minutes (depending on option chosen)
