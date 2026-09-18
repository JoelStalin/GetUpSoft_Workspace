import os
import shutil
import subprocess

base_dir = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft"
workspace_dir = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat"

# 1. Subdirectories setup
dirs = [
    "source", "source/textures", "source/archives",
    "blender", "blender/backups",
    "mcp", "scripts",
    "renders", "renders/validation", "renders/technical", "renders/presentation",
    "exports", "references", "docs", "logs"
]

for d in dirs:
    os.makedirs(os.path.join(base_dir, d), exist_ok=True)

# 2. Copy archives if present
motor_zip = os.path.join(workspace_dir, "Motor Boat.zip")
mcp_zip = os.path.join(workspace_dir, "mcp-1.0.0.zip")

if os.path.exists(motor_zip):
    shutil.copy2(motor_zip, os.path.join(base_dir, "source/archives/Motor Boat.zip"))

if os.path.exists(mcp_zip):
    shutil.copy2(mcp_zip, os.path.join(base_dir, "source/archives/mcp-1.0.0.zip"))

# 3. Check Blender version
blender_exe = r"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"
version_info = "Blender Not Found"

if os.path.exists(blender_exe):
    res = subprocess.run([blender_exe, "--version"], capture_output=True, text=True)
    version_info = res.stdout.strip()

with open(os.path.join(base_dir, "logs/environment.txt"), "w", encoding="utf-8") as f:
    f.write(version_info + "\n")

print("Step 1 Directory & Environment setup complete:")
print("Blender version:", version_info.splitlines()[0] if version_info else "N/A")
