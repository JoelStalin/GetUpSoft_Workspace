#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Quick debug - check what's rendering on the page"""

import sys
import io
import time
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

SCREENSHOTS_DIR = Path(__file__).parent / "screenshots"
SCREENSHOTS_DIR.mkdir(exist_ok=True)

options = webdriver.ChromeOptions()
options.add_argument("--window-size=1920,1080")
driver = webdriver.Chrome(options=options)

try:
    driver.get("http://localhost:5173")
    time.sleep(3)

    # Take screenshot
    driver.save_screenshot(str(SCREENSHOTS_DIR / "DEBUG-canvas-state.png"))
    print("[+] Screenshot saved: screenshots/DEBUG-canvas-state.png")

    # Check page structure
    print("\n=== PAGE STRUCTURE ===")

    # Look for main divs
    main_divs = driver.find_elements(By.TAG_NAME, "div")
    print(f"[!] Total divs: {len(main_divs)}")

    # Look for canvas-like elements
    canvas_elements = driver.find_elements(By.CLASS_NAME, "bg-\\[\\#0a0e27\\]")
    print(f"[!] Canvas containers (bg-[#0a0e27]): {len(canvas_elements)}")

    # Look for ReactFlow
    reactflow = driver.find_elements(By.CLASS_NAME, "react-flow")
    print(f"[!] ReactFlow elements: {len(reactflow)}")

    # Look for nodes
    nodes = driver.find_elements(By.CLASS_NAME, "react-flow__node")
    print(f"[!] ReactFlow nodes: {len(nodes)}")

    # Look for any draggable
    draggables = driver.find_elements(By.CSS_SELECTOR, "[draggable='true']")
    print(f"[!] Draggable elements: {len(draggables)}")

    # Get body inner HTML size
    body = driver.find_element(By.TAG_NAME, "body")
    body_html = body.get_attribute("innerHTML")
    print(f"[!] Body HTML size: {len(body_html)} bytes")

    # Check for errors in console
    logs = driver.get_log("browser")
    print(f"\n=== BROWSER CONSOLE ({len(logs)} messages) ===")
    for log in logs[-10:]:
        print(f"[{log['level']}] {log['message'][:100]}")

    # Check visibility of main container
    print(f"\n=== VISIBILITY CHECK ===")
    try:
        app = driver.find_element(By.CLASS_NAME, "w-screen")
        print(f"[+] w-screen container found")
        print(f"    - Displayed: {app.is_displayed()}")
        print(f"    - Size: {app.size}")
    except:
        print(f"[-] w-screen container NOT found")

    print(f"\n[+] Debug complete. Check: screenshots/DEBUG-canvas-state.png")

finally:
    driver.quit()
