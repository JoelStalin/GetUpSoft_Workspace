# 🚀 ORCA Workflow Editor - Production Deployment Guide

**Date**: 2026-05-29 (Session 14)  
**Target Domain**: https://orca.getupsoft.com/  
**Build Status**: ✅ READY  
**Status**: Ready for production deployment

---

## 📦 Build Information

**Latest Build**:
- ✅ Successfully compiled
- Bundle size: ~297 KB (gzip)
- Uncompressed: ~1.0 MB
- Files:
  - `index.html` (0.48 KB)
  - `index-[hash].js` (971.43 KB uncompressed)
  - `index-[hash].css` (52.37 KB)

**Build Location**: `apps/orca/workflow-editor/dist/`

**Compilation Time**: 29.49 seconds

---

## 🎯 What's Included

### Features:
✅ ORCA Workflow Editor (complete)  
✅ OrcaAgentPanel for API key management  
✅ Cloudflare Tunnel integration  
✅ All Phases 1-10 features  
✅ Real-time collaboration support  
✅ Dark mode and responsive design  

### Components:
- Workflow canvas with node editing
- Component library panel
- Properties inspector
- Workflow version management
- Analytics dashboard
- Chat assistant panel
- ORCA Agent panel (NEW)

---

## 🌐 Deployment Methods

### **Method 1: Cloudflare Pages (RECOMMENDED)**

**Advantages:**:
- ✅ Free HTTPS/TLS
- ✅ Global CDN
- ✅ Automatic deployments
- ✅ Easy rollbacks
- ✅ Built-in security

**Steps**:

1. **Create Cloudflare Pages Project**
   - Login to https://dash.cloudflare.com
   - Select GetUpSoft account
   - Go to **Pages** → **Create a project**
   - Choose **Direct Upload**

2. **Upload Build Artifacts**
   - Drag & drop the `dist/` folder
   - Or use the upload interface
   - Cloudflare will automatically assign a URL

3. **Configure Custom Domain**
   - In Pages project settings
   - Domain: **orca.getupsoft.com**
   - Cloudflare manages DNS and SSL automatically

4. **Deploy**
   - Click "Deploy"
   - Wait ~30 seconds for propagation
   - Access at https://orca.getupsoft.com

**Verification**:
```bash
# Test the deployment
curl https://orca.getupsoft.com/
# Should return HTML with React root element
```

---

### **Method 2: Static File Server (SCP/SFTP)**

**Prerequisites**:
- SSH access to production server
- `/var/www/orca.getupsoft.com/` directory
- HTTPS/SSL already configured

**Steps**:

1. **Copy files to server**:
   ```bash
   scp -r apps/orca/workflow-editor/dist/* \
       user@orca.getupsoft.com:/var/www/orca.getupsoft.com/html/
   ```

2. **Verify permissions**:
   ```bash
   ssh user@orca.getupsoft.com
   ls -la /var/www/orca.getupsoft.com/html/
   # Should see: index.html, assets/
   ```

3. **Check web server**:
   ```bash
   curl https://orca.getupsoft.com/
   ```

---

### **Method 3: Docker Container**

**Advantages**:
- Isolated environment
- Easy version management
- Scalable

**Steps**:

1. **Create Dockerfile**:
   ```dockerfile
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html/
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Build image**:
   ```bash
   docker build -t orca-editor:latest .
   ```

3. **Run container**:
   ```bash
   docker run -d \
     --name orca-editor \
     -p 80:80 \
     -p 443:443 \
     -e DOMAIN=orca.getupsoft.com \
     orca-editor:latest
   ```

4. **Access**:
   ```
   https://orca.getupsoft.com/
   ```

---

## ✅ Post-Deployment Checklist

After deploying, verify:

- [ ] **Access**: https://orca.getupsoft.com/ loads
- [ ] **HTTPS**: Certificate is valid
- [ ] **Load Time**: < 2 seconds
- [ ] **Functionality**: Can create new workflow
- [ ] **OrcaAgentPanel**: Visible in workflow mode
- [ ] **Performance**: No console errors (F12)
- [ ] **Mobile**: Responsive on mobile device
- [ ] **Cache**: Static assets cached properly

---

## 🧪 Functional Tests

**Run automated tests**:

```powershell
# Test production deployment
.\scripts\test-orca-production.ps1 -BaseUrl "https://orca.getupsoft.com"

# Expected output:
# ✅ PASS: Application loads successfully
# ✅ PASS: HTML content verified
# ✅ PASS: Static assets loaded
# ✅ PASS: OrcaAgentPanel integration detected
# ✅ PASS: Using HTTPS
# ✅ PASS: Response time is good
```

**Manual testing**:

1. **Open the application**:
   - Navigate to https://orca.getupsoft.com/
   - Should load within 2 seconds

2. **Create a new workflow**:
   - Click "+ New Workflow"
   - Add components from library
   - Connect nodes
   - Save workflow

3. **Test OrcaAgentPanel**:
   - Switch to "Workflow" mode
   - Look for "ORCA Agent" panel
   - Verify API key generation works
   - Check agent status

4. **Test AI Features**:
   - Generate workflow from prompt
   - Modify workflow with AI
   - Preview workflow
   - Deploy workflow

5. **Performance**:
   - Open Chrome DevTools (F12)
   - Check Network tab
   - Verify bundle loads (should be ~300KB gzipped)
   - Check Console for errors (should be clean)

---

## 🔧 Troubleshooting

### Issue: Page not found (404)
**Solution**: Ensure `index.html` is at root of deployment directory

### Issue: Blank page
**Solution**: 
- Check browser console for errors (F12)
- Clear browser cache
- Verify JavaScript bundle loaded

### Issue: API key panel not showing
**Solution**:
- Switch to "Workflow" mode (top menu)
- Check if OrcaAgentPanel component compiled

### Issue: Slow loading (> 5 seconds)
**Solution**:
- Check network in DevTools
- Enable gzip compression on server
- Clear CloudFlare cache (if using Cloudflare)

### Issue: HTTPS certificate error
**Solution**:
- If using Cloudflare: Automatically managed
- If using self-signed: Check certificate validity
- Verify domain DNS points to server

---

## 📊 Performance Metrics

**Expected Performance**:
- First Contentful Paint (FCP): < 1.5 seconds
- Largest Contentful Paint (LCP): < 2.8 seconds
- Time to Interactive (TTI): < 3 seconds
- Bundle size (gzipped): ~297 KB

**Monitor with**:
- Chrome DevTools (F12 → Performance)
- Cloudflare Analytics (if using Pages)
- Google PageSpeed Insights

---

## 🔄 Rollback Procedure

If issues occur after deployment:

### Cloudflare Pages:
1. Go to Pages project
2. Click "Deployments" tab
3. Select previous working version
4. Click "Rollback to this deployment"
5. Confirm

### Manual Server:
1. Keep previous build backed up
2. Restore from backup: `cp -r backup/dist/* /var/www/orca.getupsoft.com/html/`
3. Verify at https://orca.getupsoft.com/

### Docker:
```bash
# Rollback to previous image
docker stop orca-editor
docker rm orca-editor
docker run -d --name orca-editor orca-editor:previous
```

---

## 📝 Environment Configuration

**Production environment variables** (if needed):
```bash
NODE_ENV=production
API_URL=https://api.getupsoft.com
ODOO_URL=https://odoo.getupsoft.com
ORCA_AGENT_URL=https://orca-agent.getupsoft.com
```

---

## 🎉 Success Criteria

Deployment is successful when:

✅ Application loads at https://orca.getupsoft.com/  
✅ HTTPS certificate is valid  
✅ All functional tests pass  
✅ Response time < 2 seconds  
✅ OrcaAgentPanel is visible  
✅ No console errors  
✅ Mobile view works correctly  
✅ Workflows can be created/edited  

---

## 📞 Support

**If issues occur**:
1. Check troubleshooting section above
2. Review functional test output
3. Check browser console (F12)
4. Check deployment logs
5. Rollback if necessary (see above)

---

**Status**: 🟢 **READY FOR PRODUCTION**  
**Last Updated**: 2026-05-29  
**Next Steps**: Choose deployment method and deploy to orca.getupsoft.com
