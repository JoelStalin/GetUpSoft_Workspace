from playwright.sync_api import sync_playwright
import os
from pathlib import Path

ARTIFACT_DIR = Path("tests/e2e/artifacts/aesthetic_verification")
ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)

def run_aesthetic_check():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # 1. Check Global Home
        print("🔍 Checking Global Home Aesthetic...")
        page.goto('http://127.0.0.1:3120')
        page.wait_for_load_state('networkidle')
        
        # Verify Background
        bg_color = page.evaluate("window.getComputedStyle(document.body).backgroundColor")
        print(f"   Background color: {bg_color}")
        
        # Take Screenshot
        page.screenshot(path=str(ARTIFACT_DIR / "global_home.png"), full_page=True)
        
        # Verify "Eyebrow" style (should have //)
        eyebrow = page.locator('p:has-text("//")').first
        if eyebrow.is_visible():
            print("   ✅ Eyebrow prefix '//' found.")
            eyebrow_text = eyebrow.inner_text()
            print(f"   Eyebrow text: {eyebrow_text}")
        else:
            print("   ❌ Eyebrow prefix '//' NOT found.")
            
        # Verify Primary Button
        primary_btn = page.locator('a:has-text("Book Strategy")').first
        if primary_btn.is_visible():
            btn_bg = primary_btn.evaluate("el => window.getComputedStyle(el).backgroundColor")
            print(f"   Primary Button BG: {btn_bg}")
        
        # 2. Check RD Home
        print("\n🔍 Checking RD Home Aesthetic...")
        page.goto('http://127.0.0.1:3120/es/rd')
        page.wait_for_load_state('networkidle')
        
        page.screenshot(path=str(ARTIFACT_DIR / "rd_home.png"), full_page=True)
        
        rd_eyebrow = page.locator('p:has-text("//")').first
        if rd_eyebrow.is_visible():
             print(f"   RD Eyebrow text: {rd_eyebrow.inner_text()}")
             
        # 3. Check responsiveness (Mobile)
        print("\n🔍 Checking Mobile Responsiveness (375x667)...")
        page.set_viewport_size({"width": 375, "height": 667})
        page.goto('http://127.0.0.1:3120')
        page.wait_for_load_state('networkidle')
        page.screenshot(path=str(ARTIFACT_DIR / "mobile_view.png"))
        
        browser.close()
        print(f"\n✅ Verification complete. Artifacts saved in {ARTIFACT_DIR}")

if __name__ == "__main__":
    run_aesthetic_check()
