import math
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Facility, Building
from app.schemas.schemas import EmergencyFacilityResponse, FacilityResponse
from app.utils.geo import haversine_distance

router = APIRouter(prefix="/emergency", tags=["Emergency"])

EMERGENCY_FACILITY_TYPES = [
    "medical",
    "emergency",
    "security",
    "gate",
    "fire",
    "assembly",
    "first aid"
]

@router.get("/nearest", response_model=List[EmergencyFacilityResponse])
def get_nearest_emergency(
    lat: float = Query(..., description="User latitude"),
    lng: float = Query(..., description="User longitude"),
    facility_type: Optional[str] = Query(None, description="Filter: 'medical', 'security', 'assembly', etc."),
    limit: int = Query(5, ge=1, le=10),
    db: Session = Depends(get_db)
):
    query = db.query(Facility)

    # Filter by category or emergency-related facilities
    all_facs = query.all()
    matching_facs = []

    for fac in all_facs:
        is_emergency = False
        cat_lower = fac.category.lower()
        name_lower = fac.name.lower()

        if facility_type:
            ft = facility_type.lower()
            if ft in cat_lower or ft in name_lower:
                is_emergency = True
        else:
            if cat_lower == "emergency" or cat_lower == "medical":
                is_emergency = True
            elif any(kw in name_lower for kw in EMERGENCY_FACILITY_TYPES):
                is_emergency = True

        if is_emergency:
            matching_facs.append(fac)

    # Also check buildings marked with emergency category or gates
    if not facility_type or facility_type.lower() in ["gate", "security", "assembly"]:
        gate_buildings = db.query(Building).filter(
            (Building.category == "emergency") | (Building.code.ilike("%gate%"))
        ).all()
        for gb in gate_buildings:
            matching_facs.append(
                Facility(
                    id=gb.id,
                    name=gb.name,
                    category="emergency",
                    building_id=gb.id,
                    description=gb.description,
                    latitude=gb.latitude,
                    longitude=gb.longitude,
                    opening_hours="24/7 Accessible",
                    contact="Security Control: 100 / ext 8000"
                )
            )

    if not matching_facs:
        # Fallback to any medical or security facility
        matching_facs = db.query(Facility).filter(
            (Facility.category == "medical") | (Facility.name.ilike("%medical%")) | (Facility.name.ilike("%security%"))
        ).all()

    results: List[EmergencyFacilityResponse] = []
    for fac in matching_facs:
        dist = haversine_distance(lat, lng, fac.latitude, fac.longitude)
        walking_time_min = max(1, math.ceil((dist / 1.2) / 60))  # standard ~1.2 m/s walk speed

        fac_resp = FacilityResponse(
            id=fac.id,
            name=fac.name,
            category=fac.category,
            building_id=fac.building_id,
            description=fac.description,
            latitude=fac.latitude,
            longitude=fac.longitude,
            opening_hours=fac.opening_hours,
            contact=fac.contact,
            building_name=fac.building.name if fac.building else None
        )

        results.append(
            EmergencyFacilityResponse(
                facility=fac_resp,
                distance_meters=round(dist, 1),
                estimated_walking_min=walking_time_min
            )
        )

    # Sort ascending by distance
    results.sort(key=lambda x: x.distance_meters)
    return results[:limit]
