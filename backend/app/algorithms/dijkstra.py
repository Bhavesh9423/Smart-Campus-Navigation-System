import heapq
from typing import Dict, List, Tuple, Optional
from app.algorithms.a_star import CampusGraph

def dijkstra_search(
    graph: CampusGraph,
    start_node_id: str,
    target_node_id: str,
    accessible_only: bool = False
) -> Tuple[Optional[List[str]], float, int]:
    """
    Dijkstra shortest path algorithm as a reference and fallback implementation.
    """
    if start_node_id not in graph.nodes or target_node_id not in graph.nodes:
        return None, 0.0, 0

    if start_node_id == target_node_id:
        return [start_node_id], 0.0, 0

    distances: Dict[str, float] = {node_id: float('inf') for node_id in graph.nodes}
    times: Dict[str, int] = {node_id: 0 for node_id in graph.nodes}
    previous: Dict[str, str] = {}

    distances[start_node_id] = 0.0
    pq = [(0.0, start_node_id)]

    visited = set()

    while pq:
        current_dist, current_node = heapq.heappop(pq)

        if current_node in visited:
            continue
        visited.add(current_node)

        if current_node == target_node_id:
            break

        for edge in graph.adj.get(current_node, []):
            neighbor = edge["neighbor"]

            if accessible_only:
                if not edge["accessible"] or edge["path_type"] in ["stairs", "restricted"]:
                    continue

            dist = current_dist + edge["distance"]
            if dist < distances.get(neighbor, float('inf')):
                distances[neighbor] = dist
                times[neighbor] = times[current_node] + edge["walking_time"]
                previous[neighbor] = current_node
                heapq.heappush(pq, (dist, neighbor))

    if distances[target_node_id] == float('inf'):
        return None, 0.0, 0

    path = []
    curr = target_node_id
    while curr in previous:
        path.append(curr)
        curr = previous[curr]
    path.append(start_node_id)
    path.reverse()

    return path, round(distances[target_node_id], 1), times[target_node_id]
