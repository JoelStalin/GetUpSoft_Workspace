#!/usr/bin/env bash
set -euo pipefail

TRANSFER_DIR="${1:-/home/ubuntu/workspaces/transfer}"

if [[ -d "$TRANSFER_DIR" ]]; then
  find "$TRANSFER_DIR" -maxdepth 1 -type f \( -name '*.tgz' -o -name '*.tar.gz' -o -name '*.zip' -o -name '*.tar' \) -delete
fi

find /home/ubuntu/workspaces/GetUpSoft_Workspace -type d \
  \( -name node_modules -o -name .next -o -name __pycache__ -o -name .pytest_cache -o -name .mypy_cache -o -name .ruff_cache -o -name test-results \) \
  -prune -exec rm -rf {} +

find /home/ubuntu/workspaces/GetUpSoft_Workspace -type f \
  \( -name '*.zip' -o -name '*.tar' -o -name '*.tar.gz' -o -name '*.tgz' -o -name '*.7z' -o -name '*.rar' \) \
  -delete
