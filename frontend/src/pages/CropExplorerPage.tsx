import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CropMetadata, DataAvailabilityRow } from '../types';
import { MOCK_DATA_AVAILABILITY } from '../services/mockFallback';
import { 
  Sprout, 
  Search, 
  Check, 
  X, 
  Compass, 
  Thermometer, 
  Droplets, 
  Calendar, 
  MapPin, 
  Database,
  Layers,
  ArrowRight
} from 'lucide-react';

export const CropExplorerPage: React.FC = () => {
  const [crops, setCrops] = useState<CropMetadata[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<CropMetadata | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [matrixData, setMatrixData] = useState<DataAvailabilityRow[]>(MOCK_DATA_AVAILABILITY);

  useEffect(() => {
    let mounted = true;
    const fetchCrops = async () => {
      try {
        const list = await api.getCrops();
        if (mounted) {
          setCrops(list);
          if (list.length > 0) setSelectedCrop(list[0]);
        }
      } catch {}
    };
    fetchCrops();
    return () => { mounted = false; };
  }, []);

  const categories = ['All', 'Cereal', 'Legume', 'Tuber'];

  const filteredCrops = crops.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredMatrix = matrixData.filter(row => {
    if (!selectedCrop) return true;
    return row.crop.toLowerCase().includes(selectedCrop.name.split(' ')[0].toLowerCase());
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      
      {/* Page Header */}
      <div className="border-b border-stone-200/80 pb-6 dark:border-stone-800">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sage">
          <Compass className="h-4 w-4" />
          <span>Agronomic Catalog</span>
        </div>
        <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight text-walnut dark:text-cream sm:text-4xl">
          Crop explorer & variable availability
        </h1>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
          Inspect crop characteristics, regional coverage distributions, and the data availability 
          matrix across recorded environmental indicators.
        </p>
      </div>

      {/* Search and Category Filters */}
      <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Search bar */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crops or categories..."
            className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-4 py-2 text-xs text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-sage text-warm-white font-semibold shadow-xs'
                  : 'bg-white border border-stone-300 text-stone-600 hover:bg-stone-50 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Main Grid: Crop List on Left, Selected Profile & Availability Matrix on Right */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Crop Selection Cards */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Catalog ({filteredCrops.length} crops)
          </h2>
          {filteredCrops.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCrop(c)}
              className={`w-full text-left rounded-2xl border p-4.5 transition-all ${
                selectedCrop?.id === c.id
                  ? 'border-sage bg-sage/10 shadow-xs dark:border-sage dark:bg-sage/20'
                  : 'border-stone-200/90 bg-warm-white hover:border-stone-300 dark:border-stone-800 dark:bg-walnut dark:hover:border-stone-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-heading text-base font-bold text-walnut dark:text-cream">
                  {c.name}
                </span>
                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                  {c.category}
                </span>
              </div>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                Typical: <span className="font-medium text-walnut dark:text-cream">{c.typical_yield_range}</span>
              </p>
              <div className="mt-2.5 flex items-center gap-3 text-[11px] text-stone-600 dark:text-stone-300">
                <span className="flex items-center gap-1">
                  <Thermometer className="h-3 w-3 text-amber-glow" />
                  {c.optimum_temp_c}
                </span>
                <span className="flex items-center gap-1">
                  <Droplets className="h-3 w-3 text-blue-500" />
                  {c.water_requirement_mm}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Selected Crop Details & Availability Matrix */}
        <div className="lg:col-span-8 space-y-8">
          
          {selectedCrop && (
            <div className="rounded-2xl border border-stone-200/90 bg-warm-white p-6 sm:p-8 shadow-xs dark:border-stone-800 dark:bg-walnut">
              
              <div className="flex items-start justify-between border-b border-stone-100 pb-5 dark:border-stone-800">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sage">
                    <Sprout className="h-4 w-4" />
                    <span>Botanical Profile</span>
                  </div>
                  <h2 className="mt-1 font-heading text-2xl font-bold text-walnut dark:text-cream">
                    {selectedCrop.name}
                  </h2>
                </div>
                <span className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-walnut dark:border-stone-700 dark:bg-stone-800 dark:text-cream">
                  Category: {selectedCrop.category}
                </span>
              </div>

              {/* Agronomic Parameter Badges */}
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl bg-stone-50 p-3.5 dark:bg-stone-900/40">
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">Yield range</span>
                  <p className="mt-1 font-heading text-base font-bold text-walnut dark:text-cream">
                    {selectedCrop.typical_yield_range}
                  </p>
                </div>
                <div className="rounded-xl bg-stone-50 p-3.5 dark:bg-stone-900/40">
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">Optimal temp</span>
                  <p className="mt-1 font-heading text-base font-bold text-walnut dark:text-cream">
                    {selectedCrop.optimum_temp_c}
                  </p>
                </div>
                <div className="rounded-xl bg-stone-50 p-3.5 dark:bg-stone-900/40">
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">Water requirement</span>
                  <p className="mt-1 font-heading text-base font-bold text-walnut dark:text-cream">
                    {selectedCrop.water_requirement_mm}
                  </p>
                </div>
                <div className="rounded-xl bg-stone-50 p-3.5 dark:bg-stone-900/40">
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">Growth duration</span>
                  <p className="mt-1 font-heading text-base font-bold text-walnut dark:text-cream">
                    {selectedCrop.growth_duration_days}
                  </p>
                </div>
              </div>

              {/* Regional Coverage */}
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Primary regional cultivation zones
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedCrop.primary_regions.map((reg, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-walnut dark:border-stone-700 dark:bg-stone-800 dark:text-cream"
                    >
                      <MapPin className="h-3.5 w-3.5 text-sage" />
                      <span>{reg}</span>
                    </span>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Data-Availability Matrix */}
          <div className="rounded-2xl border border-stone-200/90 bg-warm-white p-6 sm:p-8 shadow-xs dark:border-stone-800 dark:bg-walnut">
            <div className="border-b border-stone-100 pb-4 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-amber-glow" />
                <h3 className="font-heading text-lg font-bold text-walnut dark:text-cream">
                  Data-availability matrix
                </h3>
              </div>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                Audits which variables (yield, area, production, soil, weather, fertilizer) are populated 
                in the database for each crop and regional stratum.
              </p>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 font-semibold">
                    <th className="py-2.5 px-3">Crop</th>
                    <th className="py-2.5 px-3">Region</th>
                    <th className="py-2.5 px-2 text-center">Yield</th>
                    <th className="py-2.5 px-2 text-center">Area</th>
                    <th className="py-2.5 px-2 text-center">Prod</th>
                    <th className="py-2.5 px-2 text-center">Soil</th>
                    <th className="py-2.5 px-2 text-center">Weather</th>
                    <th className="py-2.5 px-2 text-center">Fertilizer</th>
                    <th className="py-2.5 px-3 text-right">Records</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {filteredMatrix.map((row, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/30">
                      <td className="py-3 px-3 font-medium text-walnut dark:text-cream">{row.crop}</td>
                      <td className="py-3 px-3 text-stone-600 dark:text-stone-300">{row.region}</td>
                      <td className="py-3 px-2 text-center">
                        {row.has_yield ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-stone-300 mx-auto" />}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {row.has_area ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-stone-300 mx-auto" />}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {row.has_production ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-stone-300 mx-auto" />}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {row.has_soil_data ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-stone-300 mx-auto" />}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {row.has_weather_data ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-stone-300 mx-auto" />}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {row.has_fertilizer_data ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-stone-300 mx-auto" />}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-walnut dark:text-cream">
                        {row.record_count.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
