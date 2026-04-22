"""Compute climatological baseline from multi-year IMD rainfall data.

Builds per-district monthly mean rainfall from historical years (2019-2023).
This baseline is used to compute rainfall anomaly relative to climate normals
rather than a single year's mean.

Scientific basis: WMO recommends 30-year normals (1991-2020). We use 5-year
means (2019-2023) as an interim baseline. This is documented as a limitation.
"""

import numpy as np
import xarray as xr
import json
from pathlib import Path
from datetime import date
import calendar

from src.zonal import aggregate_raster_to_districts
from src.db import get_district_polygons

CACHE_DIR = Path(__file__).parent.parent / "data" / "cache" / "imd_rainfall"
BASELINE_FILE = Path(__file__).parent.parent / "data" / "cache" / "rainfall_baseline.json"

BASELINE_YEARS = [2019, 2020, 2021, 2022, 2023]


def compute_monthly_totals(ds: xr.Dataset, year: int) -> dict[int, np.ndarray]:
    """Compute monthly rainfall totals from daily data."""
    var_name = list(ds.data_vars)[0]
    daily = ds[var_name].values

    results = {}
    day_idx = 0
    for m in range(1, 13):
        if day_idx >= daily.shape[0]:
            break
        n_days = calendar.monthrange(year, m)[1]
        end_idx = min(day_idx + n_days, daily.shape[0])
        month_data = daily[day_idx:end_idx]
        month_data = np.where(month_data < 0, 0, month_data)
        results[m] = month_data.sum(axis=0)
        day_idx += n_days

    return results


def build_baseline():
    """Build per-district monthly climatological baseline from 2019-2023 data."""
    print("[Baseline] Loading district polygons...")
    districts = get_district_polygons()

    # Accumulate monthly rainfall per district across years
    # Structure: {district_id: {month: [values across years]}}
    district_monthly = {}

    for year in BASELINE_YEARS:
        cache_file = CACHE_DIR / f"rain_{year}.nc"
        if not cache_file.exists():
            print(f"[Baseline] WARNING: {year} data not cached, skipping")
            continue

        print(f"[Baseline] Processing {year}...")
        ds = xr.open_dataset(cache_file)
        monthly_totals = compute_monthly_totals(ds, year)

        lats = ds.coords.get("lat", ds.coords.get("latitude")).values
        lons = ds.coords.get("lon", ds.coords.get("longitude")).values

        for month, raster in monthly_totals.items():
            da = xr.DataArray(
                raster,
                dims=["latitude", "longitude"],
                coords={"latitude": lats, "longitude": lons},
            )
            zonal = aggregate_raster_to_districts(da, districts, "district_id")

            for _, row in zonal.iterrows():
                d_id = int(row["district_id"])
                val = row["mean"]
                if val is None or np.isnan(val):
                    continue

                if d_id not in district_monthly:
                    district_monthly[d_id] = {}
                if month not in district_monthly[d_id]:
                    district_monthly[d_id][month] = []
                district_monthly[d_id][month].append(float(val))

    # Compute means
    baseline = {}
    for d_id, months in district_monthly.items():
        baseline[str(d_id)] = {}
        for month, values in months.items():
            baseline[str(d_id)][str(month)] = {
                "mean": round(float(np.mean(values)), 2),
                "std": round(float(np.std(values)), 2),
                "n_years": len(values),
            }

    # Save
    BASELINE_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(BASELINE_FILE, "w") as f:
        json.dump(baseline, f)

    n_districts = len(baseline)
    print(f"[Baseline] Saved baseline for {n_districts} districts to {BASELINE_FILE}")
    return baseline


def load_baseline() -> dict:
    """Load the pre-computed baseline."""
    if not BASELINE_FILE.exists():
        print("[Baseline] No cached baseline found, computing...")
        return build_baseline()
    with open(BASELINE_FILE) as f:
        return json.load(f)


if __name__ == "__main__":
    build_baseline()
