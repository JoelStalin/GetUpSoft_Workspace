# GitHub Provisioning Report

Date: 2026-05-09

## Created Repositories

| Repository | Visibility | Status |
| --- | --- | --- |
| `JoelStalin/getupsoft-web` | Private | Created and scaffolded |
| `JoelStalin/easycount-platform` | Private | Created and scaffolded |
| `JoelStalin/getupsoft-odoo-integration` | Private | Created and scaffolded |
| `JoelStalin/getupsoft-infra` | Private | Created and scaffolded |

## Scaffold

Each repository has:

- `README.md`
- `.github/CODEOWNERS`
- `.github/pull_request_template.md`
- `.github/ISSUE_TEMPLATE/task.md`
- `.github/workflows/ci.yml`
- Repository variables for canonical GetUpSoft and EasyCount URLs

## Constraint

GitHub branch protection API returned that private repository branch protection requires a paid GitHub plan or public repositories. This is an account-plan constraint, not a repo configuration failure.

## Secrets

Secret names are documented in `variable-matrix.md`. Secret values were not available through GitHub APIs and were not copied from local files. They must be set with `gh secret set` or a GitHub environment secret manager once final deployment credentials are issued.
