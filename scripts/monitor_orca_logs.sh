#!/bin/bash
#
# V19 ORCA Logs Real-Time Monitor
# Purpose: Monitor Odoo logs for errors and ORCA-specific issues
# Usage: ./monitor_orca_logs.sh [log_file_path]

LOG_FILE="${1:-/var/log/odoo/odoo.log}"
CHECK_INTERVAL=5  # seconds
ALERT_LOG="test-results/orca_alerts_$(date +%Y%m%d_%H%M%S).log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

mkdir -p "test-results"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}ORCA Logs Real-Time Monitor${NC}"
echo -e "${BLUE}============================================${NC}"
echo "Monitoring: $LOG_FILE"
echo "Check interval: ${CHECK_INTERVAL}s"
echo "Alert log: $ALERT_LOG"
echo ""
echo "Press Ctrl+C to stop monitoring"
echo ""

# Store last read position
LAST_SIZE=0

# Error keywords to watch for
declare -a ERROR_KEYWORDS=(
    "orca.*error"
    "error.*orca"
    "module.*error.*extended"
    "error.*extended"
    "CRITICAL"
    "ImportError"
    "AttributeError"
    "KeyError"
    "TypeError"
    "model.*not.*found"
)

# Function to check for new errors
check_logs() {
    if [ ! -f "$LOG_FILE" ]; then
        echo -e "${YELLOW}⚠️  Log file not found: $LOG_FILE${NC}"
        return
    fi

    CURRENT_SIZE=$(wc -c < "$LOG_FILE")

    # Only check if file grew
    if [ "$CURRENT_SIZE" -gt "$LAST_SIZE" ]; then
        # Extract new lines
        local tail_lines=$((($CURRENT_SIZE - $LAST_SIZE) / 60))  # Rough estimate
        if [ "$tail_lines" -lt 10 ]; then
            tail_lines=50
        fi

        NEW_CONTENT=$(tail -n "$tail_lines" "$LOG_FILE")

        # Check for errors
        local error_found=false

        for keyword in "${ERROR_KEYWORDS[@]}"; do
            if echo "$NEW_CONTENT" | grep -qi "$keyword"; then
                error_found=true

                echo -e "${RED}[$(date +'%H:%M:%S')] ⚠️  ERROR DETECTED:${NC} $keyword"

                # Log to file
                echo "[$(date +'%H:%M:%S')] ERROR: $keyword" >> "$ALERT_LOG"

                # Extract matching lines
                echo "$NEW_CONTENT" | grep -i "$keyword" | head -3 | while read -r line; do
                    echo -e "${RED}  → $line${NC}"
                    echo "  → $line" >> "$ALERT_LOG"
                done
            fi
        done

        # Check for successful operations
        if echo "$NEW_CONTENT" | grep -qi "successfully loaded\|installation successful\|modules.*loaded"; then
            if ! $error_found; then
                echo -e "${GREEN}[$(date +'%H:%M:%S')] ✅ Module loaded successfully${NC}"
            fi
        fi

        LAST_SIZE=$CURRENT_SIZE
    fi
}

# Function to get log stats
get_stats() {
    echo ""
    echo -e "${BLUE}=== Log Statistics ===${NC}"

    if [ ! -f "$LOG_FILE" ]; then
        return
    fi

    local error_count=$(tail -n 500 "$LOG_FILE" | grep -i "ERROR\|CRITICAL" | wc -l)
    local orca_count=$(tail -n 500 "$LOG_FILE" | grep -i "orca" | wc -l)
    local warn_count=$(tail -n 500 "$LOG_FILE" | grep -i "WARNING" | wc -l)

    echo "Last 500 lines analysis:"
    echo -e "  ${RED}Errors/Critical: $error_count${NC}"
    echo -e "  ${YELLOW}Warnings: $warn_count${NC}"
    echo -e "  ${GREEN}ORCA mentions: $orca_count${NC}"

    # Show recent ORCA operations
    echo ""
    echo -e "${BLUE}=== Recent ORCA Operations ===${NC}"
    tail -n 200 "$LOG_FILE" | grep -i "orca\|installed\|error" | tail -10
}

# Set up trap to catch Ctrl+C
trap 'echo ""; echo "Monitoring stopped. Check alerts at: $ALERT_LOG"; exit 0' INT

# Main monitoring loop
echo "Starting monitoring... ($(date +'%H:%M:%S'))"
echo ""

iteration=0
while true; do
    check_logs

    iteration=$((iteration + 1))

    # Show stats every 12 iterations (60 seconds)
    if [ $((iteration % 12)) -eq 0 ]; then
        get_stats
    fi

    sleep "$CHECK_INTERVAL"
done
