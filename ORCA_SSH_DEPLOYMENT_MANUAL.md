# ORCA Workflow Editor - SSH Deployment Manual

**Date:** 2026-05-22 18:30 UTC  
**Target:** getupsoft-lan (192.168.1.233)  
**Status:** ✅ Production build ready

---

## Quick Start (Recommended Method)

### Step 1: Verify SSH Access
```bash
ssh -v getupsoft-lan "echo 'SSH access OK'"
```

If you see `SSH access OK`, proceed to Step 2.

If you get `Permission denied`, see [SSH Key Troubleshooting](#ssh-key-troubleshooting) below.

---

### Step 2: Create Backup on Remote Server
```bash
ssh getupsoft-lan << 'EOF'
echo "Creating backup..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
if [ -d /home/ubuntu/orca ]; then
  mkdir -p "/home/ubuntu/orca_backup_$TIMESTAMP"
  cp -r /home/ubuntu/orca/* "/home/ubuntu/orca_backup_$TIMESTAMP/" || true
  echo "✅ Backup created: /home/ubuntu/orca_backup_$TIMESTAMP"
else
  echo "📂 /home/ubuntu/orca does not exist (new deployment)"
fi
EOF
```

---

### Step 3: Create Remote Deployment Directory
```bash
ssh getupsoft-lan << 'EOF'
mkdir -p /home/ubuntu/orca
echo "✅ Deployment directory ready"
EOF
```

---

### Step 4: Upload Production Build

#### Option A: Using SCP (Recommended)
```bash
# From your local machine
scp -r apps/orca/workflow-editor/dist/* getupsoft-lan:/home/ubuntu/orca/

echo "✅ Files uploaded"
```

#### Option B: Using Pre-built Archive (If SCP has issues)
```bash
# The archive is already created at:
# apps/orca/workflow-editor/ORCA_workflow-editor_dist_*.zip

# Upload the archive
scp apps/orca/workflow-editor/ORCA_workflow-editor_dist_*.zip getupsoft-lan:/tmp/

# Extract on remote server
ssh getupsoft-lan << 'EOF'
cd /tmp
unzip -o ORCA_workflow-editor_dist_*.zip
cp -r dist/* /home/ubuntu/orca/
rm -rf dist ORCA_workflow-editor_dist_*.zip
echo "✅ Files extracted and deployed"
EOF
```

---

### Step 5: Verify Deployment
```bash
ssh getupsoft-lan << 'EOF'
echo "📁 Deployed files:"
ls -lah /home/ubuntu/orca/ | head -15

echo ""
echo "✅ Verifying index.html..."
if [ -f /home/ubuntu/orca/index.html ]; then
  echo "✅ index.html found"
  echo "📋 Size: $(wc -c < /home/ubuntu/orca/index.html) bytes"
else
  echo "❌ index.html NOT found - deployment failed"
  exit 1
fi

echo ""
echo "✅ Deployment verification complete"
EOF
```

---

### Step 6: Configure Web Server (Nginx)

If not already configured, setup nginx to serve ORCA:

```bash
ssh getupsoft-lan << 'EOF'
sudo tee /etc/nginx/sites-available/orca > /dev/null << NGINX
server {
    listen 80;
    server_name orca.getupsoft.com.do;
    root /home/ubuntu/orca;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css text/javascript application/javascript;
    gzip_min_length 1000;
}
NGINX

# Enable site
sudo ln -sf /etc/nginx/sites-available/orca /etc/nginx/sites-enabled/orca
sudo nginx -t
sudo systemctl reload nginx

echo "✅ Nginx configured"
EOF
```

---

### Step 7: Test Access

```bash
# Test from local machine
curl -I http://getupsoft-lan/orca/

# Or open in browser
# http://getupsoft-lan/orca
```

Expected output:
```
HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: xxxxx
```

---

## ✅ Complete Deployment Checklist

After completing all steps above, verify:

- [ ] SSH access to getupsoft-lan confirmed
- [ ] Backup created (timestamped directory exists)
- [ ] Deployment directory created (/home/ubuntu/orca)
- [ ] All files uploaded via SCP
- [ ] index.html exists and is readable
- [ ] Nginx configured (if needed)
- [ ] HTTP test returns 200 OK
- [ ] Intro animation loads correctly
- [ ] All interactive features respond

---

## SSH Key Troubleshooting

### Issue: "Permission denied (publickey)"

**Root Cause:** SSH key file is corrupted or path is incorrect

**Solution 1: Use System SSH Agent**
```bash
# List available keys
ssh-add -l

# Add the correct key
ssh-add ~/.ssh/id_getupsoft_cloudflare

# Try SSH again
ssh getupsoft-lan "echo 'Connected'"
```

**Solution 2: Specify Key Explicitly**
```bash
# Use explicit key in commands
ssh -i ~/.ssh/github-actions-deploy getupsoft-lan "echo 'Connected'"

# Or for SCP:
scp -i ~/.ssh/github-actions-deploy -r apps/orca/workflow-editor/dist/* getupsoft-lan:/home/ubuntu/orca/
```

**Solution 3: Generate New Key**
```bash
# Generate new SSH key (press Enter for all prompts)
ssh-keygen -t ed25519 -f ~/.ssh/orca_deploy -N ""

# Copy public key to server
ssh-copy-id -i ~/.ssh/orca_deploy.pub -o "User=ubuntu" 192.168.1.233

# Test connection
ssh -i ~/.ssh/orca_deploy ubuntu@192.168.1.233
```

**Solution 4: Password Authentication (Temporary)**
If SSH key issues persist, use password authentication:

```bash
# SSH with password prompt
ssh -o PubkeyAuthentication=no ubuntu@192.168.1.233

# SCP with password
scp -o PubkeyAuthentication=no -r apps/orca/workflow-editor/dist/* ubuntu@192.168.1.233:/home/ubuntu/orca/
```

---

## Rollback Instructions

If deployment needs to be reverted:

```bash
ssh getupsoft-lan << 'EOF'
# List available backups
echo "Available backups:"
ls -d /home/ubuntu/orca_backup_*/ | sort -r

# Restore from most recent backup
BACKUP=$(ls -d /home/ubuntu/orca_backup_*/ | sort -r | head -1)
echo "Restoring from: $BACKUP"

# Clear current deployment
rm -rf /home/ubuntu/orca/*

# Restore backup
cp -r "$BACKUP"/* /home/ubuntu/orca/

echo "✅ Rollback complete"
EOF
```

---

## Deployment Troubleshooting

### Issue: Files not uploading
```bash
# Check SSH connection
ssh getupsoft-lan "df -h /home/ubuntu"

# Check file permissions
ssh getupsoft-lan "ls -la /home/ubuntu/ | grep orca"

# Try with verbose mode
scp -v -r apps/orca/workflow-editor/dist/* getupsoft-lan:/home/ubuntu/orca/
```

### Issue: Nginx returning 404
```bash
# Check nginx configuration
ssh getupsoft-lan "sudo nginx -t"

# Check file ownership
ssh getupsoft-lan "ls -la /home/ubuntu/orca/index.html"

# Check nginx logs
ssh getupsoft-lan "sudo tail -20 /var/log/nginx/error.log"
```

### Issue: Intro animation not loading
- Clear browser cache (Ctrl+Shift+Delete)
- Check developer console for errors (F12 → Console)
- Verify CSS files loaded: DevTools → Network tab → look for CSS with 200 status
- Verify JavaScript loaded: DevTools → Network tab → look for JS files

---

## Performance Verification

After deployment, verify performance:

```bash
# From local machine
curl -w "Time: %{time_total}s\nSize: %{size_download} bytes\n" \
     -o /dev/null \
     http://getupsoft-lan/orca/

# Expected: < 1s for initial load, 500KB+ for full page
```

---

## Post-Deployment Monitoring

Monitor the deployment for issues:

```bash
# Check for errors in logs
ssh getupsoft-lan "sudo tail -f /var/log/nginx/access.log"

# Monitor disk usage
ssh getupsoft-lan "df -h /home/ubuntu/orca"

# Check system resources
ssh getupsoft-lan "free -h && top -bn1 | head -20"
```

---

## Success Indicators

✅ **Deployment is successful when:**
- [x] HTTP 200 response from /orca/
- [x] index.html loads in browser
- [x] Intro animation with gradient displays
- [x] Browser console shows 0 errors
- [x] CSS variables applied (dark mode visible)
- [x] All interactive elements respond to clicks
- [x] Floating windows can be dragged
- [x] localStorage working (DevTools → Application → Storage)

---

## Git Status After Deployment

```bash
# Push commits after successful deployment
git push origin main

# Expected:
# - 34 commits pushed
# - All features documented
# - Full deployment trail in CHANGE_TIMELINE.md
```

---

## Support Contacts

- **SSH Issues:** Check ~/.ssh/config and SSH key permissions
- **Build Issues:** See ORCA_DEPLOYMENT_READY.md
- **Feature Issues:** See ORCA_UI_UX_VALIDATION_REPORT.md
- **Deployment Script:** scripts/deploy-orca-to-getupsoft-lan.sh

---

## Next Steps

1. ✅ Execute deployment steps above
2. ✅ Verify all checklist items
3. ✅ Test features in browser
4. ✅ Push commits to GitHub
5. ✅ Document final deployment time and status
6. ✅ Monitor for issues

---

**Status:** ✅ Ready for deployment  
**Build Date:** 2026-05-22  
**Deployment Version:** 1.0.0 (34 commits)
