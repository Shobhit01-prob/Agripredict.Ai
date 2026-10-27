# AgriPredict AI — Data Sources Registry

This document records the exact datasets, access dates, URLs, real columns, and attribution for AgriPredict AI.

## 1. Primary Dataset: FAOSTAT Crops and Livestock Products (QCL)

- **Dataset Name**: Production: Crops and livestock products (Normalized)
- **Dataset Code**: QCL
- **Source Organization**: Food and Agriculture Organization of the United Nations (FAO)
- **Direct Bulk URL**: `https://bulks-faostat.fao.org/production/Production_Crops_Livestock_E_All_Data_(Normalized).zip`
- **Fallback URL**: `https://fenixservices.fao.org/faostat/static/bulkdownloads/Production_Crops_Livestock_E_All_Data_(Normalized).zip`
- **Access Date**: 2026-10-25
- **License / Terms**: FAO Open Access (CC-BY-4.0 / Open Data Licensing)
- **Contents**:
  - `Area Code`, `Area Code (M49)`: Country or regional grouping identifier
  - `Area`: Country or region name
  - `Item Code`, `Item Code (CPC)`: Crop or product identifier
  - `Item`: Name of the crop (e.g., Wheat, Maize, Rice, Potatoes, Soybeans)
  - `Element Code`: Indicator identifier
  - `Element`: Measurement type (`Area harvested`, `Yield`, `Production`)
  - `Year Code`, `Year`: Calendar year (1961 - recent)
  - `Unit`: Unit of measurement (ha for Area harvested, 100 g/ha or hg/ha for Yield, tonnes for Production)
  - `Value`: Numerical observation
  - `Flag`: Observation status flag (e.g., `A` = official, `E` = estimated)

## 2. Weather Dataset: NASA POWER Agroclimatology (Optional Feature Ingestion)

- **Dataset Name**: NASA Prediction Of Worldwide Energy Resources (POWER) Agroclimatology API
- **Source Organization**: NASA Langley Research Center
- **API Endpoint**: `https://power.larc.nasa.gov/api/temporal/climatology/point` & `https://power.larc.nasa.gov/api/temporal/monthly/point`
- **Access Date**: 2026-10-25
- **Parameters**:
  - `T2M`: Temperature at 2 Meters (°C)
  - `PRECTOTCORR`: Corrected Total Precipitation (rainfall in mm/day or mm/month)
  - `RH2M`: Relative Humidity at 2 Meters (%)
- **Resolution**: Daily/Monthly/Annual aggregates mapped to country centroids / agricultural regions.
- **Attribution**: NASA POWER Project (CC0 Public Domain).

## 3. Soil and Farm Inputs (Nutrients, Soil pH, Fertilizer & Irrigation)

- **Soil Parameters**: Representative agronomic soil profiles (soil_ph, nitrogen, phosphorus, potassium) derived from ISRIC SoilGrids / FAO Harmonized World Soil Database (HWSD) regional soil profiles.
- **Fertilizer & Irrigation**: Note on availability: While global bulk surveys contain national consumption summaries, farm-level actual application rates are modeled as user-controllable what-if scenarios in the Optimization engine. The model explicitly marks when baseline weather or regional defaults are used vs user-entered scenarios, and the Optimization page clearly indicates that scenario results are mathematical model estimates and not proof of direct physical causation.

## 4. Internal Canonical Schema

All raw and merged datasets map into this standardized format:
- `country`: string (e.g. "India", "United States of America", "Brazil")
- `region`: string (continent/sub-region)
- `year`: integer (calendar year)
- `crop`: string (standardized crop name)
- `season`: string ("Annual", "Kharif", "Rabi", etc.)
- `area_harvested`: float (hectares, ha)
- `production_quantity`: float (tonnes, t)
- `yield`: float (tonnes per hectare, t/ha)
- `rainfall`: float (annual precipitation in mm)
- `temperature`: float (mean temperature in °C)
- `humidity`: float (mean relative humidity in %)
- `soil_ph`: float (pH scale 0-14)
- `nitrogen`: float (mg/kg or kg/ha index)
- `phosphorus`: float (mg/kg or kg/ha index)
- `potassium`: float (mg/kg or kg/ha index)
- `irrigation`: float (irrigation fraction or mm)
- `fertilizer_rate`: float (total NPK application rate kg/ha)
