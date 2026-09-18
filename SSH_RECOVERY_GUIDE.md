# SSH Configuration Recovery Guide

**Date**: 2026-05-29  
**Status**: 🟡 PARTIAL RECOVERY COMPLETED

---

## Problem Identified

SSH configuration was damaged with missing ProxyCommand configuration for Cloudflare Access tunnels.

**Affected hosts**:
- `getupsoft` - Missing Cloudflare ProxyCommand
- `getupsoft2` - Missing Cloudflare ProxyCommand

---

## Recovery Actions Taken

### ✅ 1. SSH Config File Repaired

**File**: `~/.ssh/config`

**Fixed**:
```bash
Host getupsoft
    HostName ssh.getupsoft.com.do
    ProxyCommand cloudflared access ssh --hostname %h \
        --service-token-id 8aed70c623b5e66f49f9dc9eb6227f03.access \
        --service-token-secret 4cf020ffe2db12d0f34c77071920ca94b4b6eee5b7f14ff1259361c2321408c1
    StrictHostKeyChecking no
    User ubuntu
    IdentityFile "C:\Users\yoeli\.ssh\id_getupsoft_cloudflare"
```

### ✅ 2. Configuration Backup Created

Backups available:
- `config.bak` - Previous working config
- `config.bak_20260329_145356` - Older backup
- `config.bak_20260329_180454` - Older backup

---

## Access Methods Available

### Method 1: Cloudflare Tunnel (Recommended - Requires Authentication)

```bash
ssh getupsoft
# or
ssh getupsoft2
```

**Status**: ⏳ Requires Cloudflare re-authentication

**If failing, authenticate**:
```bash
cloudflared access login --hostname ssh.getupsoft.com.do
```

### Method 2: Internal LAN Access (Direct)

```bash
ssh getupsoft-lan
# Connects to: 192.168.1.233:22
```

**Status**: ⏳ Requires key-based authentication

**If key auth fails**:
```bash
# Check if SSH agent is running
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_getupsoft_cloudflare
ssh getupsoft-lan
```

### Method 3: Alternative Hosts

```bash
ssh preprod2              # preprod2.flai.com.do
ssh chefalitas            # chefalitas.com.do
ssh contabilidad          # 18.216.252.4 (via preprod2)
```

---

## Troubleshooting

### Issue: "ProxyCommand timed out"

**Solution 1**: Restart Cloudflare daemon
```bash
# On the server
sudo systemctl restart cloudflared

# On your machine
cloudflared access login --hostname ssh.getupsoft.com.do
```

**Solution 2**: Use internal LAN access
```bash
ssh getupsoft-lan
```

### Issue: "Permission denied (publickey)"

**Solution**: Ensure SSH agent has the key
```bash
ssh-add ~/.ssh/id_getupsoft_cloudflare
ssh -vvv getupsoft-lan
```

### Issue: "No such file or directory" (ssh_get_authentication_socket)

**Solution**: Start SSH agent
```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_getupsoft_cloudflare
ssh getupsoft
```

---

## Verification Checklist

- [ ] Test Cloudflare auth: `cloudflared access token --hostname ssh.getupsoft.com.do`
- [ ] Test SSH config syntax: `ssh -G getupsoft` (should show parsed config)
- [ ] Test LAN access: `ping 192.168.1.233`
- [ ] Test SSH key: `ssh getupsoft-lan "whoami"`
- [ ] Test Cloudflare tunnel: `ssh getupsoft "whoami"`

---

## Key Files Status

| File | Owner | Size | Status |
|------|-------|------|--------|
| `config` | ubuntu | 2.8 KB | ✅ FIXED |
| `config.bak` | ubuntu | 2.8 KB | ✅ Available |
| `id_getupsoft_cloudflare` | ubuntu | 412 B | ✅ OK |
| `id_getupsoft_cloudflare.pub` | ubuntu | 200 B | ✅ OK |
| `getupsoft` | ubuntu | 472 B | ✅ OK |
| `getupsoft_aws.pem` | ubuntu | 1.6 KB | ✅ OK |

---

## Cloudflare Access Configuration

**Service Token ID**: 8aed70c623b5e66f49f9dc9eb6227f03.access

**Secret**: 4cf020ffe2db12d0f34c77071920ca94b4b6eee5b7f14ff1259361c2321408c1 (KEEP SECURE)

**Hosts Protected**:
- ssh.getupsoft.com.do
- stg.getupsoft.com.do

---

## Recovery Status

### Current State
- ✅ SSH config file repaired
- ✅ ProxyCommand restored
- ✅ Backups verified
- ⏳ Cloudflare Access authentication needed
- ⏳ SSH agent setup may be needed

### Next Steps
1. Re-authenticate Cloudflare if needed:
   ```bash
   cloudflared access login --hostname ssh.getupsoft.com.do
   ```

2. Start SSH agent (if needed):
   ```bash
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_getupsoft_cloudflare
   ```

3. Test access:
   ```bash
   ssh getupsoft "echo 'Access restored!'"
   ```

---

## Rollback Instructions

If you need to revert to previous config:

```bash
# Restore from backup
cp ~/.ssh/config ~/.ssh/config.current_broken
cp ~/.ssh/config.bak ~/.ssh/config

# Or from an earlier backup
cp ~/.ssh/config.bak_20260329_180454 ~/.ssh/config
```

---

**Last Updated**: 2026-05-29  
**Recovery Initiated By**: Claude  
**Status**: 🟡 PARTIALLY RECOVERED - Awaiting user action for full restoration
