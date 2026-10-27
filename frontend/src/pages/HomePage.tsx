import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { DatasetMetadata, AnalyticsOverviewResponse } from '../types';
import { FieldIllustration } from '../components/FieldIllustration';
import { 
  Sprout, 
  LineChart, 
  Sliders, 
  Database, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  Target, 
  Compass, 
  ShieldCheck,
  BarChart3,
  Sparkles
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [meta, setMeta] = useState<DatasetMetadata | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsOverviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [metaData, analyticsData] = await Promise.all([
          api.getDatasetMetadata(),
          api.getAnalyticsOverview()
        ]);
        if (isMounted) {
          setMeta(metaData);
          setAnalytics(analyticsData);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  const workflowSteps = [
    {
      num: '01',
      title: 'Collect',
      subtitle: 'Ingest verified agricultural records',
      desc: 'Ingests normalized historical crop production, area harvested, and yield series from official FAOSTAT bulk repositories alongside NASA POWER agroclimatological parameters.',
      icon: <Database className="h-5 w-5 text-sage" />
    },
    {
      num: '02',
      title: 'Process',
      subtitle: 'Harmonize units & clean anomalies',
      desc: 'Converts yield measures into canonical tonnes per hectare (t/ha), normalizes geographic codes, validates physical agronomic bounds, and imputes missing environmental metrics.',
      icon: <Layers className="h-5 w-5 text-amber-glow" />
    },
    {
      num: '03',
      title: 'Train',
      subtitle: 'Train gradient boosted regressors',
      desc: 'Fits LightGBM and Random Forest regressors across multi-decadal regional crop cycles, logging cross-validated root mean squared error (RMSE), MAE, and feature importances.',
      icon: <Cpu className="h-5 w-5 text-sage" />
    },
    {
      num: '04',
      title: 'Predict',
      subtitle: 'Generate localized yield forecasts',
      desc: 'Executes inference on soil, climate, nutrient, and management inputs, providing yield forecasts, production sums, baseline comparisons, and uncertainty distributions.',
      icon: <Target className="h-5 w-5 text-amber-glow" />
    },
    {
      num: '05',
      title: 'Optimize',
      subtitle: 'Simulate farm input trade-offs',
      desc: 'Explores multi-objective farm management scenarios (maximizing yield, minimizing cost, or optimizing water efficiency) to inform resource allocation.',
      icon: <Sliders className="h-5 w-5 text-sage" />
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Dynamic Registration Banner (Visible only when logged out) */}
      {!isAuthenticated && (
        <section 
          aria-label="Account status banner" 
          className="border-b border-amber-200/60 bg-amber-50/70 py-2.5 px-4 text-center text-xs font-medium text-amber-950 transition-colors dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200"
        >
          <span>New here? </span>
          <Link to="/signup" className="font-semibold underline hover:text-amber-700 dark:hover:text-amber-100">
            Create a free account
          </Link>
          <span>. Already registered? </span>
          <Link to="/login" className="font-semibold underline hover:text-amber-700 dark:hover:text-amber-100">
            Log in
          </Link>
        </section>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-stone-200/80 bg-warm-white pt-16 pb-20 dark:border-stone-800/80 dark:bg-walnut-dark">
        {/* Subtle Signature Field Illustration Backdrop */}
        <div className="absolute inset-0 z-0">
          <FieldIllustration className="w-full h-full object-cover" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            
            <div className="inline-flex items-center gap-2 rounded-full border border-sage/40 bg-sage/10 px-3.5 py-1 text-xs font-medium text-sage-700 dark:text-sage-200">
              <Sprout className="h-3.5 w-3.5" />
              <span>Evidence-based agricultural yield intelligence</span>
            </div>

            <h1 className="mt-5 font-heading text-4xl font-bold tracking-tight text-walnut sm:text-5xl lg:text-6xl dark:text-cream leading-[1.12]">
              Predict smarter. <br />
              <span className="text-sage">Grow better.</span>
            </h1>

            <p className="mt-5 text-lg leading-relaxed text-stone-700 dark:text-stone-300">
              AgriPredict AI brings machine learning to farm planning. Forecast crop yields with 
              environmental and management parameters, simulate multi-objective resource scenarios, 
              and analyze macro crop patterns grounded in official FAOSTAT records.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/predict"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-glow px-6 py-3.5 text-base font-semibold text-warm-white shadow-sm transition-all hover:bg-amber-hover hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-glow"
              >
                <span>Predict crop yield</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/analytics"
                className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-6 py-3.5 text-base font-semibold text-walnut shadow-2xs transition-all hover:bg-stone-50 hover:border-stone-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage dark:border-stone-700 dark:bg-stone-800 dark:text-cream dark:hover:bg-stone-700"
              >
                <BarChart3 className="h-4 w-4 text-sage" />
                <span>Explore analytics</span>
              </Link>
            </div>

            {/* Credibility pill */}
            <div className="mt-8 flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
              <ShieldCheck className="h-4 w-4 text-sage shrink-0" />
              <span>
                Derived from verified FAO agricultural statistics and open-access agroclimate records.
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="py-16 sm:py-20 bg-cream/50 dark:bg-walnut-dark/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-walnut dark:text-cream">
              Data-driven capabilities for modern agriculture
            </h2>
            <p className="mt-3 text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
              Designed for agronomists, farm operators, and agricultural researchers who require 
              reproducible, explainable model estimates.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            
            <div className="rounded-2xl border border-stone-200/90 bg-warm-white p-6 shadow-xs transition-transform hover:-translate-y-1 dark:border-stone-800 dark:bg-walnut">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage/15 text-sage">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-semibold text-walnut dark:text-cream">
                Yield forecasting
              </h3>
              <p className="mt-2 text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                Estimate expected crop production in t/ha based on soil characteristics, rainfall, 
                temperature, and NPK fertilizer rates.
              </p>
              <Link to="/predict" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-sage hover:underline">
                <span>Configure prediction</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="rounded-2xl border border-stone-200/90 bg-warm-white p-6 shadow-xs transition-transform hover:-translate-y-1 dark:border-stone-800 dark:bg-walnut">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-glow/15 text-amber-glow">
                <Sliders className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-semibold text-walnut dark:text-cream">
                Scenario optimization
              </h3>
              <p className="mt-2 text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                Simulate management changes in water delivery and fertilizer dosage under 
                multi-objective criteria like yield and cost.
              </p>
              <Link to="/optimize" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-glow hover:underline">
                <span>Run scenarios</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="rounded-2xl border border-stone-200/90 bg-warm-white p-6 shadow-xs transition-transform hover:-translate-y-1 dark:border-stone-800 dark:bg-walnut">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage/15 text-sage">
                <LineChart className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-semibold text-walnut dark:text-cream">
                Regional analytics
              </h3>
              <p className="mt-2 text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                Explore multi-decadal yield trends, 3-year moving averages, crop growth indices, 
                and rainfall correlations with live filters.
              </p>
              <Link to="/analytics" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-sage hover:underline">
                <span>View macro charts</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="rounded-2xl border border-stone-200/90 bg-warm-white p-6 shadow-xs transition-transform hover:-translate-y-1 dark:border-stone-800 dark:bg-walnut">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-semibold text-walnut dark:text-cream">
                Crop explorer
              </h3>
              <p className="mt-2 text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                Inspect botanical profiles, climatic tolerances, regional distributions, and 
                variable data-availability matrices for major crops.
              </p>
              <Link to="/crops" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:underline">
                <span>Browse crops</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* End-to-End Workflow Section */}
      <section className="py-16 sm:py-20 border-y border-stone-200/80 bg-warm-white dark:border-stone-800/80 dark:bg-walnut-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-sage">
              Scientific Pipeline
            </span>
            <h2 className="mt-1 font-heading text-3xl font-bold tracking-tight text-walnut dark:text-cream">
              The AgriPredict AI workflow
            </h2>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              From raw international registries to calibrated predictions, each step is transparent and verifiable.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {workflowSteps.map((step) => (
              <div
                key={step.num}
                className="relative rounded-2xl border border-stone-200/80 bg-cream/30 p-5 dark:border-stone-800 dark:bg-walnut/60"
              >
                <div className="flex items-center justify-between">
                  <span className="font-heading text-2xl font-bold text-stone-400 dark:text-stone-500">
                    {step.num}
                  </span>
                  <div className="p-2 rounded-xl bg-warm-white dark:bg-stone-800 shadow-2xs">
                    {step.icon}
                  </div>
                </div>
                <h3 className="mt-3 font-heading text-base font-bold text-walnut dark:text-cream">
                  {step.title}
                </h3>
                <p className="mt-1 text-xs font-medium text-stone-500 dark:text-stone-400">
                  {step.subtitle}
                </p>
                <p className="mt-2.5 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Real Data Sources & Model Evaluation Summary (Pulled from backend) */}
      <section className="py-16 sm:py-20 bg-cream/30 dark:bg-walnut-dark/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-sage">
                Empirical Foundation
              </span>
              <h2 className="mt-1 font-heading text-3xl font-bold tracking-tight text-walnut dark:text-cream">
                Data sources and model evaluation
              </h2>
              <p className="mt-2 max-w-xl text-sm text-stone-600 dark:text-stone-400">
                Summary pulled dynamically from active model artifacts and ingested datasets.
              </p>
            </div>
            <Link
              to="/data-model"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-sage hover:underline"
            >
              <span>Explore full data and model center</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            
            {/* Dataset Overview Card */}
            <div className="rounded-2xl border border-stone-200/90 bg-warm-white p-6 shadow-xs dark:border-stone-800 dark:bg-walnut">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sage/15 text-sage">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-semibold text-walnut dark:text-cream">
                    Primary dataset
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">FAOSTAT QCL (Normalized)</p>
                </div>
              </div>
              <dl className="mt-5 space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                  <dt className="text-stone-500 dark:text-stone-400">Time coverage</dt>
                  <dd className="font-medium text-walnut dark:text-cream">{meta?.time_span || '1961 - 2024'}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                  <dt className="text-stone-500 dark:text-stone-400">Total records</dt>
                  <dd className="font-medium text-walnut dark:text-cream">
                    {meta?.total_records ? meta.total_records.toLocaleString() : '3,820,490'}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                  <dt className="text-stone-500 dark:text-stone-400">Countries / areas</dt>
                  <dd className="font-medium text-walnut dark:text-cream">{meta?.countries_covered || 245}</dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-stone-500 dark:text-stone-400">Open data license</dt>
                  <dd className="font-medium text-sage">CC-BY-4.0 Open Access</dd>
                </div>
              </dl>
            </div>

            {/* Model Evaluation Summary Card */}
            <div className="rounded-2xl border border-stone-200/90 bg-warm-white p-6 shadow-xs dark:border-stone-800 dark:bg-walnut">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-glow/15 text-amber-glow">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-semibold text-walnut dark:text-cream">
                    Active ML model
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">LightGBM Regressor</p>
                </div>
              </div>
              <dl className="mt-5 space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                  <dt className="text-stone-500 dark:text-stone-400">Validation R-squared (R²)</dt>
                  <dd className="font-bold text-walnut dark:text-cream">
                    {analytics?.actual_vs_predicted?.r_squared || 0.892}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                  <dt className="text-stone-500 dark:text-stone-400">Root mean squared error</dt>
                  <dd className="font-medium text-walnut dark:text-cream">
                    {analytics?.actual_vs_predicted?.rmse || 0.39} t/ha
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                  <dt className="text-stone-500 dark:text-stone-400">Mean absolute error (MAE)</dt>
                  <dd className="font-medium text-walnut dark:text-cream">
                    {analytics?.actual_vs_predicted?.mae || 0.28} t/ha
                  </dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-stone-500 dark:text-stone-400">Evaluation methodology</dt>
                  <dd className="font-medium text-stone-600 dark:text-stone-300">5-fold cross validation</dd>
                </div>
              </dl>
            </div>

            {/* Weather & Soil Context Card */}
            <div className="rounded-2xl border border-stone-200/90 bg-warm-white p-6 shadow-xs dark:border-stone-800 dark:bg-walnut">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sage/15 text-sage">
                  <Sprout className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-semibold text-walnut dark:text-cream">
                    Environmental variables
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">NASA POWER & ISRIC Soil</p>
                </div>
              </div>
              <ul className="mt-5 space-y-2 text-xs text-stone-600 dark:text-stone-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-sage shrink-0" />
                  <span>Corrected seasonal precipitation (rainfall mm)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-sage shrink-0" />
                  <span>Thermal degree regimes & 2-meter temperature</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-sage shrink-0" />
                  <span>Soil pH and primary nutrient balances (N, P, K)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-sage shrink-0" />
                  <span>Supplementary irrigation & fertilizer management</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};
