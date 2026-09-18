"""
Simple ORCA Workflow Editor test - captures page structure and screenshots
"""

import time
import sys
import io

# Fix encoding
if sys.platform.startswith('win'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

def main():
    print("Starting ORCA Workflow Editor Test...")

    options = webdriver.ChromeOptions()
    options.add_argument('--disable-blink-features=AutomationControlled')

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )

    try:
        print("\n[1] Loading ORCA Workflow Editor...")
        driver.get('http://localhost:5173')

        # Wait for page to load
        time.sleep(4)

        # Take screenshot
        driver.save_screenshot('orca_loaded.png')
        print("  [OK] Screenshot saved: orca_loaded.png")

        # Get page structure
        print("\n[2] Page Structure Analysis...")

        # Check for key elements
        from selenium.webdriver.common.by import By

        # Get all divs with class attributes
        divs = driver.find_elements(By.XPATH, "//div[@class]")
        print("  [INFO] Found {} divs with class attributes".format(len(divs)))

        # Look for workflow canvas related elements
        react_flow = driver.find_elements(By.CLASS_NAME, 'react-flow')
        print("  [INFO] ReactFlow containers: {}".format(len(react_flow)))

        # Look for node-related elements
        all_elements = driver.find_elements(By.XPATH, "//*")
        print("  [INFO] Total DOM elements: {}".format(len(all_elements)))

        # Print some HTML to understand structure
        body = driver.find_element(By.TAG_NAME, 'body')
        print("\n[3] Body HTML (first 500 chars):")
        html = driver.find_element(By.TAG_NAME, 'html').get_attribute('innerHTML')
        print(html[:1000] if html else "No HTML")

        # Look for specific elements
        print("\n[4] Element Search:")

        # SVG elements
        svgs = driver.find_elements(By.TAG_NAME, 'svg')
        print("  SVG elements: {}".format(len(svgs)))

        # Input elements (palette items)
        inputs = driver.find_elements(By.TAG_NAME, 'input')
        print("  Input elements: {}".format(len(inputs)))

        # Draggable elements
        draggables = driver.find_elements(By.CSS_SELECTOR, '[draggable="true"]')
        print("  Draggable elements: {}".format(len(draggables)))

        # React components
        divs_with_style = driver.find_elements(By.CSS_SELECTOR, 'div[style*="grid"]')
        print("  Grid divs: {}".format(len(divs_with_style)))

        # Canvas
        canvas_divs = driver.find_elements(By.CSS_SELECTOR, 'div[style*="width: 100%"]')
        print("  Full-width divs: {}".format(len(canvas_divs)))

        print("\n[5] Taking final screenshot...")
        driver.save_screenshot('orca_structure_analysis.png')
        print("  [OK] Screenshot saved: orca_structure_analysis.png")

        print("\n[SUCCESS] Test completed. Check screenshots in workflow-editor folder.")
        return 0

    except Exception as e:
        print("\n[ERROR] {}".format(str(e)))
        driver.save_screenshot('orca_error.png')
        print("  Error screenshot saved: orca_error.png")
        return 1

    finally:
        driver.quit()

if __name__ == '__main__':
    sys.exit(main())
