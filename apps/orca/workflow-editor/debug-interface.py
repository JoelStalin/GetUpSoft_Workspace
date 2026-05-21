"""Debug interface issues"""
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
print("DEBUGGING WORKFLOW EDITOR INTERFACE")
print("="*70)

options = Options()
options.add_argument('--enable-logging')
driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install()),
    options=options
)

try:
    print("\n[1] Loading page...")
    driver.get('http://localhost:5179')

    print("[2] Waiting 6 seconds for React to load...")
    for i in range(6):
        time.sleep(1)
        root = driver.find_element(By.ID, 'root')
        content = len(root.get_attribute('innerHTML'))
        print(f"    Second {i+1}: root element = {content} bytes")

    # Check for errors
    print("\n[3] Checking JavaScript errors...")
    try:
        logs = driver.get_log('browser')
        errors = [log for log in logs if 'SEVERE' in str(log['level'])]

        if errors:
            print(f"✗ Found {len(errors)} errors:")
            for error in errors[:5]:
                msg = error.get('message', '')[:100]
                print(f"  • {msg}")
        else:
            print("✓ No critical errors")

        print("\n[4] Recent console messages:")
        for log in logs[-5:]:
            level = log['level']
            msg = log.get('message', '')[:80]
            print(f"  [{level}] {msg}")

    except Exception as e:
        print(f"Could not get browser logs: {str(e)[:50]}")

    # Check HTML structure
    print("\n[5] Checking HTML structure...")
    try:
        html = driver.page_source
        if '<App' in html or 'ReactFlow' in html:
            print("✓ React components in DOM")
        else:
            print("✗ React components not found in DOM")

        if 'NodePalette' in html:
            print("✓ NodePalette in DOM")
        else:
            print("⚠ NodePalette not visible")

    except Exception as e:
        print(f"Could not check HTML: {str(e)[:40]}")

    # Check specific elements
    print("\n[6] Looking for specific elements...")
    elements = {
        'root': '#root',
        'buttons': 'button',
        'canvas': '[style*="grid-area: canvas"]',
        'sidebar': '[style*="grid-area: sidebar"]',
        'draggables': '[draggable="true"]',
    }

    for name, selector in elements.items():
        try:
            els = driver.find_elements(By.CSS_SELECTOR, selector)
            print(f"  {name}: {len(els)}")
        except:
            print(f"  {name}: not found")

    # Get root element details
    print("\n[7] Root element details...")
    try:
        root = driver.find_element(By.ID, 'root')
        classes = root.get_attribute('class')
        style = root.get_attribute('style')
        html_content = root.get_attribute('innerHTML')

        print(f"  Class: {classes or 'none'}")
        print(f"  Style: {style or 'none'}")
        print(f"  Inner HTML length: {len(html_content)} bytes")
        print(f"  Inner HTML preview: {html_content[:150]}...")

    except Exception as e:
        print(f"  Error: {str(e)[:50]}")

    print("\n[8] Taking screenshots...")
    driver.save_screenshot('debug_01_initial.png')
    time.sleep(2)
    driver.save_screenshot('debug_02_after_wait.png')

    print("✓ Screenshots saved")

    print("\n" + "="*70)
    print("DEBUG INFO COLLECTED")
    print("="*70)

except Exception as e:
    print(f"\nError: {str(e)}")
    import traceback
    traceback.print_exc()
finally:
    driver.quit()
