import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  Route,
  MapPin,
  Filter,
  ExternalLink,
  Layers
} from 'lucide-react';
import { campusService } from '../services/campusService';
import { useNavigation } from '../context/NavigationContext';

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  const { navigateToLocation, setSelectedLocation, setMapCenter } = useNavigation();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      campusService.getLocations(),
      campusService.getCategories(),
    ])
      .then(([locs, cats]) => {
        setLocations(locs || []);
        setCategories(cats || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = locations.filter((item) => {
    const matchesCat = selectedCat === 'all' || item.category.toLowerCase() === selectedCat.toLowerCase();
    const matchesSearch = !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.building_name && item.building_name.toLowerCase().includes(search.toLowerCase())) ||
      (item.room_no && item.room_no.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleViewOnMap = (loc) => {
    setSelectedLocation(loc);
    setMapCenter([loc.latitude, loc.longitude]);
    navigate('/map');
  };

  const handleNavigate = (loc) => {
    navigateToLocation(loc);
    navigate('/map');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Building2 className="w-4 h-4" /> Campus Directory
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
          Campus Locations & Departments
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl mt-1">
          Browse all buildings, academic wings, specialized laboratories, lecture halls, and administrative offices across campus.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by building name, department, or room number..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-teal-500 text-sm text-white placeholder-slate-500 shadow-inner focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCat === 'all'
                ? 'bg-teal-500 text-slate-950 border-teal-400 font-bold'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            All Locations ({locations.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                selectedCat === c.id
                  ? 'bg-teal-500 text-slate-950 border-teal-400 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }}></span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Locations */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-44 rounded-2xl bg-slate-900 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-800 rounded-3xl p-8 space-y-3">
          <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Locations Found</h3>
          <p className="text-xs text-slate-400">Try adjusting your search terms or selecting another category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {filtered.map((loc) => (
            <div
              key={`${loc.type}-${loc.id}`}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all hover:-translate-y-1 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    {loc.category}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase font-mono font-bold">
                    {loc.type}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white font-['Outfit'] mb-1">
                  {loc.name}
                </h3>
                {loc.building_name && (
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{loc.building_name}</span>
                    {loc.room_no && <span className="font-mono text-teal-400">• Room {loc.room_no}</span>}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-800/80 mt-3">
                <button
                  onClick={() => handleNavigate(loc)}
                  className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Route className="w-3.5 h-3.5" />
                  <span>Navigate</span>
                </button>
                <button
                  onClick={() => handleViewOnMap(loc)}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                  <span>Map</span>
                </button>
                {loc.type === 'building' && (
                  <button
                    onClick={() => navigate(`/buildings/${loc.id}`)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
                    title="View Building Detail"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
