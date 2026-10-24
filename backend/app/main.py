"""Main entrypoint for the BalanceFlow FastAPI backend."""

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from app.core import config
from app.core.access import require_shared_data_access
from app.database import engine, Base
from app import models  # Import models to ensure they are registered with SQLAlchemy Base metadata
from app.routers import entries, stats, reports, ai, demo

# Create database tables if they do not exist (non-destructive)
Base.metadata.create_all(bind=engine)

# Interactive API docs are only exposed outside production.
_docs_enabled = not config.is_production()

app = FastAPI(
    title="BalanceFlow API",
    description="Backend API for the BalanceFlow Mindful Wellness Companion app",
    version="1.0.0",
    docs_url="/docs" if _docs_enabled else None,
    redoc_url="/redoc" if _docs_enabled else None,
    openapi_url="/openapi.json" if _docs_enabled else None,
)

# Routes backed by the shared database stay closed until authentication and
# per-user ownership exist (see app.core.access).
shared_data = [Depends(require_shared_data_access)]
app.include_router(entries.router, prefix="/api/entries", tags=["Entries"], dependencies=shared_data)
app.include_router(stats.router, prefix="/api/stats", tags=["Stats"], dependencies=shared_data)
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"], dependencies=shared_data)
app.include_router(ai.router, prefix="/api/ai", tags=["AI Insights"], dependencies=shared_data)

# Stateless endpoints that never read or write the shared database
app.include_router(demo.router, prefix="/api/demo", tags=["Demo"])

# CORS: explicit origin allowlist only. CORS is a browser policy, not authorization.
# Production origins come from CORS_ORIGINS; localhost origins are added only when APP_ENV=development.
origins = config.parse_cors_origins(os.getenv("CORS_ORIGINS"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

@app.get("/", tags=["Root"])
def read_root():
    """Root endpoint welcoming users to the API."""
    return {"message": "Welcome to BalanceFlow API"}

@app.get("/health", tags=["Health"])
def health_check():
    """Basic health check endpoint to verify service availability."""
    return {
        "status": "ok",
        "service": "BalanceFlow API"
    }
