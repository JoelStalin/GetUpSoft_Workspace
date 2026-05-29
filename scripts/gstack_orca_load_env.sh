#!/usr/bin/env bash
set -euo pipefail

# Loads GSTACK/ORCA variables from a local env file, validates placeholders,
# and runs the smoke check.
ENV_FILE="${1:-apps/orca/.env.gstack.local}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "FAIL: env file not found: $ENV_FILE"
  echo "Create it from apps/orca/env.gstack.local.example"
  exit 1
fi

# shellcheck disable=SC1090
set -a
source "$ENV_FILE"
set +a

if [[ "${GSTACK_API_KEY:-}" == "replace-me" || -z "${GSTACK_API_KEY:-}" ]]; then
  echo "FAIL: GSTACK_API_KEY is empty or still set to placeholder"
  exit 1
fi

if [[ "${GSTACK_BASE_URL:-}" == "replace-me" || -z "${GSTACK_BASE_URL:-}" ]]; then
  echo "FAIL: GSTACK_BASE_URL is empty or still set to placeholder"
  exit 1
fi

bash scripts/gstack_orca_smoke.sh

echo "PASS: Local GSTACK/ORCA env loaded from $ENV_FILE"
