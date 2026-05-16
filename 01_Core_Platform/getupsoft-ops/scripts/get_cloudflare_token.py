
import undetected_chromedriver as uc
import time
import os

options = uc.ChromeOptions()
# Path to Profile 1
user_data_dir = os.path.expandvars(r'%LOCALAPPDATA%\Google\Chrome\User Data')
options.add_argument(f"--user-data-dir={user_data_dir}")
options.add_argument("--profile-directory=Profile 1")
# options.add_argument("--headless") # Headless might not work with profiles if Chrome is open

try:
    driver = uc.Chrome(options=options)
    driver.get("https://one.dash.cloudflare.com/")
    time.sleep(10) # Wait for page load and potential auth
    driver.save_screenshot("cloudflare_home.png")
    print(f"Page title: {driver.title}")
    
    # Logic to find tunnel and get token would go here
    # For now, let's just see if we can get in.
    
    driver.quit()
except Exception as e:
    print(f"Error: {e}")
