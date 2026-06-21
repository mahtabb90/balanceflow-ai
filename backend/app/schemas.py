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

class WeeklyMinutesByDay(BaseModel):
    """Weekly practice minutes grouped by day."""
    Mon: int = 0
    Tue: int = 0
    Wed: int = 0
    Thu: int = 0
    Fri: int = 0
    Sat: int = 0
    Sun: int = 0

class SessionCountsByType(BaseModel):
    """Session count grouped by practice type."""
    Yoga: int = 0
    Meditation: int = 0
    Breathing: int = 0

class DashboardStatsResponse(BaseModel):
    """Schema representing dashboard stats summary."""
    total_minutes: int
    total_sessions: int
    consistency_streak: int
    yoga_impact_score: int
    average_stress_before: float
    average_stress_after: float
    average_stress_reduction_percent: float
    average_energy_before: float
    average_energy_after: float
    average_energy_change: float
    average_sleep_quality: float
    weekly_minutes_by_day: WeeklyMinutesByDay
    session_counts_by_type: SessionCountsByType

class WeeklyReportResponse(BaseModel):
    """Schema representing weekly summary report and wellness goals."""
    total_practice_minutes: int
    total_sessions: int
    yoga_sessions: int
    meditation_sessions: int
    breathing_sessions: int
    average_stress_reduction_percent: float
    best_practice_type: str
    average_sleep_quality: float
    average_energy_change: float
    gentle_next_week_goal: str

class AIInsightsResponse(BaseModel):
    """Schema representing AI Insights generated or fallback."""
    source: str
    pattern_summary: str
    gentle_recommendation: str
    stress_trend_insight: str
    sleep_energy_connection: str
    reflection_summary: str
    next_week_focus: str
    disclaimer: str

