# GetUpSoft Portals Regression

This automation validates the GetUpSoft public portals after infrastructure or branding changes.

## Components

- `scripts/getupsoft_portals_scrapling_smoke.py`
  - Verifies the public `.com.do` portals with Scrapling.
  - Confirms the expected document title, root node, and at least one static asset.
- `tests/e2e/getupsoft_portals_suite.py`
  - Verifies the same portals with Selenium using the repository's cloned Chrome profile runtime.
  - Defaults to interactive mode and supports headless execution with `SELENIUM_HEADLESS=1`.
- `automation/n8n/getupsoft-portals-regression-workflow.json`
  - Runs both checks from n8n and merges the JSON output into a single report payload.

## Commands

```powershell
pwsh -File scripts/setup_scrapling_env.ps1
.\\.venv-scrapling\\Scripts\\python.exe scripts/getupsoft_portals_scrapling_smoke.py
set SELENIUM_HEADLESS=1
python tests/e2e/getupsoft_portals_suite.py
```

`Scrapling` is intentionally isolated in `.venv-scrapling` so the main Python environment keeps passing `pip check`.

## n8n Import

Import:

- `automation/n8n/getupsoft-portals-regression-workflow.json`

The workflow includes:

- manual trigger
- 6-hour schedule trigger
- Scrapling smoke node
- Selenium suite node
- merged JSON report node

## Scope

Validated targets:

- `https://getupsoft.com.do`
- `https://admin.getupsoft.com.do`
- `https://easycount.getupsoft.com.do`

If a target is not publicly resolvable from the execution environment, the automation reports that target as `blocked` instead of pretending the portal failed. This is the expected behavior while DNS rollout is still incomplete.

These are the externally reachable hosts confirmed from this workspace. The `.com` aliases are already configured in the shared-host nginx router and should be added to this workflow once public DNS resolution is visible from the execution environment.
