import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Route,
  Plus,
  Trash2,
  ArrowLeft,
  X,
  Layers,
  Activity,
  Check,
  Search
} from 'lucide-react';
import { campusService } from '../../services/campusService';
import { useNavigation } from '../../context/NavigationContext';

export default function AdminPaths() {
  const [nodes, setNodes] = useState([]);
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('paths'); // 'paths' | 'nodes'

  const [pathModalOpen, setPathModalOpen] = useState(false);
  const [nodeModalOpen, setNodeModalOpen] = useState(false);

  const { showToast } = useNavigation();

  // New Path Form
  const [pathForm, setPathForm] = useState({
    start_node_id: '',
    end_node_id: '',
    distance: 60,
    walking_time: 45,
    accessible: true,
    path_type: 'walkway'
  });

  // New Node Form
  const [nodeForm, setNodeForm] = useState({
    id: '',
    name: '',
    latitude: 13.0105,
    longitude: 80.2355,
    node_type: 'junction'
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([campusService.getNodes(), campusService.getPaths()])
      .then(([n, p]) => {
        setNodes(n || []);
        setPaths(p || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePath = async (e) => {
    e.preventDefault();
    if (pathForm.start_node_id === pathForm.end_node_id) {
      showToast('Start and end nodes must be different.', 'warning');
      return;
    }

    try {
      await campusService.createPath({
        ...pathForm,
        distance: parseFloat(pathForm.distance),
        walking_time: parseInt(pathForm.walking_time, 10),
      });
      showToast('New campus path edge added', 'success');
      setPathModalOpen(false);
      loadData();
    } catch (err) {
      showToast('Failed to add path: ' + (err.response?.data?.detail || err.message), 'error');
    }
  };

  const handleDeletePath = async (id) => {
    if (!window.confirm('Delete this walkway path?')) return;
    try {
      await campusService.deletePath(id);
      showToast('Path deleted', 'success');
      loadData();
    } catch (err) {
      showToast('Failed to delete path', 'error');
    }
  };

  const handleCreateNode = async (e) => {
    e.preventDefault();
    try {
      await campusService.createNode({
        ...nodeForm,
        latitude: parseFloat(nodeForm.latitude),
        longitude: parseFloat(nodeForm.longitude),
      });
      showToast('New campus junction node created', 'success');
      setNodeModalOpen(false);
      loadData();
    } catch (err) {
      showToast('Failed to create node: ' + (err.response?.data?.detail || err.message), 'error');
    }
  };

  const handleDeleteNode = async (id) => {
    if (!window.confirm('Delete this junction node? Associated paths will also be removed.')) return;
    try {
      await campusService.deleteNode(id);
      showToast('Node removed', 'success');
      loadData();
    } catch (err) {
      showToast('Failed to delete node', 'error');
    }
  };

  const nodesMap = {};
  nodes.forEach(n => { nodesMap[n.id] = n; });

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
            <Route className="w-6 h-6 text-teal-400" />
            Walkway Network & Routing Graph
          </h1>
          <p className="text-xs text-slate-400">
            Configure junction waypoints (nodes) and interconnecting pedestrian pathways (edges).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setNodeModalOpen(true)}
            className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4 text-teal-400" />
            <span>Add Node</span>
          </button>
          <button
            onClick={() => setPathModalOpen(true)}
            className="py-2.5 px-4 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-950 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Path Edge</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('paths')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'paths'
              ? 'bg-teal-500 text-slate-950 border-teal-400'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          Walkway Paths ({paths.length})
        </button>
        <button
          onClick={() => setActiveTab('nodes')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'nodes'
              ? 'bg-teal-500 text-slate-950 border-teal-400'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          Junction Nodes ({nodes.length})
        </button>
      </div>

      {/* Paths View */}
      {activeTab === 'paths' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-800">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Path ID</th>
                  <th className="py-3 px-4">Start Node</th>
                  <th className="py-3 px-4">End Node</th>
                  <th className="py-3 px-4">Distance</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Accessibility</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {paths.map((p) => {
                  const sNode = nodesMap[p.start_node_id];
                  const eNode = nodesMap[p.end_node_id];
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-teal-400">{p.id}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white">{sNode?.name || p.start_node_id}</span>
                        <span className="text-[10px] text-slate-500 font-mono block">[{p.start_node_id}]</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white">{eNode?.name || p.end_node_id}</span>
                        <span className="text-[10px] text-slate-500 font-mono block">[{p.end_node_id}]</span>
                      </td>
                      <td className="py-3 px-4 font-bold font-mono">{p.distance} m</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{p.walking_time}s</td>
                      <td className="py-3 px-4 capitalize">{p.path_type}</td>
                      <td className="py-3 px-4">
                        {p.accessible ? (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            ♿ Accessible
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            Stairs / Inaccessible
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeletePath(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Delete Path Edge"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Nodes View */}
      {activeTab === 'nodes' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-800">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Node ID</th>
                  <th className="py-3 px-4">Waypoint Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Latitude</th>
                  <th className="py-3 px-4">Longitude</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {nodes.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-teal-400">{n.id}</td>
                    <td className="py-3 px-4 font-semibold text-white">{n.name}</td>
                    <td className="py-3 px-4 capitalize">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                        {n.node_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{n.latitude.toFixed(5)}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{n.longitude.toFixed(5)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteNode(n.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Delete Junction Node"
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
      )}

      {/* Add Path Modal */}
      {pathModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-['Outfit']">Add Walkway Graph Edge</h3>
              <button onClick={() => setPathModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePath} className="space-y-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Start Node (Origin) *</label>
                <select
                  required
                  value={pathForm.start_node_id}
                  onChange={(e) => setPathForm({ ...pathForm, start_node_id: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="">-- Choose start node --</option>
                  {nodes.map(n => <option key={`s-${n.id}`} value={n.id}>{n.name} ({n.id})</option>)}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">End Node (Destination) *</label>
                <select
                  required
                  value={pathForm.end_node_id}
                  onChange={(e) => setPathForm({ ...pathForm, end_node_id: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="">-- Choose end node --</option>
                  {nodes.map(n => <option key={`e-${n.id}`} value={n.id}>{n.name} ({n.id})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Distance (meters) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={pathForm.distance}
                    onChange={(e) => setPathForm({ ...pathForm, distance: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Walking Time (sec) *</label>
                  <input
                    type="number"
                    required
                    value={pathForm.walking_time}
                    onChange={(e) => setPathForm({ ...pathForm, walking_time: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Path Type</label>
                  <select
                    value={pathForm.path_type}
                    onChange={(e) => setPathForm({ ...pathForm, path_type: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="walkway">Walkway</option>
                    <option value="ramp">Accessible Ramp</option>
                    <option value="stairs">Staircase</option>
                    <option value="corridor">Corridor</option>
                  </select>
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={pathForm.accessible}
                      onChange={(e) => setPathForm({ ...pathForm, accessible: e.target.checked })}
                      className="rounded border-slate-700 text-teal-500 w-4 h-4 bg-slate-950"
                    />
                    <span>Wheelchair Accessible</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPathModalOpen(false)}
                  className="py-2 px-4 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold"
                >
                  Save Edge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Node Modal */}
      {nodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-['Outfit']">Add Campus Junction Node</h3>
              <button onClick={() => setNodeModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNode} className="space-y-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Node Identifier (Optional, e.g. N-99)</label>
                <input
                  type="text"
                  value={nodeForm.id}
                  onChange={(e) => setNodeForm({ ...nodeForm, id: e.target.value })}
                  placeholder="Auto-generated if left blank"
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Waypoint Name *</label>
                <input
                  type="text"
                  required
                  value={nodeForm.name}
                  onChange={(e) => setNodeForm({ ...nodeForm, name: e.target.value })}
                  placeholder="e.g. Quad Central East Walkway Node"
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Latitude *</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={nodeForm.latitude}
                    onChange={(e) => setNodeForm({ ...nodeForm, latitude: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Longitude *</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={nodeForm.longitude}
                    onChange={(e) => setNodeForm({ ...nodeForm, longitude: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Node Type</label>
                <select
                  value={nodeForm.node_type}
                  onChange={(e) => setNodeForm({ ...nodeForm, node_type: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="junction">Junction Point</option>
                  <option value="building_entrance">Building Entrance</option>
                  <option value="gate">Campus Perimeter Gate</option>
                  <option value="stairs">Stair Landing</option>
                  <option value="ramp">Ramp Entrance</option>
                  <option value="transit">Shuttle / Bus Transit</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setNodeModalOpen(false)}
                  className="py-2 px-4 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold"
                >
                  Save Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
