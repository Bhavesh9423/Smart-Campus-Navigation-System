import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Route,
  ArrowUpDown,
  Navigation,
  Accessibility,
  Layers,
  X,
  Compass,
  Crosshair,
  Filter,
  Check
} from 'lucide-react';
import CampusMap from '../components/CampusMap';
import LocationCard from '../components/LocationCard';
import RouteInstructions from '../components/RouteInstructions';
import { useNavigation } from '../context/NavigationContext';
import { campusService } from '../services/campusService';

export default function MapPage() {
  const {
    campusInfo,
    startLocation,
    setStartLocation,
    destination,
    setDestination,
    activeRoute,
    isAccessible,
    setIsAccessible,
    routingAlgorithm,
    setRoutingAlgorithm,
    selectedLocation,
    setSelectedLocation,
    calculateRoute,
    swapLocations,
    clearRoute,
    requestUserLocation,
    userLocation,
    isCalculatingRoute
  } = useNavigation();

  // Campus Data State
  const [buildings, setBuildings] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [paths, setPaths] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [categories, setCategories] = useState([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Mobile drawer state
  const [mobileTab, setMobileTab] = useState('map'); // 'map' | 'route' | 'details'

  // Load campus elements
  useEffect(() => {
    Promise.all([
      campusService.getBuildings(),
      campusService.getFacilities(),
      campusService.getPaths(),
      campusService.getNodes(),
      campusService.getCategories(),
    ])
      .then(([bData, fData, pData, nData, cData]) => {
        setBuildings(bData || []);
        setFacilities(fData || []);
        setPaths(pData || []);
        setNodes(nData || []);
        setCategories(cData || []);
      })
      .catch((err) => console.error('Failed to load campus map elements:', err));
  }, []);

  // Handle Search Input with Debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      const lat = userLocation ? userLocation[0] : null;
      const lng = userLocation ? userLocation[1] : null;

      campusService.searchCampus(searchQuery, lat, lng)
        .then((res) => {
          setSearchResults(res || []);
          setShowSearchDropdown(true);
        })
        .catch(() => setSearchResults([]))
        .finally(() => setIsSearching(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, userLocation]);

  // Filtered lists based on category
  const filteredBuildings = selectedCategory === 'all'
    ? buildings
    : buildings.filter(b => b.category.toLowerCase() === selectedCategory.toLowerCase());

  const filteredFacilities = selectedCategory === 'all'
    ? facilities
    : facilities.filter(f => f.category.toLowerCase() === selectedCategory.toLowerCase());

  // Select Search Item
  const handleSelectSearchResult = (item) => {
    setSelectedLocation(item);
    setShowSearchDropdown(false);
    setSearchQuery(item.name);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-950">
      {/* Mobile Mode Switcher Tabs */}
      <div className="lg:hidden flex items-center border-b border-slate-800 bg-slate-900 text-xs">
        <button
          onClick={() => setMobileTab('map')}
          className={`flex-1 py-3 text-center font-bold border-b-2 ${mobileTab === 'map' ? 'text-teal-400 border-teal-400 bg-slate-800/40' : 'text-slate-400 border-transparent'}`}
        >
          Interactive Map
        </button>
        <button
          onClick={() => setMobileTab('route')}
          className={`flex-1 py-3 text-center font-bold border-b-2 ${mobileTab === 'route' ? 'text-teal-400 border-teal-400 bg-slate-800/40' : 'text-slate-400 border-transparent'}`}
        >
          Route Navigation {activeRoute && '•'}
        </button>
        <button
          onClick={() => setMobileTab('details')}
          className={`flex-1 py-3 text-center font-bold border-b-2 ${mobileTab === 'details' ? 'text-teal-400 border-teal-400 bg-slate-800/40' : 'text-slate-400 border-transparent'}`}
        >
          Location Details
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT SIDEBAR: Search, Route Form & Category Filters */}
        <aside
          className={`lg:col-span-4 xl:col-span-3 bg-slate-900 border-r border-slate-800 overflow-y-auto p-4 space-y-5 z-10 ${
            mobileTab === 'route' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Intelligent Search Input */}
          <div className="relative">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Search Campus
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchResults.length > 0) setShowSearchDropdown(true); }}
                placeholder="Search Computer Dept, Library, Canteen..."
                className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 focus:border-teal-500 focus:outline-none text-xs text-white placeholder-slate-500 shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-30 max-h-60 overflow-y-auto divide-y divide-slate-800/60">
                {searchResults.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full text-left p-3 hover:bg-slate-800/80 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-white">{item.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {item.building_name || item.category}
                        {item.room_no && ` • Room ${item.room_no}`}
                      </div>
                    </div>
                    {item.distance_meters !== null && item.distance_meters !== undefined && (
                      <span className="text-[10px] text-teal-400 font-mono">
                        {item.distance_meters}m
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dedicated Route Planner Box */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <Route className="w-4 h-4" /> Route Planner
              </span>
              <button
                onClick={swapLocations}
                className="p-1 text-slate-400 hover:text-teal-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Swap Start and Destination"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>

            {/* Starting Location Field */}
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">
                From (Origin)
              </span>
              <select
                value={startLocation?.id || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'USER_LOCATION' && userLocation) {
                    setStartLocation({ id: 'USER_LOC', name: 'My Current Location', coords: userLocation });
                  } else {
                    const b = buildings.find(x => x.id === val);
                    const f = facilities.find(x => x.id === val);
                    const item = b || f;
                    if (item) {
                      setStartLocation({ id: item.id, name: item.name, coords: [item.latitude, item.longitude] });
                    }
                  }
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-teal-500 focus:outline-none"
              >
                <option value="">-- Select starting point --</option>
                {userLocation && (
                  <option value="USER_LOCATION">📍 My Current Location (GPS)</option>
                )}
                <optgroup label="Campus Gates & Landmarks">
                  {buildings.filter(b => b.category === 'emergency' || b.code.includes('GATE')).map(b => (
                    <option key={`start-${b.id}`} value={b.id}>{b.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Academic Buildings">
                  {buildings.filter(b => b.category !== 'emergency' && !b.code.includes('GATE')).map(b => (
                    <option key={`start-${b.id}`} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </optgroup>
                <optgroup label="Facilities">
                  {facilities.map(f => (
                    <option key={`start-fac-${f.id}`} value={f.id}>{f.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Destination Field */}
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">
                To (Destination)
              </span>
              <select
                value={destination?.id || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  const b = buildings.find(x => x.id === val);
                  const f = facilities.find(x => x.id === val);
                  const item = b || f;
                  if (item) {
                    setDestination({ id: item.id, name: item.name, coords: [item.latitude, item.longitude] });
                    setSelectedLocation(item);
                  }
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-teal-500 focus:outline-none"
              >
                <option value="">-- Select destination --</option>
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

            {/* Accessibility Toggle */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={isAccessible}
                  onChange={(e) => setIsAccessible(e.target.checked)}
                  className="rounded border-slate-700 text-teal-500 focus:ring-teal-500 w-4 h-4 bg-slate-900"
                />
                <span className="flex items-center gap-1">
                  <Accessibility className="w-3.5 h-3.5 text-blue-400" />
                  Wheelchair Accessible
                </span>
              </label>

              <button
                onClick={requestUserLocation}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                title="Use GPS"
              >
                <Crosshair className="w-3 h-3" />
                <span>My GPS</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => calculateRoute()}
                disabled={isCalculatingRoute || !startLocation || !destination}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg shadow-teal-950 flex items-center justify-center gap-2 transition-all"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{isCalculatingRoute ? 'Calculating...' : 'Find Route'}</span>
              </button>

              {activeRoute && (
                <button
                  onClick={clearRoute}
                  className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-teal-400" /> Filter Map Layers
              </span>
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="text-[11px] text-teal-400 hover:underline"
                >
                  Show All
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-teal-500 text-slate-950 font-bold border-teal-400 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                All ({buildings.length + facilities.length})
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all flex items-center gap-1 ${
                    selectedCategory === cat.id
                      ? 'bg-teal-500 text-slate-950 font-bold border-teal-400 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* CENTER: Main Interactive Campus Map */}
        <main
          className={`lg:col-span-5 xl:col-span-6 relative h-full flex flex-col ${
            mobileTab === 'map' ? 'block' : 'hidden lg:block'
          }`}
        >
          <CampusMap
            buildings={filteredBuildings}
            facilities={filteredFacilities}
            paths={paths}
            nodes={nodes}
            onSelectLocation={(loc) => setSelectedLocation(loc)}
            height="100%"
          />
        </main>

        {/* RIGHT PANEL: Selected Location & Route Guidance */}
        <section
          className={`lg:col-span-3 xl:col-span-3 bg-slate-900 border-l border-slate-800 overflow-y-auto p-4 space-y-4 ${
            mobileTab === 'details' ? 'block' : 'hidden lg:block'
          }`}
        >
          {activeRoute && (
            <RouteInstructions route={activeRoute} />
          )}

          {selectedLocation ? (
            <LocationCard
              location={selectedLocation}
              onClose={() => setSelectedLocation(null)}
            />
          ) : !activeRoute ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 space-y-3">
              <Compass className="w-10 h-10 text-slate-600" />
              <div>
                <p className="text-sm font-semibold text-slate-300">No Location Selected</p>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Click on any building or facility marker on the campus map to inspect its floors, departments, and directions.
                </p>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
