from __future__ import annotations

import csv
from pathlib import Path

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from orca.config import OrcaSettings, get_settings


def train_intent_model(settings: OrcaSettings | None = None) -> Path:
    active_settings = settings or get_settings()
    samples: list[str] = []
    labels: list[str] = []
    with active_settings.sample_training_data_path.open(
        "r",
        encoding="utf-8",
        newline="",
    ) as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            samples.append(row["text"])
            labels.append(row["intent"])

    x_train, x_test, y_train, y_test = train_test_split(
        samples,
        labels,
        test_size=0.3,
        random_state=42,
        stratify=labels,
    )

    pipeline = Pipeline(
        [
            ("vectorizer", TfidfVectorizer(ngram_range=(1, 2), lowercase=True)),
            ("classifier", LogisticRegression(max_iter=1_000)),
        ]
    )
    pipeline.fit(x_train, y_train)
    predictions = pipeline.predict(x_test)
    accuracy_score(y_test, predictions)
    precision_recall_fscore_support(y_test, predictions, average="weighted", zero_division=0)

    active_settings.intent_model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, active_settings.intent_model_path)
    return active_settings.intent_model_path
