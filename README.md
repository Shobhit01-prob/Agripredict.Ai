# AgriPredict AI — Sustainable Crop Yield Forecasting & Farm Optimization

AgriPredict AI is an evidence-based agricultural yield prediction, multi-objective farm scenario optimization, and macro agroclimatological analytics platform. Powered by official **UN FAOSTAT** historical crop production registries and **NASA POWER** satellite-derived agroclimatology, the platform delivers verifiable, reproducible yield forecasts without invented statistics.

---

## 1. System Architecture & Tech Stack

```
agri-project/
├── backend/
│   ├── app/                 # FastAPI application
│   │   ├── main.py          # REST API routers & CORS setup
│   │   ├── config.py        # Environment variables & artifact paths
│   │   ├── database.py      # SQLAlchemy 2.0 engine & session
│   │   ├── models.py        # User, Prediction, and DatasetAudit ORM models
│   │   ├── schemas.py       # Strict Pydantic v2 validation contracts
│   │   ├── auth.py          # Argon2 password hashing & JWT token provider
│   │   ├── predictor.py     # ML inference service with uncertainty bounds
│   │   ├── optimizer.py     # Multi-objective scenario trade-off engine
│   │   └── analytics_service.py # Real-time aggregation of FAOSTAT data
│   ├── ml/                  # Machine Learning & Data Pipeline
│   │   ├── data/
│   │   │   ├── raw/         # Official FAOSTAT normalized bulk CSV (545 MB)
│   │   │   └── processed/   # Canonical dataset (25,515 records, 195 nations)
│   │   ├── artifacts/       # Serialized models & evaluations
│   │   │   ├── model.joblib # Active LightGBM Regressor pipeline
│   │   │   ├── model_metadata.json
│   │   │   ├── model_comparison.json
│   │   │   └── feature_importance.json
│   │   ├── preprocess.py    # Raw data filtering & unit harmonization (kg/ha -> t/ha)
│   │   └── train.py         # LightGBM, Random Forest, GBDT, Ridge benchmark training
│   └── tests/
│       └── test_api.py      # Pytest automated test suite
├── frontend/                # React + Vite + TypeScript
│   ├── src/
│   │   ├── contexts/        # AuthContext, ThemeContext, ToastContext
│   │   ├── components/      # Header, Footer, Skeletons, Modals, FieldIllustration
│   │   ├── pages/           # Home, Predict, Optimize, Analytics, Crops, History, DataModel, About, Auth
│   │   ├── services/        # Typed API client with JWT refresh & offline fallback
│   │   └── types/           # Shared TypeScript models
│   └── index.html           # Google Fonts (Fraunces & Figtree)
└── docs/
    └── data_sources.md      # Data provenance registry
```

### Technology Highlights
- **Frontend**: React 18/19, TypeScript, Vite, Tailwind CSS v4, React Router 7, Recharts, Lucide Icons, Framer Motion.
- **Backend**: FastAPI, Pydantic v2, SQLAlchemy 2.0, SQLite (PostgreSQL-ready), Argon2 (`argon2-cffi`), PyJWT.
- **Machine Learning**: LightGBM, Scikit-Learn, Joblib, Pandas, NumPy.

---

## 2. Design System & Theme Tokens

The application strictly implements the required agricultural palette and WCAG AA contrast standards:

| Token | Hex Code | Usage |
| :--- | :--- | :--- |
| **Sage green** | `#87A96B` | Primary actions, active navigation, primary chart series |
| **Walnut brown** | `#5A3E2B` | Headings, dark card borders, active nav accents |
| **Amber glow** | `#D5851F` | Call-to-action buttons, key milestones, highlights |
| **Cream background** | `#F6F1E7` | Light mode background (warm, calm, earthy) |
| **White-warm surface** | `#FFFDF8` | Card surfaces, modals, elevated surfaces |
| **Deep walnut** | `#2E1F16` | Dark mode primary background and surfaces |

- **Typography**: `Fraunces` serif for headings; `Figtree` clean sans-serif for UI metrics and inputs.
- **Dark Mode**: Accessible round icon button in the header (Moon in light mode, Sun in dark mode) that respects system preferences and persists to `localStorage`.

---

## 3. Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### Step 1: Clone the repository & create virtual environment
```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate
```

### Step 2: Install Python dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Install Frontend dependencies
```bash
cd frontend
npm install
cd ..
```

---

## 4. Running Locally

### Start Backend API Server
```bash
# In the project root (with .venv active):
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```
- Interactive OpenAPI Swagger Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- API Health Status: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

### Start Frontend Development Server
```bash
# In the frontend directory:
cd frontend
npm run dev
```
- Web Application: [http://127.0.0.1:5173/](http://127.0.0.1:5173/)

---

## 5. Machine Learning Pipeline Execution

The ML pipeline ingests the official 545 MB normalized FAOSTAT crop production bulk dataset (`Production_Crops_Livestock_E_All_Data_(Normalized).csv`):

```bash
# 1. Preprocess raw FAOSTAT records, clean anomalies, harmonize units into t/ha
python backend/ml/preprocess.py

# 2. Train and benchmark LightGBM, Random Forest, Gradient Boosting, and Ridge models
python backend/ml/train.py
```

### Real Model Performance (Held-out Test Split):
- **LightGBM Regressor (Active)**: RMSE: 4.608 t/ha, MAE: 2.680 t/ha, $R^2$: 0.666
- **Random Forest (150 trees)**: RMSE: 4.551 t/ha, MAE: 2.593 t/ha, $R^2$: 0.675
- **Gradient Boosting (Scikit)**: RMSE: 4.576 t/ha, MAE: 2.689 t/ha, $R^2$: 0.671
- **Ridge Regression (L2)**: RMSE: 4.888 t/ha, MAE: 2.919 t/ha, $R^2$: 0.625

---

## 6. Running Automated Tests

### Run Backend Test Suite
```bash
# Runs full pytest suite testing auth, prediction, persistence, optimization, and CSV audits
pytest backend/tests -v
```

### Validate Frontend Compilation
```bash
cd frontend
npm run build
```

---

## 7. Production Deployment Guide

### Deploying the Backend on Render
1. Create a new **Web Service** on [Render](https://render.com/).
2. Connect your Git repository.
3. Set the environment to **Python 3**.
4. Configure Build and Start commands:
   - **Build Command**: `pip install -r requirements.txt && python backend/ml/train.py`
   - **Start Command**: `python -m uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
5. Configure Environment Variables:
   - `DATABASE_URL`: Connection string from Render Managed PostgreSQL (or default to persistent disk SQLite).
   - `JWT_SECRET`: Random 32+ character secret string.
   - `CORS_ORIGINS`: Your production frontend domain (e.g. `https://agripredict.vercel.app`).

### Deploying the Frontend on Vercel or Netlify
1. Import the Git repository in **Vercel** or **Netlify**.
2. Set Root Directory to `frontend`.
3. Framework Preset: **Vite**.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Add rewrite rule for Single Page Apps (`/index.html`).

---

## 8. Improvements Beyond the Brief

1. **Unit Harmonization Audit**: Automatically diagnosed that FAOSTAT QCL normalized yields are reported in `kg/ha`, correctly adjusting the mathematical conversion factor to `kg/ha / 1,000 = t/ha`.
2. **Offline & Dev Resilient Fallback Layer**: Implemented structured, authentic FAOSTAT fallbacks within the frontend API client, ensuring continuous UI responsiveness even during network disconnects or initial backend initialization.
3. **Multi-scenario Economic Simulator**: Enabled optional pricing toggles where farm operating expenses, water tariffs ($/m³), and nitrogen costs ($/kg) dynamically calculate projected net farmer profit when market prices are entered.
4. **Interactive SVG Field Contours**: Designed an ambient terraced furrow backdrop in the hero section that introduces a serene, organic aesthetic without clutter or obscuring core content.
5. **Interactive CSV Audit Engine**: Developed a client-side and server-side validation pipeline capable of previewing and pinpointing invalid rows or missing canonical columns in batch agricultural uploads.
6. **State Preservation Across Authentication**: If an unauthenticated user generates a prediction and clicks "Save", the application preserves their complete form and prediction state in temporary session storage, seamlessly redirecting them back to save after login or signup.
