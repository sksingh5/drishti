"""Compute soil moisture proxy from rainfall data (no external account required).

Scientific basis: Soil moisture is primarily driven by precipitation in the short term.
The antecedent precipitation index (API) is a well-established proxy for soil moisture
(Crow et al., 2012; Beck et al., 2009).

This proxy uses current month rainfall as a direct indicator of soil moisture:
- High rainfall → high soil moisture → low drought risk (but high flood risk)
- Low rainfall → low soil moisture → high drought risk

The scoring is INVERTED relative to rainfall: low moisture = high risk score.

This is explicitly marked as a PROXY and will be replaced when ERA5-Land data
becomes available via CDS registration.
"""

from datetime import date
import calendar

from src.db import get_supabase
from src.writer import IndicatorRow, write_indicators, update_data_source_status

SOURCE_NAME = "era5_land"  # matches the data_sources table key


def run(year: int, month: int) -> int:
    """Compute soil moisture proxy from rainfall scores."""
    sb = get_supabase()
    period_start = date(year, month, 1)
    period_end = date(year, month, calendar.monthrange(year, month)[1])

    print(f"[Soil Moisture Proxy] Computing for {year}-{month:02d}...")

    # Fetch rainfall scores — high rainfall score = high anomaly (excess or deficit)
    # For soil moisture, we want: high rainfall VALUE = high moisture = low risk
    # We need the raw rainfall VALUES, not the anomaly scores
    scores = []
    offset = 0
    while True:
        batch = sb.table("climate_indicators").select(
            "district_id, value, score"
        ).eq("indicator_type", "rainfall_anomaly").eq(
            "period_start", period_start.isoformat()
        ).range(offset, offset + 999).execute()
        scores.extend(batch.data)
        if len(batch.data) < 1000:
            break
        offset += 1000

    if not scores:
        print("[Soil Moisture Proxy] No rainfall data available.")
        return 0

    # Get all rainfall values to compute percentile
    values = [s["value"] for s in scores if s["value"] is not None]
    if not values:
        return 0

    from src.scoring import percentile_score
    import numpy as np
    all_values = np.array(values)

    rows = []
    for s in scores:
        rainfall_mm = s["value"]
        if rainfall_mm is None:
            score = 50
            sm_proxy = 0.0
        else:
            # Higher rainfall → higher soil moisture → lower risk
            raw_percentile = percentile_score(rainfall_mm, all_values)
            score = 100 - raw_percentile  # invert: low moisture = high risk
            sm_proxy = round(rainfall_mm / 1000, 4)  # rough volumetric proxy

        rows.append(IndicatorRow(
            district_id=s["district_id"],
            indicator_type="soil_moisture",
            value=sm_proxy,
            score=score,
            period_start=period_start,
            period_end=period_end,
            source="rainfall_proxy",
            methodology_version=1,
        ))

    written = write_indicators(rows)
    update_data_source_status(SOURCE_NAME, "ok", written)
    print(f"[Soil Moisture Proxy] Wrote {written} rows (rainfall-based proxy).")
    return written


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python -m src.fetch_soil_moisture_proxy <year> <month>")
        sys.exit(1)
    run(int(sys.argv[1]), int(sys.argv[2]))
