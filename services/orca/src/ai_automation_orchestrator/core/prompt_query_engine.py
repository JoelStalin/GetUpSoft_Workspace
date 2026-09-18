from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
import hashlib
import json
import re
from pathlib import Path
from typing import Any, Iterable

from .paths import orca_config_path, workspace_path


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


ROLE_KEYWORDS: dict[str, tuple[str, ...]] = {
    "CEO": ("office-hours", "ceo", "executive", "strategy"),
    "Engineering Manager": ("eng", "implementation", "architecture", "review"),
    "Designer": ("design", "ux", "ui", "branding"),
    "QA": ("qa", "quality", "test", "verification"),
    "Security Officer": ("security", "guard", "audit", "secret"),
    "Release Engineer": ("release", "ship", "deploy", "freeze"),
    "Researcher": ("research", "investigate", "learn"),
}

CATEGORY_KEYWORDS: dict[str, tuple[str, ...]] = {
    "architecture": ("architecture", "architecture.md", "design"),
    "implementation": ("implement", "implementation", "build", "feature"),
    "security": ("security", "guard", "audit", "secret"),
    "qa": ("qa", "test", "verification"),
    "documentation": ("doc", "documentation", "readme"),
    "release": ("release", "ship", "deploy"),
    "research": ("research", "investigate", "learn"),
    "workflow": ("workflow", "blueprint", "pipeline"),
    "memory": ("memory", "obsidian", "repository_memory"),
    "automation": ("automation", "orchestrator", "workflow"),
    "integration-hermes": ("hermes",),
    "integration-orca": ("orca",),
}


@dataclass(slots=True)
class PromptRecord:
    prompt_id: str
    name: str
    path: str
    category: str
    gstack_role: str
    orca_module: str
    hermes_enabled: bool
    last_reviewed: str
    quality_score: int
    security_score: int
    test_coverage: int
    project: str = "GetUpSoft_Workspace"
    intent: str = ""
    summary: str = ""
    content_hash: str = ""
    modified_at: str = field(default_factory=utc_now)


class PromptQueryEngine:
    def __init__(
        self,
        *,
        index_path: str | Path | None = None,
        prompt_roots: Iterable[str | Path] | None = None,
    ) -> None:
        self.index_path = Path(index_path) if index_path else orca_config_path("prompt_index.json")
        self.prompt_roots = [Path(item) for item in (prompt_roots or self._default_prompt_roots())]
        self.index_path.parent.mkdir(parents=True, exist_ok=True)
        self.prompts: list[PromptRecord] = self._load_or_build_index()

    def _default_prompt_roots(self) -> list[Path]:
        return [
            workspace_path("_Knowledge_Center", "Master_Prompts"),
            workspace_path(".agents"),
            workspace_path("task-ledger"),
            workspace_path("_Knowledge_Center", "workspace-docs"),
            workspace_path("apps", "orca", "docs"),
            workspace_path("apps", "orca", "README.md"),
            workspace_path("apps", "orca", ".env.example"),
            workspace_path("apps", "orca", "src", "ai_automation_orchestrator", "integrations", "hermes_integration.py"),
            workspace_path("apps", "orca", "src", "ai_automation_orchestrator", "jarvis_integration.py"),
        ]

    def _load_or_build_index(self) -> list[PromptRecord]:
        if self.index_path.exists():
            payload = json.loads(self.index_path.read_text(encoding="utf-8"))
            return [PromptRecord(**item) for item in payload.get("prompts", [])]
        records = self.build_index()
        self.save_index(records)
        return records

    def build_index(self) -> list[PromptRecord]:
        records: list[PromptRecord] = []
        for root in self.prompt_roots:
            records.extend(self._scan_root(root))
        unique_records: dict[str, PromptRecord] = {}
        for record in records:
            unique_records[record.path] = record
        return sorted(unique_records.values(), key=lambda item: (item.category, item.name.lower()))

    def save_index(self, records: list[PromptRecord] | None = None) -> Path:
        prompt_records = self.prompts if records is None else records
        payload = {"generated_at": utc_now(), "prompts": [asdict(item) for item in prompt_records]}
        self.index_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        self.prompts = prompt_records
        return self.index_path

    def search_by_name(self, name: str) -> list[PromptRecord]:
        needle = name.lower()
        return [record for record in self.prompts if needle in record.name.lower() or needle in Path(record.path).name.lower()]

    def search_by_intent(self, intent: str) -> list[PromptRecord]:
        needle = intent.lower()
        return [record for record in self.prompts if needle in record.intent.lower() or needle in record.summary.lower()]

    def search_by_role(self, role: str) -> list[PromptRecord]:
        needle = role.lower()
        return [record for record in self.prompts if needle in record.gstack_role.lower()]

    def search_by_project(self, project: str) -> list[PromptRecord]:
        needle = project.lower()
        return [record for record in self.prompts if needle in record.project.lower() or needle in record.path.lower()]

    def search_recent(self, limit: int = 10) -> list[PromptRecord]:
        return sorted(self.prompts, key=lambda item: item.modified_at, reverse=True)[:limit]

    def find_duplicates(self) -> list[list[PromptRecord]]:
        groups: dict[str, list[PromptRecord]] = {}
        for record in self.prompts:
            key = self._duplicate_key(record)
            groups.setdefault(key, []).append(record)
        return [items for items in groups.values() if len(items) > 1]

    def find_obsolete(self) -> list[PromptRecord]:
        return [record for record in self.prompts if record.quality_score < 50 or record.test_coverage < 50]

    def suggest_improvements(self, record: PromptRecord) -> list[str]:
        suggestions: list[str] = []
        if record.security_score < 80:
            suggestions.append("Add explicit security constraints and secret-handling rules.")
        if record.test_coverage < 80:
            suggestions.append("Define the expected tests and evidence artifacts.")
        if record.quality_score < 80:
            suggestions.append("Tighten scope, acceptance criteria, and output format.")
        if not suggestions:
            suggestions.append("Prompt is strong; keep a changelog entry and regression test.")
        return suggestions

    def refine_prompt(self, prompt_text: str) -> dict[str, Any]:
        route = self.classify_text(prompt_text)
        return {
            "intent": route["intent"],
            "category": route["category"],
            "gstack_role": route["gstack_role"],
            "refined_prompt": self._refine_text(prompt_text, route),
        }

    def classify_text(self, text: str) -> dict[str, str]:
        lowered = text.lower()
        category = self._pick_match(lowered, CATEGORY_KEYWORDS, default="implementation")
        if any(keyword in lowered for keyword in ("security", "guard", "audit", "secret")):
            role = "Security Officer"
        elif any(keyword in lowered for keyword in ("qa", "test", "verification")):
            role = "QA"
        elif any(keyword in lowered for keyword in ("release", "ship", "deploy", "freeze")):
            role = "Release Engineer"
        elif any(keyword in lowered for keyword in ("research", "investigate", "learn")):
            role = "Researcher"
        elif "design" in lowered or "ux" in lowered or "ui" in lowered:
            role = "Designer"
        elif "ceo" in lowered or "office-hours" in lowered or "strategy" in lowered:
            role = "CEO"
        else:
            role = "Engineering Manager"
        intent = self._infer_intent(lowered)
        return {"category": category, "gstack_role": role, "intent": intent}

    def _scan_root(self, root: Path) -> list[PromptRecord]:
        if not root.exists():
            return []
        files: list[Path] = []
        if root.is_file():
            files.append(root)
        else:
            if root.name == "apps" and (root / "orca").exists():
                files.extend(
                    [
                        root / "orca" / "README.md",
                        root / "orca" / ".env.example",
                        root / "orca" / "docs" / "HERMES_CORE_INTEGRATION.md",
                        root / "orca" / "src" / "ai_automation_orchestrator" / "integrations" / "hermes_integration.py",
                        root / "orca" / "src" / "ai_automation_orchestrator" / "jarvis_integration.py",
                    ]
                )
            else:
                for pattern in ("*.md", "*.txt", "*.json"):
                    files.extend(root.rglob(pattern))
        records: list[PromptRecord] = []
        for file_path in files:
            if not file_path.exists() or file_path.is_dir():
                continue
            try:
                content = file_path.read_text(encoding="utf-8")
            except Exception:
                continue
            if not content.strip():
                continue
            record = self._record_from_content(file_path, content)
            records.append(record)
        return records

    def _record_from_content(self, path: Path, content: str) -> PromptRecord:
        lowered = content.lower()
        heuristics = self.classify_text(f"{path.name} {content[:2000]}")
        category = heuristics["category"]
        role = heuristics["gstack_role"]
        intent = heuristics["intent"]
        name = self._derive_name(path, content)
        return PromptRecord(
            prompt_id=self._stable_id(path),
            name=name,
            path=str(path.relative_to(workspace_path())),
            category=category,
            gstack_role=role,
            orca_module="ai_automation_orchestrator" if "orca" in str(path).lower() else "workspace",
            hermes_enabled="hermes" in lowered or "orca" in lowered,
            last_reviewed=utc_now(),
            quality_score=self._score_text(content),
            security_score=self._security_score(content),
            test_coverage=self._test_score(content),
            project=self._project_from_path(path),
            intent=intent,
            summary=self._summarize(content),
            content_hash=self._content_hash(content),
            modified_at=datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc).isoformat(),
        )

    def _derive_name(self, path: Path, content: str) -> str:
        for line in content.splitlines():
            stripped = line.strip("# ").strip()
            if stripped:
                return stripped[:120]
        return path.stem.replace("_", " ").title()

    def _summarize(self, content: str) -> str:
        lines = [line.strip() for line in content.splitlines() if line.strip()]
        return " ".join(lines[:3])[:280]

    def _content_hash(self, content: str) -> str:
        return hashlib.sha256(content.encode("utf-8")).hexdigest()

    def _stable_id(self, path: Path) -> str:
        return hashlib.sha1(str(path).encode("utf-8")).hexdigest()[:16]

    def _score_text(self, content: str) -> int:
        score = 40
        keywords = ("objective", "criteria", "tests", "security", "architecture", "workflow", "evidence")
        score += sum(8 for keyword in keywords if keyword in content.lower())
        return min(score, 100)

    def _security_score(self, content: str) -> int:
        score = 90
        if "secret" in content.lower() or "token" in content.lower():
            score -= 15
        if "password" in content.lower() and "mask" not in content.lower():
            score -= 10
        return max(score, 0)

    def _test_score(self, content: str) -> int:
        score = 30
        if "pytest" in content.lower():
            score += 30
        if "evidence" in content.lower():
            score += 20
        if "test" in content.lower():
            score += 15
        return min(score, 100)

    def _project_from_path(self, path: Path) -> str:
        text = str(path).lower()
        if "apps\\orca" in text or "apps/orca" in text:
            return "ORCA"
        if "_knowledge_center" in text:
            return "Knowledge Center"
        if "task-ledger" in text:
            return "Task Ledger"
        return "GetUpSoft_Workspace"

    def _pick_match(self, text: str, mapping: dict[str, tuple[str, ...]], *, default: str) -> str:
        for label, keywords in mapping.items():
            if any(keyword in text for keyword in keywords):
                return label
        return default

    def _infer_intent(self, text: str) -> str:
        if "review" in text:
            return "review"
        if "qa" in text or "test" in text:
            return "qa"
        if "learn" in text or "research" in text:
            return "research"
        if "guard" in text or "security" in text:
            return "security"
        if "deploy" in text or "release" in text:
            return "release"
        return "implementation"

    def _duplicate_key(self, record: PromptRecord) -> str:
        stem = Path(record.path).stem.lower()
        normalized = re.sub(r"[_\-]+", " ", stem)
        normalized = re.sub(r"[^a-z0-9\s]+", " ", normalized)
        return re.sub(r"\s+", " ", normalized).strip()

    def _refine_text(self, prompt_text: str, route: dict[str, str]) -> str:
        return (
            f"Role: {route['gstack_role']}\n"
            f"Category: {route['category']}\n"
            f"Intent: {route['intent']}\n"
            f"Prompt:\n{prompt_text.strip()}\n\n"
            "Include acceptance criteria, tests, security notes, and evidence requirements."
        )
