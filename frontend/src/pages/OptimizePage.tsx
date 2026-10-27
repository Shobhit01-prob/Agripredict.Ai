import React, { useState } from 'react';
import { 
  Sliders, 
  HelpCircle, 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  Droplet, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Trash2,
  Award
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Cell
} from 'recharts';
import { 
  OptimizationObjective, 
  ScenarioInput, 
  ScenarioResult, 
  OptimizeResponse 
} from '../types';
import { useToast } from '../contexts/ToastContext';

export const OptimizePage: React.FC = () => {
  const { showToast } = useToast();

  const [objective, setObjective] = useState<OptimizationObjective>('balanced');
  const [hasPrices, setHasPrices] = useState<boolean>(false);
  const [cropPrice, setCropPrice] = useState<number>(240); // USD per tonne
  const [waterCost, setWaterCost] = useState<number>(0.15); // USD per m3
  const [fertilizerCost, setFertilizerCost] = useState<number>(0.85); // USD per kg

  // Baseline Scenario
  const [baseline, setBaseline] = useState<ScenarioInput>({
    name: 'Current Baseline',
    crop: 'Wheat',
    area_ha: 50,
    irrigation_fraction: 0.70,
    fertilizer_rate_kg_ha: 220,
    planting_period: 'Optimal',
  });

  // Alternative Scenarios
  const [scenarios, setScenarios] = useState<ScenarioInput[]>([
    {
      name: 'Intensive Yield',
      crop: 'Wheat',
      area_ha: 50,
      irrigation_fraction: 0.95,
      fertilizer_rate_kg_ha: 280,
      planting_period: 'Optimal',
    },
    {
      name: 'Water Conservation',
      crop: 'Wheat',
      area_ha: 50,
      irrigation_fraction: 0.50,
      fertilizer_rate_kg_ha: 190,
      planting_period: 'Early',
    },
    {
      name: 'Nutrient Efficiency',
      crop: 'Wheat',
      area_ha: 50,
      irrigation_fraction: 0.75,
      fertilizer_rate_kg_ha: 210,
      planting_period: 'Optimal',
    }
  ]);

  // Compute scenario results client-side / simulated against empirical response curves
  const computeScenario = (s: ScenarioInput, isBaseline: boolean = false): ScenarioResult => {
    // Realistic agronomic response model: diminishing returns on NPK and water
    const baseCropYield = s.crop === 'Maize (Corn)' ? 6.5 : s.crop === 'Rice (Paddy)' ? 4.2 : 4.0;
    
    // Fertilizer response curve (quadratic with plateau)
    const fertFactor = Math.min(1.35, 0.6 + 0.0035 * s.fertilizer_rate_kg_ha - 0.0000045 * (s.fertilizer_rate_kg_ha ** 2));
    
    // Water response curve
    const waterFactor = 0.55 + 0.5 * s.irrigation_fraction;

    // Timing penalty
    const timingFactor = s.planting_period === 'Optimal' ? 1.0 : s.planting_period === 'Early' ? 0.94 : 0.88;

    const yield_t_ha = Math.max(1.5, Number((baseCropYield * fertFactor * waterFactor * timingFactor).toFixed(2)));
    const total_production = Number((yield_t_ha * s.area_ha).toFixed(1));

    // Input indices
    const water_index = Number((s.irrigation_fraction * 100).toFixed(0));
    const fert_index = Number((s.fertilizer_rate_kg_ha).toFixed(0));

    let cost_usd: number | undefined;
    let rev_usd: number | undefined;
    let profit_usd: number | undefined;

    if (hasPrices) {
      // 1 ha full irrigation approx 4000 m3
      const waterUsedM3 = s.area_ha * s.irrigation_fraction * 4000;
      const fertUsedKg = s.area_ha * s.fertilizer_rate_kg_ha;
      const fixedOpsCost = s.area_ha * 300; // seeds, fuel, labor
      
      cost_usd = Math.round(waterUsedM3 * waterCost + fertUsedKg * fertilizerCost + fixedOpsCost);
      rev_usd = Math.round(total_production * cropPrice);
      profit_usd = rev_usd - cost_usd;
    }

    // Objective scores
    let score = 0;
    if (objective === 'maximize_yield') {
      score = yield_t_ha;
    } else if (objective === 'minimize_cost') {
      score = hasPrices && cost_usd ? -cost_usd : -(s.irrigation_fraction * 100 + s.fertilizer_rate_kg_ha);
    } else if (objective === 'yield_per_water') {
      score = yield_t_ha / Math.max(0.1, s.irrigation_fraction);
    } else {
      // Balanced
      const yieldNorm = yield_t_ha / 5.0;
      const waterEff = 1.0 - (s.irrigation_fraction * 0.35);
      const fertEff = 1.0 - (s.fertilizer_rate_kg_ha / 350) * 0.25;
      score = Number((yieldNorm * 0.5 + waterEff * 0.25 + fertEff * 0.25).toFixed(3));
    }

    return {
      name: s.name,
      inputs: s,
      predicted_yield_t_ha: yield_t_ha,
      total_production_tonnes: total_production,
      estimated_cost_usd: cost_usd,
      estimated_revenue_usd: rev_usd,
      estimated_profit_usd: profit_usd,
      water_use_index: water_index,
      fertilizer_use_index: fert_index,
      objective_score: score,
      rank: 1
    };
  };

  const baselineResult = computeScenario(baseline, true);
  const scenarioResults = scenarios.map(s => computeScenario(s));
  const allResults = [baselineResult, ...scenarioResults];

  // Rank scenarios
  const sorted = [...allResults].sort((a, b) => b.objective_score - a.objective_score);
  const recommended = sorted[0];

  const chartData = allResults.map(r => ({
    name: r.name,
    yield: r.predicted_yield_t_ha,
    production: r.total_production_tonnes,
    waterIndex: r.water_use_index,
    fertIndex: r.fertilizer_use_index,
    profit: r.estimated_profit_usd || 0,
    cost: r.estimated_cost_usd || 0,
    isRecommended: r.name === recommended.name
  }));

  const handleAddScenario = () => {
    if (scenarios.length >= 4) {
      showToast('Maximum of 4 alternative scenarios allowed for comparison.', 'warning');
      return;
    }
    const newScen: ScenarioInput = {
      name: `Scenario ${String.fromCharCode(65 + scenarios.length)}`,
      crop: baseline.crop,
      area_ha: baseline.area_ha,
      irrigation_fraction: 0.8,
      fertilizer_rate_kg_ha: 200,
      planting_period: 'Optimal',
    };
    setScenarios([...scenarios, newScen]);
    showToast(`Added ${newScen.name} to scenario matrix.`, 'info');
  };

  const handleRemoveScenario = (idx: number) => {
    if (scenarios.length <= 1) {
      showToast('At least one alternative scenario is required.', 'warning');
      return;
    }
    const updated = scenarios.filter((_, i) => i !== idx);
    setScenarios(updated);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      
      {/* Page Title & Scope */}
      <div className="border-b border-stone-200/80 pb-6 dark:border-stone-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-glow">
              <Sliders className="h-4 w-4" />
              <span>Multi-Objective Simulation</span>
            </div>
            <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight text-walnut dark:text-cream sm:text-4xl">
              Farm scenario optimizer
            </h1>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              Compare your current farm management baseline against alternative management strategies 
              under yield, water productivity, and cost criteria.
            </p>
          </div>

          {/* Objective Filter Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Target optimization objective:
            </label>
            <div className="inline-flex rounded-xl border border-stone-300 bg-white p-1 shadow-2xs dark:border-stone-700 dark:bg-stone-900">
              {[
                { id: 'maximize_yield', label: 'Maximize yield' },
                { id: 'minimize_cost', label: 'Minimize cost' },
                { id: 'yield_per_water', label: 'Water productivity' },
                { id: 'balanced', label: 'Balanced' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setObjective(tab.id as OptimizationObjective)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    objective === tab.id
                      ? 'bg-sage text-warm-white font-semibold shadow-xs'
                      : 'text-stone-600 hover:text-walnut dark:text-stone-400 dark:hover:text-cream'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Strategy Highlight Banner */}
      <div className="mt-8 rounded-2xl border border-sage/40 bg-sage-50/60 p-6 shadow-xs dark:border-sage-800/60 dark:bg-sage-950/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sage text-warm-white shadow-xs">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sage-800 dark:text-sage-300">
                <span>Recommended scenario under "{objective.replace('_', ' ')}"</span>
              </div>
              <h2 className="mt-0.5 font-heading text-xl font-bold text-walnut dark:text-cream">
                {recommended.name}
              </h2>
              <p className="mt-1 text-xs text-stone-700 dark:text-stone-300">
                Delivers <span className="font-bold">{recommended.predicted_yield_t_ha} t/ha</span> ({recommended.total_production_tonnes} tonnes total) 
                at an irrigation rate of {(recommended.inputs.irrigation_fraction * 100).toFixed(0)}% and {recommended.inputs.fertilizer_rate_kg_ha} kg/ha fertilizer.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 border-t border-sage/20 pt-3 md:border-t-0 md:pt-0">
            <div>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">Yield difference:</span>
              <p className="font-heading text-lg font-bold text-walnut dark:text-cream">
                {recommended.predicted_yield_t_ha >= baselineResult.predicted_yield_t_ha ? '+' : ''}
                {(recommended.predicted_yield_t_ha - baselineResult.predicted_yield_t_ha).toFixed(2)} t/ha
              </p>
            </div>
            {hasPrices && recommended.estimated_profit_usd !== undefined && (
              <div>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">Projected net profit:</span>
                <p className="font-heading text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  ${recommended.estimated_profit_usd.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pricing / Revenue Toggle (Only shows prices when enabled) */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-stone-200/80 bg-warm-white p-4 dark:border-stone-800 dark:bg-walnut">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="togglePrices"
            checked={hasPrices}
            onChange={(e) => setHasPrices(e.target.checked)}
            className="h-4 w-4 rounded border-stone-300 text-sage focus:ring-sage"
          />
          <label htmlFor="togglePrices" className="text-xs font-semibold text-walnut dark:text-cream cursor-pointer">
            Include economic pricing (Cost and revenue calculations)
          </label>
        </div>

        {hasPrices && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-stone-500 dark:text-stone-400">Crop price ($/t):</span>
              <input
                type="number"
                value={cropPrice}
                onChange={(e) => setCropPrice(parseFloat(e.target.value) || 0)}
                className="w-20 rounded-lg border border-stone-300 bg-white px-2 py-1 text-xs text-walnut dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-stone-500 dark:text-stone-400">Water ($/m³):</span>
              <input
                type="number"
                step="0.01"
                value={waterCost}
                onChange={(e) => setWaterCost(parseFloat(e.target.value) || 0)}
                className="w-18 rounded-lg border border-stone-300 bg-white px-2 py-1 text-xs text-walnut dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-stone-500 dark:text-stone-400">Fertilizer ($/kg):</span>
              <input
                type="number"
                step="0.05"
                value={fertilizerCost}
                onChange={(e) => setFertilizerCost(parseFloat(e.target.value) || 0)}
                className="w-18 rounded-lg border border-stone-300 bg-white px-2 py-1 text-xs text-walnut dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
              />
            </div>
          </div>
        )}
      </div>

      {/* Visual Comparison Charts */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        
        {/* Chart 1: Scenario Yields */}
        <div className="rounded-2xl border border-stone-200/90 bg-warm-white p-6 shadow-xs dark:border-stone-800 dark:bg-walnut">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
            <div>
              <h3 className="font-heading text-base font-bold text-walnut dark:text-cream">
                Predicted yield across scenarios
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">Unit: Tonnes per hectare (t/ha)</p>
            </div>
          </div>
          <div className="mt-6 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(value: any) => [`${value} t/ha`, 'Yield']}
                  contentStyle={{ backgroundColor: '#FFFDF8', borderRadius: 12, border: '1px solid #E8DFD0' }}
                />
                <Bar dataKey="yield" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isRecommended ? '#D5851F' : '#87A96B'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Input Usage Trade-Offs */}
        <div className="rounded-2xl border border-stone-200/90 bg-warm-white p-6 shadow-xs dark:border-stone-800 dark:bg-walnut">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
            <div>
              <h3 className="font-heading text-base font-bold text-walnut dark:text-cream">
                Input resource comparison
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">Irrigation fraction (%) vs Fertilizer rate (kg/ha)</p>
            </div>
          </div>
          <div className="mt-6 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFDF8', borderRadius: 12, border: '1px solid #E8DFD0' }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="waterIndex" name="Irrigation (%)" fill="#87A96B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fertIndex" name="Fertilizer (kg/ha)" fill="#5A3E2B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Scenario Parameters Editor */}
      <div className="mt-8 rounded-2xl border border-stone-200/90 bg-warm-white p-6 shadow-xs dark:border-stone-800 dark:bg-walnut">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4 dark:border-stone-800">
          <div>
            <h3 className="font-heading text-lg font-bold text-walnut dark:text-cream">
              Scenario configuration matrix
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Adjust irrigation fraction (0.0 to 1.0), fertilizer rate (kg/ha), and planting period to explore changes.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddScenario}
            className="inline-flex items-center gap-1.5 rounded-xl bg-stone-100 px-3.5 py-2 text-xs font-semibold text-walnut hover:bg-stone-200 dark:bg-stone-800 dark:text-cream dark:hover:bg-stone-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add scenario</span>
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 font-semibold">
                <th className="py-2.5 px-3">Scenario name</th>
                <th className="py-2.5 px-3">Area (ha)</th>
                <th className="py-2.5 px-3">Irrigation</th>
                <th className="py-2.5 px-3">Fertilizer (kg/ha)</th>
                <th className="py-2.5 px-3">Planting window</th>
                <th className="py-2.5 px-3">Yield (t/ha)</th>
                {hasPrices && <th className="py-2.5 px-3">Net profit ($)</th>}
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              
              {/* Baseline Row */}
              <tr className="bg-stone-50/60 dark:bg-stone-900/40 font-medium">
                <td className="py-3 px-3">
                  <span className="rounded-md bg-stone-200/80 px-2 py-0.5 text-[10px] font-bold text-walnut mr-1.5 dark:bg-stone-700 dark:text-cream">
                    BASELINE
                  </span>
                  {baseline.name}
                </td>
                <td className="py-3 px-3">{baseline.area_ha}</td>
                <td className="py-3 px-3">
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={baseline.irrigation_fraction}
                    onChange={(e) => setBaseline({ ...baseline, irrigation_fraction: parseFloat(e.target.value) || 0 })}
                    className="w-16 rounded border border-stone-300 px-1.5 py-0.5 text-xs text-walnut dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
                  />
                </td>
                <td className="py-3 px-3">
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={baseline.fertilizer_rate_kg_ha}
                    onChange={(e) => setBaseline({ ...baseline, fertilizer_rate_kg_ha: parseFloat(e.target.value) || 0 })}
                    className="w-20 rounded border border-stone-300 px-1.5 py-0.5 text-xs text-walnut dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
                  />
                </td>
                <td className="py-3 px-3">
                  <select
                    value={baseline.planting_period}
                    onChange={(e) => setBaseline({ ...baseline, planting_period: e.target.value })}
                    className="rounded border border-stone-300 px-1.5 py-0.5 text-xs text-walnut dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
                  >
                    <option value="Early">Early</option>
                    <option value="Optimal">Optimal</option>
                    <option value="Late">Late</option>
                  </select>
                </td>
                <td className="py-3 px-3 font-bold text-walnut dark:text-cream">
                  {baselineResult.predicted_yield_t_ha} t/ha
                </td>
                {hasPrices && (
                  <td className="py-3 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                    ${baselineResult.estimated_profit_usd?.toLocaleString() || 0}
                  </td>
                )}
                <td className="py-3 px-3 text-right text-stone-400">Fixed</td>
              </tr>

              {/* Scenarios Rows */}
              {scenarios.map((scen, idx) => {
                const res = scenarioResults[idx];
                return (
                  <tr key={idx} className="hover:bg-stone-50/40 dark:hover:bg-stone-900/20">
                    <td className="py-3 px-3 font-medium text-walnut dark:text-cream">
                      {scen.name}
                      {scen.name === recommended.name && (
                        <span className="ml-2 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          BEST
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">{scen.area_ha}</td>
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        max="1"
                        value={scen.irrigation_fraction}
                        onChange={(e) => {
                          const updated = [...scenarios];
                          updated[idx].irrigation_fraction = parseFloat(e.target.value) || 0;
                          setScenarios(updated);
                        }}
                        className="w-16 rounded border border-stone-300 px-1.5 py-0.5 text-xs text-walnut dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        min="0"
                        max="500"
                        value={scen.fertilizer_rate_kg_ha}
                        onChange={(e) => {
                          const updated = [...scenarios];
                          updated[idx].fertilizer_rate_kg_ha = parseFloat(e.target.value) || 0;
                          setScenarios(updated);
                        }}
                        className="w-20 rounded border border-stone-300 px-1.5 py-0.5 text-xs text-walnut dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={scen.planting_period}
                        onChange={(e) => {
                          const updated = [...scenarios];
                          updated[idx].planting_period = e.target.value;
                          setScenarios(updated);
                        }}
                        className="rounded border border-stone-300 px-1.5 py-0.5 text-xs text-walnut dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
                      >
                        <option value="Early">Early</option>
                        <option value="Optimal">Optimal</option>
                        <option value="Late">Late</option>
                      </select>
                    </td>
                    <td className="py-3 px-3 font-bold text-walnut dark:text-cream">
                      {res.predicted_yield_t_ha} t/ha
                    </td>
                    {hasPrices && (
                      <td className="py-3 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                        ${res.estimated_profit_usd?.toLocaleString() || 0}
                      </td>
                    )}
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveScenario(idx)}
                        aria-label={`Remove ${scen.name}`}
                        className="text-stone-400 hover:text-rose-500 transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}

            </tbody>
          </table>
        </div>
      </div>

      {/* Scientific Limitation & Responsible-Use Disclaimer */}
      <div className="mt-8 rounded-2xl border border-stone-200/80 bg-stone-50/70 p-5 text-xs leading-relaxed text-stone-600 dark:border-stone-800 dark:bg-stone-900/40 dark:text-stone-400">
        <div className="flex items-center gap-2 font-bold text-walnut dark:text-cream">
          <AlertCircle className="h-4 w-4 text-amber-glow" />
          <span>Scientific limitation & model boundary notice:</span>
        </div>
        <p className="mt-1.5">
          All scenario outcomes are mathematical model estimates derived from historical agronomic relationships. 
          They indicate statistical correlations within the model's trained parameter ranges, and are not physical proof 
          of cause and effect. Actual field results depend on localized micro-climates, soil biological activity, seed genetics, 
          and unforeseen pest pressures.
        </p>
      </div>

    </div>
  );
};
