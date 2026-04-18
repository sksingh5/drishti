# Climate Risk Analysis Platform — Design Spec

**Date:** 2026-04-18
**Status:** Approved
**Project:** dicrav2

---

## 1. Overview

A climate risk analysis platform for India that provides district-level risk scoring, interactive dashboards, comparison tools, and an alert system. Built for government officials (district collectors, agriculture officers) and banking/insurance professionals (crop loan officers, parametric insurance designers).

The platform consumes satellite and weather data from IMD, ERA5, and MODIS, computes configurable risk scores, and presents them through MapLibre-powered choropleth maps with a National → State → District drill-down.

## 2. System Architecture

Three components, clearly separated:

```
┌─────────────────────────────────────┐
│         Next.js Application         │
│  (Dashboard + API Routes + Maps)    │
│         Deployed on Vercel          │
└──────────────┬──────────────────────┘
               │ reads from
               ▼
┌─────────────────────────────────────┐
│     PostgreSQL + PostGIS            │
│  (Risk scores, geospatial data,    │
│   district/block boundaries,       │
│   historical indicators, alerts)   │
│        Supabase (Pro)              │
└──────────────▲──────────────────────┘
               │ writes to
               │
┌─────────────────────────────────────┐
│      Python Data Pipeline           │
│  (Fetch → Process → Score → Store)  │
│  Scheduled on cloud VM (daily/weekly│
│  depending on data source cadence)  │
└─────────────────────────────────────┘
```

### Key decisions

- **Next.js on Vercel** — SSR for fast initial loads, server components for data-heavy pages, API routes become the public API in Phase 4.
- **PostgreSQL + PostGIS on Supabase** — managed Postgres with PostGIS, connection pooling, realtime subscriptions (for alerts later), row-level security when auth is added in Phase 2.
- **Python pipeline on a cloud VM** — scheduled jobs. Python scripts, virtual environment, and cron. No containers initially.
- **No message queues, no Redis, no microservices** — unnecessary at this stage.

### Data flow

1. Pipeline fetches raw data from sources (IMD API, GEE, ERA5/CDS).
2. Pipeline processes and computes individual indicator scores per district.
3. Pipeline writes results to PostGIS.
4. Next.js reads from PostGIS, renders dashboards and maps.
5. Composite risk scores computed client-side using user-configurable weights.
6. Alert thresholds checked during pipeline runs, breaches written to database.

## 3. Data Model

### `states`
India's 36 states/UTs as the top-level geographic unit.
- `id` (PK), `lgd_code` (unique), `name`, `area_sq_km`, `geometry` (PostGIS polygon)

### `districts`
India's ~770 districts as the primary geographic unit.
- `id` (PK), `lgd_code` (unique), `name`, `state_id` (FK), `area_sq_km`, `geometry` (PostGIS polygon)

### `blocks`
~7,000 blocks linked to districts (Phase 3 drill-down).
- `id` (PK), `lgd_code` (unique), `name`, `district_id` (FK), `geometry` (PostGIS polygon)

### `climate_indicators`
Individual risk metrics per district per time period. Millions of rows over time, partitioned by year.
- `id` (PK), `district_id` (FK), `indicator_type` (enum), `value` (raw), `score` (0-100 normalized), `period_start`, `period_end`, `source`, `methodology_version`, `created_at`

Indicator types: `rainfall_anomaly`, `drought_index`, `vegetation_health`, `heat_stress`, `flood_risk`, `soil_moisture`

### `risk_score_defaults`
System default weight profiles.
- `id` (PK), `name`, `weights` (JSONB — indicator_type → weight), `description`

### `alert_thresholds`
System-default and user-defined thresholds.
- `id` (PK), `indicator_type`, `threshold_value`, `comparison_operator`, `severity` (warning/critical), `is_system_default`

### `alert_events`
Triggered alerts.
- `id` (PK), `district_id` (FK), `threshold_id` (FK), `triggered_at`, `current_value`, `acknowledged`

### `data_sources`
Registry of all data pipelines.
- `id` (PK), `source_name`, `description`, `last_fetched`, `fetch_frequency`, `status` (ok/error/stale), `row_count`

### Key indexes
- GiST spatial index on district/block geometries
- Composite index on (`district_id`, `indicator_type`, `period_start`) for fast lookups
- Time-based partitioning on `climate_indicators` by year

### What's NOT in the database
- Raw satellite imagery — stays in cloud storage, pipeline extracts values
- User accounts — deferred to Phase 2
- Composite risk scores — computed client-side from individual indicator scores + weights

## 4. Risk Scoring Methodology

### Individual indicator scores (0-100)
Each indicator normalized using historical percentile ranking (30-year baseline where available). Higher score = higher risk.

| Indicator | Source | Update Frequency | Default Weight |
|-----------|--------|-----------------|----------------|
| Rainfall anomaly | IMD gridded | Monthly | 20% |
| Drought index (SPI) | Computed from IMD | Monthly | 20% |
| Vegetation health (NDVI) | MODIS via GEE | 16-day | 15% |
| Heat stress | IMD/ERA5 | Monthly | 15% |
| Flood risk | Rainfall + soil moisture + elevation | Monthly | 15% |
| Soil moisture | ERA5-Land | Monthly | 15% |

### Composite score
- Weighted sum of individual indicator scores
- Weights configurable by user (default weights provided)
- Computed client-side for instant feedback when weights change
- Category thresholds: 0-25 Low, 26-50 Moderate, 51-75 High, 76-100 Critical
- Trend: 3-month moving direction (improving/stable/worsening)

### Methodology versioning
- Every indicator score record stores a `methodology_version` field
- When normalization logic changes, version increments
- Historical scores remain tied to the methodology that produced them
- Critical for auditability — users can trust that scores they acted on haven't been retroactively changed

### Scientific basis
- Percentile-based scoring: standard practice in climate risk assessment (World Bank, IPCC)
- SPI: WMO-recommended drought index
- NDVI anomaly: established in agricultural monitoring literature
- Deliberately conservative methodology — defensible to regulators and peer reviewers

## 5. Dashboard Pages & UX

### Navigation hierarchy
National → State → District (consistent across all pages)

Top nav: **Home | Scorecard | Compare | Alerts | Weights**

Desktop-first, responsive. Government and banking users primarily use desktop/laptop.

No auth for MVP — publicly accessible. Weights stored in browser localStorage.

### Page 1: National Overview
- Full-India choropleth map colored by composite risk at state level (aggregated from district scores)
- Toggle between hazard types (drought, flood, heat, composite)
- Toggle between time periods (current, last month, last season, year-over-year)
- Sidebar: top 10 highest-risk states ranked
- Click any state → State View

### Page 2: State View
- State-level choropleth showing all districts within that state
- State summary stats: average risk, highest-risk districts, indicator breakdown
- District ranking table sorted by risk score
- Click any district → District Scorecard

### Page 3: District Scorecard
- Breadcrumb: India → [State] → [District]
- Risk summary card: composite score (0-100) with category badge, trend arrow
- Hazard breakdown: six indicator cards showing individual scores
- Historical trend charts: line charts per indicator over 3-5 years
- Context panel: area, major crops, population, agro-climatic zone (static reference data)
- "Other districts in [State]" quick-nav dropdown
- Actions: "Compare with another district" button

### Page 4: Comparison Tool
- First select a state (or "cross-state" mode)
- Pick two districts to compare
- Side-by-side matched indicator cards
- Radar/spider chart overlay for quick gestalt comparison
- Respects active weight profile

### Page 5: Alerts Dashboard
- Table of active alerts: district, indicator, threshold breached, severity, timestamp
- Filterable by state first, then district
- Filterable by hazard type, severity
- System-default thresholds for MVP

### Page 6: Weight Configuration
- Slider controls for each indicator weight (0-100%), constrained to sum to 100%
- Auto-rebalance: adjusting one slider proportionally adjusts others
- Named presets: save/load weight profiles (e.g., "Drought Focus", "Flood Region", "Bank Default")
- Live preview: scorecard and map update in real-time as weights change
- Stored in localStorage (MVP), user profile database (Phase 2)

### Data Freshness Indicator
- Visible on all pages (footer or header badge)
- Shows last update timestamp per data source
- Color-coded: green (fresh), yellow (slightly stale), red (overdue)

## 6. Tech Stack

### Frontend (Next.js)
- **Next.js 15** — App Router, server components
- **TypeScript**
- **Tailwind CSS + shadcn/ui** — professional, data-dense UI
- **MapLibre GL JS** — open-source, zero cost, no API key
- **Recharts** — charting (trend lines, radar charts, gauges)
- **Tanstack Table** — alert tables, district rankings

### Database
- **Supabase** (Pro) — PostgreSQL + PostGIS, connection pooling, realtime

### Python Data Pipeline
- **Python 3.12+**
- **xarray + rioxarray** — gridded climate data handling
- **Google Earth Engine Python API** — MODIS NDVI extraction
- **requests + httpx** — API fetching (IMD, CDS)
- **geopandas** — spatial operations, district-level aggregation
- **psycopg2 + SQLAlchemy** — PostGIS writes
- **cron** — job scheduling

### Deployment
- **Vercel** — Next.js app
- **Supabase Cloud** — database (existing Pro subscription)
- **Cloud VM** (GCP or AWS) — Python pipeline with cron

### Geospatial data
- District/block boundaries from Survey of India / LGD
- GeoJSON simplified for web rendering (TopoJSON for smaller payloads)

### What's excluded
- No Redis — risk scores pre-computed, composites computed client-side
- No ORM on Next.js side — raw SQL via Supabase client
- No Docker initially — Python + venv + cron
- No CI/CD pipeline initially — Vercel deploys on git push, pipeline deployed manually

## 7. Data Sources & Access

All free / open access for MVP:

| Source | Data | Access | Notes |
|--------|------|--------|-------|
| IMD | Gridded rainfall, temperature | Free, registration required | Daily updates, ~1 day latency |
| ERA5-Land (CDS) | Soil moisture, temperature | Free, registration required | Monthly, ~5 days latency |
| MODIS (via GEE) | NDVI vegetation index | Free, GEE account required | 16-day composites, ~2 days latency |
| SRTM (via GEE) | Elevation/DEM | Free | One-time fetch for flood risk |
| LGD / Survey of India | District/block boundaries | Free | One-time setup |

**GEE licensing note:** Free for research and non-commercial use. If platform becomes commercial (Phase 4 API), consider switching to direct MODIS downloads from NASA LAADS or obtaining GEE commercial license.

**MapLibre GL JS:** Fully open-source, no API key needed, no usage limits.

## 8. Data Pipeline Architecture

### Stage 1: Fetch
Each data source has its own fetcher script:
- `fetch_imd.py` — IMD gridded rainfall and temperature
- `fetch_era5.py` — ERA5-Land via CDS API
- `fetch_gee.py` — MODIS NDVI via Earth Engine Python API
- `fetch_elevation.py` — one-time SRTM DEM fetch

Each fetcher is idempotent — safe to re-run, skips already-fetched data.

### Stage 2: Process
- Raw gridded data → district-level aggregation using district boundary polygons
- Zonal statistics: mean, min, max, std dev per district per time period
- Uses geopandas + rioxarray for spatial operations

### Stage 3: Score
- Normalize each indicator against historical baseline (percentile rank)
- Compute SPI from rainfall time series
- Compute NDVI anomaly from vegetation index
- Compute flood risk composite (rainfall + soil moisture + elevation)
- Write individual indicator scores (0-100) to `climate_indicators` table

### Stage 4: Alert Check
- Compare latest indicator scores against `alert_thresholds`
- If breached, write to `alert_events`
- MVP: database writes only. Phase 2: email/webhook notifications.

### Schedule
| Source | Frequency | Cron |
|--------|-----------|------|
| IMD rainfall/temp | Daily | `0 6 * * *` |
| ERA5-Land | Monthly | `0 6 10 * *` |
| MODIS NDVI | Every 16 days | `0 6 1,17 * *` |

### Orchestration
Bash script calling each stage in sequence, triggered by cron. Separate crons for daily vs. monthly sources.

### Error handling
- Each fetcher logs success/failure
- Updates `data_sources` table with `last_fetched` timestamp and `status`
- Dashboard shows data freshness indicator sourced from this table

## 9. Project Phases

### Phase 1 — MVP (current scope)
- National → State → District drill-down with MapLibre choropleth maps
- District scorecard with 6 indicator scores and historical trends
- State view with district ranking
- Comparison tool (two districts side-by-side)
- Weight configuration with presets and live preview
- Alerts dashboard (system-default thresholds)
- Data pipeline: IMD rainfall + temperature, ERA5 soil moisture, MODIS NDVI
- Data freshness indicator
- No auth, publicly accessible, weights in localStorage

### Phase 2 — User Accounts & Personalization
- Authentication (Supabase Auth)
- Saved weight profiles per user
- User-configured alert thresholds
- Email/webhook alert notifications
- Saved/bookmarked districts

### Phase 3 — Decision Support
- Scenario queries ("Is it safe to approve kharif loans in district X?")
- Risk trend forecasting
- Exportable PDF risk scorecards
- Block-level drill-down within districts

### Phase 4 — Public API
- REST API for risk scores, indicators, alerts
- API key management, rate limiting
- Documentation portal
- Banking/insurance integration use cases

### Explicitly deferred
- Crop yield prediction models
- Farmer/FPO-facing interfaces
- Multi-language support
- Mobile app
- Real-time streaming data
