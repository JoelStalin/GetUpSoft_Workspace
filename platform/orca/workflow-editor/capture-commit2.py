"""Capture interface from second commit"""
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
print("ORCA INTERFACE COMPARISON - COMMIT #2")
print("="*70)
print("\nCommit: 3a1b3d178f31f0fb11ac890670671220fa24e587")
print("Description: feat: implement n8n workflow backend models")

options = Options()
driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install()),
    options=options
)

try:
    print("\n[1] Loading interface from second commit...")
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
        for i, comp in enumerate(draggables[:10], 1):
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

    driver.save_screenshot('commit2_interface.png')
    print("\n✓ Screenshot saved: commit2_interface.png")

except Exception as e:
    print(f"\nError in Commit #2: {str(e)[:60]}")
finally:
    driver.quit()

print("\n" + "="*70)
