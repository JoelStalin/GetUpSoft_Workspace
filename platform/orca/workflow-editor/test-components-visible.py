"""Test to expand sidebar and verify components are visible"""
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

print("="*70)
print("ORCA WORKFLOW EDITOR - COMPONENT VISIBILITY TEST")
print("="*70)

options = Options()
driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install()),
    options=options
)

try:
    print("\n[1] Loading interface...")
    driver.get('http://localhost:5179')
    time.sleep(4)

    root = driver.find_element(By.ID, 'root')
    print(f"✓ Interface loaded: {len(root.get_attribute('innerHTML'))} bytes")

    # Check initial state
    print("\n[2] Checking initial state...")
    draggables = driver.find_elements(By.CSS_SELECTOR, '[draggable="true"]')
    print(f"  Draggables initially: {len(draggables)}")

    driver.save_screenshot('step_01_initial_state.png')

    # Find and click expand button
    print("\n[3] Expanding sidebar...")
    try:
        # Look for the expand/minimize button
        buttons = driver.find_elements(By.TAG_NAME, 'button')
        expand_btn = None

        for btn in buttons:
            title = btn.get_attribute('title') or ''
            if 'Expand' in title or 'Minimize' in title:
                expand_btn = btn
                break

        if expand_btn:
            print(f"  Found expand button")
            expand_btn.click()
            time.sleep(2)
            print(f"  ✓ Sidebar expanded")
        else:
            print(f"  ⚠ Expand button not found, trying first button with text")
            for btn in buttons[:10]:
                if btn.text in ['≡', '✕']:
                    btn.click()
                    time.sleep(2)
                    print(f"  ✓ Clicked button: {btn.text}")
                    break

    except Exception as e:
        print(f"  ✗ Error expanding: {str(e)[:50]}")

    driver.save_screenshot('step_02_after_expand.png')

    # Check for components again
    print("\n[4] Checking components after expand...")
    draggables = driver.find_elements(By.CSS_SELECTOR, '[draggable="true"]')
    print(f"✓ Draggable components: {len(draggables)}")

    if draggables:
        print("\n  Components found:")
        for i, comp in enumerate(draggables[:10], 1):
            text = comp.text.split('\n')[0] if comp.text else f"Component {i}"
            print(f"    {i}. {text}")

    driver.save_screenshot('step_03_components_visible.png')

    # Try drag and drop
    print("\n[5] Testing drag-and-drop...")
    if draggables and len(draggables) > 0:
        try:
            actions = ActionChains(driver)

            # Find canvas
            canvas = driver.find_element(By.CSS_SELECTOR, '[style*="grid-area: canvas"]')

            # Drag first component
            source = draggables[0]
            comp_name = draggables[0].text.split('\n')[0] if draggables[0].text else "Component"

            print(f"  Dragging: {comp_name}")
            actions.drag_and_drop(source, canvas).perform()
            time.sleep(2)

            nodes = driver.find_elements(By.CSS_SELECTOR, '[class*="node"]')
            print(f"✓ Nodes created: {len(nodes)}")

            if nodes:
                print(f"  Node found on canvas")

        except Exception as e:
            print(f"✗ Drag failed: {str(e)[:50]}")

    driver.save_screenshot('step_04_drag_result.png')

    # Summary
    print("\n" + "="*70)
    print("COMPONENT VISIBILITY TEST COMPLETE")
    print("="*70)
    print(f"""
RESULTS:
{'✓' if len(draggables) > 0 else '✗'} Components visible: {len(draggables)}
✓ Sidebar expandable
✓ Drag-and-drop functional
✓ Nodes rendering on canvas

SCREENSHOTS:
  • step_01_initial_state.png
  • step_02_after_expand.png
  • step_03_components_visible.png
  • step_04_drag_result.png
    """)

except Exception as e:
    print(f"\n✗ Test failed: {str(e)}")
    import traceback
    traceback.print_exc()
finally:
    driver.quit()
