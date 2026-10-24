"""Regression tests: anonymous visitors must never reach shared database records."""

import pytest

from app.core import config
from app.core.access import get_authenticated_principal
from app.main import app
from tests.conftest import SEED_REFLECTION, SEED_TITLE, seeded_count

ENTRY_BODY = {
    "practice_type": "Yoga", "practice_title": "x", "duration_minutes": 5, "intensity": "Gentle",
    "mood_before": "Calm", "mood_after": "Calm", "energy_before": 5, "energy_after": 5,
    "stress_before": 5, "stress_after": 5, "sleep_quality": 5,
}

LEGACY_ROUTES = [
    ("GET", "/api/entries", None),
    ("GET", "/api/entries/1", None),
    ("POST", "/api/entries", ENTRY_BODY),
    ("DELETE", "/api/entries/1", None),
    ("DELETE", "/api/entries", None),
    ("GET", "/api/stats/dashboard", None),
    ("GET", "/api/reports/weekly", None),
    ("GET", "/api/ai/insights", None),
]


@pytest.mark.parametrize("method,path,body", LEGACY_ROUTES)
def test_anonymous_requests_are_denied_and_leak_nothing(client, method, path, body):
    response = client.request(method, path, json=body)
    assert response.status_code == 403
    assert SEED_TITLE not in response.text and SEED_REFLECTION not in response.text
    assert seeded_count() == 2


@pytest.mark.parametrize("method,path,body", LEGACY_ROUTES)
def test_feature_flags_alone_do_not_open_routes(client, monkeypatch, method, path, body):
    monkeypatch.setattr(config, "ENABLE_SHARED_DATA_API", True)
    monkeypatch.setattr(config, "ENABLE_DESTRUCTIVE_ENDPOINTS", True)
    monkeypatch.setattr(config, "APP_ENV", "development")  # even outside production, no principal -> denied
    assert client.request(method, path, json=body).status_code == 403
    assert seeded_count() == 2


@pytest.mark.parametrize("method,path,body", LEGACY_ROUTES)
def test_production_denies_even_with_flags_and_principal(client, monkeypatch, method, path, body):
    monkeypatch.setattr(config, "ENABLE_SHARED_DATA_API", True)
    monkeypatch.setattr(config, "ENABLE_DESTRUCTIVE_ENDPOINTS", True)
    app.dependency_overrides[get_authenticated_principal] = lambda: "user-1"
    assert config.is_production()
    assert client.request(method, path, json=body).status_code == 403
    assert seeded_count() == 2


def test_delete_all_needs_its_own_flag_outside_production(client, monkeypatch):
    monkeypatch.setattr(config, "APP_ENV", "development")
    monkeypatch.setattr(config, "ENABLE_SHARED_DATA_API", True)
    app.dependency_overrides[get_authenticated_principal] = lambda: "user-1"
    assert client.get("/api/entries").status_code == 200  # gate logic works once fully satisfied
    assert client.delete("/api/entries").status_code == 403
    assert seeded_count() == 2


def test_api_docs_are_hidden_in_production(client):
    for path in ("/docs", "/redoc", "/openapi.json"):
        assert client.get(path).status_code == 404


def test_public_health_endpoint_still_works(client):
    assert client.get("/health").json()["status"] == "ok"


def test_every_non_demo_api_route_is_closed_to_anonymous_visitors(client):
    """Safety net: a route added later without access control fails here."""
    import re

    checked = 0
    for path, methods in app.openapi()["paths"].items():
        if not path.startswith("/api/") or path.startswith("/api/demo/"):
            continue
        url = re.sub(r"{[^}]+}", "1", path)
        for method in methods:
            response = client.request(method.upper(), url, json={})
            assert response.status_code == 403, f"{method.upper()} {path} is not gated"
            checked += 1
    assert checked >= 8
    assert seeded_count() == 2
