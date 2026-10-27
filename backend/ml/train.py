"""
AgriPredict AI - Machine Learning Model Training and Evaluation Pipeline.
Trains LightGBM alongside Random Forest, Gradient Boosting, and Ridge models
on real canonical FAOSTAT data, calculates evaluation metrics (MAE, RMSE, R²),
extracts feature importance, and serializes model artifacts.
"""

import os
import sys
import json
from pathlib import Path
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import Ridge
from lightgbm import LGBMRegressor

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "processed" / "crop_yield_canonical.csv"
ARTIFACTS_DIR = BASE_DIR / "artifacts"
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

def train_and_evaluate():
    print(f"Loading canonical dataset from {DATA_PATH}...")
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Missing {DATA_PATH}. Please run preprocess.py first.")
        
    df = pd.read_csv(DATA_PATH)
    print(f"Dataset loaded: {len(df):,} samples.")
    
    # Feature columns
    cat_features = ["crop", "region", "season"]
    num_features = [
        "area_harvested", "rainfall_mm", "temperature_c", "humidity_pct",
        "soil_ph", "nitrogen", "phosphorus", "potassium",
        "irrigation_fraction", "fertilizer_rate_kg_ha"
    ]
    target_col = "yield_t_ha"
    
    X = df[cat_features + num_features]
    y = df[target_col]
    
    # Train / Test split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )
    print(f"Train samples: {len(X_train):,}, Test samples: {len(X_test):,}")
    
    # Preprocessor
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_features),
            ("num", StandardScaler(), num_features)
        ]
    )
    
    # Define models for benchmarking
    candidate_models = {
        "LightGBM Regressor (Active)": LGBMRegressor(
            n_estimators=250,
            learning_rate=0.06,
            num_leaves=35,
            subsample=0.85,
            colsample_bytree=0.85,
            random_state=42,
            verbose=-1
        ),
        "Random Forest (150 trees)": RandomForestRegressor(
            n_estimators=150,
            max_depth=14,
            random_state=42,
            n_jobs=-1
        ),
        "Gradient Boosting (Scikit)": GradientBoostingRegressor(
            n_estimators=150,
            learning_rate=0.08,
            max_depth=5,
            random_state=42
        ),
        "Ridge Regression (L2)": Ridge(alpha=10.0)
    }
    
    model_comparisons = []
    trained_pipelines = {}
    
    print("\nTraining and evaluating benchmark models...")
    for model_name, model in candidate_models.items():
        pipe = Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("regressor", model)
        ])
        pipe.fit(X_train, y_train)
        preds = pipe.predict(X_test)
        
        mae = float(mean_absolute_error(y_test, preds))
        mse = float(mean_squared_error(y_test, preds))
        rmse = float(np.sqrt(mse))
        r2 = float(r2_score(y_test, preds))
        
        is_active = "LightGBM" in model_name
        model_comparisons.append({
            "model_name": model_name,
            "rmse": round(rmse, 3),
            "mae": round(mae, 3),
            "r2": round(r2, 3),
            "is_active": is_active
        })
        trained_pipelines[model_name] = pipe
        print(f" - {model_name:30s} | RMSE: {rmse:.3f} | MAE: {mae:.3f} | R²: {r2:.3f}")
        
    # Active model is LightGBM
    active_name = "LightGBM Regressor (Active)"
    active_pipeline = trained_pipelines[active_name]
    
    # Save the full model artifact
    model_artifact_path = ARTIFACTS_DIR / "model.joblib"
    joblib.dump(active_pipeline, model_artifact_path)
    print(f"\nSerialized active model pipeline to {model_artifact_path}")
    
    # Extract Feature Importances from LightGBM
    ohe_cols = list(active_pipeline.named_steps["preprocessor"].named_transformers_["cat"].get_feature_names_out(cat_features))
    all_feature_names = ohe_cols + num_features
    raw_importances = active_pipeline.named_steps["regressor"].feature_importances_
    
    # Aggregate importances by logical feature group
    group_importances = {}
    for fname, imp in zip(all_feature_names, raw_importances):
        if fname.startswith("crop_"):
            group_importances["Crop Species"] = group_importances.get("Crop Species", 0.0) + imp
        elif fname.startswith("region_"):
            group_importances["Macro Region"] = group_importances.get("Macro Region", 0.0) + imp
        elif fname.startswith("season_"):
            group_importances["Seasonality"] = group_importances.get("Seasonality", 0.0) + imp
        elif fname == "rainfall_mm":
            group_importances["Annual Rainfall (mm)"] = imp
        elif fname == "temperature_c":
            group_importances["Mean Temperature (°C)"] = imp
        elif fname == "humidity_pct":
            group_importances["Relative Humidity (%)"] = imp
        elif fname == "soil_ph":
            group_importances["Soil pH Level"] = imp
        elif fname == "nitrogen":
            group_importances["Nitrogen Application (kg/ha)"] = imp
        elif fname == "phosphorus":
            group_importances["Phosphorus Rate (kg/ha)"] = imp
        elif fname == "potassium":
            group_importances["Potassium Rate (kg/ha)"] = imp
        elif fname == "irrigation_fraction":
            group_importances["Irrigation Management"] = imp
        elif fname == "fertilizer_rate_kg_ha":
            group_importances["Total Fertilizer Rate"] = imp
        elif fname == "area_harvested":
            group_importances["Cultivated Area Scale"] = imp
            
    total_imp = sum(group_importances.values())
    feature_importance_list = [
        {
            "feature": k,
            "importance": round(v / total_imp, 3),
            "description": f"Model weight in yield decision trees ({round((v/total_imp)*100, 1)}%)"
        }
        for k, v in sorted(group_importances.items(), key=lambda x: x[1], reverse=True)
    ]
    
    # Save Feature Importance JSON
    with open(ARTIFACTS_DIR / "feature_importance.json", "w") as f:
        json.dump(feature_importance_list, f, indent=2)
        
    # Save Model Benchmark Comparison JSON
    with open(ARTIFACTS_DIR / "model_comparison.json", "w") as f:
        json.dump(model_comparisons, f, indent=2)
        
    # Generate Actual vs Predicted test samples for scatter plot
    test_preds = active_pipeline.predict(X_test)
    test_df = X_test.copy()
    test_df["actual_yield_t_ha"] = y_test
    test_df["predicted_yield_t_ha"] = np.round(test_preds, 2)
    test_df["residual"] = np.round(test_df["actual_yield_t_ha"] - test_df["predicted_yield_t_ha"], 2)
    
    # Pull in country metadata
    test_df["country"] = df.loc[test_df.index, "country"]
    test_df["year"] = df.loc[test_df.index, "year"]
    
    # Pick 40 diverse test samples for the interactive scatter plot
    scatter_samples = []
    sampled = test_df.sample(min(45, len(test_df)), random_state=42)
    for idx, row in enumerate(sampled.to_dict(orient="records")):
        scatter_samples.append({
            "sample_id": idx + 1,
            "crop": row["crop"],
            "country": row["country"],
            "year": int(row["year"]),
            "actual_yield_t_ha": round(float(row["actual_yield_t_ha"]), 2),
            "predicted_yield_t_ha": round(float(row["predicted_yield_t_ha"]), 2),
            "residual": round(float(row["residual"]), 2)
        })
        
    active_eval = next(m for m in model_comparisons if m["is_active"])
    eval_payload = {
        "items": scatter_samples,
        "mae": active_eval["mae"],
        "rmse": active_eval["rmse"],
        "r_squared": active_eval["r2"]
    }
    with open(ARTIFACTS_DIR / "actual_vs_predicted.json", "w") as f:
        json.dump(eval_payload, f, indent=2)
        
    # Compute regional crop baseline yields
    baselines = df.groupby(["crop", "region"])["yield_t_ha"].agg(["mean", "median", "std"]).reset_index()
    baselines_dict = {}
    for _, row in baselines.iterrows():
        key = f"{row['crop']}::{row['region']}"
        baselines_dict[key] = {
            "mean": round(float(row["mean"]), 2),
            "median": round(float(row["median"]), 2),
            "std": round(float(row["std"]), 2)
        }
        
    # Also overall crop averages
    crop_averages = df.groupby("crop")["yield_t_ha"].agg(["mean", "median"]).to_dict(orient="index")
    for crop_name, stats in crop_averages.items():
        baselines_dict[crop_name] = {
            "mean": round(float(stats["mean"]), 2),
            "median": round(float(stats["median"]), 2),
            "std": 0.5
        }
        
    with open(ARTIFACTS_DIR / "crop_baselines.json", "w") as f:
        json.dump(baselines_dict, f, indent=2)
        
    # Metadata file
    metadata = {
        "model_name": "LightGBM AgroRegressor",
        "model_version": "v1.4.2-faostat",
        "training_date": "2026-10-25",
        "total_training_samples": len(X_train),
        "total_test_samples": len(X_test),
        "categorical_features": cat_features,
        "numerical_features": num_features,
        "target": target_col,
        "metrics": {
            "mae": active_eval["mae"],
            "rmse": active_eval["rmse"],
            "r2": active_eval["r2"]
        }
    }
    with open(ARTIFACTS_DIR / "model_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)
        
    print("\nML Pipeline successfully trained and all artifacts exported to backend/ml/artifacts/!")

if __name__ == "__main__":
    train_and_evaluate()
