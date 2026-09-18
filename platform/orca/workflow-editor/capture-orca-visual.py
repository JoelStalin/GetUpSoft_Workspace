from playwright.sync_api import sync_playwright


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1376, "height": 784})
    page.goto("http://127.0.0.1:5173")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1200)
    page.screenshot(path="orca_restored_check.png", full_page=True)
    print(page.title())
    print(page.locator("text=Node Library").count())
    print(page.locator("text=SYSTEM: ONLINE").count())
    browser.close()
