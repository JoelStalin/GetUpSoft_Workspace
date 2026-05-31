#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-apps/orca/.env.gstack.local}"

if [[ ! -f "$ENV_FILE" ]]; then
  cp apps/orca/env.gstack.local.example "$ENV_FILE"
fi

read -rsp "Enter GSTACK_API_KEY: " GSTACK_KEY
echo

if [[ -z "$GSTACK_KEY" ]]; then
  echo "FAIL: GSTACK_API_KEY cannot be empty"
  exit 1
fi

tmp_file="$(mktemp)"
awk -v key="$GSTACK_KEY" '
BEGIN { found=0 }
/^GSTACK_API_KEY=/ {
  print "GSTACK_API_KEY=" key
  found=1
  next
}
{ print }
END {
  if (!found) print "GSTACK_API_KEY=" key
}
' "$ENV_FILE" > "$tmp_file"

mv "$tmp_file" "$ENV_FILE"
chmod 600 "$ENV_FILE"

bash scripts/gstack_orca_load_env.sh "$ENV_FILE"

echo "PASS: GSTACK_API_KEY configured in $ENV_FILE"
