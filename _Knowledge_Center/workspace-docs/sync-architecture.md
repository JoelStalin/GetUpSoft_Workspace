# Obsidian LiveSync + CouchDB Architecture

## Overview

This document describes the technical architecture of the LiveSync + CouchDB synchronization system used for real-time vault sync across desktop and mobile devices.

## Components

```
┌──────────────────────────────────────┐
│   Obsidian Desktop (App)             │
│   └─ LiveSync Plugin                 │
│      └─ Detects file changes         │
│         └─ Sends to CouchDB          │
└──────────────────────────────────────┘
              ↓ (HTTPS)
┌──────────────────────────────────────┐
│   CouchDB 3.3 (Docker Container)     │
│   ┌────────────────────────────────┐ │
│   │ obsidian_vault database        │ │
│   ├────────────────────────────────┤ │
│   │ - Notes (markdown files)       │ │
│   │ - Metadata (timestamps, rev)   │ │
│   │ - Attachments (base64 encoded) │ │
│   │ - Conflict history             │ │
│   └────────────────────────────────┘ │
└──────────────────────────────────────┘
              ↓ (Replication)
┌──────────────────────────────────────┐
│   Obsidian Mobile (App)              │
│   └─ LiveSync Plugin                 │
│      └─ Syncs from CouchDB           │
│         └─ Updates local vault       │
└──────────────────────────────────────┘
```

## LiveSync Plugin

### What It Does
- Monitors file changes in Obsidian vault
- Encrypts data (optional but recommended)
- Syncs to CouchDB in real-time
- Handles bi-directional updates
- Resolves conflicts automatically (with fallback to manual resolution)

### Installation
1. Settings → Community plugins
2. Search: "Obsidian Live Sync"
3. Install and Enable
4. Configure with CouchDB credentials

### Configuration Steps

**Step 1: CouchDB URI**
```
http://<username>:<password>@localhost:5984
```

**Step 2: Database Name**
```
obsidian_vault
```

**Step 3: Enable Encryption (Recommended)**
- LiveSync → Encryption
- Set passphrase (must be same across devices)

**Step 4: Test Connection**
- Plugin should show "Connected" status
- Perform test sync: Create/edit a note
- Check CouchDB Fauxton UI for database update

## CouchDB

### What It Is
- NoSQL database optimized for document sync
- Implements Apache Replication Protocol
- Handles offline-first sync
- Built-in conflict detection

### Data Model

```json
{
  "_id": "notes/my-note.md",
  "_rev": "3-abc123",
  "type": "file",
  "name": "my-note.md",
  "path": "notes/",
  "content": "# My Note\n...",
  "mtime": 1716432000000,
  "children": [],
  "createdAt": 1716432000000,
  "hash": "abc123def456"
}
```

### Deployment

**Docker Compose:**
```bash
docker-compose -f docker-compose.obsidian-sync.yml up -d
```

**Verify:**
```bash
curl http://admin:password@localhost:5984/
# Returns: {"couchdb":"Welcome","version":"3.3.0",...}
```

**Access Fauxton UI:**
```
http://localhost:5984/_utils/
```

## Synchronization Flow

### Desktop → Mobile (Push)

```
1. User edits note in Obsidian Desktop
        ↓
2. LiveSync detects change (file watcher)
        ↓
3. Plugin creates document in CouchDB
        ↓
4. Plugin sets _rev = new revision
        ↓
5. Mobile plugin polls CouchDB
        ↓
6. Detects new/updated document
        ↓
7. Downloads to mobile vault
        ↓
8. User sees note update on phone (next sync)
```

**Time:** ~1-3 seconds (over WiFi/local network)

### Mobile → Desktop (Pull)

```
1. User edits note on mobile phone
        ↓
2. Mobile plugin updates CouchDB
        ↓
3. Desktop plugin polls CouchDB
        ↓
4. Detects change (new _rev)
        ↓
5. Downloads updated content
        ↓
6. Updates local file in vault
        ↓
7. Obsidian reloads note
        ↓
8. Desktop user sees update
```

**Time:** ~1-3 seconds (if online)

## Conflict Resolution

### What Is a Conflict?

A conflict occurs when **two devices** edit the **same note** **before one syncs to CouchDB**.

```
Device A: Edit note at 14:00:00
Device B: Edit note at 14:00:01  ← Before A syncs
         ↓
    CouchDB receives A's version
         ↓
    CouchDB receives B's version → CONFLICT!
```

### How LiveSync Handles It

**Automatic (Preferred):**
1. CouchDB stores both versions
2. LiveSync plugin selects most recent (by timestamp)
3. Other version stored as "conflict history"
4. User usually doesn't notice

**Manual (If Automatic Fails):**
1. Plugin shows conflict notification
2. User manually merges in Obsidian
3. Edit saved
4. Re-sync uploads merged version

### Best Practices to Avoid Conflicts

1. **Single Writer Pattern:** Only edit on one device at a time
2. **Sync Before Switching:** Sync desktop before switching to mobile
3. **Wait for Indication:** Wait for "synced" indicator before switching devices
4. **Offline Awareness:** Know when offline, sync when online again

## Offline Behavior

### Desktop (Offline)
- ✅ Create and edit notes normally
- ✅ All changes saved locally
- ⏳ Sync queued
- ✅ On reconnect → syncs automatically

### Mobile (Offline)
- ✅ Read notes normally
- ✅ Can edit (saved locally)
- ⏳ Sync queued
- ⚠️ Older files may be unavailable (depends on device storage)
- ✅ On reconnect → syncs automatically

### Reconnection Flow

```
Device comes back online
        ↓
LiveSync detects connection
        ↓
Syncs queued changes to CouchDB
        ↓
Pulls new changes from CouchDB
        ↓
Merges local + remote
        ↓
Updates complete (conflict resolution if needed)
```

## Security Considerations

### Data in Transit
- **Local Network:** Plain HTTP (localhost)
- **Remote Access:** Must use HTTPS with Tailscale or Cloudflare Tunnel
- **Never:** Expose port 5984 directly to internet

### Data at Rest
- **CouchDB Files:** Stored in `docker/couchdb/data/`
- **Encryption:** Optional but recommended (set in LiveSync plugin)
- **Backup:** Encrypted if LiveSync encryption enabled

### Credentials
- **Never commit:** `.env.obsidian` with real passwords
- **Use strong passwords:** Min 16 characters
- **Rotate regularly:** Every 90 days recommended
- **Restrict access:** Use firewall, VPN, or Tailscale

### Access Control

**CouchDB Admin User:**
```
http://admin:password@localhost:5984
```
Unrestricted access — **keep credentials secure**

**CouchDB App User:**
```
COUCHDB_USER=obsidian_user
COUCHDB_PASSWORD=<vault-specific-password>
```
Limited to obsidian_vault database

## Monitoring & Troubleshooting

### Health Check

**CouchDB Status:**
```bash
curl http://localhost:5984/_up
# {"status":"ok"} = healthy
```

**LiveSync Status:**
- Obsidian → Settings → Live Sync
- Shows: "Connected" or "Disconnected"
- Check logs if not connected

**Database Size:**
```bash
curl http://user:password@localhost:5984/obsidian_vault
# Shows: "data_size": XXXX
```

### Common Issues

**Connection Refused**
```
Error: ECONNREFUSED 127.0.0.1:5984

Fix:
1. Check CouchDB running: docker ps
2. Check port: sudo lsof -i :5984
3. Restart: docker-compose restart couchdb
```

**Sync Not Working**
```
Check:
1. CouchDB is running
2. Credentials correct in LiveSync settings
3. Database exists: curl http://localhost:5984/obsidian_vault
4. Firewall not blocking (if remote)
```

**Conflicts Not Resolving**
```
Fix:
1. Stop sync on all devices
2. Manually resolve in Obsidian
3. Save
4. Re-enable sync
5. Monitor Fauxton for resolution
```

**CouchDB Data Corruption**
```
Recovery:
1. Stop CouchDB: docker-compose down
2. Restore from backup: tar -xzf backup.tar.gz -C docker/couchdb/
3. Restart: docker-compose up -d
4. Resync all devices
```

## Performance

### Typical Sync Latency
- **Local Network:** 1-3 seconds
- **Remote (Tailscale):** 2-5 seconds
- **Remote (HTTPS):** 5-10 seconds

### Database Size Limits
- **Small vault** (< 100MB): No issues
- **Medium vault** (100MB - 1GB): Monitor performance
- **Large vault** (> 1GB): May need optimization
  - Consider sharding (multiple databases)
  - Archive old content
  - Compress attachments

### Recommended Settings

**For Optimal Performance:**
```
- Sync interval: 30-60 seconds
- Batch size: 100 documents
- Compression: Enabled
- Encryption: Enabled (small overhead)
```

## Backup Strategy

### Automated (via Git)
```bash
# Daily backup
git add obsidian/vault/public/
git commit -m "backup: vault snapshot"
git push origin main
```

### Manual (Timestamped Archive)
```bash
./scripts/backup-vault.sh
# Creates: obsidian/backups/vault-20260522_143000.tar.gz
```

### CouchDB Data Directory
```bash
# Backup database
tar -czf couchdb-backup.tar.gz docker/couchdb/data/

# Restore database
docker-compose down
tar -xzf couchdb-backup.tar.gz -C docker/couchdb/
docker-compose up -d
```

## Advanced: Multi-Device Setup

### Device 1 (Desktop - Primary)
1. Create vault in Obsidian
2. Install LiveSync
3. Configure CouchDB
4. Create initial notes
5. Sync to CouchDB

### Device 2 (Laptop)
1. Install Obsidian
2. Install LiveSync
3. Use same CouchDB URI
4. Use same Database name
5. Select "Download and initialize" during setup
6. Wait for full sync

### Device 3 (Mobile)
1. Install Obsidian mobile
2. Install Live Sync (search store)
3. Use same CouchDB URI
4. Use same Database name
5. Wait for sync

**Important:**
- All devices use same CouchDB instance
- Same credentials
- Same database name
- Only edit one device at a time (initially)

## Disaster Recovery

### Scenario: CouchDB Corrupted

**Recovery Steps:**
```bash
# 1. Check last backup
ls -lt obsidian/backups/ | head -1

# 2. Stop CouchDB
docker-compose down

# 3. Remove corrupted data
rm -rf docker/couchdb/data/*

# 4. Restore from backup
tar -xzf obsidian/backups/vault-LATEST.tar.gz -C obsidian/vault/

# 5. Restart CouchDB
docker-compose up -d

# 6. Reinitialize LiveSync on all devices
# Delete LiveSync cache and re-sync
```

### Scenario: Lost Device

**Recovery Steps:**
```bash
# 1. New device gets latest from CouchDB
# 2. Install Obsidian + LiveSync
# 3. Configure with same CouchDB
# 4. "Initialize and download" option
# 5. Vault restored from sync
```

**No data loss** — CouchDB is source of truth

## Next Steps

1. [ ] Start CouchDB: `docker-compose up -d`
2. [ ] Verify health: `curl http://localhost:5984/_up`
3. [ ] Install LiveSync plugin in Obsidian
4. [ ] Configure credentials
5. [ ] Test sync (create a note)
6. [ ] Set up mobile device
7. [ ] Test mobile → desktop sync
8. [ ] Set up backup strategy

---

**Last Updated:** 2026-05-22  
**Status:** Ready for deployment  
**Maintained by:** DevOps Team
