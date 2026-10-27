import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Database configuration (SQLite default, PostgreSQL ready)
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'app' / 'agripredict.db'}")

# Security & JWT Auth
JWT_SECRET = os.getenv("JWT_SECRET", "agripredict-secret-key-production-ready-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

# CORS Allowed Origins
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# ML Artifact Paths
ML_DIR = BASE_DIR / "ml"
ARTIFACTS_DIR = ML_DIR / "artifacts"
PROCESSED_DATA_PATH = ML_DIR / "data" / "processed" / "crop_yield_canonical.csv"
MODEL_PATH = ARTIFACTS_DIR / "model.joblib"
METADATA_PATH = ARTIFACTS_DIR / "model_metadata.json"
FEATURE_IMP_PATH = ARTIFACTS_DIR / "feature_importance.json"
MODEL_COMP_PATH = ARTIFACTS_DIR / "model_comparison.json"
ACTUAL_VS_PRED_PATH = ARTIFACTS_DIR / "actual_vs_predicted.json"
BASELINES_PATH = ARTIFACTS_DIR / "crop_baselines.json"
