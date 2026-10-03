import React, { createContext, useContext, useState, useEffect } from 'react';
import { campusService } from '../services/campusService';

const NavigationContext = createContext(null);

export function NavigationProvider({ children }) {
  const [campusInfo, setCampusInfo] = useState({
    name: 'Apex Institute of Technology & Science',
    short_name: 'AITS Campus',
    center: { latitude: 13.0105, longitude: 80.2355 },
    default_zoom: 17,
  });

  const [startLocation, setStartLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [isAccessible, setIsAccessible] = useState(false);
  const [routingAlgorithm, setRoutingAlgorithm] = useState('a_star');
  const [userLocation, setUserLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([13.0105, 80.2355]);
  const [mapZoom, setMapZoom] = useState(17);
  const [toast, setToast] = useState(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Load campus metadata on mount
  useEffect(() => {
    campusService.getCampusInfo()
      .then((data) => {
        if (data && data.center) {
          setCampusInfo(data);
          setMapCenter([data.center.latitude, data.center.longitude]);
          if (data.default_zoom) setMapZoom(data.default_zoom);
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  const calculateRoute = async (start = startLocation, dest = destination, accessible = isAccessible, algo = routingAlgorithm) => {
    if (!start || !dest) {
      showToast('Please select both starting point and destination.', 'warning');
      return null;
    }

    setIsCalculatingRoute(true);
    try {
      const payload = {
        start: start.id || `${start.coords[0]},${start.coords[1]}`,
        destination: dest.id || `${dest.coords[0]},${dest.coords[1]}`,
        accessible: accessible,
        start_coords: start.coords,
        dest_coords: dest.coords,
      };

      const result = await campusService.calculateRoute(payload, algo);
      setActiveRoute(result);
      showToast(`Route calculated: ${result.distance}m (${result.estimated_time} min walking)`, 'success');

      // Center map around start or midpoint
      if (result.route_coordinates && result.route_coordinates.length > 0) {
        setMapCenter(result.route_coordinates[0]);
      }
      return result;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Route calculation failed.';
      showToast(msg, 'error');
      setActiveRoute(null);
      return null;
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const clearRoute = () => {
    setActiveRoute(null);
    setStartLocation(null);
    setDestination(null);
  };

  const swapLocations = () => {
    const temp = startLocation;
    setStartLocation(destination);
    setDestination(temp);
    if (activeRoute) {
      calculateRoute(destination, temp, isAccessible, routingAlgorithm);
    }
  };

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'error');
      return;
    }

    showToast('Locating your position on campus...', 'info');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        setMapCenter(coords);
        setMapZoom(18);
        showToast('Located successfully! Marked "You are here".', 'success');
      },
      (err) => {
        // Fallback for simulated testing on desktop if GPS denied or timed out
        console.warn('Geolocation error or denied:', err);
        const demoGps = [13.0070, 80.2355]; // Main Gate
        setUserLocation(demoGps);
        setMapCenter(demoGps);
        showToast('Using Campus Welcome Center as initial location.', 'info');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const navigateToLocation = (loc) => {
    const destObj = {
      id: loc.id,
      name: loc.name,
      coords: [loc.latitude, loc.longitude],
      category: loc.category
    };
    setDestination(destObj);
    setSelectedLocation(loc);

    // If start is empty, use userLocation or default to Main Gate
    let currentStart = startLocation;
    if (!currentStart) {
      if (userLocation) {
        currentStart = { id: 'USER_LOC', name: 'My Current Location', coords: userLocation };
      } else {
        currentStart = { id: 'b-gate-main', name: 'Main Gate & Welcome Center', coords: [13.0070, 80.2355] };
      }
      setStartLocation(currentStart);
    }

    calculateRoute(currentStart, destObj, isAccessible, routingAlgorithm);
  };

  return (
    <NavigationContext.Provider
      value={{
        campusInfo,
        startLocation,
        setStartLocation,
        destination,
        setDestination,
        activeRoute,
        setActiveRoute,
        isAccessible,
        setIsAccessible,
        routingAlgorithm,
        setRoutingAlgorithm,
        userLocation,
        setUserLocation,
        selectedLocation,
        setSelectedLocation,
        mapCenter,
        setMapCenter,
        mapZoom,
        setMapZoom,
        toast,
        showToast,
        isCalculatingRoute,
        calculateRoute,
        clearRoute,
        swapLocations,
        requestUserLocation,
        navigateToLocation,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
