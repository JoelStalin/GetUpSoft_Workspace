from __future__ import annotations

import re
from collections import Counter
from dataclasses import asdict, dataclass
from pathlib import Path


LOG_PATTERN = re.compile(
    r'(?P<ip>\S+) \S+ \S+ \[(?P<time>[^\]]+)\] "(?P<method>\S+) '
    r'(?P<path>\S+) (?P<protocol>[^"]+)" (?P<status>\d{3}) (?P<size>\S+) '
    r'"(?P<referrer>[^"]*)" "(?P<agent>[^"]*)"'
)


@dataclass(frozen=True)
class LogSummary:
    total_lines: int
    parsed_lines: int
    status_counts: dict[str, int]
    top_paths: dict[str, int]
    top_clients: dict[str, int]
    top_agents: dict[str, int]

    def to_dict(self) -> dict[str, object]:
        return asdict(self)


def summarize_access_log(path: Path, limit: int = 20) -> LogSummary:
    total = 0
    parsed = 0
    statuses: Counter[str] = Counter()
    paths: Counter[str] = Counter()
    clients: Counter[str] = Counter()
    agents: Counter[str] = Counter()

    with path.open("r", encoding="utf-8", errors="replace") as handle:
        for line in handle:
            total += 1
            match = LOG_PATTERN.search(line)
            if not match:
                continue
            parsed += 1
            data = match.groupdict()
            statuses[data["status"]] += 1
            paths[data["path"]] += 1
            clients[data["ip"]] += 1
            agents[data["agent"]] += 1

    return LogSummary(
        total_lines=total,
        parsed_lines=parsed,
        status_counts=dict(statuses.most_common()),
        top_paths=dict(paths.most_common(limit)),
        top_clients=dict(clients.most_common(limit)),
        top_agents=dict(agents.most_common(limit)),
    )
