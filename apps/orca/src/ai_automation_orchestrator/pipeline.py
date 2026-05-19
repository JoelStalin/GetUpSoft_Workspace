"""
Pipeline Orchestrator — multi-model review workflow.

Flow per task:
  ASSIGN → EXECUTE (free worker) → REVIEW (paid reviewer)
       ↑____________ NEEDS_REVISION (max MAX_REVISIONS rounds)
  → TEST (paid tester) → QA (paid qa validator) → DONE
"""
from __future__ import annotations

import json
import logging
import sqlite3
from contextlib import closing
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock
from typing import Any
from uuid import uuid4

from ai_automation_orchestrator.config import AppConfig, ModelConfig

logger = logging.getLogger(__name__)

MAX_REVISIONS = 3

# ---------------------------------------------------------------------------
# Stage definitions
# ---------------------------------------------------------------------------

STAGE_ASSIGN = "assign"
STAGE_EXECUTE = "execute"
STAGE_REVIEW = "review"
STAGE_TEST = "test"
STAGE_QA = "qa"
STAGE_DONE = "done"
STAGE_FAILED = "failed"


@dataclass(slots=True)
class PipelineStage:
    stage: str
    model_id: str
    role: str
    input_summary: str
    output: str
    verdict: str | None = None          # APPROVED | NEEDS_REVISION | REJECTED | PASS | FAIL
    revision_round: int = 0
    started_at: str = field(default_factory=lambda: _now())
    completed_at: str | None = None


@dataclass(slots=True)
class PipelineRun:
    id: str
    task_type: str                      # code_generation | test_generation | automation | script | custom
    title: str
    objective: str
    status: str = "pending"
    current_stage: str = STAGE_ASSIGN
    revision_count: int = 0
    stages: list[PipelineStage] = field(default_factory=list)
    final_output: str | None = None
    error_message: str | None = None
    created_at: str = field(default_factory=lambda: _now())
    updated_at: str = field(default_factory=lambda: _now())


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# Persistence
# ---------------------------------------------------------------------------

class PipelineStore:
    def __init__(self, db_path: str | Path | None = None) -> None:
        from ai_automation_orchestrator.config import repository_root
        base = Path(db_path) if db_path else repository_root() / "data" / "pipelines.db"
        self.db_path = base
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()
        self._init()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init(self) -> None:
        with closing(self._connect()) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS pipeline_runs (
                    id            TEXT PRIMARY KEY,
                    task_type     TEXT NOT NULL,
                    title         TEXT NOT NULL,
                    objective     TEXT NOT NULL,
                    status        TEXT NOT NULL,
                    current_stage TEXT NOT NULL,
                    revision_count INTEGER NOT NULL DEFAULT 0,
                    stages_json   TEXT NOT NULL DEFAULT '[]',
                    final_output  TEXT,
                    error_message TEXT,
                    created_at    TEXT NOT NULL,
                    updated_at    TEXT NOT NULL
                )
            """)
            conn.commit()

    def create(self, task_type: str, title: str, objective: str) -> PipelineRun:
        run = PipelineRun(id=str(uuid4()), task_type=task_type, title=title, objective=objective)
        with self._lock, closing(self._connect()) as conn:
            conn.execute(
                "INSERT INTO pipeline_runs VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
                (run.id, run.task_type, run.title, run.objective,
                 run.status, run.current_stage, run.revision_count,
                 "[]", None, None, run.created_at, run.updated_at),
            )
            conn.commit()
        return run

    def save(self, run: PipelineRun) -> None:
        run.updated_at = _now()
        stages_json = json.dumps([asdict(s) for s in run.stages], ensure_ascii=False)
        with self._lock, closing(self._connect()) as conn:
            conn.execute("""
                UPDATE pipeline_runs SET
                    status=?, current_stage=?, revision_count=?,
                    stages_json=?, final_output=?, error_message=?, updated_at=?
                WHERE id=?
            """, (run.status, run.current_stage, run.revision_count,
                  stages_json, run.final_output, run.error_message,
                  run.updated_at, run.id))
            conn.commit()

    def get(self, run_id: str) -> PipelineRun | None:
        with closing(self._connect()) as conn:
            row = conn.execute("SELECT * FROM pipeline_runs WHERE id=?", (run_id,)).fetchone()
        return self._row_to_run(row) if row else None

    def list_runs(self, limit: int = 50) -> list[PipelineRun]:
        with closing(self._connect()) as conn:
            rows = conn.execute(
                "SELECT * FROM pipeline_runs ORDER BY created_at DESC LIMIT ?", (limit,)
            ).fetchall()
        return [self._row_to_run(r) for r in rows]

    def get_stats(self) -> dict[str, int]:
        with closing(self._connect()) as conn:
            rows = conn.execute(
                "SELECT status, COUNT(*) AS n FROM pipeline_runs GROUP BY status"
            ).fetchall()
        stats: dict[str, int] = {"pending": 0, "running": 0, "done": 0, "failed": 0}
        for row in rows:
            stats[row["status"]] = row["n"]
        stats["total"] = sum(stats.values())
        return stats

    @staticmethod
    def _row_to_run(row: sqlite3.Row) -> PipelineRun:
        stages_raw = json.loads(row["stages_json"] or "[]")
        stages = [PipelineStage(**s) for s in stages_raw]
        return PipelineRun(
            id=row["id"], task_type=row["task_type"], title=row["title"],
            objective=row["objective"], status=row["status"],
            current_stage=row["current_stage"], revision_count=row["revision_count"],
            stages=stages, final_output=row["final_output"],
            error_message=row["error_message"],
            created_at=row["created_at"], updated_at=row["updated_at"],
        )


# ---------------------------------------------------------------------------
# Role selection helpers
# ---------------------------------------------------------------------------

def _pick_by_role(models: list[ModelConfig], role: str, tier: str | None = None) -> ModelConfig | None:
    candidates = [m for m in models if role in m.roles]
    if tier:
        candidates = [m for m in candidates if m.tier == tier]
    return candidates[0] if candidates else None


def _pick_worker(models: list[ModelConfig]) -> ModelConfig:
    model = _pick_by_role(models, "worker", tier="free") or _pick_by_role(models, "worker")
    if not model:
        raise RuntimeError("No worker model configured. Add a model with roles=['worker'].")
    return model


def _pick_reviewer(models: list[ModelConfig]) -> ModelConfig | None:
    return _pick_by_role(models, "reviewer", tier="paid") or _pick_by_role(models, "reviewer")


def _pick_tester(models: list[ModelConfig]) -> ModelConfig | None:
    return _pick_by_role(models, "tester", tier="paid") or _pick_by_role(models, "tester")


def _pick_qa(models: list[ModelConfig]) -> ModelConfig | None:
    return _pick_by_role(models, "qa", tier="paid") or _pick_by_role(models, "qa")


# ---------------------------------------------------------------------------
# Prompt builders per stage
# ---------------------------------------------------------------------------

REVIEWER_SYSTEM = """You are a senior software engineer performing a code review.
Evaluate the output for: correctness, security, maintainability, and adherence to best practices.
Respond with exactly one of these verdicts on the FIRST line:
  VERDICT: APPROVED
  VERDICT: NEEDS_REVISION
  VERDICT: REJECTED
Then explain your reasoning and list specific issues if any."""

TESTER_SYSTEM = """You are a QA engineer. Your job is to validate the code/output by:
1. Writing concrete test cases (unit, integration, edge cases).
2. Identifying gaps in error handling.
3. Checking for security vulnerabilities.
Respond with exactly one of these verdicts on the FIRST line:
  VERDICT: PASS
  VERDICT: FAIL
Then provide the full test plan and findings."""

QA_SYSTEM = """You are a QA Lead consolidating a multi-model review pipeline.
You will receive: the original task, the worker's final output, the code review findings,
and the test results. Produce a final structured QA report with:
- Overall verdict (APPROVED / REJECTED)
- Summary of quality
- Issues found (if any) with severity (critical / major / minor)
- Recommendations
- Final approved output (cleaned up version of worker output if approved)"""


def _worker_messages(objective: str, task_type: str, previous_feedback: str | None = None) -> list[dict[str, str]]:
    system = f"You are an expert AI assistant specialized in {task_type}. Produce high-quality, production-ready output."
    user_content = f"Task: {objective}"
    if previous_feedback:
        user_content += f"\n\n--- Reviewer Feedback (apply these improvements) ---\n{previous_feedback}"
    return [{"role": "system", "content": system}, {"role": "user", "content": user_content}]


def _reviewer_messages(objective: str, worker_output: str, round_num: int) -> list[dict[str, str]]:
    return [
        {"role": "system", "content": REVIEWER_SYSTEM},
        {"role": "user", "content": (
            f"Original task:\n{objective}\n\n"
            f"Worker output (revision round {round_num}):\n```\n{worker_output}\n```\n\n"
            "Review the output and provide your verdict."
        )},
    ]


def _tester_messages(objective: str, worker_output: str) -> list[dict[str, str]]:
    return [
        {"role": "system", "content": TESTER_SYSTEM},
        {"role": "user", "content": (
            f"Task:\n{objective}\n\n"
            f"Output to test:\n```\n{worker_output}\n```\n\n"
            "Write and evaluate test cases."
        )},
    ]


def _qa_messages(objective: str, worker_output: str, review_output: str, test_output: str) -> list[dict[str, str]]:
    return [
        {"role": "system", "content": QA_SYSTEM},
        {"role": "user", "content": (
            f"## Original Task\n{objective}\n\n"
            f"## Worker Final Output\n```\n{worker_output}\n```\n\n"
            f"## Code Review Findings\n{review_output}\n\n"
            f"## Test Results\n{test_output}\n\n"
            "Produce the final QA report."
        )},
    ]


def _extract_verdict(text: str) -> str | None:
    for line in text.splitlines():
        stripped = line.strip()
        if stripped.upper().startswith("VERDICT:"):
            return stripped.split(":", 1)[1].strip().upper()
    return None


# ---------------------------------------------------------------------------
# Pipeline executor
# ---------------------------------------------------------------------------

class PipelineOrchestrator:
    def __init__(self, config: AppConfig, store: PipelineStore) -> None:
        self.config = config
        self.store = store
        self._providers = self._build_providers()

    def _build_providers(self) -> dict:
        from ai_automation_orchestrator.providers.nvidia_openai import NvidiaOpenAICompatibleProvider
        from ai_automation_orchestrator.providers.openai_native import OpenAINativeProvider
        from ai_automation_orchestrator.providers.anthropic_provider import AnthropicProvider
        return {
            "nvidia-openai-compatible": NvidiaOpenAICompatibleProvider(),
            "openai-native": OpenAINativeProvider(),
            "anthropic": AnthropicProvider(),
        }

    def _call(self, model: ModelConfig, messages: list[dict[str, str]]) -> str:
        provider = self._providers.get(model.provider)
        if not provider:
            raise KeyError(f"Provider '{model.provider}' not registered.")
        return provider.generate(model, messages)

    def _add_stage(self, run: PipelineRun, stage: str, model: ModelConfig, role: str,
                   input_summary: str, output: str, verdict: str | None = None,
                   revision_round: int = 0) -> PipelineStage:
        ps = PipelineStage(
            stage=stage, model_id=model.id, role=role,
            input_summary=input_summary[:300], output=output,
            verdict=verdict, revision_round=revision_round,
            completed_at=_now(),
        )
        run.stages.append(ps)
        return ps

    def run(self, run_id: str) -> None:
        run = self.store.get(run_id)
        if not run:
            logger.error("Pipeline run %s not found", run_id)
            return

        run.status = "running"
        run.current_stage = STAGE_ASSIGN
        self.store.save(run)

        models = self.config.models
        worker_model = _pick_worker(models)
        reviewer_model = _pick_reviewer(models)
        tester_model = _pick_tester(models)
        qa_model = _pick_qa(models)

        logger.info("[Pipeline %s] worker=%s reviewer=%s tester=%s qa=%s",
                    run_id, worker_model.id,
                    reviewer_model.id if reviewer_model else "none",
                    tester_model.id if tester_model else "none",
                    qa_model.id if qa_model else "none")

        worker_output = ""
        reviewer_output = ""
        tester_output = ""
        feedback: str | None = None

        try:
            # ---- STAGE: EXECUTE (with revision loop) -----------------------
            for revision in range(MAX_REVISIONS + 1):
                run.current_stage = STAGE_EXECUTE
                run.revision_count = revision
                self.store.save(run)

                msgs = _worker_messages(run.objective, run.task_type, feedback)
                worker_output = self._call(worker_model, msgs)
                self._add_stage(run, STAGE_EXECUTE, worker_model, "worker",
                                 run.objective, worker_output, revision_round=revision)
                self.store.save(run)
                logger.info("[Pipeline %s] Worker round %d completed (%d chars)",
                            run_id, revision, len(worker_output))

                # ---- STAGE: REVIEW -----------------------------------------
                if not reviewer_model:
                    logger.info("[Pipeline %s] No reviewer configured — skipping review", run_id)
                    break

                run.current_stage = STAGE_REVIEW
                self.store.save(run)

                review_msgs = _reviewer_messages(run.objective, worker_output, revision)
                reviewer_output = self._call(reviewer_model, review_msgs)
                verdict = _extract_verdict(reviewer_output)
                self._add_stage(run, STAGE_REVIEW, reviewer_model, "reviewer",
                                 f"Review of worker round {revision}", reviewer_output,
                                 verdict=verdict, revision_round=revision)
                self.store.save(run)
                logger.info("[Pipeline %s] Reviewer verdict: %s", run_id, verdict)

                if verdict == "APPROVED" or verdict is None:
                    break
                if verdict == "REJECTED":
                    run.status = STAGE_FAILED
                    run.error_message = f"Reviewer REJECTED output at round {revision}."
                    self.store.save(run)
                    return
                # NEEDS_REVISION: extract feedback and loop
                feedback = reviewer_output
                if revision == MAX_REVISIONS:
                    logger.warning("[Pipeline %s] Max revisions reached, proceeding with last output", run_id)

            # ---- STAGE: TEST -----------------------------------------------
            if tester_model:
                run.current_stage = STAGE_TEST
                self.store.save(run)

                test_msgs = _tester_messages(run.objective, worker_output)
                tester_output = self._call(tester_model, test_msgs)
                test_verdict = _extract_verdict(tester_output)
                self._add_stage(run, STAGE_TEST, tester_model, "tester",
                                 "Test worker output", tester_output, verdict=test_verdict)
                self.store.save(run)
                logger.info("[Pipeline %s] Tester verdict: %s", run_id, test_verdict)
            else:
                logger.info("[Pipeline %s] No tester configured — skipping tests", run_id)

            # ---- STAGE: QA -------------------------------------------------
            if qa_model:
                run.current_stage = STAGE_QA
                self.store.save(run)

                qa_msgs = _qa_messages(run.objective, worker_output, reviewer_output, tester_output)
                qa_output = self._call(qa_model, qa_msgs)
                qa_verdict = _extract_verdict(qa_output)
                self._add_stage(run, STAGE_QA, qa_model, "qa",
                                 "Final QA consolidation", qa_output, verdict=qa_verdict)
                run.final_output = qa_output
                self.store.save(run)
                logger.info("[Pipeline %s] QA verdict: %s", run_id, qa_verdict)
            else:
                run.final_output = worker_output

            run.status = STAGE_DONE
            run.current_stage = STAGE_DONE
            self.store.save(run)
            logger.info("[Pipeline %s] Completed successfully", run_id)

        except Exception as exc:
            logger.exception("[Pipeline %s] Failed: %s", run_id, exc)
            run.status = STAGE_FAILED
            run.error_message = str(exc)
            self.store.save(run)
