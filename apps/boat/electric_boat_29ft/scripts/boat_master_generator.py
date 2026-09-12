"""Create the non-destructive V0 master metadata layer in a Blender file.

Run with Blender in background mode. The input .blend is supplied before
``--python`` and the output path may be supplied after ``-- --output PATH``.
Geometry generation will be added only after naval station data is defined.
"""

import argparse
import json
from pathlib import Path
import sys

import bpy


PROJECT_ROOT = Path(__file__).resolve().parents[2]
PARAMETERS_PATH = PROJECT_ROOT / "config" / "boat_parameters.json"
DEFAULT_OUTPUT = PROJECT_ROOT / "electric_boat_29ft" / "blender" / "ElectricBoat_29ft_V0.blend"


def parse_args() -> argparse.Namespace:
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    return parser.parse_args(argv)


def ensure_collection(name: str) -> bpy.types.Collection:
    collection = bpy.data.collections.get(name)
    if collection is None:
        collection = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(collection)
    return collection


def ensure_empty(name: str, collection: bpy.types.Collection) -> bpy.types.Object:
    obj = bpy.data.objects.get(name)
    if obj is None:
        obj = bpy.data.objects.new(name, None)
        collection.objects.link(obj)
    return obj


def main() -> None:
    args = parse_args()
    config = json.loads(PARAMETERS_PATH.read_text(encoding="utf-8"))

    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0
    scene.unit_settings.length_unit = "METERS"

    reference = ensure_collection("00_REFERENCE")
    master = ensure_empty("BOAT_V0_MASTER_PARAMETERS", reference)
    master.empty_display_type = "PLAIN_AXES"
    master["schema_version"] = config["schema_version"]
    master["model_id"] = config["model_id"]
    master["parameters_source"] = str(PARAMETERS_PATH)
    master["coordinate_system_json"] = json.dumps(config["coordinate_system"], sort_keys=True)

    for name, parameter in config["parameters"].items():
        master[f"{name}__status"] = parameter["status"]
        master[f"{name}__unit"] = parameter.get("unit") or ""
        master[f"{name}__source"] = parameter["source"]
        master[f"{name}__confidence"] = parameter["confidence"]
        value = parameter.get("value")
        master[name] = "MISSING" if value is None else value

    for name in ("BOAT_ROOT", "CG_TOTAL", "CG_BATTERY", "CG_PASSENGERS", "CG_PROPULSION", "LCB_ESTIMATED"):
        ensure_empty(name, reference)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(args.output.resolve()))
    print(f"V0_MASTER_OUTPUT={args.output.resolve()}")
    print(f"V0_PARAMETER_COUNT={len(config['parameters'])}")


if __name__ == "__main__":
    main()
