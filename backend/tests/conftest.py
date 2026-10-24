"""Test setup: isolated SQLite database and production-like environment.

Environment variables must be set before the app is imported.
"""

import os
import tempfile
from datetime import datetime, timezone

_db_dir = tempfile.mkdtemp(prefix="balanceflow-tests-")
os.environ["DATABASE_URL"] = f"sqlite:///{_db_dir}/test.db"
os.environ["APP_ENV"] = "production"
os.environ["CORS_ORIGINS"] = "https://balanceflow.example.app"
os.environ.pop("GEMINI_API_KEY", None)
os.environ.pop("ENABLE_SHARED_DATA_API", None)
os.environ.pop("ENABLE_DESTRUCTIVE_ENDPOINTS", None)

import pytest
from fastapi.testclient import TestClient

from app.core import config
from app.database import Base, SessionLocal, engine
from app.main import app
from app.models import WellnessEntry
from app.routers import demo

SEED_TITLE = "SECRET-SEEDED-SHARED-RECORD"
SEED_REFLECTION = "SECRET-SHARED-REFLECTION-TEXT"


@pytest.fixture(autouse=True)
def seeded_db(monkeypatch):
    """Fresh DB with two shared records that must never be exposed or removed."""
    monkeypatch.setattr(config, "GEMINI_API_KEY", None)
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        for _ in range(2):
            db.add(WellnessEntry(
                practice_type="Yoga", practice_title=SEED_TITLE, duration_minutes=20,
                intensity="Gentle", mood_before="Tired", mood_after="Calm",
                energy_before=4, energy_after=7, stress_before=7, stress_after=3,
                sleep_quality=6, reflection=SEED_REFLECTION,
                created_at=datetime.now(timezone.utc),
            ))
        db.commit()
    demo.rate_limiter.reset()
    demo.gemini_budget.reset()
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def client():
    return TestClient(app)


def seeded_count() -> int:
    with SessionLocal() as db:
        return db.query(WellnessEntry).count()


def demo_payload(**overrides):
    entry = {
        "practice_type": "Yoga", "practice_title": "Morning Flow", "duration_minutes": 15,
        "intensity": "Gentle", "mood_before": "Tired", "mood_after": "Calm",
        "energy_before": 5, "energy_after": 7, "stress_before": 6, "stress_after": 4,
        "sleep_quality": 7, "reflection": "PRIVATE-NOTE-IN-ENTRY",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    payload = {"entries": [entry], "reflections": ["PRIVATE-STANDALONE-NOTE"], "include_reflections": False}
    payload.update(overrides)
    return payload
