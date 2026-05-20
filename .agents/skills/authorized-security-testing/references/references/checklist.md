# Checklist

## Static Review

- Review README, deployment files, CI, env examples, and secret handling.
- Search for hardcoded credentials, insecure defaults, and missing validation.
- Check dependency manifests for outdated or risky packages.

## App Security

- Authentication and authorization.
- Session handling and cookie flags.
- CSRF protection on state-changing routes.
- Input validation and output encoding.
- File upload and download handling.
- CORS, CSP, security headers, and redirect behavior.

## Runtime Checks

- Confirm health endpoints and error paths behave safely.
- Validate rate limiting and abuse controls where applicable.
- Inspect logs for sensitive data exposure.
- Verify admin and privileged actions are isolated.

## Reporting

- State the exact target and date/time of the test.
- Include reproduction steps that are safe and authorized.
- Distinguish confirmed issues from potential risks.
- End with concrete remediation and a retest plan.
