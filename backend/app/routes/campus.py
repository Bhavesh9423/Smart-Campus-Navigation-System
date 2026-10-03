import json
import os
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Category, Building, Node, Path, Facility
from app.schemas.schemas import CategoryResponse

router = APIRouter(tags=["Campus"])

GEOJSON_PATHS = [
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "campus.geojson"),
    os.path.join(os.path.dirname(__file__), "..", "..", "data", "campus.geojson"),
    os.path.join(os.getcwd(), "data", "campus.geojson"),
    os.path.join(os.getcwd(), "..", "data", "campus.geojson"),
]

def find_geojson_file() -> str:
    for p in GEOJSON_PATHS:
        abs_p = os.path.abspath(p)
        if os.path.exists(abs_p):
            return abs_p
    return ""

@router.get("/campus-info")
def get_campus_info():
    """
    Returns campus basic configuration: center, zoom, bounds, and identity.
    """
    geojson_path = find_geojson_file()
    if geojson_path:
        try:
            with open(geojson_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                if "campus_info" in data:
                    return data["campus_info"]
        except Exception:
            pass

    return {
        "name": "Apex Institute of Technology & Science",
        "short_name": "AITS Campus",
        "description": "Smart, green, state-of-the-art campus navigation network",
        "center": {
            "latitude": 13.0105,
            "longitude": 80.2355
        },
        "default_zoom": 17,
        "bounds": {
            "southWest": [13.0060, 80.2300],
            "northEast": [13.0160, 80.2420]
        }
    }

@router.get("/categories", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@router.get("/geojson")
def get_campus_geojson(db: Session = Depends(get_db)):
    """
    Generates dynamic or static GeoJSON representing campus buildings, walkways, and facilities.
    """
    geojson_path = find_geojson_file()
    if geojson_path and os.path.exists(geojson_path):
        try:
            with open(geojson_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass

    # Dynamic fallback generator from database tables
    features = []

    # 1. Buildings as Polygons
    buildings = db.query(Building).all()
    for b in buildings:
        if b.polygon and len(b.polygon) >= 3:
            # GeoJSON coordinates are [lon, lat]
            poly_coords = [[pt[1], pt[0]] for pt in b.polygon]
            # Ensure closed ring
            if poly_coords[0] != poly_coords[-1]:
                poly_coords.append(poly_coords[0])
            features.append({
                "type": "Feature",
                "id": b.id,
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [poly_coords]
                },
                "properties": {
                    "id": b.id,
                    "name": b.name,
                    "code": b.code,
                    "category": b.category,
                    "description": b.description,
                    "floors_count": b.floors_count,
                    "departments": b.departments or []
                }
            })

    # 2. Paths as LineStrings
    paths = db.query(Path).all()
    nodes_map = {n.id: n for n in db.query(Node).all()}
    for p in paths:
        s_node = nodes_map.get(p.start_node_id)
        e_node = nodes_map.get(p.end_node_id)
        if s_node and e_node:
            features.append({
                "type": "Feature",
                "id": p.id,
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [s_node.longitude, s_node.latitude],
                        [e_node.longitude, e_node.latitude]
                    ]
                },
                "properties": {
                    "id": p.id,
                    "start_node_id": p.start_node_id,
                    "end_node_id": p.end_node_id,
                    "distance": p.distance,
                    "walking_time": p.walking_time,
                    "accessible": p.accessible,
                    "path_type": p.path_type
                }
            })

    # 3. Facilities as Points
    facilities = db.query(Facility).all()
    for fac in facilities:
        features.append({
            "type": "Feature",
            "id": fac.id,
            "geometry": {
                "type": "Point",
                "coordinates": [fac.longitude, fac.latitude]
            },
            "properties": {
                "id": fac.id,
                "name": fac.name,
                "category": fac.category,
                "building_id": fac.building_id,
                "description": fac.description,
                "opening_hours": fac.opening_hours,
                "contact": fac.contact
            }
        })

    return {
        "type": "FeatureCollection",
        "campus_info": get_campus_info(),
        "features": features
    }
