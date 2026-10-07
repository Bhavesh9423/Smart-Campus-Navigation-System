import json
import os
import uuid
from sqlalchemy.orm import Session
from app.models.models import User, Category, Node, Path, Building, Floor, Room, Facility
from app.utils.auth import get_password_hash
from app.config import settings

SAMPLE_DATA_PATHS = [
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "sample-data.json"),
    os.path.join(os.path.dirname(__file__), "..", "..", "data", "sample-data.json"),
    os.path.join(os.path.dirname(__file__), "..", "data", "sample-data.json"),
    os.path.join(os.path.dirname(__file__), "sample-data.json"),
    os.path.join(os.getcwd(), "data", "sample-data.json"),
    os.path.join(os.getcwd(), "..", "data", "sample-data.json"),
    os.path.join(os.getcwd(), "backend", "data", "sample-data.json"),
    os.path.join(os.getcwd(), "api", "data", "sample-data.json"),
    "/var/task/data/sample-data.json",
    "/var/task/backend/data/sample-data.json",
    "/var/task/api/data/sample-data.json",
]

def find_sample_data_file() -> str:
    for p in SAMPLE_DATA_PATHS:
        abs_p = os.path.abspath(p)
        if os.path.exists(abs_p):
            return abs_p
    return ""

def seed_database(db: Session, force: bool = False):
    """
    Seeds database from sample-data.json if tables are empty.
    """
    # 1. Seed default admin if not exists
    admin = db.query(User).filter(User.username == settings.DEFAULT_ADMIN_USERNAME).first()
    if not admin:
        new_admin = User(
            id=str(uuid.uuid4()),
            username=settings.DEFAULT_ADMIN_USERNAME,
            email=settings.DEFAULT_ADMIN_EMAIL,
            hashed_password=get_password_hash(settings.DEFAULT_ADMIN_PASSWORD),
            role="ADMIN",
            is_active=True
        )
        db.add(new_admin)
        db.commit()
        print(f"[Seed] Created default admin user: {settings.DEFAULT_ADMIN_USERNAME}")

    # Seed a demo student user as well
    student = db.query(User).filter(User.username == "student").first()
    if not student:
        demo_student = User(
            id=str(uuid.uuid4()),
            username="student",
            email="student@campusnav.edu",
            hashed_password=get_password_hash("student123"),
            role="USER",
            is_active=True
        )
        db.add(demo_student)
        db.commit()

    # If buildings already exist and force is False, skip data seeding
    building_count = db.query(Building).count()
    if building_count > 0 and not force:
        print(f"[Seed] Database already contains {building_count} buildings. Skipping data re-seed.")
        return

    data_file = find_sample_data_file()
    if not data_file:
        print("[Seed] Warning: sample-data.json not found.")
        return

    with open(data_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"[Seed] Seeding database from {data_file}...")

    # Categories
    categories = data.get("categories", [])
    for c in categories:
        cat_id = c.get("id")
        existing_cat = db.query(Category).filter(Category.id == cat_id).first()
        if not existing_cat:
            cat_obj = Category(
                id=cat_id,
                name=c.get("name", cat_id.capitalize()),
                icon=c.get("icon", "Layers"),
                color=c.get("color", "#0284c7"),
                description=c.get("description", "")
            )
            db.add(cat_obj)
    db.commit()

    # Nodes
    nodes = data.get("nodes", [])
    for n in nodes:
        node_id = n.get("id")
        existing_node = db.query(Node).filter(Node.id == node_id).first()
        if not existing_node:
            node_obj = Node(
                id=node_id,
                name=n.get("name", f"Node {node_id}"),
                latitude=float(n["latitude"]),
                longitude=float(n["longitude"]),
                node_type=n.get("node_type", "junction")
            )
            db.add(node_obj)
    db.commit()

    # Paths
    paths = data.get("paths", [])
    for p in paths:
        path_id = p.get("id", str(uuid.uuid4()))
        existing_path = db.query(Path).filter(Path.id == path_id).first()
        if not existing_path:
            path_obj = Path(
                id=path_id,
                start_node_id=p["start_node_id"],
                end_node_id=p["end_node_id"],
                distance=float(p.get("distance", 50.0)),
                walking_time=int(p.get("walking_time", 35)),
                accessible=bool(p.get("accessible", True)),
                path_type=p.get("path_type", "walkway")
            )
            db.add(path_obj)
    db.commit()

    # Buildings, Floors, and Rooms
    buildings = data.get("buildings", [])
    for b in buildings:
        b_id = b.get("id", str(uuid.uuid4()))
        existing_b = db.query(Building).filter(Building.id == b_id).first()
        if not existing_b:
            b_obj = Building(
                id=b_id,
                name=b["name"],
                code=b["code"],
                category=b.get("category", "academic"),
                description=b.get("description", ""),
                latitude=float(b["latitude"]),
                longitude=float(b["longitude"]),
                entrance_node_id=b.get("entrance_node_id"),
                floors_count=int(b.get("floors_count", 1)),
                departments=b.get("departments", []),
                polygon=b.get("polygon", []),
                geojson=b.get("geojson", {})
            )
            db.add(b_obj)
            db.flush()

            # Floors
            for floor_data in b.get("floors", []):
                floor_id = f"{b_id}-F{floor_data.get('floor_number', 0)}"
                f_obj = Floor(
                    id=floor_id,
                    building_id=b_id,
                    floor_number=int(floor_data.get("floor_number", 0)),
                    name=floor_data.get("name", f"Floor {floor_data.get('floor_number', 0)}")
                )
                db.add(f_obj)
                db.flush()

                # Rooms
                for r_data in floor_data.get("rooms", []):
                    r_id = f"{b_id}-{r_data.get('room_no')}"
                    r_obj = Room(
                        id=r_id,
                        building_id=b_id,
                        floor_id=floor_id,
                        room_no=r_data.get("room_no", "101"),
                        name=r_data.get("name", "Room"),
                        type=r_data.get("type", "Classroom"),
                        description=r_data.get("description", "")
                    )
                    db.add(r_obj)

    db.commit()

    # Facilities
    facilities = data.get("facilities", [])
    for fac in facilities:
        fac_id = fac.get("id", str(uuid.uuid4()))
        existing_fac = db.query(Facility).filter(Facility.id == fac_id).first()
        if not existing_fac:
            fac_obj = Facility(
                id=fac_id,
                name=fac["name"],
                category=fac.get("category", "facility"),
                building_id=fac.get("building_id"),
                description=fac.get("description", ""),
                latitude=float(fac["latitude"]),
                longitude=float(fac["longitude"]),
                opening_hours=fac.get("opening_hours", "08:00 AM - 08:00 PM"),
                contact=fac.get("contact", "")
            )
            db.add(fac_obj)

    db.commit()
    print("[Seed] Successfully seeded campus categories, nodes, paths, buildings, rooms, and facilities!")
