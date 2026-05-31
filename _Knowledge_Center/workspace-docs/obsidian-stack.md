# Obsidian Self-Hosted Stack Architecture

## Overview

GetUpSoft Workspace integrates a self-hosted note-taking and publishing stack:

```
Obsidian (Desktop/Mobile)
    ↓
    ├→ LiveSync Plugin
    │   ↓
    └→ CouchDB (Self-Hosted)
        ↓
        ├→ Sync to other devices
        │
        └→ Backup to Git
            ↓
            Quartz (Static Site Generator)
            ↓
            GitHub Pages / Cloudflare Pages / Netlify
```

## Components

### 1. Obsidian (Note-Taking App)

**What it is:**
- Local-first markdown note-taking app
- Runs on Desktop, Mobile (iOS/Android)
- All notes stored locally until explicitly synced

**Why it's used:**
- Privacy: notes stay on your device by default
- Powerful: wiki-links, backlinks, plugins ecosystem
- Free or $50/year (no online requirement)

**Setup:**
1. Download from https://obsidian.md
2. Open vault: `File → Open vault → obsidian/vault`
3. Install plugins: Community Plugins search → install needed ones

### 2. LiveSync Plugin

**What it is:**
- Obsidian community plugin for real-time vault sync
- Syncs vault to CouchDB instance
- Bi-directional: desktop ↔ mobile ↔ CouchDB

**Why it's used:**
- **No vendor lock-in:** You control CouchDB
- **Private:** Sync stays within your infrastructure
- **Reliable:** Conflict resolution, automatic retry
- **Cost:** Free (self-hosted CouchDB)

**Installation:**
1. Open Obsidian Settings → Community plugins
2. Search: "Obsidian Live Sync"
3. Install → Enable
4. Configure (see below)

### 3. CouchDB (Sync Backend)

**What it is:**
- NoSQL database optimized for replication
- Stores Obsidian vault in structured format
- Accessible via REST API

**Why it's used:**
- **Reliable sync:** Built for multi-device sync
- **Offline-first:** Works without internet
- **Conflict resolution:** Handles concurrent edits
- **Backup:** All data replicated to multiple devices

**Deployment:**
- Docker Compose (recommended)
- Port: 5984 (configurable)
- Storage: `docker/couchdb/data/` (persistent volume)

**Access:**
- Admin UI: http://localhost:5984/_utils/
- API: http://localhost:5984/

### 4. Quartz (Publishing)

**What it is:**
- Static site generator for Obsidian vaults
- Converts markdown to beautiful HTML
- Zero JavaScript dependencies (fast)

**Why it's used:**
- **Safe:** Only publishes from `obsidian/vault/public/`
- **Fast:** Static HTML (no server needed)
- **Customizable:** Themes, layouts, plugins
- **Deployable:** GitHub Pages, Cloudflare Pages, etc.

**Integration:**
- Syncs from `obsidian/vault/public/` only
- Validates no private content before build
- Generates static site in `quartz/public/`
- Deploys via GitHub Actions

### 5. Git (Version Control & Rollback)

**What it is:**
- Version control for all non-vault files
- Tracks: config, scripts, documentation, public vault snapshots

**Why it's used:**
- **Audit trail:** Who changed what, when
- **Rollback:** Revert any change instantly
- **Collaboration:** Multi-user support
- **Backup:** Remote copy on GitHub

**Tracked:**
```
✅ obsidian/vault/public/*        (snapshots only)
✅ obsidian/config/
✅ docker-compose.obsidian-sync.yml
✅ scripts/backup-vault.sh
✅ scripts/check-private-notes.js
❌ .env.obsidian                  (secrets!)
❌ obsidian/vault/private/
❌ obsidian/vault/.obsidian/
❌ docker/couchdb/data/
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        OBSIDIAN VAULT                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ /public                    ✅ PUBLISH                      │ │
│  │  ├── Architecture/                                          │ │
│  │  ├── Team_Docs/                                             │ │
│  │  ├── Best_Practices/                                        │ │
│  │  └── Knowledge_Base/                                        │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ /private                   🔴 NEVER PUBLISH                │ │
│  │  ├── Personal/                                              │ │
│  │  ├── Secrets/                                               │ │
│  │  ├── Drafts/                                                │ │
│  │  └── Internal/                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
              │                          │
              ├─ LiveSync ───────────────┤
              │                          │
              ▼                          ▼
        ┌───────────────┐         ┌──────────────┐
        │   Obsidian    │         │  CouchDB     │
        │  (Desktop)    │◄───────►│ (Localhost)  │
        │               │         │              │
        └───────────────┘         └──────────────┘
              │                          │
              │ (optional)               ├─► Mobile Device
              ├─► Obsidian Mobile ◄─────┤   (LiveSync)
              │                          │
              ▼                          ▼
        ┌─────────────────────────────────────────┐
        │  Git Repository (GitHub)                │
        │  - Public vault snapshots               │
        │  - Config & scripts                     │
        │  - Documentation                        │
        └─────────────────────────────────────────┘
              │
              ├─► Sync to Quartz
              │
              ▼
        ┌─────────────────────────────────────────┐
        │  Quartz (Static Site Generator)         │
        │  Validates: No private content          │
        │  Builds: obsidian/vault/public/ → HTML  │
        └─────────────────────────────────────────┘
              │
              ├─► Check-private-notes validation
              │
              ▼
        ┌─────────────────────────────────────────┐
        │  Deploy to Web                          │
        │  - GitHub Pages (free)                  │
        │  - Cloudflare Pages (free)              │
        │  - Vercel (free tier)                   │
        │  - Netlify (free tier)                  │
        └─────────────────────────────────────────┘
              │
              ▼
        https://your-notes.com
```

## Data Flow

### 1. Writing Notes
```
User opens Obsidian → Creates/edits markdown file
        ↓
LiveSync plugin detects change
        ↓
Sends to CouchDB (encrypted by default)
        ↓
CouchDB replicates to mobile devices
        ↓
Sync complete → User sees note on phone
```

### 2. Publishing
```
User places note in /public folder
        ↓
CI/CD pipeline triggered (GitHub Actions)
        ↓
check-private-notes script validates
        ↓
Quartz syncs public notes
        ↓
Quartz builds HTML site
        ↓
Deploy to GitHub Pages / Cloudflare Pages
        ↓
Website updated (seconds)
```

### 3. Rollback
```
User wants to revert to previous version
        ↓
git log --all -- obsidian/vault/public/
        ↓
git checkout <commit> -- obsidian/vault/public/
        ↓
LiveSync pulls latest from CouchDB
        ↓
Obsidian reloads vault
        ↓
Sync propagates to mobile (if needed)
```

## Features by Component

| Feature | Obsidian | LiveSync | CouchDB | Quartz | Git |
|---------|----------|----------|---------|--------|-----|
| **Write Notes** | ✅ | - | - | - | - |
| **Sync Desktop-Mobile** | - | ✅ | ✅ | - | - |
| **Search Notes** | ✅ | - | - | - | - |
| **Offline Mode** | ✅ | ✅ | ✅ | - | ✅ |
| **Real-time Sync** | - | ✅ | ✅ | - | - |
| **Version History** | - | - | ✅ | - | ✅ |
| **Publish to Web** | - | - | - | ✅ | ✅ |
| **Conflict Resolution** | - | ✅ | ✅ | - | - |
| **Backup** | - | - | ✅ | - | ✅ |
| **Multi-device** | - | ✅ | ✅ | - | - |

## Security & Privacy

### Private by Default
- All notes stored locally in Obsidian
- Only synced to CouchDB if user enables LiveSync
- CouchDB data encrypted in transit and at rest (optional)

### Publication Safeguards
1. **Folder-based separation:** `/public` vs `/private`
2. **Metadata tags:** `publish: false` blocks publishing
3. **Automated validation:** `check-private-notes` script
4. **Manual review:** Before CI/CD publishes
5. **Keyword blocking:** `PRIVATE`, `SECRET`, `TOKEN=`, `API_KEY=`

### Remote Access Security
- **Local only (default):** CouchDB on localhost, no remote access
- **Tailscale (recommended):** VPN for secure remote sync
- **Cloudflare Tunnel (alternative):** HTTP tunnel, no VPN
- **Not recommended:** Direct port exposure without HTTPS

## Cost Breakdown

| Component | Cost | Notes |
|-----------|------|-------|
| Obsidian | Free | Desktop + Community plugins |
| Obsidian Sync (optional) | $50/year | For Obsidian-hosted sync (we don't use this) |
| **Our Stack:** | | |
| CouchDB (Docker) | Free | Self-hosted, one-time setup |
| Hosting | Free | GitHub Pages / Cloudflare Pages / Vercel |
| Domain | ~$12/year | Optional custom domain |
| **Total** | **~$12/year** | Or less with free domain |

## Comparison: Obsidian Sync vs Self-Hosted

| Feature | Obsidian Sync | Self-Hosted (LiveSync + CouchDB) |
|---------|---------------|----------------------------------|
| **Cost** | $50/year | Free |
| **Privacy** | Managed by Obsidian | You control everything |
| **Complexity** | Simple | Medium (Docker required) |
| **Performance** | Cloud-based | Local + self-hosted |
| **Data Ownership** | Obsidian account | Your infrastructure |
| **Customization** | Limited | Full control |
| **Uptime** | Obsidian SLA | Your responsibility |
| **Vendor Lock-in** | Medium | None |

**Recommendation:** Self-hosted for maximum privacy, control, and cost savings.

## Next Steps

1. Start CouchDB: `docker-compose -f docker-compose.obsidian-sync.yml up -d`
2. Install Obsidian and LiveSync plugin
3. Configure LiveSync with CouchDB credentials
4. Test sync with mobile device
5. See `docs/sync-architecture.md` for detailed setup

---

**Last Updated:** 2026-05-22  
**Status:** Ready for integration  
**Maintained by:** DevOps Team
