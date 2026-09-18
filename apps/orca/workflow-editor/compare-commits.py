"""Compare two commits - show interface screenshots"""
import io
import sys
import time

if sys.platform.startswith('win'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

print("="*70)
print("ORCA INTERFACE COMPARISON - COMMIT #1")
print("="*70)
print("\nCommit: 7830be288fb118f37f3f5868cb2814c78bdd8c16")
print("Description: feat(site/orca): visual polish micro-animations")

options = Options()
driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install()),
    options=options
)

try:
    print("\n[1] Loading interface from first commit...")
    driver.get('http://localhost:5179')
    time.sleep(3)

    root = driver.find_element(By.ID, 'root')
    content_size = len(root.get_attribute('innerHTML'))

    print(f"✓ Interface loaded: {content_size} bytes")

    # Get components
    draggables = driver.find_elements(By.CSS_SELECTOR, '[draggable="true"]')
    print(f"✓ Draggable components: {len(draggables)}")

    if draggables:
        print("\n  Components found:")
        for i, comp in enumerate(draggables[:8], 1):
            text = comp.text.split('\n')[0] if comp.text else f"Component {i}"
            print(f"    {i}. {text}")

    # Get toolbar buttons
    buttons = driver.find_elements(By.TAG_NAME, 'button')
    print(f"\n✓ Toolbar buttons: {len(buttons)}")

    # Verify layout
    print("\n  Layout areas:")
    areas = {
        'Toolbar': 'button',
        'Sidebar': 'p-4',
        'Canvas': 'flex',
    }
    for name, selector in areas.items():
        elements = driver.find_elements(By.CSS_SELECTOR, f'[class*="{selector}"]')
        print(f"    • {name}: {len(elements)} elements")

    driver.save_screenshot('commit1_interface.png')
    print("\n✓ Screenshot saved: commit1_interface.png")

except Exception as e:
    print(f"\nError in Commit #1: {str(e)[:60]}")
finally:
    driver.quit()

print("\n" + "="*70)
