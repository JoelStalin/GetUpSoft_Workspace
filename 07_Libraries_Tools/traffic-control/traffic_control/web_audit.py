from __future__ import annotations

import asyncio
import csv
import json
import zipfile
from collections import Counter, defaultdict
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from .config import TrafficControlConfig, normalize_target
from .scope import assert_allowed


TRACKING_HINTS = (
    "analytics",
    "ads",
    "doubleclick",
    "facebook",
    "gtag",
    "googletagmanager",
    "hotjar",
    "pixel",
    "segment",
    "sentry",
    "tiktok",
)


@dataclass(frozen=True)
class WebRequestRecord:
    url: str
    method: str
    resource_type: str
    domain: str
    status: int | None
    content_type: str | None
    size: int | None
    is_first_party: bool
    is_allowed: bool
    is_suspicious: bool


def domain_from_url(url: str) -> str:
    host = urlparse(url).hostname or ""
    return normalize_target(host) if host else ""


def sanitize_url(url: str) -> str:
    parsed = urlparse(url)
    if not parsed.scheme or not parsed.netloc:
        return url
    path = parsed.path or "/"
    query_marker = "?<redacted>" if parsed.query else ""
    return f"{parsed.scheme}://{parsed.netloc}{path}{query_marker}"


def is_first_party_domain(domain: str, page_domain: str) -> bool:
    return domain == page_domain or domain.endswith(f".{page_domain}")


def is_allowed_client_domain(domain: str, page_domain: str, config: TrafficControlConfig) -> bool:
    if is_first_party_domain(domain, page_domain):
        return True
    for allowed in config.allowed_client_domains:
        if domain == allowed or domain.endswith(f".{allowed}"):
            return True
    return False


def looks_suspicious(url: str, domain: str, allowed: bool) -> bool:
    lowered = f"{domain} {url}".lower()
    return (not allowed) or any(hint in lowered for hint in TRACKING_HINTS)


async def _run_playwright_audit(
    url: str,
    config: TrafficControlConfig,
    wait_seconds: int,
) -> tuple[list[WebRequestRecord], list[str]]:
    try:
        from playwright.async_api import async_playwright
    except ImportError as exc:
        raise RuntimeError("Playwright is required for web-audit") from exc

    page_domain = domain_from_url(url)
    assert_allowed(page_domain, config)
    records_by_url: dict[str, dict[str, Any]] = {}
    console_messages: list[str] = []

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context(ignore_https_errors=False)
        page = await context.new_page()

        def on_request(request: Any) -> None:
            domain = domain_from_url(request.url)
            allowed = is_allowed_client_domain(domain, page_domain, config)
            records_by_url[request.url] = {
                "url": sanitize_url(request.url),
                "method": request.method,
                "resource_type": request.resource_type,
                "domain": domain,
                "status": None,
                "content_type": None,
                "size": None,
                "is_first_party": is_first_party_domain(domain, page_domain),
                "is_allowed": allowed,
                "is_suspicious": looks_suspicious(request.url, domain, allowed),
            }

        async def on_response(response: Any) -> None:
            existing = records_by_url.get(response.url)
            if not existing:
                return
            headers = response.headers
            size_header = headers.get("content-length")
            existing["status"] = response.status
            existing["content_type"] = headers.get("content-type")
            existing["size"] = int(size_header) if size_header and size_header.isdigit() else None

        page.on("request", on_request)
        page.on("response", on_response)
        page.on("console", lambda msg: console_messages.append(f"{msg.type}: {msg.text}"))

        await page.goto(url, wait_until="networkidle", timeout=max(wait_seconds, 5) * 1000)
        await page.wait_for_timeout(wait_seconds * 1000)
        await context.close()
        await browser.close()

    records = [WebRequestRecord(**record) for record in records_by_url.values()]
    return records, console_messages


def build_summary(records: list[WebRequestRecord], url: str, console_messages: list[str]) -> dict[str, Any]:
    domain_counts = Counter(record.domain for record in records)
    resource_counts = Counter(record.resource_type for record in records)
    unexpected = sorted({record.domain for record in records if not record.is_allowed})
    suspicious = [record for record in records if record.is_suspicious]
    scripts = [record for record in records if record.resource_type == "script"]
    return {
        "url": url,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "request_count": len(records),
        "domain_counts": dict(domain_counts.most_common()),
        "resource_counts": dict(resource_counts.most_common()),
        "unexpected_domains": unexpected,
        "suspicious_request_count": len(suspicious),
        "external_scripts": [asdict(record) for record in scripts if not record.is_first_party],
        "suspicious_requests": [asdict(record) for record in suspicious],
        "console_messages": console_messages[-100:],
    }


def write_web_audit_bundle(
    url: str,
    config: TrafficControlConfig,
    wait_seconds: int = 5,
) -> Path:
    records, console_messages = asyncio.run(_run_playwright_audit(url, config, wait_seconds))
    page_domain = domain_from_url(url)
    safe_domain = page_domain.replace(".", "_")
    out_dir = config.output_dir / f"web-audit-{safe_domain}"
    out_dir.mkdir(parents=True, exist_ok=True)

    summary = build_summary(records, url, console_messages)
    requests_json = out_dir / "requests.json"
    requests_csv = out_dir / "requests.csv"
    summary_json = out_dir / "summary.json"
    zip_path = config.output_dir / f"web-audit-{safe_domain}.zip"

    requests_json.write_text(
        json.dumps([asdict(record) for record in records], indent=2, sort_keys=True),
        encoding="utf-8",
    )
    summary_json.write_text(json.dumps(summary, indent=2, sort_keys=True), encoding="utf-8")

    with requests_csv.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "method",
                "status",
                "resource_type",
                "domain",
                "is_first_party",
                "is_allowed",
                "is_suspicious",
                "content_type",
                "size",
                "url",
            ],
        )
        writer.writeheader()
        for record in records:
            writer.writerow(asdict(record))

    domain_groups: dict[str, list[str]] = defaultdict(list)
    for record in records:
        domain_groups[record.domain].append(record.url)
    (out_dir / "domains.json").write_text(
        json.dumps(domain_groups, indent=2, sort_keys=True),
        encoding="utf-8",
    )

    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in out_dir.iterdir():
            archive.write(path, arcname=path.name)

    return zip_path


async def _run_manual_web_audit(
    url: str,
    config: TrafficControlConfig,
    output_name: str | None,
    stop_file: Path | None,
) -> Path:
    try:
        from playwright.async_api import async_playwright
    except ImportError as exc:
        raise RuntimeError("Playwright is required for manual-web-audit") from exc

    page_domain = domain_from_url(url)
    assert_allowed(page_domain, config)
    safe_domain = page_domain.replace(".", "_")
    out_dir = config.output_dir / f"manual-web-audit-{safe_domain}"
    out_dir.mkdir(parents=True, exist_ok=True)
    requests_path = out_dir / "requests.jsonl"
    summary_path = out_dir / "summary.json"
    zip_path = config.output_dir / (output_name or f"manual-web-audit-{safe_domain}.zip")

    records: list[WebRequestRecord] = []
    console_messages: list[str] = []

    async with async_playwright() as playwright:
        profile_dir = out_dir / "browser-profile"
        context = await playwright.chromium.launch_persistent_context(
            user_data_dir=profile_dir,
            headless=False,
            ignore_https_errors=False,
        )
        page = await context.new_page()

        def append_record(record: WebRequestRecord) -> None:
            records.append(record)
            with requests_path.open("a", encoding="utf-8") as handle:
                handle.write(json.dumps(asdict(record), sort_keys=True) + "\n")

        def on_request(request: Any) -> None:
            domain = domain_from_url(request.url)
            allowed = is_allowed_client_domain(domain, page_domain, config)
            append_record(
                WebRequestRecord(
                    url=sanitize_url(request.url),
                    method=request.method,
                    resource_type=request.resource_type,
                    domain=domain,
                    status=None,
                    content_type=None,
                    size=None,
                    is_first_party=is_first_party_domain(domain, page_domain),
                    is_allowed=allowed,
                    is_suspicious=looks_suspicious(request.url, domain, allowed),
                )
            )

        page.on("request", on_request)
        page.on("console", lambda msg: console_messages.append(f"{msg.type}: {msg.text}"))
        await page.goto(url, wait_until="domcontentloaded", timeout=60000)

        print("Manual browser session is open.")
        print("Authenticate and navigate as needed.")
        if stop_file:
            print(f"Create this file to stop and zip the audit: {stop_file}")
            while not stop_file.exists():
                await page.wait_for_timeout(1000)
        else:
            print("Return to this terminal and press Enter to stop, summarize, and zip the audit.")
            await asyncio.to_thread(input)

        await context.close()

    summary = build_summary(records, url, console_messages)
    summary_path.write_text(json.dumps(summary, indent=2, sort_keys=True), encoding="utf-8")
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        archive.write(requests_path, arcname="requests.jsonl")
        archive.write(summary_path, arcname="summary.json")
    return zip_path


def write_manual_web_audit_bundle(
    url: str,
    config: TrafficControlConfig,
    output_name: str | None = None,
    stop_file: Path | None = None,
) -> Path:
    return asyncio.run(_run_manual_web_audit(url, config, output_name, stop_file))
