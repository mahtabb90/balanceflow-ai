"""Main entrypoint for the BalanceFlow FastAPI backend."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app import models  # Import models to ensure they are registered with SQLAlchemy Base metadata
from app.routers import entries, stats, reports

# Create database tables if they do not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BalanceFlow API",
    description="Backend API for the BalanceFlow Mindful Wellness Companion app",
    version="1.0.0",
)

# Register routers
app.include_router(entries.router, prefix="/api/entries", tags=["Entries"])
app.include_router(stats.router, prefix="/api/stats", tags=["Stats"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])

# Enable CORS so frontend (React/Vite) can communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
