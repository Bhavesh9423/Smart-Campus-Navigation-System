import React, { useEffect, useState, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  Polyline,
  CircleMarker,
  useMap,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import {
  Compass,
  Navigation,
  Layers,
  MapPin,
  Flag,
  Crosshair,
  Route as RouteIcon,
  Maximize2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

// Helper component to smoothly fly/pan to mapCenter
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      map.flyTo(center, zoom || map.getZoom(), {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [center, zoom, map]);
  return null;
}

// Category styling metadata
const CATEGORY_COLORS = {
  academic: '#2563eb',       // Blue
  department: '#0284c7',     // Sky
  laboratory: '#059669',     // Emerald
  library: '#7c3aed',        // Purple
  food: '#ea580c',           // Orange
  hostel: '#db2777',         // Pink
  parking: '#4b5563',        // Slate
  medical: '#dc2626',        // Red
  sports: '#16a34a',         // Green
  administration: '#4f46e5', // Indigo
  facility: '#0d9488',       // Teal
  emergency: '#e11d48',      // Rose
};

// Create custom SVG DivIcon
function createCustomMarkerIcon(category = 'facility', isSelected = false, label = '') {
  const color = CATEGORY_COLORS[category.toLowerCase()] || '#0d9488';
  const size = isSelected ? 38 : 32;

  const html = `
    <div style="
      position: relative;
      width: ${size}px;
      height: ${size}px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    ">
      <div style="
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: ${color};
        opacity: ${isSelected ? '0.35' : '0.2'};
        animation: ${isSelected ? 'user-pulse 1.5s infinite' : 'none'};
      "></div>
      <div style="
        width: ${size - 8}px;
        height: ${size - 8}px;
        background: ${color};
        border: 2px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 11px;
        font-weight: 700;
        transition: transform 0.2s ease;
      ">
        ${label ? label.slice(0, 2).toUpperCase() : '•'}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
}

// Start Pin Icon
const startIcon = L.divIcon({
  html: `
    <div style="
      background: #10b981;
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 6px 12px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="transform: rotate(45deg); color: white; font-weight: 900; font-size: 10px;">A</div>
    </div>
  `,
  className: 'route-pin-start',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Destination Pin Icon
const destIcon = L.divIcon({
  html: `
    <div style="
      background: #ef4444;
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 6px 12px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="transform: rotate(45deg); color: white; font-weight: 900; font-size: 10px;">B</div>
    </div>
  `,
  className: 'route-pin-dest',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

export default function CampusMap({
  buildings = [],
  facilities = [],
  paths = [],
  nodes = [],
  onSelectLocation,
  showControls = true,
  height = '100%',
  className = ''
}) {
  const {
    campusInfo,
    mapCenter,
    mapZoom,
    setMapCenter,
    setMapZoom,
    userLocation,
    activeRoute,
    startLocation,
    destination,
    selectedLocation,
    navigateToLocation,
    requestUserLocation,
    clearRoute
  } = useNavigation();

  // Map layer visibility toggles
  const [showWalkways, setShowWalkways] = useState(true);
  const [showBuildingPolygons, setShowBuildingPolygons] = useState(true);
  const [showFacilityMarkers, setShowFacilityMarkers] = useState(true);
  const [tileTheme, setTileTheme] = useState('dark'); // 'dark' | 'standard'

  const cartoApiKey = import.meta.env.VITE_CARTO_API_KEY || '';
  const tileUrls = {
    dark: cartoApiKey 
      ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?api_key=${cartoApiKey}`
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  };

  const defaultCenter = [
    campusInfo?.center?.latitude || 13.0105,
    campusInfo?.center?.longitude || 80.2355
  ];

  // Build node lookup map for walkway paths
  const nodesMap = useMemo(() => {
    const map = {};
    nodes.forEach(n => { map[n.id] = n; });
    return map;
  }, [nodes]);

  // Format paths into polyline coordinate sets
  const pathPolylines = useMemo(() => {
    return paths.map(p => {
      const s = nodesMap[p.start_node_id];
      const e = nodesMap[p.end_node_id];
      if (s && e) {
        return {
          id: p.id,
          coords: [[s.latitude, s.longitude], [e.latitude, e.longitude]],
          accessible: p.accessible,
          path_type: p.path_type
        };
      }
      return null;
    }).filter(Boolean);
  }, [paths, nodesMap]);

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl border border-slate-800 shadow-2xl bg-slate-950 ${className}`} style={{ height }}>
      <MapContainer
        center={defaultCenter}
        zoom={mapZoom}
        zoomControl={false}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <MapController center={mapCenter} zoom={mapZoom} />

        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
          url={tileUrls[tileTheme]}
          className={tileTheme === 'dark' && !cartoApiKey ? 'dark-gis-tiles' : ''}
          maxZoom={20}
        />

        {/* Walkway Paths Layer */}
        {showWalkways && pathPolylines.map((path) => (
          <Polyline
            key={path.id}
            positions={path.coords}
            pathOptions={{
              color: path.accessible ? '#38bdf8' : '#f59e0b',
              weight: path.path_type === 'stairs' ? 2 : 3,
              dashArray: path.path_type === 'stairs' ? '4, 4' : '3, 6',
              opacity: 0.35,
            }}
          />
        ))}

        {/* Building Polygons Layer */}
        {showBuildingPolygons && buildings.map((b) => {
          if (!b.polygon || b.polygon.length < 3) return null;
          const isSelected = selectedLocation?.id === b.id;
          const color = CATEGORY_COLORS[b.category] || '#0284c7';

          return (
            <Polygon
              key={`poly-${b.id}`}
              positions={b.polygon}
              pathOptions={{
                color: isSelected ? '#38bdf8' : color,
                fillColor: color,
                fillOpacity: isSelected ? 0.45 : 0.22,
                weight: isSelected ? 3 : 1.5,
              }}
              eventHandlers={{
                click: () => {
                  if (onSelectLocation) onSelectLocation(b);
                }
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: `${color}30`, color }}>
                      {b.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">[{b.code}]</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{b.name}</h4>
                  <p className="text-xs text-slate-300 line-clamp-2 mb-2.5">{b.description}</p>
                  <button
                    onClick={() => navigateToLocation(b)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white transition-colors"
                  >
                    <RouteIcon className="w-3.5 h-3.5" />
                    <span>Navigate Here</span>
                  </button>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* Building Markers */}
        {buildings.map((b) => {
          const isSelected = selectedLocation?.id === b.id;
          return (
            <Marker
              key={`b-marker-${b.id}`}
              position={[b.latitude, b.longitude]}
              icon={createCustomMarkerIcon(b.category, isSelected, b.code)}
              eventHandlers={{
                click: () => {
                  if (onSelectLocation) onSelectLocation(b);
                }
              }}
            >
              <Popup>
                <div className="p-2 min-w-[210px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                      {b.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{b.code}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{b.name}</h4>
                  <p className="text-xs text-slate-300 mb-2">{b.description}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigateToLocation(b)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white"
                    >
                      <RouteIcon className="w-3.5 h-3.5" />
                      <span>Directions</span>
                    </button>
                    <a
                      href={`/buildings/${b.id}`}
                      className="py-1.5 px-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                    >
                      Floors
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Facility Markers */}
        {showFacilityMarkers && facilities.map((fac) => {
          const isSelected = selectedLocation?.id === fac.id;
          return (
            <Marker
              key={`fac-marker-${fac.id}`}
              position={[fac.latitude, fac.longitude]}
              icon={createCustomMarkerIcon(fac.category, isSelected, fac.name)}
              eventHandlers={{
                click: () => {
                  if (onSelectLocation) onSelectLocation(fac);
                }
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 mb-1 inline-block">
                    {fac.category}
                  </span>
                  <h4 className="text-sm font-bold text-white mb-1">{fac.name}</h4>
                  <p className="text-xs text-slate-300 mb-1">{fac.description}</p>
                  {fac.opening_hours && (
                    <p className="text-[11px] text-teal-400 mb-2 font-mono">🕒 {fac.opening_hours}</p>
                  )}
                  <button
                    onClick={() => navigateToLocation(fac)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white transition-colors"
                  >
                    <RouteIcon className="w-3.5 h-3.5" />
                    <span>Navigate Here</span>
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* User Geolocation Marker */}
        {userLocation && (
          <CircleMarker
            center={userLocation}
            radius={9}
            pathOptions={{
              color: '#ffffff',
              fillColor: '#0ea5e9',
              fillOpacity: 1,
              weight: 3,
              className: 'user-location-marker'
            }}
          >
            <Popup>
              <div className="p-1 text-center">
                <span className="text-xs font-bold text-cyan-400">📍 You Are Here</span>
                <p className="text-[11px] text-slate-300">Live Browser GPS Position</p>
              </div>
            </Popup>
          </CircleMarker>
        )}

        {/* Active Route Polylines */}
        {activeRoute && activeRoute.route_coordinates && activeRoute.route_coordinates.length > 1 && (
          <>
            {/* Outer Glow / Halo */}
            <Polyline
              positions={activeRoute.route_coordinates}
              pathOptions={{
                color: activeRoute.accessible_route ? '#059669' : '#0ea5e9',
                weight: 10,
                opacity: 0.35,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
            {/* Core Animated Path */}
            <Polyline
              positions={activeRoute.route_coordinates}
              pathOptions={{
                color: activeRoute.accessible_route ? '#10b981' : '#38bdf8',
                weight: 5,
                opacity: 0.95,
                className: 'animated-route-line',
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
            {/* Start Pin */}
            <Marker
              position={activeRoute.route_coordinates[0]}
              icon={startIcon}
            >
              <Popup>
                <div className="p-1 text-xs font-bold text-emerald-400">
                  Origin: {activeRoute.start_name}
                </div>
              </Popup>
            </Marker>
            {/* Destination Pin */}
            <Marker
              position={activeRoute.route_coordinates[activeRoute.route_coordinates.length - 1]}
              icon={destIcon}
            >
              <Popup>
                <div className="p-1 text-xs font-bold text-rose-400">
                  Destination: {activeRoute.destination_name}
                </div>
              </Popup>
            </Marker>
          </>
        )}
      </MapContainer>

      {/* Floating Map Controls & Overlays */}
      {showControls && (
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          {/* Tile Theme Switcher */}
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 shadow-xl flex items-center gap-1">
            <button
              onClick={() => setTileTheme(tileTheme === 'dark' ? 'standard' : 'dark')}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Toggle Map Style"
            >
              <Layers className="w-4 h-4 text-teal-400" />
              <span className="hidden sm:inline">{tileTheme === 'dark' ? 'Dark GIS' : 'Street'}</span>
            </button>
          </div>

          {/* Quick GPS Geolocation Button */}
          <button
            onClick={requestUserLocation}
            className="p-2.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 hover:border-cyan-500 rounded-xl shadow-xl text-slate-300 hover:text-cyan-400 transition-all flex items-center justify-center group"
            title="Use My Location"
          >
            <Crosshair className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
          </button>

          {/* Recenter Campus */}
          <button
            onClick={() => {
              setMapCenter(defaultCenter);
              setMapZoom(campusInfo?.default_zoom || 17);
            }}
            className="p-2.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 hover:border-teal-500 rounded-xl shadow-xl text-slate-300 hover:text-teal-400 transition-all flex items-center justify-center group"
            title="Reset Campus View"
          >
            <Compass className="w-5 h-5 text-teal-400 group-hover:rotate-45 transition-transform" />
          </button>

          {/* Clear Route if active */}
          {activeRoute && (
            <button
              onClick={clearRoute}
              className="p-2.5 bg-rose-950/80 backdrop-blur-md border border-rose-800/80 hover:border-rose-500 rounded-xl shadow-xl text-rose-300 hover:text-rose-200 transition-all flex items-center justify-center"
              title="Clear Active Route"
            >
              <RouteIcon className="w-5 h-5 text-rose-400" />
            </button>
          )}
        </div>
      )}

      {/* Floating Bottom Map Legend */}
      <div className="absolute bottom-3 left-3 z-20 hidden md:flex items-center gap-3 px-3 py-1.5 bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-xl shadow-lg text-[11px] text-slate-400">
        <span className="font-semibold text-slate-200">Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span>Academic</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
          <span>Library</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
          <span>Food</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Labs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          <span>Medical/Emergency</span>
        </div>
        <div className="flex items-center gap-1.5 border-l border-slate-700 pl-2">
          <span className="w-3 h-0.5 bg-sky-400 border-dashed"></span>
          <span>Pedestrian Walkways</span>
        </div>
      </div>
    </div>
  );
}
