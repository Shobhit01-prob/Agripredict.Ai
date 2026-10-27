import pytest
import io
import json
from datetime import datetime
from fastapi.testclient import TestClient

import sys
from pathlib import Path
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.app.main import app
from backend.app.database import Base, engine, SessionLocal
from backend.app.models import User, Prediction

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    # Cleanup tables
    db = SessionLocal()
    db.query(Prediction).delete()
    db.query(User).delete()
    db.commit()
    db.close()

def test_health_check():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True

def test_auth_signup_and_login():
    # 1. Signup
    signup_payload = {
        "full_name": "Test Agronomist",
        "email": "agronomist@example.com",
        "password": "SecurePassword123"
    }
    signup_res = client.post("/api/auth/signup", json=signup_payload)
    assert signup_res.status_code == 200
    auth_data = signup_res.json()
    assert "access_token" in auth_data
    assert "refresh_token" in auth_data
    assert auth_data["user"]["email"] == "agronomist@example.com"

    # 2. Duplicate Signup fails
    dup_res = client.post("/api/auth/signup", json=signup_payload)
    assert dup_res.status_code == 400

    # 3. Login with correct password
    login_payload = {
        "email": "agronomist@example.com",
        "password": "SecurePassword123"
    }
    login_res = client.post("/api/auth/login", json=login_payload)
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data

    # 4. Login with incorrect password returns generic error
    bad_login = client.post("/api/auth/login", json={"email": "agronomist@example.com", "password": "WrongPassword"})
    assert bad_login.status_code == 401
    assert bad_login.json()["detail"] == "Email or password is incorrect"

    # 5. Token refresh
    refresh_res = client.post("/api/auth/refresh", json={"refresh_token": login_data["refresh_token"]})
    assert refresh_res.status_code == 200
    assert "access_token" in refresh_res.json()

def test_prediction_endpoint():
    req = {
        "country": "Northern Plains",
        "crop": "Wheat",
        "season": "Rabi",
        "year": 2025,
        "area_ha": 40.0,
        "rainfall_mm": 680.0,
        "temperature_c": 21.0,
        "humidity_pct": 65.0,
        "soil_ph": 6.5,
        "nitrogen": 120.0,
        "phosphorus": 55.0,
        "potassium": 40.0,
        "irrigation_fraction": 0.8,
        "fertilizer_rate_kg_ha": 215.0,
        "historical_yield_t_ha": 4.2
    }
    res = client.post("/api/predict", json=req)
    assert res.status_code == 200
    data = res.json()
    assert data["predicted_yield_t_ha"] > 0
    assert data["total_production_tonnes"] == pytest.approx(data["predicted_yield_t_ha"] * 40.0, rel=1e-2)
    assert len(data["main_factors"]) > 0
    assert len(data["suggestions"]) > 0
    assert data["uncertainty_range"] is not None
    assert data["uncertainty_range"]["lower_bound_t_ha"] < data["uncertainty_range"]["upper_bound_t_ha"]

def test_prediction_persistence_and_export():
    # Create user
    signup_res = client.post("/api/auth/signup", json={
        "full_name": "Farmer John",
        "email": "john@farm.com",
        "password": "SecretFarmPassword"
    })
    token = signup_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Generate prediction
    pred_req = {
        "country": "Central Basins",
        "crop": "Maize (corn)",
        "season": "Kharif",
        "year": 2025,
        "area_ha": 60.0,
        "rainfall_mm": 800.0,
        "temperature_c": 24.5,
        "fertilizer_rate_kg_ha": 260.0
    }
    pred_res = client.post("/api/predict", json=pred_req)
    assert pred_res.status_code == 200
    pred_data = pred_res.json()

    # Save prediction
    save_payload = {
        "inputs": pred_req,
        "prediction": pred_data
    }
    save_res = client.post("/api/predictions", json=save_payload, headers=headers)
    assert save_res.status_code == 200
    saved_obj = save_res.json()
    pred_id = saved_obj["id"]

    # Get saved list
    list_res = client.get("/api/predictions", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1
    assert list_res.json()[0]["id"] == pred_id

    # Get single prediction
    single_res = client.get(f"/api/predictions/{pred_id}", headers=headers)
    assert single_res.status_code == 200
    assert single_res.json()["crop"] == "Maize (corn)"

    # Export CSV
    export_res = client.get("/api/export/predictions", headers=headers)
    assert export_res.status_code == 200
    assert "text/csv" in export_res.headers["content-type"]
    assert "Maize (corn)" in export_res.text

    # Delete prediction
    del_res = client.delete(f"/api/predictions/{pred_id}", headers=headers)
    assert del_res.status_code == 200

    # Verify deleted
    list_res2 = client.get("/api/predictions", headers=headers)
    assert len(list_res2.json()) == 0

def test_optimization_scenarios():
    opt_payload = {
        "scenarios": [
            {
                "name": "Baseline",
                "crop": "Wheat",
                "area_ha": 50.0,
                "irrigation_fraction": 0.6,
                "fertilizer_rate_kg_ha": 180.0,
                "planting_period": "Optimal",
                "crop_price_per_tonne": 250.0,
                "water_cost_per_m3": 0.12,
                "fertilizer_cost_per_kg": 0.80
            },
            {
                "name": "High Water",
                "crop": "Wheat",
                "area_ha": 50.0,
                "irrigation_fraction": 0.95,
                "fertilizer_rate_kg_ha": 250.0,
                "planting_period": "Optimal",
                "crop_price_per_tonne": 250.0,
                "water_cost_per_m3": 0.12,
                "fertilizer_cost_per_kg": 0.80
            }
        ],
        "objective": "maximize_yield"
    }
    res = client.post("/api/optimize", json=opt_payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data["scenarios"]) == 2
    assert data["recommended_scenario"]["name"] == "High Water"
    assert data["recommended_scenario"]["estimated_profit_usd"] is not None

def test_analytics_endpoints():
    res = client.get("/api/analytics/overview?crop=Wheat&from_year=2010&to_year=2024")
    assert res.status_code == 200
    data = res.json()
    assert "kpis" in data
    assert "yield_trends" in data
    assert len(data["yield_trends"]) > 0
    assert "actual_vs_predicted" in data
    assert data["actual_vs_predicted"]["r_squared"] > 0
    assert len(data["model_comparison"]) > 0
    assert len(data["feature_importance"]) > 0

def test_dataset_upload_validation():
    # 1. Valid CSV
    valid_csv = (
        "country,crop,year,area_harvested,yield,rainfall,temperature\n"
        "India,Wheat,2024,30000,3.4,720,21.5\n"
        "France,Wheat,2024,45000,6.8,680,18.2\n"
    )
    files = {"file": ("test_valid.csv", io.BytesIO(valid_csv.encode("utf-8")), "text/csv")}
    res = client.post("/api/datasets/upload", files=files)
    assert res.status_code == 200
    assert res.json()["valid_rows"] == 2
    assert res.json()["error_rows"] == 0

    # 2. Invalid CSV (missing columns)
    bad_csv = "area,amount\n100,50\n"
    files_bad = {"file": ("bad.csv", io.BytesIO(bad_csv.encode("utf-8")), "text/csv")}
    res_bad = client.post("/api/datasets/upload", files=files_bad)
    assert res_bad.status_code == 200
    assert res_bad.json()["error_rows"] > 0
    assert len(res_bad.json()["validation_errors"]) > 0
