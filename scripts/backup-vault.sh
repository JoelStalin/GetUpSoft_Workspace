#!/bin/bash

# Backup Obsidian vault to timestamped archive
#
# Usage:
#   ./scripts/backup-vault.sh
#   npm run notes:backup
#
# Creates: obsidian/backups/vault-YYYYMMDD_HHMMSS.tar.gz

set -e

# Configuration
VAULT_SOURCE="${PUBLIC_VAULT_PATH:-obsidian/vault/public}"
BACKUP_DIR="${BACKUP_PATH:-obsidian/backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/vault-$TIMESTAMP.tar.gz"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Main
main() {
    echo ""
    echo "============================================================"
    log_info "${CYAN}OBSIDIAN VAULT BACKUP${NC}"
    echo "============================================================"

    # Check source exists
    if [ ! -d "$VAULT_SOURCE" ]; then
        log_error "Source vault not found: $VAULT_SOURCE"
        exit 1
    fi

    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    log_info "Backup directory: $BACKUP_DIR"

    # Create backup
    log_info "Creating backup: $BACKUP_FILE"
    tar -czf "$BACKUP_FILE" -C "$(dirname "$VAULT_SOURCE")" "$(basename "$VAULT_SOURCE")" 2>/dev/null

    if [ ! -f "$BACKUP_FILE" ]; then
        log_error "Failed to create backup"
        exit 1
    fi

    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log_success "Backup created: $BACKUP_FILE ($BACKUP_SIZE)"

    # Clean up old backups
    log_info "Cleaning old backups (retention: $RETENTION_DAYS days)"
    CUTOFF_TIME=$(date -d "$RETENTION_DAYS days ago" +%s)
    DELETED_COUNT=0

    for backup in "$BACKUP_DIR"/vault-*.tar.gz; do
        if [ -f "$backup" ]; then
            FILE_TIME=$(stat -c %Y "$backup" 2>/dev/null || stat -f %m "$backup" 2>/dev/null || echo 0)
            if [ "$FILE_TIME" -lt "$CUTOFF_TIME" ]; then
                rm -f "$backup"
                log_warn "Deleted old backup: $(basename "$backup")"
                ((DELETED_COUNT++))
            fi
        fi
    done

    if [ "$DELETED_COUNT" -gt 0 ]; then
        log_info "Deleted $DELETED_COUNT old backups"
    fi

    # List recent backups
    echo ""
    log_info "Recent backups:"
    ls -lht "$BACKUP_DIR"/vault-*.tar.gz 2>/dev/null | head -5 | awk '{print "  " $9 " (" $5 ")"}'

    echo ""
    echo "============================================================"
    log_success "Backup complete"
    echo "============================================================"
    echo ""
    log_info "To restore from backup:"
    echo "  tar -xzf $BACKUP_FILE -C obsidian/vault/"
    echo ""
}

main "$@"
