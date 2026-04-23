# DRISHTI v3 Roadmap — Expert Review & Next Version Plan

## Part 1: Current Platform State (v2 Snapshot)

**Deployed:** https://idrishti.vercel.app | 37 commits on April 23, 2026

| Dimension | Current State |
|-----------|--------------|
| Districts | 770+ (LGD boundaries) |
| Indicators | 7 (rainfall, heat, drought, vegetation, flood, soil moisture, vulnerability) |
| Data coverage | Jun 2024 – Mar 2026 (22 months backfilled) |
| Crop advisory | 12 crops, 32 alert rules, 16 guidance entries, 277 districts with ICRISAT area data |
| Point queries | 5 GEE datasets (NDVI 250m, EVI, LST 1km, soil moisture, precipitation) |
| Pipeline | Monthly cron via GitHub Actions, 8-stage sequential with fallbacks |
| Stack | Next.js 16, React 19, Supabase PostgreSQL, MapLibre, GEE |

---

## Part 2: Expert Review Findings

### A. Scientific Rigor — Critical Issues

**1. Cross-district scoring is the fundamental flaw.**
All indicators are percentile-ranked against ALL Indian districts in the same month. This means arid Rajasthan always scores "high risk" on soil moisture compared to Kerala. This measures geography, not climate risk. A district should be compared to its own historical distribution.

**2. 5-year baseline is scientifically inadequate.**
WMO requires 30-year normals. The 2019-2023 window includes La Nina-dominant years (2020-2022), systematically biasing the rainfall baseline. IMD data is available from 1951 — extending to 20+ years is straightforward.

**3. Vulnerability index has no theoretical basis.**
`mean(rainfall_score, vegetation_score)` is a two-variable average. Cannot distinguish drought (low rain + low NDVI) from waterlogging (high rain + low NDVI). Real vulnerability frameworks use exposure + sensitivity + adaptive capacity.

**4. Flood risk uses a placeholder elevation (50 for all districts).**
Effectively just `0.4 * rainfall + 0.4 * (100 - soil_moisture)` — partially double-counts rainfall via soil moisture. No drainage, river proximity, or topography.

**5. Heat stress uses only Tmax at 1-degree resolution.**
No humidity (WBGT), no nighttime temperature, no heat spell duration. IMD has 0.25-degree temperature grids available since 2015.

**6. Crop alerts have no phenological awareness.**
An alert about "heat stress during maize tasseling" fires in January when no maize is tasseling. No crop calendar, no growth stage tracking.

### B. UX & Feature Gaps — Top Issues

**1. Farmer journey is 5 clicks deep.** Landing → Dashboard → State → District → Crop Advisory tab. No direct search on the landing page.

**2. No vernacular language.** Crop advisories are English-only. Primary beneficiaries (farmers) need Hindi and regional languages.

**3. Portfolio module is "Coming Soon."** Bank officers — a key user segment — have no batch analysis capability.

**4. Mobile layout has bugs.** State view hardcodes a 320px sidebar with no responsive handling. Touch targets (28px) are below 44px minimum. 9px mobile nav labels below accessibility standards.

**5. InsightCard action buttons are non-functional.** They render but have no onClick handler.

**6. No forecast data.** Platform is purely retrospective. Even a 7-day IMD forecast overlay would make it actionable for sowing decisions.

**7. No downloadable reports.** State planners need PDF/Excel artifacts for meetings.

### C. Data Quality Gaps

| Missing Data | Impact | Source Available |
|-------------|--------|-----------------|
| SRTM DEM (90m elevation) | Flood risk is meaningless without topography | Free, trivial to integrate |
| IMD 0.25° Tmax/Tmin | Current 1° temperature is ~111km pixels | Available since 2015 |
| CWC river gauge data | Real-time streamflow for flood grounding | Near-real-time from CWC |
| MODIS QA pixel reliability | Cloud-contaminated NDVI inflates monsoon scores | Already in MOD13Q1 bands |
| Crop phenology (MCD12Q2) | Alerts without growth stage are noise | Free MODIS product |
| India-WRIS reservoir levels | Water availability context | Government portal |

---

## Part 3: What a World-Class Platform Looks Like

If compute and data are not constraints, here's the vision:

### The North Star

**Every farmer in India can open DRISHTI, see their village, understand what's happening to their crop right now, and know exactly what to do about it — in their own language.**

### Capabilities Stack

| Layer | Current (v2) | Target (v3) | Aspirational (v4+) |
|-------|-------------|-------------|---------------------|
| **Geography** | District (~25km) | Block + village via point query | Plot-level (10m Sentinel-2) |
| **Time** | Monthly, retrospective | Bi-weekly + 7-day forecast | Daily + seasonal outlook |
| **Crops** | 12 crops, static zone mapping | 20+ crops, ICRISAT district data | Satellite crop detection, growth stage tracking |
| **Advisory** | Static threshold rules | Phenology-aware rules + crop calendar | AI-generated contextual advisory (LLM) |
| **Scoring** | Cross-district percentile | Within-district historical percentile | Probabilistic scoring with confidence intervals |
| **Users** | Dashboard only | + Portfolio module + PDF reports + API | + SMS/WhatsApp alerts + mobile app + Hindi |
| **Validation** | None | Retrospective event matching | Real-time ground truth via KVK network |

---

## Part 4: v3 Implementation Plan

### Guiding Principles
1. Fix scientific foundations before adding features
2. Impact-per-effort: small fixes that unlock large value first
3. Each phase independently deployable and testable
4. Maintain the existing system while upgrading

---

### Phase 1: Scientific Foundation Fixes (Priority: Critical)

These fix the load-bearing weaknesses that undermine every score on the platform.

#### 1.1 Within-District Historical Scoring
**What:** Score each district against its own 20-year history for each indicator and month, not against all districts.
**Why:** Eliminates the geography-vs-climate bias. A Rajasthan district will be scored against Rajasthan's own historical range.
**How:**
- Backfill IMD rainfall/temperature from 2001 (20 years) using existing pipeline with year parameter
- Store per-district per-month historical distributions in a new `indicator_baselines` table
- Replace `percentile_score(value, all_districts_this_month)` with `percentile_score(value, this_district_all_years_this_month)`
**Effort:** Large (pipeline backfill + scoring refactor)
**Files:** `pipeline/src/scoring.py`, new migration for baselines table, all `fetch_*.py` scoring sections

#### 1.2 Extend Climatological Baseline to 20 Years
**What:** Backfill IMD data from 2001-2018 (currently 2019-2023 only).
**Why:** 5-year baseline captures weather, not climate. 20 years gives meaningful anomaly detection.
**How:** Run the pipeline for each month from Jan 2001 to Dec 2018 (216 pipeline runs). IMD data is available for the full period.
**Effort:** Medium (compute time, ~12 hours of pipeline runs)
**Dependency:** Do this before 1.1 (need the historical data to compute within-district baselines)

#### 1.3 Replace Flood Risk Elevation Placeholder
**What:** Integrate SRTM DEM 90m elevation data to replace the fixed-50 placeholder.
**Why:** Flood risk without topography is speculative.
**How:**
- Download SRTM DEM tiles for India from USGS EarthExplorer (free)
- Compute mean elevation per district via zonal statistics
- Store in districts table as `mean_elevation`
- Update `compute_flood_risk.py` to use actual elevation percentile
**Effort:** Small (data download + one-time computation)

#### 1.4 Upgrade Vulnerability Index
**What:** Replace `mean(rainfall, vegetation)` with a multi-dimensional framework.
**Why:** Current formula has no theoretical basis and can't distinguish drought from waterlogging.
**How:**
- Exposure: rainfall anomaly + heat stress + flood risk
- Sensitivity: vegetation health + soil moisture + crop area dependency (from ICRISAT)
- Adaptive capacity: irrigation coverage (Census data), crop insurance penetration (PMFBY data)
- Composite: weighted combination following IPCC AR6 framework
**Effort:** Large (new data sources + formula redesign)

#### 1.5 MODIS NDVI Quality Filtering
**What:** Check MOD13Q1 pixel reliability QA band before aggregation.
**Why:** Cloud-contaminated pixels with low NDVI inflate vegetation stress scores during monsoon.
**How:** Filter pixels where `SummaryQA > 1` (acceptable quality) before computing district zonal mean.
**Effort:** Small (modify `fetch_gee_ndvi.py`, ~10 lines)

---

### Phase 2: Quick UX Wins (Priority: High, Effort: Small)

These are bugs and low-effort improvements with outsized user impact.

#### 2.1 Fix State View Mobile Layout
**What:** The state view hardcodes 320px sidebar width with no responsive handling.
**Effort:** Small — add `lg:w-[320px] w-full` responsive classes.

#### 2.2 Add District Search to Landing Page Hero
**What:** A prominent search bar in the hero that takes users directly to a district.
**Why:** Reduces farmer journey from 5 clicks to 1.
**Effort:** Small — reuse existing `district-search.tsx` command palette.

#### 2.3 Fix or Remove InsightCard Action Buttons
**What:** Action buttons in insight cards have no onClick handler.
**Effort:** Small — either wire them to the Crop Advisory tab or remove them.

#### 2.4 Increase Mobile Touch Targets
**What:** 9px nav labels → 12px, 28px ranking rows → 44px, bottom nav padding increase.
**Effort:** Small — CSS changes only.

#### 2.5 Add Accordion Animation
**What:** Crop advisory tabs expand/collapse abruptly. Add smooth height transition.
**Effort:** Small — CSS `transition: max-height`.

---

### Phase 3: Data Upgrades (Priority: High)

#### 3.1 IMD 0.25° Temperature
**What:** Replace 1-degree Tmax with 0.25-degree grids for heat stress.
**Why:** 1-degree = ~111km pixels. Many small districts share the same temperature pixel.
**How:** IMD 0.25° temperature data available since 2015. Update `fetch_imd_temperature.py` to use the finer grid.
**Effort:** Medium

#### 3.2 SRTM DEM Integration
**What:** Part of 1.3 above. Pre-compute district mean elevation from 90m SRTM.
**Effort:** Small

#### 3.3 Crop Phenology Layer
**What:** Add crop calendar by agro-climatic zone to gate alerts to correct growth stage.
**Why:** "Heat stress during flowering" is only relevant when the crop is actually flowering.
**How:**
- Create `data/crop-calendar.json` with sowing/flowering/harvest windows per crop per zone
- Modify `crop-data.ts` to check current month against crop calendar before firing alerts
- Suppress alerts that are out-of-season
**Effort:** Medium (data curation + logic change)

#### 3.4 Cumulative Stress Tracking
**What:** Track consecutive months of moderate stress, not just single-month thresholds.
**Why:** Three months of moderate drought is catastrophic but never triggers a single-month alert.
**How:** Query last 3 months of scores for each indicator; add compound rules for sustained stress.
**Effort:** Medium

---

### Phase 4: Major Features (Priority: Medium-High)

#### 4.1 Portfolio Analysis Module
**What:** Bank officers upload CSV of branch/district exposure, get portfolio risk overlay.
**Who:** Agricultural lenders (key user segment, currently unserved)
**How:**
- CSV upload UI with district name matching
- Portfolio risk summary: aggregate exposure by risk level
- District-level drill-down with lending exposure highlighted
- Export portfolio risk report (Excel/PDF)
**Effort:** Large

#### 4.2 Bulk Export & API
**What:** Download all districts for a state as CSV/Excel. Documented public API.
**Who:** State planners, researchers
**How:** `/api/export?state=Maharashtra&format=csv` endpoint + API docs page
**Effort:** Medium

#### 4.3 PDF Report Generation
**What:** Auto-generate 2-page PDF per state: map, risk breakdown, top-risk districts, crop alerts.
**Who:** State planners (need artifacts for meetings)
**How:** Server-side PDF generation using @react-pdf/renderer or puppeteer
**Effort:** Medium

#### 4.4 Hindi Language Support
**What:** Translate crop advisory cards and key UI text to Hindi.
**Who:** Farmers (highest-impact gap)
**How:**
- i18n framework (next-intl)
- Translate: crop names, alert messages, guidance text, UI labels
- Start with Hindi, add regional languages later
**Effort:** Large

#### 4.5 IMD 7-Day Forecast Overlay
**What:** Show 7-day IMD weather forecast on the district page.
**Why:** Makes the platform actionable for sowing/irrigation decisions, not just retrospective.
**How:** Fetch IMD extended range forecast, display as a simple 7-day bar chart on district page.
**Effort:** Large

---

### Phase 5: Validation & Credibility (Priority: Medium)

#### 5.1 Retrospective Event Validation
**What:** Compare DRISHTI scores against known climate events (2019 Bihar floods, 2023 Maharashtra drought).
**Why:** If scores match observed events, the platform becomes publishable.
**How:** Collect event dates and affected districts, overlay with historical DRISHTI scores, publish results.
**Effort:** Medium (research + analysis)

#### 5.2 Open Dataset Publication
**What:** Publish scored dataset with DOI on Zenodo.
**Why:** Makes the platform citable in academic research.
**Effort:** Small

#### 5.3 Formal Comparison to NADAMS/MNCFC/NRSC DSS
**What:** Document where DRISHTI adds value vs established Indian monitoring systems.
**Effort:** Medium (research)

---

### Phase 6: Future Vision (v4+)

| Feature | Description |
|---------|-------------|
| SMS/WhatsApp alerts | Threshold-based notifications to farmers via Twilio/WhatsApp Business |
| Satellite crop detection | Sentinel-2 + ML for actual crop type identification at 10m |
| AI advisory (LLM) | Replace static rules with contextual Claude-powered advisory |
| Block/village granularity | Sub-district scoring using higher-resolution data |
| Seasonal outlook | 3-month probabilistic forecast using IMD seasonal predictions |
| Ground truth network | Partner with KVKs for field validation |
| Mobile app | Offline-capable PWA with push notifications |

---

## Recommended Execution Order

| Order | Phase | Items | Rationale |
|-------|-------|-------|-----------|
| **Now** | 2 | Quick UX fixes (2.1-2.5) | Small effort, immediate user impact |
| **Week 1-2** | 1.3, 1.5 | SRTM DEM + NDVI QA filtering | Small scientific fixes, big credibility gain |
| **Week 2-4** | 1.2 | 20-year baseline backfill | Compute-heavy but straightforward |
| **Week 4-6** | 1.1 | Within-district historical scoring | The single most important scientific upgrade |
| **Week 6-8** | 3.3, 3.4 | Crop phenology + cumulative stress | Makes crop advisory credible |
| **Week 8-10** | 4.1, 4.2 | Portfolio module + bulk export | Unlocks the lender user segment |
| **Week 10-12** | 4.4, 4.3 | Hindi + PDF reports | Unlocks farmer and planner segments |
| **Ongoing** | 5 | Validation studies | Builds academic credibility in parallel |
| **Future** | 1.4, 4.5, 6 | Vulnerability redesign, forecasts, v4 features | After foundation is solid |

---

## Session Learnings

### What Worked Well
- Subagent-driven development for parallel task execution
- Static JSON data files for crop zone/alert/guidance (easy to update, no migration needed)
- GEE point queries as a zero-infrastructure real-time data layer
- Responsive tabs/accordion pattern for mobile-first design
- ICRISAT data as a curated district-level crop source

### What to Do Differently
- Start with within-district scoring from day one (cross-district was a shortcut that became a liability)
- Design mobile-first, not desktop-first (state view mobile bug)
- Wire up all UI elements before shipping (non-functional InsightCard buttons)
- Validate crop alert thresholds against phenological calendars before publishing
- Set up GEE Contributor tier early (deadline nearly missed)

### Architecture Decisions That Should Persist
- Supabase for structured data, GEE for real-time satellite queries (hybrid approach)
- Static JSON for crop knowledge (alert rules, guidance, zone mapping) — easy to update without migrations
- Monthly batch pipeline + on-demand point queries (two-speed architecture)
- Percentile-based scoring (once fixed to within-district) is transparent and defensible
