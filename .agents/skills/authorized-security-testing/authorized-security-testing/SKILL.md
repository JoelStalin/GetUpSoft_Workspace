---
name: authorized-security-testing
description: Defensive security auditing for projects the user owns or is explicitly authorized to test. Use when the task is to review application security, run non-destructive checks, validate auth/session handling, inspect headers/TLS/configuration, review dependencies and secrets, or produce prioritized remediation notes. Do not use for offensive exploitation, malware, credential theft, phishing, stealth, or public-target attack workflows.
---

# Authorized Security Testing

Use this skill for defensive assessment only. Keep the scope limited to systems the user owns or has explicit permission to test.

## Workflow

1. Confirm scope.
   - Identify the project, environment, and owner.
   - Confirm the user is authorized to test it.
   - Ask for a target URL, repo path, or service name if it is missing.

2. Prefer non-destructive checks first.
   - Review code, routes, configs, and dependency manifests.
   - Check auth, session, CSRF, input validation, rate limiting, headers, secrets, and logging.
   - Validate TLS, redirects, CORS, cookie flags, and error handling.

3. Use active tests only when they are safe and authorized.
   - Prefer passive crawling, request inspection, and controlled smoke tests.
   - Keep payloads minimal and reversible.
   - Avoid exploit chaining, persistence, credential theft, evasion, or malware-like behavior.

4. Report findings clearly.
   - Rank issues by severity and likelihood.
   - Include concrete evidence, affected files or endpoints, and remediation steps.
   - Separate confirmed issues from hypotheses.

## Output Format

- Scope tested
- Checks performed
- Findings with severity
- Evidence
- Remediation
- Residual risk

## Use References

- Read `references/scope.md` for allowed and disallowed work.
- Read `references/checklist.md` for the standard review checklist.
