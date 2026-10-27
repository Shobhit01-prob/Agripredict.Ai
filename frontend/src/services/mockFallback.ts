import { 
  AnalyticsOverviewResponse, 
  DatasetMetadata, 
  CropMetadata, 
  DataAvailabilityRow,
  PredictResponse,
  OptimizeResponse
} from '../types';

export const MOCK_CROPS: CropMetadata[] = [
  {
    id: 'wheat',
    name: 'Wheat',
    category: 'Cereal',
    typical_yield_range: '2.5 - 5.5 t/ha',
    optimum_temp_c: '15 - 24 °C',
    water_requirement_mm: '450 - 650 mm',
    growth_duration_days: '110 - 140 days',
    primary_regions: ['Northern Plains', 'Temperate Valleys', 'Central Basins', 'Eastern Plateau']
  },
  {
    id: 'maize',
    name: 'Maize (Corn)',
    category: 'Cereal',
    typical_yield_range: '4.5 - 9.5 t/ha',
    optimum_temp_c: '20 - 30 °C',
    water_requirement_mm: '500 - 800 mm',
    growth_duration_days: '90 - 130 days',
    primary_regions: ['Central Corn Belt', 'Southern Riverine', 'Western Irrigated Plains']
  },
  {
    id: 'rice',
    name: 'Rice (Paddy)',
    category: 'Cereal',
    typical_yield_range: '3.5 - 6.8 t/ha',
    optimum_temp_c: '22 - 32 °C',
    water_requirement_mm: '900 - 1400 mm',
    growth_duration_days: '105 - 150 days',
    primary_regions: ['Delta Lowlands', 'Monsoon River Basins', 'Coastal Alluvial']
  },
  {
    id: 'potatoes',
    name: 'Potatoes',
    category: 'Tuber',
    typical_yield_range: '18.0 - 34.0 t/ha',
    optimum_temp_c: '16 - 22 °C',
    water_requirement_mm: '400 - 600 mm',
    growth_duration_days: '90 - 120 days',
    primary_regions: ['Cool Highlands', 'Temperate Loam Valleys', 'Sub-Himalayan Footlands']
  },
  {
    id: 'soybeans',
    name: 'Soybeans',
    category: 'Legume',
    typical_yield_range: '2.0 - 3.8 t/ha',
    optimum_temp_c: '20 - 28 °C',
    water_requirement_mm: '450 - 700 mm',
    growth_duration_days: '100 - 135 days',
    primary_regions: ['Savanna Plains', 'Upper Midwest Basins', 'Black Soil Plateaus']
  },
  {
    id: 'barley',
    name: 'Barley',
    category: 'Cereal',
    typical_yield_range: '2.2 - 4.8 t/ha',
    optimum_temp_c: '12 - 20 °C',
    water_requirement_mm: '350 - 500 mm',
    growth_duration_days: '85 - 115 days',
    primary_regions: ['Arid Margins', 'High Altitude Steppes', 'Northern Highlands']
  }
];

export const MOCK_REGIONS = [
  'All Regions',
  'Northern Plains',
  'Central Basins',
  'Delta Lowlands',
  'Southern Riverine',
  'Western Irrigated Plains',
  'Eastern Plateau'
];

export const MOCK_DATA_AVAILABILITY: DataAvailabilityRow[] = [
  { crop: 'Wheat', region: 'Northern Plains', has_yield: true, has_area: true, has_production: true, has_soil_data: true, has_weather_data: true, has_fertilizer_data: true, record_count: 1420 },
  { crop: 'Wheat', region: 'Central Basins', has_yield: true, has_area: true, has_production: true, has_soil_data: true, has_weather_data: true, has_fertilizer_data: true, record_count: 1180 },
  { crop: 'Wheat', region: 'Delta Lowlands', has_yield: true, has_area: true, has_production: true, has_soil_data: true, has_weather_data: false, has_fertilizer_data: false, record_count: 640 },
  { crop: 'Maize (Corn)', region: 'Central Basins', has_yield: true, has_area: true, has_production: true, has_soil_data: true, has_weather_data: true, has_fertilizer_data: true, record_count: 1650 },
  { crop: 'Maize (Corn)', region: 'Southern Riverine', has_yield: true, has_area: true, has_production: true, has_soil_data: true, has_weather_data: true, has_fertilizer_data: true, record_count: 1390 },
  { crop: 'Rice (Paddy)', region: 'Delta Lowlands', has_yield: true, has_area: true, has_production: true, has_soil_data: true, has_weather_data: true, has_fertilizer_data: true, record_count: 1980 },
  { crop: 'Rice (Paddy)', region: 'Southern Riverine', has_yield: true, has_area: true, has_production: true, has_soil_data: true, has_weather_data: true, has_fertilizer_data: true, record_count: 1470 },
  { crop: 'Potatoes', region: 'Northern Plains', has_yield: true, has_area: true, has_production: true, has_soil_data: true, has_weather_data: true, has_fertilizer_data: true, record_count: 1120 },
  { crop: 'Soybeans', region: 'Central Basins', has_yield: true, has_area: true, has_production: true, has_soil_data: true, has_weather_data: true, has_fertilizer_data: true, record_count: 1250 }
];

export const MOCK_DATASET_METADATA: DatasetMetadata = {
  dataset_name: 'FAOSTAT Production Crops and Livestock (Normalized QCL)',
  source_organization: 'Food and Agriculture Organization of the United Nations (FAO)',
  direct_url: 'https://bulks-faostat.fao.org/production/Production_Crops_Livestock_E_All_Data_(Normalized).zip',
  access_date: '2026-10-25',
  license: 'FAO Open Access (CC-BY-4.0 / Open Data Licensing)',
  time_span: '1961 - 2024',
  total_records: 3820490,
  crops_covered: 172,
  countries_covered: 245,
  last_updated: 'October 2026',
  missing_values_summary: [
    { column: 'area_harvested', missing_count: 1240, missing_pct: 0.03 },
    { column: 'yield', missing_count: 2180, missing_pct: 0.05 },
    { column: 'soil_ph', missing_count: 450, missing_pct: 0.01 },
    { column: 'rainfall', missing_count: 310, missing_pct: 0.008 }
  ],
  quality_warnings: [
    'Extreme drought anomaly detected in Northern Plains for year 2002 (rainfall < 320 mm).',
    'Historical reporting boundary changes occurred in 1991 for post-Soviet countries.',
    'Yields above 99.5th percentile were validated against FAO agronomic upper bounds to filter reporting errors.'
  ]
};

export const MOCK_ANALYTICS: AnalyticsOverviewResponse = {
  filters_applied: {
    season: 'All Seasons',
    crop: 'All Crops',
    region: 'All Regions',
    from_year: 2005,
    to_year: 2024
  },
  kpis: {
    latest_yield_t_ha: 4.38,
    yield_change_pct: 18.4,
    total_production_tonnes: 842100000,
    cultivated_area_ha: 192300000,
    average_rainfall_mm: 742,
    highest_yielding_region: {
      region: 'Central Basins',
      yield_t_ha: 5.62
    }
  },
  yield_trends: [
    { year: 2005, yield_t_ha: 3.70, moving_average_3yr: 3.70, rainfall_mm: 710, temperature_c: 21.2 },
    { year: 2006, yield_t_ha: 3.65, moving_average_3yr: 3.68, rainfall_mm: 680, temperature_c: 21.5 },
    { year: 2007, yield_t_ha: 3.82, moving_average_3yr: 3.72, rainfall_mm: 750, temperature_c: 21.1 },
    { year: 2008, yield_t_ha: 3.90, moving_average_3yr: 3.79, rainfall_mm: 790, temperature_c: 21.0 },
    { year: 2009, yield_t_ha: 3.85, moving_average_3yr: 3.86, rainfall_mm: 640, temperature_c: 21.8 },
    { year: 2010, yield_t_ha: 4.02, moving_average_3yr: 3.92, rainfall_mm: 820, temperature_c: 21.3 },
    { year: 2011, yield_t_ha: 4.08, moving_average_3yr: 3.98, rainfall_mm: 770, temperature_c: 21.4 },
    { year: 2012, yield_t_ha: 3.95, moving_average_3yr: 4.02, rainfall_mm: 610, temperature_c: 22.1 },
    { year: 2013, yield_t_ha: 4.15, moving_average_3yr: 4.06, rainfall_mm: 780, temperature_c: 21.6 },
    { year: 2014, yield_t_ha: 4.22, moving_average_3yr: 4.11, rainfall_mm: 800, temperature_c: 21.5 },
    { year: 2015, yield_t_ha: 4.18, moving_average_3yr: 4.18, rainfall_mm: 720, temperature_c: 22.0 },
    { year: 2016, yield_t_ha: 4.29, moving_average_3yr: 4.23, rainfall_mm: 840, temperature_c: 21.7 },
    { year: 2017, yield_t_ha: 4.31, moving_average_3yr: 4.26, rainfall_mm: 760, temperature_c: 21.9 },
    { year: 2018, yield_t_ha: 4.26, moving_average_3yr: 4.29, rainfall_mm: 710, temperature_c: 22.2 },
    { year: 2019, yield_t_ha: 4.35, moving_average_3yr: 4.31, rainfall_mm: 790, temperature_c: 22.1 },
    { year: 2020, yield_t_ha: 4.39, moving_average_3yr: 4.33, rainfall_mm: 830, temperature_c: 21.8 },
    { year: 2021, yield_t_ha: 4.42, moving_average_3yr: 4.39, rainfall_mm: 750, temperature_c: 22.3 },
    { year: 2022, yield_t_ha: 4.34, moving_average_3yr: 4.38, rainfall_mm: 680, temperature_c: 22.5 },
    { year: 2023, yield_t_ha: 4.45, moving_average_3yr: 4.40, rainfall_mm: 780, temperature_c: 22.2 },
    { year: 2024, yield_t_ha: 4.38, moving_average_3yr: 4.39, rainfall_mm: 742, temperature_c: 22.4 }
  ],
  growth_index: [
    { year: 2005, Wheat: 100, Maize: 100, Rice: 100, Soybeans: 100, Potatoes: 100 },
    { year: 2008, Wheat: 105.4, Maize: 107.2, Rice: 103.8, Soybeans: 106.1, Potatoes: 102.5 },
    { year: 2011, Wheat: 110.2, Maize: 114.5, Rice: 108.2, Soybeans: 112.4, Potatoes: 106.3 },
    { year: 2014, Wheat: 114.0, Maize: 121.8, Rice: 111.5, Soybeans: 118.0, Potatoes: 109.8 },
    { year: 2017, Wheat: 116.5, Maize: 126.4, Rice: 114.2, Soybeans: 122.5, Potatoes: 112.4 },
    { year: 2020, Wheat: 118.6, Maize: 131.0, Rice: 117.8, Soybeans: 127.1, Potatoes: 115.0 },
    { year: 2024, Wheat: 118.4, Maize: 133.5, Rice: 119.2, Soybeans: 129.8, Potatoes: 116.8 }
  ],
  regional_yields: [
    { region: 'Central Basins', latest_year_yield_t_ha: 5.62, period_average_yield_t_ha: 5.21 },
    { region: 'Northern Plains', latest_year_yield_t_ha: 4.85, period_average_yield_t_ha: 4.52 },
    { region: 'Western Irrigated', latest_year_yield_t_ha: 4.60, period_average_yield_t_ha: 4.38 },
    { region: 'Delta Lowlands', latest_year_yield_t_ha: 4.12, period_average_yield_t_ha: 3.94 },
    { region: 'Southern Riverine', latest_year_yield_t_ha: 3.95, period_average_yield_t_ha: 3.82 },
    { region: 'Eastern Plateau', latest_year_yield_t_ha: 3.25, period_average_yield_t_ha: 3.10 }
  ],
  production_area_scatter: [
    { country_region: 'Northern Plains', year: 2024, area_ha: 42000000, production_tonnes: 203700000, yield_t_ha: 4.85 },
    { country_region: 'Central Basins', year: 2024, area_ha: 38500000, production_tonnes: 216370000, yield_t_ha: 5.62 },
    { country_region: 'Delta Lowlands', year: 2024, area_ha: 35000000, production_tonnes: 144200000, yield_t_ha: 4.12 },
    { country_region: 'Southern Riverine', year: 2024, area_ha: 29000000, production_tonnes: 114550000, yield_t_ha: 3.95 },
    { country_region: 'Western Irrigated', year: 2024, area_ha: 26000000, production_tonnes: 119600000, yield_t_ha: 4.60 },
    { country_region: 'Eastern Plateau', year: 2024, area_ha: 21800000, production_tonnes: 70850000, yield_t_ha: 3.25 },
    { country_region: 'Northern Plains', year: 2020, area_ha: 41200000, production_tonnes: 196500000, yield_t_ha: 4.77 },
    { country_region: 'Central Basins', year: 2020, area_ha: 37900000, production_tonnes: 208450000, yield_t_ha: 5.50 }
  ],
  actual_vs_predicted: {
    mae: 0.28,
    rmse: 0.39,
    r_squared: 0.892,
    items: [
      { sample_id: 1, crop: 'Wheat', country: 'Northern Plains', year: 2024, actual_yield_t_ha: 4.85, predicted_yield_t_ha: 4.79, residual: 0.06 },
      { sample_id: 2, crop: 'Wheat', country: 'Central Basins', year: 2024, actual_yield_t_ha: 5.20, predicted_yield_t_ha: 5.34, residual: -0.14 },
      { sample_id: 3, crop: 'Maize', country: 'Central Basins', year: 2024, actual_yield_t_ha: 7.85, predicted_yield_t_ha: 7.72, residual: 0.13 },
      { sample_id: 4, crop: 'Maize', country: 'Southern Riverine', year: 2024, actual_yield_t_ha: 6.40, predicted_yield_t_ha: 6.55, residual: -0.15 },
      { sample_id: 5, crop: 'Rice', country: 'Delta Lowlands', year: 2024, actual_yield_t_ha: 4.45, predicted_yield_t_ha: 4.38, residual: 0.07 },
      { sample_id: 6, crop: 'Rice', country: 'Southern Riverine', year: 2024, actual_yield_t_ha: 4.10, predicted_yield_t_ha: 4.02, residual: 0.08 },
      { sample_id: 7, crop: 'Soybeans', country: 'Central Basins', year: 2024, actual_yield_t_ha: 3.35, predicted_yield_t_ha: 3.42, residual: -0.07 },
      { sample_id: 8, crop: 'Soybeans', country: 'Eastern Plateau', year: 2024, actual_yield_t_ha: 2.70, predicted_yield_t_ha: 2.62, residual: 0.08 },
      { sample_id: 9, crop: 'Potatoes', country: 'Northern Plains', year: 2024, actual_yield_t_ha: 28.5, predicted_yield_t_ha: 27.9, residual: 0.60 },
      { sample_id: 10, crop: 'Barley', country: 'Western Irrigated', year: 2024, actual_yield_t_ha: 3.80, predicted_yield_t_ha: 3.91, residual: -0.11 }
    ]
  },
  rainfall_and_yield: [
    { year: 2015, yield_t_ha: 4.18, moving_average_3yr: 4.18, rainfall_mm: 720, temperature_c: 22.0 },
    { year: 2016, yield_t_ha: 4.29, moving_average_3yr: 4.23, rainfall_mm: 840, temperature_c: 21.7 },
    { year: 2017, yield_t_ha: 4.31, moving_average_3yr: 4.26, rainfall_mm: 760, temperature_c: 21.9 },
    { year: 2018, yield_t_ha: 4.26, moving_average_3yr: 4.29, rainfall_mm: 710, temperature_c: 22.2 },
    { year: 2019, yield_t_ha: 4.35, moving_average_3yr: 4.31, rainfall_mm: 790, temperature_c: 22.1 },
    { year: 2020, yield_t_ha: 4.39, moving_average_3yr: 4.33, rainfall_mm: 830, temperature_c: 21.8 },
    { year: 2021, yield_t_ha: 4.42, moving_average_3yr: 4.39, rainfall_mm: 750, temperature_c: 22.3 },
    { year: 2022, yield_t_ha: 4.34, moving_average_3yr: 4.38, rainfall_mm: 680, temperature_c: 22.5 },
    { year: 2023, yield_t_ha: 4.45, moving_average_3yr: 4.40, rainfall_mm: 780, temperature_c: 22.2 },
    { year: 2024, yield_t_ha: 4.38, moving_average_3yr: 4.39, rainfall_mm: 742, temperature_c: 22.4 }
  ],
  feature_importance: [
    { feature: 'Annual Rainfall (mm)', importance: 0.284, description: 'Growing season precipitation and soil moisture replenishment' },
    { feature: 'Nitrogen Application (kg/ha)', importance: 0.218, description: 'Soil vegetative nutrient availability' },
    { feature: 'Mean Temperature (°C)', importance: 0.165, description: 'Degree days and thermal stress during grain filling' },
    { feature: 'Irrigation Fraction', importance: 0.142, description: 'Controlled water buffer against precipitation deficits' },
    { feature: 'Soil pH', importance: 0.089, description: 'Root nutrient uptake efficiency and acidity balance' },
    { feature: 'Phosphorus / Potassium Index', importance: 0.062, description: 'Root development and disease tolerance minerals' },
    { feature: 'Cultivated Area Scale (ha)', importance: 0.040, description: 'Field management and mechanization efficiency index' }
  ],
  model_comparison: [
    { model_name: 'LightGBM Regressor (Active)', rmse: 0.39, mae: 0.28, r2: 0.892, is_active: true },
    { model_name: 'Random Forest (150 trees)', rmse: 0.44, mae: 0.32, r2: 0.865, is_active: false },
    { model_name: 'Gradient Boosting (Scikit)', rmse: 0.47, mae: 0.35, r2: 0.849, is_active: false },
    { model_name: 'Ridge Regression (L2)', rmse: 0.68, mae: 0.52, r2: 0.714, is_active: false }
  ],
  weather_trends: [
    { year: 2015, mean_temperature_c: 22.0, annual_rainfall_mm: 720, mean_relative_humidity_pct: 64 },
    { year: 2016, mean_temperature_c: 21.7, annual_rainfall_mm: 840, mean_relative_humidity_pct: 68 },
    { year: 2017, mean_temperature_c: 21.9, annual_rainfall_mm: 760, mean_relative_humidity_pct: 66 },
    { year: 2018, mean_temperature_c: 22.2, annual_rainfall_mm: 710, mean_relative_humidity_pct: 63 },
    { year: 2019, mean_temperature_c: 22.1, annual_rainfall_mm: 790, mean_relative_humidity_pct: 67 },
    { year: 2020, mean_temperature_c: 21.8, annual_rainfall_mm: 830, mean_relative_humidity_pct: 69 },
    { year: 2021, mean_temperature_c: 22.3, annual_rainfall_mm: 750, mean_relative_humidity_pct: 65 },
    { year: 2022, mean_temperature_c: 22.5, annual_rainfall_mm: 680, mean_relative_humidity_pct: 62 },
    { year: 2023, mean_temperature_c: 22.2, annual_rainfall_mm: 780, mean_relative_humidity_pct: 66 },
    { year: 2024, mean_temperature_c: 22.4, annual_rainfall_mm: 742, mean_relative_humidity_pct: 65 }
  ]
};

export const MOCK_SAMPLE_PREDICTIONS: PredictResponse = {
  predicted_yield_t_ha: 4.82,
  total_production_tonnes: 241.0,
  baseline_yield_t_ha: 4.25,
  yield_change_vs_baseline_pct: 13.4,
  main_factors: [
    { feature_name: 'Rainfall & Moisture', contribution_pct: 38, impact_direction: 'positive', description: 'Optimal seasonal rainfall (720 mm) supports vegetative development.' },
    { feature_name: 'Nitrogen Application', contribution_pct: 29, impact_direction: 'positive', description: 'Target fertilizer rate (120 kg/ha) matches cereal nutrient requirements.' },
    { feature_name: 'Temperature Window', contribution_pct: 18, impact_direction: 'neutral', description: 'Average temperature (21.5 °C) remains within standard grain filling range.' },
    { feature_name: 'Soil pH (6.4)', contribution_pct: 15, impact_direction: 'positive', description: 'Near-neutral soil pH facilitates efficient micronutrient absorption.' }
  ],
  suggestions: [
    { category: 'irrigation', title: 'Maintain supplementary irrigation during flowering', recommendation: 'A single 25 mm irrigation pass at the flowering stage will prevent moisture stress.', potential_yield_impact_pct: 6.5 },
    { category: 'fertilizer', title: 'Split nitrogen application', recommendation: 'Apply 60% of nitrogen at sowing and 40% at tillering to prevent leaching.', potential_yield_impact_pct: 5.0 },
    { category: 'risk', title: 'Monitor mid-season thermal spikes', recommendation: 'Temperatures over 31 °C during anthesis can cause floret sterility; ensure adequate soil cover.', potential_yield_impact_pct: -3.0 }
  ],
  model_name: 'LightGBM AgroRegressor',
  model_version: 'v1.4.2-faostat',
  warnings: [
    'Input nitrogen rate is slightly above regional average (historical median: 105 kg/ha).'
  ],
  uncertainty_range: {
    lower_bound_t_ha: 4.54,
    upper_bound_t_ha: 5.10,
    confidence_level_pct: 90,
    method: 'Residual bootstrap distribution'
  },
  is_model_trained: true
};
