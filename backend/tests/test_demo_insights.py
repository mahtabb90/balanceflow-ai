"""The stateless demo endpoint: independent of the shared DB, validated, rate limited, private."""

import logging

import pytest

from app.core import config
from app.routers import demo
from app.services import ai_service
from tests.conftest import SEED_REFLECTION, SEED_TITLE, demo_payload, seeded_count

URL = "/api/demo/insights"


class FakeGemini:
    prompts = []

    def __init__(self, *args, **kwargs):
        self.models = self

    def generate_content(self, model, contents, config):
        FakeGemini.prompts.append(contents)

        class R:
            text = ('{"pattern_summary":"p","gentle_recommendation":"g","stress_trend_insight":"s",'
                    '"sleep_energy_connection":"e","reflection_summary":"r","next_week_focus":"n","disclaimer":"d"}')
        return R()


@pytest.fixture
def fake_gemini(monkeypatch):
    FakeGemini.prompts = []
    monkeypatch.setattr(config, "GEMINI_API_KEY", "test-key-not-real")
    monkeypatch.setattr(ai_service.genai, "Client", FakeGemini)
    return FakeGemini


def test_works_without_database_or_gemini_key(client):
    r = client.post(URL, json=demo_payload())
    assert r.status_code == 200
    assert r.json()["source"] == "fallback"
    assert SEED_TITLE not in r.text and SEED_REFLECTION not in r.text
    assert seeded_count() == 2


def test_empty_history_returns_friendly_fallback(client):
    r = client.post(URL, json=demo_payload(entries=[], reflections=[]))
    assert r.status_code == 200 and r.json()["source"] == "fallback"


def test_reflection_text_is_not_sent_to_gemini_by_default(client, fake_gemini):
    r = client.post(URL, json=demo_payload())
    assert r.json()["source"] == "gemini"
    prompt = fake_gemini.prompts[0]
    assert "PRIVATE-NOTE-IN-ENTRY" not in prompt and "PRIVATE-STANDALONE-NOTE" not in prompt
    assert SEED_TITLE not in prompt and SEED_REFLECTION not in prompt


def test_reflection_text_is_sent_only_on_explicit_opt_in(client, fake_gemini):
    client.post(URL, json=demo_payload(include_reflections=True))
    prompt = fake_gemini.prompts[0]
    assert "PRIVATE-NOTE-IN-ENTRY" in prompt and "PRIVATE-STANDALONE-NOTE" in prompt


@pytest.mark.parametrize("mutate", [
    lambda p: p["entries"][0].update(duration_minutes=0),
    lambda p: p["entries"][0].update(stress_before=11),
    lambda p: p["entries"][0].update(practice_type="Hacking"),
    lambda p: p["entries"][0].update(reflection="x" * 501),
    lambda p: p["entries"][0].update(unexpected="field"),
    lambda p: p.update(entries=p["entries"] * 101),
    lambda p: p.update(reflections=["x"] * 21),
    lambda p: p.update(reflections=["x" * 501]),
    lambda p: p.update(unexpected=True),
])
def test_invalid_payloads_are_rejected(client, mutate):
    payload = demo_payload()
    mutate(payload)
    r = client.post(URL, json=payload)
    assert r.status_code == 422
    assert "PRIVATE-NOTE" not in r.text  # input values are not echoed back


def test_oversized_body_is_rejected(client, monkeypatch):
    monkeypatch.setattr(config, "DEMO_MAX_BODY_BYTES", 1000)
    r = client.post(URL, content=b'{"entries": []}' + b" " * 2000, headers={"Content-Type": "application/json"})
    assert r.status_code == 413


def test_rate_limit_applies_and_ignores_forwarded_headers(client, monkeypatch):
    monkeypatch.setattr(demo, "rate_limiter", demo.SlidingWindowLimiter(limit=3, window_seconds=60))
    codes = [client.post(URL, json=demo_payload(), headers={"X-Forwarded-For": f"10.0.0.{i}"}).status_code
             for i in range(5)]
    assert codes == [200, 200, 200, 429, 429]


def test_daily_gemini_budget_falls_back_to_rules(client, fake_gemini, monkeypatch):
    monkeypatch.setattr(demo, "gemini_budget", demo.DailyBudget(limit=1))
    sources = [client.post(URL, json=demo_payload()).json()["source"] for _ in range(3)]
    assert sources == ["gemini", "fallback", "fallback"]
    assert len(fake_gemini.prompts) == 1


def test_gemini_failure_uses_fallback_and_does_not_log_error_text(client, monkeypatch, caplog):
    class Boom(FakeGemini):
        def generate_content(self, *a, **k):
            raise RuntimeError("secret-api-key-leak-attempt")
    monkeypatch.setattr(config, "GEMINI_API_KEY", "test-key-not-real")
    monkeypatch.setattr(ai_service.genai, "Client", Boom)
    caplog.set_level(logging.DEBUG)
    r = client.post(URL, json=demo_payload())
    assert r.status_code == 200 and r.json()["source"] == "fallback"
    assert "secret-api-key-leak-attempt" not in caplog.text


def test_logs_never_contain_reflections_or_keys(client, fake_gemini, caplog):
    caplog.set_level(logging.DEBUG)
    client.post(URL, json=demo_payload(include_reflections=True))
    assert "PRIVATE-NOTE" not in caplog.text and "PRIVATE-STANDALONE" not in caplog.text
    assert "test-key-not-real" not in caplog.text


def test_malformed_gemini_output_does_not_break_the_response(client, monkeypatch):
    class Odd(FakeGemini):
        def generate_content(self, model, contents, config):
            class R:
                text = '{"pattern_summary": ["not", "a", "string"], "disclaimer": 5}'
            return R()
    monkeypatch.setattr(config, "GEMINI_API_KEY", "test-key-not-real")
    monkeypatch.setattr(ai_service.genai, "Client", Odd)
    r = client.post(URL, json=demo_payload())
    assert r.status_code == 200
    assert r.json()["pattern_summary"] == "Insight unavailable."
