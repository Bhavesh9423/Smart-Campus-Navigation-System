-- ============================================================================
-- CampusNav – Smart College Campus Navigation System
-- Database Schema for PostgreSQL with Optional PostGIS Spatial Extensions
-- ============================================================================

-- Enable PostGIS extension if available (optional for enhanced spatial indexing)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- ----------------------------------------------------------------------------
-- 1. USERS & AUTHENTICATION
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'USER', -- 'ADMIN', 'USER', 'STAFF'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ----------------------------------------------------------------------------
-- 2. CATEGORIES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(64) NOT NULL DEFAULT 'Layers',
    color VARCHAR(32) NOT NULL DEFAULT '#0284c7',
    description TEXT
);

-- ----------------------------------------------------------------------------
-- 3. NODES (Campus Junctions, Gates, Entrances)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nodes (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    node_type VARCHAR(64) NOT NULL DEFAULT 'junction', -- 'gate', 'building_entrance', 'junction', 'stairs', 'ramp', 'transit'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_nodes_coords ON nodes(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_nodes_type ON nodes(node_type);

-- ----------------------------------------------------------------------------
-- 4. PATHS (Walkways, Ramps, Stairs, Corridors)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS paths (
    id VARCHAR(64) PRIMARY KEY,
    start_node_id VARCHAR(64) NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    end_node_id VARCHAR(64) NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    distance DOUBLE PRECISION NOT NULL, -- meters
    walking_time INTEGER NOT NULL,      -- seconds
    accessible BOOLEAN NOT NULL DEFAULT TRUE,
    path_type VARCHAR(64) NOT NULL DEFAULT 'walkway', -- 'walkway', 'ramp', 'stairs', 'corridor', 'paved'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_paths_start ON paths(start_node_id);
CREATE INDEX IF NOT EXISTS idx_paths_end ON paths(end_node_id);
CREATE INDEX IF NOT EXISTS idx_paths_accessible ON paths(accessible);

-- ----------------------------------------------------------------------------
-- 5. BUILDINGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS buildings (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(32) NOT NULL UNIQUE,
    category VARCHAR(64) NOT NULL,
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    entrance_node_id VARCHAR(64) REFERENCES nodes(id) ON DELETE SET NULL,
    floors_count INTEGER NOT NULL DEFAULT 1,
    departments JSONB DEFAULT '[]'::jsonb,
    polygon JSONB DEFAULT '[]'::jsonb,
    geojson JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_buildings_category ON buildings(category);
CREATE INDEX IF NOT EXISTS idx_buildings_coords ON buildings(latitude, longitude);

-- ----------------------------------------------------------------------------
-- 6. FLOORS & ROOMS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS floors (
    id VARCHAR(64) PRIMARY KEY,
    building_id VARCHAR(64) NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    floor_number INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_floors_building ON floors(building_id);

CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(64) PRIMARY KEY,
    building_id VARCHAR(64) NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    floor_id VARCHAR(64) REFERENCES floors(id) ON DELETE CASCADE,
    room_no VARCHAR(32) NOT NULL,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(64) NOT NULL DEFAULT 'Classroom', -- 'Lab', 'Classroom', 'Office', 'Seminar Hall', etc.
    description TEXT
);

CREATE INDEX IF NOT EXISTS idx_rooms_building ON rooms(building_id);
CREATE INDEX IF NOT EXISTS idx_rooms_no ON rooms(room_no);

-- ----------------------------------------------------------------------------
-- 7. FACILITIES & AMENITIES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS facilities (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(64) NOT NULL,
    building_id VARCHAR(64) REFERENCES buildings(id) ON DELETE SET NULL,
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    opening_hours VARCHAR(100),
    contact VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_facilities_category ON facilities(category);
CREATE INDEX IF NOT EXISTS idx_facilities_building ON facilities(building_id);
CREATE INDEX IF NOT EXISTS idx_facilities_coords ON facilities(latitude, longitude);

-- ----------------------------------------------------------------------------
-- 8. DEFAULT SEED ADMIN USER
-- Password hash for 'admin123' (bcrypt)
-- ----------------------------------------------------------------------------
INSERT INTO users (id, username, email, hashed_password, role)
VALUES (
    'usr-admin-01',
    'admin',
    'admin@campusnav.edu',
    '$2b$12$K1vGjXGgZq0WwK5c6e8NteXJzG1x6QpZ/FwKj7oR0o3s8pC/iBq0K',
    'ADMIN'
) ON CONFLICT (username) DO NOTHING;
