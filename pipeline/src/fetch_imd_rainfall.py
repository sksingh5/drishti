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
import calendar

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
    months = []
    totals = []
    day_idx = 0

    for m in range(start_month, 13):
        if day_idx >= daily_rain.shape[0]:
            break
        n_days_in_month = calendar.monthrange(year, m)[1]
        end_idx = min(day_idx + n_days_in_month, daily_rain.shape[0])
        month_data = daily_rain[day_idx:end_idx]
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

    var_name = list(ds.data_vars)[0]
    daily = ds[var_name].values

    print(f"[IMD Rainfall] Computing monthly totals...")
    months, monthly_totals = compute_monthly_rainfall(daily, year)

    if month not in months:
        print(f"[IMD Rainfall] Month {month} not available in data")
        return 0

    month_idx = months.index(month)
    month_raster = monthly_totals[month_idx]

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

    # Use all district values as the distribution for relative scoring (MVP baseline)
    historical_all_months = monthly_totals.mean(axis=(1, 2))

    print(f"[IMD Rainfall] Scoring...")
    rows = []
    period_start = date(year, month, 1)
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
