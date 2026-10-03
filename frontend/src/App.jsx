import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavigationProvider } from './context/NavigationContext';

// Pages
import LandingPage from './pages/LandingPage';
import MapPage from './pages/MapPage';
import RoutePlannerPage from './pages/RoutePlannerPage';
import LocationsPage from './pages/LocationsPage';
import BuildingDetailPage from './pages/BuildingDetailPage';
import FacilitiesPage from './pages/FacilitiesPage';
import EmergencyPage from './pages/EmergencyPage';
import AssistantPage from './pages/AssistantPage';
import LoginPage from './pages/LoginPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBuildings from './pages/admin/AdminBuildings';
import AdminLocations from './pages/admin/AdminLocations';
import AdminPaths from './pages/admin/AdminPaths';
import AdminFacilities from './pages/admin/AdminFacilities';
import AdminGeoJson from './pages/admin/AdminGeoJson';

function ProtectedAdminRoute({ children }) {
  const { user, isAdmin } = useAuth();
  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NavigationProvider>
          <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-500 selection:text-white">
            <Navbar />
            <main className="flex-1 flex flex-col">
              <Routes>
                {/* Public Application Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/routes" element={<RoutePlannerPage />} />
                <Route path="/locations" element={<LocationsPage />} />
                <Route path="/buildings/:id" element={<BuildingDetailPage />} />
                <Route path="/facilities" element={<FacilitiesPage />} />
                <Route path="/emergency" element={<EmergencyPage />} />
                <Route path="/assistant" element={<AssistantPage />} />
                <Route path="/login" element={<LoginPage />} />

                {/* Admin Management Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedAdminRoute>
                      <AdminDashboard />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/buildings"
                  element={
                    <ProtectedAdminRoute>
                      <AdminBuildings />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/locations"
                  element={
                    <ProtectedAdminRoute>
                      <AdminLocations />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/paths"
                  element={
                    <ProtectedAdminRoute>
                      <AdminPaths />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/facilities"
                  element={
                    <ProtectedAdminRoute>
                      <AdminFacilities />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/geojson"
                  element={
                    <ProtectedAdminRoute>
                      <AdminGeoJson />
                    </ProtectedAdminRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <Toast />
          </div>
        </NavigationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
