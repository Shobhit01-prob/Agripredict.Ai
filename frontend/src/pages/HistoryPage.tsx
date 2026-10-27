import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { SavedPrediction } from '../types';
import { useToast } from '../contexts/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { EmptyState } from '../components/EmptyState';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { 
  Clock, 
  Search, 
  Download, 
  Trash2, 
  ExternalLink, 
  X, 
  Sprout, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Calendar,
  Layers
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { showToast } = useToast();
  const [predictions, setPredictions] = useState<SavedPrediction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCrop, setSelectedCrop] = useState<string>('All');
  
  // Drawer & Modal state
  const [activeDetails, setActiveDetails] = useState<SavedPrediction | null>(null);
  const [itemToDelete, setItemToDelete] = useState<SavedPrediction | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getSavedPredictions();
      setPredictions(data);
    } catch (err: any) {
      showToast(`Error fetching history: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleExportCsv = async () => {
    try {
      const blob = await api.exportPredictionsCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agripredict_history_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast('Predictions exported to CSV successfully.', 'success');
    } catch (err: any) {
      showToast(`Export failed: ${err.message}`, 'error');
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await api.deletePrediction(itemToDelete.id);
      setPredictions(prev => prev.filter(p => p.id !== itemToDelete.id));
      if (activeDetails?.id === itemToDelete.id) {
        setActiveDetails(null);
      }
      showToast('Prediction record deleted.', 'success');
    } catch (err: any) {
      showToast(`Delete failed: ${err.message}`, 'error');
    } finally {
      setDeleting(false);
      setItemToDelete(null);
    }
  };

  const filteredList = predictions.filter(item => {
    const matchesSearch = item.crop.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCrop = selectedCrop === 'All' || item.crop === selectedCrop;
    return matchesSearch && matchesCrop;
  });

  const uniqueCrops = ['All', ...Array.from(new Set(predictions.map(p => p.crop)))];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="border-b border-stone-200/80 pb-6 dark:border-stone-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sage">
              <Clock className="h-4 w-4" />
              <span>Audit Trail</span>
            </div>
            <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight text-walnut dark:text-cream sm:text-4xl">
              Saved yield predictions
            </h1>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              Review, filter, inspect agronomic drivers, and export your logged yield simulations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={predictions.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-glow px-4 py-2.5 text-xs font-semibold text-warm-white shadow-xs transition-all hover:bg-amber-hover disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar: Search & Crop Filter */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by crop or country..."
            className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-4 py-2 text-xs text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 dark:text-stone-400">Filter crop:</span>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
          >
            {uniqueCrops.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="mt-6 rounded-2xl border border-stone-200/90 bg-warm-white shadow-xs dark:border-stone-800 dark:bg-walnut overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} />
          </div>
        ) : filteredList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50/70 border-b border-stone-200 dark:bg-stone-900/40 dark:border-stone-800 text-stone-500 dark:text-stone-400 font-semibold">
                <tr>
                  <th className="py-3 px-4">Date logged</th>
                  <th className="py-3 px-4">Crop</th>
                  <th className="py-3 px-4">Country / region</th>
                  <th className="py-3 px-4">Area (ha)</th>
                  <th className="py-3 px-4">Yield (t/ha)</th>
                  <th className="py-3 px-4">Production (t)</th>
                  <th className="py-3 px-4">Model</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {filteredList.map((item) => (
                  <tr 
                    key={item.id}
                    className="hover:bg-stone-50/50 dark:hover:bg-stone-900/30 transition-colors cursor-pointer"
                    onClick={() => setActiveDetails(item)}
                  >
                    <td className="py-3.5 px-4 text-stone-500 dark:text-stone-400">
                      {new Date(item.created_at).toLocaleDateString(undefined, { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-walnut dark:text-cream">
                      {item.crop}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 dark:text-stone-300">
                      {item.country}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 dark:text-stone-300">
                      {item.area_ha} ha
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-walnut dark:text-cream">
                        {item.predicted_yield_t_ha} t/ha
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 dark:text-stone-300">
                      {item.total_production_tonnes.toLocaleString()} t
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                        {item.model_version}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveDetails(item)}
                          className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-walnut dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-cream"
                          aria-label="View details"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          className="rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                          aria-label="Delete prediction"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              title="No saved predictions yet"
              description="Forecasts you generate and save on the Predict page will appear here with complete audit trails."
              actionLabel="Go to Predict"
              onAction={() => window.location.href = '/predict'}
            />
          </div>
        )}
      </div>

      {/* Details Slide-out Drawer */}
      {activeDetails && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex justify-end"
        >
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs"
            onClick={() => setActiveDetails(null)}
          />

          {/* Drawer Card */}
          <div className="relative w-full max-w-lg bg-warm-white p-6 sm:p-8 shadow-2xl dark:bg-walnut overflow-y-auto z-10 border-l border-stone-200 dark:border-stone-800">
            
            <div className="flex items-center justify-between border-b border-stone-200 pb-4 dark:border-stone-800">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-sage">
                  Prediction Details
                </span>
                <h2 className="font-heading text-xl font-bold text-walnut dark:text-cream">
                  {activeDetails.crop} ({activeDetails.year})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveDetails(null)}
                aria-label="Close drawer"
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Core Metrics */}
            <div className="mt-6 rounded-xl border border-sage/40 bg-sage-50/50 p-4 dark:border-sage-800 dark:bg-sage-950/30">
              <span className="text-xs text-stone-500 dark:text-stone-400">Forecasted yield</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-heading text-3xl font-extrabold text-walnut dark:text-cream">
                  {activeDetails.predicted_yield_t_ha}
                </span>
                <span className="text-xs text-stone-600 dark:text-stone-400">t/ha</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-sage/20 pt-2.5">
                <div>
                  <span className="text-stone-500 dark:text-stone-400">Total volume:</span>
                  <p className="font-bold text-walnut dark:text-cream">{activeDetails.total_production_tonnes} t</p>
                </div>
                <div>
                  <span className="text-stone-500 dark:text-stone-400">Baseline yield:</span>
                  <p className="font-bold text-walnut dark:text-cream">{activeDetails.baseline_yield_t_ha} t/ha</p>
                </div>
              </div>
            </div>

            {/* Input Parameters Summary */}
            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Input Parameters
              </h3>
              <dl className="mt-3 grid grid-cols-2 gap-2.5 text-xs">
                <div className="rounded-lg bg-stone-50 p-2.5 dark:bg-stone-900/40">
                  <dt className="text-stone-400">Country/Region</dt>
                  <dd className="font-medium text-walnut dark:text-cream">{activeDetails.country}</dd>
                </div>
                <div className="rounded-lg bg-stone-50 p-2.5 dark:bg-stone-900/40">
                  <dt className="text-stone-400">Area</dt>
                  <dd className="font-medium text-walnut dark:text-cream">{activeDetails.area_ha} ha</dd>
                </div>
                <div className="rounded-lg bg-stone-50 p-2.5 dark:bg-stone-900/40">
                  <dt className="text-stone-400">Rainfall</dt>
                  <dd className="font-medium text-walnut dark:text-cream">{activeDetails.inputs?.rainfall_mm} mm</dd>
                </div>
                <div className="rounded-lg bg-stone-50 p-2.5 dark:bg-stone-900/40">
                  <dt className="text-stone-400">Temperature</dt>
                  <dd className="font-medium text-walnut dark:text-cream">{activeDetails.inputs?.temperature_c} °C</dd>
                </div>
                <div className="rounded-lg bg-stone-50 p-2.5 dark:bg-stone-900/40">
                  <dt className="text-stone-400">Soil pH</dt>
                  <dd className="font-medium text-walnut dark:text-cream">{activeDetails.inputs?.soil_ph ?? 'N/A'}</dd>
                </div>
                <div className="rounded-lg bg-stone-50 p-2.5 dark:bg-stone-900/40">
                  <dt className="text-stone-400">Fertilizer Rate</dt>
                  <dd className="font-medium text-walnut dark:text-cream">{activeDetails.inputs?.fertilizer_rate_kg_ha ?? 'N/A'} kg/ha</dd>
                </div>
              </dl>
            </div>

            {/* Main Factors */}
            {activeDetails.main_factors && activeDetails.main_factors.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Feature Contributions
                </h3>
                <div className="mt-2.5 space-y-2">
                  {activeDetails.main_factors.map((f, i) => (
                    <div key={i} className="rounded-lg border border-stone-200/80 p-2.5 text-xs dark:border-stone-800 dark:bg-stone-900/30">
                      <div className="flex justify-between font-semibold">
                        <span>{f.feature_name}</span>
                        <span className="text-sage">{f.contribution_pct}%</span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">{f.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {activeDetails.suggestions && activeDetails.suggestions.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Logged Agronomic Advice
                </h3>
                <div className="mt-2.5 space-y-2">
                  {activeDetails.suggestions.map((s, i) => (
                    <div key={i} className="rounded-lg bg-amber-50/50 p-2.5 text-xs text-amber-950 dark:bg-amber-950/30 dark:text-amber-200">
                      <span className="font-bold">{s.title}</span>
                      <p className="mt-0.5 text-[11px] leading-relaxed">{s.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Drawer Footer Actions */}
            <div className="mt-8 border-t border-stone-200 pt-4 dark:border-stone-800 flex justify-end">
              <button
                type="button"
                onClick={() => setItemToDelete(activeDetails)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete prediction</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Confirmation Modal for Destructive Delete */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Delete saved prediction?"
        message={`Are you sure you want to permanently delete the yield prediction for ${itemToDelete?.crop} (${itemToDelete?.year})? This cannot be undone.`}
        confirmLabel="Delete prediction"
        isDestructive={true}
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setItemToDelete(null)}
      />

    </div>
  );
};
