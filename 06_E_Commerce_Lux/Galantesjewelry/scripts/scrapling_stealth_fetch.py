from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass
from typing import Any


INSTALL_HINT = (
    'Scrapling is not installed. Run: pip install "scrapling[fetchers]" '
    "and then: scrapling install"
)


@dataclass
class ScrapeResult:
    url: str
    selector: str
    count: int
    items: list[str]


def load_stealthy_fetcher() -> Any:
    try:
        from scrapling.fetchers import StealthyFetcher
    except ModuleNotFoundError as exc:
        raise RuntimeError(INSTALL_HINT) from exc
    return StealthyFetcher


def fetch_with_scrapling(
    url: str,
    *,
    solve_cloudflare: bool = True,
    headless: bool = True,
    network_idle: bool = True,
) -> Any:
    fetcher = load_stealthy_fetcher()
    return fetcher.fetch(
        url,
        solve_cloudflare=solve_cloudflare,
        headless=headless,
        network_idle=network_idle,
    )


def extract_css(page: Any, selector: str, *, limit: int | None = None) -> list[str]:
    values = page.css(selector).getall()
    normalized = [str(value).strip() for value in values if str(value).strip()]
    if limit is not None and limit >= 0:
        return normalized[:limit]
    return normalized


def scrape_css(
    url: str,
    selector: str,
    *,
    solve_cloudflare: bool = True,
    headless: bool = True,
    network_idle: bool = True,
    limit: int | None = None,
) -> ScrapeResult:
    page = fetch_with_scrapling(
        url,
        solve_cloudflare=solve_cloudflare,
        headless=headless,
        network_idle=network_idle,
    )
    items = extract_css(page, selector, limit=limit)
    return ScrapeResult(url=url, selector=selector, count=len(items), items=items)


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Fetch a page with Scrapling StealthyFetcher and extract CSS selector matches. "
            "Use only for sites you are authorized to scrape."
        )
    )
    parser.add_argument("url", help="Target URL.")
    parser.add_argument(
        "--selector",
        default="a::attr(href)",
        help="CSS selector to extract. Defaults to links.",
    )
    parser.add_argument("--limit", type=int, default=100, help="Maximum items to return.")
    parser.add_argument(
        "--no-cloudflare",
        action="store_true",
        help="Disable solve_cloudflare for sites that do not need it.",
    )
    parser.add_argument("--headed", action="store_true", help="Run browser visibly.")
    parser.add_argument(
        "--no-network-idle",
        action="store_true",
        help="Do not wait for network idle.",
    )
    parser.add_argument(
        "--format",
        choices=("json", "text"),
        default="json",
        help="Output format.",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        result = scrape_css(
            args.url,
            args.selector,
            solve_cloudflare=not args.no_cloudflare,
            headless=not args.headed,
            network_idle=not args.no_network_idle,
            limit=args.limit,
        )
    except RuntimeError as exc:
        print(str(exc), file=sys.stderr)
        return 2

    if args.format == "json":
        print(json.dumps(result.__dict__, ensure_ascii=False, indent=2))
    else:
        for item in result.items:
            print(item)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
