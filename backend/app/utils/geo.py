import math
from typing import List, Tuple, Dict, Any, Optional

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance in meters between two points
    on the earth (specified in decimal degrees)
    """
    R = 6371000.0  # Earth's radius in meters

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    return R * c

def calculate_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates initial compass bearing from point 1 to point 2 in degrees [0, 360).
    """
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_lambda = math.radians(lon2 - lon1)

    y = math.sin(delta_lambda) * math.cos(phi2)
    x = math.cos(phi1) * math.sin(phi2) - math.sin(phi1) * math.cos(phi2) * math.cos(delta_lambda)

    bearing = math.degrees(math.atan2(y, x))
    return (bearing + 360.0) % 360.0

def get_turn_direction(bearing1: float, bearing2: float) -> str:
    """
    Given the bearing of the previous step and current step, determine relative turn.
    """
    diff = (bearing2 - bearing1 + 360) % 360

    if diff > 180:
        diff -= 360

    if abs(diff) < 20:
        return "Continue straight"
    elif 20 <= diff < 65:
        return "Slight right turn"
    elif 65 <= diff < 120:
        return "Turn right"
    elif 120 <= diff < 165:
        return "Sharp right turn"
    elif -65 < diff <= -20:
        return "Slight left turn"
    elif -120 < diff <= -65:
        return "Turn left"
    elif -165 < diff <= -120:
        return "Sharp left turn"
    else:
        return "Make a U-turn"

def find_nearest_node(lat: float, lon: float, nodes: List[Dict[str, Any]]) -> Tuple[Optional[str], float]:
    """
    Finds the closest node to the given coordinates.
    """
    if not nodes:
        return None, float('inf')

    closest_node = None
    min_dist = float('inf')

    for node in nodes:
        d = haversine_distance(lat, lon, node["latitude"], node["longitude"])
        if d < min_dist:
            min_dist = d
            closest_node = node["id"]

    return closest_node, min_dist
