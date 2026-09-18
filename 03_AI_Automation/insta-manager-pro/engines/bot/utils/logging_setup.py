import logging
import os
from datetime import datetime

def setup_logging(artifacts_dir: str = "./artifacts"):
    os.makedirs(artifacts_dir, exist_ok=True)
    
    log_file = os.path.join(artifacts_dir, f"bot_run_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
    
    import sys
    import io
    if sys.platform == "win32":
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s [%(levelname)s] %(message)s',
        handlers=[
            logging.FileHandler(log_file, encoding='utf-8'),
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    logger = logging.getLogger("insta_bot")
    logger.info("=== Logging Setup Complete ===")
    return logger
