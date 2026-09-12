import os
import glob
import subprocess

print("Searching for Blender installations...")

possible_paths = [
    r"C:\Program Files\Blender Foundation\*",
    r"C:\Program Files\*",
    r"C:\Users\yoeli\AppData\Local\Programs\*",
    r"C:\Users\yoeli\Downloads\*",
    r"D:\*",
]

found = []
for p in possible_paths:
    for matches in glob.glob(p):
        if "blender" in matches.lower():
            bexe = os.path.join(matches, "blender.exe")
            if os.path.exists(bexe):
                found.append(bexe)
            # check subdirs
            for root, dirs, files in os.walk(matches):
                if "blender.exe" in files:
                    found.append(os.path.join(root, "blender.exe"))

found = list(set(found))
print("Found Blender executables:", found)

for bexe in found:
    try:
        res = subprocess.run([bexe, "--version"], capture_output=True, text=True, timeout=5)
        print(f"Version for {bexe}:\n{res.stdout.splitlines()[0] if res.stdout else res.stderr}")
    except Exception as e:
        print(f"Error checking {bexe}: {e}")
