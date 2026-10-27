// Shared TypeScript Types for AgriPredict AI

export interface User {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface PredictRequest {
  country: string;
  state_district?: string;
  crop: string;
  variety?: string;
  season: string;
  year: number;
  area_ha: number;
  soil_type?: string;
  soil_ph?: number;
  soil_moisture_pct?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  rainfall_mm: number;
  temperature_c: number;
  humidity_pct?: number;
  irrigation_fraction?: number;
  fertilizer_rate_kg_ha?: number;
  historical_yield_t_ha?: number;
}

export interface UncertaintyRange {
  lower_bound_t_ha: number;
  upper_bound_t_ha: number;
  confidence_level_pct: number;
  method: string;
}

export interface FactorContribution {
  feature_name: string;
  contribution_pct: number;
  impact_direction: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface AgronomicSuggestion {
  category: 'fertilizer' | 'irrigation' | 'soil' | 'timing' | 'risk';
  title: string;
  recommendation: string;
  potential_yield_impact_pct: number;
}

export interface PredictResponse {
  predicted_yield_t_ha: number;
  total_production_tonnes: number;
  baseline_yield_t_ha: number;
  yield_change_vs_baseline_pct: number;
  main_factors: FactorContribution[];
  suggestions: AgronomicSuggestion[];
  model_name: string;
  model_version: string;
  warnings: string[];
  uncertainty_range?: UncertaintyRange;
  is_model_trained: boolean;
}

export interface SavedPrediction {
  id: number;
  user_id: number;
  crop: string;
  country: string;
  year: number;
  area_ha: number;
  predicted_yield_t_ha: number;
  total_production_tonnes: number;
  baseline_yield_t_ha: number;
  model_version: string;
  created_at: string;
  inputs: PredictRequest;
  main_factors: FactorContribution[];
  suggestions: AgronomicSuggestion[];
  uncertainty_range?: UncertaintyRange;
}

export type OptimizationObjective = 
  | 'maximize_yield' 
  | 'minimize_cost' 
  | 'yield_per_water' 
  | 'balanced';

export interface ScenarioInput {
  name: string;
  crop: string;
  area_ha: number;
  irrigation_fraction: number;
  fertilizer_rate_kg_ha: number;
  planting_period: string; // e.g., 'Early', 'Optimal', 'Late'
  crop_price_per_tonne?: number;
  water_cost_per_m3?: number;
  fertilizer_cost_per_kg?: number;
}

export interface ScenarioResult {
  name: string;
  inputs: ScenarioInput;
  predicted_yield_t_ha: number;
  total_production_tonnes: number;
  estimated_cost_usd?: number;
  estimated_revenue_usd?: number;
  estimated_profit_usd?: number;
  water_use_index: number;
  fertilizer_use_index: number;
  objective_score: number;
  rank: number;
}

export interface OptimizeResponse {
  baseline: ScenarioResult;
  scenarios: ScenarioResult[];
  recommended_scenario: ScenarioResult;
  objective: OptimizationObjective;
  trade_off_summary: string;
  disclaimer: string;
}

export interface AnalyticsFilter {
  season?: string;
  crop?: string;
  region?: string;
  from_year?: number;
  to_year?: number;
}

export interface AnalyticsKPIs {
  latest_yield_t_ha: number;
  yield_change_pct: number;
  total_production_tonnes: number;
  cultivated_area_ha: number;
  average_rainfall_mm: number;
  highest_yielding_region: {
    region: string;
    yield_t_ha: number;
  };
}

export interface YieldTrendItem {
  year: number;
  yield_t_ha: number;
  moving_average_3yr: number;
  rainfall_mm: number;
  temperature_c: number;
}

export interface YieldGrowthIndexItem {
  year: number;
  [cropName: string]: number; // base year = 100
}

export interface RegionalYieldItem {
  region: string;
  latest_year_yield_t_ha: number;
  period_average_yield_t_ha: number;
}

export interface ProductionAreaScatterItem {
  country_region: string;
  year: number;
  area_ha: number;
  production_tonnes: number;
  yield_t_ha: number;
}

export interface ActualVsPredictedItem {
  sample_id: number;
  crop: string;
  country: string;
  year: number;
  actual_yield_t_ha: number;
  predicted_yield_t_ha: number;
  residual: number;
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
  description: string;
}

export interface ModelComparisonItem {
  model_name: string;
  rmse: number;
  mae: number;
  r2: number;
  is_active: boolean;
}

export interface WeatherTrendItem {
  year: number;
  mean_temperature_c: number;
  annual_rainfall_mm: number;
  mean_relative_humidity_pct: number;
}

export interface AnalyticsOverviewResponse {
  filters_applied: AnalyticsFilter;
  kpis: AnalyticsKPIs;
  yield_trends: YieldTrendItem[];
  growth_index: YieldGrowthIndexItem[];
  regional_yields: RegionalYieldItem[];
  production_area_scatter: ProductionAreaScatterItem[];
  actual_vs_predicted: {
    items: ActualVsPredictedItem[];
    mae: number;
    rmse: number;
    r_squared: number;
  };
  rainfall_and_yield: YieldTrendItem[];
  feature_importance: FeatureImportanceItem[];
  model_comparison: ModelComparisonItem[];
  weather_trends: WeatherTrendItem[];
}

export interface CropMetadata {
  id: string;
  name: string;
  category: string;
  typical_yield_range: string;
  optimum_temp_c: string;
  water_requirement_mm: string;
  growth_duration_days: string;
  primary_regions: string[];
}

export interface DataAvailabilityRow {
  crop: string;
  region: string;
  has_yield: boolean;
  has_area: boolean;
  has_production: boolean;
  has_soil_data: boolean;
  has_weather_data: boolean;
  has_fertilizer_data: boolean;
  record_count: number;
}

export interface DatasetMetadata {
  dataset_name: string;
  source_organization: string;
  direct_url: string;
  access_date: string;
  license: string;
  time_span: string;
  total_records: number;
  crops_covered: number;
  countries_covered: number;
  last_updated: string;
  missing_values_summary: {
    column: string;
    missing_count: number;
    missing_pct: number;
  }[];
  quality_warnings: string[];
}

export interface CSVValidationRow {
  row_number: number;
  status: 'valid' | 'warning' | 'error';
  messages: string[];
  data: Record<string, any>;
}

export interface CSVUploadAuditResponse {
  filename: string;
  total_rows: number;
  valid_rows: number;
  error_rows: number;
  preview: CSVValidationRow[];
  validation_errors: string[];
  message: string;
}
