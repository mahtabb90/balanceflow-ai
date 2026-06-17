"""Router for AI Insights API endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import WellnessEntry
from app.schemas import AIInsightsResponse
from app.services import ai_service

router = APIRouter()

@router.get("/insights", response_model=AIInsightsResponse)
def get_ai_insights(db: Session = Depends(get_db)):
    """Retrieve personal wellness insights powered by Gemini or fallback rules."""
    entries = db.query(WellnessEntry).order_by(WellnessEntry.created_at.desc()).all()
    
    if not entries:
        print("Using fallback AI insights")
        return {
            "source": "fallback",
            "pattern_summary": "Your insights will grow with your practice.",
            "gentle_recommendation": "Log a few yoga, meditation or breathing sessions to discover patterns in your wellness routine.",
            "stress_trend_insight": "Stress trends will appear after you log practice sessions.",
            "sleep_energy_connection": "Sleep and energy patterns will appear as you continue tracking.",
            "reflection_summary": "Add short reflections to discover recurring themes.",
            "next_week_focus": "Try one short mindful session to begin building your BalanceFlow pattern.",
            "disclaimer": "These insights are for personal awareness and are not medical advice."
        }
        
    insights = ai_service.generate_ai_insights(entries)
    return insights
