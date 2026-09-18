from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, Dict

@dataclass
class ExtractionResult:
    visible_name: str
    username: Optional[str] = None
    url: str = ""
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    confidence: float = 0.0
    selector_used: str = ""

@dataclass
class StepStatus:
    name: str
    status: str  # PASS, FAIL, SKIPPED
    message: str = ""
    screenshot_path: Optional[str] = None
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())

@dataclass
class FinalReport:
    platform: str
    url: str
    extraction: ExtractionResult
    steps: list[StepStatus]
    summary: str = ""
