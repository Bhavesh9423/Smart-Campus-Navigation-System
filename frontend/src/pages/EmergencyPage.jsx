import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Cross,
  Phone,
  Route,
  MapPin,
  Flame,
  AlertTriangle,
  Compass,
  Footprints,
  Clock
} from 'lucide-react';
import { campusService } from '../services/campusService';
import { useNavigation } from '../context/NavigationContext';

export default function EmergencyPage() {
  const { userLocation, requestUserLocation, navigateToLocation, setSelectedLocation, setMapCenter } = useNavigation();
  const navigate = useNavigate();

  const [emergencyFacilities, setEmergencyFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState(null); // 'medical', 'security', 'gate'

  const emergencyContacts = [
    { title: 'Campus Health Center & Ambulance', number: '+91 44 2257 8100', ext: '108', color: 'text-rose-400' },
    { title: 'Security Control Room (24/7)', number: '+91 44 2257 8000', ext: '100', color: 'text-amber-400' },
    { title: 'Fire Safety & Disaster Response', number: '+91 44 2257 8009', ext: '101', color: 'text-orange-400' },
    { title: 'Women Safety Helpline', number: '+91 44 2257 8090', ext: '1091', color: 'text-pink-400' }
  ];

  const fetchEmergencyFacilities = () => {
    setLoading(true);
    const lat = userLocation ? userLocation[0] : 13.0105;
    const lng = userLocation ? userLocation[1] : 80.2355;

    campusService.getNearestEmergency(lat, lng, filterType)
      .then((res) => setEmergencyFacilities(res || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEmergencyFacilities();
  }, [userLocation, filterType]);

  const handleRouteToFacility = (fac) => {
    navigateToLocation(fac);
    navigate('/map');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner Alert */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 border border-rose-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Campus Safety & Rapid Evacuation Protocol</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
              Emergency Response & First-Aid Locator
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Instantly locate and navigate to the closest medical dispensaries, security guard cabins, fire assembly points, and exit gates on campus.
            </p>
          </div>

          <button
            onClick={() => {
              requestUserLocation();
              fetchEmergencyFacilities();
            }}
            className="py-3 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-950 flex items-center justify-center gap-2.5 transition-all hover:scale-105 shrink-0"
          >
            <Compass className="w-5 h-5" />
            <span>Find Nearest Emergency Shelter</span>
          </button>
        </div>
      </div>

      {/* Emergency Hotlines Cards */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Phone className="w-4 h-4 text-rose-400" /> Urgent Campus Helplines
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {emergencyContacts.map((contact, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-1"
            >
              <span className="text-[11px] text-slate-400 block font-medium">{contact.title}</span>
              <div className={`text-base font-extrabold ${contact.color} font-mono`}>
                {contact.number}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Internal Intercom: ext {contact.ext}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Type Filter Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Nearest Emergency Facilities
            {userLocation ? ' (Relative to Your GPS)' : ' (Relative to Campus Center)'}
          </h2>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterType(null)}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all border ${
              filterType === null
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            All Emergency Points
          </button>
          <button
            onClick={() => setFilterType('medical')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all border ${
              filterType === 'medical'
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Medical & First-Aid Center
          </button>
          <button
            onClick={() => setFilterType('security')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all border ${
              filterType === 'security'
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Security & Police Cabin
          </button>
          <button
            onClick={() => setFilterType('gate')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all border ${
              filterType === 'gate'
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Evacuation Gates & Assembly
          </button>
        </div>

        {/* Results List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 rounded-2xl bg-slate-900 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : emergencyFacilities.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 text-xs">
            No emergency stations matching this category filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergencyFacilities.map((item, idx) => {
              const fac = item.facility;
              return (
                <div
                  key={fac.id || idx}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 transition-all shadow-xl flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {fac.category}
                        </span>
                        {fac.building_name && (
                          <span className="text-[11px] text-slate-400">
                            in {fac.building_name}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white font-['Outfit']">
                        {fac.name}
                      </h3>
                      {fac.description && (
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {fac.description}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-sm font-extrabold text-teal-400 font-mono">
                        <Footprints className="w-4 h-4 text-teal-400" />
                        <span>{item.distance_meters} m</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-cyan-400 font-medium mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>~{item.estimated_walking_min} min</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                    <span className="text-slate-400 font-mono">
                      📞 {fac.contact || 'Ext 8100'}
                    </span>
                    <button
                      onClick={() => handleRouteToFacility(fac)}
                      className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-rose-950"
                    >
                      <Route className="w-3.5 h-3.5" />
                      <span>Start Route Navigation</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
