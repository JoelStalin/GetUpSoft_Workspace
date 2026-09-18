# Quartz Publishing Pipeline

## Overview

This document describes how to build, validate, and publish Obsidian notes to the web using Quartz static site generator.

## Architecture

```
Obsidian Vault (/public)
        ↓
    Validation
    ├─ check-private-notes
    ├─ No TOKEN=, API_KEY=, PASSWORD=
    ├─ No marked as draft/private
    └─ No in blocked folders
        ↓
    Sync to Quartz
    └─ scripts/sync-vault-to-quartz.js
        ↓
    Build HTML
    └─ Quartz build
        ↓
    GitHub Actions (optional)
    ├─ On push to main
    ├─ Run validation
    ├─ Build Quartz
    └─ Deploy
        ↓
    Web Hosting
    ├─ GitHub Pages (free)
    ├─ Cloudflare Pages (free)
    ├─ Vercel (free tier)
    └─ Netlify (free tier)
        ↓
    https://your-domain.com/notes
```

## Manual Publishing (Local)

### Step 1: Prepare Notes

Create notes in `obsidian/vault/public/`:
```
obsidian/vault/public/
├── Architecture/
│   ├── System-Design.md
│   └── API-Overview.md
├── Guides/
│   ├── Getting-Started.md
│   └── Best-Practices.md
└── FAQ.md
```

### Step 2: Validate (Check for Private Content)

```bash
npm run notes:check
# OR
node scripts/check-private-notes.js
```

**Success Output:**
```
[✓] ALL CLEAR - SAFE TO PUBLISH
    No private content detected in public vault
    Ready to run: npm run notes:build
```

**Failure Output:**
```
[ERROR] PRIVATE CONTENT DETECTED
    Cannot publish! Remove private content before publishing

    Issues found:
      📄 Guides/Internal-Process.md
         Reason: Contains private keywords
         Line 5: TOKEN=...
```

**Fix and Retry:**
```bash
# 1. Move to private folder
mv obsidian/vault/public/Guides/Internal-Process.md obsidian/vault/private/

# 2. Re-check
npm run notes:check

# 3. Proceed when clear
```

### Step 3: Sync to Quartz

```bash
npm run notes:sync
# OR
node scripts/sync-vault-to-quartz.js
```

**Output:**
```
[INFO] OBSIDIAN → QUARTZ SYNC
Source: obsidian/vault/public
Destination: quartz/content

Copying files:
✓ Architecture/System-Design.md (markdown)
✓ Architecture/API-Overview.md (markdown)
✓ Guides/Getting-Started.md (markdown)
✓ Guides/Best-Practices.md (markdown)
✓ FAQ.md (markdown)

[✓] SYNC RESULTS
Total files:       5
Copied:           5
  - Markdown:    5
  - Other:       0
Destination ready for Quartz build: quartz/content
```

### Step 4: Build Quartz

```bash
npm run notes:build
# OR (in quartz directory)
cd quartz && npm run build
```

**Output:**
```
Building Quartz...
✓ Compiled 5 notes
✓ Generated 5 HTML files
✓ Created search index
✓ Built sitemap

Build time: 2.3s
Output: quartz/public/
```

### Step 5: Preview Locally

```bash
npm run notes:preview
# OR (in quartz directory)
cd quartz && npm run preview

# Opens: http://localhost:3000
```

Visit browser to preview. Check:
- [ ] Notes appear correctly
- [ ] Links work
- [ ] Layout looks good
- [ ] No broken images
- [ ] Search works

### Step 6: Deploy

**Option A: GitHub Pages**

```bash
# Push to GitHub
git add quartz/public/
git commit -m "docs: publish quartz site"
git push origin main

# Enable GitHub Pages in repository settings:
# Settings → Pages → Source: gh-pages branch
# (Or configure GitHub Actions workflow)
```

**Option B: Cloudflare Pages**

```bash
# (Requires Cloudflare account)

# 1. Connect repo: https://dash.cloudflare.com/pages
# 2. Select repository and branch (main)
# 3. Set build command: npm run build
# 4. Set build folder: quartz/public/
# 5. Deploy automatically on push
```

**Option C: Vercel**

```bash
# (Requires Vercel account)

# 1. Connect via vercel.com/import
# 2. Select repository
# 3. Framework: Other
# 4. Build: npm run build
# 5. Output: quartz/public/
# 6. Deploy
```

**Option D: Netlify**

```bash
# (Requires Netlify account)

# 1. Connect via netlify.com
# 2. Select repository
# 3. Build command: npm run build
# 4. Publish directory: quartz/public/
# 5. Deploy
```

## Automated Publishing (GitHub Actions)

### Setup

Create `.github/workflows/notes-publish.yml`:

```yaml
name: Publish Notes (Quartz)

on:
  push:
    branches: [main]
    paths:
      - 'obsidian/vault/public/**'
      - 'scripts/check-private-notes.js'
      - 'scripts/sync-vault-to-quartz.js'
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Check for private content
        run: npm run notes:check
        # Fails if private content detected

      - name: Sync vault to Quartz
        run: npm run notes:sync

      - name: Build Quartz
        run: |
          cd quartz && npm install && npm run build

      - name: Upload to GitHub Pages
        uses: actions/upload-pages-artifact@v2
        with:
          path: quartz/public

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

### Trigger Publishing

Push to main branch:
```bash
git add obsidian/vault/public/
git commit -m "docs: update published notes"
git push origin main
```

GitHub Actions automatically:
1. Checks out code
2. Validates for private content
3. Syncs to Quartz
4. Builds HTML
5. Deploys to GitHub Pages
6. Shows deployment URL

Monitor at: `https://github.com/yourname/repo/actions`

## Configuration

### Quartz Config

Edit `quartz/quartz.config.ts`:

```typescript
const config: QuartzConfig = {
  configuration: {
    pageTitle: "GetUpSoft Notes",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "google",
      tagId: "G-XXXXX",
    },
    locale: "en-US",
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModified(),
      Plugin.Latex({ renderEngine: "katex" }),
      Plugin.SyntaxHighlighting(),
      Plugin.ObsidianFlavoredMarkdown(),
    ],
    filters: [],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.NotFoundPage(),
      Plugin.Assets(),
    ],
  },
}
```

### Front Matter Template

Add to notes for consistency:

```markdown
---
title: "Note Title"
description: "Brief description for search"
date: 2026-05-22
tags:
  - architecture
  - guide
publish: true
---

# Note Title

Content here...
```

**Fields:**
- `title`: Display title
- `description`: Search description
- `date`: Created date
- `tags`: For categorization
- `publish`: Must be `true` to include

## Privacy Validation Details

The `check-private-notes.js` script blocks publishing if it finds:

### Blocked Keywords (Case-insensitive)
```
PRIVATE, SECRET, TOKEN=, API_KEY=, PASSWORD=,
COUCHDB_PASSWORD, ADMIN_PASSWORD, internal:,
draft:, publish: false, secret:
```

### Blocked File Patterns
```
*.env, *credentials*, *secret*, *password*, *token*, */private/*
```

### Blocked Folder Names
```
private, secrets, drafts, .env
```

### Blocked File Extensions
```
.pem, .key, .p12, .pfx, .jks
```

**Example Blocking:**

❌ These files block publishing:
```
obsidian/vault/public/.env.local
obsidian/vault/public/API_KEYS.md
obsidian/vault/public/credentials.json
obsidian/vault/public/secret-keys.pem
Lines containing: TOKEN=abc123
```

✅ These are OK:
```
obsidian/vault/public/Architecture/Authentication-Tokens.md
(File name OK, must check content)
(If content has TOKEN= it will be caught)
```

## Troubleshooting

### "PRIVATE CONTENT DETECTED"

**Issue:** Publishing blocked due to private keywords

**Solution:**
1. Review flagged files
2. Check content for keywords
3. Move sensitive content to `/private/` folder
4. Or mark note as `publish: false`
5. Re-run: `npm run notes:check`

### Sync Failed

**Issue:** `sync-vault-to-quartz.js` errors

**Solution:**
```bash
# Verify source exists
ls obsidian/vault/public/

# Verify destination writable
mkdir -p quartz/content

# Run dry-run to see what would happen
DRY_RUN=true npm run notes:sync

# Try again
npm run notes:sync
```

### Build Fails

**Issue:** Quartz build errors

**Solution:**
```bash
# Check Quartz config
cd quartz && npm run validate

# Check for invalid markdown
npm run notes:check

# Rebuild
npm run notes:build
```

### Deployment Doesn't Update

**Issue:** Website shows old content

**Solution:**
1. Hard refresh browser: `Ctrl+Shift+R`
2. Clear browser cache
3. Check GitHub Actions for errors
4. Verify new files in `quartz/public/`
5. Re-deploy manually if needed

## Content Guidelines

### Good Public Notes
- Architecture decisions
- Team best practices
- API documentation
- Configuration examples (with dummy values)
- Process documentation
- Knowledge base articles

### Never Publish
- Internal secrets
- API keys, tokens, passwords
- Employee personal information
- Draft or incomplete ideas
- Sensitive business decisions
- Security vulnerabilities (unpatched)

### Before Publishing
1. Remove ALL real credentials
2. Remove internal-only information
3. Check code examples for secrets
4. Review links (no internal URLs)
5. Spell check
6. Peer review (recommended)

## Next Steps

1. [ ] Create first note in `obsidian/vault/public/`
2. [ ] Run: `npm run notes:check`
3. [ ] Run: `npm run notes:sync`
4. [ ] Run: `npm run notes:build`
5. [ ] Preview: `npm run notes:preview`
6. [ ] Deploy manually or via GitHub Actions
7. [ ] Share public URL
8. [ ] Monitor analytics (if configured)

---

**Last Updated:** 2026-05-22  
**Status:** Ready for deployment  
**Maintained by:** DevOps Team
