import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Route,
  Navigation,
  ShieldAlert,
  Accessibility,
  Building,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Search,
  Zap,
  Globe
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

export default function LandingPage() {
  const { campusInfo } = useNavigation();

  const features = [
    {
      icon: Route,
      title: 'A* Graph Pedestrian Routing',
      description: 'Calculates the true shortest walking paths across campus walkways, junctions, and building entrances with turn-by-turn guidance.',
      color: 'from-teal-500 to-emerald-600'
    },
    {
      icon: Accessibility,
      title: 'Accessible & Step-Free Navigation',
      description: 'Dedicated routing engine avoids stairways and steep corridors, prioritizing elevators, paved ramps, and wheelchair-friendly pathways.',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Search,
      title: 'Intelligent Location Search',
      description: 'Find any department, lecture hall, research laboratory, canteen, ATM, or parking lot instantly with smart keyword matching.',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      icon: Building,
      title: 'Multi-Floor Building Blueprints',
      description: 'Explore campus structures level-by-level from ground floor to upper research labs, complete with room directory listings.',
      color: 'from-amber-500 to-orange-600'
    },
    {
      icon: ShieldAlert,
      title: 'Immediate Emergency Routing',
      description: 'One-tap dispatch to the closest medical center, security post, first-aid station, or campus evacuation assembly point.',
      color: 'from-rose-500 to-red-600'
    },
    {
      icon: Sparkles,
      title: 'Campus AI Navigator',
      description: 'Ask natural language questions like "Where is the library?" or "How do I reach CSE from Main Gate?" for immediate smart responses.',
      color: 'from-cyan-500 to-teal-600'
    }
  ];

  const benefits = [
    'Save valuable transit time between consecutive lectures and lab sessions',
    'Prevent new students and campus visitors from getting disoriented',
    'Full accessibility support with step-free wheelchair routing filters',
    'Rapid evacuation and emergency response waypoint positioning',
    'Modular GeoJSON data architecture customizable for any university',
    'Operates smoothly on desktop, tablet, and mobile smartphone browsers'
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 border-b border-slate-800">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-teal-500/15 via-cyan-500/10 to-indigo-600/15 blur-3xl -z-10 rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading and CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-400 text-xs font-semibold uppercase tracking-wider">
                <Compass className="w-4 h-4" />
                <span>Smart GIS Campus Navigation System</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-['Outfit'] text-white leading-tight">
                Navigate Your Campus <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">Smarter.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Seamlessly discover buildings, departments, classrooms, research laboratories, and student facilities with real-time graph routing, step-by-step pedestrian navigation, and multi-floor building directories.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/map"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white shadow-xl shadow-teal-500/25 transition-all hover:scale-105"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Explore Campus Map</span>
                </Link>

                <Link
                  to="/routes"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all hover:scale-105"
                >
                  <Route className="w-4 h-4 text-teal-400" />
                  <span>Find a Route</span>
                </Link>
              </div>

              {/* Institution Tag */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-3 text-xs text-slate-400">
                <Globe className="w-4 h-4 text-teal-400" />
                <span>Configured for <b>{campusInfo?.name || 'Apex Institute of Technology & Science'}</b></span>
              </div>
            </div>

            {/* Right Column: Dynamic Graphic Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 p-5 border border-slate-700/80 shadow-2xl backdrop-blur-xl">
                {/* Header of Mock Screen */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  </div>
                  <span className="text-[11px] font-mono text-teal-400 font-semibold bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
                    LIVE ROUTING ACTIVE
                  </span>
                </div>

                {/* Route Mockup Graphic */}
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Origin</span>
                      <span className="font-semibold text-white">Main Gate Entrance Node</span>
                    </div>
                    <span className="text-slate-500">&rarr;</span>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Destination</span>
                      <span className="font-semibold text-teal-400">Central Library Block</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20">
                      <span className="text-[10px] text-teal-400 font-bold uppercase block">Distance</span>
                      <span className="text-lg font-extrabold text-white font-['Outfit']">490 m</span>
                    </div>
                    <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                      <span className="text-[10px] text-cyan-400 font-bold uppercase block">Walking Time</span>
                      <span className="text-lg font-extrabold text-white font-['Outfit']">~5 mins</span>
                    </div>
                  </div>

                  {/* Turn by turn snippet */}
                  <div className="space-y-2 pt-1 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2.5 text-slate-300">
                      <div className="w-6 h-6 rounded bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-[10px]">1</div>
                      <span>Start at Main Gate. Walk towards Central Plaza South for 145m.</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2.5 text-slate-300">
                      <div className="w-6 h-6 rounded bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-[10px]">2</div>
                      <span>Turn right at Central Avenue North, continue along walkway.</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2.5 text-slate-300">
                      <div className="w-6 h-6 rounded bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-[10px]">3</div>
                      <span>Arrive at Central Library entrance on your right.</span>
                    </div>
                  </div>

                  <Link
                    to="/map"
                    className="block text-center py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md mt-2"
                  >
                    Open Live Interactive Map &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-20 bg-slate-900/60 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
              Engineered for Modern University Campuses
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Designed from the ground up as a complete GIS and pedestrian pathfinding platform, connecting every classroom, lab, and service facility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all hover:-translate-y-1 shadow-xl group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 font-['Outfit']">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Navigation Benefits & Accessibility Section */}
      <section className="py-20 border-b border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Benefits */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                Inclusive Design
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
                Accessibility-First Campus Mobility
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                CampusNav empowers students with mobility needs, wheelchair users, and visitors carrying equipment to navigate with confidence.
              </p>

              <div className="space-y-3 pt-2">
                {benefits.map((b, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">{b}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  to="/routes"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-teal-400 hover:text-teal-300"
                >
                  <span>Try Wheelchair-Accessible Pathfinding</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right: Emergency & Safety Showcase */}
            <div className="lg:col-span-6">
              <div className="p-8 rounded-3xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 text-rose-500/10 pointer-events-none">
                  <ShieldAlert className="w-36 h-36" />
                </div>

                <div className="relative space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
                    <ShieldAlert className="w-4 h-4" />
                    <span>EMERGENCY DISPATCH SYSTEM</span>
                  </div>

                  <h3 className="text-2xl font-bold text-white font-['Outfit']">
                    Rapid Emergency Wayfinding
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    In urgent situations, CampusNav calculates the shortest path from your exact current coordinates to the nearest medical station, first-aid booth, campus police post, or designated assembly area.
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-rose-500/20">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Medical Helpline</span>
                      <span className="text-sm font-extrabold text-rose-400">ext 8100 / 108</span>
                    </div>
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-rose-500/20">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Security Office</span>
                      <span className="text-sm font-extrabold text-amber-400">ext 8000 / 100</span>
                    </div>
                  </div>

                  <Link
                    to="/emergency"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40 transition-all hover:scale-[1.02]"
                  >
                    <span>Open Emergency Navigation Center</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-t from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
            Ready to Explore the Campus?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Access the interactive 2D map, route between any two buildings, find nearby canteen snacks, or ask the Campus AI Navigator.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/map"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-teal-500 hover:bg-teal-400 text-slate-950 transition-all shadow-xl shadow-teal-500/20"
            >
              Launch Interactive Map
            </Link>
            <Link
              to="/assistant"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all"
            >
              Ask Campus Assistant
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
