import os
import shutil

render_dir = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\renders\technical"

for f in os.listdir(render_dir):
    fp = os.path.join(render_dir, f)
    if "0001" in f:
        os.remove(fp)

print("Cleaned render directory contents:", sorted(os.listdir(render_dir)))
