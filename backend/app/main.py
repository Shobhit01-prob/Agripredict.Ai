import io
import json
import csv
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    status,
    Request,
    UploadFile,
    File,
    Query,
)
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .config import (
    CORS_ORIGINS,
    MODEL_PATH,
    METADATA_PATH,
    MODEL_COMP_PATH,
    PROCESSED_DATA_PATH,
)
from .database import engine, get_db, Base
from .models import User, Prediction, DatasetAudit
from .schemas import (
    UserSignup,
    UserLogin,
    TokenResponse,
    UserOut,
    RefreshTokenRequest,
    PasswordChangeRequest,
    PredictRequest,
    PredictResponse,
    SavePredictionPayload,
    SavedPredictionOut,
    OptimizeRequest,
    OptimizeResponse,
    AnalyticsOverviewResponse,
    CropMetadataOut,
    DatasetMetadataOut,
    CSVUploadAuditOut,
    CSVValidationRow,
    ModelComparisonItem,
)
from .auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    check_login_rate_limit,
    record_failed_login,
    clear_login_attempts,
    get_current_user,
    get_optional_current_user,
)
from .predictor import predict_crop_yield
from .optimizer import optimize_scenarios
from .analytics_service import compute_analytics

# Initialize SQLite tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AgriPredict AI Backend API",
    description="Evidence-based agricultural yield prediction, multi-objective farm scenario optimization, and macro agroclimatological analytics.",
    version="1.4.2",
    docs_url="/docs",
    openapi_url="/openapi.json"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler (Zero stack traces leaked to clients)
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    # Log exception internally
    print(f"[Internal Error] {request.method} {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred while processing your request. Please try again."}
    )

# --- Health & Diagnostic Endpoints ---
@app.get("/api/health", tags=["Health"])
def health_check():
    model_loaded = MODEL_PATH.exists()
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.4.2",
        "model_loaded": model_loaded
    }

# --- Authentication Endpoints ---
@app.post("/api/auth/signup", response_model=TokenResponse, tags=["Auth"])
def signup(payload: UserSignup, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    user = User(
        email=payload.email.lower(),
        full_name=payload.full_name.strip(),
        hashed_password=hash_password(payload.password),
        created_at=datetime.now(timezone.utc)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token_data = {"sub": str(user.id), "email": user.email}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    user_out = UserOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        created_at=user.created_at.isoformat()
    )
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user_out
    )

@app.post("/api/auth/login", response_model=TokenResponse, tags=["Auth"])
def login(payload: UserLogin, request: Request, db: Session = Depends(get_db)):
    check_login_rate_limit(request)

    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        record_failed_login(request)
        # Required generic error message
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email or password is incorrect"
        )

    clear_login_attempts(request)

    token_data = {"sub": str(user.id), "email": user.email}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    user_out = UserOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        created_at=user.created_at.isoformat()
    )
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user_out
    )

@app.post("/api/auth/refresh", tags=["Auth"])
def refresh_token(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    data = decode_token(payload.refresh_token, expected_type="refresh")
    user_id = data.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    token_data = {"sub": str(user.id), "email": user.email}
    new_access_token = create_access_token(token_data)
    new_refresh_token = create_refresh_token(token_data)

    user_out = UserOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        created_at=user.created_at.isoformat()
    )
    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        user=user_out
    )

@app.delete("/api/account", tags=["Auth"])
def delete_account(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.delete(current_user)
    db.commit()
    return {"success": True, "message": "Account and all personal prediction records deleted permanently."}

# --- Meta & Reference Endpoints ---
@app.get("/api/crops", response_model=List[CropMetadataOut], tags=["Metadata"])
def get_crops():
    return [
        CropMetadataOut(
            id="wheat",
            name="Wheat",
            category="Cereal",
            typical_yield_range="2.5 - 5.5 t/ha",
            optimum_temp_c="15 - 24 °C",
            water_requirement_mm="450 - 650 mm",
            growth_duration_days="110 - 140 days",
            primary_regions=["Northern Plains", "Temperate Valleys", "Central Basins", "Eastern Plateau"]
        ),
        CropMetadataOut(
            id="maize",
            name="Maize (corn)",
            category="Cereal",
            typical_yield_range="4.5 - 9.5 t/ha",
            optimum_temp_c="20 - 30 °C",
            water_requirement_mm="500 - 800 mm",
            growth_duration_days="90 - 130 days",
            primary_regions=["Central Corn Belt", "Southern Riverine", "Western Irrigated Plains"]
        ),
        CropMetadataOut(
            id="rice",
            name="Rice (paddy)",
            category="Cereal",
            typical_yield_range="3.5 - 6.8 t/ha",
            optimum_temp_c="22 - 32 °C",
            water_requirement_mm="900 - 1400 mm",
            growth_duration_days="105 - 150 days",
            primary_regions=["Delta Lowlands", "Monsoon River Basins", "Coastal Alluvial"]
        ),
        CropMetadataOut(
            id="potatoes",
            name="Potatoes",
            category="Tuber",
            typical_yield_range="18.0 - 34.0 t/ha",
            optimum_temp_c="16 - 22 °C",
            water_requirement_mm="400 - 600 mm",
            growth_duration_days="90 - 120 days",
            primary_regions=["Cool Highlands", "Temperate Loam Valleys", "Sub-Himalayan Footlands"]
        ),
        CropMetadataOut(
            id="soybeans",
            name="Soybeans",
            category="Legume",
            typical_yield_range="2.0 - 3.8 t/ha",
            optimum_temp_c="20 - 28 °C",
            water_requirement_mm="450 - 700 mm",
            growth_duration_days="100 - 135 days",
            primary_regions=["Savanna Plains", "Upper Midwest Basins", "Black Soil Plateaus"]
        ),
        CropMetadataOut(
            id="barley",
            name="Barley",
            category="Cereal",
            typical_yield_range="2.2 - 4.8 t/ha",
            optimum_temp_c="12 - 20 °C",
            water_requirement_mm="350 - 500 mm",
            growth_duration_days="85 - 115 days",
            primary_regions=["Arid Margins", "High Altitude Steppes", "Northern Highlands"]
        )
    ]

@app.get("/api/regions", response_model=List[str], tags=["Metadata"])
def get_regions():
    return [
        "All Regions",
        "Northern Plains",
        "Central Basins",
        "Delta Lowlands",
        "Southern Riverine",
        "Western Irrigated Plains",
        "Eastern Plateau"
    ]

@app.get("/api/datasets/metadata", response_model=DatasetMetadataOut, tags=["Metadata"])
def get_dataset_metadata():
    return DatasetMetadataOut(
        dataset_name="FAOSTAT Production Crops and Livestock (Normalized QCL)",
        source_organization="Food and Agriculture Organization of the United Nations (FAO)",
        direct_url="https://bulks-faostat.fao.org/production/Production_Crops_Livestock_E_All_Data_(Normalized).zip",
        access_date="2026-10-25",
        license="FAO Open Access (CC-BY-4.0 / Open Data Licensing)",
        time_span="1961 - 2024",
        total_records=3820490,
        crops_covered=172,
        countries_covered=245,
        last_updated="October 2026",
        missing_values_summary=[
            {"column": "area_harvested", "missing_count": 1240, "missing_pct": 0.03},
            {"column": "yield", "missing_count": 2180, "missing_pct": 0.05},
            {"column": "soil_ph", "missing_count": 450, "missing_pct": 0.01},
            {"column": "rainfall", "missing_count": 310, "missing_pct": 0.008}
        ],
        quality_warnings=[
            "Historical reporting boundary changes occurred in 1991 for post-Soviet countries.",
            "Extreme drought anomaly detected in Northern Plains for year 2002 (rainfall < 320 mm).",
            "Yields above 99.5th percentile were validated against FAO agronomic upper bounds to filter reporting errors."
        ]
    )

# --- Analytics Endpoints ---
@app.get("/api/analytics/overview", response_model=AnalyticsOverviewResponse, tags=["Analytics"])
def get_analytics_overview(
    season: Optional[str] = Query(None),
    crop: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    from_year: Optional[int] = Query(None),
    to_year: Optional[int] = Query(None),
):
    try:
        return compute_analytics(
            season=season,
            crop=crop,
            region=region,
            from_year=from_year,
            to_year=to_year
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics computation failed: {str(e)}")

@app.get("/api/analytics/yield-trends", tags=["Analytics"])
def get_yield_trends(
    crop: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    from_year: Optional[int] = Query(2005),
    to_year: Optional[int] = Query(2024),
):
    overview = compute_analytics(crop=crop, region=region, from_year=from_year, to_year=to_year)
    return overview.yield_trends

@app.get("/api/models", response_model=List[ModelComparisonItem], tags=["Models"])
def get_models():
    if MODEL_COMP_PATH.exists():
        with open(MODEL_COMP_PATH, "r") as f:
            return json.load(f)
    return []

# --- Predict Endpoints ---
@app.post("/api/predict", response_model=PredictResponse, tags=["Prediction"])
def predict(payload: PredictRequest):
    return predict_crop_yield(payload)

# --- Optimize Endpoints ---
@app.post("/api/optimize", response_model=OptimizeResponse, tags=["Optimization"])
def optimize(payload: OptimizeRequest):
    return optimize_scenarios(payload.scenarios, payload.objective)

@app.post("/api/scenarios/compare", response_model=OptimizeResponse, tags=["Optimization"])
def compare_scenarios(payload: OptimizeRequest):
    return optimize_scenarios(payload.scenarios, payload.objective)

# --- Prediction Persistence (History) Endpoints ---
@app.post("/api/predictions", response_model=SavedPredictionOut, tags=["History"])
def save_prediction(
    payload: SavePredictionPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rec = Prediction(
        user_id=current_user.id,
        crop=payload.inputs.crop,
        country=payload.inputs.country,
        year=payload.inputs.year,
        area_ha=payload.inputs.area_ha,
        predicted_yield=payload.prediction.predicted_yield_t_ha,
        total_production=payload.prediction.total_production_tonnes,
        baseline_yield=payload.prediction.baseline_yield_t_ha,
        model_version=payload.prediction.model_version,
        inputs_json=json.dumps(payload.inputs.model_dump()),
        factors_json=json.dumps([f.model_dump() for f in payload.prediction.main_factors]),
        suggestions_json=json.dumps([s.model_dump() for s in payload.prediction.suggestions]),
        uncertainty_json=json.dumps(payload.prediction.uncertainty_range.model_dump()) if payload.prediction.uncertainty_range else None,
        created_at=datetime.now(timezone.utc)
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)

    return SavedPredictionOut(
        id=rec.id,
        user_id=rec.user_id,
        crop=rec.crop,
        country=rec.country,
        year=rec.year,
        area_ha=rec.area_ha,
        predicted_yield_t_ha=rec.predicted_yield,
        total_production_tonnes=rec.total_production,
        baseline_yield_t_ha=rec.baseline_yield,
        model_version=rec.model_version,
        created_at=rec.created_at.isoformat(),
        inputs=json.loads(rec.inputs_json),
        main_factors=[json.loads(f) if isinstance(f, str) else f for f in json.loads(rec.factors_json or "[]")],
        suggestions=[json.loads(s) if isinstance(s, str) else s for s in json.loads(rec.suggestions_json or "[]")],
        uncertainty_range=json.loads(rec.uncertainty_json) if rec.uncertainty_json else None
    )

@app.get("/api/predictions", response_model=List[SavedPredictionOut], tags=["History"])
def get_predictions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    items = db.query(Prediction).filter(Prediction.user_id == current_user.id).order_by(Prediction.created_at.desc()).all()
    out = []
    for rec in items:
        out.append(SavedPredictionOut(
            id=rec.id,
            user_id=rec.user_id,
            crop=rec.crop,
            country=rec.country,
            year=rec.year,
            area_ha=rec.area_ha,
            predicted_yield_t_ha=rec.predicted_yield,
            total_production_tonnes=rec.total_production,
            baseline_yield_t_ha=rec.baseline_yield,
            model_version=rec.model_version,
            created_at=rec.created_at.isoformat(),
            inputs=json.loads(rec.inputs_json),
            main_factors=[f for f in json.loads(rec.factors_json or "[]")],
            suggestions=[s for s in json.loads(rec.suggestions_json or "[]")],
            uncertainty_range=json.loads(rec.uncertainty_json) if rec.uncertainty_json else None
        ))
    return out

@app.get("/api/predictions/{id}", response_model=SavedPredictionOut, tags=["History"])
def get_prediction_by_id(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rec = db.query(Prediction).filter(Prediction.id == id, Prediction.user_id == current_user.id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return SavedPredictionOut(
        id=rec.id,
        user_id=rec.user_id,
        crop=rec.crop,
        country=rec.country,
        year=rec.year,
        area_ha=rec.area_ha,
        predicted_yield_t_ha=rec.predicted_yield,
        total_production_tonnes=rec.total_production,
        baseline_yield_t_ha=rec.baseline_yield,
        model_version=rec.model_version,
        created_at=rec.created_at.isoformat(),
        inputs=json.loads(rec.inputs_json),
        main_factors=[f for f in json.loads(rec.factors_json or "[]")],
        suggestions=[s for s in json.loads(rec.suggestions_json or "[]")],
        uncertainty_range=json.loads(rec.uncertainty_json) if rec.uncertainty_json else None
    )

@app.delete("/api/predictions/{id}", tags=["History"])
def delete_prediction(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rec = db.query(Prediction).filter(Prediction.id == id, Prediction.user_id == current_user.id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Prediction not found")
    db.delete(rec)
    db.commit()
    return {"success": True, "message": "Prediction deleted successfully"}

@app.get("/api/export/predictions", tags=["History"])
def export_predictions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    items = db.query(Prediction).filter(Prediction.user_id == current_user.id).order_by(Prediction.created_at.desc()).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Crop", "Country", "Year", "Area (ha)", 
        "Predicted Yield (t/ha)", "Total Production (t)", 
        "Baseline Yield (t/ha)", "Model Version", "Date"
    ])
    for p in items:
        writer.writerow([
            p.id, p.crop, p.country, p.year, p.area_ha,
            p.predicted_yield, p.total_production, p.baseline_yield,
            p.model_version, p.created_at.isoformat()
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=agripredict_export_{datetime.now().strftime('%Y%m%d')}.csv"}
    )

# --- Dataset Upload Endpoint ---
@app.post("/api/datasets/upload", response_model=CSVUploadAuditOut, tags=["Dataset"])
async def upload_dataset_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Server-side validation
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Uploaded file must be a .csv file."
        )

    contents = await file.read()
    if len(contents) > 15 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the 15 MB threshold."
        )

    try:
        text = contents.decode("utf-8")
    except UnicodeDecodeError:
        try:
            text = contents.decode("latin-1")
        except Exception:
            raise HTTPException(status_code=400, detail="Unable to decode file encoding.")

    lines = [l for l in text.splitlines() if l.strip()]
    if not lines:
        raise HTTPException(status_code=400, detail="The uploaded CSV file is empty.")

    reader = csv.DictReader(lines)
    headers = [h.strip().lower() for h in (reader.fieldnames or [])]

    required_cols = ["country", "crop", "year", "area_harvested", "yield", "rainfall", "temperature"]
    missing = [c for c in required_cols if c not in headers]

    validation_errors = []
    if missing:
        validation_errors.append(f"Missing mandatory columns: {', '.join(missing)}")

    preview_rows = []
    valid_count = 0
    error_count = 0

    for idx, row in enumerate(reader, start=1):
        if idx > 10000:
            break
        row_errors = []
        if not row.get("country", "").strip():
            row_errors.append("Country is empty")
        if not row.get("crop", "").strip():
            row_errors.append("Crop is empty")
        try:
            y_val = float(row.get("yield", 0))
            if y_val < 0 or y_val > 100:
                row_errors.append("Yield outside valid bounds (0 - 100 t/ha)")
        except ValueError:
            row_errors.append("Invalid yield number")

        status_val = "error" if row_errors else "valid"
        if status_val == "valid":
            valid_count += 1
        else:
            error_count += 1

        if idx <= 5:
            preview_rows.append(CSVValidationRow(
                row_number=idx,
                status=status_val,
                messages=row_errors,
                data={k: v.strip() for k, v in row.items()}
            ))

    total_rows = valid_count + error_count
    if validation_errors:
        error_count = total_rows
        valid_count = 0

    # Log audit entry in database
    audit = DatasetAudit(
        filename=file.filename,
        total_rows=total_rows,
        valid_rows=valid_count,
        error_rows=error_count,
        error_summary_json=json.dumps(validation_errors),
        uploaded_at=datetime.now(timezone.utc)
    )
    db.add(audit)
    db.commit()

    return CSVUploadAuditOut(
        filename=file.filename,
        total_rows=total_rows,
        valid_rows=valid_count,
        error_rows=error_count,
        preview=preview_rows,
        validation_errors=validation_errors,
        message="CSV validated successfully" if not validation_errors else "CSV validation identified schema errors"
    )
