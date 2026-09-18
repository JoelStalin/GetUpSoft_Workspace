import os
from datetime import datetime

OUTPUT_FILE = "WORKSPACE.map"
# EXTREME RECURSION: No depth limit
EXCLUDE_DIRS = {
    "node_modules", ".git", ".venv", "dist", "build", "__pycache__", ".next", ".artifacts",
    "tmp", "archive", "logs", "chrome_profile", "data", ".mypy_cache", ".pytest_cache", ".ruff_cache",
    "Odoo_Enterprise_v15", "Odoo_Enterprise_v16", "Odoo_Enterprise_v17", "Odoo_Enterprise_v18" # Heavy Vendor
}
KEY_FILENAMES = {
    "GEMINI.md", "CLAUDE.md", "AGENTS.md", ".env.example", "README.md", 
    "pyproject.toml", "package.json", "docker-compose.yml", "WORKSPACE.map"
}

def generate_map():
    print("🔍 Generating TOTAL RECURSIVE Repository Map (No Depth Limit)...")
    
    lines = []
    lines.append("# 🗺️ TOTAL UNIVERSAL WORKSPACE MAP - GetUpSoft Ecosystem")
    lines.append(f"# Last Full Sync: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append("# MANDATORY FOR ALL AGENTS: Gemini, Claude, Codex, ChatGPT, Copilot, Cursor, OpenClaw, AutoGen, NemoClaw, Rowboat, Hermes, ORCA, mark-xxxix")
    lines.append("")
    lines.append("## 📜 AGENT GPS RULE (MANDATORY)")
    lines.append("1. **ZERO EXPLORATION**: Do NOT use recursive shell commands or broad searches. READ THIS FILE FIRST.")
    lines.append("2. **TOTAL VISIBILITY**: This map reflects 100% of the repository structure.")
    lines.append("3. **SYNC MANDATE**: Every agent (especially ORCA) MUST run `python scripts/update_repo_map.py` after ANY structural change.")
    lines.append("")
    lines.append("## 📂 Repository Tree (Full Depth)")
    lines.append("```text")
    
    root_path = os.getcwd()
    
    for root, dirs, files in os.walk(root_path):
        # Exclude vendor and cache noise for a clean logical map
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        
        rel_path = os.path.relpath(root, root_path)
        if rel_path == ".": continue
        
        depth = rel_path.count(os.sep) + 1
        indent = "  " * (depth - 1)
        dir_name = os.path.basename(root)
        
        # Highlighting CORE directories
        is_core = any(x in root for x in ["apps", "orca", "02_Odoo_ERP", "01_Core_Platform", "scripts", "task-ledger"])
        marker = " [CORE]" if is_core and depth <= 2 else ""
        
        lines.append(f"{indent}├── {dir_name}/{marker}")
        
        # Adding files to the tree for TOTAL DEPTH visibility
        for f_name in files:
            f_indent = "  " * depth
            lines.append(f"{f_indent}└── {f_name}")
            
    lines.append("```")
    lines.append("")
    lines.append("## 🤖 END OF TOTAL MAP")
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"✅ Total Recursive Map updated: {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_map()
