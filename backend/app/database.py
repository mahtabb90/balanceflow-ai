"""Database configuration module for SQLAlchemy and SQLite."""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# Load environment variables from .env if it exists
load_dotenv()

# The installed PostgreSQL driver is psycopg2 (psycopg2-binary in requirements.txt).
POSTGRES_DRIVER_SCHEME = "postgresql+psycopg2://"
_POSTGRES_SCHEMES = ("postgres://", "postgresql://", "postgresql+psycopg://", "postgresql+psycopg2://")


def normalize_database_url(url: str) -> str:
    """Make PostgreSQL URLs use the installed psycopg2 driver.

    Hosts commonly hand out postgres:// or postgresql:// URLs, and a postgresql+psycopg://
    URL selects the Psycopg 3 driver, which is not installed. All of them are mapped to
    psycopg2 so the URL form can never cause a missing-driver error at startup.
    Non-PostgreSQL URLs (such as sqlite) are returned unchanged.
    """
    for scheme in _POSTGRES_SCHEMES:
        if url.startswith(scheme):
            return POSTGRES_DRIVER_SCHEME + url[len(scheme):]
    return url


# Read DATABASE_URL from environment variable
database_url = os.getenv("DATABASE_URL")

if database_url:
    database_url = normalize_database_url(database_url.strip())
else:
    # Fall back to local SQLite
    database_url = "sqlite:///./balanceflow.db"

# Engine configuration depending on database type
if database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    engine_kwargs = {}
else:
    connect_args = {}
    engine_kwargs = {"pool_pre_ping": True}

engine = create_engine(database_url, connect_args=connect_args, **engine_kwargs)

# Create SessionLocal class for database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for SQLAlchemy models
Base = declarative_base()

def get_db():
    """Dependency helper to get a database session.
    
    Yields:
        db: SQLAlchemy database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
