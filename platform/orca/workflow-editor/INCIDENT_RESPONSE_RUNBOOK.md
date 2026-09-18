# Phase 11: Incident Response Runbook

**Purpose:** Quick reference for responding to production incidents  
**Audience:** On-Call Engineer, DevOps, Engineering Manager  
**Status:** READY TO USE

---

## Quick Start: Incident Classification

**Is it production?** → YES
- [ ] Page completely down (500 error)
- [ ] Features broken (modes don't work)
- [ ] Data loss or corruption
- [ ] Security breach
- [ ] Performance severely degraded (>2x slower)

**Severity Levels:**

| Level | Impact | Response Time | Examples |
|-------|--------|---------------|----|
| 🔴 **SEV 1** | Critical - Service down | < 5 min | 500 error, all modes broken, data loss |
| 🟠 **SEV 2** | High - Major features broken | < 15 min | Mode switching broken, API errors, perf degraded 50% |
| 🟡 **SEV 3** | Medium - Minor feature issues | < 1 hour | Styling bug, one mode slow, minor UI issue |
| 🟢 **SEV 4** | Low - Cosmetic issues | < 4 hours | Font rendering, color mismatch, tooltip position |

---

## SEV 1 Response (Page Down / Complete Outage)

### Step 1: Alert & Notify (1 minute)

```
□ Page completely down? (404, 500, blank page)
□ Traffic at 0? (Check metrics)
□ Users affected? (Yes = SEV 1)
```

**Notify immediately:**
```
Post to #phase-11-critical:
@channel 🔴 SEV 1: ORCA Editor Down
- Status: Page returns 500 error
- Time detected: 2026-06-13 14:35 UTC
- Pages affected: All users
- Impact: ~1000 concurrent users unable to access
- Initiating incident response...
```

### Step 2: Diagnosis (2-3 minutes)

**Check infrastructure:**

```bash
# Is the service running?
kubectl get pods -n production | grep orca
# Should see: orca-editor-XXXXX Running

# If not running:
kubectl describe pod orca-editor-XXXXX -n production
# Check: Status, Ready, Conditions, Events
```

**Check metrics:**

```
Datadog Dashboard:
□ Service status: Green/Red?
□ Error rate: (if <100% requests failing, SEV 2)
□ CPU: Normal?
□ Memory: Spiking?
□ Database: Connected?
□ Network latency: Normal?
```

**Check logs:**

```bash
# Last 100 lines of error logs
kubectl logs deployment/orca-editor -n production --tail=100 | grep -i error

# Or via Datadog:
Logs → Search: service:orca-editor AND status:error
# What's the error pattern?
```

### Step 3: Immediate Actions (Based on Diagnosis)

**If service not running:**
```bash
# Restart service
kubectl rollout restart deployment/orca-editor -n production
kubectl rollout status deployment/orca-editor -n production

# If still not running, check events:
kubectl events -n production
```

**If service running but returning errors:**
```bash
# Check recent deployments
kubectl rollout history deployment/orca-editor -n production

# Recent change broke it? Rollback immediately:
kubectl rollout undo deployment/orca-editor -n production
kubectl rollout status deployment/orca-editor -n production

# Verify recovery:
curl -I https://orca.getupsoft.com/
# Should see: HTTP 200
```

**If database connection failure:**
```bash
# Check database status
psql -h db.prod.internal -U app "SELECT 1"
# If fails: Contact DBA

# Meanwhile: Try failover
kubectl set env deployment/orca-editor DB_HOST=db-replica.prod.internal
kubectl rollout status deployment/orca-editor -n production
```

### Step 4: Validation (1 minute)

```bash
# Health check
curl -I https://orca.getupsoft.com/
# Expected: HTTP 200 OK

# Page loads?
curl https://orca.getupsoft.com/ | grep "<title>"
# Expected: Page title present

# Metrics recovering?
# Check Datadog dashboard for:
✅ Error rate < 0.1%
✅ Request count increasing
✅ Response time normal
✅ No new errors in logs
```

### Step 5: Communication (Ongoing)

```
Update #phase-11-critical every 5 minutes:
14:35 - "SEV 1: Page down"
14:38 - "Issue: Service crashed, restarting..."
14:40 - "Service restarted, validating..."
14:42 - "✅ Service recovered, error rate normal"
14:45 - "✅ All systems nominal. Incident resolved."
```

---

## SEV 2 Response (Major Features Broken)

### Diagnosis Checklist

```
□ Which feature is broken? (mode switching, analytics, ML, etc)
□ When did it start? (In last deployment? Last hour?)
□ Percentage of users affected? (All or subset?)
□ Error pattern? (Consistent or intermittent?)
```

**Common SEV 2 Issues:**

| Issue | Diagnosis | Fix |
|-------|-----------|-----|
| Mode switching broken | Check logs for React errors | Restart service |
| Analytics not collecting | Check API endpoint, network tab | Check backend API |
| ML recommendations failing | Check ML service status | Restart ML service |
| Slow performance (2x baseline) | Check CPU/memory spikes | Scale up pods |
| API returning 502 | Backend overloaded? | Scale backend |

### Response

```
1. Isolate the feature (1-2 min)
   - Reproduce issue
   - Determine scope
   - Check if recent deployment caused it

2. Attempt fix (5-10 min)
   - Rollback if recent deploy caused it
   - Restart service if memory leak
   - Scale up if resource constrained

3. Validate (2-3 min)
   - Test affected feature
   - Monitor for 5 min
   - Check other features not impacted

4. Communicate (ongoing)
   - Post in #phase-11 (not critical channel)
   - Update every 15 min
   - Post post-mortem after resolved
```

---

## SEV 3 & 4 Response (Minor Issues)

### Triage Decision

```
Question: Can users still use the product?
- YES → SEV 3 (investigate during normal hours)
- NO → Escalate to SEV 2 or SEV 1

Question: Does it affect core functionality?
- YES → SEV 3 (fix ASAP)
- NO → SEV 4 (nice to have)
```

### Action Plan

**SEV 3:**
```
1. Log ticket in Jira
2. Assign to engineer
3. Fix in next available window (same day preferred)
4. Deploy in next regular release
5. Communicate in #phase-11
```

**SEV 4:**
```
1. Log ticket in Jira
2. Assign to backlog
3. Fix when convenient
4. Deploy in next regular release
5. Communicate in #phase-11 weekly update
```

---

## Common Production Issues & Fixes

### Issue: 502 Bad Gateway

**Symptoms:**
```
Browser shows: "502 Bad Gateway"
Logs show: "upstream timeout" or "upstream unavailable"
Dashboard: Error rate spike, backend not responding
```

**Diagnosis:**
```bash
# Backend service status
kubectl get pods -n production | grep orca-api
# Expected: Running

# Check backend logs
kubectl logs deployment/orca-api -n production --tail=50
# Look for: Database connection errors, OOM, crashes
```

**Fixes (in order):**

```bash
# Fix 1: Restart backend
kubectl rollout restart deployment/orca-api -n production

# Fix 2: Scale up (if CPU high)
kubectl scale deployment orca-api --replicas=5 -n production

# Fix 3: Check database
psql -h db.prod -U app "SELECT 1" 
# If fails, contact DBA

# Fix 4: Rollback (if recent deploy broke it)
kubectl rollout undo deployment/orca-api -n production
```

---

### Issue: High Memory Usage / OOM Crashes

**Symptoms:**
```
Dashboard: Memory usage 90%+
Logs: "out of memory", "Java heap space", etc
Metrics: Error rate spiking, response time increasing
```

**Diagnosis:**

```bash
# Check current memory
kubectl top pod -n production | grep orca
# Example: orca-editor-xyz 4000Mi/4000Mi (near limit)

# Check for memory leaks
kubectl logs deployment/orca-editor -n production | grep -i "memory\|leak"
```

**Fixes:**

```bash
# Immediate: Restart service
kubectl rollout restart deployment/orca-editor -n production

# Short-term: Increase memory limit
kubectl set resources deployment/orca-editor \
  --limits=memory=6Gi -n production

# Medium-term: Investigate memory leak
# Check: useEffect cleanups, event listener cleanup, timers
# See: PROFILING_AND_DEBUGGING_GUIDE.md

# Long-term: Code fix, re-deploy
```

---

### Issue: Slow Performance (Page Takes >5s to Load)

**Symptoms:**
```
Lighthouse score: <50
FCP/LCP: >5s
Users report: "Page is very slow"
Dashboard: Load time trending up
```

**Diagnosis:**

```bash
# Check if code bloat added
npm run build -- --report
du -sh dist/  # Total size

# Check if server is slow
curl -w "Time to first byte: %{time_starttransfer}s\n" https://orca.getupsoft.com
# If >2s, server is slow (not bundle)

# Check backend metrics
Datadog → APM → orca-api
# Look for: Database queries slow, external API calls slow
```

**Fixes:**

```bash
# If bundle is larger than expected
1. Identify new large modules (webpack report)
2. Lazy load heavy components
3. Remove unnecessary dependencies
4. Deploy optimization

# If server is slow
1. Check database load
2. Scale up backend replicas
3. Check for N+1 queries
4. Add caching (Redis)
```

---

### Issue: Database Connection Errors

**Symptoms:**
```
Logs: "Connection refused", "Database unavailable"
User sees: 503 or 500 error
Dashboard: All requests failing
```

**Diagnosis:**

```bash
# Can we reach database?
psql -h db.prod -U app -d orca_prod "SELECT 1"

# Is database up?
kubectl get statefulset postgres -n production
# Expected: postgres-0 Running

# Network issues?
ping db.prod
telnet db.prod 5432
```

**Fixes:**

```bash
# If database is down
1. Contact DBA immediately
2. Check database logs
3. Restart database (if safe)
4. Failover to replica (if available)

# If connection pooling exhausted
1. Increase pool size
2. Restart application
3. Check for connection leaks

# If network issue
1. Check firewall rules
2. Verify DNS resolution
3. Check cloud network configuration
```

---

## Escalation Path

### When to Escalate

```
Escalate if:
□ Cannot determine root cause within 10 min
□ Issue unresolved after 30 min of troubleshooting
□ Multiple systems affected
□ SEV 1 issue not resolving
□ External systems needed (DBA, network team)
```

### Escalation Contacts

**Tier 1: On-Call Engineer** (you)
- First responder
- 15-30 minutes to diagnose

**Tier 2: Engineering Lead**
- Contact if >30 min troubleshooting
- `/page @engineering-lead-oncall` in Slack

**Tier 3: CTO / Incident Commander**
- Contact if SEV 1 unresolved after 1 hour
- `/page @cto-oncall` in Slack

**Other Teams:**
- **DBA**: Database issues → `@dba-oncall`
- **DevOps Lead**: Infrastructure issues → `@devops-lead-oncall`
- **Security**: Security breach → `@security-lead` + escalate immediately

---

## Post-Incident Procedure

### Within 1 Hour

```
□ Update #phase-11-critical: "Incident resolved at HH:MM UTC"
□ Check all systems still functioning
□ Verify metrics back to normal
□ Thank team in incident channel
```

### Within 24 Hours

```
□ Schedule post-mortem meeting
□ Collect logs and metrics from incident
□ Document what happened (timeline)
□ Root cause analysis
□ Action items to prevent recurrence
```

### Post-Mortem Template

```markdown
# Incident Post-Mortem: [Title]

## Summary
- Impact: [What broke, how many users]
- Duration: [Start time - End time]
- Severity: SEV [1-4]

## Timeline
- HH:MM: Alert triggered
- HH:MM: Issue diagnosed
- HH:MM: Fix applied
- HH:MM: Incident resolved

## Root Cause
[Why did this happen?]

## Action Items
- [ ] Fix in code (ticket #XXX)
- [ ] Improve monitoring (ticket #XXX)
- [ ] Add test case (ticket #XXX)

## Prevention
[How do we prevent this in the future?]

## Lessons Learned
[What did we learn from this?]
```

---

## Monitoring & Alerting Setup

### Critical Alerts (Should Trigger Page)

```
Alert: High Error Rate
- Trigger: Error rate > 1% for 5 min
- Action: Page on-call engineer

Alert: Service Down
- Trigger: All instances down
- Action: Page on-call engineer + lead

Alert: High Latency
- Trigger: p95 latency > 2000ms for 5 min
- Action: Notify in #phase-11 (non-urgent)

Alert: Out of Memory
- Trigger: Memory usage > 90% for 5 min
- Action: Auto-restart + notify
```

---

## Quick Reference Cheat Sheet

```bash
# Service Status
kubectl get deployment orca-editor -n production
kubectl get pods -n production | grep orca

# Logs
kubectl logs deployment/orca-editor -n production --tail=100
kubectl logs deployment/orca-editor -n production -f  # Stream logs

# Restart
kubectl rollout restart deployment/orca-editor -n production

# Scale
kubectl scale deployment orca-editor --replicas=3 -n production

# Rollback
kubectl rollout undo deployment/orca-editor -n production

# Status
kubectl rollout status deployment/orca-editor -n production

# Health
curl -I https://orca.getupsoft.com/
curl https://orca.getupsoft.com/health

# Metrics (Datadog)
Open dashboard and check:
- Error rate
- Request count
- Response time
- CPU/Memory usage
- Database performance
```

---

**Version:** 1.0  
**Created:** 2026-05-25  
**Owner:** On-Call Team  
**Last Updated:** 2026-05-25  

---

**For questions:** Contact @devops-team in Slack  
**For escalations:** Use `/page` command in Slack
