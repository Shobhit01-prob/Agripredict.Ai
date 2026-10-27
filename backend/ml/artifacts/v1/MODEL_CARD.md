# Model Card: AgriPredict AI Crop Yield Regressor (v1.4.2)

## Model Details
- **Model Name**: LightGBM AgroRegressor
- **Model Version**: v1.4.2-faostat
- **Architecture**: LightGBM Gradient Boosted Decision Trees with Scikit-Learn `ColumnTransformer` (One-Hot Encoding for categorical features, `StandardScaler` for continuous features)
- **Training Date**: 2026-10-25
- **Maintainers**: AgriPredict AI ML Engineering Team
- **License**: Apache-2.0

## Intended Use
- **Primary Use Case**: Estimating crop yield in tonnes per hectare (t/ha) for major commercial and subsistence staple crops given regional, seasonal, climatic, and input parameters.
- **Intended Users**: Agronomists, farm managers, agricultural planners, agricultural extension officers, and researchers.
- **Out-of-Scope Uses**: Sub-field precision micro-irrigation nozzle calibration; single-day pest outbreak shock prediction; financial derivative speculation.

## Training Data & Lineage
- **Primary Source**: FAOSTAT QCL (Production: Crops and livestock products, 1961–2024). Bulk dataset downloaded and verified without schema assumptions.
- **Agroclimatology**: NASA POWER daily and monthly meteorological assimilation (precipitation, 2m temperature, relative humidity).
- **Target Variable**: `yield_t_ha` (tonnes per hectare, normalized from official reported values with `Production (t) / Area (ha)` cross-verification).
- **Observations**: 25,515 global agricultural time-series records across 169 crops and 244 countries/regions.
- **Splits**: 80% training (20,412 samples), 20% test (5,103 samples) with chronological and regional cross-validation.

## Factors & Key Features
1. `crop` (Categorical): Crop species (Wheat, Maize, Rice, Potatoes, Soybeans, Tomatoes, etc.)
2. `region` (Categorical): Global macro-region (Americas, Asia, Europe, Africa, Oceania)
3. `season` (Categorical): Cropping cycle (Annual, Kharif, Rabi, Summer, Winter, Spring, Autumn)
4. `area_harvested` (Numerical): Area cultivated in hectares (ha)
5. `rainfall_mm` (Numerical): Annual / seasonal precipitation in mm
6. `temperature_c` (Numerical): Mean seasonal temperature in °C
7. `humidity_pct` (Numerical): Mean relative humidity in %
8. `soil_ph` (Numerical): Soil acidity/alkalinity scale (4.0 - 9.0)
9. `nitrogen`, `phosphorus`, `potassium` (Numerical): Nutrient concentrations in kg/ha
10. `irrigation_fraction` (Numerical): Proportion of cropped area under active irrigation (0.0 - 1.0)
11. `fertilizer_rate_kg_ha` (Numerical): Total composite fertilizer rate (kg/ha)

## Performance Metrics (Test Set)
- **Mean Absolute Error (MAE)**: 2.680 t/ha
- **Root Mean Squared Error (RMSE)**: 4.608 t/ha
- **Coefficient of Determination (R²)**: 0.666
- **Benchmark Comparison**:
  - Random Forest (150 trees): RMSE 4.551, R² 0.675
  - Gradient Boosting: RMSE 4.576, R² 0.671
  - LightGBM (Selected Active): RMSE 4.608, R² 0.666 (chosen for 20x faster inference latency in real-time what-if scenario optimization)
  - Ridge Regression (L2): RMSE 4.888, R² 0.625

## Limitations & Ethical Considerations
- **Non-Causality Disclaimer**: Optimization what-if scenarios are predictive statistical approximations derived from historical multi-country distributions, not physical or pharmacological proofs of direct causation.
- **Extreme Weather**: Catastrophic hail, flash flooding, or locust swarms falling outside climatological historical distributions are not modeled by macro-annual climate indices.
- **Unseen Input Bounds**: Out-of-distribution values (e.g. soil pH < 3.0 or > 10.0, or rainfall > 6000 mm) trigger automatic warning flags to prevent deceptive precision.
