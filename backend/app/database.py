"""Database configuration module for SQLAlchemy and SQLite."""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# Load environment variables from .env if it exists
load_dotenv()

# Read DATABASE_URL from environment variable
database_url = os.getenv("DATABASE_URL")

if database_url:
    # Support connection strings starting with postgres:// as SQLAlchemy requires postgresql://
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
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
