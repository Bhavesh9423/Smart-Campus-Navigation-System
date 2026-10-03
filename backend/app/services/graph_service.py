import math
from typing import Optional, Tuple, Dict, Any, List
from sqlalchemy.orm import Session
from app.models.models import Node, Path, Building, Facility
from app.algorithms.a_star import CampusGraph, a_star_search, generate_turn_by_turn_instructions
from app.algorithms.dijkstra import dijkstra_search
from app.utils.geo import haversine_distance, find_nearest_node

class CampusNavigationService:
    def __init__(self):
        self.graph: Optional[CampusGraph] = None

    def load_graph(self, db: Session) -> CampusGraph:
        """
        Loads all nodes and paths from the database into the CampusGraph instance.
        """
        graph = CampusGraph()

        db_nodes = db.query(Node).all()
        for n in db_nodes:
            graph.add_node(
                node_id=n.id,
                name=n.name,
                lat=n.latitude,
                lon=n.longitude,
                node_type=n.node_type
            )

        db_paths = db.query(Path).all()
        for p in db_paths:
            graph.add_edge(
                start_id=p.start_node_id,
                end_id=p.end_node_id,
                distance=p.distance,
                walking_time=p.walking_time,
                accessible=p.accessible,
                path_type=p.path_type,
                path_id=p.id
            )

        self.graph = graph
        return self.graph

    def get_graph(self, db: Session) -> CampusGraph:
        if self.graph is None:
            self.load_graph(db)
        return self.graph

    def resolve_location_node(
        self,
        identifier: str,
        coords: Optional[List[float]],
        db: Session
    ) -> Tuple[Optional[str], str, List[float]]:
        """
        Resolves an input identifier or coords to:
        (node_id, human_readable_name, [lat, lng])
        """
        # 1. If explicit coordinates are provided
        if coords and len(coords) == 2:
            lat, lng = coords[0], coords[1]
            nodes_list = list(self.get_graph(db).nodes.values())
            nearest_id, _ = find_nearest_node(lat, lng, nodes_list)
            return nearest_id, "Current Location", [lat, lng]

        # 2. Check if identifier is string coordinate "lat,lng"
        if identifier and "," in identifier:
            try:
                parts = [float(x.strip()) for x in identifier.split(",")]
                if len(parts) == 2:
                    lat, lng = parts[0], parts[1]
                    nodes_list = list(self.get_graph(db).nodes.values())
                    nearest_id, _ = find_nearest_node(lat, lng, nodes_list)
                    return nearest_id, f"Location ({lat:.4f}, {lng:.4f})", [lat, lng]
            except ValueError:
                pass

        # 3. Direct Node Match
        node = db.query(Node).filter(Node.id == identifier).first()
        if node:
            return node.id, node.name, [node.latitude, node.longitude]

        # 4. Building Match
        b = db.query(Building).filter((Building.id == identifier) | (Building.code == identifier) | (Building.name == identifier)).first()
        if b:
            if b.entrance_node_id and b.entrance_node_id in self.get_graph(db).nodes:
                return b.entrance_node_id, b.name, [b.latitude, b.longitude]
            # If no explicit entrance node, find nearest node to building lat/lon
            nodes_list = list(self.get_graph(db).nodes.values())
            nearest_id, _ = find_nearest_node(b.latitude, b.longitude, nodes_list)
            return nearest_id, b.name, [b.latitude, b.longitude]

        # 5. Facility Match
        fac = db.query(Facility).filter((Facility.id == identifier) | (Facility.name == identifier)).first()
        if fac:
            nodes_list = list(self.get_graph(db).nodes.values())
            nearest_id, _ = find_nearest_node(fac.latitude, fac.longitude, nodes_list)
            return nearest_id, fac.name, [fac.latitude, fac.longitude]

        # 6. Fallback: Search building or node by partial name match
        b_partial = db.query(Building).filter(Building.name.ilike(f"%{identifier}%")).first()
        if b_partial:
            if b_partial.entrance_node_id:
                return b_partial.entrance_node_id, b_partial.name, [b_partial.latitude, b_partial.longitude]
            nodes_list = list(self.get_graph(db).nodes.values())
            nearest_id, _ = find_nearest_node(b_partial.latitude, b_partial.longitude, nodes_list)
            return nearest_id, b_partial.name, [b_partial.latitude, b_partial.longitude]

        n_partial = db.query(Node).filter(Node.name.ilike(f"%{identifier}%")).first()
        if n_partial:
            return n_partial.id, n_partial.name, [n_partial.latitude, n_partial.longitude]

        return None, identifier, []

    def calculate_route(
        self,
        db: Session,
        start: str,
        destination: str,
        accessible: bool = False,
        start_coords: Optional[List[float]] = None,
        dest_coords: Optional[List[float]] = None,
        use_dijkstra: bool = False
    ) -> Dict[str, Any]:
        """
        Executes routing between start and destination using A* or Dijkstra.
        """
        graph = self.get_graph(db)

        start_node_id, start_name, s_coords = self.resolve_location_node(start, start_coords, db)
        dest_node_id, dest_name, d_coords = self.resolve_location_node(destination, dest_coords, db)

        if not start_node_id:
            raise ValueError(f"Could not resolve starting location: '{start}'")
        if not dest_node_id:
            raise ValueError(f"Could not resolve destination location: '{destination}'")

        warnings = []
        if use_dijkstra:
            path_nodes, dist, time_sec = dijkstra_search(graph, start_node_id, dest_node_id, accessible_only=accessible)
            algo_name = "Dijkstra"
        else:
            path_nodes, dist, time_sec, algo_warnings = a_star_search(graph, start_node_id, dest_node_id, accessible_only=accessible)
            warnings.extend(algo_warnings)
            algo_name = "A*"

        if not path_nodes:
            raise ValueError("No path could be found between the specified points.")

        # Build coordinate list for Leaflet Polyline
        route_coords = []
        for nid in path_nodes:
            if nid in graph.nodes:
                n = graph.nodes[nid]
                route_coords.append([n["latitude"], n["longitude"]])

        # Turn by turn instructions
        instructions_text, detailed_instructions = generate_turn_by_turn_instructions(
            graph=graph,
            path_nodes=path_nodes,
            start_label=start_name,
            dest_label=dest_name
        )

        estimated_minutes = max(1, math.ceil(time_sec / 60))

        return {
            "distance": round(dist, 1),
            "estimated_time": estimated_minutes,
            "estimated_seconds": time_sec,
            "accessible_route": accessible,
            "route_node_ids": path_nodes,
            "route_coordinates": route_coords,
            "instructions": instructions_text,
            "detailed_instructions": detailed_instructions,
            "start_name": start_name,
            "destination_name": dest_name,
            "algorithm": algo_name,
            "warnings": warnings
        }

navigation_service = CampusNavigationService()
