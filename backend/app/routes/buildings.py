import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Building, Floor, Room, Facility, User
from app.schemas.schemas import (
    BuildingResponse,
    BuildingDetailResponse,
    BuildingCreate,
    BuildingUpdate,
    FloorResponse,
    RoomResponse,
    RoomBase
)
from app.utils.auth import require_admin
from app.services.graph_service import navigation_service

router = APIRouter(prefix="/buildings", tags=["Buildings"])

@router.get("", response_model=List[BuildingResponse])
def get_buildings(
    category: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Building)
    if category and category.lower() != "all":
        query = query.filter(Building.category == category.lower())
    if q:
        query = query.filter(
            (Building.name.ilike(f"%{q}%")) |
            (Building.code.ilike(f"%{q}%")) |
            (Building.description.ilike(f"%{q}%"))
        )
    return query.order_by(Building.name.asc()).all()

@router.get("/{building_id}", response_model=BuildingDetailResponse)
def get_building_detail(building_id: str, db: Session = Depends(get_db)):
    building = db.query(Building).filter(Building.id == building_id).first()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")

    # Fetch floors and rooms
    floors = db.query(Floor).filter(Floor.building_id == building_id).order_by(Floor.floor_number.asc()).all()
    rooms = db.query(Room).filter(Room.building_id == building_id).all()

    # Structure into floor response
    floor_responses = []
    for f in floors:
        f_rooms = [r for r in rooms if r.floor_id == f.id]
        floor_responses.append(
            FloorResponse(
                id=f.id,
                floor_number=f.floor_number,
                name=f.name,
                rooms=[RoomResponse.model_validate(r) for r in f_rooms]
            )
        )

    response = BuildingDetailResponse.model_validate(building)
    response.floors = floor_responses
    response.rooms = [RoomResponse.model_validate(r) for r in rooms]
    return response

@router.post("", response_model=BuildingResponse, status_code=status.HTTP_201_CREATED)
def create_building(
    data: BuildingCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    existing = db.query(Building).filter(Building.code == data.code).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Building with code '{data.code}' already exists.")

    building_id = data.id or f"b-{data.code.lower().replace(' ', '-')}"
    new_b = Building(
        id=building_id,
        name=data.name,
        code=data.code,
        category=data.category.lower(),
        description=data.description,
        latitude=data.latitude,
        longitude=data.longitude,
        entrance_node_id=data.entrance_node_id,
        floors_count=data.floors_count,
        departments=data.departments,
        polygon=data.polygon
    )
    db.add(new_b)
    db.commit()
    db.refresh(new_b)

    # Re-cache navigation graph
    navigation_service.load_graph(db)
    return new_b

@router.put("/{building_id}", response_model=BuildingResponse)
def update_building(
    building_id: str,
    data: BuildingUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    building = db.query(Building).filter(Building.id == building_id).first()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")

    update_dict = data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(building, key, value)

    db.commit()
    db.refresh(building)
    navigation_service.load_graph(db)
    return building

@router.delete("/{building_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_building(
    building_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    building = db.query(Building).filter(Building.id == building_id).first()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")

    db.delete(building)
    db.commit()
    navigation_service.load_graph(db)
    return None
