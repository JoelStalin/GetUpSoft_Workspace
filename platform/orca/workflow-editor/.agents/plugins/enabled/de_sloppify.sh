#!/usr/bin/env bash
# PLUGIN_NAME: De-Sloppify Pass
# PLUGIN_PHASE: task
# PLUGIN_DESCRIPTION: Quality cleanup pass after each development round — removes code slop
#
# Inspired by the De-Sloppify Pattern from the autonomous-loops methodology.
# Instead of adding negative instructions to the main prompt (which degrades quality),
# this runs a separate focused cleanup pass.

set -euo pipefail

NIGHT_SHIFT_DIR="${NIGHT_SHIFT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
CLAUDE_BIN="${CLAUDE_BIN:-claude}"
SKIP_PERMISSIONS="${SKIP_PERMISSIONS:-false}"

echo "=== De-Sloppify Plugin ==="

# Check if there are uncommitted changes to review
if ! command -v git &>/dev/null; then
    echo "Git not available, skipping"
    exit 0
fi

# Find the project directory (customize this)
PROJECT_DIR="${PROJECT_DIR:-$(pwd)}"

cd "$PROJECT_DIR" || exit 0

CHANGES=$(git diff --name-only 2>/dev/null || true)
STAGED=$(git diff --cached --name-only 2>/dev/null || true)

if [ -z "$CHANGES" ] && [ -z "$STAGED" ]; then
    echo "No changes to de-sloppify"
    exit 0
fi

echo "Reviewing changes for code slop..."

# Run Claude Code in cleanup mode
# Note: --print is read-only (review only). To auto-fix, set SKIP_PERMISSIONS=true.
CLAUDE_FLAGS=()
if [ "$SKIP_PERMISSIONS" = "true" ]; then
    CLAUDE_FLAGS+=(--dangerously-skip-permissions)
else
    CLAUDE_FLAGS+=(--print)
fi

if command -v "$CLAUDE_BIN" &>/dev/null; then
    "$CLAUDE_BIN" "${CLAUDE_FLAGS[@]}" -p "Review all uncommitted changes in this repository. Remove:
- Tests that verify language/framework behavior rather than business logic
- Redundant type checks that the type system already enforces
- Over-defensive error handling for impossible states
- Console.log/print debug statements
- Commented-out code blocks
- Unnecessary TODO comments

Keep all business logic tests and meaningful error handling.
Run the test suite after cleanup to ensure nothing breaks.
Make minimal, surgical changes only." 2>&1 | head -50

    echo "De-sloppify pass complete"
else
    echo "Claude CLI not found, skipping de-sloppify"
fi
