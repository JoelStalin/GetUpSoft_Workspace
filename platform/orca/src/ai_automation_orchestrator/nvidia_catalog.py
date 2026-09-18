from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime, timezone
import json
import math
import re
import time
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from ai_automation_orchestrator.config import default_config_path, repository_root


NVIDIA_MODELS_URL = "https://build.nvidia.com/models"
NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1"

EXCLUDED_TERMS = {
    "active speaker detection": "specialized video detection endpoint",
    "asr": "speech recognition endpoint is not chat-compatible",
    "broadcast": "specialized media endpoint",
    "content-safety": "safety moderation endpoint, not a general chat model",
    "content safety": "safety moderation endpoint, not a general chat model",
    "detector": "detection endpoint is not chat-compatible",
    "embed": "embedding endpoint is not chat-compatible",
    "embedding": "embedding endpoint is not chat-compatible",
    "guard": "guardrail or moderation endpoint is not a general chat model",
    "hdri": "specialized graphics endpoint",
    "image editing": "image editing endpoint is not chat-compatible",
    "lip sync": "specialized media endpoint",
    "lipsync": "specialized media endpoint",
    "llm safety": "safety endpoint, not a general chat model",
    "localization": "specialized detection endpoint",
    "ocr": "ocr endpoint is not chat-compatible",
    "rerank": "reranker endpoint is not chat-compatible",
    "safety-guard": "safety moderation endpoint, not a general chat model",
    "speech recognition": "speech endpoint is not chat-compatible",
    "studiovoice": "voice endpoint needs a different integration shape",
    "synthetic data generation": "specialized media endpoint",
    "table extraction": "ocr extraction endpoint is not chat-compatible",
    "text-to-embedding": "embedding endpoint is not chat-compatible",
    "text-to-image": "image generation endpoint is not chat-compatible",
    "translate": "translation endpoint is not chat-compatible",
    "tts": "text-to-speech endpoint is not chat-compatible",
    "video-to-audio": "specialized media endpoint",
    "video-to-video": "specialized media endpoint",
    "voicechat": "voice endpoint needs a different integration shape",
}

INCLUDED_TERMS = (
    "agentic",
    "assistant",
    "chat",
    "coding",
    "flash",
    "gemma",
    "image-to-text",
    "instruct",
    "llama",
    "magistral",
    "minimax",
    "mistral",
    "multimodal",
    "omni",
    "paligemma",
    "phi",
    "reasoning",
    "step-",
    "text generation",
    "text-to-text",
    "vision-language",
)


@dataclass(slots=True)
class NvidiaModelSnapshot:
    publisher: str
    name: str
    href: str
    slug_path: str
    badges: list[str]
    summary: str
    tags: list[str]
    popularity: str | None = None
    recency: str | None = None


@dataclass(slots=True)
class CompatibilityDecision:
    compatible: bool
    reason: str


def slugify_model_id(value: str) -> str:
    normalized = value.replace("/", "-").replace(".", "-").replace("_", "-").lower()
    normalized = re.sub(r"[^a-z0-9-]+", "-", normalized)
    normalized = re.sub(r"-{2,}", "-", normalized).strip("-")
    return normalized


def parse_model_cards(raw_cards: list[dict[str, str]]) -> list[NvidiaModelSnapshot]:
    items: list[NvidiaModelSnapshot] = []
    seen_paths: set[str] = set()

    for card in raw_cards:
        href = card.get("href", "").strip()
        if not href:
            continue

        path = urlparse(href).path.strip("/")
        if not path or path in seen_paths:
            continue

        lines = [line.strip() for line in card.get("text", "").splitlines() if line.strip()]
        name = card.get("name", "").strip()
        if not name or name not in lines:
            continue

        name_index = lines.index(name)
        if name_index == 0:
            continue

        publisher = lines[0]
        badges = lines[1:name_index]
        summary = lines[name_index + 1] if len(lines) > name_index + 1 else ""
        tail = lines[name_index + 2 :]

        popularity: str | None = None
        recency: str | None = None
        if tail and re.fullmatch(r"\d+(?:\.\d+)?[KMB]?", tail[-1]):
            popularity = tail[-1]
            tail = tail[:-1]
        if tail and re.fullmatch(r"\d+(?:mo|w|d|h)", tail[-1]):
            recency = tail[-1]
            tail = tail[:-1]
        elif len(tail) >= 2 and re.fullmatch(r"\d+(?:\.\d+)?[KMB]?", tail[-2]) and re.fullmatch(r"\d+(?:mo|w|d|h)", tail[-1]):
            popularity = tail[-2]
            recency = tail[-1]
            tail = tail[:-2]

        tags = [line for line in tail if not line.startswith("+")]
        items.append(
            NvidiaModelSnapshot(
                publisher=publisher,
                name=name,
                href=href,
                slug_path=path,
                badges=badges,
                summary=summary,
                tags=tags,
                popularity=popularity,
                recency=recency,
            )
        )
        seen_paths.add(path)

    return items


def decide_compatibility(item: NvidiaModelSnapshot) -> CompatibilityDecision:
    searchable = " ".join(
        [
            item.publisher,
            item.name,
            item.slug_path,
            item.summary,
            *item.badges,
            *item.tags,
        ]
    ).lower()

    for term, reason in EXCLUDED_TERMS.items():
        if term in searchable:
            return CompatibilityDecision(False, reason)

    if any(term in searchable for term in INCLUDED_TERMS):
        return CompatibilityDecision(True, "compatible with Orca chat/completions flow")

    return CompatibilityDecision(False, "not confidently classifiable as chat or multimodal conversation")


def default_params_for(item: NvidiaModelSnapshot) -> dict[str, Any]:
    slug = item.slug_path.lower()
    if slug == "deepseek-ai/deepseek-v4-pro":
        return {"temperature": 0.2, "top_p": 0.95, "max_tokens": 4096}
    if slug == "moonshotai/kimi-k2.6":
        return {"temperature": 1.0, "top_p": 1.0, "max_tokens": 16384}
    if slug == "google/gemma-4-31b-it":
        return {"temperature": 1.0, "top_p": 0.95, "max_tokens": 16384}
    return {"temperature": 0.7, "top_p": 0.95, "max_tokens": 8192}


def extra_body_for(item: NvidiaModelSnapshot) -> dict[str, Any]:
    slug = item.slug_path.lower()
    if slug == "deepseek-ai/deepseek-v4-pro":
        return {"chat_template_kwargs": {"thinking": False}}
    if slug == "moonshotai/kimi-k2.6":
        return {"chat_template_kwargs": {"thinking": True}}
    if slug == "google/gemma-4-31b-it":
        return {"chat_template_kwargs": {"enable_thinking": True}}
    return {}


def build_generated_catalog(
    items: list[NvidiaModelSnapshot],
    *,
    preferred_default: str = "deepseek-v4-pro",
) -> dict[str, Any]:
    included: list[dict[str, Any]] = []
    excluded: list[dict[str, Any]] = []

    for item in items:
        decision = decide_compatibility(item)
        record = {
            "publisher": item.publisher,
            "name": item.name,
            "slug_path": item.slug_path,
            "href": item.href,
            "summary": item.summary,
            "badges": item.badges,
            "tags": item.tags,
            "reason": decision.reason,
        }
        if not decision.compatible:
            excluded.append(record)
            continue

        model_id = slugify_model_id(item.slug_path.split("/", 1)[-1])
        included.append(
            {
                "id": model_id,
                "provider": "nvidia-openai-compatible",
                "model": item.slug_path,
                "base_url": NVIDIA_BASE_URL,
                "api_key_env": "NVIDIA_API_KEY",
                "default_params": default_params_for(item),
                "extra_body": extra_body_for(item),
                "metadata": {
                    "publisher": item.publisher,
                    "display_name": item.name,
                    "summary": item.summary,
                    "tags": item.tags,
                    "href": item.href,
                    "compatibility_reason": decision.reason,
                },
            }
        )

    default_model = preferred_default if any(model["id"] == preferred_default for model in included) else (included[0]["id"] if included else "")
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": NVIDIA_MODELS_URL,
        "default_model": default_model,
        "models": included,
        "excluded_models": excluded,
    }


def _card_payload_script() -> str:
    return """
return Array.from(document.querySelectorAll('h3 a[href]'))
  .map((anchor) => {
    const path = new URL(anchor.href).pathname;
    const segments = path.split('/').filter(Boolean);
    if (segments.length !== 2) {
      return null;
    }
    const card = anchor.closest("article, li, [class*='card'], div");
    return {
      href: anchor.href,
      name: anchor.textContent.trim(),
      text: (card?.innerText || anchor.innerText || '').trim()
    };
  })
  .filter(Boolean);
"""


def scrape_nvidia_build_free_models(*, headless: bool = True) -> dict[str, Any]:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.support.ui import WebDriverWait
    from webdriver_manager.chrome import ChromeDriverManager

    options = Options()
    if headless:
        options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1440,2200")
    options.binary_location = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    try:
        driver.get(NVIDIA_MODELS_URL)
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.XPATH, "//*[normalize-space()='Free Endpoint']")))

        driver.execute_script(
            "arguments[0].click();",
            driver.find_element(By.XPATH, "//*[normalize-space()='Free Endpoint']"),
        )
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.XPATH, "//button[normalize-space()='Apply']")))
        driver.execute_script(
            "arguments[0].click();",
            driver.find_element(By.XPATH, "//button[normalize-space()='Apply']"),
        )

        WebDriverWait(driver, 20).until(EC.text_to_be_present_in_element((By.TAG_NAME, "body"), "42 models"))
        body_lines = driver.find_element(By.TAG_NAME, "body").text.splitlines()
        total_line = next((line for line in body_lines if line.endswith("models") and line.split()[0].isdigit()), "0 models")
        total_models = int(total_line.split()[0])
        items_per_page = 24
        page_count = max(1, math.ceil(total_models / items_per_page))

        if total_models > items_per_page:
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(1)
            page_size_opened = driver.execute_script(
                """
const trigger = document.querySelector("[data-testid='nv-pagination-page-size-select']");
if (!trigger) {
  return false;
}
trigger.click();
return true;
"""
            )
            if page_size_opened:
                time.sleep(1)
                option_clicked = driver.execute_script(
                    """
const target = Array.from(document.querySelectorAll("*"))
  .find((element) => (element.textContent || '').trim() === arguments[0]);
if (!target) {
  return false;
}
target.click();
return true;
""",
                    "48" if total_models <= 48 else "96",
                )
                if option_clicked:
                    time.sleep(3)
                    items_per_page = max(items_per_page, total_models)
                    page_count = 1

        all_cards: list[dict[str, str]] = []
        for page in range(1, page_count + 1):
            if page > 1:
                button_found = driver.execute_script(
                    """
const target = Array.from(document.querySelectorAll("button, [role='tab'], [role='button']"))
  .find((element) => {
    const text = ((element.textContent || '').replace(/\\s+/g, '')).trim();
    return text === arguments[0] || text === arguments[0] + arguments[0];
  });
if (!target) {
  return false;
}
target.click();
return true;
""",
                    str(page),
                )
                if not button_found:
                    break
                time.sleep(3)

            WebDriverWait(driver, 20).until(EC.presence_of_all_elements_located((By.TAG_NAME, "h3")))
            all_cards.extend(driver.execute_script(_card_payload_script()))

        parsed_items = parse_model_cards(all_cards)
        return {
            "captured_at": datetime.now(timezone.utc).isoformat(),
            "source": NVIDIA_MODELS_URL,
            "total_free_models": total_models,
            "page_count": page_count,
            "items": [asdict(item) for item in parsed_items],
        }
    finally:
        driver.quit()


def write_nvidia_snapshot_and_catalog(
    *,
    snapshot_output: str | Path | None = None,
    catalog_output: str | Path | None = None,
    headless: bool = True,
) -> tuple[Path, Path]:
    root = repository_root()
    snapshot_path = Path(snapshot_output) if snapshot_output else root / "config" / "nvidia_build_free_models.json"
    catalog_path = Path(catalog_output) if catalog_output else root / "config" / "models.nvidia-free.generated.json"

    snapshot = scrape_nvidia_build_free_models(headless=headless)
    items = [NvidiaModelSnapshot(**item) for item in snapshot["items"]]
    current_default = json.loads(default_config_path().read_text(encoding="utf-8")).get("default_model", "deepseek-v4-pro")
    catalog = build_generated_catalog(items, preferred_default=current_default)

    snapshot_path.parent.mkdir(parents=True, exist_ok=True)
    catalog_path.parent.mkdir(parents=True, exist_ok=True)
    snapshot_path.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2), encoding="utf-8")
    catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2), encoding="utf-8")
    return snapshot_path, catalog_path
