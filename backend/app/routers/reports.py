"""Router for Weekly Report API endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import WellnessEntry
from app.schemas import WeeklyReportResponse
from app.services import stats_service

router = APIRouter()

@router.get("/weekly", response_model=WeeklyReportResponse)
def get_weekly_report(db: Session = Depends(get_db)):
    """Retrieve the compiled weekly summary and adaptive goals."""
    entries = db.query(WellnessEntry).all()
    report_data = stats_service.build_weekly_report(entries)
    return report_data
