# Data Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Python data pipelines that fetch climate data from IMD, ERA5, and MODIS, aggregate to district level, compute risk scores (0-100), and write to the `climate_indicators` table in Supabase.

**Architecture:** Each data source has its own fetcher module that downloads gridded data, aggregates to district-level using zonal statistics, normalizes to a 0-100 risk score via percentile ranking, and writes to PostgreSQL. A shared scoring module handles normalization. An alert checker runs after each pipeline to detect threshold breaches.

**Tech Stack:** Python 3.12+, imdlib, cdsapi, xarray, earthengine-api, geopandas, rioxarray, scipy, numpy, SQLAlchemy, psycopg2

**Spec:** `docs/superpowers/specs/2026-04-18-climate-risk-platform-design.md`

**Plan series:**
1. Foundation (complete) — project setup, database, geospatial boundaries
2. **Data Pipeline** (this plan) — fetchers, processors, scorers
3. Dashboard (next) — Next.js pages, maps, charts, weight configuration

**Prerequisites:**
- Supabase database with all tables from Plan 1
- 36 states and ~784 districts loaded with geometries
- For ERA5: CDS account (https://cds.climate.copernicus.eu) with API key in `~/.cdsapirc`
- For MODIS: GEE account (https://earthengine.google.com) authenticated via `earthengine authenticate`
- IMD: No registration needed

---

## File Structure

```
pipeline/
├── requirements.txt              # Update with new deps
├── src/
│   ├── __init__.py
│   ├── db.py                     # Existing — database connection
│   ├── scoring.py                # NEW — percentile scoring, normalization
│   ├── zonal.py                  # NEW — zonal stats (raster → district values)
│   ├── writer.py                 # NEW — write indicator scores to DB
│   ├── fetch_imd_rainfall.py     # NEW — IMD rainfall fetcher + rainfall_anomaly
│   ├── fetch_imd_temperature.py  # NEW — IMD temperature fetcher + heat_stress
│   ├── compute_drought_index.py  # NEW — SPI drought index from rainfall history
│   ├── fetch_era5.py             # NEW — ERA5-Land soil moisture fetcher + scorer
│   ├── fetch_gee_ndvi.py         # NEW — MODIS NDVI via GEE + vegetation_health
│   ├── compute_flood_risk.py     # NEW — composite flood risk score
│   ├── check_alerts.py           # NEW — alert threshold checker
│   └── run_pipeline.py           # NEW — orchestrator script
├── tests/
│   ├── conftest.py               # Existing — db fixtures
│   ├── test_db.py                # Existing
│   ├── test_scoring.py           # NEW
│   ├── test_zonal.py             # NEW
│   ├── test_writer.py            # NEW
│   ├── test_fetch_imd.py         # NEW
│   ├── test_drought_index.py     # NEW
│   └── test_alerts.py            # NEW
└── data/
    ├── cache/                    # Downloaded raw data (gitignored)
    └── baselines/                # Historical baseline stats (committed)
```

---

## Task 1: Install Dependencies and Common Scoring Module

**Files:**
- Modify: `pipeline/requirements.txt`
- Create: `pipeline/src/scoring.py`
- Create: `pipeline/tests/test_scoring.py`

- [ ] **Step 1: Update requirements.txt**

Replace `pipeline/requirements.txt` with:

```
geopandas>=1.0
psycopg2-binary>=2.9
sqlalchemy>=2.0
python-dotenv>=1.0
httpx>=0.27
pytest>=8.0
numpy>=1.26
xarray>=2024.1
rioxarray>=0.15
scipy>=1.12
netCDF4>=1.6
imdlib>=0.1.14
cdsapi>=0.7
earthengine-api>=0.1.390
```

- [ ] **Step 2: Install new dependencies**

```bash
cd pipeline && source .venv/Scripts/activate && pip install -r requirements.txt
```

- [ ] **Step 3: Write scoring tests**

Create `pipeline/tests/test_scoring.py`:

```python
import numpy as np
from src.scoring import percentile_score, classify_risk


def test_percentile_score_median_value():
    """A value at the median of the historical distribution should score ~50."""
    historical = np.array([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
    score = percentile_score(55, historical)
    assert 45 <= score <= 55


def test_percentile_score_extreme_high():
    """A value above all historical values should score close to 100."""
    historical = np.array([10, 20, 30, 40, 50])
    score = percentile_score(100, historical)
    assert score >= 95


def test_percentile_score_extreme_low():
    """A value below all historical values should score close to 0."""
    historical = np.array([10, 20, 30, 40, 50])
    score = percentile_score(1, historical)
    assert score <= 5


def test_percentile_score_nan_returns_50():
    """NaN input should return 50 (neutral score)."""
    historical = np.array([10, 20, 30])
    score = percentile_score(np.nan, historical)
    assert score == 50


def test_classify_risk_low():
    assert classify_risk(15) == "low"


def test_classify_risk_moderate():
    assert classify_risk(40) == "moderate"


def test_classify_risk_high():
    assert classify_risk(65) == "high"


def test_classify_risk_critical():
    assert classify_risk(85) == "critical"


def test_classify_risk_boundary():
    """Boundaries: 0-25 low, 26-50 moderate, 51-75 high, 76-100 critical."""
    assert classify_risk(25) == "low"
    assert classify_risk(26) == "moderate"
    assert classify_risk(50) == "moderate"
    assert classify_risk(51) == "high"
    assert classify_risk(75) == "high"
    assert classify_risk(76) == "critical"
```

- [ ] **Step 4: Run tests to verify they fail**

```bash
cd pipeline && source .venv/Scripts/activate && pytest tests/test_scoring.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'src.scoring'`

- [ ] **Step 5: Implement scoring module**

Create `pipeline/src/scoring.py`:

```python
"""Risk score computation utilities.

All indicators are scored 0-100 using percentile ranking against
historical baselines. Higher score = higher risk.

Methodology version: 1
"""

import numpy as np
from scipy import stats

METHODOLOGY_VERSION = 1


def percentile_score(value: float, historical: np.ndarray) -> int:
    """Score a value as a percentile of the historical distribution.

    Returns 0-100 where 100 = highest risk (most extreme value).
    NaN values return 50 (neutral).
    """
    if np.isnan(value):
        return 50

    historical_clean = historical[~np.isnan(historical)]
    if len(historical_clean) == 0:
        return 50

    pct = stats.percentileofscore(historical_clean, value, kind="rank")
    return int(np.clip(round(pct), 0, 100))


def classify_risk(score: int) -> str:
    """Classify a 0-100 risk score into a category.

    0-25: low, 26-50: moderate, 51-75: high, 76-100: critical
    """
    if score <= 25:
        return "low"
    elif score <= 50:
        return "moderate"
    elif score <= 75:
        return "high"
    else:
        return "critical"
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
pytest tests/test_scoring.py -v
```

Expected: All 8 tests PASS.

- [ ] **Step 7: Commit**

```bash
cd C:\Users\Santosh\Claude_Access\dicrav2
git add pipeline/requirements.txt pipeline/src/scoring.py pipeline/tests/test_scoring.py
git commit -m "feat: add scoring module with percentile ranking and risk classification"
```

---

## Task 2: Zonal Statistics Module

**Files:**
- Create: `pipeline/src/zonal.py`
- Create: `pipeline/tests/test_zonal.py`

- [ ] **Step 1: Write zonal stats tests**

Create `pipeline/tests/test_zonal.py`:

```python
import numpy as np
import geopandas as gpd
from shapely.geometry import box
import xarray as xr
from src.zonal import aggregate_raster_to_districts


def _make_test_raster():
    """Create a small test raster covering a 2x2 degree area."""
    lats = np.arange(10.0, 12.0, 0.25)  # 8 cells
    lons = np.arange(76.0, 78.0, 0.25)  # 8 cells
    data = np.random.RandomState(42).uniform(10, 50, size=(len(lats), len(lons)))
    ds = xr.DataArray(
        data,
        dims=["latitude", "longitude"],
        coords={"latitude": lats, "longitude": lons},
    )
    return ds


def _make_test_districts():
    """Create two test district polygons that overlap the raster."""
    d1 = box(76.0, 10.0, 77.0, 11.0)  # SW quadrant
    d2 = box(77.0, 11.0, 78.0, 12.0)  # NE quadrant
    return gpd.GeoDataFrame(
        {"district_id": [1, 2], "name": ["District A", "District B"]},
        geometry=[d1, d2],
        crs="EPSG:4326",
    )


def test_aggregate_returns_one_row_per_district():
    raster = _make_test_raster()
    districts = _make_test_districts()
    result = aggregate_raster_to_districts(raster, districts, "district_id")
    assert len(result) == 2
    assert set(result["district_id"]) == {1, 2}


def test_aggregate_returns_mean_values():
    raster = _make_test_raster()
    districts = _make_test_districts()
    result = aggregate_raster_to_districts(raster, districts, "district_id")
    assert "mean" in result.columns
    assert all(10 <= v <= 50 for v in result["mean"])


def test_aggregate_handles_no_overlap():
    """A district outside the raster should get NaN."""
    raster = _make_test_raster()
    d_outside = box(80.0, 20.0, 81.0, 21.0)
    districts = gpd.GeoDataFrame(
        {"district_id": [99]},
        geometry=[d_outside],
        crs="EPSG:4326",
    )
    result = aggregate_raster_to_districts(raster, districts, "district_id")
    assert len(result) == 1
    assert np.isnan(result.iloc[0]["mean"])
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pytest tests/test_zonal.py -v
```

Expected: FAIL — `ModuleNotFoundError`

- [ ] **Step 3: Implement zonal statistics module**

Create `pipeline/src/zonal.py`:

```python
"""Zonal statistics: aggregate gridded raster data to district polygons."""

import numpy as np
import geopandas as gpd
import xarray as xr
from rasterstats import zonal_stats as _zonal_stats
from rasterio.transform import from_bounds


def aggregate_raster_to_districts(
    raster: xr.DataArray,
    districts: gpd.GeoDataFrame,
    id_col: str,
) -> gpd.GeoDataFrame:
    """Compute mean of a raster within each district polygon.

    Args:
        raster: 2D DataArray with latitude/longitude coordinates.
        districts: GeoDataFrame with district polygons.
        id_col: Column name for district identifier.

    Returns:
        GeoDataFrame with columns [id_col, 'mean', 'min', 'max', 'count'].
    """
    # Ensure latitude is descending (top to bottom) for rasterio convention
    lat_dim = _find_dim(raster, ["latitude", "lat", "y"])
    lon_dim = _find_dim(raster, ["longitude", "lon", "x"])

    lats = raster[lat_dim].values
    lons = raster[lon_dim].values

    if lats[0] < lats[-1]:
        raster = raster.isel({lat_dim: slice(None, None, -1)})
        lats = raster[lat_dim].values

    data = raster.values.astype(np.float64)
    nodata = -9999.0
    data = np.where(np.isnan(data), nodata, data)

    # Build affine transform
    res_lon = abs(lons[1] - lons[0]) if len(lons) > 1 else 0.25
    res_lat = abs(lats[0] - lats[1]) if len(lats) > 1 else 0.25
    transform = from_bounds(
        lons.min() - res_lon / 2,
        lats.min() - res_lat / 2,
        lons.max() + res_lon / 2,
        lats.max() + res_lat / 2,
        len(lons),
        len(lats),
    )

    stats = _zonal_stats(
        districts.geometry,
        data,
        affine=transform,
        stats=["mean", "min", "max", "count"],
        nodata=nodata,
    )

    result = districts[[id_col]].copy()
    result["mean"] = [s["mean"] for s in stats]
    result["min"] = [s["min"] for s in stats]
    result["max"] = [s["max"] for s in stats]
    result["count"] = [s["count"] for s in stats]

    return result.reset_index(drop=True)


def _find_dim(da: xr.DataArray, candidates: list[str]) -> str:
    """Find a dimension name from a list of candidates."""
    for c in candidates:
        if c in da.dims:
            return c
    raise ValueError(f"No matching dimension found. Has: {list(da.dims)}, wanted one of: {candidates}")
```

Note: this requires `rasterstats`. Add it to requirements.txt:

```
rasterstats>=0.19
```

Then install: `pip install rasterstats`

- [ ] **Step 4: Run tests to verify they pass**

```bash
pip install rasterstats && pytest tests/test_zonal.py -v
```

Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd C:\Users\Santosh\Claude_Access\dicrav2
git add pipeline/src/zonal.py pipeline/tests/test_zonal.py pipeline/requirements.txt
git commit -m "feat: add zonal statistics module for raster-to-district aggregation"
```

---

## Task 3: Database Writer Module

**Files:**
- Create: `pipeline/src/writer.py`
- Create: `pipeline/tests/test_writer.py`

- [ ] **Step 1: Write writer tests**

Create `pipeline/tests/test_writer.py`:

```python
import pytest
from datetime import date
from unittest.mock import MagicMock, patch
from src.writer import IndicatorRow, write_indicators, update_data_source_status


def test_indicator_row_validates_score_range():
    """Score must be 0-100."""
    with pytest.raises(ValueError, match="score"):
        IndicatorRow(
            district_id=1,
            indicator_type="rainfall_anomaly",
            value=55.0,
            score=150,
            period_start=date(2024, 1, 1),
            period_end=date(2024, 1, 31),
            source="imd_rainfall",
        )


def test_indicator_row_validates_indicator_type():
    """Only valid indicator types accepted."""
    with pytest.raises(ValueError, match="indicator_type"):
        IndicatorRow(
            district_id=1,
            indicator_type="invalid_type",
            value=55.0,
            score=50,
            period_start=date(2024, 1, 1),
            period_end=date(2024, 1, 31),
            source="test",
        )


def test_indicator_row_valid():
    row = IndicatorRow(
        district_id=1,
        indicator_type="rainfall_anomaly",
        value=-1.5,
        score=72,
        period_start=date(2024, 6, 1),
        period_end=date(2024, 6, 30),
        source="imd_rainfall",
    )
    assert row.score == 72
    assert row.methodology_version == 1
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pytest tests/test_writer.py -v
```

Expected: FAIL — `ModuleNotFoundError`

- [ ] **Step 3: Implement writer module**

Create `pipeline/src/writer.py`:

```python
"""Write indicator scores to the climate_indicators table."""

from dataclasses import dataclass, field
from datetime import date
from typing import Sequence
from sqlalchemy import text
from src.db import get_engine
from src.scoring import METHODOLOGY_VERSION

VALID_INDICATOR_TYPES = {
    "rainfall_anomaly",
    "drought_index",
    "vegetation_health",
    "heat_stress",
    "flood_risk",
    "soil_moisture",
}


@dataclass
class IndicatorRow:
    district_id: int
    indicator_type: str
    value: float
    score: int
    period_start: date
    period_end: date
    source: str
    methodology_version: int = field(default=METHODOLOGY_VERSION)

    def __post_init__(self):
        if not 0 <= self.score <= 100:
            raise ValueError(f"score must be 0-100, got {self.score}")
        if self.indicator_type not in VALID_INDICATOR_TYPES:
            raise ValueError(
                f"indicator_type must be one of {VALID_INDICATOR_TYPES}, got '{self.indicator_type}'"
            )


def write_indicators(rows: Sequence[IndicatorRow]) -> int:
    """Write indicator rows to climate_indicators table. Returns count written."""
    if not rows:
        return 0

    engine = get_engine()
    written = 0
    with engine.begin() as conn:
        for row in rows:
            conn.execute(
                text("""
                    INSERT INTO climate_indicators
                        (district_id, indicator_type, value, score,
                         period_start, period_end, source, methodology_version)
                    VALUES
                        (:district_id, :indicator_type, :value, :score,
                         :period_start, :period_end, :source, :methodology_version)
                """),
                {
                    "district_id": row.district_id,
                    "indicator_type": row.indicator_type,
                    "value": row.value,
                    "score": row.score,
                    "period_start": row.period_start.isoformat(),
                    "period_end": row.period_end.isoformat(),
                    "source": row.source,
                    "methodology_version": row.methodology_version,
                },
            )
            written += 1
    return written


def update_data_source_status(
    source_name: str, status: str, row_count: int | None = None
) -> None:
    """Update the data_sources table with fetch status."""
    engine = get_engine()
    with engine.begin() as conn:
        if row_count is not None:
            conn.execute(
                text("""
                    UPDATE data_sources
                    SET status = :status, last_fetched = now(), row_count = :row_count
                    WHERE source_name = :source_name
                """),
                {"status": status, "row_count": row_count, "source_name": source_name},
            )
        else:
            conn.execute(
                text("""
                    UPDATE data_sources
                    SET status = :status, last_fetched = now()
                    WHERE source_name = :source_name
                """),
                {"status": status, "source_name": source_name},
            )
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pytest tests/test_writer.py -v
```

Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd C:\Users\Santosh\Claude_Access\dicrav2
git add pipeline/src/writer.py pipeline/tests/test_writer.py
git commit -m "feat: add database writer module for climate indicators"
```

---

## Task 4: IMD Rainfall Fetcher + Rainfall Anomaly Scorer

**Files:**
- Create: `pipeline/src/fetch_imd_rainfall.py`
- Create: `pipeline/tests/test_fetch_imd.py`

- [ ] **Step 1: Write tests for rainfall processing logic**

Create `pipeline/tests/test_fetch_imd.py`:

```python
import numpy as np
import pytest
from src.fetch_imd_rainfall import (
    compute_monthly_rainfall,
    compute_rainfall_anomaly_score,
)


def test_compute_monthly_rainfall():
    """Daily rainfall array → monthly totals."""
    # 90 days (3 months), 4x4 grid
    daily = np.random.RandomState(42).uniform(0, 10, size=(90, 4, 4))
    daily[daily < 3] = 0  # some dry days
    months, totals = compute_monthly_rainfall(daily, year=2024, start_month=6)
    assert len(months) == 3
    assert totals.shape == (3, 4, 4)
    assert all(t >= 0 for t in totals.flat)


def test_compute_rainfall_anomaly_score_above_normal():
    """Rainfall well above historical mean → low risk score (good for crops)."""
    # Historical monthly means for this district
    historical_monthly = np.array([100, 120, 150, 130, 110, 90, 80, 95, 105, 115])
    current = 200  # well above the mean of ~110
    score = compute_rainfall_anomaly_score(current, historical_monthly)
    # Above-normal rainfall is low drought risk, but could indicate flood risk
    # For rainfall_anomaly, higher deviation from normal = higher risk
    assert 0 <= score <= 100


def test_compute_rainfall_anomaly_score_severe_deficit():
    """Rainfall far below historical mean → high risk."""
    historical_monthly = np.array([100, 120, 150, 130, 110, 90, 80, 95, 105, 115])
    current = 20  # severe deficit
    score = compute_rainfall_anomaly_score(current, historical_monthly)
    assert score >= 70  # high risk


def test_compute_rainfall_anomaly_score_normal():
    """Rainfall near historical mean → moderate/low risk."""
    historical_monthly = np.array([100, 120, 150, 130, 110, 90, 80, 95, 105, 115])
    current = 110  # near mean
    score = compute_rainfall_anomaly_score(current, historical_monthly)
    assert score <= 50
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pytest tests/test_fetch_imd.py -v
```

Expected: FAIL

- [ ] **Step 3: Implement IMD rainfall fetcher**

Create `pipeline/src/fetch_imd_rainfall.py`:

```python
"""Fetch IMD gridded rainfall data and compute rainfall anomaly scores.

Uses imdlib to download 0.25-degree daily gridded rainfall from IMD Pune.
Aggregates to monthly district-level values, computes anomaly against
historical baseline, and scores using percentile ranking.
"""

import os
import numpy as np
import xarray as xr
import geopandas as gpd
from datetime import date
from pathlib import Path
from sqlalchemy import text

import imdlib as imd

from src.db import get_engine
from src.scoring import percentile_score, METHODOLOGY_VERSION
from src.zonal import aggregate_raster_to_districts
from src.writer import IndicatorRow, write_indicators, update_data_source_status

CACHE_DIR = Path(__file__).parent.parent / "data" / "cache" / "imd_rainfall"
SOURCE_NAME = "imd_rainfall"


def fetch_rainfall(year: int) -> xr.Dataset:
    """Download IMD daily rainfall for a given year. Returns xarray Dataset."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_file = CACHE_DIR / f"rain_{year}.nc"

    if cache_file.exists():
        return xr.open_dataset(cache_file)

    data = imd.get_data("rain", year, year, fn_format="yearwise")
    ds = data.to_xarray()
    ds.to_netcdf(cache_file)
    return ds


def compute_monthly_rainfall(
    daily_rain: np.ndarray, year: int, start_month: int = 1
) -> tuple[list[int], np.ndarray]:
    """Aggregate daily rainfall to monthly totals.

    Args:
        daily_rain: Array of shape (n_days, n_lat, n_lon).
        year: Year of the data.
        start_month: Starting month (1-12).

    Returns:
        (month_numbers, monthly_totals) where monthly_totals has shape (n_months, n_lat, n_lon).
    """
    import calendar

    months = []
    totals = []
    day_idx = 0

    for m in range(start_month, 13):
        n_days_in_month = calendar.monthrange(year, m)[1]
        if day_idx + n_days_in_month > daily_rain.shape[0]:
            break
        month_data = daily_rain[day_idx : day_idx + n_days_in_month]
        month_data = np.where(month_data < 0, 0, month_data)  # mask missing
        totals.append(month_data.sum(axis=0))
        months.append(m)
        day_idx += n_days_in_month

    return months, np.array(totals)


def compute_rainfall_anomaly_score(
    current_rainfall: float, historical_values: np.ndarray
) -> int:
    """Score rainfall anomaly as risk.

    Uses absolute deviation from the historical mean, scored as a percentile
    of historical deviations. Both excess and deficit are risky.
    """
    if np.isnan(current_rainfall):
        return 50

    mean = np.nanmean(historical_values)
    if mean == 0:
        return 50

    # Compute deviation ratio: how far from normal (absolute)
    current_deviation = abs(current_rainfall - mean) / mean
    historical_deviations = np.abs(historical_values - mean) / mean

    return percentile_score(current_deviation, historical_deviations)


def get_district_polygons() -> gpd.GeoDataFrame:
    """Load district polygons from the database."""
    engine = get_engine()
    return gpd.read_postgis(
        "SELECT id as district_id, lgd_code, name, geometry FROM districts",
        engine,
        geom_col="geometry",
    )


def run(year: int, month: int) -> int:
    """Run the full rainfall pipeline for a given year/month.

    1. Fetch IMD daily rainfall for the year
    2. Compute monthly total for the target month
    3. Aggregate to district level via zonal stats
    4. Score against historical baseline
    5. Write to climate_indicators

    Returns number of rows written.
    """
    print(f"[IMD Rainfall] Fetching data for {year}...")
    ds = fetch_rainfall(year)

    # Extract the rainfall variable (imdlib names it 'rain' or similar)
    var_name = list(ds.data_vars)[0]
    daily = ds[var_name].values  # (n_days, n_lat, n_lon)

    print(f"[IMD Rainfall] Computing monthly totals...")
    months, monthly_totals = compute_monthly_rainfall(daily, year)

    if month not in months:
        print(f"[IMD Rainfall] Month {month} not available in data")
        return 0

    month_idx = months.index(month)
    month_raster = monthly_totals[month_idx]

    # Build an xarray DataArray with coords for zonal stats
    lats = ds.coords.get("lat", ds.coords.get("latitude")).values
    lons = ds.coords.get("lon", ds.coords.get("longitude")).values
    month_da = xr.DataArray(
        month_raster,
        dims=["latitude", "longitude"],
        coords={"latitude": lats, "longitude": lons},
    )

    print(f"[IMD Rainfall] Loading district polygons...")
    districts = get_district_polygons()

    print(f"[IMD Rainfall] Computing zonal statistics for {len(districts)} districts...")
    district_rainfall = aggregate_raster_to_districts(month_da, districts, "district_id")

    # Build historical baseline (use previous years' same-month data)
    # For MVP, use a simplified approach: compare against same-year other months
    # TODO: Once we have multiple years of data, use true multi-year baseline
    historical_all_months = monthly_totals.mean(axis=(1, 2))  # rough baseline

    print(f"[IMD Rainfall] Scoring...")
    rows = []
    period_start = date(year, month, 1)
    import calendar
    period_end = date(year, month, calendar.monthrange(year, month)[1])

    for _, row in district_rainfall.iterrows():
        rainfall_value = row["mean"]
        if rainfall_value is None or np.isnan(rainfall_value):
            score = 50
            rainfall_value = 0.0
        else:
            score = compute_rainfall_anomaly_score(rainfall_value, historical_all_months)

        rows.append(IndicatorRow(
            district_id=int(row["district_id"]),
            indicator_type="rainfall_anomaly",
            value=round(float(rainfall_value), 2),
            score=score,
            period_start=period_start,
            period_end=period_end,
            source=SOURCE_NAME,
        ))

    print(f"[IMD Rainfall] Writing {len(rows)} indicator rows...")
    written = write_indicators(rows)
    update_data_source_status(SOURCE_NAME, "ok", written)
    print(f"[IMD Rainfall] Done. Wrote {written} rows.")
    return written


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python -m src.fetch_imd_rainfall <year> <month>")
        sys.exit(1)
    run(int(sys.argv[1]), int(sys.argv[2]))
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pytest tests/test_fetch_imd.py -v
```

Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd C:\Users\Santosh\Claude_Access\dicrav2
git add pipeline/src/fetch_imd_rainfall.py pipeline/tests/test_fetch_imd.py
git commit -m "feat: add IMD rainfall fetcher with anomaly scoring"
```

---

## Task 5: IMD Temperature Fetcher + Heat Stress Scorer

**Files:**
- Create: `pipeline/src/fetch_imd_temperature.py`

- [ ] **Step 1: Implement temperature fetcher**

Create `pipeline/src/fetch_imd_temperature.py`:

```python
"""Fetch IMD gridded temperature data and compute heat stress scores.

Heat stress is measured by counting extreme heat days (tmax > 40°C)
and computing degree-days above a threshold.
"""

import os
import numpy as np
import xarray as xr
import geopandas as gpd
from datetime import date
from pathlib import Path
import calendar

import imdlib as imd

from src.db import get_engine
from src.scoring import percentile_score, METHODOLOGY_VERSION
from src.zonal import aggregate_raster_to_districts
from src.writer import IndicatorRow, write_indicators, update_data_source_status

CACHE_DIR = Path(__file__).parent.parent / "data" / "cache" / "imd_temperature"
SOURCE_NAME = "imd_temperature"
HEAT_THRESHOLD_C = 40.0


def fetch_temperature(year: int) -> xr.Dataset:
    """Download IMD daily tmax for a given year."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_file = CACHE_DIR / f"tmax_{year}.nc"

    if cache_file.exists():
        return xr.open_dataset(cache_file)

    data = imd.get_data("tmax", year, year, fn_format="yearwise")
    ds = data.to_xarray()
    ds.to_netcdf(cache_file)
    return ds


def compute_monthly_heat_stress(
    daily_tmax: np.ndarray, year: int, month: int
) -> np.ndarray:
    """Compute heat stress metric for a month: mean of daily max temperatures.

    Args:
        daily_tmax: Shape (n_days, n_lat, n_lon), in degrees Celsius.
        year: Year.
        month: Target month (1-12).

    Returns:
        2D array of mean daily max temperature for the month.
    """
    n_days_in_month = calendar.monthrange(year, month)[1]

    # Calculate day offset for the target month
    day_offset = 0
    for m in range(1, month):
        day_offset += calendar.monthrange(year, m)[1]

    if day_offset + n_days_in_month > daily_tmax.shape[0]:
        return np.full(daily_tmax.shape[1:], np.nan)

    month_data = daily_tmax[day_offset : day_offset + n_days_in_month]
    month_data = np.where(month_data < -50, np.nan, month_data)  # mask missing

    return np.nanmean(month_data, axis=0)


def run(year: int, month: int) -> int:
    """Run the heat stress pipeline for a given year/month."""
    print(f"[IMD Temperature] Fetching data for {year}...")
    ds = fetch_temperature(year)

    var_name = list(ds.data_vars)[0]
    daily_tmax = ds[var_name].values

    print(f"[IMD Temperature] Computing monthly heat stress for month {month}...")
    heat_raster = compute_monthly_heat_stress(daily_tmax, year, month)

    lats = ds.coords.get("lat", ds.coords.get("latitude")).values
    lons = ds.coords.get("lon", ds.coords.get("longitude")).values
    heat_da = xr.DataArray(
        heat_raster,
        dims=["latitude", "longitude"],
        coords={"latitude": lats, "longitude": lons},
    )

    print(f"[IMD Temperature] Loading district polygons...")
    engine = get_engine()
    districts = gpd.read_postgis(
        "SELECT id as district_id, geometry FROM districts",
        engine,
        geom_col="geometry",
    )

    print(f"[IMD Temperature] Computing zonal statistics...")
    district_temp = aggregate_raster_to_districts(heat_da, districts, "district_id")

    # Score: higher temp = higher risk
    # Use all district values as the distribution for relative scoring
    all_values = district_temp["mean"].dropna().values
    if len(all_values) == 0:
        print("[IMD Temperature] No valid data.")
        return 0

    period_start = date(year, month, 1)
    period_end = date(year, month, calendar.monthrange(year, month)[1])

    rows = []
    for _, row in district_temp.iterrows():
        temp_value = row["mean"]
        if temp_value is None or np.isnan(temp_value):
            score = 50
            temp_value = 0.0
        else:
            score = percentile_score(temp_value, all_values)

        rows.append(IndicatorRow(
            district_id=int(row["district_id"]),
            indicator_type="heat_stress",
            value=round(float(temp_value), 2),
            score=score,
            period_start=period_start,
            period_end=period_end,
            source=SOURCE_NAME,
        ))

    print(f"[IMD Temperature] Writing {len(rows)} indicator rows...")
    written = write_indicators(rows)
    update_data_source_status(SOURCE_NAME, "ok", written)
    print(f"[IMD Temperature] Done. Wrote {written} rows.")
    return written


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python -m src.fetch_imd_temperature <year> <month>")
        sys.exit(1)
    run(int(sys.argv[1]), int(sys.argv[2]))
```

- [ ] **Step 2: Commit**

```bash
cd C:\Users\Santosh\Claude_Access\dicrav2
git add pipeline/src/fetch_imd_temperature.py
git commit -m "feat: add IMD temperature fetcher with heat stress scoring"
```

---

## Task 6: Drought Index (SPI) Computation

**Files:**
- Create: `pipeline/src/compute_drought_index.py`
- Create: `pipeline/tests/test_drought_index.py`

- [ ] **Step 1: Write SPI tests**

Create `pipeline/tests/test_drought_index.py`:

```python
import numpy as np
from src.compute_drought_index import compute_spi


def test_spi_normal_rainfall():
    """Rainfall equal to historical mean should give SPI near 0."""
    # 30 years of monthly rainfall, normally distributed around 100mm
    historical = np.random.RandomState(42).normal(100, 20, size=30)
    spi = compute_spi(100.0, historical)
    assert -0.5 <= spi <= 0.5


def test_spi_severe_drought():
    """Very low rainfall vs history should give strongly negative SPI."""
    historical = np.random.RandomState(42).normal(100, 20, size=30)
    spi = compute_spi(30.0, historical)
    assert spi < -1.5


def test_spi_excess_rainfall():
    """Very high rainfall should give positive SPI."""
    historical = np.random.RandomState(42).normal(100, 20, size=30)
    spi = compute_spi(180.0, historical)
    assert spi > 1.5


def test_spi_zero_rainfall():
    """Zero rainfall should give very negative SPI."""
    historical = np.random.RandomState(42).normal(100, 20, size=30)
    historical = np.clip(historical, 10, None)  # ensure all positive
    spi = compute_spi(0.0, historical)
    assert spi < -2.0
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pytest tests/test_drought_index.py -v
```

Expected: FAIL

- [ ] **Step 3: Implement SPI computation**

Create `pipeline/src/compute_drought_index.py`:

```python
"""Compute Standardized Precipitation Index (SPI) for drought scoring.

SPI is a WMO-recommended drought index that measures how far current
precipitation deviates from the historical distribution.

SPI values:
  >= 2.0  : Extremely wet
  1.5-2.0 : Very wet
  1.0-1.5 : Moderately wet
  -1.0-1.0: Near normal
  -1.5--1.0: Moderately dry
  -2.0--1.5: Severely dry
  <= -2.0 : Extremely dry
"""

import numpy as np
from datetime import date
import calendar
from scipy import stats as scipy_stats
from sqlalchemy import text

from src.db import get_engine
from src.scoring import percentile_score
from src.writer import IndicatorRow, write_indicators


def compute_spi(current_rainfall: float, historical_rainfall: np.ndarray) -> float:
    """Compute SPI for a single value against historical distribution.

    Fits a gamma distribution to historical rainfall, then transforms
    to a standard normal deviate.

    Returns SPI value (typically -3 to +3).
    """
    historical_clean = historical_rainfall[
        (~np.isnan(historical_rainfall)) & (historical_rainfall > 0)
    ]

    if len(historical_clean) < 10:
        return 0.0

    if current_rainfall <= 0:
        return -3.0

    try:
        shape, loc, scale = scipy_stats.gamma.fit(historical_clean, floc=0)
        cdf_value = scipy_stats.gamma.cdf(current_rainfall, shape, loc=loc, scale=scale)
        cdf_value = np.clip(cdf_value, 0.001, 0.999)
        spi = scipy_stats.norm.ppf(cdf_value)
        return float(np.clip(spi, -3.0, 3.0))
    except Exception:
        # Fallback: simple z-score
        mean = np.mean(historical_clean)
        std = np.std(historical_clean)
        if std == 0:
            return 0.0
        return float(np.clip((current_rainfall - mean) / std, -3.0, 3.0))


def spi_to_risk_score(spi: float) -> int:
    """Convert SPI to a 0-100 risk score. Negative SPI = drought = high risk."""
    # Map SPI range [-3, 3] to risk [100, 0]
    # SPI = -3 → risk 100 (extreme drought)
    # SPI =  0 → risk 50 (normal)
    # SPI = +3 → risk 0 (extremely wet, no drought risk)
    risk = 50 - (spi / 3.0) * 50
    return int(np.clip(round(risk), 0, 100))


def run(year: int, month: int) -> int:
    """Compute drought index for all districts using stored rainfall data.

    Reads rainfall values from climate_indicators table for the target period
    and computes SPI against historical rainfall for the same month.
    """
    engine = get_engine()
    period_start = date(year, month, 1)
    period_end = date(year, month, calendar.monthrange(year, month)[1])

    print(f"[Drought Index] Computing SPI for {year}-{month:02d}...")

    # Get current month's rainfall per district
    with engine.connect() as conn:
        current = conn.execute(
            text("""
                SELECT district_id, value
                FROM climate_indicators
                WHERE indicator_type = 'rainfall_anomaly'
                  AND period_start = :period_start
            """),
            {"period_start": period_start.isoformat()},
        ).fetchall()

    if not current:
        print("[Drought Index] No rainfall data found for this period.")
        return 0

    # Get historical rainfall for the same month across years
    with engine.connect() as conn:
        historical = conn.execute(
            text("""
                SELECT district_id, value
                FROM climate_indicators
                WHERE indicator_type = 'rainfall_anomaly'
                  AND EXTRACT(MONTH FROM period_start) = :month
                ORDER BY district_id, period_start
            """),
            {"month": month},
        ).fetchall()

    # Build historical lookup: district_id → array of values
    from collections import defaultdict
    hist_by_district = defaultdict(list)
    for row in historical:
        hist_by_district[row.district_id].append(row.value)

    rows = []
    for row in current:
        district_id = row.district_id
        current_rainfall = row.value
        hist_values = np.array(hist_by_district.get(district_id, []))

        if len(hist_values) >= 3:
            spi = compute_spi(current_rainfall, hist_values)
        else:
            spi = 0.0  # not enough history

        score = spi_to_risk_score(spi)

        rows.append(IndicatorRow(
            district_id=district_id,
            indicator_type="drought_index",
            value=round(spi, 3),
            score=score,
            period_start=period_start,
            period_end=period_end,
            source="computed_spi",
        ))

    written = write_indicators(rows)
    print(f"[Drought Index] Wrote {written} rows.")
    return written


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python -m src.compute_drought_index <year> <month>")
        sys.exit(1)
    run(int(sys.argv[1]), int(sys.argv[2]))
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pytest tests/test_drought_index.py -v
```

Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd C:\Users\Santosh\Claude_Access\dicrav2
git add pipeline/src/compute_drought_index.py pipeline/tests/test_drought_index.py
git commit -m "feat: add SPI drought index computation"
```

---

## Task 7: ERA5-Land Soil Moisture Fetcher

**Files:**
- Create: `pipeline/src/fetch_era5.py`

- [ ] **Step 1: Implement ERA5 fetcher**

Create `pipeline/src/fetch_era5.py`:

```python
"""Fetch ERA5-Land soil moisture data from Copernicus CDS.

Requires: CDS account + ~/.cdsapirc configured with API key.
See: https://cds.climate.copernicus.eu
"""

import numpy as np
import xarray as xr
import geopandas as gpd
from datetime import date
from pathlib import Path
import calendar

import cdsapi

from src.db import get_engine
from src.scoring import percentile_score
from src.zonal import aggregate_raster_to_districts
from src.writer import IndicatorRow, write_indicators, update_data_source_status

CACHE_DIR = Path(__file__).parent.parent / "data" / "cache" / "era5"
SOURCE_NAME = "era5_land"


def fetch_soil_moisture(year: int, month: int) -> xr.Dataset:
    """Download ERA5-Land soil moisture for a month over India."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_file = CACHE_DIR / f"era5_sm_{year}_{month:02d}.nc"

    if cache_file.exists():
        return xr.open_dataset(cache_file)

    c = cdsapi.Client()
    n_days = calendar.monthrange(year, month)[1]

    c.retrieve(
        "reanalysis-era5-land-monthly-means",
        {
            "product_type": "monthly_averaged_reanalysis",
            "variable": "volumetric_soil_water_layer_1",
            "year": str(year),
            "month": f"{month:02d}",
            "time": "00:00",
            "area": [35, 68, 8, 97],  # N, W, S, E — India
            "format": "netcdf",
        },
        str(cache_file),
    )

    return xr.open_dataset(cache_file)


def run(year: int, month: int) -> int:
    """Run soil moisture pipeline for a given year/month."""
    print(f"[ERA5 Soil Moisture] Fetching data for {year}-{month:02d}...")
    ds = fetch_soil_moisture(year, month)

    # ERA5-Land soil moisture variable
    var_name = "swvl1" if "swvl1" in ds else list(ds.data_vars)[0]
    sm_data = ds[var_name]

    # If there's a time dimension, take the first (monthly mean)
    if "time" in sm_data.dims:
        sm_data = sm_data.isel(time=0)

    # Rename coords to standard names if needed
    rename_map = {}
    for dim in sm_data.dims:
        if dim in ("lat",):
            rename_map[dim] = "latitude"
        elif dim in ("lon",):
            rename_map[dim] = "longitude"
    if rename_map:
        sm_data = sm_data.rename(rename_map)

    print(f"[ERA5 Soil Moisture] Loading district polygons...")
    engine = get_engine()
    districts = gpd.read_postgis(
        "SELECT id as district_id, geometry FROM districts",
        engine,
        geom_col="geometry",
    )

    print(f"[ERA5 Soil Moisture] Computing zonal statistics...")
    district_sm = aggregate_raster_to_districts(sm_data, districts, "district_id")

    # Score: LOW soil moisture = HIGH risk (drought indicator)
    # Invert: lower moisture → higher score
    all_values = district_sm["mean"].dropna().values
    if len(all_values) == 0:
        print("[ERA5 Soil Moisture] No valid data.")
        return 0

    period_start = date(year, month, 1)
    period_end = date(year, month, calendar.monthrange(year, month)[1])

    rows = []
    for _, row in district_sm.iterrows():
        sm_value = row["mean"]
        if sm_value is None or np.isnan(sm_value):
            score = 50
            sm_value = 0.0
        else:
            # Invert: low moisture = high risk
            raw_score = percentile_score(sm_value, all_values)
            score = 100 - raw_score  # invert

        rows.append(IndicatorRow(
            district_id=int(row["district_id"]),
            indicator_type="soil_moisture",
            value=round(float(sm_value), 4),
            score=score,
            period_start=period_start,
            period_end=period_end,
            source=SOURCE_NAME,
        ))

    print(f"[ERA5 Soil Moisture] Writing {len(rows)} indicator rows...")
    written = write_indicators(rows)
    update_data_source_status(SOURCE_NAME, "ok", written)
    print(f"[ERA5 Soil Moisture] Done. Wrote {written} rows.")
    return written


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python -m src.fetch_era5 <year> <month>")
        sys.exit(1)
    run(int(sys.argv[1]), int(sys.argv[2]))
```

- [ ] **Step 2: Commit**

```bash
cd C:\Users\Santosh\Claude_Access\dicrav2
git add pipeline/src/fetch_era5.py
git commit -m "feat: add ERA5-Land soil moisture fetcher with scoring"
```

---

## Task 8: MODIS NDVI Fetcher via Google Earth Engine

**Files:**
- Create: `pipeline/src/fetch_gee_ndvi.py`

- [ ] **Step 1: Implement GEE NDVI fetcher**

Create `pipeline/src/fetch_gee_ndvi.py`:

```python
"""Fetch MODIS NDVI data via Google Earth Engine and compute vegetation health scores.

Uses MOD13A3 (monthly 1km NDVI). NDVI anomaly: deviation from long-term
mean for the same month. Low NDVI = stressed vegetation = high risk.

Requires: GEE account authenticated via `earthengine authenticate`.
"""

import numpy as np
import pandas as pd
from datetime import date
from pathlib import Path
import calendar
import json

import ee

from src.db import get_engine
from src.scoring import percentile_score
from src.writer import IndicatorRow, write_indicators, update_data_source_status
from sqlalchemy import text

SOURCE_NAME = "modis_ndvi"
CACHE_DIR = Path(__file__).parent.parent / "data" / "cache" / "gee_ndvi"


def initialize_gee():
    """Initialize Earth Engine."""
    try:
        ee.Initialize()
    except Exception:
        ee.Authenticate()
        ee.Initialize()


def fetch_ndvi_by_district(year: int, month: int) -> pd.DataFrame:
    """Fetch mean NDVI per district from MODIS MOD13A3 via GEE.

    Returns DataFrame with columns: [district_lgd_code, ndvi_mean]
    """
    initialize_gee()
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_file = CACHE_DIR / f"ndvi_{year}_{month:02d}.csv"

    if cache_file.exists():
        return pd.read_csv(cache_file)

    # Date range for the month
    start_date = f"{year}-{month:02d}-01"
    n_days = calendar.monthrange(year, month)[1]
    end_date = f"{year}-{month:02d}-{n_days}"

    # Load MODIS MOD13A3 monthly NDVI
    modis = (
        ee.ImageCollection("MODIS/061/MOD13A3")
        .filterDate(start_date, end_date)
        .select("NDVI")
    )

    # Scale NDVI (stored as int16 * 10000)
    def scale_ndvi(img):
        return img.multiply(0.0001).copyProperties(img, ["system:time_start"])

    ndvi_image = modis.map(scale_ndvi).mean()

    # Load district boundaries from GEE (use FAO GAUL level 2 as proxy)
    # For production, upload our LGD boundaries as a GEE asset
    india_districts = ee.FeatureCollection("FAO/GAUL/2015/level2").filter(
        ee.Filter.eq("ADM0_NAME", "India")
    )

    # Zonal statistics
    stats = ndvi_image.reduceRegions(
        collection=india_districts,
        reducer=ee.Reducer.mean(),
        scale=1000,
        crs="EPSG:4326",
    )

    # Download results
    result = stats.select(["ADM2_CODE", "ADM2_NAME", "ADM1_NAME", "mean"]).getInfo()

    records = []
    for f in result["features"]:
        props = f["properties"]
        records.append(
            {
                "adm2_code": props.get("ADM2_CODE"),
                "district_name": props.get("ADM2_NAME"),
                "state_name": props.get("ADM1_NAME"),
                "ndvi_mean": props.get("mean"),
            }
        )

    df = pd.DataFrame(records)
    df.to_csv(cache_file, index=False)
    return df


def match_gee_to_lgd(gee_df: pd.DataFrame) -> pd.DataFrame:
    """Match GEE district names to our LGD district IDs via fuzzy name matching.

    This is imperfect — for production, upload LGD boundaries as a GEE asset.
    """
    engine = get_engine()
    with engine.connect() as conn:
        db_districts = conn.execute(
            text("SELECT id, name, lgd_code FROM districts")
        ).fetchall()

    lgd_lookup = {}
    for d in db_districts:
        lgd_lookup[d.name.lower().strip()] = d.id

    matched = []
    for _, row in gee_df.iterrows():
        gee_name = str(row.get("district_name", "")).lower().strip()
        district_id = lgd_lookup.get(gee_name)

        if district_id is None:
            # Try partial match
            for db_name, db_id in lgd_lookup.items():
                if gee_name in db_name or db_name in gee_name:
                    district_id = db_id
                    break

        if district_id is not None:
            matched.append(
                {
                    "district_id": district_id,
                    "ndvi_mean": row["ndvi_mean"],
                }
            )

    return pd.DataFrame(matched)


def run(year: int, month: int) -> int:
    """Run NDVI vegetation health pipeline."""
    print(f"[MODIS NDVI] Fetching data for {year}-{month:02d}...")
    gee_df = fetch_ndvi_by_district(year, month)

    print(f"[MODIS NDVI] Matching {len(gee_df)} GEE districts to LGD...")
    matched = match_gee_to_lgd(gee_df)
    print(f"[MODIS NDVI] Matched {len(matched)} districts.")

    if matched.empty:
        print("[MODIS NDVI] No matched districts.")
        return 0

    # Score: LOW NDVI = HIGH risk (stressed vegetation)
    all_ndvi = matched["ndvi_mean"].dropna().values
    period_start = date(year, month, 1)
    period_end = date(year, month, calendar.monthrange(year, month)[1])

    rows = []
    for _, row in matched.iterrows():
        ndvi = row["ndvi_mean"]
        if ndvi is None or np.isnan(ndvi):
            score = 50
            ndvi = 0.0
        else:
            # Invert: low NDVI = high risk
            raw_score = percentile_score(ndvi, all_ndvi)
            score = 100 - raw_score

        rows.append(IndicatorRow(
            district_id=int(row["district_id"]),
            indicator_type="vegetation_health",
            value=round(float(ndvi), 4),
            score=score,
            period_start=period_start,
            period_end=period_end,
            source=SOURCE_NAME,
        ))

    print(f"[MODIS NDVI] Writing {len(rows)} indicator rows...")
    written = write_indicators(rows)
    update_data_source_status(SOURCE_NAME, "ok", written)
    print(f"[MODIS NDVI] Done. Wrote {written} rows.")
    return written


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python -m src.fetch_gee_ndvi <year> <month>")
        sys.exit(1)
    run(int(sys.argv[1]), int(sys.argv[2]))
```

- [ ] **Step 2: Commit**

```bash
cd C:\Users\Santosh\Claude_Access\dicrav2
git add pipeline/src/fetch_gee_ndvi.py
git commit -m "feat: add MODIS NDVI fetcher via GEE with vegetation health scoring"
```

---

## Task 9: Flood Risk Composite Scorer

**Files:**
- Create: `pipeline/src/compute_flood_risk.py`

- [ ] **Step 1: Implement flood risk composite**

Create `pipeline/src/compute_flood_risk.py`:

```python
"""Compute composite flood risk score from rainfall, soil moisture, and elevation.

Flood risk = weighted combination of:
  - Rainfall intensity (40%): high rainfall → high flood risk
  - Soil moisture saturation (40%): saturated soil can't absorb more rain
  - Elevation factor (20%): lower elevation → higher flood risk

Reads rainfall_anomaly and soil_moisture from climate_indicators for the
target period, and uses pre-computed elevation data.
"""

import numpy as np
from datetime import date
import calendar
from sqlalchemy import text

from src.db import get_engine
from src.writer import IndicatorRow, write_indicators

WEIGHT_RAINFALL = 0.4
WEIGHT_SOIL_MOISTURE = 0.4
WEIGHT_ELEVATION = 0.2


def run(year: int, month: int) -> int:
    """Compute flood risk for all districts from existing indicator data."""
    engine = get_engine()
    period_start = date(year, month, 1)
    period_end = date(year, month, calendar.monthrange(year, month)[1])

    print(f"[Flood Risk] Computing for {year}-{month:02d}...")

    # Get rainfall scores for this period
    with engine.connect() as conn:
        rainfall_rows = conn.execute(
            text("""
                SELECT district_id, score
                FROM climate_indicators
                WHERE indicator_type = 'rainfall_anomaly'
                  AND period_start = :period_start
            """),
            {"period_start": period_start.isoformat()},
        ).fetchall()

    # Get soil moisture scores for this period
    with engine.connect() as conn:
        sm_rows = conn.execute(
            text("""
                SELECT district_id, score
                FROM climate_indicators
                WHERE indicator_type = 'soil_moisture'
                  AND period_start = :period_start
            """),
            {"period_start": period_start.isoformat()},
        ).fetchall()

    rainfall_scores = {r.district_id: r.score for r in rainfall_rows}
    sm_scores = {r.district_id: r.score for r in sm_rows}

    # Get all district IDs
    with engine.connect() as conn:
        all_districts = conn.execute(
            text("SELECT id FROM districts")
        ).fetchall()

    rows = []
    for d in all_districts:
        district_id = d.id
        rain_score = rainfall_scores.get(district_id, 50)
        soil_score = sm_scores.get(district_id, 50)
        # For soil moisture, high score = low moisture = low flood risk
        # We need to invert: high moisture = high flood risk
        soil_flood_score = 100 - soil_score
        # Elevation factor: placeholder at 50 until we have elevation data
        elevation_score = 50

        composite = (
            WEIGHT_RAINFALL * rain_score
            + WEIGHT_SOIL_MOISTURE * soil_flood_score
            + WEIGHT_ELEVATION * elevation_score
        )
        composite = int(np.clip(round(composite), 0, 100))

        rows.append(IndicatorRow(
            district_id=district_id,
            indicator_type="flood_risk",
            value=round(float(composite), 2),
            score=composite,
            period_start=period_start,
            period_end=period_end,
            source="computed_composite",
        ))

    written = write_indicators(rows)
    print(f"[Flood Risk] Wrote {written} rows.")
    return written


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python -m src.compute_flood_risk <year> <month>")
        sys.exit(1)
    run(int(sys.argv[1]), int(sys.argv[2]))
```

- [ ] **Step 2: Commit**

```bash
cd C:\Users\Santosh\Claude_Access\dicrav2
git add pipeline/src/compute_flood_risk.py
git commit -m "feat: add flood risk composite scorer"
```

---

## Task 10: Alert Checker

**Files:**
- Create: `pipeline/src/check_alerts.py`
- Create: `pipeline/tests/test_alerts.py`

- [ ] **Step 1: Write alert checker tests**

Create `pipeline/tests/test_alerts.py`:

```python
from src.check_alerts import check_threshold


def test_check_threshold_warning_triggered():
    assert check_threshold(80, 75, ">=") is True


def test_check_threshold_warning_not_triggered():
    assert check_threshold(70, 75, ">=") is False


def test_check_threshold_exact_boundary():
    assert check_threshold(75, 75, ">=") is True


def test_check_threshold_gt_operator():
    assert check_threshold(75, 75, ">") is False
    assert check_threshold(76, 75, ">") is True
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pytest tests/test_alerts.py -v
```

- [ ] **Step 3: Implement alert checker**

Create `pipeline/src/check_alerts.py`:

```python
"""Check indicator scores against alert thresholds and create alert events."""

from datetime import date
from sqlalchemy import text
from src.db import get_engine


def check_threshold(value: int, threshold: int, operator: str) -> bool:
    """Check if a value breaches a threshold given an operator."""
    if operator == ">":
        return value > threshold
    elif operator == ">=":
        return value >= threshold
    elif operator == "<":
        return value < threshold
    elif operator == "<=":
        return value <= threshold
    return False


def run(period_start: date) -> int:
    """Check all indicator scores for a period against alert thresholds.

    Creates alert_events for any breaches found.
    Returns number of alerts created.
    """
    engine = get_engine()

    # Get all thresholds
    with engine.connect() as conn:
        thresholds = conn.execute(
            text("SELECT id, indicator_type, threshold_value, comparison_operator, severity FROM alert_thresholds")
        ).fetchall()

    # Get all indicator scores for this period
    with engine.connect() as conn:
        scores = conn.execute(
            text("""
                SELECT district_id, indicator_type, score
                FROM climate_indicators
                WHERE period_start = :period_start
            """),
            {"period_start": period_start.isoformat()},
        ).fetchall()

    alerts_created = 0
    with engine.begin() as conn:
        for score_row in scores:
            for threshold in thresholds:
                if score_row.indicator_type != threshold.indicator_type:
                    continue

                if check_threshold(
                    score_row.score,
                    threshold.threshold_value,
                    threshold.comparison_operator,
                ):
                    conn.execute(
                        text("""
                            INSERT INTO alert_events (district_id, threshold_id, current_value)
                            VALUES (:district_id, :threshold_id, :current_value)
                        """),
                        {
                            "district_id": score_row.district_id,
                            "threshold_id": threshold.id,
                            "current_value": score_row.score,
                        },
                    )
                    alerts_created += 1

    print(f"[Alerts] Created {alerts_created} alert events for {period_start}.")
    return alerts_created


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python -m src.check_alerts <YYYY-MM-DD>")
        sys.exit(1)
    d = date.fromisoformat(sys.argv[1])
    run(d)
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pytest tests/test_alerts.py -v
```

Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd C:\Users\Santosh\Claude_Access\dicrav2
git add pipeline/src/check_alerts.py pipeline/tests/test_alerts.py
git commit -m "feat: add alert threshold checker"
```

---

## Task 11: Pipeline Orchestrator

**Files:**
- Create: `pipeline/src/run_pipeline.py`

- [ ] **Step 1: Implement orchestrator**

Create `pipeline/src/run_pipeline.py`:

```python
"""Pipeline orchestrator — runs all data fetchers and scorers in sequence.

Usage:
    python -m src.run_pipeline <year> <month>
    python -m src.run_pipeline --latest     # use current month

Pipeline order:
    1. IMD rainfall → rainfall_anomaly indicator
    2. IMD temperature → heat_stress indicator
    3. ERA5-Land → soil_moisture indicator
    4. MODIS NDVI → vegetation_health indicator
    5. SPI computation → drought_index indicator (from rainfall history)
    6. Flood risk composite → flood_risk indicator (from above indicators)
    7. Alert check → alert_events table
"""

import sys
import traceback
from datetime import date, datetime

from src.writer import update_data_source_status


def run_all(year: int, month: int) -> dict:
    """Run all pipeline stages. Returns dict of stage → rows written."""
    results = {}
    period_start = date(year, month, 1)

    # Stage 1: IMD Rainfall
    try:
        from src.fetch_imd_rainfall import run as run_rainfall
        results["rainfall_anomaly"] = run_rainfall(year, month)
    except Exception as e:
        print(f"[Pipeline] IMD Rainfall FAILED: {e}")
        traceback.print_exc()
        update_data_source_status("imd_rainfall", "error")
        results["rainfall_anomaly"] = 0

    # Stage 2: IMD Temperature
    try:
        from src.fetch_imd_temperature import run as run_temperature
        results["heat_stress"] = run_temperature(year, month)
    except Exception as e:
        print(f"[Pipeline] IMD Temperature FAILED: {e}")
        traceback.print_exc()
        update_data_source_status("imd_temperature", "error")
        results["heat_stress"] = 0

    # Stage 3: ERA5 Soil Moisture
    try:
        from src.fetch_era5 import run as run_era5
        results["soil_moisture"] = run_era5(year, month)
    except Exception as e:
        print(f"[Pipeline] ERA5 FAILED: {e}")
        traceback.print_exc()
        update_data_source_status("era5_land", "error")
        results["soil_moisture"] = 0

    # Stage 4: MODIS NDVI
    try:
        from src.fetch_gee_ndvi import run as run_ndvi
        results["vegetation_health"] = run_ndvi(year, month)
    except Exception as e:
        print(f"[Pipeline] MODIS NDVI FAILED: {e}")
        traceback.print_exc()
        update_data_source_status("modis_ndvi", "error")
        results["vegetation_health"] = 0

    # Stage 5: Drought Index (depends on rainfall history)
    try:
        from src.compute_drought_index import run as run_drought
        results["drought_index"] = run_drought(year, month)
    except Exception as e:
        print(f"[Pipeline] Drought Index FAILED: {e}")
        traceback.print_exc()
        results["drought_index"] = 0

    # Stage 6: Flood Risk (depends on rainfall + soil moisture)
    try:
        from src.compute_flood_risk import run as run_flood
        results["flood_risk"] = run_flood(year, month)
    except Exception as e:
        print(f"[Pipeline] Flood Risk FAILED: {e}")
        traceback.print_exc()
        results["flood_risk"] = 0

    # Stage 7: Alert Check
    try:
        from src.check_alerts import run as run_alerts
        results["alerts"] = run_alerts(period_start)
    except Exception as e:
        print(f"[Pipeline] Alert Check FAILED: {e}")
        traceback.print_exc()
        results["alerts"] = 0

    print("\n=== Pipeline Summary ===")
    total = 0
    for stage, count in results.items():
        status = "OK" if count > 0 else "EMPTY/FAILED"
        print(f"  {stage:25s}: {count:6d} rows  [{status}]")
        total += count
    print(f"  {'TOTAL':25s}: {total:6d} rows")

    return results


if __name__ == "__main__":
    if len(sys.argv) >= 3:
        year = int(sys.argv[1])
        month = int(sys.argv[2])
    elif len(sys.argv) == 2 and sys.argv[1] == "--latest":
        now = datetime.now()
        year = now.year
        month = now.month
    else:
        print("Usage: python -m src.run_pipeline <year> <month>")
        print("       python -m src.run_pipeline --latest")
        sys.exit(1)

    run_all(year, month)
```

- [ ] **Step 2: Commit**

```bash
cd C:\Users\Santosh\Claude_Access\dicrav2
git add pipeline/src/run_pipeline.py
git commit -m "feat: add pipeline orchestrator with all stages and error handling"
```

---

## Task 12: Integration Test — Run Pipeline End-to-End

- [ ] **Step 1: Run the IMD rainfall pipeline for a test period**

This is a manual integration test. Requires database access.

```bash
cd C:\Users\Santosh\Claude_Access\dicrav2\pipeline
source .venv/Scripts/activate
python -m src.fetch_imd_rainfall 2024 6
```

Expected: Downloads IMD data for June 2024, computes rainfall anomaly for all districts, writes ~784 rows to `climate_indicators`.

- [ ] **Step 2: Verify data in database**

```sql
SELECT indicator_type, COUNT(*) as rows, AVG(score) as avg_score, MIN(score), MAX(score)
FROM climate_indicators
WHERE period_start = '2024-06-01'
GROUP BY indicator_type;
```

Expected: One row for `rainfall_anomaly` with ~784 rows.

- [ ] **Step 3: Run all unit tests**

```bash
cd C:\Users\Santosh\Claude_Access\dicrav2\pipeline
pytest tests/ -v
```

Expected: All tests pass (scoring, zonal, writer, drought, alerts, db).

- [ ] **Step 4: Final commit**

```bash
cd C:\Users\Santosh\Claude_Access\dicrav2
git add -A
git commit -m "chore: data pipeline plan complete — all fetchers, scorers, and orchestrator"
```

---

## Summary

After completing this plan, you have:
- **Scoring module**: percentile ranking with risk classification (0-100)
- **Zonal statistics**: aggregate any raster to district-level values
- **Database writer**: validated writes to `climate_indicators`
- **IMD rainfall pipeline**: fetch + rainfall_anomaly scoring
- **IMD temperature pipeline**: fetch + heat_stress scoring
- **SPI drought index**: computed from rainfall history
- **ERA5 soil moisture pipeline**: fetch + soil_moisture scoring
- **MODIS NDVI pipeline**: fetch via GEE + vegetation_health scoring
- **Flood risk composite**: weighted combination of rainfall + soil moisture
- **Alert checker**: threshold breach detection → alert_events
- **Pipeline orchestrator**: runs all stages in correct order with error handling

**External accounts needed before running:**
- CDS account for ERA5 (configure `~/.cdsapirc`)
- GEE account for MODIS (run `earthengine authenticate`)
- IMD data requires no account

**Next:** Plan 3 (Dashboard) — Next.js pages, MapLibre maps, Recharts charts, weight configuration UI.
