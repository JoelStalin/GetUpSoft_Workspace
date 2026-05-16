from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from .models import ReplySuggestionResult


class UsageLedger:
    def __init__(self, root: str | Path = "data/ai_usage") -> None:
        self.root = Path(root)
        self.root.mkdir(parents=True, exist_ok=True)
        self.log_path = self.root / "usage_log.jsonl"

    def record_reply_suggestion(self, chat_id: str, result: ReplySuggestionResult) -> Path:
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event_type": "reply_suggestion",
            "chat_id": chat_id,
            "model": result.model,
            "provider": result.provider,
            "strategy": result.strategy,
            "prompt_tokens": result.prompt_tokens,
            "completion_tokens": result.completion_tokens,
            "provider_cost_usd": round(result.provider_cost_usd, 6),
            "service_fee_usd": round(result.service_fee_usd, 6),
            "total_price_usd": round(result.total_price_usd, 6),
            "suggestion_count": len(result.suggestions),
        }
        with self.log_path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(entry, ensure_ascii=False) + "\n")
        return self.log_path
