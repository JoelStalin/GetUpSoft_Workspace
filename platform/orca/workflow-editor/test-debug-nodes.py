"""
ORCA Workflow Editor - Debug Node Syncing
Check console logs and node rendering
"""

import io
import sys
import time

if sys.platform.startswith('win'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import json

print("="*70)
print("ORCA WORKFLOW EDITOR - NODE SYNCING DEBUG")
print("="*70)

options = Options()
# Enable logging
options.add_argument('--enable-logging')
options.add_argument('--v=1')

driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install()),
    options=options
)

try:
    # Load interface
    print("\n[1] Loading interface...")
    driver.get('http://localhost:5173')
    time.sleep(3)

    print("✓ Interface loaded")
    driver.save_screenshot('debug_01_start.png')

    # Drag a node
    print("\n[2] Dragging first component...")
    draggables = driver.find_elements(By.CSS_SELECTOR, '[draggable="true"]')

    if len(draggables) > 0:
        actions = ActionChains(driver)
        source = draggables[0]
        canvas = driver.find_element(By.CSS_SELECTOR, '[style*="grid-area: canvas"]')

        print(f"Source element text: '{draggables[0].text}'")
        print(f"Canvas element found: {canvas is not None}")

        actions.drag_and_drop(source, canvas).perform()
        time.sleep(2)
        print("✓ Drag completed")

    # Check console for logs
    print("\n[3] Checking browser console...")
    try:
        logs = driver.get_log('browser')
        sync_logs = [log for log in logs if 'Syncing nodes' in str(log)]

        if sync_logs:
            print(f"✓ Found {len(sync_logs)} sync logs:")
            for log in sync_logs[-3:]:
                print(f"  {log['message'][:80]}")
        else:
            print("⚠ No sync logs found in console")

        # Show last 5 console messages
        print("\nRecent console messages:")
        for log in logs[-5:]:
            msg = log['message'][:100]
            level = log['level']
            print(f"  [{level}] {msg}")

    except Exception as e:
        print(f"⚠ Could not read console: {str(e)[:50]}")

    driver.save_screenshot('debug_02_after_drag.png')

    # Use JavaScript to check Zustand store directly
    print("\n[4] Checking Zustand store state...")
    try:
        # Access window object to find Zustand store
        script = """
        return {
            windowKeys: Object.keys(window).filter(k => k.includes('store') || k.includes('workflow')).slice(0, 10)
        }
        """
        result = driver.execute_script(script)
        print(f"Window keys related to store: {result['windowKeys']}")
    except Exception as e:
        print(f"⚠ Could not access store: {str(e)[:50]}")

    # Check DOM for nodes
    print("\n[5] Checking DOM for nodes...")
    try:
        # Look for React Flow nodes
        react_nodes = driver.find_elements(By.CSS_SELECTOR, '.react-flow__node')
        print(f"React Flow nodes (.react-flow__node): {len(react_nodes)}")

        # Look for any elements with 'node' class
        node_elements = driver.find_elements(By.CSS_SELECTOR, '[class*="node"]')
        print(f"Elements with 'node' in class: {len(node_elements)}")

        # Get canvas content
        canvas = driver.find_element(By.CSS_SELECTOR, '[style*="grid-area: canvas"]')
        canvas_html = canvas.get_attribute('innerHTML')
        print(f"Canvas HTML content length: {len(canvas_html)} bytes")

        # Look for any divs in canvas
        canvas_divs = canvas.find_elements(By.TAG_NAME, 'div')
        print(f"Divs inside canvas: {len(canvas_divs)}")

    except Exception as e:
        print(f"✗ DOM check failed: {str(e)[:50]}")

    driver.save_screenshot('debug_03_dom_check.png')

    # Try dragging in a more direct way
    print("\n[6] Testing alternative drag method...")
    try:
        draggables = driver.find_elements(By.CSS_SELECTOR, '[draggable="true"]')
        if len(draggables) > 1:
            # Try second component
            actions = ActionChains(driver)
            source = draggables[1]

            # Get canvas position
            canvas = driver.find_element(By.CSS_SELECTOR, '[style*="grid-area: canvas"]')
            canvas_rect = canvas.get_attribute('getAttribute') or {}

            # Move to canvas first, then perform offset drag
            actions.move_to_element(source)
            actions.click_and_hold()
            actions.move_to_element(canvas)
            actions.move_by_offset(50, 50)
            actions.release()
            actions.perform()

            print("✓ Alternative drag completed")
            time.sleep(2)

            # Check nodes again
            nodes = driver.find_elements(By.CSS_SELECTOR, '.react-flow__node')
            print(f"Nodes after alt-drag: {len(nodes)}")

    except Exception as e:
        print(f"⚠ Alternative drag failed: {str(e)[:50]}")

    driver.save_screenshot('debug_04_alt_drag.png')

    # Summary
    print("\n" + "="*70)
    print("DEBUG SUMMARY")
    print("="*70)
    print("""
Issues identified:
  - Nodes are being dragged successfully
  - But nodes are not appearing in .react-flow__node elements
  - This suggests sync issue between Zustand store and ReactFlow

Possible causes:
  1. Zustand store updates not triggering React re-renders
  2. ReactFlow not picking up node changes
  3. Node data not properly formatted
  4. Type mismatch between store nodes and ReactFlow nodes

Next steps:
  - Verify WorkflowCanvas useEffect dependencies
  - Check if workflow.nodes is actually updating in store
  - Verify node type is being set correctly
  - Check ReactFlow error boundaries
    """)

    print("="*70)

except Exception as e:
    print(f"\nError: {str(e)}")
    import traceback
    traceback.print_exc()
finally:
    driver.quit()
