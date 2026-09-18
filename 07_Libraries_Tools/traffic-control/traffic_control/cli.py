from __future__ import annotations

import argparse
import json
from pathlib import Path

from .config import load_config
from .logs import summarize_access_log
from .runners import run_nmap, run_tshark_capture, timestamp, write_json_report
from .scope import assert_allowed, resolve_target
from .web_audit import write_manual_web_audit_bundle, write_web_audit_bundle


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="traffic-control",
        description="Defensive traffic control for authorized GetUpSoft web projects.",
    )
    parser.add_argument("--config", default="traffic-control.yml", help="Path to YAML config")
    sub = parser.add_subparsers(dest="command", required=True)

    resolve = sub.add_parser("resolve", help="Resolve an authorized domain or IP")
    resolve.add_argument("--target", required=True)

    scan = sub.add_parser("scan", help="Run nmap against an authorized target")
    scan.add_argument("--target", required=True)
    scan.add_argument("--nmap-arg", action="append", default=[], help="Override nmap args")

    logs = sub.add_parser("logs", help="Summarize Nginx/Apache access logs")
    logs.add_argument("--file", required=True)
    logs.add_argument("--limit", type=int, default=20)

    capture = sub.add_parser("capture", help="Capture local packets for an authorized host")
    capture.add_argument("--target", required=True)
    capture.add_argument("--interface", required=True)
    capture.add_argument("--seconds", type=int)
    capture.add_argument("--packet-limit", type=int)

    web_audit = sub.add_parser(
        "web-audit",
        help="Open an authorized web page and report client-side outbound requests",
    )
    web_audit.add_argument("--url", required=True)
    web_audit.add_argument("--wait-seconds", type=int, default=5)

    manual_web_audit = sub.add_parser(
        "manual-web-audit",
        help="Open a visible browser for manual navigation and record sanitized network metadata",
    )
    manual_web_audit.add_argument("--url", required=True)
    manual_web_audit.add_argument("--output-name")
    manual_web_audit.add_argument("--stop-file")

    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    config = load_config(Path(args.config))

    if args.command == "resolve":
        checked = assert_allowed(args.target, config)
        print(json.dumps({"target": checked, "addresses": resolve_target(checked)}, indent=2))
        return 0

    if args.command == "scan":
        output = run_nmap(args.target, config, extra_args=args.nmap_arg or None)
        print(f"nmap XML written: {output}")
        return 0

    if args.command == "logs":
        summary = summarize_access_log(Path(args.file), limit=args.limit)
        output = write_json_report(
            config.output_dir / f"log-summary-{timestamp()}.json",
            summary.to_dict(),
        )
        print(json.dumps(summary.to_dict(), indent=2, sort_keys=True))
        print(f"JSON report written: {output}")
        return 0

    if args.command == "capture":
        output = run_tshark_capture(
            args.target,
            args.interface,
            config,
            seconds=args.seconds,
            packet_limit=args.packet_limit,
        )
        print(f"pcapng written: {output}")
        return 0

    if args.command == "web-audit":
        output = write_web_audit_bundle(args.url, config, wait_seconds=args.wait_seconds)
        print(f"web audit ZIP written: {output}")
        return 0

    if args.command == "manual-web-audit":
        output = write_manual_web_audit_bundle(
            args.url,
            config,
            output_name=args.output_name,
            stop_file=Path(args.stop_file) if args.stop_file else None,
        )
        print(f"manual web audit ZIP written: {output}")
        return 0

    raise AssertionError(f"Unhandled command: {args.command}")


if __name__ == "__main__":
    raise SystemExit(main())
