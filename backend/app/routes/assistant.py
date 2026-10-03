import re
from typing import Optional, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Building, Facility, Room, Node
from app.schemas.schemas import AssistantQueryRequest, AssistantQueryResponse, AssistantAction
from app.utils.geo import haversine_distance

router = APIRouter(prefix="/assistant", tags=["AI Campus Assistant"])

@router.post("/query", response_model=AssistantQueryResponse)
def handle_assistant_query(
    req: AssistantQueryRequest,
    db: Session = Depends(get_db)
):
    """
    Intelligent deterministic campus natural language assistant.
    Analyzes navigation, location, and facility inquiries and returns
    structured guidance and actionable map triggers.
    """
    raw_query = req.query.strip()
    q = raw_query.lower()
    user_coords = req.current_location

    suggested_queries = [
        "Where is the Central Library?",
        "How do I reach CSE department from Main Gate?",
        "Where is the nearest canteen?",
        "Find Seminar Hall",
        "Where is the Medical Center?"
    ]

    # Pattern 1: Route / Navigation inquiry e.g. "How do I reach X from Y" or "Navigate from X to Y"
    route_match = re.search(r'(?:how do i reach|navigate to|directions to|way to|route to|how to reach)\s+(.+?)(?:\s+from\s+(.+))?$', q)
    if route_match:
        target_name = route_match.group(1).strip()
        from_name = route_match.group(2).strip() if route_match.group(2) else None

        # Resolve destination
        target_b = db.query(Building).filter(Building.name.ilike(f"%{target_name}%")).first()
        target_fac = db.query(Facility).filter(Facility.name.ilike(f"%{target_name}%")).first() if not target_b else None

        start_b = None
        if from_name:
            start_b = db.query(Building).filter(Building.name.ilike(f"%{from_name}%")).first()

        dest_id = target_b.id if target_b else (target_fac.id if target_fac else None)
        dest_display = target_b.name if target_b else (target_fac.name if target_fac else target_name)

        if dest_id:
            start_id = start_b.id if start_b else "b-gate-main"
            start_display = start_b.name if start_b else "Main Gate & Welcome Center"
            coords = [target_b.latitude, target_b.longitude] if target_b else [target_fac.latitude, target_fac.longitude]

            return AssistantQueryResponse(
                answer=f"To reach **{dest_display}** from **{start_display}**, head north along the central avenue. The shortest paved path is approximately 3-5 minutes walk. Click 'Show Route on Map' below to launch active navigation.",
                intent="navigation",
                target_name=dest_display,
                target_type="building" if target_b else "facility",
                coordinates=coords,
                action=AssistantAction(
                    type="navigate",
                    target_id=dest_id,
                    start_id=start_id,
                    coordinates=coords
                ),
                suggested_queries=suggested_queries
            )

    # Pattern 2: "Where is X" or "Which building has X" or "Find X"
    if any(q.startswith(p) for p in ["where is", "where's", "find", "which building has", "locate", "show me", "what is the location"]):
        # Extract entity
        clean_target = re.sub(r'^(where is the|where is|where\'s the|where\'s|find the|find|which building has the|which building has|locate the|locate|show me the|show me)\s+', '', q)
        clean_target = clean_target.strip(" ?.")

        # Check rooms first (e.g. "seminar hall 1", "robotics lab", "room 204")
        room = db.query(Room).filter(Room.name.ilike(f"%{clean_target}%") | Room.room_no.ilike(f"%{clean_target}%")).first()
        if room and room.building:
            b = room.building
            f_text = f"Floor {room.floor.floor_number}" if room.floor else "Ground Floor"
            return AssistantQueryResponse(
                answer=f"**{room.name}** ({room.room_no}) is located on **{f_text}** inside **{b.name}** ({b.code}). {b.description or ''}",
                intent="room_lookup",
                target_name=room.name,
                target_type="room",
                coordinates=[b.latitude, b.longitude],
                action=AssistantAction(
                    type="view_building",
                    target_id=b.id,
                    coordinates=[b.latitude, b.longitude]
                ),
                suggested_queries=suggested_queries
            )

        # Check buildings
        building = db.query(Building).filter(
            Building.name.ilike(f"%{clean_target}%") |
            Building.code.ilike(f"%{clean_target}%")
        ).first()

        if not building:
            # Check departments within building
            for b in db.query(Building).all():
                if b.departments and any(clean_target in d.lower() for d in b.departments):
                    building = b
                    break

        if building:
            dept_str = ", ".join(building.departments) if building.departments else "General Academics"
            return AssistantQueryResponse(
                answer=f"**{building.name}** ({building.code}) is in the campus central zone with **{building.floors_count} floors**. Departments housed here: {dept_str}. {building.description}",
                intent="building_lookup",
                target_name=building.name,
                target_type="building",
                coordinates=[building.latitude, building.longitude],
                action=AssistantAction(
                    type="view_building",
                    target_id=building.id,
                    coordinates=[building.latitude, building.longitude]
                ),
                suggested_queries=suggested_queries
            )

        # Check facilities
        fac = db.query(Facility).filter(Facility.name.ilike(f"%{clean_target}%") | Facility.category.ilike(f"%{clean_target}%")).first()
        if fac:
            b_info = f"inside or near {fac.building.name}" if fac.building else "in the campus grounds"
            return AssistantQueryResponse(
                answer=f"**{fac.name}** is situated {b_info}. Operating hours: **{fac.opening_hours or 'Regular Campus Hours'}**. Contact: {fac.contact or 'Campus Helpdesk'}.",
                intent="facility_lookup",
                target_name=fac.name,
                target_type="facility",
                coordinates=[fac.latitude, fac.longitude],
                action=AssistantAction(
                    type="view_facility",
                    target_id=fac.id,
                    coordinates=[fac.latitude, fac.longitude]
                ),
                suggested_queries=suggested_queries
            )

    # Pattern 3: "Nearest X" (e.g. nearest canteen, nearest lab, nearest washroom, nearest atm)
    if "nearest" in q or "closest" in q:
        target_kw = q.replace("nearest", "").replace("closest", "").replace("find", "").replace("the", "").strip(" ?.")

        # Search facility matching target
        matching_facs = db.query(Facility).filter(
            Facility.name.ilike(f"%{target_kw}%") |
            Facility.category.ilike(f"%{target_kw}%")
        ).all()

        ref_lat = user_coords[0] if user_coords else 13.0105
        ref_lng = user_coords[1] if user_coords else 80.2355

        if matching_facs:
            closest_fac = min(matching_facs, key=lambda f: haversine_distance(ref_lat, ref_lng, f.latitude, f.longitude))
            dist = round(haversine_distance(ref_lat, ref_lng, closest_fac.latitude, closest_fac.longitude), 1)
            return AssistantQueryResponse(
                answer=f"The nearest **{target_kw}** is **{closest_fac.name}**, located approximately **{int(dist)} meters** away ({closest_fac.opening_hours or 'Open now'}).",
                intent="nearest_lookup",
                target_name=closest_fac.name,
                target_type="facility",
                coordinates=[closest_fac.latitude, closest_fac.longitude],
                action=AssistantAction(
                    type="navigate",
                    target_id=closest_fac.id,
                    coordinates=[closest_fac.latitude, closest_fac.longitude]
                ),
                suggested_queries=suggested_queries
            )

    # General Fallback with intelligent search
    fallback_b = db.query(Building).filter(Building.name.ilike(f"%{q[:10]}%")).first()
    if fallback_b:
        return AssistantQueryResponse(
            answer=f"I found **{fallback_b.name}** matching your query. It is located at {fallback_b.latitude:.4f}, {fallback_b.longitude:.4f}.",
            intent="general_info",
            target_name=fallback_b.name,
            target_type="building",
            coordinates=[fallback_b.latitude, fallback_b.longitude],
            action=AssistantAction(type="view_building", target_id=fallback_b.id, coordinates=[fallback_b.latitude, fallback_b.longitude]),
            suggested_queries=suggested_queries
        )

    return AssistantQueryResponse(
        answer=f"I couldn't locate an exact match for '{raw_query}'. You can try searching by building name, department (CSE, Mechanical, Civil), facility (Library, Canteen, ATM), or asking 'Where is the Central Library?'.",
        intent="unknown",
        suggested_queries=suggested_queries
    )
