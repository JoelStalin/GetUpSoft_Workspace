# GSTACK Secret Setup for ORCA

## Objective
Load real GSTACK/ORCA credentials securely in local environments without committing secrets.

## Files
- Tracked template: apps/orca/env.gstack.local.example
- Local secret file (ignored): apps/orca/.env.gstack.local
- Loader script: scripts/gstack_orca_load_env.sh
- Contract smoke test: scripts/gstack_orca_smoke.sh

## Steps
1. Copy the tracked template:

```bash
cp apps/orca/env.gstack.local.example apps/orca/.env.gstack.local
```

2. Edit apps/orca/.env.gstack.local and replace placeholders with real values.

3. Load and validate:

```bash
bash scripts/gstack_orca_load_env.sh
```

Or set the key securely (hidden prompt) and validate in one step:

```bash
bash scripts/gstack_orca_set_key.sh
```

Optional custom path:

```bash
bash scripts/gstack_orca_load_env.sh path/to/.env.custom
```

## Validation Behavior
The loader fails when:
- env file is missing
- GSTACK_API_KEY is empty or left as replace-me
- GSTACK_BASE_URL is empty or left as replace-me
- ORCA contract checks fail in smoke test

## Security Notes
- Do not commit apps/orca/.env.gstack.local
- Rotate keys periodically
- Prefer secret managers in CI/CD
