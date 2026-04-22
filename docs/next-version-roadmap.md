# DiCRA v2 — Next Version Roadmap

**Current state:** 2 of 6 indicators live with real data (IMD rainfall, IMD temperature). Platform built, design system complete, landing page deployed.

---

## Phase 1: Data Completeness (Priority: Immediate)

### 1.1 Multi-month historical data
**Why:** Currently only June 2024. Trend charts are empty, SPI needs history.
**Action:** Run IMD rainfall + temperature pipelines for Jan–Jun 2024 (6 months). This enables:
- Historical trend charts on district scorecards
- SPI drought calculation (needs 3+ months of same-month data across years)
- Month-over-month change indicators on stat cards

### 1.2 SPI Drought Index activation
**Why:** Currently "Coming Soon". Requires multi-month rainfall history.
**Action:** After 1.1, run `python -m src.compute_drought_index 2024 6` to compute SPI from available history. Acknowledge in methodology that SPI reliability improves with more years.

### 1.3 ERA5 Soil Moisture
**Why:** 4th indicator, needed for flood risk composite.
**Blocker:** CDS account registration at https://cds.climate.copernicus.eu
**Action:** Register, configure `~/.cdsapirc`, run `python -m src.fetch_era5 2024 6`

### 1.4 MODIS NDVI Vegetation Health
**Why:** 5th indicator, satellite vegetation data.
**Blocker:** GEE account registration at https://earthengine.google.com
**Action:** Register, authenticate (`earthengine authenticate`), run pipeline

### 1.5 Flood Risk Composite
**Why:** Currently uses placeholder elevation. Partially functional after soil moisture is loaded.
**Action:** After 1.3, run flood risk composite. Plan DEM integration (SRTM 90m) as separate task.

---

## Phase 2: Scientific Rigor (Priority: High)

### 2.1 Implement true climatological baseline
**Why:** Rainfall anomaly currently uses single-year mean, not 30-year climatology.
**Action:** Download IMD data for 1991-2020 (or available range), compute per-district long-term monthly means, store as reference table. Modify `fetch_imd_rainfall.py` to score against this baseline.

### 2.2 SPI timescale upgrade
**Why:** Current SPI(1-month) is noisy. WMO recommends SPI(3-month) or SPI(6-month) for agricultural drought.
**Action:** Implement rolling 3-month rainfall accumulation before gamma fitting. Requires at least 1 year of monthly data per district.

### 2.3 Integrate real DEM for flood risk
**Why:** Elevation factor is currently placeholder (50).
**Action:** Download SRTM 30m/90m DEM, compute mean elevation per district, normalize to 0-100 score (higher elevation = lower flood risk). Replace placeholder in composite.

### 2.4 Add WBGT or Heat Index
**Why:** Temperature alone doesn't capture humid heat stress. Wet Bulb Globe Temperature is the standard for occupational/agricultural heat stress.
**Action:** Source humidity data (ERA5 or IMD), compute heat index per district, add as supplementary indicator or replace Tmax-based scoring.

### 2.5 MODIS quality filtering
**Why:** Cloud contamination in monsoon months produces unreliable NDVI.
**Action:** Use MOD13A3 pixel reliability QA band to mask low-quality pixels before zonal aggregation.

### 2.6 Confidence intervals
**Why:** Financial institutions need to know scoring precision.
**Action:** For each score, compute bootstrap 95% CI from zonal statistics variance. Display as ±range on district scorecards.

---

## Phase 3: Platform Features (Priority: Medium)

### 3.1 District search/autocomplete
**What:** Search bar in sidebar or header to jump to any district by name.
**Implementation:** Client-side fuzzy search against district list (already loaded).

### 3.2 Time slider
**What:** Select month/year to view historical scores.
**Implementation:** Period selector in page header. Re-query indicators for selected period.

### 3.3 Export to PDF/CSV
**What:** Download district scorecard as PDF, export indicator table as CSV.
**Implementation:** Server-side PDF generation (puppeteer or react-pdf), CSV endpoint in API.

### 3.4 Mobile responsive layout
**What:** Sidebar collapses to bottom nav on mobile. Cards stack vertically.
**Implementation:** Tailwind responsive breakpoints, drawer nav for mobile.

### 3.5 Dark mode
**What:** Toggle between light and dark themes.
**Implementation:** Theming system already supports CSS variable overrides. Add `.dark` class toggle.

### 3.6 Loading skeletons
**What:** Animated placeholder UI while data loads on client-fetched pages.
**Implementation:** Skeleton components for stat cards, indicator cards, map.

---

## Phase 4: Trust & Transparency (Priority: High for financial use)

### 4.1 Data provenance drill-down
**What:** Click any score → see raw value, scoring formula, percentile position, source timestamp.
**Implementation:** Modal or expandable panel on indicator cards showing: raw_value, score, period, source, method_version.

### 4.2 Per-district data quality flags
**What:** Show data coverage quality per district (number of grid cells, cloud contamination %).
**Implementation:** Add metadata columns to climate_indicators table, display as quality badge.

### 4.3 Validation against ground truth
**What:** Compare DiCRA scores against actual crop yield data, flood events, drought declarations.
**Implementation:** Research task — source ground truth data (crop statistics from agriculture ministry, disaster declarations from NDMA), compute correlation metrics.

### 4.4 External audit documentation
**What:** Publish methodology for peer review. Create technical report suitable for regulatory submission.
**Implementation:** Generate from existing methodology page + scientific audit findings.

---

## Phase 5: Platform Scale (Priority: Future)

### 5.1 User authentication
**What:** Login for saved views, custom weight profiles, alert subscriptions.
**Implementation:** Supabase Auth, user preferences table.

### 5.2 Public API
**What:** REST API for researchers to query district scores programmatically.
**Implementation:** Document existing API routes, add API key auth, rate limiting.

### 5.3 Multi-language support
**What:** Hindi + regional language UI for state administrators.
**Implementation:** i18n framework, translated strings file.

### 5.4 Embeddable widgets
**What:** iframe widgets for state government websites showing their districts' risk scores.
**Implementation:** Standalone widget page with URL params for state filtering.

### 5.5 Alert system
**What:** Email/webhook notifications when district scores cross thresholds.
**Implementation:** Supabase Edge Function triggered by pipeline completion, checks thresholds, sends notifications.

---

## Priority Matrix

| Phase | Timeline | Dependencies |
|-------|----------|-------------|
| Phase 1 (Data) | 1-2 weeks | CDS account, GEE account |
| Phase 2 (Science) | 2-4 weeks | Phase 1 complete, historical data |
| Phase 3 (Features) | 2-3 weeks | Can run parallel to Phase 2 |
| Phase 4 (Trust) | 3-4 weeks | Phase 2 complete |
| Phase 5 (Scale) | 4-8 weeks | Phase 3-4 complete |
