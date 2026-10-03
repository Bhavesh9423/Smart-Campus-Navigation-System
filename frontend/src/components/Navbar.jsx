import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Route,
  Building2,
  Layers,
  AlertTriangle,
  Bot,
  ShieldCheck,
  LogIn,
  LogOut,
  Menu,
  X,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const { campusInfo } = useNavigation();

  const navLinks = [
    { name: 'Campus Map', path: '/map', icon: MapPin },
    { name: 'Route Planner', path: '/routes', icon: Route },
    { name: 'Locations', path: '/locations', icon: Building2 },
    { name: 'Facilities', path: '/facilities', icon: Layers },
    { name: 'Emergency', path: '/emergency', icon: AlertTriangle, highlight: true },
    { name: 'Campus AI', path: '/assistant', icon: Bot, badge: 'AI' },
  ];

  const isActive = (path) => {
    if (path === '/map' && location.pathname === '/map') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 via-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-['Outfit'] tracking-tight text-white group-hover:text-teal-400 transition-colors">
                  Campus<span className="text-teal-400">Nav</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  GIS 2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                {campusInfo?.short_name || 'Campus Navigation'}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-slate-800 text-teal-400 shadow-sm border border-slate-700'
                      : item.highlight
                      ? 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-teal-400' : item.highlight ? 'text-rose-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action / Auth */}
          <div className="hidden sm:flex items-center gap-3">
            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'text-amber-400 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Admin Panel</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="w-7 h-7 rounded-full bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-300 font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium hidden md:inline">{user.username}</span>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all hover:border-slate-600"
              >
                <LogIn className="w-4 h-4 text-teal-400" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium ${
                  active
                    ? 'bg-slate-800 text-teal-400 border border-slate-700'
                    : item.highlight
                    ? 'text-rose-400 bg-rose-500/10'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${item.highlight ? 'text-rose-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20"
              >
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span>Admin Dashboard</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/60 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <UserCheck className="w-4 h-4 text-teal-400" />
                  <span>Logged in as <b>{user.username}</b> ({user.role})</span>
                </div>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-teal-600 hover:bg-teal-500 text-white"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to CampusNav</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
