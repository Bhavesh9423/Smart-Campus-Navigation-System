from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Building, Room, Facility, Node, User
from app.schemas.schemas import SearchResultItem
from app.utils.auth import require_admin
from app.services.graph_service import navigation_service

router = APIRouter(prefix="/locations", tags=["Locations"])

@router.get("", response_model=List[SearchResultItem])
def get_all_locations(
    category: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db)
):
    results: List[SearchResultItem] = []

    # 1. Buildings
    b_query = db.query(Building)
    if category and category.lower() != "all":
        b_query = b_query.filter(Building.category == category.lower())
    if q:
        b_query = b_query.filter(Building.name.ilike(f"%{q}%") | Building.description.ilike(f"%{q}%"))

    for b in b_query.all():
        results.append(
            SearchResultItem(
                id=b.id,
                name=b.name,
                type="building",
                category=b.category,
                building_name=b.name,
                latitude=b.latitude,
                longitude=b.longitude,
                node_id=b.entrance_node_id
            )
        )

    # 2. Facilities
    fac_query = db.query(Facility)
    if category and category.lower() != "all":
        fac_query = fac_query.filter(Facility.category == category.lower())
    if q:
        fac_query = fac_query.filter(Facility.name.ilike(f"%{q}%") | Facility.description.ilike(f"%{q}%"))

    for fac in fac_query.all():
        b_name = fac.building.name if fac.building else None
        results.append(
            SearchResultItem(
                id=fac.id,
                name=fac.name,
                type="facility",
                category=fac.category,
                building_name=b_name,
                latitude=fac.latitude,
                longitude=fac.longitude
            )
        )

    # 3. Notable Rooms / Labs
    if not category or category.lower() in ["all", "academic", "laboratory"]:
        r_query = db.query(Room)
        if q:
            r_query = r_query.filter(Room.name.ilike(f"%{q}%") | Room.room_no.ilike(f"%{q}%"))
        else:
            # By default include first 20 key rooms to avoid flooding
            r_query = r_query.limit(30)

        for r in r_query.all():
            b = r.building
            lat = b.latitude if b else 13.0105
            lng = b.longitude if b else 80.2355
            results.append(
                SearchResultItem(
                    id=r.id,
                    name=f"{r.name} ({r.room_no})",
                    type="room",
                    category="laboratory" if "lab" in r.name.lower() or "lab" in r.type.lower() else "academic",
                    building_name=b.name if b else "Campus Building",
                    room_no=r.room_no,
                    latitude=lat,
                    longitude=lng,
                    node_id=b.entrance_node_id if b else None
                )
            )

    return results

@router.get("/{location_id}", response_model=SearchResultItem)
def get_location_by_id(location_id: str, db: Session = Depends(get_db)):
    # Check Building
    b = db.query(Building).filter(Building.id == location_id).first()
    if b:
        return SearchResultItem(
            id=b.id,
            name=b.name,
            type="building",
            category=b.category,
            building_name=b.name,
            latitude=b.latitude,
            longitude=b.longitude,
            node_id=b.entrance_node_id
        )

    # Check Facility
    fac = db.query(Facility).filter(Facility.id == location_id).first()
    if fac:
        return SearchResultItem(
            id=fac.id,
            name=fac.name,
            type="facility",
            category=fac.category,
            building_name=fac.building.name if fac.building else None,
            latitude=fac.latitude,
            longitude=fac.longitude
        )

    # Check Room
    r = db.query(Room).filter(Room.id == location_id).first()
    if r:
        b = r.building
        lat = b.latitude if b else 13.0105
        lng = b.longitude if b else 80.2355
        return SearchResultItem(
            id=r.id,
            name=f"{r.name} ({r.room_no})",
            type="room",
            category="academic",
            building_name=b.name if b else "Campus Building",
            room_no=r.room_no,
            latitude=lat,
            longitude=lng,
            node_id=b.entrance_node_id if b else None
        )

    raise HTTPException(status_code=404, detail="Location not found")
