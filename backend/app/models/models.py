from datetime import datetime, timezone
import json
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(32), default="USER", nullable=False)  # 'ADMIN', 'USER'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

class Category(Base):
    __tablename__ = "categories"

    id = Column(String(64), primary_key=True)
    name = Column(String(100), nullable=False)
    icon = Column(String(64), default="Layers")
    color = Column(String(32), default="#0284c7")
    description = Column(Text, nullable=True)

class Node(Base):
    __tablename__ = "nodes"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    node_type = Column(String(64), default="junction")  # gate, building_entrance, junction, stairs, ramp, transit
    created_at = Column(DateTime(timezone=True), default=utc_now)

    outgoing_paths = relationship("Path", foreign_keys="Path.start_node_id", back_populates="start_node", cascade="all, delete-orphan")
    incoming_paths = relationship("Path", foreign_keys="Path.end_node_id", back_populates="end_node", cascade="all, delete-orphan")

class Path(Base):
    __tablename__ = "paths"

    id = Column(String(64), primary_key=True, index=True)
    start_node_id = Column(String(64), ForeignKey("nodes.id", ondelete="CASCADE"), nullable=False, index=True)
    end_node_id = Column(String(64), ForeignKey("nodes.id", ondelete="CASCADE"), nullable=False, index=True)
    distance = Column(Float, nullable=False)  # meters
    walking_time = Column(Integer, nullable=False)  # seconds
    accessible = Column(Boolean, default=True, index=True)
    path_type = Column(String(64), default="walkway")  # walkway, ramp, stairs, corridor, paved
    created_at = Column(DateTime(timezone=True), default=utc_now)

    start_node = relationship("Node", foreign_keys=[start_node_id], back_populates="outgoing_paths")
    end_node = relationship("Node", foreign_keys=[end_node_id], back_populates="incoming_paths")

class Building(Base):
    __tablename__ = "buildings"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    code = Column(String(32), unique=True, nullable=False, index=True)
    category = Column(String(64), nullable=False, index=True)
    description = Column(Text, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    entrance_node_id = Column(String(64), ForeignKey("nodes.id", ondelete="SET NULL"), nullable=True)
    floors_count = Column(Integer, default=1)
    departments = Column(JSON, default=list)  # list of strings
    polygon = Column(JSON, default=list)      # list of [lat, lng]
    geojson = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    entrance_node = relationship("Node", foreign_keys=[entrance_node_id])
    floors = relationship("Floor", back_populates="building", cascade="all, delete-orphan")
    rooms = relationship("Room", back_populates="building", cascade="all, delete-orphan")
    facilities = relationship("Facility", back_populates="building")

class Floor(Base):
    __tablename__ = "floors"

    id = Column(String(64), primary_key=True)
    building_id = Column(String(64), ForeignKey("buildings.id", ondelete="CASCADE"), nullable=False, index=True)
    floor_number = Column(Integer, nullable=False)
    name = Column(String(100), nullable=False)

    building = relationship("Building", back_populates="floors")
    rooms = relationship("Room", back_populates="floor", cascade="all, delete-orphan")

class Room(Base):
    __tablename__ = "rooms"

    id = Column(String(64), primary_key=True, index=True)
    building_id = Column(String(64), ForeignKey("buildings.id", ondelete="CASCADE"), nullable=False, index=True)
    floor_id = Column(String(64), ForeignKey("floors.id", ondelete="CASCADE"), nullable=True)
    room_no = Column(String(32), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    type = Column(String(64), default="Classroom")
    description = Column(Text, nullable=True)

    building = relationship("Building", back_populates="rooms")
    floor = relationship("Floor", back_populates="rooms")

class Facility(Base):
    __tablename__ = "facilities"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    category = Column(String(64), nullable=False, index=True)
    building_id = Column(String(64), ForeignKey("buildings.id", ondelete="SET NULL"), nullable=True, index=True)
    description = Column(Text, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    opening_hours = Column(String(100), nullable=True)
    contact = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    building = relationship("Building", back_populates="facilities")
