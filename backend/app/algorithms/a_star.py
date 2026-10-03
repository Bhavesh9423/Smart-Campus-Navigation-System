import heapq
import math
from typing import Dict, List, Tuple, Optional, Any
from app.utils.geo import haversine_distance, calculate_bearing, get_turn_direction

class CampusGraph:
    def __init__(self):
        # node_id -> dict of node properties (id, name, lat, lon, node_type)
        self.nodes: Dict[str, Dict[str, Any]] = {}
        # node_id -> list of outgoing edges: (neighbor_id, distance, walking_time, accessible, path_type, path_id)
        self.adj: Dict[str, List[Dict[str, Any]]] = {}

    def add_node(self, node_id: str, name: str, lat: float, lon: float, node_type: str = "junction"):
        self.nodes[node_id] = {
            "id": node_id,
            "name": name,
            "latitude": lat,
            "longitude": lon,
            "node_type": node_type
        }
        if node_id not in self.adj:
            self.adj[node_id] = []

    def add_edge(self, start_id: str, end_id: str, distance: float, walking_time: int, accessible: bool = True, path_type: str = "walkway", path_id: str = ""):
        if start_id not in self.adj:
            self.adj[start_id] = []
        if end_id not in self.adj:
            self.adj[end_id] = []

        edge = {
            "neighbor": end_id,
            "distance": float(distance),
            "walking_time": int(walking_time),
            "accessible": bool(accessible),
            "path_type": path_type,
            "path_id": path_id
        }
        self.adj[start_id].append(edge)

        # Campus walkways are bidirectional
        reverse_edge = {
            "neighbor": start_id,
            "distance": float(distance),
            "walking_time": int(walking_time),
            "accessible": bool(accessible),
            "path_type": path_type,
            "path_id": path_id
        }
        self.adj[end_id].append(reverse_edge)


def a_star_search(
    graph: CampusGraph,
    start_node_id: str,
    target_node_id: str,
    accessible_only: bool = False
) -> Tuple[Optional[List[str]], float, int, List[str]]:
    """
    A* algorithm implementation.
    Returns: (path_node_ids, total_distance_meters, total_walking_time_seconds, warnings)
    """
    warnings = []

    if start_node_id not in graph.nodes:
        return None, 0.0, 0, [f"Starting node '{start_node_id}' not found in campus network."]
    if target_node_id not in graph.nodes:
        return None, 0.0, 0, [f"Target node '{target_node_id}' not found in campus network."]

    if start_node_id == target_node_id:
        return [start_node_id], 0.0, 0, []

    target_lat = graph.nodes[target_node_id]["latitude"]
    target_lon = graph.nodes[target_node_id]["longitude"]

    def heuristic(node_id: str) -> float:
        n = graph.nodes[node_id]
        return haversine_distance(n["latitude"], n["longitude"], target_lat, target_lon)

    # Priority queue holds tuples: (f_score, current_g_score, current_node_id)
    open_set = []
    heapq.heappush(open_set, (heuristic(start_node_id), 0.0, start_node_id))

    came_from: Dict[str, str] = {}
    g_score: Dict[str, float] = {node_id: float('inf') for node_id in graph.nodes}
    g_score[start_node_id] = 0.0

    time_score: Dict[str, int] = {node_id: 0 for node_id in graph.nodes}

    closed_set = set()

    found = False

    while open_set:
        _, current_g, current = heapq.heappop(open_set)

        if current in closed_set:
            continue
        closed_set.add(current)

        if current == target_node_id:
            found = True
            break

        for edge in graph.adj.get(current, []):
            neighbor = edge["neighbor"]

            # Accessibility filtering
            if accessible_only:
                if not edge["accessible"] or edge["path_type"] in ["stairs", "restricted"]:
                    continue

            tentative_g = current_g + edge["distance"]

            if tentative_g < g_score.get(neighbor, float('inf')):
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                time_score[neighbor] = time_score[current] + edge["walking_time"]
                f = tentative_g + heuristic(neighbor)
                heapq.heappush(open_set, (f, tentative_g, neighbor))

    # If accessible route was requested but no path found, fallback to standard path with warning
    if not found and accessible_only:
        warnings.append("No 100% wheelchair-accessible path found without stairs. Showing standard route with warnings.")
        return a_star_search(graph, start_node_id, target_node_id, accessible_only=False)

    if not found:
        return None, 0.0, 0, ["No path exists between the selected campus locations."]

    # Reconstruct path
    path = []
    curr = target_node_id
    while curr in came_from:
        path.append(curr)
        curr = came_from[curr]
    path.append(start_node_id)
    path.reverse()

    total_dist = round(g_score[target_node_id], 1)
    total_time = time_score[target_node_id]

    return path, total_dist, total_time, warnings


def generate_turn_by_turn_instructions(
    graph: CampusGraph,
    path_nodes: List[str],
    start_label: str,
    dest_label: str
) -> Tuple[List[str], List[Dict[str, Any]]]:
    """
    Generates human-readable turn-by-turn navigation instructions.
    """
    if not path_nodes:
        return [], []

    if len(path_nodes) == 1:
        text = f"You are already at {dest_label}."
        return [text], [{"step": 1, "text": text, "distance": 0.0}]

    instructions_text = []
    detailed = []

    # Step 1: Start
    first_node = graph.nodes[path_nodes[0]]
    second_node = graph.nodes[path_nodes[1]]
    first_dist = haversine_distance(
        first_node["latitude"], first_node["longitude"],
        second_node["latitude"], second_node["longitude"]
    )
    first_bearing = calculate_bearing(
        first_node["latitude"], first_node["longitude"],
        second_node["latitude"], second_node["longitude"]
    )

    step_1 = f"Start at {start_label}. Walk towards {second_node['name']} for {int(round(first_dist))} m."
    instructions_text.append(step_1)
    detailed.append({
        "step": 1,
        "text": step_1,
        "distance": round(first_dist, 1),
        "node_id": path_nodes[0],
        "coordinates": [first_node["latitude"], first_node["longitude"]]
    })

    prev_bearing = first_bearing

    for i in range(1, len(path_nodes) - 1):
        curr_node = graph.nodes[path_nodes[i]]
        next_node = graph.nodes[path_nodes[i + 1]]

        segment_dist = haversine_distance(
            curr_node["latitude"], curr_node["longitude"],
            next_node["latitude"], next_node["longitude"]
        )
        curr_bearing = calculate_bearing(
            curr_node["latitude"], curr_node["longitude"],
            next_node["latitude"], next_node["longitude"]
        )

        turn = get_turn_direction(prev_bearing, curr_bearing)
        step_num = len(instructions_text) + 1

        if curr_node["node_type"] == "stairs":
            step_text = f"Take the stairs at {curr_node['name']} and continue for {int(round(segment_dist))} m."
        elif curr_node["node_type"] == "ramp":
            step_text = f"Proceed along the accessible ramp at {curr_node['name']} for {int(round(segment_dist))} m."
        elif "straight" in turn.lower():
            step_text = f"Continue straight past {curr_node['name']} for {int(round(segment_dist))} m."
        else:
            step_text = f"{turn} at {curr_node['name']}, then walk {int(round(segment_dist))} m towards {next_node['name']}."

        instructions_text.append(step_text)
        detailed.append({
            "step": step_num,
            "text": step_text,
            "distance": round(segment_dist, 1),
            "node_id": path_nodes[i],
            "coordinates": [curr_node["latitude"], curr_node["longitude"]]
        })

        prev_bearing = curr_bearing

    # Final arrival step
    last_node = graph.nodes[path_nodes[-1]]
    final_step = f"You have arrived at your destination: {dest_label}."
    instructions_text.append(final_step)
    detailed.append({
        "step": len(instructions_text),
        "text": final_step,
        "distance": 0.0,
        "node_id": path_nodes[-1],
        "coordinates": [last_node["latitude"], last_node["longitude"]]
    })

    return instructions_text, detailed
