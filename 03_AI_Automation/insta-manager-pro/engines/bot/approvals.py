"""
approvals.py — Human-in-the-loop confirmation for sensitive steps.

All approvals are obtained interactively from the console.
Decisions are logged for traceability.
"""

from __future__ import annotations
import logging
import sys
from datetime import datetime

log = logging.getLogger("bot")

_approval_log: list[dict] = []


def request_approval(prompt: str, step_name: str) -> bool:
    """
    Display prompt and wait for the operator to type y/n.
    Returns True only on explicit 'y' or 'yes'.
    Records decision in the in-memory approval log.
    """
    print("\n" + "=" * 60)
    print(f"  [APPROVAL REQUIRED] {step_name}")
    print(f"  {prompt}")
    print("  Type 'y' to approve, anything else to skip.")
    print("=" * 60)

    try:
        answer = input("  Your decision [y/N]: ").strip().lower()
    except (EOFError, KeyboardInterrupt):
        answer = "n"

    approved = answer in ("y", "yes")
    record = {
        "step": step_name,
        "prompt": prompt,
        "decision": "APPROVED" if approved else "DENIED",
        "timestamp": datetime.now().isoformat(),
    }
    _approval_log.append(record)

    if approved:
        log.passed("Approval granted by operator: %s", step_name)
    else:
        log.skipped("Operator declined: %s — step will be skipped", step_name)

    return approved


def get_approval_log() -> list[dict]:
    """Return the list of all approval decisions recorded this run."""
    return list(_approval_log)
