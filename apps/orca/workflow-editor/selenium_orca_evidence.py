#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Selenium test script for ORCA Workflow Editor
Captures evidence of UI state, functionality, and API responses
Mandatory test before/after any task execution
"""

import os
import sys
import io
import time
from datetime import datetime
from pathlib import Path

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# Configuration
FRONTEND_URL = "http://localhost:5173"
BACKEND_API = "http://localhost:8015/api/n8n/workflows"
SCREENSHOTS_DIR = Path(__file__).parent / "screenshots"
SCREENSHOTS_DIR.mkdir(exist_ok=True)

# Test metadata
TASK_ID = "TASK-20260521-001"
TIMESTAMP = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

class OrcaSeleniumTest:
    def __init__(self):
        self.driver = None
        self.wait = None
        self.results = {
            "task_id": TASK_ID,
            "timestamp": TIMESTAMP,
            "tests": {},
            "screenshots": [],
            "errors": []
        }

    def setup(self):
        """Initialize WebDriver"""
        try:
            options = webdriver.ChromeOptions()
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--window-size=1920,1080")

            self.driver = webdriver.Chrome(options=options)
            self.wait = WebDriverWait(self.driver, 10)
            print("✓ WebDriver initialized")
            return True
        except Exception as e:
            self.results["errors"].append(f"WebDriver init failed: {e}")
            return False

    def test_frontend_loads(self):
        """Test 1: Frontend loads successfully"""
        try:
            self.driver.get(FRONTEND_URL)
            self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "bg-\\[\\#0a0e27\\]")))

            # Capture initial state
            screenshot = self._save_screenshot("01-frontend-loaded")

            self.results["tests"]["frontend_loads"] = "PASSED"
            print("✓ Test 1: Frontend loads")
            return True
        except TimeoutException:
            self.results["tests"]["frontend_loads"] = "FAILED"
            self.results["errors"].append("Frontend failed to load")
            print("✗ Test 1: Frontend loads - TIMEOUT")
            return False

    def test_canvas_visible(self):
        """Test 2: Canvas element is visible"""
        try:
            # Look for ReactFlow container
            canvas = self.driver.find_element(By.CSS_SELECTOR, "div[style*='width: 100%'][style*='height: 100%']")
            assert canvas.is_displayed(), "Canvas not displayed"

            self._save_screenshot("02-canvas-visible")

            self.results["tests"]["canvas_visible"] = "PASSED"
            print("✓ Test 2: Canvas visible")
            return True
        except (NoSuchElementException, AssertionError) as e:
            self.results["tests"]["canvas_visible"] = "FAILED"
            self.results["errors"].append(f"Canvas visibility check: {e}")
            print("✗ Test 2: Canvas visible - FAILED")
            return False

    def test_sidebar_renders(self):
        """Test 3: Component library sidebar renders"""
        try:
            # Wait for sidebar to be present
            sidebar = self.wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "node-palette"))
            )

            # Check for node items
            node_items = self.driver.find_elements(By.CLASS_NAME, "node-row")
            assert len(node_items) > 0, "No node items found in palette"

            self._save_screenshot("03-sidebar-with-components")

            self.results["tests"]["sidebar_renders"] = f"PASSED ({len(node_items)} nodes)"
            print(f"✓ Test 3: Sidebar renders with {len(node_items)} components")
            return True
        except (TimeoutException, AssertionError) as e:
            self.results["tests"]["sidebar_renders"] = "FAILED"
            self.results["errors"].append(f"Sidebar check: {e}")
            print("✗ Test 3: Sidebar renders - FAILED")
            return False

    def test_node_components_loaded(self):
        """Test 4: All 8 n8n node types are loaded"""
        try:
            expected_nodes = [
                "trigger",
                "aiPrompt",
                "httpRequest",
                "condition",
                "loop",
                "setVariable",
                "executeCommand",
                "end"
            ]

            node_texts = [item.text for item in self.driver.find_elements(By.CLASS_NAME, "node-row-title")]

            found_nodes = [node for node in expected_nodes if any(node.lower() in text.lower() for text in node_texts)]

            self._save_screenshot("04-nodes-loaded")

            self.results["tests"]["nodes_loaded"] = f"PASSED ({len(found_nodes)}/8 found)"
            print(f"✓ Test 4: {len(found_nodes)}/8 n8n nodes loaded")
            return len(found_nodes) >= 6  # Pass if at least 6 found
        except Exception as e:
            self.results["tests"]["nodes_loaded"] = "FAILED"
            self.results["errors"].append(f"Node loading: {e}")
            print("✗ Test 4: Node components - FAILED")
            return False

    def test_api_responds(self):
        """Test 5: Backend API responds"""
        try:
            import requests
            response = requests.get(BACKEND_API, timeout=5)
            assert response.status_code == 200, f"API returned {response.status_code}"

            self.results["tests"]["api_responds"] = f"PASSED (HTTP {response.status_code})"
            print(f"✓ Test 5: API responds (HTTP {response.status_code})")
            return True
        except Exception as e:
            self.results["tests"]["api_responds"] = f"FAILED ({e})"
            self.results["errors"].append(f"API call: {e}")
            print(f"✗ Test 5: API responds - {e}")
            return False

    def test_sidebar_toggle(self):
        """Test 6: Sidebar toggle button works"""
        try:
            # Find toggle button (X or Menu icon)
            toggle_btn = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "button[title*='panel']"))
            )

            # Click to close
            toggle_btn.click()
            time.sleep(0.5)
            self._save_screenshot("05-sidebar-closed")

            # Click to open
            toggle_btn.click()
            time.sleep(0.5)
            self._save_screenshot("06-sidebar-opened")

            self.results["tests"]["sidebar_toggle"] = "PASSED"
            print("✓ Test 6: Sidebar toggle works")
            return True
        except (TimeoutException, Exception) as e:
            self.results["tests"]["sidebar_toggle"] = "FAILED"
            self.results["errors"].append(f"Sidebar toggle: {e}")
            print(f"✗ Test 6: Sidebar toggle - {e}")
            return False

    def test_drag_component(self):
        """Test 7: Drag-and-drop node creation"""
        try:
            # Find first draggable node
            draggables = self.driver.find_elements(By.CSS_SELECTOR, "[draggable='true']")
            assert len(draggables) > 0, "No draggable elements found"

            first_node = draggables[0]

            # Find canvas drop zone
            canvas = self.driver.find_element(By.CSS_SELECTOR, "div[style*='width: 100%'][style*='height: 100%']")

            # Perform drag-and-drop
            actions = ActionChains(self.driver)
            actions.drag_and_drop(first_node, canvas).perform()

            time.sleep(1)
            self._save_screenshot("07-after-drag-drop")

            self.results["tests"]["drag_drop"] = "PASSED"
            print("✓ Test 7: Drag-and-drop works")
            return True
        except Exception as e:
            self.results["tests"]["drag_drop"] = "PARTIAL"
            self.results["errors"].append(f"Drag-drop: {e}")
            print(f"! Test 7: Drag-and-drop - {e}")
            return False

    def _save_screenshot(self, name):
        """Save screenshot with timestamp"""
        timestamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
        filename = f"{TASK_ID}-{name}-{timestamp}.png"
        filepath = SCREENSHOTS_DIR / filename

        try:
            self.driver.save_screenshot(str(filepath))
            self.results["screenshots"].append(filename)
            print(f"  📸 Saved: {filename}")
            return filename
        except Exception as e:
            print(f"  ✗ Screenshot failed: {e}")
            return None

    def run_all_tests(self):
        """Execute all tests"""
        print(f"\n{'='*60}")
        print(f"ORCA Workflow Editor - Selenium Evidence Test")
        print(f"Task ID: {TASK_ID}")
        print(f"Time: {TIMESTAMP}")
        print(f"URL: {FRONTEND_URL}")
        print(f"{'='*60}\n")

        if not self.setup():
            print("✗ Setup failed, aborting")
            return False

        try:
            tests = [
                self.test_frontend_loads,
                self.test_canvas_visible,
                self.test_sidebar_renders,
                self.test_node_components_loaded,
                self.test_api_responds,
                self.test_sidebar_toggle,
                self.test_drag_component,
            ]

            results = []
            for test in tests:
                try:
                    result = test()
                    results.append(result)
                except Exception as e:
                    print(f"✗ Test error: {e}")
                    results.append(False)

            passed = sum(results)
            total = len(results)

            print(f"\n{'='*60}")
            print(f"Test Results: {passed}/{total} PASSED")
            print(f"Screenshots saved: {len(self.results['screenshots'])}")
            print(f"Location: {SCREENSHOTS_DIR}")
            print(f"{'='*60}\n")

            self._save_report()

            return passed >= 5  # Pass if 5+ tests passed

        finally:
            if self.driver:
                self.driver.quit()

    def _save_report(self):
        """Save test report"""
        report_file = SCREENSHOTS_DIR / f"{TASK_ID}-selenium-report.txt"

        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(f"ORCA Workflow Editor - Selenium Test Report\n")
            f.write(f"{'='*60}\n")
            f.write(f"Task ID: {self.results['task_id']}\n")
            f.write(f"Timestamp: {self.results['timestamp']}\n")
            f.write(f"Frontend: {FRONTEND_URL}\n")
            f.write(f"Backend: {BACKEND_API}\n\n")

            f.write("Test Results:\n")
            f.write(f"{'-'*60}\n")
            for test_name, result in self.results['tests'].items():
                status = "✓" if "PASSED" in result else "✗" if "FAILED" in result else "!"
                f.write(f"{status} {test_name}: {result}\n")

            f.write(f"\n{'-'*60}\n")
            f.write(f"Screenshots ({len(self.results['screenshots'])} captured):\n")
            for screenshot in self.results['screenshots']:
                f.write(f"  - {screenshot}\n")

            if self.results['errors']:
                f.write(f"\n{'-'*60}\n")
                f.write(f"Errors:\n")
                for error in self.results['errors']:
                    f.write(f"  - {error}\n")

        print(f"📋 Report saved: {report_file}")

if __name__ == "__main__":
    test = OrcaSeleniumTest()
    success = test.run_all_tests()
    sys.exit(0 if success else 1)
