#!/bin/bash
# Initialize a new phase with complete structure
# Usage: ./scripts/init-phase.sh <phase-number> <phase-name>

PHASE=$1
PHASE_NAME=$2
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ -z "$PHASE" ] || [ -z "$PHASE_NAME" ]; then
  echo "Usage: ./scripts/init-phase.sh <phase-number> <phase-name>"
  echo ""
  echo "Examples:"
  echo "  ./scripts/init-phase.sh 2 'State Management Enhancement'"
  echo "  ./scripts/init-phase.sh 3 'Professional Search & Navigation'"
  exit 1
fi

echo "📋 Initializing Phase $PHASE: $PHASE_NAME"
echo "Project root: $PROJECT_ROOT"
echo ""

# Create directories
echo "Creating directories..."
mkdir -p "$PROJECT_ROOT/docs/phases/phase-$PHASE"
mkdir -p "$PROJECT_ROOT/tests/unit/phase-$PHASE"
mkdir -p "$PROJECT_ROOT/tests/integration/phase-$PHASE"
mkdir -p "$PROJECT_ROOT/tests/selenium"

# Create phase documentation
echo "Creating phase documentation..."
cat > "$PROJECT_ROOT/docs/phases/phase-$PHASE/README.md" << EOF
# Phase $PHASE: $PHASE_NAME

## Overview

[Add comprehensive overview of this phase]

## Objectives

- [ ] Objective 1
- [ ] Objective 2
- [ ] Objective 3

## Files to Create

### Contexts/Providers
- [ ] New context file 1
- [ ] New context file 2

### Hooks
- [ ] New hook file 1
- [ ] New hook file 2

### Components
- [ ] Component modification 1
- [ ] Component modification 2

### Utils/Types
- [ ] New utility file 1
- [ ] New type definition file

## Files to Modify

- [ ] src/App.tsx
- [ ] src/components/WorkflowCanvas.tsx
- [ ] [Add more files]

## Test Coverage

- Unit tests: [X tests]
- Integration tests: [Y tests]
- Selenium tests: [Z tests]
- Target coverage: 80%+

## Timeline

- Start: $(date +%Y-%m-%d)
- Estimated completion: $(date -d "+X days" +%Y-%m-%d)
- Estimated effort: X hours

## Implementation Details

### Key Changes

[Document key architectural changes]

### New Patterns

[Document new patterns introduced]

### Breaking Changes

[List any breaking changes]

## Progress

- [ ] 0% - Planning
- [ ] 25% - Implementation
- [ ] 50% - Testing
- [ ] 75% - Refinement
- [ ] 100% - Complete

### Current Status

0% complete

## Issues & Blockers

None yet.

## Links

- [NeMo Integration Strategy](../../nemo_integration_strategy.md)
- [Complete Audit & Plan](../../complete_audit_and_plan.md)
- [Phase 2 Plan](../phase-2/IMPLEMENTATION.md)

## Notes

[Add implementation notes here]
EOF

# Create Selenium test template
echo "Creating Selenium test template..."
cat > "$PROJECT_ROOT/tests/selenium/phase${PHASE}_tests.py" << 'EOF'
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time
from datetime import datetime
import os

class TestPhase{PHASE}:
    """Phase {PHASE} Test Suite"""

    @pytest.fixture(scope="class")
    def driver(self):
        """Initialize WebDriver"""
        chrome_options = Options()
        chrome_options.add_argument("--start-maximized")

        driver = webdriver.Chrome(options=chrome_options)
        driver.implicitly_wait(10)
        yield driver
        driver.quit()

    def test_01_page_loads(self, driver):
        """Test that workflow editor loads"""
        driver.get("http://localhost:5173")
        time.sleep(2)

        # Verify basic elements
        title = driver.find_element(By.TAG_NAME, "body")
        assert title.is_displayed(), "Page should be visible"

        # Take screenshot
        self._take_screenshot(driver, "test-01-page-loads")

    def test_02_placeholder(self, driver):
        """Placeholder test for phase implementation"""
        assert True, "Placeholder test should pass"
        self._take_screenshot(driver, "test-02-placeholder")

    # Add more tests here

    def _take_screenshot(self, driver, test_name):
        """Take and save screenshot"""
        screenshots_dir = "test-results/screenshots"
        os.makedirs(screenshots_dir, exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{screenshots_dir}/phase-{PHASE}_{test_name}_{timestamp}.png"
        driver.save_screenshot(filename)
        print(f"Screenshot saved: {filename}")

class TestPhase{PHASE}Integration:
    """Phase {PHASE} Integration Tests"""

    def test_integration_placeholder(self):
        """Placeholder integration test"""
        assert True, "Integration test should pass"
EOF

# Replace placeholder
sed -i "s/{PHASE}/$PHASE/g" "$PROJECT_ROOT/tests/selenium/phase${PHASE}_tests.py"

# Create unit test template
echo "Creating unit test template..."
cat > "$PROJECT_ROOT/tests/unit/phase-$PHASE/placeholder.test.ts" << EOF
describe('Phase $PHASE Tests', () => {
  it('should pass placeholder test', () => {
    expect(true).toBe(true)
  })
})
EOF

# Create integration test template
echo "Creating integration test template..."
cat > "$PROJECT_ROOT/tests/integration/phase-$PHASE/placeholder.test.ts" << EOF
describe('Phase $PHASE Integration', () => {
  it('should pass placeholder integration test', () => {
    expect(true).toBe(true)
  })
})
EOF

# Create implementation checklist
echo "Creating implementation checklist..."
cat > "$PROJECT_ROOT/docs/phases/phase-$PHASE/CHECKLIST.md" << EOF
# Phase $PHASE Implementation Checklist

## Pre-Implementation
- [ ] Read complete audit and plan
- [ ] Review NeMo integration strategy
- [ ] Set up development environment
- [ ] Verify all dependencies installed
- [ ] Create feature branch

## Implementation

### Step 1: Create Files
- [ ] Create context files
- [ ] Create hook files
- [ ] Create type definitions
- [ ] Create utility files
- [ ] Add constants/errors

### Step 2: Component Migration
- [ ] Update App.tsx with provider
- [ ] Update WorkflowCanvas.tsx
- [ ] Update OrcaNode.tsx
- [ ] Update NodePalette.tsx
- [ ] Update NodeConfigPanel.tsx
- [ ] Update other components

### Step 3: Error Handling
- [ ] Add error types
- [ ] Implement error handler utility
- [ ] Add retry logic
- [ ] Update API client

### Step 4: Testing
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Run tests with coverage
- [ ] Fix failing tests
- [ ] Achieve 80%+ coverage

### Step 5: E2E Testing
- [ ] Create Selenium tests
- [ ] Run Selenium suite
- [ ] Fix failures
- [ ] Take screenshots

### Step 6: Documentation
- [ ] Update README
- [ ] Update API documentation
- [ ] Add code comments
- [ ] Create migration guide
- [ ] Update progress.json

### Step 7: QA & Refinement
- [ ] Manual testing
- [ ] Performance check
- [ ] Accessibility check
- [ ] Security review
- [ ] Code review

### Step 8: Merge
- [ ] Rebase on main
- [ ] Resolve conflicts
- [ ] Final test run
- [ ] Create pull request
- [ ] Get approval
- [ ] Merge to main
- [ ] Tag release

## Post-Implementation
- [ ] Update documentation
- [ ] Close related issues
- [ ] Notify stakeholders
- [ ] Start next phase

## Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Unit test coverage | 85% | ___ |
| Integration coverage | 80% | ___ |
| Selenium tests passed | 6/6 | ___ |
| Performance (LCP) | < 2s | ___ |
| Bundle size | < 500KB | ___ |
| Accessibility | WCAG AA | ___ |

## Notes

[Add implementation notes as you progress]
EOF

# Update progress.json
echo "Updating progress.json..."
if [ -f "$PROJECT_ROOT/progress.json" ]; then
  # Note: This is a simple placeholder. In production, use a proper JSON update tool
  echo "  ✅ Phase $PHASE structure created"
fi

echo ""
echo "✅ Phase $PHASE Initialization Complete!"
echo ""
echo "📁 Created Files:"
echo "  - docs/phases/phase-$PHASE/README.md"
echo "  - docs/phases/phase-$PHASE/CHECKLIST.md"
echo "  - tests/unit/phase-$PHASE/"
echo "  - tests/integration/phase-$PHASE/"
echo "  - tests/selenium/phase${PHASE}_tests.py"
echo ""
echo "📝 Next Steps:"
echo "1. Edit docs/phases/phase-$PHASE/README.md with phase details"
echo "2. Edit docs/phases/phase-$PHASE/CHECKLIST.md as you implement"
echo "3. Create feature branch: git checkout -b feature/phase-$PHASE"
echo "4. Run tests: ./scripts/run-tests.sh $PHASE"
echo ""
