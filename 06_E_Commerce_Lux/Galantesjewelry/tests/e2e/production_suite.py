from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path

CURRENT_DIR = Path(__file__).resolve().parent
REPO_ROOT = CURRENT_DIR.parent.parent
ARTIFACTS_ROOT = CURRENT_DIR / "artifacts"
DEFAULT_PRODUCTION_BASE_URL = "https://galantesjewelry.com"
DEFAULT_PRODUCTION_ODOO_URL = "https://odoo.galantesjewelry.com"


def utc_timestamp() -> str:
    return datetime.now(UTC).isoformat().replace("+00:00", "Z")


@dataclass
class SuiteCase:
    name: str
    script: str
    mode: str
    enabled: bool
    description: str
    extra_env: dict[str, str] | None = None


def create_artifact_dir() -> Path:
    artifact_dir = ARTIFACTS_ROOT / f"{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}_production_suite"
    artifact_dir.mkdir(parents=True, exist_ok=True)
    return artifact_dir


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run the production QA smoke suite with safe defaults and explicit opt-ins for mutating flows.",
    )
    parser.add_argument(
        "--include-account-portal",
        action="store_true",
        help="Include the authenticated customer portal smoke that depends on local gcloud access.",
    )
    parser.add_argument(
        "--include-checkout-payment",
        action="store_true",
        help="Include the live checkout payment verification. This creates a real Stripe test-mode payment.",
    )
    parser.add_argument(
        "--allow-real-appointment-send",
        action="store_true",
        help="Allow the production appointments suite to create a real calendar event and Gmail message.",
    )
    return parser.parse_args(argv)


def suite_cases(args: argparse.Namespace) -> list[SuiteCase]:
    return [
        SuiteCase(
            name="public_smoke",
            script="tests/e2e/public_smoke.py",
            mode="safe",
            enabled=True,
            description="Validate the public storefront and admin login surface with the shared Selenium profile runtime.",
            extra_env={"E2E_BASE_URL": DEFAULT_PRODUCTION_BASE_URL},
        ),
        SuiteCase(
            name="odoo_public_login",
            script="tests/e2e/odoo_public_login_smoke.py",
            mode="safe",
            enabled=True,
            description="Validate that the public Odoo host still routes to the login form.",
            extra_env={"ODOO_PUBLIC_URL": DEFAULT_PRODUCTION_ODOO_URL},
        ),
        SuiteCase(
            name="appointments_preflight",
            script="tests/e2e/production_appointment_calendar_gmail_flow.py",
            mode="guarded",
            enabled=True,
            description="Run production appointment health checks and, only when explicitly enabled, send a real Calendar/Gmail flow.",
            extra_env={
                "E2E_BASE_URL": DEFAULT_PRODUCTION_BASE_URL,
                **({"E2E_PRODUCTION_REAL_SEND": "1"} if args.allow_real_appointment_send else {}),
            },
        ),
        SuiteCase(
            name="account_portal_authenticated",
            script="scripts/verify_customer_portal_orders_invoices_profile9.py",
            mode="safe",
            enabled=args.include_account_portal,
            description="Validate authenticated customer account orders/invoices navigation using the production session signer.",
            extra_env={"E2E_BASE_URL": DEFAULT_PRODUCTION_BASE_URL},
        ),
        SuiteCase(
            name="checkout_live_payment",
            script="scripts/verify_checkout_success_profile9.py",
            mode="mutating",
            enabled=args.include_checkout_payment,
            description="Validate the live checkout success flow with a real Stripe test-mode payment.",
            extra_env={
                "E2E_BASE_URL": DEFAULT_PRODUCTION_BASE_URL,
                "ODOO_API_BASE_URL": DEFAULT_PRODUCTION_ODOO_URL,
            },
        ),
    ]


def write_json(path: Path, payload: object) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def write_markdown_report(path: Path, report: dict) -> None:
    lines = [
        "# Production QA Suite",
        "",
        f"- Status: `{report['status']}`",
        f"- Started: `{report['started_at']}`",
        f"- Finished: `{report['finished_at']}`",
        f"- Duration Seconds: `{report['duration_seconds']}`",
        "",
        "## Cases",
    ]

    for case in report["cases"]:
        lines.append(
            f"- `{case['status']}` {case['name']} ({case['mode']}): {case['description']}",
        )
        if case.get("duration_seconds") is not None:
            lines.append(f"  duration={case['duration_seconds']}s")
        if case.get("stdout_log"):
            lines.append(f"  stdout={case['stdout_log']}")
        if case.get("stderr_log"):
            lines.append(f"  stderr={case['stderr_log']}")
        if case.get("detail"):
            lines.append(f"  detail={case['detail']}")

    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def classify_run(return_code: int, stdout: str, stderr: str) -> tuple[str, str]:
    combined = "\n".join(part for part in (stdout, stderr) if part).lower()
    if "blocked:" in combined:
        return "blocked", "The child suite reported an operational guard or missing prerequisite."
    if return_code == 0:
        return "pass", "The child suite completed successfully."
    return "fail", f"The child suite exited with code {return_code}."


def run_case(case: SuiteCase, artifact_dir: Path) -> dict[str, object]:
    started_at = utc_timestamp()
    start = time.perf_counter()
    script_path = REPO_ROOT / case.script
    stdout_log = artifact_dir / f"{case.name}.stdout.log"
    stderr_log = artifact_dir / f"{case.name}.stderr.log"

    result: dict[str, object] = {
        "name": case.name,
        "script": str(script_path),
        "mode": case.mode,
        "description": case.description,
        "started_at": started_at,
        "stdout_log": str(stdout_log),
        "stderr_log": str(stderr_log),
    }

    if not case.enabled:
        result["status"] = "skipped"
        result["detail"] = "Disabled by default. Re-run with the explicit CLI flag when you want this coverage."
        result["finished_at"] = utc_timestamp()
        result["duration_seconds"] = 0.0
        stdout_log.write_text("", encoding="utf-8")
        stderr_log.write_text("", encoding="utf-8")
        return result

    env = os.environ.copy()
    if case.extra_env:
        env.update(case.extra_env)

    completed = subprocess.run(
        [sys.executable, str(script_path)],
        cwd=str(REPO_ROOT),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        env=env,
        check=False,
    )
    stdout_log.write_text(completed.stdout or "", encoding="utf-8")
    stderr_log.write_text(completed.stderr or "", encoding="utf-8")

    status, detail = classify_run(completed.returncode, completed.stdout, completed.stderr)
    result["status"] = status
    result["detail"] = detail
    result["return_code"] = completed.returncode
    result["finished_at"] = utc_timestamp()
    result["duration_seconds"] = round(time.perf_counter() - start, 2)
    return result


def summarize_status(cases: list[dict[str, object]]) -> str:
    if any(case["status"] == "fail" for case in cases):
        return "fail"
    if any(case["status"] == "blocked" for case in cases):
        return "blocked"
    return "pass"


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    artifact_dir = create_artifact_dir()
    started_at = utc_timestamp()
    start = time.perf_counter()
    cases: list[dict[str, object]] = []

    print(f"Artifacts: {artifact_dir}", flush=True)

    for case in suite_cases(args):
        print(f"Running {case.name} ({case.mode})...", flush=True)
        case_result = run_case(case, artifact_dir)
        cases.append(case_result)
        print(f"{case_result['status'].upper()}: {case.name} - {case_result['detail']}", flush=True)

    report = {
        "status": summarize_status(cases),
        "started_at": started_at,
        "finished_at": utc_timestamp(),
        "duration_seconds": round(time.perf_counter() - start, 2),
        "artifact_dir": str(artifact_dir),
        "cases": cases,
        "flags": {
            "include_account_portal": args.include_account_portal,
            "include_checkout_payment": args.include_checkout_payment,
            "allow_real_appointment_send": args.allow_real_appointment_send,
        },
    }

    write_json(artifact_dir / "result.json", report)
    write_markdown_report(artifact_dir / "report.md", report)

    print(f"Final status: {report['status'].upper()}", flush=True)
    return 1 if report["status"] == "fail" else 0


if __name__ == "__main__":
    raise SystemExit(main())
