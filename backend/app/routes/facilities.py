import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Facility, Building, User
from app.schemas.schemas import FacilityResponse, FacilityCreate, FacilityUpdate
from app.utils.auth import require_admin
from app.services.graph_service import navigation_service

router = APIRouter(prefix="/facilities", tags=["Facilities"])

@router.get("", response_model=List[FacilityResponse])
def get_facilities(
    category: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Facility)
    if category and category.lower() != "all":
        query = query.filter(Facility.category == category.lower())
    if q:
        query = query.filter(
            (Facility.name.ilike(f"%{q}%")) |
            (Facility.description.ilike(f"%{q}%"))
        )

    facilities = query.all()
    results = []
    for fac in facilities:
        resp = FacilityResponse.model_validate(fac)
        resp.building_name = fac.building.name if fac.building else None
        results.append(resp)
    return results

@router.get("/{facility_id}", response_model=FacilityResponse)
def get_facility(facility_id: str, db: Session = Depends(get_db)):
    fac = db.query(Facility).filter(Facility.id == facility_id).first()
    if not fac:
        raise HTTPException(status_code=404, detail="Facility not found")
    resp = FacilityResponse.model_validate(fac)
    resp.building_name = fac.building.name if fac.building else None
    return resp

@router.post("", response_model=FacilityResponse, status_code=status.HTTP_201_CREATED)
def create_facility(
    data: FacilityCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    fac_id = data.id or f"fac-{str(uuid.uuid4())[:8]}"
    new_fac = Facility(
        id=fac_id,
        name=data.name,
        category=data.category.lower(),
        building_id=data.building_id,
        description=data.description,
        latitude=data.latitude,
        longitude=data.longitude,
        opening_hours=data.opening_hours,
        contact=data.contact
    )
    db.add(new_fac)
    db.commit()
    db.refresh(new_fac)

    resp = FacilityResponse.model_validate(new_fac)
    resp.building_name = new_fac.building.name if new_fac.building else None
    return resp

@router.put("/{facility_id}", response_model=FacilityResponse)
def update_facility(
    facility_id: str,
    data: FacilityUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    fac = db.query(Facility).filter(Facility.id == facility_id).first()
    if not fac:
        raise HTTPException(status_code=404, detail="Facility not found")

    update_dict = data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(fac, key, value)

    db.commit()
    db.refresh(fac)

    resp = FacilityResponse.model_validate(fac)
    resp.building_name = fac.building.name if fac.building else None
    return resp

@router.delete("/{facility_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_facility(
    facility_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    fac = db.query(Facility).filter(Facility.id == facility_id).first()
    if not fac:
        raise HTTPException(status_code=404, detail="Facility not found")

    db.delete(fac)
    db.commit()
    return None
