"""
waits.py — Explicit wait helpers wrapping Selenium's WebDriverWait.
"""

from __future__ import annotations
import time
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException


def wait_for_dom_stable(driver: WebDriver, timeout: int = 15) -> bool:
    """
    Poll document.readyState until 'complete', or timeout.
    Returns True on success, False on timeout.
    """
    try:
        WebDriverWait(driver, timeout).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        return True
    except TimeoutException:
        return False


def wait_for_element(driver: WebDriver, by: str, value: str, timeout: int = 10):
    """
    Wait for a single element to be present in DOM.
    Returns the element or None on timeout.
    """
    try:
        return WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((by, value))
        )
    except TimeoutException:
        return None


def step_pause(delay_ms: int) -> None:
    """Sleep for delay_ms milliseconds between visible steps."""
    time.sleep(delay_ms / 1000.0)
