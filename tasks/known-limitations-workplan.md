# Known Limitations & Remediation Plan

## 1. Heat Stress — 68% districts get default score (50)

**Root cause:** IMD temperature grid is 1° resolution (~111km). Small/irregular districts fall between grid cells and get NaN, which defaults to score 50.

**Fix:**
- **Option A (quick):** Use nearest-neighbor interpolation instead of strict zonal mean. Assign each district the value of the nearest grid cell if zonal stats return NaN. ~2 hours work in `fetch_imd_temperature.py`.
- **Option B (better):** Switch to ERA5-Land 2m temperature at 0.1° resolution (~11km). We already have CDS access. Add `fetch_era5_temperature.py` mirroring `fetch_era5.py`. ~4 hours.
- **Option C (best):** Use both — IMD as primary (government source), ERA5 as gap-fill for districts where IMD returns NaN. Hybrid approach preserves data provenance.
- **Recommendation:** Option C. Preserves IMD authority while filling gaps.

## 2. Vegetation Health — 38% districts unmatched (298 missing)

**Root cause:** `fetch_gee_ndvi.py` matches GEE's FAO/GAUL district names to our LGD names using substring matching. Indian district names vary between datasets (e.g., "Bangalore Urban" vs "Bengaluru Urban", "North Twenty Four Parganas" vs "N 24 Parganas").

**Fix:**
- **Step 1:** Generate a match report — export all unmatched GEE names and unmatched LGD names. One-time script. ~1 hour.
- **Step 2:** Build a manual mapping table (`pipeline/data/gee_lgd_mapping.csv`) for the ~300 unmatched districts. Tedious but one-time. ~3 hours.
- **Step 3:** Add fuzzy matching library (`thefuzz`) as second-pass matcher with threshold scoring. ~2 hours.
- **Alternative:** Use LGD district boundaries GeoJSON directly in GEE instead of FAO/GAUL. Upload our `LGD_Districts.geojson` as a GEE asset and use it for reduceRegions. This eliminates the name matching problem entirely. ~3 hours.
- **Recommendation:** Upload LGD GeoJSON to GEE. Eliminates the problem at source.

## 3. Drought Index — Relative ranking, not true SPI

**Root cause:** SPI-3 requires 10+ years of same-month rainfall history per district (WMO guideline). We have 1 year (Jan–Jun 2024). The gamma distribution fit fails with <10 data points.

**Fix:**
- **Step 1:** Backfill IMD rainfall for 2014–2023 (10 years). IMD data is freely available via `imdlib`. Each year takes ~15 min to process. Total: ~2.5 hours runtime.
- **Step 2:** Once 10+ years exist, the existing SPI code works correctly (the gamma fit path is already implemented).
- **Step 3:** Recompute drought index — will now produce proper SPI-3 values.
- **Timeline:** Can be done in one session. The pipeline already handles multi-year data. Just needs the backfill run.
- **Recommendation:** High priority. This is the most impactful fix — transforms drought from "relative ranking" to a scientifically rigorous WMO-standard index.

## 4. Flood Risk — Elevation placeholder compresses score range (11–90)

**Root cause:** `compute_flood_risk.py` uses weights: 40% rainfall + 40% soil moisture + 20% elevation. Elevation is hardcoded at 50 (neutral). This means 20% of the composite is always 50, compressing the possible range.

**Fix:**
- **Step 1:** Download SRTM 30m DEM for India from NASA EarthData (free, ~2GB). Or use GEE: `USGS/SRTMGL1_003`.
- **Step 2:** Compute mean elevation per district via zonal statistics.
- **Step 3:** Normalize: 0m (coastal/floodplain) → score 100 (high flood risk), 2000m+ → score 0 (low risk). Use log scale since most elevation variation is 0–500m.
- **Step 4:** Store as a static lookup table (elevation doesn't change monthly).
- **Timeline:** ~4 hours for GEE approach, ~6 hours for local DEM approach.
- **Recommendation:** Use GEE (already authenticated). Single computation, store as JSON.

## Priority Order

| Priority | Limitation | Impact | Effort |
|----------|-----------|--------|--------|
| **1** | Drought — backfill 10 years | Transforms from ranking to WMO-standard SPI | ~3 hours (mostly runtime) |
| **2** | Vegetation — upload LGD boundaries to GEE | Fixes 298 missing districts | ~3 hours |
| **3** | Heat stress — ERA5 gap-fill | Fixes 535 districts with default scores | ~4 hours |
| **4** | Flood risk — real elevation data | Expands score range to full 0-100 | ~4 hours |

Total estimated effort: ~14 hours across all 4 fixes.
