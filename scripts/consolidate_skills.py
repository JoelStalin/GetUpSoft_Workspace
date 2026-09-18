
import os
import shutil
from pathlib import Path

def consolidate_skills():
    workspace_root = Path(r"C:\Users\yoeli\Documents\GetUpSoft_Workspace")
    target_dir = workspace_root / ".agents" / "skills"
    
    # Sources of skills
    sources = [
        workspace_root / "_Knowledge_Center" / "Agents_Skills",
        workspace_root / "apps" / "orca" / "libs" / "hermes-agent" / "skills",
        workspace_root / "apps" / "orca" / "libs" / "hermes-agent" / "optional-skills",
    ]
    
    consolidated_count = 0
    
    for source in sources:
        if not source.exists():
            print(f"Source not found: {source}")
            continue
            
        print(f"Scanning {source}...")
        for skill_path in source.rglob("SKILL.md"):
            # The skill name is the immediate parent directory
            skill_name = skill_path.parent.name
            
            # Avoid moving generic folders like 'skills' or 'optional-skills'
            if skill_name in ["skills", "optional-skills", "Agents_Skills"]:
                continue
                
            dest_folder = target_dir / skill_name
            dest_file = dest_folder / "SKILL.md"
            
            try:
                dest_folder.mkdir(parents=True, exist_ok=True)
                shutil.copy2(skill_path, dest_file)
                consolidated_count += 1
            except Exception as e:
                print(f"Error copying {skill_path}: {e}")
                
    print(f"Successfully consolidated {consolidated_count} skills into {target_dir}")

if __name__ == "__main__":
    consolidate_skills()
