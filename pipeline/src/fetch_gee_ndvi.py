"""Fetch MODIS NDVI data via Google Earth Engine.

Uses MOD13A3 monthly 1km NDVI. Low NDVI = stressed vegetation = high risk.
Requires: GEE account authenticated via `earthengine authenticate`.
"""

import numpy as np
import pandas as pd
from datetime import date
from pathlib import Path
import calendar

import ee

from src.db import get_engine
from src.scoring import percentile_score
from src.writer import IndicatorRow, write_indicators, update_data_source_status
from sqlalchemy import text

SOURCE_NAME = "modis_ndvi"
CACHE_DIR = Path(__file__).parent.parent / "data" / "cache" / "gee_ndvi"


def initialize_gee():
    try:
        ee.Initialize()
    except Exception:
        ee.Authenticate()
        ee.Initialize()


def fetch_ndvi_by_district(year: int, month: int) -> pd.DataFrame:
    initialize_gee()
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_file = CACHE_DIR / f"ndvi_{year}_{month:02d}.csv"
    if cache_file.exists():
        return pd.read_csv(cache_file)

    n_days = calendar.monthrange(year, month)[1]
    start_date = f"{year}-{month:02d}-01"
    end_date = f"{year}-{month:02d}-{n_days}"

    modis = (
        ee.ImageCollection("MODIS/061/MOD13A3")
        .filterDate(start_date, end_date)
        .select("NDVI")
    )

    def scale_ndvi(img):
        return img.multiply(0.0001).copyProperties(img, ["system:time_start"])

    ndvi_image = modis.map(scale_ndvi).mean()

    india_districts = ee.FeatureCollection("FAO/GAUL/2015/level2").filter(
        ee.Filter.eq("ADM0_NAME", "India")
    )

    stats = ndvi_image.reduceRegions(
        collection=india_districts,
        reducer=ee.Reducer.mean(),
        scale=1000,
        crs="EPSG:4326",
    )

    result = stats.select(["ADM2_CODE", "ADM2_NAME", "ADM1_NAME", "mean"]).getInfo()

    records = []
    for f in result["features"]:
        props = f["properties"]
        records.append({
            "adm2_code": props.get("ADM2_CODE"),
            "district_name": props.get("ADM2_NAME"),
            "state_name": props.get("ADM1_NAME"),
            "ndvi_mean": props.get("mean"),
        })

    df = pd.DataFrame(records)
    df.to_csv(cache_file, index=False)
    return df


def match_gee_to_lgd(gee_df: pd.DataFrame) -> pd.DataFrame:
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
            for db_name, db_id in lgd_lookup.items():
                if gee_name in db_name or db_name in gee_name:
                    district_id = db_id
                    break
        if district_id is not None:
            matched.append({"district_id": district_id, "ndvi_mean": row["ndvi_mean"]})

    return pd.DataFrame(matched)


def run(year: int, month: int) -> int:
    print(f"[MODIS NDVI] Fetching data for {year}-{month:02d}...")
    gee_df = fetch_ndvi_by_district(year, month)

    print(f"[MODIS NDVI] Matching {len(gee_df)} GEE districts to LGD...")
    matched = match_gee_to_lgd(gee_df)
    print(f"[MODIS NDVI] Matched {len(matched)} districts.")

    if matched.empty:
        return 0

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
