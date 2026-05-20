"""Utilities for importing n8n workflow collections into Orca."""

from __future__ import annotations

import json
import uuid
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from ai_automation_orchestrator.n8n_models import N8nWorkflow


def is_n8n_workflow_payload(data: Any) -> bool:
    """Return true for JSON payloads shaped like n8n workflow exports."""
    return (
        isinstance(data, dict)
        and isinstance(data.get("nodes"), list)
        and isinstance(data.get("connections"), dict)
    )


def normalize_n8n_workflow(data: dict[str, Any], source_file: Path | None = None) -> N8nWorkflow:
    """Normalize a raw n8n JSON export into Orca's workflow model."""
    now = datetime.now(UTC).isoformat()
    workflow_id = str(data.get("id") or uuid.uuid4())
    name = str(data.get("name") or (source_file.stem if source_file else f"Imported workflow {workflow_id}"))
    nodes = []
    for index, raw_node in enumerate(data.get("nodes") or []):
        if not isinstance(raw_node, dict):
            continue
        node = dict(raw_node)
        node.setdefault("id", str(uuid.uuid5(uuid.NAMESPACE_URL, f"{workflow_id}:{node.get('name', index)}:{index}")))
        node.setdefault("name", f"Node {index + 1}")
        node.setdefault("type", "n8n-nodes-base.noOp")
        node.setdefault("typeVersion", 1)
        node.setdefault("position", [index * 220, 0])
        node.setdefault("parameters", {})
        nodes.append(node)

    connections = {}
    for source, node_connections in (data.get("connections") or {}).items():
        if not isinstance(node_connections, dict):
            continue
        cleaned_node_connections = {}
        for branch_type, branches in node_connections.items():
            if not isinstance(branches, list):
                continue
            cleaned_node_connections[branch_type] = [
                branch if isinstance(branch, list) else []
                for branch in branches
            ]
        connections[source] = cleaned_node_connections

    payload = {
        "id": workflow_id,
        "name": name,
        "active": bool(data.get("active", False)),
        "nodes": nodes,
        "connections": connections,
        "settings": data.get("settings") or {"executionOrder": "v1"},
        "createdAt": str(data.get("createdAt") or now),
        "updatedAt": str(data.get("updatedAt") or now),
        "orca_meta": {
            "imported_from": str(source_file) if source_file else None,
            "source": "n8n-json",
        },
    }
    return N8nWorkflow(**payload)


def load_n8n_workflow_file(path: Path) -> N8nWorkflow:
    """Load and normalize one n8n workflow JSON file."""
    data = json.loads(path.read_text(encoding="utf-8"))
    if not is_n8n_workflow_payload(data):
        raise ValueError("JSON is not an n8n workflow export")
    return normalize_n8n_workflow(data, source_file=path)


def discover_n8n_workflows(source_path: Path) -> tuple[list[Path], list[dict[str, str]]]:
    """Find valid workflow JSON files under a directory."""
    valid: list[Path] = []
    skipped: list[dict[str, str]] = []

    for path in sorted(source_path.rglob("*.json")):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            skipped.append({"path": str(path), "reason": f"invalid_json: {exc}"})
            continue

        if is_n8n_workflow_payload(data):
            valid.append(path)
        else:
            skipped.append({"path": str(path), "reason": "not_n8n_workflow"})

    return valid, skipped


def import_n8n_workflow_directory(
    source_path: Path,
    existing_workflows: dict[str, N8nWorkflow],
    *,
    limit: int | None = None,
    dry_run: bool = False,
) -> dict[str, Any]:
    """Import valid n8n workflow JSON files from a directory."""
    if not source_path.exists() or not source_path.is_dir():
        raise FileNotFoundError(f"Directory not found: {source_path}")

    valid_files, skipped = discover_n8n_workflows(source_path)
    selected_files = valid_files[:limit] if limit else valid_files

    imported: list[dict[str, Any]] = []
    failed: list[dict[str, str]] = []
    workflows = dict(existing_workflows)

    for path in selected_files:
        try:
            workflow = load_n8n_workflow_file(path)
        except Exception as exc:
            failed.append({"path": str(path), "reason": str(exc)})
            continue

        if workflow.id in workflows:
            workflow.id = str(uuid.uuid5(uuid.NAMESPACE_URL, str(path.resolve())))
        workflow.orca_meta.update({"imported_from": str(path), "source": "n8n-workflows-repository"})

        if not dry_run:
            workflows[workflow.id] = workflow

        imported.append(
            {
                "id": workflow.id,
                "name": workflow.name,
                "node_count": len(workflow.nodes),
                "path": str(path),
            }
        )

    return {
        "source_path": str(source_path),
        "discovered": len(valid_files),
        "selected": len(selected_files),
        "imported": len(imported),
        "skipped": len(skipped),
        "failed": len(failed),
        "dry_run": dry_run,
        "items": imported,
        "failures": failed[:50],
        "skipped_samples": skipped[:50],
        "workflows": workflows,
    }
