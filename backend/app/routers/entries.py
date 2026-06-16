"""Router for Wellness Entries API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import WellnessEntry
from app.schemas import WellnessEntryCreate, WellnessEntryResponse

router = APIRouter()

@router.post("", response_model=WellnessEntryResponse, status_code=status.HTTP_201_CREATED)
def create_entry(entry: WellnessEntryCreate, db: Session = Depends(get_db)):
    """Create a new wellness entry log."""
    db_entry = WellnessEntry(**entry.model_dump())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@router.get("", response_model=List[WellnessEntryResponse])
def read_entries(db: Session = Depends(get_db)):
    """Retrieve all wellness entries, ordered by creation date descending."""
    return db.query(WellnessEntry).order_by(WellnessEntry.created_at.desc()).all()

@router.get("/{entry_id}", response_model=WellnessEntryResponse)
def read_entry(entry_id: int, db: Session = Depends(get_db)):
    """Retrieve a single wellness entry by its ID."""
    db_entry = db.query(WellnessEntry).filter(WellnessEntry.id == entry_id).first()
    if not db_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Wellness entry with ID {entry_id} not found"
        )
    return db_entry

@router.delete("/{entry_id}", status_code=status.HTTP_200_OK)
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    """Delete a single wellness entry by its ID."""
    db_entry = db.query(WellnessEntry).filter(WellnessEntry.id == entry_id).first()
    if not db_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Wellness entry with ID {entry_id} not found"
        )
    db.delete(db_entry)
    db.commit()
    return {"message": f"Wellness entry with ID {entry_id} has been successfully deleted"}

@router.delete("", status_code=status.HTTP_200_OK)
def delete_all_entries(db: Session = Depends(get_db)):
    """Delete all wellness entries (Demo reset)."""
    num_deleted = db.query(WellnessEntry).delete()
    db.commit()
    return {"message": f"All wellness entries have been successfully deleted. Total deleted: {num_deleted}"}
