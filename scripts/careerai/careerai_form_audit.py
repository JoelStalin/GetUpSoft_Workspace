"""Audit an external application form without submitting it.

Uses Scrapling for page discovery and emits a model-review packet for Gemini,
ChatGPT, and Claude. It never logs cookies, tokens, CV contents, or passwords.
"""
import argparse
import json
import os
from datetime import datetime, timezone
from pathlib import Path

from scrapling.fetchers import DynamicFetcher, Fetcher, StealthyFetcher


def text(selector):
    return " ".join((selector.get() or "").split()) if selector else ""


def audit(url: str, stealth: bool = False):
    if stealth:
        page = StealthyFetcher.fetch(url, headless=True, block_webrtc=True, hide_canvas=True)
    elif os.getenv("CAREERAI_DYNAMIC", "1") == "1":
        page = DynamicFetcher.fetch(url, headless=True, network_idle=True)
    else:
        page = Fetcher.get(url, impersonate="chrome")

    forms = []
    for form in page.css("form"):
        fields = []
        for control in form.css("input, textarea, select, button"):
            tag = control.attrib.get("name") or control.attrib.get("id") or "unnamed"
            fields.append({
                "tag": control.tag,
                "name": tag,
                "type": control.attrib.get("type", "text"),
                "required": "required" in control.attrib,
                "autocomplete": control.attrib.get("autocomplete"),
                "label": control.attrib.get("aria-label") or control.attrib.get("placeholder"),
                "options": control.css("option::text").getall()[:50] if control.tag == "select" else [],
            })
        forms.append({
            "action_origin": url,
            "method": (form.attrib.get("method") or "get").lower(),
            "field_count": len(fields),
            "fields": fields,
        })

    return {
        "schema_version": "careerai.form-audit.v1",
        "audited_at": datetime.now(timezone.utc).isoformat(),
        "url": url,
        "forms": forms,
        "submission_performed": False,
        "review_required": True,
        "model_review_roles": ["gemini", "chatgpt", "claude"],
        "blocked_actions": ["submit", "captcha", "mfa", "file_upload", "unknown_domain"],
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("url")
    parser.add_argument("--stealth", action="store_true")
    parser.add_argument("--output", default="data/careerai/form-audit.json")
    args = parser.parse_args()
    result = audit(args.url, args.stealth)
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"ok": True, "output": str(output), "forms": len(result["forms"]), "submission_performed": False}))


if __name__ == "__main__":
    main()
