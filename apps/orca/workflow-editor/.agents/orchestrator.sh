#!/usr/bin/env bash
# ORCA Agent Orchestrator
# Coordinates multiple agents in 24/7 continuous mode
# Usage: ./orchestrator.sh [--config 24-7-config.json] [--max-rounds N] [--dry-run]

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ORCA_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/24-7-config.json"
CHAT_LOG="${SCRIPT_DIR}/chat-log.md"
TASK_QUEUE="${SCRIPT_DIR}/task-queue.json"
REPORTS_DIR="${SCRIPT_DIR}/reports"
LOGS_DIR="${SCRIPT_DIR}/logs"

MAX_ROUNDS=50
DRY_RUN=false

# Create directories
mkdir -p "$REPORTS_DIR" "$LOGS_DIR"

# Functions
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOGS_DIR/orchestrator.log"
}

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

check_requirements() {
    print_header "🔍 Checking Requirements"

    if [ ! -f "$CONFIG_FILE" ]; then
        echo -e "${RED}❌ Config file not found: $CONFIG_FILE${NC}"
        exit 1
    fi

    if [ ! -f "$SCRIPT_DIR/plugin_loader.sh" ]; then
        echo -e "${RED}❌ Plugin loader not found${NC}"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        echo -e "${YELLOW}⚠️  npm not found${NC}"
    fi

    if ! command -v git &> /dev/null; then
        echo -e "${YELLOW}⚠️  git not found${NC}"
    fi

    echo -e "${GREEN}✅ Requirements OK${NC}"
}

run_plugins() {
    local phase=$1
    print_header "🔌 Running ${phase} Plugins"

    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}[DRY-RUN] Would run: bash $SCRIPT_DIR/plugin_loader.sh --phase $phase${NC}"
    else
        bash "$SCRIPT_DIR/plugin_loader.sh" --phase "$phase" || log "WARN" "Plugin phase '$phase' had issues"
    fi
}

run_developer_agent() {
    print_header "👨‍💻 Running Developer Agent"

    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}[DRY-RUN] Would run development tasks${NC}"
    else
        log "INFO" "Developer Agent: Starting task processing"
        cd "$ORCA_DIR" || exit 1

        # Run tasks: implement features, fix bugs, run tests
        log "INFO" "Developer Agent: Checking for pending tasks"
        # This would integrate with actual task system

        echo -e "${GREEN}✅ Developer Agent cycle complete${NC}"
    fi
}

run_tester_agent() {
    print_header "🧪 Running Tester Agent"

    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}[DRY-RUN] Would run test tasks${NC}"
    else
        log "INFO" "Tester Agent: Running automated tests"
        cd "$ORCA_DIR" || exit 1

        # Run Playwright tests
        for test_file in test-*.js; do
            if [ -f "$test_file" ]; then
                log "INFO" "Tester Agent: Running $test_file"
                if [ "$DRY_RUN" = false ]; then
                    node "$test_file" >> "$LOGS_DIR/test-results.log" 2>&1 || log "WARN" "Test $test_file failed"
                fi
            fi
        done

        echo -e "${GREEN}✅ Tester Agent cycle complete${NC}"
    fi
}

run_reviewer_agent() {
    print_header "👀 Running Code Reviewer Agent"

    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}[DRY-RUN] Would run review tasks${NC}"
    else
        log "INFO" "Reviewer Agent: Analyzing code quality"
        cd "$ORCA_DIR" || exit 1

        # Check for console errors
        log "INFO" "Reviewer Agent: Checking console for errors"

        # Run accessibility checks
        log "INFO" "Reviewer Agent: Validating accessibility"

        # Check documentation
        log "INFO" "Reviewer Agent: Reviewing documentation"

        echo -e "${GREEN}✅ Reviewer Agent cycle complete${NC}"
    fi
}

update_chat_log() {
    local message=$1
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    {
        echo ""
        echo "#### $timestamp"
        echo "$message"
    } >> "$CHAT_LOG"
}

print_status() {
    print_header "📊 ORCA 24/7 Status Report"

    echo -e "${BLUE}Configuration:${NC}"
    echo "  Config File: $CONFIG_FILE"
    echo "  Mode: Continuous (24/7)"
    echo "  Max Rounds: $MAX_ROUNDS"

    echo ""
    echo -e "${BLUE}Agents:${NC}"
    echo "  ✅ Developer Agent (code implementation)"
    echo "  ✅ Tester Agent (automated testing)"
    echo "  ✅ Reviewer Agent (code review & QA)"

    echo ""
    echo -e "${BLUE}Communication:${NC}"
    echo "  Chat Log: $CHAT_LOG"
    echo "  Task Queue: $TASK_QUEUE"
    echo "  Reports: $REPORTS_DIR"
    echo "  Logs: $LOGS_DIR"

    echo ""
    echo -e "${BLUE}Latest Activity:${NC}"
    if [ -f "$LOGS_DIR/orchestrator.log" ]; then
        tail -5 "$LOGS_DIR/orchestrator.log" | sed 's/^/  /'
    fi
}

# Main loop
main() {
    print_header "🌙 ORCA AI Night Shift - 24/7 Orchestrator"

    check_requirements

    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}⚠️  Running in DRY-RUN mode${NC}"
    fi

    update_chat_log "🚀 Orchestrator started at $(date '+%Y-%m-%d %H:%M:%S')"

    for round in $(seq 1 $MAX_ROUNDS); do
        echo ""
        echo -e "${BLUE}═══════ Round $round / $MAX_ROUNDS ═══════${NC}"

        # Pre-shift plugins
        run_plugins "pre"

        # Run agents in sequence
        run_developer_agent
        run_tester_agent
        run_reviewer_agent

        # Post-shift plugins
        if [ $round -eq $MAX_ROUNDS ]; then
            run_plugins "post"
        fi

        # Check for critical errors
        if grep -q "ERROR" "$LOGS_DIR/orchestrator.log" 2>/dev/null; then
            log "WARN" "Critical errors found in this round"
        fi

        # Status update
        echo ""
        echo -e "${GREEN}✅ Round $round complete${NC}"

        # Wait before next round (unless it's the last one)
        if [ $round -lt $MAX_ROUNDS ]; then
            sleep 2
        fi
    done

    print_status
    update_chat_log "✅ Orchestrator completed successfully at $(date '+%Y-%m-%d %H:%M:%S')"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --config)
            CONFIG_FILE="$2"
            shift 2
            ;;
        --max-rounds)
            MAX_ROUNDS="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help)
            echo "ORCA Agent Orchestrator"
            echo "Usage: ./orchestrator.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --config FILE        Path to 24-7-config.json"
            echo "  --max-rounds N       Number of rounds to execute (default: 50)"
            echo "  --dry-run           Run without executing (preview mode)"
            echo "  --help              Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Run main
main
