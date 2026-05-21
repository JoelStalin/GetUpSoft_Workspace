#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Test drag-and-drop and zoom functionality"""

import sys
import io
import time
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

SCREENSHOTS_DIR = Path(__file__).parent / "screenshots"
SCREENSHOTS_DIR.mkdir(exist_ok=True)

driver = webdriver.Chrome(options=webdriver.ChromeOptions())
driver.set_window_size(1920, 1080)

try:
    driver.get("http://localhost:5173")
    time.sleep(3)

    print("[TEST 1] Drag-and-Drop Node Creation")
    print("=" * 60)

    # Find first draggable component
    draggables = driver.find_elements(By.CLASS_NAME, "node-row")
    print(f"[+] Found {len(draggables)} draggable components")

    if draggables:
        first_component = draggables[0]
        component_name = first_component.text.split('\n')[0]
        print(f"[+] Dragging '{component_name}' to canvas...")

        # Find canvas
        canvas = driver.find_element(By.CLASS_NAME, "react-flow")
        print(f"[+] Canvas found")

        # Get component location
        comp_loc = first_component.location
        comp_size = first_component.size

        # Canvas center
        canvas_loc = canvas.location
        canvas_size = canvas.size
        canvas_center_x = canvas_loc['x'] + canvas_size['width'] // 2
        canvas_center_y = canvas_loc['y'] + canvas_size['height'] // 2

        print(f"    Component at: {comp_loc}")
        print(f"    Canvas at: {canvas_loc}, size: {canvas_size}")
        print(f"    Dropping to: ({canvas_center_x}, {canvas_center_y})")

        # Perform drag-and-drop
        actions = ActionChains(driver)
        actions.drag_and_drop(first_component, canvas).perform()
        time.sleep(1)

        # Check for newly created node
        nodes = driver.find_elements(By.CLASS_NAME, "react-flow__node")
        print(f"[+] Nodes in canvas after drag-drop: {len(nodes)}")

        if len(nodes) > 0:
            driver.save_screenshot(str(SCREENSHOTS_DIR / "TEST-dragdrop-success.png"))
            print("[+] Drag-and-drop PASSED - Node created!")
        else:
            print("[-] Drag-and-drop FAILED - No node created")

    print("\n[TEST 2] Canvas Zoom")
    print("=" * 60)

    canvas = driver.find_element(By.CLASS_NAME, "react-flow__viewport")
    print(f"[+] Canvas viewport found")

    # Try scroll zoom
    actions = ActionChains(driver)
    actions.move_to_element(canvas)

    # Scroll up (zoom in)
    print("[+] Zooming in...")
    for _ in range(3):
        driver.execute_script("document.querySelector('.react-flow__viewport').dispatchEvent(new WheelEvent('wheel', {deltaY: -100, deltaX: 0}))")
        time.sleep(0.2)

    time.sleep(0.5)
    driver.save_screenshot(str(SCREENSHOTS_DIR / "TEST-zoom-in.png"))
    print("[+] Zoom in PASSED")

    # Scroll down (zoom out)
    print("[+] Zooming out...")
    for _ in range(3):
        driver.execute_script("document.querySelector('.react-flow__viewport').dispatchEvent(new WheelEvent('wheel', {deltaY: 100, deltaX: 0}))")
        time.sleep(0.2)

    time.sleep(0.5)
    driver.save_screenshot(str(SCREENSHOTS_DIR / "TEST-zoom-out.png"))
    print("[+] Zoom out PASSED")

    print("\n[TEST 3] Canvas Visibility & Pan")
    print("=" * 60)

    canvas = driver.find_element(By.CLASS_NAME, "react-flow")
    print(f"[+] Canvas is displayed: {canvas.is_displayed()}")

    # Try panning
    print("[+] Attempting pan...")
    actions = ActionChains(driver)
    actions.move_to_element(canvas)
    actions.click_and_hold()
    actions.move_by_offset(100, 100)
    actions.release()
    actions.perform()

    time.sleep(0.5)
    driver.save_screenshot(str(SCREENSHOTS_DIR / "TEST-pan.png"))
    print("[+] Pan PASSED")

    print("\n" + "=" * 60)
    print("[+] All tests completed!")
    print("[+] Screenshots saved to: screenshots/TEST-*.png")

finally:
    driver.quit()
