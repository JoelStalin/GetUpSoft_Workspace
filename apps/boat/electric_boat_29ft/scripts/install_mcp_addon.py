import os
import sys
import shutil
import subprocess

blender_exe = r"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"
appdata = os.environ.get("APPDATA", "")
blender_addons_dir = os.path.join(appdata, "Blender Foundation", "Blender", "5.2", "scripts", "addons")

os.makedirs(blender_addons_dir, exist_ok=True)
mcp_target = os.path.join(blender_addons_dir, "mcp")

mcp_src = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\mcp"

if os.path.exists(mcp_target):
    shutil.rmtree(mcp_target)

shutil.copytree(mcp_src, mcp_target)
print(f"Installed MCP add-on to: {mcp_target}")

# Run python inside blender to enable the addon
enable_script = """
import bpy
try:
    bpy.ops.preferences.addon_enable(module="mcp")
    bpy.ops.wm.save_userpref()
    print("MCP addon enabled and userpref saved successfully.")
except Exception as e:
    print(f"Error enabling addon: {e}")
"""

cmd = [blender_exe, "--background", "--python-expr", enable_script]
res = subprocess.run(cmd, capture_output=True, text=True)
print("Blender output:\n", res.stdout)
print("Blender errors:\n", res.stderr)
