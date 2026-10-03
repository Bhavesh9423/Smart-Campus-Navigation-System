import api from './api';

export const campusService = {
  // Campus Info & Metadata
  getCampusInfo: async () => {
    const res = await api.get('/campus-info');
    return res.data;
  },

  getCategories: async () => {
    const res = await api.get('/categories');
    return res.data;
  },

  getCampusGeoJSON: async () => {
    const res = await api.get('/geojson');
    return res.data;
  },

  // Buildings
  getBuildings: async (category = null, q = '') => {
    const params = {};
    if (category && category !== 'all') params.category = category;
    if (q) params.q = q;
    const res = await api.get('/buildings', { params });
    return res.data;
  },

  getBuildingDetail: async (id) => {
    const res = await api.get(`/buildings/${id}`);
    return res.data;
  },

  createBuilding: async (data) => {
    const res = await api.post('/buildings', data);
    return res.data;
  },

  updateBuilding: async (id, data) => {
    const res = await api.put(`/buildings/${id}`, data);
    return res.data;
  },

  deleteBuilding: async (id) => {
    const res = await api.delete(`/buildings/${id}`);
    return res.data;
  },

  // Locations (Buildings + Rooms + Facilities unified)
  getLocations: async (category = null, q = '') => {
    const params = {};
    if (category && category !== 'all') params.category = category;
    if (q) params.q = q;
    const res = await api.get('/locations', { params });
    return res.data;
  },

  getLocationById: async (id) => {
    const res = await api.get(`/locations/${id}`);
    return res.data;
  },

  // Facilities
  getFacilities: async (category = null, q = '') => {
    const params = {};
    if (category && category !== 'all') params.category = category;
    if (q) params.q = q;
    const res = await api.get('/facilities', { params });
    return res.data;
  },

  getFacility: async (id) => {
    const res = await api.get(`/facilities/${id}`);
    return res.data;
  },

  createFacility: async (data) => {
    const res = await api.post('/facilities', data);
    return res.data;
  },

  updateFacility: async (id, data) => {
    const res = await api.put(`/facilities/${id}`, data);
    return res.data;
  },

  deleteFacility: async (id) => {
    const res = await api.delete(`/facilities/${id}`);
    return res.data;
  },

  // Graph Nodes & Paths
  getNodes: async () => {
    const res = await api.get('/nodes');
    return res.data;
  },

  createNode: async (data) => {
    const res = await api.post('/nodes', data);
    return res.data;
  },

  deleteNode: async (id) => {
    const res = await api.delete(`/nodes/${id}`);
    return res.data;
  },

  getPaths: async () => {
    const res = await api.get('/paths');
    return res.data;
  },

  createPath: async (data) => {
    const res = await api.post('/paths', data);
    return res.data;
  },

  updatePath: async (id, data) => {
    const res = await api.put(`/paths/${id}`, data);
    return res.data;
  },

  deletePath: async (id) => {
    const res = await api.delete(`/paths/${id}`);
    return res.data;
  },

  // Routing
  calculateRoute: async (routeParams, algorithm = 'a_star') => {
    const res = await api.post('/navigation/route', routeParams, {
      params: { algorithm }
    });
    return res.data;
  },

  // Search
  searchCampus: async (q, lat = null, lng = null) => {
    const params = { q };
    if (lat !== null && lng !== null) {
      params.lat = lat;
      params.lng = lng;
    }
    const res = await api.get('/search', { params });
    return res.data;
  },

  // Emergency
  getNearestEmergency: async (lat, lng, facilityType = null) => {
    const params = { lat, lng };
    if (facilityType) params.facility_type = facilityType;
    const res = await api.get('/emergency/nearest', { params });
    return res.data;
  },

  // Assistant
  queryAssistant: async (query, currentLocation = null) => {
    const res = await api.post('/assistant/query', {
      query,
      current_location: currentLocation
    });
    return res.data;
  },

  // Admin
  getAdminStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  importGeoJson: async (geoJsonData) => {
    const res = await api.post('/admin/geojson/import', geoJsonData);
    return res.data;
  },

  // Auth
  login: async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  }
};
