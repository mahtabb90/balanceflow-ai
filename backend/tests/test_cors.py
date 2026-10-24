from app.core.config import parse_cors_origins

ALLOWED = "https://balanceflow.example.app"


def test_allowed_origin_gets_cors_header(client):
    r = client.options("/api/demo/insights", headers={
        "Origin": ALLOWED, "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type"})
    assert r.headers.get("access-control-allow-origin") == ALLOWED
    assert "access-control-allow-credentials" not in r.headers


def test_unknown_origin_is_not_allowed(client):
    r = client.options("/api/demo/insights", headers={
        "Origin": "https://evil.example", "Access-Control-Request-Method": "POST"})
    assert "access-control-allow-origin" not in r.headers


def test_production_does_not_add_dev_origins():
    assert parse_cors_origins("https://a.app", "production") == ["https://a.app"]
    assert parse_cors_origins(None, "production") == []


def test_development_adds_localhost_and_wildcards_are_rejected():
    origins = parse_cors_origins("*, https://a.app/", "development")
    assert "*" not in origins
    assert "https://a.app" in origins and "http://localhost:5173" in origins
