"""Export a mass audit without inventing missing engineering data."""

import csv
from pathlib import Path

import bpy


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "documentation" / "Mass_Report.csv"
CATEGORIES = {"hull", "structure", "battery", "propulsion", "solar", "electronics", "passenger", "safety", "fuel", "interior"}


def main() -> None:
    rows = []
    totals = {"mass": 0.0, "mx": 0.0, "my": 0.0, "mz": 0.0}
    complete = []

    for obj in sorted(bpy.data.objects, key=lambda item: item.name):
        mass = obj.get("mass_kg")
        category = obj.get("category")
        known = isinstance(mass, (int, float)) and mass >= 0 and category in CATEGORIES
        location = obj.matrix_world.translation
        rows.append({
            "object": obj.name,
            "type": obj.type,
            "mass_kg": mass if known else "MISSING",
            "cg_x_m": location.x if known else "MISSING",
            "cg_y_m": location.y if known else "MISSING",
            "cg_z_m": location.z if known else "MISSING",
            "category": category if category in CATEGORIES else "MISSING",
            "source": obj.get("source", "MISSING"),
            "confidence": obj.get("confidence", "MISSING"),
        })
        if known and mass > 0:
            complete.append(obj)
            totals["mass"] += mass
            totals["mx"] += mass * location.x
            totals["my"] += mass * location.y
            totals["mz"] += mass * location.z

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    print(f"MASS_REPORT={OUTPUT}")
    print(f"OBJECTS_WITH_COMPLETE_MASS={len(complete)}")
    print(f"OBJECTS_TOTAL={len(rows)}")
    if totals["mass"] > 0:
        print(f"TOTAL_MASS_KG={totals['mass']}")
        print(f"CG_M={totals['mx']/totals['mass']},{totals['my']/totals['mass']},{totals['mz']/totals['mass']}")
    else:
        print("TOTAL_MASS_KG=MISSING")
        print("CG_M=MISSING")


if __name__ == "__main__":
    main()
