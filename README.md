# CampusNav – Smart GIS-Based College Campus Navigation System

CampusNav is an interactive, modern, production-grade campus navigation web application designed for students, faculty, visitors, and staff. It enables seamless discovery of campus buildings, departments, classrooms, research laboratories, and service facilities through interactive Leaflet maps, multi-floor indoor blueprints, turn-by-turn pedestrian pathfinding using the A* algorithm, emergency evacuation routing, and an administrative GIS control dashboard.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [Database Design](#database-design)
6. [Routing Algorithm & Graph Theory](#routing-algorithm--graph-theory)
7. [Installation & Setup](#installation--setup)
   - [Prerequisites](#prerequisites)
   - [Backend Setup (FastAPI)](#backend-setup-fastapi)
   - [Frontend Setup (React + Vite)](#frontend-setup-react--vite)
   - [PostgreSQL & PostGIS Setup](#postgresql--postgis-setup)
8. [Environment Variables](#environment-variables)
9. [GeoJSON Data Format](#geojson-data-format)
10. [How to Customize Campus Data](#how-to-customize-campus-data)
    - [How to Add a New Building](#how-to-add-a-new-building)
    - [How to Add a New Path](#how-to-add-a-new-path)
    - [How to Replace Demo Campus Data](#how-to-replace-demo-campus-data)
11. [REST API Documentation](#rest-api-documentation)
12. [Future Enhancements](#future-enhancements)

---

## 1. Project Overview

Navigating large higher-education campuses is notoriously challenging for incoming students, parents, visiting professors, and emergency first-responders. Traditional paper maps or external commercial mapping services often lack pedestrian walkway details, building entrance waypoints, accessibility indicators, and indoor floor directories.

CampusNav addresses this by implementing a **graph-based pedestrian navigation network** combined with **GeoJSON spatial layers**. It treats campus pathways as a mathematical graph $G = (V, E)$, enabling exact pedestrian shortest-path calculations, wheelchair-accessible pathfinding, emergency routing, and AI-powered natural language queries.

---

## 2. Features

- **Interactive Campus GIS Map (`/map`)**:
  - Full-screen Leaflet map with OpenStreetMap & CartoDB Dark GIS basemaps.
  - Custom SVG markers categorized by academic, department, lab, canteen, hostel, sports, medical, and emergency.
  - Interactive polygon building outlines with hover highlight and popup metadata.
  - Overlay of pedestrian walkway network paths.
  - Real-time GPS location tracking ("Use My Location" / "You Are Here").
  - Animated glowing route polyline.

- **A* Graph Pedestrian Routing Engine (`/routes`)**:
  - A* algorithm with Haversine distance heuristic.
  - Fallback Dijkstra algorithm for comparative graph benchmarking.
  - Turn-by-turn directional instructions (e.g., *"Walk towards Central Plaza South for 145m"*, *"Turn right at Central Avenue North"*).
  - Accurate distance calculation (meters) and estimated walking time (minutes).

- **Accessibility & Step-Free Navigation**:
  - Toggle **Wheelchair Accessible Route** mode.
  - Automatically filters out staircases, elevated ledges, and steep pathways.
  - Prioritizes paved ramps, corridors, and ground-level entrances.

- **Location & Department Directory (`/locations`)**:
  - Searchable catalog of campus buildings, faculties, and departments.
  - Instant filtering by category pills (Academic, Labs, Food, Hostels, Sports, etc.).

- **Multi-Floor Building Blueprints (`/buildings/:id`)**:
  - Floor-by-floor level tabs (Ground Floor, 1st Floor, 2nd Floor, 3rd Floor).
  - Room directory (classrooms, lecture halls, computer labs, faculty chambers).
  - Hosted departments and administrative divisions.

- **Campus Facilities Directory (`/facilities`)**:
  - Opening hours, contact extensions, building locations, and one-click navigation for canteens, stationery shops, ATMs, dispensaries, and student lounges.

- **Emergency Dispatch & Evacuation (`/emergency`)**:
  - Immediate calculation of the nearest emergency station (Health Center, Fire Safety, Security Post, Assembly Area, Campus Gates).
  - Direct hotlines for ambulance, 24/7 security control room, and fire response.

- **Campus AI Assistant (`/assistant`)**:
  - Natural language inquiry interface: *"Where is the library?"*, *"How do I reach CSE from Main Gate?"*, *"Find the nearest canteen"*.
  - Deterministic campus query engine with direct "Show Route on Map" actions.

- **Secure Administrator Portal (`/admin`)**:
  - Dashboard analytics (Buildings, Locations, Paths, Facilities, Nodes, Active Users).
  - Full CRUD operations for Buildings, Locations, Paths, and Facilities.
  - GeoJSON Manager: paste or upload campus `.geojson` files, validate topology, and import directly into the database.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 19 with Vite
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS with custom academic dark palette
- **Mapping & GIS**: Leaflet.js & React-Leaflet
- **HTTP Client**: Axios with JWT interceptors
- **Icons**: Lucide React
- **Typography**: Google Fonts (Outfit & Inter)

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Server**: Uvicorn ASGI
- **ORM**: SQLAlchemy 2.0+
- **Validation**: Pydantic v2 & Pydantic-Settings
- **Security & Auth**: Python-Jose (JWT HS256) & Passlib (Bcrypt)
- **Spatial Utilities**: Haversine distance, spherical bearing, and relative turn calculation

### Database
- **Primary / Production**: PostgreSQL with optional PostGIS spatial extension
- **Zero-Config Quick Start**: SQLite (auto-fallback if PostgreSQL is not specified)

---

## 4. System Architecture

```
                  ┌──────────────────────────────────────────┐
                  │          Browser Client (React)          │
                  │   Tailwind CSS  │  Leaflet GIS Maps      │
                  └────────────────────┬─────────────────────┘
                                       │ HTTP / REST (JWT)
                                       ▼
                  ┌──────────────────────────────────────────┐
                  │          FastAPI Backend Server          │
                  │                                          │
                  │  ┌───────────────┐     ┌──────────────┐  │
                  │  │ Auth & Admin  │     │ A* / Dijkstra│  │
                  │  │ API Endpoints │     │ Graph Engine │  │
                  │  └───────────────┘     └──────────────┘  │
                  │  ┌───────────────┐     ┌──────────────┐  │
                  │  │ AI Assistant  │     │ GIS GeoJSON  │  │
                  │  │ Query Service │     │ Importer     │  │
                  │  └───────────────┘     └──────────────┘  │
                  └────────────────────┬─────────────────────┘
                                       │ SQLAlchemy ORM
                                       ▼
                  ┌──────────────────────────────────────────┐
                  │    PostgreSQL (PostGIS) / SQLite DB      │
                  │  nodes, paths, buildings, rooms, users   │
                  └──────────────────────────────────────────┘
```

---

## 5. Database Design

### Key Tables & Schema

1. **`users`**:
   - `id` (VARCHAR PK)
   - `username` (VARCHAR UNIQUE)
   - `email` (VARCHAR UNIQUE)
   - `hashed_password` (VARCHAR)
   - `role` (`ADMIN`, `USER`)
   - `is_active` (BOOLEAN)

2. **`buildings`**:
   - `id` (VARCHAR PK)
   - `name` (VARCHAR), `code` (VARCHAR UNIQUE)
   - `category` (VARCHAR)
   - `latitude`, `longitude` (FLOAT)
   - `entrance_node_id` (VARCHAR FK -> `nodes.id`)
   - `floors_count` (INTEGER)
   - `departments` (JSON List)
   - `polygon` (JSON coordinates `[[lat, lng], ...]`)

3. **`floors`**:
   - `id` (VARCHAR PK)
   - `building_id` (FK -> `buildings.id`)
   - `floor_number` (INTEGER), `name` (VARCHAR)

4. **`rooms`**:
   - `id` (VARCHAR PK)
   - `building_id` (FK -> `buildings.id`), `floor_id` (FK -> `floors.id`)
   - `room_no` (VARCHAR), `name` (VARCHAR), `type` (VARCHAR)

5. **`facilities`**:
   - `id` (VARCHAR PK)
   - `name` (VARCHAR), `category` (VARCHAR)
   - `building_id` (FK -> `buildings.id`, nullable)
   - `latitude`, `longitude` (FLOAT)
   - `opening_hours` (VARCHAR), `contact` (VARCHAR)

6. **`nodes`** (Junctions, Gates, Entrances):
   - `id` (VARCHAR PK)
   - `name` (VARCHAR)
   - `latitude`, `longitude` (FLOAT)
   - `node_type` (`junction`, `building_entrance`, `gate`, `stairs`, `ramp`, `transit`)

7. **`paths`** (Pedestrian Edges):
   - `id` (VARCHAR PK)
   - `start_node_id` (FK -> `nodes.id`), `end_node_id` (FK -> `nodes.id`)
   - `distance` (FLOAT in meters)
   - `walking_time` (INTEGER in seconds)
   - `accessible` (BOOLEAN)
   - `path_type` (`walkway`, `ramp`, `stairs`, `corridor`)

---

## 6. Routing Algorithm & Graph Theory

### A* Pathfinding (`app/algorithms/a_star.py`)
The campus pedestrian network is modeled as an undirected weighted graph $G = (V, E)$.
For two nodes $u, v \in V$, the edge weight $w(u, v)$ is the physical walking distance in meters.

$$f(n) = g(n) + h(n)$$
- $g(n)$: Exact accumulated distance from the starting node to node $n$.
- $h(n)$: Admissible heuristic estimate from node $n$ to the target node, computed using the **Haversine Great-Circle Distance**:
$$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos \phi_1 \cos \phi_2 \sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$

### Turn-by-Turn Instruction Generator
Computes forward azimuth bearings between consecutive path segments:
$$\theta = \text{atan2}\left(\sin \Delta \lambda \cos \phi_2, \cos \phi_1 \sin \phi_2 - \sin \phi_1 \cos \phi_2 \cos \Delta \lambda\right)$$
Relative heading shifts generate intuitive human instructions:
- $|\Delta \theta| < 20^\circ \implies$ "Continue straight"
- $20^\circ \le \Delta \theta < 65^\circ \implies$ "Slight right turn"
- $65^\circ \le \Delta \theta < 120^\circ \implies$ "Turn right"
- Special node types trigger contextual prompts: *"Take the accessible ramp at North Quad"* or *"Take the stairs past West Corridor"*.

---

## 7. Installation & Setup

### Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: v18.0 or higher
- **npm** or **yarn**

### Quick Start (Local Development)

#### 1. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend server (auto-creates tables and seeds demo campus data)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API is now running at `http://127.0.0.1:8000`.
Interactive Swagger API documentation is available at `http://127.0.0.1:8000/docs`.

#### 2. Frontend Setup
In a new terminal:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

### PostgreSQL & PostGIS Setup (Optional Production Setup)

To use PostgreSQL instead of the default SQLite:

1. Create a PostgreSQL database and enable PostGIS:
```sql
CREATE DATABASE campusnav_db;
\c campusnav_db;
CREATE EXTENSION IF NOT EXISTS postgis;
```

2. Execute the included SQL schema:
```bash
psql -U postgres -d campusnav_db -f database/schema.sql
```

3. Update `.env` or set environment variable:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/campusnav_db"
```
FastAPI will automatically bind to PostgreSQL on launch.

---

## 8. Environment Variables

Create a `.env` file in the project root (reference `.env.example`):

```env
# Backend
PROJECT_NAME="CampusNav API"
API_V1_STR="/api"
PORT=8000
HOST="0.0.0.0"

# Database (Default uses local SQLite; replace with PostgreSQL URL when ready)
DATABASE_URL="sqlite:///./campusnav.db"

# JWT Authentication
SECRET_KEY="campusnav_super_secret_jwt_key_change_in_production_2026"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Default Seed Admin Credentials
DEFAULT_ADMIN_USERNAME="admin"
DEFAULT_ADMIN_EMAIL="admin@campusnav.edu"
DEFAULT_ADMIN_PASSWORD="admin123"

# Frontend
VITE_API_BASE_URL="http://localhost:8000/api"
VITE_CAMPUS_NAME="Apex Institute of Technology & Science"
VITE_CAMPUS_SHORT_NAME="AITS Campus"
```

---

## 9. GeoJSON Data Format

The campus map conforms to RFC 7946 GeoJSON. File located at: `data/campus.geojson`.

```json
{
  "type": "FeatureCollection",
  "campus_info": {
    "name": "Apex Institute of Technology & Science",
    "short_name": "AITS Campus",
    "center": { "latitude": 13.0105, "longitude": 80.2355 },
    "default_zoom": 17,
    "bounds": { "southWest": [13.0060, 80.2300], "northEast": [13.0160, 80.2420] }
  },
  "features": [
    {
      "type": "Feature",
      "id": "b-library",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[80.2365, 13.0100], [80.2372, 13.0100], [80.2372, 13.0110], [80.2365, 13.0110], [80.2365, 13.0100]]]
      },
      "properties": {
        "name": "Central Library",
        "code": "LIB",
        "category": "library",
        "floors_count": 3,
        "departments": ["Digital Archive", "Research Reading Hall"]
      }
    },
    {
      "type": "Feature",
      "id": "P-01",
      "geometry": {
        "type": "LineString",
        "coordinates": [[80.2355, 13.0070], [80.2355, 13.0075]]
      },
      "properties": {
        "start_node_id": "N-01",
        "end_node_id": "N-27",
        "distance": 60,
        "walking_time": 45,
        "accessible": true,
        "path_type": "walkway"
      }
    }
  ]
}
```

---

## 10. How to Customize Campus Data

### How to Add a New Building
1. **Via Admin Panel**:
   - Log in as Admin (`admin` / `admin123`) at `/login`.
   - Go to **Admin Control Center** &rarr; **Building Management** (`/admin/buildings`).
   - Click **Add New Building**, enter building code, name, category, latitude, longitude, and department names, then save.
2. **Via REST API**:
   - Send `POST /api/buildings` with bearer token:
   ```json
   {
     "name": "Biotechnology Research Center",
     "code": "BIO-01",
     "category": "laboratory",
     "latitude": 13.0140,
     "longitude": 80.2340,
     "floors_count": 3,
     "departments": ["Genomics Lab", "Bioinformatics Unit"]
   }
   ```

### How to Add a New Path
1. Go to **Admin Control Center** &rarr; **Walkway Network** (`/admin/paths`).
2. Click **Add Node** if creating a new junction waypoint.
3. Click **Add Path Edge**, select Start Node, End Node, distance (meters), walking time (seconds), and check **Wheelchair Accessible**.
4. The A* pathfinding graph will automatically re-index and utilize the new edge.

### How to Replace Demo Campus Data
1. Export your college's spatial data from QGIS, JOSM, or OpenStreetMap as a standard GeoJSON `FeatureCollection`.
2. Format features into:
   - `Polygon` for buildings
   - `LineString` for pedestrian pathways
   - `Point` for facilities or gates
3. In the Admin Dashboard, navigate to **GeoJSON Management** (`/admin/geojson`).
4. Click **Select .geojson File**, click **Validate Structure**, and then **Import Into Database**.
5. Your custom campus data will immediately populate the interactive map and routing engine.

---

## 11. REST API Documentation

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user or admin & return JWT | No |
| `GET` | `/api/auth/me` | Current authenticated user profile | Yes |
| `GET` | `/api/campus-info` | Campus metadata (center, bounds, zoom) | No |
| `GET` | `/api/categories` | Categories list with color tokens & icons | No |
| `GET` | `/api/geojson` | Complete campus GeoJSON FeatureCollection | No |
| `GET` | `/api/buildings` | List campus buildings (supports `?category=` and `?q=`) | No |
| `GET` | `/api/buildings/{id}` | Full building detail with floor plans & rooms | No |
| `POST` | `/api/buildings` | Create new building | Admin |
| `PUT` | `/api/buildings/{id}` | Update building details | Admin |
| `DELETE`| `/api/buildings/{id}` | Delete building | Admin |
| `GET` | `/api/locations` | Unified list of buildings, rooms, facilities | No |
| `GET` | `/api/facilities` | List campus facilities (canteens, ATMs, etc.) | No |
| `POST` | `/api/facilities` | Add new facility | Admin |
| `GET` | `/api/nodes` | List all graph junction waypoints | No |
| `POST` | `/api/nodes` | Create junction node | Admin |
| `GET` | `/api/paths` | List all graph pedestrian edges | No |
| `POST` | `/api/paths` | Add new path edge | Admin |
| `POST` | `/api/navigation/route` | Compute shortest route via A* / Dijkstra | No |
| `GET` | `/api/search?q={query}` | Global intelligent campus search | No |
| `GET` | `/api/emergency/nearest` | Find closest medical/security/gate facility | No |
| `POST` | `/api/assistant/query` | Natural language campus AI query | No |
| `GET` | `/api/admin/stats` | System counts & analytics | Admin |
| `POST` | `/api/admin/geojson/import`| Validate & import GeoJSON dataset | Admin |

---

## 12. Future Enhancements

- **3D Building Extrusions**: MapLibre / Three.js 3D volumetric building renders.
- **Indoor BLE Beacon Tracking**: Sub-meter indoor positioning via Bluetooth Low Energy beacons.
- **Live Campus Shuttle Tracking**: Real-time GPS bus feeds on the transit layer.
- **LLM Agent Integration**: Connect `app/routes/assistant.py` to Google Gemini API for complex contextual natural language Q&A.

---

### Project Credits
Developed as a production-grade University Engineering Project:
**"CampusNav – Smart GIS-Based College Campus Navigation System"**
Built with modern web standards, graph theory, and geospatial best practices.
