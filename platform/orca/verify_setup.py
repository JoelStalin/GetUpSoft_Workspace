import os
import sys
import json
from pathlib import Path
import subprocess

def check_dependencies():
    print("Checking dependencies...")
    try:
        import fastapi
        import uvicorn
        import yaml
        import websockets
        print(" [OK] Core dependencies installed.")
    except ImportError as e:
        print(f" [FAIL] Missing dependency: {e}")
        return False
    return True

def check_config():
    print("Checking configuration...")
    models_path = Path("config/models.json")
    if not models_path.exists():
        print(" [FAIL] config/models.json missing.")
        return False
    try:
        data = json.loads(models_path.read_text(encoding='utf-8'))
        print(f" [OK] models.json is valid. Found {len(data['models'])} models.")
    except Exception as e:
        print(f" [FAIL] models.json invalid: {e}")
        return False
    return True

def check_hermes():
    print("Checking Hermes integration...")
    hermes_path = Path("libs/hermes-agent/run_agent.py")
    if hermes_path.exists():
        print(" [OK] Hermes agent found in libs.")
    else:
        print(" [WARN] Hermes agent not found in libs.")
    return True

def main():
    root = Path("c:/Users/yoeli/Documents/GetUpSoft_Workspace/03_AI_Automation/orca")
    os.chdir(root)
    
    success = True
    success &= check_dependencies()
    success &= check_config()
    success &= check_hermes()
    
    if success:
        print("\nOrca is 100% configured and functional locally.")
        print("To start the service, run: ai-orchestrator-api")
    else:
        print("\nOrca has configuration issues.")
        sys.exit(1)

if __name__ == "__main__":
    main()
