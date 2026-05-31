from pathlib import Path

import pytest

from traffic_control.config import TrafficControlConfig, load_config, normalize_target
from traffic_control.logs import summarize_access_log
from traffic_control.scope import ScopeError, assert_allowed
from traffic_control.web_audit import (
    build_summary,
    domain_from_url,
    is_allowed_client_domain,
    sanitize_url,
    WebRequestRecord,
)


def test_normalize_target_strips_scheme_path_and_port() -> None:
    assert normalize_target("https://Example.com:443/path") == "example.com"


def test_assert_allowed_accepts_configured_ip() -> None:
    config = TrafficControlConfig(allowed_targets=("192.0.2.10",))
    assert assert_allowed("192.0.2.10", config) == "192.0.2.10"


def test_assert_allowed_rejects_out_of_scope_ip() -> None:
    config = TrafficControlConfig(allowed_targets=("192.0.2.10",))
    with pytest.raises(ScopeError):
        assert_allowed("198.51.100.20", config)


def test_load_config_requires_allowed_targets(tmp_path: Path) -> None:
    config_path = tmp_path / "traffic-control.yml"
    config_path.write_text("defaults: {}\n", encoding="utf-8")
    config = load_config(config_path)
    assert config.allowed_targets == ()


def test_summarize_access_log(tmp_path: Path) -> None:
    log_path = tmp_path / "access.log"
    log_path.write_text(
        '203.0.113.4 - - [22/May/2026:12:00:00 +0000] "GET / HTTP/1.1" '
        '200 123 "-" "curl/8"\n'
        '203.0.113.4 - - [22/May/2026:12:00:01 +0000] "POST /login HTTP/1.1" '
        '403 12 "-" "curl/8"\n',
        encoding="utf-8",
    )
    summary = summarize_access_log(log_path)
    assert summary.total_lines == 2
    assert summary.parsed_lines == 2
    assert summary.status_counts == {"200": 1, "403": 1}
    assert summary.top_clients == {"203.0.113.4": 2}


def test_domain_from_url_normalizes_host() -> None:
    assert domain_from_url("https://WWW.Example.com/path?q=1") == "www.example.com"


def test_sanitize_url_redacts_query_string() -> None:
    assert sanitize_url("https://example.com/callback?token=secret") == (
        "https://example.com/callback?<redacted>"
    )


def test_allowed_client_domain_accepts_first_party_and_configured_external() -> None:
    config = TrafficControlConfig(
        allowed_targets=("example.com",),
        allowed_client_domains=("cdn.example.net",),
    )
    assert is_allowed_client_domain("assets.example.com", "example.com", config)
    assert is_allowed_client_domain("cdn.example.net", "example.com", config)
    assert not is_allowed_client_domain("unknown.example.org", "example.com", config)


def test_build_summary_flags_unexpected_domains() -> None:
    records = [
        WebRequestRecord(
            url="https://example.com/app.js",
            method="GET",
            resource_type="script",
            domain="example.com",
            status=200,
            content_type="application/javascript",
            size=10,
            is_first_party=True,
            is_allowed=True,
            is_suspicious=False,
        ),
        WebRequestRecord(
            url="https://tracker.example.org/pixel",
            method="GET",
            resource_type="image",
            domain="tracker.example.org",
            status=200,
            content_type="image/gif",
            size=1,
            is_first_party=False,
            is_allowed=False,
            is_suspicious=True,
        ),
    ]
    summary = build_summary(records, "https://example.com", [])
    assert summary["unexpected_domains"] == ["tracker.example.org"]
    assert summary["suspicious_request_count"] == 1
