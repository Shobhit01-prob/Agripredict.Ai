import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { PredictRequest, PredictResponse, CropMetadata } from '../types';
import { 
  Sprout, 
  HelpCircle, 
  RotateCcw, 
  Sparkles, 
  Bookmark, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Info, 
  ArrowRight,
  ShieldAlert,
  Sliders,
  Layers,
  Thermometer,
  CloudRain,
  Activity
} from 'lucide-react';

const INITIAL_FORM: PredictRequest = {
  country: 'Northern Plains',
  state_district: 'Central District',
  crop: 'Wheat',
  variety: 'PBW-343 High Yield',
  season: 'Rabi',
  year: 2025,
  area_ha: 50,
  soil_type: 'Sandy loam',
  soil_ph: 6.5,
  soil_moisture_pct: 35,
  nitrogen: 120,
  phosphorus: 60,
  potassium: 40,
  rainfall_mm: 720,
  temperature_c: 21.5,
  humidity_pct: 65,
  irrigation_fraction: 0.75,
  fertilizer_rate_kg_ha: 220,
  historical_yield_t_ha: 4.25
};

const SAMPLE_BENCHMARKS: Record<string, PredictRequest> = {
  wheat: {
    country: 'Northern Plains',
    state_district: 'Valley Agricultural Zone',
    crop: 'Wheat',
    variety: 'HD-2967 Agronomic Elite',
    season: 'Rabi',
    year: 2025,
    area_ha: 40,
    soil_type: 'Clay loam',
    soil_ph: 6.8,
    soil_moisture_pct: 38,
    nitrogen: 130,
    phosphorus: 65,
    potassium: 45,
    rainfall_mm: 680,
    temperature_c: 20.8,
    humidity_pct: 62,
    irrigation_fraction: 0.8,
    fertilizer_rate_kg_ha: 240,
    historical_yield_t_ha: 4.4
  },
  maize: {
    country: 'Central Basins',
    state_district: 'Western River Corridor',
    crop: 'Maize (Corn)',
    variety: 'Pioneer P3394',
    season: 'Kharif',
    year: 2025,
    area_ha: 80,
    soil_type: 'Silt loam',
    soil_ph: 6.4,
    soil_moisture_pct: 42,
    nitrogen: 160,
    phosphorus: 75,
    potassium: 60,
    rainfall_mm: 820,
    temperature_c: 25.2,
    humidity_pct: 70,
    irrigation_fraction: 0.6,
    fertilizer_rate_kg_ha: 295,
    historical_yield_t_ha: 7.2
  },
  rice: {
    country: 'Delta Lowlands',
    state_district: 'Coastal Alluvial Plains',
    crop: 'Rice (Paddy)',
    variety: 'Swarna Sub1',
    season: 'Kharif',
    year: 2025,
    area_ha: 35,
    soil_type: 'Alluvial',
    soil_ph: 6.2,
    soil_moisture_pct: 55,
    nitrogen: 110,
    phosphorus: 50,
    potassium: 50,
    rainfall_mm: 1150,
    temperature_c: 28.0,
    humidity_pct: 82,
    irrigation_fraction: 0.9,
    fertilizer_rate_kg_ha: 210,
    historical_yield_t_ha: 4.1
  }
};

export const PredictPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState<PredictRequest>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [cropsList, setCropsList] = useState<CropMetadata[]>([]);
  const [regionsList, setRegionsList] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchMeta = async () => {
      try {
        const [c, r] = await Promise.all([api.getCrops(), api.getRegions()]);
        if (mounted) {
          setCropsList(c);
          setRegionsList(r.filter((reg) => reg !== 'All Regions'));
        }
      } catch (err) {
        // fallback
      }
    };
    fetchMeta();

    // Check if user came back after login with saved state
    const savedState = sessionStorage.getItem('pending_prediction_form');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setFormData(parsed.form);
        if (parsed.result) setResult(parsed.result);
        sessionStorage.removeItem('pending_prediction_form');
        showToast('Restored your prediction session. You can now save it to your history.', 'info');
      } catch {}
    }

    return () => { mounted = false; };
  }, [showToast]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.country.trim()) errors.country = 'Country or region is required';
    if (!formData.crop.trim()) errors.crop = 'Crop is required';
    if (!formData.season.trim()) errors.season = 'Season is required';
    if (!formData.year || formData.year < 1960 || formData.year > 2050) {
      errors.year = 'Enter a valid year between 1960 and 2050';
    }
    if (!formData.area_ha || formData.area_ha <= 0) {
      errors.area_ha = 'Cultivated area must be greater than 0 ha';
    }
    if (formData.rainfall_mm === undefined || formData.rainfall_mm < 0 || formData.rainfall_mm > 5000) {
      errors.rainfall_mm = 'Rainfall must be between 0 and 5000 mm';
    }
    if (formData.temperature_c === undefined || formData.temperature_c < -15 || formData.temperature_c > 55) {
      errors.temperature_c = 'Temperature must be between -15 °C and 55 °C';
    }
    if (formData.soil_ph !== undefined && (formData.soil_ph < 3.0 || formData.soil_ph > 10.0)) {
      errors.soil_ph = 'Soil pH must be between 3.0 and 10.0';
    }
    if (formData.soil_moisture_pct !== undefined && (formData.soil_moisture_pct < 0 || formData.soil_moisture_pct > 100)) {
      errors.soil_moisture_pct = 'Moisture must be 0 - 100%';
    }
    if (formData.irrigation_fraction !== undefined && (formData.irrigation_fraction < 0 || formData.irrigation_fraction > 1.0)) {
      errors.irrigation_fraction = 'Irrigation fraction must be between 0.0 and 1.0';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please fix the indicated validation errors before predicting.', 'warning');
      return;
    }

    setLoading(true);
    setModelError(null);

    try {
      const res = await api.predictYield(formData);
      if (!res.is_model_trained) {
        setModelError('Model not trained yet. The backend predictor has not loaded trained model weights.');
        setResult(null);
      } else {
        setResult(res);
        showToast('Yield forecast generated successfully.', 'success');
      }
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('model not trained')) {
        setModelError('Model not trained yet. The ML engine requires a trained model artifact.');
      } else {
        showToast(`Prediction failed: ${err.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;

    if (!isAuthenticated) {
      // Redirect to login and return afterwards
      sessionStorage.setItem('pending_prediction_form', JSON.stringify({ form: formData, result }));
      showToast('Please log in or sign up to save predictions to your account history.', 'info');
      navigate('/login?redirect=/predict');
      return;
    }

    setSaving(true);
    try {
      await api.savePrediction(formData, result);
      showToast('Prediction saved to your personal history!', 'success');
    } catch (err: any) {
      showToast(`Error saving prediction: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadSample = (key: string) => {
    const benchmark = SAMPLE_BENCHMARKS[key];
    if (benchmark) {
      setFormData(benchmark);
      setFormErrors({});
      showToast(`Loaded realistic sample data for ${benchmark.crop}.`, 'info');
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setFormErrors({});
    setResult(null);
    setModelError(null);
    showToast('Form has been reset to defaults.', 'info');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      
      {/* Page Header */}
      <div className="border-b border-stone-200/80 pb-6 dark:border-stone-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sage">
              <Sprout className="h-4 w-4" />
              <span>Inference Engine</span>
            </div>
            <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight text-walnut dark:text-cream sm:text-4xl">
              Predict crop yield
            </h1>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              Enter farm characteristics and climate variables to estimate expected yield (t/ha), total production, 
              and primary agronomic contributing factors.
            </p>
          </div>

          {/* Sample Load Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Load sample:</span>
            <button
              type="button"
              onClick={() => handleLoadSample('wheat')}
              className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
            >
              Wheat (Rabi)
            </button>
            <button
              type="button"
              onClick={() => handleLoadSample('maize')}
              className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
            >
              Maize (Corn)
            </button>
            <button
              type="button"
              onClick={() => handleLoadSample('rice')}
              className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
            >
              Rice (Paddy)
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Form on Left, Results on Right */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Form Container */}
        <div className="lg:col-span-7">
          <form onSubmit={handlePredict} className="rounded-2xl border border-stone-200/90 bg-warm-white p-6 sm:p-8 shadow-xs dark:border-stone-800 dark:bg-walnut">
            
            {/* Section 1: Geography & Crop Identification */}
            <div>
              <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-walnut dark:text-cream">
                <Layers className="h-5 w-5 text-sage" />
                <span>Crop and location</span>
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Country or region <span className="text-amber-glow">*</span>
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
                  >
                    {regionsList.length > 0 ? (
                      regionsList.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))
                    ) : (
                      <>
                        <option value="Northern Plains">Northern Plains</option>
                        <option value="Central Basins">Central Basins</option>
                        <option value="Delta Lowlands">Delta Lowlands</option>
                        <option value="Southern Riverine">Southern Riverine</option>
                        <option value="Western Irrigated Plains">Western Irrigated Plains</option>
                      </>
                    )}
                  </select>
                  {formErrors.country && <p className="mt-1 text-xs text-rose-500">{formErrors.country}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    State or district <span className="text-stone-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.state_district || ''}
                    onChange={(e) => setFormData({ ...formData, state_district: e.target.value })}
                    placeholder="e.g. Central Agronomic Zone"
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Crop species <span className="text-amber-glow">*</span>
                  </label>
                  <select
                    value={formData.crop}
                    onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
                  >
                    <option value="Wheat">Wheat</option>
                    <option value="Maize (Corn)">Maize (Corn)</option>
                    <option value="Rice (Paddy)">Rice (Paddy)</option>
                    <option value="Potatoes">Potatoes</option>
                    <option value="Soybeans">Soybeans</option>
                    <option value="Barley">Barley</option>
                  </select>
                  {formErrors.crop && <p className="mt-1 text-xs text-rose-500">{formErrors.crop}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Cultivar or variety <span className="text-stone-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.variety || ''}
                    onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                    placeholder="e.g. PBW-343, Swarna"
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Season <span className="text-amber-glow">*</span>
                  </label>
                  <select
                    value={formData.season}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
                  >
                    <option value="Kharif">Kharif (Monsoon / Summer)</option>
                    <option value="Rabi">Rabi (Winter / Spring)</option>
                    <option value="Annual">Annual / Perennial</option>
                    <option value="Summer">Summer (Zaid)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                      Crop year <span className="text-amber-glow">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 2025 })}
                      min="1960"
                      max="2050"
                      className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
                    />
                    {formErrors.year && <p className="mt-1 text-xs text-rose-500">{formErrors.year}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                      Area (ha) <span className="text-amber-glow">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.area_ha}
                      onChange={(e) => setFormData({ ...formData, area_ha: parseFloat(e.target.value) || 0 })}
                      min="0.1"
                      className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
                    />
                    {formErrors.area_ha && <p className="mt-1 text-xs text-rose-500">{formErrors.area_ha}</p>}
                  </div>
                </div>

              </div>
            </div>

            {/* Section 2: Soil & Nutrient Properties */}
            <div className="mt-8 border-t border-stone-200/80 pt-6 dark:border-stone-800">
              <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-walnut dark:text-cream">
                <Sprout className="h-5 w-5 text-sage" />
                <span>Soil and nutrients</span>
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Soil texture type
                  </label>
                  <select
                    value={formData.soil_type || 'Sandy loam'}
                    onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
                  >
                    <option value="Sandy loam">Sandy loam</option>
                    <option value="Clay loam">Clay loam</option>
                    <option value="Silt loam">Silt loam</option>
                    <option value="Alluvial">Alluvial</option>
                    <option value="Black soil">Black soil (Vertisol)</option>
                    <option value="Red soil">Red soil (Alfisol)</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-1 text-xs font-semibold text-stone-700 dark:text-stone-300">
                    <span>Soil pH</span>
                    <span title="Optimum agronomic range is typically 6.0 to 7.5">
                      <HelpCircle className="h-3.5 w-3.5 text-stone-400" />
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.soil_ph ?? 6.5}
                    onChange={(e) => setFormData({ ...formData, soil_ph: parseFloat(e.target.value) || 0 })}
                    min="3.0"
                    max="10.0"
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
                  />
                  {formErrors.soil_ph && <p className="mt-1 text-xs text-rose-500">{formErrors.soil_ph}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Soil moisture (%)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={formData.soil_moisture_pct ?? 35}
                    onChange={(e) => setFormData({ ...formData, soil_moisture_pct: parseFloat(e.target.value) || 0 })}
                    min="0"
                    max="100"
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
                  />
                  {formErrors.soil_moisture_pct && <p className="mt-1 text-xs text-rose-500">{formErrors.soil_moisture_pct}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Nitrogen (N kg/ha)
                  </label>
                  <input
                    type="number"
                    value={formData.nitrogen ?? 120}
                    onChange={(e) => setFormData({ ...formData, nitrogen: parseFloat(e.target.value) || 0 })}
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Phosphorus (P kg/ha)
                  </label>
                  <input
                    type="number"
                    value={formData.phosphorus ?? 60}
                    onChange={(e) => setFormData({ ...formData, phosphorus: parseFloat(e.target.value) || 0 })}
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Potassium (K kg/ha)
                  </label>
                  <input
                    type="number"
                    value={formData.potassium ?? 40}
                    onChange={(e) => setFormData({ ...formData, potassium: parseFloat(e.target.value) || 0 })}
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
                  />
                </div>

              </div>
            </div>

            {/* Section 3: Weather, Water & Field Management */}
            <div className="mt-8 border-t border-stone-200/80 pt-6 dark:border-stone-800">
              <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-walnut dark:text-cream">
                <CloudRain className="h-5 w-5 text-sage" />
                <span>Climate and management</span>
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Seasonal rainfall (mm) <span className="text-amber-glow">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.rainfall_mm}
                    onChange={(e) => setFormData({ ...formData, rainfall_mm: parseFloat(e.target.value) || 0 })}
                    min="0"
                    max="5000"
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
                  />
                  {formErrors.rainfall_mm && <p className="mt-1 text-xs text-rose-500">{formErrors.rainfall_mm}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Mean temperature (°C) <span className="text-amber-glow">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.temperature_c}
                    onChange={(e) => setFormData({ ...formData, temperature_c: parseFloat(e.target.value) || 0 })}
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
                  />
                  {formErrors.temperature_c && <p className="mt-1 text-xs text-rose-500">{formErrors.temperature_c}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Relative humidity (%)
                  </label>
                  <input
                    type="number"
                    value={formData.humidity_pct ?? 65}
                    onChange={(e) => setFormData({ ...formData, humidity_pct: parseFloat(e.target.value) || 0 })}
                    min="10"
                    max="100"
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1 text-xs font-semibold text-stone-700 dark:text-stone-300">
                    <span>Irrigation fraction (0 - 1)</span>
                    <span title="Fraction of crop water requirement satisfied via irrigation (1.0 = fully irrigated)">
                      <HelpCircle className="h-3.5 w-3.5 text-stone-400" />
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={formData.irrigation_fraction ?? 0.75}
                    onChange={(e) => setFormData({ ...formData, irrigation_fraction: parseFloat(e.target.value) || 0 })}
                    min="0"
                    max="1"
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
                  />
                  {formErrors.irrigation_fraction && <p className="mt-1 text-xs text-rose-500">{formErrors.irrigation_fraction}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Total fertilizer rate (kg/ha)
                  </label>
                  <input
                    type="number"
                    value={formData.fertilizer_rate_kg_ha ?? 220}
                    onChange={(e) => setFormData({ ...formData, fertilizer_rate_kg_ha: parseFloat(e.target.value) || 0 })}
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Historical baseline (t/ha)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={formData.historical_yield_t_ha ?? 4.25}
                    onChange={(e) => setFormData({ ...formData, historical_yield_t_ha: parseFloat(e.target.value) || 0 })}
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
                  />
                </div>

              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200/80 pt-6 dark:border-stone-800">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset form</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-glow px-6 py-2.5 text-sm font-semibold text-warm-white shadow-xs transition-all hover:bg-amber-hover hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-glow disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{loading ? 'Predicting...' : 'Predict yield'}</span>
                </button>
              </div>
            </div>

          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5">
          {modelError ? (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0" />
                <div>
                  <h3 className="font-heading text-lg font-bold">Model not trained yet</h3>
                  <p className="mt-2 text-sm leading-relaxed">
                    {modelError}
                  </p>
                  <p className="mt-3 text-xs text-stone-600 dark:text-stone-400">
                    Please visit the <a href="/data-model" className="underline font-semibold text-amber-700 dark:text-amber-300">Data and Model Center</a> to 
                    verify ingested datasets and trigger pipeline training. Never show invented predictions.
                  </p>
                </div>
              </div>
            </div>
          ) : result ? (
            <div className="rounded-2xl border border-stone-200/90 bg-warm-white p-6 shadow-xs dark:border-stone-800 dark:bg-walnut space-y-6">
              
              {/* Output Top Card */}
              <div className="rounded-xl border border-sage/30 bg-sage-50/50 p-5 dark:border-sage-700/40 dark:bg-sage-950/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-sage-700 dark:text-sage-300">
                    Forecasted Yield
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    {result.model_name} ({result.model_version})
                  </span>
                </div>
                
                <div className="mt-3 flex items-baseline gap-3">
                  <div className="font-heading text-4xl font-extrabold text-walnut dark:text-cream">
                    {result.predicted_yield_t_ha.toFixed(2)}
                  </div>
                  <div className="text-base font-semibold text-stone-600 dark:text-stone-300">
                    tonnes / hectare (t/ha)
                  </div>
                </div>

                {/* Production total & baseline comparison */}
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-sage/20 pt-3 text-xs">
                  <div>
                    <span className="text-stone-500 dark:text-stone-400">Total production:</span>
                    <p className="font-bold text-walnut dark:text-cream text-sm">
                      {result.total_production_tonnes.toLocaleString()} t
                    </p>
                  </div>
                  <div>
                    <span className="text-stone-500 dark:text-stone-400">Vs baseline ({result.baseline_yield_t_ha} t/ha):</span>
                    <div className="flex items-center gap-1 font-bold text-sm">
                      {result.yield_change_vs_baseline_pct >= 0 ? (
                        <span className="flex items-center text-emerald-600 dark:text-emerald-400">
                          <TrendingUp className="h-4 w-4 mr-0.5" />
                          +{result.yield_change_vs_baseline_pct.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="flex items-center text-rose-600 dark:text-rose-400">
                          <TrendingDown className="h-4 w-4 mr-0.5" />
                          {result.yield_change_vs_baseline_pct.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Validated Uncertainty Range (Only when provided) */}
                {result.uncertainty_range && (
                  <div className="mt-3 rounded-lg bg-warm-white/80 p-2.5 text-xs dark:bg-stone-900/60">
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                      {result.uncertainty_range.confidence_level_pct}% confidence interval:
                    </span>
                    <span className="ml-1.5 font-bold text-walnut dark:text-cream">
                      {result.uncertainty_range.lower_bound_t_ha.toFixed(2)} – {result.uncertainty_range.upper_bound_t_ha.toFixed(2)} t/ha
                    </span>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                      Method: {result.uncertainty_range.method}
                    </p>
                  </div>
                )}
              </div>

              {/* Main Contributing Factors */}
              <div>
                <h3 className="font-heading text-base font-bold text-walnut dark:text-cream">
                  Main contributing factors
                </h3>
                <div className="mt-3 space-y-2.5">
                  {result.main_factors.map((factor, idx) => (
                    <div key={idx} className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-3 text-xs dark:border-stone-800 dark:bg-stone-900/40">
                      <div className="flex items-center justify-between font-semibold text-walnut dark:text-cream">
                        <span>{factor.feature_name}</span>
                        <span className={
                          factor.impact_direction === 'positive' 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : factor.impact_direction === 'negative' 
                            ? 'text-rose-600 dark:text-rose-400' 
                            : 'text-stone-600 dark:text-stone-400'
                        }>
                          {factor.contribution_pct}% contribution
                        </span>
                      </div>
                      <p className="mt-1 text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
                        {factor.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agronomic Suggestions */}
              {result.suggestions && result.suggestions.length > 0 && (
                <div>
                  <h3 className="font-heading text-base font-bold text-walnut dark:text-cream">
                    Agronomic suggestions
                  </h3>
                  <div className="mt-3 space-y-2">
                    {result.suggestions.map((sug, i) => (
                      <div key={i} className="flex items-start gap-2.5 rounded-xl border border-amber-200/50 bg-amber-50/30 p-3 text-xs dark:border-amber-900/40 dark:bg-amber-950/20">
                        <CheckCircle2 className="h-4 w-4 text-amber-glow shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-walnut dark:text-cream">{sug.title}</span>
                          <p className="mt-0.5 text-stone-600 dark:text-stone-300 text-[11px]">
                            {sug.recommendation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings (if any) */}
              {result.warnings && result.warnings.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    <span>Agronomic boundary note</span>
                  </div>
                  <ul className="mt-1 list-disc pl-4 space-y-0.5 text-[11px]">
                    {result.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Save Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-sage px-5 py-3 text-sm font-semibold text-warm-white shadow-xs transition-all hover:bg-sage-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
                >
                  <Bookmark className="h-4 w-4" />
                  <span>{saving ? 'Saving...' : 'Save prediction to history'}</span>
                </button>
                {!isAuthenticated && (
                  <p className="mt-2 text-center text-xs text-stone-500 dark:text-stone-400">
                    Clicking save while logged out will take you to Log in and preserve your results.
                  </p>
                )}
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300/80 bg-stone-50/50 p-12 text-center dark:border-stone-800 dark:bg-stone-900/30 min-h-[420px]">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-500">
                <Activity className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-semibold text-walnut dark:text-cream">
                Ready to forecast
              </h3>
              <p className="mt-2 max-w-xs text-sm text-stone-600 dark:text-stone-400">
                Fill in the farm characteristics on the left or load a sample benchmark, then click "Predict yield".
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
