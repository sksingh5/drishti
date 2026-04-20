"""Fetch ERA5-Land soil moisture data from Copernicus CDS.

Requires: CDS account + ~/.cdsapirc configured with API key.
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
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_file = CACHE_DIR / f"era5_sm_{year}_{month:02d}.nc"
    if cache_file.exists():
        return xr.open_dataset(cache_file)

    c = cdsapi.Client()
    c.retrieve(
        "reanalysis-era5-land-monthly-means",
        {
            "product_type": "monthly_averaged_reanalysis",
            "variable": "volumetric_soil_water_layer_1",
            "year": str(year),
            "month": f"{month:02d}",
            "time": "00:00",
            "area": [35, 68, 8, 97],
            "format": "netcdf",
        },
        str(cache_file),
    )
    return xr.open_dataset(cache_file)


def run(year: int, month: int) -> int:
    print(f"[ERA5 Soil Moisture] Fetching data for {year}-{month:02d}...")
    ds = fetch_soil_moisture(year, month)

    var_name = "swvl1" if "swvl1" in ds else list(ds.data_vars)[0]
    sm_data = ds[var_name]
    if "time" in sm_data.dims:
        sm_data = sm_data.isel(time=0)

    rename_map = {}
    for dim in sm_data.dims:
        if dim == "lat":
            rename_map[dim] = "latitude"
        elif dim == "lon":
            rename_map[dim] = "longitude"
    if rename_map:
        sm_data = sm_data.rename(rename_map)

    engine = get_engine()
    districts = gpd.read_postgis(
        "SELECT id as district_id, geometry FROM districts", engine, geom_col="geometry",
    )

    district_sm = aggregate_raster_to_districts(sm_data, districts, "district_id")
    all_values = district_sm["mean"].dropna().values
    if len(all_values) == 0:
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
            raw_score = percentile_score(sm_value, all_values)
            score = 100 - raw_score  # low moisture = high risk

        rows.append(IndicatorRow(
            district_id=int(row["district_id"]),
            indicator_type="soil_moisture",
            value=round(float(sm_value), 4),
            score=score,
            period_start=period_start,
            period_end=period_end,
            source=SOURCE_NAME,
        ))

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
