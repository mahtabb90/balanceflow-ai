"""Guards against a deploy-time missing-driver error (e.g. No module named 'psycopg')."""

from pathlib import Path

import pytest
from sqlalchemy import create_engine

from app.database import normalize_database_url

BACKEND_DIR = Path(__file__).resolve().parent.parent

POSTGRES_URLS = [
    "postgres://user:pw@host/db?sslmode=require",
    "postgresql://user:pw@host/db?sslmode=require",
    "postgresql+psycopg://user:pw@host/db?sslmode=require",
    "postgresql+psycopg2://user:pw@host/db?sslmode=require",
]


@pytest.mark.parametrize("url", POSTGRES_URLS)
def test_every_postgres_url_form_maps_to_psycopg2_and_keeps_the_rest(url):
    normalized = normalize_database_url(url)
    assert normalized == "postgresql+psycopg2://user:pw@host/db?sslmode=require"


@pytest.mark.parametrize("url", POSTGRES_URLS)
def test_normalized_url_loads_an_installed_driver(url):
    # create_engine does not connect; import_dbapi() fails if the driver module is missing.
    engine = create_engine(normalize_database_url(url))
    assert engine.dialect.driver == "psycopg2"
    engine.dialect.import_dbapi()


def test_sqlite_urls_are_unchanged():
    assert normalize_database_url("sqlite:///./balanceflow.db") == "sqlite:///./balanceflow.db"


def test_production_requirements_install_the_driver_the_code_uses():
    lines = (BACKEND_DIR / "requirements.txt").read_text().splitlines()
    packages = {line.split("[")[0].split("=")[0].split("<")[0].split(">")[0].strip().lower() for line in lines}
    assert "psycopg2-binary" in packages
