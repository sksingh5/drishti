"""Fetch IMD gridded temperature data and compute heat stress scores.

Heat stress is measured by mean daily max temperature per month.
Higher temperature = higher risk.
"""

import numpy as np
import xarray as xr
import geopandas as gpd
from datetime import date
from pathlib import Path
import calendar

import imdlib as imd

from src.db import get_district_polygons
from src.scoring import percentile_score
from src.zonal import aggregate_raster_to_districts
from src.writer import IndicatorRow, write_indicators, update_data_source_status

CACHE_DIR = Path(__file__).parent.parent / "data" / "cache" / "imd_temperature"
SOURCE_NAME = "imd_temperature"


def fetch_temperature(year: int) -> xr.Dataset:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_file = CACHE_DIR / f"tmax_{year}.nc"
    if cache_file.exists():
        return xr.open_dataset(cache_file)
    data = imd.get_data("tmax", year, year, fn_format="yearwise")
    ds = data.get_xarray()
    ds.to_netcdf(cache_file)
    return ds


def compute_monthly_heat_stress(
    daily_tmax: np.ndarray, year: int, month: int
) -> np.ndarray:
    n_days_in_month = calendar.monthrange(year, month)[1]
    day_offset = 0
    for m in range(1, month):
        day_offset += calendar.monthrange(year, m)[1]
    if day_offset + n_days_in_month > daily_tmax.shape[0]:
        return np.full(daily_tmax.shape[1:], np.nan)
    month_data = daily_tmax[day_offset : day_offset + n_days_in_month]
    month_data = np.where(month_data < -50, np.nan, month_data)
    return np.nanmean(month_data, axis=0)


def run(year: int, month: int) -> int:
    print(f"[IMD Temperature] Fetching data for {year}...")
    ds = fetch_temperature(year)
    var_name = list(ds.data_vars)[0]
    daily_tmax = ds[var_name].values

    print(f"[IMD Temperature] Computing monthly heat stress for month {month}...")
    heat_raster = compute_monthly_heat_stress(daily_tmax, year, month)

    lats = ds.coords.get("lat", ds.coords.get("latitude")).values
    lons = ds.coords.get("lon", ds.coords.get("longitude")).values
    heat_da = xr.DataArray(
        heat_raster, dims=["latitude", "longitude"],
        coords={"latitude": lats, "longitude": lons},
    )

    print(f"[IMD Temperature] Loading district polygons...")
    districts = get_district_polygons()

    print(f"[IMD Temperature] Computing zonal statistics...")
    district_temp = aggregate_raster_to_districts(heat_da, districts, "district_id")

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
