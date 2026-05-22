#!/usr/bin/env bash
# PLUGIN_NAME: GNAP Checkpoint
# PLUGIN_PHASE: post
#
# gnap_checkpoint.sh — Git-native state checkpointing plugin
# Inspired by GNAP (https://github.com/farol-team/gnap)
#
# Phase: post (runs after each night shift round)
# Purpose: Commit agent state to a git branch for crash recovery
#          and cross-machine resume capability.
#
# Usage:
#   Enable by copying to plugins/post/gnap_checkpoint.sh
#   Configure via environment variables below.
#
# Ref: https://github.com/JudyaiLab/ai-night-shift/issues/1

set -euo pipefail

# === Configuration ===
CHECKPOINT_BRANCH="${CHECKPOINT_BRANCH:-nightshift/state}"
CHECKPOINT_DIR="${CHECKPOINT_DIR:-$(cd "$(dirname "$(realpath "$0")")/../.." && pwd)}"
STATE_FILES=(
    "protocols/night_chat.md"
    "protocols/bot_inbox"
)
MAX_CHECKPOINTS="${MAX_CHECKPOINTS:-50}"

# === Cleanup trap ===
_cleanup_dirs=()
cleanup() {
    for d in "${_cleanup_dirs[@]}"; do
        [ -d "$d" ] && rm -rf "$d" 2>/dev/null || true
    done
    # Remove worktree if it was created
    if [ -n "${_worktree_dir:-}" ] && [ -d "$_worktree_dir" ]; then
        cd "$CHECKPOINT_DIR" 2>/dev/null || true
        git worktree remove --force "$_worktree_dir" 2>/dev/null || true
    fi
}
trap cleanup EXIT

# === Functions ===

log() { echo "[gnap_checkpoint] $(date '+%H:%M:%S') $1"; }

prune_checkpoints() {
    local count
    count=$(git rev-list --count "$CHECKPOINT_BRANCH" 2>/dev/null || echo 0)
    if [ "$count" -gt "$MAX_CHECKPOINTS" ]; then
        local keep_from
        keep_from=$(git rev-list --reverse "$CHECKPOINT_BRANCH" | tail -n "$MAX_CHECKPOINTS" | head -1)
        git replace --graft "$keep_from" 2>/dev/null && \
            git reflog expire --expire=now --all 2>/dev/null && \
            git gc --prune=now --quiet 2>/dev/null && \
            log "Pruned to $MAX_CHECKPOINTS checkpoints" || true
    fi
}

checkpoint() {
    cd "$CHECKPOINT_DIR" || { log "ERROR: Cannot cd to $CHECKPOINT_DIR"; return 1; }

    # Ensure we're in a git repo
    if ! git rev-parse --git-dir &>/dev/null; then
        log "SKIP: Not a git repository"
        return 0
    fi

    # Save current branch
    local current_branch
    current_branch=$(git branch --show-current 2>/dev/null || echo "main")

    # Create state branch if it doesn't exist
    if ! git show-ref --verify --quiet "refs/heads/$CHECKPOINT_BRANCH"; then
        git checkout --orphan "$CHECKPOINT_BRANCH" 2>/dev/null
        git rm -rf . 2>/dev/null || true
        git commit --allow-empty -m "init: checkpoint branch" --quiet
        git checkout "$current_branch" 2>/dev/null
        log "Created checkpoint branch: $CHECKPOINT_BRANCH"
    fi

    # Collect state files
    local tmp_dir
    tmp_dir=$(mktemp -d)
    _cleanup_dirs+=("$tmp_dir")
    local has_files=false

    for pattern in "${STATE_FILES[@]}"; do
        if [ -e "$CHECKPOINT_DIR/$pattern" ]; then
            local target_dir
            target_dir="$tmp_dir/$(dirname "$pattern")"
            mkdir -p "$target_dir"
            cp -r "$CHECKPOINT_DIR/$pattern" "$target_dir/"
            has_files=true
        fi
    done

    if [ "$has_files" = false ]; then
        log "SKIP: No state files found"
        return 0
    fi

    # Add metadata
    cat > "$tmp_dir/checkpoint.json" << METADATA
{
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "hostname": "$(hostname)",
    "branch": "$current_branch",
    "round": "${NIGHT_SHIFT_ROUND:-unknown}",
    "agent": "${AGENT_NAME:-unknown}"
}
METADATA

    # Commit to state branch using worktree to avoid disrupting main work
    _worktree_dir=$(mktemp -d)

    git worktree add --quiet "$_worktree_dir" "$CHECKPOINT_BRANCH" 2>/dev/null || {
        log "ERROR: Failed to create worktree for checkpoint"
        return 1
    }

    # Copy state to worktree
    cp -r "$tmp_dir"/* "$_worktree_dir/"

    # Commit
    cd "$_worktree_dir"
    git add -A
    if git diff --cached --quiet; then
        log "SKIP: No state changes since last checkpoint"
    else
        local msg
        msg="checkpoint: round ${NIGHT_SHIFT_ROUND:-?} at $(date -u +%H:%M)"
        git commit -m "$msg" --quiet
        log "OK: State checkpointed ($msg)"
    fi

    # Cleanup worktree
    cd "$CHECKPOINT_DIR"
    git worktree remove --force "$_worktree_dir" 2>/dev/null || true
    _worktree_dir=""

    # Prune old checkpoints
    prune_checkpoints

    return 0
}

# === Resume function (call manually to restore state) ===
resume_from_checkpoint() {
    cd "$CHECKPOINT_DIR" || return 1

    if ! git show-ref --verify --quiet "refs/heads/$CHECKPOINT_BRANCH"; then
        log "No checkpoint branch found"
        return 1
    fi

    log "Restoring state from latest checkpoint..."

    for pattern in "${STATE_FILES[@]}"; do
        if git checkout "$CHECKPOINT_BRANCH" -- "$pattern" 2>/dev/null; then
            log "Restored: $pattern"
        else
            log "SKIP: $pattern not in checkpoint"
        fi
    done

    log "State restored. Check protocols/ for recovered data."
}

# === Main ===
if [ "${1:-}" = "--resume" ]; then
    resume_from_checkpoint
else
    checkpoint
fi
