# QA Changelog — 2026-05-24

## Scope

Automation and evidence hardening for ORCA Client Gateway vertical-flow QA.

## Added

1. QA execution script:
   - `apps/orca-client-gateway/scripts/qa/run-vertical-flow.ps1`
   - Runs full flow:
     - tenant
     - pairing
     - enroll
     - heartbeat
     - command
     - poll
     - result
     - revoke
     - post-revoke heartbeat rejection
     - audit verification
   - Generates timestamped JSON evidence.
   - Optional SSH log validation (`journalctl`) with fail on `error|exception|fail`.

2. QA report:
   - `apps/orca-client-gateway/docs/qa/QA_REPORT.md`
   - Includes real execution evidence for:
     - internal endpoint (`http://localhost:8915`)
     - public endpoint (`https://ethernet-deck-frog-holds.trycloudflare.com`)
   - Includes log validation outcome.

3. GitHub Actions workflow:
   - `.github/workflows/orca-gateway-qa.yml`
   - Manual dispatch (`workflow_dispatch`) with:
     - `base_url`
     - `validate_logs`
   - Produces JSON artifact:
     - `orca-gateway-qa-evidence`
   - Optional remote SSH log gate with required secrets:
     - `SSH_HOST`
     - `SSH_USER`
     - `SSH_KEY`
     - `SUDO_PASSWORD`

4. README QA Gates:
   - `apps/orca-client-gateway/README.md`
   - Added QA section with workflow usage, required secrets, and local script command.

## Evidence generated

- `apps/orca-client-gateway/docs/qa/evidence/vertical-flow-20260524-035802.json`

## Validation summary

- Vertical flow: PASS
- Post-revoke heartbeat rejection: PASS
- Audit presence: PASS
- Log gate (when enabled): PASS

## Repro commands

```powershell
powershell -ExecutionPolicy Bypass -File apps/orca-client-gateway/scripts/qa/run-vertical-flow.ps1 `
  -BaseUrl "https://ethernet-deck-frog-holds.trycloudflare.com" `
  -OutDir "apps/orca-client-gateway/docs/qa/evidence" `
  -ValidateLogs `
  -SshHost "ubuntu@ssh.getupsoft.com.do" `
  -SystemdService "orca-client-gateway-api.service" `
  -SudoPassword "********"
```

