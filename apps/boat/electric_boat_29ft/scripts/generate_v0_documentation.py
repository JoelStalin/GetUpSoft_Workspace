"""Generate V0 component and parameter-history documents from source data."""

import csv
import json
from datetime import date
from pathlib import Path

import bpy


PROJECT_ROOT = Path(__file__).resolve().parents[2]
MODEL_ROOT = Path(__file__).resolve().parents[1]
CONFIG = PROJECT_ROOT / "config" / "boat_parameters.json"
DOCS = MODEL_ROOT / "documentation"


def main() -> None:
    config = json.loads(CONFIG.read_text(encoding="utf-8"))
    DOCS.mkdir(parents=True, exist_ok=True)

    with (DOCS / "Parameter_History.csv").open("w", newline="", encoding="utf-8") as handle:
        fields = ["parameter", "old_value", "new_value", "unit", "reason", "source", "date", "confidence", "status"]
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for name, value in config["parameters"].items():
            writer.writerow({
                "parameter": name,
                "old_value": "",
                "new_value": "MISSING" if value.get("value") is None else value["value"],
                "unit": value.get("unit") or "",
                "reason": "V0 baseline audit",
                "source": value["source"],
                "date": date.today().isoformat(),
                "confidence": value["confidence"],
                "status": value["status"],
            })

    with (DOCS / "Component_List.csv").open("w", newline="", encoding="utf-8") as handle:
        fields = ["object", "type", "collections", "geometry_status", "mass_status", "material_status", "cfd_status", "structure_status", "manufacturer_status"]
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for obj in sorted(bpy.data.objects, key=lambda item: item.name):
            writer.writerow({
                "object": obj.name,
                "type": obj.type,
                "collections": ";".join(sorted(col.name for col in obj.users_collection)),
                "geometry_status": obj.get("geometry_status", "ASSUMPTION"),
                "mass_status": "KNOWN" if isinstance(obj.get("mass_kg"), (int, float)) else "MISSING",
                "material_status": "DEFINED" if getattr(obj.data, "materials", None) and len(obj.data.materials) else "MISSING",
                "cfd_status": obj.get("cfd_status", "PENDING"),
                "structure_status": obj.get("structure_status", "PENDING"),
                "manufacturer_status": obj.get("manufacturer_status", "NOT_DEFINED"),
            })

    print(f"PARAMETER_HISTORY={DOCS / 'Parameter_History.csv'}")
    print(f"COMPONENT_LIST={DOCS / 'Component_List.csv'}")
    print(f"DOCUMENTED_OBJECTS={len(bpy.data.objects)}")


if __name__ == "__main__":
    main()
