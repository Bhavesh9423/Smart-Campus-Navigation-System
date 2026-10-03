import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Layers,
  Route,
  MapPin,
  ArrowLeft,
  BookOpen,
  FlaskConical,
  DoorOpen,
  Users,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { campusService } from '../services/campusService';
import { useNavigation } from '../context/NavigationContext';

export default function BuildingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { navigateToLocation, setSelectedLocation, setMapCenter } = useNavigation();

  const [building, setBuilding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFloorIndex, setActiveFloorIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    campusService.getBuildingDetail(id)
      .then((data) => {
        setBuilding(data);
        setActiveFloorIndex(0);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-slate-400">Loading building architectural blueprint...</p>
      </div>
    );
  }

  if (!building) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-white font-['Outfit']">Building Not Found</h2>
        <p className="text-xs text-slate-400">The requested campus structure could not be identified in the database.</p>
        <Link to="/locations" className="inline-block py-2 px-4 rounded-xl bg-teal-600 text-white text-xs font-semibold">
          Return to Directory
        </Link>
      </div>
    );
  }

  const floors = building.floors || [];
  const currentFloor = floors[activeFloorIndex] || { rooms: [] };

  const handleNavigate = () => {
    navigateToLocation(building);
    navigate('/map');
  };

  const handleShowOnMap = () => {
    setSelectedLocation(building);
    setMapCenter([building.latitude, building.longitude]);
    navigate('/map');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/locations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-teal-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Locations</span>
        </Link>
      </div>

      {/* Building Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-slate-700/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-slate-700/20 pointer-events-none">
          <Building2 className="w-48 h-48" />
        </div>

        <div className="relative space-y-4 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
              {building.category}
            </span>
            <span className="text-xs font-mono text-slate-400 font-bold bg-slate-800 px-2 py-0.5 rounded">
              Code: {building.code}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
            {building.name}
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            {building.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={handleNavigate}
              className="py-2.5 px-5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-950 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Route className="w-4 h-4" />
              <span>Navigate to Building Entrance</span>
            </button>
            <button
              onClick={handleShowOnMap}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors"
            >
              <MapPin className="w-4 h-4 text-teal-400" />
              <span>Locate on Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Departments Hosted */}
      {building.departments && building.departments.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-400" />
            Departments & Administrative Divisions Housed Here
          </h3>
          <div className="flex flex-wrap gap-2">
            {building.departments.map((dept, i) => (
              <span
                key={i}
                className="py-1.5 px-3 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 text-xs font-medium flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                <span>{dept}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Floor by Floor Explorer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-400" />
            Floor-by-Floor Directory ({floors.length || 1} Levels)
          </h2>
        </div>

        {/* Floor Tabs */}
        {floors.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
              {floors.map((floor, idx) => (
                <button
                  key={floor.id || idx}
                  onClick={() => setActiveFloorIndex(idx)}
                  className={`py-2.5 px-5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${
                    activeFloorIndex === idx
                      ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <DoorOpen className="w-4 h-4" />
                  <span>{floor.name} (L{floor.floor_number})</span>
                </button>
              ))}
            </div>

            {/* Current Floor Rooms List */}
            <div>
              <h3 className="text-sm font-bold text-white mb-3">
                Rooms on {currentFloor.name} ({currentFloor.rooms?.length || 0} Rooms / Laboratories)
              </h3>

              {currentFloor.rooms && currentFloor.rooms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentFloor.rooms.map((room) => {
                    const isLab = room.type.toLowerCase().includes('lab');
                    return (
                      <div
                        key={room.id}
                        className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                            Room {room.room_no}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            {room.type}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-white">{room.name}</h4>
                        {room.description && (
                          <p className="text-xs text-slate-400">{room.description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                  No registered room details logged for this level.
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 p-6 bg-slate-900/60 rounded-xl border border-slate-800">
            This building has single-level open floor layout.
          </p>
        )}
      </div>
    </div>
  );
}
