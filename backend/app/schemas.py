from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, EmailStr, Field

# --- Auth Schemas ---
class UserSignup(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
    password: str = Field(..., min_length=8, max_length=100)

class UserLogin(BaseModel):
    email: str = Field(..., pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
    password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    created_at: str

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)

# --- Predict Schemas ---
class PredictRequest(BaseModel):
    country: str = Field(..., min_length=1)
    state_district: Optional[str] = None
    crop: str = Field(..., min_length=1)
    variety: Optional[str] = None
    season: str = Field(default="Annual")
    year: int = Field(default=2025, ge=1960, le=2050)
    area_ha: float = Field(..., gt=0)
    soil_type: Optional[str] = "Sandy loam"
    soil_ph: Optional[float] = Field(default=6.5, ge=3.0, le=10.0)
    soil_moisture_pct: Optional[float] = Field(default=35.0, ge=0.0, le=100.0)
    nitrogen: Optional[float] = Field(default=120.0, ge=0.0)
    phosphorus: Optional[float] = Field(default=60.0, ge=0.0)
    potassium: Optional[float] = Field(default=40.0, ge=0.0)
    rainfall_mm: float = Field(..., ge=0.0, le=5000.0)
    temperature_c: float = Field(..., ge=-15.0, le=55.0)
    humidity_pct: Optional[float] = Field(default=65.0, ge=10.0, le=100.0)
    irrigation_fraction: Optional[float] = Field(default=0.75, ge=0.0, le=1.0)
    fertilizer_rate_kg_ha: Optional[float] = Field(default=220.0, ge=0.0)
    historical_yield_t_ha: Optional[float] = Field(default=4.25, ge=0.0)

class FactorContribution(BaseModel):
    feature_name: str
    contribution_pct: int
    impact_direction: Literal["positive", "negative", "neutral"]
    description: str

class AgronomicSuggestion(BaseModel):
    category: Literal["fertilizer", "irrigation", "soil", "timing", "risk"]
    title: str
    recommendation: str
    potential_yield_impact_pct: float

class UncertaintyRange(BaseModel):
    lower_bound_t_ha: float
    upper_bound_t_ha: float
    confidence_level_pct: int = 90
    method: str = "Residual bootstrap distribution"

class PredictResponse(BaseModel):
    predicted_yield_t_ha: float
    total_production_tonnes: float
    baseline_yield_t_ha: float
    yield_change_vs_baseline_pct: float
    main_factors: List[FactorContribution]
    suggestions: List[AgronomicSuggestion]
    model_name: str
    model_version: str
    warnings: List[str]
    uncertainty_range: Optional[UncertaintyRange] = None
    is_model_trained: bool = True

class SavePredictionPayload(BaseModel):
    inputs: PredictRequest
    prediction: PredictResponse

class SavedPredictionOut(BaseModel):
    id: int
    user_id: int
    crop: str
    country: str
    year: int
    area_ha: float
    predicted_yield_t_ha: float
    total_production_tonnes: float
    baseline_yield_t_ha: float
    model_version: str
    created_at: str
    inputs: Dict[str, Any]
    main_factors: List[FactorContribution]
    suggestions: List[AgronomicSuggestion]
    uncertainty_range: Optional[UncertaintyRange] = None

# --- Optimize Schemas ---
OptimizationObjectiveType = Literal[
    "maximize_yield", "minimize_cost", "yield_per_water", "balanced"
]

class ScenarioInput(BaseModel):
    name: str
    crop: str
    area_ha: float = 50.0
    irrigation_fraction: float = Field(default=0.75, ge=0.0, le=1.0)
    fertilizer_rate_kg_ha: float = Field(default=220.0, ge=0.0, le=500.0)
    planting_period: str = "Optimal"
    crop_price_per_tonne: Optional[float] = None
    water_cost_per_m3: Optional[float] = None
    fertilizer_cost_per_kg: Optional[float] = None

class OptimizeRequest(BaseModel):
    scenarios: List[ScenarioInput]
    objective: OptimizationObjectiveType = "balanced"

class ScenarioResult(BaseModel):
    name: str
    inputs: ScenarioInput
    predicted_yield_t_ha: float
    total_production_tonnes: float
    estimated_cost_usd: Optional[float] = None
    estimated_revenue_usd: Optional[float] = None
    estimated_profit_usd: Optional[float] = None
    water_use_index: int
    fertilizer_use_index: int
    objective_score: float
    rank: int

class OptimizeResponse(BaseModel):
    baseline: ScenarioResult
    scenarios: List[ScenarioResult]
    recommended_scenario: ScenarioResult
    objective: str
    trade_off_summary: str
    disclaimer: str

# --- Analytics Schemas ---
class AnalyticsKPIs(BaseModel):
    latest_yield_t_ha: float
    yield_change_pct: float
    total_production_tonnes: float
    cultivated_area_ha: float
    average_rainfall_mm: float
    highest_yielding_region: Dict[str, Any]

class YieldTrendPoint(BaseModel):
    year: int
    yield_t_ha: float
    moving_average_3yr: float
    rainfall_mm: float
    temperature_c: float

class RegionalYieldItem(BaseModel):
    region: str
    latest_year_yield_t_ha: float
    period_average_yield_t_ha: float

class ProductionAreaScatterItem(BaseModel):
    country_region: str
    year: int
    area_ha: float
    production_tonnes: float
    yield_t_ha: float

class ActualVsPredictedItem(BaseModel):
    sample_id: int
    crop: str
    country: str
    year: int
    actual_yield_t_ha: float
    predicted_yield_t_ha: float
    residual: float

class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float
    description: str

class ModelComparisonItem(BaseModel):
    model_name: str
    rmse: float
    mae: float
    r2: float
    is_active: bool

class WeatherTrendItem(BaseModel):
    year: int
    mean_temperature_c: float
    annual_rainfall_mm: float
    mean_relative_humidity_pct: float

class AnalyticsOverviewResponse(BaseModel):
    filters_applied: Dict[str, Any]
    kpis: AnalyticsKPIs
    yield_trends: List[YieldTrendPoint]
    growth_index: List[Dict[str, Any]]
    regional_yields: List[RegionalYieldItem]
    production_area_scatter: List[ProductionAreaScatterItem]
    actual_vs_predicted: Dict[str, Any]
    rainfall_and_yield: List[YieldTrendPoint]
    feature_importance: List[FeatureImportanceItem]
    model_comparison: List[ModelComparisonItem]
    weather_trends: List[WeatherTrendItem]

# --- Metadata Schemas ---
class CropMetadataOut(BaseModel):
    id: str
    name: str
    category: str
    typical_yield_range: str
    optimum_temp_c: str
    water_requirement_mm: str
    growth_duration_days: str
    primary_regions: List[str]

class DatasetMetadataOut(BaseModel):
    dataset_name: str
    source_organization: str
    direct_url: str
    access_date: str
    license: str
    time_span: str
    total_records: int
    crops_covered: int
    countries_covered: int
    last_updated: str
    missing_values_summary: List[Dict[str, Any]]
    quality_warnings: List[str]

class CSVValidationRow(BaseModel):
    row_number: int
    status: Literal["valid", "warning", "error"]
    messages: List[str]
    data: Dict[str, Any]

class CSVUploadAuditOut(BaseModel):
    filename: str
    total_rows: int
    valid_rows: int
    error_rows: int
    preview: List[CSVValidationRow]
    validation_errors: List[str]
    message: str
