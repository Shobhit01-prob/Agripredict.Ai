import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  AnalyticsOverviewResponse, 
  AnalyticsFilter,
  CropMetadata 
} from '../types';
import { ChartSkeleton, CardSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  ReferenceLine,
  ComposedChart,
  LabelList
} from 'recharts';
import { 
  Filter, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  CloudRain, 
  MapPin, 
  Layers, 
  BarChart3, 
  Cpu, 
  Info,
  Calendar,
  Sprout
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsOverviewResponse | null>(null);
  const [cropsList, setCropsList] = useState<CropMetadata[]>([]);
  const [regionsList, setRegionsList] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters state
  const [filters, setFilters] = useState<AnalyticsFilter>({
    season: 'All Seasons',
    crop: 'All Crops',
    region: 'All Regions',
    from_year: 2005,
    to_year: 2024
  });

  const loadAnalytics = async (appliedFilters: AnalyticsFilter) => {
    setLoading(true);
    try {
      const res = await api.getAnalyticsOverview(appliedFilters);
      setData(res);
    } catch (err) {
      // API fallback handled inside api client
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const [crops, regions] = await Promise.all([
          api.getCrops(),
          api.getRegions()
        ]);
        if (mounted) {
          setCropsList(crops);
          setRegionsList(regions);
        }
      } catch {}
      await loadAnalytics(filters);
    };
    init();
    return () => { mounted = false; };
  }, []);

  const handleFilterChange = (key: keyof AnalyticsFilter, value: any) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    loadAnalytics(updated);
  };

  const handleResetFilters = () => {
    const defaultFilters: AnalyticsFilter = {
      season: 'All Seasons',
      crop: 'All Crops',
      region: 'All Regions',
      from_year: 2005,
      to_year: 2024
    };
    setFilters(defaultFilters);
    loadAnalytics(defaultFilters);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      
      {/* Page Header */}
      <div className="border-b border-stone-200/80 pb-6 dark:border-stone-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sage">
              <BarChart3 className="h-4 w-4" />
              <span>Macro Intelligence</span>
            </div>
            <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight text-walnut dark:text-cream sm:text-4xl">
              Agricultural yield analytics
            </h1>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              Multi-decadal yield distributions, climatic correlations, and model benchmark evaluations 
              driven by official FAOSTAT datasets.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 self-start md:self-auto rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 shadow-2xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset filters</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <section 
        aria-label="Analytics filters" 
        className="mt-6 rounded-2xl border border-stone-200/90 bg-warm-white p-5 shadow-xs dark:border-stone-800 dark:bg-walnut"
      >
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800 text-xs font-semibold uppercase tracking-wider text-walnut dark:text-cream">
          <Filter className="h-3.5 w-3.5 text-amber-glow" />
          <span>Active filter parameters</span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
          
          {/* Season Filter */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">Season</label>
            <select
              value={filters.season}
              onChange={(e) => handleFilterChange('season', e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
            >
              <option value="All Seasons">All Seasons</option>
              <option value="Kharif">Kharif (Monsoon)</option>
              <option value="Rabi">Rabi (Winter)</option>
              <option value="Annual">Annual / Perennial</option>
            </select>
          </div>

          {/* Crop Filter */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">Crop</label>
            <select
              value={filters.crop}
              onChange={(e) => handleFilterChange('crop', e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
            >
              <option value="All Crops">All Crops</option>
              {cropsList.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Region Filter */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">Region</label>
            <select
              value={filters.region}
              onChange={(e) => handleFilterChange('region', e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
            >
              <option value="All Regions">All Regions</option>
              {regionsList.filter(r => r !== 'All Regions').map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* From Year */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">From year</label>
            <input
              type="number"
              min="1961"
              max={filters.to_year || 2024}
              value={filters.from_year}
              onChange={(e) => handleFilterChange('from_year', parseInt(e.target.value) || 2005)}
              className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
            />
          </div>

          {/* To Year */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">To year</label>
            <input
              type="number"
              min={filters.from_year || 1961}
              max="2024"
              value={filters.to_year}
              onChange={(e) => handleFilterChange('to_year', parseInt(e.target.value) || 2024)}
              className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
            />
          </div>

        </div>
      </section>

      {/* Top Row: 4 Summary KPI Cards */}
      <section aria-label="Key Performance Indicators" className="mt-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <CardSkeleton height="h-32" />
            <CardSkeleton height="h-32" />
            <CardSkeleton height="h-32" />
            <CardSkeleton height="h-32" />
          </div>
        ) : data ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* KPI 1: Latest Yield with Change */}
            <div className="rounded-2xl border border-stone-200/90 bg-warm-white p-5 shadow-xs dark:border-stone-800 dark:bg-walnut">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                  Latest average yield
                </span>
                <span className="rounded-full bg-sage/15 p-1.5 text-sage">
                  <Sprout className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-heading text-3xl font-extrabold text-walnut dark:text-cream">
                  {data.kpis.latest_yield_t_ha}
                </span>
                <span className="text-xs font-medium text-stone-600 dark:text-stone-400">t/ha</span>
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs">
                {data.kpis.yield_change_pct >= 0 ? (
                  <span className="flex items-center font-bold text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-3.5 w-3.5 mr-0.5" />
                    +{data.kpis.yield_change_pct}%
                  </span>
                ) : (
                  <span className="flex items-center font-bold text-rose-600 dark:text-rose-400">
                    <TrendingDown className="h-3.5 w-3.5 mr-0.5" />
                    {data.kpis.yield_change_pct}%
                  </span>
                )}
                <span className="text-stone-500 dark:text-stone-400">since {filters.from_year}</span>
              </div>
            </div>

            {/* KPI 2: Production and Cultivated Area */}
            <div className="rounded-2xl border border-stone-200/90 bg-warm-white p-5 shadow-xs dark:border-stone-800 dark:bg-walnut">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                  Total production & area
                </span>
                <span className="rounded-full bg-amber-glow/15 p-1.5 text-amber-glow">
                  <Layers className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-heading text-3xl font-extrabold text-walnut dark:text-cream">
                  {(data.kpis.total_production_tonnes / 1000000).toFixed(1)}M
                </span>
                <span className="text-xs font-medium text-stone-600 dark:text-stone-400">tonnes</span>
              </div>
              <div className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                Across <span className="font-semibold text-walnut dark:text-cream">{(data.kpis.cultivated_area_ha / 1000000).toFixed(1)}M ha</span> cultivated
              </div>
            </div>

            {/* KPI 3: Average Rainfall */}
            <div className="rounded-2xl border border-stone-200/90 bg-warm-white p-5 shadow-xs dark:border-stone-800 dark:bg-walnut">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                  Average seasonal rainfall
                </span>
                <span className="rounded-full bg-blue-500/15 p-1.5 text-blue-600">
                  <CloudRain className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-heading text-3xl font-extrabold text-walnut dark:text-cream">
                  {data.kpis.average_rainfall_mm}
                </span>
                <span className="text-xs font-medium text-stone-600 dark:text-stone-400">mm / year</span>
              </div>
              <div className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                NASA POWER climatology aggregate
              </div>
            </div>

            {/* KPI 4: Highest-Yielding Region */}
            <div className="rounded-2xl border border-stone-200/90 bg-warm-white p-5 shadow-xs dark:border-stone-800 dark:bg-walnut">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                  Highest-yielding region
                </span>
                <span className="rounded-full bg-sage/15 p-1.5 text-sage">
                  <MapPin className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-2">
                <span className="font-heading text-2xl font-bold text-walnut dark:text-cream truncate block">
                  {data.kpis.highest_yielding_region.region}
                </span>
              </div>
              <div className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                Peak yield: <span className="font-bold text-sage">{data.kpis.highest_yielding_region.yield_t_ha} t/ha</span>
              </div>
            </div>

          </div>
        ) : null}
      </section>

      {/* Main Charts Grid */}
      <section aria-label="Visual analytics charts" className="mt-10 space-y-8">
        
        {loading ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <ChartSkeleton height="h-80" />
            <ChartSkeleton height="h-80" />
            <ChartSkeleton height="h-80" />
            <ChartSkeleton height="h-80" />
          </div>
        ) : data ? (
          <>
            {/* Chart 1 & Chart 2 */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              
              {/* 1. Yield Trend with 3-Year Moving Average */}
              <div className="rounded-2xl border border-stone-200/90 bg-warm-white p-6 shadow-xs dark:border-stone-800 dark:bg-walnut">
                <div className="border-b border-stone-100 pb-3 dark:border-stone-800">
                  <h3 className="font-heading text-base font-bold text-walnut dark:text-cream">
                    1. Yield trend & 3-year moving average
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Annual yield (t/ha) with smoothed 3-year moving average trend line
                  </p>
                </div>
                <div className="mt-6 h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.yield_trends} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="yieldFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#87A96B" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#87A96B" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} label={{ value: 't/ha', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#FFFDF8', borderRadius: 12, border: '1px solid #E8DFD0' }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Area type="monotone" dataKey="yield_t_ha" name="Annual Yield (t/ha)" stroke="#87A96B" strokeWidth={2.5} fillOpacity={1} fill="url(#yieldFill)" />
                      <Line type="monotone" dataKey="moving_average_3yr" name="3-Yr Moving Avg (t/ha)" stroke="#5A3E2B" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 2. Yield Growth Index Across Crops (Base Year = 100) */}
              <div className="rounded-2xl border border-stone-200/90 bg-warm-white p-6 shadow-xs dark:border-stone-800 dark:bg-walnut">
                <div className="border-b border-stone-100 pb-3 dark:border-stone-800">
                  <h3 className="font-heading text-base font-bold text-walnut dark:text-cream">
                    2. Yield growth index across crops (Base = 100)
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Comparative index normalizing start year to 100 for major staple crops
                  </p>
                </div>
                <div className="mt-6 h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.growth_index} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} domain={['dataMin - 5', 'dataMax + 5']} label={{ value: 'Index', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#FFFDF8', borderRadius: 12, border: '1px solid #E8DFD0' }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="Wheat" stroke="#87A96B" strokeWidth={2.5} />
                      <Line type="monotone" dataKey="Maize" stroke="#D5851F" strokeWidth={2.5} />
                      <Line type="monotone" dataKey="Rice" stroke="#5A3E2B" strokeWidth={2.5} />
                      <Line type="monotone" dataKey="Soybeans" stroke="#2563EB" strokeWidth={2} strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="Potatoes" stroke="#9333EA" strokeWidth={2} strokeDasharray="3 3" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Chart 3 & Chart 4 */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              
              {/* 3. Yield by Region: Grouped Columns */}
              <div className="rounded-2xl border border-stone-200/90 bg-warm-white p-6 shadow-xs dark:border-stone-800 dark:bg-walnut">
                <div className="border-b border-stone-100 pb-3 dark:border-stone-800">
                  <h3 className="font-heading text-base font-bold text-walnut dark:text-cream">
                    3. Yield by region (Latest year vs period average)
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Grouped bar comparison of latest observation against multi-year baseline (t/ha)
                  </p>
                </div>
                <div className="mt-6 h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.regional_yields} margin={{ top: 15, right: 20, left: -10, bottom: 15 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="region" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} label={{ value: 't/ha', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#FFFDF8', borderRadius: 12, border: '1px solid #E8DFD0' }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="latest_year_yield_t_ha" name="Latest Year (t/ha)" fill="#87A96B" radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="latest_year_yield_t_ha" position="top" style={{ fontSize: 10, fill: '#5A3E2B' }} />
                      </Bar>
                      <Bar dataKey="period_average_yield_t_ha" name="Period Avg (t/ha)" fill="#5A3E2B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 4. Production against Cultivated Area */}
              <div className="rounded-2xl border border-stone-200/90 bg-warm-white p-6 shadow-xs dark:border-stone-800 dark:bg-walnut">
                <div className="border-b border-stone-100 pb-3 dark:border-stone-800">
                  <h3 className="font-heading text-base font-bold text-walnut dark:text-cream">
                    4. Production against cultivated area
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Scatter plot of harvested area (ha) vs production volume (t) with trend line
                  </p>
                </div>
                <div className="mt-6 h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis 
                        dataKey="area_ha" 
                        name="Area" 
                        unit=" ha" 
                        tick={{ fontSize: 10 }} 
                        tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`}
                      />
                      <YAxis 
                        dataKey="production_tonnes" 
                        name="Production" 
                        unit=" t" 
                        tick={{ fontSize: 10 }} 
                        tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`}
                      />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        formatter={(val: any, name: any) => [
                          name === 'Area' ? `${(val/1000000).toFixed(2)}M ha` : `${(val/1000000).toFixed(2)}M tonnes`,
                          name
                        ]}
                        contentStyle={{ backgroundColor: '#FFFDF8', borderRadius: 12, border: '1px solid #E8DFD0' }}
                      />
                      <Scatter name="Regions" data={data.production_area_scatter} fill="#D5851F" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Chart 5 & Chart 6 */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              
              {/* 5. Actual vs Predicted Yield with 45-degree line */}
              <div className="rounded-2xl border border-stone-200/90 bg-warm-white p-6 shadow-xs dark:border-stone-800 dark:bg-walnut">
                <div className="border-b border-stone-100 pb-3 dark:border-stone-800">
                  <h3 className="font-heading text-base font-bold text-walnut dark:text-cream">
                    5. Actual vs predicted yield (Model test split)
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Scatter calibration against 45° reference line of perfect prediction
                  </p>
                </div>
                <div className="mt-6 h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="actual_yield_t_ha" name="Actual Yield" unit=" t/ha" tick={{ fontSize: 10 }} />
                      <YAxis dataKey="predicted_yield_t_ha" name="Predicted Yield" unit=" t/ha" tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#FFFDF8', borderRadius: 12, border: '1px solid #E8DFD0' }} />
                      <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 30, y: 30 }]} stroke="#87A96B" strokeDasharray="4 4" strokeWidth={2} />
                      <Scatter name="Test Samples" data={data.actual_vs_predicted.items} fill="#5A3E2B" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>

                {/* Validation Metrics Strip */}
                <div className="mt-4 flex items-center justify-around rounded-xl bg-stone-100/70 p-3 text-xs dark:bg-stone-900/40">
                  <div>
                    <span className="text-stone-500 dark:text-stone-400">R-squared (R²): </span>
                    <span className="font-bold text-walnut dark:text-cream">{data.actual_vs_predicted.r_squared}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 dark:text-stone-400">RMSE: </span>
                    <span className="font-bold text-walnut dark:text-cream">{data.actual_vs_predicted.rmse} t/ha</span>
                  </div>
                  <div>
                    <span className="text-stone-500 dark:text-stone-400">MAE: </span>
                    <span className="font-bold text-walnut dark:text-cream">{data.actual_vs_predicted.mae} t/ha</span>
                  </div>
                </div>
              </div>

              {/* 6. Rainfall and Yield Dual-Axis */}
              <div className="rounded-2xl border border-stone-200/90 bg-warm-white p-6 shadow-xs dark:border-stone-800 dark:bg-walnut">
                <div className="border-b border-stone-100 pb-3 dark:border-stone-800">
                  <h3 className="font-heading text-base font-bold text-walnut dark:text-cream">
                    6. Rainfall and crop yield dual-axis
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Precipitation bars (left axis, mm) alongside recorded yield line (right axis, t/ha)
                  </p>
                </div>
                <div className="mt-6 h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data.rainfall_and_yield} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 10 }} label={{ value: 'mm', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} label={{ value: 't/ha', angle: 90, position: 'insideRight', fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#FFFDF8', borderRadius: 12, border: '1px solid #E8DFD0' }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar yAxisId="left" dataKey="rainfall_mm" name="Rainfall (mm)" fill="#87A96B" opacity={0.65} radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="yield_t_ha" name="Yield (t/ha)" stroke="#D5851F" strokeWidth={2.5} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Chart 7 & Chart 8 */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              
              {/* 7. Feature Importance */}
              <div className="rounded-2xl border border-stone-200/90 bg-warm-white p-6 shadow-xs dark:border-stone-800 dark:bg-walnut">
                <div className="border-b border-stone-100 pb-3 dark:border-stone-800">
                  <h3 className="font-heading text-base font-bold text-walnut dark:text-cream">
                    7. Real model feature importance
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Tree gain importance weights derived from the active LightGBM regressor
                  </p>
                </div>
                <div className="mt-6 h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={data.feature_importance} 
                      layout="vertical"
                      margin={{ top: 5, right: 25, left: 45, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="feature" tick={{ fontSize: 10 }} width={110} />
                      <Tooltip 
                        formatter={(val: any) => [`${(val * 100).toFixed(1)}% weight`, 'Importance']}
                        contentStyle={{ backgroundColor: '#FFFDF8', borderRadius: 12, border: '1px solid #E8DFD0' }} 
                      />
                      <Bar dataKey="importance" fill="#87A96B" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 8. Model Comparison: RMSE and R2 */}
              <div className="rounded-2xl border border-stone-200/90 bg-warm-white p-6 shadow-xs dark:border-stone-800 dark:bg-walnut">
                <div className="border-b border-stone-100 pb-3 dark:border-stone-800">
                  <h3 className="font-heading text-base font-bold text-walnut dark:text-cream">
                    8. Benchmark model comparison
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Validation RMSE across algorithms with real R² labels from evaluation files
                  </p>
                </div>
                <div className="mt-6 h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={data.model_comparison} 
                      layout="vertical"
                      margin={{ top: 10, right: 35, left: 50, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis type="number" tick={{ fontSize: 10 }} label={{ value: 'RMSE (lower is better)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                      <YAxis type="category" dataKey="model_name" tick={{ fontSize: 10 }} width={125} />
                      <Tooltip 
                        formatter={(val: any, name: any, item: any) => [
                          `RMSE: ${val} t/ha | R²: ${item.payload.r2}`,
                          item.payload.model_name
                        ]}
                        contentStyle={{ backgroundColor: '#FFFDF8', borderRadius: 12, border: '1px solid #E8DFD0' }} 
                      />
                      <Bar dataKey="rmse" fill="#5A3E2B" radius={[0, 4, 4, 0]}>
                        <LabelList 
                          dataKey="r2" 
                          position="right" 
                          formatter={(v: any) => `R²=${v}`} 
                          style={{ fontSize: 10, fill: '#87A96B', fontWeight: 'bold' }} 
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Weather Trend Chart (When weather data exists) */}
            {data.weather_trends && data.weather_trends.length > 0 && (
              <div className="rounded-2xl border border-stone-200/90 bg-warm-white p-6 shadow-xs dark:border-stone-800 dark:bg-walnut">
                <div className="border-b border-stone-100 pb-3 dark:border-stone-800">
                  <h3 className="font-heading text-base font-bold text-walnut dark:text-cream">
                    Weather and climate time series (NASA POWER)
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Mean annual 2-meter air temperature (°C), annual rainfall (mm), and relative humidity (%)
                  </p>
                </div>
                <div className="mt-6 h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.weather_trends} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#FFFDF8', borderRadius: 12, border: '1px solid #E8DFD0' }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="mean_temperature_c" name="Mean Temp (°C)" stroke="#D5851F" strokeWidth={2} />
                      <Line type="monotone" dataKey="mean_relative_humidity_pct" name="Humidity (%)" stroke="#2563EB" strokeWidth={2} strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="annual_rainfall_mm" name="Rainfall / 10 (mm)" stroke="#87A96B" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyState 
            title="No analytics data available" 
            description="No historical records match the selected combination of crop, region, and season."
            actionLabel="Reset filters"
            onAction={handleResetFilters}
          />
        )}

      </section>

    </div>
  );
};
