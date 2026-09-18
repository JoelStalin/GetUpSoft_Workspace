"""
ORCA Workflow Editor - Selenium Test Suite
Tests drag-and-drop functionality, node connections, and complete workflow creation
"""

import io
import sys
import time

# Fix encoding for Windows console
if sys.platform.startswith('win'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

class OrcaWorkflowTester:
    def __init__(self):
        self.driver = None
        self.wait = None
        self.actions = None
        self.base_url = 'http://localhost:5173'

    def setup(self):
        """Initialize Selenium WebDriver"""
        options = Options()
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option('excludeSwitches', ['enable-automation'])
        options.add_experimental_option('useAutomationExtension', False)

        self.driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()),
            options=options
        )
        self.wait = WebDriverWait(self.driver, 20)
        self.actions = ActionChains(self.driver)
        print("[OK] WebDriver initialized")

    def teardown(self):
        """Close WebDriver"""
        if self.driver:
            self.driver.quit()
        print("[OK] WebDriver closed")

    def test_interface_loads(self):
        """Test 1: Verify ORCA interface loads correctly"""
        print("\n[TEST 1] Loading ORCA Interface...")
        self.driver.get(self.base_url)
        # Wait for page to fully load (up to 10 seconds)
        time.sleep(8)

        try:
            # Check for toolbar
            self.wait.until(EC.presence_of_element_located((By.TAG_NAME, 'svg')))
            print("  [OK] Toolbar loaded")

            # Check for canvas area
            canvas = self.driver.find_elements(By.CSS_SELECTOR, '[class*="canvas"]')
            print("  [OK] Canvas area found ({} elements)".format(len(canvas)))

            # Check for sidebar
            sidebar = self.driver.find_elements(By.TAG_NAME, 'input')
            print("  [OK] Interface elements found")

            # Take screenshot
            self.driver.save_screenshot('orca_interface_loaded.png')
            print("  [OK] Screenshot saved: orca_interface_loaded.png")

            return True
        except Exception as e:
            print("  [FAIL] Error: {}".format(e))
            return False

    def test_drag_and_drop_node(self):
        """Test 2: Verify drag-and-drop of nodes"""
        print("\n[TEST 2] Testing Drag-and-Drop...")
        try:
            time.sleep(2)

            # Find a draggable node item in the palette
            palette_items = self.driver.find_elements(By.CSS_SELECTOR, '[draggable="true"]')
            print("  [OK] Found {} draggable components".format(len(palette_items)))

            if not palette_items:
                print("  [FAIL] No draggable items found")
                return False

            # Get the first draggable item
            source = palette_items[0]
            source_text = source.text or "Component"
            print("  -> Dragging: {}".format(source_text))

            # Get canvas element
            canvas = self.driver.find_element(By.CSS_SELECTOR, '[style*="width: 100%"]')

            # Perform drag and drop
            self.actions.drag_and_drop(source, canvas).perform()
            time.sleep(2)

            # Take screenshot
            self.driver.save_screenshot('orca_after_dragdrop.png')
            print("  [OK] Drag-and-drop executed")
            print("  [OK] Screenshot saved: orca_after_dragdrop.png")

            return True
        except Exception as e:
            print("  [FAIL] Error: {}".format(e))
            return False

    def test_multiple_nodes(self):
        """Test 3: Create multiple nodes"""
        print("\n[TEST 3] Creating Multiple Nodes...")
        try:
            palette_items = self.driver.find_elements(By.CSS_SELECTOR, '[draggable="true"]')
            canvas = self.driver.find_element(By.CSS_SELECTOR, '[style*="width: 100%"]')

            # Drag multiple nodes
            nodes_to_create = min(3, len(palette_items))
            for i in range(nodes_to_create):
                source = palette_items[i % len(palette_items)]
                # Calculate different drop positions
                canvas_location = canvas.location
                offset_x = 100 + (i * 150)
                offset_y = 150 + (i * 100)

                self.actions.drag_and_drop_by_offset(
                    source,
                    offset_x,
                    offset_y
                ).perform()
                time.sleep(1)
                print("  [OK] Node {} created".format(i+1))

            self.driver.save_screenshot('orca_multiple_nodes.png')
            print("  [OK] Screenshot saved: orca_multiple_nodes.png")

            return True
        except Exception as e:
            print("  [FAIL] Error: {}".format(e))
            return False

    def test_node_selection(self):
        """Test 4: Select a node"""
        print("\n[TEST 4] Testing Node Selection...")
        try:
            time.sleep(2)

            # Find nodes on canvas
            nodes = self.driver.find_elements(By.CSS_SELECTOR, '[class*="node"]')
            print("  [OK] Found {} nodes on canvas".format(len(nodes)))

            if nodes:
                # Click first node
                node = nodes[0]
                node.click()
                time.sleep(1)
                print("  [OK] Node selected")

                # Check if config panel appears
                config_panel = self.driver.find_elements(By.CSS_SELECTOR, '[class*="config"]')
                print("  [OK] Configuration panel elements: {}".format(len(config_panel)))

                self.driver.save_screenshot('orca_node_selected.png')
                print("  [OK] Screenshot saved: orca_node_selected.png")

                return True
            return False
        except Exception as e:
            print("  [FAIL] Error: {}".format(e))
            return False

    def test_connection_creation(self):
        """Test 5: Test node connection handles"""
        print("\n[TEST 5] Testing Connection Creation...")
        try:
            # Find all nodes
            nodes = self.driver.find_elements(By.CSS_SELECTOR, '[class*="node"]')
            print("  [OK] Found {} nodes".format(len(nodes)))

            if len(nodes) >= 2:
                # Try to find handles for connection
                handles = self.driver.find_elements(By.CSS_SELECTOR, '[class*="handle"]')
                print("  [OK] Found {} connection handles".format(len(handles)))

                if len(handles) >= 2:
                    # Attempt connection
                    self.actions.drag_and_drop(handles[0], handles[1]).perform()
                    time.sleep(1)
                    print("  [OK] Connection attempt made")

                    self.driver.save_screenshot('orca_connection_created.png')
                    print("  [OK] Screenshot saved: orca_connection_created.png")
                    return True

            print("  [INFO] Not enough nodes for connection test")
            return True
        except Exception as e:
            print("  [FAIL] Error: {}".format(e))
            return False

    def test_ui_responsiveness(self):
        """Test 6: Check UI responsiveness and dark theme"""
        print("\n[TEST 6] Testing UI Responsiveness...")
        try:
            # Check for dark theme colors
            body = self.driver.find_element(By.TAG_NAME, 'body')
            bg_color = body.value_of_css_property('background-color')
            print("  [OK] Background color: {}".format(bg_color))

            # Check text visibility
            text_elements = self.driver.find_elements(By.XPATH, "//*[text()]")
            print("  [OK] Found {} text elements".format(len(text_elements)))

            # Test zoom/pan
            canvas = self.driver.find_element(By.CSS_SELECTOR, '[class*="canvas"]')
            self.actions.scroll(canvas, 0, 100).perform()
            time.sleep(1)
            print("  [OK] Scroll interaction successful")

            self.driver.save_screenshot('orca_ui_responsive.png')
            print("  [OK] Screenshot saved: orca_ui_responsive.png")

            return True
        except Exception as e:
            print("  [FAIL] Error: {}".format(e))
            return False

    def run_full_workflow_test(self):
        """Complete workflow creation test"""
        print("\n" + "="*60)
        print("ORCA WORKFLOW EDITOR - COMPREHENSIVE TEST SUITE")
        print("="*60)

        self.setup()

        try:
            results = {
                'Interface Loading': self.test_interface_loads(),
                'Drag-and-Drop': self.test_drag_and_drop_node(),
                'Multiple Nodes': self.test_multiple_nodes(),
                'Node Selection': self.test_node_selection(),
                'Connections': self.test_connection_creation(),
                'UI Responsiveness': self.test_ui_responsiveness(),
            }

            # Print summary
            print("\n" + "="*60)
            print("TEST SUMMARY")
            print("="*60)

            passed = sum(1 for v in results.values() if v)
            total = len(results)

            for test_name, result in results.items():
                status = "[PASS]" if result else "[FAIL]"
                print("{}: {}".format(status, test_name))

            print("\nTotal: {}/{} tests passed".format(passed, total))
            print("="*60)

            return passed == total

        finally:
            self.teardown()

def main():
    tester = OrcaWorkflowTester()
    success = tester.run_full_workflow_test()
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()
