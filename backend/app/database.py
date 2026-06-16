"""Database configuration module for SQLAlchemy and SQLite."""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# Load environment variables from .env if it exists
load_dotenv()

# SQLite database URL (defaulting to local sqlite file in backend folder)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./balanceflow.db")

# Create engine. Connect args are needed only for SQLite to allow multiple threads.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

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
