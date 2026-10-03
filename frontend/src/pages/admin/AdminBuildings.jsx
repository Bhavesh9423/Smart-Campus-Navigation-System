import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Plus,
  Trash2,
  Edit,
  ArrowLeft,
  X,
  Check,
  MapPin,
  Layers,
  Search
} from 'lucide-react';
import { campusService } from '../../services/campusService';
import { useNavigation } from '../../context/NavigationContext';

export default function AdminBuildings() {
  const [buildings, setBuildings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(null);

  const { showToast } = useNavigation();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'academic',
    latitude: 13.0105,
    longitude: 80.2355,
    floors_count: 1,
    description: '',
    departmentsText: '',
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([campusService.getBuildings(), campusService.getCategories()])
      .then(([b, c]) => {
        setBuildings(b || []);
        setCategories(c || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingBuilding(null);
    setFormData({
      name: '',
      code: '',
      category: 'academic',
      latitude: 13.0105,
      longitude: 80.2355,
      floors_count: 1,
      description: '',
      departmentsText: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBuilding(b);
    setFormData({
      name: b.name,
      code: b.code,
      category: b.category,
      latitude: b.latitude,
      longitude: b.longitude,
      floors_count: b.floors_count || 1,
      description: b.description || '',
      departmentsText: (b.departments || []).join(', '),
    });
    setModalOpen(true);
  };

  const handleDelete = async (bId) => {
    if (!window.confirm('Are you sure you want to delete this campus building?')) return;
    try {
      await campusService.deleteBuilding(bId);
      showToast('Building deleted successfully', 'success');
      loadData();
    } catch (err) {
      showToast('Failed to delete building: ' + (err.response?.data?.detail || err.message), 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      code: formData.code,
      category: formData.category,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      floors_count: parseInt(formData.floors_count, 10),
      description: formData.description,
      departments: formData.departmentsText
        ? formData.departmentsText.split(',').map(s => s.trim()).filter(Boolean)
        : []
    };

    try {
      if (editingBuilding) {
        await campusService.updateBuilding(editingBuilding.id, payload);
        showToast('Building updated successfully', 'success');
      } else {
        await campusService.createBuilding(payload);
        showToast('Building created successfully', 'success');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      showToast('Error saving building: ' + (err.response?.data?.detail || err.message), 'error');
    }
  };

  const filtered = buildings.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.code.toLowerCase().includes(search.toLowerCase())
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
            <Building2 className="w-6 h-6 text-teal-400" />
            Building Management
          </h1>
          <p className="text-xs text-slate-400">
            Create, configure coordinates, and manage physical college buildings.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="py-2.5 px-4 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-950 flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Building</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter buildings by name or code..."
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
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Coordinates</th>
                <th className="py-3 px-4">Floors</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-teal-400">{b.code}</td>
                  <td className="py-3 px-4 font-semibold text-white">{b.name}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {b.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                    {b.latitude.toFixed(4)}, {b.longitude.toFixed(4)}
                  </td>
                  <td className="py-3 px-4">{b.floors_count || 1} Levels</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(b)}
                      className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit Building"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Delete Building"
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

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-['Outfit']">
                {editingBuilding ? 'Edit Campus Building' : 'Add New Campus Building'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Building Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. BLD-A"
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="academic">Academic</option>
                    <option value="department">Departments</option>
                    <option value="laboratory">Laboratories</option>
                    <option value="library">Library</option>
                    <option value="food">Food & Canteen</option>
                    <option value="hostel">Hostel</option>
                    <option value="sports">Sports</option>
                    <option value="medical">Medical</option>
                    <option value="administration">Administration</option>
                    <option value="emergency">Emergency / Gate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Full Building Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Computer Science Engineering Block"
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Latitude *</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-500 font-mono"
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
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Floors</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.floors_count}
                    onChange={(e) => setFormData({ ...formData, floors_count: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Departments (Comma-separated)</label>
                <input
                  type="text"
                  value={formData.departmentsText}
                  onChange={(e) => setFormData({ ...formData, departmentsText: e.target.value })}
                  placeholder="e.g. AI & Robotics, Data Analytics Lab"
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Overview of this building..."
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold"
                >
                  Save Building
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
