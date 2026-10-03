import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCode,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Code,
  FileCheck,
  RefreshCw
} from 'lucide-react';
import { campusService } from '../../services/campusService';
import { useNavigation } from '../../context/NavigationContext';

export default function AdminGeoJson() {
  const [geoJsonInput, setGeoJsonInput] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const { showToast } = useNavigation();

  // Validate GeoJSON
  const handleValidate = () => {
    try {
      const parsed = JSON.parse(geoJsonInput);
      if (parsed.type !== 'FeatureCollection') {
        throw new Error("Root object must have type 'FeatureCollection'");
      }
      if (!Array.isArray(parsed.features)) {
        throw new Error("'features' property must be a JSON array");
      }

      const polygons = parsed.features.filter(f => f.geometry?.type === 'Polygon').length;
      const lines = parsed.features.filter(f => f.geometry?.type === 'LineString').length;
      const points = parsed.features.filter(f => f.geometry?.type === 'Point').length;

      setValidationResult({
        valid: true,
        message: 'Valid GeoJSON format detected!',
        stats: {
          total: parsed.features.length,
          buildings: polygons,
          paths: lines,
          facilities: points
        }
      });
      showToast('GeoJSON schema validated successfully', 'success');
    } catch (err) {
      setValidationResult({
        valid: false,
        message: err.message
      });
      showToast('Validation failed: ' + err.message, 'error');
    }
  };

  // Upload & Import GeoJSON
  const handleImport = async () => {
    try {
      const parsed = JSON.parse(geoJsonInput);
      setLoading(true);
      const res = await campusService.importGeoJson(parsed);
      setImportResult(res);
      showToast(
        `Imported: ${res.imported_buildings} buildings, ${res.imported_paths} paths, ${res.imported_facilities} facilities!`,
        'success'
      );
    } catch (err) {
      showToast('Import error: ' + (err.response?.data?.detail || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load existing GeoJSON from API for preview
  const handleLoadCurrent = async () => {
    try {
      setLoading(true);
      const data = await campusService.getCampusGeoJSON();
      setGeoJsonInput(JSON.stringify(data, null, 2));
      showToast('Loaded current campus GeoJSON', 'info');
    } catch (err) {
      showToast('Failed to load current GeoJSON', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setGeoJsonInput(event.target.result);
      showToast(`Loaded ${file.name}`, 'info');
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
            <FileCode className="w-6 h-6 text-cyan-400" />
            Campus GeoJSON Management
          </h1>
          <p className="text-xs text-slate-400">
            Import, validate, and synchronize custom campus spatial geometry datasets.
          </p>
        </div>

        <button
          onClick={handleLoadCurrent}
          disabled={loading}
          className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 text-teal-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Load Current Live GeoJSON</span>
        </button>
      </div>

      {/* Upload Box */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-xs font-bold text-white uppercase tracking-wider block">
            Paste or Upload GeoJSON FeatureCollection
          </label>
          <label className="cursor-pointer inline-flex items-center gap-2 py-1.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 text-xs font-semibold border border-slate-700 transition-colors">
            <Upload className="w-4 h-4" />
            <span>Select .geojson File</span>
            <input type="file" accept=".geojson,.json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        <textarea
          rows="14"
          value={geoJsonInput}
          onChange={(e) => setGeoJsonInput(e.target.value)}
          placeholder='{ "type": "FeatureCollection", "features": [ ... ] }'
          className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-teal-300 placeholder-slate-600 focus:border-teal-500 focus:outline-none"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={handleValidate}
            disabled={!geoJsonInput.trim()}
            className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <FileCheck className="w-4 h-4 text-teal-400" />
            <span>Validate Structure</span>
          </button>

          <button
            onClick={handleImport}
            disabled={loading || !geoJsonInput.trim()}
            className="py-2.5 px-6 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-950 transition-all hover:scale-105"
          >
            <Upload className="w-4 h-4" />
            <span>{loading ? 'Importing Features...' : 'Import Into Database'}</span>
          </button>
        </div>
      </div>

      {/* Validation Feedback */}
      {validationResult && (
        <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
          validationResult.valid
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
        }`}>
          <div className="flex items-center gap-2 font-bold">
            {validationResult.valid ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{validationResult.message}</span>
          </div>

          {validationResult.stats && (
            <div className="flex items-center gap-4 text-slate-300 font-mono pt-1">
              <span>Total: {validationResult.stats.total}</span>
              <span>• Buildings (Polygons): {validationResult.stats.buildings}</span>
              <span>• Paths (LineStrings): {validationResult.stats.paths}</span>
              <span>• Facilities (Points): {validationResult.stats.facilities}</span>
            </div>
          )}
        </div>
      )}

      {/* Import Feedback */}
      {importResult && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-teal-500/30 shadow-xl space-y-2 text-xs">
          <h3 className="font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            Import Summary
          </h3>
          <p className="text-slate-300">
            Successfully parsed and committed records into PostgreSQL/SQLite:
          </p>
          <div className="grid grid-cols-3 gap-3 font-mono text-center pt-2">
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">BUILDINGS</span>
              <span className="text-base font-bold text-white">{importResult.imported_buildings}</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">WALKWAYS</span>
              <span className="text-base font-bold text-white">{importResult.imported_paths}</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">FACILITIES</span>
              <span className="text-base font-bold text-white">{importResult.imported_facilities}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
