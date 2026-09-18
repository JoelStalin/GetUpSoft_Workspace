import os

for dpath in [
    r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\renders\technical",
    r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\renders\presentation"
]:
    for f in os.listdir(dpath):
        fp = os.path.join(dpath, f)
        if "0001" in f or f.endswith(".png.png"):
            os.remove(fp)

print("Tech Renders Cleaned:", sorted(os.listdir(r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\renders\technical")))
print("Pres Renders Cleaned:", sorted(os.listdir(r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\renders\presentation")))
