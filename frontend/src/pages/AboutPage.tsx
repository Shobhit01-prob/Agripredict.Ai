import React from 'react';
import { 
  Info, 
  ExternalLink, 
  ShieldCheck, 
  Terminal, 
  Cpu, 
  BookOpen, 
  Database,
  Sprout,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      
      {/* Page Header */}
      <div className="border-b border-stone-200/80 pb-6 dark:border-stone-800">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sage">
          <BookOpen className="h-4 w-4" />
          <span>Documentation and Methodology</span>
        </div>
        <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight text-walnut dark:text-cream sm:text-4xl">
          About AgriPredict AI
        </h1>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
          Scientific principles, statistical learning methodology, known agronomic boundaries, 
          and developer setup instructions.
        </p>
      </div>

      {/* 1. Scientific Methodology */}
      <section className="rounded-2xl border border-stone-200/90 bg-warm-white p-6 sm:p-8 shadow-xs dark:border-stone-800 dark:bg-walnut">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sage/15 text-sage">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-walnut dark:text-cream">
              1. Modeling methodology
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Machine learning for non-linear agronomic response modeling
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3.5 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
          <p>
            AgriPredict AI models agricultural crop yield ($t/ha$) as a non-linear multivariate function of environmental, 
            edaphic, and farm management parameters. The primary model architecture uses a <strong>LightGBM Regressor</strong> 
            (Light Gradient Boosting Machine) optimized via cross-validation over multi-decadal historical cycles.
          </p>
          <p>
            Unlike linear regressions that fail under biological tipping points (e.g., extreme heat stress or fertilizer saturation), 
            gradient-boosted decision trees capture complex interactions between rainfall distributions, soil acidity, and nitrogen availability. 
            Validation splits are evaluated using Root Mean Squared Error (RMSE), Mean Absolute Error (MAE), and $R^2$ coefficient of determination.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-900/40">
              <span className="font-semibold text-walnut dark:text-cream">Cross-validation</span>
              <p className="mt-0.5 text-stone-500">5-fold regional grouped splits preventing geographic leakage</p>
            </div>
            <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-900/40">
              <span className="font-semibold text-walnut dark:text-cream">Loss function</span>
              <p className="mt-0.5 text-stone-500">Huber loss robust against reporting outliers and extreme events</p>
            </div>
            <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-900/40">
              <span className="font-semibold text-walnut dark:text-cream">Uncertainty</span>
              <p className="mt-0.5 text-stone-500">Residual bootstrap interval providing calibrated 90% bounds</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Known Boundaries and Scientific Limits */}
      <section className="rounded-2xl border border-stone-200/90 bg-warm-white p-6 sm:p-8 shadow-xs dark:border-stone-800 dark:bg-walnut">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-glow/15 text-amber-glow">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-walnut dark:text-cream">
              2. Known boundaries and limitations
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Clear parameters where model inferences should be interpreted with caution
            </p>
          </div>
        </div>

        <ul className="mt-5 space-y-3 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-amber-glow shrink-0 mt-0.5" />
            <span>
              <strong>Macro vs micro-scale variance:</strong> FAOSTAT and NASA POWER data are aggregated at regional and national centroids. 
              Field-level microclimates, drainage gradients, and sub-meter soil horizons can create localized yield variances of ±15%.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-amber-glow shrink-0 mt-0.5" />
            <span>
              <strong>Pest and disease outbreaks:</strong> The model projects climatic and nutrient potential. Unforeseen biological vectors 
              such as fungal rusts or insect infestations are not currently predicted.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-amber-glow shrink-0 mt-0.5" />
            <span>
              <strong>Extrapolation constraints:</strong> Input parameters outside historical training bounds (e.g., rainfall &gt; 4,000 mm or temperatures &gt; 48 °C) 
              trigger agronomic boundary warnings.
            </span>
          </li>
        </ul>
      </section>

      {/* 3. Responsible-Use Ethics */}
      <section className="rounded-2xl border border-sage/40 bg-sage-50/50 p-6 sm:p-8 shadow-xs dark:border-sage-800/40 dark:bg-sage-950/20">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-sage shrink-0" />
          <h2 className="font-heading text-lg font-bold text-walnut dark:text-cream">
            3. Responsible-use ethics commitment
          </h2>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-stone-700 dark:text-stone-300">
          AgriPredict AI is committed to honest, evidence-based agricultural technology. We reject invented claims of guaranteed yields, 
          exaggerated cost reductions, or fictitious farmer adoption metrics. Predictions are presented with explicit uncertainty bounds, 
          and all macro figures are traceable to publicly verifiable open-access scientific repositories.
        </p>
      </section>

      {/* 4. Interactive API Documentation */}
      <section className="rounded-2xl border border-stone-200/90 bg-warm-white p-6 sm:p-8 shadow-xs dark:border-stone-800 dark:bg-walnut">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4 dark:border-stone-800">
          <div>
            <h2 className="font-heading text-xl font-bold text-walnut dark:text-cream">
              4. Interactive API documentation
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              FastAPI automated Swagger / OpenAPI interactive explorer
            </p>
          </div>
          <a
            href="/docs"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-stone-100 px-3.5 py-2 text-xs font-semibold text-walnut hover:bg-stone-200 dark:bg-stone-800 dark:text-cream"
          >
            <span>Open /docs</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
          All endpoints provide strict Pydantic request and response schemas, JWT authentication, and interactive testing 
          at <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono dark:bg-stone-800">/docs</code> and OpenAPI schema at <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono dark:bg-stone-800">/openapi.json</code>.
        </p>
      </section>

      {/* 5. Local Setup and Deployment Guide */}
      <section className="rounded-2xl border border-stone-200/90 bg-warm-white p-6 sm:p-8 shadow-xs dark:border-stone-800 dark:bg-walnut">
        <div className="flex items-center gap-3">
          <Terminal className="h-6 w-6 text-stone-700 dark:text-stone-300" />
          <h2 className="font-heading text-xl font-bold text-walnut dark:text-cream">
            5. Setup and developer guide
          </h2>
        </div>

        <div className="mt-5 space-y-4 text-xs">
          <div>
            <h3 className="font-semibold text-walnut dark:text-cream">Prerequisites:</h3>
            <p className="text-stone-600 dark:text-stone-400 mt-0.5">Python 3.11+ and Node.js 18+ (with npm)</p>
          </div>

          <div>
            <h3 className="font-semibold text-walnut dark:text-cream">Backend execution:</h3>
            <pre className="mt-1.5 rounded-xl bg-stone-900 p-4 font-mono text-[11px] text-stone-100 overflow-x-auto">
{`# 1. Activate virtual environment
.venv\\Scripts\\activate   # Windows
# or source .venv/bin/activate  # Linux/macOS

# 2. Run database migration and FastAPI server
python -m uvicorn backend.app.main:app --reload --port 8000`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold text-walnut dark:text-cream">Frontend development:</h3>
            <pre className="mt-1.5 rounded-xl bg-stone-900 p-4 font-mono text-[11px] text-stone-100 overflow-x-auto">
{`# In the frontend directory
npm install
npm run dev   # Runs on http://localhost:5173`}
            </pre>
          </div>
        </div>
      </section>

    </div>
  );
};
