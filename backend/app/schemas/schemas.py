from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field
from datetime import datetime

# -----------------------------------------------------------------------------
# User & Auth Schemas
# -----------------------------------------------------------------------------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    username: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: Optional[str] = "USER"

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    role: str
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# -----------------------------------------------------------------------------
# Category Schemas
# -----------------------------------------------------------------------------
class CategoryResponse(BaseModel):
    id: str
    name: str
    icon: str
    color: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

# -----------------------------------------------------------------------------
# Node Schemas
# -----------------------------------------------------------------------------
class NodeBase(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    node_type: str = "junction"

class NodeCreate(NodeBase):
    pass

class NodeResponse(NodeBase):
    class Config:
        from_attributes = True

# -----------------------------------------------------------------------------
# Path Schemas
# -----------------------------------------------------------------------------
class PathBase(BaseModel):
    id: Optional[str] = None
    start_node_id: str
    end_node_id: str
    distance: float
    walking_time: int
    accessible: bool = True
    path_type: str = "walkway"

class PathCreate(PathBase):
    pass

class PathResponse(PathBase):
    id: str
    class Config:
        from_attributes = True

# -----------------------------------------------------------------------------
# Room & Floor Schemas
# -----------------------------------------------------------------------------
class RoomBase(BaseModel):
    room_no: str
    name: str
    type: str = "Classroom"
    description: Optional[str] = None

class RoomResponse(RoomBase):
    id: str
    building_id: str
    floor_id: Optional[str] = None

    class Config:
        from_attributes = True

class FloorResponse(BaseModel):
    id: str
    floor_number: int
    name: str
    rooms: List[RoomResponse] = []

    class Config:
        from_attributes = True

# -----------------------------------------------------------------------------
# Building Schemas
# -----------------------------------------------------------------------------
class BuildingBase(BaseModel):
    name: str
    code: str
    category: str
    description: Optional[str] = None
    latitude: float
    longitude: float
    entrance_node_id: Optional[str] = None
    floors_count: int = 1
    departments: List[str] = []
    polygon: List[List[float]] = []

class BuildingCreate(BuildingBase):
    id: Optional[str] = None

class BuildingUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    entrance_node_id: Optional[str] = None
    floors_count: Optional[int] = None
    departments: Optional[List[str]] = None
    polygon: Optional[List[List[float]]] = None

class BuildingResponse(BuildingBase):
    id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class BuildingDetailResponse(BuildingResponse):
    floors: List[FloorResponse] = []
    rooms: List[RoomResponse] = []

# -----------------------------------------------------------------------------
# Facility Schemas
# -----------------------------------------------------------------------------
class FacilityBase(BaseModel):
    name: str
    category: str
    building_id: Optional[str] = None
    description: Optional[str] = None
    latitude: float
    longitude: float
    opening_hours: Optional[str] = None
    contact: Optional[str] = None

class FacilityCreate(FacilityBase):
    id: Optional[str] = None

class FacilityUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    building_id: Optional[str] = None
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    opening_hours: Optional[str] = None
    contact: Optional[str] = None

class FacilityResponse(FacilityBase):
    id: str
    building_name: Optional[str] = None

    class Config:
        from_attributes = True

# -----------------------------------------------------------------------------
# Navigation & Routing Schemas
# -----------------------------------------------------------------------------
class RouteRequest(BaseModel):
    start: str  # Can be node_id, building_id, facility_id, or "LAT,LNG"
    destination: str
    accessible: bool = False
    start_coords: Optional[List[float]] = None  # [lat, lng]
    dest_coords: Optional[List[float]] = None   # [lat, lng]

class RouteInstruction(BaseModel):
    step: int
    text: str
    distance: float  # meters for this step
    node_id: Optional[str] = None
    coordinates: Optional[List[float]] = None

class RouteResponse(BaseModel):
    distance: float          # total distance in meters
    estimated_time: int      # total walking time in minutes
    estimated_seconds: int   # seconds
    accessible_route: bool
    route_node_ids: List[str]
    route_coordinates: List[List[float]]  # list of [lat, lng]
    instructions: List[str]
    detailed_instructions: List[RouteInstruction] = []
    start_name: str
    destination_name: str
    algorithm: str = "A*"
    warnings: List[str] = []

# -----------------------------------------------------------------------------
# Search & Emergency Schemas
# -----------------------------------------------------------------------------
class SearchResultItem(BaseModel):
    id: str
    name: str
    type: str  # 'building', 'facility', 'room', 'department'
    category: str
    building_name: Optional[str] = None
    floor_number: Optional[int] = None
    room_no: Optional[str] = None
    latitude: float
    longitude: float
    node_id: Optional[str] = None
    distance_meters: Optional[float] = None

class EmergencyFacilityResponse(BaseModel):
    facility: FacilityResponse
    distance_meters: float
    estimated_walking_min: int

# -----------------------------------------------------------------------------
# Assistant Schemas
# -----------------------------------------------------------------------------
class AssistantQueryRequest(BaseModel):
    query: str
    current_location: Optional[List[float]] = None  # [lat, lng]

class AssistantAction(BaseModel):
    type: str  # 'navigate', 'view_building', 'view_facility'
    target_id: str
    start_id: Optional[str] = None
    coordinates: Optional[List[float]] = None

class AssistantQueryResponse(BaseModel):
    answer: str
    intent: str
    target_name: Optional[str] = None
    target_type: Optional[str] = None
    coordinates: Optional[List[float]] = None
    action: Optional[AssistantAction] = None
    suggested_queries: List[str] = []

# -----------------------------------------------------------------------------
# Admin Stats & GeoJSON Import
# -----------------------------------------------------------------------------
class AdminStats(BaseModel):
    total_buildings: int
    total_locations: int
    total_paths: int
    total_facilities: int
    total_nodes: int
    active_users: int

class GeoJsonImportResult(BaseModel):
    success: bool
    imported_buildings: int
    imported_paths: int
    imported_facilities: int
    errors: List[str] = []
