import os
import shutil

base_dir = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft"

dirs = [
    "source",
    "source/textures",
    "blender",
    "blender/backups",
    "scripts",
    "renders/technical",
    "renders/presentation",
    "exports",
    "references",
    "mcp",
    "docs",
    "logs",
]

for d in dirs:
    path = os.path.join(base_dir, d)
    os.makedirs(path, exist_ok=True)
    print(f"Created: {path}")

# Source boat files
src_boat_folder = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\Motor Boat\boat blender"
board_blend = os.path.join(src_boat_folder, "board.blend")

# 1. Copy board.blend to source/board_original.blend
board_orig = os.path.join(base_dir, "source", "board_original.blend")
shutil.copy2(board_blend, board_orig)
print(f"Copied original model to: {board_orig}")

# 2. Copy board.blend to blender/electric_boat_29ft.blend
work_blend = os.path.join(base_dir, "blender", "electric_boat_29ft.blend")
shutil.copy2(board_blend, work_blend)
print(f"Created working model at: {work_blend}")

# 3. Copy textures to source/textures and blender/
textures_dir = os.path.join(base_dir, "source", "textures")
blender_dir = os.path.join(base_dir, "blender")
for fname in os.listdir(src_boat_folder):
    full_p = os.path.join(src_boat_folder, fname)
    if os.path.isfile(full_p):
        shutil.copy2(full_p, textures_dir)
        shutil.copy2(full_p, blender_dir)
        print(f"Copied texture asset: {fname}")

# 4. Copy mcp-1.0.0 contents to mcp/
mcp_src = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\mcp-1.0.0"
mcp_dst = os.path.join(base_dir, "mcp")
for item in os.listdir(mcp_src):
    s = os.path.join(mcp_src, item)
    d = os.path.join(mcp_dst, item)
    if os.path.isdir(s):
        if os.path.exists(d):
            shutil.rmtree(d)
        shutil.copytree(s, d)
    else:
        shutil.copy2(s, d)
print("Copied MCP add-on files successfully.")
