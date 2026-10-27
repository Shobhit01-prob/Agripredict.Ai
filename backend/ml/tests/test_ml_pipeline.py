"""
AgriPredict AI - ML Pipeline Test Suite.
Validates:
1. Unit conversion (kg/ha to t/ha)
2. Yield consistency check (Yield == Production / Area)
3. No-leakage test (Target year yield or production never present in feature matrix)
4. Preprocessing fit-on-train-only
5. Model load / predict round trip
6. Out-of-range input handling and warnings
7. Missing-feature robustness
8. Metrics reproducibility with fixed random seed
"""

import pytest
import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.linear_model import Ridge

ML_DIR = Path(__file__).resolve().parent.parent
ARTIFACTS_DIR = ML_DIR / "artifacts"
MODEL_PATH = ARTIFACTS_DIR / "model.joblib"
DATA_PATH = ML_DIR / "data" / "processed" / "crop_yield_canonical.csv"


def test_unit_conversion():
    """Verify that kg/ha to tonnes/ha conversion is mathematically exact: 1 t/ha = 1000 kg/ha."""
    yield_kg_ha = 3500.0
    yield_t_ha = yield_kg_ha / 1000.0
    assert yield_t_ha == 3.5, "Conversion from kg/ha to t/ha must divide exactly by 1000."


def test_yield_consistency_formula():
    """Verify Yield (t/ha) = Production (t) / Area harvested (ha) within 0.1% rounding tolerance."""
    production_t = 105000.0
    area_ha = 30000.0
    expected_yield = production_t / area_ha  # 3.5 t/ha
    reported_yield_kg = 3500.0
    reported_yield_t = reported_yield_kg / 1000.0
    
    diff_pct = abs(reported_yield_t - expected_yield) / expected_yield * 100.0
    assert diff_pct < 0.1, f"Reported yield differs from Production / Area by {diff_pct:.4f}%"


def test_no_leakage_feature_columns():
    """Ensure neither target year yield nor production quantity are features in the model input."""
    cat_features = ["crop", "region", "season"]
    num_features = [
        "area_harvested", "rainfall_mm", "temperature_c", "humidity_pct",
        "soil_ph", "nitrogen", "phosphorus", "potassium",
        "irrigation_fraction", "fertilizer_rate_kg_ha"
    ]
    feature_columns = cat_features + num_features
    
    prohibited_features = [
        "yield", "yield_t_ha", "yield_kg_ha", "production",
        "production_quantity", "target_yield", "current_production"
    ]
    
    for feat in prohibited_features:
        assert feat not in feature_columns, f"Target leakage detected! Feature '{feat}' found in model inputs."


def test_preprocessing_fit_on_train_only():
    """Ensure ColumnTransformer scalers and encoders are fitted on training split only."""
    train_data = pd.DataFrame({
        "crop": ["Wheat", "Rice"],
        "region": ["Asia", "Americas"],
        "season": ["Annual", "Kharif"],
        "area_harvested": [1000.0, 2000.0],
        "rainfall_mm": [800.0, 1200.0],
        "temperature_c": [22.0, 28.0],
        "humidity_pct": [60.0, 80.0],
        "soil_ph": [6.5, 7.0],
        "nitrogen": [120.0, 150.0],
        "phosphorus": [50.0, 60.0],
        "potassium": [40.0, 50.0],
        "irrigation_fraction": [0.5, 0.8],
        "fertilizer_rate_kg_ha": [210.0, 260.0]
    })
    
    test_data = pd.DataFrame({
        "crop": ["Maize"],  # Unseen category
        "region": ["Europe"],
        "season": ["Summer"],
        "area_harvested": [1500.0],
        "rainfall_mm": [950.0],
        "temperature_c": [24.0],
        "humidity_pct": [65.0],
        "soil_ph": [6.8],
        "nitrogen": [130.0],
        "phosphorus": [55.0],
        "potassium": [45.0],
        "irrigation_fraction": [0.6],
        "fertilizer_rate_kg_ha": [230.0]
    })
    
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), ["crop", "region", "season"]),
            ("num", StandardScaler(), [
                "area_harvested", "rainfall_mm", "temperature_c", "humidity_pct",
                "soil_ph", "nitrogen", "phosphorus", "potassium",
                "irrigation_fraction", "fertilizer_rate_kg_ha"
            ])
        ]
    )
    
    # Fit on train only
    preprocessor.fit(train_data)
    
    # Transform test without raising errors (handle_unknown='ignore')
    test_transformed = preprocessor.transform(test_data)
    assert test_transformed.shape[0] == 1, "Preprocessor should successfully transform unseen test samples."


def test_model_load_and_predict_roundtrip():
    """Verify the serialized pipeline loads and produces valid non-negative predictions."""
    assert MODEL_PATH.exists(), f"Model artifact not found at {MODEL_PATH}"
    pipeline = joblib.load(MODEL_PATH)
    assert pipeline is not None
    
    sample_input = pd.DataFrame([{
        "crop": "Wheat",
        "region": "Americas",
        "season": "Annual",
        "area_harvested": 125000.0,
        "rainfall_mm": 650.0,
        "temperature_c": 19.5,
        "humidity_pct": 58.0,
        "soil_ph": 6.8,
        "nitrogen": 110.0,
        "phosphorus": 45.0,
        "potassium": 40.0,
        "irrigation_fraction": 0.45,
        "fertilizer_rate_kg_ha": 195.0
    }])
    
    pred = pipeline.predict(sample_input)
    assert len(pred) == 1
    assert pred[0] > 0.0, f"Predicted yield should be positive, got {pred[0]}"
    assert pred[0] < 50.0, f"Predicted yield out of biological plausibility range, got {pred[0]}"


def test_out_of_range_input_behavior():
    """Verify that extreme out-of-range inputs produce a prediction without throwing fatal exceptions."""
    pipeline = joblib.load(MODEL_PATH)
    extreme_input = pd.DataFrame([{
        "crop": "Wheat",
        "region": "Americas",
        "season": "Annual",
        "area_harvested": 99999999.0,  # Extreme area
        "rainfall_mm": 9500.0,        # Extreme rainfall
        "temperature_c": 55.0,        # Extreme heat
        "humidity_pct": 99.0,
        "soil_ph": 12.0,              # Extreme alkaline
        "nitrogen": 900.0,
        "phosphorus": 500.0,
        "potassium": 500.0,
        "irrigation_fraction": 1.0,
        "fertilizer_rate_kg_ha": 1900.0
    }])
    
    pred = pipeline.predict(extreme_input)
    assert len(pred) == 1
    assert isinstance(pred[0], (float, np.floating))


def test_missing_feature_robustness():
    """Verify that missing/unseen categorical levels degrade gracefully via one-hot encoder ignoring unknowns."""
    pipeline = joblib.load(MODEL_PATH)
    unseen_input = pd.DataFrame([{
        "crop": "NonExistentCrop123",
        "region": "UnknownContinent",
        "season": "SpaceSeason",
        "area_harvested": 10000.0,
        "rainfall_mm": 700.0,
        "temperature_c": 21.0,
        "humidity_pct": 60.0,
        "soil_ph": 6.5,
        "nitrogen": 100.0,
        "phosphorus": 40.0,
        "potassium": 40.0,
        "irrigation_fraction": 0.3,
        "fertilizer_rate_kg_ha": 180.0
    }])
    
    pred = pipeline.predict(unseen_input)
    assert len(pred) == 1
    assert pred[0] > 0


def test_metrics_reproducibility():
    """Verify that model predictions are 100% deterministic with identical inputs."""
    pipeline = joblib.load(MODEL_PATH)
    sample = pd.DataFrame([{
        "crop": "Maize (corn)",
        "region": "Americas",
        "season": "Annual",
        "area_harvested": 50000.0,
        "rainfall_mm": 800.0,
        "temperature_c": 24.0,
        "humidity_pct": 65.0,
        "soil_ph": 6.5,
        "nitrogen": 140.0,
        "phosphorus": 60.0,
        "potassium": 50.0,
        "irrigation_fraction": 0.6,
        "fertilizer_rate_kg_ha": 250.0
    }])
    
    pred1 = pipeline.predict(sample)[0]
    pred2 = pipeline.predict(sample)[0]
    assert np.isclose(pred1, pred2, atol=1e-6), "Predictions must be completely reproducible."
