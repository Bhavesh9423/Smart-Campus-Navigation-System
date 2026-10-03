import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Plus,
  Trash2,
  Edit,
  ArrowLeft,
  X,
  Search,
  Building2,
  Clock,
  Phone
} from 'lucide-react';
import { campusService } from '../../services/campusService';
import { useNavigation } from '../../context/NavigationContext';

export default function AdminFacilities() {
  const [facilities, setFacilities] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFac, setEditingFac] = useState(null);

  const { showToast } = useNavigation();

  const [formData, setFormData] = useState({
    name: '',
    category: 'food',
    building_id: '',
    latitude: 13.0105,
    longitude: 80.2355,
    opening_hours: '08:00 AM - 08:00 PM',
    contact: '',
    description: ''
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([campusService.getFacilities(), campusService.getBuildings()])
      .then(([f, b]) => {
        setFacilities(f || []);
        setBuildings(b || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingFac(null);
    setFormData({
      name: '',
      category: 'food',
      building_id: '',
      latitude: 13.0105,
      longitude: 80.2355,
      opening_hours: '08:00 AM - 08:00 PM',
      contact: '',
      description: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (fac) => {
    setEditingFac(fac);
    setFormData({
      name: fac.name,
      category: fac.category,
      building_id: fac.building_id || '',
      latitude: fac.latitude,
      longitude: fac.longitude,
      opening_hours: fac.opening_hours || '',
      contact: fac.contact || '',
      description: fac.description || ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this facility from database?')) return;
    try {
      await campusService.deleteFacility(id);
      showToast('Facility deleted successfully', 'success');
      loadData();
    } catch (err) {
      showToast('Failed to delete facility', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      category: formData.category,
      building_id: formData.building_id || null,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      opening_hours: formData.opening_hours,
      contact: formData.contact,
      description: formData.description
    };

    try {
      if (editingFac) {
        await campusService.updateFacility(editingFac.id, payload);
        showToast('Facility updated successfully', 'success');
      } else {
        await campusService.createFacility(payload);
        showToast('Facility added successfully', 'success');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      showToast('Error saving facility: ' + (err.response?.data?.detail || err.message), 'error');
    }
  };

  const filtered = facilities.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    (f.description && f.description.toLowerCase().includes(search.toLowerCase())) ||
    f.category.toLowerCase().includes(search.toLowerCase())
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
            <Layers className="w-6 h-6 text-teal-400" />
            Facility Management
          </h1>
          <p className="text-xs text-slate-400">
            Configure campus amenities, canteens, medical centers, ATMs, and recreational areas.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="py-2.5 px-4 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-950 flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Facility</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter facilities by name or category..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-800">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Building Location</th>
                <th className="py-3 px-4">Hours</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map((fac) => (
                <tr key={fac.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">{fac.name}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {fac.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{fac.building_name || 'Campus Grounds'}</td>
                  <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">{fac.opening_hours || 'N/A'}</td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{fac.contact || 'N/A'}</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(fac)}
                      className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit Facility"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(fac.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Delete Facility"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-['Outfit']">
                {editingFac ? 'Edit Facility' : 'Add New Facility'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Facility Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Central Nescafe Kiosk"
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="food">Food & Canteen</option>
                    <option value="library">Library & Reading</option>
                    <option value="medical">Medical & Health</option>
                    <option value="sports">Sports & Gym</option>
                    <option value="parking">Parking</option>
                    <option value="facility">Utility / ATM</option>
                    <option value="emergency">Emergency / Exit</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Associated Building</label>
                  <select
                    value={formData.building_id}
                    onChange={(e) => setFormData({ ...formData, building_id: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="">-- None (Standalone) --</option>
                    {buildings.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Latitude *</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Longitude *</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Opening Hours</label>
                  <input
                    type="text"
                    value={formData.opening_hours}
                    onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                    placeholder="e.g. 08:30 AM - 09:00 PM"
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Contact / Extension</label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="e.g. ext 8055"
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Facility services description..."
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="py-2 px-4 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold"
                >
                  Save Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
