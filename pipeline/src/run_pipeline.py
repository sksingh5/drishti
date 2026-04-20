"""Pipeline orchestrator — runs all data fetchers and scorers in sequence.

Usage:
    python -m src.run_pipeline <year> <month>
    python -m src.run_pipeline --latest
"""

import sys
import traceback
from datetime import date, datetime

from src.writer import update_data_source_status


def run_all(year: int, month: int) -> dict:
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
