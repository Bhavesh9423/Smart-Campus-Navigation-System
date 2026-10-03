import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Plus,
  Trash2,
  ArrowLeft,
  Building2,
  Search
} from 'lucide-react';
import { campusService } from '../../services/campusService';
import { useNavigation } from '../../context/NavigationContext';

export default function AdminLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const { showToast } = useNavigation();

  const loadData = () => {
    setLoading(true);
    campusService.getLocations()
      .then((locs) => setLocations(locs || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = locations.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    (l.building_name && l.building_name.toLowerCase().includes(search.toLowerCase())) ||
    (l.category && l.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-teal-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Control Center</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-['Outfit'] flex items-center gap-2">
            <MapPin className="w-6 h-6 text-teal-400" />
            Location & Room Registry
          </h1>
          <p className="text-xs text-slate-400">
            View all navigable rooms, laboratory halls, and facilities across the campus network.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter locations by name or building..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
      </div>

      {/* Locations Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-800">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Location Name</th>
                <th className="py-3 px-4">Building</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Coordinates</th>
                <th className="py-3 px-4 text-right">Entrance Node</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map((loc) => (
                <tr key={`${loc.type}-${loc.id}`} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-teal-400 border border-slate-700">
                      {loc.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">{loc.name}</td>
                  <td className="py-3 px-4 text-slate-400">{loc.building_name || 'Campus Wide'}</td>
                  <td className="py-3 px-4 capitalize">{loc.category}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                    {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-teal-400 font-bold">
                    {loc.node_id || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
