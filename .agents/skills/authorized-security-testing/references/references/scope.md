# Scope

## Allowed

- Review code and configuration for security issues.
- Check authentication, authorization, sessions, CSRF, CORS, cookies, headers, and TLS.
- Inspect dependency risk, secrets exposure, and logging hygiene.
- Run controlled smoke tests and safe validation against owned or authorized targets.
- Produce remediation guidance and verification steps.

## Not Allowed

- Exploit payload generation for public targets.
- Credential theft, phishing, malware, persistence, or stealth.
- Attacks intended to bypass access controls on systems not explicitly authorized.
- Social engineering or deceptive workflows.
- Any action that would harm, disrupt, or exfiltrate data from unauthorized systems.

## Decision Rule

If the request could be used to attack an unapproved system, stop and redirect to a defensive, authorized alternative.
