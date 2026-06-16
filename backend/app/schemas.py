"""Pydantic schemas for data validation and serialization."""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class WellnessEntryBase(BaseModel):
    """Base schema with common wellness entry fields."""
    practice_type: str = Field(..., description="Type of practice (e.g., Yoga, Meditation, Breathing)")
    practice_title: str = Field(..., description="Title of the practice session")
    duration_minutes: int = Field(..., ge=1, description="Duration of the practice in minutes")
    intensity: str = Field(..., description="Intensity level (e.g., Gentle, Moderate, Strong)")
    mood_before: str = Field(..., description="Mood before starting the practice")
    mood_after: str = Field(..., description="Mood after completing the practice")
    energy_before: int = Field(..., ge=1, le=10, description="Energy level before practice (1-10)")
    energy_after: int = Field(..., ge=1, le=10, description="Energy level after practice (1-10)")
    stress_before: int = Field(..., ge=1, le=10, description="Stress level before practice (1-10)")
    stress_after: int = Field(..., ge=1, le=10, description="Stress level after practice (1-10)")
    sleep_quality: int = Field(..., ge=1, le=10, description="Recent sleep quality rating (1-10)")
    reflection: Optional[str] = Field(None, description="Optional personal reflection or notes")

class WellnessEntryCreate(WellnessEntryBase):
    """Schema for validating creation of a new wellness entry."""
    pass

class WellnessEntryResponse(WellnessEntryBase):
    """Schema for serializing a wellness entry database record."""
    id: int
    created_at: datetime

    model_config = {
        "from_attributes": True
    }
