# Obsidian Vault - GetUpSoft Workspace

This directory contains the Obsidian vault for GetUpSoft workspace documentation, notes, and knowledge base.

## Directory Structure

```
obsidian/
├── vault/
│   ├── public/          ← Notes safe to publish (via Quartz)
│   ├── private/         ← Private notes (NEVER published)
│   ├── templates/       ← Obsidian templates
│   ├── attachments/     ← Media files (images, PDFs, etc)
│   └── .obsidian/       ← Obsidian app settings (in .gitignore)
├── config/
│   ├── livesync.example.md      ← LiveSync plugin setup guide
│   └── obsidian-settings-notes.md ← Custom settings documentation
├── backups/             ← Manual vault backups
└── README.md            ← This file
```

## Quick Start

### 1. Open Vault in Obsidian
```bash
# Install Obsidian from https://obsidian.md
# Open as vault: obsidian://vault?path=<path-to>/obsidian/vault
```

### 2. Install LiveSync Plugin
- Open Settings → Community plugins
- Search for "Obsidian Live Sync"
- Install and enable
- See `obsidian/config/livesync.example.md` for configuration

### 3. Start CouchDB (for sync)
```bash
docker-compose -f docker-compose.obsidian-sync.yml up -d
# CouchDB will be available at http://localhost:5984
```

## Privacy Rules

⚠️ **CRITICAL:**

### Public Vault (`obsidian/vault/public/`)
✅ Safe to publish via Quartz
✅ Project documentation
✅ Architecture notes
✅ General knowledge base
✅ Team best practices

### Private Vault (`obsidian/vault/private/`)
🔴 NEVER publish
🔴 Personal notes
🔴 Internal secrets
🔴 Draft ideas
🔴 Sensitive business information
🔴 API keys, passwords, tokens
🔴 Anything marked `publish: false` or `private`

### Validation Before Publishing
Before running Quartz publish:
```bash
npm run notes:check
# This validates no private content leaks to public
```

## LiveSync Configuration

### Desktop Setup
1. Install Obsidian Live Sync plugin
2. Enter CouchDB credentials (see .env.obsidian)
3. Configure sync: Settings → Live Sync → Initialize
4. Test sync manually

### Mobile Setup (iOS)
1. Use mobile Obsidian app
2. Configure same CouchDB credentials
3. Enable bidirectional sync

### Conflict Resolution
- **Single Writer Pattern:** Only one device writes at a time
- **Manual Conflict Resolution:** If conflicts occur, manually merge in editor
- **Backup Strategy:** Daily snapshots to git (see `backup-vault.sh`)

## Backup Strategy

### Manual Backup
```bash
./scripts/backup-vault.sh
# Creates timestamped backup in obsidian/backups/
```

### Automated Backup (Git)
```bash
git add obsidian/vault/public/
git commit -m "docs: backup public vault"
git push origin main
```

### Recovery
```bash
# Restore from git history
git checkout <commit-hash> -- obsidian/vault/public/

# Restore from timestamped backup
cp -r obsidian/backups/vault-<timestamp>/ obsidian/vault/
```

## Publishing with Quartz

### Build Quartz Site
```bash
npm run notes:build
```

### Publish to Web
```bash
npm run notes:publish
# Publishes obsidian/vault/public/ via Quartz
# Available at: https://your-domain.com/notes
```

### Supported Hosts
- GitHub Pages
- Cloudflare Pages
- Vercel
- Netlify

See `docs/publish-pipeline.md` for detailed setup.

## Synchronization with Quartz

### Manual Sync
```bash
npm run notes:sync
# Copies obsidian/vault/public/* to quartz/content/
# Validates no private content
# Ready for build
```

### Automated Sync (GitHub Actions)
See `.github/workflows/notes-publish.yml` for CI/CD configuration.

## Commands

All commands are defined in `package.json` or accessible via scripts in `./scripts/`:

| Command | Purpose |
|---------|---------|
| `npm run notes:check` | Validate no private content |
| `npm run notes:sync` | Sync public notes to Quartz |
| `npm run notes:build` | Build Quartz static site |
| `npm run notes:publish` | Deploy to web |
| `npm run notes:backup` | Create timestamped backup |

## Troubleshooting

### CouchDB Connection Failed
```bash
docker-compose -f docker-compose.obsidian-sync.yml logs couchdb
# Check if CouchDB is running and reachable
```

### Sync Conflicts
1. Open Obsidian console: Ctrl+Shift+I (or Cmd+Shift+I on Mac)
2. Check conflict resolution logs
3. Manually resolve in editor if needed
4. Re-sync after resolving

### Private Content Leaked
If check script found private content:
1. Immediately stop publishing pipeline
2. Remove sensitive content from public folder
3. Verify with `npm run notes:check`
4. Commit fix: `git revert <publish-commit>`

### Lost Notes in Sync
1. Check `obsidian/backups/` for recent snapshots
2. Recover from git: `git log -- obsidian/vault/public/`
3. Use Obsidian sync history: Settings → Sync → Files (view version history)

## Configuration Files

### .env.obsidian (DO NOT COMMIT)
```
COUCHDB_USER=obsidian_user
COUCHDB_PASSWORD=<secure-password>
COUCHDB_DATABASE=obsidian_vault
COUCHDB_PORT=5984
COUCHDB_URL=http://localhost:5984
```

### .gitignore Rules
```
obsidian/vault/private/
obsidian/vault/attachments/
obsidian/vault/.obsidian/
.env.obsidian
```

## Best Practices

1. ✅ **Use templates** for consistent formatting
2. ✅ **Link notes** with wiki-style links [[note-name]]
3. ✅ **Tag public notes** with `publish: true` or place in public folder
4. ✅ **Backup regularly** before major changes
5. ✅ **Review before publish** — check script validates but manual review is best
6. ✅ **Use git** for version history and rollback

## Common Pitfalls

1. ❌ Don't store secrets in public vault
2. ❌ Don't commit `.obsidian/` directory
3. ❌ Don't publish without running `npm run notes:check`
4. ❌ Don't modify Quartz content directly — sync from Obsidian instead
5. ❌ Don't assume mobile will auto-sync — set up device first

## Next Steps

1. [ ] Open vault in Obsidian
2. [ ] Install LiveSync plugin
3. [ ] Configure CouchDB
4. [ ] Test sync between devices
5. [ ] Create first public note
6. [ ] Test Quartz build
7. [ ] Deploy to web
8. [ ] Review backup strategy

## Support

For issues, see:
- `docs/obsidian-stack.md` — Architecture overview
- `docs/sync-architecture.md` — LiveSync/CouchDB details
- `docs/publish-pipeline.md` — Quartz integration
- `docs/troubleshooting.md` — Common issues and fixes

---

**Last Updated:** 2026-05-22  
**Maintained by:** DevOps Team  
**Integration Status:** Planning Phase
