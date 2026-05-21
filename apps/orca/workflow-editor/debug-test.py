"""
Debug test - capture browser console errors
"""

import time
import sys
import io
import json

if sys.platform.startswith('win'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

def main():
    print("ORCA Debug Test - Console Error Capture")
    print("="*60)

    # Enable logging
    options = Options()
    options.add_argument('--enable-logging')
    options.add_argument('--v=1')

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )

    try:
        print("\n[1] Loading page...")
        driver.get('http://localhost:5173')
        time.sleep(3)

        # Check for errors in console
        print("\n[2] Checking browser console...")

        # Get all log entries
        logs = driver.get_log('browser')
        print("  Found {} console messages".format(len(logs)))

        if logs:
            print("\n  Console Output:")
            for log in logs:
                level = log.get('level', 'UNKNOWN')
                message = log.get('message', '')
                print("    [{}] {}".format(level, message[:200]))

        # Check page source length
        print("\n[3] Page Source Analysis...")
        source = driver.page_source
        print("  Source length: {} bytes".format(len(source)))

        # Look for #root element
        from selenium.webdriver.common.by import By
        try:
            root = driver.find_element(By.ID, 'root')
            print("  Root element found: {}".format(root.tag_name))
            root_html = root.get_attribute('innerHTML')
            print("  Root innerHTML length: {} bytes".format(len(root_html or '')))
            if root_html:
                print("  Root innerHTML (first 500 chars):")
                print("  {}".format((root_html or '')[:500]))
        except Exception as e:
            print("  Root element not found: {}".format(e))

        # Try to find rendered components
        print("\n[4] Component Search...")
        all_divs = driver.find_elements(By.TAG_NAME, 'div')
        print("  Total divs: {}".format(len(all_divs)))

        # Look for specific classes
        classes_to_find = ['toolbar', 'canvas', 'sidebar', 'node', 'palette']
        for class_name in classes_to_find:
            elements = driver.find_elements(By.CSS_SELECTOR, '[class*="{}"]'.format(class_name))
            print("  Elements with '{}': {}".format(class_name, len(elements)))

        # Check if React is loaded
        print("\n[5] React/Vite Check...")
        try:
            react_loaded = driver.execute_script("return window.__REACT_LOADED__ || (window.React !== undefined)")
            print("  React loaded: {}".format(react_loaded))
        except:
            print("  Could not check React")

        # Try to access React DevTools
        try:
            state = driver.execute_script("return window.__REACT_DEVTOOLS_GLOBAL_HOOK__")
            print("  React DevTools hook: {}".format(bool(state)))
        except:
            print("  React DevTools not available")

        # Save screenshot
        driver.save_screenshot('debug_console.png')
        print("\n[SUCCESS] Screenshot saved: debug_console.png")

        return 0

    except Exception as e:
        print("\n[ERROR] {}".format(str(e)))
        import traceback
        traceback.print_exc()
        return 1

    finally:
        driver.quit()

if __name__ == '__main__':
    sys.exit(main())
