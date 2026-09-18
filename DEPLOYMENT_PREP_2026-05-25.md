# Deployment Preparation - getupsoft-lan SSH Deploy
**Date:** 2026-05-25  
**Target:** getupsoft-lan (SSH)  
**Status:** BACKUP & VERIFICATION PHASE

## Current System State Snapshot

### Services Status Check

## Pre-Deployment Checklist

### PHASE 1: DOCUMENTATION & DISCOVERY (THIS PHASE)
- [ ] Document all currently responding services
- [ ] Document SSH tunnel configuration (READ-ONLY, DO NOT MODIFY)
- [ ] Document jonlynch configuration (READ-ONLY, DO NOT MODIFY)
- [ ] Create full backup of:
  - Current repo state (git bundle)
  - Database state (if applicable)
  - Service configurations
  - Environment variables
- [ ] Verify SSH connectivity to getupsoft-lan
- [ ] Create rollback plan documentation
- [ ] Document which commits/changes will be deployed

### PHASE 2: SAFETY VERIFICATION
- [ ] Test deployment plan on staging (if available)
- [ ] Verify no service disruption expected
- [ ] Document pre-deployment service health
- [ ] Create health check plan post-deployment

### PHASE 3: DEPLOYMENT (USER APPROVAL REQUIRED)
- [ ] Push changes to getupsoft-lan via SSH
- [ ] Verify all services respond post-deployment
- [ ] Run health checks
- [ ] Document deployment success

### PHASE 4: MONITORING
- [ ] Monitor services for 24 hours
- [ ] Keep rollback plan ready
- [ ] Document any issues found

## Critical Constraints (DO NOT VIOLATE)
🔴 DO NOT: Modify SSH tunnels
🔴 DO NOT: Modify jonlynch configuration/processes
🔴 DO NOT: Stop/restart services without explicit approval
🔴 DO NOT: Change network configuration

## Services to Preserve
- [ ] Current SSH tunnels (read-only)
- [ ] jonlynch processes (read-only)
- [ ] All currently responding services

## Backup Strategy

### What to Backup
1. Git repository (full history)
2. Current configurations
3. Database snapshots (if applicable)
4. Service state documentation

### Backup Location
- Local: `C:\Users\yoeli\Documents\GetUpSoft_Workspace\.backup\`
- Remote: getupsoft-lan `/backups/` (TBD)

## Deployment Files to Push

### Core Changes (Phase 2 - State Management)
- 11 new files (contexts, hooks, utilities)
- Enhanced type definitions
- Event system implementation
- Error recovery system
- Migration guides and examples

### Documentation Changes
- CHANGE_TIMELINE.md updates
- Deployment preparation docs
- Migration guides

## Service Health Check Plan

### Pre-Deployment
Services to verify responding:
- [ ] HTTP services (list TBD)
- [ ] Database connections (list TBD)
- [ ] API endpoints (list TBD)
- [ ] WebSocket connections (if applicable)

### Post-Deployment
Same services must still respond with same status codes.

## Rollback Plan

If deployment fails:
1. Revert to previous git commit
2. Restore backups (if necessary)
3. Restart services
4. Verify all services respond again
5. Document root cause

## SSH Deployment Command (Template)

```bash
# Will be provided after approval
# Format: ssh user@getupsoft-lan "cd /path && git pull && npm install && npm run build"
```

## Known Risks
- [ ] Risk #1: TBD after service discovery
- [ ] Risk #2: TBD after service discovery
- [ ] Risk #3: TBD after service discovery

---
**Next Step:** Run service discovery & backup phase
