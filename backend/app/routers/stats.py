"""Router for Dashboard Statistics API endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import WellnessEntry
from app.schemas import DashboardStatsResponse
from app.services import stats_service

router = APIRouter()

@router.get("/dashboard", response_model=DashboardStatsResponse)
def get_dashboard_statistics(db: Session = Depends(get_db)):
    """Retrieve summarized statistics for the user dashboard."""
    entries = db.query(WellnessEntry).all()
    stats_data = stats_service.build_dashboard_stats(entries)
    return stats_data
