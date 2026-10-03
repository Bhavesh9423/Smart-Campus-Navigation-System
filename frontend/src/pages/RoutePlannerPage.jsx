import React, { useState, useEffect } from 'react';
import {
  Route,
  ArrowUpDown,
  Navigation,
  Accessibility,
  Footprints,
  Clock,
  Compass,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import CampusMap from '../components/CampusMap';
import RouteInstructions from '../components/RouteInstructions';
import { useNavigation } from '../context/NavigationContext';
import { campusService } from '../services/campusService';

export default function RoutePlannerPage() {
  const {
    startLocation,
    setStartLocation,
    destination,
    setDestination,
    activeRoute,
    isAccessible,
    setIsAccessible,
    routingAlgorithm,
    setRoutingAlgorithm,
    calculateRoute,
    swapLocations,
    clearRoute,
    userLocation,
    requestUserLocation,
    isCalculatingRoute
  } = useNavigation();

  const [buildings, setBuildings] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [paths, setPaths] = useState([]);
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    Promise.all([
      campusService.getBuildings(),
      campusService.getFacilities(),
      campusService.getPaths(),
      campusService.getNodes(),
    ]).then(([b, f, p, n]) => {
      setBuildings(b || []);
      setFacilities(f || []);
      setPaths(p || []);
      setNodes(n || []);
    });
  }, []);

  // Quick Preset Routes
  const presets = [
    { startId: 'b-gate-main', destId: 'b-library', label: 'Main Gate → Central Library' },
    { startId: 'b-gate-main', destId: 'b-cse', label: 'Main Gate → Computer Engg Dept' },
    { startId: 'b-canteen', destId: 'b-academic-b', label: 'Canteen → Academic Block B' },
    { startId: 'b-hostel-boys', destId: 'b-sports', label: 'Boys Hostel → Sports Ground' },
  ];

  const handleApplyPreset = (preset) => {
    const s = buildings.find(b => b.id === preset.startId) || facilities.find(f => f.id === preset.startId);
    const d = buildings.find(b => b.id === preset.destId) || facilities.find(f => f.id === preset.destId);
    if (s && d) {
      const startObj = { id: s.id, name: s.name, coords: [s.latitude, s.longitude] };
      const destObj = { id: d.id, name: d.name, coords: [d.latitude, d.longitude] };
      setStartLocation(startObj);
      setDestination(destObj);
      calculateRoute(startObj, destObj, isAccessible, routingAlgorithm);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Route className="w-4 h-4" /> Graph-Based Campus Pathfinding
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
          Dedicated Campus Route Planner
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl mt-1">
          Compute optimal pedestrian journeys using A* heuristic pathfinding with step-free wheelchair routing options.
        </p>
      </div>

      {/* Preset Quick Route Chips */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Popular Campus Routes:
        </span>
        <div className="flex flex-wrap gap-2">
          {presets.map((pr, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(pr)}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-teal-400 border border-slate-800 hover:border-slate-700 transition-all font-medium"
            >
              {pr.label}
            </button>
          ))}
        </div>
      </div>

      {/* Planner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Controls Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                <Navigation className="w-4 h-4 text-teal-400" />
                Select Route Waypoints
              </h2>
              <button
                onClick={swapLocations}
                className="p-1.5 text-slate-400 hover:text-teal-400 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
                title="Reverse Directions"
              >
                <ArrowUpDown className="w-4 h-4" />
                <span className="hidden sm:inline">Swap</span>
              </button>
            </div>

            {/* Starting Location */}
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase block mb-1.5">
                FROM: (Starting Location)
              </label>
              <select
                value={startLocation?.id || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'USER_LOCATION' && userLocation) {
                    setStartLocation({ id: 'USER_LOC', name: 'My Current Location (GPS)', coords: userLocation });
                  } else {
                    const item = buildings.find(x => x.id === val) || facilities.find(x => x.id === val);
                    if (item) setStartLocation({ id: item.id, name: item.name, coords: [item.latitude, item.longitude] });
                  }
                }}
                className="w-full py-2.5 px-3.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-teal-500 focus:outline-none"
              >
                <option value="">[ Select starting location ]</option>
                {userLocation && (
                  <option value="USER_LOCATION">📍 Use My Current Location (GPS)</option>
                )}
                <optgroup label="Campus Gates & Centers">
                  {buildings.filter(b => b.category === 'emergency' || b.code.includes('GATE')).map(b => (
                    <option key={`start-${b.id}`} value={b.id}>{b.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Academic Buildings">
                  {buildings.filter(b => b.category !== 'emergency' && !b.code.includes('GATE')).map(b => (
                    <option key={`start-${b.id}`} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </optgroup>
                <optgroup label="Facilities & Services">
                  {facilities.map(f => (
                    <option key={`start-fac-${f.id}`} value={f.id}>{f.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Destination */}
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase block mb-1.5">
                TO: (Destination)
              </label>
              <select
                value={destination?.id || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  const item = buildings.find(x => x.id === val) || facilities.find(x => x.id === val);
                  if (item) setDestination({ id: item.id, name: item.name, coords: [item.latitude, item.longitude] });
                }}
                className="w-full py-2.5 px-3.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-teal-500 focus:outline-none"
              >
                <option value="">[ Select destination ]</option>
                <optgroup label="Academic Buildings">
                  {buildings.map(b => (
                    <option key={`dest-${b.id}`} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </optgroup>
                <optgroup label="Facilities & Services">
                  {facilities.map(f => (
                    <option key={`dest-fac-${f.id}`} value={f.id}>{f.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Routing Preferences */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Routing Options
              </span>

              {/* Accessible Route Toggle */}
              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={isAccessible}
                  onChange={(e) => {
                    setIsAccessible(e.target.checked);
                    if (activeRoute) calculateRoute(startLocation, destination, e.target.checked, routingAlgorithm);
                  }}
                  className="rounded border-slate-700 text-teal-500 focus:ring-teal-500 w-4 h-4 bg-slate-900"
                />
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Accessibility className="w-4 h-4 text-blue-400" />
                    Wheelchair Accessible Route
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Avoids stairs & elevated ledges; prefers ramps & elevators.
                  </span>
                </div>
              </label>

              {/* Algorithm Option */}
              <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-300 font-medium">Pathfinding Algorithm</span>
                <select
                  value={routingAlgorithm}
                  onChange={(e) => {
                    setRoutingAlgorithm(e.target.value);
                    if (activeRoute) calculateRoute(startLocation, destination, isAccessible, e.target.value);
                  }}
                  className="py-1 px-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                >
                  <option value="a_star">A* (Heuristic Shortest)</option>
                  <option value="dijkstra">Dijkstra (Reference)</option>
                </select>
              </div>
            </div>

            {/* Calculate Button */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => calculateRoute()}
                disabled={isCalculatingRoute || !startLocation || !destination}
                className="flex-1 py-3 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-xl shadow-teal-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Route className="w-4 h-4" />
                <span>{isCalculatingRoute ? 'Calculating Shortest Path...' : 'Find Route'}</span>
              </button>

              {activeRoute && (
                <button
                  onClick={clearRoute}
                  className="py-3 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Turn-by-Turn Instruction Output */}
          {activeRoute && (
            <RouteInstructions route={activeRoute} />
          )}
        </div>

        {/* Map Visualization Preview */}
        <div className="lg:col-span-7 h-[650px] rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
          <CampusMap
            buildings={buildings}
            facilities={facilities}
            paths={paths}
            nodes={nodes}
            height="100%"
          />
        </div>
      </div>
    </div>
  );
}
