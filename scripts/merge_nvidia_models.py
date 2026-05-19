#!/usr/bin/env python3
"""Merge NVIDIA free models into models.json, avoiding duplicates."""

import json
from pathlib import Path
from typing import Any

def main():
    base_dir = Path(__file__).parent.parent / "03_AI_Automation" / "orca" / "config"
    models_file = base_dir / "models.json"
    source_file = base_dir / "models.nvidia-free.generated.json"

    if not models_file.exists():
        print(f"Error: {models_file} not found")
        return 1

    if not source_file.exists():
        print(f"Error: {source_file} not found")
        return 1

    # Load existing config
    with open(models_file, "r", encoding="utf-8") as f:
        config = json.load(f)

    # Load new models
    with open(source_file, "r", encoding="utf-8") as f:
        source = json.load(f)

    # Extract existing model IDs
    existing_ids = {m["id"] for m in config["models"]}
    print(f"Existing models: {len(existing_ids)}")
    print(f"  IDs: {', '.join(sorted(existing_ids))}")

    # Get new models, skip metadata if present
    new_models = source["models"]

    # Filter out duplicates
    models_to_add = []
    for model in new_models:
        if model["id"] not in existing_ids:
            # Remove metadata field if present (not part of ModelConfig)
            if "metadata" in model:
                del model["metadata"]
            models_to_add.append(model)

    # Add new models
    config["models"].extend(models_to_add)

    # Keep existing default_model if not overriding
    print(f"\nAdded {len(models_to_add)} new models")
    print(f"Total models now: {len(config['models'])}")

    # Write back
    with open(models_file, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2, ensure_ascii=False)

    print(f"\n[OK] Updated {models_file}")
    print(f"\nNew models added:")
    for m in models_to_add:
        print(f"  - {m['id']} ({m.get('provider', 'unknown')})")

    return 0

if __name__ == "__main__":
    exit(main())
