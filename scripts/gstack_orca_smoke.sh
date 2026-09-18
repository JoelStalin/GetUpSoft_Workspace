#!/usr/bin/env bash
set -euo pipefail

required_vars=(
  GSTACK_BASE_URL
  GSTACK_API_KEY
  GSTACK_DEFAULT_MODEL
  GSTACK_FALLBACK_MODELS
  ORCA_DEFAULT_PROVIDER
  ORCA_DEFAULT_MODEL
  ORCA_ENABLE_MULTI_MODEL
)

missing=()
for var in "${required_vars[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    missing+=("$var")
  fi
done

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "FAIL: missing required variables: ${missing[*]}"
  exit 1
fi

if [[ "$ORCA_ENABLE_MULTI_MODEL" != "true" ]]; then
  echo "FAIL: ORCA_ENABLE_MULTI_MODEL must be true"
  exit 1
fi

if [[ "$ORCA_DEFAULT_PROVIDER" != "gstack" ]]; then
  echo "FAIL: ORCA_DEFAULT_PROVIDER must be gstack"
  exit 1
fi

echo "PASS: GSTACK + ORCA environment contract is valid"
