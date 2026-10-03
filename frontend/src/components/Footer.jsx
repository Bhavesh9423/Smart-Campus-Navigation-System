import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Shield, MapPin, Heart, Code, Mail, Phone, ExternalLink } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

export default function Footer() {
  const { campusInfo } = useNavigation();

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold font-['Outfit'] text-white">CampusNav</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              State-of-the-art GIS pedestrian navigation system for college campuses. Built with A* routing, interactive GeoJSON layers, and real-time accessibility intelligence.
            </p>
            <div className="text-xs text-teal-400/90 font-medium">
              {campusInfo?.name || 'Apex Institute of Technology & Science'}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Navigation</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/map" className="hover:text-teal-400 transition-colors">Interactive Campus Map</Link>
              </li>
              <li>
                <Link to="/routes" className="hover:text-teal-400 transition-colors">A* Route Planner</Link>
              </li>
              <li>
                <Link to="/locations" className="hover:text-teal-400 transition-colors">Buildings & Departments</Link>
              </li>
              <li>
                <Link to="/facilities" className="hover:text-teal-400 transition-colors">Campus Facilities Directory</Link>
              </li>
              <li>
                <Link to="/assistant" className="hover:text-teal-400 transition-colors">Campus AI Navigator</Link>
              </li>
            </ul>
          </div>

          {/* Emergency & Safety */}
          <div>
            <h3 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Emergency Contacts
            </h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-rose-400" />
                <span>Campus Medical: <b>ext 8100 / 108</b></span>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Security Control: <b>ext 8000 / 100</b></span>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Visitor Information: <b>ext 8001</b></span>
              </li>
              <li className="pt-1">
                <Link to="/emergency" className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 underline font-medium">
                  Find Nearest Emergency Shelter &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Technology & Administration */}
          <div>
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">System Details</h3>
            <p className="text-xs text-slate-400 mb-3">
              Engineered with FastAPI, React 19, Leaflet GIS, PostGIS/SQLite, and A* Shortest-Path Graph Theory.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                to="/admin"
                className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-amber-400 transition-colors"
              >
                <span>Campus Administrator Portal</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-teal-400 transition-colors"
              >
                <span>Staff & Student Sign In</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} CampusNav GIS. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            <span>Designed for University Campus Wayfinding</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
