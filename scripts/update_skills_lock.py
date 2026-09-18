
import json
from pathlib import Path

def update_skills_lock():
    workspace_root = Path(r"C:\Users\yoeli\Documents\GetUpSoft_Workspace")
    skills_dir = workspace_root / ".agents" / "skills"
    lock_file = workspace_root / "skills-lock.json"
    
    if not skills_dir.exists():
        print("Skills directory not found")
        return

    # Get all skill folders in .agents/skills
    skills = [d.name for d in skills_dir.iterdir() if d.is_dir()]
    
    new_lock = {
        "version": 1,
        "skills": {}
    }
    
    for skill in skills:
        # We use a generic source since these are now local consolidated skills
        # But we maintain the structure for compatibility
        new_lock["skills"][skill] = {
            "source": "local-consolidated",
            "sourceType": "local",
            "skillPath": f"skills/{skill}/SKILL.md",
            "computedHash": "consolidated" 
        }
        
    with open(lock_file, "w", encoding="utf-8") as f:
        json.dump(new_lock, f, indent=2)
        
    print(f"Updated skills-lock.json with {len(skills)} skills.")

if __name__ == "__main__":
    update_skills_lock()
