# Project Memory: TinderBotJ

## Overview
TinderBotJ is a Tinder automation tool written in Python using Selenium and Undetected-Chromedriver. It is designed to automate liking, disliking, messaging, and scraping profiles on Tinder.

## Key Files
- **quickstart.py**: The main entry point for the user "Joel". It includes an infinite loop for liking, disliking, and messaging. It supports manual login.
- **auto_swipe.py**: A simpler script for just auto-swiping.
- **scraper.py**: Script for scraping profile data.
- **tinderbotj/**: The core library containing the `Session` class and other helpers.
- **chrome_profile/**: Directory likely used to store the Chrome browser profile/session.

## Setup & Usage
1.  **Dependencies**: Installed via `pip install -r requirements.txt`.
2.  **Running**: `python quickstart.py`
3.  **Login**: The script pauses to allow the user to log in manually via the browser window.

## Current Context (2026-02-13)
- **Action Taken**: Created `project_memory` directory and this context file.
- **Fixes Applied**:
    - **Session Initialization**: Removed hardcoded `version_main=137` in `tinderbotj/session.py` to allow auto-detection of Chrome version.
    - **Chrome Options**: Fixed incorrect usage of `uc.Chrome()` as options object (changed to `uc.ChromeOptions()`).
    - **Headless Mode**: Added `options.headless = headless` to support newer Selenium versions compatible with `undetected-chromedriver`.
    - **Cleanup Logic**: Made `atexit` cleanup robust against initialization failures.
    - **Dependencies**: Upgraded `undetected-chromedriver` to ensure compatibility.
    - **Chrome Initialization**: Removed manual `version_main` to allow auto-patching. Refactored `user_data_dir` to be passed directly to `uc.Chrome` instead of via options, ensuring correct Windows path handling and preventing profile conflicts.
    - **Existing Session Attachment**: Modified `Session.__init__` to check port 9222. If active, it attaches to the existing Chrome instance instead of launching a new one.
    - **Quickstart**: Updated `quickstart.py` to auto-wait for login (polling) instead of manual enter press.
    - **Popup Handling**:
        - Added `--disable-notifications` and `--disable-infobars` to suppress browser-level alerts.
        - Uncommented `_handle_potential_popups()` call in the main `like()` loop.
        - Added a generic fallback to click any "No Thanks", "Not Now", or "Maybe Later" buttons found on the page.
- **Status**: `quickstart.py` restarted (PID: e5f02991...) after clearing Chrome instances. Monitoring for stability.

## Functional Goals
- Validate the `Session` class initialization (Done).
- Test browser launching (In Progress).
- Test login flow (waiting for user input) (Script ready).
- Test basic actions (navigating to /app/recs).
