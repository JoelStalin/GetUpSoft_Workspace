import os
import logging
from datetime import datetime

def take_screenshot(driver, artifacts_dir: str, name: str):
    os.makedirs(artifacts_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%H%M%S_%f")
    filename = f"{name}_{timestamp}.png"
    path = os.path.join(artifacts_dir, filename)
    driver.save_screenshot(path)
    return path
