from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Building, Facility, Room
from app.schemas.schemas import SearchResultItem
from app.utils.geo import haversine_distance

router = APIRouter(tags=["Search"])

@router.get("/search", response_model=List[SearchResultItem])
def search_campus(
    q: str = Query(..., min_length=1, description="Search keyword"),
    lat: Optional[float] = Query(None, description="Current user latitude"),
    lng: Optional[float] = Query(None, description="Current user longitude"),
    db: Session = Depends(get_db)
):
    keyword = q.strip().lower()
    results: List[SearchResultItem] = []

    # 1. Search Buildings (by name, code, description, departments)
    buildings = db.query(Building).all()
    for b in buildings:
        match = False
        if keyword in b.name.lower() or keyword in b.code.lower() or (b.description and keyword in b.description.lower()):
            match = True
        elif b.departments:
            for dept in b.departments:
                if keyword in dept.lower():
                    match = True
                    break

        if match:
            dist = None
            if lat is not None and lng is not None:
                dist = round(haversine_distance(lat, lng, b.latitude, b.longitude), 1)

            results.append(
                SearchResultItem(
                    id=b.id,
                    name=b.name,
                    type="building",
                    category=b.category,
                    building_name=b.name,
                    latitude=b.latitude,
                    longitude=b.longitude,
                    node_id=b.entrance_node_id,
                    distance_meters=dist
                )
            )

    # 2. Search Facilities
    facilities = db.query(Facility).all()
    for fac in facilities:
        if keyword in fac.name.lower() or (fac.description and keyword in fac.description.lower()) or keyword in fac.category.lower():
            dist = None
            if lat is not None and lng is not None:
                dist = round(haversine_distance(lat, lng, fac.latitude, fac.longitude), 1)

            results.append(
                SearchResultItem(
                    id=fac.id,
                    name=fac.name,
                    type="facility",
                    category=fac.category,
                    building_name=fac.building.name if fac.building else None,
                    latitude=fac.latitude,
                    longitude=fac.longitude,
                    distance_meters=dist
                )
            )

    # 3. Search Rooms & Labs
    rooms = db.query(Room).all()
    for r in rooms:
        if keyword in r.name.lower() or keyword in r.room_no.lower() or (r.description and keyword in r.description.lower()) or keyword in r.type.lower():
            b = r.building
            lat_val = b.latitude if b else 13.0105
            lng_val = b.longitude if b else 80.2355
            dist = None
            if lat is not None and lng is not None:
                dist = round(haversine_distance(lat, lng, lat_val, lng_val), 1)

            is_lab = "lab" in r.name.lower() or "lab" in r.type.lower()
            results.append(
                SearchResultItem(
                    id=r.id,
                    name=f"{r.name} ({r.room_no})",
                    type="room",
                    category="laboratory" if is_lab else "academic",
                    building_name=b.name if b else "Campus Building",
                    room_no=r.room_no,
                    latitude=lat_val,
                    longitude=lng_val,
                    node_id=b.entrance_node_id if b else None,
                    distance_meters=dist
                )
            )

    # If coordinates are provided, sort results by distance
    if lat is not None and lng is not None:
        results.sort(key=lambda item: item.distance_meters if item.distance_meters is not None else 999999)

    return results[:25]
