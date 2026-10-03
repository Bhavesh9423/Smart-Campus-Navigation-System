import json
import uuid
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, Body, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Building, Room, Facility, Node, Path, User
from app.schemas.schemas import AdminStats, GeoJsonImportResult
from app.utils.auth import require_admin
from app.services.graph_service import navigation_service

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/stats", response_model=AdminStats)
def get_admin_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    total_buildings = db.query(Building).count()
    total_rooms = db.query(Room).count()
    total_facilities = db.query(Facility).count()
    total_paths = db.query(Path).count()
    total_nodes = db.query(Node).count()
    active_users = db.query(User).filter(User.is_active == True).count()

    total_locations = total_buildings + total_rooms + total_facilities

    return AdminStats(
        total_buildings=total_buildings,
        total_locations=total_locations,
        total_paths=total_paths,
        total_facilities=total_facilities,
        total_nodes=total_nodes,
        active_users=active_users
    )

@router.post("/geojson/import", response_model=GeoJsonImportResult)
def import_geojson(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    Validates and imports GeoJSON features into the CampusNav database.
    Supports Polygon features as Buildings, LineString features as Paths,
    and Point features as Nodes/Facilities.
    """
    errors: List[str] = []
    imported_buildings = 0
    imported_paths = 0
    imported_facilities = 0

    features = payload.get("features", [])
    if not features:
        raise HTTPException(status_code=400, detail="Invalid GeoJSON: 'features' array missing or empty.")

    for idx, feat in enumerate(features):
        try:
            geometry = feat.get("geometry", {})
            props = feat.get("properties", {})
            geom_type = geometry.get("type")
            coords = geometry.get("coordinates", [])

            if geom_type == "Polygon":
                # Building
                b_name = props.get("name", f"Building {idx+1}")
                b_code = props.get("code", f"BLD-{idx+1}")
                b_cat = props.get("category", "academic")
                b_id = feat.get("id") or props.get("id") or f"b-{b_code.lower()}"

                # Calculate polygon center for lat/lon
                poly_ring = coords[0] if coords else []
                if poly_ring:
                    avg_lon = sum(pt[0] for pt in poly_ring) / len(poly_ring)
                    avg_lat = sum(pt[1] for pt in poly_ring) / len(poly_ring)
                    # Convert to [lat, lng] format for internal polygon storage
                    lat_lng_poly = [[pt[1], pt[0]] for pt in poly_ring]
                else:
                    avg_lat, avg_lon, lat_lng_poly = 13.0105, 80.2355, []

                existing = db.query(Building).filter((Building.id == b_id) | (Building.code == b_code)).first()
                if not existing:
                    new_b = Building(
                        id=b_id,
                        name=b_name,
                        code=b_code,
                        category=b_cat,
                        description=props.get("description", ""),
                        latitude=avg_lat,
                        longitude=avg_lon,
                        floors_count=int(props.get("floors_count", 1)),
                        departments=props.get("departments", []),
                        polygon=lat_lng_poly
                    )
                    db.add(new_b)
                    imported_buildings += 1

            elif geom_type == "LineString":
                # Path
                p_id = feat.get("id") or props.get("id") or f"P-imp-{idx}"
                s_id = props.get("start_node_id")
                e_id = props.get("end_node_id")

                if s_id and e_id:
                    existing_p = db.query(Path).filter(Path.id == p_id).first()
                    if not existing_p:
                        new_p = Path(
                            id=p_id,
                            start_node_id=s_id,
                            end_node_id=e_id,
                            distance=float(props.get("distance", 50.0)),
                            walking_time=int(props.get("walking_time", 35)),
                            accessible=bool(props.get("accessible", True)),
                            path_type=props.get("path_type", "walkway")
                        )
                        db.add(new_p)
                        imported_paths += 1

            elif geom_type == "Point":
                # Facility or Node
                name = props.get("name", f"Facility {idx+1}")
                cat = props.get("category", "facility")
                lon, lat = coords[0], coords[1]
                f_id = feat.get("id") or props.get("id") or f"fac-imp-{idx}"

                existing_f = db.query(Facility).filter(Facility.id == f_id).first()
                if not existing_f:
                    new_f = Facility(
                        id=f_id,
                        name=name,
                        category=cat,
                        latitude=lat,
                        longitude=lon,
                        description=props.get("description", ""),
                        opening_hours=props.get("opening_hours", "08:00 AM - 08:00 PM"),
                        contact=props.get("contact", "")
                    )
                    db.add(new_f)
                    imported_facilities += 1

        except Exception as e:
            errors.append(f"Feature #{idx}: {str(e)}")

    db.commit()
    navigation_service.load_graph(db)

    return GeoJsonImportResult(
        success=True,
        imported_buildings=imported_buildings,
        imported_paths=imported_paths,
        imported_facilities=imported_facilities,
        errors=errors
    )
