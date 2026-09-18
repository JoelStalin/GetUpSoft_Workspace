#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Simple drag-and-drop test with detailed output"""

import sys
import io
import time
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

SCREENSHOTS_DIR = Path(__file__).parent / "screenshots"

driver = webdriver.Chrome(options=webdriver.ChromeOptions())
driver.set_window_size(1920, 1080)

try:
    print("=" * 70)
    print("DRAG-AND-DROP TEST")
    print("=" * 70)

    driver.get("http://localhost:5173")
    time.sleep(3)

    print("\n[1] Finding components...")
    rows = driver.find_elements(By.CLASS_NAME, "node-row")
    print(f"    Found {len(rows)} components")

    if not rows:
        print("[-] ERROR: No components found!")
        sys.exit(1)

    # Get first component
    first_component = rows[0]
    component_text = first_component.text.split('\n')[0]
    print(f"[2] Dragging: {component_text}")

    # Get canvas
    try:
        canvas = driver.find_element(By.CLASS_NAME, "react-flow")
        print(f"[3] Canvas found")
    except:
        print(f"[-] Canvas not found, trying alternative...")
        canvas = driver.find_elements(By.CLASS_NAME, "react-flow__viewport")[0]

    # Take before screenshot
    driver.save_screenshot(str(SCREENSHOTS_DIR / "TEST-DRAG-before.png"))
    print(f"[4] Screenshot before drag")

    # Perform drag-and-drop
    print(f"[5] Performing drag-and-drop action...")
    actions = ActionChains(driver)

    # Method 1: Direct drag-and-drop
    try:
        actions.drag_and_drop(first_component, canvas).perform()
        print(f"    [+] Drag-and-drop executed")
    except Exception as e:
        print(f"    [-] Drag-and-drop failed: {e}")

    time.sleep(1)

    # Take after screenshot
    driver.save_screenshot(str(SCREENSHOTS_DIR / "TEST-DRAG-after.png"))
    print(f"[6] Screenshot after drag")

    # Check for created nodes
    nodes = driver.find_elements(By.CLASS_NAME, "react-flow__node")
    print(f"\n[RESULT] Nodes in canvas: {len(nodes)}")

    if len(nodes) > 0:
        print(f"[+] SUCCESS - Drag-and-drop created node!")
        print(f"[+] Node text: {nodes[0].text[:50]}")
    else:
        print(f"[-] No nodes created. Drag-and-drop may not be working properly.")

    print("\n" + "=" * 70)
    print("[+] Test complete. Check screenshots:")
    print("    - screenshots/TEST-DRAG-before.png")
    print("    - screenshots/TEST-DRAG-after.png")
    print("=" * 70)

finally:
    driver.quit()
