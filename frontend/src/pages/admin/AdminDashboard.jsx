import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  MapPin,
  Route,
  Layers,
  Users,
  FileCode,
  ArrowRight,
  TrendingUp,
  Activity,
  Plus
} from 'lucide-react';
import { campusService } from '../../services/campusService';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_buildings: 0,
    total_locations: 0,
    total_paths: 0,
    total_facilities: 0,
    total_nodes: 0,
    active_users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    campusService.getAdminStats()
      .then((data) => setStats(data))
      .catch((err) => console.error('Failed to load stats:', err))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Campus Buildings', value: stats.total_buildings, icon: Building2, color: 'text-blue-400', link: '/admin/buildings' },
    { label: 'Navigable Locations', value: stats.total_locations, icon: MapPin, color: 'text-teal-400', link: '/admin/locations' },
    { label: 'Pedestrian Walkway Paths', value: stats.total_paths, icon: Route, color: 'text-cyan-400', link: '/admin/paths' },
    { label: 'Campus Facilities', value: stats.total_facilities, icon: Layers, color: 'text-purple-400', link: '/admin/facilities' },
    { label: 'Wayfinding Junction Nodes', value: stats.total_nodes, icon: Activity, color: 'text-emerald-400', link: '/admin/paths' },
    { label: 'Active User Accounts', value: stats.active_users, icon: Users, color: 'text-amber-400', link: '/admin' },
  ];

  const adminSections = [
    {
      title: 'Building Management',
      desc: 'Add, update coordinates, manage polygon boundary vertices, floor levels, and department designations.',
      link: '/admin/buildings',
      icon: Building2,
      action: 'Manage Buildings'
    },
    {
      title: 'Location & Room Management',
      desc: 'Create and assign individual classrooms, lecture halls, computer laboratories, and faculty offices.',
      link: '/admin/locations',
      icon: MapPin,
      action: 'Manage Locations'
    },
    {
      title: 'Path & Node Network Management',
      desc: 'Define walkway graph edges, customize walking times, flag wheelchair accessibility, and manage stairs/ramps.',
      link: '/admin/paths',
      icon: Route,
      action: 'Manage Paths & Nodes'
    },
    {
      title: 'Facility Directory Management',
      desc: 'Configure student canteens, medical dispensaries, ATMs, sports grounds, and emergency assembly stations.',
      link: '/admin/facilities',
      icon: Layers,
      action: 'Manage Facilities'
    },
    {
      title: 'GeoJSON Data Import & Export',
      desc: 'Upload campus-level GeoJSON datasets, validate Polygon/LineString geometry features, and import wholesale.',
      link: '/admin/geojson',
      icon: FileCode,
      action: 'GeoJSON Manager'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" /> Administration & GIS Controls
          </div>
          <h1 className="text-3xl font-extrabold text-white font-['Outfit']">
            CampusNav Control Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Welcome, <b>{user?.username}</b>. Manage college GIS datasets, pedestrian pathfinding graphs, and building directories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/geojson"
            className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span>Import GeoJSON</span>
          </Link>
          <Link
            to="/admin/buildings"
            className="py-2.5 px-4 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-950 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Building</span>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link
              key={i}
              to={stat.link}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all hover:-translate-y-1 shadow-xl flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-white font-['Outfit']">
                  {loading ? '...' : stat.value}
                </div>
                <div className="text-[11px] text-slate-400 font-medium leading-tight mt-1">
                  {stat.label}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Admin Modules Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white font-['Outfit']">
          Campus GIS Administration Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((sec, i) => {
            const Icon = sec.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-xl flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-teal-400 border border-slate-700 mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    {sec.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {sec.desc}
                  </p>
                </div>

                <Link
                  to={sec.link}
                  className="inline-flex items-center justify-between py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors group"
                >
                  <span>{sec.action}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
