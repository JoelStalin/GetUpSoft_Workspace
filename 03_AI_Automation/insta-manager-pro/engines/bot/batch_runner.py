"""
batch_runner.py — Process a list of targets, send DMs, pause every N users.

Rate limiting:
  - delay_between_messages_s : random pause between each message (default 60-120s)
  - batch_size               : messages per batch (default 10)
  - timeout_between_batches_s: pause after each batch (default 30-40 min)
"""

from __future__ import annotations
import json
import logging
import random
import time
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

from selenium.webdriver.remote.webdriver import WebDriver

from bot.message_builder import build_message
from bot.models import ConfidenceLevel
from bot.sender import send_instagram_dm, send_facebook_dm
from bot.utils.screenshots import take_screenshot

log = logging.getLogger("bot")


@dataclass
class Target:
    username: str
    platform: str           # "instagram" | "facebook"
    nombre: Optional[str] = None
    url: Optional[str] = None

    def profile_url(self) -> str:
        if self.url:
            return self.url
        if self.platform == "instagram":
            return f"https://www.instagram.com/{self.username}/"
        if self.platform == "facebook":
            return f"https://www.facebook.com/{self.username}/"
        return self.url or ""


@dataclass
class BatchResult:
    target: Target
    sent: bool
    error: Optional[str]
    timestamp: datetime = field(default_factory=datetime.now)
    screenshot: Optional[str] = None


def load_targets(targets_file: Path) -> list[Target]:
    """Load targets from a JSON file."""
    with open(targets_file, encoding="utf-8") as f:
        raw = json.load(f)
    targets = []
    for item in raw:
        targets.append(Target(
            username=item["username"],
            platform=item.get("platform", "instagram"),
            nombre=item.get("nombre"),
            url=item.get("url"),
        ))
    return targets


def save_progress(results: list[BatchResult], output_dir: Path) -> None:
    """Append results to a progress JSON log."""
    output_dir.mkdir(parents=True, exist_ok=True)
    path = output_dir / "batch_progress.json"

    existing = []
    if path.exists():
        try:
            with open(path, encoding="utf-8") as f:
                existing = json.load(f)
        except Exception:
            pass

    for r in results:
        existing.append({
            "username": r.target.username,
            "platform": r.target.platform,
            "sent": r.sent,
            "error": r.error,
            "timestamp": r.timestamp.isoformat(),
            "screenshot": r.screenshot,
        })

    with open(path, "w", encoding="utf-8") as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)
    log.info("Progress saved → %s", path)


def get_already_processed(output_dir: Path) -> set[str]:
    """Return set of usernames already processed (sent or failed)."""
    path = output_dir / "batch_progress.json"
    if not path.exists():
        return set()
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        return {item["username"] for item in data if item.get("sent")}
    except Exception:
        return set()


def run_batch(
    driver: WebDriver,
    targets: list[Target],
    artifacts_dir: Path,
    output_dir: Path,
    batch_size: int = 10,
    delay_between_s: tuple[int, int] = (60, 120),
    timeout_between_batches_s: tuple[int, int] = (1800, 2400),  # 30-40 min
    step_delay_ms: int = 1500,
    dry_run: bool = False,
) -> list[BatchResult]:
    """
    Process all targets in batches of batch_size.
    After each batch, pause for timeout_between_batches_s seconds.
    """
    already_done = get_already_processed(output_dir)
    pending = [t for t in targets if t.username not in already_done]

    log.info(
        "Batch runner started — %d targets pending (%d already done), batch_size=%d",
        len(pending), len(already_done), batch_size,
    )

    all_results: list[BatchResult] = []
    total_sent = 0
    total_failed = 0

    for batch_num, batch_start in enumerate(range(0, len(pending), batch_size), start=1):
        batch = pending[batch_start:batch_start + batch_size]

        log.info("")
        log.info("=" * 60)
        log.info("BATCH %d — %d targets (overall: %d/%d)",
                 batch_num, len(batch), batch_start, len(pending))
        log.info("=" * 60)

        batch_results: list[BatchResult] = []

        for idx, target in enumerate(batch, start=1):
            log.info("")
            log.step("[%d/%d] Processing: @%s (%s)",
                     batch_start + idx, len(pending), target.username, target.platform)

            # Build personalised message
            confidence = ConfidenceLevel.HIGH if target.nombre else ConfidenceLevel.NONE
            message, personalised = build_message(target.nombre, confidence)
            log.info("Message: personalised=%s, name=%s", personalised, target.nombre)

            result = BatchResult(target=target, sent=False, error=None)

            if dry_run:
                log.skipped("DRY RUN — would send to @%s", target.username)
                result.sent = False
                result.error = "dry_run=True"
            else:
                try:
                    if target.platform == "instagram":
                        r = send_instagram_dm(
                            driver,
                            target.profile_url(),
                            message,
                            artifacts_dir,
                            step_delay_ms,
                        )
                    elif target.platform == "facebook":
                        r = send_facebook_dm(
                            driver,
                            target.profile_url(),
                            message,
                            artifacts_dir,
                            step_delay_ms,
                        )
                    else:
                        r = {"sent": False, "error": f"Unknown platform: {target.platform}"}

                    result.sent = r.get("sent", False)
                    result.error = r.get("error")
                    result.screenshot = r.get("screenshot")

                except Exception as exc:
                    result.sent = False
                    result.error = str(exc)
                    log.error("Unexpected error for @%s: %s", target.username, exc)

            if result.sent:
                total_sent += 1
                log.passed("SENT to @%s", target.username)
            else:
                total_failed += 1
                log.warning("FAILED/SKIPPED @%s — %s", target.username, result.error)

            batch_results.append(result)
            all_results.append(result)
            save_progress([result], output_dir)

            # Pause between messages (not after the last one in batch)
            if idx < len(batch):
                delay = random.uniform(*delay_between_s)
                log.info("Waiting %.0fs before next message...", delay)
                _countdown(int(delay))

        # End of batch — print mini summary
        sent_in_batch = sum(1 for r in batch_results if r.sent)
        log.info("")
        log.info("Batch %d complete — %d/%d sent successfully", batch_num, sent_in_batch, len(batch))

        # Pause between batches (not after the last batch)
        if batch_start + batch_size < len(pending):
            pause = random.uniform(*timeout_between_batches_s)
            resume_at = datetime.now() + timedelta(seconds=pause)
            log.info("")
            log.info("=" * 60)
            log.info("TIMEOUT entre batches — %.0f minutos", pause / 60)
            log.info("Próximo batch arranca a las: %s", resume_at.strftime("%H:%M:%S"))
            log.info("=" * 60)
            _countdown(int(pause))

    log.info("")
    log.info("=" * 60)
    log.info("BATCH RUN COMPLETE")
    log.info("  Total sent    : %d", total_sent)
    log.info("  Total failed  : %d", total_failed)
    log.info("  Progress file : %s/batch_progress.json", output_dir)
    log.info("=" * 60)

    return all_results


def _countdown(seconds: int, interval: int = 30) -> None:
    """Sleep for `seconds`, printing remaining time every `interval` seconds."""
    remaining = seconds
    while remaining > 0:
        chunk = min(interval, remaining)
        time.sleep(chunk)
        remaining -= chunk
        if remaining > 0:
            mins = remaining // 60
            secs = remaining % 60
            log.info("  ⏳ Timeout restante: %dm %ds", mins, secs)
