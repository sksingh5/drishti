# Crop & Farmer Impact Module — Design Spec

## Goal

Add crop-specific intelligence to district pages so farmers and agricultural lenders can understand how current climate conditions affect the major crops in their district, and get actionable guidance.

## Two Components

### 1. Interactive Point Query on District Map

A map on each district page showing the district boundary. Farmers click anywhere inside to get plot-level satellite data via GEE (extending the existing point query feature from the national dashboard).

**What the point query returns:**
- NDVI, EVI (vegetation indices at 250m)
- Land Surface Temperature
- Soil Moisture
- Recent Precipitation
- Cropland classification — is this point cropland, forest, urban, water (from MODIS Land Cover MCD12Q1)
- Cropping intensity — single/double/triple crop detection (from NDVI temporal pattern)

**Resolution:** 250m for vegetation, 1km for temperature, ~10km for soil moisture. Farmers get the best available data at their plot.

### 2. Standing Crop Advisory Cards

Permanent section showing guidance for the top 3-4 crops grown in this district's agro-climatic zone. Each card has two tiers:

**Tier 1 — Alerts** (dynamic, from our indicator scores):
Maps current indicator scores to crop-specific warnings using threshold rules. Example: cotton + heat_stress > 60 → "High temperatures may affect boll development."

**Tier 2 — General Guidance** (curated, from ICAR/KVK):
Standard agricultural recommendations for that crop under those climate conditions. Clearly labeled as general guidance. Example: "Consider mulching to retain soil moisture during dry spells."

## Data Sources

### Crop-to-District Mapping
Static JSON file mapping ~15 agro-climatic zones → top 3-4 crops each. Districts are assigned to zones. Approximately 30-40 zone entries covering all of India.

Source: ICAR agro-climatic zone classification + known dominant crops per zone.

Example structure:
```json
{
  "zones": [
    {
      "name": "Western Plateau & Hills",
      "crops": ["Cotton", "Soybean", "Pigeon Pea", "Sorghum"],
      "district_ids": [101, 102, 103]
    }
  ]
}
```

### Crop-Climate Threshold Rules
Static rules file mapping crop + indicator + threshold → alert message.

Example:
```json
[
  {
    "crop": "Cotton",
    "indicator": "heat_stress",
    "threshold": 60,
    "direction": "above",
    "alert": "High temperatures may affect boll development and fiber quality"
  },
  {
    "crop": "Rice",
    "indicator": "soil_moisture",
    "threshold": 60,
    "direction": "above",
    "alert": "Low soil moisture — paddy fields need supplemental irrigation"
  }
]
```

### Crop Guidance Rules
Static rules file mapping crop + risk condition → general guidance text.

Example:
```json
[
  {
    "crop": "Cotton",
    "condition": "heat_stress_high",
    "guidance": [
      "Consider mulching to retain soil moisture during dry spells",
      "Monitor for bollworm — heat stress increases pest pressure",
      "Ensure irrigation access for critical flowering stage"
    ]
  }
]
```

### Point Query Data
Extended from the existing GEE point query. Add two new datasets:
- MODIS Land Cover (MCD12Q1) — 500m annual, classifies land use type
- Cropping intensity derived from NDVI time-series (number of peaks in annual NDVI curve = number of crop cycles)

## District Page Layout — Responsive Tabs/Accordion

### Structure

The hero row (composite score + metadata) stays fixed at the top. Below it, content is organized into 3 sections:

- **Risk Overview** — recommended actions + 6 indicator insight cards + data sources
- **Crop Advisory** — district map with point query + standing advisory cards for major crops
- **Trends** — historical trends chart

### Desktop (md+): Tabs
```
┌──────────────────────────────────────────────┐
│  Hero: District Name + Composite Score       │
│  Metadata: Area, Analysis Period             │
├──────────────────────────────────────────────┤
│  [Risk Overview]  [Crop Advisory]  [Trends]  │
├──────────────────────────────────────────────┤
│                                              │
│  (Active tab content)                        │
│                                              │
└──────────────────────────────────────────────┘
```

### Mobile: Accordion
```
┌──────────────────┐
│ Hero + Score      │
├──────────────────┤
│ ▼ Risk Overview  │
│   (expanded)     │
│   ...content...  │
├──────────────────┤
│ ▶ Crop Advisory  │
│   (collapsed)    │
├──────────────────┤
│ ▶ Trends         │
│   (collapsed)    │
└──────────────────┘
```

Same components render in both modes — just different containers.

### Crop Advisory Tab Content

**Top half:** District map (MapLibre, showing district boundary over OSM tiles). Point query enabled — click drops pin, shows satellite data + cropland classification in a floating card.

**Bottom half:** Scrollable grid of crop advisory cards. One card per major crop (3-4 cards).

### Crop Advisory Card Design

```
┌─────────────────────────────────────────┐
│ 🌾 Cotton                               │
│─────────────────────────────────────────│
│ ALERTS                                  │
│ ⚠ Heat stress is HIGH (72/100)         │
│   High temperatures may affect boll     │
│   development and fiber quality         │
│ ⚠ Soil moisture is LOW (65/100)        │
│   Low moisture — critical for boll      │
│   filling stage                         │
│ ● Rainfall: NORMAL (34/100)            │
│─────────────────────────────────────────│
│ GENERAL GUIDANCE                        │
│ • Consider mulching to retain soil      │
│   moisture during dry spells            │
│ • Monitor for bollworm — heat stress    │
│   increases pest pressure               │
│ • Ensure irrigation access for          │
│   critical flowering stage              │
└─────────────────────────────────────────┘
```

Alerts section: dynamic, generated from current indicator scores + crop threshold rules.
General Guidance section: curated, from crop guidance rules file. Clearly labeled.

## File Structure

| File | Responsibility |
|------|---------------|
| `lib/crop-zones.ts` | Agro-climatic zone → crop mapping + district → zone lookup |
| `lib/crop-alerts.ts` | Crop + indicator score → alert messages |
| `lib/crop-guidance.ts` | Crop + risk condition → general guidance text |
| `data/crop-zones.json` | Static zone-to-crop-to-district mapping (~15 zones) |
| `data/crop-alert-rules.json` | Crop-climate threshold rules |
| `data/crop-guidance-rules.json` | Curated ICAR/KVK guidance per crop per condition |
| `components/district-tabs.tsx` | Responsive tabs (desktop) / accordion (mobile) wrapper |
| `components/crop-advisory-card.tsx` | Single crop advisory card (alerts + guidance) |
| `components/crop-advisory-section.tsx` | District map + grid of crop advisory cards |
| `app/district/[districtId]/district-scorecard.tsx` | Modified: wrap existing content in tabs/accordion |
| `lib/gee-point-query.ts` | Modified: add land cover + crop intensity to point query |
| `components/map/point-query-card.tsx` | Modified: show cropland type + intensity in results |

## Upgrade Path to AI (Future)

The current design uses static rules for alerts and guidance. When upgrading to LLM-based advisory (Option B):

1. Replace `crop-alerts.ts` + `crop-guidance.ts` with an LLM call
2. Pass: district name, zone, crops, current indicator scores, season
3. LLM returns: contextual alerts + specific guidance
4. Cache per district per period (one LLM call per district per month, not per user visit)

The UI components (cards, tabs, map) stay the same — only the data source changes.

## Scope Boundaries

**In scope:**
- Tabbed/accordion layout for district page
- District map with point query on Crop Advisory tab
- Agro-climatic zone → crop mapping (static JSON)
- Crop-specific alert rules (static)
- Crop-specific guidance rules (curated, static)
- Land cover classification in point query (GEE)

**Out of scope (future phases):**
- LLM-generated advisory text
- Crop yield prediction/estimation
- Sub-district administrative boundaries
- Crop type classification from satellite imagery
- ICRISAT model integration
- Ministry of Agriculture data integration
- Multi-language support (Hindi, regional languages)
