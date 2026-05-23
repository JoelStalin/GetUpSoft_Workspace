# OBSIDIAN STACK INTEGRATION TIMELINE

**Project:** GetUpSoft Workspace + Obsidian Self-Hosted Stack  
**Purpose:** Integrate note-taking (Obsidian), sync (LiveSync/CouchDB), and publishing (Quartz) with existing monorepo  
**Status:** PLANNING PHASE  
**Updated:** 2026-05-22  

---

## INITIAL STATE SNAPSHOT (2026-05-22 22:30 UTC)

### Repository Status
- **Branch:** main (up to date with origin/main)
- **Latest Commit:** 21c6b28eb (CHANGE_TIMELINE checkpoint)
- **Ahead of origin:** 0 commits
- **Local Changes:** Protected via git stash (5 files + untracked)

### Current Stack Analysis
**Languages & Frameworks:**
- Node.js monorepo (multiple package.json files detected)
- Kubernetes deployments (6 GitHub Actions workflows)
- .env.* configuration files (multiple env variants)
- TypeScript projects (inferred from structure)

**CI/CD:**
- GitHub Actions: ci.yml, deploy-getupsoft-site.yml, miniverse-kubernetes-ci.yml, orca-kubernetes-ci.yml, sync-production-workspace.yml
- Kubernetes-based deployments
- No Docker Compose found at root level

**Directory Structure:**
```
GetUpSoft_Workspace/
├── 00_Workspace_Governance/
├── 01_Core_Platform/          (getupsoft-site, main product)
├── 02_Odoo_ERP/
├── 02_Products/
├── 03_AI_Automation/          (multiple projects: hermes-agent, hyperframes, n8n, nexus, insta-manager)
├── 03_Client_Solutions/
├── 04_Archive_Legacy/
├── 04_Workers/
├── 05_Backups/
├── 06_E_Commerce_Lux/
├── apps/                       (ORCA: workflow editor)
├── docs/                       (documentation)
├── scripts/                    (automation scripts)
├── .github/workflows/          (CI/CD pipelines)
└── ...other directories
```

**Key Projects with package.json:**
- ./01_Core_Platform/getupsoft-site
- ./03_AI_Automation/hermes-agent
- ./03_AI_Automation/hyperframes
- ./03_AI_Automation/insta-manager-pro
- ./03_AI_Automation/n8n
- ./03_AI_Automation/nexus
- ./apps/orca/workflow-editor (React + TypeScript)

### Files Changed Before Protection
```
Modified (5 files):
  03_AI_Automation/hyperframes/packages/cli/src/capture/agentPromptGenerator.ts
  03_AI_Automation/hyperframes/packages/cli/src/capture/htmlExtractor.ts
  03_AI_Automation/hyperframes/packages/cli/src/capture/index.ts
  03_AI_Automation/hyperframes/packages/cli/src/capture/types.ts
  03_AI_Automation/hyperframes/packages/cli/src/commands/capture.ts

Untracked (2 dirs):
  03_AI_Automation/hermes-agent/
  03_AI_Automation/scrapling/
```

**Status:** Stashed as "WIP: Protect state before Obsidian stack integration"

---

## ARCHITECTURE DECISION

### Design Principles
1. **Separation of Concerns:** Vault (notes) separate from source code
2. **Privacy-First:** Explicit pub/private separation before any publishing
3. **Reversible:** Every change documented with rollback path
4. **Non-Invasive:** Obsidian integration does not modify existing projects
5. **Scalable:** Can grow from personal notes to team documentation

### Chosen Architecture

**Components:**
1. **Obsidian Vault** (local)
   - Private: `obsidian/vault/private/` (NEVER published)
   - Public: `obsidian/vault/public/` (safe to publish)
   - Templates: `obsidian/vault/templates/`
   - Attachments: `obsidian/vault/attachments/`

2. **LiveSync + CouchDB** (self-hosted sync)
   - Docker Compose for CouchDB
   - Local LiveSync plugin in Obsidian
   - Optional mobile sync

3. **Quartz** (static site publishing)
   - Publishes only `obsidian/vault/public/*`
   - Validates no private content before build
   - Deploy to: GitHub Pages / Cloudflare Pages / Netlify

4. **Git** (version control + rollback)
   - Vault in .gitignore (local only) OR tracked as separate subtree
   - Scripts, config, docs tracked normally
   - Rollback strategy: git revert + manual recovery

---

## INTEGRATION PLAN

### Phase 1: FOUNDATION ✅ COMPLETE
- [x] Protect current repository state (git stash)
- [x] Analyze existing stack (monorepo, 10+ projects)
- [x] Create this timeline
- [x] Create directory structure (8 directories + .gitignore)
- [x] Create configuration files (.env.obsidian.example, docker-compose.obsidian-sync.yml)

### Phase 2: SAFETY DOCUMENTATION (Next)
- [ ] Create privacy rules document
- [ ] Create validation scripts
- [ ] Create backup strategy

### Phase 3: SYNC INFRASTRUCTURE
- [ ] Create docker-compose.obsidian-sync.yml
- [ ] Create .env.obsidian template
- [ ] Document LiveSync setup
- [ ] Document CouchDB configuration

### Phase 4: PUBLISHING PIPELINE
- [ ] Create Quartz integration folder
- [ ] Create sync-vault-to-quartz script
- [ ] Create check-private-notes validation
- [ ] Integrate with GitHub Actions

### Phase 5: TESTING & DEPLOYMENT
- [ ] Test local sync (CouchDB + LiveSync)
- [ ] Test Quartz build
- [ ] Test privacy validation
- [ ] Test rollback procedures

### Phase 6: DOCUMENTATION & HANDOFF
- [ ] Complete all docs
- [ ] Create runbooks
- [ ] Create troubleshooting guide
- [ ] Hand off to user

---

## RISKS & MITIGATION

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Private notes accidentally published | 🔴 Critical | Check script in pre-publish pipeline, manual review |
| CouchDB data loss | 🔴 Critical | Regular backups to git, daily snapshots |
| LiveSync conflicts | 🟠 High | Conflict resolution docs, single-writer pattern |
| Vault corruption | 🟠 High | Git history + local backups, versioning |
| Secrets leaked in public notes | 🔴 Critical | .env validation, secret scanning, pre-commit hooks |
| Disruption to existing projects | 🟡 Medium | Non-invasive structure, no shared dependencies |
| Incomplete migration | 🟡 Medium | Phase-by-phase rollout, checkpoint at each step |

---

## REVERT STRATEGY

**At any point, revert Obsidian integration with:**

1. **Complete rollback to pre-integration state:**
   ```bash
   git reset --hard <initial-commit-before-integration>
   ```

2. **Partial rollback by component:**
   - Remove `/obsidian` directory → loses vault (backup from git history if tracked)
   - Remove `/quartz` integration → stops publishing
   - Remove `/docker/*` → stops CouchDB (data remains in volumes)
   - Remove GitHub Actions workflow → stops publishing pipeline

3. **Data recovery:**
   - Vault snapshots: `git log --all -- obsidian/vault/public/`
   - CouchDB backups: `docker volumes ls`

---

## NEXT STEPS

1. ✅ Protect state (DONE)
2. ⏳ Create directory structure
3. ⏳ Create privacy documentation
4. ⏳ Create validation scripts
5. ⏳ Create CouchDB + LiveSync configuration
6. ⏳ Create Quartz integration
7. ⏳ Create CI/CD pipeline
8. ⏳ Test end-to-end
9. ⏳ Document rollback procedures
10. ⏳ Final review and handoff

---

## DEPENDENCIES & REQUIREMENTS

**System Requirements:**
- Docker & Docker Compose (for CouchDB)
- Node.js 18+ (for Quartz, sync scripts)
- Obsidian app (local)
- Git (already present)

**Optional:**
- Tailscale (for secure remote sync)
- Cloudflare Tunnel (for web access)
- GitHub Actions (for automated publishing)

**No additional global installations** — everything runs in Docker or as npm scripts.

---

**Checkpoint Created:** 2026-05-22 22:30 UTC  
**Next Review:** After Phase 1 completion  
**Estimated Duration:** 4-6 hours for full integration + testing
