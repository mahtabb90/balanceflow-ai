"""Database models module."""

from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base

class WellnessEntry(Base):
    """WellnessEntry model representing detailed mindfulness and physical practice sessions.
    
    This captures user state (mood, energy, stress) before and after practices,
    as well as practice metadata for dashboard calculations and AI insights.
    """
    __tablename__ = "wellness_entries"

    id = Column(Integer, primary_key=True, index=True)
    practice_type = Column(String, nullable=False)  # e.g., Yoga, Meditation, Breathing
    practice_title = Column(String, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    intensity = Column(String, nullable=False)       # e.g., Gentle, Moderate, Strong
    mood_before = Column(String, nullable=False)
    mood_after = Column(String, nullable=False)
    energy_before = Column(Integer, nullable=False)  # Scale (e.g., 1-10)
    energy_after = Column(Integer, nullable=False)
    stress_before = Column(Integer, nullable=False)
    stress_after = Column(Integer, nullable=False)
    sleep_quality = Column(Integer, nullable=False)  # Scale (e.g., 1-10)
    reflection = Column(Text, nullable=True)         # Optional personal reflection text
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
