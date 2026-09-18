# 🚀 Production Deployment Guide

**Purpose:** Step-by-step guide for deploying the redesigned website to production  
**Status:** Ready for deployment  
**Updated:** 2026-05-19

---

## Pre-Deployment Checklist

### 1. Code Review & Testing

```bash
# Verify clean repo
git status                    # No uncommitted changes
git log --oneline -5          # Review recent commits

# Run build
npm run build                 # Should complete in <15s with no errors

# Check bundle size
# Expected: ~350KB JS, ~8KB CSS (gzipped)
```

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] All features tested locally
- [ ] Mobile responsiveness verified

### 2. Environment Configuration

Prepare all environment variables for production:

```bash
# .env.production (or deploy to secrets manager)

# ERP Configuration
VITE_ERP_TYPE=odoo
VITE_ODOO_HOST=your-odoo.com
VITE_ODOO_PORT=8069
VITE_ODOO_DATABASE=production_db
VITE_ODOO_USERNAME=api_user
VITE_ODOO_PASSWORD=<secure_password>
VITE_AUTO_CONNECT_ERP=true

# Email Configuration
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_SECURE=false
VITE_SMTP_USER=noreply@company.com
VITE_SMTP_PASS=<app_password>
VITE_SMTP_FROM=noreply@company.com

# Feature Flags
VITE_USE_MOCK=false
VITE_USE_MOCK_EMAIL=false
VITE_DISABLE_EMAIL=false
VITE_DISABLE_ERP=false
```

- [ ] Odoo credentials verified and tested
- [ ] SMTP credentials verified (Gmail app password if applicable)
- [ ] All environment variables set
- [ ] Secrets stored securely (never in Git)

### 3. Odoo Instance Preparation

```bash
# Setup Odoo (if not already done)
```

**Prerequisites:**
- [ ] Odoo 14+ installed and running
- [ ] CRM module installed (Settings → Apps → CRM)
- [ ] Helpdesk module installed (Settings → Apps → Helpdesk)
- [ ] XML-RPC API enabled (Settings → Technical → External API)

**Create API User:**
- [ ] User created: Settings → Manage Users
  - Name: "GetUpSoft API"
  - Login: "getupsoft-api"
  - Email: "api@getupsoft.com"
  - Password: Strong password (use in VITE_ODOO_PASSWORD)
  - Groups: 
    - CRM / User: Sales
    - Helpdesk / User: Helpdesk

**Test Connection:**
```bash
# Test with curl (from your terminal)
curl -X POST http://your-odoo.com:8069/jsonrpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
      "service": "common",
      "method": "authenticate",
      "args": ["production_db", "getupsoft-api", "password", {}]
    },
    "id": 1
  }'

# Should return uid (user ID)
```

- [ ] Connection successful
- [ ] Authentication works
- [ ] Can create test leads
- [ ] Can create test tickets

### 4. Email Service Preparation

**Gmail (Recommended):**
- [ ] 2-Step Verification enabled
- [ ] App password generated
- [ ] Test email sending (verify inbox)

**Alternative Services:**
- [ ] SendGrid account created
- [ ] Mailgun account created
- [ ] Custom SMTP server configured

---

## Deployment Steps

### Step 1: Build Production Bundle

```bash
npm run build

# Output:
# dist/
#   index.html
#   assets/
#     index-[hash].css
#     index-[hash].js
```

- [ ] Build completes without errors
- [ ] dist/ folder contains all assets
- [ ] No source files in dist/

### Step 2: Choose Hosting Platform

#### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Follow prompts to set environment variables
```

**Benefits:**
- Zero-config deployment
- Automatic HTTPS
- Global CDN
- Preview deployments
- Edge functions support

**Setup:**
1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy from main branch

#### Option B: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod

# Follow prompts
```

**Benefits:**
- GitHub integration
- Automatic builds
- Serverless functions
- Form handling

#### Option C: Docker + Cloud Run / AWS ECS

**Dockerfile:**
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

```bash
# Build Docker image
docker build -t getupsoft-site:latest .

# Tag for registry
docker tag getupsoft-site:latest gcr.io/project-id/getupsoft-site:latest

# Push to registry
docker push gcr.io/project-id/getupsoft-site:latest

# Deploy to Cloud Run
gcloud run deploy getupsoft-site \
  --image gcr.io/project-id/getupsoft-site:latest \
  --platform managed \
  --region us-central1 \
  --set-env-vars VITE_ODOO_HOST=...,VITE_SMTP_HOST=...
```

**Benefits:**
- Full control over deployment
- Scalable infrastructure
- Container-based isolation
- Multi-region deployment possible

#### Option D: Traditional Web Server (Nginx)

```nginx
# /etc/nginx/sites-available/getupsoft-site

server {
    listen 80;
    server_name getupsoft.com www.getupsoft.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name getupsoft.com www.getupsoft.com;

    ssl_certificate /etc/letsencrypt/live/getupsoft.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/getupsoft.com/privkey.pem;

    root /var/www/getupsoft-site/dist;
    index index.html;

    # Static assets with long cache
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing: serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

```bash
# Setup SSL with Let's Encrypt
sudo certbot certonly --webroot -w /var/www/getupsoft-site -d getupsoft.com -d www.getupsoft.com

# Enable site
sudo ln -s /etc/nginx/sites-available/getupsoft-site /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### Step 3: Set Environment Variables

**Vercel:**
1. Project Settings → Environment Variables
2. Add all VITE_* variables
3. Deploy will use them automatically

**Netlify:**
1. Site settings → Build & deploy → Environment
2. Add environment variables
3. Trigger rebuild

**Docker/Cloud Run:**
```bash
gcloud run deploy ... --set-env-vars KEY=value,KEY2=value2
```

**Nginx/Traditional Server:**
```bash
# Create .env.production file
echo "VITE_ODOO_HOST=your-odoo.com" > /var/www/getupsoft-site/.env.production
echo "VITE_ODOO_PORT=8069" >> /var/www/getupsoft-site/.env.production
# ... add all variables

# Or export as environment variables in systemd service
```

- [ ] All environment variables set
- [ ] Secrets stored securely (not in code)
- [ ] Variables tested before deployment

### Step 4: Test Deployment

```bash
# Visit production URL
https://getupsoft.com/redesign/

# Test each page
- [ ] Home page loads
- [ ] Products page loads
- [ ] Solutions page loads
- [ ] About page loads
- [ ] Contact form loads

# Test forms
- [ ] Contact form validation works
- [ ] Contact form submission works
- [ ] Diagnostic form validation works
- [ ] Diagnostic form submission works
- [ ] Leads created in Odoo
- [ ] Tickets created in Odoo
- [ ] Emails sent to user
- [ ] Language switching works
```

### Step 5: DNS Configuration

```bash
# Point domain to deployment
# Option 1: Vercel
# DNS record: CNAME getupsoft.com → cname.vercel-dns.com

# Option 2: Netlify
# DNS record: CNAME getupsoft.com → your-site.netlify.app

# Option 3: Custom server
# DNS record: A getupsoft.com → your-server-ip

# SSL Certificate
# Automatic with Vercel/Netlify
# Manual with custom server: Use Let's Encrypt

# Wait for DNS propagation (15-30 minutes)
```

- [ ] DNS records created
- [ ] Domain resolves correctly
- [ ] SSL certificate valid
- [ ] HTTPS working

---

## Post-Deployment Verification

### Performance Monitoring

```bash
# Check performance metrics
# Lighthouse: DevTools → Lighthouse → Analyze page load
# Expected: Performance 90+, Accessibility 95+

# Monitor Real User Metrics (RUM)
# Add to index.html:
<script>
  // Web Vitals monitoring (optional)
  web-vital.onLCP(metric => console.log('LCP:', metric.value))
  web-vital.onFID(metric => console.log('FID:', metric.value))
  web-vital.onCLS(metric => console.log('CLS:', metric.value))
</script>
```

### Security Verification

```bash
# Run security scan
# 1. Check SSL certificate: https://www.ssllabs.com/
# 2. Check security headers: https://securityheaders.com/
# 3. Check OWASP: https://owasp.org/

# Expected headers:
# - Content-Security-Policy
# - X-Frame-Options: SAMEORIGIN
# - X-Content-Type-Options: nosniff
# - Strict-Transport-Security (HSTS)
```

- [ ] SSL certificate valid (A+ rating)
- [ ] Security headers present
- [ ] No console errors/warnings
- [ ] No mixed content warnings

### Form Testing

```bash
# Test contact form
1. Visit /redesign/contact
2. Fill with test data
3. Submit form
4. Verify success message with ticket ID
5. Check Odoo for new lead
6. Check Odoo for new ticket
7. Check inbox for confirmation email

# Test diagnostic form
1. Visit /redesign/diagnostic
2. Fill with test data
3. Submit form
4. Verify success message with ticket ID
5. Check Odoo for new opportunity
6. Check Odoo for diagnostic ticket
7. Check inbox for confirmation email
8. Verify priority set based on budget/timeline
```

- [ ] Both forms submit successfully
- [ ] ERP records created correctly
- [ ] Emails delivered
- [ ] All data captured accurately

### Monitoring & Logging

**Setup Error Tracking:**
```bash
# Option 1: Sentry (Recommended)
npm install @sentry/react @sentry/tracing

# In index.html or main.tsx:
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://key@sentry.io/project",
  environment: "production",
  tracesSampleRate: 0.1,
});
```

**Setup Analytics:**
```bash
# Google Analytics
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

- [ ] Error tracking configured
- [ ] Analytics tracking configured
- [ ] Logs accessible and monitored

---

## Monitoring & Maintenance

### Daily Monitoring

```bash
# Check application health
curl https://getupsoft.com/redesign/ -I
# Expected: HTTP 200, Content-Type: text/html

# Check ERP connection
# In browser console at /redesign/contact:
# Should log: [ERP] Using odoo provider
# Or: [ERP] Using MOCK provider

# Monitor error logs
# Check Sentry/LogRocket for new errors
```

**Checklist:**
- [ ] Website responds with 200 status
- [ ] No 5xx errors in logs
- [ ] Forms submitting successfully
- [ ] ERP integration working
- [ ] Emails sending
- [ ] No spike in error rates

### Weekly Maintenance

```bash
# Review metrics
1. Lighthouse score (target: 90+)
2. Error rate (target: < 0.1%)
3. Form submission rate
4. Page load time (target: < 2s)

# Security updates
# Check for npm vulnerabilities:
npm audit

# Update dependencies
npm update --save

# Test thoroughly after updates
npm run build
npm run preview

# Commit and deploy
git commit -m "chore(deps): update dependencies"
git push origin main
```

- [ ] Metrics reviewed
- [ ] Security vulnerabilities addressed
- [ ] Dependencies updated
- [ ] Changes tested before deployment

### Monthly Review

```bash
# Review analytics
- User traffic trends
- Form submission rates
- Geographic distribution
- Device breakdown
- Error patterns

# Review Odoo data
- Leads created
- Conversion rates
- Common pain points
- Industry breakdown

# Plan improvements
- Performance optimizations
- Feature requests
- UX improvements
- Bug fixes
```

- [ ] Analytics reviewed
- [ ] Odoo data analyzed
- [ ] Improvement backlog updated

---

## Rollback Procedure

If deployment has critical issues:

```bash
# Vercel/Netlify
1. Go to deployments dashboard
2. Click "Redeploy" on previous version
3. Verify deployment working

# Docker/Cloud Run
docker pull gcr.io/project-id/getupsoft-site:previous-tag
gcloud run deploy getupsoft-site \
  --image gcr.io/project-id/getupsoft-site:previous-tag

# Nginx
# Revert to previous build
rm -rf /var/www/getupsoft-site/dist
git checkout previous-hash -- dist/
nginx -s reload

# Verify rollback
curl https://getupsoft.com/redesign/ -I
# Check logs for errors
```

---

## Disaster Recovery

### Backup Strategy

```bash
# Database backups (Odoo)
# Automatic daily backups recommended
# Retention: 30 days minimum

# Website backups
# Backup dist/ folder daily
# Keep 7 days of versions

# Environment variable backups
# Store securely in secrets manager
# Never commit to Git
```

### Recovery Procedures

**If Odoo is unavailable:**
```bash
# Website uses MockERPProvider
# 1. Temporarily set VITE_USE_MOCK=true
# 2. Forms will submit to mock ERP
# 3. Data stored in console (can be exported)
# 4. Once Odoo recovered, re-submit forms
```

**If email service is down:**
```bash
# Forms still submit successfully
# 1. Temporarily set VITE_DISABLE_EMAIL=true
# 2. Forms process but don't send emails
# 3. Admin can follow up with users manually
# 4. Once service recovered, send emails
```

---

## Performance Optimization

### Before Going Live

```bash
# Bundle analysis
npm run build
# Check dist/ size is reasonable

# Lighthouse audit
1. Open Chrome DevTools
2. Run Lighthouse audit
3. Target: Performance 90+
4. Address warnings

# Network analysis
1. Open DevTools → Network
2. Load page and forms
3. Check no large assets
4. Check gzipping enabled
```

### Caching Strategy

```
# Static assets (1 year)
/assets/index-[hash].css
/assets/index-[hash].js

# HTML (no cache)
/index.html
/redesign/*

# API responses (no cache)
/api/*
```

---

## Troubleshooting

### Form Submission Fails

```bash
Check:
1. Browser console for errors
2. Network tab for failed requests
3. Odoo connectivity
4. Environment variables set correctly
5. CORS headers (if applicable)
```

### ERP Connection Error

```bash
Verify:
1. Odoo instance is running
2. Host and port are correct
3. Database name is correct
4. API user exists and has permissions
5. Network connectivity
```

### Email Not Sending

```bash
Check:
1. SMTP credentials are correct
2. Gmail app password used (not account password)
3. 2FA enabled (for Gmail)
4. Firewall not blocking port 587
5. Email logs in console/Sentry
```

### Pages Not Loading

```bash
Solutions:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Check nginx/server logs
4. Verify dist/ folder deployed correctly
5. Check DNS resolution
```

---

## Success Criteria

- [ ] Website loads without errors
- [ ] All pages accessible
- [ ] Forms validate correctly
- [ ] Forms submit to ERP successfully
- [ ] Confirmation emails sent
- [ ] Odoo leads and tickets created
- [ ] All languages working
- [ ] Mobile responsive
- [ ] SSL certificate valid
- [ ] No console errors
- [ ] Lighthouse score 90+
- [ ] Error rate < 0.1%
- [ ] Page load < 2s

---

## Support & Escalation

### Escalation Path

1. **Developer**: Check logs, verify configuration
2. **DevOps**: Check server/network health
3. **Odoo Admin**: Verify ERP configuration
4. **Email Admin**: Verify SMTP configuration
5. **On-Call**: Page on-call team for critical issues

### Emergency Contact

- **DevOps Lead**: [Contact info]
- **Odoo Admin**: [Contact info]
- **Email Admin**: [Contact info]
- **On-Call Team**: [Pagerduty link]

---

_Deployment Guide v1.0 · Updated 2026-05-19 · Production-Ready_
