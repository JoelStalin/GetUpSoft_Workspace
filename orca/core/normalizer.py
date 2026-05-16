from __future__ import annotations

import re
from collections import OrderedDict


class PromptNormalizer:
    """Normalize noisy prompts without using any remote model."""

    _sentence_splitter = re.compile(r"(?<=[.!?])\s+|\n+")
    _whitespace = re.compile(r"\s+")
    _repeated_punctuation = re.compile(r"([!?.,]){2,}")

    def normalize(self, raw_text: str) -> str:
        text = raw_text.strip()
        text = self._repeated_punctuation.sub(r"\1", text)
        text = self._whitespace.sub(" ", text)
        sentences = [
            segment.strip(" -")
            for segment in self._sentence_splitter.split(text)
            if segment
        ]
        deduped = list(OrderedDict.fromkeys(sentence for sentence in sentences if sentence))
        normalized = ". ".join(deduped).strip()
        if normalized and normalized[-1] not in ".!?":
            normalized = f"{normalized}."
        return normalized
