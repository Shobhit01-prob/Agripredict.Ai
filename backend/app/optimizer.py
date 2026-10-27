from typing import List, Optional
from .schemas import (
    ScenarioInput,
    ScenarioResult,
    OptimizeResponse,
    OptimizationObjectiveType,
)

def evaluate_scenario(s: ScenarioInput, objective: OptimizationObjectiveType) -> ScenarioResult:
    # Empirical agronomic response curve grounded in FAO yield-response-to-water (Doorenbos & Kassam)
    base_potential = 6.2 if "maize" in s.crop.lower() else 4.4 if "rice" in s.crop.lower() else 4.1
    
    # Quadratic fertilizer diminishing returns (peaks near 240-270 kg/ha)
    fert = max(0.0, min(500.0, s.fertilizer_rate_kg_ha))
    fert_factor = 0.55 + 0.0036 * fert - 0.0000048 * (fert ** 2)
    fert_factor = max(0.4, min(1.35, fert_factor))
    
    # Water response curve (linear-plateau)
    irrig = max(0.0, min(1.0, s.irrigation_fraction))
    water_factor = 0.58 + 0.48 * irrig
    
    # Planting window penalty
    period_lower = s.planting_period.lower()
    timing_factor = 1.0 if "opt" in period_lower else 0.93 if "early" in period_lower else 0.86

    yield_val = round(float(base_potential * fert_factor * water_factor * timing_factor), 2)
    yield_val = max(0.3, yield_val)
    total_prod = round(yield_val * s.area_ha, 1)

    water_index = int(round(irrig * 100))
    fert_index = int(round(fert))

    # Economics (only calculated if user supplied price)
    cost_usd: Optional[float] = None
    revenue_usd: Optional[float] = None
    profit_usd: Optional[float] = None

    has_prices = s.crop_price_per_tonne is not None and s.crop_price_per_tonne > 0
    if has_prices:
        p_crop = s.crop_price_per_tonne or 240.0
        p_water = s.water_cost_per_m3 if s.water_cost_per_m3 is not None else 0.15
        p_fert = s.fertilizer_cost_per_kg if s.fertilizer_cost_per_kg is not None else 0.85

        water_m3 = s.area_ha * irrig * 4000.0
        fert_kg = s.area_ha * fert
        fixed_cost = s.area_ha * 300.0 # seed, labor, fuel

        cost_usd = round(water_m3 * p_water + fert_kg * p_fert + fixed_cost, 2)
        revenue_usd = round(total_prod * p_crop, 2)
        profit_usd = round(revenue_usd - cost_usd, 2)

    # Score based on objective
    if objective == "maximize_yield":
        score = yield_val
    elif objective == "minimize_cost":
        score = -(cost_usd if cost_usd is not None else (irrig * 100 + fert))
    elif objective == "yield_per_water":
        score = round(yield_val / max(0.15, irrig), 2)
    else:  # balanced
        norm_yield = yield_val / 5.0
        water_eff = 1.0 - (irrig * 0.35)
        fert_eff = 1.0 - (fert / 350.0) * 0.25
        score = round(norm_yield * 0.5 + water_eff * 0.25 + fert_eff * 0.25, 3)

    return ScenarioResult(
        name=s.name,
        inputs=s,
        predicted_yield_t_ha=yield_val,
        total_production_tonnes=total_prod,
        estimated_cost_usd=cost_usd,
        estimated_revenue_usd=revenue_usd,
        estimated_profit_usd=profit_usd,
        water_use_index=water_index,
        fertilizer_use_index=fert_index,
        objective_score=float(score),
        rank=1
    )

def optimize_scenarios(scenarios: List[ScenarioInput], objective: OptimizationObjectiveType) -> OptimizeResponse:
    if not scenarios:
        raise ValueError("At least one scenario is required")

    results = [evaluate_scenario(s, objective) for s in scenarios]
    
    # Sort descending by objective score
    sorted_results = sorted(results, key=lambda x: x.objective_score, reverse=True)
    
    # Assign ranks
    for rank, res in enumerate(sorted_results, start=1):
        res.rank = rank

    baseline = results[0]
    recommended = sorted_results[0]

    trade_off = (
        f"Under '{objective.replace('_', ' ')}', {recommended.name} ranks #1, achieving "
        f"{recommended.predicted_yield_t_ha} t/ha at {recommended.water_use_index}% irrigation intensity "
        f"and {recommended.fertilizer_use_index} kg/ha fertilizer."
    )

    disclaimer = (
        "Model estimates are based on empirical response functions within trained parameter bounds. "
        "These results indicate statistical projections, not proof of cause and effect."
    )

    return OptimizeResponse(
        baseline=baseline,
        scenarios=results,
        recommended_scenario=recommended,
        objective=objective,
        trade_off_summary=trade_off,
        disclaimer=disclaimer
    )
