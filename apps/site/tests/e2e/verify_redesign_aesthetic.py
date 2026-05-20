from playwright.sync_api import sync_playwright
import os
from pathlib import Path

ARTIFACT_DIR = Path("tests/e2e/artifacts/aesthetic_verification")
ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)

BASE_URL = "http://127.0.0.1:3120"

def run_aesthetic_check():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # 1. Check Global Home (Spanish)
        print("🔍 Checking Global Home (ES) Aesthetic...")
        page.goto(f"{BASE_URL}/es")
        page.wait_for_load_state('networkidle')
        
        # Verify Background
        bg_color = page.evaluate("window.getComputedStyle(document.body).backgroundColor")
        print(f"   Background color: {bg_color}")
        
        # Take Screenshot
        page.screenshot(path=str(ARTIFACT_DIR / "global_home_es.png"), full_page=True)
        
        # Verify Eyebrow
        eyebrow = page.locator('p:has-text("//")').first
        if eyebrow.is_visible():
            print(f"   Eyebrow text: {eyebrow.inner_text()}")
            
        # 2. Check Global Home (English)
        print("\n🔍 Checking Global Home (EN) Aesthetic...")
        page.goto(f"{BASE_URL}/en")
        page.wait_for_load_state('networkidle')
        page.screenshot(path=str(ARTIFACT_DIR / "global_home_en.png"), full_page=True)
        eyebrow_en = page.locator('p:has-text("//")').first
        if eyebrow_en.is_visible():
            print(f"   EN Eyebrow text: {eyebrow_en.inner_text()}")

        # 3. Check RD Home
        print("\n🔍 Checking RD Home Aesthetic...")
        page.goto(f"{BASE_URL}/es/rd")
        page.wait_for_load_state('networkidle')
        page.screenshot(path=str(ARTIFACT_DIR / "rd_home.png"), full_page=True)
        
        rd_eyebrow = page.locator('p:has-text("//")').first
        if rd_eyebrow.is_visible():
             print(f"   RD Eyebrow text: {rd_eyebrow.inner_text()}")
             
        # 4. Check PortalContentPage (Methodology)
        print("\n🔍 Checking Methodology Page Aesthetic...")
        page.goto(f"{BASE_URL}/es/methodology")
        page.wait_for_load_state('networkidle')
        page.screenshot(path=str(ARTIFACT_DIR / "methodology_page.png"), full_page=True)
        
        browser.close()
        print(f"\n✅ Verification complete. Artifacts saved in {ARTIFACT_DIR}")

if __name__ == "__main__":
    run_aesthetic_check()
