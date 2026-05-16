import json
import os
from datetime import datetime

class DBManager:
    def __init__(self, db_path="db/processed_users.json"):
        self.db_path = db_path
        self._ensure_db()

    def _ensure_db(self):
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        if not os.path.exists(self.db_path):
            with open(self.db_path, "w") as f:
                json.dump({"processed": []}, f)

    def is_processed(self, username, platform="Instagram"):
        with open(self.db_path, "r") as f:
            data = json.load(f)
            entry = f"{platform}:{username.lower()}"
            return entry in data["processed"]

    def mark_processed(self, username, platform="Instagram"):
        with open(self.db_path, "r") as f:
            data = json.load(f)
        
        entry = f"{platform}:{username.lower()}"
        if entry not in data["processed"]:
            data["processed"].append(entry)
            with open(self.db_path, "w") as f:
                json.dump(data, f, indent=4)
            return True
        return False

    def is_corrective_processed(self, username, platform="Instagram"):
        with open(self.db_path, "r") as f:
            data = json.load(f)
            corrective_list = data.get("corrective_processed", [])
            entry = f"{platform}:{username.lower()}"
            return entry in corrective_list

    def mark_corrective_processed(self, username, platform="Instagram"):
        with open(self.db_path, "r") as f:
            data = json.load(f)
        
        if "corrective_processed" not in data:
            data["corrective_processed"] = []
            
        entry = f"{platform}:{username.lower()}"
        if entry not in data["corrective_processed"]:
            data["corrective_processed"].append(entry)
            with open(self.db_path, "w") as f:
                json.dump(data, f, indent=4)
            return True
        return False

    def get_all_processed(self):
        with open(self.db_path, "r") as f:
            data = json.load(f)
            return data["processed"]
