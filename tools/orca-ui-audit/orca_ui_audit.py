from __future__ import annotations

import argparse
import json
import os
import re
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
WORKFLOW_EDITOR = ROOT / "apps" / "orca" / "workflow-editor"
EVIDENCE_ROOT = ROOT / "apps" / "orca" / "evidence" / "workflow-editor-main-ui-refactor" / "inventory"
PRE_REFACTOR_ROOT = ROOT / "apps" / "orca" / "evidence" / "pre-refactor"

IGNORED_DIRS = {
    ".git",
    "node_modules",
    "dist",
    "evidence",
    "playwright-report",
    "test-results",
    "screenshots",
    "logs",
    "video-analysis",
    "__pycache__",
}


LOCALSTORAGE_PATTERN = re.compile(r"""localStorage\.(?:getItem|setItem|removeItem)\(\s*['"]([^'"]+)['"]""")
ROUTE_PATTERN = re.compile(r"""['"](/(?:api|workflow-editor|jarvis|plugin|downloads|health|bot|tinder)[^'"]*)['"]""")
KEYFRAME_PATTERN = re.compile(r"@keyframes\s+([A-Za-z0-9_-]+)")
CSS_VAR_PATTERN = re.compile(r"--([A-Za-z0-9_-]+)\s*:\s*([^;]+);")


@dataclass(slots=True)
class AuditFile:
    path: str
    size: int
    kind: str


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def list_files(base: Path, suffixes: tuple[str, ...]) -> list[Path]:
    if not base.exists():
        return []
    collected: list[Path] = []
    for current_root, dirs, files in os.walk(base):
        dirs[:] = [directory for directory in dirs if directory not in IGNORED_DIRS]
        for filename in files:
            path = Path(current_root) / filename
            if path.suffix.lower() in suffixes:
                collected.append(path)
    return collected


def to_rel(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT)).replace("\\", "/")
    except ValueError:
        return str(path)


def scan_components() -> dict[str, Any]:
    files = list_files(WORKFLOW_EDITOR / "src" / "components", (".tsx", ".ts", ".jsx", ".js"))
    return {
        "count": len(files),
        "items": [to_rel(path) for path in sorted(files)],
    }


def scan_routes() -> dict[str, Any]:
    paths = []
    sources = list_files(WORKFLOW_EDITOR / "src", (".tsx", ".ts", ".js", ".jsx"))
    sources += list_files(WORKFLOW_EDITOR / "docs", (".md", ".json", ".html", ".py", ".js", ".ts"))
    sources += [WORKFLOW_EDITOR / "package.json", WORKFLOW_EDITOR / "vite.config.ts", WORKFLOW_EDITOR / "vite.config.js", WORKFLOW_EDITOR / "server.prod.js"]
    seen = set()
    for path in sources:
        text = read_text(path)
        for match in ROUTE_PATTERN.findall(text):
            if match not in seen:
                seen.add(match)
                paths.append({"route": match, "source": to_rel(path)})
    return {"count": len(paths), "items": paths}


def scan_hooks() -> dict[str, Any]:
    files = list_files(WORKFLOW_EDITOR / "src" / "hooks", (".tsx", ".ts", ".js", ".jsx"))
    return {
        "count": len(files),
        "items": [to_rel(path) for path in sorted(files)],
    }


def scan_providers() -> dict[str, Any]:
    files = list_files(WORKFLOW_EDITOR / "src" / "contexts", (".tsx", ".ts", ".js", ".jsx"))
    providers = []
    for path in sorted(files):
        text = read_text(path)
        matches = re.findall(r"export (?:function|const)\s+([A-Za-z0-9_]+Provider)", text)
        for match in matches:
            providers.append({"provider": match, "source": to_rel(path)})
    return {"count": len(providers) or len(files), "items": providers or [to_rel(path) for path in sorted(files)]}


def scan_stores() -> dict[str, Any]:
    files = list_files(WORKFLOW_EDITOR / "src" / "store", (".tsx", ".ts", ".js", ".jsx"))
    files += list_files(WORKFLOW_EDITOR / "src" / "stores", (".tsx", ".ts", ".js", ".jsx"))
    return {
        "count": len(files),
        "items": [to_rel(path) for path in sorted(files)],
    }


def scan_settings() -> dict[str, Any]:
    settings = []
    for path in list_files(WORKFLOW_EDITOR / "src", (".tsx", ".ts", ".js", ".jsx", ".css", ".md")):
        text = read_text(path)
        for key in sorted(set(LOCALSTORAGE_PATTERN.findall(text))):
            settings.append({"key": key, "source": to_rel(path)})
    return {"count": len(settings), "items": settings}


def scan_animations() -> dict[str, Any]:
    animations = []
    for path in list_files(WORKFLOW_EDITOR / "src", (".css", ".tsx", ".ts", ".js", ".jsx")):
        text = read_text(path)
        if path.suffix.lower() == ".css":
            for name in sorted(set(KEYFRAME_PATTERN.findall(text))):
                animations.append({"animation": name, "source": to_rel(path)})
        else:
            for name in sorted(set(re.findall(r"animation(?:Name)?\s*:\s*['\"]([^'\"]+)['\"]", text))):
                animations.append({"animation": name, "source": to_rel(path)})
    return {"count": len(animations), "items": animations}


def scan_theme() -> dict[str, Any]:
    tokens = []
    for path in [WORKFLOW_EDITOR / "src" / "index.css", WORKFLOW_EDITOR / "tailwind.config.js", WORKFLOW_EDITOR / "tailwind.config.ts"]:
        if not path.exists():
            continue
        text = read_text(path)
        if path.suffix.lower() == ".css":
            for name, value in sorted(set(CSS_VAR_PATTERN.findall(text))):
                tokens.append({"token": f"--{name}", "value": value.strip(), "source": to_rel(path)})
    return {"count": len(tokens), "items": tokens}


def scan_assets() -> dict[str, Any]:
    assets = []
    for path in list_files(WORKFLOW_EDITOR / "src", (".png", ".jpg", ".jpeg", ".svg", ".gif", ".webm", ".mp4", ".json", ".css", ".html")):
        kind = path.suffix.lower().lstrip(".")
        assets.append(asdict(AuditFile(path=to_rel(path), size=path.stat().st_size, kind=kind)))
    return {"count": len(assets), "items": sorted(assets, key=lambda item: item["path"])}


def scan_dependencies() -> dict[str, Any]:
    package_json = json.loads((WORKFLOW_EDITOR / "package.json").read_text(encoding="utf-8"))
    dependencies = []
    for section in ("dependencies", "devDependencies"):
        for name, version in sorted(package_json.get(section, {}).items()):
            dependencies.append({"name": name, "version": version, "section": section})
    return {"count": len(dependencies), "items": dependencies}


def scan_bundles() -> dict[str, Any]:
    dist = WORKFLOW_EDITOR / "dist"
    bundles = []
    if dist.exists():
        for path in list_files(dist, (".js", ".css", ".html", ".map")):
            bundles.append({"file": to_rel(path), "size": path.stat().st_size})
    return {"count": len(bundles), "items": sorted(bundles, key=lambda item: item["file"])}


def scan_localstorage() -> dict[str, Any]:
    keys = []
    for path in list_files(WORKFLOW_EDITOR / "src", (".tsx", ".ts", ".js", ".jsx", ".md", ".css")):
        text = read_text(path)
        for key in sorted(set(LOCALSTORAGE_PATTERN.findall(text))):
            keys.append({"key": key, "source": to_rel(path)})
    return {"count": len(keys), "items": keys}


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def generate_outputs() -> dict[str, dict[str, Any]]:
    outputs = {
        "routes.json": scan_routes(),
        "components.json": scan_components(),
        "stores.json": scan_stores(),
        "settings.json": scan_settings(),
        "hooks.json": scan_hooks(),
        "providers.json": scan_providers(),
        "animations.json": scan_animations(),
        "theme-tokens.json": scan_theme(),
        "assets.json": scan_assets(),
        "bundle-analysis.json": scan_bundles(),
        "localstorage-keys.json": scan_localstorage(),
        "dependencies.json": scan_dependencies(),
    }

    PRE_REFACTOR_ROOT.mkdir(parents=True, exist_ok=True)
    EVIDENCE_ROOT.mkdir(parents=True, exist_ok=True)
    for filename, payload in outputs.items():
        write_json(PRE_REFACTOR_ROOT / filename, payload)
        write_json(EVIDENCE_ROOT / filename, payload)
    return outputs


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate ORCA workflow-editor inventory outputs.")
    parser.add_argument("--pretty", action="store_true", help="Print a short summary.")
    args = parser.parse_args()

    outputs = generate_outputs()
    summary = {name: payload["count"] for name, payload in outputs.items()}
    print(json.dumps(summary, indent=2 if args.pretty else None, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
