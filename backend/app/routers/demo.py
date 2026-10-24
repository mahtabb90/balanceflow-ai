"""Stateless demo endpoints.

These routes never touch the shared database: they only analyse data the visitor
sends in the request and return the result without storing anything. They exist so
the browser-local demo can still use Gemini (with the rule-based fallback).
"""

import logging
from datetime import datetime, timezone
from types import SimpleNamespace
from typing import List

from fastapi import APIRouter, HTTPException, Request, status
from fastapi.concurrency import run_in_threadpool
from pydantic import ValidationError

from app.core import config
from app.schemas import AIInsightsResponse, DemoInsightsRequest
from app.services import ai_service
from app.services.rate_limit import DailyBudget, SlidingWindowLimiter

logger = logging.getLogger("balanceflow.demo")

router = APIRouter()

rate_limiter = SlidingWindowLimiter(limit=config.DEMO_RATE_LIMIT_PER_MINUTE, window_seconds=60)
gemini_budget = DailyBudget(limit=config.GEMINI_DAILY_REQUEST_LIMIT)


EMPTY_INSIGHTS = {
    "source": "fallback",
    "pattern_summary": "Your insights will grow with your practice.",
    "gentle_recommendation": "Log a few yoga, meditation or breathing sessions to discover patterns in your wellness routine.",
    "stress_trend_insight": "Stress trends will appear after you log practice sessions.",
    "sleep_energy_connection": "Sleep and energy patterns will appear as you continue tracking.",
    "reflection_summary": "Add short reflections to discover recurring themes.",
    "next_week_focus": "Try one short mindful session to begin building your BalanceFlow pattern.",
    "disclaimer": "These insights are for personal awareness and are not medical advice.",
}


def _client_key(request: Request) -> str:
    """Rate-limit key from the socket peer only.

    X-Forwarded-For and similar headers are client-controlled, so they are ignored.
    Behind a proxy, configure the server to rewrite the peer address from a trusted
    proxy; the global daily Gemini budget is the real cost safeguard either way.
    """
    return request.client.host if request.client else "unknown"


async def _read_limited_body(request: Request) -> bytes:
    """Read the request body, refusing anything above the configured size."""
    limit = config.DEMO_MAX_BODY_BYTES
    declared = request.headers.get("content-length")
    if declared and declared.isdigit() and int(declared) > limit:
        raise HTTPException(413, "Request body too large.")
    chunks: List[bytes] = []
    size = 0
    async for chunk in request.stream():
        size += len(chunk)
        if size > limit:
            raise HTTPException(413, "Request body too large.")
        chunks.append(chunk)
    return b"".join(chunks)


def _to_records(payload: DemoInsightsRequest) -> list:
    """Adapt validated entries to the attribute shape the stats/AI services expect (newest first)."""
    records = []
    for e in payload.entries:
        created = e.created_at if e.created_at.tzinfo else e.created_at.replace(tzinfo=timezone.utc)
        data = e.model_dump()
        data["created_at"] = created
        if not payload.include_reflections:
            data["reflection"] = None
        records.append(SimpleNamespace(**data))
    records.sort(key=lambda r: r.created_at, reverse=True)
    return records


@router.post("/insights", response_model=AIInsightsResponse)
async def demo_insights(request: Request):
    """Generate insights from visitor-supplied data without reading or writing the database."""
    if not rate_limiter.allow(_client_key(request)):
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            "Too many requests. Please try again in a minute.",
            headers={"Retry-After": "60"},
        )

    body = await _read_limited_body(request)
    try:
        payload = DemoInsightsRequest.model_validate_json(body)
    except ValidationError as exc:
        # Report field locations only; input values (possibly personal text) are not echoed.
        errors = [{"loc": list(err["loc"]), "msg": err["msg"]} for err in exc.errors()]
        raise HTTPException(422, errors)

    if not payload.entries:
        return EMPTY_INSIGHTS

    records = _to_records(payload)
    extra = payload.reflections if payload.include_reflections else None
    use_gemini = bool(config.GEMINI_API_KEY) and gemini_budget.try_consume()
    if config.GEMINI_API_KEY and not use_gemini:
        logger.warning("Daily Gemini budget exhausted; serving rule-based insights.")

    return await run_in_threadpool(
        ai_service.generate_ai_insights,
        records,
        include_reflections=payload.include_reflections,
        extra_reflections=extra,
        use_gemini=use_gemini,
    )
