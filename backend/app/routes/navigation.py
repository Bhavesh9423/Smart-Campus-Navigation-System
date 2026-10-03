import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Node, Path, User
from app.schemas.schemas import (
    NodeResponse,
    NodeCreate,
    PathResponse,
    PathCreate,
    RouteRequest,
    RouteResponse
)
from app.utils.auth import require_admin
from app.services.graph_service import navigation_service

router = APIRouter(tags=["Navigation"])

@router.get("/nodes", response_model=List[NodeResponse])
def get_nodes(db: Session = Depends(get_db)):
    return db.query(Node).all()

@router.post("/nodes", response_model=NodeResponse, status_code=status.HTTP_201_CREATED)
def create_node(
    data: NodeCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    node_id = data.id or f"N-{str(uuid.uuid4())[:6]}"
    existing = db.query(Node).filter(Node.id == node_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Node ID already exists")

    new_node = Node(
        id=node_id,
        name=data.name,
        latitude=data.latitude,
        longitude=data.longitude,
        node_type=data.node_type
    )
    db.add(new_node)
    db.commit()
    db.refresh(new_node)

    navigation_service.load_graph(db)
    return new_node

@router.delete("/nodes/{node_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_node(
    node_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    node = db.query(Node).filter(Node.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")

    db.delete(node)
    db.commit()
    navigation_service.load_graph(db)
    return None

@router.get("/paths", response_model=List[PathResponse])
def get_paths(db: Session = Depends(get_db)):
    return db.query(Path).all()

@router.post("/paths", response_model=PathResponse, status_code=status.HTTP_201_CREATED)
def create_path(
    data: PathCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    path_id = data.id or f"P-{str(uuid.uuid4())[:6]}"
    new_path = Path(
        id=path_id,
        start_node_id=data.start_node_id,
        end_node_id=data.end_node_id,
        distance=data.distance,
        walking_time=data.walking_time,
        accessible=data.accessible,
        path_type=data.path_type
    )
    db.add(new_path)
    db.commit()
    db.refresh(new_path)

    navigation_service.load_graph(db)
    return new_path

@router.put("/paths/{path_id}", response_model=PathResponse)
def update_path(
    path_id: str,
    data: PathCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    p = db.query(Path).filter(Path.id == path_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Path not found")

    p.start_node_id = data.start_node_id
    p.end_node_id = data.end_node_id
    p.distance = data.distance
    p.walking_time = data.walking_time
    p.accessible = data.accessible
    p.path_type = data.path_type

    db.commit()
    db.refresh(p)
    navigation_service.load_graph(db)
    return p

@router.delete("/paths/{path_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_path(
    path_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    p = db.query(Path).filter(Path.id == path_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Path not found")

    db.delete(p)
    db.commit()
    navigation_service.load_graph(db)
    return None

@router.post("/navigation/route", response_model=RouteResponse)
def compute_route(
    req: RouteRequest,
    algorithm: Optional[str] = Query("a_star", description="Routing algorithm: 'a_star' or 'dijkstra'"),
    db: Session = Depends(get_db)
):
    """
    Computes optimal walking route between two points using graph-based pathfinding (A* or Dijkstra).
    """
    try:
        use_dijkstra = (algorithm.lower() == "dijkstra")
        res = navigation_service.calculate_route(
            db=db,
            start=req.start,
            destination=req.destination,
            accessible=req.accessible,
            start_coords=req.start_coords,
            dest_coords=req.dest_coords,
            use_dijkstra=use_dijkstra
        )
        return RouteResponse(**res)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Routing error: {str(e)}")
