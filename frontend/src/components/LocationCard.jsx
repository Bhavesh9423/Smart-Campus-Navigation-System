import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Route,
  Info,
  Clock,
  Phone,
  Layers,
  MapPin,
  ExternalLink,
  X
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

export default function LocationCard({ location, onClose }) {
  const { navigateToLocation } = useNavigation();

  if (!location) return null;

  const isBuilding = !!location.floors_count || !!location.departments || !!location.code;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
              {location.category || 'Location'}
            </span>
            {location.code && (
              <span className="text-xs text-slate-400 font-mono">
                [{location.code}]
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-white font-['Outfit']">{location.name}</h3>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Description */}
      {location.description && (
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
          {location.description}
        </p>
      )}

      {/* Metadata grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {isBuilding && (
          <div className="p-2.5 rounded-xl bg-slate-950/30 border border-slate-800/60">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Floors</span>
            <span className="text-slate-200 font-medium">{location.floors_count || 1} Levels</span>
          </div>
        )}

        {location.building_name && (
          <div className="p-2.5 rounded-xl bg-slate-950/30 border border-slate-800/60">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Building</span>
            <span className="text-slate-200 font-medium truncate block">{location.building_name}</span>
          </div>
        )}

        {location.opening_hours && (
          <div className="p-2.5 rounded-xl bg-slate-950/30 border border-slate-800/60 col-span-2">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Hours</span>
            <span className="text-teal-300 font-medium flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              {location.opening_hours}
            </span>
          </div>
        )}

        {location.contact && (
          <div className="p-2.5 rounded-xl bg-slate-950/30 border border-slate-800/60 col-span-2">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Contact</span>
            <span className="text-slate-300 font-medium flex items-center gap-1.5 mt-0.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {location.contact}
            </span>
          </div>
        )}
      </div>

      {/* Departments if building */}
      {location.departments && location.departments.length > 0 && (
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1.5">
            Departments & Units
          </span>
          <div className="flex flex-wrap gap-1.5">
            {location.departments.map((dept, i) => (
              <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                {dept}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => navigateToLocation(location)}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-900/30 transition-all hover:scale-[1.02]"
        >
          <Route className="w-4 h-4" />
          <span>Navigate Here</span>
        </button>

        {isBuilding && location.id && (
          <Link
            to={`/buildings/${location.id}`}
            className="flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <span>View Details</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        )}
      </div>
    </div>
  );
}
