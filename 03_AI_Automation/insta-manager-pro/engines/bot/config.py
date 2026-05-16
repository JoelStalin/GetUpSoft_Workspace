import json
import os
from pathlib import Path
from dataclasses import dataclass, field
from typing import List

@dataclass
class AppConfig:
    chrome_user_data_dir: str
    chrome_profile_directory: str = "Default"
    allowed_domains: List[str] = field(default_factory=lambda: ["galantesjewelry.com", "instagram.com", "facebook.com"])
    dry_run: bool = True
    live_demo: bool = True
    manual_approval_required: bool = True
    step_delay_ms: int = 1200
    screenshots_enabled: bool = True
    artifacts_dir: str = "./artifacts"
    output_dir: str = "./output"

    @classmethod
    def load(cls, config_path: str = "config.json"):
        if not os.path.exists(config_path):
            print(f"Config default used. {config_path} not found.")
            return cls(chrome_user_data_dir="", chrome_profile_directory="")
        
        with open(config_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return cls(**data)

    def validate(self):
        if not self.chrome_user_data_dir:
            raise ValueError("chrome_user_data_dir is required in config.json")
        
        # Asegurar que los directorios existen
        Path(self.artifacts_dir).mkdir(parents=True, exist_ok=True)
        Path(self.output_dir).mkdir(parents=True, exist_ok=True)
        
        print(f"Config validated. Artifacts at: {self.artifacts_dir}")

def get_config(config_path: str = "config.json"):
    cfg = AppConfig.load(config_path)
    cfg.validate()
    return cfg
