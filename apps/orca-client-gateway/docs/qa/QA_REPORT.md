# ORCA Client Gateway QA Report

Date: 2026-05-24  
Environment: `ssh.getupsoft.com.do` (`getupsoft`)  
API service: `orca-client-gateway-api.service`  
Internal base URL: `http://localhost:8915`  
Public base URL (Quick Tunnel): `https://ethernet-deck-frog-holds.trycloudflare.com`

## Scope

Validated the required vertical flow with real HTTP calls:

1. Create tenant
2. Issue pairing code
3. Enroll device
4. Send heartbeat
5. Issue command
6. Poll command
7. Submit command result
8. Revoke device
9. Verify heartbeat is rejected after revoke
10. Verify audit entries are present

## Evidence A — Internal endpoint (`localhost:8915`)

Execution result:

```json
{
  "tenantId": "ten_fijxuo1j",
  "slug": "demo-1779594631",
  "pairingCode": "GTS-3534-XL",
  "deviceId": "dev_q0opszzd",
  "commandId": "cmd_shye1n79",
  "heartbeatOk": true,
  "resultOk": true,
  "revokeOk": true,
  "heartbeatAfterRevokeError": "device_revoked_or_not_found",
  "auditCount": 5
}
```

Expected/actual:

- Heartbeat before revoke: pass
- Result submission: pass
- Revoke: pass
- Heartbeat after revoke: rejected with `device_revoked_or_not_found` (pass)
- Audit list for device: non-empty (`5`) (pass)

## Evidence B — Public endpoint (Cloudflare Quick Tunnel)

Execution result:

```json
{
  "base": "https://ethernet-deck-frog-holds.trycloudflare.com",
  "tenantId": "ten_w6tt1jnx",
  "slug": "demo-public-1779594841",
  "pairingCode": "GTS-4068-XL",
  "deviceId": "dev_7e4d5wmc",
  "commandId": "cmd_l3v5sniz",
  "heartbeatOk": true,
  "resultOk": true,
  "revokeOk": true,
  "heartbeatAfterRevokeError": "device_revoked_or_not_found",
  "auditCount": 5
}
```

Expected/actual:

- Same lifecycle behavior as internal endpoint: pass
- Public path through tunnel reaches API correctly: pass

## Log Validation

Service log check performed after the public flow:

```bash
journalctl -u orca-client-gateway-api.service --since "5 min ago" --no-pager | grep -iE "error|exception|fail"
```

Result: no matches found.

## Repro Commands (minimal)

1. Service health:

```bash
curl -fsS http://localhost:8915/api/v1/health
curl -fsS https://ethernet-deck-frog-holds.trycloudflare.com/api/v1/health
```

2. Run end-to-end scripted flow from workspace host:

- Internal: use PowerShell `Invoke-RestMethod` against `http://localhost:8915`
- Public: use PowerShell `Invoke-RestMethod` against `https://ethernet-deck-frog-holds.trycloudflare.com`

The exact request/response payloads were validated in this report under Evidence A/B.

## QA Verdict

Status: **PASS** for the validated MVP vertical slice.

Validated acceptance points:

- Tenant creation
- Pairing issuance
- Device enrollment
- Heartbeat
- Command issue/poll/result
- Device revocation
- Post-revoke access denial
- Audit trace presence
- Log check without runtime errors

## Notes

- Current public endpoint is a Cloudflare Quick Tunnel URL and may rotate if the container is recreated.
- For stable QA URL, bind the service behind a named Cloudflare Tunnel route.
