from __future__ import annotations

import csv
from dataclasses import dataclass
from pathlib import Path

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

from orca.config import OrcaSettings, get_settings

IntentLabel = str


@dataclass(frozen=True)
class IntentPrediction:
    label: IntentLabel
    confidence: float
    used_fallback: bool


class IntentClassifier:
    labels = (
        "feature",
        "bugfix",
        "refactor",
        "research",
        "documentation",
        "test",
        "deployment",
        "scrum-management",
    )

    def __init__(self, settings: OrcaSettings | None = None) -> None:
        self.settings = settings or get_settings()
        self._pipeline: Pipeline | None = None

    def predict(self, text: str, rule_hint: str | None = None) -> IntentPrediction:
        pipeline = self._load_or_train_pipeline()
        probabilities = pipeline.predict_proba([text])[0]
        classes = list(pipeline.classes_)
        best_index = max(range(len(probabilities)), key=probabilities.__getitem__)
        label = str(classes[best_index])
        confidence = float(probabilities[best_index])

        if (
            rule_hint in {"feature", "bugfix", "refactor", "test", "deployment"}
            and label == "scrum-management"
        ):
            return IntentPrediction(
                label=rule_hint,
                confidence=max(confidence, self.settings.low_confidence_threshold),
                used_fallback=True,
            )

        if confidence < self.settings.low_confidence_threshold and rule_hint:
            return IntentPrediction(label=rule_hint, confidence=confidence, used_fallback=True)

        return IntentPrediction(label=label, confidence=confidence, used_fallback=False)

    def _load_or_train_pipeline(self) -> Pipeline:
        if self._pipeline is not None:
            return self._pipeline
        if self.settings.intent_model_path.exists():
            self._pipeline = joblib.load(self.settings.intent_model_path)
            return self._pipeline

        samples, labels = self._load_training_rows(self.settings.sample_training_data_path)
        pipeline = Pipeline(
            [
                ("vectorizer", TfidfVectorizer(ngram_range=(1, 2), lowercase=True)),
                ("classifier", LogisticRegression(max_iter=1_000)),
            ]
        )
        pipeline.fit(samples, labels)
        self._pipeline = pipeline
        return pipeline

    @staticmethod
    def _load_training_rows(path: Path) -> tuple[list[str], list[str]]:
        samples: list[str] = []
        labels: list[str] = []
        with path.open("r", encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle)
            for row in reader:
                samples.append(row["text"])
                labels.append(row["intent"])
        return samples, labels
