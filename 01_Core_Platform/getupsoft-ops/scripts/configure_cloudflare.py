
import undetected_chromedriver as uc
import time
import os
import shutil
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Setup profile copy to avoid "in use" error
user_data_dir = os.path.expandvars(r'%LOCALAPPDATA%\Google\Chrome\User Data')
profile_name = "Profile 1"
temp_user_data_dir = os.path.join(os.getcwd(), "temp_chrome_profile")

if os.path.exists(temp_user_data_dir):
    shutil.rmtree(temp_user_data_dir)

# Copy profile (excluding some heavy/lock files)
# shutil.copytree(os.path.join(user_data_dir, profile_name), os.path.join(temp_user_data_dir, profile_name), 
#                 ignore=shutil.ignore_patterns('Default', 'Singleton*'))
# Actually, it's safer to just point to the original and hope for the best or use a copy of the whole dir
# But that's slow. Let's try to just use the original and detect failure.

options = uc.ChromeOptions()
options.add_argument(f"--user-data-dir={user_data_dir}")
options.add_argument(f"--profile-directory={profile_name}")

try:
    driver = uc.Chrome(options=options)
    driver.get("https://one.dash.cloudflare.com/")
    print("Navigating to Cloudflare Zero Trust...")
    time.sleep(15) # Wait for auto-login
    
    # Save screenshot to check state
    driver.save_screenshot("cloudflare_state.png")
    print(f"Current Title: {driver.title}")
    
    # Navigation to Tunnels (example logic)
    # wait = WebDriverWait(driver, 20)
    # networks = wait.until(EC.element_to_be_clickable((By.XPATH, "//span[text()='Networks']")))
    # networks.click()
    
    # Since I don't know the exact UI state, I'll print the page source or more screenshots if needed
    # But for now, I'll stop here to avoid breaking things without seeing.
    
    driver.quit()
except Exception as e:
    print(f"Error during Selenium: {e}")
