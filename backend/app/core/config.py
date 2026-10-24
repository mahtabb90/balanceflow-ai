"""Core configuration module for loading environment variables."""

import logging
import os
from typing import List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger("balanceflow.config")

# Runtime environment. Anything other than "development" is treated as production,
# so a missing variable fails closed.
APP_ENV = os.getenv("APP_ENV", "production").strip().lower()

# Gemini configurations
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


def _env_bool(name: str) -> bool:
    return os.getenv(name, "").strip().lower() in {"1", "true", "yes", "on"}


def _env_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, default))
    except (TypeError, ValueError):
        return default


# Legacy shared-data routes. These flags are NOT authentication: access additionally
# requires an authenticated principal (see app.core.access) and a non-production
# environment. They stay closed until real authentication and ownership checks exist.
ENABLE_SHARED_DATA_API = _env_bool("ENABLE_SHARED_DATA_API")
ENABLE_DESTRUCTIVE_ENDPOINTS = _env_bool("ENABLE_DESTRUCTIVE_ENDPOINTS")

# Gemini / stateless demo endpoint protection
GEMINI_TIMEOUT_SECONDS = _env_int("GEMINI_TIMEOUT_SECONDS", 15)
GEMINI_DAILY_REQUEST_LIMIT = _env_int("GEMINI_DAILY_REQUEST_LIMIT", 100)
DEMO_RATE_LIMIT_PER_MINUTE = _env_int("DEMO_RATE_LIMIT_PER_MINUTE", 5)
DEMO_MAX_BODY_BYTES = _env_int("DEMO_MAX_BODY_BYTES", 64 * 1024)

DEV_CORS_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]


def is_production() -> bool:
    return APP_ENV != "development"


def parse_cors_origins(raw: str | None, app_env: str = APP_ENV) -> List[str]:
    """Build the explicit CORS allowlist. Wildcards are never accepted.

    Development origins are only added when APP_ENV=development; in production
    only the origins listed in CORS_ORIGINS are allowed.
    """
    origins: List[str] = []
    for origin in (raw or "").split(","):
        origin = origin.strip().rstrip("/")
        if not origin:
            continue
        if "*" in origin:
            logger.warning("Ignoring wildcard CORS origin; use explicit origins.")
            continue
        origins.append(origin)
    if app_env == "development":
        for dev_origin in DEV_CORS_ORIGINS:
            if dev_origin not in origins:
                origins.append(dev_origin)
    return origins
