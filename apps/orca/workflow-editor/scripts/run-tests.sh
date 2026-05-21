#!/bin/bash
# Automated test runner with progress tracking for ORCA Workflow Editor
# Usage: ./scripts/run-tests.sh [phase] [test-type]

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PHASE=${1:-2}
TEST_TYPE=${2:-all}  # all, unit, integration, selenium
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TEST_RESULTS_FILE="$PROJECT_ROOT/test-results-phase-$PHASE-$TIMESTAMP.json"
COVERAGE_FILE="$PROJECT_ROOT/coverage/phase-$PHASE.json"
LOG_FILE="$PROJECT_ROOT/logs/test-phase-$PHASE-$TIMESTAMP.log"

# Create directories
mkdir -p "$PROJECT_ROOT/coverage"
mkdir -p "$PROJECT_ROOT/logs"
mkdir -p "$PROJECT_ROOT/test-results"

# Initialize log
{
  echo "🧪 ORCA Workflow Editor - Phase $PHASE Test Suite"
  echo "=================================================="
  echo "Test Type: $TEST_TYPE"
  echo "Start Time: $(date)"
  echo "Timestamp: $TIMESTAMP"
  echo "Log File: $LOG_FILE"
  echo ""

  # Check Node.js
  echo "Environment Check:"
  echo "  Node: $(node -v)"
  echo "  npm: $(npm -v)"
  echo ""

  TESTS_PASSED=0
  TESTS_FAILED=0
  TOTAL_COVERAGE=0

  # 1. Run Unit Tests (if requested)
  if [ "$TEST_TYPE" = "all" ] || [ "$TEST_TYPE" = "unit" ]; then
    echo "1️⃣  Running Unit Tests..."
    if npm run test:unit -- --phase=$PHASE >> "$LOG_FILE" 2>&1; then
      echo "   ✅ Unit tests passed"
      ((TESTS_PASSED++))
    else
      echo "   ❌ Unit tests failed"
      ((TESTS_FAILED++))
    fi
    echo ""
  fi

  # 2. Run Integration Tests (if requested)
  if [ "$TEST_TYPE" = "all" ] || [ "$TEST_TYPE" = "integration" ]; then
    echo "2️⃣  Running Integration Tests..."
    if npm run test:integration -- --phase=$PHASE >> "$LOG_FILE" 2>&1; then
      echo "   ✅ Integration tests passed"
      ((TESTS_PASSED++))
    else
      echo "   ❌ Integration tests failed"
      ((TESTS_FAILED++))
    fi
    echo ""
  fi

  # 3. Run Selenium Tests (if requested)
  if [ "$TEST_TYPE" = "all" ] || [ "$TEST_TYPE" = "selenium" ]; then
    echo "3️⃣  Running Selenium Tests..."
    if command -v pytest &> /dev/null; then
      if python -m pytest "tests/selenium/phase${PHASE}_tests.py" \
        --json-report \
        --json-report-file="$TEST_RESULTS_FILE" \
        -v >> "$LOG_FILE" 2>&1; then
        echo "   ✅ Selenium tests passed"
        ((TESTS_PASSED++))
      else
        echo "   ❌ Selenium tests failed"
        ((TESTS_FAILED++))
      fi
    else
      echo "   ⚠️  pytest not found, skipping Selenium tests"
    fi
    echo ""
  fi

  # 4. Generate Coverage Report
  if [ -f "$COVERAGE_FILE" ]; then
    echo "4️⃣  Coverage Report:"
    TOTAL_COVERAGE=$(grep -o '"overall": [0-9.]*' "$COVERAGE_FILE" | grep -o '[0-9.]*')
    echo "   Coverage: ${TOTAL_COVERAGE}%"
    echo ""
  fi

  # 5. Update Progress
  echo "5️⃣  Updating Progress..."
  if [ -f "$PROJECT_ROOT/scripts/updateProgress.js" ]; then
    node "$PROJECT_ROOT/scripts/updateProgress.js" \
      --phase=$PHASE \
      --tests-passed=$TESTS_PASSED \
      --tests-failed=$TESTS_FAILED \
      --coverage=$TOTAL_COVERAGE >> "$LOG_FILE" 2>&1
    echo "   ✅ Progress updated"
  fi

  echo ""
  echo "=================================================="
  echo "📊 Test Summary"
  echo "=================================================="
  echo "Test Suite Runs Passed: $TESTS_PASSED"
  echo "Test Suite Runs Failed: $TESTS_FAILED"
  if [ "$TOTAL_COVERAGE" != "" ]; then
    echo "Overall Coverage: ${TOTAL_COVERAGE}%"
  fi
  echo "End Time: $(date)"
  echo ""

  if [ $TESTS_FAILED -eq 0 ]; then
    echo "✅ ALL TESTS PASSED!"
    exit 0
  else
    echo "❌ SOME TESTS FAILED"
    echo "Check log: $LOG_FILE"
    exit 1
  fi

} 2>&1 | tee "$LOG_FILE"
