"""
Test that waits for page to load with polling
"""

import time
import sys
import io

if sys.platform.startswith('win'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By

def main():
    print("ORCA Wait Test - Polling for Page Load")
    print("="*60)

    options = Options()
    # Enable logging
    options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )

    try:
        print("\n[1] Loading page...")
        driver.get('http://localhost:5173')

        # Poll for 30 seconds
        for i in range(6):
            time.sleep(5)
            root = driver.find_element(By.ID, 'root')
            html = root.get_attribute('innerHTML')

            # Check if loading text is still there
            is_loading = 'Loading ORCA' in html
            print(f"  [{i*5}s] Loading: {is_loading}, HTML length: {len(html)} bytes")

            if not is_loading:
                print("\n[SUCCESS] Page loaded!")
                print("  Root HTML (first 1000 chars):")
                print("  {}".format(html[:1000]))
                break

            # Print any console logs
            logs = driver.get_log('browser')
            if logs:
                print("    Console logs:")
                for log in logs[-3:]:  # Last 3 logs
                    print("      [{}] {}".format(log['level'], log['message'][:100]))

        # Take final screenshot
        driver.save_screenshot('wait_test_final.png')
        print("\n  Screenshot saved: wait_test_final.png")

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
