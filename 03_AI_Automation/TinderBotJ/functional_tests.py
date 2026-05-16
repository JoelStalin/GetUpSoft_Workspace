import time
import os
import sys
import logging
import io

# Fix UnicodeEncodError on Windows terminals
if sys.platform.startswith('win'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Add current directory to path so we can import tinderbotj
sys.path.append(os.getcwd())

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("functional_tests.log", encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)

from tinderbotj.session import Session

def run_functional_test():
    logging.info("🚀 Starting Functional Test...")
    
    try:
        # Initialize session - this should open the browser
        logging.info("Initializing Session (opening browser)...")
        # store_session=True uses the existing 'chrome_profile' directory
        session = Session(store_session=True)
        
        logging.info("✅ Browser opened successfully.")
        
        # Navigate to Tinder
        logging.info("Navigating to Tinder...")
        session.browser.get("https://tinder.com")
        
        # Check login status
        if session._is_logged_in():
            logging.info("✅ Already logged in (Session restored).")
        else:
            logging.info("⚠️ Not logged in.")
            logging.info("👉 Please log in manually in the browser window. Waiting for login up to 5 minutes...")
            # Poll for login status
            start_wait = time.time()
            logged_in = False
            while time.time() - start_wait < 300:  # Wait 5 minutes
                try:
                    if session._is_logged_in():
                        logging.info("✅ Login verified!")
                        logged_in = True
                        break
                    time.sleep(5)
                except Exception as e:
                    logging.warning(f"Error checking login status: {e}")
                    time.sleep(5)
            
            if not logged_in:
                logging.info("❌ Timeout: Login not detected within 5 minutes. Exiting test.")
                return

        # Navigate to recommendations
        logging.info("Navigating to Recommendations...")
        session.browser.get("https://tinder.com/app/recs")
        time.sleep(5)
        
        current_url = session.browser.current_url
        logging.info(f"Current URL: {current_url}")
        
        if "recs" in current_url:
            logging.info("✅ Successfully navigated to recommendations.")
        else:
            logging.info("⚠️ URL does not contain 'recs'. Might be on a different page.")

        logging.info("🎉 Functional test completed successfully.")

    except Exception as e:
        logging.error(f"❌ Error during functional test: {e}", exc_info=True)

if __name__ == "__main__":
    run_functional_test()
