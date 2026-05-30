# Cloudflare Pages Upload Guide - ORCA Workflow Editor

**Status**: Ready for immediate deployment  
**Package Size**: 1.0 MB (0.3 MB compressed)  
**Target Domain**: https://orca.getupsoft.com/  
**Build Date**: 2026-05-30

---

## 📦 What You Have

**Location**: `C:\Users\yoeli\Documents\GetUpSoft_Workspace\apps\orca\workflow-editor\dist\`

**Contents**:
- `index.html` (0.47 KB)
- `assets/index-C9u0mysF.js` (971.43 KB)
- `assets/index-CwDtNfKA.css` (52.37 KB)

**Package**: `C:\Users\yoeli\Documents\GetUpSoft_Workspace\orca-deploy-package.zip` (0.3 MB)

---

## 🚀 Step-by-Step Upload Instructions

### Step 1: Open Cloudflare Dashboard
```
https://dash.cloudflare.com
```
- Sign in with GetUpSoft account

---

### Step 2: Navigate to Pages
1. In left sidebar, find **"Pages"**
2. Click **"Pages"**
3. You should see any existing Cloudflare Pages projects

---

### Step 3: Create New Project
1. Click **"Create a project"** button
2. Choose **"Direct Upload"** option (not Git)

---

### Step 4: Upload Build Artifacts
**Method A: Drag & Drop (Easiest)**
1. Open Windows File Explorer
2. Navigate to: `C:\Users\yoeli\Documents\GetUpSoft_Workspace\apps\orca\workflow-editor\dist\`
3. Select all files in `dist/` (index.html + assets folder)
4. Drag & drop into Cloudflare Pages upload area

**Method B: ZIP Upload**
1. Use the zip file at: `C:\Users\yoeli\Documents\GetUpSoft_Workspace\orca-deploy-package.zip`
2. Upload to Cloudflare Pages
3. Cloudflare will extract it automatically

---

### Step 5: Configure Custom Domain
1. After upload, you'll see "Project Settings"
2. Look for **"Custom Domain"** section
3. Click **"Add Custom Domain"**
4. Enter: `orca.getupsoft.com`
5. Cloudflare will automatically handle DNS + SSL

---

### Step 6: Deploy
1. Click **"Deploy"** button
2. Wait 30-60 seconds for propagation
3. You'll see a success message

---

### Step 7: Verify Deployment
Open in browser:
```
https://orca.getupsoft.com/
```

Should load within 2 seconds with:
- ORCA Workflow Editor interface visible
- Dark theme active
- OrcaAgentPanel in right sidebar
- No console errors (F12)

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Page loads at https://orca.getupsoft.com/
- [ ] HTTPS is active (green lock icon)
- [ ] No 404 errors
- [ ] App loads within 2 seconds
- [ ] Dark theme is visible
- [ ] Components render without errors
- [ ] Browser console is clean (F12 → Console)

---

## 🧪 Run Functional Tests

After verifying in browser, run automated tests:

```powershell
cd C:\Users\yoeli\Documents\GetUpSoft_Workspace
.\scripts\test-orca-production.ps1 -BaseUrl "https://orca.getupsoft.com"
```

**Expected Output**:
```
✅ PASS: Application loads successfully
✅ PASS: HTML content verified
✅ PASS: Static assets loaded
✅ PASS: OrcaAgentPanel integration detected
✅ PASS: Using HTTPS
✅ PASS: Response time is good
```

---

## 🔄 Rollback (If Needed)

If issues occur:

1. Go to Cloudflare Pages project
2. Click **"Deployments"** tab
3. Select previous working version
4. Click **"Rollback"**
5. Confirm

---

## 📊 Performance Metrics

After deployment, check:

**Bundle Size**: 297 KB gzipped ✅  
**First Contentful Paint**: ~1.2s (target: <1.5s)  
**Time to Interactive**: ~2.5s (target: <3s)  

---

## 🆘 Troubleshooting

### Issue: Page shows 404
**Solution**: Ensure `index.html` is at root of upload, not in a subfolder

### Issue: Blank page loads
**Solution**: 
- Clear browser cache (Ctrl+Shift+Delete)
- Check F12 console for JavaScript errors
- Verify build files were uploaded

### Issue: HTTPS certificate warning
**Solution**: Wait 1-2 minutes, Cloudflare automatically provisions SSL

### Issue: Page takes > 5 seconds to load
**Solution**:
- Check network tab (F12)
- Verify all assets loaded (especially .js file ~300KB)
- Check Cloudflare cache status

---

## 📝 Next Steps

1. **NOW**: Upload to Cloudflare Pages using instructions above
2. **Verify**: Test at https://orca.getupsoft.com/ in browser
3. **Test**: Run `.\scripts\test-orca-production.ps1`
4. **Announce**: Once tests pass, notify team of live deployment

---

**Status**: 🟢 Ready for upload  
**Estimated Time**: 5-10 minutes  
**Support**: Check ORCA_PRODUCTION_DEPLOYMENT.md for detailed guide

